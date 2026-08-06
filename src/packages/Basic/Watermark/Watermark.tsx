import { ComponentType, IDragTargetItem } from './../../types';
import { useDrop } from 'react-dnd';
import { getComponent } from './../../index';
import NgapRender from './../../NgapRender/NgapRender';
import { forwardRef, useImperativeHandle, useState, useEffect, memo } from 'react';
import { Watermark } from 'antd';
import { useAppContext } from './../../../utils/AppProvider';
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
    const { pageStore } = useAppContext();
    const addChildElements = pageStore((state: any) => state.addChildElements);
    const [visible, setVisible] = useState(true);
    const [content, setContent] = useState('');
    const [image, setImage] = useState('');
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const apiList = apiListInfo((state: any) => state.apiList);
    const _state = useAppContext();
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

    useEffect(() => {
        const value = typeof config.props.content === 'string' ? config.props.content : config.props.content?.value;
        setContent(value);
    }, [config.props.content]);
    useEffect(() => {
        const value = typeof config.props.image === 'string' ? config.props.image : config.props.image?.value;
        setImage(value);
    }, [config.props.image]);

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
    const gapx = config.props?.gapx || 100;
    const gapy = config.props?.gapy || 100;
    const offsetx = config.props?.offsetx || gapx / 2;
    const offsety = config.props?.offsety || gapy / 2;
    console.log(image, 'image');

    const getColor = () => {
        let styleColor = config.style?.color;
        styleColor = styleColor == "auto"? "": styleColor;
        return styleColor || '#8a8b8c';
    }

    const getFontSize = () => {
        let styleFontSize = config.style?.fontSize;
        styleFontSize = styleFontSize == "auto"? "": styleFontSize;
        const fontSize = styleFontSize? parseFloat(styleFontSize as string) : 16;
        return fontSize;
    }

    return (
        visible && (
            <div data-id={id} data-type={type}>
                <Watermark
                    style={{...config.style,...mStyle}}
                    {...config.props}
                    content={content}
                    image={image}
                    width={Math.max(config.props?.width ?? 0, 10)}
                    height={Math.max(config.props?.height ?? 0, 10)}
                    // font={{ ...config.props.font, fontSize: config.props?.font?.fontSize || 16 }}
                    font={{
                        color: getColor(),
                        fontSize: getFontSize(),
                        fontWeight: config.style?.fontWeight || 'normal',
                        fontFamily: 'sans-serif',
                        fontStyle: 'normal',
                        textAlign: config.style?.textAlign || 'center'
                    }}
                    gap={[gapx, gapy]}
                    offset={[offsetx, offsety]}
                >
                    <div ref={drop}>
                        {elements?.length ? (
                            <NgapRender elements={elements || []} loopVariable={loopVariable} />
                        ) : (
                            <div className="slots" style={{ lineHeight: '100px' }}>
                                拖拽元素到这里
                            </div>
                        )}
                    </div>
                </Watermark>
            </div>
        )
    );
};
export default memo(forwardRef(MRow));
