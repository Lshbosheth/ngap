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
            label: '基础设置',
            key: 'basic',
        },
        {
            type: 'Variable',
            label: '文字内容',
            name: ['content'],
        },
        {
            type: 'Upload',
            label: '图片源',
            name: 'image',
            props: {
                accept: 'image/*',
                maxCount: 1,
                showUploadList: true,
                customRequest: (options: any, form: any) => {
                    const { file, onSuccess } = options;
                    request
                        .upload('/csf/call/importOssByFile', 'fileupload', file, { type: 'image' })
                        .then((res) => {
                            const fileObj = {
                                ...file,
                                url: res.bean.url,
                                uid: file.uid,
                                status: 'done',
                            };
                            onSuccess({ data: { url: res.bean.url } }, fileObj);
                            form.setFieldValue('image', String(res.bean.url));
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
        // {
        //     type: 'Switch',
        //     label: '传递至弹窗',
        //     name: 'inherit',
        // },
        {
            type: 'Title',
            label: '布局',
            key: 'layout',
        },
        {
            type: 'InputNumber',
            label: '宽度',
            name: 'width',
        },
        {
            type: 'InputNumber',
            label: '高度',
            name: 'height',
        },
        {
            type: 'InputNumber',
            label: '旋转角度',
            name: 'rotate',
        },
        // {
        //     type: 'InputNumber',
        //     label: 'zIndex',
        //     name: 'zIndex',
        // },
        {
            type: 'InputNumber',
            label: '水平间距',
            name: 'gapx',
        },

        {
            type: 'InputNumber',
            label: '垂直间距',
            name: 'gapy',
        },
        {
            type: 'InputNumber',
            label: '水平偏移量',
            name: 'offsetx',
        },
        {
            type: 'InputNumber',
            label: '垂直偏移量',
            name: 'offsety',
        },
        // {
        //     type: 'Title',
        //     label: '文字样式',
        //     key: 'font-basic',
        // },
        // {
        //     type: 'ColorPicker',
        //     label: '颜色',
        //     name: ['font', 'color'],
        // },
        // {
        //     type: 'InputNumber',
        //     label: '字号',
        //     name: ['font', 'fontSize'],
        // },
        // {
        //     type: 'Select',
        //     label: '字重',
        //     name: ['font', 'fontWeight'],
        //     props: {
        //         options: [
        //             {
        //                 value: 'normal',
        //                 label: 'normal',
        //             },
        //             {
        //                 value: 'bold',
        //                 label: 'weight',
        //             },
        //             {
        //                 value: 'light',
        //                 label: 'light',
        //             },
        //         ],
        //     },
        // },
        // {
        //     type: 'Input',
        //     label: '字体类型',
        //     name: ['font', 'fontFamily'],
        // },
        // {
        //     type: 'Select',
        //     label: '字体样式',
        //     name: ['font', 'fontStyle'],
        //     props: {
        //         options: [
        //             {
        //                 value: 'normal',
        //                 label: 'normal',
        //             },
        //             {
        //                 value: 'italic',
        //                 label: 'italic',
        //             },
        //             {
        //                 value: 'oblique',
        //                 label: 'oblique',
        //             },
        //             {
        //                 value: 'none',
        //                 label: 'none',
        //             },
        //         ],
        //     },
        // },
    ],
    config: {
        // 组件默认属性值
        props: {
            width: 100,
            height: 50,
            content: 'watermark',
            rotate: -30,
            gapx: 150,
            gapy: 100,
            zIndex: 9,
            inherit: true,
            font: {
                color: '#8a8b8c',
                fontSize: 16,
                fontWeight: 'normal',
                fontFamily: 'sans-serif',
                fontStyle: 'normal',
            },
        },
        // 组件样式
        style: {},
    },
    // 组件事件
    events: [],
    methods: [],
};
