import React, { useState } from 'react';
import { Input, Select, Button, Space } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useConfigStore } from '../store';

// Plus Icon SVG
const PlusIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
  </svg>
);

export function SearchBar() {
  const { setSearchTerm, setProviderFilter, showEditor } = useConfigStore();
  const [searchValue, setSearchValue] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    setSearchTerm(value);
  };

  const handleProviderChange = (value: string | null) => {
    setProviderFilter(value || '');
  };

  return (
    <div className="search-bar-container">
      <Space size="middle" style={{ width: '100%' }} className="search-bar-inner">
        <div style={{ position: 'relative', flex: 1 }}>
          <SearchOutlined
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
              zIndex: 1
            }}
          />
          <Input
            placeholder="搜索配置..."
            allowClear
            value={searchValue}
            onChange={handleSearchChange}
            style={{ paddingLeft: 36 }}
          />
        </div>
        <Select
          placeholder="全部 Provider"
          allowClear
          onChange={handleProviderChange}
          style={{ width: 140 }}
        >
          <Select.Option value="">全部 Provider</Select.Option>
          <Select.Option value="volcengine">火山引擎</Select.Option>
          <Select.Option value="openai">OpenAI</Select.Option>
          <Select.Option value="azure">Azure</Select.Option>
          <Select.Option value="custom">自定义</Select.Option>
        </Select>
        <Button
          icon={<PlusIcon />}
          onClick={() => showEditor()}
          className="btn-gradient"
          style={{
            height: 40,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)'
          }}
        >
          新建配置
        </Button>
      </Space>
    </div>
  );
}
