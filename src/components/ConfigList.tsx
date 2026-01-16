import React from 'react';
import { Empty, Typography } from 'antd';
import { useConfigStore } from '../store';
import { ConfigCard } from './ConfigCard';

const { Text } = Typography;

export function ConfigList() {
  const { getFilteredConfigs, selectedId, setSelectedId, launchConfig } = useConfigStore();
  const filteredConfigs = getFilteredConfigs();

  if (filteredConfigs.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📭</div>
        <div className="empty-title">暂无配置</div>
        <div className="empty-description">点击上方"新建配置"按钮创建第一个配置</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredConfigs.map((config) => (
          <ConfigCard
            key={config.id}
            config={config}
            selected={selectedId === config.id}
            onSelect={() => setSelectedId(config.id)}
            onLaunch={() => launchConfig(config)}
          />
        ))}
      </div>
    </div>
  );
}
