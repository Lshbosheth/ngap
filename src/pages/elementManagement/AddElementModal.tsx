import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Input, Select, Upload, Button, Progress, Image, List, Tag } from 'antd';
import { message } from '@/utils/AntdGlobal';
import request from '@/utils/request';
import styles from './index.module.less';
import type { UploadFile, UploadProps } from 'antd';
import type { RcFile } from 'antd/es/upload';
import { crossApiUserInfo } from '@/stores/crossapiStore';
import { publictData } from '@/utils/appMenuData';
import PreviewElementModal from './previewElementModal';
import JSZip from 'jszip';
import { baseApiConvert } from '../../../src/utils/util';

const requiredTypes = ['tsx', 'less', 'ts', 'js'];

const { TextArea } = Input;
const { Option } = Select;

interface AppElementType {
    elementTypeId: string; // 元素分类ID
    elementTypeName: string; // 元素分类名称
    elementTypeIcon: string; // 元素分类图标
    updateStaffId: string; // 修改人工号
    updateTime: string; // 修改时间
    createStaffId: string; // 创建人工号
    createTime: string; // 创建时间
    cmosModifyTime: string; // 双中心同步时间
}

interface BlockElement {
    elementId: string; // 元素ID
    elementName: string; // 元素名称
    elementStatus: string; // 元素状态
    elementIcon: string; // 元素图标
    elementJsDemo: string; // 元素源文件tsx组件逻辑代码
    elementCssDemo: string; // 元素源文件css组件样式代码
    elementConfigDemo: string; // 元素源文件ts组件配置文件
    elementTypeId: string; // 元素分类ID
    elementVersion: string; // 元素版本
    provId: string; // 归属范围
    elementPageType: string; // 页面布局
    elementDesc: string; // 元素说明
    updateStaffId: string; // 更新人工号
    updateTime: string; // 修改时间
    createStaffId: string; // 创建人工号
    createTime: string; // 创建时间
    cmosModifyTime: string; // 双中心同步时间
}

interface AddElementModalProps {
    visible: boolean; // 弹窗是否展示
    isClassify: boolean; // 是否为分类弹窗
    isEdit: boolean; // 是否为编辑
    appElementTypeEdit?: AppElementType; // 编辑的分类信息
    elementInfoEdit?: BlockElement; // 编辑的元素信息
    appElementType?: AppElementType[]; // 元素分类数据
    sourceFiles?: File[]; // 元素编辑的源文件
    onSure?: (values: BlockElement) => void; // 确定
    onCreate: (values: BlockElement) => void; // 审核
    onSaveDraft: (values: BlockElement) => void; // 草稿
    onCancel: () => void; // 取消
}

interface CodeType {
    tsxCode: string;
    lessCode: string;
    jsCode: string;
}

const AddElementModal: React.FC<AddElementModalProps> = ({
    visible,
    isClassify,
    isEdit,
    appElementTypeEdit,
    elementInfoEdit,
    appElementType,
    sourceFiles,
    onSure,
    onCreate,
    onSaveDraft,
    onCancel,
}) => {
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const scopeOptions = [{ value: '0000', label: '全网' }];
    const targetItem = publictData.provinceSelectValue.find((item) => item.value === userInfo.provinceId);
    targetItem && scopeOptions.push(targetItem);
    const [form] = Form.useForm<BlockElement>();
    const formRef = useRef(null);
    const [elementId, setElementId] = useState(''); // 元素id
    const [elementIcon, setElementIcon] = useState(''); // 元素图标URL
    const [imageLoading, setImageLoading] = useState(false); // 图标上传Loading
    const [imageProgress, setImageProgress] = useState(0); // 图标上传进度
    const [elementJsDemo, setElementJsDemo] = useState(''); // 元素源文件tsx组件逻辑代码
    const [elementCssDemo, setElementCssDemo] = useState(''); // 元素源文件css组件样式代码
    const [elementConfigDemo, setElementConfigDemo] = useState(''); // 元素源文件ts组件配置文件
    const [sourceLoading, setSourceLoading] = useState(false); // 源文件上传Loading
    const [sourceProgress, setSourceProgress] = useState(0); // 源文件上传进度
    const [elementInfo, setElementInfo] = useState<BlockElement>(); // 元素信息
    const [files, setFiles] = useState<UploadFile[]>([]);
    const [previewFiles, setPreviewFiles] = useState<File[]>([]);
    const [isSecondOpen, setIsSecondOpen] = useState(false);
    const [codeData, setCodeData] = useState<CodeType>({
        tsxCode: '',
        lessCode: '',
        jsCode: '',
    }); // 源文件源码
    const timerRef = useRef<NodeJS.Timeout>();
    
    // 使用 useRef 存储 Map 引用，组件卸载时自动清空
    const typeMapRef = useRef<Map<string, boolean>>(new Map());
    
    // 组件卸载时清理 Map
    useEffect(() => {
        return () => {
            typeMapRef.current.clear();
        };
    }, []);

    // 回显源文件
    useEffect(() => {
        setFiles([]);
        if ((!visible && sourceFiles?.length === 3) || sourceFiles?.length === 3) {
            // 关闭或者源文件变更时
            const newFiles = toUploadFileList(sourceFiles, 'done');
            setFiles((prev) => [...prev, ...newFiles]);
        }
    }, [sourceFiles, visible]);

    // 过滤文件类型
    const checkFileType = (file: UploadFile) => {
        const name = file.name || '';
        return requiredTypes.some((type) => name.endsWith(`.${type}`));
    };

    // 获取文件类型
    const getFileType = (fileName: string) => {
        const match = fileName.match(/\.(\w+)$/);
        return match ? match[1] : '';
    };

    // 校验文件大小是否为0KB
    const checkFileSize = (file: UploadFile): boolean => {
        if (file.size === 0) {
            message.error(`${file.name} 文件大小不能为0KB`);
            return false;
        }
        return true;
    };

    // 上传源文件
    const handleChange: UploadProps['onChange'] = (info) => {
        const isAdd = info.fileList.some((item) => item.uid === info.file.uid);
        if (isAdd) {
            // 清除之前的定时器
            if (timerRef.current) clearTimeout(timerRef.current);
            // 设置新的定时器，延迟 300ms 后执行
            timerRef.current = setTimeout(() => {
                let fileList = [...info.fileList];
                // 过滤不符合类型的文件
                fileList = fileList.filter((file) => {
                    if (!checkFileType(file)) {
                        message.error(`${file.name} 不是要求的文件类型，请重新上传`);
                        return false;
                    }
                    // 校验文件大小是否为0KB
                    if (!checkFileSize(file)) {
                        return false;
                    }
                    return true;
                });
                // 检查 ts 和 js 是否同时存在
                const hasTs = fileList.some((file) => getFileType(file.name) === 'ts');
                const hasJs = fileList.some((file) => getFileType(file.name) === 'js');
                if (hasTs && hasJs) {
                    message.error('ts 和 js 文件不能同时上传，请选择其中一种上传');
                    return;
                }
                // 每个类型只保留一个文件
                typeMapRef.current.clear();
                fileList = fileList.filter((file) => {
                    const type = getFileType(file.name);
                    if (typeMapRef.current.has(type)) {
                        message.error(`已上传${type}类型文件，请删除后重新上传`);
                        return false;
                    }
                    typeMapRef.current.set(type, true);
                    return true;
                });
                if (fileList.length > 3) {
                    message.error(`只能上传3个文件，请重新上传`);
                    return; // 直接返回，不继续执行后续代码
                }
                
                // 检查必需的文件类型
                const hasTsx = fileList.some((file) => getFileType(file.name) === 'tsx');
                const hasLess = fileList.some((file) => getFileType(file.name) === 'less');
                const hasTsOrJs = fileList.some((file) =>
                    getFileType(file.name) === 'ts' || getFileType(file.name) === 'js'
                );
                
                setFiles(fileList);
                // 更新预览文件数组
                const file: File[] = fileList
                    .filter((file) => file.originFileObj)
                    .map((file) => file.originFileObj as File);
                setPreviewFiles(file);
            }, 300);
        } else {
            // 更新files（过滤掉被删除的文件）
            const newFileList = files.filter((item) => item.uid !== info.file.uid);
            setFiles(newFileList);
            // 同步更新预览文件
            const previewFileList = newFileList
                .filter((file) => file.originFileObj)
                .map((file) => file.originFileObj as File);
            setPreviewFiles(previewFileList);
        }
    };

    // 批量上传源文件的函数
    const uploadSourceFiles = async (): Promise<{ success: boolean; jsDemo?: string; cssDemo?: string; configDemo?: string }> => {
        const file: File[] = files
            .filter((file) => file.originFileObj) // 确保有原始文件对象
            .map((file) => file.originFileObj as File);
        
        if (file.length < 3) {
            return { success: false };
        }

        // 校验文件大小是否为0KB
        const hasZeroSizeFile = file.some(f => f.size === 0);
        if (hasZeroSizeFile) {
            const zeroSizeFile = file.find(f => f.size === 0);
            message.error(`${zeroSizeFile?.name} 文件大小不能为0KB`);
            return { success: false };
        }

        setSourceLoading(true);
        try {
            const res = await request.upload(
                '/csf/call/importOssByFileList',
                'fileupload',
                file,
                { type: 'source' },
                {
                    showLoading: true,
                    onUploadProgress: (e) => {
                        const progress = e.lengthComputable ? Math.round((e.loaded / e.total) * 100) : 0;
                        setSourceProgress(progress);
                    },
                },
            );

            const jsDemo = getPathByExtension(res.bean, 'tsx');
            const cssDemo = getPathByExtension(res.bean, 'less');
            const configDemo = getPathByExtension(res.bean, 'ts') || getPathByExtension(res.bean, 'js');

            // 更新状态
            setElementJsDemo(jsDemo);
            setElementCssDemo(cssDemo);
            setElementConfigDemo(configDemo);
            
            return { success: true, jsDemo, cssDemo, configDemo };
        } catch (error) {
            return { success: false };
        } finally {
            setTimeout(() => {
                setSourceLoading(false);
                setSourceProgress(0);
            }, 2000);
        }
    };

    // 获取特定后缀的文件路径
    const getPathByExtension = (data: any, extension: string) => {
        const fileName = Object.keys(data).find((name) => name.endsWith(`.${extension}`));
        return fileName ? data[fileName] : null;
    };

    // 元素分类编辑回显
    useEffect(() => {
        if (isEdit) {
            setElementId(appElementTypeEdit?.elementTypeId || '');
            setElementIcon(appElementTypeEdit?.elementTypeIcon || '');
            form.setFieldsValue({
                elementName: appElementTypeEdit?.elementTypeName || '',
            });
        }
    }, [appElementTypeEdit]);

    // 元素编辑回显
    useEffect(() => {
        if (isEdit) {
            setElementInfo(elementInfoEdit);
            setElementId(elementInfoEdit?.elementId || '');
            setElementIcon(elementInfoEdit?.elementIcon || '');
            setElementJsDemo(elementInfoEdit?.elementJsDemo || '');
            setElementCssDemo(elementInfoEdit?.elementCssDemo || '');
            setElementConfigDemo(elementInfoEdit?.elementConfigDemo || '');
            form.setFieldsValue({
                elementName: elementInfoEdit?.elementName || '',
                elementTypeId: elementInfoEdit?.elementTypeId || '',
                provId: elementInfoEdit?.provId || '',
                elementPageType: elementInfoEdit?.elementPageType || '',
                elementDesc: elementInfoEdit?.elementDesc || '',
            });
        }
    }, [elementInfoEdit]);

    // 图标上传
    const imageCustomRequest = (options: any) => {
        const { file, onProgress, onSuccess, onError } = options;
        setImageLoading(true);
        // 这里是模拟上传过程，实际项目中替换为真实API
        request
            .upload(
                '/csf/call/importOssByFile',
                'fileupload',
                file,
                { type: 'image' },
                {
                    showLoading: true,
                    onUploadProgress: (e) => {
                        const progress = e.lengthComputable ? Math.round((e.loaded / e.total) * 100) : 0;
                        setImageProgress(progress);
                    },
                },
            )
            .then((res) => {
                setTimeout(() => {
                    // const url = URL.createObjectURL(file);
                    setElementIcon(res.bean.url);
                    setImageLoading(false);
                    setImageProgress(0);
                    message.success('图标上传成功');
                }, 1000);
            })
            .catch((err) => { })
            .finally(() => {
                setTimeout(() => {
                    setImageLoading(false);
                    setImageProgress(0);
                }, 2000);
            });
    };

    // 图标验证
    const imageBeforeUpload = (file: File) => {
        // 验证图片类型
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('只能上传图片文件！');
            return false;
        }
        // 验证图片大小
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('图片大小不能超过2MB！');
            return false;
        }
        return true;
    };

    // 图标删除
    const imageHandleRemove = () => {
        setElementIcon('');
        // 此处可加入删除服务器图片的逻辑
    };

    // 重置图标上传状态
    const imageResetUpload = () => { };

    // 重置源文件上传状态
    const sourceResetUpload = () => { };

    // 自定义上传图标按钮展示逻辑
    const renderUploadButton = (flag: string) => {
        if (flag === 'image') {
            if (elementIcon) return null;
            if (imageLoading) {
                return (
                    <div className="uploading_state">
                        <Progress percent={imageProgress} showInfo={false} size={[36, 2]} />
                        <div>上传中</div>
                    </div>
                );
            }
        } else {
            if (files.length > 2) return null;
            if (sourceLoading) {
                return (
                    <div className="uploading_state">
                        <Progress percent={sourceProgress} showInfo={false} size={[36, 2]} />
                        <div>上传中</div>
                    </div>
                );
            }
        }
        return (
            <div className="upload_button">
                <img src={new URL(`./imgs/upload.png`, import.meta.url).href} alt="" />
                <div>上传</div>
            </div>
        );
    };

    // 提交保存
    const handleSubmit = async (actionType: 'sure' | 'create' | 'save' | 'preview') => {
        form.validateFields()
            .then(async (values) => {
                // 检查文件是否上传
                if (!elementIcon) {
                    message.error('请上传图标文件');
                    return;
                }
                // 统一检查必需的文件类型
                const hasTsx = files.some((file) => getFileType(file.name) === 'tsx');
                const hasLess = files.some((file) => getFileType(file.name) === 'less');
                const hasTsOrJs = files.some((file) =>
                    getFileType(file.name) === 'ts' || getFileType(file.name) === 'js'
                );
                
                if ((!hasTsx || !hasLess || !hasTsOrJs) && !isClassify) {
                    message.error('必须上传tsx、less、ts、js三个文件');
                    return;
                }

                // 存储上传后的文件路径
                let uploadedJsDemo = elementJsDemo;
                let uploadedCssDemo = elementCssDemo;
                let uploadedConfigDemo = elementConfigDemo;

                // 只有提交审核和保存草稿时才调用批量上传接口
                if (actionType === 'create' || actionType === 'save') {
                    const uploadResult = await uploadSourceFiles();
                    if (!uploadResult.success) {
                        message.error('源文件上传失败');
                        return;
                    }
                    // 使用上传接口返回的文件路径
                    uploadedJsDemo = uploadResult.jsDemo || '';
                    uploadedCssDemo = uploadResult.cssDemo || '';
                    uploadedConfigDemo = uploadResult.configDemo || '';
                }

                const formData: BlockElement = {
                    ...values,
                    elementId: elementId,
                    elementIcon: elementIcon,
                    elementJsDemo: uploadedJsDemo,
                    elementCssDemo: uploadedCssDemo,
                    elementConfigDemo: uploadedConfigDemo,
                };

                switch (actionType) {
                    case 'sure':
                        onSure && onSure(formData);
                        break;
                    case 'create':
                        onCreate(formData);
                        break;
                    case 'save':
                        onSaveDraft(formData);
                        break;
                    case 'preview':
                        onPreview(formData);
                        return;
                }
                if (!isEdit || isClassify) {
                    form.resetFields();
                    setElementId('');
                    setElementIcon('');
                    setFiles([]);
                    setElementJsDemo('');
                    setElementCssDemo('');
                    setElementConfigDemo('');
                }
            })
            .catch((info) => { });
    };

    // 预览元素
    const onPreview = async (values: BlockElement) => {
        // 从files状态中提取原始文件对象
        const fileObjects = files
            .filter((file) => file.originFileObj)
            .map((file) => file.originFileObj as File);
        
        // 检查文件数量和类型
        const hasTsx = fileObjects.some((file) => {
            const ext = file.name.split('.').pop();
            return ext === 'tsx';
        });
        const hasLess = fileObjects.some((file) => {
            const ext = file.name.split('.').pop();
            return ext === 'less';
        });
        const hasTsOrJs = fileObjects.some((file) => {
            const ext = file.name.split('.').pop();
            return ext === 'ts' || ext === 'js';
        });

        if (fileObjects.length === 3 && hasTsx && hasLess && hasTsOrJs) {
            setIsSecondOpen(true);
            let tsxCode = '';
            let lessCode = '';
            let jsCode = '';
            for (const item of fileObjects) {
                if (item.name && item.name.split('.').pop() === 'tsx') {
                    tsxCode = await item.text();
                } else if (item.name.split('.').pop() === 'less') {
                    lessCode = await item.text();
                } else if (item.name.split('.').pop() === 'ts' || item.name.split('.').pop() === 'js') {
                    jsCode = await item.text();
                }
            }
            setCodeData({
                tsxCode: tsxCode,
                lessCode: lessCode,
                jsCode: jsCode,
            });
        } else {
            message.error('必须上传tsx、less、ts、js三个文件');
        }
    };

    // 取消或点击右上角×号关闭弹窗
    const handleCancel = () => {
        onCancel();
        if (!isEdit) {
            form.resetFields();
            setElementId('');
            setElementIcon('');
            setFiles([]);
            setElementJsDemo('');
            setElementCssDemo('');
            setElementConfigDemo('');
        } else {
            setElementId(elementInfo?.elementId || '');
            setElementIcon(elementInfo?.elementIcon || '');
            // setFiles([]);
            setElementJsDemo(elementInfo?.elementJsDemo || '');
            setElementCssDemo(elementInfo?.elementCssDemo || '');
            setElementConfigDemo(elementInfo?.elementConfigDemo || '');
            form.setFieldsValue({
                elementName: elementInfo?.elementName || '',
                elementTypeId: elementInfo?.elementTypeId || '',
                provId: elementInfo?.provId || '',
                elementPageType: elementInfo?.elementPageType || '',
                elementDesc: elementInfo?.elementDesc || '',
            });
        }
    };

    // 模板及规范下载
    const templateDownload = async () => {
        try {
            const url = window.location.protocol + '//' + window.location.host + '/ngapcontrol/api/download/zip/templates.zip';
            const link = document.createElement('a');
            link.href = baseApiConvert(url);
            link.download = '模板及规范.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            message.error('模板下载失败，请重新下载');
        } finally {
        }
        // const zip = new JSZip();
        // const files = [
        //     { name: 'MyComponent.tsx', path: `${import.meta.env.MODE === 'development' ? '/ngap/templates/MyComponent.tsx' : './../templates/MyComponent.tsx'}` },
        //     { name: 'MyComponent.less', path: `${import.meta.env.MODE === 'development' ? '/ngap/templates/MyComponent.less' : './../templates/MyComponent.less'}` },
        //     { name: 'types.ts', path: `${import.meta.env.MODE === 'development' ? '/ngap/templates/types.ts' : './../templates/types.ts'}` },
        //     { name: '组件开发规范.html', path: `${import.meta.env.MODE === 'development' ? '/ngap/templates/组件开发规范.html' : './../templates/组件开发规范.html'}` },
        // ];
        // try {
        //     // 并发获取所有文件内容
        //     const contents = await Promise.all(
        //         files.map(async (file) => {
        //             const res = await fetch(file.path);
        //             if (!res.ok) throw new Error(`加载 ${file.name} 失败 (${res.status})`);
        //             return res.text();
        //         })
        //     );
        //     // 添加到 ZIP
        //     files.forEach((file, i) => {
        //         zip.file(file.name, contents[i]);
        //     });
        //     const blob = await zip.generateAsync({ type: 'blob' });
        //     const url = URL.createObjectURL(blob);
        //     const link = document.createElement('a');
        //     link.href = url;
        //     link.download = '模板及规范.zip';
        //     link.click();
        //     URL.revokeObjectURL(url);
        // } catch (error) {
        //     message.error('下载失败,请重新下载');
        // } finally {

        // }
    };

    return (
        <Modal
            title={isClassify ? (isEdit ? '编辑元素分类' : '新增元素分类') : isEdit ? '编辑元素' : '新增元素'}
            open={visible}
            footer={null}
            onCancel={handleCancel}
            wrapClassName={styles.form_modal}
            width={isClassify ? 450 : 650}
            destroyOnClose
            mask={true} // 显示遮罩
            maskClosable={false} // 禁止点击遮罩关闭
        >
            <Form form={form} layout="vertical" ref={formRef} className={isClassify ? 'element_form element_form_classify' : 'element_form'}>
                <Form.Item
                    name="elementName"
                    label={isClassify ? '元素分类名称:' : '元素名称:'}
                    rules={[{ required: true, message: '请输入元素名称' }]}
                >
                    <Input placeholder="请输入" maxLength={50} />
                </Form.Item>
                {!isClassify ? (
                    <Form.Item name="elementTypeId" label="元素分类:" rules={[{ required: true, message: '请选择元素分类' }]}>
                        <Select placeholder="请选择">
                            {appElementType?.map((option) => (
                                <Option key={option.elementTypeId} value={option.elementTypeId}>
                                    {option.elementTypeName}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                ) : null}
                <Form.Item label="上传图标:" required>
                    <Upload
                        accept="image/*"
                        listType="picture-card"
                        showUploadList={false} // 隐藏默认上传列表
                        customRequest={imageCustomRequest}
                        beforeUpload={imageBeforeUpload}
                        onChange={({ file }) => {
                            if (file.status === 'error') {
                                setImageLoading(false);
                                imageResetUpload();
                            }
                        }}
                        maxCount={1} // 限制只能上传一个文件
                    >
                        {renderUploadButton('image')}
                    </Upload>
                    {elementIcon && (
                        <div className="upload_image">
                            <Image src={elementIcon} alt="预览" width={50} height={50} preview={false} />
                            <img
                                src={new URL(`./imgs/delete.png`, import.meta.url).href}
                                alt=""
                                className="delete_btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    imageHandleRemove();
                                    imageResetUpload();
                                }}
                            />
                        </div>
                    )}
                </Form.Item>
                {!isClassify ? (
                    <Form.Item label="上传源文件:" required>
                        <Upload
                            accept=".tsx,.less,.ts,.js"
                            className="source_upload"
                            fileList={files}
                            onChange={handleChange}
                            beforeUpload={() => false} // 手动上传
                            multiple
                        >
                            {renderUploadButton('source')}
                        </Upload>
                        {files && files.length < 3 && (
                            <div className="upload_remarks">
                                <span>必须上传tsx\less\ts\js三个文件</span>
                                <div onClick={templateDownload}>模板及规范下载</div>
                            </div>
                        )}
                    </Form.Item>
                ) : null}
                {!isClassify ? (
                    <Form.Item name="elementPageType" label="页面布局:" rules={[{ required: true, message: '请选择页面布局' }]}>
                        <Select placeholder="请选择">
                            <Option value="1">标准页面</Option>
                            <Option value="2">大屏页面</Option>
                        </Select>
                    </Form.Item>
                ) : null}
                {!isClassify ? (
                    <Form.Item name="provId" label="归属范围:" rules={[{ required: true, message: '请选择归属范围' }]}>
                        <Select placeholder="请选择" disabled={isEdit ? true : false} options={scopeOptions} />
                    </Form.Item>
                ) : null}
                {!isClassify ? (
                    <Form.Item name="elementDesc" label="元素说明:" rules={[{ required: true, message: '请输入元素说明' }]}>
                        <TextArea rows={4} placeholder="请描述元素核心能力，元素使用说明、应用效果信息，不超过500字" maxLength={500} />
                    </Form.Item>
                ) : null}
                {isClassify ? (
                    <div style={{ textAlign: 'center', marginTop: 24 }}>
                        <Button type="primary" style={{ marginRight: 8 }} onClick={() => handleSubmit('sure')}>
                            确定
                        </Button>
                        <Button onClick={handleCancel}>取消</Button>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', marginTop: 24 }}>
                        <Button type="primary" style={{ marginRight: 8 }} onClick={() => handleSubmit('create')}>
                            提交审核
                        </Button>
                        <Button type="dashed" style={{ marginRight: 8 }} onClick={() => handleSubmit('save')}>
                            保存草稿
                        </Button>
                        <Button style={{ marginRight: 8 }} onClick={() => handleSubmit('preview')}>
                            预览
                        </Button>
                        <Button onClick={handleCancel}>取消</Button>
                    </div>
                )}
            </Form>
            {/* 预览元素弹窗 */}
            <PreviewElementModal
                visible={isSecondOpen}
                codeData={codeData}
                onCancel1={() => {
                    setIsSecondOpen(false);
                }}
            />
        </Modal>
    );
};
export default AddElementModal;

/**
 * 生成稳定唯一的 uid
 */
export function generateUid(file: File): string {
    return `${file.name}-${file.size}-${file.lastModified}-${Date.now()}-${Math.random()}`;
}

/**
 * 将原生 File 转换为 RcFile（添加 uid 和已废弃的 lastModifiedDate）
 */
export function toRcFile(file: File): RcFile {
    const rcFile = file as RcFile;

    // 若 uid 不存在，使用 defineProperty 安全添加（避免 File 对象冻结）
    if (!rcFile?.uid) {
        Object.defineProperty(rcFile, 'uid', {
            value: generateUid(file),
            writable: false,
            configurable: false,
            enumerable: true,
        });
    }

    // 兼容 antd 旧版本：部分逻辑依赖 lastModifiedDate
    if (!rcFile?.lastModifiedDate) {
        Object.defineProperty(rcFile, 'lastModifiedDate', {
            value: new Date(file.lastModified),
            writable: false,
            configurable: false,
            enumerable: true,
        });
    }

    return rcFile;
}

/**
 * 将单个 File 转换为 UploadFile（内部自动升级为 RcFile）
 */
export function toUploadFile(file: File, status: UploadFile['status'] = 'done'): UploadFile {
    const rcFile = toRcFile(file);
    const isImage = file.type?.startsWith('image/');

    return {
        uid: rcFile.uid,
        name: file.name,
        fileName: file.name,
        size: file.size,
        type: file.type,
        originFileObj: rcFile, // ✅ 类型完全匹配 RcFile
        status,
        thumbUrl: isImage ? URL.createObjectURL(file) : undefined,
    };
}
/**
 * 批量将 File 数组转换为 UploadFile 数组
 * @param files - 原生 File 数组（来自 input 或拖拽）
 * @param status - 初始上传状态，默认 'done'
 * @returns UploadFile 数组
 */
export function toUploadFileList(files: File[], status: UploadFile['status'] = 'done'): UploadFile[] {
    return files.map((file) => toUploadFile(file, status));
}
