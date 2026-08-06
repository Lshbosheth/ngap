import React, {memo, forwardRef, useImperativeHandle, useState, useMemo, useCallback, useEffect } from 'react';
import { ComponentType } from '@materials/types';
import NgapRender from '@materials/NgapRender/NgapRender';
import _styles from './index.module.less';
import { usePopper } from 'react-popper';

export interface IConfig {
    visible: boolean;
    showCloseButton: boolean;
    placement?: string;
    size?: 'small' | 'medium' | 'large';
}
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

const MPopover = ({ id, type, config, elements, onLoad, loopVariable, }: ComponentType & { loopVariable?: any }, ref: any) => {
    const [visible, setVisible] = useState(config.props.visible || false);
    const [mStyle, setMStyle] = useState<any>({});
    const [triggerElementId, setTriggerElementId] = useState<string | null>(null);
    const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null);
    const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);
    const [arrowElement, setArrowElement] = useState<HTMLElement | null>(null);
    const showCloseButton = config?.props?.showCloseButton ?? false;
    const baseStyle = useMemo(() => {
        return { ...config.style, ...mStyle }
    }, [config.style, mStyle])
    const popoverWidth = baseStyle?.width ?? sizePresets[config?.props?.size]?.width ?? "280px";
    const popoverHeight = baseStyle?.height ?? sizePresets[config?.props?.size]?.height ?? "160px";

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
             setTriggerElement(null)
        }
    }, [triggerElementId, findTriggerElement]);

    useEffect(() => {
        if (visible) {
            onLoad?.();
            // 监听触发元素是否被移除 DOM或不可见
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
    }, [visible]);
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
    const { styles, attributes, update } = usePopper(triggerElement, popperElement, {
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
        if ((popoverWidth === 'auto' || popoverHeight === 'auto') && popperElement && update) {
            const observer = new ResizeObserver(() => {
                update?.();  // 尺寸变化时自动重新定位
            });
            observer.observe(popperElement);
            return () => observer.disconnect();
        }
    }, [popoverWidth, popoverHeight, update]);
    
    useImperativeHandle(ref, () => {
        return {
            show(targetElementId: string) {
                setTriggerElementId(targetElementId);
                setVisible(true);
            },
            hide() {
                setVisible(false);
                setTriggerElementId(null);
            },
            setStyle: (style: any) => {
                setMStyle(style);
            },
        };
    });
    
    const popoverBgColor = baseStyle?.backgroundColor || '#ccc';
    const placement = attributes.popper?.['data-popper-placement'] || 'rightTop';

    const getArrowPosition = (p: string): React.CSSProperties => {
        if (p.startsWith('bottom')) return { top: "-15px" };
        if (p.startsWith('top')) return { bottom: "-15px" };
        if (p.startsWith('right')) return { left: "-15px" };
        return { right: "-15px"};
    };

    const handleCloseClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setVisible(false);
    }, []);

    const handlePopoverMouseLeave = useCallback((e: React.MouseEvent) => {
        if (!showCloseButton) {
            setVisible(false);
        }
    }, [showCloseButton]);

    const elementArray = useMemo(() => {
        return elements || [];
    }, [elements]);



    return (
        visible && (
            <div
                ref={setPopperElement}
                className={_styles.popover}
                data-id={id}
                data-type={type}
                style={{
                    ...styles.popper,
                    width: popoverWidth,
                    height: popoverHeight,
                    ...baseStyle}}
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
                    <NgapRender elements={elementArray} loopVariable={loopVariable} />
                </div>

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

            </div>
        )
    );
};

export default memo(forwardRef(MPopover));
