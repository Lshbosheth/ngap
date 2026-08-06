import React, { forwardRef, useImperativeHandle, useState, useEffect, memo } from 'react';
import { Button } from 'antd';
import * as icons from '@ant-design/icons';
import { useAppContext } from './../../../utils/AppProvider';
import { ComponentType } from './../../types';

/*泛型只需要定义组件本身用到的属性*/
export interface IConfig {
    icon: string;
    text: any;
    authCode: string;
    authScript: string;
    elementAlias?: string;
}
/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const MButton = ({ id, type, config, onClick }: ComponentType<IConfig>, ref: any) => {
    const [visible, setVisible] = useState(true);
    const [disabled, setDisabled] = useState<boolean | undefined>();
    const [loading, setLoading] = useState(false);
    const [btnTxt, setBtnTxt] = useState<string>('');
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
            enable() {
                setDisabled(false);
            },
            disable() {
                setDisabled(true);
            },
            startLoading: () => {
                setLoading(true);
            },
            endLoading: () => {
                setLoading(false);
            },
            setStyle:(style:any)=>{
                setMStyle(style)
            }
        };
    });
    const { mode, pageStore } = useAppContext();
    const handleClick = () => {
        if (mode != 'edit') {
            onClick?.();
        }
    };

    const setElementAlias = pageStore((state: any) => state.setElementAlias);
    useEffect(() => {
        // 设置组件别名
        setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
    }, [config.props.elementAlias]);

    // 初始化默认值
    useEffect(() => {
        const titleVal = typeof config.props.text === 'string' ? config.props.text : config.props.text?.value;
        setBtnTxt(titleVal);
    }, [config.props.text]);
    const iconsList: { [key: string]: any } = icons;
    const { authCode, authScript, ...props } = config.props;
    return (
        visible && (
            <Button
                style={{ ...config.style ,...mStyle}}
                loading={loading}
                disabled={disabled}
                {...props}
                icon={props.icon ? React.createElement(iconsList[props.icon]) : null}
                data-id={id}
                data-type={type}
                onClick={handleClick}
            >
                {btnTxt}
            </Button>
        )
    );
};
export default memo(forwardRef(MButton));
