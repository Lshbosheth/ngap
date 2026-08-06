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
        },
        {
            type: 'Switch',
            label: '显示欢迎区',
            name: 'welcomeMessageShow',
        },
        {
            type: 'Input',
            label: '欢迎标题',
            name: 'welcomeTitle',
            props: {
                placeholder: '请输入欢迎语标题',
            },
        },
        {
            type: 'Input',
            label: '欢迎描述',
            name: 'welcomeDesc',
            props: {
                placeholder: '请输入欢迎语内容',
            },
        },
        {
            type: 'Upload',
            label: '欢迎图标',
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
                            onSuccess(res.bean.url);
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
            type: 'Switch',
            label: '显示思考',
            name: 'showThink',
        },
        {
            type: 'Switch',
            label: '显示点赞点踩',
            name: 'showLike',
        },
        {
            type: 'Variable',
            label: '结果回传接口',
            name: 'resultSendUrl',
        },
        {
            type: 'Switch',
            label: '显示时间',
            name: 'showTimestamp',
        },
        {
            type: 'Input',
            label: '占位信息',
            name: 'inputPlaceholder',
        },
        {
            type: 'Input',
            label: '错误提示',
            name: 'errorTip',      // 设置当对接模型能力出现异常时返回的默认提示语
        },
        {
            type: 'Title',
            label: '模型设置',
        },
        {
            type: 'Input',
            label: '模型名称',
            name: 'modelName',
            props: {
                placeholder: '请输入模型名称',
            },
        },
        {
            type: 'Select',
            label: 'AIP地址',
            name: 'AIPAdrss',
            props: {
                placeholder: '请输入AIP地址',
                options: [
                    {label: '大模型对话调用-非流式', value: '1'},
                    {label: '大模型对话调用-流式', value: '2'},
                    {label: '大模型应用调用-非流式', value: '3'},
                    {label: '大模型应用调用-流式', value: '4'},
                ]
            },
        },
        {
            type: 'Input',
            label: 'API秘钥',
            name: 'APIKey',
            props: {
                placeholder: '请输入模型秘钥',
            },
        },
        {
            type: 'Input',
            label: 'APPID',
            name: 'APPID',
            props: {
                placeholder: '请输入appid',
            },
        },
        {
            type: 'Input',
            label: '模型类型',
            name: 'modelType',
            props: {
                placeholder: '请输入智能体创建时选择的模型类型',
            },
        },
        {
            type: 'Input',
            label: '模型编码',
            name: 'modelCode',
            props: {
                placeholder: '请输入模型编码',
            },
        },
        {
            type: 'Input',
            label: '提示词',
            name: 'promptContent',
            props: {
                placeholder: '请输入提示词',
            },
        },
        {
            type: 'Input',
            label: '温度值',
            name: 'degreeVal',
        },
        {
            type: 'Input',
            label: '手机号设置',
            name: 'userPhone',
            tooltip: '需输入所调用智能体的创建人手机号',
        },
        {
            type: 'Title',
            label: '会话区域设置',
        },
        {
            type: 'InputPx',
            label: '最小高度',
            name: 'minHeight',
            props: {
                placeholder: '请输入高度值',
            },
        },
        {
            type: 'InputPx',
            label: '最大高度',
            name: 'maxHeight',
            props: {
                placeholder: '请输入高度值',
            },
        },
        {
            type: 'Title',
            label: 'AI角色设置',
        },
        {
            type: 'Select',
            label: '位置',
            name: 'AIPosition',
            props: {
                options: [
                    { value: 'right', label: '右侧' },
                    { value: 'left', label: '左侧' },
                ],
            },
        },
        {
            type: 'Upload',
            label: '头像图片',
            name: 'AIAvatar',
            props: {
                accept: 'image/*',
                maxCount: 1,
                showUploadList: true,
                customRequest: (options: any, form: any) => {
                    const { file, onSuccess } = options;
                    request
                        .upload('/csf/call/importOssByFile', 'fileupload', file, { type: 'image' })
                        .then((res) => {
                            onSuccess(res.bean.url);
                            form.setFieldValue('AIAvatar', String(res.bean.url));
                            message.success('图片上传成功');
                        })
                        .catch((err) => { });
                },
                onRemove: async (file: any, form: any) => {
                    // 获取当前图片URL
                    const currentSrc = form.getFieldValue('AIAvatar');
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
                            form.setFieldValue('AIAvatar', undefined);
                            return true;
                        } catch (error) {
                            console.error('删除 OSS 文件失败:', error);
                            return false; // 返回 false 阻止删除
                        }
                    }
                    // 如果没有图片URL，直接清除表单值
                    form.setFieldValue('AIAvatar', undefined);
                    return true;
                },
            },
        },
        {
            type: 'Title',
            label: '用户角色设置',
        },
        {
            type: 'Select',
            label: '位置',
            name: 'userPosition',
            props: {
                options: [
                    { value: 'right', label: '右侧' },
                    { value: 'left', label: '左侧' },
                ],
            },
        },
        {
            type: 'Upload',
            label: '头像图片',
            name: 'userAvatar',
            props: {
                accept: 'image/*',
                maxCount: 1,
                showUploadList: true,
                customRequest: (options: any, form: any) => {
                    const { file, onSuccess } = options;
                    request
                        .upload('/csf/call/importOssByFile', 'fileupload', file, { type: 'image' })
                        .then((res) => {
                            onSuccess(res.bean.url);
                            form.setFieldValue('userAvatar', String(res.bean.url));
                            message.success('图片上传成功');
                        })
                        .catch((err) => { });
                },
                onRemove: async (file: any, form: any) => {
                    // 获取当前图片URL
                    const currentSrc = form.getFieldValue('userAvatar');
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
                            form.setFieldValue('userAvatar', undefined);
                            return true;
                        } catch (error) {
                            console.error('删除 OSS 文件失败:', error);
                            return false; // 返回 false 阻止删除
                        }
                    }
                    // 如果没有图片URL，直接清除表单值
                    form.setFieldValue('userAvatar', undefined);
                    return true;
                },
            },
        },
        {
            type: 'Title',
            label: '发问区设置',
        },
        {
            type: 'InputPx',
            label: '输入框高度',
            name: 'inputHeight',
            props: {
                placeholder: '请输入高度值',
            },
        },
        {
            type: 'Switch',
            label: '显示快捷语',
            name: 'showQuickReply',
        },        
        {
            type: 'Variable',
            label: '快捷语数据',
            name: 'quickReplyData',
            tooltip: '数据格式为字符串，多个用逗号,拼接'
        },        
    ],
    config: {
        // 组件默认属性值
        props: {
            welcomeMessageShow: true,
            showThink: false,  // 显示思考中效果
            showLike: false,  // 显示点赞点踩
            showTimestamp: false,  // 显示时间
            minHeight: 300,
            maxHeight: 500,
            AIPosition: 'left',
            userPosition: 'right',
            inputHeight: 130,
            showQuickReply: false,
            src:'/ngap/imgs/welcomeIcon.png',
            userAvatar:'/ngap/imgs/userAvatar.png',
            AIAvatar:'/ngap/imgs/AIAvatar.png'
        },
        // 组件样式
        style: {},
        api: {},
        // 事件
        events: [],
    },
    // 组件事件
    events: [
        {
            name: '发送消息事件',
            value: 'onSend',
        },
        {
            name: '响应消息事件',
            value: 'onResponse',
        },
        {
            name: '输入变化事件',
            value: 'onInputChange',
        },
    ],
    methods: [
        {
            title: '消息赋值',
            name: 'setMessage',
        },
    ],
};
