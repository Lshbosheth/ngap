import { ComponentType } from '@materials/types';
import React, { forwardRef, useImperativeHandle, useState, useEffect, useRef, memo, CSSProperties, ForwardedRef } from 'react';
import robot1Png from './robot1.png';
import robot3Png from './robot3.png';
import { Popconfirm } from 'antd';
import { MenuUnfoldOutlined, RedoOutlined } from '@ant-design/icons';
import styles from './index.module.less';
import NgapRender from '@materials/NgapRender/NgapRender';

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
    const [mStyle, setMStyle] = useState<CSSProperties>({});
    const [popVis, setPopVis] = useState(config?.props?.defaultOpen === '1');
    const isDragging = useRef(false);
    const offset = useRef({ x: 0, y: 0 });
    const dragRef = useRef<HTMLDivElement>(null);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const hasMoved = useRef(false);
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
        if (popVis && config?.props?.autoFoldupFlag) {
            const intervalId = setInterval(() => {
                setPopVis(false);
            }, config.props.defaultTime * 1000);
            // 组件卸载时清除定时器
            return () => clearInterval(intervalId);
        }
    }, [popVis, config?.props?.autoFoldupFlag]);

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
        onChangePopup?.(!popVis);
    };

    const closePop = () => {
        setPopVis(false);
        onChangePopup?.(false);
    };

    const popTitleHtml = (
        <div className="windowBox" data-id={id} data-type={type} style={config.style}>
            <div className="title-header">
                <div>{props.titleName}</div>
                <div className="header-action">
                    {props.refreshFlag ? <RedoOutlined style={{ fontSize: 'inherit', marginRight: '10px' }} onClick={refreshData} /> : null}
                    <MenuUnfoldOutlined style={{ fontSize: 'inherit' }} onClick={closePop} />
                </div>
            </div>
            <div>{elements?.length > 0 && <NgapRender elements={elements} />}</div>
        </div>
    );

    // 背景色
    const overlayClassNameStr = props.bgcolorstyle === '1' ? 'bg1' : props.bgcolorstyle === '2' ? 'bg2' : 'bg0';

    // 开始拖拽
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!dragRef.current) return;

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
        if (!isDragging.current || !dragRef.current) return;

        const dx = Math.abs(e.clientX - dragStartPos.current.x);
        const dy = Math.abs(e.clientY - dragStartPos.current.y);
        if (dx > 3 || dy > 3) {
            // 阈值设为3px，避免误判
            hasMoved.current = true;
        }

        // 获取拖拽元素的尺寸
        const dragRect = dragRef.current?.getBoundingClientRect();
        // 计算新位置（基于window）
        let newX = e.clientX - offset.current.x;
        let newY = e.clientY - offset.current.y;

        // 边框检测：基于window窗口（核心改动）
        // 水平边界：0 到 窗口宽度 - 元素宽度
        const maxX = window.innerWidth - dragRect.width;
        const maxY = window.innerHeight - dragRect.height;
        // 限制x/y在0到max之间（不超出window边界）
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        // setPosition({ x: newX, y: newY });
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
            <div ref={dragRef} onMouseDown={handleMouseDown} style={{ ...divStyle, ...mStyle }}>
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
