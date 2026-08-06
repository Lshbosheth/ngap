import { Form, Select, Divider, Input } from 'antd';
import styles from './index.module.less';
import { useAppContext } from './../../../utils/AppProvider';

const OpenPopoverAction = () => {
    const { pageStore } = useAppContext();
    const { selectedElement } = pageStore((state: any) => ({
        selectedElement: state?.selectedElement,
    }));

    const { popovers } = pageStore((state: any) => {
        const popovers: { id: string; elementAlias?: string; name?: string }[] = [];
        Object.values(state?.page?.pageData?.elementsMap || {}).forEach((item: any) => {
            if (item.type === 'Popover') {
                popovers.push({
                    id: item.id,
                    elementAlias: item.config?.props?.elementAlias || '',
                    name: item.name,
                });
            }
        });
        return { popovers };
    });

    return (
        <>
            <div className={styles.desc}>
                <h3 className={styles.descTitle}>说明</h3>
                <p className={styles.descInfo}>触发一个事件动作后，可以通过此行为来打开一个气泡弹窗，前提是存在。气泡弹窗会自动定位在触发元素的周围区域。</p>
                <Divider />
            </div>
            <Form.Item label="选择气泡弹窗" name={'target'} rules={[{ required: true, message: '请选择气泡弹窗组件' }]}>
                <Select>
                    {popovers.map((item: any) => (
                        <Select.Option key={item.id} value={item.id}>
                            {`${item.id}（${item.elementAlias || item.name}）`}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>
            <Form.Item name={'triggerElementId'} hidden initialValue={selectedElement?.id}>
                <Input />
            </Form.Item>
        </>
    );
};

export default OpenPopoverAction;
