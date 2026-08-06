import React, { useState, useImperativeHandle, forwardRef,memo } from 'react';
import * as Icons from '@ant-design/icons';
import { ComponentType } from '@materials/types';
import { handleActionFlow } from './../../utils/action';
//
/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const MIcon = (
    { id,
        type,
        config,
        onClick,
    }: ComponentType<{
        icon: string;
        style?: React.CSSProperties;
    }>,
    ref: any,
) => {
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
    // 处理事件执行
    const handleEvent = (eventName: string) => {
        const eventConfig = config.events?.find((event: any) => event.eventName === eventName);
        if (eventConfig?.actions) {
            handleActionFlow(eventConfig.actions, {});
        }
    };

    const handleClick = () => {
        onClick?.();
    };
    const handleMouseEnter = () => {
        handleEvent('onMouseEnter');
    };

    const handleMouseLeave = () => {
        handleEvent('onMouseLeave');
    };

    const buildStyle = (object: { [name: string]: any }, variable: string, key: string) => {
        if (variable) {
            object[key] = variable;
            return object;
        }
        return object;
    };

    const iconsList: { [key: string]: any } = Icons;
    const fontSize = config.props?.fontSize;
    let style: { [name: string]: any } = { ...config.style };
    style = buildStyle(style, fontSize, 'font-size');

    return (
        visible &&
        React.createElement(iconsList[config.props.icon], {
            style: {...style,...mStyle},
            ...config.props,
            'data-id': id,
            'data-type': type,
            onClick: handleClick,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
        })
    );
};
export default memo(forwardRef(MIcon));
