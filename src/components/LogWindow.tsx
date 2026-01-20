import React, { useEffect, useRef } from 'react';
import { Modal, Space, Button, Typography, Tag, message } from 'antd';
import {
  CloseCircleOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  StopOutlined
} from '@ant-design/icons';
import { useConfigStore } from '../store';
import { LogEntry } from '../types';

const { Text } = Typography;

// 日志类型对应的图标和颜色
const LOG_TYPE_CONFIG = {
  stdout: { icon: null, color: '#e5e7eb' },
  stderr: { icon: null, color: '#fca5a5' },
  info: { icon: <InfoCircleOutlined />, color: '#60a5fa' },
  error: { icon: <CloseCircleOutlined />, color: '#f87171' },
  exit: { icon: <CheckCircleOutlined />, color: '#9ca3af' }
};

export function LogWindow() {
  const {
    isLogWindowVisible,
    selectedLogConfig,
    logEntries,
    hideLogWindow,
    clearLogs,
    runningProcesses,
    killProcess
  } = useConfigStore();
  const logEndRef = useRef<HTMLPreElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logEntries]);

  // 获取当前配置对应的运行进程
  const currentProcess = runningProcesses.find(
    p => p.configId === selectedLogConfig?.id && p.status === 'running'
  );

  const handleStopProcess = async () => {
    if (currentProcess) {
      const success = await killProcess(currentProcess.id);
      if (success) {
        message.success('进程已终止');
      } else {
        message.error('终止进程失败');
      }
    }
  };

  const handleOpenUrl = () => {
    if (currentProcess?.url) {
      window.open(currentProcess.url, '_blank');
    }
  };

  // 按行分割日志内容并渲染
  const renderLogContent = () => {
    const allLines: Array<{ line: string; type: string; timestamp: string }> = [];

    logEntries.forEach(entry => {
      const lines = entry.text.split('\n');
      lines.forEach(line => {
        if (line.trim()) {
          allLines.push({ line, type: entry.type, timestamp: entry.timestamp });
        }
      });
    });

    return allLines.map((item, index) => {
      const config = LOG_TYPE_CONFIG[item.type as keyof typeof LOG_TYPE_CONFIG];

      return (
        <div key={index} className="log-line">
          <span className="log-timestamp">
            {new Date(item.timestamp).toLocaleTimeString()}
          </span>
          {config.icon && (
            <span className="log-icon" style={{ color: config.color }}>
              {config.icon}
            </span>
          )}
          <span
            className="log-text"
            style={{ color: config.color }}
            dangerouslySetInnerHTML={{ __html: escapeHtml(item.line) }}
          />
        </div>
      );
    });
  };

  // HTML 转义
  const escapeHtml = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const handleClearLogs = () => {
    clearLogs();
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 24 }}>
          <span>启动日志 - {selectedLogConfig?.name || '未知配置'}</span>
          {currentProcess && (
            <Space size="small">
              <Tag color="green">运行中</Tag>
              {currentProcess.url && (
                <Tag
                  color="blue"
                  onClick={handleOpenUrl}
                  style={{ cursor: 'pointer' }}
                >
                  {currentProcess.url}
                </Tag>
              )}
              <Button
                size="small"
                danger
                icon={<StopOutlined />}
                onClick={handleStopProcess}
              >
                停止进程
              </Button>
            </Space>
          )}
        </div>
      }
      open={isLogWindowVisible}
      onCancel={hideLogWindow}
      footer={
        <Space>
          <Button onClick={handleClearLogs}>清空日志</Button>
          <Button type="primary" onClick={hideLogWindow}>
            关闭
          </Button>
        </Space>
      }
      width={800}
      style={{ top: 20 }}
      styles={{ body: { padding: 0 } }}
    >
      <div className="log-window-container">
        {logEntries.length === 0 ? (
          <div className="log-empty">
            等待日志输出...
          </div>
        ) : (
          <pre className="log-content">
            {renderLogContent()}
            <span ref={logEndRef} />
          </pre>
        )}
      </div>
    </Modal>
  );
}
