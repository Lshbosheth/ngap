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
            type: 'Select',
            label: '类型',
            name: ['mode'],
            props: {
                options: [
                    { value: 'vertical', label: '垂直' },
                    { value: 'horizontal', label: '水平' },
                    { value: 'inline', label: '内嵌' },
                ],
            },
        },
        {
            type: 'RadioGroup',
            label: '主题颜色',
            name: 'theme',
            props: {
                options: [
                    { value: 'light', label: 'light' },
                    { value: 'dark', label: 'dark' },
                ],
            },
        },
        {
            type: 'Switch',
            label: '允许选中',
            name: 'selectable',
        },
        {
            type: 'Switch',
            label: '多选',
            name: 'multiple',
        },
        {
            type: 'Variable',
            label: '默认展开菜单',
            name: ['defaultOpenKeys'],
            tooltip: '初始展开的子菜单项 主键值 数组',
        },
        {
            type: 'Variable',
            label: '默认选中菜单',
            name: ['defaultSelectedKeys'],
            tooltip: '初始选中的菜单项 主键值 数组',
        },
        {
            type: 'Switch',
            label: '渲染子菜单',
            name: 'forceSubMenuRender',
            tooltip: '在子菜单展示之前就渲染进节点',
        },
        {
            type: 'Switch',
            label: '菜单收起',
            name: 'inlineCollapsed',
            tooltip: '内嵌 时菜单是否收起状态',
        },
        {
            type: 'InputNumber',
            label: '缩进宽度',
            name: 'inlineIndent',
            tooltip: '内嵌 模式的菜单缩进宽度',
        },
        {
            type: 'Icons',
            label: '展开图标',
            name: ['expandIcon'],
            tooltip: '自定义展开图标',
        },
        // {
        //     type: 'Icons',
        //     label: '省略图标',
        //     name: 'overflowedIndicator',
        //     tooltip: '用于自定义 Menu 水平空间不足时的省略收缩的图标'
        // },
        // {
        //     type: 'InputNumber',
        //     label: '关闭延时',
        //     name: 'subMenuCloseDelay',
        //     tooltip: '用户鼠标离开子菜单后关闭延时，单位：秒'
        // },
        // {
        //     type: 'InputNumber',
        //     label: '开启延时',
        //     name: 'subMenuOpenDelay',
        //     tooltip: '用户鼠标进入子菜单后开启延时，单位：秒'
        // },

        {
            type: 'RadioGroup',
            label: '触发行为',
            name: 'triggerSubMenuAction',
            props: {
                options: [
                    { value: 'hover', label: '悬浮' },
                    { value: 'click', label: '点击' },
                ],
            },
            tooltip: '子节点展开/关闭的触发行为',
        },
    ],
    config: {
        // 组件默认属性值
        props: {
            forceSubMenuRender: false,
            inlineCollapsed: false,
            inlineIndent: 24,
            mode: 'inline',
            multiple: false,
            selectable: true,
            subMenuCloseDelay: 0.1,
            subMenuOpenDelay: 0,
            theme: 'light',
            triggerSubMenuAction: 'hover',
        },
        // 组件样式
        style: {},
        api: {
            sourceType: 'json',
            source: [
                {
                    key: '1',
                    icon: 'MailOutlined',
                    label: 'Navigation One',
                },
                {
                    key: '2',
                    icon: 'CalendarOutlined',
                    label: 'Navigation Two',
                },
                {
                    key: 'sub1',
                    label: 'Navigation Two',
                    icon: 'AppstoreOutlined',
                    children: [
                        { key: '3', label: 'Option 3' },
                        { key: '4', label: 'Option 4' },
                        {
                            key: 'sub1-2',
                            label: 'Submenu',
                            children: [
                                { key: '5', label: 'Option 5' },
                                { key: '6', label: 'Option 6' },
                            ],
                        },
                    ],
                },
                {
                    key: 'sub2',
                    label: 'Navigation Three',
                    icon: 'SettingOutlined',
                    children: [
                        { key: '7', label: 'Option 7' },
                        { key: '8', label: 'Option 8' },
                        { key: '9', label: 'Option 9' },
                        { key: '10', label: 'Option 10' },
                    ],
                },
                {
                    key: 'link',
                    label: 'Navigation Four',
                    icon: 'LinkOutlined',
                },
            ],
        },
        // 事件
        events: [],
    },
    // 组件事件
    events: [
        {
            name: 'onClick事件',
            value: 'onClick',
        },
        {
            name: 'onDeselect事件',
            value: 'onDeselect',
        },
        {
            name: 'onOpenChange事件',
            value: 'onOpenChange',
        },
        {
            name: 'onSelect事件',
            value: 'onSelect',
        },
    ],
    methods: [
        {
            title: '获取选中菜单keys',
            name: 'getSelectKeys',
        },
        {
            title: '获取展开的SubMenu 菜单keys',
            name: 'getOpenKeys',
        },
        {
            title: '获取选中菜单keys',
            name: 'setSelectKeys',
        },
    ],
};
