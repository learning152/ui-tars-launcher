import React, { useState } from 'react';
import { Tooltip, Typography, Space, Button, message } from 'antd';
import { QuestionCircleOutlined, LinkOutlined, CopyOutlined } from '@ant-design/icons';
import { getProviderInfo } from '../data/providerLinks';

const { Text, Paragraph } = Typography;

interface ApiKeyHelpTooltipProps {
  provider: string;
}

export function ApiKeyHelpTooltip({ provider }: ApiKeyHelpTooltipProps) {
  const providerInfo = getProviderInfo(provider);
  const [copied, setCopied] = useState(false);

  if (!providerInfo || !providerInfo.apiKeyHelp.url) {
    return null;
  }

  const handleOpenLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(providerInfo.apiKeyHelp.url, '_blank');
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(providerInfo.apiKeyHelp.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 如果 clipboard API 失败，使用 fallback 方法
      const textArea = document.createElement('textarea');
      textArea.value = providerInfo.apiKeyHelp.url;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // 失败则忽略
      }
      document.body.removeChild(textArea);
    }
  };

  const tooltipContent = (
    <div style={{ maxWidth: 300 }}>
      <Paragraph style={{ color: 'white', marginBottom: 8, fontSize: 13 }}>
        {providerInfo.apiKeyHelp.description}
      </Paragraph>
      <Space direction="vertical" style={{ width: '100%' }} size={4}>
        <Button
          type="primary"
          size="small"
          icon={<LinkOutlined />}
          onClick={handleOpenLink}
          style={{ width: '100%' }}
        >
          打开链接
        </Button>
        <Button
          size="small"
          icon={<CopyOutlined />}
          onClick={handleCopyLink}
          style={{ width: '100%' }}
        >
          {copied ? '已复制！' : '复制链接'}
        </Button>
      </Space>
    </div>
  );

  return (
    <Tooltip title={tooltipContent} placement="right" trigger="click">
      <QuestionCircleOutlined style={{ color: '#6366f1', marginLeft: 8, cursor: 'help' }} />
    </Tooltip>
  );
}
