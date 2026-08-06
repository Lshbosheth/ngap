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
            tooltip: '图标大小和颜色可在样式中修改字体颜色和大小',
        },
        {
            type: 'Icons',
            label: '图标',
            name: 'icon',
        },
        {
            type: 'Select',
            label: '大小',
            name: 'fontSize',
            props: {
                options: [
                    { value: '12px', label: '12*12' },
                    { value: '16px', label: '16*16' },
                    { value: '20px', label: '20*20' },
                    { value: '24px', label: '24*24' },
                    { value: '32px', label: '32*32' },
                    { value: '48px', label: '48*48' },
                    { value: '64px', label: '64*64' },
                ],
            },
        },
        {
            type: 'InputNumber',
            label: '旋转角度',
            name: 'rotate',
        },
        {
            type: 'Switch',
            label: '旋转动画',
            name: 'spin',
        },
    ],
    config: {
        // 组件默认属性值
        props: {
            icon: 'SettingOutlined',
            rotate: 0,
            spin: false,
            fontSize: '16px',
        },
        // 组件样式
        style: {
            fontSize: 16,
        },
    },
    // 组件事件
    events: [
        {
            value: 'onClick',
            name: '点击事件',
        },
        {
            value: 'onMouseEnter',
            name: '鼠标移入事件',
        },
        {
            value: 'onMouseLeave',
            name: '鼠标移出事件',
        },
    ],
    // 组件接口
    api: {},
};
