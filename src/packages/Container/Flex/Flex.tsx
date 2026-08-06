import { ComponentType, IDragTargetItem } from './../../types';
import { Flex } from 'antd';
import { useDrop } from 'react-dnd';
import { useShallow } from 'zustand/react/shallow';
import { getComponent } from './../../index';
import NgapRender from './../../NgapRender/NgapRender';
import { forwardRef,memo, useImperativeHandle, useState, useEffect } from 'react';
import { useAppContext } from './../../../utils/AppProvider';
import style from '../../component.module.less';
import { crossApiUserInfo } from './../../../stores/crossapiStore';
import { apiListInfo } from './../../../stores/apiListStore';
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
const MFlex = ({ id, type, config, elements, loopVariable, onClick }: ComponentType & { loopVariable?: any }, ref: any) => {
    const { pageStore, mode } = useAppContext();
    const addChildElements = pageStore(useShallow((state: any) => state.addChildElements));
    const [visible, setVisible] = useState(true);
    const userInfo = crossApiUserInfo(useShallow((state: any) => state.userInfo));
    const apiList = apiListInfo(useShallow((state: any) => state.apiList));
    const _state = useAppContext();
    const setElementAlias = pageStore(useShallow((state: any) => state.setElementAlias));
    const [mStyle,setMStyle] = useState<any>({})

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

    function handleClick(e: React.MouseEvent<HTMLDivElement>) {
        if (_state.mode !== 'edit') {
            if (e.target === e.currentTarget) {
                onClick?.();
            }
        }
    }

    const gap = config.props?.gap;
    // 提取数值部分用于 margin 计算（兼容数字和字符串类型）
    const gapNum = gap !== undefined && gap !== null && gap !== ''
        ? parseFloat(String(gap).replace(/(px|%|vw|vh|em|rem)/, ''))
        : 0;
    // 提取单位部分
    const gapUnit = gap !== undefined && gap !== null && gap !== ''
        ? String(gap).match(/(px|%|vw|vh|em|rem)/)?.[0] || 'px'
        : 'px';
    // 获取垂直布局属性
    const isVertical = config.props?.vertical === true;
    const { gap: _gap, ...restProps } = config.props || {};

    return (
        visible && (
            <Flex
                className={mode == 'edit' ? (isOver ? style.boxHover : style.box) : ''}
                style={{...config.style,...mStyle}}
                {...restProps}
                data-id={id}
                data-type={type}
                ref={drop}
                onClick={handleClick}
            >
                {elements?.length ? (
                    <NgapRender elements={elements || []} loopVariable={loopVariable} />
                ) : (
                    <div className="slots" style={{ lineHeight: '200px' }}>
                        拖拽元素到这里
                    </div>
                )}
                {/* Flex > div > .componentBox > 子元素 */}
                {gapNum > 0 && elements?.length > 1 && (
                    <style
                        dangerouslySetInnerHTML={{
                            __html: isVertical
                                ? `
                                [data-id="${id}"] > div > .componentBox:not(:last-child) > * {
                                    margin-bottom: ${gapNum}${gapUnit};
                                }
                                `
                                : `
                                [data-id="${id}"] > div > .componentBox:not(:last-child) > * {
                                    margin-right: ${gapNum}${gapUnit};
                                }
                                `,
                        }}
                    />
                )}
            </Flex>
        )
    );
};
export default memo(forwardRef(MFlex), (prevProps, nextProps) => {
    if (prevProps.id != nextProps.id) return false;
    if (!isEqual(prevProps.config, nextProps.config)) return false;
    if (prevProps.elements.length != nextProps.elements.length) return false;
    return true
});
