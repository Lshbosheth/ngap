/**
 * 组件配置和属性值
 */
import ColorSet from '../components/ColorSet';
import RadiusSet from '../components/RadiusSet';
export default {
    // 组件属性配置JSON
    attrs: [
        {
            type: 'Title',
            label: '基础属性',
        },
        {
            type: 'Select',
            label: 'x轴字段',
            name: 'xField',
            apiOpt: true,
        },
        {
            type: 'Select',
            label: 'y轴字段',
            name: 'yField',
            apiOpt: true,
        },
        {
            type: 'Switch',
            label: '是否分组',
            name: 'isGroup',
        },
        {
            type: 'Switch',
            label: '是否堆叠',
            name: 'isStack',
        },
        {
            type: 'Input',
            label: '分类字段',
            name: 'seriesField',
        },
        {
            type: 'Switch',
            label: '显示图例',
            name: 'showLegend',
        },
        {
            type: 'InputNumber',
            label: '图表内边距',
            name: 'appendPadding',
        },
        {
            type: 'Title',
            label: '图形样式',
        },
        {
            type: 'Slider',
            label: '宽度占比',
            name: 'columnWidthRatio',
            props: {
                min: 0,
                max: 1,
                step: 0.1,
            },
        },
        {
            type: 'Slider',
            label: '组内间距',
            name: ['dodgePadding'],
        },
        {
            type: 'Slider',
            label: '组外间距',
            name: ['intervalPadding'],
        },
        {
            type: 'function',
            label: '圆角',
            render() {
                return <RadiusSet key="radius" />;
            },
        },
        {
            type: 'ColorPicker',
            label: '填充色',
            name: ['columnStyle', 'fill'],
        },
        {
            type: 'Slider',
            label: '透明度',
            key: 'fillOpacity',
            name: ['columnStyle', 'fillOpacity'],
            props: {
                min: 0,
                max: 1,
                step: 0.1,
            },
        },
        {
            type: 'ColorPicker',
            label: '图形描边',
            name: ['columnStyle', 'stroke'],
        },
        {
            type: 'InputNumber',
            label: '描边宽度',
            name: ['columnStyle', 'lineWidth'],
        },
        {
            type: 'Title',
            label: '标签配置',
        },
        {
            type: 'Select',
            label: '位置',
            name: ['label', 'position'],
            key: 'labelPosition',
            props: {
                options: [
                    { label: '顶部', value: 'top' },
                    { label: '中部', value: 'middle' },
                    { label: '底部', value: 'bottom' },
                ],
            },
        },
        {
            type: 'ColorPicker',
            label: '颜色',
            name: ['label', 'style', 'fill'],
        },
        {
            type: 'Slider',
            label: '透明度',
            key: 'labelOpacity',
            name: ['label', 'style', 'opacity'],
            props: {
                min: 0,
                max: 1,
                step: 0.1,
            },
        },
        {
            type: 'Title',
            label: '图例配置',
        },
        {
            type: 'Select',
            label: '布局',
            name: ['legend', 'layout'],
            props: {
                options: [
                    { label: '水平', value: 'horizontal' },
                    { label: '垂直', value: 'vertical' },
                ],
            },
        },
        {
            type: 'Select',
            label: '位置',
            name: ['legend', 'position'],
            key: 'legendPosition',
            props: {
                allowClear: true,
                options: [
                    { label: '顶部', value: 'top' },
                    { label: '顶部靠左', value: 'top-left' },
                    { label: '顶部靠右', value: 'top-right' },
                    { label: '左侧', value: 'left' },
                    { label: '左侧靠上', value: 'left-top' },
                    { label: '左侧靠下', value: 'left-bottom' },
                    { label: '右侧', value: 'right' },
                    { label: '右侧靠上', value: 'right-top' },
                    { label: '右侧靠下', value: 'right-bottom' },
                    { label: '底部', value: 'bottom' },
                    { label: '底部靠左', value: 'bottom-left' },
                    { label: '底部靠右', value: 'bottom-right' },
                ],
            },
        },
        {
            type: 'Title',
            label: '交互配置',
        },
        {
            type: 'Switch',
            label: '显示差值对比',
            name: 'showDifference',
        },
        {
            type: 'Input',
            label: '当前值展示',
            name: 'currentValueLabel',
        },
        {
            type: 'Input',
            label: '差值对比文本',
            name: 'differenceLabel',
        },
        {
            type: 'ColorPicker',
            label: '正值颜色',
            name: 'positiveColor',
        },
        {
            type: 'ColorPicker',
            label: '负值颜色',
            name: 'negativeColor',
        },
        {
            type: 'Switch',
            label: '显示环比',
            name: 'showMomRate',
        },
        {
            type: 'Input',
            label: '环比文本',
            name: 'momRateLabel',
        },
        {
            type: 'Title',
            label: '对比配置',
        },
        {
            type: 'Switch',
            label: '上个节点对比',
            name: 'showPreviousNodeLine',
        },
        {
            type: 'Select',
            label: '对比线效果',
            name: 'comparisonLineStyle',
            props: {
                options: [
                    { label: '同色虚线', value: 'sameColorDashed' },
                    { label: '同色系浅一色', value: 'lighterColor' },
                ],
            },
        },
        {
            type: 'Title',
            label: '横轴视图配置',
        },
        {
            type: 'Switch',
            label: '启用横轴滑块',
            name: 'enableSlider',
        },
        {
            type: 'Switch',
            label: '启用滚动条',
            name: 'enableScrollbar',
        },
        {
            type: 'InputNumber',
            label: 'X轴标签间隔',
            name: 'xAxisLabelInterval',
            props: {
                placeholder: '留空则显示所有标签',
                min: 1,
            },
        },
        {
            type: 'Title',
            label: '主题配置',
        },
        {
            type: 'Select',
            label: '主题',
            name: 'theme',
            props: {
                options: [
                    { label: '默认', value: 'default' },
                    { label: '暗黑', value: 'dark' },
                ],
            },
        },
        {
            type: 'function',
            label: '图形颜色',
            name: 'color',
            render() {
                return <ColorSet key="ColorSet" />;
            },
        },
    ],
    config: {
        // 组件默认属性值
        props: {
            xField: 'project', // X 轴显示的字段
            yField: ['UV', 'PV'], // Y 轴显示的字段
            columnWidthRatio: 0.6, // 柱子宽度占比
            isGroup: true,
            showLegend: true, // 显示图例
            autoFit: true, // 图表自适应
            appendPadding: 0, // 图表内边距
            dodgePadding: 0, // 组内间距
            intervalPadding: 50, // 组外间距
            title: {
                visible: true,
                text: '多色饼图',
            },
            theme: 'default', // 主题
            color: ['#009af1', '#00d4bc', '#97d60c', '#f8d822', '#ffa034', '#f64541', '#f02ca0', '#9d59fa', '#34cbfe', '#0d89e9'],
            seriesField: 'name', // 分类字段
            isStack: false, // 是否堆叠
            isRange: false, // 是否区间柱状图
            isPercent: false, // 是否堆积百分比柱状图，isPercent 为 true 时，isStack 也需要为 true。
            // 图表文本配置
            label: {
                position: 'middle', // 'top', 'bottom', 'middle'
                style: {
                    fill: '#FFFFFF',
                    opacity: 0.8,
                },
            },
            // 图例配置
            legend: {
                layout: 'horizontal', // horizontal | vertical
                position: 'top-right', //'top', 'top-left', 'top-right', 'left', 'left-top', 'left-bottom', 'right', 'right-top', 'right-bottom', 'bottom', 'bottom-left', 'bottom-right'。
            },
            showDifference: false, // 显示差值对比
            currentValueLabel: '当前值', // 当前值展示
            differenceLabel: '较上个节点', // 差值对比文本
            showMomRate: false, // 显示环比
            momRateLabel: '环比:', // 环比文本
            positiveColor: '#52c41a', // 正值颜色
            negativeColor: '#ff4d4f', // 负值颜色
            showPreviousNodeLine: false, // 显示上个节点对比虚线
            comparisonLineStyle: 'lighterColor', // 对比线效果：同色虚线（默认）/ 同色系浅一色
            enableSlider: false, // 启用横轴滑块
            enableScrollbar: false, // 启用滚动条
            xAxis: {
                label: {
                    autoHide: true,
                    autoRotate: true,
                },
            },
            columnStyle: {
                fillOpacity: 1,
                radius: [0, 0, 0, 0],
            },
            // 图表交互
            interactions: [
                {
                    type: 'element-active',
                },
                {
                    type: 'pie-legend-active',
                },
            ],
        },
        // 组件样式
        style: {},
        // 数据源
        api: {
            sourceType: 'json',
            source: {
                project: ['百度', '字节跳动', '阿里', '微信', 'ngapview'],
                UV: [800, 300, 10000, 5000, 35000],
                PV: [5000, 800, 30000, 7000, 35000],
            },
        },
    },
    // 组件事件
    events: [],
    methods: [
        {
            name: 'update',
            title: '更新数据',
        },
        {
            name: 'updateyField',
            title: '更新Y轴字段',
        },
    ],
};
