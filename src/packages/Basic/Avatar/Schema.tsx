import { FormInstance } from 'antd';
import ActionSetting from './../../../components/BulkAction/ActionSetting';
import request from '@/utils/request';
import { message } from '@/utils/AntdGlobal';

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
            type: 'Variable',
            label: '文字头像',
            name: ['textavatar'],
            props: {
                placeholder: '请输入',
            },
        },
        {
            type: 'Upload',
            label: '地址',
            name: 'src',
            props: {
                action: '/csf/call/importOssByFile',
                accept: 'image/*',
                maxCount: 1,
                showUploadList: true,
                customRequest: (options: any, form: any) => {
                    const { file, onSuccess } = options;
                    request
                        .upload('/csf/call/importOssByFile', 'fileupload', file, { type: 'image' })
                        .then((res) => {
                            onSuccess({ data: { url: res.bean.url } });
                            form.setFieldValue('src', String(res.bean.url));
                            message.success('图片上传成功');
                        })
                        .catch((err) => { });
                },
                onRemove: async (file: any, form: any) => {
                    // 获取当前图片URL
                    const currentSrc = form.getFieldValue('src');

                    // 如果有图片URL，先调用删除接口
                    if (currentSrc && typeof currentSrc === 'string') {
                        try {
                            await request.post('/csf/call/deleteOssByFile', {
                                params: {
                                    url: currentSrc
                                }
                            });
                            message.success('图片删除成功');

                            // 删除成功后清除表单值
                            form.setFieldValue('src', undefined);
                            return true;
                        } catch (error) {
                            console.error('删除 OSS 文件失败:', error);
                            return false; // 返回 false 阻止删除
                        }
                    }

                    // 如果没有图片URL，直接清除表单值
                    form.setFieldValue('src', undefined);
                    return true;
                },
            },
        },
        {
            type: 'InputSelect',
            label: '大小',
            name: ['size'],
            tooltip: '支持自定义大小，如: 10, "20px"',
            props: {
                options: [
                    { value: 'large', label: '大' },
                    { value: 'small', label: '小' },
                    { value: 'default', label: '默认' },
                ],
            },
        },
        {
            type: 'Input',
            label: '替代文本',
            name: ['alt'],
            tooltip: '图像无法显示时的替代文本',
            props: {
                placeholder: '请输入',
            },
        },
        {
            type: 'InputNumber',
            label: '文字边距',
            name: ['gap'],
            tooltip: '文字头像距离左右两侧距离',
            props: {
                placeholder: '请输入',
            },
        },
        {
            type: 'Select',
            label: '形状',
            name: ['shape'],
            props: {
                options: [
                    { value: 'circle', label: '圆形' },
                    { value: 'square', label: '方形' },
                ],
            },
        },
    ],
    config: {
        // 组件默认属性值
        props: {
            textavatar: 'wang',
            src: '',
            size: 'large',
            shape: 'circle',
            crossOrigin: 'anonymous',
            gap: 4,
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
