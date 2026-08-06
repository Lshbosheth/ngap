/**
 * 组件配置和属性值
 */
import { FormInstance } from 'antd';
import RulesSetting from '../../components/RulesSetting';
export default {
    // 组件属性配置JSON
    attrs: [
        {
            type: 'Title',
            label: '标签配置',
            key: 'formItem',
        },
        {
            type: 'Input',
            label: '标题',
            name: ['formItem', 'label'],
            props: {
                placeholder: '请输入文本标题',
            },
        },
        {
            type: 'Switch',
            label: '禁用',
            name: ['formWrap', 'disable'],
        },
        {
            type: 'Input',
            label: '字段',
            name: ['formItem', 'name'],
            props: {
                placeholder: '请输入提交字段',
            },
        },
        {
            type: 'Switch',
            label: '显示清除按钮',
            name: ['formWrap', 'allowClear'],
        },
        {
            type: 'Switch',
            label: '显示边框',
            name: ['formWrap', 'bordered'],
        },
        {
            type: 'Input',
            label: '默认文字',
            name: ['formWrap', 'placeholder'],
            props: {
                placeholder: '请输入默认文字',
            },
            tooltip: '选择框默认文字',
        },
        {
            type: 'Switch',
            label: '多选',
            name: ['formWrap', 'treeCheckable'],
        },
        {
            type: 'Switch',
            label: '异步加载',
            name: ['formWrap', 'async'],
        },
        {
            type: 'Input',
            label: '异步加载参数',
            name: ['formWrap', 'asyncKey'],
            tooltip: '请求子节点数据时，自动提交父节点值的key，默认为数据映射中的节点值',
        },
        {
            type: 'Switch',
            label: '显示图标',
            name: ['formWrap', 'treeIcon'],
        },
        {
            type: 'Switch',
            label: '显示连线',
            name: ['formWrap', 'treeLine'],
        },
        // {
        //     type: 'Switch',
        //     label: '选中label',
        //     name: ['formWrap', 'labelInValue'],
        //     tooltip: '是否把每个选项的 label 包装到 value 中',
        // },
        {
            type: 'Variable',
            label: '默认选中节点',
            name: ['defaultValue'],
            props: {
                placeholder: '请输入提交字段',
            },
        },
        // {
        //     type: 'Variable',
        //     label: '选中的条目',
        //     name: ['formWrap', 'value'],
        //     tooltip: '选中的条目',
        // },
        {
            type: 'Switch',
            label: '支持搜索框',
            name: ['formWrap', 'showSearch'],
        },
        {
            type: 'Switch',
            label: '默认展开所有',
            name: ['formWrap', 'treeDefaultExpandAll'],
            tooltip: '默认展开所有树节点',
        },
        {
            type: 'Variable',
            label: '默认展开节点',
            name: ['formWrap', 'treeDefaultExpandedKeys'],
        },
        // {
        //     type: 'Variable',
        //     label: '设置展开的树节点',
        //     name: ['formWrap', 'treeExpandedKeys'],
        //     tooltip: '设置展开的树节点',
        // },
        {
            type: 'InputNumber',
            label: '虚拟滚动高度',
            name: ['formWrap', 'listHeight'],
        },
        {
            type: 'Select',
            label: '弹出位置',
            name: ['formWrap', 'placement'],
            tooltip: '选择面板弹出的位置',
            props: {
                options: [
                    { label: '上', value: 'topLeft' },
                    // { label: '右上', value: 'topRight' },
                    // { label: '左下', value: 'bottomLeft' },
                    { label: '下', value: 'bottomRight' },
                ],
            },
        },
        {
            type: 'Title',
            label: '数据映射',
            key: 'fieldNamesTitle',
        },
        {
            type: 'Select',
            label: '节点名称',
            name: ['formWrap', 'fieldNames', 'label'],
            apiOpt: true,
        },
        {
            type: 'Select',
            label: '节点值',
            name: ['formWrap', 'fieldNames', 'value'],
            apiOpt: true,
        },
        {
            type: 'Input',
            label: '子节点标识',
            name: ['formWrap', 'fieldNames', 'children'],
        },
        {
            type: 'Title',
            label: '校验规则',
            key: 'rules',
        },
        {
            type: 'function',
            render: (form: FormInstance) => {
                return <RulesSetting key="rule-list" form={form} />;
            },
        },
    ],
    config: {
        // 组件默认属性值
        props: {
            formItem: {
                label: '弹出树',
                name: 'treeSelect',
            },
            formWrap: {
                showSearch: true,
                treeCheckable: false,
                treeDefaultExpandAll: false,
                labelInValue: false,
                allowClear: false,
                bordered: true,
                placeholder: '请输入搜索内容',
                listHeight: 256,
                placement: 'bottomRight',
                treeIcon: true,
                treeLine: false,
                async: false,
                fieldNames: {
                    label: 'title',
                    value: 'key',
                    children: 'children',
                },
            },
        },
        style: {},
        events: [],
        api: {
            sourceType: 'json',
            // 数据源
            source: {
                title: ['Node1', 'Node2'],
                value: ['0-0', '0-1'],
                key: ['0-0', '0-1'],
                children: [
                    [
                        {
                            title: 'Child Node1',
                            value: '0-0-1',
                            key: '0-0-1',
                        },
                        {
                            title: 'Child Node2',
                            value: '0-0-2',
                            key: '0-0-2',
                        },
                    ],
                    [],
                ],
            },
        },
        source: '',
    },
    // 组件事件
    events: [
        {
            value: 'onChange',
            name: 'onChange事件',
        },
        {
            value: 'onDropdownVisibleChange',
            name: '展开下拉菜单的回调',
        },
        {
            value: 'onSearch',
            name: '文本框值变化时的回调',
        },
        {
            value: 'onSelect',
            name: '选中树节点时调用',
        },
        {
            value: 'onTreeExpand',
            name: '展示节点时调用',
        },
    ],
    methods: [
        {
            name: 'update',
            title: '更新数据',
        },
        {
            name: 'getCheckedKeys',
            title: '获取勾选节点的keys',
        },
        {
            name: 'setCheckedKeys',
            title: '设置勾选节点，入参key[]',
        },
        {
            name: 'getExpandedKeys',
            title: '获取展开节点的keys',
        },
        {
            name: 'setExpandedKeys',
            title: '设置展开节点，入参key[]',
        },
    ],
};
