import { Form, Divider, Radio, TreeSelect } from 'antd';
import VariableBind from './../../../components/VariableBind/VariableBind';
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import styles from './index.module.less';
import { useAppContext } from './../../../utils/AppProvider';
/**
 * 显示确认弹框
 * @returns
 */
const VisibleAction = () => {
    const { pageStore } = useAppContext();
    const { elements } = pageStore(
        useShallow((state: any) => ({
            elements: state.page.pageData.elements,
        })),
    );
    // 在treeData的useMemo中添加标题处理逻辑
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
                <p className={styles.descInfo}>触发事件动作后，可以指定目标组件显示和隐藏。</p>
                <Divider />
            </div>
            <Form.Item label="目标组件" name={'target'} rules={[{ required: true, message: '请选择目标组件' }]}>
                <TreeSelect
                    allowClear
                    multiple
                    treeCheckable
                    treeCheckStrictly
                    maxTagCount={'responsive'}
                    showCheckedStrategy={TreeSelect.SHOW_ALL}
                    treeData={processedTreeData}
                    fieldNames={{ label: 'title', value: 'id', children: 'elements' }}
                    placeholder="请选择目标组件"
                />
            </Form.Item>
            <Form.Item label="显示类型" name="showType">
                <Radio.Group>
                    <Radio value="static">静态</Radio>
                    <Radio value="expression">表达式</Radio>
                </Radio.Group>
            </Form.Item>
            <Form.Item noStyle shouldUpdate>
                {(form: any) => {
                    const showType = form.getFieldValue('showType');
                    return showType === 'static' ? (
                        <Form.Item label="显示结果" name="showResult">
                            <Radio.Group>
                                <Radio value="show">显示</Radio>
                                <Radio value="hidden">隐藏</Radio>
                            </Radio.Group>
                        </Form.Item>
                    ) : (
                        <Form.Item label="表达式" name={'expression'}>
                            <VariableBind />
                        </Form.Item>
                    );
                }}
            </Form.Item>
        </>
    );
};
export default VisibleAction;
