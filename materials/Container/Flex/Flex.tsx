import { ComponentType } from '@materials/types';
import { Flex } from 'antd';
import React from 'react';
import NgapRender from '@materials/NgapRender/NgapRender';
import { forwardRef, useImperativeHandle, useState,memo } from 'react';

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

    function handleClick(e: React.MouseEvent<HTMLDivElement>) {
        if (e.target === e.currentTarget) {
            onClick?.();
        }
    }

    const gap = config.props?.gap;
    // 提取数值部分用于 margin 计算（兼容数字和字符串类型）
    const gapNum = gap !== undefined && gap !== null && gap !== '' ? parseFloat(String(gap).replace(/(px|%|vw|vh|em|rem)/, '')) : 0;
    // 提取单位部分
    const gapUnit = gap !== undefined && gap !== null && gap !== '' ? String(gap).match(/(px|%|vw|vh|em|rem)/)?.[0] || 'px' : 'px';
    // 获取垂直布局属性
    const isVertical = config.props?.vertical === true;
    const { gap: _gap, ...restProps } = config.props || {};

    return (
        visible && (
            <Flex style={{...config.style,...mStyle}} {...restProps} data-id={id} data-type={type} onClick={handleClick}>
                {elements?.length ? <NgapRender elements={elements || []} loopVariable={loopVariable} /> : <></>}
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
export default memo(forwardRef(MFlex));
