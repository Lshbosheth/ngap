import { FormInstance } from 'antd';
import CollapseSetting from './CollapseSetting';

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
                return <CollapseSetting key="tab-setting" form={form} />;
            },
        },
        {
            type: 'Title',
            label: '基础配置',
            key: 'basic',
        },
        // {
        //     type: 'Variable',
        //     label: '激活值',
        //     name: ['activeKey'],
        // },
        {
            type: 'Input',
            name: ['defaultActiveKey'],
            label: '默认展开ID',
            tooltip: '设置默认展开页签，使用子页签ID，运行展开多个，用英文逗号分割',
            props: {
                placeholder: '请输入子页签ID',
            },
        },
        {
            type: 'Switch',
            label: '手风琴模式',
            name: ['accordion'],
        },
        {
            type: 'Switch',
            label: '显示边框',
            name: ['bordered'],
        },
        // {
        //     type: 'Switch',
        //     label: '边框透明',
        //     name: ['ghost'],
        // },
        {
            type: 'Select',
            label: '尺寸',
            name: ['size'],
            props: {
                options: [
                    { value: 'large', label: '大' },
                    { value: 'middle', label: "中" },
                    { value: 'small', label: '小' },
                ],
            },
        },
        {
            type: 'Select',
            label: '按钮显示位置',
            name: ['expandIconPosition'],
            props: {
                options: [
                    { value: 'start', label: '左侧' },
                    { value: 'end', label: '右侧' },
                ],
            },
        },
        {
            type: 'Variable',
            label: '展开按钮文本',
            name: ['openIconText'],
        },
        {
            type: 'Variable',
            label: '收起按钮文本',
            name: ['closeIconText'],
        },
        {
            type: 'Switch',
            label: '隐藏销毁',
            name: ['destroyOnHidden'],
        },
    ],
    config: {
        // 组件默认属性值
        props: {
            size: 'middle',
            activeKey: undefined,
            accordion: false,
            bordered: true,
            ghost: false,
            expandIconPosition: 'start',
            openIconText: '展开',
            closeIconText: '收起',
            items: [
                // 禁止在这里创建子项， 在组件内部初始化时判断创建
                // {
                //     id: '',
                //     key: 'active1',
                //     label: '折叠面板 1',
                //     hidden: false,
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
        // 禁止在这里创建子项,在组件内部初始化时判断创建
        // {
        //     id: '',
        //     type: 'CollapseItem',
        //     name: '子标签',
        // },
    ],
    // 组件事件
    events: [
        {
            value: 'onCollapseOpenItem',
            name: '展开事件',
        },
        {
            value: 'onCollapseCloseItem',
            name: '收起事件',
        },
    ],
    methods: [
        {
            name: 'setOpenCollapse',
            title: '展开折叠面板',
        },
        {
            name: 'setCloseCollapse',
            title: '收起折叠面板',
        },
        {
            name: 'setCollapseOpenAll',
            title: '全部展开折叠面板',
        },
        {
            name: 'setCollapseCloseAll',
            title: '全部收起折叠面板',
        },
    ],
};
