import { memo } from 'react';
import { Form, Space, Button, FormInstance } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { createId } from './../../../utils/util';
import CollapseConfig from './CollapseItemSchema';
import { useAppContext } from './../../../utils/AppProvider';
import VariableBindInput from '@/components/VariableBind/VariableBind';

/**
 * 操作栏配置
 */
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

        add({
            id,
            key: id,
            label: '折叠面板' + index,
            hidden: false
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
                    key: id,
                    label: '折叠面板' + index,
                    hidden:false,
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


    return (
        <>
            <Form.List name={['items']}>
                {(fields, { add, remove }) => (
                    <>
                        {fields.map(({ key, name, ...restField }) => (
                            <CollapseNameItemForm
                                key={key}
                                form={form}
                                name={name}
                                restField={restField}
                                remove={remove}
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

interface CollapseNameItemFormProps {
    form: FormInstance;
    name: number;
    restField: any;
    remove: any;
    selectedElementID: any;
    removeElements: (data: any) => void;
    editElement: (payload: any) => void;
}

function CollapseNameItemForm(props: CollapseNameItemFormProps) {
    const { name, form, remove, restField, selectedElementID, removeElements, editElement } = props;
    const showStatus = Form.useWatch(['items', name, 'hidden'], form);

    // 删除批量操作按钮
    const handleDelete = (remove: any, name: number) => {
        // 获取当前 items 数据
        const items = form.getFieldValue(['items']) || [];

        // 最后一个不允许删除
        if (items.length <= 1) {
            return;
        }

        const CollapseItemId = items[name]?.id;
        if (CollapseItemId) {
            // 从 pageStore 删除对应的 Tab 子组件
            removeElements(CollapseItemId);
        }
        // 从 Form.List 中删除
        remove(name);

        updateTabs();
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
        form.setFieldValue(['items', name, 'hidden'], !showStatus);
        updateTabs();
    }
    return (
        <Space align="baseline">
            <Form.Item {...restField} labelCol={{ span: 12 }} name={[name, 'label']} label="页签">
                <VariableBindInput placeholder="页签名称" />
            </Form.Item>
            {!showStatus ? <EyeOutlined onClick={onToggleTabItem} /> : <EyeInvisibleOutlined onClick={onToggleTabItem} />}
            <DeleteOutlined onClick={() => handleDelete(remove, name)} />
        </Space>
    );
}
