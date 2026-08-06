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
            label: 'y轴字段(柱)',
            name: 'yField_bar',
            apiOpt: true,
        },
        {
            type: 'Select',
            label: 'y轴字段(折)',
            name: 'yField_line',
            apiOpt: true,
        },
        //  {
        //      type: 'Select',
        //      label: '分类字段(柱)',
        //      name: 'seriesField_column',
        //      apiOpt: true,
        //  },
        //  {
        //     type: 'Select',
        //     label: '分类字段(线)',
        //     name: 'seriesField_line',
        //     apiOpt: true,
        // },
        {
            type: 'Switch',
            label: '是否分组',
            name: 'isGroup',
        },
        {
            type: 'InputNumber',
            label: '图表内边距',
            name: 'appendPadding',
        },
        {
            type: 'Title',
            label: '图形样式(柱)',
        },
        //   {
        //     type: 'Slider',
        //     label: '宽度占比(柱)',
        //     name: 'columnWidthRatio',
        //     props: {
        //         min: 0,
        //         max: 1,
        //         step: 0.1,
        //     },
        // },
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
        // {
        //     type: 'ColorPicker',
        //     label: '图形描边',
        //     name: ['columnStyle', 'stroke'],
        // },
        // {
        //     type: 'InputNumber',
        //     label: '描边宽度',
        //     name: ['columnStyle', 'lineWidth'],
        // },
        {
            type: 'Title',
            label: '图形样式(线)',
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
        //  {
        //      type: 'Slider',
        //      label: '透明度',
        //      name: ['lineStyle', 'fillOpacity'],
        //      props: {
        //          min: 0,
        //          max: 1,
        //          step: 0.1,
        //      },
        //  },
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
        //  {
        //      type: 'Switch',
        //      label: '显示文本',
        //      name: 'label',
        //  },
        {
            type: 'Select',
            label: '位置',
            name: ['label', 'position'],
            key: 'labelPosition',
            props: {
                options: [
                    { label: '顶部', value: 'top' },
                    { label: '居中', value: 'middle' },
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
                    { label: 'top', value: 'top' },
                    { label: 'top-left', value: 'top-left' },
                    { label: 'top-right', value: 'top-right' },
                    { label: 'left', value: 'left' },
                    { label: 'left-top', value: 'left-top' },
                    { label: 'left-bottom', value: 'left-bottom' },
                    { label: 'right', value: 'right' },
                    { label: 'right-top', value: 'right-top' },
                    { label: 'right-bottom', value: 'right-bottom' },
                    { label: 'bottom', value: 'bottom' },
                    { label: 'bottom-left', value: 'bottom-left' },
                    { label: 'bottom-right', value: 'bottom-right' },
                ],
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
            xField: 'time',
            //   yField: "value-uv,value-bill+count-a,count-b,count-c",
            yField_bar: ['value-uv', 'value-bill'],
            yField_line: ['count-a', 'count-b', 'count-c'],
            geometryOptions: [
                {
                    geometry: 'column',
                },
                {
                    geometry: 'line',
                    lineStyle: {
                        lineWidth: 2,
                    },
                },
            ],
            seriesField: 'name',
            color: ['#009af1', '#00d4bc', '#97d60c', '#f8d822', '#ffa034', '#f64541', '#f02ca0', '#9d59fa', '#34cbfe', '#0d89e9'],
            autoFit: true, // 图表自适应
            appendPadding: 20, // 图表内边距
            legend: {
                layout: 'horizontal',
                position: 'top',
            },
            label: {
                position: 'middle', // 'top', 'bottom', 'middle'
                style: {
                    fill: '#FFFFFF',
                    opacity: 0.8,
                },
            },
            point: {
                shape: 'circle',
                size: 5,
            },
            //  seriesField_column:'name',
            //  seriesField_line:"name",
            //柱状
            isGroup: true,
            dodgePadding: 5,
            intervalPadding: 10,
            // columnWidthRatio:0.6,
            columnStyle: {
                //  columnWidthRatio: 0.1,
                fillOpacity: 1,
                radius: [0, 0, 0, 0],
            },
        },
        // 组件样式
        style: {},
        api: {
            sourceType: 'json',
            source: {
                time: ['2019-03', '2019-04', '2019-05', '2019-06', '2019-07'],
                'value-uv': [350, 900, 300, 450, 470],
                'value-bill': [220, 300, 250, 220, 362],
                'count-a': [800, 600, 400, 380, 220],
                'count-b': [750, 650, 450, 400, 320],
                'count-c': [900, 600, 450, 300, 200],
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
