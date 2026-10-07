// 默认导出，方便用户使用 import PrintDesigner from 'operp-print-designer'
import PrintDesigner from './components/PrintDesigner';
export default PrintDesigner;

// 命名导出
export { PrintDesigner };

// 导出类型定义
export type { PrintDesignerProps } from './components/PrintDesigner';

export type {
  CanvasComponent,
  CanvasComponentType,
  PageSettings,
  GridSettings,
  TemplateData,
  DataSource,
  DataSourceType,
  PrintDesignerDataSource,
  TableColumnConfig,
  DataBinding,
  DataBindingConfig,
} from './types';

// 导出工具函数
export {
  getRenderValue,
  getObjectFromDataSource,
  getArrayFromDataSource,
  formatRenderValue,
  safeParseJSON,
  getValueByPath,
} from './utils/dataHelper';

// 导出 store hook
export { useDesignerStore } from './store';

// 导出 i18n 实例与多语言相关工具（便于宿主应用读取/扩展语言包）
export {
  printDesignerI18n,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  LOCALE_NAMES,
  matchLocale,
  normalizeLocale,
  detectEnvironmentLocale,
} from './i18n';
export type { Locale, LocaleOption } from './i18n';

// 导出语言解析 hook（宿主自定义语言来源时可直接复用）
export { useResolvedLocale, useHostI18nInstance } from './i18n/useResolvedLocale';
