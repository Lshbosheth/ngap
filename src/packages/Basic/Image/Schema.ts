/**
 * 组件配置和属性值
 */
import request from '@/utils/request';
import { message } from '@/utils/AntdGlobal';

export default {
    // 组件属性配置JSON
    attrs: [
        {
            type: 'Title',
            label: '基础配置',
            key: 'basic',
        },
        {
            type: 'Upload',
            label: '图片地址',
            name: 'src',
            props: {
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
            type: 'InputPx',
            label: '图片宽度',
            name: 'width',
        },
        {
            type: 'InputPx',
            label: '图片高度',
            name: 'height',
        },
        {
            type: 'Switch',
            label: '是否预览',
            name: 'preview',
        },
    ],
    config: {
        // 组件默认属性值
        props: {
            src: '/ngap/imgs/ngap-logo.png',
            preview: false,
            width: '200px',
            height: '200px',
            alt: '',
        },
        // 组件样式
        style: {},
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
