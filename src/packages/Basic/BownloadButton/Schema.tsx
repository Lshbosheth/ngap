/**
 * 组件配置和属性值
 */
import { FormInstance } from 'antd';
import DataSetting from './DataSetting';
export default {
    // 组件属性配置JSON
    attrs: [
        {
            type: 'Title',
            label: '基础设置',
            key: 'basic',
        },
        {
            type: 'Variable',
            label: '按钮名称',
            name: ['text'],
        },
        {
            type: 'TreeSelect',
            label: '接口',
            name: ['formItem', 'interfaceId'],
            props: {
                allowClear: true,
                showSearch: true,
                treeNodeFilterProp: "title",
                isApiList: true,
            },
        },
        {
            type: 'Select',
            label: '文件类型',
            name: ['fileType'],
            props: {
                showSearch: true,
                options: [
                    { value: 'audio/aac', label: 'aac' },
                    { value: 'application/x-abiword', label: 'abw' },
                    { value: 'application/x-freearc', label: 'arc' },
                    { value: 'video/x-msvideo', label: 'avi' },
                    { value: 'application/vnd.amazon.ebook', label: 'azw' },
                    { value: 'application/octet-stream', label: 'bin' },
                    { value: 'image/bmp', label: 'bmp' },
                    { value: 'application/x-bzip', label: 'bz' },
                    { value: 'application/x-bzip2', label: 'bz2' },
                    { value: 'application/x-csh', label: 'csh' },
                    { value: 'text/css', label: 'css' },
                    { value: 'text/csv', label: 'csv' },
                    { value: 'application/msword', label: 'doc' },
                    { value: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', label: 'docx' },
                    { value: 'application/vnd.ms-fontobject', label: 'eot' },
                    { value: 'application/epub+zip', label: 'epub' },
                    { value: 'image/gif', label: 'gif' },
                    { value: 'text/html', label: 'htm' },
                    { value: 'text/html', label: 'html' },
                    { value: 'image/vnd.microsoft.icon', label: 'ico' },
                    { value: 'text/calendar', label: 'ics' },
                    { value: 'application/java-archive', label: 'jar' },
                    { value: 'image/jpeg', label: 'jpeg' },
                    { value: 'image/jpeg', label: 'jpg' },
                    { value: 'text/javascript', label: 'js' },
                    { value: 'application/json', label: 'json' },
                    { value: 'application/ld+json', label: 'jsonld' },
                    { value: 'audio/midi', label: 'mid' },
                    { value: 'audio/midi', label: 'midi' },
                    { value: 'text/javascript', label: 'mjs' },
                    { value: 'audio/mpeg', label: 'mp3' },
                    { value: 'video/mpeg', label: 'mpeg' },
                    { value: 'application/vnd.apple.installer+xml', label: 'mpkg' },
                    { value: 'application/vnd.oasis.opendocument.presentation', label: 'odp' },
                    { value: 'application/vnd.oasis.opendocument.spreadsheet', label: 'ods' },
                    { value: 'application/vnd.oasis.opendocument.text', label: 'odt' },
                    { value: 'audio/ogg', label: 'oga' },
                    { value: 'video/ogg', label: 'ogv' },
                    { value: 'application/ogg', label: 'ogx' },
                    { value: 'font/otf', label: 'otf' },
                    { value: 'image/png', label: 'png' },
                    { value: 'application/pdf', label: 'pdf' },
                    { value: 'application/vnd.ms-powerpoint', label: 'ppt' },
                    { value: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', label: 'pptx' },
                    { value: 'application/x-rar-compressed', label: 'rar' },
                    { value: 'application/rtf', label: 'rtf' },
                    { value: 'application/x-sh', label: 'sh' },
                    { value: 'image/svg+xml', label: 'svg' },
                    { value: 'application/x-shockwave-flash', label: 'swf' },
                    { value: 'application/x-tar', label: 'tar' },
                    { value: 'image/tiff', label: 'tif' },
                    { value: 'image/tiff', label: 'tiff' },
                    { value: 'font/ttf', label: 'ttf' },
                    { value: 'text/plain', label: 'txt' },
                    { value: 'application/vnd.visio', label: 'vsd' },
                    { value: 'audio/wav', label: 'wav' },
                    { value: 'audio/webm', label: 'weba' },
                    { value: 'video/webm', label: 'webm' },
                    { value: 'image/webp', label: 'webp' },
                    { value: 'font/woff', label: 'woff' },
                    { value: 'font/woff2', label: 'woff2' },
                    { value: 'application/xhtml+xml', label: 'xhtml' },
                    { value: 'application/vnd.ms-excel', label: 'xls' },
                    { value: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', label: 'xlsx' },
                    { value: 'application/xml', label: 'xml' },
                    { value: 'application/vnd.mozilla.xul+xml', label: 'xul' },
                    { value: 'application/zip', label: 'zip' },
                    { value: 'video/3gpp', label: '3gp' },
                    { value: 'video/3gpp2', label: '3g2' },
                    { value: 'application/x-7z-compressed', label: '7z' },
                ],
            },
        },
        {
            type: 'Input',
            label: '文件字段名',
            name: ['formItem', 'fileName'],
            tooltip: '接口返回数据中文件名称对应的字段名'
        },
        {
            type: 'Input',
            label: '附件字段名',
            name: ['formItem', 'fileContent'],
            tooltip: '接口返回数据中附件内容对应的字段名'
        },

        {
            type: 'Select',
            label: '按钮类型',
            name: ['type'],
            props: {
                options: [
                    { value: 'primary', label: 'primary' },
                    { value: 'default', label: 'default' },
                    { value: 'ghost', label: 'ghost' },
                    { value: 'dashed', label: 'dashed' },
                    { value: 'text', label: 'text' },
                    { value: 'link', label: 'link' },
                ],
            },
        },

        {
            type: 'Switch',
            label: '块状按钮',
            name: ['block'],
        },
        {
            type: 'Switch',
            label: '幽灵按钮',
            name: ['ghost'],
        },
        {
            type: 'Switch',
            label: '危险按钮',
            name: ['danger'],
        },
        {
            type: 'Variable',
            label: '是否禁用',
            name: ['disabled'],
        },
        {
            type: 'Icons',
            label: '按钮图标',
            name: ['icon'],
        },
        {
            type: 'Title',
            label: '权限验证',
            key: 'auth',
        },
        {
            type: 'Input',
            label: '权限名称',
            tooltip: '配置权限名称，应用上架时会生成此按钮的功能权限，可根据功能权限管控显隐，请在用户中心分配给一线坐席使用',
            name: ['authCode'],
            props: {
                placeholder: '请输入按钮权限名称',
            },
        },
        {
            type: 'Variable',
            label: '三方验证',
            name: ['authScript'],
            props: {
                placeholder: '运行脚本',
            },
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
    ],
    config: {
        // 组件默认属性值
        props: {
            type: 'primary',
            size: 'middle',
            text: '下载',
            shape: 'default',
        },
        // 组件样式
        style: {
            display: 'inline-flex',
            height: '30px',
            lineHeight: '30px',
            fontSize: '13px',
            fontWeight: '400',
            borderRadius: '2px',
            padding: '0 15px',
        },
        // 事件
        events: [],
    },
    // 组件事件
    events: [
        {
            value: 'onClick',
            name: '点击事件',
        },
                {
            value: 'onSuccess',
            name: '下载成功事件',
        },
                        {
            value: 'onfail',
            name: '下载失败事件',
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
