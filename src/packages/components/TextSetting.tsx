import { Form } from 'antd';
import VsEditor from './../../components/VsEditor';

/**
 * 自定义渲染
 */
export default function TextSetting({ label, name }: { label: string; name: string | string[] }) {
    return (
        <>
            <Form.Item label={label} tooltip="可针对当前展示内容通过自定义编码方式进行重新输出"></Form.Item>
            <Form.Item name={name} noStyle>
                <VsEditor />
            </Form.Item>
        </>
    );
}
