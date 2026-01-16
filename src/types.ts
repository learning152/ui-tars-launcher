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

// Electron API 类型定义
export interface ElectronAPI {
  getConfigs: () => Promise<AgentConfig[]>;
  saveConfigs: (configs: AgentConfig[]) => Promise<boolean>;
  launchConfig: (config: AgentConfig) => Promise<boolean>;
  exportConfigs: (configs: AgentConfig[]) => Promise<boolean>;
  importConfigs: () => Promise<AgentConfig[] | null>;
  selectDirectory: () => Promise<string>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
