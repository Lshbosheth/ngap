import { forwardRef, memo, useState, useEffect, useImperativeHandle, useRef } from 'react';
import { ComponentType, IDragTargetItem } from './../../../packages/types';
import { useDrop } from 'react-dnd';
import NgapRender from './../../NgapRender/NgapRender';
import { useShallow } from 'zustand/react/shallow';
import { useAppContext } from './../../../utils/AppProvider';
import style from '../../component.module.less';
import { getComponent } from './../../index';
import { handleApi } from './../../utils/handleApi';
import { crossApiUserInfo } from './../../../stores/crossapiStore';
import { apiListInfo } from './../../../stores/apiListStore';
import { Flex } from 'antd';
import { message } from '@/utils/AntdGlobal';
import request from './../../../utils/request';
import { isEqual } from 'lodash-es';

const Cycle = ({ id, type, config, elements, onFinish, onChange }: ComponentType, ref: any) => {
    const [visible, setVisible] = useState(true);
    const _state = useAppContext();
    const [data, setData] = useState<Array<any>>([]);
    const [mStyle,setMStyle] = useState<any>({})

    const { pageStore } = _state;
    const addChildElements = pageStore(useShallow((state: any) => state.addChildElements));
    const formData = pageStore(useShallow((state: any) => state.page.pageData.formData || {}));
    const mode = pageStore(useShallow((state: any) => state.mode));
    const setElementAlias = pageStore(useShallow((state: any) => state.setElementAlias));
    const setForEachVariable = pageStore(useShallow((state: any) => state.setForEachVariable));
    const setForEachVariableSelect = pageStore(useShallow((state: any) => state.setForEachVariableSelect));
    const variableData = pageStore(useShallow((state: any) => state.page.pageData.variableData));
    const apiOutData = pageStore(useShallow((state: any) => state.page.pageData.apiOutData));
    const userInfo = crossApiUserInfo(useShallow((state: any) => state.userInfo));
    const apiList = apiListInfo(useShallow((state: any) => state.apiList));

    useEffect(() => {
        // 设置组件别名
        setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
    }, [config.props.elementAlias]);

    // 组件卸载时清理循环变量
    useEffect(() => {
        return () => {
            setForEachVariable(id, null);
        };
    }, [id, setForEachVariable]);

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


    // 刷新数据
    const refreshCycele = () => {
        if(mode == "edit"){
            if (config?.api?.sourceType == 'api' && config?.api?.id) {
                request
                    .post('/csf/appInterface/getInterfaceParamsAndCheck', { params: { interfaceId: config.api.id } })
                    .then((data: any) => {
                        const mapping = data?.beans?.map((item: any) => {
                            return {
                                name: item.name,
                                id: item.value
                            }
                        });
                        setForEachVariableSelect(id, mapping);
                    })
                    .catch(() => {
                        message.error('接口返回错误，请检查');
                    });
            } else if (config?.api?.sourceType == 'json') {
                const mapping = Object.keys(config?.api?.source).map((item: any) => {
                    return {
                        id: item,
                        name: item
                    }
                });
                setForEachVariableSelect(id, mapping);
            } else {
                const mapping = Object.keys(config?.api?.source).map((item: any) => {
                    return {
                        id: item,
                        name: item
                    }
                });
                // 赋值为空值
                setForEachVariableSelect(id, mapping);
            }
        }
    }

    useEffect(() => {
        refreshCycele();
    }, [variableData, formData, config.api]);

    const prevVariableData = useRef(variableData);
    const prevFormData = useRef(formData);
    const prevConfigApi = useRef({});
    const prevApiOutData = useRef(apiOutData);
    useEffect(() => {
        // 请求实际数据
        if(config && config?.api?.name?.type == "variable" && config?.api?.name?.value?.indexOf?.("context.variable.") > -1){
            let variableKeys = Object.keys(variableData) || [];
            let flag = false;
            variableKeys.forEach((variable: string) => {
                if (config && config?.api?.name?.type == 'variable' && config?.api?.name?.value?.indexOf?.(variable || '') > -1) {
                    if (JSON.stringify(variableData[variable] ?? {}) != JSON.stringify(prevVariableData.current[variable] ?? {})) {
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
        if(config && config?.api?.name?.type == "variable" && config?.api?.name?.value?.indexOf?.("context.Form_") > -1){
            let formDataKeys = Object.keys(formData) || [];
            let flag = false;
            formDataKeys.forEach((formDataKey: string) => {
                let formItemKeys = Object.keys(formData[formDataKey]) || [];
                formItemKeys.forEach((formItemKey: string) => {
                    if (config && config?.api?.name?.type == 'variable' && config?.api?.name?.value?.indexOf?.(formItemKey || '') > -1) {
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
        if(JSON.stringify(prevConfigApi.current) != JSON.stringify(config.api)){
            loadData();
        }
        prevConfigApi.current = config.api;
    }, [config.api])
    useEffect(() => {
        if (config && config?.api?.name?.type == "variable" && config?.api?.name?.value?.indexOf?.("context.api.id_") > -1) {
            let variableKeys = Object.keys(apiOutData || {}) || [];
            let flag = false;
            variableKeys.forEach((variable: string) => {
                if (config && config?.api?.name?.type == 'variable' && config?.api?.name?.value?.indexOf?.(variable || '') > -1) {
                    if (JSON.stringify(apiOutData[variable] ?? {}) != JSON.stringify(prevApiOutData.current[variable] ?? {})) {
                        flag = true;
                    }
                }
            })
            flag && loadData();
        }
        prevApiOutData.current = apiOutData;
    }, [apiOutData])
    // 监听数据变化，设置所有循环变量到 store
    useEffect(() => {
        if (data.length > 0) {
            // 存储整个循环数据数组
            setForEachVariable(id, data);
        } else {
            // 无数据时清空
            setForEachVariable(id, []);
        }
    }, [data, id, setForEachVariable]);
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
                refreshCycele();
            },
            setStyle:(style:any)=>{
                setMStyle(style)
            }
        }
    });

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
                const res = await handleApi(config.api, {}, _state);
                const _data = dealData(res.data);
                if (res?.code === 0) {
                    if (Array.isArray(_data)) {
                        setData(_data);
                    } else {
                        console.log('[Cycle]', '数据格式错误，需要数组类型');
                        setData([]);
                    }
                }
            } catch (error) {
                console.log('[Cycle]', '加载数据失败', error);
                setData([]);
            } finally {

            }
        } else {
            // 无数据源时显示空状态
            setData([]);
        }
    };
    // 渲染循环项
    const renderItem = (item: any, index: number) => {
        return (
            <NgapRender
                key={index}
                data-index={index}
                onClick={() => {
                    setForEachVariable(`${id}_currentItem`, item);
                    setForEachVariable('activeComponentId', id);
                }}
                elements={elements}
                loopVariable={item}
            />
        );
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

    return (
        visible && (
            <div data-id={id} data-type={type} ref={drop} style={{...config.style,...mStyle}}>
                {Array.isArray(elements) && elements.length ? (
                    <Flex
                        vertical={config?.props?.vertical}
                        wrap={config?.props?.wrap}
                        justify={config?.props?.justify}
                        align={config?.props?.align}
                        style={{ width: '100%', height: '100%' }}
                    >
                        {data.map((item, index) => (<RenderItem key={index} item={item} index={index} elements={elements} id={id}></RenderItem>))}
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
                                [data-id="${id}"] > div > div:not(:last-child) > .componentBox > * {
                                    margin-bottom: ${gapNum}${gapUnit};
                                }
                                `
                                : `
                                [data-id="${id}"] > div > div:not(:last-child) > .componentBox > * {
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
    const _state = useAppContext();
    const { pageStore } = _state;
    const setForEachVariable = pageStore(useShallow((state: any) => state.setForEachVariable));
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
    if (prevProps.id != nextProps.id) return false;
    if (!isEqual(prevProps.config, nextProps.config)) return false;
    if (prevProps.elements.length != nextProps.elements.length) return false;
    return true
});
