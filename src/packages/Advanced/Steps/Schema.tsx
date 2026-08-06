import { FormInstance } from 'antd';
import StepSetting from './StepSetting';
/**
 * 组件配置和属性值
 */
export default {
    // 组件属性配置JSON
    attrs: [
        {
            type: 'Title',
            label: '步骤配置',
            key: 'steps-title',
        },
        {
            type: 'function',
            render(form: FormInstance) {
                return <StepSetting key="step-setting" form={form} />;
            },
        },
        {
            type: 'Title',
            label: '基础配置',
            key: 'basic',
        },
        {
            type: 'Variable',
            label: '当前步骤',
            name: ['current'],
        },
        {
            type: 'InputNumber',
            label: '起始序号',
            name: ['initial'],
        },
        {
            type: 'Select',
            label: '尺寸',
            name: ['size'],
            props: {
                options: [
                    { value: 'large', label: '大' },
                    { value: 'default', label: '中' },
                    { value: 'small', label: '小' },
                ],
            },
        },
        {
            type: 'Select',
            label: '方向',
            name: ['direction'],
            props: {
                options: [
                    { value: 'horizontal', label: '水平' },
                    { value: 'vertical', label: '竖直' },
                ],
            },
        },
        {
            type: 'Variable',
            label: '步骤间距(px)',
            name: ['gap'],
            tooltip: '控制竖直模式步骤间距、线条长度,水平模式间距请设置样式宽度实现',
            condition: (props: any) => (props?.direction === 'vertical'),
            props: {
                min: 0,
                style: { width: '100%' },
            },
        },
        {
            type: 'InputNumber',
            label: '进度',
            name: ['percent'],
            tooltip: '当前 process 步骤显示的进度条进度（只对基本类型的 Steps 生效）',
        },
        {
            type: 'Select',
            label: '当前步骤状态',
            name: ['status'],
            props: {
                options: [
                    { value: 'wait', label: '等待' },
                    { value: 'process', label: '进行中' },
                    { value: 'processing', label: '办理中' },
                    { value: 'finish', label: '完成' },
                    { value: 'error', label: '错误' },
                ],
            },
        },
        {
            type: 'Switch',
            label: '点状步骤条',
            name: ['progressDot'],
        },
        {
            type: 'Select',
            label: '标签位置',
            name: ['labelPlacement'],
            tooltip: '默认水平放图标右侧，可选 vertical 放图标下方',
            props: {
                options: [
                    { value: 'horizontal', label: '水平' },
                    { value: 'vertical', label: '竖直' },
                ],
            },
        },
        {
            type: 'Select',
            label: '类型',
            name: ['type'],
            props: {
                options: [
                    { value: 'default', label: '默认' },
                    { value: 'navigation', label: '导航' },
                    // { value: 'inline', label: 'inline' },
                ],
            },
        },
        {
            type: 'Switch',
            label: '响应式',
            name: ['responsive'],
            tooltip: '当屏幕宽度小于 532px 时自动变为垂直模式',
        },
    ],

    config: {
        // 组件默认属性值
        props: {
            type: 'default',
            current: 1,
            direction: 'horizontal',
            initial: 0,
            gap:15,
            labelPlacement: 'horizontal',
            progressDot: false,
            responsive: true,
            size: 'small',
            status: 'process',
            centered: false,
            hideAdd: true,
            destroyInactiveTabPane: false,
            items: [
                {
                    title: '完成',
                },
                {
                    title: '进行中',
                },
                {
                    title: '等待',
                },
            ],
        },
        // 组件样式
        style: {},
        // 事件
        events: [],
    },
    // 组件事件
    events: [
        {
            value: 'onChange',
            name: '切换事件',
        },
    ],
    methods: [],
};
