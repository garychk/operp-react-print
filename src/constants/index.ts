import { PaperSizePreset, CanvasComponentType } from '../types';
import { t } from '../i18n';

/** 纸张预设尺寸 - 宽高 mm (portrait) */
export const PAPER_SIZES: Record<Exclude<PaperSizePreset, 'custom'>, { width: number; height: number }> = {
  A4: { width: 210, height: 297 },
  A3: { width: 297, height: 420 },
  A5: { width: 148, height: 210 },
  Letter: { width: 215.9, height: 279.4 },
  Legal: { width: 215.9, height: 355.6 },
};

/**
 * 创建默认页面设置。
 *
 * 以函数形式提供，保证页眉/页脚/页码等种子文案随当前语言实时生成，
 * 而不是在模块加载时被固定成某一种语言。
 */
export function createDefaultPageSettings() {
  return {
    paperSize: 'A4' as PaperSizePreset,
    customWidth: 210,
    customHeight: 297,
    orientation: 'portrait' as const,
    marginTop: 10,
    marginRight: 10,
    marginBottom: 10,
    marginLeft: 10,
    showHeader: false,
    headerContent: t('seed.headerContent'),
    showFooter: false,
    footerContent: t('seed.footerContent'),
    showPageNumber: true,
    pageNumberFormat: t('seed.pageNumberFormat'),
  };
}

/** 缩放系数: 1mm 对应的像素 */
export const MM_TO_PX_RATIO = 3;

/** 默认网格设置 */
export const DEFAULT_GRID_SETTINGS = {
  cellSize: 1,
  cols: 100,
};

/** 获取组件类型名称（跟随当前语言） */
export function getComponentTypeLabel(type: CanvasComponentType | string): string {
  const key = `component.${type}`;
  const label = t(key);
  return label === key ? type : label;
}

/** 创建组件类型默认属性（跟随当前语言） */
export function createComponentDefaults(type: CanvasComponentType): Record<string, unknown> {
  const defaults: Record<CanvasComponentType, Record<string, unknown>> = {
    text: {
      content: t('component.defaultText'),
      fontSize: 14,
      fontWeight: 'normal' as const,
      fontStyle: 'normal' as const,
      textAlign: 'left' as const,
      color: '#000000',
      backgroundColor: 'transparent',
      format: '',
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
      headerBackgroundColor: '#f5f5f5',
      headerColor: '#000000',
      headerFontSize: 12,
      content: '',
    },
    barcode: {
      value: '1234567890',
      format: 'CODE128' as const,
      content: '',
    },
    qrcode: {
      value: 'https://example.com',
      errorLevel: 'M' as const,
      color: '#000000',
      backgroundColor: '#ffffff',
      content: '',
    },
    line: {
      color: '#000000',
      thickness: 1,
      style: 'solid' as const,
      content: '',
    },
  };
  return { ...defaults[type] };
}
