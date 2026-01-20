import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { AgentConfig } from './src/types';

// 日志输出类型
export interface LogEntry {
  type: 'stdout' | 'stderr' | 'info' | 'error' | 'exit';
  text: string;
  timestamp: string;
}

// 运行中的进程信息
export interface RunningProcess {
  id: string;
  pid: number;
  configId: string;
  configName: string;
  url: string;
  status: 'running' | 'exited';
  startTime: number;
}

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
  selectDirectory: (): Promise<string> => ipcRenderer.invoke('select-directory'),

  // 日志监听
  onLogOutput: (callback: (entry: LogEntry) => void) => {
    const listener = (_event: IpcRendererEvent, entry: LogEntry) => callback(entry);
    ipcRenderer.on('log-output', listener);
    return () => ipcRenderer.removeListener('log-output', listener);
  },

  // ==================== 进程管理 ====================

  // 获取运行中的进程列表
  getRunningProcesses: (): Promise<RunningProcess[]> =>
    ipcRenderer.invoke('get-running-processes'),

  // 停止指定进程
  killProcess: (processId: string): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('kill-process', processId),

  // 进程启动事件监听
  onProcessStarted: (callback: (process: RunningProcess) => void) => {
    const listener = (_event: IpcRendererEvent, process: RunningProcess) => callback(process);
    ipcRenderer.on('process-started', listener);
    return () => ipcRenderer.removeListener('process-started', listener);
  },

  // 进程退出事件监听
  onProcessExited: (callback: (data: { processId: string; code: number | null }) => void) => {
    const listener = (_event: IpcRendererEvent, data: { processId: string; code: number | null }) => callback(data);
    ipcRenderer.on('process-exited', listener);
    return () => ipcRenderer.removeListener('process-exited', listener);
  },

  // 进程更新事件监听（如 URL 变化）
  onProcessUpdated: (callback: (process: RunningProcess) => void) => {
    const listener = (_event: IpcRendererEvent, process: RunningProcess) => callback(process);
    ipcRenderer.on('process-updated', listener);
    return () => ipcRenderer.removeListener('process-updated', listener);
  },

  // ==================== 环境检测 ====================

  // 检测环境状态
  checkEnvironment: (): Promise<{ nodeInstalled: boolean; nodeVersion?: string; npxAvailable: boolean; agentTarsInstalled: boolean; agentTarsVersion?: string }> =>
    ipcRenderer.invoke('check-environment'),

  // 安装 agent-tars
  installAgentTars: (): Promise<{ success: boolean; output?: string; error?: string }> =>
    ipcRenderer.invoke('install-agent-tars'),

  // 打开外部链接
  openExternal: (url: string): Promise<void> =>
    ipcRenderer.invoke('open-external', url),

  // 安装进度监听
  onInstallProgress: (callback: (data: { message: string }) => void) => {
    const listener = (_event: IpcRendererEvent, data: { message: string }) => callback(data);
    ipcRenderer.on('install-progress', listener);
    return () => ipcRenderer.removeListener('install-progress', listener);
  }
});
