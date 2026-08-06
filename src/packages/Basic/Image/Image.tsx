import { ComponentType } from './../../types';
import { Image } from 'antd';
import { useState, useImperativeHandle, forwardRef, useEffect, memo } from 'react';
import { useAppContext } from './../../../utils/AppProvider';

/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const MImage = ({ id, type, config, onClick }: ComponentType, ref: any) => {
    const [visible, setVisible] = useState(true);
    const { mode, pageStore } = useAppContext();
    const [mStyle,setMStyle] = useState<any>({})

    const setElementAlias = pageStore((state: any) => state.setElementAlias);
    useEffect(() => {
        // 设置组件别名
        setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
    }, [config.props.elementAlias]);
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
    return visible && <Image style={{...config.style,...mStyle}} {...config.props} data-id={id} data-type={type} onClick={handleClick} />;
};
export default memo(forwardRef(MImage));
