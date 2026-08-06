import { forwardRef, useImperativeHandle, useState } from 'react';
import { ComponentType } from '@materials/types';
import NgapRender from '@materials/NgapRender/NgapRender';

/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const MTab = ({id, type, config, elements, loopVariable }: ComponentType & { loopVariable?: any }, ref: any) => {
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
            <div data-id={id} data-type={type} style={{...config.style,...mStyle}}>
                <NgapRender elements={elements} loopVariable={loopVariable} />
            </div>
        )
    );
};
export default forwardRef(MTab);
