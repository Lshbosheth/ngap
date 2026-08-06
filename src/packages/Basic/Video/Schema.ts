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
            type: 'Variable',
            label: '视频地址',
            name: 'src',
        },
        {
            type: 'Variable',
            label: '封面',
            name: 'poster',
        },
        // {
        //     type: 'Select',
        //     label: '预加载',
        //     name: ['preload'],
        //     props: {
        //         options: [
        //             { value: 'auto', label: '即使用户不被期望使用，整个视频文件也可以被下载' },
        //             { value: 'none', label: '不预加载' },
        //             { value: 'metadata', label: '仅获取视频元数据（例如长度）' },

        //         ],
        //     },

        // },
        {
            type: 'Switch',
            label: '静音',
            name: ['muted'],
        },
        {
            type: 'Switch',
            label: '自动播放',
            name: ['autoPlay'],
        },
        {
            type: 'Variable',
            label: '开始播放时间',
            name: 'startTime',
            tooltip: '请输入数字，单位秒',
        },
    ],
    config: {
        // 组件默认属性值
        props: {
            // width: 400,
            src: '/ngap/video/test.webm',
            poster: '/ngap/imgs/ngap-logo.png',
            preload: '',
            muted: 'true',
            autoPlay: false,
            startTime: '0',
        },
        // 组件样式
        style: {},
        // 事件
        events: [],
    },
    // 组件事件
    events: [],
    methods: [
        {
            name: 'setPlaybackRate',
            title: '设置视频播放速速',
        },
        {
            name: 'setVoluem',
            title: '设置视频音量',
        },
        {
            name: 'play',
            title: '播放',
        },
        {
            name: 'pause',
            title: '暂停',
        },
        {
            name: 'load',
            title: '更换视频源并重新加载视频',
        },
    ],
};
