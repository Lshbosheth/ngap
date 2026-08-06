import { ComponentType, IDragTargetItem } from '@materials/types';
import { useDrop } from 'react-dnd';
import NgapRender from '@materials/NgapRender/NgapRender';
import { forwardRef, useImperativeHandle, useState ,memo} from 'react';
import styles from './index.module.less';
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
const MBottomBanner = ({ id, type, config, elements }: ComponentType, ref: any) => {
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
    const buildStyle = (object: { [name: string]: any }, variable: string, key: string): Object => {
        if (variable) {
            object[key] = variable;
            return object;
        }
        return object;
    };
    const paddingTop = config.props?.paddingTop;
    const paddingBottom = config.props?.paddingBottom;
    const paddingLeft = config.props?.paddingLeft;
    const paddingRight = config.props?.paddingRight;
    const line = config.props?.line;
    const borderTop = line ? '1px solid #d5dce6' : '';
    // let style: { [name: string]: any } = { ...config.style } || {};
    let style: { [name: string]: any } = { ...config.style };

    style = buildStyle(style, paddingTop, 'padding-top');
    style = buildStyle(style, paddingBottom, 'padding-bottom');
    style = buildStyle(style, paddingLeft, 'padding-left');
    style = buildStyle(style, paddingRight, 'padding-right');
    style = buildStyle(style, borderTop, 'border-top');
    return (
        visible && (
            <div data-id={id} data-type={type} className={[styles.bottomBannerAtom].join(' ')} style={{ ...style ,...mStyle}}>
                <div className="allowDragDiv">{elements?.length ? <NgapRender elements={elements} /> : ''}</div>
            </div>
        )
    );
};
export default memo(forwardRef(MBottomBanner));
