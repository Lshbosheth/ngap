import React, { forwardRef, memo, useImperativeHandle, useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { usePopper } from 'react-popper';
import { ComponentType, IDragTargetItem } from './../../types';
import { useDrop } from 'react-dnd';
import NgapRender from './../../NgapRender/NgapRender';
import { getComponent } from './../../index';
import { useAppContext } from './../../../utils/AppProvider';
import { crossApiUserInfo } from './../../../stores/crossapiStore';
import { apiListInfo } from './../../../stores/apiListStore';
import _styles from './index.module.less';

const placementMap: Record<string, string> = {
    bottom: 'bottom',
    top: 'top',
    right: 'right',
    left: 'left',
    bottomRight: 'bottom-start',
    bottomLeft: 'bottom-end',
    topRight: 'top-start',
    topLeft: 'top-end',
    rightTop: 'right-end',
    rightBottom: 'right-start',
    leftTop: 'left-end',
    leftBottom: 'left-start',
};

const sizePresets: Record<string, { width: string; height: string }> = {
    large: { width: "360px", height: "200px" },
    medium: { width: "280px", height: "160px" },
    small: { width: "200px", height: "120px" },
};

const Popover = forwardRef(
    (
        { id, type, config, elements, onLoad, loopVariable }: ComponentType & { loopVariable?: any },
        ref: any,
    ) => {
        const [visible, setVisible] = useState(false);
        const [triggerElementId, setTriggerElementId] = useState<string | null>(null);
        const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null);
        const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);
        const [arrowElement, setArrowElement] = useState<HTMLElement | null>(null);
        const _state = useAppContext();
        const { pageStore, mode } = _state;
        const { addChildElements, setSelectedElement, setElementAlias, editElement, selectedElement} = pageStore((state: any) => ({
            addChildElements: state.addChildElements,
            setSelectedElement: state.setSelectedElement,
            setElementAlias: state.setElementAlias,
            editElement: state.editElement,
            selectedElement: state.selectedElement,
        }));
        useEffect(() => {
            if (visible) {
                onLoad?.();
                if (isEditWithoutTrigger ) {
                    const rect = document.querySelector('#page')?.getBoundingClientRect();
                    const mask: HTMLDivElement | null = document.querySelector(`[data-id="popover_mask${id}"]`);
                    if (mask) mask.style.height = rect?.height + 'px';
                }
                // 监听触发元素是否被移除 DOM
                if (triggerElementId) {
                    const observer = new MutationObserver(() => {
                        const el = document.querySelector<HTMLElement>(`[data-id="${triggerElementId}"]`);
                        // 元素不在 DOM 中，或元素不可见（display:none / visibility:hidden / offsetParent为null）
                        if (!el || !el.isConnected || (el as HTMLElement).offsetParent === null || window.getComputedStyle(el).visibility === 'hidden') {
                            setVisible(false);
                            observer.disconnect();
                        }
                    });
                    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
                    return () => observer.disconnect();
                }

            }
        }, [visible, triggerElementId, id, onLoad]);
        useEffect(() => {
                // 设置组件别名
                setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
            }, [config.props.elementAlias]);
        const [mStyle, setMStyle] = useState<any>({})
        const userInfo = crossApiUserInfo((state: any) => state.userInfo);
        const apiList = apiListInfo((state: any) => state.apiList);
        const isEditWithoutTrigger = mode === 'edit' && !triggerElementId;
        const baseStyle = useMemo(() => {
            return { ...config.style, ...mStyle }
        }, [config.style, mStyle]);
        const popoverWidth = baseStyle?.width ?? sizePresets[config?.props?.size]?.width ?? "280px";
        const popoverHeight = baseStyle?.height ?? sizePresets[config?.props?.size]?.height ?? "160px";
        const [, drop] = useDrop({
            accept: 'MENU_ITEM',
            async drop(item: IDragTargetItem, monitor) {
                if (monitor.didDrop()) return;
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
            collect: (monitor) => ({
                isOver: monitor.isOver(),
                canDrop: monitor.canDrop(),
            }),
        });

        const findTriggerElement = useCallback((elementId: string): HTMLElement | null => {
            try {
                const el = document.querySelector<HTMLElement>(`[data-id="${elementId}"]`);
                if (el) return el;
            } catch {
                console.log("error-findTriggerElement");
            }
            const all = document.querySelectorAll<HTMLElement>('[data-id]');
            for (const item of all) {
                if (item.getAttribute('data-id') === elementId) return item;
            }
            return null;
        }, []);

        useEffect(() => {
            if (triggerElementId) {
                setTriggerElement(findTriggerElement(triggerElementId));
            } else {
                setTriggerElement(null);
            }
        }, [triggerElementId, findTriggerElement]);

        // 添加容器边界检测函数 (兼容触发元素在滚动、弹窗等容器中)
        const detectContainerBoundary =  useCallback((element: HTMLElement | null, minWidth: string, minHeight: string): HTMLElement | null => {
            if (!element) return null;
            try {
                // 向上查找最近的滚动容器或弹窗容器
                // 处理 'auto' 情况：不传尺寸限制，直接查找容器
                const requiredWidth = minWidth === 'auto' ? 0 : parseFloat(minWidth);
                const requiredHeight = minHeight === 'auto' ? 0 : parseFloat(minHeight);
                // 如果都是 auto，则跳过尺寸检查，只找滚动/溢出容器
                const isAutoSize = minWidth === 'auto' && minHeight === 'auto';
                let parent = element.parentElement;
                while (parent && parent !== document.body) {
                    const style = window.getComputedStyle(parent);
                    
                    // 检查是否是特定的容器类型
                    if ((style.position === 'fixed' ||
                        style.position === 'absolute' ||
                        style.overflow === 'auto' ||
                        style.overflow === 'scroll' ||
                        parent.classList.contains('ant-modal-content') ||
                        parent.classList.contains('modal-content') ||
                        // parent.classList.contains('popover')) && parent?.getAttribute('data-type') !== 'BottomBanner') {
                        parent.classList.contains('popover'))) {
                        if (!isAutoSize) {
                            const parentWidth = parseFloat(style.width);
                            const parentHeight = parseFloat(style.height);
                            // 检查容器是否有足够空间展示 popover
                            if (parentWidth < requiredWidth || parentHeight < requiredHeight) {
                                parent = parent.parentElement;
                                continue;
                            }
                        }
                        return parent;
                    }
                    parent = parent.parentElement;
                }
            } catch (e) {
                //
            }
            return null;
        }, []);

        // 添加边界和定位策略的状态
        const [containerBoundary, setContainerBoundary] = useState<HTMLElement | null>(null);
        const [popperStrategy, setPopperStrategy] = useState<'fixed' | 'absolute'>('fixed');
        // // 检测容器并调整策略
        useEffect(() => {
            if (triggerElement) {
                const boundary = detectContainerBoundary(triggerElement, popoverWidth, popoverHeight);
                setContainerBoundary(boundary);
                if (boundary) {
                    const style = window.getComputedStyle(boundary);
                    if (style.position === 'fixed' || style.position === 'absolute') {
                        setPopperStrategy('absolute');
                    } else {
                        setPopperStrategy('fixed');
                    }
                } else {
                    setPopperStrategy('fixed');
                }
            } else {
                setContainerBoundary(null);
                setPopperStrategy('fixed');
            }
        }, [triggerElement, detectContainerBoundary]);
        const { styles, attributes, update  } = usePopper(triggerElement, popperElement, {
            strategy: popperStrategy,
            placement: (placementMap[config?.props?.placement] || 'right-end') as any,
            modifiers: [
                { name: 'offset', options: { offset: [0, 10] } },
                { name: 'shift', enabled: true },
                { name: 'size', enabled: true, options: { padding: 8 } },
                { name: 'arrow', options: { element: arrowElement } },
                {
                    name: 'preventOverflow',
                    options: {
                        boundary: containerBoundary as any, // 使用容器边界或 null
                        padding: 8,
                        altBoundary: !containerBoundary, // 如果没有特定容器，使用 altBoundary
                        tether: true,
                        mainAxis: true,
                        altAxis: true,
                    },
                },
                {
                    name: 'flip',
                    enabled: true,
                    options: {
                    // 按照需求优先级依次排列备选方位
                    boundary: containerBoundary as any, // 使用容器边界或 null
                    padding: 8,
                    altBoundary: !containerBoundary, // 如果没有特定容器，使用 altBoundary
                    fallbackPlacements: [
                        'left-end',    // 1. 备选1：左上
                        'right-start',   // 2. 备选2：右下
                        'left-start', // 3. 备选3：左下
                        'top',          // 4. 备选4：正上方
                        'bottom',       // 5. 备选5：正下方
                        'right',        // 6. 备选6：正右方
                        'left'          // 7. 备选7：正左方
                    ],
                    },
                },
            ],
        });
        // ResizeObserver 监听 popper 实际尺寸变化，自动触发重定位
        useEffect(() => {
            if (mode === 'edit') return;
            if ((popoverWidth === 'auto' || popoverHeight === 'auto') && popperElement && update) {
                const observer = new ResizeObserver(() => {
                    update?.();  // 尺寸变化时自动重新定位
                });
                observer.observe(popperElement);
                return () => observer.disconnect();
            }
        }, [mode, popoverWidth, popoverHeight, update]);

        useImperativeHandle(
            ref,
            () => {
                return {
                    show: (targetElementId: string) => {
                        setTriggerElementId(targetElementId);
                        setVisible(true);
                    },
                    hide: () => {
                        setSelectedElement(undefined);
                        setVisible(false);
                        setTriggerElementId(null);
                    },
                    setStyle: (style: any) => {
                        setMStyle(style)
                    }
                };
            },
            [config],
        );

        
        const popoverBgColor = baseStyle?.backgroundColor || '#ccc';
        const placement = attributes.popper?.['data-popper-placement'] || 'rightTop';
        const prevSizeRef = useRef(config?.props?.size);
        const getArrowPosition = (p: string): React.CSSProperties => {
            if (p.startsWith('bottom')) return { top: "-15px" };
            if (p.startsWith('top')) return { bottom: "-15px" };
            if (p.startsWith('right')) return { left: "-15px" };
            return { right: "-15px"};
        };
        
        useEffect(() => {
            // 编辑态自定义样式配置保存更新
            if (isEditWithoutTrigger && selectedElement?.id === id) {
                const currentSize = config?.props?.size;
                // 从 Store 中获取最新样式数据
                const currentStyle = pageStore.getState()?.page?.pageData?.elementsMap?.[id]?.config?.style || {};
                // 判断是否需要写入：size 变化 或 style 中无宽高值（初始创建）
                const needsWrite = prevSizeRef.current !== currentSize || (!currentStyle.width && !currentStyle.height);
                // 只有当 size 真正发生变化时才执行更新
                if (needsWrite) {
                    const propsWidth = sizePresets[currentSize]?.width ?? "280px";
                    const propsHeight = sizePresets[currentSize]?.height ?? "160px";
                    editElement({
                        id: selectedElement?.id || id,
                        type: 'style',
                        style: {
                            ...currentStyle,
                            width: propsWidth,
                            height: propsHeight,
                        },
                    });
                    // 更新 ref 为当前的 size 值
                    prevSizeRef.current = currentSize;
                }
            }
    }, [config?.props?.size, id, editElement, pageStore, isEditWithoutTrigger, selectedElement]);

        const showCloseButton = config?.props?.showCloseButton ?? false;

        const handleCloseClick = useCallback((e: React.MouseEvent) => {
            e.stopPropagation();
            setVisible(false);
        }, []);

        const handlePopoverMouseLeave = useCallback((e: React.MouseEvent) => {
            if (isEditWithoutTrigger) return;  // 编辑态无触发元素时不关闭
            if (!showCloseButton) {
                setVisible(false);
            }
        }, [showCloseButton, isEditWithoutTrigger]);
        // 蒙版操作
        const handleMaskClick = useCallback((e: React.MouseEvent) => {
            const popover = document.querySelector(`[data-id="${id}"]`);
            if (popover && popover.contains(e.target as Node)) {
                return; // 点击的是 Popover 内容，不关闭
            }
            const configPanel = document.querySelector('.openContent');
            if (configPanel && configPanel.contains(e.target as Node)) {
                return;
            }
            e.stopPropagation();
            setVisible(false); // 点击蒙版空白区域，关闭
            setSelectedElement(undefined);
        }, [id, setSelectedElement]);
        return (
            <>
                {isEditWithoutTrigger && visible && (
                    <div data-id={"popover_mask"+ id}
                        className="ant-modal-mask  popover-editor-mask"
                        onClick={handleMaskClick}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            zIndex: 998,
                        }}
                    />
                )}
                {visible && (
                    <div
                        ref={setPopperElement}
                        data-id={id}
                        data-type={type}
                        className={_styles.popover}
                        style={{
                             ...(isEditWithoutTrigger ? {
                                left: '50%',
                                top: '50%',
                                transform: 'translate(-50%, -50%)',
                             } : styles.popper),
                            width: popoverWidth,
                            height: popoverHeight,
                            ...baseStyle
                        }}
                        {...attributes.popper}
                        onMouseLeave={handlePopoverMouseLeave}
                    >
                        {showCloseButton && (
                            <div
                                onClick={handleCloseClick} className={_styles.closeBtn}
                            >
                                ×
                            </div>
                        )}
                        <div className={_styles.content}>
                            <div ref={drop} className={_styles.slotsBox} >
                                {elements.length ? (
                                    <NgapRender elements={elements} loopVariable={loopVariable} />
                                ) : (
                                    <div className={`${_styles.slotsContent} slots`}>
                                        拖拽元素到这里
                                    </div>
                                )}
                            </div>
                        </div>
                        {triggerElementId && (
                        <div
                            ref={setArrowElement}
                            className={_styles.arrow}
                            data-placement={placement}
                            style={{
                                ...styles.arrow,
                                ...getArrowPosition(placement),
                               '--arrow-bg-color': popoverBgColor === ("#fff") ? "#ccc" : popoverBgColor,  // 设置 CSS 变量
                            } as React.CSSProperties}
                        />
                        )}
                    </div>
                )}
            </>
        );
    },
);

export default memo(Popover);
