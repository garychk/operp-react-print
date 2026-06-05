import { DataSource, TableColumnConfig } from '../types';

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
