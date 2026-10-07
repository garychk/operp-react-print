import React, { useState } from 'react';
import { Segmented } from 'antd';
import PrintDesigner from './components/PrintDesigner';
import { DEFAULT_LOCALE, LOCALE_NAMES, SUPPORTED_LOCALES, normalizeLocale, type Locale } from './i18n';

/** 支持通过 ?locale=en-US 直接指定初始语言，方便调试与截图 */
const getInitialLocale = (): Locale =>
  normalizeLocale(new URLSearchParams(window.location.search).get('locale') || DEFAULT_LOCALE);

const App: React.FC = () => {
  const [locale, setLocale] = useState<Locale>(getInitialLocale);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <PrintDesigner locale={locale} />

      {/* 语言切换（仅用于本地开发预览） */}
      <div
        style={{
          position: 'absolute',
          left: 16,
          bottom: 16,
          zIndex: 1000,
          padding: 6,
          borderRadius: 8,
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        <Segmented
          value={locale}
          onChange={(v) => setLocale(v as Locale)}
          options={SUPPORTED_LOCALES.map((l) => ({ label: LOCALE_NAMES[l], value: l }))}
        />
      </div>
    </div>
  );
};

export default App;
