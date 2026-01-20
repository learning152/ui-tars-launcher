// Provider 信息和 API Key 获取帮助链接
export interface ProviderInfo {
  id: string;
  name: string;
  icon: string;
  apiKeyHelp: {
    url: string;
    label: string;
    description?: string;
  };
}

export const PROVIDER_INFO_MAP: Record<string, ProviderInfo> = {
  volcengine: {
    id: 'volcengine',
    name: '火山引擎',
    icon: '🌋',
    apiKeyHelp: {
      url: 'https://console.volcengine.com/ark',
      label: '获取 API Key',
      description: '访问火山引擎控制台，在 Ark 平台创建应用获取 API Key'
    }
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    icon: '🤖',
    apiKeyHelp: {
      url: 'https://platform.openai.com/api-keys',
      label: '获取 API Key',
      description: '登录 OpenAI 平台，在 API Keys 页面创建新的密钥'
    }
  },
  azure: {
    id: 'azure',
    name: 'Azure OpenAI',
    icon: '☁️',
    apiKeyHelp: {
      url: 'https://portal.azure.com/',
      label: '获取 API Key',
      description: '在 Azure Portal 中创建 OpenAI 资源并获取密钥'
    }
  },
  custom: {
    id: 'custom',
    name: '自定义',
    icon: '⚙️',
    apiKeyHelp: {
      url: '',
      label: '',
      description: '请根据您的自定义 Provider 配置获取 API Key'
    }
  }
};

// 获取 Provider 信息的辅助函数
export function getProviderInfo(provider: string): ProviderInfo | undefined {
  return PROVIDER_INFO_MAP[provider];
}

// 获取所有 Provider 列表
export function getAllProviders(): ProviderInfo[] {
  return Object.values(PROVIDER_INFO_MAP);
}
