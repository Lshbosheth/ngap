import { ComponentType, IDragTargetItem } from './../../types';
import { Form } from 'antd';
import { forwardRef, memo, useCallback, useImperativeHandle, useState, useEffect, useMemo, useRef, CSSProperties, ForwardedRef } from 'react';
import { useDrop } from 'react-dnd';
import { useShallow } from 'zustand/react/shallow';
import { getComponent } from './../../index';
import NgapRender from './../../NgapRender/NgapRender';
import { FormContext } from './../../utils/context';
import { dateFormat, getDateByType, getDateRangeByType, isNotEmpty, dateStrToDayjs, formatFormValues } from './../../utils/util';
import dayjs from 'dayjs';
import { useAppContext } from './../../../utils/AppProvider';
import './index.less';
import style from '../../component.module.less';
import { crossApiUserInfo } from './../../../stores/crossapiStore';
import { apiListInfo } from './../../../stores/apiListStore';
import { isEqual, cloneDeep, omit } from 'lodash-es';
import { produce } from 'immer';

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
    elementAlias: string;
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
    const _state = useAppContext();
    const { pageStore, mode } = _state;
    const addChildElements = pageStore(useShallow((state: any) => state.addChildElements));
    const setFormData = pageStore(useShallow((state: any) => state.setFormData));
    const setElementAlias = pageStore(useShallow((state: any) => state.setElementAlias));
    const defaultValueInvalidMap = pageStore(useShallow((state: any) => state.page.pageData.defaultValueInvalidMap || {}));
    const setDefaultValueInvalidMap = pageStore(useShallow((state: any) => state.setDefaultValueInvalidMap));
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const apiList = apiListInfo((state: any) => state.apiList);
    const [mStyle, setMStyle] = useState<CSSProperties>({});
    const [visible, setVisible] = useState(true);
    const [initialValues, setInitialValues] = useState({});
    const pendingInitValues = useRef<{ [key: string]: any }>({});
    const flushInitRef = useRef<(() => void) | null>(null);
    const timerRef = useRef<any>(null);
    // 使用自定义比较函数来订阅 formData
    const currentFormData = pageStore(useShallow((state: any) => state.page?.pageData?.formData?.[id]));
    useEffect(() => {
        if (currentFormData) {
            mode !== 'edit' && setDefaultValueInvalidMap(id);
            form.setFieldsValue(dateFormat(elements, currentFormData, _state));
        } else {
            form.resetFields();
            setInitialValues({});
        }
    }, []);
    // 设置组件别名
    useEffect(() => {
        setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
    }, [config.props.elementAlias]);

    // 拖拽接收
    const [{ isOver }, drop] = useDrop({
        accept: 'MENU_ITEM',
        async drop(item: IDragTargetItem, monitor) {
            if (monitor.didDrop()) return;
            // 生成默认配置
            const { config, events, methods = [] }: any = (await getComponent(item.type + 'Config'))?.default || {};
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
                methods,
            });
        },
        // TODO: 拖拽组件时，容器呈现背景色（后期需要判断组件是否可以拖入）
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });

    // 提交表单
    const handleFinish = useCallback(
        (values: any) => {
            onFinish?.(dateFormat(elements, values, _state));
        },
        [onFinish, JSON.stringify(elements)],
    );
    // 监听表单值变化
    const handleChange = useCallback(
        (_: any, allValues: any) => {
            mode !== 'edit' && setDefaultValueInvalidMap(id);
            const values = dateFormat(elements, allValues, _state);
            onChange?.(values);
            setFormData({
                name: id,
                value: values,
            });
        },
        [onChange, JSON.stringify(elements)],
    );
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
                mode !== 'edit' && setDefaultValueInvalidMap(id);
                const initData = dateFormat(elements, values, _state);
                form.setFieldsValue({ ...initData });
                setFormData({
                    name: id,
                    value: { ...initData },
                    type: 'override',
                });
            },
            getFormData(key: string) {
                // 从 pageStore 获取 elementsMap，用于获取组件配置信息
                const elementsMap = _state?.pageStore?.getState()?.page?.pageData?.elementsMap;
                const result = formatFormValues(elementsMap, currentFormData);
                return key ? result[key] : result;
            },
            setStyle: (style: CSSProperties) => {
                setMStyle(style);
            },
        };
    });

    // 批量提交初始化值到历史记录
    const flushInitValues = useCallback(() => {
        const pending = pendingInitValues.current;
        if (Object.keys(pending).length > 0) {
            // 先更新 formData（不记录历史）
            setFormData({
                name: id,
                value: { ...pending },
                type: 'override',
                skipHistory: true,
            });

            // 手动更新/创建最后一条历史记录
            const currentPageData = cloneDeep(pageStore.getState().page.pageData);
            pageStore.setState(
                produce((state: any) => {
                    if (state.historyStack.length > 0) {
                        // 更新最后一条
                        state.historyStack[state.historyStack.length - 1] = currentPageData;
                    } else {
                        // 强制创建新记录
                        state.historyStack.push(currentPageData);
                    }
                }),
            );

            pendingInitValues.current = {};
        }
    }, [id, setFormData]);

    flushInitRef.current = flushInitValues;

    // 组件挂载后延迟执行批量提交，确保所有 initValues 都已调用
    useEffect(() => {
        // 清除之前的定时器，避免重复执行
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
            console.log('[Form init] setTimeout triggered, flushing pending values:', JSON.stringify(pendingInitValues.current));
            flushInitValues();
        }, 0);
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
            // 不再清理 pendingInitValues，因为可能在组件更新时仍有 initValues 调用
        };
    }, [flushInitValues]);

    // 设置默认值，如果执行过事件流中的表单赋值逻辑，默认值不生效
    const initValues = useCallback(
        (type: string, name: string, value: any) => {
            if (name && !defaultValueInvalidMap[id]) {
                let initValue = value;
                if (isNotEmpty(value)) {
                    if (type === 'InputNumber') initValue = value == '' ? '' : Number(value);
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
                setInitialValues((prev) => ({ ...prev, [name]: initValue }));
                form.setFieldValue([name], initValue);
                pendingInitValues.current[name] = initValue;

                // 每次 initValues 被调用时，重新延迟触发 flush
                if (timerRef.current) {
                    clearTimeout(timerRef.current);
                }
                timerRef.current = setTimeout(() => {
                    flushInitValues();
                }, 0);
            }
        },
        [id, defaultValueInvalidMap],
    );
    // 缓存NgapRender的props，避免不必要的重新渲染
    const ngapRenderProps = useMemo(
        () => ({
            elements,
            loopVariable,
        }),
        [JSON.stringify(elements), JSON.stringify(loopVariable)],
    );
    const other = useMemo(() => {
        return omit(config.props, ['disabled']);
    }, [config.props]);
    return (
        visible && (
            <FormContext.Provider value={{ form, initValues, fromId: id }}>
                <div ref={drop}>
                    <Form
                        className={isOver ? style.boxHover : ''}
                        form={form}
                        style={{ ...config.style, ...mStyle }}
                        {...other}
                        data-id={id}
                        data-type={type}
                        initialValues={initialValues}
                        onFinish={handleFinish}
                        onValuesChange={handleChange}
                    >
                        {elements.length ? (
                            <NgapRender {...ngapRenderProps} />
                        ) : (
                            <div className="slots" style={{ lineHeight: '150px' }}>
                                拖拽表单元素到这里
                            </div>
                        )}
                    </Form>
                </div>
            </FormContext.Provider>
        )
    );
};
export default memo(forwardRef(MForm), (prevProps, nextProps) => {
    return (
        prevProps.id == nextProps.id &&
        prevProps.elements.length != nextProps.elements.length &&
        isEqual(prevProps.loopVariable, nextProps.loopVariable) &&
        isEqual(prevProps.config, nextProps.config)
    );
});
