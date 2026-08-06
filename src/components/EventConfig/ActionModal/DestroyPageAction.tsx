import { Divider, Form, Input ,FormInstance} from 'antd';
import styles from './index.module.less';
const DestroyPageAction = ({ form }: { form: FormInstance }) => {
    return (
        <>
            <div className={styles.desc}>
                <h3 className={styles.descTitle}>说明</h3>
                <p className={styles.descInfo}>使用crossAPI关闭页面。</p>
                <Divider />
            </div>
            <Form.Item label='关闭页面名称' name={'destroyTabName'} rules={[{ required: true, message: '请输入页面名称' }]}>
                <Input placeholder="请输入页面名称" />
            </Form.Item>
        </>
    );
};
export default DestroyPageAction;
