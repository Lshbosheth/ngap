/**
 * 组件配置和属性值
 */

export default {
    // 组件属性配置JSON
    attrs: [
        {
            key: 'BottomBanner',
            type: 'Title',
            label: '页面配置',
        },
        {
            type: 'InputPx',
            label: '上间距',
            name: ['paddingTop'],
        },
        {
            type: 'InputPx',
            label: '下间距',
            name: ['paddingBottom'],
        },
        {
            type: 'InputPx',
            label: '左间距',
            name: ['paddingLeft'],
        },
        {
            type: 'InputPx',
            label: '右间距',
            name: ['paddingRight'],
        },
        {
            type: 'Switch',
            label: '横线',
            tooltip: '是否显示上面的横线',
            name: ['line'],
        },
    ],
    config: {
        // 组件默认属性值
        props: {
            paddingTop: '8px',
            paddingLeft: '8px',
            paddingRight: '8px',
            line: true,
            positionMode: 'container',
        },
        style: {},
        events: [],
        api: {},
        source: '',
    },
    // 组件事件
    events: [],
};
