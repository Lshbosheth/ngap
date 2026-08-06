import { ComponentType } from '@materials/types';
import NgapRender from '@materials/NgapRender/NgapRender';
import { forwardRef,memo, useImperativeHandle, useState } from 'react';
import { Col } from 'antd';

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
const MCol = ({ id, type, config, elements, loopVariable }: ComponentType & { loopVariable?: any }, ref: any) => {
    const [visible, setVisible] = useState(true);
    const [mStyle,setMStyle] = useState<any>({})

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
    return (
        visible && (
            <Col data-id={id} data-type={type} style={{...config.style,...mStyle}} {...config.props}>
                <NgapRender elements={elements} loopVariable={loopVariable} />
            </Col>
        )
    );
};
export default memo(forwardRef(MCol));
