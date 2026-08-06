/**
 * 组件配置和属性值
 */
export default {
    // 组件属性配置JSON
    attrs: [
        {
            type: 'Variable',
            label: '初始时间',
            name: 'initialTime',
            props: {
                placeholder: '15:36:00',
            },
        },
        {
            type: 'Variable',
            label: '最大时间',
            name: 'maxTime',
            props: {
                placeholder: '15:36:00',
            },
        },
        {
            type: 'Switch',
            label: '自动开始计时',
            name: 'isAutoTime',
        },
        {
            type: 'Switch',
            label: '开始按钮',
            name: 'showStartButton',
        },
        {
            type: 'Switch',
            label: '重置按钮',
            name: 'showResetButton',
        },
    ],
    config: {
        // 组件默认属性值
        props: {
            isAutoTime: false,
            initialTime: '',
            maxTime: '',
            count: 5,
            isAuto: false,
            dot: false,
            overflowCount: 99,
            showZero: false,
            size: 'default',
            isindividual: true,
            showStartButton: true,
            showResetButton: true,
        },
        // 组件样式
        style: {},
        // 事件
        events: [
            //             {
            //     value: 'onMax',
            //     name: '达到最大值',
            // },
        ],
    },
    // 组件事件
    events: [
        {
            value: 'onMax',
            name: '达到最大值',
        },
    ],
    methods: [
        {
            name: 'start',
            title: '开始',
        },
        {
            name: 'pause',
            title: '暂停',
        },
        {
            name: 'reset',
            title: '重置',
        },
        {
            name: 'getCurrentTime',
            title: '获取当前计时器时间',
        },
    ],
};
