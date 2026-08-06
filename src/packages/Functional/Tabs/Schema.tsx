import { FormInstance } from 'antd';
import TabSetting from './TabSetting';

/**
 * 组件配置和属性值
 */
export default {
    // 组件属性配置JSON
    attrs: [
        {
            type: 'Title',
            label: '页签配置',
            key: 'tabs-title',
        },
        {
            type: 'function',
            render(form: FormInstance) {
                return <TabSetting key="tab-setting" form={form} />;
            },
        },
        {
            type: 'Title',
            label: '基础配置',
            key: 'basic',
        },
        {
            type: 'Variable',
            label: '激活值',
            name: ['activeKey'],
        },
        {
            type: 'Input',
            label: '默认页签',
            name: ['defaultActiveKey'],
        },
        {
            type: 'Switch',
            label: '标签居中',
            name: ['centered'],
        },
        // {
        //     type: 'Switch',
        //     label: '隐藏加号',
        //     name: ['hideAdd'],
        // },
        {
            type: 'Select',
            label: '尺寸',
            name: ['size'],
            props: {
                options: [
                    { value: 'large', label: '大' },
                    { value: 'middle', label: '中' },
                    { value: 'small', label: '小' },
                ],
            },
        },
        {
            type: 'InputNumber',
            label: '页签间隙',
            name: ['tabBarGutter'],
        },
        {
            type: 'Select',
            label: '页签位置',
            name: ['tabPosition'],
            props: {
                options: [
                    { value: 'top', label: '顶部' },
                    { value: 'right', label: '右侧' },
                    { value: 'bottom', label: '底部' },
                    { value: 'left', label: '左侧' },
                ],
            },
        },
        // {
        //     type: 'Switch',
        //     label: '隐藏销毁',
        //     name: ['destroyInactiveTabPane'],
        // },
        {
            type: 'Select',
            label: '页签样式',
            name: ['type'],
            props: {
                options: [
                    { value: 'line', label: '线框式' },
                    { value: 'card', label: '卡片式' },
                    { value: 'editable-card', label: '可编辑卡片式' },
                ],
            },
        },
        {
            type: 'Switch',
            label: '预加载',
            tooltip: '开启后，选项卡元素加载时当前非选中页签内容同步预加载，需注意若已配置初始化行为也会触发。',
            name: ['forceRender'],
        },
    ],
    config: {
        // 组件默认属性值
        props: {
            type: 'line',
            size: 'middle',
            tabPosition: 'top',
            activeKey: undefined,
            forceRender: false,
            centered: false,
            hideAdd: true,
            destroyInactiveTabPane: false,
            items: [
                // 禁止在这里创建子项， 在组件内部初始化时判断创建
                // {
                //     id,
                //     key: 'active1',
                //     label: '页签1',
                //     hidden:false,
                //
                // },
            ],
        },
        // 组件样式
        style: {},
        // 事件
        events: [],
    },
    // 子组件
    elements: [
        // 禁止在这里创建子项， 在组件内部初始化时判断创建
        // {
        //     id,
        //     type: 'Tab',
        //     name: '子标签',
        // },
    ],
    // 组件事件
    events: [
        {
            value: 'onTabClick',
            name: '点击事件',
        },
        {
            value: 'onChange',
            name: '切换事件',
        },
    ],
    methods: [
        {
            name: 'getCurrentTabId',
            title: '获取激活页签值',
        },
        {
            name: 'setCurrentTabId',
            title: '设置激活页签值',
        },
    ],
};
