import React, { forwardRef, memo, useImperativeHandle, useState } from 'react';
import { ComponentType } from '@materials/types';
import { Drawer, Spin, Button } from 'antd';
import NgapRender from '@materials/NgapRender/NgapRender';
import * as icons from '@ant-design/icons';
import { handleActionFlow } from '@materials/utils/action';

const AntDrawer = forwardRef(({id, type, config, elements, onClose, onAfterOpenChange, loopVariable }: ComponentType & { loopVariable?: any }, ref: any) => {
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mStyle,setMStyle] = useState<any>({})

    const authMoInfos = config.props?.authMoInfo || {}
    useImperativeHandle(ref, () => {
        return {
            // 关闭弹框
            hide: () => {
                setVisible(() => false);
            },
            // 打开弹框
            show: () => {
                return new Promise((resolve) => {
                    setVisible(() => {
                        resolve(true);
                        return true;
                    });
                });
            },
            // 关闭弹框
            close: () => {
                setVisible(false);
            },
            // 打开弹框
            open: () => {
                return new Promise((resolve) => {
                    setVisible(() => {
                        resolve(true);
                        return true;
                    });
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
    };

    const handleOperate = (eventName: string) => {
        const btnEvent = config.events.find((event) => event.eventName === eventName);
        handleActionFlow(btnEvent?.actions, {});
    };

    const bulkActionList = config.props.bulkActionList || [];
    const iconsList: { [key: string]: any } = icons;

    return (
        <>
            <Drawer
                data-id={id}
                data-type={type}
                {...config.props}
                open={visible}
                afterOpenChange={(open) => handleOpenChange(open)}
                onClose={handleClose}
                footer={config.props.footer ? undefined : null}
                style={{ ...config.style ,...mStyle}}
                destroyOnClose
                extra={
                    <div style={{ display: 'flex', gap: 10 }}>
                        {bulkActionList.map((item: any, index: number) => {
                            let flage = true;
                            if(item.authCode){
                                flage = authMoInfos[item.authCode] === '1';
                            }
                            if (!flage) return [];//没有权限
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
                <Spin spinning={loading}>
                    <NgapRender elements={elements || []} loopVariable={loopVariable} />
                </Spin>
            </Drawer>
        </>
    );
});

export default memo(AntDrawer);
