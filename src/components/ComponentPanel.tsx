import React, { useCallback } from 'react';
import { Card, Space, Typography } from 'antd';
import {
  FontSizeOutlined,
  PictureOutlined,
  TableOutlined,
  BarcodeOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import { useDesignerStore } from '../store';
import { CanvasComponentType } from '../types';
import { COMPONENT_TYPE_LABELS } from '../constants';

const { Text } = Typography;

interface ComponentItem {
  type: CanvasComponentType;
  icon: React.ReactNode;
  label: string;
}

const items: ComponentItem[] = [
  { type: 'text', icon: <FontSizeOutlined />, label: '文本' },
  { type: 'image', icon: <PictureOutlined />, label: '图片' },
  { type: 'table', icon: <TableOutlined />, label: '表格' },
  { type: 'barcode', icon: <BarcodeOutlined />, label: '条形码' },
  { type: 'line', icon: <MinusOutlined />, label: '分割线' },
];

const ComponentPanel: React.FC = () => {
  const addComponent = useDesignerStore((s) => s.addComponent);

  const handleDragStart = useCallback(
    (e: React.DragEvent, type: CanvasComponentType) => {
      e.dataTransfer.setData('componentType', type);
      e.dataTransfer.effectAllowed = 'copy';
    },
    [],
  );

  const handleClick = useCallback(
    (type: CanvasComponentType) => {
      addComponent(type);
    },
    [addComponent],
  );

  return (
    <Card
      title="组件面板"
      size="small"
    >
      <Space direction="vertical" style={{ width: '100%' }} size={4}>
        {items.map((item) => (
          <div
            key={item.type}
            draggable
            onDragStart={(e) => handleDragStart(e, item.type)}
            onClick={() => handleClick(item.type)}
            style={{
              cursor: 'grab',
              padding: '8px 12px',
              border: '1px solid #d9d9d9',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#fafafa',
              userSelect: 'none',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e6f4ff';
              e.currentTarget.style.borderColor = '#1677ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#fafafa';
              e.currentTarget.style.borderColor = '#d9d9d9';
            }}
          >
            {item.icon}
            <Text>{item.label}</Text>
          </div>
        ))}
      </Space>
    </Card>
  );
};

export default ComponentPanel;
