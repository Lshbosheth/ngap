import React, { Suspense, lazy, memo, useState } from 'react';
import { ConfigProvider, Flex, Form, Tabs, Tooltip } from 'antd';
import type { TabsProps } from 'antd';
import { useDebounceEffect, useDebounceFn } from 'ahooks';
import { useAppContext } from '@/utils/AppProvider';
import { useShallow } from 'zustand/react/shallow';
import { CheckOutlined, CopyOutlined } from '@ant-design/icons';
import { message } from '@/utils/AntdGlobal';
import { defaultsDeep } from 'lodash-es';
import copy from 'copy-to-clipboard';
import SpinLoading from '@/components/SpinLoading';
import { getComponent, getComponentType } from '@/packages/index';
import styles from './index.module.less';
import { handleApi } from './../../../packages/utils/handleApi';
import request from '../../../utils/request';

// 属性设置器
const SetterRender = lazy(() => import('@/components/SetterRender/SetterRender'));
// 样式配置
const StyleConfig = lazy(() => import('@/components/StyleConfig/StyleConfig'));
// 事件配置
const EventConfig = lazy(() => import('@/components/EventConfig/EventConfig'));
// 接口配置
const ApiConfig = lazy(() => import('@/components/ApiConfig/ApiConfig'));
/**
 * 生成左侧组件列表
 */
const ConfigPanel = memo(() => {
    const _state = useAppContext();
    const { pageStore, setConfigPanelPinned } = _state;
    const { pageName, pageProps, selectedElement, savePageInfo, elementsMap, editElement } = pageStore(
        useShallow((state: any) => ({
            pageName: state.config?.appName || state.config?.componentName,
            pageProps: state.page?.pageData?.config?.props || {},
            selectedElement: state.selectedElement,
            savePageInfo: state.savePageInfo,
            elementsMap: state.page?.pageData?.elementsMap || {},
            editElement: state.editElement,
        }))
    );
    const componentName = selectedElement
    ? elementsMap[selectedElement.id]?.name
    : '';
    const [form] = Form.useForm();
    const [isCopy, setCopy] = useState<boolean>(false);
    const [clientSize, setClientSize] = useState({
        width: 0,
        height: 0,
    });
    const [ComponentConfig, setComponentConfig] = useState<any>(null);

    /**
     * 表单初始化
     * 当配置中的输入的值发生变化后，需要再次渲染
     */
    useDebounceEffect(
        () => {
            form.resetFields();
            // 只有选中一个组件，才可以展示属性配置
            if (selectedElement) {
                const remoteConfigUrl = elementsMap[selectedElement.id]?.remoteConfigUrl || '';
                if (remoteConfigUrl) {
                    /* @vite-ignore */
                    import(remoteConfigUrl).then((res = {}) => {
                        setComponentConfig(res.default);
                        form.setFieldsValue(elementsMap[selectedElement.id]?.config.props || {});
                    });
                } else {
                    // 生成组件
                    if (selectedElement.type === 'customComponent') {
                        // 预览自定义元素配置
                        setComponentConfig(window.MyComponentJsData);
                        // defaults是为了继承页面中新增的配置项
                        setTimeout(() => {
                            form.setFieldsValue(elementsMap[selectedElement.id]?.config?.props);
                        }, 0);
                    } else {
                        // 获取返回类型，不为function时走自定义逻辑
                        if (getComponentType(selectedElement.type + 'Config') == 'function') {
                            getComponent(selectedElement.type + 'Config').then((res: any) => {
                                const item = res.default;
                                // 根据api中的source动态给属性中apiOpt为true的字段的options赋值
                                // if(elementsMap[selectedElement?.id].config?.api?.sourceType){ // api不为空对象时
                                // 给属性中apiOpt为true的字段的options赋值
                                if (item.attrs.some((sItem: any) => sItem.apiOpt)) {
                                    // api不为空对象时
                                    if (
                                        elementsMap[selectedElement?.id].config?.api?.sourceType == 'json' ||
                                        elementsMap[selectedElement?.id].config?.api?.sourceType == 'variable'
                                    ) {
                                        handleApi(
                                            elementsMap[selectedElement?.id]?.config?.api,
                                            elementsMap[selectedElement?.id]?.config?.api?.source || {},
                                            _state,
                                        )
                                            .then((apiRes) => {
                                                if (apiRes?.code === 0) {
                                                    if (apiRes.data) {
                                                        // 取json数据第一项中的key，处理成{label:item,value:item}形式
                                                        let apiSelectOptions: any = [];
                                                        if (Array.isArray(apiRes.data[0])) {
                                                            // 折柱组合图 (数组嵌套)
                                                            const newHandleOpt = [
                                                                ...new Set([...Object.keys(apiRes.data[0][0]), ...Object.keys(apiRes.data[1][0])]),
                                                            ];
                                                            apiSelectOptions = newHandleOpt.map((item) => {
                                                                return { label: item, value: item };
                                                            });
                                                        } else {
                                                            // 数组对象
                                                            if (
                                                                selectedElement.type == 'Tree' ||
                                                                selectedElement.type == 'Cascader' ||
                                                                selectedElement.type == 'TreeSelect'
                                                            ) {
                                                                // 弹出树、级联选择、目录树
                                                                const obj = elementsMap[selectedElement?.id].config?.api?.source[0] || [];
                                                                const arrayProps = Object.keys(obj).filter((key) => Array.isArray(obj[key])); // 找出值为数组的属性名
                                                                apiSelectOptions = Object.keys(apiRes.data)
                                                                    .filter((item) => !arrayProps.includes(item)) // 数组属性不放在下拉框里
                                                                    .map((item) => {
                                                                        return { label: item, value: item };
                                                                    });
                                                            } else if (selectedElement.type == 'NgapTable') {
                                                                apiSelectOptions = Object.keys(apiRes.data).map((item) => {
                                                                    return { label: item, value: item };
                                                                });
                                                                item.config.api.source = apiRes.data
                                                            } else {
                                                                apiSelectOptions = Object.keys(apiRes.data).map((item) => {
                                                                    return { label: item, value: item };
                                                                });
                                                            }
                                                        }

                                                        for (let i = 0; i < item.attrs.length; i++) {
                                                            if (item.attrs[i].apiOpt) {
                                                                if (item.attrs[i].props) {
                                                                    item.attrs[i].props.options = apiSelectOptions;
                                                                } else {
                                                                    item.attrs[i].props = { options: apiSelectOptions };
                                                                }
                                                                // 折柱组合图Y轴、条形图X轴、柱状图Y轴、折线图Y轴复选
                                                                if (
                                                                    (selectedElement.type == 'BarAndLine' &&
                                                                        (item.attrs[i].name == 'yField_bar' ||
                                                                            item.attrs[i].name == 'yField_line')) ||
                                                                    (selectedElement.type == 'BarChart' && item.attrs[i].name == 'xField') ||
                                                                    ((selectedElement.type == 'ColumnChart' || selectedElement.type == 'LineChart') &&
                                                                        item.attrs[i].name == 'yField')
                                                                ) {
                                                                    item.attrs[i].props.mode = 'multiple';
                                                                }
                                                            }
                                                        }
                                                    } else {
                                                        console.error('[LineChart]数据格式错误');
                                                    }
                                                }
                                            })
                                            .finally(() => {
                                                setComponentConfig(item);
                                                // defaults是为了继承页面中新增的配置项
                                                form.setFieldsValue(elementsMap[selectedElement.id]?.config.props);
                                            });
                                    } else if (
                                        elementsMap[selectedElement?.id].config?.api?.sourceType == 'api' &&
                                        elementsMap[selectedElement?.id].config.api.id
                                    ) {
                                        request
                                            .post('/csf/appInterface/getInterfaceParamsAndCheck', {
                                                params: { interfaceId: elementsMap[selectedElement?.id]?.config?.api?.id },
                                            })
                                            .then((data: any) => {
                                                let apiSelectOptions: any = [];
                                                if (
                                                    selectedElement.type == 'Tree' ||
                                                    selectedElement.type == 'Cascader' ||
                                                    selectedElement.type == 'TreeSelect'
                                                ) {
                                                    // 弹出树、级联选择、目录树
                                                    // const obj = elementsMap[selectedElement?.id].config?.api?.source[0] || [];
                                                    // const arrayProps = Object.keys(obj).filter((key) => Array.isArray(obj[key])); // 找出值为数组的属性名
                                                    // apiSelectOptions = Object.keys(data.beans)
                                                    //     .filter((item) => !arrayProps.includes(item)) // 数组属性不放在下拉框里
                                                    //     .map((item:any) => {
                                                    //         return { label: item.name, value: item.value };
                                                    //     });
                                                        apiSelectOptions = data.beans.map((item: any) => {
                                                        return { label: item.name, value: item.value };
                                                    });
                                                } else if (selectedElement.type == 'NgapTable') {
                                                    apiSelectOptions = data.beans.map((item: any) => {
                                                        return { label: item.name, value: item.value };
                                                    });
                                                } else {
                                                    apiSelectOptions = data.beans.map((item: any) => {
                                                        return { label: item.name, value: item.name };
                                                    });
                                                    // apiSelectOptions = [
                                                    //     {label:'业务场景',value:'业务场景'},
                                                    //     {label:'话术引导环节',value:'话术引导环节'},
                                                    //     {label:'标题',value:'标题'},
                                                    //     {label:'话术',value:'话术'},
                                                    // ]
                                                }
                                                for (let i = 0; i < item.attrs.length; i++) {
                                                    if (item.attrs[i].apiOpt) {
                                                        if (item.attrs[i].props) {
                                                            item.attrs[i].props.options = apiSelectOptions;
                                                        } else {
                                                            item.attrs[i].props = { options: apiSelectOptions };
                                                        }
                                                        // 折柱组合图Y轴、条形图X轴、柱状图Y轴、折线图Y轴复选
                                                        if (
                                                            (selectedElement.type == 'BarAndLine' &&
                                                                (item.attrs[i].name == 'yField_bar' || item.attrs[i].name == 'yField_line')) ||
                                                            (selectedElement.type == 'BarChart' && item.attrs[i].name == 'xField') ||
                                                            ((selectedElement.type == 'ColumnChart' || selectedElement.type == 'LineChart') &&
                                                                item.attrs[i].name == 'yField')
                                                        ) {
                                                            item.attrs[i].props.mode = 'multiple';
                                                        }
                                                    }
                                                }
                                            })
                                            .catch(() => {})
                                            .finally(() => {
                                                setComponentConfig(item);
                                                // defaults是为了继承页面中新增的配置项
                                                form.setFieldsValue(elementsMap[selectedElement.id]?.config.props);
                                            });
                                    } else {
                                        // 暂时对其他情况不做修改
                                        setComponentConfig(item);
                                        // defaults是为了继承页面中新增的配置项
                                        form.setFieldsValue(elementsMap[selectedElement.id]?.config.props);
                                    }
                                } else {
                                    if (elementsMap[selectedElement?.id].config?.api?.sourceType == 'json') {
                                        const source = elementsMap[selectedElement?.id]?.config?.api?.source || [];
                                        if (source.length && item.config.api) {
                                            item.config.api.source = source;
                                        }
                                    }

                                    setComponentConfig(item);
                                    // defaults是为了继承页面中新增的配置项
                                    form.setFieldsValue(elementsMap[selectedElement.id]?.config.props);
                                }
                            });
                        } else {
                            setComponentConfig(getComponent(selectedElement.type + 'Config')?.default || {});
                            setTimeout(() => {
                                form.setFieldsValue(elementsMap[selectedElement.id]?.config.props);
                            }, 0);
                        }
                    }
                }
                form.setFieldValue('id', selectedElement.id);
                // 获取组件尺寸
                const target = document.querySelector(`[data-id="${selectedElement?.id}"]`);
                if (target) {
                    const size = target.getBoundingClientRect();
                    setClientSize(size);
                }
            } else {
                // 获取页面配置
                getComponent('PageConfig').then((res: any) => {
                    const item = res.default;
                    setComponentConfig(item);
                    // defaults是为了继承页面中新增的配置项
                    form.setFieldsValue({ pageName, ...defaultsDeep({ ...pageProps }, item.config.props) });
                });
            }
            return () => {
                setComponentConfig(null);
                form.resetFields();
            };
        },
        [selectedElement?.id, pageName, elementsMap[selectedElement?.id]?.config?.api],
        {
            wait: 300,
        },
    );

    const { run } = useDebounceFn(
        () => {
            handleValueChange(form.getFieldsValue());
        },
        { wait: 300 },
    );

    // 接收表单值
    const handleValueChange = (values: any) => {
        if (selectedElement?.id) {
            let newValues: {[key: string]: any} = {};
            Object.keys(values).forEach(prop => {
                let key = prop;
                let value = values[prop];
                // 如果使用了fx的逻辑，但是没有配置内容，则认为这条配置不生效
                if (typeof value == "object" && value.type == "variable" && (value.value == undefined || value.value == null || value.value === "")) {
                    value = "";
                }
                newValues[key] = value;
            })
            editElement({
                id: selectedElement.id,
                type: 'props',
                props: newValues,
            });
        } else {
            savePageInfo({
                type: 'props',
                props: values,
            });
        }
    };

    // 复制组件ID
    const handleCopy = () => {
        copy(selectedElement?.id || pageName);
        message.info('复制成功');
        setCopy(true);
        setTimeout(() => {
            setCopy(false);
        }, 3000);
    };

    const formLayout = {
        labelCol: { span: 8 },
        wrapperCol: { span: 15 },
    };

    const items: TabsProps['items'] = [
        {
            key: 'props',
            label: `属性`,
            children: (
                <Form form={form} style={{ paddingBottom: 20 }} {...formLayout} layout="horizontal" labelAlign="right" onValuesChange={run}>
                    <div className={styles.widget}>
                        {selectedElement?.id  ? <span className={styles.text}>组件类型：{componentName }</span> : null}
                    </div>

                    <div className={styles.widget}>
                        {selectedElement?.id ? <span className={styles.text}>组件ID：{selectedElement?.id}</span> : null}
                        {selectedElement?.id && isCopy ? (
                            <CheckOutlined className={styles.ml5} />
                        ) : (
                            selectedElement?.id && <CopyOutlined onClick={handleCopy} className={styles.ml5} />
                        )}
                    </div>
                    <Flex justify="space-between" gap={20} className={styles.widget}>
                        <span>宽度: {clientSize.width.toFixed(0)} </span>
                        <span>高度: {clientSize.height.toFixed(0)}</span>
                    </Flex>
                    <Suspense fallback={<SpinLoading />}>
                        <SetterRender
                            attrs={ComponentConfig?.attrs || []}
                            form={form}
                            config={
                                elementsMap[selectedElement?.id]?.config?.api?.sourceType == 'json'
                                    ? ComponentConfig?.config
                                    : elementsMap[selectedElement?.id]?.config || {}
                            }
                        />
                    </Suspense>
                </Form>
            ),
        },
        {
            key: 'style',
            label: `样式`,
            children: (
                <Suspense fallback={<SpinLoading />}>
                    <StyleConfig />
                </Suspense>
            ),
        },
        {
            key: 'event',
            label: `事件`,
            children: (
                <Suspense fallback={<SpinLoading />}>
                    <EventConfig />
                </Suspense>
            ),
        },
        {
            key: 'api',
            label: `数据`,
            children: (
                <Suspense fallback={<SpinLoading />}>
                    <ApiConfig />
                </Suspense>
            ),
        },
    ];

    const [configShow, setConfigShow] = useState(false);
    const [isPinned, setIsPinned] = useState(false);
    const _setShow = (state: boolean) => {
        console.log(state);
        setConfigShow(state);
    };
    return (
        <div className={configShow ? 'openContent ' + styles.configPanelContent : 'closeContent ' + styles.configPanelContent}>
            {!isPinned && (
                <>
                    <Tooltip title={configShow ? '收起' : '展开'}>
                        <div className={configShow ? 'closeConfig' : 'openConfig'} onClick={() => _setShow(!configShow)}></div>
                    </Tooltip>
                    <Tooltip title="固定">
                        <div className={configShow ? 'fixedCloseConfig' : 'fixedOpenConfig'} onClick={() => {
                            setIsPinned(true);
                            setConfigShow(true);
                            setConfigPanelPinned(true);
                        }}></div>
                    </Tooltip>
                </>
            )}
            {isPinned && (
                <Tooltip title="悬浮">
                    <div className="suspendIcon" title='悬浮' onClick={() => {
                        setIsPinned(false);
                        setConfigPanelPinned(false);
                    }}></div>
                </Tooltip>
            )}

            <React.Suspense fallback={<SpinLoading />}>
                <ConfigProvider
                    theme={{
                        token: {
                            fontSize: 12,
                        },
                        components: {
                            Tabs: {
                                titleFontSize: 14,
                            },
                            Form: {
                                itemMarginBottom: 15,
                            },
                            InputNumber: {
                                paddingInline: 8,
                            },
                        },
                    }}
                >
                    <Tabs
                        className="attrBox"
                        centered
                        defaultActiveKey="props"
                        items={items}
                        style={{
                            display: configShow ? 'block' : 'none', // 核心：控制 display
                        }}
                    />
                </ConfigProvider>
            </React.Suspense>
        </div>
    );
});

export default ConfigPanel;
