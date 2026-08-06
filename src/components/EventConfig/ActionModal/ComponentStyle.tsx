import {Divider, Form, FormInstance, Input, TreeSelect, ColorPicker} from "antd";
import styles from './index.module.less';
import {useAppContext} from "@/utils/AppProvider";
import {useShallow} from "zustand/react/shallow";
import {useMemo, useState} from "react";
import MColorPicker from "@/components/ColorPicker";

const ComponentStyle = ({form}: { form: FormInstance }) => {
    const {pageStore} = useAppContext();
    // 页面组件
    const state = pageStore();

    const {elements} = pageStore(
        useShallow((state: any) => ({
            elements: state?.page?.pageData?.elements || [],
        })),
    );

    const processedTreeData = useMemo(() => {
        const processNode = (node: any): any => {
            const title = `${node.id}（${node.config?.props?.elementAlias || node.name}）`;
            const processedNode = {...node, title};

            if (node.elements && node.elements.length > 0) {
                processedNode.elements = node.elements.map(processNode);
            }

            return processedNode;
        };

        return elements.map(processNode);
    }, [elements]);

    return <div>
        <div className={styles.desc}>
            <h3 className={styles.descTitle}>说明</h3>
            <p className={styles.descInfo}>触发事件动作后，可以改造指定目标组件的对应样式</p>
            <Divider/>
        </div>

        <Form.Item label="目标组件" name={'target'} rules={[{required: true, message: '请选择目标组件'}]}>
            <TreeSelect
                allowClear
                placeholder="请选择目标组件"
                treeDefaultExpandAll
                fieldNames={{label: 'title', value: 'id', children: 'elements'}}
                treeData={processedTreeData}
            />
        </Form.Item>

        <Form.Item label={'背景颜色'} name={'background'} initialValue={'#e6f4fe'}>
            <MColorPicker showText allowClear/>
        </Form.Item>
    </div>
}

export default ComponentStyle
