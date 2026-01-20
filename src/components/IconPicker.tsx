import React, { useState } from 'react';
import { Modal, Radio, Space, Typography } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';

const { Text } = Typography;

// 预设图标列表 - 涵盖 AI、云服务、开发工具等场景
export const PRESET_ICONS = [
  // AI/LLM 相关
  { icon: '🤖', name: '机器人', category: 'AI' },
  { icon: '🧠', name: '大脑', category: 'AI' },
  { icon: '💡', name: '灵光', category: 'AI' },
  { icon: '⚡', name: '闪电', category: 'AI' },
  { icon: '🔮', name: '魔法', category: 'AI' },
  { icon: '🎯', name: '目标', category: 'AI' },
  { icon: '🧪', name: '实验', category: 'AI' },
  { icon: '🔬', name: '研究', category: 'AI' },

  // 云服务/平台
  { icon: '☁️', name: '云服务', category: '云服务' },
  { icon: '🌐', name: '网络', category: '云服务' },
  { icon: '🌋', name: '火山', category: '云服务' },
  { icon: '🚀', name: '火箭', category: '云服务' },
  { icon: '🛸', name: '飞船', category: '云服务' },
  { icon: '📡', name: '信号', category: '云服务' },
  { icon: '🔥', name: '火焰', category: '云服务' },
  { icon: '💎', name: '宝石', category: '云服务' },

  // 开发/工具
  { icon: '⚙️', name: '设置', category: '工具' },
  { icon: '🔧', name: '工具', category: '工具' },
  { icon: '📊', name: '图表', category: '工具' },
  { icon: '📈', name: '增长', category: '工具' },
  { icon: '💻', name: '电脑', category: '工具' },
  { icon: '🖥️', name: '桌面', category: '工具' },
  { icon: '⌨️', name: '键盘', category: '工具' },
  { icon: '🎮', name: '游戏', category: '工具' },

  // 状态/标识
  { icon: '⭐', name: '星星', category: '标识' },
  { icon: '🏆', name: '奖杯', category: '标识' },
  { icon: '👑', name: '皇冠', category: '标识' },
  { icon: '🎖️', name: '勋章', category: '标识' },
  { icon: '🔵', name: '蓝圆', category: '标识' },
  { icon: '🟢', name: '绿圆', category: '标识' },
  { icon: '🟡', name: '黄圆', category: '标识' },
  { icon: '🔴', name: '红圆', category: '标识' },

  // 特殊用途
  { icon: '🏠', name: '首页', category: '其他' },
  { icon: '🏢', name: '办公', category: '其他' },
  { icon: '📁', name: '文件夹', category: '其他' },
  { icon: '📝', name: '文档', category: '其他' },
  { icon: '🗂️', name: '归档', category: '其他' },
  { icon: '🔐', name: '安全', category: '其他' },
  { icon: '🔑', name: '密钥', category: '其他' },
  { icon: '📌', name: '定位', category: '其他' },
];

interface IconPickerProps {
  visible: boolean;
  value?: string;
  onChange?: (icon: string) => void;
  onClose: () => void;
}

export function IconPicker({ visible, value, onChange, onClose }: IconPickerProps) {
  const [customIcon, setCustomIcon] = useState(value || '');

  const handleSelect = (icon: string) => {
    onChange?.(icon);
    onClose();
  };

  const handleCustomSubmit = () => {
    if (customIcon.trim()) {
      onChange?.(customIcon.trim());
      onClose();
    }
  };

  // 按分类分组图标
  const categories = Array.from(new Set(PRESET_ICONS.map(i => i.category)));

  return (
    <Modal
      title={
        <Space>
          <AppstoreOutlined />
          <span>选择图标</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
      styles={{ body: { padding: 16 } }}
    >
      {/* 预设图标 */}
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {categories.map((category) => (
          <div key={category} style={{ marginBottom: 20 }}>
            <Text
              type="secondary"
              strong
              style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}
            >
              {category}
            </Text>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 1fr)',
                gap: 8,
                marginTop: 8
              }}
            >
              {PRESET_ICONS.filter((i) => i.category === category).map((item) => (
                <button
                  key={item.icon}
                  type="button"
                  onClick={() => handleSelect(item.icon)}
                  title={item.name}
                  style={{
                    fontSize: 24,
                    padding: 8,
                    border: '2px solid',
                    borderColor: value === item.icon ? '#6366f1' : '#e5e7eb',
                    borderRadius: 8,
                    background: value === item.icon ? '#eef2ff' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (value !== item.icon) {
                      e.currentTarget.style.borderColor = '#c7d2fe';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (value !== item.icon) {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  {item.icon}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 自定义图标输入 */}
      <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          自定义图标 (输入 emoji 或字符)
        </Text>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input
            type="text"
            value={customIcon}
            onChange={(e) => setCustomIcon(e.target.value)}
            placeholder="输入自定义图标..."
            maxLength={2}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              fontSize: 18
            }}
          />
          <button
            type="button"
            onClick={handleCustomSubmit}
            style={{
              padding: '8px 16px',
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            确认
          </button>
        </div>
      </div>
    </Modal>
  );
}
