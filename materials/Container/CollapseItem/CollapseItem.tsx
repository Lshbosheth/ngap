import { forwardRef, useImperativeHandle, useState } from 'react';
import { ComponentType } from '@materials/types';
import NgapRender from '@materials/NgapRender/NgapRender';
// import style from '../../component.module.less';
/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const MTabs = ({id, type, config, elements }: ComponentType, ref: any) => {
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
    let _elements = elements.filter((item: any) => item.id.indexOf("_titleContent") == -1);

    return (
        visible && (
            <div
                // className={mode == 'edit' ? (isOver ? style.boxHover : style.box) : ''}
                style={{...config.style,...mStyle}}
                data-id={id}
                data-type={type}
            >
                <NgapRender elements={_elements} />
            </div>
        )
    );
};
export default forwardRef(MTabs);
