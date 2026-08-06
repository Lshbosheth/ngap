/**
 * 组件配置和属性值
 */

export default {
    // 组件属性配置JSON
    attrs: [
        {
            type: 'Title',
            label: '基础配置',
            key: 'formItem',
        },
        {
            type: 'InputNumber',
            label: '占位格数',
            name: 'span',
            props: {
                placeholder: '输入占位格数',
            },
        },
        {
            type: 'InputNumber',
            label: '偏移格数',
            name: 'offset',
            props: {
                placeholder: '左侧偏移格数',
            },
        },
        {
            type: 'InputNumber',
            label: '向左延伸',
            name: 'pull',
            props: {
                placeholder: '该组件向左扩展覆盖的列数',
            },
        },
        {
            type: 'InputNumber',
            label: '向右推动',
            name: 'push',
            props: {
                placeholder: '该组件向右移动挤开相邻列',
            },
        },
    ],
    config: {
        // 组件默认属性值
        props: {
            span: 8,
        },
        style: {},
        events: [],
        api: {},
        source: '',
    },
    // 组件事件
    events: [],
};
