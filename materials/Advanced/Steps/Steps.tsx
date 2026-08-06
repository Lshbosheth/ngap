import React, { forwardRef, useImperativeHandle, useState, useEffect, memo, useCallback, useMemo } from 'react';
import { Steps } from 'antd';
import type { StepsProps } from 'antd';
import * as icons from '@ant-design/icons';
import { ComponentType } from '@materials/types';
import styles from './index.module.less';
import StepLoadingIcon from './StepLoadingIcon';
import StepCircleIcon from './StepCircleIcon';
import StepFinishIcon from './StepFinishIcon';
import { omit } from 'lodash-es';
/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const MSteps = ({ id, type, config, onChange }: ComponentType<any>, ref: any) => {
    const [visible, setVisible] = useState(true);
    const [mStyle, setMStyle] = useState<any>({});

    // 对外暴露方法
    useImperativeHandle(ref, () => {
        return {
            show() {
                setVisible(true);
            },
            hide() {
                setVisible(false);
            },
            setStyle: (style: any) => {
                setMStyle(style)
            }
        };
    });

// 执行Step切换事件
    const handleChange = useCallback(
        (current: number) => {
            onChange?.({ current: current });
        },
        [onChange]
    );

    const current = useMemo(() => {
        return Number(config.props?.current || '');
    }, [config.props?.current]);

    const getFontSize = useCallback(() => {
        const size = config.props?.size || 'default';
        let fontSize: string;
        if (size === 'small') {
            fontSize = '13px';
        } else if (size === 'large') {
            fontSize = '18px';
        } else {
            fontSize = '16px';
        }
        let styleFontSize = config.style?.fontSize;
        if (styleFontSize == 'auto') {
            styleFontSize = undefined;
        }
        return styleFontSize || fontSize;
    }, [config.props?.size, config.style?.fontSize])

    const stepsClassName = useMemo(() => {
        const size = config.props?.size || 'default';
        if (size === 'small') {
            return 'ant-steps-small';
        }
        return '';
    }, [config.props?.size])

    const wrapperClass = useMemo(() => {
        if (config.props?.progressDot) {
            return '';
        }
        const size = config.props?.size || 'default';
        if (size === 'small') {
            return styles['Steps-small'];
        }
        if (size === 'large') {
            return styles['Steps-large'];
        }
        return styles['Steps-default'];
    }, [config.props?.size, config.props?.progressDot])

    const direction = config.props?.direction || 'horizontal';
    const gap = config.props?.gap;

    const baseStyle = useMemo(() => {
        const gapStyle: Record<string, string | number> = {};
        if (gap !== undefined && gap !== null) {
            gapStyle['--steps-gap'] = `${gap}px`;
        }
        return {...gapStyle, ...config.style, fontSize: getFontSize(), ...mStyle };
    }, [config.style, mStyle, getFontSize, gap, direction])

    const list = useMemo(() => {
        const items = config.props?.items || []
        const iconsList: { [key: string]: any } = icons;
        const globalStatus = config.props?.status;
        const current = Number(config.props?.current) ?? 0;
        const progressDot = config.props?.progressDot;
        return items.map((item: any, index: number) => {
            if (!item.icon) {
                let effectiveStatus;
                if (index < current) {
                    effectiveStatus = 'finish';
                } else if (index === current) {
                    effectiveStatus = item.status || globalStatus || 'process';
                } else {
                    effectiveStatus = 'wait';
                }

                const isProcessing = effectiveStatus === 'processing';
                const isError = effectiveStatus === 'error';
                const isProcess = effectiveStatus === 'process';
                const isWait = effectiveStatus === 'wait';
                const isFinish = effectiveStatus === 'finish';
                if (progressDot) {
                    if (isFinish) {
                        return {
                            ...item,
                            status: 'finish',
                        };
                    }
                    if (isProcessing) {
                        return {
                            ...item,
                            status: 'process'
                        };
                    }
                    return {
                        ...item
                    };
                }
                if (isFinish) {
                    return {
                        ...item,
                        status: 'finish',
                        icon: <StepFinishIcon size={config.props?.size} />
                    };
                }
                if (isError) {
                    return {
                        ...item,
                        icon: <StepCircleIcon size={config.props?.size} color="#ff4d4f" />
                    }
                }
            if (isProcessing) {
                return {
                    ...item,
                    status: 'process',
                    icon: <StepLoadingIcon size={config.props?.size} />
                    }
                }
                if (isProcess) {
                    return {
                        ...item,
                        icon: <StepCircleIcon size={config.props?.size} color="#4798F3" />
                    }
                }
                if (isWait) {
                    return {
                        ...item,
                        icon: <StepCircleIcon size={config.props?.size} color="#D7D7D7" filled glowMultiplier={1.5} />
                    }
                }
                return item;
            }
            return {
                ...item,
                icon: item.icon ? React.createElement(iconsList[item.icon]) : null,
            }
        })
    }, [config.props?.items, config.props?.status, config.props?.current, config.props?.size, config.props?.progressDot])

    const other = useMemo(() => {
        return omit(config.props, ['gridLayout', 'elementAlias', 'authInfo']);
    }, [config.props]);

    return (
        visible && (
            <div className={`${styles.Steps} ${wrapperClass}`} style={baseStyle} data-id={id} data-type={type}>
                <Steps className={stepsClassName} {...other} current={current} items={list} onChange={handleChange}></Steps>
            </div>
        )
    );
};
export default memo(forwardRef(MSteps));
