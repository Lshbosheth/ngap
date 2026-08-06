import { ComponentType } from '@materials/types';
import { useState, useImperativeHandle, forwardRef, memo } from 'react';

/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const MLink = ({ id, type, config }: ComponentType, ref: any) => {
    const [visible, setVisible] = useState(true);
    const [mStyle,setMStyle] = useState<any>({})

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
    // 阻止超链接默认行为
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        window?.crossAPI?.createTab(config.props.text ? config.props.text : '测试页面', config.props.href, {});

    };
    return (
        visible && (
            <a
                style={{ ...config.style ,...mStyle}}
                {...config.props}
                data-id={id}
                data-type={type}
                href="javascript:void(0)"
                onClick={handleClick}
            >
                {config?.props?.text}
            </a>
        )
    );
};
export default memo(forwardRef(MLink));
