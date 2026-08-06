import React, { forwardRef, useCallback, useEffect, useImperativeHandle, memo, useRef, useState, useMemo, ForwardedRef, CSSProperties } from 'react';
import { Button, ButtonProps, Form, Space } from 'antd';
import { useDrop } from 'react-dnd';
import { ComponentType, IDragTargetItem } from './../../types';
import { getComponent } from './../../index';
import NgapRender from './../../NgapRender/NgapRender';
import { DownOutlined, UpOutlined, SearchOutlined, RedoOutlined } from '@ant-design/icons';
import * as icons from '@ant-design/icons';
import { FormContext } from './../../utils/context';
import { dateFormat, getDateByType, getDateRangeByType, isNotEmpty } from '../../utils/util';
import { handleActionFlow } from './../../utils/action';
import styles from './index.module.less';
import componentStyles from '../../component.module.less';
import dayjs from 'dayjs';
import { useAppContext } from './../../../utils/AppProvider';
import { crossApiUserInfo } from './../../../stores/crossapiStore';
import { apiListInfo } from './../../../stores/apiListStore';
import { useShallow } from 'zustand/react/shallow';

interface RefConfig {
    show: () => void;
    hide: () => void;
    reset: () => void;
    submit: () => void;
    init: (values: Record<string, any>) => void;
    getFormData: (key: string) => void;
    setStyle: (style: CSSProperties) => void;
}

export interface IConfig {
    elementAlias?: string;
    form: {
        submitText: string;
        resetText: string;
    };
    bulkActionList?: Array<ButtonProps & { text: string; eventName: string; icon: string }>;
}
/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @param attr 组件其它属性，比如：id、type、className
 * @returns
 */
const SearchForm = ({ id, type, config, elements, onSearch, onChange, onReset }: ComponentType<IConfig>, ref: ForwardedRef<RefConfig>) => {
    const [form] = Form.useForm();
    const emptyRef = useRef<HTMLDivElement>(null);
    const [isExpand, setIsExpand] = useState(false);
    const [isMore, setIsMore] = useState(false);
    const [visible, setVisible] = useState(true);
    const [initialValues, setInitialValues] = useState({});
    const [mStyle, setMStyle] = useState<CSSProperties>({});
    const _state = useAppContext();
    const { pageStore, mode } = _state;
    const { addChildElements, updateToolbar, formData, setFormData, setElementAlias } = pageStore(
        useShallow((state: any) => ({
            addChildElements: state.addChildElements,
            updateToolbar: state.updateToolbar,
            formData: state.page.pageData.formData || {},
            setFormData: state.setFormData,
            setElementAlias: state.setElementAlias,
        })),
    );
    const defaultValueInvalidMap = pageStore(useShallow((state: any) => state.page.pageData.defaultValueInvalidMap || {}));
    const setDefaultValueInvalidMap = pageStore(useShallow((state: any) => state.setDefaultValueInvalidMap || {}));

    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const apiList = apiListInfo((state: any) => state.apiList);

    // 设置组件别名
    useEffect(() => {
        setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
    }, [config.props.elementAlias]);

    useEffect(() => {
        console.log('[SearchForm] 组件挂载，清空初始值');
        if (formData[id]) {
            mode !== 'edit' && setDefaultValueInvalidMap(id);
            form.setFieldsValue(formData[id]);
        } else {
            setInitialValues({});
            form.resetFields();
        }
    }, []);

    // 初始化表单值
    useEffect(() => {
        const timeout = setTimeout(() => {
            setIsMore((emptyRef.current?.offsetTop as number) >= 32 && elements.length > 0);
        }, 500);
        return () => clearTimeout(timeout);
    }, [elements]);

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
    const handleSearch = () => {
        const values = form.getFieldsValue();
        onSearch?.(dateFormat(elements, values, _state));
    };
    // 重置表单
    const handleReset = () => {
        form.resetFields();
        const values = form.getFieldsValue();
        onReset?.(dateFormat(elements, values, _state));
        setFormData({
            name: id,
            value: values,
            type: 'override',
        });
    };
    const defaultValueInvalid = useRef(false);

    // 监听表单值变化
    const handleValuesChange = (_: any, allValues: any) => {
        mode !== 'edit' && setDefaultValueInvalidMap(id);
        const values = dateFormat(elements, allValues, _state);
        onChange?.(values);
        setFormData({
            name: id,
            value: values,
        });
    }

    // 暴露表单函数
    useImperativeHandle(ref, () => ({
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
        init(values: Record<string, any> = {}) {
            mode !== 'edit' && setDefaultValueInvalidMap(id);
            const initData = dateFormat(elements, values, _state);
            form.setFieldsValue(initData);
            setFormData({
                name: id,
                value: initData,
                type: 'override',
            });
        },
        getFormData(key: string) {
            if (key && typeof key === 'string') {
                return formData[id]?.[key];
            }
            return formData[id];
        },
        setStyle: (style: CSSProperties) => {
            setMStyle(style);
        },
    }));

    /**
     * 操作按钮点击
     */
    const handleOperate = (eventName: string) => {
        const values = form.getFieldsValue();
        const transformValue = dateFormat(elements, values, _state);
        const btnEvent = config.events.find((event) => event.eventName === eventName);
        handleActionFlow(btnEvent?.actions, transformValue, _state);
    };

    // 展开收起
    const toggleExpand = () => {
        setIsExpand(!isExpand);
        updateToolbar();
    };

    // 查询和重置按钮
    const { submitText, resetText } = config.props.form || {};
    // 批量操作按钮
    const bulkActionList = config.props.bulkActionList || [];
    // 设置默认值
    const initValues = useCallback(
        (type: string, name: string, value: any) => {
            if (name && !defaultValueInvalidMap[id]) {
                let initValue = value;
                if (isNotEmpty(value)) {
                    if (type === 'InputNumber') initValue = Number(value);
                    if (type === 'DatePicker') initValue = getDateByType(value);
                    if (type === 'DatePickerRange') initValue = getDateRangeByType(value);
                    if (type === 'TimePicker') initValue = dayjs(value, 'HH:mm:ss');
                }
                setInitialValues({ [name]: initValue });
                form.setFieldValue([name], initValue);
                setFormData({
                    name: id,
                    value: { [name]: initValue },
                });
            }
        },
        [defaultValueInvalidMap],
    );
    const iconsList: { [key: string]: any } = icons;
    return (
        visible && (
            <FormContext.Provider value={{ initValues }}>
                <Form
                    className={mode == 'edit' ? (isOver ? componentStyles.boxHover : '') : ''}
                    form={form}
                    layout="inline"
                    style={{ ...config.style, ...mStyle }}
                    data-id={id}
                    data-type={type}
                    initialValues={initialValues}
                    onValuesChange={handleValuesChange}
                >
                    <div className={styles.formWrap} ref={drop} style={isMore && !isExpand ? { height: 32, overflow: 'hidden' } : {}}>
                        {elements.length ? <NgapRender elements={elements} /> : <div className="slots">拖拽表单元素到这里</div>}
                        <div ref={emptyRef}></div>
                    </div>
                    <Space style={{ alignItems: 'baseline', marginLeft: 10 }}>
                        {submitText ? (
                            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                                {submitText}
                            </Button>
                        ) : null}

                        {resetText ? (
                            <Button type="default" icon={<RedoOutlined />} onClick={handleReset}>
                                {resetText}
                            </Button>
                        ) : null}

                        {bulkActionList.length > 0 && (
                            <div className={styles.action}>
                                {config.props.bulkActionList?.map((item, index) => {
                                    return (
                                        <Button
                                            type={item.type}
                                            danger={item.danger}
                                            icon={item.icon ? React.createElement(iconsList[item.icon]) : null}
                                            onClick={() => handleOperate(item.eventName)}
                                            key={`bulkAction${index}`}
                                        >
                                            {item.text}
                                        </Button>
                                    );
                                })}
                            </div>
                        )}
                        {isMore && (
                            <Button type="primary" icon={isExpand ? <UpOutlined /> : <DownOutlined />} onClick={toggleExpand}>
                                {isExpand ? '收起' : '展开'}
                            </Button>
                        )}
                    </Space>
                </Form>
            </FormContext.Provider>
        )
    );
};
export default memo(forwardRef(SearchForm));
