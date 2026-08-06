import { ComponentType } from '@materials/types';
import NgapRender from '@materials/NgapRender/NgapRender';
import { forwardRef, useImperativeHandle,memo,useState } from 'react';

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
const Div = ({ id, type, config, elements, loopVariable, onClick }: ComponentType & { loopVariable?: any }, ref: any) => {
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
    return (
        visible && (
            <div
                style={{...config.style,...mStyle}}
                {...config.props}
                data-id={id}
                data-type={type}
                onClick={handleClick}
            >
                {<NgapRender elements={elements || []} loopVariable={loopVariable} />}
            </div>
        )
    );
};
export default memo(forwardRef(Div));
