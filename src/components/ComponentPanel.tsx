import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Space, Typography } from 'antd';
import {
  FontSizeOutlined,
  PictureOutlined,
  TableOutlined,
  BarcodeOutlined,
  QrcodeOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import { useDesignerStore } from '../store';
import { CanvasComponentType } from '../types';

const { Text } = Typography;

interface ComponentItem {
  type: CanvasComponentType;
  icon: React.ReactNode;
  label: string;
}

const ComponentPanel: React.FC = () => {
  const { t } = useTranslation();
  const addComponent = useDesignerStore((s) => s.addComponent);

  const items: ComponentItem[] = useMemo(
    () => [
      { type: 'text', icon: <FontSizeOutlined />, label: t('component.text') },
      { type: 'image', icon: <PictureOutlined />, label: t('component.image') },
      { type: 'table', icon: <TableOutlined />, label: t('component.table') },
      { type: 'barcode', icon: <BarcodeOutlined />, label: t('component.barcode') },
      { type: 'qrcode', icon: <QrcodeOutlined />, label: t('component.qrcode') },
      { type: 'line', icon: <MinusOutlined />, label: t('component.line') },
    ],
    [t],
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent, type: CanvasComponentType) => {
      e.dataTransfer.setData('componentType', type);
      e.dataTransfer.effectAllowed = 'copy';
    },
    [],
  );

  const handleClick = useCallback(
    (type: CanvasComponentType, label: string) => {
      addComponent(type, undefined, undefined, label);
    },
    [addComponent],
  );

  return (
    <Card
      title={t('component.panelTitle')}
      size="small"
    >
      <Space direction="vertical" style={{ width: '100%' }} size={4}>
        {items.map((item) => (
          <div
            key={item.type}
            draggable
            onDragStart={(e) => handleDragStart(e, item.type)}
            onClick={() => handleClick(item.type, item.label)}
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
