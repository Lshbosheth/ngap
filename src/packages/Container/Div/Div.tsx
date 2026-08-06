import { ComponentType, IDragTargetItem } from './../../types';
import { useDrop } from 'react-dnd';
import { getComponent } from './../../index';
import NgapRender from './../../NgapRender/NgapRender';
import { forwardRef, useImperativeHandle, useState, memo,useEffect } from 'react';
import { useAppContext } from './../../../utils/AppProvider';
import style from '../../component.module.less';
import { crossApiUserInfo } from './../../../stores/crossapiStore';
import { apiListInfo } from './../../../stores/apiListStore';
import { useShallow } from 'zustand/react/shallow';
import { isEqual } from 'lodash-es';

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
const Div = ({ id, type, config, elements, loopVariable, onClick }: ComponentType & { loopVariable?: any }, ref: any) => {
    const { pageStore, mode } = useAppContext();
    const addChildElements = pageStore(useShallow((state: any) => state.addChildElements));
    const setElementAlias = pageStore(useShallow((state: any) => state.setElementAlias));
    const [visible, setVisible] = useState(true);
    const userInfo = crossApiUserInfo(useShallow((state: any) => state.userInfo));
    const apiList = apiListInfo(useShallow((state: any) => state.apiList));
    const _state = useAppContext();
    const [mStyle,setMStyle] = useState<any>({})

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

    function handleClick(e: React.MouseEvent<HTMLDivElement>) {
        if (_state.mode !== 'edit') {
            if (e.target === e.currentTarget) {
                onClick?.();
            }
        }
    }

    return (
        visible && (
            <div
                className={mode == 'edit' ? (isOver ? style.boxHover : style.box) : ''}
                style={{...config.style,...mStyle}}
                {...config.props}
                data-id={id}
                data-type={type}
                ref={drop}
                onClick={handleClick}
            >
                {elements?.length ? (
                    <NgapRender elements={elements || []} loopVariable={loopVariable} />
                ) : (
                    <div className="slots" style={{ height: 100, lineHeight: '100px' }}>
                        拖拽元素到这里
                    </div>
                )}
            </div>
        )
    );
};
export default memo(forwardRef(Div), (prevProps, nextProps) => {
    if (prevProps.id != nextProps.id) return false;
    if (!isEqual(prevProps.config, nextProps.config)) return false;
    if (prevProps.elements.length != nextProps.elements.length) return false;
    return true
});
