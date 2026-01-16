import { create } from 'zustand';
import { AgentConfig } from './types';

interface ConfigStore {
  // 状态
  configs: AgentConfig[];
  selectedId: string;
  searchTerm: string;
  providerFilter: string;
  editorVisible: boolean;
  editingId: string | null;
  loading: boolean;

  // 计算属性方法
  getFilteredConfigs: () => AgentConfig[];
  getSelectedConfig: () => AgentConfig | undefined;
  getStats: () => { total: number; defaultCount: number; recentCount: number };

  // 操作
  setConfigs: (configs: AgentConfig[]) => void;
  setSelectedId: (id: string) => void;
  setSearchTerm: (term: string) => void;
  setProviderFilter: (provider: string) => void;
  showEditor: (id?: string) => void;
  hideEditor: () => void;
  setEditorVisible: (visible: boolean) => void;
  setLoading: (loading: boolean) => void;
  saveConfig: (config: AgentConfig) => void;
  deleteConfig: (id: string) => void;
  setDefault: (id: string) => void;
  duplicateConfig: (id: string) => void;
  incrementUseCount: (id: string) => void;

  // IPC 操作
  launchConfig: (config: AgentConfig) => Promise<boolean>;
  saveConfigs: (configs: AgentConfig[]) => Promise<boolean>;
  exportConfigs: (configs: AgentConfig[]) => Promise<boolean>;
  importConfigs: () => Promise<AgentConfig[] | null>;
  selectDirectory: () => Promise<string>;
}

export const useConfigStore = create<ConfigStore>((set, get) => ({
  configs: [],
  selectedId: '',
  searchTerm: '',
  providerFilter: '',
  editorVisible: false,
  editingId: null,
  loading: true,

  getFilteredConfigs: () => {
    const state = get();
    return state.configs.filter(c => {
      const matchSearch =
        c.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        c.model.toLowerCase().includes(state.searchTerm.toLowerCase());
      const matchProvider = !state.providerFilter || c.provider === state.providerFilter;
      return matchSearch && matchProvider;
    });
  },

  getSelectedConfig: () => {
    return get().configs.find(c => c.id === get().selectedId);
  },

  getStats: () => {
    const state = get();
    const total = state.configs.length;
    const defaultCount = state.configs.filter(c => c.isDefault).length;
    const recentCount = state.configs.filter(c => {
      const days = Math.floor(
        (Date.now() - new Date(c.lastUsed).getTime()) / (1000 * 60 * 60 * 24)
      );
      return days <= 7;
    }).length;
    return { total, defaultCount, recentCount };
  },

  setConfigs: (configs) => set({ configs }),

  setSelectedId: (id) => {
    set({ selectedId: id });
    // 自动选中默认配置 (首次加载时)
    if (!id && !get().selectedId) {
      const defaultConfig = get().configs.find(c => c.isDefault);
      if (defaultConfig) {
        set({ selectedId: defaultConfig.id });
      }
    }
  },

  setSearchTerm: (term) => set({ searchTerm: term }),
  setProviderFilter: (provider) => set({ providerFilter: provider }),

  showEditor: (id) =>
    set({
      editorVisible: true,
      editingId: id || null
    }),

  hideEditor: () => set({ editorVisible: false, editingId: null }),

  setEditorVisible: (visible) => set({ editorVisible: visible }),

  setLoading: (loading) => set({ loading }),

  saveConfig: (config) => {
    set((state) => {
      const index = state.configs.findIndex((c) => c.id === config.id);

      let newConfigs: AgentConfig[];
      if (index >= 0) {
        // 编辑现有配置
        newConfigs = [...state.configs];
        newConfigs[index] = config;
      } else {
        // 新建配置
        newConfigs = [...state.configs, config];
      }

      // 处理默认配置
      if (config.isDefault) {
        newConfigs = newConfigs.map((c) => ({
          ...c,
          isDefault: c.id === config.id
        }));
      }

      return { configs: newConfigs };
    });
  },

  deleteConfig: (id) =>
    set((state) => ({
      configs: state.configs.filter((c) => c.id !== id),
      selectedId: state.selectedId === id ? '' : state.selectedId
    })),

  setDefault: (id) =>
    set((state) => ({
      configs: state.configs.map((c) => ({
        ...c,
        isDefault: c.id === id
      }))
    })),

  duplicateConfig: (id) => {
    const config = get().configs.find((c) => c.id === id);
    if (!config) return;

    set((state) => ({
      configs: [
        ...state.configs,
        {
          ...config,
          id: Date.now().toString(),
          name: config.name + ' (副本)',
          isDefault: false,
          useCount: 0
        }
      ]
    }));
  },

  incrementUseCount: (id) =>
    set((state) => ({
      configs: state.configs.map((c) =>
        c.id === id
          ? {
              ...c,
              useCount: c.useCount + 1,
              lastUsed: new Date().toISOString().split('T')[0]
            }
          : c
      )
    })),

  // IPC 操作
  launchConfig: async (config) => {
    if (window.electronAPI) {
      return await window.electronAPI.launchConfig(config);
    }
    // Web 开发模式下的模拟实现
    console.log('Launch config:', config);
    return true;
  },

  saveConfigs: async (configs) => {
    if (window.electronAPI) {
      return await window.electronAPI.saveConfigs(configs);
    }
    // Web 开发模式下保存到 localStorage
    localStorage.setItem('uitars-configs', JSON.stringify(configs));
    return true;
  },

  exportConfigs: async (configs) => {
    if (window.electronAPI) {
      return await window.electronAPI.exportConfigs(configs);
    }
    // Web 开发模式下的导出
    const dataStr = JSON.stringify(configs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ui-tars-launcher-configs.json';
    link.click();
    URL.revokeObjectURL(url);
    return true;
  },

  importConfigs: async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.importConfigs();
      if (result) {
        set({ configs: result });
      }
      return result;
    }
    // Web 开发模式下的导入
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
              set({ configs: imported });
              resolve(imported);
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
  },

  selectDirectory: async () => {
    if (window.electronAPI) {
      return await window.electronAPI.selectDirectory();
    }
    // Web 开发模式下返回空字符串
    return '';
  }
}));
