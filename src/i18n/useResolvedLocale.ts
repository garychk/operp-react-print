import { useContext, useEffect, useState } from 'react';
import type { Context } from 'react';
import i18next from 'i18next';
import type { i18n as I18nInstance } from 'i18next';
import { I18nContext, getI18n } from 'react-i18next';
import {
  DEFAULT_LOCALE,
  detectEnvironmentLocale,
  matchLocale,
  normalizeLocale,
  type Locale,
  type LocaleOption,
} from './index';

/** 取出宿主应用的 i18next 实例（不含 React 上下文，读一次即可，无需订阅） */
function resolveHostInstance(): I18nInstance | null {
  // 1) 宿主调用过 i18next.use(initReactI18next).init()
  const registered = getI18n() as I18nInstance | undefined;
  if (registered?.on) return registered;

  // 2) 宿主只调用了 i18next.init()，退回 i18next 全局单例（已初始化才算数）
  const singleton = i18next as unknown as I18nInstance | undefined;
  if (singleton?.isInitialized) return singleton;

  return null;
}

/**
 * 读取宿主应用的 i18next 实例，并在宿主切换语言时触发重渲染。
 *
 * 取值优先级：
 * 1. React 上下文里的实例（宿主使用 `<I18nextProvider>` 的场景）；
 * 2. `initReactI18next` 注册的实例（宿主使用 `i18next.use(initReactI18next).init()` 的场景）；
 * 3. i18next 全局单例（宿主仅 `i18next.init()` 的场景，且已初始化）。
 *
 * 前提：组件库把 i18next / react-i18next 声明为 peerDependency（不重复打包），
 * 这样宿主与组件库指向同一份模块实例，才能读到宿主的语言。
 */
export function useHostI18nInstance(): I18nInstance | null {
  const ctx = useContext(I18nContext as unknown as Context<{ i18n?: I18nInstance } | null>);
  const instance = ctx?.i18n || resolveHostInstance();

  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (!instance?.on) return;
    const onChange = () => forceUpdate((n) => n + 1);
    instance.on('languageChanged', onChange);
    // 宿主可能在组件挂载后才 init，这里一并监听初始化完成
    instance.on('initialized', onChange);
    return () => {
      instance.off('languageChanged', onChange);
      instance.off('initialized', onChange);
    };
  }, [instance]);

  return instance;
}

/**
 * 解析最终生效的界面语言。
 *
 * - 传入具体语言：归一化后直接使用（兼容 'zh' / 'en' / 'zh_CN' 等写法）；
 * - 传入 `'auto'`：按「宿主 i18next 实例 → `<html lang>` → `navigator.language`」顺序探测，
 *   并持续跟随宿主变化（宿主实例的 languageChanged 事件、`<html lang>` 的变更、浏览器语言变化）。
 */
export function useResolvedLocale(locale?: string): Locale {
  const isAuto = locale === 'auto';
  const hostI18n = useHostI18nInstance();
  const hostLocale = isAuto ? matchLocale(hostI18n?.language) : null;

  const [envLocale, setEnvLocale] = useState<Locale | null>(detectEnvironmentLocale);

  useEffect(() => {
    // 宿主实例可用时由 useHostI18nInstance 负责跟随，无需监听 DOM
    if (!isAuto || hostLocale) return;

    const sync = () => setEnvLocale(detectEnvironmentLocale());
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    window.addEventListener('languagechange', sync);
    return () => {
      observer.disconnect();
      window.removeEventListener('languagechange', sync);
    };
  }, [isAuto, hostLocale]);

  if (isAuto) return hostLocale || envLocale || DEFAULT_LOCALE;
  return normalizeLocale(locale);
}

export type { Locale, LocaleOption };
