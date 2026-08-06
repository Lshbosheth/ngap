import { memo, forwardRef, useEffect } from 'react';
import { Form, Input } from 'antd';

const BasicConfig = () => {
    return (
        <Form.Item label="唯一性字段:" name="uniqueField">
            <Input></Input>
        </Form.Item>
    );
};
export default memo(forwardRef(BasicConfig));
