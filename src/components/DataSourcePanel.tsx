import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  Input,
  Select,
  Space,
  Typography,
  Modal,
  message,
  Divider,
  List,
  Popconfirm,
  Tag,
  Dropdown,
  MenuProps,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  DatabaseOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { useDesignerStore } from "../store";
import { DataSourceType } from "../types";
import { safeParseJSON } from "../utils/dataHelper";
import { t as translate } from "../i18n";

const { TextArea } = Input;
const { Text, Title } = Typography;

/** 默认对象类型数据（跟随当前语言） */
const getDefaultObjectData = () =>
  JSON.stringify(translate("dataSource.sampleObject", { returnObjects: true }), null, 2);

/** 默认数组类型数据（跟随当前语言） */
const getDefaultArrayData = () =>
  JSON.stringify(translate("dataSource.sampleArray", { returnObjects: true }), null, 2);

const DataSourcePanel: React.FC = () => {
  const { t } = useTranslation();
  const dataSources = useDesignerStore((s) => s.dataSources);
  const addDataSource = useDesignerStore((s) => s.addDataSource);
  const updateDataSource = useDesignerStore((s) => s.updateDataSource);
  const removeDataSource = useDesignerStore((s) => s.removeDataSource);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState({
    name: "",
    type: "object" as DataSourceType,
    data: "",
  });

  const handleOpenModal = (ds?: {
    id: string;
    name: string;
    type: DataSourceType;
    data: string;
  }) => {
    if (ds) {
      setEditingId(ds.id);
      setFormValues({ name: ds.name, type: ds.type, data: ds.data });
    } else {
      setEditingId(null);
      setFormValues({
        name: t("dataSource.newName"),
        type: "object",
        data: getDefaultObjectData(),
      });
    }
    setModalVisible(true);
  };

  const handleSave = () => {
    // 验证 JSON 格式
    const parsed = safeParseJSON(formValues.data);
    if (parsed === null) {
      message.error(t("dataSource.invalidJson"));
      return;
    }
    if (
      formValues.type === "object" &&
      (Array.isArray(parsed) || typeof parsed !== "object")
    ) {
      message.error(t("dataSource.objectFormatError"));
      return;
    }
    if (formValues.type === "array" && !Array.isArray(parsed)) {
      message.error(t("dataSource.arrayFormatError"));
      return;
    }

    if (editingId) {
      updateDataSource(editingId, formValues);
      message.success(t("dataSource.updated"));
    } else {
      addDataSource(formValues.name, formValues.type, formValues.data);
      message.success(t("dataSource.added"));
    }
    setModalVisible(false);
  };

  return (
    <Card
      title={t("dataSource.title")}
      size="small"
      extra={
        <Button
          type="link"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => handleOpenModal()}
        >
          {t("dataSource.add")}
        </Button>
      }
    >
      <List
        size="small"
        dataSource={dataSources}
        locale={{ emptyText: t("dataSource.empty") }}
        renderItem={(ds) => (
          <List.Item
            actions={[
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "edit",
                      label: t("common.edit"),
                      icon: <EditOutlined />,
                      onClick: () => handleOpenModal(ds),
                    },
                    {
                      type: "divider",
                    },
                    {
                      key: "delete",
                      label: (
                        <Popconfirm
                          title={t("dataSource.deleteConfirm")}
                          onConfirm={(e) => {
                            e?.stopPropagation();
                            removeDataSource(ds.id);
                            message.success(t("dataSource.deleted"));
                          }}
                          okText={t("common.confirm")}
                          cancelText={t("common.cancel")}
                          onCancel={(e) => e?.stopPropagation()}
                        >
                          <span style={{ color: "#ff4d4f", cursor: "pointer" }}>
                            {t("common.delete")}
                          </span>
                        </Popconfirm>
                      ),
                      icon: <DeleteOutlined style={{ color: "#ff4d4f" }} />,
                    },
                  ],
                }}
                placement="bottomRight"
              >
                <Button type="text" size="small" icon={<MoreOutlined />} />
              </Dropdown>,
            ]}
          >
            <List.Item.Meta
              avatar={<DatabaseOutlined />}
              title={<Text ellipsis  strong>{ds.name}</Text>}
              description={
                <Space size={4}>
                  <Tag color={ds.type === "object" ? "blue" : "green"}>
                    {ds.type === "object"
                      ? t("dataSource.typeObject")
                      : t("dataSource.typeArray")}
                  </Tag>
                </Space>
              }
            />
          </List.Item>
        )}
      />
      <Modal
        title={editingId ? t("dataSource.editTitle") : t("dataSource.addTitle")}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        okText={t("common.save")}
        cancelText={t("common.cancel")}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <div>
            <Text strong style={{ display: "block", marginBottom: 4 }}>
              {t("dataSource.name")}
            </Text>
            <Input
              placeholder={t("dataSource.namePlaceholder")}
              value={formValues.name}
              onChange={(e) =>
                setFormValues({ ...formValues, name: e.target.value })
              }
            />
          </div>

          <div>
            <Text strong style={{ display: "block", marginBottom: 4 }}>
              {t("dataSource.type")}
            </Text>
            <Select
              options={[
                { label: t("dataSource.typeObject"), value: "object" },
                { label: t("dataSource.typeArray"), value: "array" },
              ]}
              style={{ width: "100%" }}
              value={formValues.type}
              onChange={(v) => {
                setFormValues({
                  ...formValues,
                  type: v as DataSourceType,
                  data:
                    v === "object" ? getDefaultObjectData() : getDefaultArrayData(),
                });
              }}
            />
          </div>

          <Divider style={{ margin: "8px 0" }} />

          <div>
            <Text strong style={{ display: "block", marginBottom: 4 }}>
              {t("dataSource.jsonData")}
            </Text>
            <TextArea
              rows={12}
              placeholder={t("dataSource.jsonPlaceholder")}
              value={formValues.data}
              onChange={(e) =>
                setFormValues({ ...formValues, data: e.target.value })
              }
            />
          </div>
        </Space>
      </Modal>
    </Card>
  );
};

export default DataSourcePanel;
