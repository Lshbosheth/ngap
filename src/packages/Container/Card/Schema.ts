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
            type: 'Variable',
            label: '标题',
            name: 'title',
        },
        {
            type: 'Switch',
            label: '悬浮效果',
            name: 'hoverable',
        },
        {
            type: 'Switch',
            label: '显示边框',
            name: 'bordered',
        },
        {
            type: 'Select',
            label: '卡片尺寸',
            name: 'size',
            props: {
                options: [
                    { label: '默认', value: 'default' },
                    { label: '小', value: 'small' },
                ],
            },
        },
        {
            type: 'Select',
            label: '卡片标题背景',
            name: 'headerBackgroundColor',
            props: {
                options: [
                    { label: '无', value: 'none' },
                    { label: '浅蓝色', value: 'blue' },
                ],
            },
        },
        {
            type: 'Title',
            label: '按钮配置（右上角）',
            key: 'btnConfig',
        },
        {
            type: 'Input',
            label: '按钮名称',
            name: ['extra', 'text'],
        },
        {
            type: 'Select',
            label: '按钮类型',
            name: ['extra', 'type'],
            props: {
                options: [
                    { label: '默认', value: 'default' },
                    { label: '主要', value: 'primary' },
                    { label: '幽灵', value: 'ghost' },
                    { label: '链接', value: 'link' },
                    { label: '文本', value: 'text' },
                ],
            },
        },
        {
            type: 'Switch',
            label: '显示危险',
            name: ['extra', 'danger'],
        },
        {
            type: 'Title',
            label: '封面配置',
            key: 'coverConfig',
        },
        {
            type: 'Input',
            label: '图片地址',
            name: 'cover',
        },
        {
            type: 'Title',
            label: 'Meta配置',
            key: 'metaConfig',
        },
        {
            type: 'Upload',
            label: '头像地址',
            name: 'avatar',
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
                            form.setFieldValue('avatar', String(res.bean.url));
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
            type: 'Input',
            label: '标题',
            name: ['meta', 'title'],
        },
        {
            type: 'Input',
            label: '描述',
            name: ['meta', 'description'],
        },
    ],
    config: {
        // 组件默认属性值
        props: {
            title: {
                type: 'static',
                value: '应用集成平台',
            },
            size: 'default',
            headerBackgroundColor: 'blue',
            bordered: true,
            extra: {
                text: '更多',
                type: 'link',
            },
            meta: {
                title: '应用集成平台',
                description: '应用集成平台是一款低代码平台，支持可视化配置、逻辑编排、事件流交互、数据源配置等。',
            },
        },
        // 组件样式
        style: {},
    },
    // 组件事件
    events: [
        {
            value: 'onClick',
            name: '点击卡片事件',
        },
        {
            value: 'onClickMore',
            name: '点击更多事件',
        },
    ],
};
