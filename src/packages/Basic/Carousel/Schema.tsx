/**
 * 组件配置和属性值
 */
const carousel1JPG = new URL('./carousel-1.jpg', import.meta.url).href;
const carousel2JPG = new URL('./carousel-2.jpg', import.meta.url).href;

export default {
    // 组件属性配置JSON
    attrs: [
        {
            type: 'Title',
            label: '基础配置',
            key: 'basic',
        },
        {
            type: 'Select',
            label: '展示形式',
            name: 'showtype',
            props: {
                options: [
                    { value: 'onlydesc', label: '只展示描述' },
                    { value: 'onlypic', label: '只展示图片' },
                    { value: 'showall', label: '全部展示' },
                ],
            },
        },
        // {
        //     type: 'Input',
        //     label: '切换面板的回调',
        //     name: 'afterChange',
        // },
        {
            type: 'Switch',
            label: '自动切换',
            name: 'autoplay',
        },
        // {
        //     type: 'Input',
        //     label: '切换面板的回调',
        //     name: 'beforeChange',
        // },
        {
            type: 'Select',
            label: '面板指示点位置',
            name: 'dotPosition',
            props: {
                options: [
                    { value: 'top', label: '头部' },
                    { value: 'bottom', label: '底部' },
                    { value: 'left', label: '左侧' },
                    { value: 'right', label: '右侧' },
                ],
            },
        },
        {
            type: 'Switch',
            label: '显示面板指示点',
            name: 'dots',
        },
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
        {
            type: 'Select',
            label: '动画效果',
            name: 'effect',
            props: {
                options: [
                    { value: 'scrollx', label: '水平滚动' },
                    { value: 'fade', label: '淡入淡出' },
                ],
            },
        },
    ],
    config: {
        // 组件默认属性值
        props: {
            showtype: 'showall',
            afterChange: '',
            autoplay: false,
            beforeChange: '',
            dotPosition: 'bottom',
            dots: true,
            easing: 'linear',
            effect: 'scrollx',
            script: `function render(value){
    return value;
}`,
        },
        style: {},
        events: [],
        api: {
            sourceType: 'json',
            sourceField: 'data.list',
            // 数据源
            source: [
                {
                    id: 1001,
                    desc: '轮播面板1',
                    type: '昆虫',
                    picUrl: carousel1JPG,
                },
                {
                    id: 1002,
                    desc: '轮播面板2',
                    type: '昆虫',
                    picUrl: carousel2JPG,
                },
                {
                    id: 1003,
                    desc: '轮播面板3',
                    type: '昆虫',
                    picUrl: carousel1JPG,
                },
                {
                    id: 1004,
                    desc: '轮播面板4',
                    type: '昆虫',
                    picUrl: carousel2JPG,
                },
            ],
        },
        source: '',
    },
    // 组件事件
    events: [],
    // 组件接口
    api: {},
};
