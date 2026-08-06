import { ComponentType } from '@materials/types';
import { Image } from 'antd';
import { useState, useImperativeHandle, forwardRef, memo } from 'react';

/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const MImage = ({id, type, config, onClick }: ComponentType, ref: any) => {
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
    const handleClick = () => {
        onClick?.();
    };
    return visible && <Image data-id={id} data-type={type} style={{...config.style,...mStyle}} {...config.props} onClick={handleClick} />;
};
export default memo(forwardRef(MImage));
