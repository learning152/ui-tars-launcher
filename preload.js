"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// 向渲染进程暴露 API
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    // 配置操作
    getConfigs: () => electron_1.ipcRenderer.invoke('get-configs'),
    saveConfigs: (configs) => electron_1.ipcRenderer.invoke('save-configs', configs),
    // 启动操作
    launchConfig: (config) => electron_1.ipcRenderer.invoke('launch-config', config),
    // 导入导出
    exportConfigs: (configs) => electron_1.ipcRenderer.invoke('export-configs', configs),
    importConfigs: () => electron_1.ipcRenderer.invoke('import-configs'),
    // 文件操作
    selectDirectory: () => electron_1.ipcRenderer.invoke('select-directory'),
    // 日志监听
    onLogOutput: (callback) => {
        const listener = (_event, entry) => callback(entry);
        electron_1.ipcRenderer.on('log-output', listener);
        return () => electron_1.ipcRenderer.removeListener('log-output', listener);
    },
    // ==================== 进程管理 ====================
    // 获取运行中的进程列表
    getRunningProcesses: () => electron_1.ipcRenderer.invoke('get-running-processes'),
    // 停止指定进程
    killProcess: (processId) => electron_1.ipcRenderer.invoke('kill-process', processId),
    // 进程启动事件监听
    onProcessStarted: (callback) => {
        const listener = (_event, process) => callback(process);
        electron_1.ipcRenderer.on('process-started', listener);
        return () => electron_1.ipcRenderer.removeListener('process-started', listener);
    },
    // 进程退出事件监听
    onProcessExited: (callback) => {
        const listener = (_event, data) => callback(data);
        electron_1.ipcRenderer.on('process-exited', listener);
        return () => electron_1.ipcRenderer.removeListener('process-exited', listener);
    },
    // 进程更新事件监听（如 URL 变化）
    onProcessUpdated: (callback) => {
        const listener = (_event, process) => callback(process);
        electron_1.ipcRenderer.on('process-updated', listener);
        return () => electron_1.ipcRenderer.removeListener('process-updated', listener);
    }
});
