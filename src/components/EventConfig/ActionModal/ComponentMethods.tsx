import { Form, TreeSelect, Divider, Select, Input, FormInstance } from 'antd';
import { useEffect, useState, useMemo } from 'react';
import { ComponentMethodParams, ComponentMethodType } from './../../../packages/types';
import { useShallow } from 'zustand/react/shallow';
import styles from './index.module.less';
import VariableBind from './../../../components/VariableBind/VariableBind';
import { useAppContext } from './../../../utils/AppProvider';
/**
 * 调用各个组件暴露的方法
 * @returns
 */
const ComponentMethods = ({ form }: { form: FormInstance }) => {
    const { pageStore } = useAppContext();
    // 页面组件
    const state = pageStore();
    const targetStatus = Form.useWatch('target', form);
    const targetMethodStatus = Form.useWatch('method', form);

    const [methods, setMethods] = useState<ComponentMethodType[]>([]);
    const [methodParams, setMethodParams] = useState<ComponentMethodParams[]>([]);
    const { elements } = pageStore(
        useShallow((state: any) => ({
            elements: state?.page?.pageData?.elements || [],
        })),
    );
    useEffect(() => {
        const target = form.getFieldValue('target');
        if (!target) return;
        const element = state?.page?.pageData?.elementsMap?.[target];
        if (!element) return;
        setMethods(element.methods || []);
    }, [form?.getFieldValue('target')]);

    useEffect(()=>{
        handleChangeMethod(form?.getFieldValue('method'))
    },[form?.getFieldValue('method'),methods])

    const targetSelectElementList = useMemo(() => {
        if (!targetStatus) return [];
        const element = state?.page?.pageData?.elementsMap?.[targetStatus];
        if (element && element.type === 'Collapse' && ['setOpenCollapse', 'setCloseCollapse'].includes(targetMethodStatus)) {
            const list = element.config?.props?.items || [];
            return list.map((item: any) => {
                let label = typeof item.label === 'string' ? item.label : '';
                if (typeof item.label === 'object') {
                    if (item.label.type === 'static') {
                        label = item.label.value || '';
                    } else if (item.label.type === 'variable') {
                        label = item.label.value || '';
                    }
                }
                return { label, value: item.id };
            });
        }
        return [];
    }, [targetStatus, targetMethodStatus]);

    const handleChange = (value: string) => {
        const element = state?.page?.pageData?.elementsMap?.[value];
        if (!element) return;
        setMethods(element.methods || []);
    };

    const update = (methodName?: string) => {
        form.setFieldValue('methodName', methodName);
    };

    const handleChangeMethod = (value: string) => {
        const targetMethod = methods.find((item) => item.name === value);
        if (!targetMethod) return;
        update(targetMethod?.title);
        setMethodParams(targetMethod?.params || []);
    };
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

    // 手动设置参数大 form
    function setTargetSelectParams(values: string[]) {
        const paramsValue = values.join(',');
        form.setFieldValue('data', [{
            key: 'activeKey',
            value: {
                type: 'static',
                value: paramsValue,
            },
        }]);
    }

    return (
        <>
            <div className={styles.desc}>
                <h3 className={styles.descTitle}>说明</h3>
                <p className={styles.descInfo}>事件触发后，可以调用目标组件提供的方法，并自动传入参数。比如：表格的搜索、表单的提交、重置等。</p>
                <Divider />
            </div>
            <Form.Item label="目标组件" name={'target'} rules={[{ required: true, message: '请选择目标组件' }]}>
                <TreeSelect
                    allowClear
                    placeholder="请选择目标组件"
                    treeDefaultExpandAll
                    fieldNames={{ label: 'title', value: 'id', children: 'elements' }}
                    treeData={processedTreeData}
                    onChange={handleChange}
                />
            </Form.Item>
            <Form.Item label="组件方法" name={'method'} rules={[{ required: true, message: '请选择调用的方法' }]}>
                <Select placeholder="请选择要调用的组件方法">
                    {methods.map((item) => (
                        <Select.Option key={item.name} value={item.name}>
                            {item.title}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>
            {/* 给折叠面板增加 选择子元素的功能 */}
            {!!targetSelectElementList.length && (
                <Form.Item label="选择目标元素" name={'targetSelectList'} rules={[{ required: true, message: '请选择目标元素' }]}>
                    <Select
                        mode="multiple"
                        allowClear
                        options={targetSelectElementList}
                        placeholder="请选择目标元素"
                        onChange={setTargetSelectParams}
                    />
                </Form.Item>
            )}

            {methodParams.map((item, index) => (
                <Form.Item
                    label={item.title}
                    name={['params', item.name]}
                    rules={[{ required: item.required || false, message: '请选择调用的方法' }]}
                    key={'params' + index}
                >
                    {item.type === 'select' ? <Select placeholder="请选择" options={item.options} /> : <VariableBind placeholder="参数值" />}
                </Form.Item>
            ))}

            <Form.Item label="方法名称" name={'methodName'} hidden>
                <Input />
            </Form.Item>
        </>
    );
};
export default ComponentMethods;
