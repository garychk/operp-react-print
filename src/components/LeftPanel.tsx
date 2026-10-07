import React from 'react';
import { useTranslation } from 'react-i18next';
import { Collapse } from 'antd';
import PageSettings from './PageSettings';
import ComponentPanel from './ComponentPanel';
import DataSourcePanel from './DataSourcePanel';
import { CaretRightOutlined } from '@ant-design/icons';

const LeftPanel: React.FC = () => {
  const { t } = useTranslation();

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
          label: t('panel.pageSettings'),
          children: <PageSettings />,
        },
        {
          key: '2',
          label: t('panel.components'),
          children: <ComponentPanel />,
        },
        {
          key: '3',
          label: t('panel.dataSource'),
          children: <DataSourcePanel />,
        },
      ]}
    />
  );
};

export default LeftPanel;
