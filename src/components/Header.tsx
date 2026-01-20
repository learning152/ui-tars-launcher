import React from 'react';
import { Row, Col, Space, Typography } from 'antd';
import { useConfigStore } from '../store';
import { useMessage } from '../hooks/useMessage';
import { EnvironmentChecker } from './EnvironmentChecker';

const { Title, Text } = Typography;

// Export Icon SVG
const ExportIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

// Import Icon SVG
const ImportIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

export function Header() {
  const { configs, getStats, exportConfigs, importConfigs } = useConfigStore();
  const { message } = useMessage();
  const stats = getStats();

  const handleExport = async () => {
    try {
      await exportConfigs(configs);
      message.success('📤 配置已导出');
    } catch {
      message.error('导出失败');
    }
  };

  const handleImport = async () => {
    try {
      const imported = await importConfigs();
      if (imported) {
        message.success('📥 配置导入成功！');
      }
    } catch {
      message.error('导入失败');
    }
  };

  return (
    <div className="gradient-bg" style={{ padding: '32px', color: 'white' }}>
      <Row justify="space-between" align="middle">
        <Col>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 40, lineHeight: 1 }}>🚀</span>
            <div>
              <Title level={2} style={{ color: 'white', margin: 0, fontSize: 28, fontWeight: 'bold' }}>
                UI-TARS 启动器
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4, display: 'block' }}>
                高效管理和启动 agent-tars 配置
              </Text>
            </div>
          </div>
        </Col>
        <Col>
          <Space size="middle" align="center">
            <EnvironmentChecker />
            <button
              onClick={handleExport}
              style={{
                padding: '10px',
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                borderRadius: '10px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              title="导出配置"
            >
              <ExportIcon />
            </button>
            <button
              onClick={handleImport}
              style={{
                padding: '10px',
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                borderRadius: '10px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              title="导入配置"
            >
              <ImportIcon />
            </button>
          </Space>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 28 }}>
        <Col span={8}>
          <div className="stat-card" style={{ padding: '14px 16px' }}>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">配置总数</div>
          </div>
        </Col>
        <Col span={8}>
          <div className="stat-card" style={{ padding: '14px 16px' }}>
            <div className="stat-value">{stats.defaultCount}</div>
            <div className="stat-label">默认配置</div>
          </div>
        </Col>
        <Col span={8}>
          <div className="stat-card" style={{ padding: '14px 16px' }}>
            <div className="stat-value">{stats.recentCount}</div>
            <div className="stat-label">最近使用</div>
          </div>
        </Col>
      </Row>
    </div>
  );
}
