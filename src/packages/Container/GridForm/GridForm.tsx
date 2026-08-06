import { ComponentType, IDragTargetItem } from "./../../types";
import { Button, Col, ConfigProvider, Form, Row } from "antd";
import React, { CSSProperties, forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { useDrop } from "react-dnd";
import { useShallow } from "zustand/react/shallow";
import { getComponent } from "./../../index";
import NgapRender from "./../../NgapRender/NgapRender";
import { FormContext } from "./../../utils/context";
import { dateFormat, dateStrToDayjs, getDateByType, getDateRangeByType } from "./../../utils/util";
import dayjs from "dayjs";
import { useAppContext } from "./../../../utils/AppProvider";
import "./index.less";
import style from "../../component.module.less";
import { crossApiUserInfo } from "./../../../stores/crossapiStore";
import { apiListInfo } from "./../../../stores/apiListStore";
import { isEqual, omit } from "lodash-es";
import * as icons from "@ant-design/icons";
import { DownOutlined, ReloadOutlined, SearchOutlined, UpOutlined } from "@ant-design/icons";
import { handleActionFlow } from "@/packages/utils/action";

/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @param attr 组件其它属性，比如：id、type、className
 * @returns
 */
const GridForm = ({
                      id,
                      type,
                      config,
                      elements,
                      onChange,
                      loopVariable, onSearch, onReset
                  }: ComponentType & { loopVariable?: any }, ref: any) => {
    const [form] = Form.useForm();
    const {
        lineCount,
        leftLine,
        verGap,
        initFold,
        hozGap,
        submitText,
        resetText,
        labelStyle
    } = config.props.extraConfig;
    const _state = useAppContext();
    const { pageStore, mode } = _state;
    const addChildElements = pageStore(useShallow((state: any) => state.addChildElements));
    const setFormData = pageStore(useShallow((state: any) => state.setFormData));
    const setElementAlias = pageStore(useShallow((state: any) => state.setElementAlias));
    const defaultValueInvalidMap = pageStore(useShallow((state: any) => state.page.pageData.defaultValueInvalidMap || {}));
    const setDefaultValueInvalidMap = pageStore(useShallow((state: any) => state.setDefaultValueInvalidMap));
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const apiList = apiListInfo((state: any) => state.apiList);
    const [mStyle, setMStyle] = useState<any>({});
    const [fold, setFold] = useState<boolean>(initFold);
    const bulkActionList = config?.props?.bulkActionList || [];
    const iconsList: { [key: string]: any } = icons;

    // 使用自定义比较函数来订阅 formData
    const currentFormData = pageStore(
        useShallow((state: any) => state.page?.pageData?.formData?.[id])
    );
    useEffect(() => {
        (mode !== 'edit' && currentFormData) && setDefaultValueInvalidMap(id);
        form.setFieldsValue(dateFormat(elements, currentFormData, _state));
    }, []);
    const [visible, setVisible] = useState(true);
    const [initialValues, setInitialValues] = useState({});

    useEffect(() => {
        setFold(initFold);
    }, [initFold]);

    useEffect(() => {
        // 设置组件别名
        setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
    }, [config.props.elementAlias]);

    // 拖拽接收
    const [{ isOver }, drop] = useDrop({
        accept: "MENU_ITEM",
        async drop(item: IDragTargetItem, monitor) {
            if (monitor.didDrop()) return;
            // 生成默认配置
            const { config, events, methods = [] }: any = (await getComponent(item.type + "Config"))?.default || {};
            addChildElements({
                type: item.type,
                name: item.name,
                parentId: id,
                id: item.id,
                componentId: (item as { componentId?: string }).componentId,
                userInfo,
                apiList,
                _state,
                config,
                events,
                methods
            });
        },
        // TODO: 拖拽组件时，容器呈现背景色（后期需要判断组件是否可以拖入）
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop()
        })
    });

    // 提交表单
    const handleSearch = useCallback(() => {
        const values = form.getFieldsValue();
        console.log("[SearchForm] 查询，表单值:", values);
        onSearch?.(dateFormat(elements, values, _state));
    }, [elements, onSearch, _state]);

    // 重置表单
    const handleReset = useCallback(() => {
        form.resetFields();
        const values = form.getFieldsValue();
        onReset?.(dateFormat(elements, values, _state));
        setFormData({
            name: id,
            value: values,
            type: "override"
        });
    }, [elements, onReset, _state]);

    // 监听表单值变化
    const handleChange = useCallback((_changedValue: any, allValues: any) => {
            mode !== 'edit' && setDefaultValueInvalidMap(id);
            const values = dateFormat(elements, allValues, _state);
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
                mode !== 'edit' && setDefaultValueInvalidMap(id);
                const initData = dateFormat(elements, values, _state);
                form.setFieldsValue({ ...initData });
                setFormData({
                    name: id,
                    value: { ...initData },
                    type: "override"
                });
            },
            getFormData(key: string) {
                // 从 pageStore 获取 elementsMap，用于获取组件配置信息
                const { pageStore } = _state;
                const elementsMap = pageStore?.getState()?.page?.pageData?.elementsMap;

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
                    const format = element?.config?.props?.formWrap?.format || "YYYY-MM-DD HH:mm:ss";
                    if (dayjs.isDayjs(obj)) {
                        return formatDateValue(type, obj, format);
                    }
                    if (typeof obj === "string" && /^\d{4}-\d{2}-\d{2}/.test(obj)) {
                        return formatDateValue(type, obj, format);
                    }
                    if (Array.isArray(obj)) {
                        return obj.map((item: any) => convertDayjsToString(k, item));
                    }
                    return obj;
                };

                // 如果传入了 key，只返回指定 key 的值
                if (key && typeof key === "string") {
                    const value = currentFormData?.[key];
                    const type = getDateComponentType(key);
                    if (type || dayjs.isDayjs(value)) {
                        return convertDayjsToString(key, value);
                    }
                    return value;
                }

                // 遍历所有表单字段，对日期类型字段进行格式化转换
                const result: any = {};
                for (const k in currentFormData) {
                    if (Object.prototype.hasOwnProperty.call(currentFormData, k)) {
                        const type = getDateComponentType(k);
                        if (type || dayjs.isDayjs(currentFormData[k])) {
                            result[k] = convertDayjsToString(k, currentFormData[k]);
                        } else {
                            result[k] = currentFormData[k];
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
        const isEdit = mode === "edit";
        const elLength = elements.length;
        let total = fold ? (lineCount * leftLine - 1) : elLength;
        total = total > elLength ? elLength : total;

        if (isEdit) {
            total++;
        }
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
        handleActionFlow(btnEvent?.actions, {}, _state);
    };

    const formItemStyle = (index: number) => {
        return { display: getFormItemShow(index), ...labelStyle,marginTop:colMarginTop() };
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
                <div ref={drop}>
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
                                        <NgapRender elements={[item]} />
                                    </Col>)}

                                {mode === "edit" && <Col className={isOver ? style.boxHover : ""} style={{marginTop:colMarginTop()}} span={getColSpan()}>
                                    <div className="slots" style={{ lineHeight: "30px" }}>
                                        拖拽表单元素到这里
                                    </div>
                                </Col>}

                                <Col span={getRestColSpan()} className={"btn-row"} style={{marginTop:colMarginTop()}}>
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
                                                disabled={config.props.disabled}
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
export default memo(forwardRef(GridForm), (prevProps, nextProps) => {
    return prevProps.id == nextProps.id &&
        prevProps.elements.length != nextProps.elements.length &&
        isEqual(prevProps.loopVariable, nextProps.loopVariable) &&
        isEqual(prevProps.config, nextProps.config);
});
