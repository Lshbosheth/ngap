// 弹窗元素
import { ComponentType, IDragTargetItem } from './../../types';
import { Modal, Spin, Button } from 'antd';
import React, { forwardRef, memo, useEffect, useImperativeHandle, useState, useMemo, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { getComponent } from './../../index';
import NgapRender from './../../NgapRender/NgapRender';
import * as icons from '@ant-design/icons';
import { handleActionFlow } from './../../utils/action';
import { useAppContext } from './../../../utils/AppProvider';
import { useShallow } from 'zustand/react/shallow';
import { crossApiUserInfo } from './../../../stores/crossapiStore';
import { apiListInfo } from './../../../stores/apiListStore';
/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const AntdModal = forwardRef(({ id, type, config, elements, onLoad, onOk, onCancel, loopVariable }: ComponentType & { loopVariable?: any }, ref: any) => {
    const [visible, setVisible] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(config.props.confirmLoading || false);
    const [loading, setLoading] = useState(false);
    const _state = useAppContext();
    const { pageStore } = _state;
    const { addChildElements, setSelectedElement, setElementAlias } = pageStore(
        useShallow((state: any) => ({
            addChildElements: state.addChildElements,
            setSelectedElement: state.setSelectedElement,
            setElementAlias: state.setElementAlias,
        }))
    );
    const [mStyle,setMStyle] = useState<any>({})
    // 获取页面/画布可用尺寸 ───
    const getPageDimensions = useCallback(() => {
        const pageEl = document.querySelector('#page');
        if (pageEl) {
            const rect = pageEl.getBoundingClientRect();
            return {
                width: rect.width,
                height: rect.height,
            };
        }
        return {
            width: window.innerWidth,
            height: window.innerHeight,
        };
    }, []);
    // 设置组件别名
    useEffect(() => {
        setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
    }, [config.props.elementAlias]);

    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const apiList = apiListInfo((state: any) => state.apiList);
    // 拖拽接收
    const [, drop] = useDrop({
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

    // 对外暴露方法
    useImperativeHandle(
        ref,
        () => {
            return {
                // 关闭弹框
                close: () => {
                    setVisible(false);
                },
                // 打开弹框
                open: () => {
                    return new Promise((resolve) => {
                        setVisible(true);
                        setTimeout(() => {
                            resolve(true);
                            setSelectedElement({
                                id,
                                type,
                            });
                        }, 0);
                    });
                },
                // 显示确认Loading
                showConfirmLoading: () => {
                    setConfirmLoading(true);
                },
                // 隐藏确认Loading
                hideConfirmLoading: () => {
                    setConfirmLoading(false);
                },
                // 显示确认Loading
                showLoading: () => {
                    setLoading(true);
                },
                // 隐藏确认Loading
                hideLoading: () => {
                    setLoading(false);
                },
                setStyle: (style: any) => {
                    setMStyle(style)
                }
            };
        },
        [],
    );

    useEffect(() => {
        if (visible) onLoad?.();
        const rect = document.querySelector('#page')?.getBoundingClientRect();
        const modal: HTMLDivElement | null = document.querySelector(`[data-id="${id}"]`);
        if (modal) modal.style.height = rect?.height + 'px';
    }, [visible]);

    const handleOk = () => {
        // 提交事件
        onOk?.();
    };

    const handleCancel = () => {
        onCancel?.();
        // 取消事件
        setVisible(false);
        setTimeout(() => {
            setSelectedElement(undefined);
        }, 0);
    };
    /**
     * 开发模式下处理弹框根样式
     * 弹框关闭后，需要隐藏根节点，否则页面元素无法选择
     */
    const modal: HTMLDivElement | null = document.querySelector(`[data-id="${id}"]`);
    if (visible && modal) {
        modal.style.display = '';
    } else if (modal) {
        modal.style.display = 'none';
    }

    const handleOperate = (eventName: string) => {
        const btnEvent = config.events.find((event) => event.eventName === eventName);
        handleActionFlow(btnEvent?.actions, {}, _state);
    };

    const bulkActionList = config.props.bulkActionList || [];
    const iconsList: { [key: string]: any } = icons;
    const title = typeof config.props.title === 'string' ? config.props.title : config.props.title?.value;
    const renderTitle = () => {
        if (typeof title === 'string' && /<[^>]+>/.test(title)) {
            return <div dangerouslySetInnerHTML={{ __html: title }} />;
        }
        return title;
    };
    // 计算弹窗自适应尺寸 ───
    const modalDimensions = useMemo(() => {
        const pageDim = getPageDimensions();
        const widthVal = config.props.width;
        // 宽度计算
        let finalWidth: number | undefined | string;
        let widthAuto = false;
        let maxWidth: number | undefined = undefined;

        if (widthVal === 'auto') {
            widthAuto = true;
            finalWidth = 'fit-content'
            maxWidth = pageDim.width - 40
        } else {
            finalWidth = widthVal;
            maxWidth = undefined;
        }
        // 高度计算
        const finalMaxHeight = pageDim.height - 190;
        return {
            width: finalWidth,
            widthAuto,
            maxWidth,
            maxHeight: finalMaxHeight,
        };
    }, [config.props.width, config.props.height, getPageDimensions]);
    
    const footer = useMemo(() => {
        if (config.props.footer === false) return null;
        if (bulkActionList.length > 0) {
            return (
                <>
                    {bulkActionList.map((item: any, index: number) => {
                        return (
                            <Button
                                key={item.eventName}
                                type={item.type}
                                danger={item.danger}
                                icon={item.icon ? React.createElement(iconsList[item.icon]) : null}
                                onClick={() => handleOperate(item.eventName)}
                            >
                                {item.text}
                            </Button>
                        );
                    })}
                </>
            );
        }
        return undefined;
    }, [bulkActionList, config.props.footer])

    return (
        <>
            <div className="mAntdModal">
                <Modal
                    {...config.props}
                    title={renderTitle()}
                    data-id={id}
                    data-type={type}
                    open={visible}
                    getContainer={false}
                    onOk={handleOk}
                    maskClosable={false}
                    onCancel={handleCancel}
                    width={modalDimensions.width}
                    confirmLoading={confirmLoading}
                    destroyOnClose
                    footer={footer}
                    style={{
                        ...config.style,
                        ...mStyle,
                        ...(modalDimensions.widthAuto ? {
                            maxWidth: modalDimensions.maxWidth,
                        } : {}),
                    }}
                    styles={{
                        wrapper: {
                            paddingBottom: 0, // 将默认的底部间距（通常是 24px）改为 0
                        },
                        body: {
                            maxHeight: modalDimensions.maxHeight, // 减去 header 和 footer 的高度
                            overflowY: 'auto',
                            overflowX: 'auto',
                            overscrollBehavior: 'contain',
                        },
                    }}
                >
                    <div ref={drop}>
                        <Spin spinning={loading}>
                            {elements.length ? (
                                <NgapRender elements={elements} loopVariable={loopVariable} />
                            ) : (
                                <div className="slots" style={{ lineHeight: '150px' }}>
                                    拖拽元素到这里
                                </div>
                            )}
                        </Spin>
                    </div>
                </Modal>
            </div>
        </>
    );
});
export default memo(AntdModal);
