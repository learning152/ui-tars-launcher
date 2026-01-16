import { useEffect } from 'react';
import { useConfigStore } from '../store';
import { useMessage } from './useMessage';

export function useKeyboard() {
  const {
    selectedId,
    editorVisible,
    showEditor,
    deleteConfig,
    launchConfig,
    getSelectedConfig,
    hideEditor,
    configs
  } = useConfigStore();
  const { modal } = useMessage();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果在输入框中，忽略快捷键
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Ctrl+N: 新建配置
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        showEditor();
      }
      // Delete: 删除选中
      else if (e.key === 'Delete' && selectedId) {
        e.preventDefault();
        modal.confirm({
          title: '确认删除',
          content: '确定要删除此配置吗？',
          okText: '删除',
          okType: 'danger',
          cancelText: '取消',
          onOk: async () => {
            deleteConfig(selectedId);
            const { saveConfigs } = useConfigStore.getState();
            await saveConfigs(useConfigStore.getState().configs);
          }
        });
      }
      // Enter: 启动选中
      else if (e.key === 'Enter' && selectedId && !editorVisible) {
        e.preventDefault();
        const config = getSelectedConfig();
        if (config) {
          launchConfig(config);
        }
      }
      // Esc: 关闭对话框
      else if (e.key === 'Escape' && editorVisible) {
        e.preventDefault();
        hideEditor();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, editorVisible]);
}
