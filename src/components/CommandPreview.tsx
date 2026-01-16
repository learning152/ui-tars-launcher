import React from 'react';
import { Button, Space, Typography } from 'antd';
import { useConfigStore } from '../store';
import { useMessage } from '../hooks/useMessage';
import { generateDisplayCommand, generateCommand } from '../utils/command';

const { Text } = Typography;

// Document Icon SVG
const DocumentIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export function CommandPreview() {
  const { getSelectedConfig } = useConfigStore();
  const { message } = useMessage();
  const config = getSelectedConfig();

  const handleCopy = () => {
    if (!config) return;

    const command = generateCommand(config);
    navigator.clipboard.writeText(command).then(() => {
      message.success('✅ 命令已复制到剪贴板');
    });
  };

  if (!config) return null;

  const displayCommand = generateDisplayCommand(config);

  return (
    <div style={{ padding: '24px', borderTop: '1px solid #e5e7eb', background: '#f9fafb' }}>
      <Text strong style={{ fontSize: 14, color: '#374151', display: 'block', marginBottom: 8 }}>
        <Space>
          <DocumentIcon />
          命令预览
        </Space>
      </Text>
      <div style={{
        background: '#111827',
        color: '#10b981',
        fontFamily: 'Consolas, Monaco, Courier New, monospace',
        fontSize: 14,
        padding: '16px',
        borderRadius: '8px',
        overflowX: 'auto',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all'
      }}>
        {displayCommand}
      </div>
      <Button
        onClick={handleCopy}
        style={{ marginTop: 12, background: '#e5e7eb', border: 'none' }}
      >
        📋 复制命令
      </Button>
    </div>
  );
}
