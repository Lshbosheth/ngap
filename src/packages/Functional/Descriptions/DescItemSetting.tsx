import { EditOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Form, FormInstance, Input, Space, Select } from 'antd';
import { message } from '@/utils/AntdGlobal';
import { memo, useRef, useState, useEffect } from 'react';
import ColumnSetting from './ItemEdit';
import request from './../../../utils/request';
/**
 * 描述列表配置
 */
const DescItemSetting = memo(({ form, config }: { form: FormInstance; config: any }) => {
    const columnRef = useRef<{ open: (index: number) => void }>();
    const [options, setOptions] = useState([
        { label: '名称', value: 'name' },
        { label: '类型', value: 'type' },
        { label: '归属省份', value: 'provId' },
        { label: '地区分布', value: 'createdAt' },
    ]);

    useEffect(() => {
        if (config?.api?.sourceType == 'api' && config?.api?.id) {
            request
                .post('/csf/appInterface/getInterfaceParamsAndCheck', { params: { interfaceId: config.api.id } })
                .then((data: any) => {
                    const options = data.beans.map((item: any) => {
                        return { label: item.name, value: item.value };
                    });
                    setOptions(options);
                })
                .catch(() => {
                    message.error('接口返回错误，请检查');
                });
        }else if (config?.api?.sourceType == 'json') {
            const sourceData = config?.api?.source?.[0] || []
            const apiSelectOptions = Object.keys(sourceData).map((item) => {
                return { label: item, value: item };
            });
            setOptions(apiSelectOptions);

        } else if (config?.api?.sourceType == 'variable') {
            const sourceData = config?.api?.source?.[0] || []

            const apiSelectOptions = Object.keys(sourceData).map((item) => {
                return { label: item, value: item };
            });
            setOptions(apiSelectOptions);
        }
    }, [config?.api]);

    // 设置
    const handleOpen = (index: number) => {
        columnRef.current?.open(index);
    };
    // 更新
    const handleUpdate = (values: any, index: number) => {
        form.setFieldValue(['items', index], values);
    };
    return (
        <>
            <Form.List name={['items']}>
                {(fields, { add, remove }) => (
                    <>
                        {fields.map(({ key, name, ...restField }) => (
                            <Space key={key} style={{ display: 'flex', marginBottom: 8, padding: '0 10px' }} align="baseline">
                                <Form.Item {...restField} wrapperCol={{ span: 22 }} name={[name, 'label']}>
                                    <Input placeholder="项名称" style={{ width: '80px' }} />
                                </Form.Item>
                                <Form.Item wrapperCol={{ span: 22 }} name={[name, 'name']} noStyle>
                                    <Select
                                        placeholder="请选择列"
                                        options={options}
                                        onChange={(option) => {
                                            // 当选中一个选项时，更新对应的 name
                                            form.setFieldsValue({
                                                [name]: {
                                                    name: option?.value,
                                                },
                                            });
                                        }}
                                        // 从表单中读取 name 字段
                                        value={form.getFieldValue([name, 'name'])}
                                        style={{ width: '90px' }}
                                    />
                                </Form.Item>
                                <Form.Item {...restField} wrapperCol={{ span: 22 }} name={[name, 'name']} hidden>
                                    <Input placeholder="项字段" style={{ width: '100%' }} />
                                </Form.Item>
                                <EditOutlined onClick={() => handleOpen(name)} />
                                <PlusOutlined onClick={() => add({ label: '-', name: `name${name + 1}`, span: 1 }, name + 1)} />
                                <MinusOutlined onClick={() => remove(name)} />
                            </Space>
                        ))}
                    </>
                )}
            </Form.List>
            <ColumnSetting columnRef={columnRef} update={handleUpdate} form={form} options={options} />
        </>
    );
});
export default DescItemSetting;
