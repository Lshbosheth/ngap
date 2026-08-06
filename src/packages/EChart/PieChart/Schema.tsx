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
            type: 'Input',
            label: '设置标题',
            name: 'title',
            props: {
                placeholder: '请输入标题',
            },
        },
        {
            type: 'Select',
            label: '分类字段',
            name: 'colorField',
            props: {
                placeholder: '扇形分类名称',
            },
            apiOpt: true,
            tooltip: '设置扇形分类名称（不能选数值类型字段），修改数据源后必须先选“分类字段”再选“扇形值字段”',
        },
        {
            type: 'Select',
            label: '扇形值字段',
            name: 'angleField',
            props: {
                placeholder: '扇形（弧度）对应值',
            },
            apiOpt: true,
            tooltip: '设置扇形（弧度）对应值（只能选数值类型字段），修改数据源后必须先选“分类字段”再选“扇形值字段”',
        },
        {
            type: 'Slider',
            label: '饼图半径',
            name: 'radius',
            props: {
                min: 0,
                max: 1,
                step: 0.1,
            },
        },
        {
            type: 'Slider',
            label: '内环半径',
            name: 'innerRadius',
            props: {
                min: 0,
                max: 1,
                step: 0.1,
            },
        },
        {
            type: 'InputNumber',
            label: '图表内边距',
            name: 'padding',
        },
        {
            type: 'Title',
            label: '标签配置',
            key: 'label',
        },
        {
            type: 'Select',
            label: '标签位置',
            name: ['label', 'type'],
            props: {
                options: [
                    { label: '内部', value: 'inner' },
                    { label: '外部', value: 'outer' },
                    { label: '蜘蛛布局', value: 'spider' },
                ],
            },
        },
        {
            type: 'InputNumber',
            label: '字体大小',
            name: ['label', 'style', 'fontSize'],
            props: {
                placeholder: '数字类型',
            },
        },
        // {
        //     type: 'Select',
        //     label: '字重',
        //     name: ['label', 'style', 'fontWeight'],
        //     props: {
        //         options: [
        //             {
        //                 value: 'normal',
        //                 label: 'normal',
        //             },
        //             {
        //                 value: 'bold',
        //                 label: 'bold',
        //             },
        //             {
        //                 value: 'lighter',
        //                 label: 'lighter',
        //             },
        //             {
        //                 value: 'bolder',
        //                 label: 'bolder',
        //             },
        //         ],
        //     },
        // },
        {
            type: 'Input',
            label: '标签渲染',
            name: ['label', 'content'],
            props: {
                placeholder: '对分类标签数据增加后缀描述',
            },
        },
        {
            type: 'Title',
            label: '图例配置',
            key: 'legend',
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
            label: '内环配置',
        },
        {
            type: 'Input',
            label: '内环标题',
            name: ['statistic', 'title', 'content'],
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
            title: '标题',
            angleField: 'count',
            colorField: 'name',
            radius: 1,
            innerRadius: 0.6,
            autoFit: true, // 图表自适应
            appendPadding: 20, // 图表内边距
            label: {
                type: 'outer',
                content: '{value} 人',
                style: {
                    fontSize: 12,
                    fontWeight: 'normal',
                },
            },
            legend: {
                layout: 'horizontal',
                position: 'top',
            },
            theme: 'default', // 主题
            color: ['#9d5cff', '#FFAB3E', '#FADB1E', '#9ADB19', '#28C084', '#3CA2FF', '#1861EB', '#A24CF5', '#F32AA3', '#F11818'],
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
        api: {
            sourceType: 'json',
            source: {
                name: ['前端组', '后端组', '测试组', '产品组', '设计组'],
                count: [10, 18, 23, 19, 15],
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
