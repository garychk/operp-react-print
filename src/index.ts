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
  TableColumnConfig,
  DataBinding,
  DataBindingConfig,
} from './types';

// 导出工具函数
export {
  getRenderValue,
  getObjectFromDataSource,
  getArrayFromDataSource,
  safeParseJSON,
  getValueByPath,
} from './utils/dataHelper';

// 导出 store hook
export { useDesignerStore } from './store';
