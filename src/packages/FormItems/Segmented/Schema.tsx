import { FormInstance } from 'antd';
import CollapseSetting from './CollapseSetting';
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
            label: '标题内容',
            name: 'text',
        },
        {
            type: 'Input',
            label: '字段',
            name: ['formItem', 'name'],
        },
                {
            type: 'Variable',
            label: '默认值',
            name: 'defaultValue',
        },
            {
            type: 'Switch',
            label: '隐藏标题',
            name: 'hiddenTitle',
        },

 
        {
            type: 'Title',
            label: '表单配置',
            key: 'format_config',
        },
                {
            type: 'Select',
            label: '展示形式',
            name: ['showType'],
            props: {
                options: [
                    { value: '1', label: '标签名称' },
                    { value: '2', label: '标签图标' },
                    { value: '3', label: '图标名称' },
                ],
            },
        },
                {
                    type: 'function',
                    render(form: FormInstance) {
                        return <CollapseSetting key="tab-setting" form={form} />;
                    },
                },

       
        {
            type: 'Switch',
            label: '自适应',
            name: 'block',
        },
    ],
    config: {
        // 组件默认属性值
        props: {
             formItem: {
                name: '',
            },
            text: '分段选择',
            defaultValue:'',
            hiddenTitle:false,
            showType:'1',
            block:false
        },
        style: {
            margin: 0,
        },
        events: [],
        api: {},
        source: '',
    },
    // 组件事件
    events: [
        {
            value: 'onChange',
            name: '切换事件',
        },
    ],
    // 组件接口
    api: {},
};
