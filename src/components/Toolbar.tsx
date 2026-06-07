import React, { useCallback, useRef } from 'react';
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
    a.download = `${templateName || '模板'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('模板已导出');
  }, [exportJSON, templateName, message]);

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
          message.error(result);
        } else {
          message.success('模板已导入');
        }
      };
      reader.readAsText(file);
      // 重置 input 以支持重复选同一文件
      e.target.value = '';
    },
    [importJSON, message],
  );

  const handleReset = useCallback(() => {
    reset();
    message.info('已新建空白模板');
  }, [reset, message]);

  return (
    <div
      style={{
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        borderBottom: '1px solid #e8e8e8',
        background: '#fff',
      }}
    >
      <Space>
        <Input
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          variant="borderless"
          style={{ width: 200, fontSize: 16, fontWeight: 600 }}
          placeholder="模板名称"
        />
        
      </Space>
      <Space>
        <Button icon={<PlusOutlined />} onClick={handleReset}>
          新建
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
            保存
          </Button>
        ) : (
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            导出
          </Button>
        )}
        <Button icon={<UploadOutlined />} onClick={handleImportClick}>
          导入
        </Button>
        <Button
          icon={<SettingOutlined />}
          onClick={() => setHeaderFooterVisible(true)}
        >
          页眉页脚
        </Button>
        <Button
          danger
          icon={<DeleteOutlined />}
          disabled={!selectedId}
          onClick={handleDelete}
        >
          删除
        </Button>
        {onCustomPrint ? (
          <Button
            type="primary"
            icon={<PrinterOutlined />}
            onClick={onCustomPrint}
          >
            打印
          </Button>
        ) : (
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => setPreviewVisible(true)}
          >
            预览
          </Button>
        )}
      </Space>
    </div>
  );
};

export default Toolbar;
