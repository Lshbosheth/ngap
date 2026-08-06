import { ComponentType } from '@materials/types';
import NgapRender from '@materials/NgapRender/NgapRender';
import { forwardRef, useImperativeHandle, useState, useEffect, memo } from 'react';
import { Watermark } from 'antd';
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
const MRow = ({id, type, config, elements, loopVariable }: ComponentType & { loopVariable?: any }, ref: any) => {
    const [visible, setVisible] = useState(true);
    const [content, setContent] = useState('');
    const [image, setImage] = useState('');
    const [mStyle,setMStyle] = useState<any>({})

    useEffect(() => {
        const value = typeof config.props.content === 'string' ? config.props.content : config.props.content?.value;
        setContent(value);
    }, [config?.props?.content]);
    useEffect(() => {
        const value = typeof config?.props?.image === 'string' ? config?.props?.image : config?.props?.image?.value;
        setImage(value);
    }, [config?.props?.image]);

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
            <div>
                <Watermark
                    style={{...config.style,...mStyle}}
                    data-id={id}
                    data-type={type}
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
                    <div>
                        <NgapRender elements={elements || []} loopVariable={loopVariable} />
                    </div>
                </Watermark>
            </div>
        )
    );
};
export default memo(forwardRef(MRow));
