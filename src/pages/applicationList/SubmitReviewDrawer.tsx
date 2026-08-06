import React, { useState, useEffect, useRef } from 'react';
import { Drawer, Button, Space, Steps, Form, Input, Upload, App, Progress, Radio } from 'antd';
import { baseApiConvert } from '../../utils/util';
import request from '../../utils/request';
import { crossApiUserInfo } from '../../stores/crossapiStore';
import styles from './SubmitReviewDrawer.module.less';

const { Step } = Steps;

// 文件信息接口
interface FileInfo {
    nm: string;  // 文件名称
    url: string; // 文件链接
}

interface SubmitReviewDrawerProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (pubSubInfo: any) => Promise<boolean> | boolean; // 返回 true 表示提交成功，false 表示失败
}

/**
 * 提交审核抽屉组件
 */
const SubmitReviewDrawer: React.FC<SubmitReviewDrawerProps> = ({
    visible,
    onClose,
    onSubmit,
}) => {
    const { message } = App.useApp();
    const [form] = Form.useForm(); // 申请信息专用form
    const [requirementForm] = Form.useForm(); // 研发云工单步骤专用form
    const [securityForm] = Form.useForm(); // 安全合规内容专用form
    const [dataSafeFilesVisible, setDataSafeFilesVisible] = useState(true); // 数据安全自查结果的显隐
    const [showArea, setShowArea] = useState<string>('');

    // 监听来自 CanvasTop 的 showArea 更新
    useEffect(() => {
        const handleShowAreaChange = (e: CustomEvent<{ showArea: string }>) => {
            setShowArea(e.detail.showArea);
        };
        window.addEventListener('submitReviewShowArea', handleShowAreaChange as EventListener);
        return () => {
            window.removeEventListener('submitReviewShowArea', handleShowAreaChange as EventListener);
        };
    }, []);

    // 审批证明文件上传状态
    const [uploadFileList, setUploadFileList] = useState<any[]>([]); // 上传文件数据
    const [uploadedFiles, setUploadedFiles] = useState<FileInfo[]>([]); // 已上传文件数据
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    
    // 网络安全自查结果文件上传状态
    const [networkSecurityFileList, setNetworkSecurityFileList] = useState<any[]>([]);
    const [networkSecurityUploadedFiles, setNetworkSecurityUploadedFiles] = useState<FileInfo[]>([]);
    const [networkSecurityUploading, setNetworkSecurityUploading] = useState(false);
    const [networkSecurityUploadProgress, setNetworkSecurityUploadProgress] = useState(0);
    
    // 数据安全自查结果文件上传状态
    const [dataSecurityFileList, setDataSecurityFileList] = useState<any[]>([]);
    const [dataSecurityUploadedFiles, setDataSecurityUploadedFiles] = useState<FileInfo[]>([]);
    const [dataSecurityUploading, setDataSecurityUploading] = useState(false);
    const [dataSecurityUploadProgress, setDataSecurityUploadProgress] = useState(0);
    
    // 研发云工单查询状态
    const [requirementQueryResult, setRequirementQueryResult] = useState<any>(null);
    const [requirementQueryLoading, setRequirementQueryLoading] = useState(false);
    const [hasQueried, setHasQueried] = useState(false); // 是否已经执行过查询
    const [requirementNumberInput, setRequirementNumberInput] = useState(''); // 独立管理输入框的值
    
    // 需求提交人手机号查询状态
    const [submitterPhoneInput, setSubmitterPhoneInput] = useState(''); // 独立管理输入框的值
    const [submitterPhoneQueryResult, setSubmitterPhoneQueryResult] = useState<any>(null);
    const [submitterPhoneQueryLoading, setSubmitterPhoneQueryLoading] = useState(false);
    const [hasQueriedSubmitterPhone, setHasQueriedSubmitterPhone] = useState(false); // 是否已经执行过查询
    const [selectedStaffTag, setSelectedStaffTag] = useState<string>(''); // 选中的工号标签，格式为"姓名(工号)"
    
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const lastCallTimeRef = useRef(0);
    const throttleTimerRef = useRef<any>();
    const submitDebounceTimerRef = useRef<any>(); // 提交按钮防抖定时器
    const isSubmittingRef = useRef(false); // 标记是否正在提交
    const UploadIcon = () => <img src={new URL(`./asset/uploadIcon.png`, import.meta.url).href} alt="" />;

    // 监听抽屉打开状态，重置研发云工单查询状态
    useEffect(() => {
        if (visible) {
            setRequirementQueryResult(null);
            setRequirementQueryLoading(false);
            setHasQueried(false);
            setRequirementNumberInput('');
            requirementForm.resetFields();
            
            // 重置需求提交人手机号查询状态
            setSubmitterPhoneInput('');
            setSubmitterPhoneQueryResult(null);
            setSubmitterPhoneQueryLoading(false);
            setHasQueriedSubmitterPhone(false);
            setSelectedStaffTag(''); // 重置选中的工号标签
            
            // 重置安全合规内容表单
            securityForm.resetFields();
            
            // 抽屉打开时自动滚动到顶部
            setTimeout(() => {
                const drawerBody = document.querySelector('.ant-drawer-body');
                if (drawerBody) {
                    drawerBody.scrollTop = 0;
                }
            }, 100);
        }
    }, [visible]);

    // 处理提交按钮点击（实际执行逻辑）
    const handleSubmitInternal = async () => {
        try {
            let params = {}
            if(showArea != '2'){
                // 校验研发云工单表单
                const requirementValues = await requirementForm.validateFields();
                if(!requirementQueryResult){
                    message.warning('请输入正确的研发云需求单号');
                    return;
                }
                // 校验需求提交人手机号格式
                if (requirementValues.submitterPhone) {
                    const phonePattern = /^1[3-9]\d{9}$/;
                    if (!phonePattern.test(requirementValues.submitterPhone)) {
                        message.warning('请输入正确的11位手机号');
                        return;
                    }
                }
                // 校验是否选择了工号标签
                if (!selectedStaffTag) {
                    message.warning('请检索需求提交人工号并选择工号');
                    return;
                }
                // 设置文件字段值
                securityForm.setFieldsValue({
                    netSafeFiles: networkSecurityUploadedFiles
                });
                dataSafeFilesVisible && securityForm.setFieldsValue({
                    dataSafeFiles: dataSecurityUploadedFiles
                });
                // 校验安全合规内容表单
                const securityValues = await securityForm.validateFields();
                params = {
                    ...requirementValues,
                    ...securityValues,
                }
            }
            form.setFieldsValue({
                applyFiles: uploadedFiles
            });
            
            
            
            // 校验申请信息表单（申请原因是可选的，不强制校验）
            const applyValues = await form.validateFields();
            if(!applyValues.applyReason){
                message.warning('请输入申请原因');
                return;
            }
            if(applyValues.applyReason?.length > 200){
                message.warning('申请原因限制200字符');
                return;
            }

            // 封装参数到 pubSubInfo 下
            const pubSubInfo = {
                ...(showArea != '2' ? {...params, devStaff: selectedStaffTag } : {}),
                ...applyValues,
                reviewState: 'pubSub', // 发布提交
                opeStaffId: userInfo.staffId,  // 操作人工号
                opeStaffNm: userInfo.staffName,  // 操作人名称
            };
            
            const success = await onSubmit(pubSubInfo);
            // 只有提交成功才关闭抽屉，跳过删除已上传的文件
            if (success !== false) {
                handleClose(true); // 传递 true 跳过文件删除
            }
        } catch (error) {
            console.error('提交审核失败:', error);
            // 表单校验失败的错误已在表单层面处理
        } finally {
            // 提交完成后重置状态
            isSubmittingRef.current = false;
        }
    };

    // 处理提交按钮点击（带防抖）
    const handleSubmit = () => {
        // 如果正在提交中，直接返回
        if (isSubmittingRef.current) {
            message.warning('正在提交中，请勿重复点击');
            return;
        }

        // 清除之前的防抖定时器
        if (submitDebounceTimerRef.current) {
            clearTimeout(submitDebounceTimerRef.current);
        }

        // 设置正在提交状态
        isSubmittingRef.current = true;

        // 设置防抖延迟（500ms），防止快速连续点击
        submitDebounceTimerRef.current = setTimeout(() => {
            handleSubmitInternal();
        }, 500);
    };

    // 重置表单和文件列表
    const handleClose = async (skipDelete = false) => {
        // 关闭时重置提交状态
        isSubmittingRef.current = false;
        if (submitDebounceTimerRef.current) {
            clearTimeout(submitDebounceTimerRef.current);
        }
        // 如果有已上传的文件且不是提交成功的情况，批量删除
        if (!skipDelete) {
            // 合并所有需要删除的文件
            const allFilesToDelete = [
                ...uploadedFiles,
                ...networkSecurityUploadedFiles,
                ...dataSecurityUploadedFiles
            ];
            
            // 如果有待删除的文件，调用一次批量删除接口
            if (allFilesToDelete.length > 0) {
                try {
                    await request.post('/csf/call/deleteOssByFile', {
                        params: {
                            delFiles: allFilesToDelete
                        }
                    });
                } catch (error) {
                    // 即使删除失败也继续关闭弹窗，不显示错误提示
                }
            }
        }
        // 重置申请信息表单
        form.resetFields();
        // 重置审批证明状态
        setUploadFileList([]);
        setUploadedFiles([]);
        setUploading(false);
        setUploadProgress(0);
        // 重置网络安全自查结果状态
        setNetworkSecurityFileList([]);
        setNetworkSecurityUploadedFiles([]);
        setNetworkSecurityUploading(false);
        setNetworkSecurityUploadProgress(0);
        // 重置数据安全自查结果状态
        setDataSecurityFileList([]);
        setDataSecurityUploadedFiles([]);
        setDataSecurityUploading(false);
        setDataSecurityUploadProgress(0);
        setDataSafeFilesVisible(true);
        // 重置研发云工单查询状态
        setRequirementQueryResult(null);
        setRequirementQueryLoading(false);
        setHasQueried(false);
        setRequirementNumberInput(''); // 重置输入框值
        requirementForm.resetFields();
        
        // 重置需求提交人手机号查询状态
        setSubmitterPhoneInput('');
        setSubmitterPhoneQueryResult(null);
        setSubmitterPhoneQueryLoading(false);
        setHasQueriedSubmitterPhone(false);
        setSelectedStaffTag(''); // 重置选中的工号标签
        
        // 重置安全合规内容表单
        securityForm.resetFields();
        
        onClose();
    };

    // 下载网络自查模板
    const downloadNetworkSecurityTemplate = () => {
        try {
            const url = 'http:' + import.meta.env.VITE_BASE_API + '/api/download/zip/networkSafeTemp.xlsx';
            const link = document.createElement('iframe');
            link.style.display = 'none';
            link.src = baseApiConvert(url);
            // link.download = '网络安全及数据安全自检查-模板.xlsx';
            document.body.appendChild(link);
            setTimeout(() => {
                document.body.removeChild(link);
            }, 3000); 
        } catch (error) {
            message.error('模板下载失败，请重新下载');
        }
    };

    // 下载数据自查模板
    const downloadDataSecurityTemplate = () => {
        try {
            const url = 'http:' + import.meta.env.VITE_BASE_API + '/api/download/zip/dataSafeTemp.xlsx';
            const link = document.createElement('iframe');
            link.style.display = 'none';
            link.src = baseApiConvert(url);
            // link.download = '数据安全及数据安全自检查-模板.xlsx';
            document.body.appendChild(link);
            setTimeout(() => {
                document.body.removeChild(link);
            }, 3000); 
        } catch (error) {
            message.error('模板下载失败，请重新下载');
        }
    };

    // 查询研发云需求单号
    const handleRequirementQuery = async () => {
        try {
            // 直接从状态获取输入的值
            const requirementNumber = requirementNumberInput.trim();
            
            if (!requirementNumber) {
                message.warning('请输入需求单号');
                return;
            }
            
            // 同时更新表单值
            requirementForm.setFieldsValue({ devNo: requirementNumber });
            
            setRequirementQueryLoading(true);
            setHasQueried(true);
            
            // 调用真实接口
            const response = await request.post('/csf/call/queryCloudDemandexdetaildemandCsf', {
                params: {
                    rrCode: requirementNumber,
                    account: "000"
                }
            });
            
            // 处理查询结果
            if (response && response.object) {
                setRequirementQueryResult({
                    requirementNumber: response.object.rrCode || requirementNumber,
                    requirementName: response.object.title || '',
                    unit: response.object.deptName || '',
                    submitter: response.object.creatorName || ''
                });
                message.success('查询成功');
            } else {
                setRequirementQueryResult(null);
                message.warning('暂无数据，请输入正确的研发云需求单号');
            }
            
            setRequirementQueryLoading(false);
        } catch (error) {
            if ((error as any).errorFields) {
                // 这是表单验证错误
                message.warning('请输入需求单号');
            } else {
                // 这是查询错误
                setRequirementQueryResult(null);
                setRequirementQueryLoading(false);
            }
        }
    };
    
    // 查询需求提交人手机号
    const handleSubmitterPhoneQuery = async () => {
        try {
            const phoneNumber = submitterPhoneInput.trim();
            
            if (!phoneNumber) {
                message.warning('请输入手机号');
                return;
            }
            
            // 校验手机号格式是否为11位
            const phonePattern = /^1[3-9]\d{9}$/;
            if (!phonePattern.test(phoneNumber)) {
                message.warning('请输入正确的11位手机号');
                return;
            }
            
            // 同时更新表单值
            requirementForm.setFieldsValue({ submitterPhone: phoneNumber });
            
            setSubmitterPhoneQueryLoading(true);
            setHasQueriedSubmitterPhone(true);
            setSelectedStaffTag(''); // 搜索时重置选中状态
            
            // 调用真实接口
            const response = await request.post('/appTenant/queryAdminStaffInfo', { params: { phone: phoneNumber } });
            
            // 处理查询结果
            if (response && response.beans && response.beans.length > 0) {
                // 提取所有员工信息，格式化为"姓名(工号)"
                const staffList = response.beans.map((item: any) => {
                    const keys = Object.keys(item);
                    if (keys.length > 0) {
                        const key = keys[0]; // 工号
                        const value = item[key]; // 姓名
                        return `${value}(${key})`; // 组合成"姓名(工号)"格式
                    }
                    return '';
                }).filter(Boolean); // 过滤掉空字符串
                
                setSubmitterPhoneQueryResult({
                    staffList: staffList,
                    raw: response.beans
                });
                message.success(`查询需求提交人手机号成功`);
            } else {
                setSubmitterPhoneQueryResult(null);
                message.info('暂无数据');
            }
            
            setSubmitterPhoneQueryLoading(false);
        } catch (error) {
            setSubmitterPhoneQueryResult(null);
            setSubmitterPhoneQueryLoading(false);
        }
    };

    // 文件上传前的验证
    const beforeUpload = (file: any, currentFileList?: any[]) => {
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
        
        if (currentFileList && currentFileList.length >= 1) {
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

    // 处理文件删除（通用方法）
    const handleFileRemove = async (file: any, uploadedList: FileInfo[], setUploadedList: React.Dispatch<React.SetStateAction<FileInfo[]>>, fileList: any[], setFileList: React.Dispatch<React.SetStateAction<any[]>>) => {
        // 从已上传文件列表中查找对应的文件
        const fileInfo = uploadedList.find(item => item.nm === file.name);
        
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
        setUploadedList(prev => prev.filter(item => item.nm !== file.name));
        
        // 从uploadFileList中删除对应的文件
        setFileList(prev => prev.filter(item => item.name !== file.name));
        return true;
    };

    // 处理审批证明文件删除
    const handleApprovalFileRemove = (file: any) => {
        return handleFileRemove(file, uploadedFiles, setUploadedFiles, uploadFileList, setUploadFileList);
    };

    // 处理网络安全自查结果文件删除
    const handleNetworkSecurityFileRemove = (file: any) => {
        return handleFileRemove(file, networkSecurityUploadedFiles, setNetworkSecurityUploadedFiles, networkSecurityFileList, setNetworkSecurityFileList);
    };

    // 处理数据安全自查结果文件删除
    const handleDataSecurityFileRemove = (file: any) => {
        return handleFileRemove(file, dataSecurityUploadedFiles, setDataSecurityUploadedFiles, dataSecurityFileList, setDataSecurityFileList);
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

    // 网络安全自查结果文件自动上传
    useEffect(() => {
        const files: File[] = networkSecurityFileList
            .filter((file) => file.originFileObj)
            .map((file) => file.originFileObj as File);
        
        const newFiles = files.filter(file =>
            !networkSecurityUploadedFiles.some(uploaded => uploaded.nm === file.name)
        );
        
        if (newFiles.length === 0) return;
        
        const now = Date.now();
        if (now - lastCallTimeRef.current < 3000) return;
        
        if (throttleTimerRef.current) {
            clearTimeout(throttleTimerRef.current);
        }
        
        try {
            lastCallTimeRef.current = now;
            setNetworkSecurityUploading(true);
            
            request
                .upload(
                    '/csf/call/importOssByFileList',
                    'fileupload',
                    newFiles,
                    { type: 'network_security' },
                    {
                        showLoading: true,
                        onUploadProgress: (e) => {
                            const progress = e.lengthComputable ? Math.round((e.loaded / e.total) * 100) : 0;
                            setNetworkSecurityUploadProgress(progress);
                        },
                    },
                )
                .then((res) => {
                    const newFileInfos: FileInfo[] = newFiles.map((file, index) => ({
                        nm: file.name,
                        url: res.bean[`${file.name}`] || res.bean[index]
                    }));
                    
                    setNetworkSecurityUploadedFiles(prev => [...prev, ...newFileInfos]);
                    setNetworkSecurityUploading(false);
                    setNetworkSecurityUploadProgress(0);
                    message.success('文件上传成功');
                })
                .catch((err) => {
                    message.error('文件上传失败');
                    // 上传失败时，从networkSecurityFileList中移除失败的文件
                    setNetworkSecurityFileList(prev => prev.filter(item =>
                        !newFiles.some(file => file.name === item.name)
                    ));
                })
                .finally(() => {
                    setTimeout(() => {
                        setNetworkSecurityUploading(false);
                        setNetworkSecurityUploadProgress(0);
                    }, 1000);
                });
            
            throttleTimerRef.current = setTimeout(() => {
                lastCallTimeRef.current = 0;
            }, 3000);
        } catch (error) {
            console.error('上传失败:', error);
        }
    }, [networkSecurityFileList, networkSecurityUploadedFiles]);

    // 数据安全自查结果文件自动上传
    useEffect(() => {
        const files: File[] = dataSecurityFileList
            .filter((file) => file.originFileObj)
            .map((file) => file.originFileObj as File);
        
        const newFiles = files.filter(file =>
            !dataSecurityUploadedFiles.some(uploaded => uploaded.nm === file.name)
        );
        
        if (newFiles.length === 0) return;
        
        const now = Date.now();
        if (now - lastCallTimeRef.current < 3000) return;
        
        if (throttleTimerRef.current) {
            clearTimeout(throttleTimerRef.current);
        }
        
        try {
            lastCallTimeRef.current = now;
            setDataSecurityUploading(true);
            
            request
                .upload(
                    '/csf/call/importOssByFileList',
                    'fileupload',
                    newFiles,
                    { type: 'data_security' },
                    {
                        showLoading: true,
                        onUploadProgress: (e) => {
                            const progress = e.lengthComputable ? Math.round((e.loaded / e.total) * 100) : 0;
                            setDataSecurityUploadProgress(progress);
                        },
                    },
                )
                .then((res) => {
                    const newFileInfos: FileInfo[] = newFiles.map((file, index) => ({
                        nm: file.name,
                        url: res.bean[`${file.name}`] || res.bean[index]
                    }));
                    
                    setDataSecurityUploadedFiles(prev => [...prev, ...newFileInfos]);
                    setDataSecurityUploading(false);
                    setDataSecurityUploadProgress(0);
                    message.success('文件上传成功');
                })
                .catch((err) => {
                    message.error('文件上传失败');
                    // 上传失败时，从dataSecurityFileList中移除失败的文件
                    setDataSecurityFileList(prev => prev.filter(item =>
                        !newFiles.some(file => file.name === item.name)
                    ));
                })
                .finally(() => {
                    setTimeout(() => {
                        setDataSecurityUploading(false);
                        setDataSecurityUploadProgress(0);
                    }, 1000);
                });
            
            throttleTimerRef.current = setTimeout(() => {
                lastCallTimeRef.current = 0;
            }, 3000);
        } catch (error) {
            console.error('上传失败:', error);
        }
    }, [dataSecurityFileList, dataSecurityUploadedFiles]);

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

    // 通用文件上传组件
    const FileUploadComponent = ({
        fileList,
        setFileList,
        uploadedFiles,
        setUploadedFiles,
        uploading,
        uploadProgress,
        onRemove,
        uploadType,
        showTemplate,
        templateName,
        downloadHandler,
        hint
    }: {
        fileList: any[],
        setFileList: React.Dispatch<React.SetStateAction<any[]>>,
        uploadedFiles: FileInfo[],
        setUploadedFiles: React.Dispatch<React.SetStateAction<FileInfo[]>>,
        uploading: boolean,
        uploadProgress: number,
        onRemove: (file: any) => Promise<boolean>,
        uploadType: string,
        showTemplate: boolean,
        templateName: string,
        downloadHandler?: () => void,
        hint: string
    }) => {
        return (
            <div className={styles.fileUploadContainer}>
                <div className={styles.fileUploadActions}>
                    <Upload
                        fileList={fileList}
                        beforeUpload={(file) => beforeUpload(file, fileList)}
                        onChange={(info) => setFileList(info.fileList)}
                        onRemove={onRemove}
                        disabled={uploading}
                        accept=".txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.jpg,.png,.bmp,.gif,.rar,.zip"
                        maxCount={1}
                    >
                        {uploadedFiles.length === 0 && (
                            uploading ? (
                                <div className={styles.uploadProgress}>
                                    <Progress percent={uploadProgress} size="small" />
                                    <div className={styles.uploadText}>上传中...</div>
                                </div>
                            ) : (
                                <Button
                                    icon={<UploadIcon />}
                                    className={styles.uploadButton}
                                >
                                    点击上传
                                </Button>
                            )
                        )}
                    </Upload>
                    {uploadedFiles.length === 0 && showTemplate && downloadHandler && (
                        <div
                            className={styles.templateLink}
                            onClick={downloadHandler}
                        >
                            <span>{templateName}</span>
                            <img src={new URL(`./asset/downloadIcon.png`, import.meta.url).href} alt="" />
                        </div>
                    )}
                    {uploadedFiles.length > 0 && (
                        <div className={styles.uploadedFiles}>
                            {uploadedFiles.map((file, index) => (
                                <span
                                    key={index}
                                    className={styles.fileDownloadLink}
                                    onClick={() => downloadUploadedFile(file)}
                                >
                                    <img src={new URL(`./asset/downloadIcon.png`, import.meta.url).href} alt="" />
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                <div className={styles.hintText}>
                    {hint}
                </div>
            </div>
        );
    };

    const isDataSafeChange = (e:any) => {
        if(e.target.value === '0'){
            setDataSafeFilesVisible(false);
            handleDataSecurityFileRemove(dataSecurityFileList[0])
            setDataSecurityFileList([]);
            setDataSecurityUploadedFiles([]);
            setDataSecurityUploading(false);
            setDataSecurityUploadProgress(0);
        }else{
            setDataSafeFilesVisible(true);
        }
    };

    return (
        <Drawer
            title="应用发布提交"
            placement="right"
            width={1000}
            open={visible}
            onClose={() => handleClose(false)}
            maskClosable={false}
            className={styles.submitReviewDrawer}
            getContainer={false}
            rootClassName="custom-drawer-root"
            destroyOnClose
            footer={
                <Space>
                    <Button
                        type="primary"
                        onClick={handleSubmit}
                        loading={isSubmittingRef.current}
                    >
                        提交
                    </Button>
                    <Button onClick={() => handleClose(false)}>取消</Button>
                </Space>
            }
        >
            {/* 抽屉内容区域，可以根据需要添加其他内容 */}
            <div>
                <Steps
                    direction="vertical"
                    current={3}
                    progressDot
                    /* 假设当前在最后一步，也可以设置为0,1,2 */
                >
                    {/* <Step
                        title="能力订购"
                        description={
                            <Form form={form} layout="vertical">
                            
                            </Form>
                        }
                    /> */}
                    {showArea != '2' && (<Step
                        title="研发云工单"
                        description={
                            <Form form={requirementForm} layout="horizontal" labelCol={{ span: 4 }} wrapperCol={{ span: 19 }}>
                                <Form.Item
                                    label="研发云需求单号"
                                    name="devNo"
                                    rules={[{ required: true, message: '请输入需求单号' }]}
                                    className={styles.formItemRelative}
                                >
                                    <Input
                                        placeholder="请输入此应用新增/迭代涉及的需求工单，并检索确认工单是否正确"
                                        value={requirementNumberInput}
                                        onChange={(e: any) => {
                                            const value = e.target.value;
                                            setRequirementNumberInput(value);
                                            if (!value) {
                                                // 点击清除按钮或清空输入框时，重置查询状态
                                                requirementForm.setFieldsValue({ devNo: '' });
                                                setRequirementQueryResult(null);
                                                setHasQueried(false);
                                            }
                                        }}
                                        allowClear
                                        className={styles.inputWithRightPadding}
                                    />
                                    <Button
                                        type="link"
                                        onClick={handleRequirementQuery}
                                        loading={requirementQueryLoading}
                                        className={styles.searchButton}
                                    >
                                        检索
                                    </Button>
                                </Form.Item>
                                <Form.Item wrapperCol={{ offset: 4, span: 19 }}>
                                    {!hasQueried && (
                                        <div className={styles.queryResultContainer}>
                                            请在上方输入需求单号后，点击<span className={styles.searchHint}>检索</span>
                                        </div>
                                    )}
                                    {hasQueried && !requirementQueryResult && (
                                        <div className={styles.queryResultContainer}>
                                            暂无数据
                                        </div>
                                    )}
                                    {hasQueried && requirementQueryResult && (
                                        <div className={styles.queryResultDetail}>
                                            <div className={styles.resultRow}>
                                                <span className={`${styles.resultLabel} ${styles.resultLabelWide}`}>需求单号：</span>
                                                <span className={styles.resultValue}>{requirementQueryResult.requirementNumber}</span>
                                            </div>
                                            <div className={styles.resultRow}>
                                                <span className={`${styles.resultLabel} ${styles.resultLabelMedium}`}>需求名称：</span>
                                                <span className={`${styles.resultValue} ${styles.resultValueBreak}`}>{requirementQueryResult.requirementName}</span>
                                            </div>
                                            <div className={styles.resultRow}>
                                                <span className={`${styles.resultLabel} ${styles.resultLabelWide}`}>所属单位：</span>
                                                <span className={styles.resultValue}>{requirementQueryResult.unit}</span>
                                            </div>
                                            <div className={styles.resultRow}>
                                                <span className={`${styles.resultLabel} ${styles.resultLabelShort}`}>提交人：</span>
                                                <span className={styles.resultValue}>{requirementQueryResult.submitter}</span>
                                            </div>
                                        </div>
                                    )}
                                </Form.Item>
                                <Form.Item
                                    label="需求提交人工号"
                                    name="submitterPhone"
                                    rules={[
                                        { required: true, message: '请输入需求提交人手机号' },
                                        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的11位手机号' }
                                    ]}
                                    className={styles.formItemRelative}
                                >
                                    <Input
                                        placeholder="请输入手机号码检索此需求提交人工号，并选择对应的业务工号进行一致性确认审核"
                                        value={submitterPhoneInput}
                                        onChange={(e: any) => {
                                            const value = e.target.value;
                                            setSubmitterPhoneInput(value);
                                            if (!value) {
                                                // 点击清除按钮或清空输入框时，重置查询状态
                                                requirementForm.setFieldsValue({ submitterPhone: '' });
                                                setSubmitterPhoneQueryResult(null);
                                                setHasQueriedSubmitterPhone(false);
                                                setSelectedStaffTag(''); // 重置选中的工号标签
                                            }
                                        }}
                                        allowClear
                                        className={styles.inputWithRightPadding}
                                    />
                                    <Button
                                        type="link"
                                        onClick={handleSubmitterPhoneQuery}
                                        loading={submitterPhoneQueryLoading}
                                        className={styles.searchButton}
                                    >
                                        检索
                                    </Button>
                                </Form.Item>
                                <Form.Item wrapperCol={{ offset: 4, span: 19 }}>
                                    {!hasQueriedSubmitterPhone && (
                                        <div className={styles.queryResultContainer}>
                                            请在上方输入手机号后，点击<span className={styles.searchHint}>检索</span>
                                        </div>
                                    )}
                                    {hasQueriedSubmitterPhone && !submitterPhoneQueryResult && (
                                        <div className={styles.queryResultContainer}>
                                            暂无数据
                                        </div>
                                    )}
                                    {hasQueriedSubmitterPhone && submitterPhoneQueryResult && (
                                        <div style={{
                                            backgroundColor: '#F2F7FD',
                                            padding: '12px',
                                            borderRadius: '3px',
                                            fontSize: '13px'
                                        }}>
                                            <div className={styles.queryResultGrid}>
                                                {submitterPhoneQueryResult.staffList.map((staffInfo: string, index: number) => (
                                                    <div
                                                        key={index}
                                                        onClick={() => setSelectedStaffTag(staffInfo)}
                                                        className={`${styles.staffTag} ${selectedStaffTag === staffInfo ? styles.staffTagSelected : ''}`}
                                                    >
                                                        {staffInfo}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </Form.Item>
                            </Form>
                        }
                    />)}
                    {showArea != '2' && (<Step
                        title="安全合规内容"
                        description={
                            <Form form={securityForm} layout="horizontal" labelCol={{ span: 4 }} wrapperCol={{ span: 19 }}>
                                <Form.Item
                                    label="网络安全自查结果"
                                    name="netSafeFiles"
                                    required
                                    rules={[
                                        {
                                            validator: (_, value) => {
                                                if (networkSecurityUploadedFiles.length === 0) {
                                                    return Promise.reject('请上传网络安全自查结果');
                                                }
                                                return Promise.resolve();
                                            }
                                        }
                                    ]}
                                >
                                    <FileUploadComponent
                                        fileList={networkSecurityFileList}
                                        setFileList={setNetworkSecurityFileList}
                                        uploadedFiles={networkSecurityUploadedFiles}
                                        setUploadedFiles={setNetworkSecurityUploadedFiles}
                                        uploading={networkSecurityUploading}
                                        uploadProgress={networkSecurityUploadProgress}
                                        onRemove={(file) => handleNetworkSecurityFileRemove(file)}
                                        uploadType="network_security"
                                        showTemplate={true}
                                        templateName="网络安全及数据安全自检查-模板.xlsx"
                                        downloadHandler={downloadNetworkSecurityTemplate}
                                        hint="上传格式包含:.txt|.doc|.docx|.xls|.xlsx|.ppt|.pptx|.pdf|.jpg|.png|.bmp|.gif|.rar|.zip,文件不能超过4M,只能上传一个文件。"
                                    />
                                </Form.Item>
                                <Form.Item
                                    label="是否涉及数据安全"
                                    name="isDataSafe"
                                    initialValue="1"
                                    rules={[{ required: true, message: '请选择是否涉及数据安全' }]}
                                >
                                    <Radio.Group className={styles.customRadioGroup} onChange={isDataSafeChange}>
                                        <Radio value="1">是</Radio>
                                        <Radio value="0">否</Radio>
                                    </Radio.Group>
                                </Form.Item>
                                { dataSafeFilesVisible && (
                                    <Form.Item
                                        label="数据安全自查结果"
                                        name="dataSafeFiles"
                                        required
                                        rules={[
                                            {
                                                validator: (_, value) => {
                                                    if (dataSecurityUploadedFiles.length === 0) {
                                                        return Promise.reject('请上传数据安全自查结果');
                                                    }
                                                    return Promise.resolve();
                                                }
                                            }
                                        ]}
                                    >
                                        <FileUploadComponent
                                            fileList={dataSecurityFileList}
                                            setFileList={setDataSecurityFileList}
                                            uploadedFiles={dataSecurityUploadedFiles}
                                            setUploadedFiles={setDataSecurityUploadedFiles}
                                            uploading={dataSecurityUploading}
                                            uploadProgress={dataSecurityUploadProgress}
                                            onRemove={(file) => handleDataSecurityFileRemove(file)}
                                            uploadType="data_security"
                                            showTemplate={true}
                                            templateName="数据安全及数据安全自检查-模板.xlsx"
                                            downloadHandler={downloadDataSecurityTemplate}
                                            hint="上传格式包含:.txt|.doc|.docx|.xls|.xlsx|.ppt|.pptx|.pdf|.jpg|.png|.bmp|.gif|.rar|.zip,文件不能超过4M,只能上传一个文件。"
                                        />
                                    </Form.Item>
                                )}
                            </Form>
                        }
                    />)}
                    <Step
                        title="申请信息"
                        description={
                            <Form form={form} layout="horizontal" labelCol={{ span: 4 }} wrapperCol={{ span: 19 }}>
                                <Form.Item
                                    label="附件"
                                    name="applyFiles"
                                >
                                    <FileUploadComponent
                                        fileList={uploadFileList}
                                        setFileList={setUploadFileList}
                                        uploadedFiles={uploadedFiles}
                                        setUploadedFiles={setUploadedFiles}
                                        uploading={uploading}
                                        uploadProgress={uploadProgress}
                                        onRemove={(file) => handleApprovalFileRemove(file)}
                                        uploadType="attachment"
                                        showTemplate={false}
                                        templateName=""
                                        hint="传相关附件(如需求文档、截图、证明文件),有助于审批人快速理解,提高通过率。上传格式包含:.txt|.doc|.docx|.xls|.xlsx|.ppt|.pptx|.pdf|.jpg|.png|.bmp|.gif|.rar|.zip,文件不能超过4M,只能上传一个文件。"
                                    />
                                </Form.Item>
                                <Form.Item
                                    label="申请原因"
                                    name="applyReason"
                                    rules={[{ required: true, message: '请输入申请原因' }]}
                                >
                                    <Input.TextArea rows={3} placeholder="请输入,限制200字符" />
                                </Form.Item>
                            </Form>
                        }
                    />
                </Steps>
            </div>
        </Drawer>
    );
};

export default SubmitReviewDrawer;
