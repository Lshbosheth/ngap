// 抽屉元素
import React, { forwardRef, memo, useImperativeHandle, useState, useEffect } from 'react';
import { ComponentType, IDragTargetItem } from './../../types';
import { useDrop } from 'react-dnd';
import { Button, Drawer, DrawerProps } from 'antd';
import NgapRender from './../../NgapRender/NgapRender';
import { getComponent } from './../../index';
import * as icons from '@ant-design/icons';
import { handleActionFlow } from './../../utils/action';
import { useAppContext } from './../../../utils/AppProvider';
import { useShallow } from 'zustand/react/shallow';
import { crossApiUserInfo } from './../../../stores/crossapiStore';
import { apiListInfo } from './../../../stores/apiListStore';
const AntDrawer = forwardRef(
    (
        { id, type, config, elements, onClose, onAfterOpenChange, loopVariable }: ComponentType<DrawerProps & { bulkActionList: any[]; elementAlias?: string }> & { loopVariable?: any },
        ref: any,
    ) => {
        const [visible, setVisible] = useState(false);
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

        // 设置组件别名
        useEffect(() => {
            setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
        }, [config.props.elementAlias]);

        const userInfo = crossApiUserInfo((state: any) => state.userInfo);
        const apiList = apiListInfo((state: any) => state.apiList);

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

        useImperativeHandle(ref, () => {
            return {
                // 关闭弹框
                hide: () => {
                    setVisible(false);
                },
                // 打开弹框
                show: () => {
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
                showLoading: () => {
                    setLoading(true);
                },
                // 隐藏确认Loading
                hideLoading: () => {
                    setLoading(false);
                },
                setStyle:(style:any)=>{
                    setMStyle(style)
                }
            };
        });

        const handleOpenChange = (open: boolean) => {
            onAfterOpenChange?.(open);
        };

        const handleClose = () => {
            setVisible(false);
            onClose?.(); // 关闭时触发回调
            setTimeout(() => {
                setSelectedElement(undefined);
            }, 0);
        };

        const handleOperate = (eventName: string) => {
            const btnEvent = config.events.find((event) => event.eventName === eventName);
            handleActionFlow(btnEvent?.actions, {}, _state);
        };

        const bulkActionList = config.props.bulkActionList || [];
        const iconsList: { [key: string]: any } = icons;

        return (
            <>
                <Drawer
                    {...config.props}
                    data-id={id}
                    data-type={type}
                    open={visible}
                    footer={config.props.footer ? undefined : null}
                    getContainer={false}
                    afterOpenChange={(open) => handleOpenChange(open)}
                    onClose={handleClose}
                    style={{ ...config.style ,...mStyle}}
                    zIndex={998}
                    loading={loading}
                    destroyOnClose
                    extra={
                        <div style={{ display: 'flex', gap: 10 }}>
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
                        </div>
                    }
                >
                    <div ref={drop}>
                        {elements?.length ? (
                            <NgapRender elements={elements || []} loopVariable={loopVariable} />
                        ) : (
                            <div className="slots" style={{ lineHeight: '100px' }}>
                                拖拽元素到这里
                            </div>
                        )}
                    </div>
                </Drawer>
            </>
        );
    },
);

export default memo(AntDrawer);
