import {useState, useEffect, useRef} from "react";
import * as echarts from 'echarts/core'
import {MapChart} from "echarts/charts";
import chinaJson from './china.json';


import {
    TitleComponent,
    TooltipComponent,
    GeoComponent,
} from 'echarts/components';
import {CanvasRenderer} from 'echarts/renderers';
import './index.less'
import {appTypeArr, ProvProps} from "@/pages/appEffectBoard/params";
import {isEmpty} from "@/utils/util";

// 注册必要的 ECharts 组件
echarts.use([
    TitleComponent,
    TooltipComponent,
    GeoComponent,
    MapChart,
    CanvasRenderer,
]);

interface ChinaHeatMapProps {
    selectedProv?: ProvProps | undefined,
    onMapProvChange: (name: string) => void
    appType: any
    mapData: any[]
}

const ChinaHeatMap = ({selectedProv, onMapProvChange, appType, mapData}: ChinaHeatMapProps) => {
    const chartRef = useRef(null);

    const selected = useRef('')

    const chartInstance = useRef<echarts.ECharts | null>(null)

    const descArr = [
        {color: '#1B52C4',min:500000},
        {color: '#227DF5', min:100001,max:500000},
        {color: '#50A2FA', min:50001,max:100000},
        {color: '#C9DDFB', min:10000,max: 50000},
        {color: '#E9F1FE', max:10000},
    ]

    useEffect(() => {
        chartInstance.current?.setOption(getOption());
    }, [mapData, appType])

    const getAppTypeTitle = () => {
        return appTypeArr.find(item => item.value == appType)?.label
    }

    const getColor = (item: any) => {
        return descArr.find(({min, max}: any) => {
            return (min === undefined || item.visit >= min) && (max === undefined || item.visit <= max)
        })?.color || descArr[descArr.length - 1].color
    }

    // 图表配置项
    const getOption = () => {
        return {
            title: {
                text: `${getAppTypeTitle()}使用情况`,
                left: 'center',
                textStyle: {
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: '#333',
                },
            },
            tooltip: {
                trigger: 'item',
                formatter: (params: { name: string }) => {
                    const item = mapData?.find(d => d.name === params.name);

                    let html = `<div class="tips-wrap">
                            <div class="tips-title">${params.name}</div>`

                    if (appType === '2') {
                        html += `<div class="tips-item-wrap">
                                <div>应用总数</div>
                                <div class="tips-item-content">${item?.count || '--'}</div>
                            </div>`
                    }

                    html += `<div class="tips-item-wrap">
                                <div>应用访问量</div>
                                 <div class="tips-item-content">${item?.visit || '--'}</div>

                            </div>
                            <div class="tips-item-wrap">
                                <div>点赞率</div>
                                 <div class="tips-item-content">${item?.good || '--'}</div>

                            </div>
                            <div class="tips-item-wrap">
                                <div>点踩率</div>
                                <div class="tips-item-content">${item?.bad || '--'}</div>
                            </div>
                            </div>`

                    return html
                },
                textStyle: {
                    color: '#333',
                },
            },
            series: [
                {
                    name: '省份数据',
                    type: 'map',
                    map: 'china',
                    // roam: true, // 允许缩放拖拽
                    zoom: 1.2,
                    itemStyle: {
                        borderColor: '#ACC9FF',
                        borderWidth: 1,
                        areaColor: '#E9F1FE'
                    },
                    // label: {
                    //     show: true,
                    //     color: '#333',
                    //     fontSize: 10,
                    // },
                    emphasis: {
                        label: false,
                        // label: {
                        //     color: '#333',
                        //     fontSize: 12,
                        //     fontWeight: 'bold',
                        // },
                        itemStyle: {
                            areaColor: '#E9F1FE',
                            shadowBlur: 15,
                            shadowColor: 'rgba(0, 0, 0, 0.5)',
                        },
                    },
                    data: mapData?.map(item => ({
                        name: item.name,
                        itemStyle: {
                            areaColor: getColor(item),
                            color: getColor(item),
                        },
                        emphasis: {
                            itemStyle: {
                                areaColor: getColor(item),
                            },
                        },
                    })),
                },
            ],
        };
    };

    // 初始化图表
    useEffect(() => {
        echarts.registerMap('china', chinaJson as any)

        if (!chinaJson || !chartRef.current) return;

        const chartDom = chartRef.current;

        // 获取或初始化 ECharts 实例
        chartInstance.current = echarts.init(chartDom as any, '', {
            renderer: 'canvas',
        });

        chartInstance.current?.setOption(getOption(), true);

        // 窗口自适应
        const handleResize = () => {
            chartInstance.current?.resize();
        };
        const ro = new ResizeObserver(() => {
            handleResize()
        })

        ro.observe(chartDom as any)

        window.addEventListener('resize', handleResize);

        chartInstance.current?.on('click', (params: { name: string }) => {
            if (isEmpty(selected.current) || selected.current !== params.name) {
                selected.current = params.name
            } else {
                selected.current = ''
            }
            onMapProvChange(selected.current)
        })

        return () => {
            window.removeEventListener('resize', handleResize);
            if (chartInstance.current) {
                chartInstance.current?.dispose();
            }
            ro.disconnect()
        };
    }, [chinaJson]);

    useEffect(() => {
        chartInstance.current?.dispatchAction({type: 'mapSelect', seriesIndex: 0, name: selectedProv?.label})
        selected.current = selectedProv?.label || ''
    }, [selectedProv])

    return (
        <div className={'china-map-wrap'}>
            <div
                ref={chartRef}
                className={'china-map'}/>

            <div className={'desc'}>
                <div className={'desc-title'}>访问量</div>
                {descArr.map((item:any) => <div className={'desc-item'}>
                    <div style={{width: 20, height: 10, background: item.color, marginRight: 10}}/>
                    {(item.min && item.max) ? <div>{item.min}-{item.max}</div>:
                    item.min? <div>≥{item.min}</div>:<div>&lt;{item.max}</div>}
                </div>)}
            </div>
        </div>

    );
};

export default ChinaHeatMap
