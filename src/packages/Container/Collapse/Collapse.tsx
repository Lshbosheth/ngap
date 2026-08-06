import React, { forwardRef, useImperativeHandle, useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Collapse } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { ComponentType, IDragTargetItem } from './../../types';
import NgapRender from './../../NgapRender/NgapRender';
import { useAppContext } from './../../../utils/AppProvider';
import { useShallow } from 'zustand/react/shallow';
import { isEqual, debounce, omit } from 'lodash-es';
import { renderAsyncFormula, createId } from '@/packages/utils/util.ts';
import './index.less';
import { useDrop } from 'react-dnd';
import { getComponent } from './../../index';
import { crossApiUserInfo } from './../../../stores/crossapiStore';
import { apiListInfo } from './../../../stores/apiListStore';
import { useDebounceFn } from 'ahooks';
import CollapseConfig from './CollapseItemSchema';

/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const MCollapse = (
    { id, type, config, elements, loopVariable, onCollapseOpenItem, onCollapseCloseItem }: ComponentType & { loopVariable?: any },
    ref: any,
) => {
    const [visible, setVisible] = useState(true);
    const _state = useAppContext();
    const { pageStore, mode } = _state;
    const elementsMap = pageStore(useShallow((state: any) => state.page.pageData.elementsMap));
    const updateToolbar = pageStore(useShallow((state: any) => state.updateToolbar));
    const setElementAlias = pageStore(useShallow((state: any) => state.setElementAlias));
    const editElement = pageStore(useShallow((state: any) => state.editElement));
    const addChildElements = pageStore(useShallow((state: any) => state.addChildElements));
    const [mStyle, setMStyle] = useState<any>({});

    // 折叠面板展开状态 activeKey
    const [activeKey, setActiveKey] = useState<string[] | undefined>(undefined);

    useEffect(() => {
        // 设置组件别名
        setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
    }, [config.props.elementAlias]);

    // 初始化时，如果没有子页签，自动新增一个
    const initDefaultItem = useCallback(() => {
        const items = config.props.items || [];
        if (mode === 'edit' && items.length === 0) {
            const newId = createId('CollapseItem');
            const newItem = {
                id: newId,
                key: newId,
                label: '折叠面板1',
                hidden: false,
            };
            editElement({
                id,
                type: 'props',
                props: {
                    ...config.props,
                    items: [newItem],
                },
            });
            const { config: itemConfig, events, methods = [] }: any = CollapseConfig || {};
            addChildElements({
                type: 'CollapseItem',
                name: '子页签',
                parentId: id,
                id: newId,
                config: {
                    ...itemConfig,
                    props: {
                        ...itemConfig.props,
                        key: newId,
                        label: '折叠面板1',
                        hidden: false,
                    },
                },
                events,
                methods,
            });
        }
    }, [mode, config.props, id, editElement, addChildElements]);

    const debouncedInitDefaultItem = useMemo(() => debounce(initDefaultItem, 300), [initDefaultItem]);

    useEffect(() => {
        debouncedInitDefaultItem();
        return () => {
            debouncedInitDefaultItem.cancel();
        };
    }, [config.props.items, mode]);

    const handleChange = useCallback(
        (activeKey: string[]) => {
            setActiveKey((prevState) => {
                const prevData = prevState || [];

                // 需求不明确
                if (prevData.length === activeKey.length) {
                    // 手风琴效果， 同时展开和收起
                    if (activeKey.length === 0) {
                        onCollapseCloseItem?.(prevData?.[0]);
                    } else {
                        onCollapseCloseItem?.();
                        onCollapseOpenItem?.();
                    }
                } else if (prevData.length > activeKey.length) {
                    // const activeKeyMap = new Set(prevState);
                    // if (activeKey.some((value) => activeKeyMap.has(value))) {
                    //
                    // }
                    // 收起
                    onCollapseCloseItem?.();
                } else {
                    // 展开
                    onCollapseOpenItem?.();
                }
                return activeKey;
            });

            setTimeout(() => {
                updateToolbar();
            }, 200);
        },
        [updateToolbar],
    );

    // 对外暴露方法
    useImperativeHandle(ref, () => {
        return {
            show() {
                setVisible(true);
            },
            hide() {
                setVisible(false);
            },
            setOpenCollapse(data: { activeKey: string }) {
                setActiveKey((prevState) => {
                    const setKey = data.activeKey.split(',');
                    return [...new Set([...(prevState || []), ...setKey])];
                });
            },
            setCloseCollapse(data: { activeKey: string }) {
                setActiveKey((prevState) => {
                    const prevData = prevState || [];
                    const setKey = data.activeKey.split(',');
                    const setList = [...new Set([...prevData, ...setKey])];
                    return prevData.filter((value) => !setList.includes(value));
                });
            },
            setCollapseOpenAll(...args: any) {
                // console.log('xxxxxxxxxxx----00333', arguments);

                const allIds = list.map((item: any) => item.key);
                setActiveKey(allIds);
            },
            setCollapseCloseAll(...args: any) {
                // console.log('xxxxxxxxxxx----00044', arguments);

                setActiveKey([]);
            },
            setStyle: (style: any) => {
                setMStyle(style);
            },
        };
    });

    // 格式化 label 名字， 从 type: 'Variable'中
    function formatLabelName(label: any) {
        if (typeof label === 'string') return label;
        if (typeof label === 'object' && label !== null) {
            if (label.type === 'static') {
                return label.value;
            }
            if (label.type === 'variable') {
                return renderAsyncFormula(label.value, {}, _state);
            }
        }
        return '';
    }

    const { items = [], ...props } = config.props;
    const list = useMemo(() => {
        const { items = [] } = config.props;
        return items.reduce((prev: any[], item: any, index: number) => {
            // 隐藏item
            if (item.hidden) return prev;

            let childrenElement = elements.find((el) => el.id === item.id);
            if (!childrenElement && elements[index]) {
                childrenElement = elements[index];
            }
            if (!childrenElement) {
                prev.push({ label: formatLabelName(item.label), key: item.key });
                return prev;
            }

            const prop = elementsMap[childrenElement.id]?.config?.props;
            if (!prop) return prev;

            // 子组件判断隐藏组件
            if (prop.showOrHide && prop.showOrHide.value !== '') {
                const showOrHide = formatLabelName(prop.showOrHide);
                if (!showOrHide) return prev;
            }

            let label = formatLabelName(prop.label);

            let titleElements: any = (childrenElement.elements || []).filter((element: any) => element.id.indexOf('_titleContent') > -1);
            let children = {
                ...childrenElement,
                elements: (childrenElement.elements || []).filter((element: any) => element.id.indexOf('_titleContent') == -1),
            };
            prev.push({
                ...prop,
                key: item.id,
                label: <TitleContent id={item.id} label={label} titleElements={titleElements} loopVariable={loopVariable}></TitleContent>,
                children: <NgapRender elements={[children]} loopVariable={loopVariable} />,
            });

            return prev;
        }, []);
    }, [config, elements, elementsMap, loopVariable]);

    const other = useMemo(() => {
        let defaultActiveKey: string | string[] = props.defaultActiveKey || [];

        if (typeof defaultActiveKey === 'string' && defaultActiveKey.length && defaultActiveKey.indexOf(',') !== -1) {
            defaultActiveKey = defaultActiveKey.split(',');
        }
        return { ...omit(props, ['authInfo']), defaultActiveKey };
    }, [props]);

    return (
        visible && (
            <>
                <div className="mCollapse">
                    <Collapse
                        // defaultActiveKey={[]}
                        style={{ ...config.style, ...mStyle }}
                        {...other}
                        activeKey={activeKey}
                        items={list}
                        data-id={id}
                        data-type={type}
                        expandIcon={({ isActive }) => {
                            if (!isActive) {
                                return (
                                    <span>
                                        <span style={{ margin: '0 6px' }}>{formatLabelName(props.openIconText)}</span>
                                        <RightOutlined rotate={0} />
                                    </span>
                                );
                            }
                            return (
                                <span>
                                    <span style={{ margin: '0 6px' }}>{formatLabelName(props.closeIconText)}</span>
                                    <RightOutlined rotate={90} />
                                </span>
                            );
                        }}
                        onChange={handleChange}
                    />
                </div>
            </>
        )
    );
};
export default memo(forwardRef(MCollapse), (prevProps, nextProps) => {
    if (prevProps.id != nextProps.id) return false;
    if (!isEqual(prevProps.config, nextProps.config)) return false;
    if (!isEqual(prevProps.loopVariable, nextProps.loopVariable)) return false;
    return prevProps.elements.length == nextProps.elements.length;
});
const TitleContent = memo(({ id, label, titleElements, loopVariable }: any) => {
    const _state = useAppContext();
    const { pageStore, mode } = _state;
    const addChildElements = pageStore(useShallow((state: any) => state.addChildElements));
    const selectedElement = pageStore(useShallow((state: any) => state.selectedElement));
    const setSelectedElement = pageStore(useShallow((state: any) => state.setSelectedElement));
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const apiList = apiListInfo((state: any) => state.apiList);
    // 拖拽接收
    const [{ isOver }, drop] = useDrop({
        accept: 'MENU_ITEM',
        async drop(item: IDragTargetItem, monitor) {
            if (monitor.didDrop()) return;
            // 生成默认配置
            const { config, events, methods = [] }: any = (await getComponent(item.type + 'Config'))?.default || {};
            config.collapseTitle = true;
            addChildElements({
                type: item.type,
                name: item.name,
                parentId: id,
                id: item.id + '_titleContent',
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
    // 鼠标悬浮事件
    const [hoverTarget, setHoverTarget] = useState<HTMLElement | null>(null);
    const handleOver = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (mode === 'preview') return;
        // 如果当前点击的不是自定义组件，需要获取最近的组件对象
        const targetDom = target.closest('[data-id]') as HTMLElement;
        if (targetDom) {
            const componentid = targetDom?.dataset.id as string;
            if (componentid === selectedElement?.id || componentid === hoverTarget?.dataset.id) return;
            setHoverTarget(targetDom);
        } else if (hoverTarget) {
            setHoverTarget(null);
        }
        event.stopPropagation();
    };

    // 鼠标悬浮防抖监听
    const { run: handleRunOver } = useDebounceFn(handleOver, { wait: 300 });
    // 点击画布，选中目标对象
    const handleClick = (event: MouseEvent) => {
        event.stopPropagation();
        if (mode === 'preview') return;
        const target = event.target as HTMLElement;
        // 如果当前点击的不是自定义组件，需要获取最近的组件对象
        const targetDom = target.closest('[data-id]') as HTMLElement;
        if (targetDom) {
            const id = targetDom?.dataset.id as string;
            if (id === selectedElement?.id) return;
            // 保存在store中，用于更新配置面板
            setSelectedElement({
                id,
                type: targetDom?.dataset.type,
            });
            setHoverTarget(null);
        } else if (selectedElement?.id) {
            setSelectedElement(undefined);
        }
    };
    return (
        <>
            {!!label && <div className="collapseTitle">{label || ''}</div>}
            <div
                className="collapseContent"
                ref={drop}
                onClick={(e: any) => {
                    e.stopPropagation();
                    handleClick(e);
                    return false;
                }}
                onMouseOver={(e: any) => {
                    handleRunOver(e);
                }}
            >
                {titleElements.length ? (
                    <NgapRender elements={titleElements} loopVariable={loopVariable} />
                ) : (
                    mode == 'edit' && <div className="slots">拖拽元素到这里</div>
                )}
            </div>
        </>
    );
});
