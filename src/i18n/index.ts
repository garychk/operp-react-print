import { createInstance, type i18n as I18nInstance } from 'i18next';

import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';
import jaJP from './locales/ja-JP';

/** 支持的Locale */
export type Locale = 'zh-CN' | 'en-US' | 'ja-JP';

/** 默认Locale */
export const DEFAULT_LOCALE: Locale = 'zh-CN';

/** 全部支持的Locale列表 */
export const SUPPORTED_LOCALES: Locale[] = ['zh-CN', 'en-US', 'ja-JP'];

/** 各Locale对应的显示名称 */
export const LOCALE_NAMES: Record<Locale, string> = {
  'zh-CN': '简体中文',
  'en-US': 'English',
  'ja-JP': '日本語',
};

/** locale 属性的可取值：具体语言，或 'auto'（自动跟随宿主运行环境） */
export type LocaleOption = Locale | 'auto';

/**
 * 尝试把输入匹配到受支持的 Locale（兼容 zh、zh-CN、zh_cn、zh-Hant、en、ja 等写法）。
 * 匹配不到返回 null，不做兜底 —— 供「自动探测」按优先级逐个候选源尝试。
 */
export function matchLocale(locale?: string | null): Locale | null {
  if (!locale) return null;
  const lower = locale.toLowerCase().replace(/_/g, '-');
  const primary = lower.split('-')[0];
  return (
    SUPPORTED_LOCALES.find(
      (l) => l.toLowerCase() === lower || l.toLowerCase().split('-')[0] === primary,
    ) || null
  );
}

/** 归一化外部传入的 locale（兼容 zh、zh-CN、zh_cn、en、ja 等写法），匹配不到时回退默认语言 */
export function normalizeLocale(locale?: string | null): Locale {
  return matchLocale(locale) || DEFAULT_LOCALE;
}

/**
 * 从运行环境（DOM / 浏览器）探测语言，作为宿主 i18next 实例不可用时的兜底：
 * `<html lang>` → `navigator.language` → `navigator.languages`。
 */
export function detectEnvironmentLocale(): Locale | null {
  if (typeof document !== 'undefined') {
    const fromHtml = matchLocale(document.documentElement?.lang);
    if (fromHtml) return fromHtml;
  }
  if (typeof navigator !== 'undefined') {
    const candidates = [navigator.language, ...(navigator.languages || [])];
    for (const item of candidates) {
      const matched = matchLocale(item);
      if (matched) return matched;
    }
  }
  return null;
}

/** 内联资源（无需异步加载，组件库开箱即用） */
const resources = {
  'zh-CN': { translation: zhCN },
  'en-US': { translation: enUS },
  'ja-JP': { translation: jaJP },
};

/**
 * 同步初始化选项。
 *
 * 组件库把 i18next 声明为 peerDependency（与宿主共用同一份实例），因此需要兼容不同大版本：
 * v23+ 叫 `initAsync`，v22 及更早叫 `initImmediate`，两个都传以避免异步初始化导致首帧拿不到文案。
 */
const syncInitOptions = {
  initAsync: false,
  initImmediate: false,
};

/**
 * 组件库独立 i18n 实例。
 *
 * 使用 `createInstance` 而不是 i18next 的默认单例，避免污染宿主应用自己的 i18next 实例。
 * 组件内部通过 `<I18nextProvider i18n={printDesignerI18n}>` 使用该实例。
 *
 * 注意：这里【不能】调用 `.use(initReactI18next)` —— 那会把本实例注册为 react-i18next 的
 * 全局实例（`setI18n`），导致宿主未初始化 i18n 时 `getI18n()` 读到组件库自己，
 * 干扰 `locale="auto"` 对宿主语言的探测。组件内部统一由 I18nextProvider 提供实例。
 */
export const printDesignerI18n: I18nInstance = createInstance();

printDesignerI18n.init({
  // 内联资源同步初始化，确保首帧渲染即可拿到文案
  ...syncInitOptions,
  resources,
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  supportedLngs: SUPPORTED_LOCALES,
  // 语言包使用平铺键值对（如 'toolbar.new'），因此关闭层级分隔符
  keySeparator: false,
  nsSeparator: false,
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
  returnEmptyString: false,
  react: {
    useSuspense: false,
  },
});

/** 非 React 模块（store / constants）中使用的翻译函数 */
export const t: typeof printDesignerI18n.t = printDesignerI18n.t.bind(printDesignerI18n);

export default printDesignerI18n;
