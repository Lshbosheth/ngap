import { PlusOutlined, MinusOutlined, CloseCircleFilled, DeleteOutlined } from '@ant-design/icons';
import { Form, FormInstance, Input, Space, Card } from 'antd';
import { memo } from 'react';
import VariableBindInput from '../../../components/VariableBind/VariableBind';

/**
 * Iframe链接入参配置组件
 */
interface IframeParamsSettingProps {
    form: FormInstance;
    config?: any;
}

const IframeParamsSetting = memo(({ form, config }: IframeParamsSettingProps) => {
    return (
        <div style={{ padding: '0 10px' }}>
            <Form.List name="iframeParams">
                {(fields, { add, remove }) => (
                    <>
                        {fields.map(({ key, name, ...restField }) => (
                            <Card
                                key={key}
                                size="small"
                                style={{
                                    marginBottom: '8px',
                                    position: 'relative',
                                    border: '1px solid #d9d9d9',
                                    borderRadius: '2px',
                                }}
                                bodyStyle={{ padding: '12px' }}
                            >
                                {/* 右上角删除按钮 */}
                                <DeleteOutlined
                                    onClick={() => remove(name)}
                                    style={{
                                        position: 'absolute',
                                        top: '4px',
                                        right: '4px',
                                        color: '#ff4d4f',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        zIndex: 1,
                                    }}
                                />

                                {/* 入参字段 */}
                                <Form.Item
                                    {...restField}
                                    label="入参字段"
                                    name={[name, 'name']}
                                    rules={[{ required: true, message: '请输入参数名' }]}
                                    style={{ marginBottom: '12px' }}
                                >
                                    <Input placeholder="请输入参数名" />
                                </Form.Item>

                                {/* 入参参数 */}
                                <Form.Item
                                    {...restField}
                                    label="入参参数"
                                    name={[name, 'value']}
                                    rules={[{ required: true, message: '请输入参数值' }]}
                                    style={{ marginBottom: 0 }}
                                >
                                    <VariableBindInput placeholder="请输入参数值或选择变量" />
                                </Form.Item>
                            </Card>
                        ))}

                        {/* 添加参数按钮 */}
                        <div
                            onClick={() => add({ name: '', value: { type: 'static', value: '' } })}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                color: '#0085d0',
                                cursor: 'pointer',
                                fontSize: '12px',
                                padding: '4px 0',
                            }}
                        >
                            <PlusOutlined style={{ marginRight: '4px' }} />
                            添加参数
                        </div>
                    </>
                )}
            </Form.List>
        </div>
    );
});

export default IframeParamsSetting;
