import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs/promises';
import { fileURLToPath } from 'url';
// ES modules 兼容：获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let mainWindow = null;
// 配置文件路径
const CONFIG_DIR = path.join(app.getPath('userData'), 'ui-tars-launcher');
const CONFIG_PATH = path.join(CONFIG_DIR, 'configs.json');
// 进程管理：跟踪所有启动的子进程
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
// 启动配置
ipcMain.handle('launch-config', async (_, config) => {
    try {
        const command = buildCommand(config);
        // 为每个启动创建唯一的批处理文件
        const batPath = path.join(CONFIG_DIR, `launch-${Date.now()}.bat`);
        const batContent = `@echo off\ncd /d "${config.workingDir || '.'}"\n${command}\n`;
        await fs.writeFile(batPath, batContent, 'utf-8');
        // 记录临时文件以便清理
        tempFiles.push(batPath);
        // 启动进程（不使用 detached，以便可以跟踪和控制）
        const proc = spawn('cmd.exe', ['/c', batPath], {
            shell: true,
            stdio: 'ignore',
            cwd: config.workingDir || undefined
        });
        // 跟踪进程以便在应用退出时清理
        childProcesses.add(proc);
        // 进程退出时从跟踪列表中移除
        proc.on('exit', () => {
            childProcesses.delete(proc);
        });
        proc.on('error', (err) => {
            console.error('进程错误:', err);
            childProcesses.delete(proc);
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
