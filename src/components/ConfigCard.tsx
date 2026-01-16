import React from 'react';
import { Space, Typography, Button, Dropdown } from 'antd';
import {
  MoreOutlined,
  StarOutlined,
  CopyOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { AgentConfig } from '../types';
import { getProviderName } from '../utils/command';
import { useConfigStore } from '../store';

const { Text } = Typography;

interface ConfigCardProps {
  config: AgentConfig;
  selected: boolean;
  onSelect: () => void;
  onLaunch: () => void;
}

// Play Icon SVG
const PlayIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Edit Icon SVG
const EditIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

// Cpu Icon for Conda
const CpuIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
  </svg>
);

export function ConfigCard({ config, selected, onSelect, onLaunch }: ConfigCardProps) {
  const { setSelectedId, showEditor, deleteConfig, setDefault, duplicateConfig } = useConfigStore();

  const handleContextMenuClick = (key: string) => {
    switch (key) {
      case 'default':
        setDefault(config.id);
        break;
      case 'duplicate':
        duplicateConfig(config.id);
        break;
      case 'delete':
        deleteConfig(config.id);
        break;
    }
  };

  const menuItems = [
    {
      key: 'default',
      label: '设为默认',
      icon: <StarOutlined />
    },
    {
      key: 'duplicate',
      label: '复制配置',
      icon: <CopyOutlined />
    },
    {
      key: 'delete',
      label: '删除',
      icon: <DeleteOutlined />,
      danger: true
    }
  ];

  return (
    <div
      className={`config-card ${selected ? 'selected' : ''}`}
      onClick={onSelect}
      style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        cursor: 'pointer',
        position: 'relative',
        border: selected ? '2px solid #6366f1' : '2px solid #e5e7eb'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ flex: 1 }}>
          {/* Title Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '32px', lineHeight: 1 }}>{config.icon || '⚙️'}</span>
            <Text strong style={{ fontSize: 18, color: '#111827' }}>
              {config.name}
            </Text>
            {config.isDefault && (
              <span style={{
                background: '#eef2ff',
                color: '#4f46e5',
                padding: '2px 10px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 600
              }}>
                默认
              </span>
            )}
          </div>

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Text style={{ color: '#374151', fontSize: 14 }}>
              <Text strong>{getProviderName(config.provider)}</Text>
              {' - '}
              {config.model}
            </Text>
            {config.useConda && (
              <Text style={{ color: '#6b7280', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                <CpuIcon />
                {config.condaEnvName}
              </Text>
            )}
            {config.notes && (
              <Text style={{ color: '#9ca3af', fontSize: 12 }}>
                {config.notes}
              </Text>
            )}
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
              <Text style={{ color: '#9ca3af', fontSize: 12 }}>
                使用 {config.useCount} 次
              </Text>
              <Text style={{ color: '#9ca3af', fontSize: 12 }}>
                最近 {config.lastUsed}
              </Text>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Button
            type="text"
            icon={<PlayIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onLaunch();
            }}
            style={{ color: '#6b7280', padding: '8px' }}
            title="快速启动"
          />
          <Button
            type="text"
            icon={<EditIcon />}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedId(config.id);
              showEditor(config.id);
            }}
            style={{ color: '#6b7280', padding: '8px' }}
            title="编辑"
          />
        </div>
      </div>
    </div>
  );
}
