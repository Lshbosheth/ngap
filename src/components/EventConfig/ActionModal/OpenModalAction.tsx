import { Form, Select, Divider } from 'antd';
import styles from './index.module.less';
import { useAppContext } from './../../../utils/AppProvider';
import { useShallow } from 'zustand/react/shallow';
const OpenModalAction = () => {
    // 页面组件
    const { pageStore } = useAppContext();
    const { modals } = pageStore(
        useShallow((state: any) => {
        const modals: { id: string; title: string; elementAlias?: string; name?: string }[] = [];
        Object.values(state?.page?.pageData?.elementsMap || {}).forEach((item: any) => {
            if (item.type === 'Modal') {
                const rawTitle = item?.config?.props?.title || '';
                const title = typeof rawTitle === 'string' ? rawTitle : rawTitle.type === 'static' ? rawTitle.value : '动态标题';
                const cleanTitle = /<[^>]*>/.test(title) ? '弹框' : title;
                modals.push({
                    id: item.id,
                    title: cleanTitle,
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
                <p className={styles.descInfo}>触发一个按钮、表单等事件动作后，可以通过此行为来打开一个弹框，前提是需要先创建一个弹框。</p>
                <Divider />
            </div>
            <Form.Item label="选择弹框" name={'target'} rules={[{ required: true, message: '请选择弹框组件' }]}>
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
export default OpenModalAction;
