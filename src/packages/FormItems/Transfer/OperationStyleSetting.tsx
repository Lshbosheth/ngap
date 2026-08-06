import MColorPicker from '@/components/ColorPicker';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Form, Space, Input } from 'antd';
import { memo } from 'react';
export default memo(({ name, label }: { name?: string | string[]; label?: string }) => {
    return (
        <Form.Item label={label || '操作栏的自定义样式'}>
            <Form.List name={name || 'color'}>
                {(fields, { add, remove }) => (
                    <>
                        {fields.map(({ key, name, ...restField }) => (
                            <Space key={key} style={{ display: 'flex', marginBottom: 8 }}>
                                <Form.Item noStyle {...restField} name={[name, 'key']}>
                                    <Input style={{ width: '80px' }} placeholder="请输入" />
                                </Form.Item>
                                <Form.Item noStyle {...restField} name={[name, 'value']}>
                                    <Input style={{ width: '80px' }} placeholder="请输入" />
                                </Form.Item>
                                <PlusOutlined onClick={() => add({}, name + 1)} />
                                {name > 0 && <MinusOutlined onClick={() => remove(name)} />}
                            </Space>
                        ))}
                    </>
                )}
            </Form.List>
        </Form.Item>
    );
});
