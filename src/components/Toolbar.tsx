import React, { useCallback } from 'react';
import { Button, Space, Typography } from 'antd';
import {
  DeleteOutlined,
  EyeOutlined,
  PrinterOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useDesignerStore } from '../store';

const { Text } = Typography;

const Toolbar: React.FC = () => {
  const templateName = useDesignerStore((s) => s.templateName);
  const setPreviewVisible = useDesignerStore((s) => s.setPreviewVisible);
  const setHeaderFooterVisible = useDesignerStore((s) => s.setHeaderFooterVisible);
  const selectedId = useDesignerStore((s) => s.selectedId);
  const removeComponent = useDesignerStore((s) => s.removeComponent);

  const handleDelete = useCallback(() => {
    if (selectedId) {
      removeComponent(selectedId);
    }
  }, [selectedId, removeComponent]);

  return (
    <div
      style={{
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        borderBottom: '1px solid #e8e8e8',
        background: '#fff',
      }}
    >
      <Text strong style={{ fontSize: 16 }}>
        {templateName}
      </Text>
      <Space>
        <Button
          icon={<SettingOutlined />}
          onClick={() => setHeaderFooterVisible(true)}
        >
          页眉页脚
        </Button>
        <Button
          danger
          icon={<DeleteOutlined />}
          disabled={!selectedId}
          onClick={handleDelete}
        >
          删除组件
        </Button>
        <Button
          icon={<EyeOutlined />}
          onClick={() => setPreviewVisible(true)}
        >
          预览
        </Button>
      </Space>
    </div>
  );
};

export default Toolbar;
