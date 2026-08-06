/**
 * 组件配置和属性值
 */
export default {
    // 组件属性配置JSON
    attrs: [
        {
            type: 'Title',
            label: '基础设置',
            key: 'basic',
        },
        {
            type: 'ColorPicker',
            label: '圆点颜色',
            name: 'color',
            tooltip: '独立使用且不展示0时，不能设置颜色，否则在数字为0 时会显示为小圆点',
        },
        {
            type: 'Variable',
            label: '数字',
            name: ['count'],
            tooltip: '大于 overflowCount 时显示为 ${overflowCount}+，为 0 时隐藏',
        },
        {
            type: 'Switch',
            label: '不展示数字',
            name: 'dot',
            tooltip: '不展示数字，只有一个小红点',
        },
        {
            type: 'Variable',
            label: '封顶数字',
            name: ['overflowCount'],
        },
        {
            type: 'Switch',
            label: '是否展示0',
            name: 'showZero',
        },
        {
            type: 'Select',
            label: '圆点大小',
            name: ['size'],
            props: {
                options: [
                    { value: 'default', label: 'default' },
                    { value: 'small', label: 'small' },
                ],
            },
        },
        {
            type: 'Switch',
            label: '独立使用',
            name: 'isindividual',
            tooltip: '选择否时，显示在元素的右上角',
        },
        // {
        //     type: 'Title',
        //     label: '状态点设置',
        //     key: 'statusSet',
        // },
        // {
        //     type: 'Select',
        //     label: '设置为状态点',
        //     name: ['status'],
        //     props: {
        //         options: [
        //             { value: 'success', label: 'success' },
        //             { value: 'processing', label: 'processing' },
        //             { value: 'default', label: 'default' },
        //             { value: 'error', label: 'error' },
        //             { value: 'warning', label: 'warning' },
        //         ],
        //         allowClear: true
        //     },
        //     tooltip: '状态点时【独立使用】需设置为是',
        // },
        // {
        //     type: 'Variable',
        //     label: '状态点文本',
        //     name: ['text'],
        //     tooltip: '在设置为 状态点 的前提下有效，设置状态点的文本',
        // },
        // {
        //     type: 'Variable',
        //     label: '状态点提示',
        //     name: ['title'],
        //     tooltip: '设置鼠标放在状态点上时显示的文字',
        // },
    ],
    config: {
        // 组件默认属性值
        props: {
            count: 5,
            dot: false,
            overflowCount: 99,
            showZero: false,
            size: 'small',
            isindividual: true,
        },
        // 组件样式
        style: {},
        // 事件
        events: [],
    },
    // 组件事件
    events: [
        {
            value: 'onClick',
            name: '点击事件',
        },
    ],
    methods: [],
};
