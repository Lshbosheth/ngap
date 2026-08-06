import { ComponentType } from './../../types';
import { isNotEmpty } from './../../utils/util';
import { Form, DatePicker, FormItemProps } from 'antd';
import { useEffect, useState, useImperativeHandle, forwardRef, memo, useMemo, useCallback, CSSProperties } from 'react';
import { useFormContext } from './../../utils/context';
import { useAppContext } from './../../../utils/AppProvider';
import { CustomCalendarIcon } from '../CustomCalendarIcon';
import dayjs, { Dayjs } from 'dayjs';
import { getDateRangeByType } from '../../../../materials/utils/util.ts';

export interface IConfig {
    elementAlias?: string;
    defaultValue: string;
    startField: string;
    endField: string;
    formItem: FormItemProps;
    formWrap: any;
    defaultIsVariable: boolean;
    defaultValueVariable: any;
}
/**
 *
 * @param config 组件配置属性值
 * @param props 系统属性值：componentid、componentname等
 * @returns 返回组件
 */
const MDatePickerRange = ({ id, type, config, onChange }: ComponentType<IConfig>, ref: any) => {
    const { RangePicker } = DatePicker;
    const { initValues } = useFormContext();
    const [visible, setVisible] = useState(true);
    const [disabled, setDisabled] = useState(false);
    const [focused, setFocused] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [mStyle, setMStyle] = useState<CSSProperties>({});
    const { pageStore } = useAppContext();
    // 设置组件别名
    const setElementAlias = pageStore((state: any) => state.setElementAlias);
    useEffect(() => {
        setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
    }, [config.props.elementAlias]);

    // 初始化默认值
    useEffect(() => {
        const name: string = config.props.formItem?.name;
        const value = config.props.defaultIsVariable ? config.props.defaultValueVariable : config.props.defaultValue;
        if (value?.value !== undefined) return;
        if (isNotEmpty(value)) initValues(type, name, value);
    }, [config.props.defaultValue, config.props.defaultIsVariable, config.props.defaultValueVariable]);

    // 启用和禁用
    useEffect(() => {
        setDisabled(!!config.props.formWrap.disabled);
    }, [config.props.formWrap.disabled]);

    const [disabledDates, setdisabledDates] = useState(false);
    useEffect(() => {
        setdisabledDates(!!config.props.formWrap.disStart);
    }, [config.props.formWrap.disStart]);

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

    const handleChange = (dates: any) => {
        disabledDates && setDates(dates);
        const obj: any = {};
        const {
            startField,
            endField,
            formItem: { name },
            formWrap: { format },
        } = config.props;
        const [start, end] = dates?.map((date: any) => date?.format(format)) || [undefined, undefined];
        if (startField && endField) {
            obj[startField] = start;
            obj[endField] = end;
            delete obj[name];
        } else {
            obj[name] = [start, end];
        }
        onChange?.(obj);
    };
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    // 限制范围
    const minTime = new Date(year, month - 1, 1, 0, 0, 0); // 上月1号 00:00:00
    const maxTime = new Date(year, month + 1, 0, 23, 59, 59); // 月末 23:59:59
    // 禁用日期
    const disabledDate = (current: any) => {
        if (!disabledDates) return
        return current < minTime || current > maxTime;
    };
    const [dates, setDates] = useState(null);
    // 1. 使用 state 维护面板当前展示的起始月份（上月）
    const [panelMonth, setPanelMonth] = useState(dayjs().subtract(1, 'month'));
    const suffixIcon = useMemo(() => {
        const color = focused || hovered ? '#0085d0' : undefined;
        return <CustomCalendarIcon color={color} />;
    }, [focused, hovered]);

    const onCalendarChange = useCallback(
        (vals: any) => {
            if (vals?.[0] && disabledDates) {
                // 无论用户点了什么，始终将左侧面板锚定在初始化时的“上月”
                setPanelMonth(dayjs().subtract(1, 'month'));
            }
        },
        [disabledDates],
    );
    const [pickerValue, setPickerValue] = useState<[Dayjs, Dayjs] | undefined>(undefined);
    const [pickerKey, setPickerKey] = useState(0); // 用于强制刷新
    useEffect(() => {
        setPickerValue(disabledDates ? [panelMonth, panelMonth] : undefined);
        setPickerKey((prev) => (prev += 1));
    }, [disabledDates]);

    return (
        visible && (
            <Form.Item {...config.props.formItem} data-id={id} data-type={type}>
                <RangePicker
                    {...config.props.formWrap}
                    key={pickerKey}
                    disabled={disabled}
                    value={dates}
                    disabledDate={disabledDate}
                    pickerValue={pickerValue}
                    onCalendarChange={onCalendarChange}
                    variant={config.props.formWrap.variant || undefined}
                    style={{ ...config.style, ...mStyle }}
                    onChange={handleChange}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    suffixIcon={<CustomCalendarIcon color={focused || hovered ? '#0085d0' : undefined} />}
                />
            </Form.Item>
        )
    );
};
export default memo(forwardRef(MDatePickerRange));
