import { Form, FormInstance } from "antd";
import React from "react";
import ColorPicker from "@/packages/components/ColorPicker/ColorPicker";

export default function ColorPickerSetting({label, name, form ,dataSource}: {label:string, name: string ; form: FormInstance ;dataSource:any[]}) {
    const initialValue = form.getFieldValue(name as any)
    return (
        <Form.Item name={name} label={label} initialValue={initialValue} labelCol={{span:8}} wrapperCol={{span:15}}>
            <ColorPicker dataSource={dataSource}/>
        </Form.Item>
    );
}
