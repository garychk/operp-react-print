import React from 'react';
import { Modal, Form, Input, Switch } from 'antd';
import { useDesignerStore } from '../store';

const HeaderFooterDialog: React.FC = () => {
  const visible = useDesignerStore((s) => s.headerFooterVisible);
  const pageSettings = useDesignerStore((s) => s.pageSettings);
  const setPageSettings = useDesignerStore((s) => s.setPageSettings);
  const setHeaderFooterVisible = useDesignerStore((s) => s.setHeaderFooterVisible);

  return (
    <Modal
      title="页眉页脚设置"
      open={visible}
      onCancel={() => setHeaderFooterVisible(false)}
      onOk={() => setHeaderFooterVisible(false)}
      width={480}
    >
      <Form layout="vertical" style={{ marginTop: 8 }}>
        <Form.Item label="显示页眉">
          <Switch
            checked={pageSettings.showHeader}
            onChange={(v) => setPageSettings({ showHeader: v })}
          />
        </Form.Item>
        {pageSettings.showHeader && (
          <Form.Item label="页眉内容">
            <Input
              value={pageSettings.headerContent}
              onChange={(e) => setPageSettings({ headerContent: e.target.value })}
            />
          </Form.Item>
        )}

        <Form.Item label="显示页脚">
          <Switch
            checked={pageSettings.showFooter}
            onChange={(v) => setPageSettings({ showFooter: v })}
          />
        </Form.Item>

        {pageSettings.showFooter && (
          <>
            <Form.Item label="页脚内容">
              <Input
                value={pageSettings.footerContent}
                onChange={(e) => setPageSettings({ footerContent: e.target.value })}
              />
            </Form.Item>
            <Form.Item label="显示页码">
              <Switch
                checked={pageSettings.showPageNumber}
                onChange={(v) => setPageSettings({ showPageNumber: v })}
              />
            </Form.Item>
            {pageSettings.showPageNumber && (
              <Form.Item label="页码格式">
                <Input
                  value={pageSettings.pageNumberFormat}
                  onChange={(e) => setPageSettings({ pageNumberFormat: e.target.value })}
                  placeholder="第 {page} 页"
                />
              </Form.Item>
            )}
          </>
        )}
      </Form>
    </Modal>
  );
};

export default HeaderFooterDialog;
