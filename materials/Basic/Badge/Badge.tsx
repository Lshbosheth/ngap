import { ComponentType } from '@materials/types';
import NgapRender from '@materials/NgapRender/NgapRender';
import { forwardRef, useEffect, useImperativeHandle, useState, memo } from 'react';
import { Badge } from 'antd';
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
const MBadge = ({ id, type, config, elements, onClick, loopVariable }: ComponentType & { loopVariable?: any }, ref: any) => {
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

    const isindividual = config.props?.isindividual;
    const hasChildren = !isindividual;

    const countStr = config.props?.count;
    const count = countStr ? Number(countStr) : undefined;
    const dot = config.props?.dot;
    const status = config.props?.status;

    const showNumSet = !count && count !== 0 && !dot && !status;

    const overflowCount = Number(config.props?.overflowCount) || 99;

    const handleClick = () => {
        onClick?.();
    };
    return (
        visible && (
            <Badge
            data-id={id}
            data-type={type}
                className={styles.Badge}
                style={{
                    ...config.style,...mStyle
                }}
                {...config.props}
                count={count}
                overflowCount={overflowCount}
                onClick={handleClick}
            >
                {hasChildren ? (
                    elements?.length ? (
                        <NgapRender elements={elements} loopVariable={loopVariable} />
                    ) : (
                        ''
                    )
                ) : showNumSet ? (
                    <div className="slots" style={{ display: 'inline-block', width: 100, height: 50, lineHeight: '50px', fontSize: '13px' }}>
                        设置数字
                    </div>
                ) : null}
            </Badge>
        )
    );
};
export default memo(forwardRef(MBadge));
