import React, { useState, useEffect } from 'react';
import { Spin } from 'antd';
import { message } from '@/utils/AntdGlobal';
import styles from './index.module.less';
import { Column } from '@ant-design/plots';
import type { ColumnConfig } from '@ant-design/plots';
// import { Plot } from '@ant-design/plots';
import ReactEcharts from 'echarts-for-react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import chinaJson from './map/chinaGeoJSON.json';

interface listDataItem {
    appNm: string;
    monthClickNum: number;
    staffNum: number;
}

interface renderListItem {
    name: string;
    value: number;
}

const ElementManagePage: React.FC = () => {
    const [Data1, setData1] = useState({
        name: ['用户信息查询', '业务办理', '业务咨询', '投诉申告', '故障问题反馈', '业务质疑'],
        value: [2375, 1975, 1826, 1632, 1583, 1209],
    });
    const [Data2, setData2] = useState({
        appNum: '375',
        staffNum: '2,375',
        clickNum: '132.2',
        staffCoverage: '32.92',
    });
    const [Data3, setData3] = useState([
        { name: '北京市', value: 65 },
        { name: '天津市', value: 20 },
        { name: '内蒙古自治区', value: 32 },
        { name: '河北省', value: 56 },
        { name: '黑龙江省', value: 34 },
        { name: '辽宁省', value: 24 },
        { name: '吉林省', value: 22 },
        { name: '山东省', value: 59 },
        { name: '河南省', value: 24 },
        { name: '山西省', value: 12 },
        { name: '陕西省', value: 16 },
        { name: '甘肃省', value: 8 },
        { name: '宁夏回族自治区', value: 2 },
        { name: '新疆维吾尔自治区', value: 88 },
        { name: '西藏自治区', value: 73 },
        { name: '云南省', value: 14 },
        { name: '四川省', value: 17 },
        { name: '重庆市', value: 51 },
        { name: '湖北省', value: 63 },
        { name: '湖南省', value: 19 },
        { name: '江苏省', value: 77 },
        { name: '江西省', value: 12 },
        { name: '浙江省', value: 16 },
        { name: '福建省', value: 9 },
        { name: '广东省', value: 37 },
        { name: '广西壮族自治区', value: 87 },
        { name: '贵州省', value: 98 },
        { name: '上海市', value: 25 },
        { name: '海南省', value: 66 },
        { name: '安徽省', value: 11 },
        { name: '青海省', value: 4 },
    ]);
    const [Data5, setData5] = useState([
        { appNm: '查询话费余额', monthClickNum: 132541, staffNum: 9568 },
        { appNm: '查询话费余额', monthClickNum: 98657, staffNum: 8567 },
        { appNm: '查询话费余额', monthClickNum: 23569, staffNum: 10256 },
        { appNm: '查询话费余额', monthClickNum: 58963, staffNum: 5877 },
        { appNm: '查询话费余额', monthClickNum: 88596, staffNum: 3698 },
        { appNm: '查询话费余额', monthClickNum: 45897, staffNum: 2587 },
        { appNm: '查询话费余额', monthClickNum: 658, staffNum: 3879 },
        { appNm: '查询话费余额', monthClickNum: 235698, staffNum: 6988 },
        { appNm: '查询话费余额', monthClickNum: 99864, staffNum: 541 },
        { appNm: '查询话费余额', monthClickNum: 15879, staffNum: 987 },
    ]);
    const data = [
        { x: '用户信息查询', 场景数量: 2375 },
        { x: '业务办理', 场景数量: 1975 },
        { x: '业务咨询', 场景数量: 1826 },
        { x: '投诉申告', 场景数量: 1632 },
        { x: '故障问题反馈', 场景数量: 1583 },
        { x: '业务质疑', 场景数量: 1209 },
    ];
    const config: ColumnConfig = {
        data,
        xField: 'x',
        yField: '场景数量',
        columnWidthRatio: 0.1,
        color: '#26A5EC',
        yAxis: {
            min: 0, // 最小值
            max: 3000, // 最大值
            tickCount: 4, // 刻度数量（包含首尾）
        },
        label: {
            position: 'top',
            offsetY: 10, // 垂直偏移量
            style: {
                fill: '#333',
                fontSize: 14,
                fontWeight: 600,
            },
        },
    };
    const configMap = {
        type: 'choropleth' as const, // 明确声明类型
        map: { name: 'china' }, // 使用注册的地图
        data: Data3, // 数据
        color: ['#0f9960', '#d0e9fa', '#d6e5fd', '#accaff', '#7da7ff', '#3d8dff', '#096dd9'],
        autoFit: true,
        colorField: 'value', // 根据value字段映射颜色
        tooltip: {
            fields: ['province', 'value'],
            showTitle: false,
        },
        geoConfig: {
            label: {
                field: 'name',
                style: {
                    fill: '#fff',
                    opacity: 0.6,
                },
            },
            border: {
                width: 0.5,
                color: 'rgba(230,230,230,0.85)',
            },
        },
    };
    // const [option, setOption] = useState<EChartsOption>({
    //     tooltip: {
    //         trigger: 'axis',
    //         axisPointer: {
    //             type: 'cross',
    //             crossStyle: {
    //                 color: '#999'
    //             }
    //         }
    //     },
    //     grid: {
    //         top: '8',
    //         left: '8',
    //         right: '8',
    //         bottom: '8',
    //         containLabel: true
    //     },
    //     xAxis: {
    //         type: 'category',
    //         data: ['用户信息查询', '业务办理', '业务咨询', '投诉申告', '故障问题反馈', '业务质疑'],
    //         axisLabel:{
    //             interval:0
    //         }
    //     },
    //     yAxis: {
    //         type: 'value',
    //         min:0,
    //         max:3000,
    //         splitNumber:3
    //     },
    //     series: [
    //         {
    //             name: '场景数量',
    //             itemStyle: {
    //                 color: '#26A5EC'
    //             },
    //             barWidth: '10px',
    //             data: [2375, 1975, 1826, 1632, 1583, 1209],
    //             type: 'bar',
    //             label: {
    //                 show: true,
    //                 position: 'top',
    //                 color: '#666',
    //                 fontWeight: 'bold'
    //             }
    //         }
    //     ]
    // });
    // 注册地图（全局注册）
    echarts.registerMap('china', chinaJson as any);
    const [optionMap, setOptionMap] = useState<EChartsOption>({
        tooltip: {
            trigger: 'item',
        },
        visualMap: {
            type: 'piecewise',
            left: 'left',
            top: 'bottom',
            pieces: [{ min: 50 }, { min: 20, max: 50 }, { min: 10, max: 20 }, { min: 5, max: 10 }, { max: 5 }],
            inRange: {
                color: ['#dce8f6', '#b6cff2', '#51a2fb', '#237df5', '#1b52c6'],
            },
            calculable: true,
        },
        series: [
            {
                name: '应用数量',
                type: 'map',
                roam: false, // 可否缩放
                zoom: 1.3,
                layoutCenter: ['52%', '72%'], // 设置地图中心点为容器的中心
                layoutSize: '100%', // 地图大小相对于容器的比例
                map: 'china',
                emphasis: {
                    label: {
                        show: true,
                    },
                },
                data: Data3,
            },
        ],
    });
    const [listData, setListData] = useState<listDataItem[]>([]);
    const [renderList, setRenderList] = useState<renderListItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const initLoad = async () => {
            try {
                setLoading(true);
                // 深拷贝数据作为初始数据
                const listData = JSON.parse(JSON.stringify(Data5));
                // 排序：按月点击量降序排序
                listData.sort((a: any, b: any) => b.monthClickNum - a.monthClickNum);
                setListData(listData);
                // 深拷贝数据，避免修改原始数据
                const listData1 = JSON.parse(JSON.stringify(Data3));
                // 排序
                listData1.sort((a: any, b: any) => b.value - a.value);
                // 取前10条
                const renderList = listData1.slice(0, 10);
                setRenderList(renderList);
            } catch (error) {
                message.error('数据加载失败');
            } finally {
                setLoading(false);
            }
        };
        initLoad();
    }, []);

    // 数值转换方法
    const unitConversion = (num: number) => {
        if (!num) {
            return;
        }
        const resNum = parseFloat((num / 10000).toFixed(2));

        if (resNum >= 1) {
            const formattedNum = resNum.toFixed(1);
            return (
                <div className={styles.nodeValue}>
                    <span className={styles.num}>{formattedNum}</span>
                    <span className={styles.unit}>万</span>
                </div>
            );
        } else {
            const numStr = num.toString();
            let displayNum;
            if (numStr.length > 3) {
                displayNum = numStr[0] + ',' + numStr.slice(1);
            } else {
                displayNum = numStr;
            }
            return (
                <div className={styles.nodeValue}>
                    <span className={styles.num}>{displayNum}</span>
                </div>
            );
        }
    };

    return (
        <div className={styles.appBoardIndexBox}>
            <div className={styles.appBoardIndex}>
                <div className={styles.leftNode}>
                    {/* -- 中心一级 -- */}
                    <div className={styles.first_center_level}>
                        <div className={styles.firstLevelApp}>
                            <div className={styles.top_row}>
                                <h1>中心一级应用上线数量</h1>
                                <span>更多</span>
                            </div>
                            <div className={styles.bottom_row}>
                                {/* <div className={styles.echartDom}></div> */}
                                <div className={styles.echartDom}>
                                    {/* <ReactEcharts
                                        option={option}
                                        style={{ 
                                            width: '100%', 
                                            height: '99%' 
                                            }}
                                    /> */}
                                    <Column {...config} />
                                </div>
                                <div className={`${styles.appUseInfo} ${styles.appUseInfo_first}`}>
                                    <div className={styles.countNode}>
                                        {/* <span className={styles.nodeIcon application_tree}></span> */}
                                        <span className={`${styles.nodeIcon} ${styles.application_tree}`}>
                                            <img src={new URL(`./imgs/application_tree.png`, import.meta.url).href} alt="" />
                                        </span>
                                        <div className={styles.nodeFont}>
                                            <p>应用数</p>
                                            <div className={`${styles.appNum} ${styles.nodeValue}`}>
                                                <span className={styles.num}>{Data2.appNum}</span>
                                                <span className={styles.unit}></span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.countNode}>
                                        {/* <span className={styles.nodeIcon usage}></span> */}
                                        <span className={`${styles.nodeIcon} ${styles.usage}`}>
                                            <img src={new URL(`./imgs/usage.png`, import.meta.url).href} alt="" />
                                        </span>
                                        <div className={styles.nodeFont}>
                                            <p>使用坐席量</p>
                                            <div className={`${styles.staffNum} ${styles.nodeValue}`}>
                                                <span className={styles.num}>{Data2.staffNum}</span>
                                                <span className={styles.unit}></span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.countNode}>
                                        {/* <span className={styles.nodeIcon click_rate}></span> */}
                                        <span className={`${styles.nodeIcon} ${styles.click_rate}`}>
                                            <img src={new URL(`./imgs/click_rate.png`, import.meta.url).href} alt="" />
                                        </span>
                                        <div className={styles.nodeFont}>
                                            <p>点击量</p>
                                            <div className={`${styles.clickNum} ${styles.nodeValue}`}>
                                                <span className={styles.num}>{Data2.clickNum}</span>
                                                <span className={styles.unit}>万</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.countNode}>
                                        {/* <span className={styles.nodeIcon coverage}></span> */}
                                        <span className={`${styles.nodeIcon} ${styles.coverage}`}>
                                            <img src={new URL(`./imgs/coverage.png`, import.meta.url).href} alt="" />
                                        </span>
                                        <div className={styles.nodeFont}>
                                            <p>坐席覆盖率</p>
                                            <div className={`${styles.staffCoverage} ${styles.nodeValue}`}>
                                                <span className={styles.num}>{Data2.staffCoverage}</span>
                                                <span className={styles.unit}>%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* -- 分中心二级 -- */}
                    <div className={styles.second_center_level}>
                        <div className={styles.secondLevelApp}>
                            <div className={styles.top_row}>
                                <h1>分中心二级应用上线数量</h1>
                                <span>更多</span>
                            </div>
                            <div className={styles.bottom_row}>
                                {/* <div className={styles.echartDom}></div> */}
                                <div className={styles.echartDom}>
                                    <ReactEcharts
                                        option={optionMap}
                                        style={{
                                            width: '100%',
                                            height: '99%',
                                        }}
                                    />
                                    {/* <Plot {...configMap} /> */}
                                </div>
                                <div className={styles.appUseInfo}>
                                    <ul className={styles.tableList}>
                                        <li className={styles.table_title}>
                                            <span>序号</span>
                                            <span>省份</span>
                                            <span>应用数</span>
                                        </li>
                                        {renderList?.map((item, index) => (
                                            <li className={styles.table_cont} key={index}>
                                                {/* <span className={`ordinal${index + 1}`}>{index + 1}</span> */}
                                                {(() => {
                                                    if (index === 0)
                                                        return (
                                                            <span className={styles.ordinal1}>
                                                                <img src={new URL(`./imgs/ordinal_1.png`, import.meta.url).href} alt="" />
                                                            </span>
                                                        );
                                                    if (index === 1)
                                                        return (
                                                            <span className={styles.ordinal2}>
                                                                <img src={new URL(`./imgs/ordinal_2.png`, import.meta.url).href} alt="" />
                                                            </span>
                                                        );
                                                    if (index === 2)
                                                        return (
                                                            <span className={styles.ordinal3}>
                                                                <img src={new URL(`./imgs/ordinal_3.png`, import.meta.url).href} alt="" />
                                                            </span>
                                                        );
                                                    return <span className={styles[`ordinal${index + 1}`]}>{index + 1}</span>;
                                                })()}
                                                <span>{item.name}</span>
                                                <span>{item.value}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* -- 热门应用排名 -- */}
                <div className={`${styles.rightNode} ${styles.hot_app_rank}`}>
                    <div className={styles.hotAppRank}>
                        <div className={styles.top_row}>
                            <h1>全国热门应用TOP10</h1>
                        </div>
                        <div className={styles.appTab}>
                            <div className={`${styles.tabName} ${styles.active}`}>一级应用</div>
                            <div className={styles.tabName}>二级应用</div>
                        </div>
                        <div className={styles.appListInfo}>
                            <ul className={styles.listTableHeader}>
                                <li>
                                    <div>排名</div>
                                    <div>应用名称</div>
                                    <div>月点击量</div>
                                    <div>使用坐席量</div>
                                </li>
                            </ul>
                            <ul className={styles.appRankInfo}>
                                {listData?.map((item, index) => (
                                    <li key={index} className={styles.appRankItem}>
                                        {/* <div className={`hot_rank${index + 1}`}>{index + 1}</div> */}
                                        {(() => {
                                            if (index === 0)
                                                return (
                                                    <div className={styles.hot_rank1}>
                                                        <img src={new URL(`./imgs/hot_rank_1.png`, import.meta.url).href} alt="" />
                                                    </div>
                                                );
                                            if (index === 1)
                                                return (
                                                    <div className={styles.hot_rank2}>
                                                        <img src={new URL(`./imgs/hot_rank_2.png`, import.meta.url).href} alt="" />
                                                    </div>
                                                );
                                            if (index === 2)
                                                return (
                                                    <div className={styles.hot_rank3}>
                                                        <img src={new URL(`./imgs/hot_rank_3.png`, import.meta.url).href} alt="" />
                                                    </div>
                                                );
                                            return <div className={styles[`hot_rank${index + 1}`]}>{index + 1}</div>;
                                        })()}
                                        <div className={styles.name_col} title={item.appNm}>
                                            {item.appNm}
                                        </div>
                                        <div className={styles.value_col} title={`${item.monthClickNum}`}>
                                            {unitConversion(item.monthClickNum)}
                                        </div>
                                        <div className={styles.value_col} title={`${item.staffNum}`}>
                                            {unitConversion(item.staffNum)}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ElementManagePage;
