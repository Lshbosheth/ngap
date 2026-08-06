/**
 * 组件配置和属性值
 */
import { FormInstance } from 'antd';
import RulesSetting from '../../components/RulesSetting';
export default {
    attrs: [
        {
            type: 'Title',
            label: '标签配置',
            key: 'title',
        },
        {
            type: 'Input',
            label: '标题',
            name: ['formItem', 'label'],
        },
        {
            type: 'Input',
            label: '字段',
            name: ['formItem', 'name'],
        },
        {
            type: 'Variable',
            label: '默认值',
            name: ['defaultValue'],
            tooltip: '多选以逗号分隔，如：空[]、单一[1]、多选[1,2]',
        },
        {
            type: 'Switch',
            label: '是否隐藏标题',
            name: ['formItem', 'noStyle'],
        },
        {
            type: 'Switch',
            label: '禁用',
            name: ['formWrap', 'disabled'],
        },
        {
            type: 'Radio',
            label: '勾选框位置',
            name: ['formWrap', 'checkboxPosition'],
            props: {
                options: [
                    { label: '文本前', value: 'before' },
                    { label: '文本后', value: 'after' },
                ],
                defaultValue: 'before',
            },
            tooltip: '设置勾选框相对于文本的位置',
        },
        {
            type: 'Input',
            label: '提示信息',
            name: ['formItem', 'extra'],
            tooltip: '表单控件下方显示的提示信息',
        },
        {
            type: 'Input',
            label: '注释信息',
            name: ['formItem', 'tooltip'],
            tooltip: '表单项后面显示的提示信息',
        },
        {
            type: 'Title',
            label: '布局',
            key: 'FormLayout',
        },
        {
            type: 'InputNumber',
            label: '标签占位',
            name: ['formItem', 'labelCol', 'span'],
            props: {
                placeholder: '占位格数',
            },
        },
        {
            type: 'InputNumber',
            label: '标签偏移',
            name: ['formItem', 'labelCol', 'offset'],
            props: {
                placeholder: '偏移数',
            },
        },
        {
            type: 'InputNumber',
            label: '控件占列',
            name: ['formItem', 'wrapperCol', 'span'],
            props: {
                placeholder: '占位格数',
            },
        },
        {
            type: 'InputNumber',
            label: '控件偏移',
            name: ['formItem', 'wrapperCol', 'offset'],
            props: {
                placeholder: '偏移数',
            },
        },
        {
            type: 'Switch',
            label: '是否固定列',
            name: ['formWrap', 'fixedColumn'],
            tooltip: '开启后将按固定的每行列数排列，关闭后将根据字段数量自动调整布局',
        },
        {
            type: 'InputNumber',
            label: '每行列数',
            name: ['formWrap', 'columnsPerRow'],
            tooltip: '固定列模式下每行显示的列数，最少1个最多6个',
            props: {
                min: 1,
                max: 6,
                placeholder: '每行列数（1-6）',
            },
        },
        {
            type: 'Title',
            label: '字段映射',
            key: 'fieldMap',
        },
        {
            type: 'Select',
            label: '值',
            name: ['field', 'value'],
            apiOpt: true,
            tooltip: '设置复选选项的key，修改数据源后必须先选“值”再选“标签”',
        },
        {
            type: 'Select',
            label: '标签',
            name: ['field', 'label'],
            apiOpt: true,
            tooltip: '设置复选选项，修改数据源后必须先选“值”再选“标签”',
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
        props: {
            formItem: {
                label: '多选',
                name: 'checkbox',
            },
            formWrap: {
                checkboxPosition: 'before',
                fixedColumn: false,
                columnsPerRow: 2,
            },
            field: {
                label: 'label',
                value: 'value',
            },
            defaultValue:[]
        },
        // 组件样式
        style: {},
        // 接口配置
        api: {
            sourceType: 'json',
            // 数据源
            source: {
                label: ['选项1', '选项2'],
                value: ["1", "2"],
            },
        },
    },
    // 组件事件
    events: [
        {
            value: 'onChange',
            name: 'onChange事件',
        },
    ],
    methods: [
        {
            name: 'update',
            title: '更新数据',
        },
    ],
};
