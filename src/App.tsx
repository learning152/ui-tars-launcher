import { useEffect } from 'react';
import { ConfigProvider, theme, Typography, App as AntdApp } from 'antd';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { ConfigList } from './components/ConfigList';
import { CommandPreview } from './components/CommandPreview';
import { ActionButtons } from './components/ActionButtons';
import { ConfigEditor } from './components/ConfigEditor';
import { LogWindow } from './components/LogWindow';
import { RunningPanel } from './components/RunningPanel';
import { useConfigStore } from './store';
import { useKeyboard } from './hooks/useKeyboard';
import { MessageProvider } from './hooks/useMessage';
import './styles/global.css';

const { defaultAlgorithm } = theme;
const { Text } = Typography;

// 内部组件：在 MessageProvider 上下文中使用键盘快捷键
function AppContent() {
  const { loading, setConfigs, setEditorVisible, editorVisible, editingId } = useConfigStore();

  // 初始化：加载配置
  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const configs = await window.electronAPI.getConfigs();
        setConfigs(configs);

        // 自动选中默认配置
        const defaultConfig = configs.find((c) => c.isDefault);
        if (defaultConfig) {
          useConfigStore.getState().setSelectedId(defaultConfig.id);
        }

        // 加载完成，取消 loading
        useConfigStore.getState().setLoading(false);
      } catch {
        // 首次运行，使用空配置
        setConfigs([]);
        useConfigStore.getState().setLoading(false);
      }
    };
    loadConfigs();
  }, [setConfigs]);

  // 初始化：检测环境状态
  useEffect(() => {
    const checkEnv = async () => {
      if (window.electronAPI && window.electronAPI.checkEnvironment) {
        try {
          const status = await window.electronAPI.checkEnvironment();
          useConfigStore.getState().setEnvStatus(status);
        } catch {
          // 环境检测失败，忽略
        }
      }
    };
    checkEnv();
  }, []);

  // 启动日志监听
  useEffect(() => {
    const cleanup = window.electronAPI.onLogOutput?.((entry) => {
      const { addLogEntry } = useConfigStore.getState();
      addLogEntry(entry);
    });

    return () => {
      cleanup?.();
    };
  }, []);

  // 进程事件监听
  useEffect(() => {
    // 监听进程启动
    const cleanupStart = window.electronAPI.onProcessStarted?.((process) => {
      useConfigStore.getState().updateProcess(process);
    });

    // 监听进程退出
    const cleanupExit = window.electronAPI.onProcessExited?.((data) => {
      useConfigStore.getState().removeProcess(data.processId);
    });

    // 监听进程更新（如 URL 变化）
    const cleanupUpdate = window.electronAPI.onProcessUpdated?.((process) => {
      useConfigStore.getState().updateProcess(process);
    });

    // 初始化时加载已有的运行进程
    const loadRunningProcesses = async () => {
      if (window.electronAPI) {
        const processes = await window.electronAPI.getRunningProcesses();
        useConfigStore.getState().setRunningProcesses(processes);
      }
    };
    loadRunningProcesses();

    return () => {
      cleanupStart?.();
      cleanupExit?.();
      cleanupUpdate?.();
    };
  }, []);

  // 键盘快捷键（必须在 MessageProvider 内部调用）
  useKeyboard();

  if (loading) {
    return (
      <div className="app-container">
        <div className="glass-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <Text>加载中...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="main-wrapper">
        <div className="glass-container">
          <Header />
          <SearchBar />
          <RunningPanel />
          <ConfigList />
          <CommandPreview />
          <ActionButtons />
        </div>
      </div>
      <ConfigEditor
        visible={editorVisible}
        editingId={editingId}
        onClose={() => setEditorVisible(false)}
      />
      <LogWindow />
    </div>
  );
}

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: defaultAlgorithm,
        token: {
          colorPrimary: '#6366f1'
        }
      }}
    >
      <AntdApp>
        <MessageProvider>
          <AppContent />
        </MessageProvider>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
