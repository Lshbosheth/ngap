import TextSetting from './../../components/TextSetting';
import OperationsSetting from './OperationsSetting';
import OperationStyleSetting from './OperationStyleSetting';
import KeySetting from './KeySetting';
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
            type: 'Input',
            label: '字段',
            name: ['formItem', 'name'],
        },
        // {
        //     type: 'Input',
        //     label: '数据源',
        //     name: 'dataSource',
        // },
        {
            type: 'Switch',
            label: '禁用',
            name: 'disabled',
        },
        // {
        //     type: 'function',
        //     label: '底部渲染函数',
        //     name: 'footer',
        // },
        // {
        //     type: 'Select',
        //     label: '自定义样式',
        //     name: 'listStyle',
        //     props: {
        //         options: [
        //             { value: 'ltr', label: 'ltr' },
        //             { value: 'rtl', label: 'rtl' },
        //             { value: 'inherit', label: 'inherit' },
        //         ],
        //     },
        // },
        {
            type: 'Switch',
            label: '单向穿梭',
            name: 'oneWay',
        },
        // {
        //     type: 'function', // CSSProperties
        //     label: '操作栏的自定义样式',
        //     name: 'operationStyle',
        //     render() {
        //         return <OperationStyleSetting label={'操作栏样式'} name="operationStyle" key="operationStyle"></OperationStyleSetting>;
        //     },
        // },
        {
            type: 'Switch',
            label: '显示分页',
            name: 'pagination',
        },

        // {
        //     type: 'function', // string[] | number[]
        //     label: '设置哪些项应该被选中',
        //     key: 'selectedKeys',
        // },
        {
            type: 'Variable', //string[] | number[]
            label: '右侧数据集合',
            name: 'targetKeys',
            tooltip: '针对穿梭框右侧展示数据的集合，可通过配置或变量赋值展示在右侧列表中。',
            // render() {
            //     return <KeySetting label={'选中的key 集合'} name="targetKeys" key="targetKeys" />;
            // },
        },
        {
            type: 'Switch',
            label: '显示搜索框',
            name: 'showSearch',
        },
        {
            type: 'Switch',
            label: '显示全选勾选框',
            name: 'showSelectAll',
        },
        {
            type: 'Select',
            label: '设置校验状态',
            name: 'status',
            props: {
                options: [
                    { value: 'error', label: '错误' },
                    { value: 'warning', label: '警告' },
                ],
            },
        },
        {
            type: 'function', // string[]
            label: '操作按钮名称',
            name: 'operations',
            render() {
                return <OperationsSetting label={'操作文案'} name="operations" key="operations" />;
            },
        },
        {
            type: 'function',
            label: '左上角标题名称',
            name: 'selectAllLabels',
            render() {
                return <OperationsSetting label={'左上角标题名称'} name="selectAllLabels" key="selectAllLabels" />;
            },
        },
        {
            type: 'function', //ReactNode[]
            label: '右上角标题名称',
            name: 'titles',
            render() {
                return <OperationsSetting label={'右上角标题名称'} name="titles" key="titles" />;
            },
        },
        {
            type: 'function',
            label: '渲染函数',
            name: 'render',
            render: () => {
                return <TextSetting key="renderLabel" label="渲染函数" name="renderText" />;
            },
        },
    ],
    config: {
        // 组件默认属性值
        props: {
            disabled: false,
            oneWay: false,
            operations: ['', ''],
            pagination: false,
            // selectedKeys: [],
            showSearch: false,
            showSelectAll: true,
            // targetKeys: [],
            renderText: `(item) => {
                return item.label;
              }`,
            operationStyle: [{}],
            selectAllLabels: ['', ''],
            titles: ['', ''],
            formItem: {
                label: '穿梭框',
                name: 'transfer',
            },
        },
        style: {},
        events: [],
        api: {
            sourceType: 'json',
            // 数据源
            source: {
                key: [0, 1, 2, 3, 4, 5, 6],
                value: [1, 2, 3, 4, 5, 6, 7],
                label: ['content1', 'content2', 'content3', 'content4', 'content5', 'content6', 'content7'],
            },
        },
        source: '',
    },
    // 组件事件
    events: [
        {
            name: 'onChange事件',
            value: 'onChange',
        },
        {
            name: 'onScroll事件',
            value: 'onScroll',
        },
        {
            name: 'onSearch事件',
            value: 'onSearch',
        },
        {
            name: 'onSelectChange事件',
            value: 'onSelectChange',
        },
    ],
};
