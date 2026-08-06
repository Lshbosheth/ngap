/**
 * 组件配置和属性值
 */
import { FormInstance } from 'antd';
import RulesSetting from '../../components/RulesSetting';
import CounterDouble from './CounterDouble';
export default {
    attrs: [
        {
            type: 'Title',
            label: '基础配置',
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
            tooltip: '多选以逗号分隔，如：1,2',
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
            type: 'Select',
            label: '尺寸',
            name: ['formWrap', 'size'],
            props: {
                options: [
                    { label: '大', value: 'lg' },
                    { label: '小', value: 'sm' },
                    { label: '默认', value: 'md' },
                ],
            },
        },
        {
            type: 'InputNumber',
            label: '数字间隔',
            name: ['formWrap', 'step'],
            tooltip: '点击加减号，增加/减少的数值',
        },
        {
            type: 'InputNumber',
            label: '最大值',
            name: ['formWrap', 'max'],
        },
        {
            type: 'InputNumber',
            label: '最小值',
            name: ['formWrap', 'min'],
        },

        // {
        //     type: 'Switch',
        //     label: "步进器组",
        //     name: ['formWrap','isDouble']
        // },
        {
            type: 'function',
            render: () => {
                return <CounterDouble />;
            },
        },
        // {
        //     type: 'Title',
        //     label: '步进器组-2',
        //     key: 'counter2',
        //     tooltip: "以下配置只对第二个步进器生效"
        // },
        // {
        //     type: 'InputNumber',
        //     label: '数字间隔',
        //     name: ['formWrap','step2'],
        //     tooltip: '默认为第一个步进器的 step'
        // },
        // {
        //     type: 'InputNumber',
        //     label: '最大值',
        //     name: ['formWrap','max2'],
        //     tooltip: '默认无，仅在第一个步进器的 max 存在时生效'
        // },
        // {
        //     type: 'InputNumber',
        //     label: '最小值',
        //     name: ['formWrap','min2'],
        //     tooltip: '默认为第一个步进器的min，最小值为第一个步进器的 min'
        // },
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
            type: 'Title',
            label: '字段映射',
            key: 'fieldMap',
        },
        {
            type: 'Input',
            label: '标签',
            name: ['field', 'label'],
        },
        {
            type: 'Input',
            label: '值',
            name: ['field', 'value'],
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
                label: '步进器',
                name: 'counter',
            },
            formWrap: {
                disabled: false,
                size: 'md',
                step: 1,
                isDouble: false,
                step2: 1,
            },
            field: {
                label: 'label',
                value: 'value',
            },
        },
        // 组件样式
        style: {},
        // 接口配置
        api: {},
    },
    // 组件事件
    events: [
        {
            value: 'onAddOne',
            name: 'onAddOne事件',
        },
        {
            value: 'onMinusOne',
            name: 'onMinusOne事件',
        },
        {
            value: 'onChangeOne',
            name: 'onChangeOne事件',
        },
        {
            value: 'onAddTwo',
            name: 'onAddTwo事件',
        },
        {
            value: 'onMinusTwo',
            name: 'onMinusTwo事件',
        },
        {
            value: 'onChangeTwo',
            name: 'onChangeTwo事件',
        },
    ],
    methods: [
        {
            name: 'getValue',
            title: '获取值',
        },
    ],
};
