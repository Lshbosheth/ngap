import React, { forwardRef, useImperativeHandle, useState, useEffect, memo } from 'react';
import { Button } from 'antd';
import * as icons from '@ant-design/icons';
import { ComponentType } from '@materials/types';
/*泛型只需要定义组件本身用到的属性*/
export interface IConfig {
    icon: string;
    text: any;
    authCode: string;
    authMoInfo: any;
    authScript: string;
}
/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const MButton = ({ id, type, config, onClick }: ComponentType<IConfig>, ref: any) => {
    const [visible, setVisible] = useState(true);
    const [mStyle,setMStyle] = useState<any>({})

    const [disabled, setDisabled] = useState<boolean | undefined>();
    const [loading, setLoading] = useState(false);
    const [btnTxt, setBtnTxt] = useState<string>('');
    const [moCode, setmoCode] = useState(false);
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
    const handleClick = () => {
        onClick?.();
    };
    const iconsList: { [key: string]: any } = icons;
    const { authCode, authScript, ...props } = config.props;
    // 初始化默认值
    useEffect(() => {
        if(config.props?.authMoInfo && authCode && config.props?.authMoInfo[authCode] === '1'){
            setmoCode(true)
        }else if(!config.props?.authMoInfo || !authCode){
            setmoCode(true)
        }
        const titleVal = typeof config.props.text === 'string' ? config.props.text : config.props.text?.value;
        setBtnTxt(titleVal);
    }, [config?.props?.text]);

    return (
        visible && moCode && (
            <Button
                style={{...config.style,...mStyle}}
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
