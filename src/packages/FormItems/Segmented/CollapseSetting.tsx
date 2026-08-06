import { memo } from 'react';
import { Form, Input, Space,Select, Button, FormInstance } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { createId } from './../../../utils/util';
import CollapseConfig from './CollapseItemSchema';
import { useAppContext } from './../../../utils/AppProvider';
import * as icons from '@ant-design/icons';
import React from 'react';
import IconSelect from "@/packages/components/icon-select/IconSelect";
/**
 * 操作栏配置
 */
const iconsList: { [key: string]: any } = icons;
const ActionSetting = memo(({ form }: { form: FormInstance }) => {
    const { pageStore } = useAppContext();
    const { selectedElement, addChildElements, removeElements, editElement } = pageStore((state: any) => {
        return {
            selectedElement: state.selectedElement,
            addChildElements: state.addChildElements,
            removeElements: state.removeElements,
            editElement: state.editElement,
        };
    });
    // 创建批量操作按钮
    const handleCreate = (add: any, index: number) => {
        const id = createId('CollapseItem');
        const uniqueKey = 'Collapse_' + createId('key');

        add({
            id,
            key: uniqueKey,
            label: 'CollapseItem' + index,
            icon : <PlusOutlined />
        });
        // 生成默认配置
        const { config, events, methods = [] }: any = CollapseConfig || {};
        addChildElements({
            type: 'CollapseItem',
            name: '子页签',
            parentId: selectedElement?.id,
            id,
            config: {
                ...config,
                props: {
                    ...config.props,
                    key: uniqueKey,
                    label: 'CollapseItem' + index,
                     icon :<PlusOutlined />
                },
            },
            events,
            methods,
        });

        if (selectedElement?.id) {
            const items = form.getFieldValue(['items']) || [];
            editElement({
                id: selectedElement.id,
                type: 'props',
                props: {
                    ...(form.getFieldValue([]) || {}),
                    items,
                },
            });
        }
    };
    // 删除批量操作按钮
    const handleDelete = (remove: any, name: number) => {
        // 获取当前 items 数据
        const items = form.getFieldValue(['items']) || [];

        const CollapseItemId = items[name]?.id;
        if (CollapseItemId) {
            removeElements(CollapseItemId);
        }
        // 从 Form.List 中删除
        remove(name);

        if (selectedElement?.id) {
            const updatedItems = form.getFieldValue(['items']) || [];
            editElement({
                id: selectedElement.id,
                type: 'props',
                props: {
                    ...(form.getFieldValue([]) || {}),
                    items: updatedItems,
                },
            });
        }
    };
    return (
        <>
            <Form.List name={['items']}>
                {(fields, { add, remove }) => (
                    <>
                        {fields.map(({ key, name, ...restField }) => (
                            <Space key={key} align="baseline">
                                <Form.Item {...restField} labelCol={{ span: 12 }} name={[name, 'label']} label="标签名称">
                                    <Input placeholder="标签名称" />
                                </Form.Item>
                                <Form.Item {...restField} labelCol={{ span: 12 }} name={[name, 'icon']} label="标签图标">
                                    <IconSelect placeholder={'请选择图标'}/>
                                </Form.Item>
                                <DeleteOutlined onClick={() => handleDelete(remove, name)} />
                            </Space>
                        ))}
                        <div style={{ padding: '0 10px 10px' }}>
                            <Button type="primary" block ghost onClick={() => handleCreate(add, fields.length + 1)} icon={<PlusOutlined />}>
                                新增标签
                            </Button>
                        </div>
                    </>
                )}
            </Form.List>
        </>
    );
});
export default ActionSetting;
