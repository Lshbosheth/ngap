import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Input, Button, Upload, App, Space, Progress } from 'antd';
import { baseApiConvert } from '../../utils/util';
import request from '../../utils/request';
import { crossApiUserInfo } from '../../stores/crossapiStore';

interface OffshelfModalProps {
    visible: boolean;
    onClose: () => void;
    record: any;
    onSubmit: (values: any) => Promise<void>;
    onRefresh: () => void;
    modalType?: 'offshelf' | 'rollback'; // 弹窗类型：下架申请或回滚申请
}

// 文件信息接口
interface FileInfo {
    nm: string;  // 文件名称
    url: string; // 文件链接
}

const OffshelfModal: React.FC<OffshelfModalProps> = ({
    visible,
    onClose,
    record,
    onSubmit,
    onRefresh,
    modalType = 'offshelf'
}) => {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [uploadFileList, setUploadFileList] = useState<any[]>([]); // 上传文件数据
    const [uploadedFiles, setUploadedFiles] = useState<FileInfo[]>([]); // 已上传文件数据
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const lastCallTimeRef = useRef(0);
    const throttleTimerRef = useRef<any>();
    const UploadIcon = () => <img src={new URL(`./asset/uploadIcon.png`, import.meta.url).href} alt="" />;
    // 弹窗打开时设置表单默认值
    useEffect(() => {
        if (visible) {
            if (modalType === 'offshelf') {
               setTimeout(() => {
            form.setFieldsValue({ offDays: '30' });
        }, 0);
            }
        }
    }, [visible, modalType, form]);

    // 重置表单和文件列表
    const handleClose = async (skipDelete = false) => {
        // 如果有已上传的文件且不是提交成功的情况，批量删除
        if (!skipDelete && uploadedFiles.length > 0) {
            try {
                await request.post('/csf/call/deleteOssByFile', { 
                    params: {
                        delFiles: uploadedFiles
                    } 
                });
            } catch (error) {
                // 即使删除失败也继续关闭弹窗，不显示错误提示
            }
        }
        form.resetFields();
        setUploadFileList([]);
        setUploadedFiles([]);
        setUploading(false);
        setUploadProgress(0);
        onClose();
    };

    // 处理取消按钮点击
    const handleCancelClick = () => {
        handleClose();
    };

    // 下载模板
    const downloadTemplate = () => {
        try {
            const url = 'http:' + import.meta.env.VITE_BASE_API + '/api/download/zip/templates.zip';
            const link = document.createElement('iframe');
            link.style.display = 'none';
            link.src = baseApiConvert(url);
            // link.download = '审批证明模板.xlsx';
            document.body.appendChild(link);
            setTimeout(() => {
                document.body.removeChild(link);
            }, 3000);
        } catch (error) {
            message.error('模板下载失败，请重新下载');
        } finally {
        }
    };

    // 下载已上传的文件
    const downloadUploadedFile = (fileInfo: FileInfo) => {
        try {
            // const link = document.createElement('a');
            // link.href = fileInfo.url;
            // link.download = fileInfo.nm;
            // document.body.appendChild(link);
            // link.click();
            // document.body.removeChild(link);
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = baseApiConvert(fileInfo.url);
            document.body.appendChild(iframe);
            // 下载完成后移除 iframe
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 3000); // 给予足够时间开始下载
        } catch (error) {
            message.error('文件下载失败');
        }
    };

    // 文件上传前的验证
    const beforeUpload = (file: any) => {
        const allowedExtensions = ['.txt', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.pdf', '.jpg', '.png', '.bmp', '.gif', '.rar', '.zip'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!allowedExtensions.includes(fileExtension)) {
            message.error(`不支持的文件格式: ${fileExtension}`);
            return Upload.LIST_IGNORE;
        }

        if (!file.size) {
            message.error('文件大小必须大于0KB');
            return Upload.LIST_IGNORE;
        }
        
        const maxSize = 4 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            message.error('文件大小不能超过4MB');
            return Upload.LIST_IGNORE;
        }
        
        if (uploadFileList.length >= 1) {
            message.error('只能上传一个文件');
            return Upload.LIST_IGNORE;
        }
        
        return false; // 阻止自动上传,手动处理
    };

    // 处理文件变化
    const handleFileChange = (info: any) => {
        const { fileList } = info;
        setUploadFileList(fileList);
    };

    // 处理文件删除
    const handleFileRemove = async (file: any) => {
        // 从已上传文件列表中查找对应的文件
        const fileInfo = uploadedFiles.find(item => item.nm === file.name);
        
        // 如果找到已上传的文件，调用 OSS 删除接口
        if (fileInfo) {
            try {
                await request.post('/csf/call/deleteOssByFile', {
                    params: {
                        url: fileInfo.url
                    }
                });
                message.success('文件删除成功');
            } catch (error) {
                console.error('删除 OSS 文件失败:', error);
                return false; // 返回 false 阻止删除
            }
        }
        // 从本地已上传文件列表中删除对应的文件信息
        setUploadedFiles(prev => prev.filter(item => item.nm !== file.name));
        
        // 从uploadFileList中删除对应的文件
        setUploadFileList(prev => prev.filter(item => item.name !== file.name));
        return true;
    };

    // 文件变化后自动调用 OSS 上传接口
    useEffect(() => {
        const files: File[] = uploadFileList
            .filter((file) => file.originFileObj) // 确保有原始文件对象
            .map((file) => file.originFileObj as File);
        
        // 找出未上传的文件（不在 uploadedFiles 中的文件）
        const newFiles = files.filter(file =>
            !uploadedFiles.some(uploaded => uploaded.nm === file.name)
        );
        
        // 如果没有新文件需要上传，直接返回
        if (newFiles.length === 0) {
            return;
        }
        
        const now = Date.now();
        const timeSinceLastCall = now - lastCallTimeRef.current;
        
        // 如果距离上次调用小于3秒，则阻止调用
        if (timeSinceLastCall < 3000) {
            return;
        }
        
        // 清除之前的定时器
        if (throttleTimerRef.current) {
            clearTimeout(throttleTimerRef.current);
        }
        
        try {
            lastCallTimeRef.current = now;
            setUploading(true);
            
            // 只上传新文件
            request
                .upload(
                    '/csf/call/importOssByFileList',
                    'fileupload',
                    newFiles,
                    { type: 'approval' },
                    {
                        showLoading: true,
                        onUploadProgress: (e) => {
                            const progress = e.lengthComputable ? Math.round((e.loaded / e.total) * 100) : 0;
                            setUploadProgress(progress);
                        },
                    },
                )
                .then((res) => {
                    // 将返回的新文件结果转换为 FileInfo 数组
                    const newFileInfos: FileInfo[] = newFiles.map((file, index) => ({
                        nm: file.name,
                        url: res.bean[`${file.name}`] || res.bean[index]
                    }));
                    
                    // 合并已上传的文件和新上传的文件
                    setUploadedFiles(prev => [...prev, ...newFileInfos]);
                    setUploading(false);
                    setUploadProgress(0);
                    message.success('文件上传成功');
                })
                .catch((err) => {
                    message.error('文件上传失败');
                    // 上传失败时，从uploadFileList中移除失败的文件
                    setUploadFileList(prev => prev.filter(item =>
                        !newFiles.some(file => file.name === item.name)
                    ));
                })
                .finally(() => {
                    setTimeout(() => {
                        setUploading(false);
                        setUploadProgress(0);
                    }, 1000);
                });
            
            // 3秒后才能再次调用
            throttleTimerRef.current = setTimeout(() => {
                lastCallTimeRef.current = 0;
            }, 3000);
        } catch (error) {
            console.error('上传失败:', error);
        }
    }, [uploadFileList, uploadedFiles]);

    // 提交下架/回滚申请
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            
            if (uploadFileList.length === 0) {
                message.error(modalType === 'rollback' ? '请上传附件' : '请上传审批证明');
                return;
            }

            if (uploadedFiles.length === 0) {
                message.error('文件还未上传完成，请等待上传完成后重试');
                return;
            }

            // 构建符合接口要求的数据格式
            const submitData: any = {
                applyReason: values.applyReason,        // 申请原因
                applyFiles: uploadedFiles,            // 审核证明文件数组 [{nm: "文件名称", url: "链接"}]
                opeStaffId: userInfo.staffId,         // 操作人工号
                opeStaffNm: userInfo.staffName        // 操作人名称
            };

            // 只有下架申请才包含下架公告和时间
            if (modalType === 'offshelf') {
                submitData.downNotice = values.announceText;      // 下架公告
                submitData.downDays = values.offDays;             // 下架时间
            }

            // 将格式化后的数据传递给父组件
            await onSubmit(submitData);
            
            // message.success(modalType === 'rollback' ? '回滚申请提交成功' : '下架申请提交成功');
            handleClose(true); // 提交成功后跳过删除 OSS 文件
            onRefresh();

        } catch (error) {
            console.log('表单验证失败或提交失败:', error);
        }
    };

    return (
        <Modal
            title={modalType === 'rollback' ? '回滚申请' : '下架申请'}
            open={visible}
            onCancel={handleCancelClick}
            footer={null}
            width={800}
            destroyOnClose
        >
            {modalType === 'offshelf' && (
                <div style={{ color: '#F65A56', margin: '0 0 15px 125px', fontSize: 12 }}>
                    <div style={{ width: 14, height: 14, border: '1px solid #F65A56', display: 'inline-flex', borderRadius: '50%',alignItems: 'center', paddingLeft: 4.5, marginRight: 5 }}>i</div>
                    下架需配置下架公告、时间并上传审批证明,下架后应用页面无法继续访问。
                </div>
            )}
            <Form form={form} layout="horizontal" initialValues={modalType === 'offshelf' ? { offDays: '30' } : {}}>
                {modalType === 'offshelf' ? (
                    <>
                        <Form.Item
                            label="下架公告"
                            name="announceText"
                            labelCol={{ span: 4 }}
                            wrapperCol={{ span: 19 }}
                            rules={[{ required: true, message: '请输入下架公告' }]}
                        >
                            <Input.TextArea rows={3} placeholder="请输入" />
                        </Form.Item>
                        <Form.Item
                            label={<Space><span>下架时间</span></Space>}
                            name="offDays"
                            labelCol={{ span: 4 }}
                            wrapperCol={{ span: 19 }}
                            rules={[
                                { required: true, message: '请输入下架时间' },
                                { pattern: /^(?:30|[3-9][0-9]|[1-9][0-9]{2,})$/, message: '请输入大于0的正整数' }
                            ]}
                        >
                            <div style={{ display: 'flex' }}>
                                <Input defaultValue={30} type="number" min={30} style={{ width: 64, height: 30 }}/>
                                <div style={{ fontSize: 13, position: 'absolute', left: 75, top: 5 }} > 天后系统自动下架，应用下架时间请根据《在线营销服务中心前端应用上下线管理实施细则（试行）》配置 </div>
                            </div>
                        </Form.Item>
                    </>
                ) : (
                    <Form.Item
                        label="目标版本"
                        labelCol={{ span: 4 }}
                        wrapperCol={{ span: 19 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 13 }}>{record?.belongVersion || '-'}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <div style={{ width: 14, height: 14, border: '1px solid #F65A56', color: '#F65A56', display: 'inline-flex', borderRadius: '50%', alignItems: 'center', margin: '0 7px 0 14px', paddingLeft: 4.5 }}>i</div>
                                <span style={{ color: '#F65A56', fontSize: 12 }}>
                                    回滚审核通过后将运行版本替换为已申请版本内容。
                                </span>
                            </div>
                        </div>
                    </Form.Item>
                )}
                <Form.Item
                    label={<Space><span>{modalType === 'rollback' ? '附件' : '审批证明'}</span></Space>}
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 19 }}
                    required
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <Upload
                                fileList={uploadFileList}
                                beforeUpload={beforeUpload}
                                onChange={handleFileChange}
                                onRemove={handleFileRemove}
                                disabled={uploading}
                                accept=".txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.jpg,.png,.bmp,.gif,.rar,.zip"
                                maxCount={1}
                            >
                                {uploadedFiles.length === 0 && (
                                    uploading ? (
                                        <div style={{ textAlign: 'center' }}>
                                            <Progress percent={uploadProgress} size="small" />
                                            <div style={{ fontSize: 12, marginTop: 4 }}>上传中...</div>
                                        </div>
                                    ) : (
                                        <Button
                                            icon={<UploadIcon />}
                                            style={{ width: '96px', height: '30px', borderRadius: '3px', border: '1px solid #21A2DE', color: '#21A2DE', fontSize: 12 }}
                                        >
                                            点击上传
                                        </Button>
                                    )
                                )}
                            </Upload>
                            {/* {uploadedFiles.length === 0 && modalType === 'offshelf' && (
                                <div
                                    style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 12, position: 'absolute', left: 108, top: 5 }}
                                    onClick={downloadTemplate}
                                >
                                    <span>审批证明模板.xlsx</span>
                                    <img src={new URL(`./asset/downloadIcon.png`, import.meta.url).href} alt="" />
                                </div>
                            )} */}
                            {uploadedFiles.length > 0 && (
                                <div
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 13 }}
                                >
                                    {uploadedFiles.map((file, index) => (
                                        <span
                                            key={index}
                                            style={{
                                                fontSize: 12,
                                                color: '#21A2DE',
                                                cursor: 'pointer',
                                                textDecoration: 'underline'
                                            }}
                                            onClick={() => downloadUploadedFile(file)}
                                        >
                                            <img src={new URL(`./asset/downloadIcon.png`, import.meta.url).href} alt="" />
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div style={{ color: '#969696', fontSize: 12 }}>
                            传相关附件(如需求文档、截图、证明文件),有助于审批人快速理解,提高通过率。上传格式包含:.txt|.doc|.docx|.xls|.xlsx|.ppt|.pptx|.pdf|.jpg|.png|.bmp|.gif|.rar|.zip,文件不能超过4M,只能上传一个文件。
                        </div>
                    </div>
                </Form.Item>
                <Form.Item
                    label="申请原因"
                    name="applyReason"
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 19 }}
                    rules={[{ required: true }]}
                >
                    <Input.TextArea rows={3} placeholder="请输入" />
                </Form.Item>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                    <Button type="primary" onClick={handleSubmit}>提交</Button>
                    <Button onClick={handleCancelClick}>取消</Button>
                </div>
            </Form>
        </Modal>
    );
};

export default OffshelfModal;
