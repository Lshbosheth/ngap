import { forwardRef, memo, useState, useEffect, useImperativeHandle, useRef } from 'react';
import { ComponentType, IDragTargetItem } from './../../types';
import NgapRender from './../../NgapRender/NgapRender';
import { useShallow } from 'zustand/react/shallow';
import { handleApi } from './../../utils/handleApi';
import { usePageStore } from '@materials/stores/pageStore';
import { Flex } from 'antd';
import { message } from '@materials/utils/AntdGlobal';
import request from './../../utils/request';


const Cycle = ({ id, type, config, elements, onFinish, onChange }: ComponentType, ref: any) => {
    const [visible, setVisible] = useState(true);
    const [data, setData] = useState<Array<any>>([]);
    const variableData = usePageStore(useShallow((state: any) => state.page.pageData.variableData));
    const addChildElements = usePageStore(useShallow((state: any) => state.addChildElements));
    const formData = usePageStore(useShallow((state: any) => state.page.pageData.formData || {}));
    const setForEachVariable = usePageStore(useShallow((state: any) => state.setForEachVariable));
    const apiOutData = usePageStore(useShallow((state: any) => state.page.pageData.apiOutData));
    const prevVariableData = useRef(variableData);
    const prevFormData = useRef(formData);
    const prevApiOutData = useRef(apiOutData);
    const prevConfigApi = useRef({});
    const [mStyle,setMStyle] = useState<any>({})

    useEffect(() => {
        // 请求实际数据
        if(config && config?.api?.name?.type == "variable" && config?.api?.name?.value?.indexOf?.("context.variable.") > -1){
            let variableKeys = Object.keys(variableData || {}) || [];
            let flag = false;
            variableKeys.forEach((variable: string) => {
                if(config && config?.api?.name?.type == "variable" && config?.api?.name?.value?.indexOf?.(variable || "") > -1){
                    if(JSON.stringify(variableData[variable] ?? {}) != JSON.stringify(prevVariableData.current[variable] ?? {})){
                        flag = true;
                    }
                }
            })
            flag && loadData();
            console.log("variableData", variableData);
            console.log("variableDataChange", flag);
        }
        prevVariableData.current = variableData;
    }, [variableData])

    useEffect(() => {
        if (config && config?.api?.name?.type == "variable" && config?.api?.name?.value?.indexOf?.("context.Form_") > -1) {
            let formDataKeys = Object.keys(formData || {}) || [];
            let flag = false;
            formDataKeys.forEach((formDataKey: string) => {
                let formItemKeys = Object.keys(formData[formDataKey]) || [];
                formItemKeys.forEach((formItemKey: string) => {
                    if (config && config?.api?.name?.type == "variable" && config?.api?.name?.value?.indexOf?.(formItemKey || "") > -1) {
                        if (JSON.stringify(formData[formDataKey]?.[formItemKey] ?? {}) != JSON.stringify(prevFormData.current[formDataKey]?.[formItemKey] ?? {})) {
                            flag = true;
                        }
                    }
                })
            })
            flag && loadData();
            console.log("formData", formData);
            console.log("formDataChange", flag);
        }
        prevFormData.current = formData;
    }, [formData])

    useEffect(() => {
        if (JSON.stringify(prevConfigApi.current) != JSON.stringify(config.api)){
            loadData();
        }
        prevConfigApi.current = config.api;
    }, [config.api])

    useEffect(() => {
        if (config && config?.api?.name?.type == "variable" && config?.api?.name?.value?.indexOf?.("context.api.id_") > -1) {
            let variableKeys = Object.keys(apiOutData || {}) || [];
            let flag = false;
            variableKeys.forEach((variable: string) => {
                if(config && config?.api?.name?.type == "variable" && config?.api?.name?.value?.indexOf?.(variable || "") > -1){
                    if(JSON.stringify(apiOutData?.[variable] ?? {}) != JSON.stringify(prevApiOutData.current?.[variable] ?? {})){
                        flag = true;
                    }
                }
            })
            flag && loadData();
        }
        prevApiOutData.current = apiOutData;
    }, [apiOutData])

    // 对外暴露方法
    useImperativeHandle(ref, () => {
        return {
            show() {
                setVisible(true);
            },
            hide() {
                setVisible(false);
            },
            refresh() { // 循环容器刷新方式
                loadData();
            },
            setStyle:(style:any)=>{
                setMStyle(style)
            }
        }
    });

    const prevDataRef: any = useRef([]);
    // 监听数据变化，设置所有循环变量到 store
    useEffect(() => {
        if (data.length > 0) {
            // 存储整个循环数据数组
            if (JSON.stringify(prevDataRef.current) != JSON.stringify(data)) {
                console.log(`[Cycle组件] 循环数据已变化，更新全局变量: 数量=${data.length} - 时间: ${new Date().toISOString()} (${Date.now()})`);
                setForEachVariable(id, data);
                prevDataRef.current = data;
            }

        } else {
            if (prevDataRef.current.length != 0) {
                setForEachVariable(id, []);
            }
            prevDataRef.current = [];
        }
    }, [data, id]);

    const dealData = (data: any) => {
        const keys = Object.keys(data);
        const res: any = [];
        const _keys = keys.filter((key: string) => Array.isArray(data[key]) && data[key].length > 0);
        for (let i = 0, len = data[_keys[0]].length; i < len; i++) {
            const obj: any = {};
            _keys.forEach((key: any) => {
                obj[key] = data[key][i];
            });
            res.push(obj);
        }
        return res;
    };
    // 加载数据
    const loadData = async () => {
        if (config.api) {
            try {
                const res = await handleApi(config.api, {});
                const _data = dealData(res.data);
                if (res?.code === 0) {
                    if (Array.isArray(_data)) {
                        setData(_data);
                    } else {
                        console.error('[Cycle]', '数据格式错误，需要数组类型');
                        setData([]);
                    }
                }
            } catch (error) {
                console.error('[Cycle]', '加载数据失败', error);
                setData([]);
            } finally {

            }
        } else {
            // 无数据源时显示空状态
            setData([]);
        }
    };
    // 提取 gap 数值和单位（兼容数字和字符串类型）
    const gap = config?.props?.gap;
    const gapNum = gap !== undefined && gap !== null && gap !== ''
        ? parseFloat(String(gap).replace(/(px|%|vw|vh|em|rem)/, ''))
        : 0;
    const gapUnit = gap !== undefined && gap !== null && gap !== ''
        ? String(gap).match(/(px|%|vw|vh|em|rem)/)?.[0] || 'px'
        : 'px';
    // 获取垂直布局属性
    const isVertical = config?.props?.vertical === true;

    console.log("CycleBoxInit");
    useEffect(() => {
        console.log("CycleBoxRefresh");
    }, [])
    return (
        visible && (
            <div data-id={id} data-type={type} style={{...config.style,...mStyle}}>
                {Array.isArray(elements) && elements.length ? (
                    <Flex
                        vertical={config?.props?.vertical}
                        wrap={config?.props?.wrap}
                        justify={config?.props?.justify}
                        align={config?.props?.align}
                        style={{ width: '100%', height: '100%' }}
                    >
                        {data.map((item, index) => (<RenderItem item={item} index={index} elements={elements} id={id}></RenderItem>))}
                    </Flex>
                ) : (
                    <div className="slots" style={{ padding: '10px', border: '1px dashed #d9d9d9' }}>
                        拖拽组件到这里
                    </div>
                )}
                {/* 使用 margin 实现 gap 效果 */}
                {gapNum > 0 && data?.length > 1 && (
                    <style
                        dangerouslySetInnerHTML={{
                            __html: isVertical
                                ? `
                                [data-id="${id}"] > div > div:not(:last-child) .componentBox > * {
                                    margin-bottom: ${gapNum}${gapUnit};
                                }
                                `
                                : `
                                [data-id="${id}"] > div > div:not(:last-child) .componentBox > * {
                                    margin-right: ${gapNum}${gapUnit};
                                }
                                `,
                        }}
                    />
                )}
            </div>
        )
    );
};
// 渲染循环项
const RenderItem = memo(({ item, index, elements, id }: any) => {
    const setForEachVariable = usePageStore(useShallow((state: any) => state.setForEachVariable));
    // 点击处理函数：先设置循环变量，确保状态完全更新
    const handleItemClick = async (e: React.MouseEvent) => {
        // 阻止事件冒泡，避免重复触发
        e.stopPropagation();

        // 设置循环变量到全局 store
        setForEachVariable(`${id}_currentItem`, item);
        setForEachVariable('activeComponentId', id);

        // 强制等待至少一个事件循环，确保状态完全更新后再执行事件流
        await new Promise(resolve => setTimeout(resolve, 10));
    };
    console.log("CycleInnerRefresh");
    return (
        <NgapRender
            key={`${id}_${index}`}
            data-index={index}
            onClick={handleItemClick}
            elements={elements}
            loopVariable={item}
        />
    );
}, (prevProps, nextProps) => {
    return JSON.stringify(prevProps.item) == JSON.stringify(nextProps.item)
        && JSON.stringify(prevProps.elements) == JSON.stringify(nextProps.elements)
        && prevProps.index == nextProps.index
        && prevProps.id == nextProps.id
});
export default memo(forwardRef(Cycle), (prevProps, nextProps) => {
    return JSON.stringify(prevProps.elements) == JSON.stringify(nextProps.elements) && JSON.stringify(prevProps.config) == JSON.stringify(nextProps.config)
});
