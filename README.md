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
