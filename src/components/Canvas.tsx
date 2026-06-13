import React, { useCallback, useMemo } from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useDesignerStore } from '../store';
import { CanvasComponent as CanvasComp, CanvasComponentType, DataSource, DataBindingConfig } from '../types';
import { PAPER_SIZES, MM_TO_PX_RATIO } from '../constants';
import Barcode from './Barcode';
import QRCode from './QRCode';
import { formatRenderValue, getRenderValue, getObjectFromDataSource, getArrayFromDataSource } from '../utils/dataHelper';

// 类型断言解决 react-grid-layout 类型兼容问题
const GridLayoutComponent = GridLayout as any;

/** 单个画布组件渲染 */
const RenderComponent: React.FC<{
  comp: CanvasComp;
  selected: boolean;
  isPreview?: boolean;
  dataSources?: DataSource[];
}> = React.memo(({ comp, selected, isPreview = false, dataSources = [] }) => {
  const style: React.CSSProperties = {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    boxSizing: 'border-box',
    outline: isPreview ? 'none' : (selected ? '2px solid #1677ff' : '1px dashed #d9d9d9'),
    outlineOffset: -1,
  };

  // 辅助函数：获取组件属性的绑定值
  const getBoundValue = (propName: string): string => {
    return getRenderValue(comp, propName, dataSources);
  };

  switch (comp.type) {
    case 'text':
      return (
        <div
          style={{
            ...style,
            fontSize: (comp.props.fontSize as number) || 14,
            fontWeight: (comp.props.fontWeight as React.CSSProperties['fontWeight']) || 'normal',
            fontStyle: (comp.props.fontStyle as React.CSSProperties['fontStyle']) || 'normal',
            textAlign: (comp.props.textAlign as React.CSSProperties['textAlign']) || 'left',
            color: (comp.props.color as string) || '#000',
            backgroundColor: (comp.props.backgroundColor as string) || 'transparent',
            padding: 4,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {formatRenderValue(getBoundValue('content') || '', comp.props.format as string)}
        </div>
      );
    case 'image':
      const imageSrc = getBoundValue('src') || (comp.props.src as string);
      return (
        <div style={style}>
          {imageSrc ? (
            <img
              src={imageSrc}
              style={{
                width: '100%',
                height: '100%',
                objectFit: (comp.props.fit as React.CSSProperties['objectFit']) || 'contain',
              }}
              alt=""
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#bbb',
                fontSize: 12,
              }}
            >
              请在属性中设置图片地址
            </div>
          )}
        </div>
      );
    case 'table':
      return <TableRenderer comp={comp} style={style} dataSources={dataSources} />;
    case 'barcode':
      const barcodeValue = getBoundValue('value') || (comp.props.value as string) || '123456';
      return (
        <div
          style={{
            ...style,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 4,
          }}
        >
          <Barcode
            value={barcodeValue}
            format={(comp.props.format as string) || 'CODE128'}
          />
        </div>
      );
    case 'qrcode':
      const qrcodeValue = getBoundValue('value') || (comp.props.value as string) || 'https://example.com';
      return (
        <div
          style={{
            ...style,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 4,
          }}
        >
          <QRCode
            value={qrcodeValue}
            errorLevel={(comp.props.errorLevel as 'L' | 'M' | 'Q' | 'H') || 'M'}
            color={(comp.props.color as string) || '#000000'}
            backgroundColor={(comp.props.backgroundColor as string) || '#ffffff'}
          />
        </div>
      );
      case 'line':
        return (
          <div
            style={{
              ...style,
              display: 'flex',
              alignItems: 'center',
              border: 'none',
              outline: selected ? '2px solid #1677ff' : '1px dashed transparent',
            }}
          >
            <hr
              style={{
                width: '100%',
                border: 'none',
                borderTop: `${comp.props.thickness || 1}px ${comp.props.style || 'solid'} ${comp.props.color || '#000'}`,
                margin: 0,
              }}
            />
          </div>
        );
      default:
        return <div style={style}>{comp.type}</div>;
    }
  },
);

/** 简易表格渲染 */
const TableRenderer: React.FC<{ comp: CanvasComp; style: React.CSSProperties; dataSources?: DataSource[] }> = ({ comp, style, dataSources = [] }) => {
  const borderWidth = (comp.props.borderWidth as number) || 1;
  const borderColor = (comp.props.borderColor as string) || '#000';
  const headerBackgroundColor = (comp.props.headerBackgroundColor as string) || '#f5f5f5';
  const headerColor = (comp.props.headerColor as string) || '#000000';
  const headerFontSize = (comp.props.headerFontSize as number) || 12;
  const tableColumns = comp.tableColumns || [];
  
  // 尝试查找绑定的数组数据源
  const dataSourceId = comp.props.tableDataSourceId as string | undefined;
  const selectedDs = dataSourceId ? dataSources.find(d => d.id === dataSourceId) : null;
  const tableData = selectedDs ? getArrayFromDataSource(selectedDs) : null;
  
  // 如果有数组数据源，则渲染动态数据
  if (tableData && tableData.length > 0) {
    return (
      <table
        style={{
          ...style,
          borderCollapse: 'collapse',
          width: '100%',
          height: '100%',
        }}
      >
        {/* 表头 */}
        {tableColumns.length > 0 && (
          <thead>
            <tr style={{ backgroundColor: headerBackgroundColor }}>
              {tableColumns.map((col, i) => (
                <th
                  key={i}
                  style={{
                    border: `${borderWidth}px solid ${borderColor}`,
                    padding: 4,
                    fontSize: headerFontSize,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: headerColor,
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
          {tableData.map((row, r) => (
            <tr key={r}>
              {tableColumns.map((col, c) => (
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
  const cols = Math.max((comp.props.cols as number) || 3, tableColumns.length || 3);

  return (
    <table
      style={{
        ...style,
        borderCollapse: 'collapse',
        width: '100%',
        height: '100%',
      }}
    >
      <tbody>
        {Array.from({ length: rows }).map((_, r) => (
          <tr key={r}>
            {Array.from({ length: cols }).map((_, c) => (
              <td
                key={c}
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

const Canvas: React.FC<{ isPreview?: boolean; dataSources?: DataSource[] }> = ({ isPreview = false, dataSources: dataSourcesProp }) => {
  const components = useDesignerStore((s) => s.components);
  const selectedId = useDesignerStore((s) => s.selectedId);
  const pageSettings = useDesignerStore((s) => s.pageSettings);
  const selectComponent = useDesignerStore((s) => s.selectComponent);
  const updateComponent = useDesignerStore((s) => s.updateComponent);
  const setComponents = useDesignerStore((s) => s.setComponents);
  const addComponent = useDesignerStore((s) => s.addComponent);
  const gridSettings = useDesignerStore((s) => s.gridSettings);
  const storeDataSources = useDesignerStore((s) => s.dataSources);
  const dataSources = dataSourcesProp || storeDataSources;

  // 计算纸张像素尺寸
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

  // 边距像素
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
  const canvasH = pagePixel.height - marginPx.top - marginPx.bottom;

  const layout: Layout[] = useMemo(
    () =>
      components.map((c) => ({
        i: c.id,
        x: c.x,
        y: c.y,
        w: c.w,
        h: c.h,
      })),
    [components],
  );

  const handleLayoutChange = useCallback(
    (newLayout: Layout[]) => {
      const updated = components.map((comp, i) => {
        const l = newLayout[i];
        if (!l) return comp;
        return { ...comp, x: l.x, y: l.y, w: l.w, h: l.h };
      });
      setComponents(updated);
    },
    [components, setComponents],
  );

  const handleDrop = useCallback(
    (layout: Layout[], item: Layout, e: Event) => {
      const de = e as DragEvent;
      const compType = de.dataTransfer?.getData('componentType') as CanvasComponentType | undefined;
      if (!compType) return;
      // 计算放置的网格位置
      const rect = (e.target as HTMLElement).closest('.react-grid-layout')?.getBoundingClientRect();
      if (rect) {
        const gridX = Math.floor((de.clientX - rect.left) / (canvasW / gridSettings.cols));
        const gridY = Math.floor((de.clientY - rect.top) / (canvasW / gridSettings.cols));
        addComponent(compType, Math.max(0, gridX), Math.max(0, gridY));
      } else {
        addComponent(compType);
      }
    },
    [addComponent, canvasW, gridSettings.cols],
  );

  const handleSelect = useCallback(
    (id: string) => {
      selectComponent(id === selectedId ? null : id);
    },
    [selectComponent, selectedId],
  );

  return (
    <div
      style={{
        flex: 1,
        overflow: 'auto',
        background: '#e8e8e8',
        display: 'flex',
        justifyContent: 'center',
        padding: '24px 0',
      }}
    >
      {/* 纸张容器 */}
      <div
        id="print-paper"
        style={{
          width: pagePixel.width,
          height: pagePixel.height,
          background: '#fff',
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          position: 'relative',
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
              color: '#999',
              borderBottom: '1px dashed #ddd',
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
              color: '#999',
              borderTop: '1px dashed #ddd',
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
        {/* 网格画布 */}
        <div
          style={{
            position: 'absolute',
            top: marginPx.top,
            left: marginPx.left,
            width: canvasW,
            height: canvasH,
          }}
        >
          {isPreview ? (
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              {components.map((comp) => {
                // 计算网格单元尺寸
                const cellW = canvasW / gridSettings.cols;
                const cellH = canvasW / gridSettings.cols;
                
                const style: React.CSSProperties = {
                  position: 'absolute',
                  left: comp.x * cellW,
                  top: comp.y * cellH,
                  width: comp.w * cellW,
                  height: comp.h * cellH,
                };
                
                return (
                  <div key={comp.id} style={style}>
                    <RenderComponent comp={comp} selected={false} isPreview dataSources={dataSources} />
                  </div>
                );
              })}
            </div>
          ) : (
            <GridLayoutComponent
              className="canvas-grid"
              layout={layout}
              cols={gridSettings.cols}
              rowHeight={canvasW / gridSettings.cols}
              width={canvasW}
              margin={[0, 0]}
              containerPadding={[0, 0]}
              onLayoutChange={handleLayoutChange}
              onDrop={handleDrop}
              isDroppable
              isResizable
              isDraggable
              compactType={null}
              preventCollision
              draggableHandle=".grid-item-drag-handle"
              style={{ minHeight: canvasH }}
            >
              {components.map((comp) => (
                <div
                  key={comp.id}
                  className="grid-item-drag-handle"
                  onClick={() => handleSelect(comp.id)}
                  style={{ cursor: 'move' }}
                >
                  <RenderComponent comp={comp} selected={comp.id === selectedId} dataSources={dataSources} />
                </div>
              ))}
            </GridLayoutComponent>
          )}
        </div>
      </div>
    </div>
  );
};

export default Canvas;
