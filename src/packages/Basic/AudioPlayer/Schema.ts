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
        // {
        //     type: 'Input',
        //     label: 'swf地址',
        //     name: 'swfUrl'
        // },
        {
            type: 'Input',
            label: '资源路径',
            name: 'resUrl',
        },
        {
            type: 'Title',
            label: '倍速设置',
            key: 'speed',
        },
        {
            type: 'Switch',
            label: '是否显示倍速',
            name: ['speed', 'isShow'],
        },
        {
            type: 'InputNumber',
            label: '倍速步长',
            name: ['speed', 'step'],
        },
        {
            type: 'InputNumber',
            label: '倍速最大值',
            name: ['speed', 'maxSize'],
        },
        {
            type: 'Title',
            label: '文本配置',
            key: 'texts',
        },
        {
            type: 'TextArea',
            label: '文本内容',
            tooltip: `格式示例：[00:03.89]风云2主题曲
        [00:04.17]歌手：屠洪刚
        [00:05.23]风卷尘沙起
        [00:09.45]云化雨落地
        [00:13.45]无数英雄涌四方
        [00:18.72]人间正气存古今`,
            name: ['texts', 'text'],
        },
        {
            type: 'InputNumber',
            label: '文本高度',
            name: ['texts', 'height'],
        },
        {
            type: 'Title',
            label: '波形配置',
            key: 'wave',
        },
        {
            type: 'TextArea',
            label: '波形内容',
            tooltip:
                '格式示例：[45, 23, 78, 12, 67, 34, 89, 5, 92, 41, 73, 18, 85, 29, 61, 7, 95, 38, 79, 14, 88, 44, 65, 21, 91, 50, 76, 10, 83, 32, 69, 16, 94, 47, 81, 8, 90, 36, 74, 19, 86, 42, 68, 24]',
            name: ['wave', 'data'],
        },
        // {
        //     type: 'InputNumber',
        //     label: '波形高度',
        //     name: ['wave', 'height']
        // },
        // {
        //     type: 'InputNumber',
        //     label: '波形宽度',
        //     name: ['wave', 'width']
        // }
    ],
    config: {
        // 组件默认属性值
        props: {
            resUrl: '/ngap/audio/dream.mp3',
            texts: {},
            wave: {},
            speed: {
                isShow: true,
                step: 1,
                maxSize: 4,
            },
        },
        style: {
            fontSize: '14px',
            textAlign: 'center'
        },
    },
    // 组件事件
    events: [
        {
            value: 'onPlay',
            name: '播放事件',
        },
        { value: 'onPause', name: '暂停事件' },
        { value: 'onResume', name: '继续播放事件' },
        { value: 'onFinish', name: '结束事件' },
        { value: 'onLoad', name: '加载完成事件' },
        { value: 'onStop', name: '停止事件' },
        { value: 'onWhileplaying', name: '播放中事件' },
    ],
    // 组件接口
    api: {},
};
