# Operp Print Designer 使用文档

**Git 仓库地址**: https://gitee.com/garychk/operp-react-print

## 安装

```bash
npm install operp-print-designer
# 或者
yarn add operp-print-designer
# 或者
pnpm add operp-print-designer
```

## 基本使用

### 1. 编辑模式

```tsx
import PrintDesigner from 'operp-print-designer';

function Editor() {
  return (
    <PrintDesigner
      initialTemplateData={initialData}
      onSave={(data) => {
        console.log('保存模板:', data);
      }}
      onPrint={() => {
        console.log('打印');
      }}
    />
  );
}
```

### 2. 预览模式

```tsx
import PrintDesigner from 'operp-print-designer';

function Previewer() {
  return (
    <PrintDesigner
      isPreview
      initialTemplateData={templateData}
    />
  );
}
```

## 组件属性

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `isPreview` | `boolean` | 否 | 是否为预览模式（只读），默认为 `false` |
| `initialTemplateData` | `TemplateData` | 否 | 初始模板数据，用于加载已有的模板 |
| `dataSource` | `PrintDesignerDataSource` | 否 | 外部数据源，传入后优先于模板内部数据源用于渲染和打印 |
| `onSave` | `(data: TemplateData) => void` | 否 | 保存回调函数，当用户点击保存按钮时触发 |
| `onPrint` | `() => void` | 否 | 打印回调函数，当用户点击打印按钮时触发 |
| `locale` | `'zh-CN' \| 'en-US' \| 'ja-JP' \| 'auto'` | 否 | 界面语言，默认 `'zh-CN'`；传 `'auto'` 自动跟随宿主应用语言 |

## 多语言（i18n）

组件内置基于 [i18next](https://www.i18next.com/) 的多语言支持，目前提供 **简体中文 / English / 日本語** 三种语言。
只需传入 `locale` 属性即可切换语言，组件内部全部界面文案（工具栏、面板标题、属性项、按钮、提示、弹窗等）以及 antd 内置文案（ColorPicker、Empty、Popconfirm 等）都会同步切换。

```tsx
import { useState } from 'react';
import PrintDesigner, { type Locale } from 'operp-print-designer';

function App() {
  const [locale, setLocale] = useState<Locale>('zh-CN');

  return (
    <PrintDesigner
      locale={locale}           // 'zh-CN' | 'en-US' | 'ja-JP'
      initialTemplateData={templateData}
      onSave={(data) => console.log(data)}
    />
  );
}
```

### 切换语言

`locale` 是响应式属性，改变后组件会立即重新渲染并切换文案：

```tsx
<button onClick={() => setLocale(locale === 'zh-CN' ? 'en-US' : 'zh-CN')}>切换语言</button>
```

### 自动跟随宿主语言（`locale="auto"`）

宿主应用自己有多语言切换时，传 `'auto'` 即可让设计器跟随，**无需自己同步状态**：

```tsx
<PrintDesigner locale="auto" />
```

探测优先级（高 → 低）：

1. 宿主的 i18next 实例（`<I18nextProvider>` 注入的、或 `i18next.use(initReactI18next).init()` 初始化的、或仅 `i18next.init()` 的全局单例），并订阅其 `languageChanged` 事件实时跟随；
2. `<html lang>`（监听其变化）；
3. `navigator.language`（监听浏览器的 `languagechange` 事件）；
4. 都未命中时回退 `'zh-CN'`。

语言写法兼容 `'zh'` / `'en'` / `'ja'` / `'zh_CN'` / `'zh-Hant'` 等，自动归一化到最近的支持语言。
不使用 i18next 的宿主也可以显式传具体语言：`<PrintDesigner locale={currentLang} />`。

### 语言相关导出

```tsx
import {
  printDesignerI18n,         // 组件库内部独立的 i18next 实例
  DEFAULT_LOCALE,            // 'zh-CN'
  SUPPORTED_LOCALES,         // ['zh-CN', 'en-US', 'ja-JP']
  LOCALE_NAMES,              // { 'zh-CN': '简体中文', 'en-US': 'English', 'ja-JP': '日本語' }
  matchLocale,               // 匹配不到返回 null（不做兜底），供自定义探测逻辑使用
  normalizeLocale,           // 兼容 'zh' / 'zh_cn' / 'en' 等写法，归一化为标准 locale
  detectEnvironmentLocale,   // 从 <html lang> / navigator 探测当前环境语言
  useResolvedLocale,         // 完整的解析 hook（含跟随宿主变化的逻辑）
  useHostI18nInstance,       // 读取宿主的 i18next 实例
} from 'operp-print-designer';
```

### 注意

- 组件库使用 **独立的 i18next 实例**（`createInstance`）并通过 `I18nextProvider` 注入，不会影响宿主应用自身的 i18n 配置，也不会注册为 react-i18next 的全局实例。
- `i18next` / `react-i18next` 是 **peerDependencies**（不重复打包），与宿主共用同一份模块实例——这也是 `locale="auto"` 能读到宿主语言的前提。npm 7+ 会自动安装；如使用 pnpm 并关闭了 `auto-install-peers`，请确保宿主已安装这两个包。
- 语言包使用**平铺键值对**（如 `'toolbar.new'`），需要扩展/覆盖文案时可调用：

```tsx
printDesignerI18n.addResourceBundle('en-US', 'translation', {
  'toolbar.new': 'Create',
}, true, true);
```

## 类型定义

### TemplateData

```typescript
interface TemplateData {
  version: string;              // 模板版本号
  templateName: string;         // 模板名称
  pageSettings: PageSettings;   // 页面设置
  components: Omit<CanvasComponent, 'id'>[];  // 组件列表（不包含 ID）
  dataSources: Omit<DataSource, 'id'>[];      // 数据源列表（不包含 ID）
}
```

### DataSource

```typescript
type DataSourceType = 'object' | 'array';

interface DataSource {
  id: string;           // 数据源 ID
  name: string;         // 数据源名称
  type: DataSourceType; // 数据源类型：'object' 或 'array'
  data: string;         // JSON 字符串格式的数据
  createdAt: number;    // 创建时间戳
}
```

### PrintDesignerDataSource

```typescript
interface PrintDesignerDataSource {
  data?: Record<string, unknown>;      // 对象数据
  list?: Record<string, unknown>[];    // 列表数据
}
```

### CanvasComponent

```typescript
type CanvasComponentType = 'text' | 'image' | 'table' | 'barcode' | 'qrcode' | 'line';

interface CanvasComponent {
  id: string;
  type: CanvasComponentType;
  x: number;                        // X 坐标（网格单位）
  y: number;                         // Y 坐标（网格单位）
  w: number;                         // 宽度（网格单位）
  h: number;                         // 高度（网格单位）
  props: Record<string, unknown>;    // 组件属性
  tableColumns?: TableColumnConfig[]; // 表格列配置（仅表格组件）
}

interface TableColumnConfig {
  title: string;    // 列标题
  fieldPath?: string; // 绑定的字段路径
  width?: number;    // 列宽
}
```

## 使用示例

### 完整的工作流程

```tsx
import { useState } from 'react';
import PrintDesigner, { TemplateData } from 'operp-print-designer';

function App() {
  const [templateData, setTemplateData] = useState<TemplateData | undefined>();
  const [isPreview, setIsPreview] = useState(false);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 100 }}>
        <button onClick={() => setIsPreview(!isPreview)}>
          {isPreview ? '编辑' : '预览'}
        </button>
      </div>
      
      <PrintDesigner
        isPreview={isPreview}
        initialTemplateData={templateData}
        onSave={(data) => {
          setTemplateData(data);
          alert('模板已保存');
        }}
      />
    </div>
  );
}
```

### 带数据绑定的示例

```tsx
import PrintDesigner, { TemplateData } from 'operp-print-designer';

function Example() {
  // 定义包含数据源的模板数据
  const templateData: TemplateData = {
    version: '1.0',
    templateName: '商品标签',
    pageSettings: {
      paperSize: 'custom',
      customWidth: 100,
      customHeight: 60,
      orientation: 'portrait',
      marginTop: 5,
      marginRight: 5,
      marginBottom: 5,
      marginLeft: 5,
      showHeader: false,
      headerContent: '',
      showFooter: false,
      footerContent: '',
      showPageNumber: false,
      pageNumberFormat: '',
    },
    components: [
      {
        type: 'text',
        x: 0,
        y: 0,
        w: 15,
        h: 3,
        props: {
          content: '商品名称',
          contentBinding: {
            dataSourceId: 'ds_1',
            fieldPath: 'name',
            staticValue: '商品名称',
          },
        },
      },
    ],
    dataSources: [
      {
        name: '商品信息',
        type: 'object',
        data: '{"name": "iPhone 15", "price": 6999, "barcode": "1234567890123"}',
      },
    ],
  };

  return (
    <PrintDesigner
      isPreview
      initialTemplateData={templateData}
    />
  );
}
```

### 表格数据绑定示例

```tsx
import PrintDesigner, { TemplateData } from 'operp-print-designer';

function TableExample() {
  const templateData: TemplateData = {
    version: '1.0',
    templateName: '订单清单',
    pageSettings: {
      paperSize: 'A4',
      orientation: 'portrait',
      marginTop: 10,
      marginRight: 10,
      marginBottom: 10,
      marginLeft: 10,
      showHeader: false,
      headerContent: '',
      showFooter: false,
      footerContent: '',
      showPageNumber: false,
      pageNumberFormat: '',
    },
    components: [
      {
        type: 'table',
        x: 0,
        y: 0,
        w: 100,
        h: 30,
        props: {
          tableDataSourceId: 'ds_2',
        },
        tableColumns: [
          { title: '订单号', fieldPath: 'orderId' },
          { title: '商品', fieldPath: 'product' },
          { title: '数量', fieldPath: 'quantity' },
          { title: '单价', fieldPath: 'price' },
        ],
      },
    ],
    dataSources: [
      {
        name: '订单列表',
        type: 'array',
        data: JSON.stringify([
          { orderId: 'A001', product: 'iPhone 15', quantity: 1, price: 6999 },
          { orderId: 'A002', product: 'MacBook Pro', quantity: 1, price: 12999 },
          { orderId: 'A003', product: 'AirPods Pro', quantity: 2, price: 1899 },
        ]),
      },
    ],
  };

  return <PrintDesigner isPreview initialTemplateData={templateData} />;
}
```

## 样式导入

如果需要导入全局样式（可选，因为组件内置了必要的样式）：

```tsx
import 'operp-print-designer/dist/index.css';
```

## 注意事项

1. **peerDependencies**: 该库依赖 `react`、`react-dom`、`antd`、`@ant-design/icons`、`react-grid-layout`、`react-to-print` 和 `zustand`，这些依赖需要您在项目中单独安装。

2. **TypeScript**: 该库使用 TypeScript 编写，自带类型定义。

3. **数据绑定**: 数据源支持对象和数组两种类型：
   - **对象类型**: 适用于文本、图片、条码、二维码等组件的数据绑定
   - **数组类型**: 适用于表格组件的数据绑定

4. **预览模式**: 当 `isPreview` 为 `true` 时，组件处于只读模式，用户不能编辑模板，只能预览和打印。
