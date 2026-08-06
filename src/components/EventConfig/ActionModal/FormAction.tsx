import { Form, Select, Divider } from 'antd';
import styles from './index.module.less';
import { useAppContext } from './../../../utils/AppProvider';
import { useShallow } from 'zustand/react/shallow';
const FormAction = () => {
    // 页面组件
    const { pageStore } = useAppContext();
    const { modals } = pageStore(
        useShallow((state: any) => {
        const modals: { id: string; elementAlias?: string; name?: string }[] = [];
        Object.values(state?.page?.pageData?.elementsMap || {}).forEach((item: any) => {
            if (item.type === 'SearchForm' || item.type === 'Form') {
                modals.push({
                    id: item.id,
                    elementAlias: item.config?.props?.elementAlias || '',
                    name: item.name,
                });
            }
        });
        return {
            modals,
        };
        })
    );

    return (
        <>
            <div className={styles.desc}>
                <h3 className={styles.descTitle}>说明</h3>
                <p className={styles.descInfo}>触发一个事件动作后，可以选择目标表单，调用该表单方法。</p>
                <Divider />
            </div>
            <Form.Item label="选择表单" name={'target'} rules={[{ required: true, message: '请选择表单组件' }]}>
                <Select>
                    {modals.map((item: any) => (
                        <Select.Option key={item.id} value={item.id}>
                            {`${item.id}（${item.elementAlias || item.name}）`}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>
        </>
    );
};
export default FormAction;
