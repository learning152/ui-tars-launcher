import ReactDOM from 'react-dom/client';
import 'antd/dist/reset.css';
import App from './App';
import { AgentConfig } from './types';

// 网页开发模式下的 polyfill
// 为 localStorage 配置加载/保存提供与 Electron API 兼容的接口
if (!window.electronAPI) {
  const STORAGE_KEY = 'uitars-configs';

  // 从 localStorage 加载配置
  const loadFromStorage = (): AgentConfig[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : (parsed.configs || []);
      }
    } catch (error) {
      console.error('Failed to load configs from localStorage:', error);
    }
    return [];
  };

  // 保存配置到 localStorage
  const saveToStorage = (configs: AgentConfig[]): boolean => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
      return true;
    } catch (error) {
      console.error('Failed to save configs to localStorage:', error);
      return false;
    }
  };

  // 导出配置为 JSON 文件
  const exportToFile = (configs: AgentConfig[]): boolean => {
    try {
      const dataStr = JSON.stringify(configs, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ui-tars-configs-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Failed to export configs:', error);
      return false;
    }
  };

  // 导入配置
  const importFromFile = (): Promise<AgentConfig[] | null> => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve(null);
          return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const imported = JSON.parse(event.target?.result as string);
            if (Array.isArray(imported)) {
              resolve(imported);
            } else if (imported.configs && Array.isArray(imported.configs)) {
              resolve(imported.configs);
            } else {
              resolve(null);
            }
          } catch {
            resolve(null);
          }
        };
        reader.readAsText(file);
      };
      input.click();
    });
  };

  // 定义网页模式下的 electronAPI
  window.electronAPI = {
    getConfigs: async (): Promise<AgentConfig[]> => {
      // 模拟异步加载
      return Promise.resolve(loadFromStorage());
    },

    saveConfigs: async (configs: AgentConfig[]): Promise<boolean> => {
      return Promise.resolve(saveToStorage(configs));
    },

    launchConfig: async (config: AgentConfig): Promise<boolean> => {
      // 网页模式下无法启动本地进程，只记录日志
      console.log('Launch config (web mode):', config);
      console.log('Command:', generateCommandString(config));
      alert(`网页模式下无法直接启动。\n\n请在命令行中执行:\n${generateCommandString(config)}`);
      return false;
    },

    exportConfigs: async (configs: AgentConfig[]): Promise<boolean> => {
      return Promise.resolve(exportToFile(configs));
    },

    importConfigs: async (): Promise<AgentConfig[] | null> => {
      return importFromFile();
    },

    selectDirectory: async (): Promise<string> => {
      // 网页模式下无法选择目录，返回空字符串
      alert('网页模式下无法选择本地目录，请直接输入工作目录路径。');
      return Promise.resolve('');
    }
  };
}

// 生成命令字符串（用于显示）
function generateCommandString(config: AgentConfig): string {
  const parts: string[] = [];

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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
);
