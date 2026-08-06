import React, { lazy, Suspense, forwardRef, memo, useEffect, useState, useRef } from 'react';
import { ComItemType, ConfigType } from '@materials/types/index';
import { module as Components, getComponent } from '@materials/index';
import { handleActionFlow } from '@materials/utils/action';
import { setComponentRef, clearComponentRef } from '@materials/utils/useComponentRefs';
import { usePageStore } from '@materials/stores/pageStore';
import { useShallow } from 'zustand/react/shallow';
import { produce } from 'immer';
import * as antd from 'antd';
import { isNull, loadStyle, renderAsyncFormula } from '@materials/utils/util';
import CrossAPI from '@materials/utils/crossAPI';
import { omit } from 'lodash-es';
import './index.less';

// echarts预加载状态管理
let echartsLoadPromise: Promise<any> | null = null;
const preloadEcharts = () => {
    if (!echartsLoadPromise) {
        echartsLoadPromise = import('echarts');
    }
    return echartsLoadPromise;
};
// 重置echarts预加载状态
export const resetEchartsPreload = () => {
    echartsLoadPromise = null;
};
// 检查是否包含需要echarts的组件
const containsEchartComponents = (elements: ComItemType[]): boolean => {
    return elements.some(item => {
        if (item.type === 'MapChart') return true;
        if (item.elements && item.elements.length > 0) {
            return containsEchartComponents(item.elements);
        }
        return false;
    });
};

// 渲染物料
export const Material = memo(({ moduleId, item, loopVariable }: { moduleId: any; item: ComItemType; loopVariable?: any }) => {
    const [Component, setComponent] = useState<any>(null);
    const [config, setConfig] = useState<ConfigType>();
    const [cached, setCached] = useState(false);
    const { elementsMap, variableData, formData, apiOutData } = usePageStore(
        useShallow((state) => ({
            elementsMap: state.page?.pageData?.elementsMap || {},
            variables: state.page?.pageData?.variables || [],
            variableData: state.page?.pageData?.variableData || {},
            formData: state.page?.pageData?.formData || {},
            apiOutData: state.page?.pageData?.apiOutData || {},
        })),
    );
    const prevConfig: any = useRef("");
    const renderEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const configUpdateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (Object.keys(elementsMap).length === 0) return;

        // 如果是MapChart组件，预先加载echarts
        if (item.type === 'MapChart') {
            preloadEcharts();
        }

        if (Components[item.type as keyof typeof Components]) {
            const comp = Components[item.type as keyof typeof Components];
            // 如果是函数类型（本地组件），需要用 lazy 包装
            if (typeof comp === 'function') {
                const Comp = lazy(comp);
                setComponent(Comp);
            } else {
                setComponent(comp);
            }
        }
        if (prevConfig.current != JSON.stringify(elementsMap[item.id].config)) {
            setConfig(elementsMap[item.id].config);
            prevConfig.current = JSON.stringify(elementsMap[item.id].config);
        }

        renderEndTimerRef.current = setTimeout(() => {
            window.renderEnd = performance.now();
        }, 0);

        return () => {
            if (renderEndTimerRef.current) {
                clearTimeout(renderEndTimerRef.current);
                renderEndTimerRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (Object.keys(elementsMap).length === 0) return;

        if (configUpdateTimerRef.current) {
            clearTimeout(configUpdateTimerRef.current);
        }

        configUpdateTimerRef.current = setTimeout(() => {
            let newConfig = produce(elementsMap[item.id].config, (draft: ConfigType) => {
                handleFormRegExp(draft);
                handleBindVariable(draft);
            });
            if (JSON.stringify(newConfig) != prevConfig.current) {
                setConfig(newConfig);
                prevConfig.current = JSON.stringify(newConfig);
            }
            configUpdateTimerRef.current = null;
        }, 200);

        return () => {
            if (configUpdateTimerRef.current) {
                clearTimeout(configUpdateTimerRef.current);
                configUpdateTimerRef.current = null;
            }
        };
    }, [variableData, formData, elementsMap, loopVariable, apiOutData]);

    // 处理表单正则
    const handleFormRegExp = (config: ConfigType) => {
        if (config.props?.formItem) {
            const rules = config.props?.formItem?.rules || [];
            rules?.map((item: any) => {
                if (item?.pattern) {
                    // 把字符串转成正则对象
                    item.pattern = new RegExp(item.pattern);
                }
            });
            if (config.props?.formItem) {
                config.props.formItem.rules = rules;
            }
            // FormList比较特殊，需要传递索引
            if (item.parentId?.startsWith('FormList') && config.props?.formItem?.name) {
                config.props.formItem.name = [item.name, config.props.formItem.name];
            }
            // 处理表单布局
            const { labelCol, wrapperCol } = config.props?.formItem || {};
            if (isNull(labelCol?.span) && isNull(labelCol?.offset)) {
                delete config.props.formItem?.labelCol;
            }
            if (isNull(wrapperCol?.span) && isNull(wrapperCol?.offset)) {
                delete config.props.formItem?.wrapperCol;
            }
        }
    };
    // 处理绑定变量
    const handleBindVariable = (config: ConfigType) => {
        Object.keys(config?.props || {}).map((key) => {
            const variableObj = config?.props?.[key];
            // 如果组件属性是对象，则判断是静态值还是变量
            if (typeof variableObj === 'object') {
                // 如果是静态值，则直接赋值。
                if (variableObj?.type === 'static') {
                    config.props[key] = variableObj.value;
                } else if (variableObj?.type === 'variable') {
                    // 绑定变量时，可能是变量，也可能是绑定某一个表单值
                    config.props[key] = renderAsyncFormula(variableObj.value, {}, loopVariable);
                }
            }
        });
    };

    // 生成事件函数，挂载到组件上，组件中的按钮在触发事件时，会执行这里的事件函数
    const createEvents = () => {
        const eventFunction: { [key: string]: (params: any) => void } = {};
        const events = config?.events || [];

        // 没有配置事件流，直接返回
        if (!events?.length) {
            return {};
        }
        // 把重复的事件push到数组中（一个点击事件，可能有多个事件流）
        const obj: { [key: string]: any[] } = {};
        events?.forEach((event) => {
            if (event?.actions?.length > 0) {
                obj[event.eventName] = (obj[event.eventName] || []).concat([event.actions]);
            }
        });
        // 遍历对象，按顺序执行事件流
        for (const key in obj) {
            eventFunction[key] = (params: any) => {
                // 同一个事件：循环执行多个事件流
                obj[key]?.forEach((actions) => {
                    // 延迟执行获取循环变量
                    setTimeout(() => {
                        handleActionFlow(actions, params);
                    }, 200);
                });
            };
        }
        return eventFunction;
    };

    // 默认为显示状态未改动时，该字段为undefind，逻辑编辑器内写完逻辑之后根据布尔值判断元素显隐
    if (Component && (config?.props.showOrHide === true || config?.props.showOrHide === undefined || config?.props.showOrHide === '')) {
        if (cached) {
            return (
                <span module-id={moduleId} className="componentBox">
                    <Component
                        className={['Ngap-component']} // 暂时还没用，日后可能会用
                        id={item.id}
                        config={{ ...config, props: { ...omit(config?.props, ['showOrHide']) } }}
                        elements={item.elements || []}
                        loopVariable={loopVariable}
                        // 把事件函数传递给子组件，子组件触发对应事件时，会执行回调函数
                        {...createEvents()}
                        ref={(ref: any) => {
                            setComponentRef(item.id, ref);
                        }}
                    />
                </span>
            );
        } else {
            return (
                <Suspense fallback={<antd.Spin size="default"></antd.Spin>}>
                    <span module-id={moduleId} className="componentBox">
                        <Component
                            id={item.id}
                            type={item.type}
                            config={{ ...config, props: { ...omit(config?.props, ['showOrHide']) } }}
                            elements={item.elements || []}
                            loopVariable={loopVariable}
                            // 把事件函数传递给子组件，子组件触发对应事件时，会执行回调函数
                            {...createEvents()}
                            ref={(ref: any) => {
                                setComponentRef(item.id, ref);
                            }}
                        />
                    </span>
                </Suspense>
            );
        }
    } else {
        return <></>;
    }
}, (prevProps, nextProps) => {
    return JSON.stringify(prevProps.item) === JSON.stringify(nextProps.item) &&
        prevProps.loopVariable === nextProps.loopVariable;
});

/**
 * 编辑器用于生成组件
 * @param elements 模板所有组件对象
 * @param form 只有Form组件会传递form对象，用于子表单更新数据
 * @returns
 */
const NgapRender = memo(({ elements = [], loopVariable, onClick, className, ref }: { elements: ComItemType[]; onClick?: (e: React.MouseEvent) => void; loopVariable?: any; className?: string; ref?: any }) => {
    // 在组件挂载时检查是否需要预加载echarts
    // display: 'contents' 千万不能去除 会影响整体样式
    useEffect(() => {
        if (containsEchartComponents(elements)) {
            preloadEcharts();
        }
    }, [elements]);

    return (
        <>
            <div onClick={onClick} style={{ display: 'contents' }} className={className} ref={ref}>
                {elements?.map((item) => {
                    if (!item) return <></>;
                    return <Material moduleId={item.belongNodeId} item={item} key={item.id} loopVariable={loopVariable}></Material>;
                })}
            </div>
        </>
    );
});



export default NgapRender;
