import { Form, Space, Input } from 'antd';
import { memo } from 'react';
export default memo(({ name, label }: { name?: string | string[]; label?: string }) => {
    return (
        <Form.Item label={label || '操作文案'} style={{ display: 'flex', marginBottom: 8 }}>
            <Form.List name={name || 'color'}>
                {(fields, { add }) => (
                    <>
                        {fields.map(({ ...restField }) => (
                            <Space>
                                <Form.Item style={{ display: 'inline-block', width: '60px)' }} {...restField}>
                                    <Input placeholder="请输入" />
                                </Form.Item>
                            </Space>
                        ))}
                    </>
                )}
            </Form.List>
        </Form.Item>
    );
});
