import { ComponentType, IDragTargetItem } from './../../types';
import { useDrop } from 'react-dnd';
import { getComponent } from './../../index';
import NgapRender from './../../NgapRender/NgapRender';
import { forwardRef, useImperativeHandle, useState,memo, useEffect } from 'react';
import { Row } from 'antd';
import { useAppContext } from './../../../utils/AppProvider';
import style from '../../component.module.less';
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
const MRow = ({ id, type, config, elements, loopVariable }: ComponentType & { loopVariable?: any }, ref: any) => {
    const { pageStore, mode } = useAppContext();
    const addChildElements = pageStore((state: any) => state.addChildElements);
    const [visible, setVisible] = useState(true);
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const apiList = apiListInfo((state: any) => state.apiList);
    const _state = useAppContext();
    const [mStyle,setMStyle] = useState<any>({})

    // 设置组件别名
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
            setStyle:(style:any)=>{
                setMStyle(style)
            }
        };
    });
    const gutter = config.props?.gutter || 0;
    return (
        visible && (
            <Row
                className={mode == 'edit' ? (isOver ? style.boxHover : style.box) : ''}
                style={{...config.style,...mStyle}}
                {...config.props}
                gutter={gutter}
                data-id={id}
                data-type={type}
                ref={drop}
            >
                {elements?.length ? (
                    <NgapRender elements={elements} loopVariable={loopVariable} />
                ) : (
                    <div className="slots" style={{ height: 100, lineHeight: '100px' }}>
                        拖拽元素到这里
                    </div>
                )}
            </Row>
        )
    );
};
export default memo(forwardRef(MRow));
