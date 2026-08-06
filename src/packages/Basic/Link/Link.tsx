import { ComponentType } from './../../types';
import { useState, useImperativeHandle, forwardRef, useEffect, memo } from 'react';
import { useAppContext } from './../../../utils/AppProvider';
import CrossAPI from './../../../utils/crossAPI';

/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const MLink = ({ id, type, config }: ComponentType, ref: any) => {
    const [visible, setVisible] = useState(true);
    const { mode, pageStore } = useAppContext();
    const [mStyle,setMStyle] = useState<any>({})

    const setElementAlias = pageStore((state: any) => state.setElementAlias);
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
    // 阻止超链接默认行为
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        if (mode === 'preview') {
            CrossAPI.createTab(config.props.text ? config.props.text : '测试页面', config.props.href, {});
        }
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
