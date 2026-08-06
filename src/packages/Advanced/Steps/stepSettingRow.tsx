import React, { memo, useState } from 'react';
import { Form, Input, Space, Select, Switch, Splitter } from 'antd';
import * as icons from '@ant-design/icons';
import { DeleteOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import IconSelect from "@/packages/components/icon-select/IconSelect";
/**
 * 操作栏配置
 */
const TextArea = Input.TextArea;
const iconsList: { [key: string]: any } = icons;

const StepSetting = memo(
    ({
        key,
        name,
        index,
        remove,
        showMore,
        onChange,
        ...restField
    }: {
        key: string;
        index: number;
        name: 'string';
        remove: any;
        showMore: boolean;
        onChange: Function;
    }) => {
        // const [showMore, setShowMore] = useState(false);
        // 删除批量操作按钮
        const handleDelete = (remove: any, name: string) => {
            remove(name);
        };
        const toggleMore = (index: number) => {
            onChange(index);
        };
        console.log(restField);
        return (
            <>
                <Space key={key} align="baseline" wrap>
                    <Form.Item {...restField} labelCol={{ span: 12 }} name={[name, 'title']} label={`步骤标题 ${index}`}>
                        <Input placeholder={`步骤标题 ${index}`} />
                    </Form.Item>
                    <DeleteOutlined onClick={() => handleDelete(remove, name)} />
                    {showMore ? <UpOutlined onClick={() => toggleMore(index)} /> : <DownOutlined onClick={() => toggleMore(index)} />}
                </Space>
                {showMore ? (
                    <Splitter style={{ padding: '0 10px 10px 10px' }}>
                        <Splitter.Panel style={{ padding: '10px 0', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
                            <Form.Item {...restField} name={[name, 'subTitle']} label="子标题">
                                <Input placeholder="步骤子标题" />
                            </Form.Item>
                            <Form.Item {...restField} name={[name, 'description']} label="描述">
                                <TextArea placeholder="描述..." />
                            </Form.Item>
                            <Form.Item {...restField} name={[name, 'icon']} label="图标">
                                <IconSelect placeholder={'请选择图标'}/>
                            </Form.Item>
                            <Form.Item {...restField} name={[name, 'status']} label="状态">
                                <Select
                                    allowClear
                                    options={[
                                        { value: 'wait', label: 'wait' },
                                        { value: 'process', label: 'process' },
                                        { value: 'processing', label: 'processing' },
                                        { value: 'finish', label: 'finish' },
                                        { value: 'error', label: 'error' },
                                    ]}
                                />
                            </Form.Item>
                            {/* <Form.Item {...restField} label="禁用点击">
                                <Switch />
                            </Form.Item> */}
                        </Splitter.Panel>
                    </Splitter>
                ) : null}
            </>
        );
    },
);
export default StepSetting;
