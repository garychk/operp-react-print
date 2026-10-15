import React from 'react';
import { useTranslation } from 'react-i18next';
import { QRCode as AntQRCode } from 'antd';

interface QRCodeProps {
  value: string;
  errorLevel?: 'L' | 'M' | 'Q' | 'H';
  color?: string;
  backgroundColor?: string;
}

const QRCode: React.FC<QRCodeProps> = ({
  value,
  errorLevel = 'M',
  color = '#000000',
  backgroundColor = '#ffffff',
}) => {
  const { t } = useTranslation();
  if (!value) {
    return <div style={{ fontSize: 11, color: 'var(--pd-muted-text, #999)' }}>{t('component.qrcodeHint')}</div>;
  }

  return (
    <AntQRCode
      value={value}
      type="svg"
      bordered={false}
      errorLevel={errorLevel}
      color={color}
      bgColor={backgroundColor}
      style={{
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        maxHeight: '100%',
      }}
    />
  );
};

export default QRCode;
