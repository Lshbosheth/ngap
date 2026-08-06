import { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { getComponent } from './../../index';
import { ComponentType, IDragTargetItem } from './../../types';
import NgapRender from './../../NgapRender/NgapRender';
import { useAppContext } from './../../../utils/AppProvider';
import style from '../../component.module.less';
import { crossApiUserInfo } from './../../../stores/crossapiStore';
import { apiListInfo } from './../../../stores/apiListStore';
/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const MTabs = ({ id, type, config, elements }: ComponentType, ref: any) => {
    const [visible, setVisible] = useState(true);
    const { pageStore, mode } = useAppContext();
    const addChildElements = pageStore((state: any) => state.addChildElements);
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const apiList = apiListInfo((state: any) => state.apiList);
    const _state = useAppContext();
    const setElementAlias = pageStore((state: any) => state.setElementAlias);
    useEffect(() => {
        // 设置组件别名
        setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
    }, [config.props.elementAlias]);
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

    // 对外暴露方法
    useImperativeHandle(ref, () => {
        return {
            show() {
                setVisible(true);
            },
            hide() {
                setVisible(false);
            },
        };
    });

    let _elements = elements.filter((item: any) => item.id.indexOf("_titleContent") == -1);
    return (
        visible && (
            <div
                className={mode == 'edit' ? (isOver ? style.boxHover : style.box) : ''}
                style={config.style}
                data-id={id}
                data-type={type}
                ref={drop}
            >
                {_elements.length ? (
                    <NgapRender elements={_elements} />
                ) : (mode == 'edit' && <div className="slots" style={{ lineHeight: '150px' }}>
                        拖拽元素到这里
                    </div>)
                }
            </div>
        )
    );
};
export default forwardRef(MTabs);
