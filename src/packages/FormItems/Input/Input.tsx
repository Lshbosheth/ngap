import React, { forwardRef, useEffect, useImperativeHandle, useState, memo, useCallback } from 'react';
import { Form, Input, InputProps, FormItemProps } from 'antd';
import * as icons from '@ant-design/icons';
import { ComponentType } from './../../types';
import { useFormContext } from './../../utils/context';
import { useAppContext } from './../../../utils/AppProvider';
import { omit, isEqual } from 'lodash-es';

/* 泛型只需要定义组件本身用到的属性，当然也可以不定义，默认为any */
export interface IConfig {
    elementAlias?: string;
    defaultValue: any;
    formItem: FormItemProps;
    formWrap: InputProps & { prefixIcons?: string; suffixIcons?: string };
}
/**
 *
 * @param config 组件配置属性值
 * @param props 系统属性值：componentId、componentName等
 * @returns 返回组件
 */
const MInput = ({ id, type, config, onChange, onBlur, onPressEnter }: ComponentType<IConfig>, ref: any) => {
    const { initValues } = useFormContext();
    const [visible, setVisible] = useState(true);
    const [disabled, setDisabled] = useState<boolean | undefined>();
    const { mode, pageStore } = useAppContext();
    const setElementAlias = pageStore((state: any) => state.setElementAlias);
    const [mStyle,setMStyle] = useState<any>({})

    useEffect(() => {
        // 设置组件别名
        setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
    }, [config.props.elementAlias]);

    // 初始化默认值
    useEffect(() => {
        const name: string = config.props.formItem?.name;
        if (config.props.defaultValue?.value) return;
        const value = config.props.defaultValue;
        if(value !== undefined && value !== null) initValues(type, name, value);
    }, [config.props.defaultValue]);

    // 启用和禁用
    useEffect(() => {
        if (typeof config.props.formWrap.disabled === 'boolean') setDisabled(config.props.formWrap.disabled);
    }, [config.props.formWrap.disabled]);

    // 输入事件
    const handleChange = useCallback((event: any) => {
        onChange?.({
            [config.props.formItem.name]: event.target.value,
        });
    }, [onChange, config.props.formItem.name]);

    // 失去焦点事件
    const handleBlur = useCallback((event: any) => {
        onBlur?.({
            [config.props.formItem.name]: event.target.value,
        });
    }, [onBlur, config.props.formItem.name]);
    // 回车事件
    const handlePressEnter = useCallback((event: any) => {
        onPressEnter?.({
            [config.props.formItem.name]: event.target.value,
        });
    }, [onPressEnter, config.props.formItem.name]);
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
            <Form.Item {...config.props.formItem} data-id={id} data-type={type}>
                <Input
                    {...omit(config.props.formWrap, ['prefixIcons', 'suffixIcons'])}
                    disabled={disabled}
                    variant={config.props.formWrap.variant || undefined}
                    style={{...config.style,...mStyle}}
                    prefix={config.props.formWrap.prefixIcons ? React.createElement(iconsList[config.props.formWrap.prefixIcons]) : null}
                    suffix={config.props.formWrap.suffixIcons ? React.createElement(iconsList[config.props.formWrap.suffixIcons]) : null}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onPressEnter={handlePressEnter}
                />
            </Form.Item>
        )
    );
};

export default memo(forwardRef(MInput), (prevProps, nextProps) => {
    // 比较基本属性
    if (prevProps.id !== nextProps.id) return false;
    if (prevProps.type !== nextProps.type) return false;
    // 比较config对象
    if (!isEqual(prevProps.config, nextProps.config)) return false;
    return true; // 所有props都未变化，跳过重新渲染
});
