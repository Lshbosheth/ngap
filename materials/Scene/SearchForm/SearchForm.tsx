import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, memo, useState, CSSProperties, ForwardedRef } from 'react';
import { Button, ButtonProps, Form, Space } from 'antd';
import { ComponentType } from '@materials/types';
import NgapRender from '@materials/NgapRender/NgapRender';
import { DownOutlined, UpOutlined, SearchOutlined, RedoOutlined } from '@ant-design/icons';
import * as icons from '@ant-design/icons';
import { usePageStore } from '@materials/stores/pageStore';
import { FormContext } from '@materials/utils/context';
import { dateFormat, getDateByType, getDateRangeByType, isNotEmpty } from '@materials/utils/util';
import { handleActionFlow } from '@materials/utils/action';
import dayjs from 'dayjs';
import styles from './index.module.less';
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
    form: {
        submitText: string;
        resetText: string;
    };
    authMoInfo?: any;
    bulkActionList?: Array<ButtonProps & { text: string; eventName: string; icon: string; authCode?: string }>;
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
    const [mStyle, setMStyle] = useState<CSSProperties>({});
    const [initialValues, setInitialValues] = useState({});
    const authMoInfos = config.props?.authMoInfo || {};
    const { formData, setFormData } = usePageStore((state) => ({
        formData: state.page.pageData.formData || {},
        setFormData: state.setFormData,
    }));
    const defaultValueInvalidMap: { [key: string]: any } = usePageStore(
        useShallow((state: any) => state.page?.pageData?.defaultValueInvalidMap || {}),
    );
    const setDefaultValueInvalidMap: any = usePageStore(useShallow((state: any) => state.setDefaultValueInvalidMap || {}));

    useEffect(() => {
        console.log('[SearchForm] 组件挂载，清空初始值');
        if (formData[id]) {
            setDefaultValueInvalidMap(id);
            form.setFieldsValue(formData[id]);
        } else {
            setInitialValues({});
            form.resetFields();
        }
    }, []);

    // 初始化表单值
    useEffect(() => {
        const timeout = setTimeout(() => {
            // 判断是否显示更多按钮
            setIsMore((emptyRef.current?.offsetTop as number) >= 32 && elements.length > 0);
        }, 500);
        return () => clearTimeout(timeout);
    }, [elements]);

    // 提交表单
    const handleSearch = () => {
        const values = form.getFieldsValue();
        onSearch?.(dateFormat(elements, values));
    };
    // 重置表单
    const handleReset = () => {
        form.resetFields();
        const values = form.getFieldsValue();
        onReset?.(dateFormat(elements, values));
        setFormData({
            name: id,
            value: values,
            type: 'override',
        });
    };

    // 监听表单值变化
    const handleValuesChange = (_: any, allValues: any) => {
        setDefaultValueInvalidMap(id);
        const values = dateFormat(elements, allValues);
        onChange?.(values);
        setFormData({
            name: id,
            value: values,
        });
    };

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
            setDefaultValueInvalidMap(id);
            const initData = dateFormat(elements, values);
            form.setFieldsValue(initData);
            setFormData({
                name: id,
                value: initData,
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
        const transformValue = dateFormat(elements, values);
        const btnEvent = config.events.find((event) => event.eventName === eventName);
        handleActionFlow(btnEvent?.actions, transformValue);
    };

    // 展开收起
    const toggleExpand = () => {
        setIsExpand(!isExpand);
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
                    form={form}
                    layout="inline"
                    data-id={id}
                    data-type={type}
                    style={{ ...config.style, ...mStyle }}
                    initialValues={initialValues}
                    onValuesChange={handleValuesChange}
                >
                    <div className={styles.formWrap} style={isMore && !isExpand ? { height: 32, overflow: 'hidden' } : {}}>
                        <NgapRender elements={elements} />
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
                                    let flage = true;
                                    if (item.authCode) {
                                        flage = authMoInfos[item.authCode] === '1';
                                    }
                                    if (!flage) return; //没有权限
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
                            <Button type="link" icon={isExpand ? <UpOutlined /> : <DownOutlined />} onClick={toggleExpand}>
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
