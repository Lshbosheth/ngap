import { FormInstance } from 'antd';
import ActionSetting from './../../../components/BulkAction/ActionSetting';

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
            label: '样式',
            name: 'showstyle',
            props: {
                options: [
                    { value: 'circlespin', label: '转圈加载' },
                    { value: 'logospin', label: '移动logo加载' },
                    { value: 'tablespin', label: '表格加载' },
                ],
            },
        },
        {
            type: 'Select',
            label: '大小',
            name: 'size',
            props: {
                options: [
                    { value: 'default', label: '默认' },
                    { value: 'large', label: '大' },
                    { value: 'small', label: '小' },
                ],
            },
        },
    ],
    config: {
        // 组件默认属性值
        props: {
            showstyle: 'circlespin',
            size: 'default',
        },
        // 组件样式
        style: {},
        // 事件
        events: [],
    },
    // 组件事件
    events: [],
    methods: [],
};
