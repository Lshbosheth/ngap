import { ComponentType, IDragTargetItem } from '@materials/types';
import NgapRender from '@materials/NgapRender/NgapRender';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Button } from 'antd';
import { AlignLeftOutlined } from '@ant-design/icons';
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
const CollapseBtn = ({ id, type, config, elements, onClick }: ComponentType, ref: any) => {

    const [visible, setVisible] = useState(true);

    const [isShow, setIsShow] = useState(true);

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

    const handleClick = () => {
        // if (mode === 'preview') {
        //
        // }
        setIsShow(!isShow);
        onClick?.();
    };
    useEffect(() => {
        setIsShow(config.props.defaultState);
    }, [config.props.defaultState]);
    return (
        visible && (
            <div
                style={{
                    ...config.style,
                    position: config.props.defaultState ? 'relative' : 'static',
                    ...mStyle
                    // display: 'inline-flex',
                }}
                {...config.props}
                data-id={id}
                data-type={type}
            >
                <Button
                    style={{
                        position: config.props.defaultState ? 'absolute' : 'static',
                        top: 0,
                        right: config.props.defaultState&&isShow ? '0' : '-50px',
                        zIndex: 999,
                    }}
                    type={
                        config.props.btnType == 1 ? 'primary' : config.props.btnType == 2 ? 'default' : config.props.btnType == 3 ? 'text' : 'primary'
                    }
                    icon={<AlignLeftOutlined />}
                    onClick={handleClick}
                >
                    {config.props.showText ? (config.props.defaultState &&isShow? '收起' : '展开') : null}
                </Button>
                {/* {elements?.length && config.props.defaultState ? null : (
                    <div className="slots" style={{ display: 'inline-block', width: '100%', height: '100%', lineHeight: '100px', fontSize: '13px' }}>
                        拖拽布局组件到这里
                    </div>
                )} */}
                <div style={isShow ? { display: 'block' } : { display: 'none' }}>
                    <NgapRender elements={elements} />
                </div>
                {/* {isShow ? <NgapRender elements={elements} /> : null} */}
            </div>
        )
    );
};
export default forwardRef(CollapseBtn);
