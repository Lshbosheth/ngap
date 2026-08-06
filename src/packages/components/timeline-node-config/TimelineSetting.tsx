import { Form, FormInstance } from "antd";
import React from "react";
import TimelineConfig from "@/packages/components/timeline-node-config/TimelineConfig";

export default function TimelineSetting({ name, form }: { name: string ; form: FormInstance }) {
    const initialValue = form.getFieldValue(name as any)
    return (
        <Form.Item name={name} initialValue={initialValue} labelCol={{span:0}} wrapperCol={{span:24}}>
            <TimelineConfig/>
        </Form.Item>
    );
}
