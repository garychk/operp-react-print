import React, { useEffect, useRef, useMemo, useState } from 'react';
import { App as AntApp, Button, Space } from 'antd';
import {
  LeftOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PrinterOutlined,
  RightOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useReactToPrint } from 'react-to-print';
import Toolbar from '../Toolbar';
import LeftPanel from '../LeftPanel';
import Canvas from '../Canvas';
import PropertyPanel from '../PropertyPanel';
import PrintPreview from '../PrintPreview';
import HeaderFooterDialog from '../HeaderFooterDialog';
import { useDesignerStore } from '../../store';
import { DataSource, PrintDesignerDataSource, TemplateData } from '../../types';
import { PAPER_SIZES, MM_TO_PX_RATIO, DEFAULT_GRID_SETTINGS } from '../../constants';
import Barcode from '../Barcode';
import QRCode from '../QRCode';
import {
  safeParseJSON,
  getValueByPath,
  getObjectFromDataSource,
  getArrayFromDataSource,
  getRenderValue,
} from '../../utils/dataHelper';

export interface PrintDesignerProps {
  /** 是否为预览模式（只读） */
  isPreview?: boolean;
  /** 初始模板数据 */
  initialTemplateData?: TemplateData;
  /** 外部数据源。传入后优先于设计器内部数据源用于渲染和打印 */
  dataSource?: PrintDesignerDataSource;
  /** 保存回调 */
  onSave?: (templateData: TemplateData) => void;
  /** 打印回调 */
  onPrint?: () => void;
}

const PrintDesigner: React.FC<PrintDesignerProps> = ({
  isPreview = false,
  initialTemplateData,
  dataSource,
  onSave,
  onPrint,
}) => {
  const { importJSON, exportJSON, reset, components, pageSettings, gridSettings, dataSources } = useDesignerStore();
  const printRef = useRef<HTMLDivElement>(null);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  // 初始化数据
  useEffect(() => {
    if (initialTemplateData) {
      const jsonStr = JSON.stringify(initialTemplateData);
      const error = importJSON(jsonStr);
      if (error) {
        console.error('导入失败:', error);
        reset();
      }
    }
  }, [initialTemplateData, importJSON, reset]);

  // 导出数据供外部回调使用
  const handleSave = () => {
    if (onSave) {
      try {
        const jsonStr = exportJSON();
        onSave(JSON.parse(jsonStr));
      } catch (e) {
        console.error('导出失败:', e);
      }
    }
  };

  // 打印相关计算
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
  const cellSize = canvasW / (gridSettings?.cols || DEFAULT_GRID_SETTINGS.cols);

  const resolvedDataSources = useMemo<DataSource[]>(() => {
    if (!dataSource) {
      return dataSources;
    }

    const hasData = dataSource.data && typeof dataSource.data === 'object';
    const hasList = Array.isArray(dataSource.list);
    const objectJson = hasData ? JSON.stringify(dataSource.data) : null;
    const listJson = hasList ? JSON.stringify(dataSource.list) : null;
    let objectApplied = false;
    let listApplied = false;

    const merged = dataSources.map((ds) => {
      if (ds.type === 'object' && objectJson !== null) {
        objectApplied = true;
        return { ...ds, data: objectJson };
      }
      if (ds.type === 'array' && listJson !== null) {
        listApplied = true;
        return { ...ds, data: listJson };
      }
      return ds;
    });

    if (objectJson !== null && !objectApplied) {
      merged.push({
        id: 'external_data',
        name: '外部对象数据',
        type: 'object',
        data: objectJson,
        createdAt: 0,
      });
    }

    if (listJson !== null && !listApplied) {
      merged.push({
        id: 'external_list',
        name: '外部列表数据',
        type: 'array',
        data: listJson,
        createdAt: 0,
      });
    }

    return merged;
  }, [dataSource, dataSources]);

  const handlePrintInternal = useReactToPrint({
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

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      handlePrintInternal();
    }
  };

  // 渲染静态组件（用于打印）
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
              {getRenderValue(comp, 'content', resolvedDataSources)}
            </div>
          </div>
        );
      case 'image':
        return (
          <div key={comp.id} style={containerStyle}>
            <div style={baseStyle}>
              {p.src ? (
                <img
                  src={getRenderValue(comp, 'src', resolvedDataSources)}
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
                value={getRenderValue(comp, 'value', resolvedDataSources)}
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
                value={getRenderValue(comp, 'value', resolvedDataSources)}
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

  // 表格数据渲染
  const renderTableData = (comp: any) => {
    const tableDSId = comp.props.tableDataSourceId;
    const ds = tableDSId ? resolvedDataSources.find((d) => d.id === tableDSId) : null;
    const data = ds ? getArrayFromDataSource(ds) : null;
    const cols = comp.tableColumns || [];
    const borderWidth = (comp.props.borderWidth as number) || 1;
    const borderColor = (comp.props.borderColor as string) || '#000000';

    // 如果有数组数据源，则渲染动态数据
    if (data && data.length > 0) {
      return (
        <table
          style={{
            width: '100%',
            height: '100%',
            borderCollapse: 'collapse',
          }}
        >
          {/* 表头 */}
          {cols.length > 0 && (
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                {cols.map((col: any, i: number) => (
                  <th
                    key={i}
                    style={{
                      border: `${borderWidth}px solid ${borderColor}`,
                      padding: 4,
                      fontSize: 12,
                      fontWeight: 'bold',
                      textAlign: 'center',
                    }}
                  >
                    {col.title}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          {/* 表体 */}
          <tbody>
            {data.map((row, r) => (
              <tr key={r}>
                {cols.map((col: any, c: number) => (
                  <td
                    key={c}
                    style={{
                      border: `${borderWidth}px solid ${borderColor}`,
                      padding: 4,
                      fontSize: 12,
                      textAlign: 'center',
                    }}
                  >
                    {col.fieldPath ? (row as any)[col.fieldPath] : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    // 否则渲染静态表格
    const rows = (comp.props.rows as number) || 3;
    const colsCount = Math.max((comp.props.cols as number) || 3, cols.length || 3);

    return (
      <table
        style={{
          width: '100%',
          height: '100%',
          borderCollapse: 'collapse',
        }}
      >
        <tbody>
          {Array.from({ length: rows }).map((_, rIndex) => (
            <tr key={rIndex}>
              {Array.from({ length: colsCount }).map((_, cIndex) => (
                <td
                  key={cIndex}
                  style={{
                    border: `${borderWidth}px solid ${borderColor}`,
                    padding: 2,
                    fontSize: 12,
                    textAlign: 'center',
                  }}
                >
                  &nbsp;
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // 预览模式下显示打印界面
  if (isPreview) {
    return (
      <AntApp>
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* 顶部工具栏 */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e8e8e8', background: '#fff' }}>
            <Space>
              <Button type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>
                打印
              </Button>
            </Space>
          </div>
          
          {/* 预览区域 */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '16px', boxSizing: 'border-box', overflowY: 'auto', background: '#e8e8e8' }}>
            <div style={{ flexShrink: 0 }}>
              <Canvas isPreview dataSources={resolvedDataSources} />
            </div>
          </div>

          {/* 隐藏的打印内容 */}
          <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
            <div
              ref={printRef}
              style={{
                width: pagePixel.width,
                height: pagePixel.height,
                background: '#fff',
                position: 'relative',
                overflow: 'hidden',
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
          </div>
        </div>
      </AntApp>
    );
  }

  return (
    <AntApp>
      <div className="app-container">
        {/* 顶部工具栏 */}
        <Toolbar onCustomSave={onSave ? handleSave : undefined} onCustomPrint={onPrint} />

        {/* 主体三栏布局 */}
        <div className="app-body">
          {/* 左侧面板 */}
          <div className={`app-left-panel ${leftCollapsed ? 'collapsed' : ''}`}>
            {leftCollapsed ? (
              <Button
                type="text"
                className="panel-collapsed-trigger"
                icon={<MenuUnfoldOutlined />}
                onClick={() => setLeftCollapsed(false)}
                title="展开左侧面板"
              />
            ) : (
              <>
                <Button
                  type="text"
                  className="panel-collapse-trigger panel-collapse-trigger-left"
                  icon={<MenuFoldOutlined />}
                  onClick={() => setLeftCollapsed(true)}
                  title="折叠左侧面板"
                />
                <LeftPanel />
              </>
            )}
          </div>

          {/* 中间画布 */}
          <Canvas dataSources={resolvedDataSources} />

          {/* 右侧属性面板 */}
          <div className={`app-right-panel ${rightCollapsed ? 'collapsed' : ''}`}>
            {rightCollapsed ? (
              <Button
                type="text"
                className="panel-collapsed-trigger"
                icon={<MenuFoldOutlined />}
                onClick={() => setRightCollapsed(false)}
                title="展开属性面板"
              />
            ) : (
              <>
                <Button
                  type="text"
                  className="panel-collapse-trigger panel-collapse-trigger-right"
                  icon={<MenuUnfoldOutlined />}
                  onClick={() => setRightCollapsed(true)}
                  title="折叠属性面板"
                />
                <PropertyPanel />
              </>
            )}
          </div>
        </div>

        {/* 打印预览弹窗 */}
        <PrintPreview dataSources={resolvedDataSources} />

        {/* 页眉页脚弹窗 */}
        <HeaderFooterDialog />
      </div>
    </AntApp>
  );
};

export default PrintDesigner;
