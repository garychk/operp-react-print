import React from 'react';
import { Tabs } from 'antd';
import { SettingOutlined, AppstoreOutlined, DatabaseOutlined } from '@ant-design/icons';
import PageSettings from './PageSettings';
import ComponentPanel from './ComponentPanel';
import DataSourcePanel from './DataSourcePanel';

const LeftPanel: React.FC = () => {
  return (
    <Tabs
      defaultActiveKey="1"
      style={{ height: '100%' }}
      items={[
        {
          key: '1',
          label: (
            <span>
              <SettingOutlined />
              页面设置
            </span>
          ),
          children: (
            <div style={{ padding: '0 8px 8px 8px', height: '100%', overflowY: 'auto' }}>
              <PageSettings />
            </div>
          ),
        },
        {
          key: '2',
          label: (
            <span>
              <AppstoreOutlined />
              组件
            </span>
          ),
          children: (
            <div style={{ padding: '0 8px 8px 8px', height: '100%', overflowY: 'auto' }}>
              <ComponentPanel />
            </div>
          ),
        },
        {
          key: '3',
          label: (
            <span>
              <DatabaseOutlined />
              数据源
            </span>
          ),
          children: (
            <div style={{ padding: '0 8px 8px 8px', height: '100%', overflowY: 'auto' }}>
              <DataSourcePanel />
            </div>
          ),
        },
      ]}
    />
  );
};

export default LeftPanel;
