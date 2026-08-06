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
            type: 'Input',
            label: 'Key',
            name: ['key'],
        },
        {
            type: 'Variable',
            label: '标签名称',
            name: ['label'],
        },
    ],
    config: {
        // 组件默认属性值
        props: {
            // 禁止在这里创建子项， 在组件内部初始化时判断创建
            // key: 'active1',
            // label: '折叠面板 1',
            // hidden: false,
        },

        // 组件样式
        style: {},
        // 事件
        events: [],
    },
    // 组件事件
    events: [],
    methods: [],
};
