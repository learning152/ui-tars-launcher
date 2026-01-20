import React, { useEffect, useState } from 'react';
import { Modal, Button, Space, Typography, Alert, Tag, Progress } from 'antd';
import {
  DownloadOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  LoadingOutlined,
  LinkOutlined
} from '@ant-design/icons';
import { useConfigStore } from '../store';
import { useMessage } from '../hooks/useMessage';
import { EnvironmentStatus } from '../types';

const { Title, Text, Paragraph } = Typography;

// Node.js 下载链接
const NODE_DOWNLOAD_URL = 'https://nodejs.org/zh-cn/download';

export function EnvironmentChecker() {
  const {
    envStatus,
    installing,
    installMessage,
    setEnvStatus,
    checkEnvironment,
    installAgentTars,
    openExternalLink
  } = useConfigStore();
  const { message } = useMessage();
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    checkEnvironment();
  }, []);

  const handleInstallAgentTars = async () => {
    const success = await installAgentTars();
    if (success) {
      message.success('agent-tars 安装成功！');
    } else {
      message.error('安装失败，请查看日志');
    }
  };

  const handleOpenNodeJs = async () => {
    await openExternalLink(NODE_DOWNLOAD_URL);
  };

  // 环境检查完成且一切正常
  if (envStatus?.nodeInstalled && envStatus?.agentTarsInstalled) {
    return (
      <Space size="small">
        <Tag icon={<CheckCircleOutlined />} color="success" style={{ margin: 0 }}>
          Node.js {envStatus.nodeVersion}
        </Tag>
        <Tag icon={<CheckCircleOutlined />} color="success" style={{ margin: 0 }}>
          agent-tars {envStatus.agentTarsVersion}
        </Tag>
      </Space>
    );
  }

  // 有环境问题，显示警告按钮
  const hasWarning = !envStatus?.nodeInstalled || !envStatus?.agentTarsInstalled;

  return (
    <>
      <Button
        type={hasWarning ? 'primary' : 'default'}
        ghost
        icon={hasWarning ? <WarningOutlined /> : <CheckCircleOutlined />}
        onClick={() => setModalVisible(true)}
        style={{ borderColor: 'white', color: 'white' }}
      >
        {hasWarning ? '环境设置' : '环境检查'}
      </Button>

      <Modal
        title={<Space><DownloadOutlined />环境设置</Space>}
        open={modalVisible}
        onCancel={() => !installing && setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* Node.js 状态 */}
          <div>
            <Space style={{ marginBottom: 12 }}>
              <Text strong>Node.js 环境</Text>
              {envStatus?.nodeInstalled ? (
                <Tag icon={<CheckCircleOutlined />} color="success">
                  已安装 (v{envStatus.nodeVersion})
                </Tag>
              ) : (
                <Tag icon={<WarningOutlined />} color="warning">
                  未安装
                </Tag>
              )}
            </Space>
            {!envStatus?.nodeInstalled && (
              <Alert
                message="未检测到 Node.js"
                description={
                  <div>
                    <Paragraph style={{ marginBottom: 12 }}>
                      agent-tars 需要 Node.js 环境（建议 v22 或更高版本）。
                    </Paragraph>
                    <Button
                      type="primary"
                      icon={<LinkOutlined />}
                      onClick={handleOpenNodeJs}
                    >
                      前往 Node.js 官网下载
                    </Button>
                  </div>
                }
                type="warning"
                showIcon
              />
            )}
          </div>

          {/* agent-tars 状态 */}
          <div>
            <Space style={{ marginBottom: 12 }}>
              <Text strong>agent-tars</Text>
              {envStatus?.agentTarsInstalled ? (
                <Tag icon={<CheckCircleOutlined />} color="success">
                  已安装 (v{envStatus.agentTarsVersion})
                </Tag>
              ) : (
                <Tag icon={<WarningOutlined />} color="warning">
                  未安装
                </Tag>
              )}
            </Space>
            {envStatus?.nodeInstalled && !envStatus?.agentTarsInstalled && (
              <Alert
                message="未检测到 agent-tars"
                description={
                  <div>
                    <Paragraph style={{ marginBottom: 12 }}>
                      点击下方按钮将自动执行 <code>npx @agent-tars/cli@latest</code> 进行安装。
                    </Paragraph>
                    <div
                      style={{
                        marginBottom: 12,
                        padding: '8px 12px',
                        background: '#f5f5f5',
                        borderRadius: '4px',
                        fontFamily: 'monospace',
                        fontSize: '13px'
                      }}
                    >
                      npx @agent-tars/cli@latest
                    </div>
                    {!installing ? (
                      <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={handleInstallAgentTars}
                        className="btn-gradient"
                      >
                        一键安装 agent-tars
                      </Button>
                    ) : (
                      <div>
                        <Space style={{ marginBottom: 8 }}>
                          <LoadingOutlined />
                          <Text strong>正在安装...</Text>
                        </Space>
                        <Progress percent={-1} status="active" size="small" />
                        <Text type="secondary" style={{ fontSize: 12 }}>{installMessage}</Text>
                      </div>
                    )}
                  </div>
                }
                type="info"
                showIcon
              />
            )}
          </div>

          {/* 安装完成提示 */}
          {envStatus?.nodeInstalled && envStatus?.agentTarsInstalled && (
            <Alert
              message="环境配置完成！"
              description="现在可以创建配置并启动 agent-tars 了。"
              type="success"
              showIcon
              action={
                <Button type="primary" onClick={() => setModalVisible(false)}>
                  开始使用
                </Button>
              }
            />
          )}
        </Space>
      </Modal>
    </>
  );
}
