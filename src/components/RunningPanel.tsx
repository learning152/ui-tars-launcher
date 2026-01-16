import React from 'react';
import { Card, Tag, Button, Space, Typography, Empty, message } from 'antd';
import {
  StopOutlined,
  GlobalOutlined,
  CloseOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useConfigStore } from '../store';
import { RunningProcess } from '../types';

const { Text } = Typography;

export function RunningPanel() {
  const { runningProcesses, killProcess, showLogWindow, configs } = useConfigStore();

  // 只显示运行中的进程
  const activeProcesses = runningProcesses.filter(p => p.status === 'running');

  // 清除已退出的进程记录
  const handleClearAll = () => {
    useConfigStore.getState().setRunningProcesses(
      runningProcesses.filter(p => p.status === 'running')
    );
  };

  const handleStop = async (process: RunningProcess) => {
    const success = await killProcess(process.id);
    if (!success) {
      message.error('终止进程失败');
    }
  };

  const handleViewLogs = (process: RunningProcess) => {
    const config = configs.find(c => c.id === process.configId);
    if (config) {
      showLogWindow(config);
    }
  };

  const handleOpenUrl = (process: RunningProcess) => {
    if (process.url) {
      window.open(process.url, '_blank');
    }
  };

  const formatDuration = (startTime: number) => {
    const seconds = Math.floor((Date.now() - startTime) / 1000);
    if (seconds < 60) return `${seconds}秒`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) return `${minutes}分${remainingSeconds}秒`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}时${remainingMinutes}分`;
  };

  if (activeProcesses.length === 0) {
    return null;
  }

  return (
    <div className="running-panel">
      <Card
        size="small"
        title={
          <Space>
            <span className="running-indicator" />
            <span>运行中 ({activeProcesses.length})</span>
          </Space>
        }
        extra={
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined />}
            onClick={handleClearAll}
            title="隐藏面板"
          />
        }
      >
        {activeProcesses.map(process => (
          <div key={process.id} className="running-process-item">
            <div className="process-header">
              <Space>
                <Tag color="green">运行中</Tag>
                <Text strong>{process.configName}</Text>
                <Text type="secondary" className="process-duration">
                  {formatDuration(process.startTime)}
                </Text>
              </Space>
              <Space size="small">
                {process.url && (
                  <Button
                    size="small"
                    icon={<GlobalOutlined />}
                    onClick={() => handleOpenUrl(process)}
                  >
                    打开
                  </Button>
                )}
                <Button
                  size="small"
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewLogs(process)}
                >
                  查看日志
                </Button>
                <Button
                  size="small"
                  danger
                  icon={<StopOutlined />}
                  onClick={() => handleStop(process)}
                >
                  停止
                </Button>
              </Space>
            </div>
            {process.url && (
              <Text type="secondary" className="process-url">
                {process.url}
              </Text>
            )}
          </div>
        ))}
      </Card>
    </div>
  );
}
