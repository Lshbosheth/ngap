import { ComponentType } from '@materials/types';
import { forwardRef, useEffect, useImperativeHandle, useState, memo, useRef, useMemo, ForwardedRef, CSSProperties } from 'react';
import { handleApi } from './../../utils/handleApi';
import { Spin } from 'antd';
import { usePageStore } from '@materials/stores/pageStore';
import { useShallow } from 'zustand/react/shallow';
import * as echarts from 'echarts';
import { useDeepCompareEffect } from 'ahooks';
import { debounce, isEmpty } from 'lodash-es';
import { useWatchVariable } from '@materials/utils/useWatchVariable';

interface RefConfig {
    show: () => void;
    hide: () => void;
    update: (params?: Record<string, any>) => void;
    setStyle: (style: CSSProperties) => void;
}

/**
 *
 * @param config 组件配置属性值
 * @param props 系统属性值：componentid、componentname等
 * @returns 返回组件
 */
const MapChart = ({ id, type, config }: ComponentType, ref: ForwardedRef<RefConfig>) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(true);
    const [mStyle, setMStyle] = useState<CSSProperties>({});
    const { variableData, formData } = usePageStore(
        useShallow((state: any) => ({
            formData: state.page.pageData.formData || {},
            variableData: state?.page?.pageData?.variableData || {},
        })),
    );

    useDeepCompareEffect(() => {
        getDataList();
    }, [config.api]);

    const getDataList = debounce(
        (params: Record<string, any> = {}) => {
            if (isEmpty(config?.api)) {
                setLoading(false);
                return;
            }
            setLoading(true);
            handleApi(config.api, params)
                .then((res) => {
                    if (res?.code !== 0) return;
                    if (Array.isArray(res.data)) {
                        setData(res.data);
                    } else {
                        setData([]);
                        console.error('[MapChart]数据格式错误');
                    }
                })
                .finally(() => {
                    setLoading(false);
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
    useWatchVariable({
        apiVariable: config.api,
        variableData: formData,
        variablePrefix: 'context.Form_',
        callback: getDataList,
    });
    useImperativeHandle(ref, () => {
        return {
            show() {
                setVisible(true);
            },
            hide() {
                setVisible(false);
            },
            update: (params?: Record<string, any>) => {
                getDataList(params);
            },
            setStyle: (style: CSSProperties) => {
                setMStyle(style);
            },
        };
    });

    const mapDomRef = useRef(null);
    const [chinaJsonLoaded, setChinaJsonLoaded] = useState(false);
    useEffect(() => {
        (async () => {
            try {
                const chinaJson = await import('./mapJson/chinaGeoJSON.json');
                echarts.registerMap('china', chinaJson.default as any);
                setChinaJsonLoaded(true);
            } catch (error) {
                console.error('加载中国地图失败:', error);
                setChinaJsonLoaded(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (!chinaJsonLoaded) return;
        const chartInstance: any = echarts.init(mapDomRef.current);
        const handleResize = () => {
            chartInstance?.resize();
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            chartInstance.dispose();
        };
    }, [chinaJsonLoaded]);

    useEffect(() => {
        if (!chinaJsonLoaded) return;
        createChart();
    }, [config.props, data, chinaJsonLoaded]);

    const createChart = () => {
        const chartInstance = echarts.getInstanceByDom(mapDomRef.current as any);
        const { theme, title, geo, tooltip } = config.props;
        const option: any = {
            title,
            color: ['#9d5cff', '#FFAB3E', '#FADB1E', '#9ADB19', '#28C084', '#3CA2FF', '#1861EB', '#A24CF5', '#F32AA3', '#F11818'],
            backgroundColor: theme == 'dark' ? '#141414' : 'white',
            geo: {
                map: 'china',
                show: false,
            },
            tooltip: {
                trigger: 'item',
                ...tooltip,
            },
            visualMap: {
                min: 0,
                max: Math.max(...config.api.source.map((item: { name: string; value: string }) => Number(item.value) || 0)),
                left: 'left',
                top: 'bottom',
                inRange: {
                    color: ['#005dd0', '#0177fb', '#389fff', '#9ac9fa', '#dceeff'],
                },
                calculable: true,
                itemWidth: 15,
                itemHeight: 100,
                textStyle: {
                    fontSize: 12,
                    color: '#333',
                },
            },
            series: [
                {
                    name: '省份人口',
                    type: 'map',
                    map: 'china',
                    roam: true,
                    label: {
                        show: true,
                        fontSize: 12,
                    },
                    ...geo,
                    data: data,
                    itemStyle: {
                        normal: geo.itemStyle,
                        emphasis: {
                            areaColor: '#1be8d7',
                        },
                    },
                },
            ],
        };
        chartInstance?.setOption({ ...option });
    };

    return (
        visible && (
            <Spin spinning={loading} size="large" wrapperClassName="spin-loading">
                <div ref={mapDomRef} data-id={id} data-type={type} style={{ ...config.style, ...mStyle }}></div>
            </Spin>
        )
    );
};
export default memo(forwardRef(MapChart));
