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
            label: '是否使用折叠',
            name: 'isCollapsed',
        },
        {
            type: 'Select',
            label: '标签间距',
            name: 'tagSpace',
            props: {
                options: [
                    { value: '4', label: '4' },
                    { value: '5', label: '5' },
                    { value: '6', label: '6' },
                    { value: '7', label: '7' },
                    { value: '8', label: '8' },
                    { value: '9', label: '9' },
                    { value: '10', label: '10' }
                ],
            },
        },
        {
            type: 'Input',
            label: '最大选择个数',
            name: 'maxSelect',
        },
        //  {
        //     type: 'Select',
        //     label: '标签大小',
        //     name: 'tagSize',
        //     props: {
        //         options: [
        //             { value: 'small', label: '小' },
        //             { value: '5', label: '中' },
        //             { value: '6', label: '大' },
                   
        //         ],
        //     },
        // },

        // {
        //     type: 'Input',
        //     label: '切换面板的回调',
        //     name: 'beforeChange',
        // },
        // {
        //     type: 'Select',
        //     label: '面板指示点位置',
        //     name: 'dotPosition',
        //     props: {
        //         options: [
        //             { value: 'top', label: '头部' },
        //             { value: 'bottom', label: '底部' },
        //             { value: 'left', label: '左侧' },
        //             { value: 'right', label: '右侧' },
        //         ],
        //     },
        // },
        // {
        //     type: 'Switch',
        //     label: '显示面板指示点',
        //     name: 'dots',
        // },
        // {
        //     type: 'Select',
        //     label: '动画效果',
        //     name: 'easing',
        //     props: {
        //         options: [
        //             { value: 'linear', label: '线性' }
        //         ],
        //     },
        // },
        // {
        //     type: 'Select',
        //     label: '动画效果',
        //     name: 'effect',
        //     props: {
        //         options: [
        //             { value: 'scrollx', label: '水平滚动' },
        //             { value: 'fade', label: '淡入淡出' },
        //         ],
        //     },
        // },
    ],
    config: {
        // 组件默认属性值
        props: {
             isCollapsed: false,
            tagSpace:'4',
            maxSelect:'10'
        },
        style: {},
        events: [],
        api: {
            sourceType: 'json',
            sourceField: 'data.list',
            // 数据源
            source: [
                {
                    label: '电影',
                    key: 'Movies',
                    id: 1,
                    icon: 'VideoCameraOutlined',
                },
                {
                    label: '书籍',
                    key: 'Books',
                    id: 2,
                    icon: 'BookOutlined',
                },
                {
                    label: '音乐',
                    key: 'Music',
                    id: 3,
                    icon: 'AudioOutlined',
                },
                {
                    label: '体育',
                    key: 'Sports',
                    id: 4,
                    icon: 'FutbolOutlined',
                },
                {
                    label: '旅行',
                    key: 'Travel',
                    id: 5,
                    icon: 'GlobalOutlined',
                },
                {
                    label: '美食',
                    key: 'Food',
                    id: 6,
                    icon: 'CoffeeOutlined',
                },
                {
                    label: '技术',
                    key: 'Technology',
                    id: 7,
                    icon: 'DesktopOutlined',
                },
                {
                    label: '时尚',
                    key: 'Fashion',
                    id: 8,
                    icon: 'AppstoreOutlined',
                },
                {
                    label: '艺术',
                    key: 'Art',
                    id: 9,
                    icon: 'AppstoreAddOutlined',
                },
                {
                    label: '摄影',
                    key: 'Photography',
                    id: 10,
                    icon: 'CameraOutlined',
                },
                {
                    label: '健身',
                    key: 'Fitness',
                    id: 11,
                    icon: 'PropertySafetyOutlined',
                },
                {
                    label: '游戏',
                    key: 'Gaming',
                    id: 12,
                    icon: 'ProductOutlined',
                },
                {
                    label: '烹饪',
                    key: 'Cooking',
                    id: 13,
                    icon: 'ForkOutlined',
                },
                {
                    label: '自然',
                    key: 'Nature',
                    id: 14,
                    icon: 'MessageOutlined',
                },
                {
                    label: '健康',
                    key: 'Health',
                    id: 15,
                    icon: 'HeartOutlined',
                },
            ],
        },
        source: '',
    },
    // 组件事件
    events: [
        {
            value: 'onClose',
            name: '点击关闭事件',
        },
    ],
    // 组件接口
    api: {},
};
