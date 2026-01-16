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
    selectDirectory: () => electron_1.ipcRenderer.invoke('select-directory')
});
