import { ComponentType, IDragTargetItem } from './../../types';
import { useDrop } from 'react-dnd';
import { getComponent } from './../../index';
import NgapRender, { Material } from './../../NgapRender/NgapRender';
import { forwardRef, useEffect, useImperativeHandle, useState, useRef } from 'react';
import { Badge, Button } from 'antd';
import { PlusOutlined, AlignLeftOutlined } from '@ant-design/icons';
import { useAppContext } from './../../../utils/AppProvider';
import styles from './index.module.less';
import { crossApiUserInfo } from './../../../stores/crossapiStore';
import { apiListInfo } from './../../../stores/apiListStore';
/*泛型只需要定义组件本身用到的属性*/
export interface IConfig {
    text: string;
}
/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const CollapseBtn = ({ id, type, config, elements, onClick }: ComponentType, ref: any) => {
    const { pageStore } = useAppContext();
    const addChildElements = pageStore((state: any) => state.addChildElements);
    const [visible, setVisible] = useState(true);

    const [isShow, setIsShow] = useState(true);
    const _state = useAppContext();
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const apiList = apiListInfo((state: any) => state.apiList);
    const [mStyle,setMStyle] = useState<any>({})

    const setElementAlias = pageStore((state: any) => state.setElementAlias);
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

    const handleClick = () => {
        // if (mode === 'preview') {
        //
        // }
        setIsShow(!isShow);
        onClick?.();
    };
    useEffect(() => {
        setIsShow(config.props.defaultState);
    }, [config.props.defaultState]);
    return (
        visible && (
            <div
                style={{
                    ...config.style,
                    position: config.props.defaultState ? 'relative' : 'static',
                    ...mStyle
                    // display: 'inline-flex',
                }}
                {...config.props}
                data-id={id}
                data-type={type}
                ref={drop}
            >
                <Button
                    style={{
                        position: config.props.defaultState ? 'absolute' : 'static',
                        top: 0,
                        right: config.props.defaultState &&isShow? '0' : '-50px',
                        zIndex: 999,
                    }}
                    type={
                        config.props.btnType == 1 ? 'primary' : config.props.btnType == 2 ? 'default' : config.props.btnType == 3 ? 'text' : 'primary'
                    }
                    icon={<AlignLeftOutlined />}
                    onClick={handleClick}
                >
                    {config.props.showText ? (config.props.defaultState &&isShow? '收起' : '展开') : null}
                </Button>
                {elements?.length && config.props.defaultState ? null : (
                    <div className="slots" style={{ display: 'inline-block', width: '100%', height: '100%', lineHeight: '100px', fontSize: '13px' }}>
                        拖拽布局组件到这里
                    </div>
                )}
                <div style={isShow ? { display: 'block' } : { display: 'none' }}>
                    <NgapRender elements={elements} />
                </div>
                {/* {isShow ? <NgapRender elements={elements} /> : null} */}
            </div>
        )
    );
};
export default forwardRef(CollapseBtn);
