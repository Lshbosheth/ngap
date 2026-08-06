import MColorPicker from './../../../components/ColorPicker';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Form, Space, Input } from 'antd';
import { memo } from 'react';
export default memo(({ name, label }: { name?: string | string[]; label?: string }) => {
    return (
        <Form.Item label={label || '颜色'}>
            <Form.List name={name || 'color'}>
                {(fields, { add, remove }) => (
                    <>
                        {fields.map(({ key, name, ...restField }) => (
                            <Space key={key} style={{ display: 'flex', marginBottom: 8 }}>
                                <Form.Item noStyle {...restField} name={[name, 'label']}>
                                    <Input style={{ width: '55px' }} placeholder="0%" />
                                </Form.Item>
                                <Form.Item noStyle {...restField} name={[name, 'color']}>
                                    <MColorPicker style={{ width: '100px' }} />
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
