import { create } from 'zustand';
import {
  CanvasComponent,
  CanvasComponentType,
  PageSettings,
  GridSettings,
  TemplateData,
} from '../types';
import {
  DEFAULT_PAGE_SETTINGS,
  COMPONENT_DEFAULTS,
  COMPONENT_TYPE_LABELS,
  DEFAULT_GRID_SETTINGS,
} from '../constants';

let nextId = 0;
function generateId(): string {
  return `comp_${++nextId}`;
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

  // 操作
  addComponent: (type: CanvasComponentType, x?: number, y?: number) => void;
  updateComponent: (id: string, props: Partial<CanvasComponent>) => void;
  selectComponent: (id: string | null) => void;
  removeComponent: (id: string) => void;
  setComponents: (components: CanvasComponent[]) => void;
  setPageSettings: (settings: Partial<PageSettings>) => void;
  setPreviewVisible: (visible: boolean) => void;
  setTemplateName: (name: string) => void;
  setHeaderFooterVisible: (visible: boolean) => void;
  /** 获取导出用的模板 JSON 字符串 */
  exportJSON: () => string;
  /** 从 JSON 字符串导入模板，返回 null 表示成功，返回 string 表示错误信息 */
  importJSON: (jsonStr: string) => string | null;
  /** 重置整个设计 */
  reset: () => void;
}

export const useDesignerStore = create<DesignerStore>((set, get) => ({
  components: [],
  selectedId: null,
  pageSettings: { ...DEFAULT_PAGE_SETTINGS },
  gridSettings: { ...DEFAULT_GRID_SETTINGS },
  previewVisible: false,
  templateName: '未命名模板',
  headerFooterVisible: false,

  addComponent: (type, x, y) => {
    const id = generateId();
    const label = COMPONENT_TYPE_LABELS[type] || type;
    const defaults = { ...(COMPONENT_DEFAULTS[type] || {}) };
    if (type === 'text') {
      defaults.content = label;
    }
    const newComp: CanvasComponent = {
      id,
      type,
      x: x ?? 0,
      y: y ?? 0,
      w: type === 'line' ? 20 : 15,
      h: type === 'line' ? 1 : 8,
      props: defaults,
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

  exportJSON: () => {
    const s = get();
    const data: TemplateData = {
      version: '1.0',
      templateName: s.templateName,
      pageSettings: s.pageSettings,
      components: s.components.map(({ id, ...rest }) => rest),
    };
    return JSON.stringify(data, null, 2);
  },

  importJSON: (jsonStr) => {
    try {
      const data = JSON.parse(jsonStr) as TemplateData;
      if (!data.version || !data.pageSettings || !Array.isArray(data.components)) {
        return 'JSON 格式不正确，缺少必要字段';
      }
      // 重新分配 ID
      nextId = 0;
      const components: CanvasComponent[] = data.components.map((c) => ({
        ...c,
        id: generateId(),
      }));
      set({
        components,
        pageSettings: data.pageSettings,
        templateName: data.templateName || '导入的模板',
        selectedId: null,
      });
      return null;
    } catch {
      return 'JSON 解析失败，请检查文件内容';
    }
  },

  reset: () => {
    nextId = 0;
    set({
      components: [],
      selectedId: null,
      pageSettings: { ...DEFAULT_PAGE_SETTINGS },
      gridSettings: { ...DEFAULT_GRID_SETTINGS },
      templateName: '未命名模板',
      headerFooterVisible: false,
      previewVisible: false,
    });
  },
}));
