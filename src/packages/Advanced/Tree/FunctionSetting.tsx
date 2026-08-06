import { Form } from 'antd';
import VsEditor from './../../../components/VsEditor';

/**
 * 自定义渲染
 */
export default function FunctionSetting() {
    return (
        <>
            <Form.Item label={'筛选'} tooltip="通过自定义代码编辑的方式筛选目录树的节点数据。"></Form.Item>
            <Form.Item name="filterTreeNode" noStyle>
                <VsEditor />
            </Form.Item>
            {/* <Form.Item label={'拖拽位置'} tooltip="是否允许拖拽时放置在该节点"></Form.Item>
            <Form.Item name="allowDrop" noStyle>
                <VsEditor />
            </Form.Item> */}
        </>
    );
}
