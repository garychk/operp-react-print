import React, { useRef, useMemo } from 'react';
import { Modal, Button, Space, Typography, Divider } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { useReactToPrint } from 'react-to-print';
import { useDesignerStore } from '../store';
import { DataSource } from '../types';
import { PAPER_SIZES, MM_TO_PX_RATIO, DEFAULT_GRID_SETTINGS } from '../constants';
import Barcode from './Barcode';
import QRCode from './QRCode';
import {
  safeParseJSON,
  getValueByPath,
  getObjectFromDataSource,
  getArrayFromDataSource,
} from '../utils/dataHelper';

const { Text } = Typography;

const PrintPreview: React.FC<{ dataSources?: DataSource[] }> = ({ dataSources: dataSourcesProp }) => {
  const previewVisible = useDesignerStore((s) => s.previewVisible);
  const setPreviewVisible = useDesignerStore((s) => s.setPreviewVisible);
  const components = useDesignerStore((s) => s.components);
  const pageSettings = useDesignerStore((s) => s.pageSettings);
  const gridSettings = useDesignerStore((s) => s.gridSettings) || DEFAULT_GRID_SETTINGS;
  const storeDataSources = useDesignerStore((s) => s.dataSources);
  const dataSources = dataSourcesProp || storeDataSources;
  const printRef = useRef<HTMLDivElement>(null);

  const pagePixel = useMemo(() => {
    const preset = PAPER_SIZES[pageSettings.paperSize as keyof typeof PAPER_SIZES];
    if (!preset) {
      return {
        width: pageSettings.customWidth * MM_TO_PX_RATIO,
        height: pageSettings.customHeight * MM_TO_PX_RATIO,
      };
    }
    const w = preset.width * MM_TO_PX_RATIO;
    const h = preset.height * MM_TO_PX_RATIO;
    return pageSettings.orientation === 'landscape'
      ? { width: h, height: w }
      : { width: w, height: h };
  }, [pageSettings]);

  const marginPx = useMemo(
    () => ({
      top: pageSettings.marginTop * MM_TO_PX_RATIO,
      right: pageSettings.marginRight * MM_TO_PX_RATIO,
      bottom: pageSettings.marginBottom * MM_TO_PX_RATIO,
      left: pageSettings.marginLeft * MM_TO_PX_RATIO,
    }),
    [pageSettings],
  );

  const canvasW = pagePixel.width - marginPx.left - marginPx.right;
  const cellSize = canvasW / gridSettings.cols;

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: '打印模板',
    pageStyle: `
      @page {
        size: ${pagePixel.width / MM_TO_PX_RATIO}mm ${pagePixel.height / MM_TO_PX_RATIO}mm;
        margin: ${pageSettings.marginTop}mm ${pageSettings.marginRight}mm ${pageSettings.marginBottom}mm ${pageSettings.marginLeft}mm;
      }
      @media print {
        html, body { margin: 0; padding: 0; }
      }
    `,
  }) as () => void;

  // 获取渲染时的实际值（考虑数据绑定）
  const getRenderValue = (comp: any, field: string): string => {
    const binding = comp.props[`${field}Binding`];
    // 直接使用组件绑定的数据源
    if (binding && binding.dataSourceId && binding.fieldPath) {
      const ds = dataSources.find((d) => d.id === binding.dataSourceId);
      if (ds && ds.type === 'object') {
        const data = getObjectFromDataSource(ds);
        if (data) {
          const val = getValueByPath(data, binding.fieldPath);
          if (val !== '') {
            return val;
          }
        }
      }
    }
    return binding?.staticValue ?? String(comp.props[field] || '');
  };

  // 表格数据渲染
  const renderTableData = (comp: any) => {
    const tableDSId = comp.props.tableDataSourceId;
    const ds = tableDSId ? dataSources.find((d) => d.id === tableDSId) : null;
    const data = ds ? getArrayFromDataSource(ds) : null;
    const cols = comp.tableColumns || [];
    const borderWidth = (comp.props.borderWidth as number) || 1;
    const borderColor = (comp.props.borderColor as string) || '#000000';

    // 如果没有数据或者没有绑定，展示静态的几行
    const displayData = data || Array.from({ length: (comp.props.rows as number) || 3 }).map(() => ({}));

    return (
      <table
        style={{
          width: '100%',
          height: '100%',
          borderCollapse: 'collapse',
        }}
      >
        {/* 表头 */}
        <thead>
          <tr>
            {cols.map((col: any, cIndex: number) => (
              <th
                key={cIndex}
                style={{
                  border: `${borderWidth}px solid ${borderColor}`,
                  padding: 4,
                  textAlign: 'center',
                  fontSize: 12,
                  fontWeight: 'bold',
                  backgroundColor: '#f5f5f5',
                }}
              >
                {col.title || `列${cIndex + 1}`}
              </th>
            ))}
          </tr>
        </thead>
        {/* 表体 */}
        <tbody>
          {displayData.map((row, rIndex) => (
            <tr key={rIndex}>
              {cols.map((col: any, cIndex: number) => (
                <td
                  key={cIndex}
                  style={{
                    border: `${borderWidth}px solid ${borderColor}`,
                    padding: 4,
                    textAlign: 'center',
                    fontSize: 12,
                  }}
                >
                  {col.fieldPath ? getValueByPath(row, col.fieldPath) : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // 简易组件渲染（无交互版本）
  const renderStaticComponent = (comp: any): React.ReactNode => {
    const p = comp.props;
    const containerStyle: React.CSSProperties = {
      position: 'absolute',
      left: comp.x * cellSize,
      top: comp.y * cellSize,
      width: comp.w * cellSize,
      height: comp.h * cellSize,
      overflow: 'hidden',
    };

    const baseStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      boxSizing: 'border-box',
    };

    switch (comp.type) {
      case 'text':
        return (
          <div key={comp.id} style={containerStyle}>
            <div
              style={{
                ...baseStyle,
                fontSize: (p.fontSize as number) || 14,
                fontWeight: (p.fontWeight as React.CSSProperties['fontWeight']) || 'normal',
                fontStyle: (p.fontStyle as React.CSSProperties['fontStyle']) || 'normal',
                textAlign: (p.textAlign as React.CSSProperties['textAlign']) || 'left',
                color: (p.color as string) || '#000',
                backgroundColor: (p.backgroundColor as string) || 'transparent',
                padding: 4,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {getRenderValue(comp, 'content')}
            </div>
          </div>
        );
      case 'image':
        return (
          <div key={comp.id} style={containerStyle}>
            <div style={baseStyle}>
              {p.src ? (
                <img
                  src={getRenderValue(comp, 'src')}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: (p.fit as React.CSSProperties['objectFit']) || 'contain',
                  }}
                  alt=""
                />
              ) : null}
            </div>
          </div>
        );
      case 'table':
        return (
          <div key={comp.id} style={containerStyle}>
            {renderTableData(comp)}
          </div>
        );
      case 'barcode':
        return (
          <div key={comp.id} style={containerStyle}>
            <div
              style={{
                ...baseStyle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 4,
              }}
            >
              <Barcode
                value={getRenderValue(comp, 'value')}
                format={(p.format as string) || 'CODE128'}
              />
            </div>
          </div>
        );
      case 'qrcode':
        return (
          <div key={comp.id} style={containerStyle}>
            <div
              style={{
                ...baseStyle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 4,
              }}
            >
              <QRCode
                value={getRenderValue(comp, 'value')}
                errorLevel={(p.errorLevel as 'L' | 'M' | 'Q' | 'H') || 'M'}
                color={(p.color as string) || '#000000'}
                backgroundColor={(p.backgroundColor as string) || '#ffffff'}
              />
            </div>
          </div>
        );
      case 'line':
        return (
          <div key={comp.id} style={containerStyle}>
            <div
              style={{
                ...baseStyle,
                display: 'flex',
                alignItems: 'center',
                border: 'none',
              }}
            >
              <hr
                style={{
                  width: '100%',
                  border: 'none',
                  borderTop: `${p.thickness || 1}px ${p.style || 'solid'} ${p.color || '#000'}`,
                  margin: 0,
                }}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      title="打印预览"
      open={previewVisible}
      onCancel={() => setPreviewVisible(false)}
      width={pagePixel.width + 80}
      footer={
        <Space>
          <Button onClick={() => setPreviewVisible(false)}>关闭</Button>
          <Button type="primary" icon={<PrinterOutlined />} onClick={() => handlePrint()}>
            打印
          </Button>
        </Space>
      }
      styles={{ body: { padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center' } }}
    >
      <Divider style={{ margin: '4px 0 12px 0' }} />

      <div
        ref={printRef}
        style={{
          width: pagePixel.width,
          height: pagePixel.height,
          background: '#fff',
          border: '1px solid #d9d9d9',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* 页眉 */}
        {pageSettings.showHeader && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: marginPx.left,
              right: marginPx.right,
              height: marginPx.top,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              overflow: 'hidden',
            }}
          >
            {pageSettings.headerContent}
          </div>
        )}
        {/* 页脚 */}
        {pageSettings.showFooter && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: marginPx.left,
              right: marginPx.right,
              height: marginPx.bottom,
              display: 'flex',
              alignItems: 'center',
              justifyContent: pageSettings.showPageNumber ? 'space-between' : 'center',
              fontSize: 12,
              overflow: 'hidden',
              padding: '0 8px',
            }}
          >
            <span>{pageSettings.footerContent}</span>
            {pageSettings.showPageNumber && (
              <span>{pageSettings.pageNumberFormat.replace('{page}', '1')}</span>
            )}
          </div>
        )}
        {/* 内容区 */}
        <div
          style={{
            position: 'absolute',
            top: marginPx.top,
            left: marginPx.left,
            width: canvasW,
            height: pagePixel.height - marginPx.top - marginPx.bottom,
          }}
        >
          {components.map(renderStaticComponent)}
        </div>
      </div>
    </Modal>
  );
};

export default PrintPreview;
