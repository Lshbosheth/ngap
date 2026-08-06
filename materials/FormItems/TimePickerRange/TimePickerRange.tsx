import { ComponentType } from '@materials/types';
import { isNotEmpty } from '@materials/utils/util';
import { Form, FormItemProps, FormInstance, TimePicker } from 'antd';
import { useEffect, useState, useImperativeHandle, forwardRef, memo } from 'react';
import { useFormContext } from '@materials/utils/context';
import { CustomCalendarIcon } from '../CustomCalendarIcon';

import dayjs from 'dayjs';

export interface IConfig {
    defaultValue: any;
    startField: string;
    endField: string;
    formItem: FormItemProps;
    formWrap: any;
}
/**
 *
 * @param config 组件配置属性值
 * @param props 系统属性值：componentid、componentname等
 * @returns 返回组件
 */
const MTimePickerRange = ({id, type, config, onChange }: ComponentType<IConfig> & { form: FormInstance }, ref: any) => {
    const { initValues } = useFormContext();
    const [visible, setVisible] = useState(true);
    const [disabled, setDisabled] = useState(config.props.formWrap.disabled);
    const [focused, setFocused] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [mStyle,setMStyle] = useState<any>({})

    // 初始化默认值
    useEffect(() => {
        const name: string = config.props.formItem?.name;
        if (config.props.defaultValue?.value !== undefined) return;
        const value = config.props.defaultValue;
        // 日期组件初始化值
        if (name && isNotEmpty(value)) {
            const fmt = config?.props?.formWrap?.format || 'HH:mm:ss';
            const rangeTime = value.split(',').map((item: any) => dayjs(item, fmt));
            if(value !== undefined && value !== null) initValues(type, name, rangeTime);
        }
    }, [config.props.defaultValue]);

    // 启用和禁用
    useEffect(() => {
        setDisabled(config?.props?.formWrap?.disabled);
    }, [config?.props?.formWrap?.disabled]);

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

    const handleChange = (times: any) => {
        const obj: any = {};
        const {
            startField,
            endField,
            formItem: { name },
            formWrap: { format },
        } = config.props;
        const [start, end] = times.map((date: any) => date?.format(format));
        if (startField && endField) {
            obj[startField] = start;
            obj[endField] = end;
            delete obj[name];
        } else {
            obj[name] = [start, end];
        }
        onChange?.(obj);
    };
    return (
        visible && (
            <Form.Item {...config.props.formItem}>
                <TimePicker.RangePicker
                    data-id={id}
                    data-type={type}
                    {...config.props.formWrap}
                    disabled={disabled}
                    variant={config?.props?.formWrap?.variant || undefined}
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
export default memo(forwardRef(MTimePickerRange));
