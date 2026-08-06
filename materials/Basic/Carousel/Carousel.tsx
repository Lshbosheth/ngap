import { useState, useImperativeHandle, forwardRef, memo, CSSProperties, ForwardedRef, useMemo } from 'react';
import { Carousel } from 'antd';
import { ComponentType } from './../../types';
import { handleApi } from './../../utils/handleApi';
import { usePageStore } from '@materials/stores/pageStore';
import './carousel.less';
import { debounce, isEmpty, omit } from 'lodash-es';
import { useDeepCompareEffect } from 'ahooks';
import { useWatchVariable } from '@materials/utils/useWatchVariable';

interface RefConfig {
    show: () => void;
    hide: () => void;
    setStyle: (style: CSSProperties) => void;
}

/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const MCarousel = ({ id, type, config }: ComponentType, ref: ForwardedRef<RefConfig>) => {
    const [data, setData] = useState<any[]>([]);
    const [visible, setVisible] = useState(true);
    const [mStyle, setMStyle] = useState<CSSProperties>({});
    const variableData = usePageStore((state) => state?.page?.pageData?.variableData || {});

    useDeepCompareEffect(() => {
        getDataList();
    }, [config?.api]);

    const getDataList = debounce(
        (params: any = {}) => {
            if (isEmpty(config?.api)) return;
            handleApi(config.api, params).then((res) => {
                if (res?.code !== 0) return;
                if (Array.isArray(res.data)) {
                    setData(res.data);
                } else {
                    setData([]);
                    console.error('[轮播]数据格式错误');
                }
            });
        },
        300,
        { trailing: true, leading: true },
    );
    useWatchVariable({
        apiVariable: config.api,
        variableData,
        variablePrefix: 'context.variable.',
        callback: getDataList,
    });
    // 对外暴露方法
    useImperativeHandle(ref, () => {
        return {
            show() {
                setVisible(true);
            },
            hide() {
                setVisible(false);
            },
            setStyle: (style: CSSProperties) => {
                setMStyle(style);
            },
        };
    });

    const desStyle: CSSProperties = useMemo(() => {
        return {
            fontSize: config.style.fontSize,
            lineHeight: config.style.lineHeight,
            color: config.style.color,
            textAlign: config.style.textAlign,
        };
    }, [config.style]);

    return (
        visible && (
            <div>
                <Carousel style={{ ...mStyle }} data-id={id} data-type={type} {...config.props}>
                    {data.map((item) => {
                        return config.props.showtype === 'onlydesc' ? (
                            <div key={item.id} className="slide-div">
                                <div className="desc-div" style={desStyle}>
                                    {item.desc}
                                </div>
                            </div>
                        ) : config.props.showtype === 'onlypic' ? (
                            <div key={item.id} className="slide-div">
                                <img src={item.picUrl} alt="" />
                            </div>
                        ) : config.props.showtype === 'showall' ? (
                            <div key={item.id} className="slide-div">
                                <div className="desc-div">{item.desc}</div>
                                <img src={item.picUrl} alt="" />
                            </div>
                        ) : (
                            <></>
                        );
                    })}
                </Carousel>
            </div>
        )
    );
};
export default memo(forwardRef(MCarousel));
