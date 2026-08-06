import { ComponentType } from './../../types';
import { getDateByType, isNull } from './../../utils/util';
import { Form, FormItemProps, DatePickerProps, FormInstance, TimePicker } from 'antd';
import { useEffect, useState, useImperativeHandle, forwardRef, memo } from 'react';
import { useFormContext } from './../../utils/context';
import { useAppContext } from './../../../utils/AppProvider';
import { CustomCalendarIcon } from '../CustomCalendarIcon';

import dayjs from 'dayjs';

export interface IConfig {
    elementAlias?: string;
    defaultValue: any;
    formItem: FormItemProps;
    formWrap: DatePickerProps;
}
/**
 *
 * @param config 组件配置属性值
 * @param props 系统属性值：componentid、componentname等
 * @returns 返回组件
 */
const MTimePicker = ({ id, type, config, onChange }: ComponentType<IConfig> & { form: FormInstance }, ref: any) => {
    const { initValues } = useFormContext();
    const [visible, setVisible] = useState(true);
    const [mStyle,setMStyle] = useState<any>({})

    const [disabled, setDisabled] = useState(config.props.formWrap.disabled);
    const [focused, setFocused] = useState(false);
    const [hovered, setHovered] = useState(false);

    const _state = useAppContext();
    const { pageStore } = _state;
    const setElementAlias = pageStore((state: any) => state.setElementAlias);
    // 设置组件别名
    useEffect(() => {
        setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
    }, [config.props.elementAlias]);

    // 初始化默认值
    useEffect(() => {
        const name: string = config.props.formItem?.name;
        if (config.props.defaultValue?.value !== undefined) return;
        const value = config.props.defaultValue;
        if(value !== undefined && value !== null) initValues(type, name, value);
    }, [config.props.defaultValue]);

    // 启用和禁用
    useEffect(() => {
        setDisabled(config.props.formWrap.disabled);
    }, [config.props.formWrap.disabled]);

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
            setStyle:(style:any)=>{
                setMStyle(style)
            }
        };
    });

    const handleChange = (val: any) => {
        onChange?.({
            [config.props.formItem.name]: val.format(config.props.formWrap.format || 'HH:mm:ss'),
        });
    };
    return (
        visible && (
            <Form.Item {...config.props.formItem} data-id={id} data-type={type}>
                <TimePicker
                    {...config.props.formWrap}
                    disabled={disabled}
                    style={{...config.style,...mStyle}}
                    onChange={handleChange}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    suffixIcon={<CustomCalendarIcon color={focused || hovered ? "#0085d0" : undefined} />}
                />
            </Form.Item>
        )
    );
};
export default memo(forwardRef(MTimePicker));
