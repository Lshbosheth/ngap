import { ComponentType } from './../../types';
import { getDateByType, isNull } from './../../utils/util';
import { Form, DatePicker, FormItemProps, DatePickerProps, FormInstance } from 'antd';
import { useEffect, useState, useImperativeHandle, forwardRef, memo } from 'react';
import { useFormContext } from './../../utils/context';
import { useAppContext } from './../../../utils/AppProvider';
import { CustomCalendarIcon } from '../CustomCalendarIcon';
import { renderFormula } from '../../../../materials/utils/util.ts';
import { DoubleLeftOutlined, DoubleRightOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";

export interface IConfig {
    elementAlias?: string;
    defaultValue: any;
    defaultIsVariable: boolean;
    defaultValueVariable: any;
    formItem: FormItemProps;
    formWrap: DatePickerProps;
}
/**
 *
 * @param config 组件配置属性值
 * @param props 系统属性值：componentid、componentname等
 * @returns 返回组件
 */
const MDatePicker = ({ id, type, config, onChange }: ComponentType<IConfig> & { form: FormInstance }, ref: any) => {
    const { initValues, form } = useFormContext();
    const [visible, setVisible] = useState(true);
    const [disabled, setDisabled] = useState<boolean | undefined>();
    const [focused, setFocused] = useState(false);
    const [hovered, setHovered] = useState(false);
    const _state = useAppContext();
    const { pageStore } = _state;
    const setElementAlias = pageStore((state: any) => state.setElementAlias);
    const [mStyle, setMStyle] = useState<any>({});

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
            value = config?.props?.defaultValue;
        }
        if (value?.value !== undefined) return;
        if (value !== undefined && value !== null) initValues(type, name, value);
    }, [config.props.defaultValue, config.props.defaultIsVariable, config.props.defaultValueVariable]);

    // 启用和禁用
    useEffect(() => {
        if (typeof config.props.formWrap.disabled === 'boolean') setDisabled(config.props.formWrap.disabled);
    }, [config.props.formWrap.disabled]);

    // 设置组件别名
    useEffect(() => {
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
            enable() {
                setDisabled(false);
            },
            disable() {
                setDisabled(true);
            },
            setStyle: (style: any) => {
                setMStyle(style);
            },
        };
    });

    const handleChange = (val: any) => {
        onChange?.({
            [config.props.formItem.name]: val.format(config.props.formWrap.format),
        });
    };

    return (
        visible && (
            <Form.Item {...config.props.formItem} data-id={id} data-type={type}>
                <DatePicker
                    {...config.props.formWrap}
                    disabled={disabled}
                    style={{ ...config.style, ...mStyle }}
                    onChange={handleChange}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    prevIcon={<LeftOutlined/>}
                    nextIcon={<RightOutlined/>}
                    superPrevIcon={<DoubleLeftOutlined/>}
                    superNextIcon={<DoubleRightOutlined/>}
                    suffixIcon={<CustomCalendarIcon color={focused || hovered ? '#0085d0' : undefined} />}
                />
            </Form.Item>
        )
    );
};
export default memo(forwardRef(MDatePicker));
