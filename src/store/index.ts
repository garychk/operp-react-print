import { create } from 'zustand';
import {
  CanvasComponent,
  CanvasComponentType,
  PageSettings,
  GridSettings,
  TemplateData,
  DataSource,
  TableColumnConfig,
} from '../types';
import {
  createDefaultPageSettings,
  createComponentDefaults,
  getComponentTypeLabel,
  DEFAULT_GRID_SETTINGS,
} from '../constants';
import { t, printDesignerI18n, SUPPORTED_LOCALES } from '../i18n';

let nextId = 0;
let dataSourceNextId = 0;
function generateId(): string {
  return `comp_${++nextId}`;
}
function generateDataSourceId(): string {
  return `ds_${++dataSourceNextId}`;
}

/**
 * 判断某值是否仍是任一语言下的默认种子文案。
 * 用于语言切换时同步默认文案，同时避免覆盖用户已经手动修改过的内容。
 */
function isSeedValue(value: string, key: string): boolean {
  if (!value) return true;
  return SUPPORTED_LOCALES.some((lng) => {
    const bundle = printDesignerI18n.getResourceBundle(lng, 'translation') as
      | Record<string, string>
      | undefined;
    return bundle?.[key] === value;
  });
}

export interface DesignerStore {
  // 画布组件列表
  components: CanvasComponent[];
  // 当前选中的组件ID
  selectedId: string | null;
  // 页面设置
  pageSettings: PageSettings;
  // 网格设置
  gridSettings: GridSettings;
  // 预览模式
  previewVisible: boolean;
  // 模板名称
  templateName: string;
  // 页眉页脚弹窗
  headerFooterVisible: boolean;
  // 数据源列表
  dataSources: DataSource[];
  // 当前预览时选中使用的数据源 ID（用于表格）
  activeDataSourceId: string | null;

  // 操作
  /** 添加组件。label 用于覆盖默认展示文案（多语言场景由调用方传入已翻译文本） */
  addComponent: (type: CanvasComponentType, x?: number, y?: number, label?: string) => void;
  updateComponent: (id: string, props: Partial<CanvasComponent>) => void;
  selectComponent: (id: string | null) => void;
  removeComponent: (id: string) => void;
  setComponents: (components: CanvasComponent[]) => void;
  setPageSettings: (settings: Partial<PageSettings>) => void;
  setPreviewVisible: (visible: boolean) => void;
  setTemplateName: (name: string) => void;
  setHeaderFooterVisible: (visible: boolean) => void;
  // 数据源操作
  addDataSource: (name: string, type: 'object' | 'array', data: string) => void;
  updateDataSource: (id: string, updates: Partial<Omit<DataSource, 'id' | 'createdAt'>>) => void;
  removeDataSource: (id: string) => void;
  setActiveDataSourceId: (id: string | null) => void;
  // 表格列配置操作
  updateComponentTableColumns: (compId: string, columns: TableColumnConfig[]) => void;
  /** 获取导出用的模板 JSON 字符串 */
  exportJSON: () => string;
  /**
   * 从 JSON 字符串导入模板。
   * 返回 null 表示成功；返回字符串表示失败，该字符串为语言无关的错误码（如 'error.invalidTemplate'），
   * 由调用方通过 i18n 翻译后展示。
   */
  importJSON: (jsonStr: string) => string | null;
  /** 重置整个设计 */
  reset: () => void;
  /**
   * 按当前语言刷新默认种子文案（模板名、页眉/页脚/页码格式）。
   * 仅当对应值仍是任一语言的默认种子文案（或为空）时才会更新，
   * 用户手动修改过的内容不受影响。在 locale 变化时由 PrintDesigner 调用。
   */
  reseedLocalizedDefaults: () => void;
}

export const useDesignerStore = create<DesignerStore>((set, get) => ({
  components: [],
  selectedId: null,
  pageSettings: createDefaultPageSettings(),
  gridSettings: { ...DEFAULT_GRID_SETTINGS },
  previewVisible: false,
  templateName: t('seed.templateName'),
  headerFooterVisible: false,
  dataSources: [],
  activeDataSourceId: null,

  addComponent: (type, x, y, label) => {
    const id = generateId();
    const typeLabel = label ?? getComponentTypeLabel(type);
    const defaults = createComponentDefaults(type);
    if (type === 'text') {
      defaults.content = typeLabel;
    }
    const newComp: CanvasComponent = {
      id,
      type,
      x: x ?? 0,
      y: y ?? 0,
      w: type === 'line' ? 20 : type === 'qrcode' ? 12 : 15,
      h: type === 'line' ? 1 : type === 'qrcode' ? 12 : 8,
      props: defaults,
      ...(type === 'table'
        ? {
            tableColumns: [
              { title: t('property.columnDefault', { index: 1 }) },
              { title: t('property.columnDefault', { index: 2 }) },
              { title: t('property.columnDefault', { index: 3 }) },
            ],
          }
        : {}),
    };
    set((s) => ({
      components: [...s.components, newComp],
      selectedId: id,
    }));
  },

  updateComponent: (id, props) => {
    set((s) => ({
      components: s.components.map((c) =>
        c.id === id ? { ...c, ...props } : c,
      ),
    }));
  },

  selectComponent: (id) => {
    set({ selectedId: id });
  },

  removeComponent: (id) => {
    set((s) => ({
      components: s.components.filter((c) => c.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
    }));
  },

  setComponents: (components) => {
    set({ components });
  },

  setPageSettings: (settings) => {
    set((s) => ({
      pageSettings: { ...s.pageSettings, ...settings },
    }));
  },

  setPreviewVisible: (visible) => {
    set({ previewVisible: visible });
  },

  setTemplateName: (name) => {
    set({ templateName: name });
  },

  setHeaderFooterVisible: (visible) => {
    set({ headerFooterVisible: visible });
  },

  // ========== 数据源管理 ==========
  addDataSource: (name, type, data) => {
    const id = generateDataSourceId();
    const newDs: DataSource = {
      id,
      name,
      type,
      data,
      createdAt: Date.now(),
    };
    set((s) => ({
      dataSources: [...s.dataSources, newDs],
    }));
  },

  updateDataSource: (id, updates) => {
    set((s) => ({
      dataSources: s.dataSources.map((ds) =>
        ds.id === id ? { ...ds, ...updates } : ds,
      ),
    }));
  },

  removeDataSource: (id) => {
    set((s) => ({
      dataSources: s.dataSources.filter((ds) => ds.id !== id),
      activeDataSourceId: s.activeDataSourceId === id ? null : s.activeDataSourceId,
    }));
  },

  setActiveDataSourceId: (id) => {
    set({ activeDataSourceId: id });
  },

  // ========== 表格列配置管理 ==========
  updateComponentTableColumns: (compId, columns) => {
    set((s) => ({
      components: s.components.map((c) =>
        c.id === compId ? { ...c, tableColumns: columns } : c,
      ),
    }));
  },

  exportJSON: () => {
    const s = get();
    const data: TemplateData = {
      version: '1.0',
      templateName: s.templateName,
      pageSettings: s.pageSettings,
      components: s.components.map(({ id, ...rest }) => rest),
      dataSources: s.dataSources.map(({ id, ...rest }) => rest),
    };
    return JSON.stringify(data, null, 2);
  },

  importJSON: (jsonStr) => {
    try {
      const data = JSON.parse(jsonStr) as TemplateData;
      if (!data.version || !data.pageSettings || !Array.isArray(data.components)) {
        return 'error.invalidTemplate';
      }
      // 重新分配 ID
      nextId = 0;
      dataSourceNextId = 0;
      const components: CanvasComponent[] = data.components.map((c) => ({
        ...c,
        id: generateId(),
      }));
      const dataSources: DataSource[] = (data.dataSources || []).map((ds) => ({
        ...ds,
        id: generateDataSourceId(),
      }));
      set({
        components,
        dataSources,
        pageSettings: data.pageSettings,
        templateName: data.templateName || t('seed.importedTemplateName'),
        selectedId: null,
        activeDataSourceId: null,
      });
      return null;
    } catch {
      return 'error.parseFailed';
    }
  },

  reset: () => {
    nextId = 0;
    dataSourceNextId = 0;
    set({
      components: [],
      selectedId: null,
      pageSettings: createDefaultPageSettings(),
      gridSettings: { ...DEFAULT_GRID_SETTINGS },
      templateName: t('seed.templateName'),
      headerFooterVisible: false,
      previewVisible: false,
      dataSources: [],
      activeDataSourceId: null,
    });
  },

  reseedLocalizedDefaults: () => {
    const s = get();
    const updates: Partial<DesignerStore> = {};

    if (isSeedValue(s.templateName, 'seed.templateName')) {
      updates.templateName = t('seed.templateName');
    }

    const ps: Partial<PageSettings> = {};
    if (isSeedValue(s.pageSettings.headerContent, 'seed.headerContent')) {
      ps.headerContent = t('seed.headerContent');
    }
    if (isSeedValue(s.pageSettings.footerContent, 'seed.footerContent')) {
      ps.footerContent = t('seed.footerContent');
    }
    if (isSeedValue(s.pageSettings.pageNumberFormat, 'seed.pageNumberFormat')) {
      ps.pageNumberFormat = t('seed.pageNumberFormat');
    }
    if (Object.keys(ps).length > 0) {
      updates.pageSettings = { ...s.pageSettings, ...ps };
    }

    if (Object.keys(updates).length > 0) {
      set(updates);
    }
  },
}));
