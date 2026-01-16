import { AgentConfig } from '../types';

// Provider 名称映射
export const PROVIDER_NAMES: Record<string, string> = {
  volcengine: '火山引擎',
  openai: 'OpenAI',
  azure: 'Azure',
  custom: '自定义'
};

// 生成启动命令 (用于实际执行)
export function generateCommand(config: AgentConfig): string {
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

// 生成显示命令 (API Key 脱敏)
export function generateDisplayCommand(config: AgentConfig): string {
  const parts: string[] = [];

  if (config.useConda) {
    parts.push(`call conda activate ${config.condaEnvName}`);
    parts.push('&&');
  }

  parts.push('agent-tars');
  parts.push(`--provider ${config.provider}`);
  parts.push(`--model ${config.model}`);
  parts.push('--apiKey ********');

  if (config.extraArgs) {
    parts.push(config.extraArgs);
  }

  return parts.join(' ');
}

// 获取 Provider 显示名称
export function getProviderName(provider: string): string {
  return PROVIDER_NAMES[provider] || provider;
}
