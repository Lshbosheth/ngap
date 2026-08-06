import { Divider } from 'antd';
import {Form,Input,  FormInstance } from 'antd';
import styles from './index.module.less';
import { useAppContext } from './../../../utils/AppProvider';

const OpenModalAction = ({ form }: { form: FormInstance }) => {
    const { pageStore } = useAppContext();
    const {selectedElement} = pageStore((state?: any) => {
        return {
            selectedElement: state?.selectedElement,
        };
    });
    return (
        <>
            <div className={styles.desc}>
                <h3 className={styles.descTitle}>说明</h3>
                <p className={styles.descInfo}>当前页面可发起联动请求，在关联页面完成定位到指定位置并点击目标元素的联动操作。</p>
               <Form.Item
                    name={['commenId']}
                    initialValue={selectedElement?.id}
                    hidden
                >
                    <Input />
                </Form.Item>
                <Divider />
            </div>
        </>
    );
};
export default OpenModalAction;
