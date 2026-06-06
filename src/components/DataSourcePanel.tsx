import React, { useState } from "react";
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

const { TextArea } = Input;
const { Text, Title } = Typography;

/** 默认对象类型数据 */
const DEFAULT_OBJECT_DATA = JSON.stringify(
  {
    name: "张三",
    age: 28,
    department: "技术部",
    email: "zhangsan@example.com",
  },
  null,
  2,
);

/** 默认数组类型数据 */
const DEFAULT_ARRAY_DATA = JSON.stringify(
  [
    { id: 1, product: "商品A", quantity: 2, price: 100 },
    { id: 2, product: "商品B", quantity: 5, price: 80 },
    { id: 3, product: "商品C", quantity: 1, price: 200 },
  ],
  null,
  2,
);

const DataSourcePanel: React.FC = () => {
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
        name: "新数据源",
        type: "object",
        data: DEFAULT_OBJECT_DATA,
      });
    }
    setModalVisible(true);
  };

  const handleSave = () => {
    // 验证 JSON 格式
    const parsed = safeParseJSON(formValues.data);
    if (parsed === null) {
      message.error("JSON 格式不正确");
      return;
    }
    if (
      formValues.type === "object" &&
      (Array.isArray(parsed) || typeof parsed !== "object")
    ) {
      message.error("对象类型数据源必须为对象格式");
      return;
    }
    if (formValues.type === "array" && !Array.isArray(parsed)) {
      message.error("数组类型数据源必须为数组格式");
      return;
    }

    if (editingId) {
      updateDataSource(editingId, formValues);
      message.success("数据源已更新");
    } else {
      addDataSource(formValues.name, formValues.type, formValues.data);
      message.success("数据源已添加");
    }
    setModalVisible(false);
  };

  return (
    <Card
      title="数据源"
      size="small"
      extra={
        <Button
          type="link"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => handleOpenModal()}
        >
          添加
        </Button>
      }
    >
      <List
        size="small"
        dataSource={dataSources}
        locale={{ emptyText: "暂无数据源" }}
        renderItem={(ds) => (
          <List.Item
            actions={[
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "edit",
                      label: "编辑",
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
                          title="确定要删除这个数据源吗？"
                          onConfirm={(e) => {
                            e?.stopPropagation();
                            removeDataSource(ds.id);
                            message.success("已删除");
                          }}
                          okText="确定"
                          cancelText="取消"
                          onCancel={(e) => e?.stopPropagation()}
                        >
                          <span style={{ color: "#ff4d4f", cursor: "pointer" }}>
                            删除
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
              title={<Text strong>{ds.name}</Text>}
              description={
                <Space size={4}>
                  <Tag color={ds.type === "object" ? "blue" : "green"}>
                    {ds.type === "object" ? "对象" : "数组"}
                  </Tag>
                </Space>
              }
            />
          </List.Item>
        )}
      />
      <Modal
        title={editingId ? "编辑数据源" : "添加数据源"}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        okText="保存"
        cancelText="取消"
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <div>
            <Text strong style={{ display: "block", marginBottom: 4 }}>
              名称
            </Text>
            <Input
              placeholder="请输入数据源名称"
              value={formValues.name}
              onChange={(e) =>
                setFormValues({ ...formValues, name: e.target.value })
              }
            />
          </div>

          <div>
            <Text strong style={{ display: "block", marginBottom: 4 }}>
              类型
            </Text>
            <Select
              options={[
                { label: "对象", value: "object" },
                { label: "数组", value: "array" },
              ]}
              style={{ width: "100%" }}
              value={formValues.type}
              onChange={(v) => {
                setFormValues({
                  ...formValues,
                  type: v as DataSourceType,
                  data:
                    v === "object" ? DEFAULT_OBJECT_DATA : DEFAULT_ARRAY_DATA,
                });
              }}
            />
          </div>

          <Divider style={{ margin: "8px 0" }} />

          <div>
            <Text strong style={{ display: "block", marginBottom: 4 }}>
              JSON 数据
            </Text>
            <TextArea
              rows={12}
              placeholder="请输入 JSON 数据"
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
