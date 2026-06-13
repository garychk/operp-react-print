import { DataSource, TableColumnConfig, CanvasComponent } from '../types';

/**
 * 安全解析 JSON 字符串
 */
export function safeParseJSON(jsonStr: string): any {
  try {
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

/**
 * 获取组件属性的渲染值（支持数据绑定）
 */
export function getRenderValue(
  comp: CanvasComponent,
  propName: string,
  dataSources: DataSource[]
): string {
  // 尝试查找绑定配置
  const bindingKey = `${propName}Binding`;
  const binding = comp.props[bindingKey] as any;
  
  if (binding && binding.dataSourceId && binding.fieldPath) {
    // 查找数据源
    const dataSource = dataSources.find((ds) => ds.id === binding.dataSourceId);
    if (dataSource) {
      // 解析数据源数据
      const data = getObjectFromDataSource(dataSource);
      if (data) {
        // 获取字段值
        const value = getValueByPath(data, binding.fieldPath);
        if (value) {
          return value;
        }
      }
    }
  }
  
  // 如果没有绑定或绑定失败，返回静态值
  const staticValue = (comp.props[propName] as string) || (binding?.staticValue as string) || '';
  return staticValue;
}

/**
 * 按组件格式配置渲染值。目前支持常用日期格式，如 yyyyMMdd、yyyy-MM-dd HH:mm:ss。
 */
export function formatRenderValue(value: string, format?: string): string {
  if (!format || !value) return value;

  const date = parseDateValue(value);
  if (!date) return value;

  const pad = (num: number, len = 2) => String(num).padStart(len, '0');
  const tokens: Record<string, string> = {
    yyyy: String(date.getFullYear()),
    yy: String(date.getFullYear()).slice(-2),
    MM: pad(date.getMonth() + 1),
    M: String(date.getMonth() + 1),
    dd: pad(date.getDate()),
    d: String(date.getDate()),
    HH: pad(date.getHours()),
    H: String(date.getHours()),
    mm: pad(date.getMinutes()),
    m: String(date.getMinutes()),
    ss: pad(date.getSeconds()),
    s: String(date.getSeconds()),
  };

  return format.replace(/yyyy|yy|MM|M|dd|d|HH|H|mm|m|ss|s/g, (token) => tokens[token]);
}

function parseDateValue(value: string): Date | null {
  const normalized = value.trim();
  if (!normalized) return null;

  if (/^\d{8}$/.test(normalized)) {
    const year = Number(normalized.slice(0, 4));
    const month = Number(normalized.slice(4, 6));
    const day = Number(normalized.slice(6, 8));
    return createValidDate(year, month, day);
  }

  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function createValidDate(year: number, month: number, day: number): Date | null {
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

/**
 * 通过路径获取对象属性值
 * 例如：obj = {a: {b: 123}}, path = 'a.b' -> return 123
 */
export function getValueByPath(obj: any, path?: string): string {
  if (!obj || !path) return '';
  try {
    const paths = path.split('.');
    let value = obj;
    for (const key of paths) {
      if (typeof value !== 'object' || value === null) {
        return '';
      }
      value = value[key];
    }
    return value !== undefined && value !== null ? String(value) : '';
  } catch {
    return '';
  }
}

/**
 * 从数据源获取对象数据
 */
export function getObjectFromDataSource(dataSource: DataSource): Record<string, any> | null {
  const parsed = safeParseJSON(dataSource.data);
  if (dataSource.type === 'object' && parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    return parsed;
  }
  return null;
}

/**
 * 从数据源获取数组数据
 */
export function getArrayFromDataSource(dataSource: DataSource): any[] | null {
  const parsed = safeParseJSON(dataSource.data);
  if (dataSource.type === 'array' && Array.isArray(parsed)) {
    return parsed;
  }
  return null;
}

/**
 * 渲染表格行
 */
export function renderTableRow(item: any, columns: TableColumnConfig[]): string[] {
  return columns.map((col) => getValueByPath(item, col.fieldPath));
}
