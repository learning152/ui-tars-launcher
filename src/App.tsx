import { useEffect } from 'react';
import { ConfigProvider, theme, Typography, App as AntdApp } from 'antd';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { ConfigList } from './components/ConfigList';
import { CommandPreview } from './components/CommandPreview';
import { ActionButtons } from './components/ActionButtons';
import { ConfigEditor } from './components/ConfigEditor';
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
