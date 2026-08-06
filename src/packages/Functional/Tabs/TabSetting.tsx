import { memo } from 'react';
import { Form, Space, Button, FormInstance } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { createId } from './../../../utils/util';
import TabConfig from './../Tab/Schema';
import { useAppContext } from './../../../utils/AppProvider';
import { useShallow } from 'zustand/react/shallow';
import VariableBindInput from "@/components/VariableBind/VariableBind"

/**
 * 操作栏配置
 */
const ActionSetting = memo(({ form }: { form: FormInstance }) => {
    const { pageStore } = useAppContext();
    const { selectedElement, addChildElements, removeElements, editElement } = pageStore(
        useShallow((state: any) => ({
            selectedElement: state.selectedElement,
            addChildElements: state.addChildElements,
            removeElements: state.removeElements,
            editElement: state.editElement,
        }))
    );
    // 创建批量操作按钮
    const handleCreate = (add: any, index: number) => {
        const id = createId('Tab');

        add({
            id,
            key: id,
            label: '页签' + index,
            hidden:false,
        });

        // 生成默认配置
        const { config, events, methods = [] }: any = TabConfig || {};
        addChildElements({
            type: 'Tab',
            name: '子页签',
            parentId: selectedElement?.id,
            id,
            config: {
                ...config,
                props: {
                    ...config.props,
                    key: id,
                    label: '页签' + index,
                    hidden:false,
                },
            },
            events,
            methods,
        });
        // 同步更新 Tabs 组件的 items
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
        // 获取要删除的 Tab 的 id
        const tabId = items[name]?.id;
        if (tabId) {
            // 从 pageStore 中删除对应的 Tab 子组件
            removeElements(tabId);
        }
        // 从 Form.List 中删除
        remove(name);
        // 同步更新 Tabs 组件的 items
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
                            <TabNameItemForm
                                key={key}
                                name={name}
                                remove={remove}
                                restField={restField}
                                form={form}
                                selectedElementID={selectedElement?.id}
                                removeElements={removeElements}
                                editElement={editElement}
                            />
                        ))}
                        <div style={{ padding: '0 10px 10px' }}>
                            <Button type="primary" block ghost onClick={() => handleCreate(add, fields.length + 1)} icon={<PlusOutlined />}>
                                新增
                            </Button>
                        </div>
                    </>
                )}
            </Form.List>
        </>
    );
});
export default ActionSetting;

interface TabNameItemFormProps {
    form: FormInstance
    name:number
    restField: any
    remove: any
    selectedElementID:any
    removeElements:(data: any)=>void
    editElement: (payload: any) => void;
}


function TabNameItemForm(props:TabNameItemFormProps) {
    const {name,form,remove,  restField,selectedElementID, removeElements, editElement} = props

    const showStatus = Form.useWatch(['items', name, 'hidden'],form)

    // 删除批量操作按钮
    const handleDelete = (remove: any, name: number) => {
        // 获取当前 items 数据
        const items = form.getFieldValue(['items']) || [];
        // 最后一个不允许删除
        if (items.length <= 1) {
            return;
        }
        // 获取要删除的 Tab 的 id
        const tabId = items[name]?.id;
        if (tabId) {
            // 从 pageStore 中删除对应的 Tab 子组件
            removeElements(tabId);
        }
        // 从 Form.List 中删除
        remove(name);

        updateTabs()

    };

    // 同步更新 Tabs 组件的 items
    function updateTabs() {
        if (selectedElementID) {
            const updatedItems = form.getFieldValue(['items']) || [];
            editElement({
                id: selectedElementID,
                type: 'props',
                props: {
                    ...(form.getFieldValue([]) || {}),
                    items: updatedItems,
                },
            });
        }
    }

    // 页签显示/隐藏状态切换
    function onToggleTabItem() {
        form.setFieldValue(['items', name, 'hidden'],!showStatus)
        updateTabs()

    }


    return (
        <Space  align="baseline">
            <Form.Item {...restField} labelCol={{ span: 12 }} name={[name, 'label']} label="页签" tooltip='支持html字符串配置,如页签<span style="color:red">1</span>'>
                <VariableBindInput placeholder="页签名称" />
            </Form.Item>
            {!showStatus?<EyeOutlined onClick={onToggleTabItem} />:<EyeInvisibleOutlined onClick={onToggleTabItem} />}
            <DeleteOutlined onClick={() => handleDelete(remove, name)} />
        </Space>
    )
}
