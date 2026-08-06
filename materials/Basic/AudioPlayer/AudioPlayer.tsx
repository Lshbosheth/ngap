import { ComponentType } from '@materials/types';
import { useState, useImperativeHandle, forwardRef, useMemo, useEffect, useRef, useCallback, memo } from 'react';
import 'soundmanager2';
import styles from './index.module.less';
/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const generateRandomKey = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        key += chars.charAt(randomIndex);
    }
    return key;
};
const AudioPlayer = ({id, type, config, onPlay, onPause, onResume, onFinish, onLoad, onStop, onWhileplaying }: ComponentType, ref: any) => {
    // const id = generateRandomKey();
    // let playbackRate: number = 1;//播放倍速
    let hoverTop: number = 0;
    let url: string = ''; //音频地址
    let textEndTime: number = -1; //文字最后一行的时间
    let time: number = 0; //当前播放时间
    let wavePlayPointRef: HTMLDivElement | null = null;
    const setWavePlayPointRef = (element: HTMLDivElement | null) => {
        wavePlayPointRef = element;
    };
    let wavePlayRef: HTMLDivElement | null = null;
    const setWavePlayRef = (element: HTMLDivElement | null) => {
        wavePlayRef = element;
    };
    let waveData: Array<number | string> = [];

    const divRef = useRef<HTMLDivElement>(null);
    const [divWidth, setDivWidth] = useState(0);

    const [visible, setVisible] = useState(true);
    const [play_seek, setPlaySeek] = useState(0);
    const [loaded, setLoaded] = useState(false);
    const [volume, setVolume] = useState(100);
    const [current, setCurrent] = useState(0);
    const [duration, setDuration] = useState(0);
    const [muted, setMuted] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [rate, setRate] = useState<number>(1); // 播放倍速
    const [pivot, setPivot] = useState(-1);
    const [textListTop, setTextListTop] = useState(0);
    const [textList, setTextList] = useState<Array<[number, string]>>([]); //歌词
    const audioRef = useRef<any>(null); // 播放器实例
    const playerId = useRef('player_' + new Date().getTime());
    const pivotIrics = useRef<number>(-1);
    const textData = useRef<string>('');
    const [isShow, setIsShow] = useState(true);
    const step = useRef(0.5);
    const [maxSize, setMaxSize] = useState(4);
    const textListRef = useRef(textList);
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

    const cleanSoundmanager = useCallback(() => {
        console.log('执行音频清理');
        if (!audioRef.current || !audioRef.current?.player) return;
        // if (!audioRef.current?.player?.ok()) {
        //     console.warn('SoundManager 未就绪');
        //     return;
        // }
        try {
            const player = soundManager.getSoundById(playerId.current);
            if (player) {
                // 先停止播放
                try {
                    player.stop();
                    player.pause();
                } catch (e) {
                    // 忽略停止错误
                }

                // 延迟销毁
                setTimeout(() => {
                    try {
                        soundManager.destroySound(playerId.current);
                    } catch (error) {
                        console.warn('销毁声音失败:', error);
                    }
                }, 0);
            }
        } catch (error) {
            console.error('清理音频时出错:', error);
        } finally {
            audioRef.current = null;
        }
    }, []);
    useEffect(() => {
        textListRef.current = textList;
    }, [textList]);

    useEffect(() => {
        initSMS();
        return () => {
            console.log('----------组件卸载----');
            if (audioRef.current) {
                cleanSoundmanager();
            }
        };
    }, [cleanSoundmanager]);

    useEffect(() => {
        const data = (config?.props?.wave && config?.props?.wave?.data) || '';
        if (data) {
            try {
                waveData = JSON.parse(data);
            } catch (error) {
                console.error('JSON 解析失败:', error);
                waveData = [];
            }
            setWave();
        }
    }, [config?.props?.wave?.data, divWidth]);
    useEffect(() => {
        setWave();
    }, [config?.props?.wave?.height, config?.props?.wave?.width]);

    useEffect(() => {
        textData.current = (config?.props?.texts && config?.props?.texts?.text) || '';
        parseLyric();
    }, [config?.props?.texts?.text, config?.props?.texts?.height]);

    useEffect(() => {
        setIsShow(config?.props?.speed?.isShow);
    }, [config?.props?.speed?.isShow]);

    useEffect(() => {
        if (config.props.speed.step) {
            step.current = Number(config?.props?.speed?.step);
        }
    }, [config?.props?.speed?.step]);

    useEffect(() => {
        if (config.props.speed.maxSize) {
            setMaxSize(Number(config?.props?.speed?.maxSize));
        }
    }, [config?.props?.speed?.maxSize]);
    useEffect(() => {
        if (!visible || !divRef.current) return;

        // 获取宽度（两种方式，按需选择）
        const getWidth = () => {
            const offsetWidth = divRef.current?.offsetWidth ?? 460;

            console.log('offsetWidth:', offsetWidth);

            setDivWidth(offsetWidth); // 通常用 offsetWidth 更直观
        };

        getWidth();

        // 可选：监听窗口 resize，实时更新宽度
        window.addEventListener('resize', getWidth);
        return () => window.removeEventListener('resize', getWidth);
    }, [visible, config.style]);

    useEffect(() => {
        url = config.props.resUrl;
        // 如果 URL 变化，需要重新创建播放器
        if (url && url !== audioRef.current?.url) {
            // 清理旧的
            cleanSoundmanager();

            // 创建新的
            initPlayer();
        } else {
            console.error('请配置音频');
        }
    }, [config.props.resUrl, cleanSoundmanager]);

    const initSMS = () => {
        const swfUrl = config.props.swfUrl;
        const SMScfg: { [key: string]: any } = {};
        if (swfUrl) {
            SMScfg.url = swfUrl;
        } else {
            SMScfg.url = '/';
        }
        const ready: Function = SMScfg.onready ? SMScfg.onready : null;
        SMScfg.onready = () => {
            if (typeof ready === 'function') {
                ready();
            }
            initPlayer();
        };
        SMScfg.ontimeout = (status: any) => {
            if (status.error && status.error.type === 'flash') {
                // Flash 加载失败，但可能 HTML5 可用
                console.log('Flash 不可用，回退到纯 HTML5');
                // 可以在这里创建声音对象
                initPlayer();
            }
        };
        soundManager.setup(SMScfg);
    };

    //初始化波形图
    const waveInit = () => {
        //波形图扩展方法
        const { wave } = config.props;
        if (!wave.data) {
            return null;
        }
        const width = divWidth ? divWidth : 460;
        const height = wave.height ? (typeof wave.height === 'number' ? wave.height : parseFloat(wave.height)) : 150;
        return (
            <div className={`${styles.jpWaveBox} ${wave.className || ''}`} style={{ height: height + 'px' }}>
                <div className={styles.jpWavePlayCover} onClick={clickPlay_seek}></div>
                <div className={styles.jpWavePlayBar} style={{ width: play_seek + '%' }}>
                    <div className={styles.jpWavePlayBarPoint} ref={setWavePlayPointRef} style={{ width: divWidth + 'px' }}></div>
                </div>
                <div className={styles.jpWaveBar} ref={setWavePlayRef}></div>
            </div>
        );
    };
    const setWave = () => {
        // console.log("改变波形");
        const { wave } = config.props;
        if (waveData.length === 0 || !wave) {
            return;
        }
        const waveStep = Math.ceil(waveData.length / 1000); //从数组中取值的间隔。
        const waveWidth = divWidth ? divWidth : 460;
        const width = (waveWidth / (waveData.length + 1)) * waveStep; //单条波形的宽度。
        let waveList = `<div class="${styles.jpWavePl} ${styles.jpWavePlOne}" style="width:${width}px;"></div>`; //生成一个100%高度的波形撑起高度。
        let maxDataValue = 100; //数组中数字的最大值。
        const newData: number[] = []; //处理后的数组。
        for (let i = 0; i < waveData.length; i++) {
            if (i % waveStep !== 0) {
                continue;
            }
            const vawe = typeof waveData[i] === 'number' ? (waveData[i] as number) : parseInt(waveData[i] as string);
            const absData = Math.abs(vawe);
            maxDataValue = Math.max(maxDataValue, absData);
            newData.push(absData);
        }
        const ratio = 100 / maxDataValue; //缩小数组中数值的比例。
        for (let i = 0; i < newData.length; i++) {
            const height = newData[i] * ratio; //单条波形的高度
            waveList += `<div class="${styles.jpWavePl}" style="width:${width}px;height:${height}%;"></div>`;
        }
        if (wavePlayPointRef && wavePlayRef) {
            wavePlayPointRef.innerHTML = waveList;
            wavePlayRef.innerHTML = waveList;
        }
    };

    // 解析歌词
    var parseLyric = () => {
        const { texts } = config.props;
        if (!texts || !textData.current) {
            return;
        }

        const textListNew: Array<[number, string]> = [];
        const regex_time = /\[\d*:\d*((\.|\:)\d*)*\]/g,
            regex_space = /(^\s*)|(\s*$)/g;
        const _texts = textData.current.split('\n');
        const height = texts.height ? (typeof texts.height === 'number' ? texts.height : parseFloat(texts.height)) : 300;
        let times: any;
        for (let i = 0; i < _texts.length; i++) {
            const lyric = _texts[i].replace(regex_space, ''); //过滤两边空格
            const timeRegExpArr = lyric.match(regex_time); //时间轴
            if (timeRegExpArr) {
                times = timeRegExpArr[0];
                const text = lyric.replace(regex_time, '');
                const min = parseFloat(times.match(/\[\d*/i)[0].slice(1));
                const sec = parseFloat(times.match(/\:\d*/i)[0].slice(1));
                const msec = parseFloat(times.match(/(\.|\:)\d*\]/i)[0].slice(1));
                const time = min * 60 + sec + msec / 100;
                textListNew.push([time, text]);
            }
        }
        hoverTop = height * 0.382 - 11; //当前行距离父节点的高度 采取黄金比例。
        // textEndTime = textListNew[textListNew.length - 1][0]||-1;//文字最后一行的时间
        textEndTime = (textList && textList[textList.length - 1] && textList[textList.length - 1][0]) || -1;
        setTextList(textListNew);
    };
    //初始化歌词
    const textInit = () => {
        const { texts } = config.props;
        if (!texts.text) {
            return null;
        }
        const height = texts.height ? (typeof texts.height === 'number' ? texts.height : parseFloat(texts.height)) : 300;
        return (
            <div className={styles.jpTextContent} style={{ height }}>
                <div className={`${styles.jpTextContentShade} ${styles.jpTextContentShadeTop}`}></div>
                <ul className={styles.jpJplayerTextList} style={{ top: -textListTop + 'px' }}>
                    <li className={styles.jpJplayerTextItem}>&nbsp;</li>
                    {textList.map((item, index) => {
                        return (
                            <li className={`${styles.jpJplayerTextItem} ${pivot === index ? styles.jpTextHover : ''}`} key={index}>
                                &nbsp;{item[1]}&nbsp;
                            </li>
                        );
                    })}
                    <li className={styles.jpJplayerTextItem}>&nbsp;</li>
                </ul>
                <div className={`${styles.jpTextContentShade} ${styles.jpTextContentShadeBottom}`}></div>
            </div>
        );
    };

    const getPlaying = () => {
        if (audioRef.current?.player?.playState === 1 && !audioRef.current?.player?.paused) {
            return true;
        }
        return false;
    };

    const initPlayer = () => {
        //初始化player
        if (audioRef.current?.player) {
            return;
        }
        playerId.current = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const soundcfg: soundmanager.SoundProperties = {
            id: playerId.current,
            url,
        };
        soundcfg.onplay = onplay;
        soundcfg.onpause = onpause;
        soundcfg.onresume = onresume;
        soundcfg.onfinish = onfinish;
        soundcfg.onload = onload;
        soundcfg.onstop = onstop;
        soundcfg.whileplaying = whileplaying;
        const player = soundManager.createSound(soundcfg);
        // if (getPlayer) {
        //     getPlayer(playerS, soundManager);
        // }
        audioRef.current = {
            player,
            url,
            id: playerId.current,
        };
    };

    const whileplaying = () => {
        console.log('播放中。。。');
        set_seek_bar();
        if (onWhileplaying) {
            onWhileplaying();
        }
    };

    const set_seek_bar = () => {
        // const { texts } = config.props;
        if (textData.current) {
            updateLyric(audioRef.current?.player?.position / 1000);
        }
        mySetState();
    };

    // 文本滚动更新，获取当前行
    const updateLyric = (duration: number) => {
        const currentTextList = textListRef.current;

        if (!currentTextList || currentTextList.length === 0) return;
        if (duration <= 0 || duration < currentTextList[0][0]) {
            return;
        }

        let left = 0;
        let right = currentTextList.length - 1;
        let pivotNew = 0; // 初始化为0，在循环中更新
        // 标准二分查找实现
        while (left <= right) {
            pivotNew = Math.floor((left + right) / 2); // 标准中点计算
            if (currentTextList[pivotNew][0] <= duration) {
                // 当前行开始时间 <= 播放时间，尝试找更靠后的行
                left = pivotNew + 1;
            } else {
                // 当前行开始时间 > 播放时间，向前找
                right = pivotNew - 1;
            }
        }

        // 循环结束后，right 就是最后一个满足 currentTextList[i][0] <= duration 的索引
        pivotNew = right;

        // 处理边界：如果播放时间超过最后一行，pivotNew 不能小于0
        pivotNew = Math.max(0, Math.min(pivotNew, currentTextList.length - 1));

        if (pivotNew === pivotIrics.current) {
            return;
        }

        setPivot(pivotNew);
        pivotIrics.current = pivotNew;
        jumpPivot(pivotNew);
    };
    const jumpPivot = (pivot: number) => {
        const beasDom: HTMLDivElement | null = document.querySelector('#jp-jplayer-' + id);
        const hover: NodeListOf<HTMLDivElement> | [] = beasDom ? beasDom.querySelectorAll('.' + styles.jpJplayerTextItem) : [];

        if (hover.length === 0) {
            return;
        }
        const nowHoverTop = hover[pivot].offsetTop;
        let top = 0;
        if (nowHoverTop > hoverTop) {
            top = nowHoverTop - hoverTop;
        }
        setTextListTop(top);
    };

    // 设置状态的总方法
    const mySetState = () => {
        const play_seek = Math.round((audioRef.current?.player?.position / audioRef.current?.player?.duration) * 10000) / 100;
        setPlaySeek(play_seek);
        setCurrent(audioRef.current?.player?.position);
        setVolume(audioRef.current?.player?.volume || 100);
        setDuration(audioRef.current?.player?.duration);
        setMuted(audioRef.current?.player?.muted);
        setPlaying(getPlaying());
        // setRate(playbackRate)
    };
    const onplay = () => {
        // console.log('播放');
        mySetState();
        if (onPlay) {
            onPlay();
        }
    };
    const onpause = () => {
        // console.log('暂停')
        mySetState();
        if (onPause) {
            onPause();
        }
    };
    const onresume = () => {
        // console.log('暂停后重新播放')
        mySetState();
        if (onResume) {
            onResume();
        }
    };
    const onfinish = () => {
        mySetState();
        if (onFinish) {
            onFinish();
        }
    };
    const onload = () => {
        setPlaySeek(0);
        setCurrent(0);
        setPivot(-1);
        setTextListTop(0);
        setLoaded(audioRef.current?.player?.loaded);
        setDuration(audioRef.current?.player?.duration);
        if (onLoad) {
            onLoad();
        }
    };
    const onstop = () => {
        setTextListTop(0);
        setPlaySeek(0);
        setCurrent(0);
        setPlaying(false);
        setPivot(-1);
        if (onStop) {
            onStop();
        }
    };

    const clickMute = () => {
        audioRef.current?.player?.toggleMute();
    };

    const clickVolume_max = () => {
        audioRef.current?.player?.unmute();
        audioRef.current?.player?.setVolume(100);
    };

    const clickVolume_seek = (e: any) => {
        const ratio = Math.round(((e.clientX - e.currentTarget.getBoundingClientRect().left) / e.currentTarget.offsetWidth) * 100);
        audioRef.current?.player?.unmute();
        audioRef.current?.player?.setVolume(ratio);
    };

    const clickPlay = () => {
        audioRef.current?.player?.togglePause();
    };

    const clickRate_add = () => {
        const playbackRate = Math.min(rate + step.current, maxSize);
        audioRef.current?.player?.setPlaybackRate(playbackRate);
        setRate(playbackRate);
    };

    const clickRate_sub = () => {
        const playbackRate = Math.max(rate - step.current, 0.5);
        audioRef.current?.player?.setPlaybackRate(playbackRate);
        setRate(playbackRate);
    };
    const clickStop = () => {
        audioRef.current?.player?.stop();
    };
    const clickPlay_seek = (e: any) => {
        const ratio = Math.round(((e.clientX - e.currentTarget.getBoundingClientRect().left) / e.currentTarget.offsetWidth) * 1000) / 1000;
        time = ratio * audioRef.current?.player?.duration;
        audioRef.current?.player?.setPosition(time);
        if (!getPlaying()) {
            audioRef.current?.player?.play();
        }
    };
    const sec_to_time = (time: number) => {
        const s: number = Math.round(time / 1000);
        let t = '';
        const min = Math.floor(s / 60) % 60;
        const sec = s % 60;
        const hour = Math.floor(s / 3600);

        if (hour < 10) {
            t += '0';
        }
        t += hour + ':';
        if (min < 10) {
            t += '0';
        }
        t += min + ':';
        if (sec < 10) {
            t += '0';
        }
        t += sec;
        return t;
    };
  useEffect(() => {
    const dom = divRef.current;
    if (!dom) return;

    if (config?.props?.texts?.text && config.props.texts.text.length > 1) {
      dom.style.minHeight = '345px';
    } else {
      dom.style.minHeight = '40px';
    }
  }, [config.props.text]);
    return (
        visible && (
            <div
                ref={divRef} // 绑定 ref
                id={'jp-jplayer-' + id}
                data-id={id} data-type={type}
                className={`${styles.snVoice} ${styles.jpAudio} ${playing ? styles.jpStatePlaying : ''} ${muted ? styles.jpStateMuted : ''}`}
                // style={{ width: isShow ? '460px' : '362px' }}
                style={{
                    ...config.style,
                    width: config.style.width ?? '460px',
                    ...mStyle
                }}
            >
                <div className={styles.jpTypeSingle}>
                    <div className={`${styles.jpGui} ${styles.jpInterface}`}>
                        <div className={`${styles.jpVolumeControls}`}>
                            <button className={`${styles.jpMute} ${styles.FlatTonyBackgroundForJplayer}`} onClick={clickMute}>
                                mute
                            </button>
                            <button className={`${styles.jpVolumeMax} ${styles.FlatTonyBackgroundForJplayer}`} onClick={clickVolume_max}>
                                max volume
                            </button>
                            <div className={`${styles.jpVolumeBar} ${styles.FlatTonyBackgroundForJplayer}`} onClick={clickVolume_seek}>
                                <div
                                    className={`${styles.jpVolumeBarValue} ${styles.FlatTonyBackgroundForJplayer}`}
                                    style={{ width: `${volume}%` }}
                                ></div>
                            </div>
                        </div>
                        {isShow ? (
                            <>
                                <div className={`${styles.jpRateBox}`}>
                                    <button
                                        className={`${styles.jpRateAdd} ${styles.jpRateBg}`}
                                        onClick={clickRate_add}
                                        disabled={rate === maxSize}
                                    ></button>
                                    <div className={`${styles.jpNowRate}`}>
                                        <span className={`${styles.jpNowRateSpan}`}>{rate % 1 === 0 ? rate + '.0' : rate}</span>
                                        <span className={`${styles.jpNowRateSml}`}>×</span>
                                    </div>
                                    <button
                                        className={`${styles.jpRateSub} ${styles.jpRateBg}`}
                                        onClick={clickRate_sub}
                                        disabled={rate <= 0.5}
                                    ></button>
                                </div>
                                <div className={`${styles.jpRateBoxSpace}`}></div>
                            </>
                        ) : (
                            ''
                        )}

                        <div className={`${styles.jpControlsHolder}`}>
                            <div className={`${styles.jpControls}`}>
                                <button className={`${styles.jpPlay} ${styles.FlatTonyBackgroundForJplayer}`} onClick={clickPlay}>
                                    play
                                </button>
                                <div className={`${styles.jpSpace} ${styles.FlatTonyBackgroundForJplayer}`}></div>
                                <button className={`${styles.jpStop} ${styles.FlatTonyBackgroundForJplayer}`} onClick={clickStop}>
                                    stop
                                </button>
                            </div>
                            <div className={`${styles.jpProgress} ${styles.FlatTonyBackgroundForJplayer}`}>
                                <div
                                    className={`${styles.jpSeekBar} ${styles.FlatTonyBackgroundForJplayer}`}
                                    style={{ width: `${loaded ? 100 : 0}%` }}
                                    onClick={clickPlay_seek}
                                >
                                    <div
                                        className={`${styles.jpPlayBar} ${styles.FlatTonyBackgroundForJplayer}`}
                                        style={{ width: `${play_seek}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className={`${styles.jpTimeBox}`}>
                                <div className={`${styles.jpCurrentTime}`}>{sec_to_time(current || 0)}</div>
                                <div className={`${styles.jpTimeSpace}`}>/</div>
                                <div className={`${styles.jpDuration}`}>{sec_to_time(duration || 0)}</div>
                            </div>
                        </div>
                    </div>
                </div>
                {waveInit()}
                {textInit()}
            </div>
        )
    );
};
export default memo(forwardRef(AudioPlayer));
