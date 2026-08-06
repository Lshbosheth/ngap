import React, { Suspense, forwardRef, memo, useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { message } from '@/utils/AntdGlobal';
import { ComItemType, ConfigType } from './../types/index';
import { handleActionFlow } from './../utils/action';
import { setComponentRef, clearComponentRef } from './../utils/useComponentRefs';
import { useShallow } from 'zustand/react/shallow';
import { produce } from 'immer';
import { useAppContext } from './../../utils/AppProvider';
import dayjs from 'dayjs';
import * as antd from 'antd';
import * as Plots from '@ant-design/plots';
import * as icons from '@ant-design/icons';
import { isNull, loadStyle, renderFormula } from './../utils/util';
import { UseMaterialTools } from './../utils/useMaterialTools';

import { omit, debounce, isEqual } from 'lodash-es';
import { getComponent } from './../index';
import './index.less';

/**
 * 编辑器用于生成组件
 * @param elements 模板所有组件对象
 * @param form 只有Form组件会传递form对象，用于子表单更新数据
 * @returns
 */
const NgapRender = memo((
    {
        elements = [],
        loopVariable,
        onClick,
        className,
        ref
    }: {
        elements: ComItemType[];
        loopVariable?: any;
        onClick?: any;
        className?: any;
        ref?: any;
    }) => {
    useEffect(() => {
        elementCache.clear();
    }, [elements]);

    return (
        <>
            <div onClick={onClick} style={{ display: 'contents' }} className={className} ref={ref}>
                {elements.map((item) => {
                    if (!item) return null;
                    return (
                        <span key={item.id} module-id={item.belongNodeId} className="componentBox">
                            <Material _item={item} loopVariable={loopVariable}></Material>
                        </span>
                    );
                })}
            </div>
        </>
    );
}, (prevProps, nextProps) => {
    // 长度不同必须重渲染
    if (prevProps.elements.length !== nextProps.elements.length) {
        return false;
    }
    // 检查每个元素的ID是否相同
    for (let i = 0; i < prevProps.elements.length; i++) {
        if (prevProps.elements[i]?.id !== nextProps.elements[i]?.id) {
            return false;
        }
    }
    // loopVariable也相同才跳过渲染
    if (prevProps.loopVariable === nextProps.loopVariable) {
        return true;
    }
    // 如果loopVariable是对象，进行深度比较
    return isEqual(prevProps.loopVariable, nextProps.loopVariable);
});

let globalRenderCount = 0;
const elementCache = new Map<string, any>();
// 渲染物料
export const Material = memo(({ _item, loopVariable }: { _item: ComItemType; loopVariable?: any }) => {
    if(!_item) return null;
    const materialTools = UseMaterialTools();
    const [Component, setComponent] = useState<any>(null);
    const [config, setConfig] = useState<any>();
    // 防抖的config更新
    const debouncedSetConfig = useMemo(
        () => debounce((newConfig: any) => {
            newConfig && setConfig(newConfig);
        }, 100),
        []
    );
    const _state = useAppContext();
    const { pageStore } = _state;
    // 使用自定义比较函数，只有当配置内容真正变化时才重新渲染
    const currentElementConfig = pageStore(useShallow((state: any) => state.page?.pageData?.elementsMap?.[_item.id]));
    const variableData = pageStore(useShallow((state: any) => state.page?.pageData?.variableData));
    const apiOutData = pageStore(useShallow((state: any) => state.page?.pageData?.apiOutData));
    const item1 = pageStore(
        useShallow((state: any) => {
            const targetId = _item.id;

            if (elementCache.has(targetId)) {
                return elementCache.get(targetId);
            }

            let _element: any = "";
            let findCount = 0;
            const deepFind = (elements: any): boolean => {
                for (const element of elements) {
                    findCount++;
                    if (element.id === targetId) {
                        _element = element;
                        return true;
                    }
                    if (element.elements?.length > 0 && deepFind(element.elements)) {
                        return true;
                    }
                }
                return false;
            }
            deepFind(state.page?.pageData?.elements);

            elementCache.set(targetId, _element);
            return _element;
        })
    )
    const item = useMemo(() => item1, [JSON.stringify(item1)])
    const formData = pageStore(
        useShallow((state: any) => {
            // 只有当item属于Form且有formItem配置时才订阅对应的formData
            if (item.parentId?.startsWith('Form') && item.config?.props?.formItem?.name) {
                const formId = item.parentId.split('_')[0]; // 假设parentId格式为 "Form_xxx"
                return state.page?.pageData?.formData?.[formId]?.[item.config.props.formItem.name];
            }
            return undefined; // 不订阅
        })
    );

    const updateToolbar = pageStore(useShallow((state: any) => state.updateToolbar));

    function initContext() {
        window.React = window.React || React;
        window.dayjs = window.dayjs || dayjs;
        window.antd = window.antd || antd;
        window.Plots = window.Plots || Plots;
        window.icons = window.icons || icons;
    }
    const prevConfig: any = useRef("");
    useEffect(() => {
        if (Object.keys(currentElementConfig).length === 0) return;
        if (currentElementConfig.remoteUrl) {
            initContext();
            loadStyle(item.type, currentElementConfig.remoteCssUrl as string);
            import(/* @vite-ignore */ currentElementConfig.remoteUrl || '').then((res) => {
                setComponent(() => {
                    return forwardRef(res.default);
                });
                updateToolbar();
            });
        } else {
            if (item.type === 'customComponent') {
                // 预览自定义元素加载
                setTimeout(() => {
                    setComponent(window.MyComponent);
                }, 500);
            } else {
                if (!getComponent(item.type)) {
                    message.error(`${item.name} 元素加载失败，请重新加载`);
                    return;
                }
                setComponent(getComponent(item.type));
            }
            updateToolbar();
        }
        if (item.type === 'customComponent') {
            // 预览自定义元素配置
            setTimeout(() => {
                if(prevConfig.current != JSON.stringify(window.MyComponentJsData.config)){
                    debouncedSetConfig(window.MyComponentJsData.config);
                    prevConfig.current = JSON.stringify(window.MyComponentJsData.config);
                }
            }, 500);
        } else {
            if(prevConfig.current != JSON.stringify(currentElementConfig.config)){
                debouncedSetConfig(currentElementConfig.config);
                prevConfig.current = JSON.stringify(currentElementConfig.config);
            }
        }
    }, []);

    useEffect(() => {
        if (!currentElementConfig) return;

        // 取消之前的定时器，避免重复执行
        const timer = setTimeout(() => {
            try {
                const newConfig = produce(currentElementConfig.config, (draft: ConfigType) => {
                    handleFormRegExp(draft);
                    memoizedHandleBindVariable(draft);
                });
                let newConfigStr = JSON.stringify(newConfig);
                if(prevConfig.current !== newConfigStr){
                    debouncedSetConfig(newConfig);
                    prevConfig.current = newConfigStr;
                }
            } catch (error) {
                console.error(`配置更新失败 [${item.type} - ${item.id}]:`, error);
            }
        }, 200);

        return () => clearTimeout(timer); // 清理定时器
    }, [JSON.stringify(variableData), JSON.stringify(formData), JSON.stringify(currentElementConfig?.config), JSON.stringify(loopVariable), JSON.stringify(apiOutData)]);

    // 处理表单正则
    const handleFormRegExp = (config: ConfigType) => {
        if (config?.props?.formItem) {
            const rules = config.props?.formItem.rules || [];
            rules?.map((item: any) => {
                if (item?.pattern) {
                    // 把字符串转成正则对象
                    item.pattern = new RegExp(item.pattern);
                }
            });
            config.props.formItem.rules = rules;
            // FormList比较特殊，需要传递索引
            if (item?.parentId?.startsWith('FormList') && config.props.formItem.name) {
                config.props.formItem.name = [item.name, config.props.formItem.name];
            }
            // 处理表单布局
            const { labelCol, wrapperCol } = config.props.formItem;
            if (isNull(labelCol?.span) && isNull(labelCol?.offset)) {
                delete config.props.formItem?.labelCol;
            }
            if (isNull(wrapperCol?.span) && isNull(wrapperCol?.offset)) {
                delete config.props.formItem?.wrapperCol;
            }
        }
    };

    // 使用useCallback缓存事件处理函数
    const memoizedHandleBindVariable = useCallback((config: ConfigType) => {
        Object.keys(config?.props || {}).forEach((key: any) => {
            const variableObj = config?.props?.[key];
            if (typeof variableObj === 'object') {
                if (variableObj?.type === 'static') {
                    config.props[key] = variableObj.value;
                } else if (variableObj?.type === 'variable') {
                    config.props[key] = materialTools.renderFormula(variableObj.value, {}, loopVariable);
                }
            }
        });
    }, [loopVariable, materialTools, JSON.stringify(variableData), JSON.stringify(formData), JSON.stringify(apiOutData)]);

    // 使用useCallback缓存事件函数，避免每次渲染都重新创建
    const createEvents = useCallback(() => {
        const eventFunction: { [key: string]: (params: any) => void } = {};
        const events = config?.events || [];

        // 没有配置事件流，直接返回
        if (!events?.length) {
            return {};
        }
        // 把重复的事件push到数组中（一个点击事件，可能有多个事件流）
        const obj: { [key: string]: any[] } = {};
        events?.forEach((event: any) => {
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
                        handleActionFlow(actions, params, _state);
                    }, 200);
                });
            };
        }
        return eventFunction;
    }, [config?.events, _state, handleActionFlow]); // 添加handleActionFlow依赖
    if (Component && config && config?.props.showOrHide !== false) {
        return (
            <Suspense fallback={<antd.Spin size="default"></antd.Spin>}>
                <Component
                    id={item.id}
                    type={item.type}
                    config={{
                        ...config,
                        props: { ...omit(config?.props, ['showOrHide']) },
                    }}
                    elements={item.elements || []}
                    loopVariable={loopVariable}
                    // 把事件函数传递给子组件，子组件触发对应事件时，会执行回调函数
                    {...createEvents()}
                    ref={(ref: any) => setComponentRef(item.id, ref)}
                />
            </Suspense>
        );
    }
    return null;
}, (prevProps, nextProps) => {
    // 快速路径：ID或类型变化必须重渲染
    if (prevProps._item.id !== nextProps._item.id) return false;
    // loopVariable比较
    if (!isEqual(prevProps.loopVariable, nextProps.loopVariable)) {
        return false;
    }
    return true;
});

export default NgapRender;
