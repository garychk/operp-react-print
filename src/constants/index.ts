import { PaperSizePreset } from '../types';

/** 纸张预设尺寸 - 宽高 mm (portrait) */
export const PAPER_SIZES: Record<Exclude<PaperSizePreset, 'custom'>, { width: number; height: number }> = {
  A4: { width: 210, height: 297 },
  A3: { width: 297, height: 420 },
  A5: { width: 148, height: 210 },
  Letter: { width: 215.9, height: 279.4 },
  Legal: { width: 215.9, height: 355.6 },
};

/** 默认页面设置 */
export const DEFAULT_PAGE_SETTINGS = {
  paperSize: 'A4' as PaperSizePreset,
  customWidth: 210,
  customHeight: 297,
  orientation: 'portrait' as const,
  marginTop: 10,
  marginRight: 10,
  marginBottom: 10,
  marginLeft: 10,
  showHeader: false,
  headerContent: '页眉文字',
  showFooter: false,
  footerContent: '页脚文字',
  showPageNumber: true,
  pageNumberFormat: '第 {page} 页',
};

/** 缩放系数: 1mm 对应的像素 */
export const MM_TO_PX_RATIO = 3;

/** 默认网格设置 */
export const DEFAULT_GRID_SETTINGS = {
  cellSize: 1,
  cols: 100,
};

/** 组件类型中文名 */
export const COMPONENT_TYPE_LABELS: Record<string, string> = {
  text: '文本',
  image: '图片',
  table: '表格',
  barcode: '条形码',
  line: '分割线',
};

/** 组件类型默认属性 */
export const COMPONENT_DEFAULTS = {
  text: {
    content: '双击编辑文字',
    fontSize: 14,
    fontWeight: 'normal' as const,
    fontStyle: 'normal' as const,
    textAlign: 'left' as const,
    color: '#000000',
    backgroundColor: 'transparent',
  },
  image: {
    src: '',
    fit: 'contain' as const,
    content: '',
  },
  table: {
    rows: 3,
    cols: 3,
    borderWidth: 1,
    borderColor: '#000000',
    content: '',
  },
  barcode: {
    value: '1234567890',
    format: 'CODE128' as const,
    content: '',
  },
  line: {
    color: '#000000',
    thickness: 1,
    style: 'solid' as const,
    content: '',
  },
};
