import { ComponentType, IDragTargetItem } from './../../types';
import { Button, Card, Avatar } from 'antd';
import { useDrop } from 'react-dnd';
import { getComponent } from './../../index';
import NgapRender from './../../NgapRender/NgapRender';
import { forwardRef, useImperativeHandle, useMemo, useState, useEffect, memo } from 'react';
import { omit, isEqual } from 'lodash-es';
import { useAppContext } from './../../../utils/AppProvider';
import style from '../../component.module.less';
import { crossApiUserInfo } from './../../../stores/crossapiStore';
import { apiListInfo } from './../../../stores/apiListStore';
import { useShallow } from 'zustand/react/shallow';
import classNames from "classnames";
import './index.less'

/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const MCard = ({ id, type, config, elements, onClick, onClickMore, loopVariable }: ComponentType & { loopVariable?: any }, ref: any) => {
    const { pageStore, mode } = useAppContext();
    const addChildElements = pageStore(useShallow((state: any) => state.addChildElements));
    const [visible, setVisible] = useState(true);
    const [cardTitle, setCardTitle] = useState<string>('');
    const userInfo = crossApiUserInfo(useShallow((state: any) => state.userInfo));
    const apiList = apiListInfo(useShallow((state: any) => state.apiList));
    const _state = useAppContext();
    const [mStyle,setMStyle] = useState<any>({})

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

    // 初始化默认值
    useEffect(() => {
        const titleVal = typeof config.props.title === 'string' ? config.props.title : config.props.title?.value;
        setCardTitle(titleVal);
    }, [config.props.title]);

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

    const meta = useMemo(() => config.props.meta, [config.props.meta]);
    const avatar = useMemo(() => config.props.avatar || undefined, [config.props.avatar]);

    const children = useMemo(() => {
        if (mode === 'edit' || elements?.length) {
            return (
                <div className={'cardChildren'}>
                    {elements?.length ? (
                        <NgapRender elements={elements} loopVariable={loopVariable} />
                    ) : (
                        <div className="slots" style={{ lineHeight: '100px' }}>
                            拖拽元素到这里
                        </div>
                    )}
                </div>
            );
        }

        return null;
    }, [mode, elements, loopVariable]);

    // 拖拽样式
    const dropClassname = mode == 'edit' ? (isOver ? style.boxHover : style.box) : ''
    return (
        visible && (
            <Card
                className={classNames(dropClassname, 'mCard', { headBackColor: config.props?.headerBackgroundColor === 'blue' })}
                style={{ ...config.style, ...mStyle }}
                title={`${cardTitle}`}
                {...omit(config.props, ['cover', 'meta', 'title', 'headerBackgroundColor'])}
                data-id={id}
                data-type={type}
                cover={config?.props?.cover ? <img src={config?.props?.cover} /> : null}
                extra={
                    config.props.extra?.text ? (
                        <Button
                            {...config.props.extra}
                            className={'extraButton'}
                            onClick={(event) => {
                                event.stopPropagation();
                                onClickMore?.();
                            }}
                        >
                            {config.props.extra?.text}
                        </Button>
                    ) : null
                }
                onClick={() => onClick?.()}
                ref={drop}
            >
                {meta.title || meta.description ? <Card.Meta {...meta} avatar={avatar && <Avatar src={avatar} />} /> : null}
                {children}
            </Card>
        )
    );
};
export default memo(forwardRef(MCard), (prevProps, nextProps) => {
    if(prevProps.id != nextProps.id) return false;
    if(prevProps.elements.length != nextProps.elements.length) return false;
    return isEqual(prevProps.config, nextProps.config) && isEqual(prevProps.loopVariable, nextProps.loopVariable);
});
