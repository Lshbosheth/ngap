import { ComponentType } from '@materials/types';
import * as Components from '@materials/index';
import NgapRender, { Material } from '@materials/NgapRender/NgapRender';
import { usePageStore } from '@materials/stores/pageStore';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Button, Space } from 'antd';

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
const MSpace = ({ id, type, config, elements }: ComponentType, ref: any) => {
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
    return (
        visible && (
            <Space data-id={id} data-type={type} style={{...config.style,...mStyle}} {...config.props}>
                {elements?.length ? elements?.map((child) => <Material key={child.id} item={child} />) : null}
            </Space>
        )
    );
};
export default forwardRef(MSpace);
