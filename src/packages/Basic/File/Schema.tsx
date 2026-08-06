import { FormInstance } from 'antd';
import FileUpload from './FileUpload';

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
            type: 'Title',
            label: '内容设置',
            key: 'content',
        },
        {
            type: 'function',
            label: '上传附件',
            key: 'render',
            tooltip: '上传附件大小限制为4M，支持上传doc、docx、xls、pdf类型文件',
            name: 'filename',
            render(form: FormInstance) {
                return <FileUpload key="render" label="上传附件" name="filename" form={form} />;
            },
        },
        {
            type: 'Select',
            label: '展示形式',
            name: ['fileshowtype'],
            props: {
                options: [
                    { value: 'icon', label: '展示图标' },
                    { value: 'onlyName', label: '展示名字' },
                ],
            },
        },
        {
            type: 'Input',
            label: '上传附件测试',
            name: 'filenametest',
        },
    ],
    config: {
        // 组件默认属性值
        props: {
            fileshowtype: 'icon',
            filename: '文件名称',
            filenametest: '',
            filelist: [],
        },
        style: {
            width: '100px',
            height: '100px',
        },
        events: [],
        api: {},
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
