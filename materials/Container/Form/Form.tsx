import { Form } from 'antd';
import { forwardRef, memo, useCallback, useImperativeHandle, useState, useMemo, useRef, useEffect, CSSProperties, ForwardedRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import NgapRender from '@materials/NgapRender/NgapRender';
import { FormContext } from '@materials/utils/context';
import { usePageStore } from '@materials/stores/pageStore';
import { ComponentType } from '@materials/types';
import { dateFormat, getDateByType, getDateRangeByType, isNotEmpty, dateStrToDayjs, dateIsValid } from '@materials/utils/util';
import dayjs from 'dayjs';
import { omit } from "lodash-es";

interface RefConfig {
    show: () => void;
    hide: () => void;
    reset: () => void;
    validate: () => Promise<boolean>;
    init: (values: Record<string, any>) => void;
    getFormData: (key: string) => Record<string, any>;
    setStyle: (style: CSSProperties) => void;
}

interface IConfig {
    name?: string;
    colon: boolean;
    labelAlign: 'left' | 'right';
    disabled: boolean;
    size: 'small' | 'middle' | 'large';
    layout: 'horizontal' | 'vertical' | 'inline';
    labelCol: {
        span: number;
        offset: number;
    };
    wrapperCol: {
        span: number;
        offset: number;
    };
    scrollToFirstError: boolean;
    variant: 'outlined' | 'borderless' | 'filled';
}
type MFormProps = ComponentType<IConfig> & { loopVariable?: any };
/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @param attr 组件其它属性，比如：id、type、className
 * @returns
 */
const MForm = (props: MFormProps, ref: ForwardedRef<RefConfig>) => {
    const { id, type, config, elements, onFinish, onChange, loopVariable } = props;
    const [form] = Form.useForm();
    const { formData, setFormData, elementsMap } = usePageStore(
        useShallow((state) => {
            return {
                formData: state.page.pageData.formData || {},
                setFormData: state.setFormData,
                elementsMap: state.page?.pageData?.elementsMap,
            };
        }),
    );
    const defaultValueInvalidMap: { [key: string]: any } = usePageStore(
        useShallow((state: any) => state.page?.pageData?.defaultValueInvalidMap || {}),
    );
    const setDefaultValueInvalidMap: any = usePageStore(useShallow((state: any) => state.setDefaultValueInvalidMap || {}));
    const [visible, setVisible] = useState(true);
    const [initialValues, setInitialValues] = useState({});
    const [mStyle, setMStyle] = useState<CSSProperties>({});
    useEffect(() => {
        if (formData[id]) {
            setDefaultValueInvalidMap(id);
            form.setFieldsValue(dateFormat(elements, formData[id]));
        } else {
            form.resetFields();
            setInitialValues({});
        }
    }, []);
    // 提交表单
    const handleFinish = (values: any) => {
        onFinish?.(dateFormat(elements, values));
    };
    // 监听表单值变化

    const handleChange = (_: any, allValues: any) => {
        setDefaultValueInvalidMap(id);
        const values = dateFormat(elements, allValues);
        onChange?.(values);
        setFormData({
            name: id,
            value: values,
        });
    };
    // 对外暴露重置和获取值方法
    useImperativeHandle(ref, () => {
        return {
            show() {
                setVisible(true);
            },
            hide() {
                setVisible(false);
            },
            reset() {
                form.resetFields();
                setFormData({
                    name: id,
                    value: form.getFieldsValue(),
                    type: 'override',
                });
            },
            submit() {
                form.submit();
            },
            async validate() {
                try {
                    await form.validateFields();
                    return true;
                } catch (error) {
                    console.error(error);
                    return false;
                }
            },
            init(values: Record<string, any> = {}) {
                setDefaultValueInvalidMap(id);
                const initData = dateFormat(elements, values);
                form.setFieldsValue(initData);
                setFormData({
                    name: id,
                    value: initData,
                    type: 'override',
                });
            },
            getFormData(key: string) {
                // 根据 key 前缀判断组件类型（DatePicker/DatePickerRange/TimePicker/TimePickerRange）
                const getDateComponentType = (k: string): string => {
                    if (k.startsWith('DatePickerRange')) return 'DatePickerRange';
                    if (k.startsWith('TimePickerRange')) return 'TimePickerRange';
                    if (k.startsWith('DatePicker')) return 'DatePicker';
                    if (k.startsWith('TimePicker')) return 'TimePicker';
                    return '';
                };

                // 格式化日期值：将 dayjs 对象或日期字符串按照指定格式输出
                const formatDateValue = (type: string, value: any, format: string): any => {
                    if (value === null || value === undefined) return value;
                    if (dayjs.isDayjs(value)) {
                        return value.format(format);
                    }
                    if (typeof value === 'string' && dateIsValid(value)) {
                        return dayjs(value).format(format);
                    }
                    return value;
                };

                // 递归转换：遍历表单值，对日期类型字段按配置的 format 进行格式化
                const convertDayjsToString = (k: string, obj: any): any => {
                    if (obj === null || obj === undefined) return obj;
                    const type = getDateComponentType(k);
                    // 从 elementsMap 获取组件配置的 format，通过 name 匹配，默认为 'YYYY-MM-DD HH:mm:ss'
                    const element = (Object.values(elementsMap || {}) as any[]).find((e: any) => e?.config?.props?.formItem?.name === k);
                    const format = element?.config?.props?.formWrap?.format || 'YYYY-MM-DD HH:mm:ss';
                    if (dayjs.isDayjs(obj)) {
                        return formatDateValue(type, obj, format);
                    }
                    if (typeof obj === 'string' && /^\d{4}-\d{2}-\d{2}/.test(obj)) {
                        return formatDateValue(type, obj, format);
                    }
                    if (Array.isArray(obj)) {
                        return obj.map((item: any) => convertDayjsToString(k, item));
                    }
                    return obj;
                };

                // 判断是否格式化日期
                const needsDateConversion = (value: any, type: any) => {
                    if (type) return true;
                    if (dayjs.isDayjs(value)) return true;
                    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return true;
                    if (Array.isArray(value)) {
                        for (const item of value) {
                            if (dayjs.isDayjs(item)) return true;
                            if (typeof item === 'string' && /^\d{4}-\d{2}-\d{2}/.test(item)) return true;
                        }
                    }
                    return false;
                };

                // 如果传入了 key，只返回指定 key 的值
                if (key && typeof key === 'string') {
                    const value = formData[id]?.[key];
                    const type = getDateComponentType(key);
                    if (needsDateConversion(value, type)) {
                        return convertDayjsToString(key, value);
                    }
                    return value;
                }

                // 遍历所有表单字段，对日期类型字段进行格式化转换
                const result: any = {};
                for (const k in formData[id]) {
                    if (Object.prototype.hasOwnProperty.call(formData[id], k)) {
                        const type = getDateComponentType(k);
                        if (needsDateConversion(formData[id][k], type)) {
                            result[k] = convertDayjsToString(k, formData[id][k]);
                        } else {
                            result[k] = formData[id][k];
                        }
                    }
                }
                return result;
            },
            setStyle: (style: CSSProperties) => {
                setMStyle(style);
            },
        };
    });

    // 设置默认值
    const initValues = useCallback(
        (type: string, name: string, value: any) => {
            if (name && !defaultValueInvalidMap[id]) {
                let initValue = value;
                if (isNotEmpty(value)) {
                    if (type === 'InputNumber') initValue = Number(value);
                    if (type === 'DatePicker' && typeof value === 'string') {
                        initValue = initValue.trim();
                        const dayjsFormat = dateStrToDayjs(initValue);
                        if (dayjsFormat) {
                            initValue = dayjsFormat;
                        } else if (initValue && getDateByType(initValue)) {
                            initValue = getDateByType(initValue);
                        } else {
                            initValue = undefined;
                        }
                    }
                    if (type === 'DatePickerRange' && typeof value === 'string') initValue = getDateRangeByType(value);
                    if (type === 'TimePicker' && typeof value === 'string') initValue = dayjs(value, 'HH:mm:ss');
                }
                setInitialValues({ [name]: initValue });
                form.setFieldValue([name], initValue);
                setFormData({
                    name: id,
                    value: { [name]: initValue },
                });
            }
        },
        [id, defaultValueInvalidMap],
    );
    const other = useMemo(() => {
        return omit(config.props, ['disabled']);
    }, [config.props]);
    return (
        visible && (
            <FormContext.Provider value={{ form, initValues, fromId: id }}>
                <Form
                    data-id={id}
                    data-type={type}
                    form={form}
                    style={{ ...config.style, ...mStyle }}
                    {...other}
                    initialValues={initialValues}
                    onFinish={handleFinish}
                    onValuesChange={handleChange}
                >
                    <NgapRender elements={elements} loopVariable={loopVariable} />
                </Form>
            </FormContext.Provider>
        )
    );
};
export default memo(forwardRef(MForm));
