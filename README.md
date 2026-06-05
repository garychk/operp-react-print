# 打印模板设计器

可视化打印模板设计工具，支持拖拽组件构建打印布局，实时预览并调用浏览器打印。

## 技术栈

| 类别       | 技术                                      |
| ---------- | ----------------------------------------- |
| 框架       | React 18 + TypeScript                     |
| 构建工具   | Vite 6                                    |
| UI 组件库  | Ant Design 5 + @ant-design/icons          |
| 画布交互   | react-grid-layout（拖拽/缩放）             |
| 打印       | react-to-print                            |
| 状态管理   | Zustand                                   |
| 条形码     | Canvas 自绘 CODE128                       |

## 快速开始

```bash
npm install
npm run dev
```

## 项目结构

```
src/
├── main.tsx                       # 应用入口
├── App.tsx                        # 主布局：三栏 + 弹窗
├── App.css                        # 全局样式
├── types/index.ts                 # 类型定义
├── constants/index.ts             # 常量配置（纸张预设、组件默认属性）
├── store/index.ts                 # Zustand 全局状态
└── components/
    ├── Toolbar.tsx                # 顶部工具栏：模板名称、删除、页眉页脚、预览
    ├── PageSettings.tsx           # 页面设置：纸张大小、方向、页边距
    ├── ComponentPanel.tsx         # 组件面板：拖拽/点击添加组件
    ├── Canvas.tsx                 # 画布：react-grid-layout 拖拽缩放
    ├── PropertyPanel.tsx          # 属性编辑：按组件类型展示编辑项
    ├── PrintPreview.tsx           # 打印预览弹窗 + 打印触发
    ├── HeaderFooterDialog.tsx     # 页眉页脚设置弹窗
    └── Barcode.tsx                # CODE128 条形码 Canvas 渲染
```

## 功能概览

### 1. 组件面板

左侧面板列出 5 种可拖拽组件：

| 组件     | 说明                                         |
| -------- | -------------------------------------------- |
| 文本     | 自由编辑文字内容、字号、颜色、对齐、字重等    |
| 图片     | 设置图片 URL 和适应方式（contain/cover/fill） |
| 表格     | 设置行列数、边框粗细和颜色                   |
| 条形码   | CODE128 格式，Canvas 自绘                    |
| 分割线   | 线条粗细、样式（实线/虚线/点线）、颜色       |

**操作方式**：从左侧拖拽到画布，或直接点击添加。

### 2. 画布编辑

- **拖拽移动**：选中组件后自由拖动位置
- **缩放调整**：拖拽右下角手柄改变组件宽高
- **点击选中**：点击组件显示蓝色选中框，右侧面板同步显示属性
- **删除**：选中后点击工具栏"删除组件"

### 3. 页面设置

- **纸张大小**：A4 / A3 / A5 / Letter / Legal / 自定义
- **方向**：纵向 / 横向
- **页边距**：上、右、下、左四边独立设置（单位 mm）

### 4. 页眉页脚

通过工具栏"页眉页脚"按钮打开弹窗设置：

- 页眉显示/隐藏及文字内容
- 页脚显示/隐藏及文字内容
- 页码显示/隐藏及格式（支持 `{page}` 占位符）

### 5. 打印预览与打印

- 点击"预览"打开预览弹窗，展示最终打印效果
- 弹窗内点击"打印"调用浏览器打印功能

## 状态管理

采用 Zustand 集中管理，核心状态：

| 状态               | 说明                           |
| ------------------ | ------------------------------ |
| `components`       | 画布上所有组件实例数组          |
| `selectedId`       | 当前选中组件 ID                 |
| `pageSettings`     | 页面设置（纸张、边距、方向等）  |
| `previewVisible`   | 预览弹窗显隐                    |
| `headerFooterVisible` | 页眉页脚弹窗显隐             |

## 数据流

```
ComponentPanel (拖拽/点击)
       │
       ▼ addComponent()
   Store (Zustand)  ──────────► Canvas (react-grid-layout 渲染)
       │                              │
       │ updateComponent()            │ onLayoutChange
       │                      ◄───────┘
       ▼
PropertyPanel (属性编辑)
       │
       ▼
   Store ◄── PageSettings (页面设置)
   Store ◄── HeaderFooterDialog (页眉页脚)
       │
       ▼
PrintPreview (react-to-print)
```

## 纸张像素映射

- 缩放比例：`1mm = 3px`
- 纸张像素 = 实际毫米尺寸 × 3
- 画布有效区域 = 纸张像素 - 四边距像素

| 纸张  | 竖版尺寸 (mm) | 竖版像素 (px) |
| ----- | ------------- | ------------- |
| A4    | 210 × 297     | 630 × 891     |
| A3    | 297 × 420     | 891 × 1260    |
| A5    | 148 × 210     | 444 × 630     |
| Letter | 215.9 × 279.4 | ≈648 × 838    |
| Legal | 215.9 × 355.6  | ≈648 × 1067   |
