import { Divider } from 'antd';
import {Form,Input,  FormInstance } from 'antd';
import styles from './index.module.less';
import { useAppContext } from '../../../utils/AppProvider';

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
                <p className={styles.descInfo}>配置打开负一屏事件，绑定事件即可</p>
                <Divider />
            </div>
        </>
    );
};
export default OpenModalAction;
