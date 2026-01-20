// 配置类型定义 (精确对齐原型)
export type Provider = 'volcengine' | 'openai' | 'azure' | 'custom';

export interface AgentConfig {
  id: string;
  name: string;
  icon: string;
  provider: Provider;
  model: string;
  apiKey: string;
  useConda: boolean;
  condaEnvName: string;
  workingDir: string;
  extraArgs: string;
  isDefault: boolean;
  autoClose: boolean;
  notes: string;
  lastUsed: string;
  useCount: number;
}

// 配置存储格式
export interface AppConfig {
  version: string;
  configs: AgentConfig[];
}

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

// 环境状态类型
export interface EnvironmentStatus {
  nodeInstalled: boolean;
  nodeVersion?: string;
  npxAvailable: boolean;
  agentTarsInstalled: boolean;
  agentTarsVersion?: string;
}

// Electron API 类型定义
export interface ElectronAPI {
  getConfigs: () => Promise<AgentConfig[]>;
  saveConfigs: (configs: AgentConfig[]) => Promise<boolean>;
  launchConfig: (config: AgentConfig) => Promise<boolean>;
  exportConfigs: (configs: AgentConfig[]) => Promise<boolean>;
  importConfigs: () => Promise<AgentConfig[] | null>;
  selectDirectory: () => Promise<string>;
  // 日志监听
  onLogOutput: (callback: (entry: LogEntry) => void) => (() => void);
  // 进程管理
  getRunningProcesses: () => Promise<RunningProcess[]>;
  killProcess: (processId: string) => Promise<{ success: boolean; error?: string }>;
  onProcessStarted: (callback: (process: RunningProcess) => void) => (() => void);
  onProcessExited: (callback: (data: { processId: string; code: number | null }) => void) => (() => void);
  onProcessUpdated: (callback: (process: RunningProcess) => void) => (() => void);
  // 环境检测
  checkEnvironment: () => Promise<EnvironmentStatus>;
  // 安装 agent-tars
  installAgentTars: () => Promise<{ success: boolean; output?: string; error?: string }>;
  // 打开外部链接
  openExternal: (url: string) => Promise<void>;
  // 安装进度监听
  onInstallProgress: (callback: (data: { message: string }) => void) => (() => void);
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
