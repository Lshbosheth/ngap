/**
 * 组件配置和属性值
 */

import { triggerFocus } from 'antd/es/input/Input';

export default {
    // 组件属性配置JSON
    attrs: [
        {
            type: 'Title',
            label: '基础配置',
            key: 'formItem',
        },
        {
            type: 'Input',
            label: '分隔符',
            name: 'separator',
            props: {
                placeholder: '请输入分隔符',
            },
        },
        {
            type: 'InputNumber',
            label: '当前被选中序号',
            name: 'selectedIndex',
            props: {
                placeholder: '被选中序号',
            },
        },
        {
            type: 'InputNumber',
            label: '最大长度',
            name: 'maxLength',
            props: {
                placeholder: '最大长度',
            },
        },
        {
            type: 'InputNumber',
            label: '挂载索引',
            name: 'menuMountIndex',
            props: {
                placeholder: '挂载索引',
            },
        },
    ],
    config: {
        // 组件默认属性值
        props: {
            separator: '/',
            selectedIndex: 5,
            maxLength: 5,
            menuMountIndex: 2,
        },
        style: {},
        events: [],
        api: {
            sourceType: 'json',
            sourceField: 'data.list',
            // 数据源
            source: [
                { title: '首页', path: '/', disabled: false },
                { title: '页面A', path: '/', disabled: false },
                { title: '测试一下面包屑页面B', path: '/', disabled: false },
                { title: '测试一下面包屑页面C', path: '/', disabled: false },
                { title: '测试一下面包屑页面D', path: '/', disabled: false },
                { title: '当前页', path: '/', disabled: false },
            ],
        },
        source: '',
    },
    // 组件事件
    events: [
        {
            value: 'onClick',
            name: 'onClick事件',
        },
    ],
};
