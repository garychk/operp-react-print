import React, { useRef, useMemo } from 'react';
import { Modal, Button, Space } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { useReactToPrint } from 'react-to-print';
import { useDesignerStore } from '../store';
import { PAPER_SIZES, MM_TO_PX_RATIO, DEFAULT_GRID_SETTINGS } from '../constants';

const PrintPreview: React.FC = () => {
  const previewVisible = useDesignerStore((s) => s.previewVisible);
  const setPreviewVisible = useDesignerStore((s) => s.setPreviewVisible);
  const components = useDesignerStore((s) => s.components);
  const pageSettings = useDesignerStore((s) => s.pageSettings);
  const gridSettings = useDesignerStore((s) => s.gridSettings) || DEFAULT_GRID_SETTINGS;
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

  /** 简易组件渲染（无交互版本） */
  const renderStaticComponent = (comp: (typeof components)[0]): React.ReactNode => {
    const p = comp.props;
    const baseStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      boxSizing: 'border-box',
    };
    const containerStyle: React.CSSProperties = {
      position: 'absolute',
      left: comp.x * cellSize,
      top: comp.y * cellSize,
      width: comp.w * cellSize,
      height: comp.h * cellSize,
      overflow: 'hidden',
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
              {(p.content as string) || ''}
            </div>
          </div>
        );
      case 'image':
        return (
          <div key={comp.id} style={containerStyle}>
            <div style={baseStyle}>
              {p.src ? (
                <img
                  src={p.src as string}
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
            <table
              style={{
                ...baseStyle,
                borderCollapse: 'collapse',
                width: '100%',
                height: '100%',
              }}
            >
              <tbody>
                {Array.from({ length: (p.rows as number) || 3 }).map((_, r) => (
                  <tr key={r}>
                    {Array.from({ length: (p.cols as number) || 3 }).map((_, c) => (
                      <td
                        key={c}
                        style={{
                          border: `${p.borderWidth || 1}px solid ${p.borderColor || '#000'}`,
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
              *{(p.value as string) || '123456'}*
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
      styles={{ body: { padding: 16, display: 'flex', justifyContent: 'center' } }}
    >
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
