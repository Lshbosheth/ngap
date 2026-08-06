import React, { useState, useEffect } from 'react';
import styles from '../index.module.less';
import { Button, Radio, Flex, Input, Select, Table, Space, Steps, Modal, Tag, TableProps } from 'antd';
import { message } from '@/utils/AntdGlobal';
const { Step } = Steps;
const { TextArea } = Input;
import request from '@/utils/request';
import { crossApiUserInfo } from '@/stores/crossapiStore';
import { SearchOutlined } from '@ant-design/icons';
interface AddElementModalProps {
    isEdit: boolean; // 是否为编辑
    tenantCode:string; // 租户编码
    isAddEdit: boolean; // 是否为成员编辑
    editsData: any;
    TenantLists: any;
    onCancel: () => void; // 取消
}
interface DataType {
    configId: React.Key;
    projectState: string;
    staffId: string;
}
interface OptionItem {
    value: string;
    label: string;
}

type TableRowSelection<T extends object = object> = TableProps<T>['rowSelection'];
const AddManagePage: React.FC<AddElementModalProps> = ({ isEdit, tenantCode,isAddEdit, editsData, TenantLists, onCancel }) => {
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const OnSaveclick = () => {
        if (!formData.projectName) {
            message.warning('名称不能为空');
            return;
        }
        if (formData.projectName.length > 50) {
            message.warning('名称不能超过50字');
            return;
        }
        if (!formData.projectCode) {
            message.warning('编码不能为空');
            return;
        }
        if (!formData.tenantCode) {
            message.warning('归属租户不能为空');
            return;
        }
        if (!formData.projectDesc) {
            message.warning('描述不能为空');
            return;
        }
        if (formData.projectDesc.length > 500) {
            message.warning('描述不能超过500字');
            return;
        }
        try {
            const urls = '/appProject/updateAppProject';
            request
                .post(urls, {
                    params: {
                        ...formData,
                    },
                })
                .then((res) => {
                    message.success('项目保存成功');
                    onCancel();
                })
                .catch((err) => {});
        } catch (error) {
            message.error('项目保存失败');
        } finally {
        }
    };
    const formOnclick = (key: string, numx: number) => {
        //1 下一步 0 上一步
        if (numx == 1) {
            if (!formData.projectName) {
                message.warning('名称不能为空');
                return;
            }
            if (formData.projectName.length > 50) {
                message.warning('名称不能超过50字');
                return;
            }
            if (!formData.projectCode) {
                message.warning('编码不能为空');
                return;
            }
            if (!formData.tenantCode) {
                message.warning('归属租户不能为空');
                return;
            }
            if (!formData.projectDesc) {
                message.warning('描述不能为空');
                return;
            }
            if (formData.projectDesc.length > 500) {
                message.warning('描述不能超过500字');
                return;
            }
            try {
                let urls = '/appProject/insertAppProject';
                if (formData.projectId) {
                    urls = '/appProject/updateAppProject';
                }
                request
                    .post(urls, {
                        params: {
                            ...formData,
                        },
                    })
                    .then((res) => {
                        message.success('项目保存成功');
                        setFormState((prev: any) => ({
                            stepNum: numx,
                            isNexButton: false, // 动态键名，适配不同字段
                            isProButton: true,
                            isText: false,
                            isListTab: true,
                            isAgree: false, // 是否同意协议
                        }));
                        if (!formData.projectId) {
                            setFormData((prev: any) => ({
                                ...prev,
                                projectId: res.bean.projectId,
                            }));
                            setAppData((prev: any) => ({
                                ...prev,
                                projectId: res.bean.projectId,
                            }));
                            setAppAddData((prev: any) => ({
                                ...prev,
                                projectId: res.bean.projectId,
                            }));
                        }
                    })
                    .catch((err) => {});
            } catch (error) {
                message.error('项目保存失败');
            } finally {
            }
        } else {
            setFormState((prev: any) => ({
                stepNum: numx,
                isNexButton: true, // 动态键名，适配不同字段
                isProButton: false,
                isText: true,
                isListTab: false,
                isAgree: false, // 是否同意协议
            }));
        }
    };
    const stepsDte = [
        {
            content: '添加项目',
            description: '添加项目', // 步骤描述（可选）
        },
        {
            content: '成员管理',
            description: '成员管理', // 步骤描述（可选）
        },
    ];
    const deletFun = (pjec: string) => {
        try {
            request
                .post('/appProject/delAppProjectStaff', {
                    params: {
                        configId: pjec,
                    },
                })
                .then((res) => {
                    message.success('成员删除成功');
                    queryListFun();
                })
                .catch((err) => {});
        } catch (error) {
            message.error('成员删除失败');
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
                        {record.projectState == '1' ? (
                            <a
                                style={{ color: 'red' }}
                                className={styles.actionBtn}
                                onClick={() => {
                                    handleConfirm('disabled', { configIds: record.configId, projectState: '0' });
                                }}
                            >
                                禁用
                            </a>
                        ) : (
                            <a
                                className={styles.actionBtn}
                                onClick={() => {
                                    handleConfirm('enable', { configIds: record.configId, projectState: '1' });
                                }}
                            >
                                启用
                            </a>
                        )}
                        <a
                            style={{ color: 'red' }}
                            onClick={() => {
                                deletFun(record.configId);
                            }}
                            className={styles.actionBtn}
                        >
                            删除
                        </a>
                    </Space>
                );
            },
        },
        {
            title: '工号',
            dataIndex: 'staffId',
            key: 'staffId',
        },
        {
            title: '姓名',
            dataIndex: 'staffName',
            key: 'staffName',
        },
        {
            title: '关联角色',
            dataIndex: 'roleName',
            key: 'roleName',
        },
        {
            title: '状态',
            dataIndex: 'projectState',
            key: 'projectState',
            render: (text: string) => {
                const provText: string = text === '1' ? '已启用' : '已禁用';
                return <span>{provText}</span>;
            },
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
    const [total, setTotal] = useState(0); //tab
    //分页十几件
    const handleTableChange = (page: number, pageSize: number) => {
        setCurrentPage(page);
        setPageSize(pageSize);
        setAppData((prev: any) => ({
            ...prev,
            page: page,
            limit: pageSize,
            start: (page - 1) * pageSize,
        }));
        queryListFun();
    };
    const [formState, setFormState] = useState({
        isNexButton: true, // 下一步
        isProButton: false, // 上一步
        isText: true, //w文本域展示
        isListTab: false, //列表是否展示
        stepNum: 0, // 步数
        isAgree: false, // 是否同意协议
    });
    const [isModel, setModel] = useState(false); //弹框打开
    const [formData, setFormData] = useState({
        projectId: '', //修改使用
        projectName: '', // 项目名称
        projectCode: '', // 项目编码
        tenantCode: TenantLists[0]?.value, // 归属租户ID
        projectDesc: '', // 项目描述
        staffId: userInfo.staffId,
        serviceTypeId: userInfo.serviceTypeId,
    });

    const [AppDataList, setAppDataList] = useState([]);
    const [AppData, setAppData] = useState({
        projectId: '',
        serachKey: '', // 项目名称
        page: 1, // 当前页码
        start: 0,
        limit: 10,
    });
    const [AppAddList, setAppAddList] = useState([
        {
            value: '020263006001',
            label: '生产类开发人员',
        },
        {
            value: '020263006002',
            label: '运营类开发人员',
        },
        {
            value: '020263',
            label: '测试人员',
        },
        {
            value: '020263006004',
            label: '运营人员',
        },
        {
            value: '020263006005',
            label: '项目管理员',
        }
    ]);
    const [AppAddData, setAppAddData] = useState({
        projectId: '', //归属项目ID
        staffId: '', // 坐席工号
        staffName: '', // 坐席姓名
        roleId: '1', // 角色编码
        roleName: '开发人员', // 角色名称
        projectState: '1', // 用户状态1启用0禁用
        crtStaffId: userInfo.staffId || '', // 创建人工号
    });
    //监听 初始化加载
    useEffect(() => {
        if (isEdit) {
            if (isAddEdit) {
                setFormData((prev: any) => ({
                    ...prev,
                    projectId: editsData.projectId, //修改使用
                    projectName: editsData.projectName, // 项目名称
                    projectCode: editsData.projectCode, // 项目编码
                    tenantCode: editsData.tenantCode, // 归属租户ID
                    projectDesc: editsData.projectDesc, // 项目描述
                    staffId: userInfo.staffId,
                    serviceTypeId: userInfo.serviceTypeId,
                }));
                setAppData((prev: any) => ({
                    ...prev,
                    projectId: editsData.projectId, //修改使用
                }));
                setAppAddData((prev: any) => ({
                    ...prev,
                    projectId: editsData.projectId, //修改使用
                }));
                setFormState((prev: any) => ({
                    ...prev,
                    isText: false,
                    isListTab: true,
                }));
            } else {
                setFormData((prev: any) => ({
                    ...prev,
                    projectId: editsData.projectId, //修改使用
                    projectName: editsData.projectName, // 项目名称
                    projectCode: editsData.projectCode, // 项目编码
                    tenantCode: editsData.tenantCode, // 归属租户ID
                    projectDesc: editsData.projectDesc, // 项目描述
                    staffId: userInfo.staffId,
                    serviceTypeId: userInfo.serviceTypeId,
                }));
            }
        }else{
            tenantCode && setFormData((prev: any) => ({
                ...prev,
                tenantCode: tenantCode, // 归属租户ID
            }));

        }
    }, []);
    //监听 人员列表查询
    useEffect(() => {
        AppData.projectId && queryListFun();
    }, [AppData.projectId]);

    const queryListFun = () => {
        try {
            request
                .post('/appProject/queryAppProjectStaffList', {
                    params: {
                        ...AppData,
                    },
                })
                .then((res) => {
                    setAppDataList(res?.beans ? res.beans : []);
                })
                .catch((err) => {});
        } catch (error) {
            message.error('成员管理查询失败');
        } finally {
        }
    };
    // 重置按钮点击事件
    const handleReset = () => {
        setAppData({
            projectId: formData.projectId,
            serachKey: '', // 项目名称
            page: 1, // 当前页码
            start: 0,
            limit: 10,
        });
    };
    // 重置按钮点击事件
    const ResetAdd = () => {
        setAppAddData((prev: any) => ({
            ...prev,
            staffId: '', // 坐席工号
            staffName: '', // 坐席姓名
            roleId: '', // 角色编码
            roleName: '', // 角色名称
            projectState: '1', // 用户状态1启用0禁用
            crtStaffId: userInfo.staffId || '', // 创建人工号
        }));
    };
    const onAddClick = (dats: boolean) => {
        ResetAdd();
        setModel(dats);
    };
    //角色变更 获取名称呢过
    const handleSelectChange = (value: string, option: any) => {
        const selectName = option?.target?.name || option?.label;
        setAppAddData((prev: any) => ({
            ...AppAddData,
            roleId: value, // 角色编码
            roleName: selectName, // 角色名称
        }));
    };
    const onOkClick = () => {
        if (!AppAddData.staffId) {
            message.warning('工号不能为空');
            return;
        }
        if (!AppAddData.roleId) {
            message.warning('关联角色不能为空');
            return;
        }

        if (!AppAddData.projectState && AppAddData.projectState !== '0') {
            message.warning('状态不能为空');
            return;
        }
        try {
            request
                .post('/appProject/insertAppProjectStaff', {
                    params: {
                        ...AppAddData,
                    },
                })
                .then((res) => {
                    message.success('数据保存成功');
                    ResetAdd();
                    onAddClick(false);
                    queryListFun();
                })
                .catch((err) => {});
        } catch (error) {
            message.error('数据保存失败');
        } finally {
        }
    };
    // 新增、编辑、变更管理员 弹窗中点击确定
    const handleConfirm = (type: string, values: any) => {
        const url = '/appProject/updateAppProjectStaffState';
        const params = {
            ...values,
            staffId: userInfo.staffId, // todo 暂时固定
        };
        request
            .post(url, { params: params })
            .then((res) => {
                message.success(`${type === 'enable' ? '启用成员' : '禁用成员'}成功`);
                setSelectedRowKeys([]);
                setSelectedRows([]);
                queryListFun();
            })
            .catch((err) => {});
    };
    // 1. 核心状态：选中项的key（ID）、分页配置
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
            (state === 'enable' && selectedRows.some((item) => item.projectState === '1')) ||
            (state === 'disable' && selectedRows.some((item) => item.projectState === '0'))
        ) {
            const tipStr = selectedRows
                .filter((item) => (state === 'enable' ? item.projectState === '1' : item.projectState === '0'))
                .map((item) => item.staffId)
                .join();
            message.warning(`【${tipStr}】为【${state === 'enable' ? '已启用' : '已禁用'}】态，请重新选择`);
            setSelectedRowKeys([]);
            setSelectedRows([]);
            return;
        }
        handleConfirm(state, { configIds: selectedRowKeys.join(), projectState: state === 'enable' ? '1' : '0' });
    };
    const [open, setOpen] = useState(false);
    const [adminOptions, setAdminOptions] = useState<OptionItem[]>([]);
    const [selectLoading, setSelectLoading] = useState(false);
    const [selectKey, setSelectKey] = useState(0);
    const [searchText, setSearchText] = useState(''); // 管理员搜索值
    const [staffNames, setstaffName] = useState<any>({});
    const fetchData = (searchText: string) => {
        if (!searchText) {
            setAdminOptions([]);
            return;
        }
        setSelectLoading(true);
        try {
            request
                .post('/appTenant/queryAdminStaffInfo', { params: { phone: searchText } })
                .then((res) => {
                    const adminSatffIdList = res.beans.map((item: any) => {
                        return { label: Object.keys(item)[0], value: Object.keys(item)[0] };
                    });
                    const stateNameobj = Object.assign({}, ...res.beans);
                    setAdminOptions(adminSatffIdList);
                    setSelectKey((pre) => {
                        return pre + 1;
                    }); // 解决setAdminOptions异步导致下拉数据未更新的问题
                    setstaffName(stateNameobj);
                    setSelectLoading(false);
                })
                .catch((err) => {
                    setAdminOptions([]);
                    setSelectLoading(false);
                    setOpen(false);
                     message.warning('工号查询异常');
                });
        } catch (err) {}
    };
    // 防抖处理，避免频繁请求
    // const debouncedSearch = debounce(fetchData, 500);

    const handleSearch = (val: string) => {
        setSearchText(val);
        setOpen(false);
    };
    const handleIconClick = (e: any) => {
        e.stopPropagation();
        if (!searchText) {
            message.warning('请输入手机号');
            return;
        }
        if (!open) {
            setOpen(true);
            // 如果要展开，先加载数据
            fetchData(searchText);
        }
    };
    return (
        <div className={styles.tenantBox}>
            <div
                style={{ position: 'absolute', top: '12px', right: '15px' }}
                className={[styles.searchfloa, styles.searchItem, styles.searchBtnItem].join(' ')}
            >
                <Button style={{ marginRight: '10px' }} className={[styles.searchBtn, styles.searchQuery].join(' ')} onClick={onCancel}>
                    取消
                </Button>
                {formState.isNexButton && !isEdit && (
                    <Button style={{ marginRight: '10px' }} className={styles.searchBtn} onClick={() => formOnclick('stepNum', 1)} type="primary">
                        下一步
                    </Button>
                )}
                {formState.isProButton && !isEdit && (
                    <Button style={{ marginRight: '10px' }} className={styles.searchBtn} onClick={() => formOnclick('stepNum', 0)} type="primary">
                        上一步
                    </Button>
                )}
                {isEdit && !isAddEdit && (
                    <Button style={{ marginRight: '10px' }} className={styles.searchBtn} onClick={() => OnSaveclick()} type="primary">
                        保存项目
                    </Button>
                )}
            </div>
            <div className={styles.tenantSearch}>
                {!isEdit && (
                    <div style={{ margin: 'auto', padding: '30px', maxWidth: '600px' }}>
                        <Steps
                            current={formState.stepNum} // 指定当前激活的步骤
                            size="small" // 尺寸：default/large/small（可选）
                            direction="horizontal" // 方向：horizontal（水平）/vertical（垂直）
                            labelPlacement="vertical" // 关键属性：文字在图标下方
                        >
                            {stepsDte.map((step, index) => (
                                <Step
                                    key={index} // 必须加key，React列表渲染要求
                                    description={step.description}
                                    // 可选：自定义步骤图标（如Icon组件）
                                    icon={null}
                                />
                            ))}
                        </Steps>
                    </div>
                )}

                {formState.isText && (
                    <div style={{ width: '95%', margin: 'auto' }} className={styles.searchCon}>
                        <div className={styles.searchItemAll}>
                            <label>
                                <span style={{ color: 'red' }}>*</span>名称
                            </label>
                            <div className={styles.inputItem}>
                                <Input
                                    placeholder="请输入"
                                    value={formData.projectName}
                                    onChange={(e) =>
                                        setFormData((prev: any) => ({
                                            ...prev,
                                            projectName: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>
                        <div className={styles.searchItemAll}>
                            <label>
                                <span style={{ color: 'red' }}>*</span>编码
                            </label>
                            <div className={styles.inputItem}>
                                <Input
                                    value={formData.projectCode}
                                    onChange={(e) =>
                                        setFormData((prev: any) => ({
                                            ...prev,
                                            projectCode: e.target.value,
                                        }))
                                    }
                                    placeholder="请输入"
                                />
                            </div>
                        </div>
                        <div className={styles.searchItemAll}>
                            <label>
                                <span style={{ color: 'red' }}>*</span>归属租户
                            </label>
                            <div className={styles.inputItem}>
                                <Select
                                    value={formData.tenantCode}
                                    options={TenantLists}
                                    onChange={(value) => setFormData((prev: any) => ({ ...prev, tenantCode: value }))}
                                />
                            </div>
                        </div>
                        <div style={{ lineHeight: '54px' }} className={styles.searchItemAll}>
                            <label>
                                <span style={{ color: 'red' }}>*</span>描述
                            </label>
                            <div className={styles.inputItem}>
                                <TextArea
                                    placeholder="请输入"
                                    value={formData.projectDesc}
                                    onChange={(e) =>
                                        setFormData((prev: any) => ({
                                            ...prev,
                                            projectDesc: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {formState.isListTab && (
                <div className={styles.tenantSearch}>
                    <div className={styles.searchCon}>
                        <div style={{ width: '45%' }} className={styles.searchItem}>
                            <div className={styles.inputItem}>
                                <Input
                                    value={AppData.serachKey}
                                    placeholder="请输入工号、姓名或角色"
                                    onChange={(e) =>
                                        setAppData((prev: any) => ({
                                            ...prev,
                                            serachKey: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>
                        <div className={[styles.searchItem, styles.searchBtnItem].join(' ')}>
                            <Button
                                className={[styles.searchBtn, styles.searchQuery].join(' ')}
                                onClick={() => {
                                    queryListFun();
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
            )}
            {formState.isListTab && (
                <div className={styles.tenantContent}>
                    <div className={styles.tenantTitle}>成员列表</div>
                    <Button
                        className={styles.addBtn}
                        onClick={() => {
                            onAddClick(true);
                        }}
                        type="primary"
                    >
                        +添加成员
                    </Button>
                    <Table
                        rowKey="configId"
                        rowSelection={rowSelection}
                        columns={columns}
                        dataSource={AppDataList}
                        pagination={{
                            current: AppData.page,
                            pageSize: AppData.limit,
                            total: total,
                            showSizeChanger: true,
                            pageSizeOptions: ['5', '10', '20', '50'],
                            showQuickJumper: true,
                            showTotal: (total) => `共 ${total} 条记录`,
                            locale: { items_per_page: '/页' },
                            onChange: handleTableChange,
                        }}
                    />
                    <div className={[styles.leftBottomBox, AppDataList.length ? '' : styles.noDataBottomBox].join(' ')}>
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
                            批量禁用
                        </Button>
                    </div>
                </div>
            )}

            <Modal
                title="新增成员"
                open={isModel}
                mask={true}
                maskClosable={false}
                width={600}
                onOk={() => onOkClick()}
                onCancel={() => onAddClick(false)}
                destroyOnClose={true}
                closable={false}
            >
                <div className={styles.tenantSearch}>
                    <div style={{ width: '70%', margin: 'auto' }} className={styles.searchCon}>
                        <div className={styles.searchItemAll}>
                            <label>
                                手机号
                            </label>
                            <div className={styles.inputItem}>
                                <Select
                                    value={undefined}  // value为undefined时，Select组件会显示placeholder的值
                                    options={adminOptions}
                                    key={selectKey}
                                    open={open}
                                    onChange={(value:string) => {
                                        setAppAddData((prev: any) => ({
                                            ...prev,
                                            staffId: value,
                                            staffName:staffNames[value] ||''
                                        }));
                                        setOpen(false);
                                    }}
                                    onDropdownVisibleChange={() => {}}
                                    // onDropdownVisibleChange={setOpen}
                                    onClick={() => {}} // 阻止点击展开
                                    showSearch
                                    placeholder="请输入手机号码查询业务账号"
                                    loading={selectLoading}
                                    notFoundContent={selectLoading ? '加载中...' : '暂无数据'} // 自定义空状态
                                    onSearch={handleSearch}
                                    // 自定义后缀图标
                                    suffixIcon={
                                        <SearchOutlined
                                            style={{
                                                cursor: 'pointer',
                                                color: '#1890ff',
                                                fontSize: 16,
                                            }}
                                            onClick={handleIconClick}
                                        />
                                    }
                                />
                            </div>
                        </div>
                        {AppAddData.staffId && (<div><div className={styles.searchItemAll}>
                            <label>
                                <span style={{ color: 'red' }}>*</span>姓名
                            </label>
                            <div className={styles.inputItem}>
                                <Input disabled style={{border:'none',background:'#fff',color:'#000'}} value={AppAddData.staffName} />
                            </div>
                        </div>
                        <div className={styles.searchItemAll}>
                            <label>
                                <span style={{ color: 'red' }}>*</span>工号
                            </label>
                            <div className={styles.inputItem}>
                                <Input disabled style={{border:'none',background:'#fff',color:'#000'}} value={AppAddData.staffId} />
                            </div>
                        </div></div>)}
                        <div className={styles.searchItemAll}>
                            <label>
                                <span style={{ color: 'red' }}>*</span>关联角色
                            </label>
                            <div className={styles.inputItem}>
                                <Select value={AppAddData.roleId} options={AppAddList} onChange={handleSelectChange} />
                            </div>
                        </div>
                        <div className={styles.searchItemAll}>
                            <label>
                                <span style={{ color: 'red' }}>*</span>状态
                            </label>
                            <div className={styles.inputItem}>
                                <Radio.Group
                                    value={AppAddData.projectState}
                                    options={[
                                        { value: '1', label: '启用' },
                                        { value: '0', label: '禁用' },
                                    ]}
                                    onChange={(e) =>
                                        setAppAddData((prev: any) => ({
                                            ...prev,
                                            projectState: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AddManagePage;
