import ReactECharts from 'echarts-for-react';

interface SingleBarChartProps{
    data:any[],
    color:string,
    height?:number,
    rate?:boolean
}

// 封装：单个水平柱状图组件
const SingleBarChart = ({data, color, rate,height = 500}:SingleBarChartProps) => {

    const getX = (item:any)=>{
        if (rate && typeof item.value === 'string' && item.value.includes('%')){
            item.value = item.value.replace('%','')
        }
        return item.value
    }


    const yData = data.map(item => item.label)
    const xData = data.map(item => getX(item))

    const option = {
        backgroundColor: '#ffffff',
        tooltip: {
            trigger: "axis",
            formatter: `{b}：{c}${rate ? "%" : ""}`,  //  {b}=名称  {c}=数值
            backgroundColor: "#E9F1FE",
            textStyle: { color: "#333" },
            padding: [6, 10],
            borderWidth: 0,
            axisPointer: {
                type: "none"
            }
        },
        grid: {left: '120px', right: '10%', top: 10, bottom: 10},
        xAxis: {type: 'value', show: false},
        yAxis: {
            type: 'category',
            data: yData,
            inverse: true,
            axisLine: {show: false},
            axisTick: {show: false},
            axisLabel: {
                color: '#333',
                fontSize: 14,
                align: 'right',
                width: 110,
                overflow: 'truncate',
                ellipsis:'...',
                margin:8,
            },
        },
        series: [
            {
                type: 'bar',
                data: xData,
                barWidth: 12,
                itemStyle: {color}, // 每个图传不同颜色
            },
        ],
    };

    return (
        <ReactECharts
            option={option}
            style={{width: '100%', height: height}}
        />
    );
};

export default SingleBarChart
