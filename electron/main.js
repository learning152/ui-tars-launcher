import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
// ES modules 兼容：获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 使用 createRequire 来导入 CommonJS 模块
const require = createRequire(import.meta.url);
const iconv = require('iconv-lite');
// ANSI 转义码正则表达式 - 匹配终端颜色代码
const ANSI_ESCAPE_REGEX = /\x1b\[[0-9;]*m|\x1b\[[0-9;]*[A-GHKST]/g;
// ANSI 清屏和光标控制码
const ANSI_CONTROL_REGEX = /\x1b\[[0-9;]*[ABCDGHJKfmu]/g;
// 清除 ANSI 转义码
function stripAnsiCodes(text) {
    return text
        .replace(ANSI_ESCAPE_REGEX, '')
        .replace(ANSI_CONTROL_REGEX, '');
}
// 检测是否包含 GBK 编码的乱码字符
function hasGbkGarbled(text) {
    // 检查是否包含大量连续的中文乱码字符（���）
    const garbagePattern = /[\u00fd\u00fe\ufffd]{3,}/;
    return garbagePattern.test(text);
}
// 解码缓冲区，优先使用 GBK（Windows 控制台默认编码）
function decodeBuffer(buffer) {
    // Windows 控制台默认使用 GBK 编码，先尝试 GBK
    let decoded = iconv.decode(buffer, 'gbk');
    // 如果 GBK 解码后仍有乱码，尝试 UTF-8
    if (hasGbkGarbled(decoded)) {
        try {
            const utf8Decoded = buffer.toString('utf-8');
            // 如果 UTF-8 解码结果看起来更正常（没有大量乱码），使用 UTF-8
            if (!hasGbkGarbled(utf8Decoded)) {
                decoded = utf8Decoded;
            }
        }
        catch {
            // 保持 GBK 解码结果
        }
    }
    return decoded;
}
// 清理和规范化日志文本
function cleanLogText(text) {
    // 移除 ANSI 码
    let cleaned = stripAnsiCodes(text);
    // 移除多余的空行
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    // 移除行首行尾空白
    cleaned = cleaned.split('\n').map(line => line.trim()).filter(line => line.length > 0).join('\n');
    return cleaned;
}
let mainWindow = null;
// 配置文件路径
const CONFIG_DIR = path.join(app.getPath('userData'), 'ui-tars-launcher');
const CONFIG_PATH = path.join(CONFIG_DIR, 'configs.json');
// 使用 Map 存储进程信息，key 为进程 ID
const runningProcesses = new Map();
// 兼容旧代码：保留 childProcesses Set
const childProcesses = new Set();
// 临时文件路径列表，用于清理
const tempFiles = [];
// 终止所有子进程并清理临时文件
async function cleanupProcesses() {
    // 终止所有子进程
    for (const proc of childProcesses) {
        try {
            if (proc && proc.pid && !proc.killed) {
                proc.kill();
                console.log(`已终止进程: ${proc.pid}`);
            }
        }
        catch (error) {
            console.error('终止进程失败:', error);
        }
    }
    childProcesses.clear();
    // 终止所有运行中的进程（Windows 下需要杀掉整个进程树）
    for (const [id, entry] of runningProcesses.entries()) {
        try {
            if (process.platform === 'win32') {
                spawn('taskkill', ['/pid', String(entry.proc.pid), '/T', '/F']);
            }
            else {
                entry.proc.kill();
            }
            console.log(`已终止进程: ${id}`);
        }
        catch (error) {
            console.error('终止进程失败:', error);
        }
    }
    runningProcesses.clear();
    // 清理临时文件
    for (const filePath of tempFiles) {
        try {
            await fs.unlink(filePath);
            console.log(`已删除临时文件: ${filePath}`);
        }
        catch (error) {
            // 文件可能已被删除，忽略错误
        }
    }
    tempFiles.length = 0;
}
// 确保配置目录存在
async function ensureConfigDir() {
    try {
        await fs.mkdir(CONFIG_DIR, { recursive: true });
    }
    catch {
        // 目录可能已存在，忽略错误
    }
}
// 创建主窗口
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 900,
        minWidth: 600,
        webPreferences: {
            preload: path.join(__dirname, '../preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        },
        title: 'UI-TARS 启动器',
        icon: path.join(__dirname, '../build/icon.ico')
    });
    // 开发环境加载 Vite 服务器，生产环境加载打包后的文件
    if (process.env.NODE_ENV === 'development') {
        // 支持动态端口
        const port = process.env.VITE_PORT || '5173';
        mainWindow.loadURL(`http://localhost:${port}`);
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    // 窗口关闭时清理进程
    mainWindow.on('close', () => {
        cleanupProcesses();
    });
}
// 应用启动时
app.whenReady().then(async () => {
    await ensureConfigDir();
    createWindow();
    // macOS 点击 Dock 图标时重新创建窗口
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
// 所有窗口关闭时退出 (macOS 除外)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
// ==================== IPC 处理器 ====================
// 读取配置
ipcMain.handle('get-configs', async () => {
    try {
        const data = await fs.readFile(CONFIG_PATH, 'utf-8');
        const parsed = JSON.parse(data);
        return parsed.configs || [];
    }
    catch {
        // 首次运行，返回空数组
        return [];
    }
});
// 保存配置
ipcMain.handle('save-configs', async (_, configs) => {
    try {
        await ensureConfigDir();
        const data = JSON.stringify({ version: '1.0.0', configs }, null, 2);
        await fs.writeFile(CONFIG_PATH, data, 'utf-8');
        return true;
    }
    catch (error) {
        console.error('保存配置失败:', error);
        return false;
    }
});
// 生成启动命令
function buildCommand(config) {
    const parts = [];
    if (config.useConda) {
        parts.push(`call conda activate ${config.condaEnvName}`);
        parts.push('&&');
    }
    parts.push('agent-tars');
    parts.push(`--provider ${config.provider}`);
    parts.push(`--model ${config.model}`);
    parts.push(`--apiKey ${config.apiKey}`);
    if (config.extraArgs) {
        parts.push(config.extraArgs);
    }
    return parts.join(' ');
}
// ==================== 进程管理 IPC ====================
// 获取运行中的进程列表
ipcMain.handle('get-running-processes', () => {
    const processes = [];
    for (const [, { info }] of runningProcesses.entries()) {
        processes.push(info);
    }
    return processes;
});
// 停止指定进程
ipcMain.handle('kill-process', async (_, processId) => {
    const entry = runningProcesses.get(processId);
    if (entry) {
        try {
            // Windows 下需要杀掉整个进程树（cmd.exe 及其子进程）
            if (process.platform === 'win32') {
                spawn('taskkill', ['/pid', String(entry.proc.pid), '/T', '/F'], {
                    stdio: 'ignore'
                });
            }
            else {
                entry.proc.kill();
            }
            // 从列表中移除
            runningProcesses.delete(processId);
            childProcesses.delete(entry.proc);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: String(error) };
        }
    }
    return { success: false, error: 'Process not found' };
});
// ==================== 配置启动 IPC ====================
// 启动配置
ipcMain.handle('launch-config', async (event, config) => {
    try {
        const command = buildCommand(config);
        // 为每个启动创建唯一的批处理文件
        const batPath = path.join(CONFIG_DIR, `launch-${Date.now()}.bat`);
        const batContent = `@echo off\ncd /d "${config.workingDir || '.'}"\n${command}\n`;
        await fs.writeFile(batPath, batContent, 'utf-8');
        // 记录临时文件以便清理
        tempFiles.push(batPath);
        // 创建唯一的进程 ID
        const processId = `${config.id}-${Date.now()}`;
        const startTime = Date.now();
        // 创建进程信息
        const processInfo = {
            id: processId,
            pid: 0, // 稍后在 spawn 事件中更新
            configId: config.id,
            configName: config.name,
            url: '',
            status: 'running',
            startTime
        };
        // 使用 pipe 捕获输出
        const proc = spawn('cmd.exe', ['/c', batPath], {
            shell: true,
            stdio: ['ignore', 'pipe', 'pipe'], // stdin, stdout, stderr
            cwd: config.workingDir || undefined
        });
        // 跟踪进程以便在应用退出时清理
        childProcesses.add(proc);
        // 进程启动时添加到运行列表
        proc.on('spawn', () => {
            processInfo.pid = proc.pid ?? 0;
            runningProcesses.set(processId, { proc, info: processInfo });
            // 通知渲染进程有新进程启动
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('process-started', processInfo);
            }
        });
        // 用于跟踪是否已打开浏览器
        let browserOpened = false;
        // 处理 stdout
        proc.stdout?.on('data', (data) => {
            // 解码、清除 ANSI 转义码并清理文本
            const decoded = decodeBuffer(data);
            const output = cleanLogText(decoded);
            if (!output)
                return; // 跳过空输出
            // 发送到渲染进程
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('log-output', {
                    type: 'stdout',
                    text: output,
                    timestamp: new Date().toISOString()
                });
            }
            // 检测 URL 并打开浏览器
            if (!browserOpened && mainWindow && !mainWindow.isDestroyed()) {
                const urlMatch = output.match(/https?:\/\/localhost:\d+/gi);
                if (urlMatch && urlMatch.length > 0) {
                    const url = urlMatch[0];
                    shell.openExternal(url);
                    // 更新进程信息中的 URL
                    processInfo.url = url;
                    // 发送进程更新事件
                    mainWindow.webContents.send('process-updated', processInfo);
                    if (mainWindow && !mainWindow.isDestroyed()) {
                        mainWindow.webContents.send('log-output', {
                            type: 'info',
                            text: `\n🌐 已自动打开浏览器: ${url}\n`,
                            timestamp: new Date().toISOString()
                        });
                    }
                    browserOpened = true;
                }
            }
        });
        // 处理 stderr
        proc.stderr?.on('data', (data) => {
            // 解码、清除 ANSI 转义码并清理文本
            const decoded = decodeBuffer(data);
            const output = cleanLogText(decoded);
            if (!output)
                return; // 跳过空输出
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('log-output', {
                    type: 'stderr',
                    text: output,
                    timestamp: new Date().toISOString()
                });
            }
        });
        // 进程退出
        proc.on('exit', (code) => {
            processInfo.status = 'exited';
            runningProcesses.delete(processId);
            childProcesses.delete(proc);
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('log-output', {
                    type: 'exit',
                    text: `\n进程退出，代码: ${code}\n`,
                    timestamp: new Date().toISOString()
                });
                // 发送进程退出事件
                mainWindow.webContents.send('process-exited', { processId, code });
            }
        });
        proc.on('error', (err) => {
            console.error('进程错误:', err);
            processInfo.status = 'exited';
            runningProcesses.delete(processId);
            childProcesses.delete(proc);
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('log-output', {
                    type: 'error',
                    text: `进程错误: ${err.message}\n`,
                    timestamp: new Date().toISOString()
                });
                // 发送进程退出事件
                mainWindow.webContents.send('process-exited', { processId, code: -1 });
            }
        });
        return true;
    }
    catch (error) {
        console.error('启动失败:', error);
        return false;
    }
});
// 导出配置
ipcMain.handle('export-configs', async (_, configs) => {
    try {
        const { filePath } = await dialog.showSaveDialog(mainWindow, {
            defaultPath: 'ui-tars-launcher-configs.json',
            filters: [{ name: 'JSON Files', extensions: ['json'] }]
        });
        if (filePath) {
            const data = JSON.stringify({ version: '1.0.0', configs }, null, 2);
            await fs.writeFile(filePath, data, 'utf-8');
            return true;
        }
        return false;
    }
    catch {
        return false;
    }
});
// 导入配置
ipcMain.handle('import-configs', async () => {
    try {
        const { filePaths } = await dialog.showOpenDialog(mainWindow, {
            filters: [{ name: 'JSON Files', extensions: ['json'] }],
            properties: ['openFile']
        });
        if (filePaths.length > 0) {
            const data = await fs.readFile(filePaths[0], 'utf-8');
            const parsed = JSON.parse(data);
            return parsed.configs || parsed;
        }
        return null;
    }
    catch {
        return null;
    }
});
// 选择目录
ipcMain.handle('select-directory', async () => {
    try {
        const { filePaths } = await dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory']
        });
        return filePaths[0] || '';
    }
    catch {
        return '';
    }
});
// ==================== 环境检测 IPC ====================
// 检测环境状态（Node.js + agent-tars）
ipcMain.handle('check-environment', async () => {
    // 检测 Node.js
    const nodeStatus = await new Promise((resolve) => {
        const proc = spawn('node', ['--version'], { shell: true });
        let output = '';
        proc.stdout?.on('data', (data) => { output += data.toString(); });
        proc.on('close', (code) => {
            if (code === 0 && output) {
                resolve({ installed: true, version: output.trim() });
            }
            else {
                resolve({ installed: false });
            }
        });
        proc.on('error', () => resolve({ installed: false }));
    });
    // 检测 npx（通常随 Node.js 一起安装）
    const npxStatus = await new Promise((resolve) => {
        const proc = spawn('npx', ['--version'], { shell: true });
        proc.on('close', (code) => resolve(code === 0));
        proc.on('error', () => resolve(false));
    });
    // 检测 agent-tars
    const agentTarsStatus = await new Promise((resolve) => {
        const proc = spawn('agent-tars', ['--version'], { shell: true });
        let output = '';
        proc.stdout?.on('data', (data) => { output += data.toString(); });
        proc.on('close', (code) => {
            if (code === 0 && output) {
                const versionMatch = output.match(/(\d+\.\d+\.\d+)/);
                resolve({ installed: true, version: versionMatch ? versionMatch[1] : 'unknown' });
            }
            else {
                resolve({ installed: false });
            }
        });
        proc.on('error', () => resolve({ installed: false }));
    });
    return {
        nodeInstalled: nodeStatus.installed,
        nodeVersion: nodeStatus.version,
        npxAvailable: npxStatus,
        agentTarsInstalled: agentTarsStatus.installed,
        agentTarsVersion: agentTarsStatus.version
    };
});
// 安装 agent-tars
ipcMain.handle('install-agent-tars', async () => {
    return new Promise((resolve) => {
        const proc = spawn('npx', ['@agent-tars/cli@latest'], { shell: true, stdio: 'pipe' });
        let output = '';
        let errorOutput = '';
        const sendProgress = (message) => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('install-progress', { message });
            }
        };
        sendProgress('正在安装 agent-tars...');
        proc.stdout?.on('data', (data) => {
            output += data.toString();
            // 发送进度更新
            const lines = output.split('\n');
            if (lines.length > 0) {
                sendProgress(lines[lines.length - 1] || '正在安装...');
            }
        });
        proc.stderr?.on('data', (data) => {
            errorOutput += data.toString();
        });
        proc.on('close', (code) => {
            if (code === 0) {
                sendProgress('安装完成！');
                resolve({ success: true, output });
            }
            else {
                resolve({ success: false, error: errorOutput || '安装失败' });
            }
        });
        proc.on('error', (err) => resolve({ success: false, error: err.message }));
    });
});
// 打开外部链接
ipcMain.handle('open-external', async (_event, url) => {
    await shell.openExternal(url);
});
