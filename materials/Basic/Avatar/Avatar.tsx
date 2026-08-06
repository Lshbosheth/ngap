import React, { forwardRef, useImperativeHandle, useMemo, memo,useState } from 'react';
import { Avatar } from 'antd';
import { ComponentType } from '@materials/types';

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
}
/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const MAvatar = ({id, type, config }: ComponentType<IConfig>, ref: any) => {
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

    const { textavatar, size, ...props } = config.props;
    const textavatarVal = typeof config.props.textavatar === 'string' ? config.props.textavatar : config.props.textavatar?.value;
    const srcVal = typeof config.props.src === 'string' ? config.props.src : config.props.src?.value;

    // 大小转换
    const avatarSize = useMemo(() => {
        if (!size) return 'default';
        if (['large', 'small', 'default'].includes(size?.toString())) return size;

        const str = Number(size.toString().replace('px', ''));
        return isNaN(Number(str)) ? 'default' : Number(str);
    }, [size]);

    return (
        visible && (
            <Avatar style={{...config.style,...mStyle}} data-id={id} data-type={type} {...props} src={srcVal || undefined} size={avatarSize as AvatarSize}>
                {textavatarVal}
            </Avatar>
        )
    );
};
export default memo(forwardRef(MAvatar));
