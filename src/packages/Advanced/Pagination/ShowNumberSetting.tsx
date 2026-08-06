import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Form, Space, InputNumber } from 'antd';
import { memo } from 'react';
export default memo(({ name, label }: { name?: string | string[]; label?: string }) => {
    return (
        <Form.Item label={label}>
            <Form.List name={name || 'color'}>
                {(fields, { add, remove }) => (
                    <>
                        {fields.map(({ key, name, ...restField }) => (
                            <Space key={key} style={{ display: 'flex', marginBottom: 8 }}>
                                <Form.Item noStyle {...restField} name={[name, 'label']}>
                                    <InputNumber placeholder="0" />
                                </Form.Item>
                                <PlusOutlined onClick={() => add({ label: 0 }, name + 1)} />
                                {name > 0 && <MinusOutlined onClick={() => remove(name)} />}
                            </Space>
                        ))}
                    </>
                )}
            </Form.List>
        </Form.Item>
    );
});
