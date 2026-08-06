/**
 * 组件配置和属性值
 */
import ColorSet from '../components/ColorSet';
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
            type: 'Switch',
            label: '平滑曲线',
            name: 'smooth',
        },
        {
            type: 'ColorPicker',
            label: '填充色',
            name: ['lineStyle', 'fill'],
        },
        {
            type: 'Slider',
            label: '透明度',
            name: ['lineStyle', 'fillOpacity'],
            props: {
                min: 0,
                max: 1,
                step: 0.1,
            },
        },
        {
            type: 'ColorPicker',
            label: '图形描边',
            name: ['lineStyle', 'stroke'],
        },
        {
            type: 'InputNumber',
            label: '描边宽度',
            name: ['lineStyle', 'lineWidth'],
        },
        {
            type: 'Title',
            label: '标签配置',
        },
        {
            type: 'Switch',
            label: '显示文本',
            name: 'label',
        },
        {
            type: 'Title',
            label: '点配置',
        },
        {
            type: 'Select',
            label: '点形状',
            name: ['point', 'shape'],
            props: {
                options: [
                    { label: '圆形', value: 'circle' },
                    { label: '方形', value: 'square' },
                    { label: '竖线', value: 'line' },
                    { label: '菱形', value: 'diamond' },
                    { label: '三角形', value: 'triangle' },
                    { label: '倒三角', value: 'triangle-down' },
                    { label: '六边形', value: 'hexagon' },
                    { label: '蝴蝶结', value: 'bowtie' },
                    { label: '打叉', value: 'cross' },
                    { label: 'I符号', value: 'tick' },
                    { label: '加号', value: 'plus' },
                    { label: '减号', value: 'hyphen' },
                ],
            },
        },
        {
            type: 'Slider',
            label: '点大小',
            name: ['point', 'size'],
            props: {
                min: 0,
                max: 50,
                step: 1,
            },
        },
        {
            type: 'ColorPicker',
            label: '点颜色',
            name: ['point', 'style', 'fill'],
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
            type: 'Input',
            label: '上个节点值展示',
            name: 'previousValueLabel',
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
            theme: 'default', // 主题
            color: ['#009af1', '#00d4bc', '#97d60c', '#f8d822', '#ffa034', '#f64541', '#f02ca0', '#9d59fa', '#34cbfe', '#0d89e9'],
            xField: 'week',
            yField: ['weixin', 'ngapview'],
            seriesField: 'name',
            showLegend: true, // 显示图例
            autoFit: true, // 图表自适应
            appendPadding: 20, // 图表内边距
            legend: {
                layout: 'horizontal',
                position: 'top',
            },
            showDifference: false, // 显示差值对比
            currentValueLabel: '当前值', // 当前值展示
            previousValueLabel: '上个节点值', // 上个节点值展示
            differenceLabel: '较上个节点', // 差值对比文本
            showMomRate: false, // 显示环比
            momRateLabel: '环比:', // 环比文本
            positiveColor: '#52c41a', // 正值颜色
            negativeColor: '#ff4d4f', // 负值颜色
            showPreviousNodeLine: false, // 显示上个节点对比虚线
            comparisonLineStyle: 'sameColorDashed', // 对比线效果：同色虚线（默认）/ 同色系浅一色
            enableSlider: false, // 启用横轴滑块
            enableScrollbar: false, // 启用滚动条
            label: {},
            point: {
                shape: 'circle',
                size: 5,
            },
        },
        // 组件样式
        style: {},
        api: {
            sourceType: 'json',
            source: {
                week: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                weixin: [40, 65, 74, 88, 92, 80, 65],
                ngapview: [45, 56, 74, 82, 85, 68, 58],
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
