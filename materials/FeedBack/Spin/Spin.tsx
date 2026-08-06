import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Spin } from 'antd';
import { ComponentType } from '@materials/types';
import loadingGif from './cmcc_loading_lg.gif';
import progressGif from './progress_loading.gif';
import styles from './index.module.less';

/*泛型只需要定义组件本身用到的属性*/
export interface IConfig {
    showstyle: string;
    size: string;
}
/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const MSpin = ({id, type, config }: ComponentType, ref: any) => {
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

    // const openInterval = () => {
    //     setInterval(() => {
    //         let oldPercent = loadPercent
    //         let newPercent = 0
    //         if (oldPercent === 100) {
    //             newPercent = 30
    //         } else {
    //             newPercent = oldPercent += 30
    //         }
    //         if (newPercent > 100) {
    //             newPercent = 100
    //         }
    //         setLoadPercent(newPercent)
    //     }, 2000)
    // }

    // if (config.props.showstyle === 'tablespin') {
    //     openInterval()
    // }

    return (
        visible &&
        (config.props.showstyle === 'circlespin' ? (
            <div data-id={id} data-type={type} style={{ ...config.style, ...mStyle }}>
                <Spin {...config.props} />
                <span className={styles.spinText} style={{ marginLeft: '10px' }} >
                    拼命加载中...
                </span>
            </div>
        ) : config.props.showstyle === 'logospin' ? (
            <div className={styles.logoSpin} {...config.props}>
                <img src={loadingGif} alt="" style={{ width: '24px' }} />
                <span className={styles.spinText} style={{ marginLeft: '12px' }}>
                    努力加载中...
                </span>
            </div>
        ) : config.props.showstyle === 'tablespin' ? (
            <div {...config.props} className={styles.tableSpin}>
                <img src={progressGif} alt="" />
                <div className={styles.spinText}>数据正在加载中，请耐心等候...</div>
            </div>
        ) : (
            <></>
        ))
    );
};
export default forwardRef(MSpin);
