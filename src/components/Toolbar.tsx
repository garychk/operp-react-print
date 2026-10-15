import React, { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Space, Typography, Input, App } from 'antd';
import {
  DeleteOutlined,
  EyeOutlined,
  SettingOutlined,
  DownloadOutlined,
  UploadOutlined,
  PlusOutlined,
  SaveOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { useDesignerStore } from '../store';

const { Text } = Typography;

interface ToolbarProps {
  /** 自定义保存回调 */
  onCustomSave?: () => void;
  /** 自定义打印回调 */
  onCustomPrint?: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onCustomSave, onCustomPrint }) => {
  const templateName = useDesignerStore((s) => s.templateName);
  const setTemplateName = useDesignerStore((s) => s.setTemplateName);
  const setPreviewVisible = useDesignerStore((s) => s.setPreviewVisible);
  const setHeaderFooterVisible = useDesignerStore((s) => s.setHeaderFooterVisible);
  const selectedId = useDesignerStore((s) => s.selectedId);
  const removeComponent = useDesignerStore((s) => s.removeComponent);
  const exportJSON = useDesignerStore((s) => s.exportJSON);
  const importJSON = useDesignerStore((s) => s.importJSON);
  const reset = useDesignerStore((s) => s.reset);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { message } = App.useApp();
  const { t } = useTranslation();

  const handleDelete = useCallback(() => {
    if (selectedId) {
      removeComponent(selectedId);
    }
  }, [selectedId, removeComponent]);

  const handleExport = useCallback(() => {
    const json = exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateName || t('toolbar.untitled')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    message.success(t('toolbar.exported'));
  }, [exportJSON, templateName, message, t]);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const result = importJSON(reader.result as string);
        if (result) {
          message.error(t(result));
        } else {
          message.success(t('toolbar.imported'));
        }
      };
      reader.readAsText(file);
      // 重置 input 以支持重复选同一文件
      e.target.value = '';
    },
    [importJSON, message, t],
  );

  const handleReset = useCallback(() => {
    reset();
    message.info(t('toolbar.newBlank'));
  }, [reset, message, t]);

  return (
    <div
      style={{
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        borderBottom: '1px solid var(--pd-chrome-border, #e8e8e8)',
        background: 'var(--pd-chrome-bg, #fff)',
      }}
    >
      <Space>
        <Input
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          variant="borderless"
          style={{ width: 200, fontSize: 16, fontWeight: 600 }}
          placeholder={t('toolbar.templateNamePlaceholder')}
        />
        
      </Space>
      <Space>
        <Button icon={<PlusOutlined />} onClick={handleReset}>
          {t('toolbar.new')}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleImport}
        />
        {onCustomSave ? (
          <Button icon={<SaveOutlined />} onClick={onCustomSave} type="primary">
            {t('toolbar.save')}
          </Button>
        ) : (
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            {t('toolbar.export')}
          </Button>
        )}
        <Button icon={<UploadOutlined />} onClick={handleImportClick}>
          {t('toolbar.import')}
        </Button>
        <Button
          icon={<SettingOutlined />}
          onClick={() => setHeaderFooterVisible(true)}
        >
          {t('toolbar.headerFooter')}
        </Button>
        <Button
          danger
          icon={<DeleteOutlined />}
          disabled={!selectedId}
          onClick={handleDelete}
        >
          {t('common.delete')}
        </Button>
        {onCustomPrint ? (
          <Button
            type="primary"
            icon={<PrinterOutlined />}
            onClick={onCustomPrint}
          >
            {t('toolbar.print')}
          </Button>
        ) : (
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => setPreviewVisible(true)}
          >
            {t('toolbar.preview')}
          </Button>
        )}
      </Space>
    </div>
  );
};

export default Toolbar;
