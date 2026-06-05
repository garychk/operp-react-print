import React, { useCallback, useMemo } from 'react';
import {
  Card,
  Input,
  InputNumber,
  Select,
  ColorPicker,
  Empty,
  Typography,
  Space,
  Divider,
} from 'antd';
import { useDesignerStore } from '../store';
import { COMPONENT_TYPE_LABELS } from '../constants';

const { Text } = Typography;

const PropertyPanel: React.FC = () => {
  const components = useDesignerStore((s) => s.components);
  const selectedId = useDesignerStore((s) => s.selectedId);
  const updateComponent = useDesignerStore((s) => s.updateComponent);

  const comp = useMemo(
    () => components.find((c) => c.id === selectedId) || null,
    [components, selectedId],
  );

  const handlePropChange = useCallback(
    (key: string, value: unknown) => {
      if (!selectedId) return;
      updateComponent(selectedId, {
        props: { ...comp?.props, [key]: value },
      });
    },
    [selectedId, comp, updateComponent],
  );

  if (!comp) {
    return (
      <Card
        title="属性面板"
        size="small"
        style={{ height: '100%', borderRadius: 0, borderLeft: 0 }}
        styles={{ body: { padding: 16 } }}
      >
        <Empty description="请选择画布中的组件" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Card>
    );
  }

  const typeLabel = COMPONENT_TYPE_LABELS[comp.type] || comp.type;

  // 通用属性
  const commonFields = (
    <>
      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
        位置和大小
      </Text>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <Text style={{ fontSize: 12 }}>X</Text>
          <InputNumber
            size="small"
            style={{ width: '100%' }}
            value={comp.x}
            onChange={(v) => updateComponent(selectedId!, { x: v ?? 0 })}
          />
        </div>
        <div>
          <Text style={{ fontSize: 12 }}>Y</Text>
          <InputNumber
            size="small"
            style={{ width: '100%' }}
            value={comp.y}
            onChange={(v) => updateComponent(selectedId!, { y: v ?? 0 })}
          />
        </div>
        <div>
          <Text style={{ fontSize: 12 }}>宽度</Text>
          <InputNumber
            size="small"
            style={{ width: '100%' }}
            value={comp.w}
            min={1}
            onChange={(v) => updateComponent(selectedId!, { w: v ?? 1 })}
          />
        </div>
        <div>
          <Text style={{ fontSize: 12 }}>高度</Text>
          <InputNumber
            size="small"
            style={{ width: '100%' }}
            value={comp.h}
            min={1}
            onChange={(v) => updateComponent(selectedId!, { h: v ?? 1 })}
          />
        </div>
      </div>
    </>
  );

  // 按类型渲染特定属性编辑
  const renderTypeProps = () => {
    switch (comp.type) {
      case 'text':
        return (
          <>
            <Text style={{ fontSize: 12 }}>内容</Text>
            <Input.TextArea
              rows={3}
              value={(comp.props.content as string) || ''}
              onChange={(e) => handlePropChange('content', e.target.value)}
            />
            <Space style={{ width: '100%', marginTop: 8 }} direction="vertical" size={4}>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12 }}>字号</Text>
                  <InputNumber
                    size="small"
                    style={{ width: '100%' }}
                    value={(comp.props.fontSize as number) || 14}
                    min={6}
                    max={200}
                    onChange={(v) => handlePropChange('fontSize', v ?? 14)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12 }}>对齐</Text>
                  <Select
                    size="small"
                    style={{ width: '100%' }}
                    value={(comp.props.textAlign as string) || 'left'}
                    onChange={(v) => handlePropChange('textAlign', v)}
                    options={[
                      { value: 'left', label: '左' },
                      { value: 'center', label: '中' },
                      { value: 'right', label: '右' },
                    ]}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12 }}>字重</Text>
                  <Select
                    size="small"
                    style={{ width: '100%' }}
                    value={(comp.props.fontWeight as string) || 'normal'}
                    onChange={(v) => handlePropChange('fontWeight', v)}
                    options={[
                      { value: 'normal', label: '常规' },
                      { value: 'bold', label: '加粗' },
                    ]}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12 }}>样式</Text>
                  <Select
                    size="small"
                    style={{ width: '100%' }}
                    value={(comp.props.fontStyle as string) || 'normal'}
                    onChange={(v) => handlePropChange('fontStyle', v)}
                    options={[
                      { value: 'normal', label: '常规' },
                      { value: 'italic', label: '斜体' },
                    ]}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div>
                  <Text style={{ fontSize: 12 }}>字体颜色</Text>
                  <ColorPicker
                    size="small"
                    value={(comp.props.color as string) || '#000000'}
                    onChange={(_, hex) => handlePropChange('color', hex)}
                  />
                </div>
                <div>
                  <Text style={{ fontSize: 12 }}>背景色</Text>
                  <ColorPicker
                    size="small"
                    value={(comp.props.backgroundColor as string) || 'transparent'}
                    onChange={(_, hex) => handlePropChange('backgroundColor', hex)}
                  />
                </div>
              </div>
            </Space>
          </>
        );
      case 'image':
        return (
          <>
            <Text style={{ fontSize: 12 }}>图片地址</Text>
            <Input
              value={(comp.props.src as string) || ''}
              onChange={(e) => handlePropChange('src', e.target.value)}
              placeholder="输入图片URL"
            />
            <Text style={{ fontSize: 12, marginTop: 8, display: 'block' }}>适应方式</Text>
            <Select
              size="small"
              style={{ width: '100%' }}
              value={(comp.props.fit as string) || 'contain'}
              onChange={(v) => handlePropChange('fit', v)}
              options={[
                { value: 'contain', label: '适应' },
                { value: 'cover', label: '填充' },
                { value: 'fill', label: '拉伸' },
              ]}
            />
          </>
        );
      case 'table':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <Text style={{ fontSize: 12 }}>行数</Text>
              <InputNumber
                size="small"
                style={{ width: '100%' }}
                value={(comp.props.rows as number) || 3}
                min={1}
                max={20}
                onChange={(v) => handlePropChange('rows', v ?? 3)}
              />
            </div>
            <div>
              <Text style={{ fontSize: 12 }}>列数</Text>
              <InputNumber
                size="small"
                style={{ width: '100%' }}
                value={(comp.props.cols as number) || 3}
                min={1}
                max={20}
                onChange={(v) => handlePropChange('cols', v ?? 3)}
              />
            </div>
            <div>
              <Text style={{ fontSize: 12 }}>边框宽度</Text>
              <InputNumber
                size="small"
                style={{ width: '100%' }}
                value={(comp.props.borderWidth as number) || 1}
                min={0}
                max={10}
                onChange={(v) => handlePropChange('borderWidth', v ?? 1)}
              />
            </div>
            <div>
              <Text style={{ fontSize: 12 }}>边框颜色</Text>
              <ColorPicker
                size="small"
                value={(comp.props.borderColor as string) || '#000000'}
                onChange={(_, hex) => handlePropChange('borderColor', hex)}
              />
            </div>
          </div>
        );
      case 'barcode':
        return (
          <>
            <Text style={{ fontSize: 12 }}>条码值</Text>
            <Input
              value={(comp.props.value as string) || ''}
              onChange={(e) => handlePropChange('value', e.target.value)}
              placeholder="输入条码内容"
            />
            <Text style={{ fontSize: 12, marginTop: 8, display: 'block' }}>格式</Text>
            <Select
              size="small"
              style={{ width: '100%' }}
              value={(comp.props.format as string) || 'CODE128'}
              onChange={(v) => handlePropChange('format', v)}
              options={[{ value: 'CODE128', label: 'CODE128' }]}
            />
          </>
        );
      case 'line':
        return (
          <>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <Text style={{ fontSize: 12 }}>粗细</Text>
                <InputNumber
                  size="small"
                  style={{ width: '100%' }}
                  value={(comp.props.thickness as number) || 1}
                  min={1}
                  max={20}
                  onChange={(v) => handlePropChange('thickness', v ?? 1)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Text style={{ fontSize: 12 }}>样式</Text>
                <Select
                  size="small"
                  style={{ width: '100%' }}
                  value={(comp.props.style as string) || 'solid'}
                  onChange={(v) => handlePropChange('style', v)}
                  options={[
                    { value: 'solid', label: '实线' },
                    { value: 'dashed', label: '虚线' },
                    { value: 'dotted', label: '点线' },
                  ]}
                />
              </div>
            </div>
            <div style={{ marginTop: 8 }}>
              <Text style={{ fontSize: 12 }}>颜色</Text>
              <ColorPicker
                size="small"
                value={(comp.props.color as string) || '#000000'}
                onChange={(_, hex) => handlePropChange('color', hex)}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Card
      title={`属性 - ${typeLabel}`}
      size="small"
      style={{ height: '100%', borderRadius: 0, borderLeft: 0 }}
      styles={{ body: { padding: 16 } }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {commonFields}
        <Divider style={{ margin: '4px 0' }} />
        {renderTypeProps()}
      </div>
    </Card>
  );
};

export default PropertyPanel;
