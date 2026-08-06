import React, { useState, useEffect, useImperativeHandle, forwardRef, memo } from 'react';
import { Statistic } from 'antd';
import { ComponentType } from './../../types';
import * as icons from '@ant-design/icons';
import { omit } from 'lodash-es';
import { handleFormatter } from './../../utils/util';
import { useAppContext } from './../../../utils/AppProvider';

/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const MStatistic = ({ id, type, config }: ComponentType, ref: any) => {
    const [text, setText] = useState('');
    const [visible, setVisible] = useState(true);
    const { mode, pageStore } = useAppContext();
    const setElementAlias = pageStore((state: any) => state.setElementAlias);
    const [mStyle,setMStyle] = useState<any>({})

    useEffect(() => {
        // 设置组件别名
        setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
    }, [config.props.elementAlias]);
    useEffect(() => {
        const textStr = typeof config?.props?.value === 'string'
        const originText = textStr ? config.props?.value : '';
        const script = config.props?.script;
        const renderText = handleFormatter(script)?.(originText);
        setText(renderText?.toString() || originText);
    }, [config.props.value, config.props?.script]);

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

    const iconsList: { [key: string]: any } = icons;
    return (
        visible && (
            <Statistic
                style={{...config.style,...mStyle}}
                valueStyle={config.style}
                {...omit(config.props, ['script', 'prefix', 'suffix'])}
                value={text}
                prefix={config.props.prefix ? React.createElement(iconsList[config.props.prefix]) : null}
                suffix={config.props.suffix ? React.createElement(iconsList[config.props.suffix]) : null}
                data-id={id}
                data-type={type}
            />
        )
    );
};
export default memo(forwardRef(MStatistic));
