import { ComponentType } from '@materials/types';
import { Form, DatePicker, FormItemProps, DatePickerProps, FormInstance } from 'antd';
import { useEffect, useState, useImperativeHandle, forwardRef, memo, CSSProperties, ForwardedRef, useMemo, useCallback } from 'react';
import { useFormContext } from '@materials/utils/context';
import { renderFormula } from '@materials/utils/util';
import { CustomCalendarIcon } from '../CustomCalendarIcon';
import {isNil} from 'lodash-es'
import { DoubleLeftOutlined, DoubleRightOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";

export interface IConfig {
    defaultValue: string;
    defaultIsVariable: boolean;
    defaultValueVariable: any;
    formItem: FormItemProps;
    formWrap: DatePickerProps;
}

interface RefConfig {
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    setStyle: (style: CSSProperties) => void;
}

/**
 *
 * @param config 组件配置属性值
 * @param props 系统属性值：componentid、componentname等
 * @returns 返回组件
 */

const MDatePicker = ({ id, type, config, onChange }: ComponentType<IConfig> & { form: FormInstance }, ref: ForwardedRef<RefConfig>) => {
    const { initValues } = useFormContext();
    const [visible, setVisible] = useState(true);
    const [disabled, setDisabled] = useState<boolean | undefined>();
    const [focused, setFocused] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [mStyle, setMStyle] = useState<CSSProperties>({});
    const { disabled: formWarpDisabled, variant } = config.props.formWrap;

    // 初始化默认值
    useEffect(() => {
        const name: string = config.props.formItem?.name;
        const defaultIsVariable: boolean = config.props.defaultIsVariable;
        let value = undefined;
        if (defaultIsVariable) {
            if (typeof config?.props?.defaultValueVariable === 'string') {
                value = config?.props?.defaultValueVariable;
            } else {
                const variableName = config?.props?.defaultValueVariable?.value;
                if (config?.props?.defaultValueVariable?.type === 'static') {
                    value = variableName;
                } else {
                    value = renderFormula(variableName, {}, true);
                }
            }
        } else {
            value = config.props.defaultValue;
        }
        if (isNil(value)) initValues(type, name, value);
    }, [config.props.defaultValue, config.props.defaultIsVariable, config.props.defaultValueVariable]);

    // 启用和禁用
    useEffect(() => {
        setDisabled(!!formWarpDisabled);
    }, [formWarpDisabled]);

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
            setStyle: (style: CSSProperties) => {
                setMStyle(style);
            },
        };
    });

    const handleChange = (val: any) => {
        onChange?.({
            [config?.props?.formItem?.name]: val.format(config?.props?.formWrap?.format),
        });
    };
    return (
        visible && (
            <Form.Item {...config.props.formItem}>
                <DatePicker
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
                    prevIcon={<LeftOutlined/>}
                    nextIcon={<RightOutlined/>}
                    superPrevIcon={<DoubleLeftOutlined/>}
                    superNextIcon={<DoubleRightOutlined/>}
                    suffixIcon={<CustomCalendarIcon color={focused || hovered ? "#0085d0" : undefined} />}
                />
            </Form.Item>
        )
    );
};
export default memo(forwardRef(MDatePicker));
