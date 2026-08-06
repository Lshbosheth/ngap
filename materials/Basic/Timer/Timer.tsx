import { ComponentType } from '@materials/types';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState, memo, useMemo } from 'react';
import styles from './index.module.less';
import { Button, Space } from 'antd';

/*泛型只需要定义组件本身用到的属性*/
export interface IConfig {
    text: string;
}
const parseInitialTime = (timeStr?: string) => {
    if (!timeStr) {
        return { hours: 0, minutes: 0, seconds: 0 };
    }
    const parts = timeStr.split(':').map((part) => {
        const num = Number(part);
        return isNaN(num) ? 0 : num;
    });

    const [hours = 0, minutes = 0, seconds = 0] = parts;
    return {
        hours: Math.max(0, Math.min(23, hours)),
        minutes: Math.max(0, Math.min(59, minutes)),
        seconds: Math.max(0, Math.min(59, seconds)),
    };
};
const parseTimeToSeconds = (obj: { hours: any; minutes: any; seconds: any }) => {
    const { hours, minutes, seconds } = obj;
    return hours * 3600 + minutes * 60 + seconds;
};
/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const MTimer = ({ id, type, config, elements, onMax }: ComponentType, ref: any) => {
    const [visible, setVisible] = useState(true);
    // 初始化时间为 00:00:00
    const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
    // 控制计时器是否在运行
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [showStartButton, setShowStartButton] = useState<boolean>(true);
    const [showResetButton, setShowResetButton] = useState<boolean>(true);
    const [mStyle,setMStyle] = useState<any>({})

    useEffect(() => {
        if (!isRunning && config.props.isAutoTime) {
            startTimer();
        }
        if (isRunning && !config.props.isAutoTime) {
            pauseTimer();
        }
    }, [config?.props?.isAutoTime]);
    useEffect(() => {
        setShowStartButton(config?.props?.showStartButton);
    }, [config?.props?.showStartButton]);
    useEffect(() => {
        setShowResetButton(config?.props?.showResetButton);
    }, [config?.props?.showResetButton]);

    useEffect(() => {
        const value = typeof config?.props?.initialTime === 'string' ? config?.props?.initialTime : config?.props?.initialTime?.value;
        setTime(parseInitialTime(value));
    }, [config?.props?.initialTime]);

    //统一清理定时器函数
    const clearTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null; // 必须置空！！！
        }
    };
    // 停止定时器
    const stopTimer = () => {
        clearTimer();
        setIsRunning(false);
    };
    // 组件卸载自动清理
    useEffect(() => {
        return () => clearTimer();
    }, []);

    useEffect(() => {
        const value = typeof config.props.maxTime === 'string' ? config.props.maxTime : config.props.maxTime?.value;
        const maxTimeSeconds = parseTimeToSeconds(parseInitialTime(value));
        const timeNum = parseTimeToSeconds(time);
        if (timeNum >= maxTimeSeconds && timerRef.current && maxTimeSeconds !== 0) {
            stopTimer(); // 用统一清理函数
            setTime(parseInitialTime(value));
            setIsRunning(false);
            onMax?.();
        }
    }, [time, config.props.maxTime]);

    // 格式化数字为两位字符串
    const formatTime = (num: number) => num.toString().padStart(2, '0');
    //最大值 是否大于开始值
    const isMaxTimeGreaterThanInitialTime = () => {
        const maxTime = typeof config.props.maxTime === 'string' ? config.props.maxTime : config.props.maxTime?.value;
        const initialTime = typeof config.props.initialTime === 'string' ? config.props.initialTime : config.props.initialTime?.value;
        const maxTimeSeconds = parseTimeToSeconds(parseInitialTime(maxTime));
        const initialTimeSeconds = parseTimeToSeconds(parseInitialTime(initialTime));
        return maxTimeSeconds > initialTimeSeconds || (maxTimeSeconds === 0 && initialTimeSeconds === 0);
    };

    // 开始计时
    const startTimer = () => {
        if (!isRunning && isMaxTimeGreaterThanInitialTime()) {
            clearTimer();
            setIsRunning(true);
            timerRef.current = setInterval(() => {
                setTime((prev) => {
                    let { hours, minutes, seconds } = prev;
                    seconds += 1;
                    if (seconds === 60) {
                        seconds = 0;
                        minutes += 1;
                    }
                    if (minutes === 60) {
                        minutes = 0;
                        hours += 1;
                    }
                    return { hours, minutes, seconds };
                });
            }, 1000);
        }
    };

    const pauseTimer = () => {
        if (isRunning && timerRef.current) {
            clearInterval(timerRef.current);
            setIsRunning(false);
        }
    };

    const resetTimer = () => {
        if (timerRef.current) {
            // 增加非空判断
            clearInterval(timerRef.current);
        }
        setIsRunning(false);
        const initialTime = typeof config.props.initialTime === 'string' ? config.props.initialTime : config.props.initialTime?.value;
        if (initialTime) {
            setTime(parseInitialTime(initialTime));
        } else {
            setTime({ hours: 0, minutes: 0, seconds: 0 });
        }
    };
    // useEffect(() => {
    //     console.log(config.props.initialTime, parseInitialTime(config.props.initialTime));
    // }, [config.props.initialTime]);

    // 组件卸载时清除定时器
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    // 对外暴露方法
    useImperativeHandle(ref, () => {
        return {
            show() {
                setVisible(true);
            },
            hide() {
                setVisible(false);
            },
            start() {
                startTimer();
            },
            pause() {
                pauseTimer();
            },
            reset() {
                resetTimer();
            },
            getCurrentTime() {
                return time;
            },
            setStyle:(style:any)=>{
                setMStyle(style)
            }
        };
    });

    const startTopButton = useMemo(() => {
        return (
            <>
                <Button key={'start'} type={'primary'} size={'small'} className={styles.timeButton} disabled={isRunning} onClick={startTimer}>
                    开始
                </Button>
                <Button key={'top'} type={'primary'} size={'small'} className={styles.timeButton} disabled={!isRunning} onClick={pauseTimer}>
                    暂停
                </Button>
            </>
        );
    }, [isRunning]);

    const timeActionButton = useMemo(() => {
        if (showStartButton || showResetButton) {
            const isReset = !(time.hours + time.minutes + time.seconds);
            return (
                <Space size={12} style={{ marginTop: '12px' }}>
                    {showStartButton && startTopButton}
                    {showResetButton && (
                        <Button key={'reset'} type={'primary'} size={'small'} className={styles.timeButton} disabled={isReset} onClick={resetTimer}>
                            重置
                        </Button>
                    )}
                </Space>
            );
        }

        return null;
    }, [startTopButton, showResetButton, showStartButton, time]);
    return (
        visible && (
            <div
                className={styles.mTimer}
                style={{
                    ...config.style,
                    width: config.style.width ?? '88px',
                    ...mStyle,
                }}
                data-id={id}
                data-type={type}
            >
                {/* 计时器显示区域 */}
                <div style={{ ...config.style }} className={styles.timeContent}>
                    {`${formatTime(time.hours)}:${formatTime(time.minutes)}:${formatTime(time.seconds)}`}
                </div>

                {/* 按钮区域 */}
                {timeActionButton}
            </div>
        )
    );
};
export default memo(forwardRef(MTimer));
