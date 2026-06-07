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
