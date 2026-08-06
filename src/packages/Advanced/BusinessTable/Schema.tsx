/**
 * 组件配置和属性值
 */
import React from 'react';
import { Button, Input, Select, Form, FormInstance } from 'antd';
import TableSetting from './TableSetting';
import ActionSetting from '../../../components/BulkAction/ActionSetting';
import StatisticsConfig from './StatisticsConfig';
import StatisticsConfigWrapper from './StatisticsConfigWrapper';
export default {
    // 组件属性配置JSON
    attrs: [
        {
            type: 'Title',
            label: '操作栏',
        },
        {
            type: 'function',
            render(form: FormInstance) {
                return <ActionSetting key="ActionSetting" form={form} />;
            },
        },
        {
            type: 'Title',
            label: '表格配置',
        },
        {
            type: 'Input',
            label: '标题',
            name: ['leftTitle'],
        },
        {
            type: 'Switch',
            label: '显示边框',
            name: ['bordered'],
        },
        {
            type: 'InputNumber',
            label: '滚动轴(x)',
            name: ['scroll', 'x'],
            tooltip: '如果需要横向滚动，请设置x值，尽量比表格实际宽度大',
            props: {
                placeholder: 'eg: 1000',
            },
        },
        {
            type: 'InputNumber',
            label: '滚动轴(y)',
            name: ['scroll', 'y'],
            tooltip: '如果需要纵向滚动，请设置y值来固定高度',
            props: {
                placeholder: 'eg: 600',
            },
        },
        {
            type: 'Switch',
            label: '虚拟滚动',
            name: ['virtual'],
            tooltip: '开启虚拟滚动时，必须设置滚动轴X和Y值。',
        },
        {
            type: 'Select',
            label: '空值显示',
            name: ['empty'],
            tooltip: '列返回空时，展示的内容',
            props: {
                options: [
                    { label: '无', value: '' },
                    { label: '-', value: '-' },
                    { label: '/', value: '/' },
                ],
            },
        },
        {
            type: 'Select',
            label: '表格尺寸',
            name: ['size'],
            props: {
                options: [
                    { label: '宽松', value: 'large' },
                    { label: '中等(默认)', value: 'middle' },
                    { label: '紧凑', value: 'small' },
                ],
            },
        },
        {
            type: 'InputNumber',
            label: '固定前N列',
            name: ['fixNColumns'],
            tooltip: '设置后可将表格前N列信息固定展示，表格列过多时固定列不随滚动条滚动隐藏',
            props: {
                min: 0
            }
        },
        {
            type: 'Title',
            label: '列配置',
            key: 'columnConfig',
        },
        {
            type: 'Input',
            label: 'rowKey',
            name: ['rowKey'],
            tooltip: '建议把列表返回的唯一值设置为rowKey',
            props: {
                placeholder: 'eg: id',
            },
        },
        {
            type: 'function',
            key: 'TableSetting',
            render(data: any) {
                return <TableSetting key="TableSetting" form={data?.form} config={data?.config} />;
            },
        },
        {
            type: 'Title',
            label: '行配置',
            key: 'rowConfig'
        },
        {
            type: 'Select',
            label: '单选/多选',
            name: ['selectionType'],
            props: {
                options: [
                    { label: '无', value: '' },
                    { label: '单选', value: 'radio' },
                    { label: '多选', value: 'checkbox' },
                ],
            },
        },
        {
            type: 'Select',
            label: '可选层级',
            name: ['selectedLevel'],
            props: {
                options: [
                    { label: '全部层级', value: 'all' },
                    { label: '第一层级', value: 'first' },
                ],
            },
            tooltip: '列表数据分层展示时，控制子层级数据是否可选择'
        },
        {
            type: 'Variable',
            label: '默认选中',
            name: ['defaultSelectedRowKeys'],
            tooltip: '可配置表格加载时默认选中行信息（rowkey），实现数据选中。若自定义默认项，启用单选时按自定义项中符合条件的第一项进行选中，启用第一层级可选时，判断符合条件的默认项为第一层级时选中生效。',
            props: {
                placeholder: 'eg: 1001,1002',
            },
        },
        {
            type: 'Switch',
            label: '开启行点击',
            name: ['rowClick'],
        },
        {
            type: 'ColorPicker',
            label: '选中背景色',
            name: ['rowConfig', 'rowClickColor'],
        },
        {
            type: 'ColorPicker',
            label: '悬浮背景色',
            name: ['rowConfig', 'rowHoverColor'],
        },
        {
            type: 'Title',
            label: '展开配置',
            key: 'expandable',
            tooltip: '树形表格时生效',
        },
        {
            type: 'Input',
            label: '树形结构列名',
            name: ['expandable', 'childrenColumnName'],
        },
        {
            type: 'Switch',
            label: '展开所有',
            name: ['expandable', 'defaultExpandAllRows'],
        },
        {
            type: 'InputNumber',
            label: '缩进宽度',
            name: ['expandable', 'indentSize'],
        },
        {
            type: 'Title',
            label: '分页配置',
            key: 'pageConfig',
        },
        {
            type: 'Switch',
            label: '隐藏分页',
            name: ['hidePager'],
        },
        {
            type: 'Select',
            label: '显示位置',
            name: ['pagination', 'position'],
            props: {
                mode: 'multiple',
                options: [
                    { label: '左上', value: 'topLeft' },
                    { label: '右上', value: 'topRight' },
                    { label: '左下', value: 'bottomLeft' },
                    { label: '右下', value: 'bottomRight' },
                ],
            },
        },
        {
            type: 'InputNumber',
            label: '每页条数',
            name: ['pagination', 'pageSize'],
        },
        {
            type: 'Switch',
            label: '显示总条数',
            name: ['pagination', 'showTotal'],
        },
        {
            type: 'Switch',
            label: '显示切换器',
            name: ['pagination', 'showSizeChanger'],
        },
        {
            type: 'Switch',
            label: '显示跳转',
            name: ['pagination', 'showQuickJumper'],
        },
        {
            type: 'Title',
            label: '分页参数',
            key: 'fieldmap',
            tooltip: '表格中配置分页项时，需要配置页码、每页步长、总条数对应的接口参数，根据选择的参数进行跳转不同的页面',
            // popover: {
            //     title: '结构说明',
            //     placement: 'left',
            //     content: (
            //         <>
            //             <p>默认结构：{"{ code: 0, data: { list: [], pageNum:1, pageSize: 10, total: 10 }, msg: '' }"}</p>
            //             <p>1. 如果接口返回不是code/data/msg，可以在接口配置中修改映射。</p>
            //             <p>2. 如果接口返回分页结构不是pageNum/pageSize/total，可以在此处修改映射。</p>
            //             <p>3. 如果接口分页结构嵌套的有对象，支持链式写法，如：page.pageNum</p>
            //             <p>4. 如果接口分页对象在data外面，需要再拦截器里面或者脚本里面处理，把分页和list放在data里面。</p>
            //         </>
            //     ),
            // },
        },
        {
            type: 'Input',
            label: '页码',
            name: ['field', 'pageNum'],
        },
        {
            type: 'Input',
            label: '每页步长',
            name: ['field', 'pageSize'],
        },
        {
            type: 'Select',
            label: '总条数',
            name: ['field', 'total'],
            apiOpt: true,
        },
        {
            type: 'Title',
            label: '合计配置',
            key: 'summarymap'
        },
        {
            type: 'Switch',
            label: '显示合计行',
            key: 'showSummary',
            name: ["showSummary"],
            tooltip: '开启后在列表下方新增合计行展示。'
        },
        {
            type: 'Switch',
            label: '固定合计行',
            name: ['summaryFixed']
        },
        {
            type: 'Input',
            label: '合计行名称',
            name: ['summaryName'],
            tooltip: '合计行名字默认展示在第一列，列数判断时包含展示的选择列。单列合计能力请在列配置中分别启用。'
        },
        {
            type: 'Title',
            label: '统计配置',
            key: 'statisticsConfig',
            tooltip: '1、默认统计某一列数据选中行的加和；2、启用‘选中列’，则统计选中列和选中行对应数据加和，单选列或行不统计数据。',
        },
        {
            type: 'function',
            key: 'StatisticsConfig',
            render(data: any) {
                return <StatisticsConfigWrapper key="StatisticsConfigWrapper" form={data?.form} config={data?.config} />;
            },
        }
    ],
    config: {
        props: {
            rowKey: 'id',
            size: 'middle',
            bordered: true,
            selectionType: '',
            selectedLevel: 'all',
            leftTitle: '查询列表',
            empty: '-',
            expandable: {
                defaultExpandAllRows: true,
                childrenColumnName: 'children',
                indentSize: 15,
            },
            fixNColumns: 0,
            // 组件默认属性值
            columns: [
                {
                    title: '姓名',
                    dataIndex: 'name',
                    key: 'name',
                    width: 190,
                    align: 'left',
                },
                {
                    title: '类型',
                    dataIndex: 'type',
                    key: 'type',
                    width: 80,
                    align: 'left',
                },
                // {
                //     title: '头像',
                //     dataIndex: 'avatar',
                //     key: 'avatar',
                //     type: 'image',
                //     width: 90,
                //     align: 'center',
                //     imageConfig: {
                //         width: 30,
                //         height: 30,
                //     },
                // },
                {
                    title: '分布区域',
                    dataIndex: 'area',
                    key: 'area',
                    width: 230,
                    align: 'left',
                },
                //                 {
                //                     title: '周期',
                //                     dataIndex: 'time',
                //                     key: 'time',
                //                     render: `function render(text,record){
                //     return text + "个月"
                // }`,
                //                     width: 110,
                //                 },
                {
                    title: '技能',
                    dataIndex: 'skill',
                    key: 'skill',
                    type: 'tag',
                    width: 200,
                    align: 'left',
                },
                // {
                //     title: '售价',
                //     dataIndex: 'sales',
                //     key: 'sales',
                //     type: 'money',
                //     width: 90,
                //     align: 'center',
                // },
                {
                    title: '状态',
                    dataIndex: 'status',
                    key: 'status',
                    type: 'status',
                    width: 90,
                    align: 'left',
                    //render: `function render(text,record){
                    //     return {
                    //       status: "processing",
                    //       text: text
                    //     }
                    // }`,
                },
                {
                    title: '创建时间',
                    dataIndex: 'createAt',
                    key: 'createAt',
                    type: 'date1',
                    width: 130,
                    align: 'left',
                },
                {
                    title: '操作',
                    key: 'action',
                    type: 'action',
                    dataIndex: 'action',
                    width: 220,
                    align: 'left',
                    list: [
                        { text: '详情', type: 'link', eventName: 'DynamicDetail' },
                        { text: '编辑', type: 'link', eventName: 'DynamicEdit' },
                        { text: '删除', type: 'link', danger: true, eventName: 'DynamicDelete' },
                    ],
                },
            ],
            hidePager: false,
            pagination: {
                total: 0,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                position: ['bottomRight'],
                pageSizeOptions: [10, 20, 50, 100],
                showTotal: true,
            },
            field: {
                pageNum: 'pageNum',
                pageSize: 'pageSize',
                total: 'total',
            },
            showSummary: false,
            summaryFixed: true,
            summaryName: "合计",
            statisticsConfig: []
        },
        // 组件样式
        style: {
            background: '#fff',
            padding: '0 20px',
            margin: '20px 0 0',
            border: '1px solid #e6e6e6',
            borderRadius: '3px',
            fontSize: '13px'
        },
        events: [],
        api: {
            sourceType: 'json',
            // 数据源
            source: {
                id: [1001, 1003],
                name: ['***', '***'],
                type: ['*', '**'],
                avatar: ['./ngap/imgs/ngap-logo.png', './ngap/imgs/ngap-logo.png'],
                time: [10, 10],
                skill: [
                    ['**', '**', '**'],
                    ['**', '**', '**'],
                ],
                sales: [9.9, 9.9],
                status: ['**', '**'],
                createAt: [new Date().getTime(), new Date().getTime()],
                action:['',''],
                area: ['******', '******'],
                children: [
                    [
                        {
                            id: 1002,
                            name: '***',
                            type: '**',
                            avatar: './ngap/imgs/ngap-logo.png',
                            time: 10,
                            skill: ['**', '**', '**'],
                            sales: 9.9,
                            status: '**',
                            createAt: new Date().getTime(),
                            action: '',
                            children: [
                                {
                                    id: 10021,
                                    name: '***',
                                    type: '**',
                                    avatar: './ngap/imgs/ngap-logo.png',
                                    time: 10,
                                    skill: ['**', '**', '**'],
                                    sales: 9.9,
                                    status: '**',
                                    createAt: new Date().getTime(),
                                    action: '',
                                },
                            ]
                        },
                    ],
                    [
                        {
                            id: 1004,
                            name: '**',
                            type: '**',
                            avatar: './ngap/imgs/ngap-logo.png',
                            time: 10,
                            skill: ['**', '**', '**'],
                            sales: 9.9,
                            status: '**',
                            createAt: new Date().getTime(),
                            action: '',
                        },
                    ],
                ],
            },
        },
    },
    // 组件事件,动态事件需要以Dynamic开头
    events: [
        {
            value: 'onCheckedChange',
            name: '单选/多选事件',
        },
        {
            value: 'headerCheck',
            name: '选中列事件',
        },
        {
            value: 'cellCheck',
            name: '选中单元格事件',
        },
        {
            value: 'DynamicDetail',
            name: '点击查看事件',
        },
        {
            value: 'DynamicEdit',
            name: '点击编辑事件',
        },
        {
            value: 'DynamicDelete',
            name: '点击删除事件',
        },
    ],
    methods: [
        {
            name: 'search',
            title: '搜索',
        },
        {
            name: 'reload',
            title: '刷新',
        },
        {
            name: 'clearData',
            title: '清空列表',
        },
        {
            name: '开始Loading',
            title: 'startLoading',
        },
        {
            name: '结束Loading',
            title: 'stopLoading',
        },
        {
            name: 'checkSelectedRow',
            title: '判断是否选中一条',
        },
        // {
        //     name: 'setSelectedRowKeys',
        //     title: '设置默认选中的Keys',
        // },
        {
            name: 'getSelectedRowKeys',
            title: '获取选中的Keys',
        },
        {
            name: 'getSelectedRow',
            title: '获取选中的行数据',
        },
        {
            name: 'getHeaderCheckedColumns',
            title: '获取选中的列数据',
        },
        {
            name: 'getCellCheckedRows',
            title: '获取单元格选中数据',
        },
        {
            name: 'getTotal',
            title: '获取表格总条数信息',
        },
    ],
};
