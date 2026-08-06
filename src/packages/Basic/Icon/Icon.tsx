import React, { useState, useImperativeHandle, forwardRef, useEffect,memo } from 'react';
import * as Icons from '@ant-design/icons';
import { ComponentType } from './../../types';
import { useAppContext } from './../../../utils/AppProvider';
import { handleActionFlow } from './../../utils/action';

/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const MImage = (
    {
        id,
        type,
        config,
        onClick,
    }: ComponentType<{
        icon: string;
        style?: React.CSSProperties;
        fontSize: string;
        elementAlias?: string;
    }>,
    ref: any,
) => {
    const [visible, setVisible] = useState(true);
    const _state = useAppContext();
    const { mode, pageStore } = _state;

    const setElementAlias = pageStore((state: any) => state.setElementAlias);
    const [mStyle,setMStyle] = useState<any>({})

    // 处理事件执行
    const handleEvent = (eventName: string) => {
        const eventConfig = config.events?.find((event: any) => event.eventName === eventName);
        if (eventConfig?.actions) {
            handleActionFlow(eventConfig.actions, {}, _state);
        }
    };

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

    // 兼容icon为空的情况
    const iconName = config.props?.icon;
    const IconComponent = iconName ? iconsList[iconName] : null;

    if (!visible || !IconComponent) {
        return null;
    }

    return (
        React.createElement(IconComponent, {
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
export default memo(forwardRef(MImage));
