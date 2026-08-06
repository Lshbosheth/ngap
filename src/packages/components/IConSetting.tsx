import React from 'react';
import { Form, Select } from 'antd';
import * as icons from '@ant-design/icons';
import IconSelect from "@/packages/components/icon-select/IconSelect";

export const iconsList: { [key: string]: any } = icons;
/**
 * 公共图标设置
 */
export default function IConSetting({ name = 'icon', initalValue }: { name?: string | string[]; initalValue?: string }) {
    // 获取所有的antd图标，动态渲染到下拉框中
    return (
        <Form.Item label="按钮图标" name={name} initialValue={initalValue}>
            <IconSelect placeholder={'请选择按钮图标'}/>
        </Form.Item>
    );
}
