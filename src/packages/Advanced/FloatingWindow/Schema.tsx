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
            type: 'Variable',
            label: '标题',
            name: 'titleName',
        },
        {
            type: 'RadioGroup',
            label: '默认状态',
            name: 'defaultOpen',
            props: {
                options: [
                    { value: '1', label: '默认展开' },
                    { value: '2', label: '默认收起' },
                ],
            },
        },
        {
            type: 'Switch',
            label: '定时收起',
            name: 'autoFoldupFlag',
        },
        {
            type: 'Select',
            label: '默认时间',
            name: 'defaultTime',
            props: {
                options: [
                    { label: '1s', value: '1' },
                    { label: '2s', value: '2' },
                    { label: '3s', value: '3' },
                    { label: '4s', value: '4' },
                    { label: '5s', value: '5' },
                    { label: '6s', value: '6' },
                ],
            },
        },
        {
            type: 'Switch',
            label: '是否展示刷新',
            name: 'refreshFlag',
        },
        {
            type: 'Select',
            label: '背景颜色选择',
            name: 'bgcolorstyle',
            props: {
                options: [
                    { label: '白色背景', value: '0' },
                    { label: '智能背景1', value: '1' },
                    { label: '智能背景2', value: '2' },
                ],
            },
        },
        {
            type: 'Title',
            label: '定位设置',
            key: 'basic',
        },
        {
            type: 'InputNumber',
            label: '左',
             tooltip: '左右同时存在时候 左生效',
            name: 'left',
        },
        {
            type: 'InputNumber',
            label: '右',
            tooltip: '左右同时存在时候 左生效',
            name: 'right',
        },
        {
            type: 'InputNumber',
            label: '上',
            tooltip: '上下同时存在时候 上生效',
            name: 'top',
        },
        {
            type: 'InputNumber',
            label: '下',
            tooltip: '上下同时存在时候 上生效',
            name: 'bottom',
        },
    ],
    config: {
        // 组件默认属性值
        props: {
            titleName: '标题示意',
            defaultOpen: '1',
            floatFileUploadExpand: '',
            floatFileUploadCollapse: '',
            autoFoldupFlag: false,
            defaultTime: '3',
            refreshFlag: false,
            bgcolorstyle: '2',
        },
        // 组件样式
        style: {},
        api: {
            sourceType: 'json',
            source: [
                {
                    key: '1',
                    title: '话术一',
                    content:
                        '客户查询示意文字1客户查询示意文字1客户查询示意文字1客户查询示意文字1客户查询示意文字1客户查询示意文字1客户查询示意文字1客户查询示意文字1',
                },
                {
                    key: '2',
                    title: '话术二',
                    content:
                        '客户查询示意文字2客户查询示意文字2客户查询示意文字2客户查询示意文字2客户查询示意文字2客户查询示意文字2客户查询示意文字2客户查询示意文字2',
                },
            ],
        },
        // 事件
        events: [],
    },
    // 组件事件
    events: [
        {
            name: 'onChangePopup事件',
            value: 'onChangePopup',
        },

        // {
        //     name: "onLike事件",
        //     value: 'onLike'
        // },
        // {
        //     name: "onDislike事件",
        //     value: 'onDisLike'
        // },
    ],
    methods: [
        {
            name: 'open',
            title: '打开',
        },
        {
            name: 'close',
            title: '关闭',
        },
    ],
};
