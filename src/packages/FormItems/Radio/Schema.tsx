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
        },
        {
            type: 'Switch',
            label: '是否隐藏标题',
            name: ['formItem', 'noStyle'],
        },
        {
            type: 'Select',
            label: '按钮类型',
            name: ['formWrap', 'optionType'],
            props: {
                options: [
                    { value: 'default', label: '默认' },
                    { value: 'button', label: '按钮' },
                ],
            },
        },
        {
            type: 'Select',
            label: '按钮样式',
            name: ['formWrap', 'buttonStyle'],
            tooltip: '指定按钮类型为按钮后，才会生效',
            props: {
                options: [
                    { value: 'outline', label: '虚线' },
                    { value: 'solid', label: '实线' },
                ],
            },
        },
        {
            type: 'Switch',
            label: '禁用',
            name: ['formWrap', 'disabled'],
        },
        {
            type: 'Radio',
            label: '单选框位置',
            name: ['formWrap', 'radioPosition'],
            props: {
                options: [
                    { label: '文本前', value: 'before' },
                    { label: '文本后', value: 'after' },
                ],
                defaultValue: 'before',
            },
            tooltip: '设置单选框相对于文本的位置',
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
            tooltip: '设置单选选项的key，修改数据源后必须先选“值”再选“标签”',
        },
        {
            type: 'Select',
            label: '标签',
            name: ['field', 'label'],
            apiOpt: true,
            tooltip: '设置单选选项，修改数据源后必须先选“值”再选“标签”',
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
                label: '单选',
                name: 'radio',
            },
            formWrap: {
                radioPosition: 'before',
                optionType: 'default',
                buttonStyle: 'solid',
                fixedColumn: false,
                columnsPerRow: 2,
            },
            field: {
                label: 'label',
                value: 'value',
            },
            defaultValue: '1',
        },
        // 组件样式
        style: {
            fontSize: '13px',
            fontWeight: '400',
            color: '#333333',
        },
        // 接口配置
        api: {
            sourceType: 'json',
            // 数据源
            source: {
                label: ['选项1', '选项2'],
                value: ['1', '2'],
            },
        },
    },
    // 组件事件
    events: [
        {
            value: 'onLoad',
            name: '初始化事件',
        },
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
        {
            name: 'selectItem',
            title: '选中选项',
            params:[{title:'目标选项',name:'target',required:true,}]
        },
        {
            name: 'disableItem',
            title: '禁用选项',
            params:[{title:'目标选项',name:'target',required:true,}]
        },
    ],
};
