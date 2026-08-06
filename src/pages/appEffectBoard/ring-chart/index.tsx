import ReactECharts from 'echarts-for-react';


interface RingProgressChartProps{
    percent:number,
    ringColor?:string,
    bgColor?:string,
    ringWidth?:number,
    size?:number
}
const RingProgressChart = ({
                               percent = 75,          // 进度百分比 0-100
                               ringColor = '#1674FF', // 进度环颜色
                               bgColor = '#cce0ff',   // 背景环颜色
                               ringWidth = 20,        // 环的粗细
                               size = 200,            // 整体大小
                           }:RingProgressChartProps) => {
    const option = {
        backgroundColor: 'transparent',
        series: [
            // 背景环
            {
                type: 'pie',
                radius: ['70%', `${70 + ringWidth}%`],
                center: ['50%', '50%'],
                startAngle: 90,
                endAngle: -270,
                silent: true,
                data: [
                    {
                        value: 100,
                        itemStyle: {
                            color: bgColor,
                        },
                    },
                ],
                label: { show: false },
                emphasis: { disabled: true },
            },
            // 进度环
            {
                type: 'pie',
                radius: ['70%', `${70 + ringWidth}%`],
                center: ['50%', '50%'],
                startAngle: 90,
                endAngle: -270,
                clockwise:true,
                data: [
                    {
                        value: percent,
                        itemStyle: {
                            color: ringColor,
                        },
                    },
                    // 空白部分，用来做缺口
                    {
                        value: 100 - percent,
                        itemStyle: {
                            color: 'transparent',
                        },
                    },
                ],
                label: { show: false },
                emphasis: { disabled: true },
            },
        ],
    };

    return (
        <ReactECharts
            option={option}
            style={{ width: size, height: size }}
        />
    );
};

export default RingProgressChart
