import { ComponentType, IDragTargetItem } from './../../types';
import { useDrop } from 'react-dnd';
import { getComponent } from './../../index';
import NgapRender from './../../NgapRender/NgapRender';
import { forwardRef, useEffect, useImperativeHandle, useState ,memo} from 'react';
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
const MBottomBanner = ({ id, type, config, elements }: ComponentType, ref: any) => {
    const { pageStore, mode } = useAppContext();
    const addChildElements = pageStore((state: any) => state.addChildElements);
    const [visible, setVisible] = useState(true);
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const apiList = apiListInfo((state: any) => state.apiList);
    const _state = useAppContext();
    const setElementAlias = pageStore((state: any) => state.setElementAlias);
    const [mStyle,setMStyle] = useState<any>({})

    useEffect(() => {
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
    const buildStyle = (object: { [name: string]: any }, variable: string, key: string): Object => {
        if (variable) {
            object[key] = variable;
            return object;
        }
        return object;
    };
    const paddingTop = config.props?.paddingTop;
    const paddingBottom = config.props?.paddingBottom;
    const paddingLeft = config.props?.paddingLeft;
    const paddingRight = config.props?.paddingRight;
    const line = config.props?.line;
    const borderTop = line ? '1px solid #d5dce6' : '';
    // let style: { [name: string]: any } = { ...config.style } || {};
    let style: { [name: string]: any } = { ...config.style };

    style = buildStyle(style, paddingTop, 'padding-top');
    style = buildStyle(style, paddingBottom, 'padding-bottom');
    style = buildStyle(style, paddingLeft, 'padding-left');
    style = buildStyle(style, paddingRight, 'padding-right');
    style = buildStyle(style, borderTop, 'border-top');
    return (
        visible && (
            <div
                className={[mode == 'edit' ? (isOver ? styles.boxHover : styles.box) : '', styles.bottomBannerAtom, config.props?.positionMode === 'container' ? styles.containerMode : ''].join(' ')}
                style={{ ...style ,...mStyle}}
                data-id={id}
                data-type={type}
                ref={drop}
            >
                <div className="allowDragDiv">
                    {elements?.length ? (
                        <NgapRender elements={elements} />
                    ) : (
                        <div className="slots" style={{ height: 48, lineHeight: '48px' }}>
                            拖拽元素到这里
                        </div>
                    )}
                </div>
            </div>
        )
    );
};
export default memo(forwardRef(MBottomBanner));
