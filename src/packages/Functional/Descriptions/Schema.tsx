/**
 * 组件配置和属性值
 */

import { FormInstance } from "antd";
import DescItemSetting from "./DescItemSetting";
import ColorPickerSetting from "@/packages/components/ColorPicker/ColorPickerSetting";

const colorSource = [
    { title: "灰色", value: "#00000005" },
    { title: "浅蓝", value: "#E6EDF5" }
];

export default {
    // 组件属性配置JSON
    attrs: [
        {
            type: 'Title',
            label: '基础设置',
            key: 'basic',
        },
        {
            type: 'Input',
            label: '标题',
            name: ['title'],
        },
        {
            type: 'Switch',
            label: '展示边框',
            name: ['bordered'],
        },
        {
            type: 'Switch',
            label: '展示冒号',
            name: ['colon'],
        },
        {
            type: 'InputNumber',
            label: '一行列数',
            name: ['column'],
        },
        {
            type: 'Select',
            label: '布局',
            name: ['layout'],
            tooltip: '文字和内容的排列',
            props: {
                options: [
                    { value: 'horizontal', label: '水平' },
                    { value: 'vertical', label: '垂直' },
                ],
            },
        },
        {
            type: 'Select',
            label: '列表大小',
            name: ['size'],
            props: {
                options: [
                    { value: 'default', label: '默认' },
                    { value: 'middle', label: '中等' },
                    { value: 'small', label: '小号' },
                ],
            },
        },
        {
            type: 'Select',
            label: '空值显示',
            name: ['empty'],
            props: {
                options: [
                    { label: '空', value: '' },
                    { label: '-', value: '-' },
                    { label: '/', value: '/' },
                ],
            },
        },
        {
            type: 'function',
            name:'labelBg',
            render: (form: FormInstance) => {
                return <ColorPickerSetting label={'列名背景色'} name={'labelBg'} form={form} dataSource={colorSource}/>;
            }
        },
        {
            type: 'Title',
            label: '列表设置',
            key: 'ListSet',
        },
        {
            type: 'function',
            key: 'DescItemSetting',
            render(data: any) {
                return <DescItemSetting key="DescItemSetting" form={data?.form} config={data?.config} />;
            },
        },
    ],
    config: {
        // 组件默认属性值
        props: {
            title: '用户信息',
            colon: true,
            column: 3,
            layout: 'horizontal',
            size: 'default',
            empty: '-',
            items: [
                { label: '名称', name: 'name', type: 'text', span: 1 },
                { label: '类型', name: 'type', type: 'text', span: 1 },
                { label: '归属省份', name: 'provId', type: 'text', span: 1 },
                { label: '地区分布', name: 'createdAt', type: 'text', span: 1 },
            ],
            bordered:true,
            labelBg:'#00000005'
        },
        // 组件样式
        style: {},
        // 事件
        events: [],
        api: {
            sourceType: 'json',
            sourceField: 'data.list',
            // 数据源
            source: [
                {
                    id: 1001,
                    name: '应用集成平台',
                    type: 'ngap',
                    provId: 'xx',
                    createdAt: new Date().getTime(),
                },
            ],
        },
    },
    // 组件事件
    events: [
        {
            value: 'onClick',
            name: '点击事件',
        },
    ],
    methods: [
        {
            name: 'startLoading',
            title: '开始loading',
        },
        {
            name: 'endLoading',
            title: '结束loading',
        },
    ],
};
