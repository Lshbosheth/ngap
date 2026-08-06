import { ComponentType } from '@materials/types';
import { Button, Col, ConfigProvider, Form, Row } from "antd";
import React, { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import NgapRender from '@materials/NgapRender/NgapRender';
import { FormContext } from '@materials/utils/context';
import { dateFormat, dateStrToDayjs, getDateByType, getDateRangeByType } from "@materials/utils/util";
import dayjs from "dayjs";
import "./index.less";
import * as icons from "@ant-design/icons";
import { DownOutlined, ReloadOutlined, SearchOutlined, UpOutlined } from "@ant-design/icons";
import { usePageStore } from "@materials/stores/pageStore";
import { handleActionFlow } from "@materials/utils/action";
import { omit } from "lodash-es";

/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @param attr 组件其它属性，比如：id、type、className
 * @returns
 */
const GridForm = ({ id, type, config, elements, onChange, loopVariable, onSearch, onReset }: ComponentType & { loopVariable?: any }, ref: any) => {
    const [form] = Form.useForm();
    const { lineCount, leftLine, verGap, initFold, hozGap, submitText, resetText, labelStyle } = config.props.extraConfig;

    const { formData, setFormData, elementsMap } = usePageStore(
        useShallow((state) => {
            return {
                formData: state.page.pageData.formData || {},
                setFormData: state.setFormData,
                elementsMap: state.page?.pageData?.elementsMap,
            };
        }),
    );

    const defaultValueInvalidMap: {[key: string]: any} = usePageStore(useShallow((state: any) => state.page?.pageData?.defaultValueInvalidMap || {}));
    const setDefaultValueInvalidMap: any = usePageStore(useShallow((state: any) => state.setDefaultValueInvalidMap || {}));
    const [mStyle, setMStyle] = useState<any>({});
    const [fold, setFold] = useState<boolean>(initFold);
    const bulkActionList = config?.props?.bulkActionList || [];
    const iconsList: { [key: string]: any } = icons;

    useEffect(() => {
        formData[id] && setDefaultValueInvalidMap(id);
        form.setFieldsValue(dateFormat(elements, formData[id]))
    }, []);
    const [visible, setVisible] = useState(true);
    const [initialValues, setInitialValues] = useState({});

    // 提交表单
    const handleSearch = useCallback(() => {
        const values = form.getFieldsValue();
        console.log("[SearchForm] 查询，表单值:", values);
        onSearch?.(dateFormat(elements, values));
    }, [elements, onSearch]);

    // 重置表单
    const handleReset = useCallback(() => {
        form.resetFields();
        const values = form.getFieldsValue();
        onReset?.(dateFormat(elements, values));
        setFormData({
            name: id,
            value: values,
            type: "override"
        });
    }, [elements, onReset]);

    // 监听表单值变化
    const handleChange = useCallback((_changedValue: any, allValues: any) => {
        setDefaultValueInvalidMap(id);
        const values = dateFormat(elements, allValues);
        onChange?.(values);
        setFormData({
            name: id,
            value: values
        });
    }, [onChange, JSON.stringify(elements)]);
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
                    type: "override"
                });
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
            init(values: any = {}) {
                setDefaultValueInvalidMap(id);
                const initData = dateFormat(elements, values);
                form.setFieldsValue({ ...initData });
                setFormData({
                    name: id,
                    value: { ...initData },
                    type: "override"
                });
            },
            getFormData(key: string) {

                // 根据 key 前缀判断组件类型（DatePicker/DatePickerRange/TimePicker/TimePickerRange）
                const getDateComponentType = (k: string): string => {
                    if (k.startsWith("DatePickerRange")) return "DatePickerRange";
                    if (k.startsWith("TimePickerRange")) return "TimePickerRange";
                    if (k.startsWith("DatePicker")) return "DatePicker";
                    if (k.startsWith("TimePicker")) return "TimePicker";
                    return "";
                };

                // 格式化日期值：将 dayjs 对象或日期字符串按照指定格式输出
                const formatDateValue = (type: string, value: any, format: string): any => {
                    if (value === null || value === undefined) return value;
                    if (dayjs.isDayjs(value)) {
                        return value.format(format);
                    }
                    if (typeof value === "string") {
                        const d = dayjs(value);
                        if (d.isValid()) {
                            return d.format(format);
                        }
                        return value;
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
                if (key && typeof key === "string") {
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
            setStyle: (style: any) => {
                setMStyle(style);
            }
        };
    });

    // 设置默认值，如果执行过事件流中的表单赋值逻辑，默认值不生效
    const initValues = useCallback((type: string, name: string, value: any) => {
        if (name && !defaultValueInvalidMap[id]) {
            let initValue = value;
            if (initValue != "" && value !== undefined && value !== null) {
                if (type === "InputNumber") initValue = value == "" ? "" : Number(value);
                if (type === "DatePicker") {
                    if (typeof initValue === "string") {
                        initValue = initValue.trim();
                        if (dateStrToDayjs(initValue)) {
                            initValue = dateStrToDayjs(initValue);
                        } else if (initValue) {
                            const rtnValue = getDateByType(value);
                            if (rtnValue) {
                                initValue = rtnValue;
                            }
                        } else {
                            initValue = undefined;
                        }
                    } else {
                        initValue = undefined;
                    }
                }
                // initValue = getDateByType(value);
                if (type === "DatePickerRange") initValue = getDateRangeByType(value);
                if (type === "TimePicker") initValue = dayjs(value, "HH:mm:ss");
            }
            setInitialValues({ [name]: initValue });
            form.setFieldValue([name], initValue);
            setFormData({
                name: id,
                value: { [name]: initValue }
            });
        }
    }, [defaultValueInvalidMap]);

    const baseStyle = useMemo(() => {
        return { ...config.style, ...mStyle };
    }, [config.style, mStyle]);

    const getColSpan = () => {
        if (!lineCount) return 6;
        return 24 / lineCount;
    };

    const getRestColSpan = () => {
        const elLength = elements.length;
        let total = fold ? (lineCount * leftLine - 1) : elLength;
        total = total > elLength ? elLength : total;
        return 24 - (total % lineCount) * getColSpan();
    };

    const getFormItemShow = (index: number) => {
        if (!fold) {
            return "block";
        }
        if (index > lineCount * leftLine - 2) {
            return "none";
        }
        return "block";
    };

    const handleOperate = (eventName: string) => {
        const btnEvent = config.events.find((event) => event.eventName === eventName);
        handleActionFlow(btnEvent?.actions, {});
    };

    const formItemStyle = (index: number) => {
        return { display: getFormItemShow(index), ...labelStyle ,marginTop:colMarginTop() };
    };

    const colMarginTop = ()=>{
        return verGap - 25
    }

    const other = useMemo(() => {
        return omit(config.props, ['disabled']);
    }, [config.props]);

    return (
        visible && (
            <FormContext.Provider value={{ form, initValues, fromId: id }}>
                <div>
                    <ConfigProvider theme={{ components: { Form: labelStyle } }}>
                        <Form
                            form={form}
                            style={baseStyle}
                            {...other}
                            data-id={id}
                            data-type={type}
                            initialValues={initialValues}
                            onValuesChange={handleChange}
                        >
                            <Row gutter={hozGap} style={{marginTop:-colMarginTop()}}>
                                {elements?.map((item: any, index: number) =>
                                    <Col span={getColSpan()} style={formItemStyle(index)}>
                                        <NgapRender elements={[item]} loopVariable={loopVariable}/>
                                    </Col>)}

                                <Col span={getRestColSpan()} className={"btn-row"} style={{marginTop:colMarginTop()}} >
                                    {resetText &&
                                        <Button type={"primary"} disabled={config.props.disabled} onClick={handleReset}
                                                ghost><ReloadOutlined />&nbsp;{resetText}</Button>}
                                    {submitText &&
                                        <Button type={"primary"} disabled={config.props.disabled} onClick={handleSearch}
                                                style={{ marginLeft: 5 }}><SearchOutlined />&nbsp;{submitText}</Button>}

                                    {bulkActionList?.map((item: any) => {
                                        return (
                                            <Button
                                                key={item.eventName}
                                                type={item.type}
                                                className={"btn-left"}
                                                danger={item.danger}
                                                ghost={item.ghost}
                                                icon={item.icon ? React.createElement(iconsList[item.icon]) : null}
                                                onClick={() => handleOperate(item.eventName)}>
                                                {item.text}
                                            </Button>
                                        );
                                    })}
                                    <span className={"fold"} onClick={() => {
                                        setFold(!fold);
                                    }}>{fold ? <DownOutlined /> :
                                        <UpOutlined />}&nbsp;{fold ? "展开" : "收起"}</span>
                                </Col>
                            </Row>
                        </Form>
                    </ConfigProvider>
                </div>
            </FormContext.Provider>
        )
    );
};
export default memo(forwardRef(GridForm));
