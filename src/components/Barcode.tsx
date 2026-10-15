import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/** 简易条形码渲染组件（使用Canvas绘制） */
interface BarcodeProps {
  value: string;
  format: string; // CODE128, CODE39
}

/** 生成 CODE128 的简单条形码图案 */
function encodeBarcode(value: string): number[] {
  // 简易条形码编码：每个字符转为对应的条空序列
  // 这里使用简单的模拟条形码模式
  const pattern: number[] = [];
  // 起始符
  pattern.push(1, 1, 0, 1, 1, 0, 1, 1);
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i) % 103;
    const bits = code.toString(2).padStart(7, '0');
    for (const b of bits) {
      pattern.push(b === '1' ? 1 : 0);
    }
  }
  // 停止符
  pattern.push(1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1);
  return pattern;
}

const Barcode: React.FC<BarcodeProps> = ({ value, format }) => {
  const { t } = useTranslation();
  const pattern = useMemo(() => {
    if (format === 'CODE128') {
      return encodeBarcode(value);
    }
    return encodeBarcode(value);
  }, [value, format]);

  if (!value) {
    return <div style={{ fontSize: 11, color: 'var(--pd-muted-text, #999)' }}>{t('component.barcodeHint')}</div>;
  }

  const barWidth = 2;
  const barHeight = 44;
  const totalWidth = pattern.length * barWidth;

  return (
    <div style={{ textAlign: 'center', overflow: 'hidden', maxWidth: '100%' }}>
      <canvas
        ref={(el) => {
          if (!el) return;
          const ctx = el.getContext('2d');
          if (!ctx) return;
          el.width = totalWidth;
          el.height = barHeight;
          ctx.clearRect(0, 0, totalWidth, barHeight);
          pattern.forEach((bit, i) => {
            ctx.fillStyle = bit === 1 ? '#000' : '#fff';
            ctx.fillRect(i * barWidth, 0, barWidth, barHeight);
          });
        }}
        style={{ width: '100%', maxWidth: totalWidth, height: barHeight }}
      />
      <div style={{ fontSize: 10, marginTop: 1, letterSpacing: 1 }}>{value}</div>
    </div>
  );
};

export default Barcode;
