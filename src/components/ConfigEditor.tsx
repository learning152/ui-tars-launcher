import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Checkbox,
  Button,
  Space,
  Row,
  Col,
  Typography
} from 'antd';
import { AgentConfig, Provider } from '../types';
import { useConfigStore } from '../store';
import { useMessage } from '../hooks/useMessage';
import { ApiKeyHelpTooltip } from './ApiKeyHelpTooltip';
import { IconPicker } from './IconPicker';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

interface ConfigEditorProps {
  visible: boolean;
  editingId: string | null;
  onClose: () => void;
}

export function ConfigEditor({ visible, editingId, onClose }: ConfigEditorProps) {
  const { configs, saveConfig, selectDirectory } = useConfigStore();
  const { message } = useMessage();
  const [form] = Form.useForm();
  const [iconPickerVisible, setIconPickerVisible] = useState(false);
  const editingConfig = configs.find((c) => c.id === editingId);

  useEffect(() => {
    if (visible) {
      if (editingConfig) {
        form.setFieldsValue(editingConfig);
      } else {
        form.resetFields();
        form.setFieldsValue({
          icon: '⚙️',
          provider: 'volcengine',
          useConda: true,
          condaEnvName: 'agent-tars-env',
          isDefault: false,
          autoClose: false
        });
      }
    }
  }, [visible, editingConfig, form]);

  const handleBrowseDirectory = async () => {
    try {
      const dir = await selectDirectory();
      if (dir) {
        form.setFieldValue('workingDir', dir);
      }
    } catch {
      message.error('选择目录失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const config: AgentConfig = {
        id: editingId || Date.now().toString(),
        ...values,
        lastUsed: editingConfig?.lastUsed || new Date().toISOString().split('T')[0],
        useCount: editingConfig?.useCount || 0
      };

      saveConfig(config);
      message.success('💾 配置保存成功！');
      onClose();

      // 保存到文件
      const { saveConfigs } = useConfigStore.getState();
      await saveConfigs(useConfigStore.getState().configs);
    } catch {
      // 表单验证失败，不做处理
    }
  };

  return (
    <Modal
      title={
        <Text strong style={{ fontSize: 20, color: '#111827' }}>
          {editingId ? '编辑配置' : '新建配置'}
        </Text>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      styles={{
        body: { padding: 24 }
      }}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 0 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={<span className="form-label">配置名称 *</span>}
              name="name"
              rules={[{ required: true, message: '请输入配置名称' }]}
            >
              <Input placeholder="字节豆包 - 高性能版" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={<span className="form-label">图标</span>}
              name="icon"
            >
              <Input
                placeholder="选择图标"
                maxLength={2}
                addonAfter={
                  <Button
                    type="text"
                    size="small"
                    onClick={() => setIconPickerVisible(true)}
                    style={{ padding: '0 8px', fontWeight: 500 }}
                  >
                    选择
                  </Button>
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={<span className="form-label">Provider *</span>}
              name="provider"
              rules={[{ required: true, message: '请选择 Provider' }]}
            >
              <Select placeholder="选择服务商">
                <Option value="volcengine">🌋 火山引擎</Option>
                <Option value="openai">🤖 OpenAI</Option>
                <Option value="azure">☁️ Azure</Option>
                <Option value="custom">⚙️ 自定义</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={<span className="form-label">Model *</span>}
              name="model"
              rules={[{ required: true, message: '请输入模型名称' }]}
            >
              <Input placeholder="doubao-seed-1-6-251015" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item noStyle shouldUpdate={(prev, next) => prev.provider !== next.provider}>
          {({ getFieldValue }) => {
            const provider = getFieldValue('provider');
            return (
              <Form.Item
                label={
                  <Space>
                    <span className="form-label">API Key *</span>
                    <ApiKeyHelpTooltip provider={provider} />
                  </Space>
                }
                name="apiKey"
                rules={[{ required: true, message: '请输入 API Key' }]}
              >
                <Input.Password placeholder="97c49ed8-c7ea-4f3e-a185-09a571fac271" />
              </Form.Item>
            );
          }}
        </Form.Item>

        <Form.Item name="useConda" valuePropName="checked">
          <Checkbox>使用 Conda 环境</Checkbox>
        </Form.Item>

        <Form.Item noStyle shouldUpdate={(prev, next) => prev.useConda !== next.useConda}>
          {({ getFieldValue }) =>
            getFieldValue('useConda') ? (
              <Form.Item name="condaEnvName" label={<span className="form-label">Conda 环境名</span>}>
                <Input placeholder="agent-tars-env" />
              </Form.Item>
            ) : null
          }
        </Form.Item>

        <Form.Item name="workingDir" label={<span className="form-label">工作目录</span>}>
          <Input
            placeholder="D:\项目\UI-tars-test"
            addonAfter={
              <Button
                type="text"
                size="small"
                onClick={handleBrowseDirectory}
                style={{ padding: '0 8px' }}
              >
                浏览...
              </Button>
            }
          />
        </Form.Item>

        <Form.Item name="extraArgs" label={<span className="form-label">额外启动参数（可选）</span>}>
          <Input placeholder="--debug --verbose" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="isDefault" valuePropName="checked">
              <Checkbox>设为默认配置</Checkbox>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="autoClose" valuePropName="checked">
              <Checkbox>启动后自动关闭</Checkbox>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="notes" label={<span className="form-label">备注</span>}>
          <TextArea rows={2} placeholder="用于日常开发测试..." />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }} size="middle">
            <Button onClick={onClose} style={{ height: 44, minWidth: 120, fontWeight: 600 }}>
              取消
            </Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              className="btn-gradient"
              style={{ height: 44, minWidth: 120, fontWeight: 600 }}
            >
              保存配置
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {/* 图标选择器 */}
      <IconPicker
        visible={iconPickerVisible}
        value={form.getFieldValue('icon')}
        onChange={(icon) => form.setFieldValue('icon', icon)}
        onClose={() => setIconPickerVisible(false)}
      />
    </Modal>
  );
}
