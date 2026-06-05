/* ========== 画布组件类型 ========== */
export type CanvasComponentType = 'text' | 'image' | 'table' | 'barcode' | 'line';

/* ========== 数据绑定类型 ========== */
export interface DataBinding {
  /** 绑定的数据源 ID */
  dataSourceId?: string;
  /** 绑定的字段路径（支持点号，如 user.name） */
  fieldPath?: string;
  /** 原始静态值（当未绑定数据时使用） */
  staticValue: string;
}

/* ========== 表格列配置 ========== */
export interface TableColumnConfig {
  /** 列标题 */
  title: string;
  /** 绑定的字段路径 */
  fieldPath?: string;
  /** 列宽（可选） */
  width?: number;
}

/* ========== 画布上的组件实例（更新版本） ========== */
export interface CanvasComponent {
  id: string;
  type: CanvasComponentType;
  /** 在 react-grid-layout 中的网格单位 */
  x: number;
  y: number;
  w: number;
  h: number;
  /** 组件自定义属性 */
  props: Record<string, unknown>;
  /** 表格组件专用：列配置 */
  tableColumns?: TableColumnConfig[];
}

/* ========== 数据源类型 ========== */
export type DataSourceType = 'object' | 'array';

export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  /** JSON 字符串存储 */
  data: string;
  /** 创建时间戳 */
  createdAt: number;
}

/* ========== 纸张尺寸预设 ========== */
export type PaperSizePreset = 'A4' | 'A3' | 'A5' | 'Letter' | 'Legal' | 'custom';

/* ========== 纸张方向 ========== */
export type Orientation = 'portrait' | 'landscape';

/* ========== 页面设置 ========== */
export interface PageSettings {
  paperSize: PaperSizePreset;
  /** 自定义纸张 - mm */
  customWidth: number;
  customHeight: number;
  orientation: Orientation;
  /** 页边距 - mm */
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  /** 是否显示页眉 */
  showHeader: boolean;
  /** 页眉内容 */
  headerContent: string;
  /** 是否显示页脚 */
  showFooter: boolean;
  /** 页脚内容 */
  footerContent: string;
  /** 是否显示页码 */
  showPageNumber: boolean;
  /** 页码格式，{page} 替换为当前页 */
  pageNumberFormat: string;
}

/* ========== 网格设置 ========== */
export interface GridSettings {
  /** 每格像素大小 */
  cellSize: number;
  /** 列数 */
  cols: number;
}

/* ========== 模板数据（导出/导入 JSON 格式） ========== */
export interface TemplateData {
  version: string;
  templateName: string;
  pageSettings: PageSettings;
  components: Omit<CanvasComponent, 'id'>[];
  dataSources: Omit<DataSource, 'id'>[];
}
