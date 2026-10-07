import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Form, Input, Switch } from 'antd';
import { useDesignerStore } from '../store';

const HeaderFooterDialog: React.FC = () => {
  const { t } = useTranslation();
  const visible = useDesignerStore((s) => s.headerFooterVisible);
  const pageSettings = useDesignerStore((s) => s.pageSettings);
  const setPageSettings = useDesignerStore((s) => s.setPageSettings);
  const setHeaderFooterVisible = useDesignerStore((s) => s.setHeaderFooterVisible);

  return (
    <Modal
      title={t('headerFooter.title')}
      open={visible}
      onCancel={() => setHeaderFooterVisible(false)}
      onOk={() => setHeaderFooterVisible(false)}
      okText={t('common.confirm')}
      cancelText={t('common.cancel')}
      width={480}
    >
      <Form layout="vertical" style={{ marginTop: 8 }}>
        <Form.Item label={t('headerFooter.showHeader')}>
          <Switch
            checked={pageSettings.showHeader}
            onChange={(v) => setPageSettings({ showHeader: v })}
          />
        </Form.Item>
        {pageSettings.showHeader && (
          <Form.Item label={t('headerFooter.headerContent')}>
            <Input
              value={pageSettings.headerContent}
              onChange={(e) => setPageSettings({ headerContent: e.target.value })}
            />
          </Form.Item>
        )}

        <Form.Item label={t('headerFooter.showFooter')}>
          <Switch
            checked={pageSettings.showFooter}
            onChange={(v) => setPageSettings({ showFooter: v })}
          />
        </Form.Item>

        {pageSettings.showFooter && (
          <>
            <Form.Item label={t('headerFooter.footerContent')}>
              <Input
                value={pageSettings.footerContent}
                onChange={(e) => setPageSettings({ footerContent: e.target.value })}
              />
            </Form.Item>
            <Form.Item label={t('headerFooter.showPageNumber')}>
              <Switch
                checked={pageSettings.showPageNumber}
                onChange={(v) => setPageSettings({ showPageNumber: v })}
              />
            </Form.Item>
            {pageSettings.showPageNumber && (
              <Form.Item label={t('headerFooter.pageNumberFormat')}>
                <Input
                  value={pageSettings.pageNumberFormat}
                  onChange={(e) => setPageSettings({ pageNumberFormat: e.target.value })}
                  placeholder={t('headerFooter.pageNumberFormatPlaceholder')}
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
