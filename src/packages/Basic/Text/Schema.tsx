import { fontWeight } from 'html2canvas/dist/types/css/property-descriptors/font-weight';
import TextSetting from './../../components/TextSetting';
import { LineHeightOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd';
import TextEventsSetting from './TextEventsSetting';

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
            type: 'Variable',
            label: '文本内容',
            name: 'text',
        },
        {
            type: 'Switch',
            label: '溢出省略',
            name: 'ellipsis',
        },
        {
            type: 'Select',
            label: '文本类型',
            name: 'type',
            props: {
                options: [
                    { value: '', label: '默认' },
                    { value: 'secondary', label: '弱提示' },
                    { value: 'success', label: '成功提示' },
                    { value: 'warning', label: '警告提示' },
                    { value: 'danger', label: '错误提示' },
                ],
            },
        },
        {
            type: 'Select',
            label: '文本格式',
            name: 'format',
            props: {
                options: [
                    { value: '', label: '默认' },
                    { value: 'YYYY-MM-DD HH:mm:ss', label: '年-月-日 时:分:秒' },
                    { value: 'YYYY-MM-DD', label: '年-月-日' },
                    { value: 'HH:mm:ss', label: '时:分:秒' },
                    { value: 'money', label: '金额千分位' },
                    { value: 'number', label: '数字千分位' },
                    { value: 'percent', label: '百分比' },
                ],
            },
        },
        {
            type: 'Switch',
            label: '悬浮提示',
            name: 'showtips',
        },
        {
            type: 'InputNumber',
            label: '提示字号',
            name: 'tipFontSize',
            tooltip: '配置后可改变悬浮提示的字号(px)，最小10，最大24，默认14',
            props: {
                min: 10,
                max: 24,
            }
        },
        {
            type: 'Input',
            label: '自定义提示',
            name: 'tip_text',
            tooltip: '设置后鼠标放在文本元素上方时悬浮展示自定义提示内容，若未设置则默认悬浮展示文本自身内容',
            props: {
                placeholder: '未设置则悬浮文本内容信息。'
            }
        },
        {
            type: 'function',
            label: '自定义渲染',
            key: 'render',
            render: () => {
                return <TextSetting key="render" label="自定义" name="script" />;
            },
        },
        {
            type: 'Title',
            label: '事件配置',
            key: 'events',
        },
        {
            type: 'function',
            label: '事件名称配置',
            name: 'events',
            render(form: FormInstance, config: any) {
                return <TextEventsSetting key="TextEventsSetting" form={form} />;
            }
        },
        {
            type: 'Title',
            label: '格式配置',
            key: 'format_config',
        },
        // {
        //     type: 'Switch',
        //     label: '代码格式',
        //     name: 'code',
        // },
        {
            type: 'Switch',
            label: '删除线',
            name: 'delete',
        },
        // {
        //     type: 'Switch',
        //     label: '禁用文本',
        //     name: 'disabled',
        // },
        {
            type: 'Switch',
            label: '是否可复制',
            name: 'copyable',
        },
        // {
        //     type: 'Switch',
        //     label: '标记格式',
        //     name: 'mark',
        // },
        {
            type: 'Switch',
            label: '是否加粗',
            name: 'strong',
        },
        {
            type: 'Switch',
            label: '是否斜体',
            name: 'italic',
        },
        {
            type: 'Switch',
            label: '下划线',
            name: 'underline',
        },
    ],
    config: {
        // 组件默认属性值
        props: {
            text: '可针对当前展示内容通过自定义编码方式进行重新输出',
            type: '',
            format: '',
            copyable: false,
            underline: false,
            strong: false,
            italic: false,
            delete: false,
            script: `function render(value){
    return value;
}`,
            showTips: false,
            tipFontSize: 14,
        },
        style: {
            display: 'block',
            width: 'auto',
            height: '20px',
            fontSize: '13px',
            fontWeight: '400',
            lineHeight: '20px',
            color: '#333333',
        },
        events: [],
        api: {
            sourceType: 'json',
            sourceField: 'List',
            // 数据源
            source: '',
        },
        source: '',
    },
    // 组件事件
    events: [
        {
            value: 'onClick',
            name: '点击事件',
        },
    ],
    // 组件接口
    api: {},
};
