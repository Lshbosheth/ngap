import { ComponentType } from './../../types';
import { forwardRef,memo, useEffect, useImperativeHandle, useState } from 'react';
import { Row } from 'antd';
import styles from './index.module.less';
import SpanCol from './Col';
import { useAppContext } from '@/utils/AppProvider';
/*泛型只需要定义组件本身用到的属性*/
export interface IConfig {
    text: string;
}
/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const MSpan = ({ id, type, config, elements }: ComponentType, ref: any) => {
    const [visible, setVisible] = useState(true);
    const _state = useAppContext();
    const { mode, pageStore } = _state;
    const [mStyle,setMStyle] = useState<any>({})

    const setElementAlias = pageStore((state: any) => state.setElementAlias);

    // 对外暴露方法
    useImperativeHandle(ref, () => {
        return {
            show() {
                setVisible(true);
            },
            hide() {
                setVisible(false);
            },
            setStyle:(style:any)=>{
                setMStyle(style)
            }
        };
    });
    useEffect(() => {
        setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
    }, [config.props.elementAlias]);
    const gutter = config.props?.gutter || 16;
    const columnnum = config.props?.columnNum || 2;
    // 根据数字 2 生成长度为 2 的数组，元素为 0、1
    const childList = Array.from({ length: columnnum }, (_, index) => index);

    const calcSpan = config.props?.colSpan || Math.floor(24 / columnnum);
    return (
        visible && (
            <div className={styles.Span}>
                <Row style={{...config.style,...mStyle}} {...config.props} gutter={gutter} data-id={id} data-type={type}>
                    {childList.map((child, index) => (
                        <SpanCol key={index} span={calcSpan} columnnum={columnnum} index={index} pId={id} elements={elements} />
                    ))}
                </Row>
            </div>
        )
    );
};
export default memo(forwardRef(MSpan));
