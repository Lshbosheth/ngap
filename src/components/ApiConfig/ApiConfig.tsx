import { useEffect, useRef, useState } from 'react';
import { useDebounceFn } from 'ahooks';
import { Button, Form, FormInstance, Input, Select, Tooltip, TreeSelect, Space } from 'antd';
import { EditOutlined, QuestionCircleOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import SettingModal from './components/SettingModal';
import styles from './index.module.less';
import { useAppContext } from './../../utils/AppProvider';
import { apiListInfo } from './../../stores/apiListStore';
import VsEditor from '../VsEditor';
import VariableBind from '../VariableBind/VariableBind';

const ApiConfigComponent = () => {
    const { pageStore } = useAppContext();
    const state = pageStore();
    const [form] = Form.useForm();
    const [sourceType, setSourceType] = useState('json');
    const modalRef = useRef<{ showModal: (id?: string) => void }>();

    useEffect(() => {
        form.resetFields();
        let values: any = undefined;
        // 如果未选中，则填充页面接口配置
        if (!state.selectedElement) {
            values = state?.page?.pageData?.config?.api || {};
        } else {
            // 如果选中，填充组件接口配置
            values = state?.page?.pageData?.elementsMap?.[state.selectedElement.id]?.config?.api || {};
        }
        setSourceType(values?.sourceType || 'json');
        const source = JSON.stringify(values?.source || '', null, 2);
        form.setFieldsValue({ sourceType: 'json', id: '', sourceField: '', params: [{ name: '' }], ...values, source });
    }, [state.selectedElement]);

    // 设置数据源类型
    const handleChange = (val: string) => {
        setSourceType(val);
    };

    // 接口设置
    function showModal() {
        modalRef.current?.showModal(form.getFieldValue('id'));
    }

    // 采用防抖，防止表单频繁更新
    const { run } = useDebounceFn(
        () => {
            handleUpdate(form.getFieldValue('id'));
        },
        { wait: 800 },
    );

    // 更新接口配置
    const handleUpdate = (id: string) => {
        const apiConfig = form.getFieldsValue();
        let source = [];
        try {
            source = JSON.parse(apiConfig.source);
        } catch (error) {
            console.error(error);
            source = [];
        }
        if (state.selectedElement?.id) {
            const payload = {
                id: state.selectedElement?.id,
                type: 'api',
                api: {
                    ...apiConfig,
                    id,
                    source,
                },
            };
            state.editElement(payload);
        } else {
            const payload = {
                type: 'api',
                api: {
                    ...apiConfig,
                    id,
                    source,
                },
            };
            state.savePageInfo(payload);
        }
        if (id) {
            form.setFieldValue('id', id);
        }
    };

    return (
        <Form form={form} labelCol={{ span: 8 }} wrapperCol={{ span: 15 }} labelAlign="right" onValuesChange={run} autoComplete="off">
            <h2 className={styles.title}>
                <span>数据源配置</span>
                <Tooltip title="支持mock数据、接口请求和变量绑定">
                    <QuestionCircleOutlined style={{ marginLeft: 5 }} />
                </Tooltip>
            </h2>
            <Form.Item label="数据来源" name="sourceType">
                <Select onChange={(val: string) => handleChange(val)}>
                    <Select.Option value="json">静态数据</Select.Option>
                    <Select.Option value="api">接口请求</Select.Option>
                    <Select.Option value="variable">动态变量</Select.Option>
                </Select>
            </Form.Item>
            <Form.Item noStyle shouldUpdate>
                {(form: FormInstance) => {
                    const sourceType = form.getFieldValue('sourceType');
                    if (sourceType === 'json') {
                        return (
                            <>
                                <Form.Item name="source" noStyle>
                                    <VsEditor height="300px" language="json" />
                                </Form.Item>
                                <Form.Item
                                    label="数据处理"
                                    name="sourceField"
                                    tooltip="示例：{ code:0 ,data:{ list: [], total: 10 } } ，字段对应是list，默认可不填。"
                                >
                                    <VariableBind placeholder="返回值字段映射,eg: data.list" />
                                </Form.Item>
                            </>
                        );
                    }
                    if (sourceType === 'api') {
                        return (
                            <>
                                <Form.Item label="请求地址" name="id">
                                    <ApiInput showModal={showModal} />
                                </Form.Item>
                                <Form.Item label="发送参数">
                                    <Form.List name="params">
                                        {(fields, { add, remove }) => (
                                            <>
                                                {fields.map(({ name }, index) => (
                                                    <Space
                                                        align="baseline"
                                                        style={{ marginBottom: fields.length === index + 1 ? 0 : 10, alignItems: 'center' }}
                                                        key={`header-${index}`}
                                                    >
                                                        <Form.Item name={[name, 'key']} noStyle>
                                                            <Input placeholder="请输入参数名" />
                                                        </Form.Item>
                                                        <Form.Item name={[name, 'value']} noStyle>
                                                            <VariableBind placeholder="请输入参数值" />
                                                        </Form.Item>
                                                        <PlusOutlined onClick={() => add({ key: '', value: '' })} />
                                                        {index > 0 && (
                                                            <MinusCircleOutlined
                                                                onClick={() => {
                                                                    remove(name);
                                                                }}
                                                            />
                                                        )}
                                                    </Space>
                                                ))}
                                            </>
                                        )}
                                    </Form.List>
                                </Form.Item>
                                {/* <Form.Item
                                    label="数据处理"
                                    name="sourceField"
                                    tooltip="示例：{ code:0 ,data:{ list: [], total: 10 } } ，字段对应是data.list."
                                >
                                    <VariableBind type="dataResult" placeholder="字段映射,eg: data.list" />
                                </Form.Item> */}
                                <Form.Item name="source" hidden>
                                    <VsEditor height="350px" language="json" />
                                </Form.Item>
                            </>
                        );
                    }
                    if (sourceType === 'variable') {
                        return (
                            <>
                                <Form.Item label="绑定变量" tooltip="绑定变量输出结果示例在下方展示，可修改变量处理结果用于属性选择" name="name">
                                    <VariableBind readOnly placeholder="数据源所对应的变量处理" />
                                </Form.Item>
                                <Form.Item name="source" noStyle>
                                    <VsEditor height="300px" language="json" />
                                </Form.Item>
                            </>
                        );
                    }
                }}
            </Form.Item>
            {/* 接口设置弹框 */}
            <SettingModal update={handleUpdate} ref={modalRef}></SettingModal>
        </Form>
    );
};

/**
 * 接口输入框
 */
function ApiInput({ value, onChange, showModal }: any) {
    const apiList = apiListInfo((state: any) => state.apiList);
    return (
        <>
            <TreeSelect
                className={styles.apiTreeData}
                showSearch
                value={value}
                placeholder="请选择接口"
                treeNodeFilterProp="title"
                treeDefaultExpandAll
                allowClear
                treeData={apiList}
                onChange={(val: string) => onChange(val)}
            ></TreeSelect>
            {/* <Button className={styles.apiButton} type="link" onClick={showModal} icon={<EditOutlined />}></Button> */}
        </>
    );
}

export default ApiConfigComponent;
