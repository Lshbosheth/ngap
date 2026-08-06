import { ComponentType } from './../../types';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState, memo } from 'react';
// import {StaticPlayerInstanceMethods} from '@types/video-react';
import { Player } from 'video-react';
import 'video-react/dist/video-react.css';
import styles from './index.module.less';
import { useAppContext } from '@/utils/AppProvider';
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
const MVideo = ({ id, type, config, elements }: ComponentType, ref: any) => {
    const playerRef = useRef<any>(null);
    const [visible, setVisible] = useState(true);
    const _state = useAppContext();
    const { mode, pageStore } = _state;
    const setElementAlias = pageStore((state: any) => state.setElementAlias);
    const [mStyle,setMStyle] = useState<any>({})

    useEffect(() => {
        setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
    }, [config.props.elementAlias]);

    // 对外暴露方法
    useImperativeHandle(ref, () => {
        return {
            show() {
                setVisible(true);
            },
            hide() {
                setVisible(false);
            },
            setPlaybackRate(rate: number) {
                if (playerRef.current) {
                    const validRate = Math.max(0.5, Math.min(2, rate));
                    playerRef.current.playbackRate = validRate;
                }
            },
            setVoluem(volume: number) {
                if (playerRef.current) {
                    const MIN_VOLUME = 0;
                    const MAX_VOLUME = 1;
                    const validVolume = Math.max(MIN_VOLUME, Math.min(MAX_VOLUME, volume));

                    playerRef.current.volume = validVolume;
                }
            },
            play() {
                if (playerRef.current) {
                    playerRef.current.play();
                }
            },
            pause() {
                if (playerRef.current) {
                    playerRef.current.pause();
                }
            },
            load() {
                if (playerRef.current) {
                    playerRef.current.load();
                }
            },
            setStyle:(style:any)=>{
                setMStyle(style)
            }
        };
    });

    return (
        visible && (
            <div
                className={styles.Video}
                style={{
                    // width: '400px',
                    ...config.style,
                    ...mStyle
                }}
                data-id={id}
                data-type={type}
            >
                <Player
                    playsInline
                    ref={playerRef}
                    src={config?.props?.src}
                    poster={config?.props?.poster}
                    preload={config?.props?.preload}
                    muted={config?.props?.muted}
                    autoPlay={config?.props?.autoPlay}
                    startTime={config?.props?.startTime}
                />
            </div>
        )
    );
};
export default memo(forwardRef(MVideo));
