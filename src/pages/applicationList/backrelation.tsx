import { forwardRef, useImperativeHandle, useEffect, useState,useRef } from 'react';
import { Table, Space, Tabs, App, Button, Drawer, Descriptions, Tooltip,Modal } from 'antd';
import { EyeOutlined, PlayCircleOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import request from '@/utils/request';
import { menu } from '@/stores/menuStore';
import { crossApiUserInfo } from '@/stores/crossapiStore';
import './backrelation.less';
import { publictData } from '../../utils/appMenuData';
import OffshelfModal from './OffshelfModal';
import VersionHost from './versionHost';
import recodeLog from '../../utils/operLog';
interface AppTemptypeData {
    pId: string;
    typeLevel: string;
    appTypeCategory: string;
    appTypeId: string;
    appTypeName: string;
}
function BackCall(_: any, ref: any) {
    const { message } = App.useApp();
    const openPreview = menu((state) => state.openPreview);
    const [drawerOpen, setDrawerOpen] = useState(false);  // 详情抽屉显隐
    const [drawerTitle, setDrawerTitle] = useState('');  // 详情标题
    const [listDatas, setlistDatas] = useState<any>();  // 详情标题
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const updeRefs = useRef<{ open: (data: any) => void }>();
    // 控制折叠/展开状态
    const [expanded, setExpanded] = useState(true);
    const [expandedList, setexpandedList] = useState(true);


    const [queryList, setqueryList] = useState([]); //
    const [loading, setLoading] = useState(false); //
    const [total, setTotal] = useState(0);

    // 回滚申请弹窗相关状态
    const [offshelfModalVisible, setOffshelfModalVisible] = useState(false);
    const [offshelfRecord, setOffshelfRecord] = useState<any>(null);
    const [recodeList, setRecodeList] = useState<any>([]);  //  审核记录
    const queryAppReviewHisList = async (data:any) => {  // 获取审核记录数据
        try {
            request
                .post('appReview/queryAppReviewHisList', { params: {
                    markId: data.id,    // 只传它 查该markId全部审核记录
                    markVersion: data.belongVersion,
                }})
                .then((res) => {
                    setRecodeList(res.beans);
                })
                .catch((err) => { setRecodeList([]); });
        } catch (error) {
            console.error('获取审核记录数据失败:', error);
        } finally { }
    };
    // 提交回滚申请
    const handleOffshelfSubmit = async (submitData: any) => {
        const params = {
            id: offshelfRecord?.id || '',
            pubSubInfo: {
                reviewState: 'rollbackSub', // 回滚提交
                ...submitData
            }
        };
        // 调用回滚申请接口
        return request.post('/app/saveAppInfo', { params }).then((res) => {
            if (res && res.returnCode === '0') {
                message.success('回滚申请提交成功');
                const logParams = {
                    provCode: userInfo.provinceId, // 8位省份编码
                    modelName: '', // 所属模块  暂时为空
                    pageName: '', // 所属菜单   暂时为空
                    dataType: '应用', // 数据类型（应用、元素、组件、接口）
                    operType: '回滚', // 操作类型（新增/编辑/删除/导入）
                    dataId: offshelfRecord?.id, // 操作数据ID
                    dataName: offshelfRecord?.appName, // 操作数据名称
                    editContent: `回滚${offshelfRecord?.appName}应用`, // 操作内容简述
                    staffId: userInfo.staffId, // 操作人工号
                };
                recodeLog(logParams);
                queryNumsFun();
                return Promise.resolve();
            } else {
                message.error(res.returnMsg || '回滚申请提交失败');
                return Promise.reject();
            }
        }).catch((err) => {
            return Promise.reject();
        });
    };
    const [formData, setFormData] = useState({
        relationId: '',
        page: 1, // 当前页码
        start: 0,
        limit: 5,
    });
    // 预览按钮点击事件
    const handlePreview = (items: any) => {
        if (items?.sceneType == 'base') {
            //  装配式预览
            openPreview(items?.appName, items?.id, 'yy-base');
        } else if (items?.sceneType == 'process') {
            //步骤引导式预览
            openPreview(items?.appName, items?.id, 'Step-base');
        }
    };
    const handleTableChange = (page: number, pageSize: number) => {
        setFormData((prev) => ({
            ...prev,
            page: page,
            limit: pageSize,
            start: (page - 1) * pageSize,
        }));
    };

    const columns: any = [
        {
            title: '操作',
            key: 'action',
            render: (text: string, record: any, index: number) => {
                if (record.appStatus === '7' || record.appStatus === '8') {
                    // 只对列表中第一条状态为7或8的记录显示可点击的回滚按钮
                    let isFirstRollbackRecord = queryList.findIndex(
                        (item: any) => item.appStatus === '7' || item.appStatus === '8'
                    ) === index;
                    if(record.appStatus === '8'){
                        isFirstRollbackRecord = false
                    }
                    return (
                        <Space size="middle">
                            <a
                                style={{ color: isFirstRollbackRecord ? '#0085d0' : '#ccc' }}
                                onClick={() => {
                                    if (isFirstRollbackRecord) {
                                    setOffshelfRecord(record);
                                    setOffshelfModalVisible(true);
                                    }
                                }}
                            >
                                回滚
                            </a>
                            <a
                                style={{ color: '#0085d0' }}
                                onClick={() => {
                                    handlePreview(record)
                                }}
                            >
                                预览
                            </a>
                        </Space>
                    );
                } else {
                    return (
                        <Space size="middle">
                            <a
                                style={{ color: '#0085d0' }}
                                onClick={() => {
                                    handlePreview(record)
                                }}
                            >
                                预览
                            </a>
                        </Space>
                    );
                }



            },
        },
        {
            title: '版本号',
            dataIndex: 'belongVersion',
            key: 'belongVersion',
            render: (text: string, record: any) => {
                return <a onClick={()=>{
                    onverClick(record);
                }}>{text}</a>
            }
            //onverClick
        },
        {
            title: '状态',
            dataIndex: 'appStatus',
            key: 'appStatus',
            render: (text: string, record: any) => {
                if(text === '0'){
                    return <span>删除</span>
                }
                return <span>{statusOptions.find((item: any) => item.value == text)?.label}</span>
            }
        },
        {
            title: '发布时间',
            dataIndex: 'publishTime',
            key: 'publishTime',
        },
        {
            title: '最近操作时间',
            dataIndex: 'updateTime',
            key: 'updateTime',
        }
    ];
    //应用形式
    const displayFormOptions = publictData.showFormArr;
    //状态
    const statusOptions = publictData.schemeStateArr;
     // 应用标签列表数据
    const [appTagList, setAppTagList] = useState<AppTemptypeData[]>([]);
    const [appTypeList, setAppTypeList] = useState<AppTemptypeData[]>([]);
    // 根据应用标签ID获取应用标签名称
    const getAppTagNameById = (tagTypeId?: string): string => {
        if (!tagTypeId) return '';
        const tagIds = tagTypeId.split(',');
        const tagNames = tagIds.map(id => {
            const tag = appTagList.find((item: AppTemptypeData) => item.appTypeId === id);
            return tag ? tag.appTypeName : '';
        }).filter(name => name);
        return tagNames.join(',');
    };
    // 递归查询所有父级Name
    const getAppTypeNameById = (result: string[], appTypeId?: string): void => {
        const item = appTypeList.find((i) => i.appTypeId === appTypeId);
        if (item) {
            result.unshift(item.appTypeName);
            if (item.pId) {
                getAppTypeNameById(result, item.pId);
            }
        }
    };
    const appTypeNames: string[] = [];
    const tagNames = getAppTagNameById(listDatas?.tagTypeId);
    const resultplus = getAppTypeNameById(appTypeNames, listDatas?.appTypeId);
    const [tenantName, settenantName] = useState('');
    const [proJectNm, setproJectNm] = useState('');
    // 查询应用标签列表
    const queryAppTagList = () => {
        request
            .post('/appType/queryAppTypeList', { params: { categoryType: '2' } })
            .then((res) => {
                if (res?.beans) {
                    setAppTagList(res.beans);
                }
            })
            .catch((err) => {
                console.error('查询应用标签列表失败:', err);
            });
    };
    // 租户表格查询
    const handleTenantSearch = () => {
        const params = {
            tenantCode: listDatas?.serviceTypeId,
            start: 0,
            limit: 10
        };
        request
            .post('/appTenant/queryAppTenantList', {params})
            .then((res) => {
                settenantName(res?.beans[0]?.tenantName)
            })
            .catch((err) => {
            });
            request
            .post('/appType/queryAppTypeList', {})
            .then((res) => {
                const appTypeListBeans = res.beans;
                setAppTypeList((pev) => {
                    return appTypeListBeans.map((item: AppTemptypeData) => {
                        return {
                            appTypeCategory: item.appTypeCategory,
                            appTypeId: item.appTypeId,
                            appTypeName: item.appTypeName,
                            pId: item.pId,
                            typeLevel: item.typeLevel,
                        };
                    });
                });
            })
            .catch((err) => {
            });
    };
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
                        setproJectNm(res?.beans[0]?.projectName)
                    })
                    .catch((err) => { });
            } catch (error) {
            } finally {
            }
        };
    useEffect(() => {
        queryAppTagList();
        handleTenantSearch();
        listDatas?.id && queryAppReviewHisList(listDatas);
        queryListTypeFun(listDatas?.projectId)
    }, [listDatas]);
    useEffect(() => {
        formData.relationId && queryNumsFun();
    }, [formData.relationId]);
    const queryNumsFun = () => {
        try {
            request
                .post('/app/queryAppListByRelationId', {
                    params: {
                        ...formData
                    },
                })
                .then((res) => {
                    setqueryList(res?.beans)
                })
                .catch((err) => { });
        } catch (error) {
        } finally {
        }
    };
    const showDrawer = () => {
        // 打开前先重置！
        setqueryList([]);
        setlistDatas({});
        setExpanded(true)
        setexpandedList(true)
    };
    const onverClick = (record:any) => {
        updeRefs.current?.open(record);
    };
    useImperativeHandle(ref, () => ({
        open: (data: any) => {
            setFormData((prev) => ({
                relationId: data.relationId,
                page: 1, // 当前页码
                start: 0,
                limit: 5,
            }));
            setDrawerOpen(true);
            setDrawerTitle(data.appName + '应用详情');
            setlistDatas(data);
        },
        close: () => {
            showDrawer();
            setFormData((prev) => ({
                relationId: '',
                page: 1, // 当前页码
                start: 0,
                limit: 5,
            }));
            setDrawerOpen(false);
        }
    }));
    return (
        <>
            <Drawer
                width="55vw"
                title={drawerTitle}
                open={drawerOpen}
                onClose={() => {
                    showDrawer();
                    setFormData((prev) => ({
                        relationId: '',
                        page: 1, // 当前页码
                        start: 0,
                        limit: 5,
                    }));
                    setDrawerOpen(false);

                }}
                destroyOnClose={true}
                keyboard={false}
                maskClosable={false}
                rootClassName="custom-drawer-root"
                getContainer={false}
            >
                <div className="infocard">
                    <div className="cardheader" onClick={() => setExpanded(!expanded)}>
                        <div className="titlea">
                            <span className="titlebar" />
                            <span>基本信息</span>
                        </div>
                        {expanded ? <UpOutlined /> : <DownOutlined />}
                    </div>

                    {expanded && (
                        <div className="cardcontent">
                            <Descriptions column={3} bordered={false} size="middle">
                                <Descriptions.Item label="应用名称">
                                    <Tooltip title={listDatas?.appName}>
                                        <span className="ellipsis-text">{listDatas?.appName}</span>
                                    </Tooltip>
                                    <Button
                                        type="primary"
                                        size="small"
                                        icon={<PlayCircleOutlined />}
                                        style={{ marginLeft: 10, color: '#fff' }}
                                        onClick={(e) => {
                                            e.stopPropagation(); // 防止触发折叠
                                            if (listDatas?.sceneType == 'base') {
                                                //  装配式预览
                                                openPreview(listDatas?.appName, listDatas?.id, 'yy-base');
                                            } else if (listDatas?.sceneType == 'process') {
                                                //步骤引导式预览
                                                openPreview(listDatas?.appName, listDatas?.id, 'Step-base');
                                            }
                                        }}
                                    >
                                        界面预览
                                    </Button>
                                </Descriptions.Item>
                                <Descriptions.Item label="应用类别">{listDatas?.appCategory === '1' ? '生产应用' : '运营应用'}</Descriptions.Item>
                                <Descriptions.Item label="状态">{statusOptions.find((item: any) => item.value == listDatas?.appStatus)?.label}</Descriptions.Item>

                                <Descriptions.Item label="应用级别">{listDatas?.appLevel === '1' ? '一级应用' : '二级应用'}</Descriptions.Item>
                                <Descriptions.Item label="应用形式">
                                    <Tooltip title={displayFormOptions.find((item: any) => item.value == listDatas?.sceneType)?.label}>
                                        <span className="ellipsis-text">{displayFormOptions.find((item: any) => item.value == listDatas?.sceneType)?.label}</span>
                                    </Tooltip>
                                </Descriptions.Item>
                                <Descriptions.Item label="应用分类">
                                    <Tooltip title={appTypeNames.join('-')}>
                                        <span className="ellipsis-text">{appTypeNames.join('-')}</span>
                                    </Tooltip>
                                </Descriptions.Item>
                                <Descriptions.Item label="应用标签">
                                    <Tooltip title={tagNames}>
                                        <span className="ellipsis-text">{tagNames}</span>
                                    </Tooltip>
                                </Descriptions.Item>
                                <Descriptions.Item label="归属模块">{listDatas?.belongModule}</Descriptions.Item>
                                <Descriptions.Item label="归属租户">{tenantName}</Descriptions.Item>
                                <Descriptions.Item label="归属项目">
                                    <Tooltip title={proJectNm}>
                                        <span className="ellipsis-text">{proJectNm}</span>
                                    </Tooltip>
                                </Descriptions.Item>

                                <Descriptions.Item label="前端应用纳管员">{listDatas?.frontStaff}</Descriptions.Item>
                                <Descriptions.Item label="技术负责人">{listDatas?.tecStaff}</Descriptions.Item>
                                <Descriptions.Item label="版本号">{listDatas?.belongVersion}</Descriptions.Item>
                                <Descriptions.Item label="应用描述" span={3}>
                                    <Tooltip title={listDatas?.appDesc}>
                                        <span className="ellipsis-text">{listDatas?.appDesc}</span>
                                    </Tooltip>
                                </Descriptions.Item>
                            </Descriptions>
                        </div>
                    )}
                    <div className="cardheader" onClick={() => setexpandedList(!expandedList)}>
                        <div className="titlea">
                            <span className="titlebar" />
                            <span>版本信息</span>
                        </div>
                        {expandedList ? <UpOutlined /> : <DownOutlined />}
                    </div>

                    {expandedList && (
                        <div className="cardcontent">
                            <Table
                                rowKey="id"
                                columns={columns}
                                loading={loading}
                                dataSource={queryList}
                                pagination={{
                                    current: formData.page,
                                    pageSize: formData.limit,
                                    total: total,
                                    showSizeChanger: true,
                                    pageSizeOptions: ['5', '10'],
                                    showQuickJumper: true,
                                    showTotal: (total) => `共 ${total} 条记录`,
                                    locale: { items_per_page: '/页' },
                                    onChange: handleTableChange,
                                }}
                            />
                        </div>
                    )}
                </div>
            </Drawer>

            {/* 回滚申请弹窗 */}
            <OffshelfModal
                visible={offshelfModalVisible}
                onClose={() => {
                    setOffshelfModalVisible(false);
                    setOffshelfRecord(null);
                }}
                record={offshelfRecord}
                onSubmit={handleOffshelfSubmit}
                onRefresh={() => {
                    queryNumsFun();
                }}
                modalType="rollback"
            />
            <VersionHost
                onrefFun={() => {''}}
                ref={updeRefs}
            />
        </>
    );
};

export default forwardRef(BackCall);
