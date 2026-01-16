import React from 'react';
import { Button, Space, Typography } from 'antd';
import { useConfigStore } from '../store';
import { useMessage } from '../hooks/useMessage';

const { Text } = Typography;

// Edit Icon SVG
const EditIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

// Delete Icon SVG
const DeleteIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

// Rocket Icon SVG
const RocketIcon = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

export function ActionButtons() {
  const {
    selectedId,
    configs,
    showEditor,
    deleteConfig,
    launchConfig,
    incrementUseCount,
    showLogWindow
  } = useConfigStore();
  const { message, modal } = useMessage();

  const hasSelection = !!selectedId;
  const config = configs.find((c) => c.id === selectedId);

  const handleEdit = () => {
    if (selectedId) {
      showEditor(selectedId);
    }
  };

  const handleDelete = () => {
    if (!selectedId) return;

    modal.confirm({
      title: '确认删除',
      content: '确定要删除此配置吗？此操作无法撤销。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        deleteConfig(selectedId);
        message.success('🗑️ 配置已删除');

        // 保存到文件
        const { saveConfigs } = useConfigStore.getState();
        await saveConfigs(useConfigStore.getState().configs);
      }
    });
  };

  const handleLaunch = async () => {
    if (!config) return;

    try {
      // 显示日志窗口
      showLogWindow(config);

      await launchConfig(config);
      incrementUseCount(config.id);
      message.success(`🚀 ${config.name} 启动成功！`);

      // 保存统计数据
      const { saveConfigs } = useConfigStore.getState();
      await saveConfigs(useConfigStore.getState().configs);

      // 自动关闭
      if (config.autoClose) {
        message.info('窗口将在 3 秒后自动关闭...');
        setTimeout(() => {
          window.close();
        }, 3000);
      }
    } catch {
      message.error('启动失败');
    }
  };

  return (
    <div className="action-bar">
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Space style={{ width: '100%' }}>
          <Button
            icon={<EditIcon />}
            onClick={handleEdit}
            disabled={!hasSelection}
            style={{ flex: 1, height: 48, fontWeight: 600, background: '#e5e7eb', border: 'none' }}
          >
            编辑
          </Button>
          <Button
            danger
            icon={<DeleteIcon />}
            onClick={handleDelete}
            disabled={!hasSelection}
            style={{ flex: 1, height: 48, fontWeight: 600, background: '#fee2e2', borderColor: '#fecaca', color: '#dc2626', border: 'none' }}
          >
            删除
          </Button>
        </Space>

        <Button
          type="primary"
          size="large"
          icon={<RocketIcon />}
          onClick={handleLaunch}
          disabled={!hasSelection}
          block
          className="btn-gradient"
          style={{
            height: 56,
            fontSize: 18,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            boxShadow: '0 10px 15px -3px rgba(102, 126, 234, 0.4)'
          }}
        >
          🚀 启动 UI-TARS
        </Button>

        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <Text style={{ fontSize: 12, color: '#6b7280' }}>
            提示：Ctrl+N 新建 | Delete 删除 | Enter 启动 | Esc 关闭对话框
          </Text>
        </div>
      </Space>
    </div>
  );
}
