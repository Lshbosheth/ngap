import { forwardRef, useImperativeHandle, useEffect, useState, useRef } from 'react';
import { App, Drawer, Steps, Form, Input, Select, Button, Row, Col, Upload, Space, Progress, Radio, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import request from '@/utils/request';
import { menu } from '@/stores/menuStore';
import { crossApiUserInfo } from '@/stores/crossapiStore';
import { baseApiConvert } from '../../utils/util';
import './upcheckty.less';
import { SearchOutlined } from '@ant-design/icons'; // 引入搜索图标
const UploadIcon = () => <img src={new URL(`./asset/uploadIcon.png`, import.meta.url).href} alt="" />;
// 文件信息接口
interface FileInfo {
    nm: string;  // 文件名称
    url: string; // 文件链接
}
interface UpdeRefpres {
    onrefFun: () => void;
}

function UpdeRef({ onrefFun }: any, ref: any) {
    const { message } = App.useApp();
    const { Step } = Steps;
    const [drawerOpen, setDrawerOpen] = useState(false);  // 详情抽屉显隐
    const [drawerTitle, setDrawerTitle] = useState('');  // 详情标题
    const [listDatas, setlistDatas] = useState<any>();  // 详情标题
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    // userInfo.tenantInfos = [...[{tenantCode:'jsytck',tenantName:'js'},{tenantCode:'haytck',tenantName:'ha'}]]
    const [uploadFileList, setUploadFileList] = useState<any[]>([]); // 上传文件数据
    const [uploadedFiles, setUploadedFiles] = useState<FileInfo[]>([]); // 已上传文件数据
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [pentMuce, setpentMuce] = useState([]);  // 父级菜单
    const lastCallTimeRef = useRef(0);
    const throttleTimerRef = useRef<any>();

    const [footerBox, setfooterBox] = useState(false);  // 如果有值代表是审核过来
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
        setloadings(false)
        setDrawerOpen(false);
        setfooterBox(false)
        setlistDatas({})
        setpentMuce([])
        setFormData({
            menuUrl: '',
            relationId: '',
            projectName: '',
            parentId: ''
        })
        setIsCreateMenu('1'); // 重置是否生成菜单为默认值
    };
    // 处理取消按钮点击
    const handleCancelClick = () => {
        handleClose(footerBox);
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

    // 下载已上传的文件
    const downloadUploadedFile = (fileInfo: FileInfo) => {
        try {
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

    const [loadings, setloadings] = useState(false);
    const [formData, setFormData] = useState({
        menuUrl: '',
        relationId: '',
        projectName: '',
        parentId: ''
    });
    const [isCreateMenu, setIsCreateMenu] = useState('1'); // 是否生成菜单：0否1是，默认为是
    // 租户表格查询
    const handleTenantSearch = () => {
        const params = {
            tenantCode: listDatas?.serviceTypeId,
            start: 0,
            limit: 10
        };
        request
            .post('/appTenant/queryAppTenantList', { params })
            .then((res) => {
                let NewArr = res?.beans?.map((item: any, index: number) => ({
                    value: item.tenantCode,
                    label: '应用集成平台-' + formData.projectName,
                    tenantUrl: item.tenantUrl
                }));
                setpentMuce(NewArr)
                //http://ngap-gen.cs.cmos/ngap/page/index.html?relationId=当前app中的relationId
                form.setFieldValue('parentMenu', NewArr[0]?.label)
                form.setFieldValue('menuUrl', 'http://' + (NewArr[0]?.tenantUrl || '') + '/ngap/page/index.html?relationId=' + listDatas.relationId);
                listDatas.relationId && queryMenuListFun(listDatas.relationId)
            })
            .catch((err) => {
            });
    };
    useEffect(() => {
        if (formData.projectName) {
            handleTenantSearch()
        }
    }, [formData.projectName]);
    const [threeCategories, setthreeCategories] = useState<any[]>([]); // 三级
    const [twoCategories, settwoCategories] = useState<any[]>([{}]); // 二级
    const [twoCategoriesChild, settwoCategoriesChild] = useState<any[]>([]); // 二级
    const queryNumsFun = () => {
        try {
            request
                .post('/csf/call/queryDataCategoryInfo', {
                    params: {

                    },
                })
                .then((res) => {
                    const NewArr = res?.bean?.twoCategories?.map((item: any, index: number) => ({
                        value: item.categoryCode,
                        label: item.categoryName,
                    }));
                    settwoCategories(NewArr)
                    const NewArrb = res?.bean?.threeCategories?.map((item: any, index: number) => ({
                        value: item.categoryCode,
                        label: item.categoryName,
                        twoValue: item.twoCategoryCode,
                    }));
                    settwoCategoriesChild(NewArrb)
                })
                .catch((err) => { });
        } catch (error) {
            message.error('查询失败');
        } finally {
        }
    };
    const query4a = (indes: number, vals: string) => {
        try {
            request
                .post('/csf/call/query4AInfoByUserCode', {
                    params: {
                        userCode: vals
                    },
                })
                .then((res) => {
                    if (indes == 1) {
                        form.setFieldValue('busResDepart', res?.beans[0]?.orgName);
                        form.setFieldValue('busRes4aPhone', res?.beans[0]?.mobilePhone);
                        form.setFieldValue('busRes4aName', res?.beans[0]?.userName);
                    } else {
                        form.setFieldValue('techResDepart', res?.beans[0]?.orgName);
                        form.setFieldValue('techRes4aPhone', res?.beans[0]?.mobilePhone);
                        form.setFieldValue('techRes4aName', res?.beans[0]?.userName);
                    }
                })
                .catch((err) => { });
        } catch (error) {
            message.error('查询失败');
        } finally {
        }
    };
    useImperativeHandle(ref, () => ({
        open: (data: any) => {
            data.projectId && queryNumsFun()
            setDrawerOpen(true);
            setDrawerTitle('上架申请-' + data.appName);
            //queryListTypeFun('2603171831410100039');
            data.projectId && queryListTypeFun(data.projectId);
            setlistDatas(data);
            if (data.markType) {
                setfooterBox(true);
            }
            // 初始化表单字段，包括是否生成菜单
            const isCreateMenu = data.showArea === '2' ? '0' : (data.isCreateMenu && data.isCreateMenu != '2') ? data.isCreateMenu : '1';// 默认为"是"
            form.setFieldsValue({
                isCreateMenu: isCreateMenu
            });
            setIsCreateMenu(isCreateMenu);
        },
    }));
    // 任务列表查询
    const queryListTypeFun = (value: string) => {
        try {
            request
                .post('/appProject/queryAppProjectList', {
                    params: {
                        projectId: value
                    },
                })
                .then((res) => {
                    setFormData((prev) => ({
                        ...prev,
                        projectName: res?.beans[0]?.projectName,
                        parentId: res?.beans[0]?.menuId
                    }))
                })
                .catch((err) => { });
        } catch (error) {
        } finally {
        }
    };
    const updataReData = (rracs: any) => {
        const newData = { ...rracs };
        if (newData.dataActivity) {
            newData.dataActivity = newData.dataActivity.split(',');
        }
        if (newData.networkType) {
            newData.networkType = newData.networkType.split(',');
        }
        {
            Object.keys(newData).map((key: string) => (
                form.setFieldValue(key, newData[key])
            ))
        }
    }
    // 菜单查询查询
    const queryMenuListFun = (value: string) => {
        try {
            request
                .post('/appReview/queryAppReviewMenuList', {
                    params: {
                        relationId: value
                    },
                })
                .then((res) => {
                    if(res?.beans?.length !== 0){
                    updataReData(res?.beans[0])
                        //menuId
                        if(res?.beans[0]?.menuId){
                        setfooterBox(true);
                        }
                    }
                })
                .catch((err) => { });
        } catch (error) {
        } finally {
        }
    };
    const [form] = Form.useForm();
    // 最终提交
    const handleSubmit = () => {
        // 根据是否生成菜单的选择，进行不同的校验
        if (isCreateMenu === '0') {
            // 不生成菜单，只校验上架申请信息相关的字段
            form.validateFields(['applyReason', 'applyFiles']).then((value: any) => {
                if(uploadedFiles.length === 0){
                    message.warning('请上传附件');
                    return;
                }
                processSubmit(value);
            }).catch(err => setloadings(false));
        } else {
            // 生成菜单，校验所有字段
            form.validateFields().then((value: any) => {
                if(uploadedFiles.length === 0){
                    message.warning('请上传附件');
                    return;
                }
                processSubmit(value);
            }).catch(err => setloadings(false));
        }
    };

    // 处理提交逻辑的通用函数
    const processSubmit = (value: any) => {
            setloadings(true);
            value.dataActivity = value.dataActivity?.join(',');
            value.networkType = value.networkType;
            value.reviewState = "upSub";
            value.applyFiles = uploadedFiles;
            value.opeStaffId = userInfo.staffId;  // 操作人工号
            value.opeStaffNm = userInfo.staffName;  // 操作人名称
            value.divideProv = listDatas?.provId;
            
            // 根据是否生成菜单的选择，决定是否提交菜单相关信息
            if (isCreateMenu === '0') {
                // 不生成菜单，清除菜单相关字段的校验和必填要求
                delete value.menuName;
                delete value.openModule;
                delete value.viewId;
                delete value.networkType;
                delete value.funcSort;
                delete value.appLevel;
                delete value.showMain;
                delete value.menuUrl;
                delete value.menuDescription;
                delete value.busRes4a;
                delete value.busRes4aPhone;
                delete value.busRes4aName;
                delete value.busResDepart;
                delete value.techRes4a;
                delete value.techRes4aPhone;
                delete value.techRes4aName;
                delete value.techResDepart;
                delete value.pageType;
                delete value.useObject;
                delete value.demandList;
                delete value.operationList;
                delete value.dataActivity;
                delete value.twoCategoryCode;
                delete value.twoCategoryNm;
                delete value.threeCategoryCode;
                delete value.threeCategoryNm;
                delete value.frontendSecret;
                delete value.backendSecret;
                delete value.isSecret;
                delete value.secretName;
                delete value.secretSource;
            }

            const params = {
                staffId: userInfo.staffId,
                appStatus: listDatas?.appStatus,
                id: listDatas?.id || '',
                relationId: listDatas?.relationId || '',
                pubSubInfo: value,
                isCreateMenu: isCreateMenu,
                ...(listDatas?.showArea === '2' ? {showArea: listDatas?.showArea} : {})
            }
            // 调用上架架申请接口
            return request.post('/app/saveAppInfo', { params }).then((res) => {
                if (res && res.returnCode === '0') {
                    message.success('上架申请提交成功');
                    handleClose(true); // 提交成功后跳过删除 OSS 文件
                    // 调用父组件传递的刷新函数
                    onrefFun();
                } else {
                    setloadings(false)
                    message.error(res.returnMsg || '上架申请提交失败');
                }
            }).catch((err) => {
                setloadings(false)
                message.error('上架申请提交失败');
            });
    };
    // 点击图标打开查询弹窗
    const handleQuerybusRes4a = () => {
        const busRes4aVl = form.getFieldValue('busRes4a')
        if (!busRes4aVl) {
            message.warning('请先输入信息')
            return;
        }
        query4a(1, busRes4aVl);

    };
    // 点击图标打开查询弹窗
    const handleQuerytechRes4a = () => {
        const techRes4aVl = form.getFieldValue('techRes4a')
        if (!techRes4aVl) {
            message.warning('请先输入信息')
            return;
        }
        query4a(2, techRes4aVl);
    };
    return (
        <Drawer
            width="80%"
            title={drawerTitle}
            open={drawerOpen}
            onClose={() => {
                handleCancelClick();
            }}
            loading={loadings}
            keyboard={false}
            maskClosable={false}
            rootClassName="custom-drawer-root"
            getContainer={false}
            destroyOnClose
            footer={<div style={{ display: 'flex', justifyContent: 'left', gap: 12 }}>
                {listDatas?.markType?!footerBox:true && (<span><Button type="primary" onClick={handleSubmit}>提交</Button>
                    <Button onClick={() => {
                        handleCancelClick();
                    }} >取消</Button></span>)}
            </div>}
            style={{
                height: 'calc(100vh - 100px)',
                overflow: 'auto'

            }}
        >
            <div className='upchecktys'>
                {/* 页面上方的"是否生成菜单"必填项 */}
                {listDatas?.showArea !== '2' && (<div className='menuFormContainer'>
                    <Form
                        form={form}
                        layout="horizontal"
                        labelAlign="right"
                        labelCol={{ span: 2.8 }}
                        wrapperCol={{ span: 20 }}
                    >
                        <Form.Item
                            label={<Space>是否生成菜单<Tooltip title='控制是否在用户中心自动生成对应菜单；选择"是"则在用户中心生成菜单，选择"否"则不生成。'><QuestionCircleOutlined style={{ color: '#999', marginLeft: 4 }} /></Tooltip></Space>}
                            name="isCreateMenu"
                            rules={[{ required: true, message: '请选择是否生成菜单' }]}
                            initialValue="1"
                        >
                            <Radio.Group
                                onChange={(e) => setIsCreateMenu(e.target.value)}
                                disabled={listDatas?.isCreateMenu !== '2'}
                            >
                                <Radio value="1">是</Radio>
                                <Radio value="0">否</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </Form>
                </div>)}
                
                <Steps direction="vertical" current={4} style={{ width: '100%', display: 'inline-block' }} /* 假设当前在最后一步，也可以设置为0,1,2 */>
                    {/* 根据是否生成菜单的选择来决定是否显示这些步骤 */}
                    {isCreateMenu === '1' && (
                        <>
                            <Step
                                title="创建菜单信息配置"
                                description={
                            <Form
                                form={form}
                                layout="horizontal"
                                labelAlign="right"
                                disabled={footerBox}
                                labelCol={{ span: 6 }}
                                wrapperCol={{ span: 18 }}
                                style={{ marginTop: 10, width: '800' }}
                            >
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <Form.Item label="父级菜单" name="parentMenu" rules={[{ required: true }]}>
                                            <Input disabled={true} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item label="父节点编号" name="parentId" >
                                            <Input disabled={true} value={formData?.parentId} placeholder="自动获取" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item rules={[{ required: true }]} label="菜单名称" name="menuName" >
                                            <Input placeholder="请输入" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item rules={[{ required: true }]} initialValue="N" label="打开方式" name="openModule" >
                                            <Select placeholder="请选择" >
                                                <Select.Option value="N">主页面</Select.Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item rules={[{ required: true }]} initialValue={listDatas?.appCategory == '1' ? '0' : '1'} label="菜单视图" name="viewId" >
                                            <Select placeholder="请选择" disabled>
                                                <Select.Option value="0">生产视图</Select.Option>
                                                <Select.Option value="1">运营视图</Select.Option>
                                                <Select.Option value="2">班组视图</Select.Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item rules={[{ required: true }]} initialValue="0" label="菜单使用范围" name="networkType" >
                                            <Select mode="multiple" placeholder="请选择" >
                                                <Select.Option value="0">内网</Select.Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item rules={[{ required: true }]} label="功能分类" name="funcSort" >
                                            <Select placeholder="请选择" >
                                                <Select.Option value="01">办理</Select.Option>
                                                <Select.Option value="02">查询</Select.Option>
                                                <Select.Option value="03">工具</Select.Option>
                                                <Select.Option value="04">管理</Select.Option>
                                                <Select.Option value="05">配置</Select.Option>
                                                <Select.Option value="06">受理</Select.Option>
                                                <Select.Option value="07">统计</Select.Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item rules={[{ required: true }]} initialValue={listDatas?.appLevel == '1' ? '01' : '02'} label="一二级应用" name="appLevel" >
                                            <Select placeholder="请选择" disabled>
                                                <Select.Option value="01">一级</Select.Option>
                                                <Select.Option value="02">二级</Select.Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item rules={[{ required: true }]} label="是否在主菜单显示" name="showMain" >
                                            <Select placeholder="请选择" >
                                                <Select.Option value="1">是</Select.Option>
                                                <Select.Option value="0">否</Select.Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                        <Form.Item rules={[{ required: true }]}
                                            label="菜单地址"
                                            name="menuUrl"
                                            labelCol={{ span: 2 }}
                                            wrapperCol={{ span: 22 }}
                                        >
                                            <Input disabled={true} value={formData?.menuUrl} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                        <Form.Item rules={[{ required: true }]}
                                            label="菜单功能说明"
                                            name="menuDescription"

                                            labelCol={{ span: 2 }}
                                            wrapperCol={{ span: 22 }}
                                        >
                                            <Input placeholder="请输入" />
                                        </Form.Item>
                                    </Col>
                                </Row>

                            </Form>
                                }
                            />
                            <Step
                                title="菜单责任与关联信息配置"
                                description={
                            <Form
                                form={form}
                                layout="horizontal"
                                labelAlign="right"
                                disabled={footerBox}
                                labelCol={{ span: 6 }}
                                wrapperCol={{ span: 18 }}
                                style={{ marginTop: 10, width: '800' }}
                            >
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <Form.Item rules={[{ required: true }]} label="业务侧负责人" name="busRes4a" required={true}>
                                            <Input placeholder="请输入4A账号并检索部门信息"
                                                addonAfter={
                                                    <Button
                                                        type="text"
                                                        icon={<SearchOutlined />}  // 搜索图标
                                                        onClick={handleQuerybusRes4a}
                                                        style={{ padding: 0, border: 'none', height: ' 25px' }}
                                                    />
                                                }
                                            />
                                        </Form.Item>
                                        <Form.Item style={{ display: 'none' }} label="4A手机号" name="busRes4aPhone" >
                                            <Input />
                                        </Form.Item>
                                        <Form.Item style={{ display: 'none' }} label="4A账号姓名" name="busRes4aName" >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item rules={[{ required: true }]} label="业务侧责任部门" name="busResDepart" >
                                            <Input placeholder="请在业务侧负责人输入4A账号查询部门信息" disabled={true} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item rules={[{ required: true }]} label="技术侧责任人" name="techRes4a" >
                                            <Input placeholder="请输入4A账号并检索部门信息"
                                                addonAfter={
                                                    <Button
                                                        type="text"
                                                        icon={<SearchOutlined />}  // 搜索图标
                                                        onClick={handleQuerytechRes4a}
                                                        style={{ padding: 0, border: 'none', height: ' 25px' }}
                                                    />
                                                }
                                            />
                                        </Form.Item>
                                        <Form.Item style={{ display: 'none' }} label="4A手机号" name="techRes4aPhone" >
                                            <Input />
                                        </Form.Item>
                                        <Form.Item style={{ display: 'none' }} label="4A账号姓名" name="techRes4aName" >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item rules={[{ required: true }]} label="技术侧责任部门" name="techResDepart" >
                                            <Input placeholder="请在技术侧负责人输入4A账号查询部门信息" disabled={true} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item rules={[{ required: true }]} label="页面类型" name="pageType" >
                                            <Select placeholder="请选择" >
                                                <Select.Option value="1">生产页面</Select.Option>
                                                <Select.Option value="2">运营管理页面</Select.Option>
                                                <Select.Option value="3">系统配置页面</Select.Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item rules={[{ required: true }]} label="适用对象" name="useObject" >
                                            <Select placeholder="请选择" >
                                                <Select.Option value="1">一线座席</Select.Option>
                                                <Select.Option value="2">运营管理人员</Select.Option>
                                                <Select.Option value="3">系统配置人员</Select.Option>
                                                <Select.Option value="4">其他</Select.Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item rules={[{ required: true }]} label="关联需求单" name="demandList" >
                                            <Input placeholder="请填写页面关联的需求编号及名称" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item rules={[{ required: true }]} label="关联运维单" name="operationList" >
                                            <Input placeholder="请填写页面关联的运维单编号及名称" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Form>
                                }
                            />
                            <Step
                                title="菜单功能权限信息配置"
                                description={
                            <Form
                                form={form}
                                disabled={footerBox}
                                layout="horizontal"
                                labelAlign="right"
                                labelCol={{ span: 6 }}
                                wrapperCol={{ span: 18 }}
                                style={{ marginTop: 10, width: '800' }}
                            >
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <Form.Item rules={[{ required: true }]} label="数据处理活动" name="dataActivity" >
                                            <Select mode="multiple" placeholder="请选择" >
                                                <Select.Option value="1">增加</Select.Option>
                                                <Select.Option value="2">查询</Select.Option>
                                                <Select.Option value="3">修改</Select.Option>
                                                <Select.Option value="4">删除</Select.Option>
                                                <Select.Option value="5">复制</Select.Option>
                                                <Select.Option value="6">导出</Select.Option>
                                                <Select.Option value="7">共享</Select.Option>
                                                <Select.Option value="8">分析</Select.Option>
                                                <Select.Option value="9">其他</Select.Option>
                                                <Select.Option value="10">办理</Select.Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item rules={[{ required: true }]} label="数据二级分类" name="twoCategoryCode" >
                                            <Select
                                                placeholder="请选择"
                                                onChange={(value, option: any) => {
                                                    form.setFieldValue('threeCategoryCode', '');
                                                    form.setFieldValue('twoCategoryNm', option?.children);
                                                    const NewArrc = twoCategoriesChild.filter(item => item.twoValue === value).map(item => ({
                                                        value: item.value,
                                                        label: item.label,
                                                    }))
                                                    setthreeCategories(NewArrc);
                                                }}
                                            >
                                                {twoCategories.map(item => (
                                                    <Select.Option key={item.value} value={item.value}>
                                                        {item.label}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                        <Form.Item style={{ display: 'none' }} label="二级分类名称" name="twoCategoryNm" >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item rules={[{ required: true }]} label="数据三级分类" name="threeCategoryCode" >
                                            <Select
                                                placeholder="请选择"
                                                onChange={(value, option: any) => {
                                                    const threeName = option?.target?.name || option?.label;
                                                    form.setFieldValue('threeCategoryNm', option?.children);
                                                }}
                                            >

                                                {threeCategories.map(item => (
                                                    <Select.Option key={item.value} value={item.value}>
                                                        {item.label}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                        <Form.Item style={{ display: 'none' }} label="三级分类名称" name="threeCategoryNm" >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item rules={[{ required: true }]} label="敏感数据前端是否脱敏" initialValue="0" name="frontendSecret" >
                                            <Select>
                                                <Select.Option value="0">是</Select.Option>
                                                <Select.Option value="1">否</Select.Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item rules={[{ required: true }]} label="敏感数据后端是否加密" initialValue="0" name="backendSecret" >
                                            <Select >
                                                <Select.Option value="0">是</Select.Option>
                                                <Select.Option value="1">否</Select.Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item rules={[{ required: true }]} label="是否敏感权限" initialValue="0" name="isSecret" >
                                            <Select>
                                                <Select.Option value="0">是</Select.Option>
                                                <Select.Option value="1">否</Select.Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item rules={[{ required: true }]} label="涉密数据名称" name="secretName" >
                                            <Input placeholder="请输入" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item rules={[{ required: true }]} label="数据处理事由" name="secretSource" >
                                            <Input placeholder="请输入" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Form>
                                }
                            />
                        </>
                    )}
                    {/* 上架申请信息始终显示 */}
                    <Step
                        title="上架申请信息"
                        description={
                            <Form form={form}
                                layout="horizontal"
                                labelAlign="right"
                                disabled={listDatas?.markType? footerBox:false}
                                labelCol={{ span: 6 }}
                                wrapperCol={{ span: 18 }}
                                style={{ marginTop: 10, width: '800' }}
                            >
                                <Row gutter={24}>
                                    <Col span={24}>
                                        <Form.Item rules={[{ required: true }]}
                                            label={<Space><span>附件</span></Space>}
                                            required
                                            labelCol={{ span: 2 }}
                                            wrapperCol={{ span: 22 }}
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
                                                    传相关附件(如需求文档、截图、证明文件),有助于审批人快速理解,提高通过率。上传格式包含:.txt|.doc|.docx|.xls|.xlsx|.ppt|.pptx|.pdf|.jpg|.png|.bmp|.gif|.rar|.zip,文件不能超过4M,文件数量不能超过1个。
                                                </div>
                                            </div>
                                        </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                        <Form.Item
                                            label="申请原因："
                                            name="applyReason"
                                            labelCol={{ span: 2 }}
                                            wrapperCol={{ span: 21 }}
                                            rules={[{ required: true, message: '请输入申请原因' }]}
                                        >
                                            <Input.TextArea rows={3} placeholder="请输入" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Form>
                        }
                    />
                </Steps>
            </div>

        </Drawer>
    );
};

export default forwardRef(UpdeRef);
