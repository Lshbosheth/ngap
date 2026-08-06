import React, { forwardRef, useEffect, useImperativeHandle, useState, memo } from 'react';
import { Form, Input, InputProps, FormItemProps } from 'antd';
import * as icons from '@ant-design/icons';
import { ComponentType } from '@materials/types';
import { isNull } from '@materials/utils/util';
import { useFormContext } from '@materials/utils/context';
import omit from 'lodash-es/omit';

/* 泛型只需要定义组件本身用到的属性，当然也可以不定义，默认为any */
export interface IConfig {
    defaultValue: any;
    formItem: FormItemProps;
    formWrap: InputProps & { prefixIcons?: string; suffixIcons?: string };
}
/**
 *
 * @param config 组件配置属性值
 * @param props 系统属性值：componentid、componentname等
 * @returns 返回组件
 */
const MInput = ({id, type, config, onChange, onBlur, onPressEnter }: ComponentType<IConfig>, ref: any) => {
    const { initValues } = useFormContext();
    const [visible, setVisible] = useState(true);
    const [disabled, setDisabled] = useState<boolean | undefined>();
    const [mStyle,setMStyle] = useState<any>({})

    // 初始化默认值
    useEffect(() => {
        const name: string = config?.props?.formItem?.name;
        if (config?.props?.defaultValue?.value !== undefined) return;
        const value = config?.props?.defaultValue;
        if(value !== undefined && value !== null) initValues(type, name, value);
    }, [config?.props?.defaultValue]);

    // 启用和禁用
    useEffect(() => {
        if (typeof config?.props?.formWrap?.disabled === 'boolean') setDisabled(config?.props?.formWrap?.disabled);
    }, [config?.props?.formWrap?.disabled]);

    // 输入事件
    const handleChange = (event: any) => {
        onChange &&
            onChange({
                [config?.props?.formItem?.name]: event.target.value,
            });
    };

    // 失去焦点事件
    const handleBlur = (event: any) => {
        onBlur?.({
            [config?.props?.formItem?.name]: event.target.value,
        });
    };

    // 回车事件
    const handlePressEnter = (event: any) => {
        onPressEnter?.({
            [config?.props?.formItem?.name]: event.target.value,
        });
    };

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
            setStyle:(style:any)=>{
                setMStyle(style)
            }
        };
    });
    const iconsList: { [key: string]: any } = icons;
    return (
        visible && (
            <Form.Item {...config.props.formItem}>
                <Input
                    data-id={id}
                    data-type={type}
                    {...omit(config.props.formWrap, ['prefixIcons', 'suffixIcons'])}
                    disabled={disabled}
                    variant={config.props.formWrap.variant || undefined}
                    style={{...config.style,...mStyle}}
                    prefix={config?.props?.formWrap?.prefixIcons ? React.createElement(iconsList[config?.props?.formWrap?.prefixIcons]) : null}
                    suffix={config?.props?.formWrap?.suffixIcons ? React.createElement(iconsList[config?.props?.formWrap?.suffixIcons]) : null}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onPressEnter={handlePressEnter}
                />
            </Form.Item>
        )
    );
};

export default memo(forwardRef(MInput));
