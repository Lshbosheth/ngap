import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './index.module.less';
import { Button, Input, Select, Table, Space, Modal, Tooltip } from 'antd';
import { message } from '@/utils/AntdGlobal';
import type { TableColumnsType, TableProps } from 'antd';
import { ArrowLeftOutlined, ExclamationCircleTwoTone } from '@ant-design/icons';
import request from '../../utils/request';
import TenantModal from './tenantModal';
import { crossApiUserInfo } from '../../stores/crossapiStore';

type TableRowSelection<T extends object = object> = TableProps<T>['rowSelection'];

interface DataType {
    configId: React.Key;
    tenantCode: string;
    tenantName: string;
    adminStaffId: string;
    tenantDesc: string;
    tenantState: string;
    createStaffId: string;
    createTime: string;
    updateStaffId?: string;
    updateTime?: string;
}

const statusOptions = [
    { value: '', label: '请选择' },
    { value: '1', label: '已启用' },
    { value: '0', label: '已停用' },
];

const TenantManagePage: React.FC = () => {
    const navigate = useNavigate();
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    // 租户查询入参
    const [tenantParams, setTenantParams] = useState({
        tenantCode: '',
        tenantName: '',
        tenantState: '',
        tenantDesc: '',
    });
    const columns: TableColumnsType<DataType> = [
        {
            title: '操作',
            key: 'action',
            width: 260,
            fixed: true,
            render: (text: string, record: DataType) => {
                return (
                    <Space size="middle">
                        <span
                            style={{ cursor: 'pointer', color: '#0085d0' }}
                            onClick={() => {
                                handleModal('change', record);
                            }}
                        >
                            变更管理员
                        </span>
                        <span
                            style={{ cursor: 'pointer', color: '#0085d0' }}
                            onClick={() => {
                                handleModal('edit', record);
                            }}
                        >
                            编辑
                        </span>
                        <span
                            style={{ cursor: 'pointer', color: '#0085d0' }}
                            onClick={() => {
                                reconfirmFun('del', record);
                            }}
                        >
                            删除
                        </span>
                        {record.tenantState === '0' ? (
                            <span
                                style={{ cursor: 'pointer', color: '#0085d0' }}
                                onClick={() => {
                                    reconfirmFun('enable', record);
                                }}
                            >
                                启用
                            </span>
                        ) : (
                            <span
                                style={{ cursor: 'pointer', color: '#F65A56' }}
                                onClick={() => {
                                    reconfirmFun('disable', record);
                                }}
                            >
                                停用
                            </span>
                        )}
                    </Space>
                );
            },
        },
        {
            title: '编码',
            dataIndex: 'tenantCode',
            key: 'tenantCode',
            width: 110,
        },
        {
            title: '名称',
            dataIndex: 'tenantName',
            key: 'tenantName',
            width: 140,
            ellipsis: {
                showTitle: false,
            },
            render: (text) => (
                <Tooltip title={text} placement="topLeft">
                    {text}
                </Tooltip>
            )
        },
        {
            title: '管理员',
            dataIndex: 'adminStaffId',
            key: 'adminStaffId',
            width: 110,
        },
        {
            title: '描述',
            dataIndex: 'tenantDesc',
            key: 'tenantDesc',
            width: 200,
            ellipsis: {
                showTitle: false,
            },
            render: (text) => (
                <Tooltip title={text} placement="topLeft" overlayClassName="custom-tooltip">
                    {text}
                </Tooltip>
            )
        },
        {
            title: '状态',
            dataIndex: 'tenantState',
            key: 'tenantState',
            width: 100,
            render: (tenantState: string) => {
                return <div>{statusOptions.find((item) => item.value === tenantState)?.label}</div>;
            },
        },
        {
            title: '创建人',
            dataIndex: 'createStaffId',
            key: 'createStaffId',
            width: 110,
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
            width: 180,
        },
        {
            title: '修改人',
            dataIndex: 'updateStaffId',
            key: 'updateStaffId',
            width: 110,
        },
        {
            title: '修改时间',
            dataIndex: 'updateTime',
            key: 'updateTime',
            width: 180,
        },
    ];
    const [tableData, setTableData] = useState<DataType[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState<boolean>(false);
    // 表格查询
    const handleTenantSearch = () => {
        setLoading(true);
        const params = {
            ...tenantParams,
            start: (currentPage - 1) * pageSize,
            limit: pageSize,
        };
        request
            .post('/appTenant/queryAppTenantList', {params})
            .then((res) => {
                setTotal(res.bean.total);
                setTableData(res.beans);
                setLoading(false);
            })
            .catch((err) => {
                // setTableData(data);
                setLoading(false);
            });
    };

    // 表格分页变化触发
    const handleTableChange = (page: number, pageSize: number) => {
        setCurrentPage(page);
        setPageSize(pageSize);
        // handleTenantSearch();
    };

    useEffect(() => {
        handleTenantSearch();
    }, [currentPage, pageSize]);

    const [modalType, setModalType] = useState('add'); // 弹窗类型 add新增   edit编辑   change变更
    const [modalVisible, setModalVisible] = useState(false);
    const [editData, setEditData] = useState<DataType>(); // 当前编辑或变更数据
    // 新增、编辑、变更管理员 打开弹窗
    const handleModal = (type: string, record?: DataType) => {
        setModalType(type);
        setEditData(type != 'add' ? record : undefined);
        setModalVisible(true);
    };
    // 新增、编辑、变更管理员 弹窗中点击确定
    const handleConfirm = (type: string, values: any) => {
        let url = '';
        if (type === 'add') {
            url = '/appTenant/insertAppTenant';
        } else {
            url = '/appTenant/updateAppTenant';
        }
        const params = {
            ...values,
            staffId: userInfo.staffId,
        };
        request
            .post(url, { params: params })
            .then((res) => {
                if (type != 'enable' && type != 'disable') {
                    message.success(`${type === 'add' ? '新增租户' : type === 'edit' ? '编辑租户' : '变更管理员'}成功`);
                    setModalVisible(false);
                } else {
                    message.success(`${type === 'enable' ? '启用租户' : '停用租户'}成功`);
                    setDeleteVisible(false);
                    // setEditData(undefined);
                    setSelectedRowKeys([]);
                    setSelectedRows([]);
                }
                handleTenantSearch();
            })
            .catch((err) => {});
    };
    const [deleteVisible, setDeleteVisible] = useState(false); // 删除二次确认弹窗显隐
    const [reconfirmType, setReconfirmType] = useState(''); // 二次确认弹窗类型
    const reconfirmFun = (optType: string, record: any) => {
        setReconfirmType(optType);
        setEditData(record);
        setDeleteVisible(true);
    };
    // 删除接口
    const deleteFun = () => {
        request
            .post('/appTenant/delAppTenant', {
                params: {
                    configId: editData?.configId,
                    staffId: userInfo.staffId,
                    tenantCode: editData?.tenantCode
                },
            })
            .then((res) => {
                setDeleteVisible(false);
                message.success(`删除租户成功`);
                // setEditData(undefined)
                handleTenantSearch();
            })
            .catch((err) => {});
    };

    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<DataType[]>([]);
    const onSelectChange = (newSelectedRowKeys: React.Key[], newSelectedRows: DataType[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
        setSelectedRows(newSelectedRows);
    };
    const rowSelection: TableRowSelection<DataType> = {
        selectedRowKeys,
        columnWidth: 40,
        onChange: onSelectChange,
    };
    // 批量启用/停用
    const handleEnableFun = (state: string) => {
        if (selectedRowKeys.length === 0) {
            message.warning('请选中数据后重试');
            return;
        }
        if (
            (state === 'enable' && selectedRows.some((item) => item.tenantState === '1')) ||
            (state === 'disable' && selectedRows.some((item) => item.tenantState === '0'))
        ) {
            const tipStr = selectedRows
                .filter((item) => (state === 'enable' ? item.tenantState === '1' : item.tenantState === '0'))
                .map((item) => item.tenantName)
                .join();
            message.warning(`【${tipStr}】为【${state === 'enable' ? '已启用' : '已停用'}】态，请重新选择`);
            setSelectedRowKeys([]);
            setSelectedRows([]);
            return;
        }
        handleConfirm(state, { configIds: selectedRowKeys.join(), tenantState: state === 'enable' ? '1' : '0' });
    };
    // 删除、启用/停用 二次确认弹窗中确认
    const handleReconfirm = () => {
        if (reconfirmType === 'del') {
            deleteFun();
        } else {
            handleConfirm(reconfirmType, { configIds: editData?.configId, tenantState: reconfirmType === 'enable' ? '1' : '0' });
        }
    };
    // 返回工作台
    const backWork = () => {
        navigate('/');
    };

    return (
        <div className={styles.tenantBox}>
            <div className={styles.tenantTop}>
                <div className={styles.tenantTitle}>租户管理</div>
                <span className={styles.backBtn} onClick={backWork}>
                    <ArrowLeftOutlined className={styles.backArrow} />
                    返回工作台
                </span>
            </div>
            <div className={styles.tenantSearch}>
                <div className={styles.searchCon}>
                    <div className={styles.searchItem}>
                        <label>编码：</label>
                        <div className={styles.inputItem}>
                            <Input
                                placeholder="请输入"
                                value={tenantParams.tenantCode}
                                onChange={(e) => setTenantParams((prev) => ({ ...prev, tenantCode: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div className={styles.searchItem}>
                        <label>名称：</label>
                        <div className={styles.inputItem}>
                            <Input
                                placeholder="请输入"
                                value={tenantParams.tenantName}
                                onChange={(e) => setTenantParams((prev) => ({ ...prev, tenantName: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div className={styles.searchItem}>
                        <label>状态：</label>
                        <div className={styles.inputItem}>
                            <Select
                                options={statusOptions}
                                placeholder="请选择"
                                value={tenantParams.tenantState}
                                onChange={(value) => setTenantParams((prev) => ({ ...prev, tenantState: value }))}
                            />
                        </div>
                    </div>
                    <div className={styles.searchItem}>
                        <label>描述：</label>
                        <div className={styles.inputItem}>
                            <Input
                                placeholder="请输入"
                                value={tenantParams.tenantDesc}
                                onChange={(e) => setTenantParams((prev) => ({ ...prev, tenantDesc: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div className={[styles.searchItem, styles.searchBtnItem].join(' ')}>
                        <Button onClick={handleTenantSearch} className={[styles.searchBtn, styles.searchQuery].join(' ')} type="primary">
                            查询
                        </Button>
                        <Button
                            onClick={() => {
                                setTenantParams({ tenantCode: '', tenantName: '', tenantState: '', tenantDesc: '' });
                            }}
                            className={styles.searchBtn}
                        >
                            重置
                        </Button>
                    </div>
                </div>
            </div>
            <div className={styles.tenantContent}>
                <div className={styles.tenantListTitle}>查询列表</div>
                <Button
                    className={styles.addBtn}
                    style={{ background: '#90C31F' }}
                    type="primary"
                    onClick={() => {
                        handleModal('add');
                    }}
                >
                    +新增
                </Button>
                <Table<DataType>
                    rowKey="configId"
                    rowSelection={rowSelection}
                    columns={columns}
                    scroll={{ x: 1200, y: 530 }}
                    dataSource={tableData}
                    loading={loading}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: total,
                        showSizeChanger: true,
                        pageSizeOptions: ['5', '10', '20', '50'],
                        showQuickJumper: true,
                        showTotal: (total) => `共 ${total} 条记录`,
                        locale: { items_per_page: '/页' },
                        onChange: handleTableChange,
                    }}
                />
                <div className={[styles.leftBottomBox, tableData.length ? '' : styles.noDataBottomBox].join(' ')}>
                    <span>已选中{selectedRowKeys.length}条</span>
                    <Button
                        className={styles.enableBtn}
                        type="primary"
                        style={{ borderColor: '#0085D0', background: '#fff', color: '#0085D0', borderRadius: '2px' }}
                        onClick={() => {
                            handleEnableFun('enable');
                        }}
                    >
                        批量启用
                    </Button>
                    <Button
                        type="primary"
                        style={{ borderColor: '#0085D0', background: '#fff', color: '#0085D0', borderRadius: '2px' }}
                        onClick={() => {
                            handleEnableFun('disable');
                        }}
                    >
                        批量停用
                    </Button>
                </div>
            </div>
            <TenantModal
                type={modalType}
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                editData={editData}
                onConfirm={handleConfirm}
            />
            {/* 删除弹窗 */}
            <Modal
                open={deleteVisible}
                closable={false}
                maskClosable={false}
                onCancel={() => setDeleteVisible(false)}
                width={420}
                footer={null} // 移除默认底部按钮
                destroyOnClose // 关闭时销毁子元素
            >
                <div style={{ marginTop: 36 }}>
                    <div style={{ display: 'inline-block', margin: '0px 20px 116px 15px' }}>
                        <ExclamationCircleTwoTone twoToneColor="#FFAB00" style={{ fontSize: '48px' }} />
                    </div>
                    <div style={{ display: 'inline-block', width: 'calc(100% - 85px)', verticalAlign: 'top' }}>
                        <div style={{ fontSize: '16px', color: '#333333', fontWeight: 'bold' }}>提示</div>
                        <div style={{ fontSize: '13px', color: '#666666' }}>
                            {reconfirmType === 'del'
                                ? '你确定删除该租户吗？'
                                : reconfirmType === 'enable'
                                ? '确定启用该租户吗？'
                                : '确定停用该租户吗？'}
                        </div>
                    </div>
                </div>
                <div
                    style={{
                        height: '60px',
                        width: '420px',
                        background: '#F9FAFC',
                        position: 'absolute',
                        bottom: '0px',
                        left: '0px',
                        borderTop: '1px solid #D0D6D9',
                        textAlign: 'center',
                        paddingTop: '10px',
                    }}
                >
                    <Button type="primary" onClick={() => handleReconfirm()} style={{ marginRight: 17, width: '140px', height: '40px' }}>
                        确定
                    </Button>
                    <Button onClick={() => setDeleteVisible(false)} style={{ width: '140px', height: '40px' }}>
                        取消
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default TenantManagePage;
