import { ComponentType, IDragTargetItem } from './../../types';
import { useDrop } from 'react-dnd';
import { getComponent } from './../../index';
import NgapRender, { Material } from './../../NgapRender/NgapRender';
import { forwardRef, useEffect, useImperativeHandle, useState, memo } from 'react';
import { Badge } from 'antd';
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
const MBadge = ({ id, type, config, elements, onClick, loopVariable }: ComponentType & { loopVariable?: any }, ref: any) => {
    const { pageStore } = useAppContext();
    const addChildElements = pageStore((state: any) => state.addChildElements);
    const [visible, setVisible] = useState(true);
    const _state = useAppContext();
    const { mode } = _state;
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

    const isindividual = config.props?.isindividual;
    const hasChildren = !isindividual;

    const countStr = config.props?.count;
    const count = countStr ? Number(countStr) : undefined;
    const dot = config.props?.dot;
    const status = config.props?.status;

    const showNumSet = !count && count !== 0 && !dot && !status;

    const overflowCount = Number(config.props?.overflowCount) || 99;

    const handleClick = () => {
        if (mode === 'preview') {
            onClick?.();
        }
    };
    return (
        visible && (
            <Badge
                className={styles.Badge}
                style={{
                    ...config.style,
                    ...mStyle
                }}
                {...config.props}
                count={count}
                overflowCount={overflowCount}
                data-id={id}
                data-type={type}
                ref={drop}
                onClick={handleClick}
            >
                {hasChildren ? (
                    elements?.length ? (
                        <NgapRender elements={elements} loopVariable={loopVariable} />
                    ) : (
                        <div className="slots" style={{ display: 'inline-block', width: 100, height: 100, lineHeight: '100px', fontSize: '13px' }}>
                            拖拽组件到这里
                        </div>
                    )
                ) : showNumSet ? (
                    <div className="slots" style={{ display: 'inline-block', width: 100, height: 50, lineHeight: '50px', fontSize: '13px' }}>
                        设置数字
                    </div>
                ) : null}
            </Badge>
        )
    );
};
export default memo(forwardRef(MBadge));
