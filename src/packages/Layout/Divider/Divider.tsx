import { ComponentType } from './../../types';
import { Divider } from 'antd';
import { forwardRef, useImperativeHandle, useState,memo, useEffect } from 'react';
import { useAppContext } from './../../../utils/AppProvider';

/*泛型只需要定义组件本身用到的属性*/
export interface IConfig {
    text: string;
    elementAlias?: string;
    type?: string;
}
/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const MDevider = ({ id, type, config }: ComponentType<IConfig>, ref: any) => {
    const [visible, setVisible] = useState(true);
    const _state = useAppContext();
    const { mode, pageStore } = _state;
    const [mStyle,setMStyle] = useState<any>({})

    const setElementAlias = pageStore((state: any) => state.setElementAlias);
    useEffect(() => {
        // 设置组件别名
        setElementAlias({ componentId: id, elementAlias: config?.props?.elementAlias });
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
    const dividerStyle: React.CSSProperties = {
        ...config.style,
        ...(config.props.type !== 'vertical' && (config.style as any)?.width ? { minWidth: 0 } : {}),
    };

    // 提取 Divider 特定的属性
    const { type: dividerType, text, elementAlias, ...restProps } = config.props;

    return (
        visible && (
            <Divider
                style={{...dividerStyle,...mStyle}}
                type={dividerType as 'vertical' | 'horizontal'}
                {...restProps}
                data-id={id}
            >
                {text}
            </Divider>
        )
    );
};
export default memo(forwardRef(MDevider));
