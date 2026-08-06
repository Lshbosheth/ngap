import { Form, Select, Divider } from 'antd';
import styles from './index.module.less';
import { useAppContext } from './../../../utils/AppProvider';

const ClosePopoverAction = () => {
    const { pageStore } = useAppContext();
    const { popovers } = pageStore((state: any) => {
        const popovers: { id: string; name: string }[] = [];
        Object.values(state?.page?.pageData?.elementsMap || {}).forEach((item: any) => {
            if (item.type === 'Popover') {
                popovers.push({
                    id: item.id,
                    name: `气泡弹窗(${item.id})`,
                });
            }
        });
        return { popovers };
    });

    return (
        <>
            <div className={styles.desc}>
                <h3 className={styles.descTitle}>说明</h3>
                <p className={styles.descInfo}>触发一个按钮、表单等事件动作后，可以通过此行为来关闭一个已打开的气泡弹窗。</p>
                <Divider />
            </div>
            <Form.Item label="选择气泡弹窗" name={'target'} rules={[{ required: true, message: '请选择气泡弹窗组件' }]}>
                <Select>
                    {popovers.map((item: any) => (
                        <Select.Option key={item.id} value={item.id}>
                            {item.name}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>
        </>
    );
};

export default ClosePopoverAction;
