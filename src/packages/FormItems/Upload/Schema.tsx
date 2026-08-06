/**
 * 组件配置和属性值
 */
import { FormInstance } from 'antd';
import DataSetting from './DataSetting';
import RulesSetting from '../../components/RulesSetting';

const fileTypeOptions = [{
    label: '图片',
    options: [
        { value: '.png', label: 'png' },
        { value: '.jpg', label: 'jpg' },
        { value: '.jpeg', label: 'jpeg' },
        { value: '.gif', label: 'gif' },
        { value: '.bmp', label: 'bmp' },
        { value: '.webp', label: 'webp' },
        { value: '.svg', label: 'svg' },
    ]
}, {
    label: '文档',
    options: [
        { value: '.pdf', label: 'pdf' },
        { value: '.doc', label: 'doc' },
        { value: '.docx', label: 'docx' },
        { value: '.xls', label: 'xls' },
        { value: '.xlsx', label: 'xlsx' },
        { value: '.ppt', label: 'ppt' },
        { value: '.pptx', label: 'pptx' },
        { value: '.txt', label: 'txt' },
        { value: '.csv', label: 'csv' },
    ]
}, {
    label: '视频',
    options: [
        { value: '.mp4', label: 'mp4' },
        { value: '.avi', label: 'avi' },
        { value: '.mov', label: 'mov' },
        { value: '.mkv', label: 'mkv' },
        { value: '.flv', label: 'flv' },
        { value: '.webm', label: 'webm' },
        { value: '.wmv', label: 'wmv' },
    ]
}, {
    label: '音频',
    options: [
        { value: '.mp3', label: 'mp3' },
        { value: '.wav', label: 'wav' },
        { value: '.aac', label: 'aac' },
        { value: '.flac', label: 'flac' },
        { value: '.m4a', label: 'm4a' },
        { value: '.ogg', label: 'ogg' },
    ]
}, {
    label: '压缩包',
    options: [
        { value: '.zip', label: 'zip' },
        { value: '.rar', label: 'rar' },
        { value: '.7z', label: '7z' },
        { value: '.tar', label: 'tar' },
        { value: '.gz', label: 'gz' },
    ]
}, {
    label: '其他',
    options: [
        { value: '.json', label: 'json' },
        { value: '.xml', label: 'xml' },
        { value: '.js', label: 'js' },
        { value: '.css', label: 'css' },
        { value: '.ttf', label: 'ttf' },
        { value: '.woff', label: 'woff' },
    ]
}];


export default {
    // 组件属性配置JSON
    attrs: [
        {
            type: 'Title',
            label: '标签配置',
            key: 'title1',
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
            props: {
                placeholder: '请输入提交字段',
            },
        },
        {
            type: 'Variable',
            label: '默认值',
            name: ['defaultValue'],
            props: {
                placeholder: '请输入默认值',
            },
        },
        {
            type: 'Input',
            label: '按钮文本',
            name: ['formItem', 'btnVal'],
        },
        {
            type: 'Title',
            label: '地址配置',
            key: 'title2',
        },
        {
            type: 'Switch',
            label: '使用编排接口',
            name: ['formItem', 'isInterface'],
        },
        {
            type: 'Input',
            label: '上传地址',
            name: ['formItem', 'uploadurl'],
        },
        {
            type: 'TreeSelect',
            label: '接口',
            name: ['formItem', 'interfaceId'],
            props: {
                allowClear: true,
                showSearch: true,
                treeNodeFilterProp: "title",
                isApiList: true
            }
        },
        {
            type: 'Select',
            label: '文件类型',
            name: ['formWrap', 'accept'],
            props: {
                mode:"multiple",
                options: fileTypeOptions,
            },
            tooltip: '接受上传的文件类型'
        },
        {
            type: 'InputNumber',
            label: '文件名称字数限制',
            name: ['formWrap', 'nameLength'],
            props:{
                min: 0
            },
            tooltip: '文件名称字数限制'
        },
        {
            type: 'InputNumber',
            label: '文件大小',
            name: ['formWrap', 'fileSize'],
            props:{
                min: 0
            },
            tooltip: '单个附件上传最大限制（M）'
        },
        {
            type: 'Select',
            label: '上传列表的样式',
            name: ['formWrap', 'listType'],
            props: {
                options: [
                    { value: 'text', label: '文本' },
                    { value: 'picture', label: '图片' },
                    { value: 'picture-card', label: '图片卡片' },
                    { value: 'picture-circle', label: '圆形图片' },
                ],
            },
        },
        {
            type: 'Switch',
            label: '支持多选文件',
            name: ['formWrap', 'multiple'],
        },
        {
            type: 'InputNumber',
            label: '文件数量',
            name: ['formWrap', 'maxCount'],
            tooltip: '限制上传的文件数量'
        },
        {
            type: 'Input',
            label: '文件参数名',
            name: ['formWrap', 'name'],
            tooltip: '发到后台的文件参数名'
        },
        {
            type: 'Switch',
            label: '是否禁用',
            name: ['formWrap', 'disabled'],
        },
        {
            type: 'Switch',
            label: '是否携带 cookie',
            name: ['formWrap', 'withCredentials'],
            tooltip: '上传请求时是否携带 cookie'
        },
        {
            type: 'Title',
            label: '额外参数',
            key: 'title3',
        },
        {
            type: 'function',
            render(form: FormInstance) {
                return <DataSetting key="DataSetting" />;
            },
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
                label: '请选择上传文件',
                uploadurl: '',
                multiple: false,
                btnVal: '添加附件',
                isInterface: false
            },
            // 组件默认属性值
            formWrap: {
                accept: ['.png'],
                disabled: false,
                listType: 'text',
                maxCount: 1,
                name: 'file',
                withCredentials: false,
                nameLength: 0,
                fileSize: 0
            },
        },
        // 组件样式
        style: {},
    },
    // 组件事件
    events: [
        {
            value: 'onChange',
            name: 'onChange事件',
        },
        {
            value: 'onRemove',
            name: 'onRemove事件',
        },
    ],
    methods: [
        {
            name: 'update',
            title: '更新数据',
        },
        {
            name: 'getFileList',
            title: '获取已上传的文件',
        },
    ],
};
