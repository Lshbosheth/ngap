import React, { forwardRef, useImperativeHandle, useMemo, useState,memo, useEffect } from 'react';
import { Avatar } from 'antd';
import { ComponentType } from './../../types';
import { useAppContext } from './../../../utils/AppProvider';

export type AvatarSize = 'large' | 'small' | 'default' | number;

/*泛型只需要定义组件本身用到的属性*/
export interface IConfig {
    textavatar?: any; // 文字头像
    /** Shape of avatar, options: `circle`, `square` */
    shape?: 'circle' | 'square';
    size?: AvatarSize;
    gap?: number;
    /** Src of image avatar */
    src?: any;
    /** Srcset of image avatar */
    srcSet?: string;
    draggable?: boolean | 'true' | 'false';
    /** Icon to be used in avatar */
    icon?: React.ReactNode;
    children?: React.ReactNode;
    alt?: string;
    crossOrigin?: '' | 'anonymous' | 'use-credentials';
    elementAlias?: string;
}
/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const MAvatar = ({ id, type, config }: ComponentType<IConfig>, ref: any) => {
    const [visible, setVisible] = useState(true);
    const [textavatar, setTextavatar] = useState<string>('');
    const [src, setSrc] = useState<string>('');
    const _state = useAppContext();
    const { pageStore } = _state;
    const setElementAlias = pageStore((state: any) => state.setElementAlias);
    const [mStyle,setMStyle] = useState<any>({})

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

    const { size, ...props } = config.props;

    // 初始化默认值
    useEffect(() => {
        const titleVal = typeof config.props.textavatar === 'string' ? config.props.textavatar : config.props.textavatar?.value;
        setTextavatar(titleVal);
    }, [config.props.textavatar]);
    useEffect(() => {
        const titleVal = typeof config.props.src === 'string' ? config.props.src : config.props.src?.value;
        setSrc(titleVal);
    }, [config.props.src]);

    // 大小转换
    const avatarSize = useMemo(() => {
        if (!size) return 'default';
        if (['large', 'small', 'default'].includes(size?.toString())) return size;

        const str = Number(size.toString().replace('px', ''));
        return isNaN(Number(str)) ? 'default' : Number(str);
    }, [size]);

    return (
        visible && (
            <Avatar data-id={id} data-type={type} style={{...config.style,...mStyle}} {...props} src={src || undefined} size={avatarSize as AvatarSize}>
                {textavatar}
            </Avatar>
        )
    );
};
export default memo(forwardRef(MAvatar));
