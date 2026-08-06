/**
 * 组件配置和属性值
 */

export default {
    // 组件属性配置JSON
    attrs: [
        {
            type: 'Title',
            label: '基础配置',
            key: 'base',
        },
        {
            type: 'Select',
            label: '布局设置',
            name: 'columnNum',
            props: {
                options: [
                    { label: '一行一列', value: 1 },
                    { label: '一行两列', value: 2 },
                    { label: '一行三列', value: 3 },
                    { label: '一行四列', value: 4 },
                    { label: '一行五列', value: 5 },
                    { label: '一行六列', value: 6 },
                ],
            },
        },
        {
            type: 'InputNumber',
            label: '间隔',
            name: 'gutter',
            props: {
                placeholder: '请输入间隔',
            },
        },
        // {
        //     type: 'Switch',
        //     label: '自动换行',
        //     name: ['wrap'],
        //     tooltip: '仅在 horizontal 时有效',
        // },
    ],
    config: {
        // 组件默认属性值
        props: {
            gutter: 16,
            columnNum: 2,
        },
        style: {},
        events: [],
        api: {},
        source: '',
    },
    // 组件事件
    events: [],
};
