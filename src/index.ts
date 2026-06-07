// 导出主要组件
export { default as PrintDesigner } from './components/PrintDesigner';

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

// 导入全局样式（用户需要在入口文件导入）
export { default as AppStyles } from './App.css';

// 导入组件样式（react-grid-layout 需要）
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
