export default {
    attrs: [
        {
            type: 'Title',
            label: '基础配置',
            key: 'popover-basic',
        },
        {
            type: 'Select',
            label: '气泡大小',
            name: 'size',
            tooltip: '预设气泡尺寸，可在样式栏自定义尺寸',
            props: {
                options: [
                    { label: '大', value: 'large' },
                    { label: '中', value: 'medium' },
                    { label: '小', value: 'small' },
                ],
            },
        },
        // {
        //     type: 'Select',
        //     label: '气泡位置',
        //     name: 'placement',
        //     props: {
        //         options: [
        //             { label: '左', value: 'left' },
        //             { label: '右', value: 'right' },
        //             { label: '上', value: 'top' },
        //             { label: '下', value: 'bottom' },
        //             { label: '左上', value: 'leftTop' },
        //             { label: '左下', value: 'leftBottom' },
        //             { label: '右上', value: 'rightTop' },
        //             { label: '右下', value: 'rightBottom' },
        //             { label: '上左', value: 'topLeft' },
        //             { label: '上右', value: 'topRight' },
        //             { label: '下左', value: 'bottomLeft' },
        //             { label: '下右', value: 'bottomRight' },
        //         ],
        //     },
        // },
        {
            type: 'Switch',
            label: '关闭按钮',
            name: 'showCloseButton',
            tooltip: '开启后气泡弹窗右上角展示关闭按钮',
        },
    ],
    config: {
        props: {
            size: 'medium',
            showCloseButton: false,
            placement: 'rightTop',
        },
        style: {},
    },
    events: [
        {
            value: 'onLoad',
            name: '初始化事件',
        },
    ],
    methods: [
        {
            name: 'show',
            title: '打开气泡弹窗',
            description: '通过事件行为调用，参数为触发元素ID',
        },
        {
            name: 'hide',
            title: '关闭气泡弹窗',
        },
    ],
};
