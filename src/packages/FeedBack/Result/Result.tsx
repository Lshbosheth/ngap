// 结果页元素
import React, { forwardRef, useImperativeHandle, useState, useEffect, memo } from 'react';
import { Button, ButtonProps, Result } from 'antd';
import * as icons from '@ant-design/icons';
import { ComponentType } from './../../types';
import { handleActionFlow } from './../../utils/action';
import { useAppContext } from './../../../utils/AppProvider';
import { omit } from 'lodash-es';

/*泛型只需要定义组件本身用到的属性*/
export interface IConfig {
    elementAlias?: string;
    /** 操作区 */
    extra: React.ReactNode;
    /** 图标 */
    icon: React.ReactNode;
    /** 结果的状态，决定图标和颜色 */
    status: 'success' | 'error' | 'info' | 'warning' | 404 | 403 | 500;
    /** subTitle 文字 */
    subTitle: any;
    /** title 文字 */
    title: any;
    bulkActionList: Array<ButtonProps & { eventName: string; icon: string; text: string }>;
}
/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const MResult = ({ id, type, config }: ComponentType<IConfig>, ref: any) => {
    const [visible, setVisible] = useState(true);
    const _state = useAppContext();
    const { pageStore } = _state;
    const setElementAlias = pageStore((state: any) => state.setElementAlias);
    // 标题
    const [subTitle, setSubTitle] = useState<string>('');
    // 子标题
    const [resultTitle, setRsultTitle] = useState<string>('');
    const [mStyle,setMStyle] = useState<any>({})

    useEffect(() => {
        // 设置组件别名
        setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
    }, [config.props.elementAlias]);
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
            <div data-id={id} data-type={type}>
                <Result
                    style={{...config.style,...mStyle}}
                    {...omit(config.props, ['subTitle', 'title'])}
                    status={config.props.status}
                    title={resultTitle}
                    subTitle={subTitle}
                    icon={config.props.icon ? React.createElement(iconsList[config.props.icon as string]) : undefined}
                    extra={
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
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
                ></Result>
            </div>
        )
    );
};
export default memo(forwardRef(MResult));
