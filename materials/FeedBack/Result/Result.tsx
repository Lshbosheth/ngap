import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { Button, ButtonProps, Result } from 'antd';
import * as icons from '@ant-design/icons';
import { ComponentType } from '@materials/types';
import { handleActionFlow } from '@materials/utils/action';
import { omit } from 'lodash-es';

/*泛型只需要定义组件本身用到的属性*/
export interface IConfig {
    /** 操作区 */
    extra: React.ReactNode;
    /** 图标 */
    icon: React.ReactNode;
    /** 结果的状态，决定图标和颜色 */
    status: 'success' | 'error' | 'info' | 'warning' | 404 | 403 | 500;
    /** subTitle 文字 */
    subTitle: any;
    authMoInfo: any;
    /** title 文字 */
    title: any;
    bulkActionList: Array<ButtonProps & { eventName: string; icon: string; text: string, authCode: string; }>;
}
/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const MResult = ({id, type, config }: ComponentType<IConfig>, ref: any) => {
    const [visible, setVisible] = useState(true);
    const [mStyle,setMStyle] = useState<any>({})

    // 标题
    const [subTitle, setSubTitle] = useState<string>('');
    // 子标题
    const [resultTitle, setRsultTitle] = useState<string>('');
    const authMoInfos = config.props?.authMoInfo || {}
    // 对外暴露方法
    useImperativeHandle(ref, () => {
        return {
            show() {
                setVisible(true);
            },
            hide() {
                setVisible(false);
            },
            setStyle:(style:any)=>{
                setMStyle(style)
            }
        };
    });

    const iconsList: { [key: string]: any } = icons;
    const bulkActionList = config.props.bulkActionList || [];

    const handleOperate = (eventName: string) => {
        const btnEvent = config.events.find((event) => event.eventName === eventName);
        handleActionFlow(btnEvent?.actions, {});
    };


    // 初始化子标题
    useEffect(() => {
        const titleVal = typeof config.props.subTitle === 'string' ? config.props.subTitle : config.props.subTitle?.value;
        setSubTitle(titleVal);
    }, [config.props.subTitle]);
    // 初始化标题
    useEffect(() => {
        const titleVal = typeof config.props.title === 'string' ? config.props.title : config.props.title?.value;
        setRsultTitle(titleVal);
    }, [config.props.title]);


    return (
        visible && (
            <Result
                data-id={id}
                data-type={type}
                style={{...config.style,...mStyle}}
                {...omit(config.props, ['subTitle', 'title'])}
                title={resultTitle}
                subTitle={subTitle}
                icon={config.props.icon ? React.createElement(iconsList[config.props.icon as string]) : undefined}
                extra={
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
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
            ></Result>
        )
    );
};
export default forwardRef(MResult);
