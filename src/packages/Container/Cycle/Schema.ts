/**
 * 组件配置和属性值
 */

export default {
    // 组件属性配置JSON
    attrs: [
        {
            type: 'Title',
            label: '基础配置',
            key: 'uniqueField',
        },
        {
            type: 'Switch',
            label: '垂直布局',
            name: 'vertical',
        },
        {
            type: 'Select',
            label: '换行方式',
            name: 'wrap',
            props: {
                options: [
                    { value: 'nowrap', label: '不换行' },
                    { value: 'wrap', label: '换行' },
                    { value: 'wrap-reverse', label: '逆换行' },
                ],
            },
        },
        {
            type: 'Select',
            label: '主轴对齐',
            name: 'justify',
            props: {
                options: [
                    { value: 'flex-start', label: '左对齐' },
                    { value: 'flex-end', label: '右对齐' },
                    { value: 'center', label: '居中对齐' },
                    { value: 'space-between', label: '两端对齐' },
                    // { value: 'space-around', label: '环绕对齐' },
                    { value: 'space-evenly', label: '均匀对齐' },
                ],
            },
        },
        {
            type: 'Select',
            label: '副轴对齐',
            name: 'align',
            props: {
                options: [
                    { value: 'flex-start', label: '起点对齐' },
                    { value: 'flex-end', label: '终点对齐' },
                    { value: 'center', label: '居中对齐' },
                ],
            },
        },
        {
            type: 'InputPx',
            label: '元素间隙',
            name: 'gap',
            props: {
                placeholder: 'eg: 10',
            },
        },
    ],
    config: {
        props: {
            colon: true,
            labelAlign: 'right',
            layout: 'horizontal',
            labelCol: {
                span: 6,
            },
            wrapperCol: {
                span: 18,
            },
            uniqueField: 'id',
            vertical: true,
            wrap: 'wrap',
            justify: 'flex-start',
            align: 'flex-start',
            gap: 10,
        },
        // 组件样式
        style: {
            padding: '20px 10px',
            backgroundColor: '#fff',
        },
        events: [],
        api: {
            sourceType: 'json',
            // 数据源
            source: {
                id: [1, 2, 3, 4],
                name: ['项目1', '项目2', '项目3', '项目4'],
                value: ['值1', '值2', '值3', '值4'],
                score: ['10', '20', '30', '40'],
            },
        },
    },
    // 组件事件
    events: [],
    methods: [
        {
            name: 'refresh',
            title: '刷新内容',
        },
    ],
};
