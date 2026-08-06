/**
 * 组件配置和属性值
 */
export default {
    // 组件属性配置JSON
    attrs: [
        {
            type: 'Title',
            label: '基础配置',
            key: 'basic',
        },
        {
            type: 'Switch',
            label: '默认状态',
            name: 'defaultState',
        },
        {
            type: 'Switch',
            label: '显示文本',
            name: 'showText',
        },
        {
            type: 'Select',
            label: '按钮样式',
            name: ['btnType'],
            props: {
                options: [
                    { value: '1', label: '实体' },
                    { value: '2', label: '边框' },
                    { value: '3', label: '文字' },
                ],
            },
        },

    ],
    config: {
        // 组件默认属性值
        props: {
            defaultState: true,
            showText: true,
            btnType:'1',
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
