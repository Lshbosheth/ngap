import React, { useState, useEffect } from 'react';
import { Table, Button, Descriptions, Typography, Modal, Form, Input } from 'antd';
import { message } from '@/utils/AntdGlobal';
import AddElementModal from './AddElementModal';
import styles from './index.module.less';
import OnlineEditing from './onlineEditing';
import request from '@/utils/request';
import { crossApiUserInfo } from '@/stores/crossapiStore';
import { publictData } from '@/utils/appMenuData';
import { objectToFormData } from '@/utils/objectToFormData'; // 对象转 FormData 工具函数
import { updateCustomElementMenu } from '../../config/components';
import recodeLog from '../../utils/operLog';

const { Text } = Typography;

interface VersionRecord {
    elementId: string; // 元素ID
    elementVersion: string; // 元素版本
    elementStatus: string; // 元素状态
    elementDesc: string; // 元素说明
    operator: string;
    operateTime: string;
}

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
    elementIcon: any; // 元素图标
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

interface EditorFile {
    id: string;
    name: string;
    content: string;
    language: string;
}

const layoutTypeOptions = [
    { value: 'all', label: '全部页面布局' },
    { value: '1', label: '标准页面元素' },
    { value: '2', label: '大屏页面元素' },
];

// 定义组件props接口
interface DetailProps {
    elementInfos?: BlockElement;
    appElementType?: AppElementType[];
    onBack?: () => void;
}

/****************** 样式常量 ******************/
const statusStyles = {
    statusBadge: (status: any) => ({
        padding: '4px 7px',
        borderRadius: '2px',
        fontSize: '11px',
        backgroundColor:
            status === '2' ? '#f6ffed' : status === '1' ? '#ECF6FF' : status === '3' ? '#FFF7EC' : status === '4' ? '#FFF0ED' : '#F2F2F2',
        color: status === '2' ? '#52c41a' : status === '1' ? '#36A8FF' : status === '3' ? '#FFB138' : status === '4' ? '#F65A56' : '#999999',
    }),
};

const ElementDetailPage: React.FC<DetailProps> = ({ elementInfos, appElementType, onBack }) => {
    const userInfo: any = crossApiUserInfo((state: any) => state.userInfo);
    const [offLineForm] = Form.useForm();
    const [elementInfo, setElementInfo] = useState<BlockElement>(); // 元素信息
    // 历史版本数据
    const [versions] = useState<VersionRecord[]>([
       
    ]);
    // const [versions] = useState<VersionRecord[]>([
    //     {
    //         elementId: '1001',
    //         elementVersion: 'v1.0.1',
    //         elementStatus: '3',
    //         elementDesc: '优化版本发布',
    //         operator: 'admin002',
    //         operateTime: '2026-02-04 14:30:22',
    //     },
    //     {
    //         elementId: '1001',
    //         elementVersion: 'v1.0.0',
    //         elementStatus: '5',
    //         elementDesc: '基础版本发布',
    //         operator: 'tester005',
    //         operateTime: '2026-02-03 16:45:12',
    //     },
    // ]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false); // 弹窗显隐
    const [isClassify, setIsClassify] = useState(false); // 是否点击元素分类
    const [isEdit, setIsEdit] = useState(true); // 是否点击编辑
    const [showOnline, setShowOnline] = useState(false); // 在线编辑页面显隐
    const [logOffVisible, setLogOffVisible] = useState(false); // 下线弹窗显隐
    const [logOffElement, setLogOffElement] = useState<BlockElement>(); // 下线的元素
    const [sourceFiles, setSourceFiles] = useState<File[]>([]); // 在线编辑的源文件
    const [detailFiles, setDetailFiles] = useState<EditorFile[]>([]); // 回显的源文件content
    const [provIdNmame, setProvIdNmame] = useState<string | undefined>(''); // 归属范围 当前租户名称

    // 元素信息回显
    useEffect(() => {
        setElementInfo(elementInfos);
    }, [elementInfos]);

    // 通过路径获取文件内容
    useEffect(() => {
        setDetailFiles([]);
        fetchFileStream(elementInfo?.elementJsDemo);
        fetchFileStream(elementInfo?.elementCssDemo);
        fetchFileStream(elementInfo?.elementConfigDemo);
    }, [elementInfo?.elementJsDemo, elementInfo?.elementCssDemo, elementInfo?.elementConfigDemo]);

    // 获取当前租户名称
    useEffect(() => {
        const targetItem = publictData.provinceSelectValue.find((item) => item.value === elementInfos?.provId);
        targetItem && setProvIdNmame(targetItem.label);
    }, [elementInfo?.provId]);

    useEffect(() => {
        // 把content转化为File类型
        if (detailFiles.length === 3) {
            detailFiles.forEach((item) => {
                const file = downloadFile(item);
                // 保持不可变更新
                setSourceFiles((prev: any) => [...prev, file]);
            });
        }
    }, [detailFiles]);

    // 源文件路径获取文件流
    const fetchFileStream = (url: string | undefined) => {
        if (!url) {
            return;
        }
        try {
            const params = {
                url: url,
            };
            request
                .post('/csf/call/getFileFromOss', objectToFormData(params))
                .then((res) => {
                    const language = url.split('.').pop() || 'text';
                    const name = url.split('/').pop() || '';
                    const isDuplicate = detailFiles.some((item) => item.name === name);
                    if (isDuplicate) {
                        return; // 不进行添加
                    }
                    // 添加到文档列表
                    setDetailFiles((prev) => [
                        ...prev,
                        {
                            id: (Date.now() + Math.random()).toString(),
                            name: name,
                            content: res.bean.demo,
                            language: getLanguageByExtension(language),
                        },
                    ]);
                })
                .catch((err) => {});
        } catch (error) {
            return null;
        }
    };

    // 文件类型映射
    const getLanguageByExtension = (ext: string) => {
        switch (ext) {
            case 'tsx':
                return 'typescript';
            case 'ts':
                return 'typescript';
            case 'js':
                return 'javascript';
            case 'less':
                return 'less';
            default:
                return 'text';
        }
    };

    // 处理表单提交提交审核
    const handleCreate = (values: BlockElement) => {
        elementPreservation(values, '3');
    };

    // 处理表单提交保存草稿
    const handleSaveDraft = (values: BlockElement) => {
        elementPreservation(values, '1');
    };

    // 元素保存：提交审核、保存草稿
    const elementPreservation = (values: BlockElement, elementStatus: string) => {
        try {
            request
                .post('/element/saveElementInfo', {
                    params: {
                        elementId: isEdit ? values.elementId : '',
                        elementName: values.elementName,
                        elementStatus: elementStatus,
                        elementIcon: values.elementIcon,
                        elementJsDemo: values.elementJsDemo,
                        elementCssDemo: values.elementCssDemo,
                        elementConfigDemo: values.elementConfigDemo,
                        elementTypeId: values.elementTypeId,
                        provId: values.provId,
                        elementPageType: values.elementPageType,
                        elementDesc: values.elementDesc,
                        staffId: userInfo.staffId,
                    },
                })
                .then((res) => {
                    setModalVisible(false);
                    setSourceFiles([]); // 清空编辑保存的源文件
                    queryElementFun(values.elementId);
                    if (elementStatus == '3') {
                        updateCustomElementMenu(values.elementId); // 更新画布中全局自定义元素菜单
                        elementReview(values, values.elementId); // 同步数据到审核管理
                    }
                    message.success(`${elementStatus === '1' ? '保存草稿' : '提交审核'}成功`);
                    const logParams = {
                        provCode: userInfo.provinceId, // 8位省份编码
                        modelName: '', // 所属模块  暂时为空
                        pageName: '', // 所属菜单   暂时为空
                        dataType: '元素', // 数据类型（应用、元素、组件、接口）
                        operType: isEdit ? '编辑' : '新增', // 操作类型（新增/编辑/删除/导入）
                        dataId: isEdit ? values.elementId : '', // 操作数据ID
                        dataName: values.elementName, // 操作数据名称
                        editContent: `${(isEdit ? '编辑' : '新增') + values.elementName}元素`, // 操作内容简述
                        staffId: userInfo.staffId, // 操作人工号
                    };
                    recodeLog(logParams);
                })
                .catch((err) => {});
        } catch (error) {
            message.success(`${elementStatus === '1' ? '保存草稿' : '提交审核'}失败`);
        } finally {
        }
    };

    // 同步审核管理
    const elementReview = (values: BlockElement, newElementId: string) => {
        try {
            const provName = publictData.provinceSelectValue.find((item) => item.value === values.provId)?.label; // 归属省份
            const elementTypeName = appElementType?.find((item) => item.elementTypeId === values.elementTypeId)?.elementTypeName; // 分类名称
            const elementPageName = layoutTypeOptions.find((item) => item.value === values.elementPageType)?.label; // 布局类型
            const dataDesc =( values.provId === '0000' ? '全网' : provName) + ',' + elementTypeName + ',' + elementPageName;
            request
                .post('/solutionAudit/insertSolutionAudit', {
                    params: {
                        provId: values.provId,
                        serviceTypeId: values.provId,
                        createStaffId: userInfo.staffId,
                        dataSource: '3',
                        relationId: isEdit ? values.elementId : newElementId,
                        dataName: values.elementName,
                        dataType: '1', // 1 发布，2 下线，3 回滚版本
                        dataDesc: dataDesc,
                    },
                })
                .then((res) => {})
                .catch((err) => {});
        } catch (error) {
        } finally {
        }
    };

    // 元素查询
    const queryElementFun = (elementId: string) => {
        try {
            request
                .post('/element/queryElementList', {
                    params: {
                        elementId: elementId,
                        provId: userInfo.provinceId,
                    },
                })
                .then((res) => {
                    setElementInfo(res.beans.find((item: any) => item.elementId === elementId));
                })
                .catch((err) => {});
        } catch (error) {
            message.error('元素查询失败');
        } finally {
        }
    };

    // 表格列定义
    const columns = [
        {
            title: '操作',
            key: 'actionButtons',
            width: 158,
            render: () => (
                <span>
                    <a>编辑</a>
                    <a>下载</a>
                </span>
            ),
        },
        { title: '元素版本', dataIndex: 'elementVersion', key: 'elementVersion' },
        {
            title: '版本状态',
            dataIndex: 'elementStatus',
            key: 'elementStatus',
            render: (elementStatus: string) => {
                return (
                    <div>
                        {elementStatus === '2'
                            ? '已发布'
                            : elementStatus === '1'
                            ? '草稿'
                            : elementStatus === '3'
                            ? '待审核'
                            : elementStatus === '4'
                            ? '审核驳回'
                            : '已下线'}
                    </div>
                );
            },
        },
        { title: '元素说明', dataIndex: 'elementDesc', key: 'elementDesc' },
        { title: '操作人工号', dataIndex: 'operator', key: 'operator' },
        { title: '操作时间', dataIndex: 'operateTime', key: 'operateTime' },
    ];

    // 处理表格分页变化
    const handleAppTableChange = (page: number, pageSize: number) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    // 下载源文件
    const handleDownload = () => {
        // 创建隐藏的a标签并触发点击
        // if (elementInfo?.elementJsDemo) {
        //     const link = document.createElement('a');
        //     link.href = elementInfo.elementJsDemo;
        //     link.download = elementInfo.elementJsDemo.split('/').pop() || '';
        //     // link.download = elementInfo.elementId + '-' + new Date() + '.zip'; // 设置下载的文件名
        //     link.style.display = 'none'; // 隐藏元素
        //     document.body.appendChild(link);
        //     link.click();
        //     document.body.removeChild(link); // 下载完成后移除
        // }
    };

    // 下线元素弹窗
    const logOffModal = (elementInfo: BlockElement) => {
        offLineForm.resetFields();
        setLogOffElement(elementInfo);
        setLogOffVisible(true);
    };

    // 下线接口
    const logOffFun = () => {
        // 接口 logOffElementId
        offLineForm
            .validateFields()
            .then((values) => {
                console.log(values.offLineReason);
                setLogOffVisible(false);
                message.success('元素下线成功');
                const logParams = {
                    provCode: userInfo.provinceId, // 8位省份编码
                    modelName: '', // 所属模块  暂时为空
                    pageName: '', // 所属菜单   暂时为空
                    dataType: '元素', // 数据类型（应用、元素、组件、接口）
                    operType: '下线', // 操作类型（新增/编辑/删除/导入）
                    dataId: logOffElement?.elementId, // 操作数据ID
                    dataName: logOffElement?.elementName, // 操作数据名称
                    editContent: `下线${logOffElement?.elementName}元素`, // 操作内容简述
                    staffId: userInfo.staffId, // 操作人工号
                };
                recodeLog(logParams);
            })
            .catch((info) => {
                console.log('表单验证失败:', info);
            });
    };

    // 取消按钮点击事件
    const cancelHandleBack = () => {
        setShowOnline(false);
    };

    // 保存按钮点击事件
    const saveCodeHandleBack = (values: EditorFile[]) => {
        setSourceFiles([]);
        // 把content转化为File类型
        values.forEach((item) => {
            const file = downloadFile(item);
            // 保持不可变更新
            setSourceFiles((prev: any) => [...prev, file]);
        });
        setShowOnline(false);
        setModalVisible(true);
    };

    // 把content转化为File类型
    const downloadFile = (item: any) => {
        try {
            const extension = item.name?.split('.').pop()?.toLowerCase();
            const fileType = extensionToMimeType(extension);

            // 创建Blob对象
            const blob = new Blob([item.content], { type: fileType || 'text/plain' });
            return new File([blob], item.name, {
                type: fileType,
                lastModified: Date.now(),
            });
            // // 创建临时URL
            // const blobUrl = URL.createObjectURL(blob);

            // // 创建下载链接
            // const link = document.createElement('a');
            // link.href = blobUrl;
            // link.download = fileName;
            // link.style.display = 'none';

            // // 添加到DOM并触发下载
            // document.body.appendChild(link);
            // link.click();

            // // 清理资源
            // setTimeout(() => {
            //     URL.revokeObjectURL(blobUrl);
            //     link.remove();
            // }, 100);
        } catch (error) {}
    };

    // 映射文件的MIME类型
    const extensionToMimeType = (extension: string | undefined) => {
        switch (extension) {
            case 'js':
                return 'application/javascript';
            case 'tsx':
                return 'text/javascript';
            case 'ts':
                return 'application/typescript';
            case 'json':
                return 'application/json';
            case 'less':
                return 'text/less';
            case 'zip':
                return 'application/zip';
            default:
                return 'text/plain';
        }
    };

    return (
        <div style={{ height: '100%' }}>
            {!showOnline ? (
                <div className={styles.detailBox}>
                    <div
                        className={styles.backBox}
                        onClick={() => {
                            onBack && onBack();
                            setDetailFiles([]);
                            setSourceFiles([]);
                        }}
                    >
                        <img src={new URL(`./imgs/left_arrow.png`, import.meta.url).href} alt="" />
                        <span>元素</span>
                    </div>
                    <div className={styles.iconBox}>
                        <img src={new URL(elementInfo?.elementIcon, import.meta.url).href} alt="" />
                    </div>
                    <div className={styles.infoBox}>
                        <div className={`${styles.nameBox} ${styles.infoItem}`}>
                            <Text className={styles.name} title={elementInfo?.elementName}>{elementInfo?.elementName}</Text>
                            <span className={styles.version}>{elementInfo?.elementVersion}</span>
                            <span style={statusStyles.statusBadge(elementInfo?.elementStatus)}>
                                {elementInfo?.elementStatus === '2'
                                    ? '已发布'
                                    : elementInfo?.elementStatus === '1'
                                    ? '草稿'
                                    : elementInfo?.elementStatus === '3'
                                    ? '待审核'
                                    : elementInfo?.elementStatus === '4'
                                    ? '审核驳回'
                                    : '已下线'}
                            </span>
                        </div>
                        <div className={styles.infoItem}>
                            <Descriptions size="small" column={3}>
                                <Descriptions.Item label="分类">
                                    {elementInfo?.elementTypeId === '001'
                                        ? '布局'
                                        : elementInfo?.elementTypeId === '002'
                                        ? '基础'
                                        : elementInfo?.elementTypeId === '003'
                                        ? '表单'
                                        : elementInfo?.elementTypeId === '004'
                                        ? '高级'
                                        : '图标'}
                                </Descriptions.Item>
                                <Descriptions.Item label="页面布局">
                                    {elementInfo?.elementPageType === '1' ? '标准页面' : '大屏页面'}
                                </Descriptions.Item>
                                <Descriptions.Item label="归属范围">{elementInfo?.provId === '0000' ? '全网' : provIdNmame}</Descriptions.Item>
                            </Descriptions>
                        </div>
                        <div className={styles.infoItem}>
                            <Descriptions size="small" column={3}>
                                <Descriptions.Item label="创建人工号">{elementInfo?.createStaffId}</Descriptions.Item>
                                <Descriptions.Item label="更新时间">{elementInfo?.updateTime}</Descriptions.Item>
                                <Descriptions.Item label="元素ID">{elementInfo?.elementId}</Descriptions.Item>
                            </Descriptions>
                        </div>
                        <div className={styles.infoItem}>
                            <Descriptions size="small" column={1}>
                                <Descriptions.Item label="元素说明">{elementInfo?.elementDesc}</Descriptions.Item>
                            </Descriptions>
                        </div>
                        <div className={styles.buttonBox}>
                            {elementInfo?.elementStatus != '3' && (
                                <Button type="primary" onClick={() => setModalVisible(true)}>
                                    更新
                                </Button>
                            )}
                            {elementInfo?.elementStatus != '3' && (
                                <Button type="primary" onClick={() => setShowOnline(true)}>
                                    编辑
                                </Button>
                            )}
                            {/* <Button type="primary" onClick={handleDownload}>
                                下载
                            </Button>
                            {elementInfo?.elementStatus == '2' && (
                                <Button type="primary" onClick={() => logOffModal(elementInfo)}>
                                    下线
                                </Button>
                            )} */}
                        </div>
                    </div>
                    <div className={styles.tableTitle}>
                        <div className={styles.title}>版本历史</div>
                        <div className={styles.bottom}></div>
                    </div>
                    <Table<VersionRecord>
                        columns={columns}
                        dataSource={versions}
                        bordered
                        size="small"
                        pagination={{
                            current: currentPage,
                            pageSize: pageSize,
                            total: total,
                            showSizeChanger: true,
                            pageSizeOptions: ['5', '10', '20', '50'],
                            showQuickJumper: true,
                            showTotal: (total: any) => `共 ${total} 条记录`,
                            locale: { items_per_page: '/页' },
                            onChange: handleAppTableChange,
                        }}
                        scroll={{ x: 1000 }}
                        className={styles.table_container}
                        rowClassName={(_, index) => (index % 2 === 0 ? 'custom-even-row' : 'custom-odd-row')}
                        loading={loading}
                    />
                    {/* 更新弹窗 */}
                    <AddElementModal
                        visible={modalVisible}
                        isClassify={isClassify}
                        isEdit={isEdit}
                        elementInfoEdit={elementInfo}
                        appElementType={appElementType}
                        sourceFiles={sourceFiles}
                        onCreate={handleCreate}
                        onSaveDraft={handleSaveDraft}
                        onCancel={() => {
                            setModalVisible(false);
                            // setSourceFiles([]); // 清空编辑保存的源文件
                        }}
                    />
                    {/* 下线弹窗 */}
                    <Modal
                        // wrapClassName={styles.modal}
                        title={'下线元素'}
                        open={logOffVisible}
                        maskClosable={false}
                        onCancel={() => setLogOffVisible(false)}
                        width={420}
                        footer={null} // 移除默认底部按钮
                        destroyOnClose // 关闭时销毁子元素
                    >
                        <div style={{ margin: '30px 0' }}>
                            <Form form={offLineForm} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                                <Form.Item name="offLineReason" label="下线原因" rules={[]}>
                                    <Input.TextArea placeholder="请填写下线原因" rows={4} showCount />
                                </Form.Item>
                            </Form>
                        </div>
                        <div style={{ width: '420px', background: '#F9FAFC', textAlign: 'center' }}>
                            <Button type="primary" onClick={() => logOffFun()} style={{ marginRight: 8, width: '80px', height: '30px' }}>
                                确定
                            </Button>
                            <Button onClick={() => setLogOffVisible(false)} style={{ width: '80px', height: '30px' }}>
                                取消
                            </Button>
                        </div>
                    </Modal>
                </div>
            ) : (
                <OnlineEditing elementInfos={elementInfo} detailFiles={detailFiles} cancel={cancelHandleBack} saveCode={saveCodeHandleBack} />
            )}
        </div>
    );
};

export default ElementDetailPage;
