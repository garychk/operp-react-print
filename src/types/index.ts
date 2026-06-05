/* ========== 画布组件类型 ========== */
export type CanvasComponentType = 'text' | 'image' | 'table' | 'barcode' | 'line';

/* ========== 画布上的组件实例 ========== */
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
