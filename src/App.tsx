import React from 'react';
import { App as AntApp } from 'antd';
import Toolbar from './components/Toolbar';
import LeftPanel from './components/LeftPanel';
import Canvas from './components/Canvas';
import PropertyPanel from './components/PropertyPanel';
import PrintPreview from './components/PrintPreview';
import HeaderFooterDialog from './components/HeaderFooterDialog';

const App: React.FC = () => {
  return (
    <AntApp>
      <div className="app-container">
      {/* 顶部工具栏 */}
      <Toolbar />

      {/* 主体三栏布局 */}
      <div className="app-body">
        {/* 左侧面板 */}
        <div className="app-left-panel">
          <LeftPanel />
        </div>

        {/* 中间画布 */}
        <Canvas />

        {/* 右侧属性面板 */}
        <div className="app-right-panel">
          <PropertyPanel />
        </div>
      </div>

      {/* 打印预览弹窗 */}
      <PrintPreview />

      {/* 页眉页脚弹窗 */}
      <HeaderFooterDialog />
    </div>
    </AntApp>
  );
};

export default App;
