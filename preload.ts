import { contextBridge, ipcRenderer } from 'electron';
import { AgentConfig } from './src/types';

// 向渲染进程暴露 API
contextBridge.exposeInMainWorld('electronAPI', {
  // 配置操作
  getConfigs: (): Promise<AgentConfig[]> => ipcRenderer.invoke('get-configs'),
  saveConfigs: (configs: AgentConfig[]): Promise<boolean> =>
    ipcRenderer.invoke('save-configs', configs),

  // 启动操作
  launchConfig: (config: AgentConfig): Promise<boolean> =>
    ipcRenderer.invoke('launch-config', config),

  // 导入导出
  exportConfigs: (configs: AgentConfig[]): Promise<boolean> =>
    ipcRenderer.invoke('export-configs', configs),
  importConfigs: (): Promise<AgentConfig[] | null> => ipcRenderer.invoke('import-configs'),

  // 文件操作
  selectDirectory: (): Promise<string> => ipcRenderer.invoke('select-directory')
});
