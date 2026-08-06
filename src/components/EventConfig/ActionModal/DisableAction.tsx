import { Form, Divider, Radio, TreeSelect } from 'antd';
import styles from './index.module.less';
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import VariableBind from './../../../components/VariableBind/VariableBind';
import { useAppContext } from './../../../utils/AppProvider';
/**
 * 显示确认弹框
 * @returns
 */
const DisableAction = () => {
    const { pageStore } = useAppContext();
    const { elements } = pageStore(
        useShallow((state: any) => ({
            elements: state.page.pageData.elements,
        })),
    ); // 在treeData的useMemo中添加标题处理逻辑
    const processedTreeData = useMemo(() => {
        const processNode = (node: any): any => {
            const title = `${node.id}（${node.config?.props?.elementAlias || node.name}）`;
            const processedNode = { ...node, title };

            if (node.elements && node.elements.length > 0) {
                processedNode.elements = node.elements.map(processNode);
            }

            return processedNode;
        };

        return elements.map(processNode);
    }, [elements]);
    return (
        <>
            <div className={styles.desc}>
                <h3 className={styles.descTitle}>说明</h3>
                <p className={styles.descInfo}>触发事件动作后，可以指定目标组件禁用，目前主要用于表单组件和按钮组件。</p>
                <Divider />
            </div>
            <Form.Item label="目标组件" name={'target'} rules={[{ required: true, message: '请选择目标组件' }]}>
                <TreeSelect
                    allowClear
                    treeData={processedTreeData}
                    fieldNames={{ label: 'title', value: 'id', children: 'elements' }}
                    placeholder="请选择目标组件"
                />
            </Form.Item>
            <Form.Item label="禁用类型" name="disableType">
                <Radio.Group>
                    <Radio value="static">静态</Radio>
                    <Radio value="expression">表达式</Radio>
                </Radio.Group>
            </Form.Item>
            <Form.Item noStyle shouldUpdate>
                {(form: any) => {
                    const showType = form.getFieldValue('disableType');
                    return showType === 'static' ? (
                        <Form.Item label="禁用结果" name="disableResult">
                            <Radio.Group>
                                <Radio value={false}>启用</Radio>
                                <Radio value={true}>禁用</Radio>
                            </Radio.Group>
                        </Form.Item>
                    ) : (
                        <Form.Item label="表达式" name={'expression'} tooltip="表达式需要返回布尔类型，true为禁用，false为启用">
                            <VariableBind readOnly />
                        </Form.Item>
                    );
                }}
            </Form.Item>
        </>
    );
};
export default DisableAction;
