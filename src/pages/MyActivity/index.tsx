import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Table, Space, Modal } from 'antd';
import { message } from '@/utils/AntdGlobal';
import styles from './index.module.less';
import AddHtml from './myActiviChild/activityAdd';
import request from '@/utils/request';
import { crossApiUserInfo } from '@/stores/crossapiStore';
import { useNavigate,useSearchParams  } from 'react-router-dom'
import { ArrowLeftOutlined, ExclamationCircleTwoTone } from '@ant-design/icons';
interface AppElementType {
    label: string; // 元素分类ID
    value: string; // 元素分类名称
}
const TenantManagePage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams()
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const [searList, setsearList] = useState('');
    const [formData, setFormData] = useState({
        projectName: '', // 项目名称
        tenantCode: searchParams.get('tenantCode'), // 归属租户ID
        projectDesc: '', // 项目描述,
        staffId: userInfo.staffId,
        isAdmin: userInfo.isAdmin || '0',
        page: 1, // 当前页码
        start: 0,
        limit: 10,
    });

    useEffect(() => {
        let NewArr:any = [];
        NewArr = userInfo?.tenantInfos?.map((item: any, index: number) => ({
            value: item.configId,
            label: item.tenantName,
        }));
        statusOptions(NewArr);
        setsearList('1');
    }, []);
    useEffect(() => {
        formData.tenantCode && queryListTypeFun();
    }, [searList]);
    const [TenantList, statusOptions] = useState<AppElementType[]>([]);

    const [TabDataList, setTabDataList] = useState([]);
    // 列表查询
    const queryListTypeFun = () => {
        setLoading(true);
        try {
            request
                .post('/appProject/queryAppProjectList', {
                    params: {
                        ...formData,
                    },
                })
                .then((res) => {
                    setTabDataList(res?.beans ? res.beans : []);
                    setTotal(res?.bean.total);
                })
                .catch((err) => {});
        } catch (error) {
            setTabDataList([]);
            message.error('列表查询失败');
        } finally {
            setLoading(false);
        }
    };
    const deletFun = (pjec: string) => {
        try {
            request
                .post('/appProject/delAppProject', {
                    params: {
                        projectId: pjec,
                    },
                })
                .then((res) => {
                    if (res && res.returnCode === '0') {
                        message.success('数据删除成功');
                        queryListTypeFun();
                    }else{

                    }
                })
                .catch((err) => {
                    //message.error(err.message);
                });
        } catch (error) {
            message.error('数据删除失败');
        } finally {
        }
    };
    const columns: any = [
        {
            title: '操作',
            key: 'action',
            render: (text: string, record: any) => {
                return (
                    <Space size="middle">
                        <a
                            className={styles.actionBtn}
                            onClick={() => {
                                onAddEditClick(record);
                            }}
                        >
                            成员管理
                        </a>
                        <a
                            className={styles.actionBtn}
                            onClick={() => {
                                onEditClick(record);
                            }}
                        >
                            编辑
                        </a>
                        <a
                            className={styles.actionBtn}
                            onClick={() => {
                                deletFun(record.projectId);
                            }}
                        >
                            删除
                        </a>
                    </Space>
                );
            },
        },
        {
            title: '编码',
            dataIndex: 'projectCode',
            key: 'projectCode',
        },
        {
            title: '名称',
            dataIndex: 'projectName',
            key: 'projectName',
        },
        {
            title: '归属租户',
            dataIndex: 'tenantName',
            key: 'tenantName',
        },
        {
            title: '描述',
            dataIndex: 'projectDesc',
            key: 'projectDesc',
            width:150,
            ellipsis: true,
        },
        {
            title: '创建人',
            dataIndex: 'createStaffId',
            key: 'createStaffId',
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
        },
    ];

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(2);
    const [total, setTotal] = useState(0);
    const [isModel, setModel] = useState(false); //弹框打开
    const [isEdit, setisEdit] = useState(false); //是否点击编辑
    const [isAddEdit, setisAddEdit] = useState(false); //是否点击成员编辑
    const [loading, setLoading] = useState(true); //
    const [editsData, seteditsData] = useState([]); //

    const onEditClick = (dats: any) => {
        seteditsData(dats);
        setisEdit(true);
        setisAddEdit(false);
        setModel(true);
    };
    const onAddEditClick = (dats: any) => {
        seteditsData(dats);
        setisEdit(true);
        setisAddEdit(true);
        setModel(true);
    };
    const onAddClick = (dats: boolean) => {
        setisEdit(false);
        setisAddEdit(false);
        seteditsData([]);
        setModel(dats);
        queryListTypeFun();
    };
    const handleTableChange = (page: number, pageSize: number) => {
        setCurrentPage(page);
        setPageSize(pageSize);
        setFormData((prev) => ({
            ...prev,
            page: page,
            limit: pageSize,
            start: (page - 1) * pageSize,
        }));

    };
     useEffect(() => {
        formData.tenantCode && setLoading(true)
        formData.tenantCode && queryListTypeFun();
    }, [formData.page, formData.limit]);
// 重置按钮点击事件
    const handleReset = () => {
        setFormData({
            projectName: '', // 项目名称
            tenantCode: searchParams.get('tenantCode'), // 归属租户ID
            projectDesc: '', // 项目描述,
            staffId: userInfo.staffId,
            isAdmin: userInfo.isAdmin || '0',
            page: 1, // 当前页码
            start: 0,
            limit: 10,
        });
    };
    // 返回工作台
    const backWork = () => {};
    return (
        <div className={styles.tenantBox}>
            <div className={styles.tenantTop}>
                <div className={styles.tenantTitle}>项目管理</div>
                <span
                    className={styles.backBtn}
                    onClick={() => {
                        navigate(-1)
                    }}
                >
                    <ArrowLeftOutlined className={styles.backArrow} />
                    返回工作台
                </span>
            </div>
            <div className={styles.tenantSearch}>
                <div className={styles.searchCon}>
                    <div className={styles.searchItem}>
                        <label>项目名称</label>
                        <div className={styles.inputItem}>
                            <Input
                                placeholder="请输入"
                                value={formData.projectName}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        projectName: e.target.value,
                                    }))
                                }
                            />
                        </div>
                    </div>
                    <div className={styles.searchItem}>
                        <label>项目描述</label>
                        <div className={styles.inputItem}>
                            <Input
                                value={formData.projectDesc}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        projectDesc: e.target.value,
                                    }))
                                }
                                placeholder="请输入"
                            />
                        </div>
                    </div>
                    <div className={styles.searchItem}>
                        <label>归属租户</label>
                        <div className={styles.inputItem}>
                            <Select
                                value={formData.tenantCode}
                                options={TenantList}
                                onChange={(value) => setFormData((prev) => ({ ...prev, tenantCode: value }))}
                            />
                        </div>
                    </div>
                    <div className={[styles.searchfloa, styles.searchItem, styles.searchBtnItem].join(' ')}>
                        <Button
                            className={[styles.searchBtn, styles.searchQuery].join(' ')}
                            onClick={() => {
                                queryListTypeFun();
                            }}
                            type="primary"
                        >
                            查询
                        </Button>
                        <Button
                            className={styles.searchBtn}
                            onClick={() => {
                                handleReset();
                            }}
                        >
                            重置
                        </Button>
                    </div>
                </div>
            </div>
            <div className={styles.tenantContent}>
                <div className={styles.tenantTitle}>查询列表</div>
                <Button className={styles.addBtn} onClick={() => onAddClick(true)} type="primary">
                    +新增项目
                </Button>
                <Table
                    rowKey="id"
                    size='small'
                    columns={columns}
                    loading={loading}
                    dataSource={TabDataList}
                    pagination={{
                        current: formData.page,
                        pageSize: formData.limit,
                        total: total,
                        showSizeChanger: true,
                        pageSizeOptions: ['5', '10', '20', '50'],
                        showQuickJumper: true,
                        showTotal: (total) => `共 ${total} 条记录`,
                        locale: { items_per_page: '/页' },
                        onChange: handleTableChange,
                    }}
                />
            </div>

            <Modal
                title={isEdit ? (isAddEdit ? '成员管理' : '编辑项目') : '新增项目'}
                open={isModel}
                mask={true}
                maskClosable={false}
                footer={null}
                width={1000}
                destroyOnClose={true}
                closable={false}
            >
                <AddHtml isEdit={isEdit} tenantCode={formData?.tenantCode || ''} isAddEdit={isAddEdit} editsData={editsData} TenantLists={TenantList} onCancel={() => onAddClick(false)} />
            </Modal>
        </div>
    );
};

export default TenantManagePage;
