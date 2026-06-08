import React from 'react';
import { Collapse } from 'antd';
import PageSettings from './PageSettings';
import ComponentPanel from './ComponentPanel';
import DataSourcePanel from './DataSourcePanel';
import { CaretRightOutlined } from '@ant-design/icons';

const LeftPanel: React.FC = () => {
  return (
    <Collapse
      bordered={false}
      accordion 
      defaultActiveKey={['1']}
      expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
      style={{ height: '100%', overflowY: 'auto' }}
      items={[
        {
          key: '1',
          label: '页面设置',
          children: <PageSettings />,
        },
        {
          key: '2',
          label: '组件',
          children: <ComponentPanel />,
        },
        {
          key: '3',
          label: '数据源',
          children: <DataSourcePanel />,
        },
      ]}
    />
  );
};

export default LeftPanel;
