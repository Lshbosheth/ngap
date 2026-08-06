import { ComponentType, IDragTargetItem } from './../../types';
import React, { forwardRef, useImperativeHandle, useState, useEffect, useRef, memo, CSSProperties, ForwardedRef } from 'react';
import { useAppContext } from './../../../utils/AppProvider';
import robot1Png from './robot1.png';
import robot3Png from './robot3.png';
import { Popconfirm } from 'antd';
import { MenuUnfoldOutlined, RedoOutlined } from '@ant-design/icons';
import styles from './index.module.less';
import NgapRender from './../../NgapRender/NgapRender';
import { useDrop } from 'react-dnd';
import { getComponent } from './../../index';
import { crossApiUserInfo } from './../../../stores/crossapiStore';
import { apiListInfo } from './../../../stores/apiListStore';

interface RefConfig {
    show: () => void;
    hide: () => void;
    open: () => void;
    close: () => void;
    setStyle: (style: CSSProperties) => void;
}

/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const MFloatingWindow = ({ id, type, config, elements, onChangePopup }: ComponentType, ref: ForwardedRef<RefConfig>) => {
    const [visible, setVisible] = useState(true);
    const [popVis, setPopVis] = useState(config?.props?.defaultOpen === '1');
    const [mStyle, setMStyle] = useState<CSSProperties>({});

    const isDragging = useRef(false);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const hasMoved = useRef(false);
    const offset = useRef({ x: 0, y: 0 });
    const dragRef = useRef<HTMLDivElement>(null);

    const _state = useAppContext();
    const { mode, pageStore } = _state;
    const addChildElements = pageStore((state: any) => state.addChildElements);
    const variableData = pageStore((state: any) => state.page.pageData.variableData);
    const variables = pageStore((state: any) => state.page.pageData.variables);
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const apiList = apiListInfo((state: any) => state.apiList);
    const setElementAlias = pageStore((state: any) => state.setElementAlias);
    const [divStyle, setDivStyle] = useState<CSSProperties>({
        position: 'fixed',
        cursor: 'move',
        zIndex: 999,
        left: `${config.props.left}px`,
        right: `${config.props.right}px`,
        top: `${config.props.top}px`,
        bottom: `${config.props.bottom}px`,
    });
    useEffect(() => {
        setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
    }, [config.props.elementAlias]);
    useEffect(() => {
        if (popVis && config?.props?.autoFoldupFlag) {
            const intervalId = setInterval(() => {
                setPopVis(false);
            }, config.props.defaultTime * 1000);
            // 组件卸载时清除定时器
            return () => clearInterval(intervalId);
        }
    }, [popVis, config?.props?.autoFoldupFlag]);
    const getContainer = () => {
        const container = document.getElementById('page');
        if (!container) {
            console.warn('未找到 id 为 page 的父容器');
            return null;
        }
        return container as HTMLDivElement;
    };

    useImperativeHandle(ref, () => {
        return {
            show() {
                setVisible(true);
            },
            hide() {
                setVisible(false);
            },
            open() {
                setPopVis(true);
            },
            close() {
                setPopVis(false);
            },
            setStyle: (style: CSSProperties) => {
                setMStyle(style);
            },
        };
    });

    const { ...props } = config.props;

    // 定时开关 autoFoldupFlag
    // 默认时间 defaultTime

    const refreshData = () => {
        console.log('刷线数据==>');
    };

    const showPop = (e: { preventDefault: () => void; stopPropagation: () => void }) => {
        if (hasMoved.current) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        setPopVis(!popVis);
        if (mode === 'preview') {
            onChangePopup?.(!popVis);
        }
    };

    const closePop = () => {
        setPopVis(false);
        if (mode === 'preview') {
            onChangePopup?.(false);
        }
    };

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

    const popTitleHtml = (
        <div className="windowBox" style={{ ...config.style, ...mStyle }}>
            <div className="title-header">
                <div>{props.titleName}</div>
                <div className="header-action">
                    {props.refreshFlag ? <RedoOutlined style={{ fontSize: 'inherit', marginRight: '10px' }} onClick={refreshData} /> : null}
                    <MenuUnfoldOutlined style={{ fontSize: 'inherit' }} onClick={closePop} />
                </div>
            </div>
            <div ref={drop}>
                {elements?.length ? (
                    <NgapRender elements={elements} />
                ) : (
                    <div className="slots" style={{ height: 100, lineHeight: '100px' }}>
                        拖拽元素到这里
                    </div>
                )}
            </div>
        </div>
    );

    // 背景色
    const overlayClassNameStr = props.bgcolorstyle === '1' ? 'bg1' : props.bgcolorstyle === '2' ? 'bg2' : 'bg0';

    // 开始拖拽
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        const container = getContainer();
        if (!dragRef.current || !container) return;

        isDragging.current = true;
        hasMoved.current = false;
        dragStartPos.current = {
            x: e.clientX,
            y: e.clientY,
        };
        // 计算鼠标相对于拖拽元素左上角的偏移
        const dragRect = dragRef.current?.getBoundingClientRect();
        offset.current = {
            x: e.clientX - dragRect.left,
            y: e.clientY - dragRect.top,
        };

        e.preventDefault();
        e.stopPropagation();
    };

    // 更新位置
    const handleMouseMove = (e: MouseEvent) => {
        const container = getContainer();
        if (!isDragging.current || !dragRef.current || !container) return;
        const dx = Math.abs(e.clientX - dragStartPos.current.x);
        const dy = Math.abs(e.clientY - dragStartPos.current.y);
        if (dx > 3 || dy > 3) {
            // 阈值设为3px，避免误判
            hasMoved.current = true;
        }

        // 获取父容器和拖拽元素的位置/尺寸
        const containerRect = container.getBoundingClientRect();
        const dragRect = dragRef.current?.getBoundingClientRect();

        let newX = e.clientX - containerRect.left - offset.current.x;
        let newY = e.clientY - containerRect.top - offset.current.y;

        const maxX = containerRect.width - dragRect.width;
        const maxY = containerRect.height - dragRect.height;
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        setDivStyle({ position: 'fixed', cursor: 'move', zIndex: 999, left: `${newX}px`, top: `${newY}px` });
        setPopVis(false);
    };

    // 结束拖拽
    const handleMouseUp = () => {
        isDragging.current = false;
    };

    // 绑定/解绑全局鼠标事件
    useEffect(() => {
        if (visible) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [visible]);

    return (
        visible && (
            <div data-id={id} data-type={type} ref={dragRef} onMouseDown={handleMouseDown} style={{ ...divStyle }}>
                <div>
                    <Popconfirm
                        arrow={false}
                        open={popVis}
                        placement="leftTop"
                        title={popTitleHtml}
                        okText=""
                        cancelText=""
                        overlayClassName={`${styles.robotPop} ${styles[overlayClassNameStr]}`}
                        trigger="click"
                        getPopupContainer={(triggerNode) => {
                            return document.getElementById('page') || document.body;
                        }}
                    >
                        <div className={styles.robot} onClick={showPop}>
                            <img className="robotOpen" src={popVis ? robot3Png : robot1Png} alt="" />
                        </div>
                    </Popconfirm>
                </div>
            </div>
        )
    );
};

export default memo(forwardRef(MFloatingWindow));
