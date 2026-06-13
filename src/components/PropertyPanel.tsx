import React, { useCallback, useMemo, useState } from 'react';
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
  Switch,
  Button,
  List,
  Popconfirm,
  Form,
  Tag,
  Table,
} from 'antd';
import { PlusOutlined, DeleteOutlined, DatabaseOutlined, LinkOutlined, SaveOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import { useDesignerStore } from '../store';
import { COMPONENT_TYPE_LABELS } from '../constants';
import { TableColumnConfig } from '../types';
import { safeParseJSON, getValueByPath, getObjectFromDataSource } from '../utils/dataHelper';

const { Text, Title } = Typography;
const { TextArea } = Input;

// 数据绑定配置的类型（临时内部使用）
interface DataBindingConfig {
  // 字段名（用于不同组件的不同属性，例如：文本组件是 'content'，条码是 'value'，图片是 'src'）
  field: string;
  // 绑定的数据源 ID
  dataSourceId: string | null;
  // 字段路径
  fieldPath: string;
  // 静态值（当没有绑定时使用）
  staticValue: string;
}

const PropertyPanel: React.FC = () => {
  const components = useDesignerStore((s) => s.components);
  const selectedId = useDesignerStore((s) => s.selectedId);
  const dataSources = useDesignerStore((s) => s.dataSources);
  const updateComponent = useDesignerStore((s) => s.updateComponent);
  const updateComponentTableColumns = useDesignerStore((s) => s.updateComponentTableColumns);

  const comp = useMemo(
    () => components.find((c) => c.id === selectedId) || null,
    [components, selectedId],
  );

  // 表格列编辑的临时状态
  const [tempColumns, setTempColumns] = useState<TableColumnConfig[]>([]);

  // 辅助函数：从数据源列表获取可选项
  const dataSourceOptions = useMemo(
    () => [
      { label: '无（使用静态值）', value: '' },
      ...dataSources.map((ds) => ({
        label: ds.name,
        value: ds.id,
        type: ds.type,
      })),
    ],
    [dataSources],
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

  // 处理数据绑定配置的变更
  const handleBindingChange = useCallback(
    (field: string, dsId: string | null, path: string, staticValue: string) => {
      if (!selectedId) return;
      // 如果没有数据源或路径，就用静态值
      let valueToSet: string = staticValue;
      if (dsId && path) {
        // 尝试从数据源获取预览值（但实际保存的还是配置，我们把配置同时存起来）
        valueToSet = staticValue;
      }
      // 我们需要把绑定配置也存到 props 里，这样导出时也能保存
      const bindingKey = `${field}Binding`;
      updateComponent(selectedId, {
        props: {
          ...comp?.props,
          [field]: valueToSet,
          [bindingKey]: {
            dataSourceId: dsId,
            fieldPath: path,
            staticValue,
          },
        },
      });
    },
    [selectedId, comp, updateComponent],
  );

  // 从 props 获取绑定配置
  const getBindingConfig = useCallback((field: string): DataBindingConfig => {
    const binding = comp?.props[`${field}Binding`] as any;
    const staticValue = String(comp?.props[field] || '');
    if (binding) {
      return {
        field,
        dataSourceId: binding.dataSourceId || null,
        fieldPath: binding.fieldPath || '',
        staticValue: binding.staticValue ?? staticValue,
      };
    }
    return { field, dataSourceId: null, fieldPath: '', staticValue };
  }, [comp]);

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

  // 通用属性（位置和大小）
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

  // 可绑定字段的通用编辑组件
  const RenderDataBindingEditor = ({
    field,
    label,
    placeholder,
    isTextarea = false,
  }: {
    field: string;
    label: string;
    placeholder?: string;
    isTextarea?: boolean;
  }) => {
    const cfg = getBindingConfig(field);
    const selectedDs = dataSources.find((ds) => ds.id === cfg.dataSourceId);
    const parsedData = selectedDs ? getObjectFromDataSource(selectedDs) : null;
    const availableKeys = parsedData ? Object.keys(parsedData) : [];

    // 用于 TextArea 和 Input 的临时状态
    const [tempValue, setTempValue] = React.useState(cfg.staticValue);

    // 当数据源改变时，重置临时值
    React.useEffect(() => {
      setTempValue(cfg.staticValue);
    }, [cfg.staticValue, cfg.dataSourceId]);

    return (
      <div>
        <Text style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>{label}</Text>
        <div style={{ marginBottom: 4 }}>
          <Select
            size="small"
            style={{ width: '100%' }}
            placeholder="选择数据源"
            value={cfg.dataSourceId || ''}
            onChange={(dsId) => {
              handleBindingChange(
                field,
                dsId || null,
                dsId ? (cfg.fieldPath || '') : '',
                cfg.staticValue,
              );
            }}
            options={dataSourceOptions}
          />
        </div>
        {cfg.dataSourceId && (
          <div style={{ marginBottom: 4 }}>
            <Select
              size="small"
              style={{ width: '100%' }}
              placeholder="选择字段"
              value={cfg.fieldPath}
              onChange={(path) => {
                handleBindingChange(field, cfg.dataSourceId, path || '', cfg.staticValue);
              }}
              options={[
                { label: '请选择字段', value: '' },
                ...availableKeys.map((key) => ({ label: key, value: key })),
              ]}
            />
          </div>
        )}
        {!cfg.dataSourceId ? (
          isTextarea ? (
            <TextArea
              rows={3}
              placeholder={placeholder}
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onBlur={() => {
                // 失去焦点时保存
                handleBindingChange(field, null, '', tempValue);
              }}
            />
          ) : (
            <Input
              placeholder={placeholder}
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onBlur={() => {
                // 失去焦点时保存
                handleBindingChange(field, null, '', tempValue);
              }}
            />
          )
        ) : (
          <div style={{
            padding: 6,
            background: '#f0f5ff',
            border: '1px solid #adc6ff',
            borderRadius: 4,
            fontSize: 12,
          }}>
            <DatabaseOutlined style={{ marginRight: 4, color: '#1890ff' }} />
            <span style={{ fontWeight: 500 }}>数据绑定已启用</span>
            {selectedDs && cfg.fieldPath && (
              <span style={{ marginLeft: 8 }}>
                <Tag color="blue">{selectedDs.name}</Tag>
                <Tag color="green">{cfg.fieldPath}</Tag>
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  // 表格列配置编辑器
  const RenderTableColumnEditor = () => {
    const columns = comp.tableColumns || [];
    const arrayDataSources = dataSources.filter((ds) => ds.type === 'array');
    const selectedTableDSId = (comp.props.tableDataSourceId || '') as string;
    const selectedTableDS = arrayDataSources.find((ds) => ds.id === selectedTableDSId);

    // 使用 tempColumns 或 columns
    const displayColumns = tempColumns.length > 0 ? tempColumns : columns;

    // 临时存储正在编辑的列标题值，避免频繁更新状态
    const [editingTitles, setEditingTitles] = React.useState<Record<string, string>>({});

    // 保存列配置
    const saveColumns = () => {
      updateComponentTableColumns(selectedId!, displayColumns);
    };

    // 添加列（立即生效）
    const addColumn = () => {
      const newColumns = [...displayColumns, { title: `列${displayColumns.length + 1}` }];
      setTempColumns(newColumns);
    };

    // 删除列（立即生效）
    const removeColumn = (index: number) => {
      const newColumns = displayColumns.filter((_, i) => i !== index);
      setTempColumns(newColumns);
    };

    // 更新列（立即生效）
    const updateColumn = (index: number, key: keyof TableColumnConfig, value: string) => {
      const newColumns = [...displayColumns];
      newColumns[index] = { ...newColumns[index], [key]: value };
      setTempColumns(newColumns);
    };

    // 获取字段提示
    let arrayKeys: string[] = [];
    if (selectedTableDS) {
      const parsed = safeParseJSON(selectedTableDS.data);
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
        arrayKeys = Object.keys(parsed[0]);
      }
    }

    // Table columns
    const tableColumns: TableProps<TableColumnConfig & { key: string }>['columns'] = [
      {
        title: '列标题',
        dataIndex: 'title',
        width: 60,
        render: (_, record) => {
          // 使用临时编辑值或原始值
          const currentValue = record.key in editingTitles 
            ? editingTitles[record.key] 
            : record.title;
          
          return (
            <Input
              size="small"
              value={currentValue}
              placeholder="列标题"
              onChange={(e) => {
                // 只更新临时状态，不立即保存
                setEditingTitles({
                  ...editingTitles,
                  [record.key]: e.target.value,
                });
              }}
              onBlur={() => {
                // 失去焦点时才更新并保存
                if (record.key in editingTitles) {
                  updateColumn(Number(record.key), 'title', editingTitles[record.key]);
                  // 清除临时值
                  const newEditing = { ...editingTitles };
                  delete newEditing[record.key];
                  setEditingTitles(newEditing);
                  saveColumns();
                }
              }}
            />
          );
        },
      },
      {
        title: '绑定字段',
        dataIndex: 'fieldPath',
        width: 100,
        render: (_, record) => {
          return (
            <Select
              size="small"
              style={{ width: '100%' }}
              value={record.fieldPath || ''}
              placeholder={selectedTableDS ? '绑定字段' : '选择数据源先'}
              disabled={!selectedTableDS}
              onChange={(v) => {
                updateColumn(Number(record.key), 'fieldPath', v || '');
                saveColumns();
              }}
              options={[
                { label: '无绑定', value: '' },
                ...arrayKeys.map((k) => ({ label: k, value: k })),
              ]}
            />
          );
        },
      },
      {
        title: '操作',
        width: 50,
        render: (_, record) => (
          <Popconfirm
            title="确定要删除吗?"
            onConfirm={() => {
              removeColumn(Number(record.key));
              saveColumns();
            }}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        ),
      },
    ];

    // 转换数据用于 Table
    const tableData = displayColumns.map((col, index) => ({
      ...col,
      key: String(index),
    }));

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontSize: 12 }}>表格数据源</Text>
        </div>
        <Select
          size="small"
          style={{ width: '100%', marginBottom: 8 }}
          placeholder="选择数组类型数据源"
          value={selectedTableDSId}
          onChange={(v) => handlePropChange('tableDataSourceId', v || '')}
          options={[
            { label: '无（仅静态展示）', value: '' },
            ...arrayDataSources.map((ds) => ({ label: ds.name, value: ds.id })),
          ]}
        />
        <Divider />
        <Space style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 12 }}>列配置</Text>
          <Button size="small" type="dashed" icon={<PlusOutlined />} onClick={addColumn} />
          <Button size="small" type="primary" onClick={saveColumns} icon={<SaveOutlined />} />
        </Space>
        <Table
          dataSource={tableData}
          columns={tableColumns}
          pagination={false}
          size="small"
          scroll={{ x: 200,y: 360 }}
          bordered
          rowKey="key"
        />
      </div>
    );
  };

  // 按类型渲染特定属性编辑
  const renderTypeProps = () => {
    switch (comp.type) {
      case 'text':
        return (
          <>
            <RenderDataBindingEditor
              field="content"
              label="内容"
              placeholder="请输入文本内容"
              isTextarea
            />
            <Text style={{ fontSize: 12, marginTop: 8, display: 'block' }}>格式</Text>
            <Input
              size="small"
              placeholder="例如 yyyyMMdd 或 yyyy-MM-dd HH:mm:ss"
              value={(comp.props.format as string) || ''}
              onChange={(e) => handlePropChange('format', e.target.value)}
            />
            <Divider style={{ margin: '4px 0' }} />
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
              文字样式
            </Text>
            <Space style={{ width: '100%' }} direction="vertical" size={4}>
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
              <Space>
                <Text style={{ fontSize: 12 }}>字体颜色</Text>
                  <ColorPicker
                    size="small"
                    value={(comp.props.color as string) || '#000000'}
                    onChange={(_, hex) => handlePropChange('color', hex)}
                  />
                  <Text style={{ fontSize: 12 }}>背景色</Text>
                  <ColorPicker
                    size="small"
                    value={(comp.props.backgroundColor as string) || 'transparent'}
                    onChange={(_, hex) => handlePropChange('backgroundColor', hex)}
                  />
              </Space>
            </Space>
          </>
        );
      case 'image':
        return (
          <>
            <RenderDataBindingEditor field="src" label="图片地址" placeholder="输入图片 URL" />
            <Divider style={{ margin: '4px 0' }} />
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
          <>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
              边框样式
            </Text>
            <Space>
              <Text style={{ fontSize: 12 }}>粗细</Text>
                <InputNumber
                  size="small"
                  value={(comp.props.borderWidth as number) || 1}
                  min={0}
                  max={20}
                  onChange={(v) => handlePropChange('borderWidth', v ?? 1)}
                />
                <Text style={{ fontSize: 12 }}>颜色</Text>
                <ColorPicker
                  size="small"
                  value={(comp.props.borderColor as string) || '#000000'}
                  onChange={(_, hex) => handlePropChange('borderColor', hex)}
                />
            </Space>
            <Divider style={{ margin: '4px 0' }} />
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
              列标题样式
            </Text>
            <Space>
              <Text style={{ fontSize: 12 }}>字号</Text>
                <InputNumber
                  size="small"
                  value={(comp.props.headerFontSize as number) || 12}
                  min={6}
                  max={200}
                  onChange={(v) => handlePropChange('headerFontSize', v ?? 12)}
                />                
            </Space>
            <Space>
              <Text style={{ fontSize: 12 }}>背景色</Text>
                <ColorPicker
                  size="small"
                  value={(comp.props.headerBackgroundColor as string) || '#f5f5f5'}
                  onChange={(_, hex) => handlePropChange('headerBackgroundColor', hex)}
                />
                <Text style={{ fontSize: 12 }}>字体颜色</Text>
                <ColorPicker
                  size="small"
                  value={(comp.props.headerColor as string) || '#000000'}
                  onChange={(_, hex) => handlePropChange('headerColor', hex)}
                />
            </Space>
            <Divider style={{ margin: '4px 0' }} />
            <RenderTableColumnEditor />
          </>
        );
      case 'barcode':
        return (
          <>
            <RenderDataBindingEditor field="value" label="条码值" placeholder="输入条码内容" />
            <Divider style={{ margin: '4px 0' }} />
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
      case 'qrcode':
        return (
          <>
            <RenderDataBindingEditor field="value" label="二维码内容" placeholder="输入二维码内容" />
            <Divider style={{ margin: '4px 0' }} />
            <Text style={{ fontSize: 12, marginTop: 8, display: 'block' }}>纠错级别</Text>
            <Select
              size="small"
              style={{ width: '100%' }}
              value={(comp.props.errorLevel as string) || 'M'}
              onChange={(v) => handlePropChange('errorLevel', v)}
              options={[
                { value: 'L', label: 'L - 低' },
                { value: 'M', label: 'M - 中' },
                { value: 'Q', label: 'Q - 较高' },
                { value: 'H', label: 'H - 高' },
              ]}
            />
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              <div>
                <Text style={{ fontSize: 12 }}>前景色</Text>
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
                  value={(comp.props.backgroundColor as string) || '#ffffff'}
                  onChange={(_, hex) => handlePropChange('backgroundColor', hex)}
                />
              </div>
            </div>
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
      styles={{ body: { padding: 16, overflowY: 'auto' } }}
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
