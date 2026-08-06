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
            type: 'InputNumber',
            label: '图表内边距',
            name: 'appendPadding',
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
            label: '图形配置',
        },
        {
            type: 'Slider',
            label: '宽度占比',
            name: 'barWidthRatio',
            props: {
                min: 0,
                max: 1,
                step: 0.1,
            },
        },
        {
            type: 'function',
            label: '圆角',
            render() {
                return <RadiusSet name="barStyle" key="radius" />;
            },
        },
        {
            type: 'Slider',
            label: '透明度',
            key: 'barOpacity',
            name: ['barStyle', 'fillOpacity'],
            props: {
                min: 0,
                max: 1,
                step: 0.1,
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
            xField: ['PV', 'UV'], // X 轴显示的字段
            yField: 'project', // Y 轴显示的字段
            barWidthRatio: 0.6, // 柱子宽度占比
            isGroup: true,
            theme: 'default', // 主题
            color: ['#009af1', '#00d4bc', '#97d60c', '#f8d822', '#ffa034', '#f64541', '#f02ca0', '#9d59fa', '#34cbfe', '#0d89e9'],
            seriesField: 'name', // 分类字段
            autoFit: true, // 图表自适应
            appendPadding: 20, // 图表内边距
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
                position: 'top', //'top', 'top-left', 'top-right', 'left', 'left-top', 'left-bottom', 'right', 'right-top', 'right-bottom', 'bottom', 'bottom-left', 'bottom-right'。
            },
            yAxis: {
                label: {
                    autoHide: true,
                    autoRotate: true,
                },
            },
            barStyle: {
                fillOpacity: 1,
                radius: [50, 50, 0, 0],
            },
            // 图表交互
            interactions: [
                {
                    type: 'element-active',
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
                PV: [500, 3000, 30000, 7000, 50000],
                UV: [800, 300, 10000, 5000, 35000],
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
    ],
};
