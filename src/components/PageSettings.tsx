import React, { useCallback } from 'react';
import { Card, Select, InputNumber, Radio, Typography } from 'antd';
import { useDesignerStore } from '../store';
import { PaperSizePreset, Orientation } from '../types';
import { PAPER_SIZES } from '../constants';

const { Text } = Typography;

const PageSettings: React.FC = () => {
  const pageSettings = useDesignerStore((s) => s.pageSettings);
  const setPageSettings = useDesignerStore((s) => s.setPageSettings);

  const isCustom = pageSettings.paperSize === 'custom';

  const handlePaperSize = useCallback(
    (val: PaperSizePreset) => {
      setPageSettings({ paperSize: val });
    },
    [setPageSettings],
  );

  const handleOrientation = useCallback(
    (val: Orientation) => {
      setPageSettings({ orientation: val });
    },
    [setPageSettings],
  );

  return (
    <Card
      title="页面设置"
      size="small"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <Text style={{ fontSize: 12 }}>纸张大小</Text>
          <Select
            size="small"
            style={{ width: '100%' }}
            value={pageSettings.paperSize}
            onChange={handlePaperSize}
            options={[
              ...Object.keys(PAPER_SIZES).map((k) => ({ value: k, label: k })),
              { value: 'custom', label: '自定义' },
            ]}
          />
        </div>

        {isCustom && (
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <Text style={{ fontSize: 12 }}>宽度 (mm)</Text>
              <InputNumber
                size="small"
                style={{ width: '100%' }}
                value={pageSettings.customWidth}
                min={10}
                max={2000}
                onChange={(v) => setPageSettings({ customWidth: v ?? 210 })}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Text style={{ fontSize: 12 }}>高度 (mm)</Text>
              <InputNumber
                size="small"
                style={{ width: '100%' }}
                value={pageSettings.customHeight}
                min={10}
                max={2000}
                onChange={(v) => setPageSettings({ customHeight: v ?? 297 })}
              />
            </div>
          </div>
        )}

        <div>
          <Text style={{ fontSize: 12 }}>方向</Text>
          <Radio.Group
            value={pageSettings.orientation}
            onChange={(e) => handleOrientation(e.target.value)}
            size="small"
            style={{ width: '100%', display: 'flex' }}
          >
            <Radio.Button value="portrait" style={{ flex: 1, textAlign: 'center' }}>
              纵向
            </Radio.Button>
            <Radio.Button value="landscape" style={{ flex: 1, textAlign: 'center' }}>
              横向
            </Radio.Button>
          </Radio.Group>
        </div>

        <div>
          <Text style={{ fontSize: 12 }}>页边距 (mm)</Text>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <Text style={{ fontSize: 11 }}>上</Text>
              <InputNumber
                size="small"
                style={{ width: '100%' }}
                value={pageSettings.marginTop}
                min={0}
                max={100}
                onChange={(v) => setPageSettings({ marginTop: v ?? 10 })}
              />
            </div>
            <div>
              <Text style={{ fontSize: 11 }}>右</Text>
              <InputNumber
                size="small"
                style={{ width: '100%' }}
                value={pageSettings.marginRight}
                min={0}
                max={100}
                onChange={(v) => setPageSettings({ marginRight: v ?? 10 })}
              />
            </div>
            <div>
              <Text style={{ fontSize: 11 }}>下</Text>
              <InputNumber
                size="small"
                style={{ width: '100%' }}
                value={pageSettings.marginBottom}
                min={0}
                max={100}
                onChange={(v) => setPageSettings({ marginBottom: v ?? 10 })}
              />
            </div>
            <div>
              <Text style={{ fontSize: 11 }}>左</Text>
              <InputNumber
                size="small"
                style={{ width: '100%' }}
                value={pageSettings.marginLeft}
                min={0}
                max={100}
                onChange={(v) => setPageSettings({ marginLeft: v ?? 10 })}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PageSettings;
