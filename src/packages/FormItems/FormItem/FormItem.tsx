import { Form, InputProps, FormItemProps } from 'antd';
import { useDrop } from 'react-dnd';
import { getComponent } from './../../index';
import { forwardRef, useEffect, useImperativeHandle, useState, memo } from 'react';
import { ComponentType, IDragTargetItem } from './../../types';
import { useFormContext } from './../../utils/context';

import NgapRender from './../../NgapRender/NgapRender';
import { useAppContext } from './../../../utils/AppProvider';
import { crossApiUserInfo } from './../../../stores/crossapiStore';
import { apiListInfo } from './../../../stores/apiListStore';
/* 泛型只需要定义组件本身用到的属性，当然也可以不定义，默认为any */
export interface IConfig {
    elementAlias?: string;
    defaultValue: any;
    formItem: FormItemProps;
    formWrap: InputProps;
}
/**
 *
 * @param config 组件配置属性值
 * @param props 系统属性值：componentid、componentname等
 * @returns 返回组件
 */
const MFormItem = ({ id, type, config, elements, loopVariable }: ComponentType<IConfig> & { loopVariable?: any }, ref: any) => {
    const { pageStore } = useAppContext();
    const addChildElements = pageStore((state: any) => state.addChildElements);
    const setElementAlias = pageStore((state: any) => state.setElementAlias);

    const { initValues } = useFormContext();
    const [visible, setVisible] = useState(true);
    // 初始化默认值
    useEffect(() => {
        const name: string = config.props.formItem?.name;
        if (config.props.defaultValue?.value !== undefined) return;
        const value = config.props.defaultValue;
        initValues(type, name, value);
    }, [config.props.defaultValue]);
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const apiList = apiListInfo((state: any) => state.apiList);
    const _state = useAppContext();
    const [mStyle,setMStyle] = useState<any>({})

    // 设置组件别名
    useEffect(() => {
        setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
    }, [config.props.elementAlias]);

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
    const ItemProps = config.props.formItem;
    return (
        visible && (
            <Form.Item {...ItemProps} name={ItemProps.name || undefined} data-id={id} data-type={type}>
                <span ref={drop} style={config.style}>
                    {elements?.length ? (
                        <NgapRender elements={elements || []} loopVariable={loopVariable} />
                    ) : (
                        <div className="slots" style={{ height: 80, lineHeight: '80px',...mStyle }}>
                            拖拽元素到这里
                        </div>
                    )}
                </span>
            </Form.Item>
        )
    );
};

export default memo(forwardRef(MFormItem));
