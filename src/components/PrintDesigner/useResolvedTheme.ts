import { useEffect, useState } from 'react';

export type PrintDesignerTheme = 'light' | 'dark' | 'auto';

/**
 * 读取宿主应用暴露在 <html> 上的暗色标记。
 * 约定：宿主（如 supabase-erp 的 ProLayout）切换深浅模式时，
 * 会在 documentElement 上同步设置 data-erp-dark="true|false"。
 */
const getHostDark = (): boolean | null => {
  if (typeof document === 'undefined') return null;
  const attr = document.documentElement.getAttribute('data-erp-dark');
  if (attr === 'true') return true;
  if (attr === 'false') return false;
  return null;
};

const getSystemDark = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-color-scheme: dark)').matches;

/**
 * 把 theme 属性解析成最终是否为暗色。
 *
 * - 'light' / 'dark'：固定值；
 * - 'auto'（默认）：优先跟随宿主的 data-erp-dark 标记（MutationObserver 实时响应切换），
 *   宿主未标记时退回系统 prefers-color-scheme。
 */
export function useResolvedDarkMode(theme: PrintDesignerTheme): boolean {
  const [hostDark, setHostDark] = useState<boolean | null>(getHostDark);
  const [systemDark, setSystemDark] = useState<boolean>(getSystemDark);

  useEffect(() => {
    if (theme !== 'auto') return;

    // 跟随宿主 <html data-erp-dark> 的变化
    setHostDark(getHostDark());
    const observer = new MutationObserver(() => setHostDark(getHostDark()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-erp-dark'],
    });

    // 宿主未标记时跟随系统深浅色
    if (typeof window.matchMedia === 'function') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const onMediaChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
      media.addEventListener('change', onMediaChange);
      return () => {
        observer.disconnect();
        media.removeEventListener('change', onMediaChange);
      };
    }

    return () => observer.disconnect();
  }, [theme]);

  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  return hostDark ?? systemDark;
}
