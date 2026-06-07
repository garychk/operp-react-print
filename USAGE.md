# Print Designer 使用文档

## 基本使用

### 1. 编辑模式

```tsx
import PrintDesigner from '@your-org/print-designer';

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
import PrintDesigner from '@your-org/print-designer';

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

| 属性 | 类型 | 说明 |
|------|------|------|
| `isPreview` | `boolean` | 是否为预览模式（只读），默认为 `false` |
| `initialTemplateData` | `TemplateData` | 初始模板数据 |
| `onSave` | `(data: TemplateData) => void` | 保存回调函数 |
| `onPrint` | `() => void` | 打印回调函数 |

## 类型定义

### TemplateData

```typescript
interface TemplateData {
  version: string;
  templateName: string;
  pageSettings: PageSettings;
  components: Omit<CanvasComponent, 'id'>[];
  dataSources: Omit<DataSource, 'id' | 'createdAt'>[];
}
```

### DataSource

```typescript
type DataSourceType = 'object' | 'array';

interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  data: string; // JSON 字符串
  createdAt: number;
}
```

## 使用示例

### 完整的工作流程

```tsx
import { useState } from 'react';
import PrintDesigner, { TemplateData } from '@your-org/print-designer';

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
