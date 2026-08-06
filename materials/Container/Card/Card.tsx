import { ComponentType } from '@materials/types';
import { Button, Card } from 'antd';
import NgapRender from '@materials/NgapRender/NgapRender';
import { forwardRef, memo, useImperativeHandle, useMemo, useState } from 'react';
import { omit } from 'lodash-es';
import classNames from "classnames";
import './index.less'

/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const MCard = ({ id, type, config, elements, onClick, loopVariable }: ComponentType & { loopVariable?: any }, ref: any) => {
    const [visible, setVisible] = useState(true);
    const [mStyle, setMStyle] = useState<any>({})

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
    // 点击更多事件
    const handleClick = () => {
        onClick?.();
    };
    const meta = useMemo(() => config?.props?.meta, [config?.props?.meta]);
    const cardTitle = typeof config?.props?.title === 'string' ? config?.props?.title : config?.props?.title?.value;
    return (
        visible && (
            <Card
                data-id={id}
                data-type={type}
                className={classNames('mCard', { headBackColor: config.props?.headerBackgroundColor === 'blue' })}
                style={{ ...config.style, ...mStyle }}
                title={`${cardTitle}`}
                {...omit(config.props, ['cover', 'meta', 'title', 'headerBackgroundColor'])}
                cover={config?.props?.cover ? <img src={config?.props?.cover} /> : null}
                extra={
                    config?.props?.extra?.text ? (
                        <Button {...config?.props?.extra} className={'extraButton'} onClick={handleClick}>
                            {config?.props?.extra?.text}
                        </Button>
                    ) : null
                }
            >
                {meta.title || meta.description ? <Card.Meta {...meta} /> : null}
                {!!elements?.length && (
                    <div className={'cardChildren'}>
                        <NgapRender elements={elements} loopVariable={loopVariable} />
                    </div>
                )}
            </Card>
        )
    );
};
export default memo(forwardRef(MCard));
