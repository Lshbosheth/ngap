import React, { Component, useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import type { GetProp, TableProps } from 'antd';
import { Table, Tooltip, Modal, Button } from 'antd';
import { message } from '@/utils/AntdGlobal';
import { ExclamationCircleTwoTone } from '@ant-design/icons';
import type { SorterResult } from 'antd/es/table/interface';
import BusinessComponentPreview from '../businessComponentPreview';
type ColumnsType<T extends object = object> = TableProps<T>['columns'];
type TablePaginationConfig = Exclude<GetProp<TableProps, 'pagination'>, boolean>;
import { crossApiUserInfo } from '@/stores/crossapiStore';
import { publictData } from '../../../utils/appMenuData';
import { ComponentListSearchData, CommponentBeansItem, BusinessData, SearchListHandle, ComponentTempData } from '../businessComponentMangeTypes';
import { objectToFormData } from '../../../utils/objectToFormData'; // 对象转 FormData 工具函数
import request from '../../../utils/request';
import { menu } from '@/stores/menuStore';
import recodeLog from '../../../utils/operLog';

import '../index.less';

interface IProps {
    formData: ComponentListSearchData;
    BusinessListData: BusinessData[];
    jumpEditorPage: (pos: string, data: ComponentTempData) => void;
}

interface searcTableData {
    provId: string;
    serviceTypeId: string;
    componentName: string;
    componentDesc: string;
    belongModule: string;
    serviceLink: string;
    componentLevel: string;
    componentCategory: string;
    businessId: string;
    dataType: string;
    page: number | undefined; // 当前页码
    start: number | undefined;
    limit: number | undefined;
}
interface TableParams {
    pagination: TablePaginationConfig;
    sortField?: SorterResult<any>['field'];
    sortOrder?: SorterResult<any>['order'];
    filters?: Parameters<GetProp<TableProps, 'onChange'>>[1];
}

const SearchResultModuleList = forwardRef<SearchListHandle, IProps>((props, ref) => {
    // 获取用户信息
    const userInfo = crossApiUserInfo((state) => state.userInfo);
    // 预览方法
    const openPreview: any = menu((state) => state.openPreview);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // 计算表格内容区域的最大高度
    const [tableScrollY, setTableScrollY] = useState(300);
    
    // 动态计算表格高度
    const calculateTableHeight = useCallback(() => {
        // 查找 searchCont 元素
        const searchCont = document.querySelector('.searchCont');
        if (searchCont) {
            const searchContHeight = (searchCont as HTMLElement).offsetHeight;
            // 表格高度 = 父容器高度 - searchCont高度 - 其他padding/margin
            const parentHeight = containerRef.current?.offsetHeight || 0;
            const calculatedHeight = parentHeight - 100; // 100px为其他间距
            setTableScrollY(Math.max(calculatedHeight, 40)); // 最小高度40px
        }
    }, []);
    
    // 初始化和监听变化
    useEffect(() => {
        // 初始计算
        setTimeout(calculateTableHeight, 100);
        
        // 监听窗口大小变化
        const handleResize = () => {
            calculateTableHeight();
        };
        
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [calculateTableHeight]);

    const modalStyles = {
        content: {
            paddingLeft: 0,
            paddingRight: '0px',
            paddingBottom: '0px',
        },
        header: {
            paddingLeft: '8px',
            paddingBottom: '8px',
            borderBottom: '1px solid #d0d6d9',
        },
    };
    const { formData, BusinessListData, jumpEditorPage } = props;
    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
        queryList,
    }));
    const [searchData, setSearchData] = useState<searcTableData>({
        ...formData,
        page: 1, // 当前页码
        start: 1,
        limit: 10,
    });
    const searchDataRef = useRef(searchData);
    const formDataRef = useRef(formData);
    const [businessListData, setBusinessIdData] = useState<BusinessData[]>(BusinessListData);
    const [data, setData] = useState<CommponentBeansItem[]>();
    const [loading, setLoading] = useState(false);
    const [deleteVisible, setDeleteVisible] = useState(false); // 删除二次确认弹窗显隐
    const [activeRecord, setActiveRecord] = useState<any>(); // 操作的数据
    const [tableParams, setTableParams] = useState<TableParams>({
        pagination: {
            current: 1,
            pageSize: 10,
            showSizeChanger: true,  // 强制显示pageSize切换器   列表数据小于50时不展示pageSize切换器的原因是：这是Antd Table组件的默认行为
            pageSizeOptions: ['10', '20', '50', '100'],  // 可选的分页大小
        },
    });
    const [visible, setVisible] = useState(false);
    const [modalContent, setModalContent] = useState<CommponentBeansItem>({
        belongModule: '',
        businessId: '',
        componentCategory: '',
        componentDesc: '',
        componentLevel: '',
        componentName: '',
        componentStatus: '',
        createStaffId: '',
        createTime: '',
        dataType: '',
        id: '',
        provId: '',
        serviceLink: '',
        serviceTypeId: '',
        updateStaffId: '',
        updateTime: '',
        componentPicture: '', //组件缩略图
    });
    const showModal = (record: CommponentBeansItem) => {
        // setModalContent(record);
        // setVisible(true);
        openPreview(record.componentName, record.id, 'ywzj');
    };

    const handleCloseModal = () => {
        setVisible(false);
    };

    const queryList = () => {
        fetchData({
            ...formData,
            start: 0,
            page: 1,
            limit: 10,
        });
    };
    // 监听表单变化
    useEffect(() => {
        searchDataRef.current = {
            ...formData,
            start: 0,
            page: 1,
            limit: 10,
        };
        fetchData(searchDataRef.current);
    }, [formData]);

    const columns: ColumnsType<CommponentBeansItem> = [
        {
            title: '操作',
            key: 'id',
            width: 100,
            render: (record: CommponentBeansItem) => (
                <span>
                    <a
                        href="javascript:;"
                        onClick={() => {
                            handleClick(record);
                        }}
                    >
                        编辑
                    </a>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <a
                        href="javascript:;"
                        style={{ color: '#f65a56' }}
                        onClick={() => {
                            deleteFn(record);
                        }}
                    >
                        删除
                    </a>
                </span>
            ),
        },
        {
            title: '业务组件名称',
            key: 'componentName',
            dataIndex: 'componentName',
            className: 'componentName',
            width: 180,
            render: (_, record: CommponentBeansItem) => {
                return (
                    <Tooltip title={record.componentName} overlay={''}>
                        <div
                            style={{
                                maxWidth: 180,
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                                cursor: 'pointer',
                                color: '#0085d0',
                            }}
                            onClick={() => showModal(record)}
                        >
                            {record.componentName}
                        </div>
                    </Tooltip>
                );
            },
        },
        {
            title: '适用范围',
            key: 'componentLevel',
            width: 100,
            dataIndex: 'componentLevel',
            render: (text: string) => <span>{text === '1' ? '全网通用' : '属地个性'}</span>,
        },
        {
            title: '业务组件类别',
            key: 'componentCategory',
            width: 110,
            dataIndex: 'componentCategory',
            render: (text: string) => <span>{text === '1' ? '生产组件' : '运营组件'}</span>,
        },
        {
            title: '业务分类',
            key: 'businessId',
            width: 120,
            dataIndex: 'businessId',
            render: (text: string) => {
                const businessData = businessListData.filter((item: BusinessData) => item.businessId === text);
                const businessName = businessData[0] && businessData[0]['businessName'] ? businessData[0]['businessName'] : '';
                return <span>{businessName}</span>;
            },
            ellipsis: true,
        },
        // {
        //     title: '服务环节',
        //     key: 'serviceLink',
        //     dataIndex: 'serviceLink',
        //     width: 130,
        // },
        {
            title: '业务组件描述',
            key: 'componentDesc',
            dataIndex: 'componentDesc',
            width: 200,
            render: (text: string) => {
                return (
                    <Tooltip
                        title={text}
                        overlayClassName="overlayStyle"
                        getPopupContainer={() => {
                            const node = document.getElementsByClassName('main')[0] as HTMLElement; //该配置是为了解决气泡不随滚动条移动问题，节点需根据情况设置。如果没有该问题，可不配置。
                            return node;
                        }}
                        overlay={''}
                    >
                        <div
                            style={{
                                maxWidth: 200,
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                                cursor: 'pointer',
                            }}
                        >
                            {text}
                        </div>
                    </Tooltip>
                );
            },
        },
        {
            title: '归属省份',
            key: 'provId',
            dataIndex: 'provId',
            width: 100,
            render: (text: string) => {
                const { provId2provName } = publictData;
                const provText: string = text === '0000' ? '全国' : provId2provName[text];
                return <span>{provText}</span>;
            },
        },
        {
            title: '创建时间',
            key: 'createTime',
            dataIndex: 'createTime',
            width: 160,
        },
        {
            title: '创建人工号',
            key: 'createStaffId',
            dataIndex: 'createStaffId',
            width: 100,
        },
        {
            title: '修改时间',
            key: 'updateTime',
            dataIndex: 'updateTime',
            width: 160,
        },
        {
            title: '修改人工号',
            key: 'updateStaffId',
            dataIndex: 'updateStaffId',
            width: 100,
        },
    ];

    const fetchData = (searchCurrentData: searcTableData) => {
        setLoading(true);
        searchCurrentData.businessId = searchCurrentData.businessId !== '0' ? searchCurrentData.businessId : '';
        request.post('/appComponent/queryAppComponentList2', objectToFormData(searchCurrentData)).then((res) => {
            setData(res.beans ? res.beans : []);
            setLoading(false);
            setTableParams({
                ...tableParams,
                pagination: {
                    ...tableParams.pagination,
                    pageSize: searchCurrentData.limit,
                    current: searchCurrentData.page,
                    total: res.bean.total,
                    showTotal: (total) => `共 ${total} 条记录`,
                },
            });
        });
    };

    const handleTableChange: TableProps<CommponentBeansItem>['onChange'] = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            sortOrder: Array.isArray(sorter) ? undefined : sorter.order,
            sortField: Array.isArray(sorter) ? undefined : sorter.field,
        });

        // 封装查询条件
        const searchListData = {
            ...formData,
            start: pagination.current ? (pagination.pageSize ? pagination.pageSize : 0) * (pagination.current - 1) : 0,
            page: pagination?.current,
            limit: pagination?.pageSize,
        };

        fetchData(searchListData);

        if (pagination.pageSize !== tableParams.pagination?.pageSize) {
            setData([]);
        }
    };
    const handleClick = (record: CommponentBeansItem) => {
        const jumpData: ComponentTempData = {
            provId: record.provId,
            serviceTypeId: record.serviceTypeId,
            staffId: record.updateStaffId ? record.updateStaffId : '',
            componentName: record.componentName, // 模板名称
            componentDesc: record.componentDesc, // 业务组件描述
            businessId: record.businessId, // 业务分类
            belongModule: record.belongModule, //归属模块
            serviceLink: record.serviceLink, // 服务环节
            componentCategory: record.componentCategory, //模板类别
            componentLevel: record.componentLevel, //适用范围
            dataType: '1',
            id: record.id ? record.id : '',
        };
        if (record.componentStatus == '3') {
            message.error('待审核状态不允许编辑,请先审核！');
            return;
        }
        jumpEditorPage('2', jumpData);
    };

    const deleteFn = (record: CommponentBeansItem) => {
        setActiveRecord(record);
        setDeleteVisible(true);
    };

    // 二次确认方法
    const reconfirmFun = () => {
        const record = activeRecord;
        if (record?.id) {
            const queryparams = {
                params: {
                    provId: userInfo.provinceId,
                    serviceTypeId: userInfo.serviceTypeId,
                    staffId: userInfo.staffId,
                    ids: record.id,
                    status: '1', // 操作前状态 1正常
                    componentStatus: '0', // 操作后状态 0:删除，1正常
                },
            };
            request
                .post('/appComponent/updateAppComponentStatus', queryparams)
                .then((result) => {
                    if (result && result.returnCode == '0') {
                        setDeleteVisible(false);
                        message.success('删除成功！');
                        const logParams = {
                            provCode: userInfo.provinceId, // 8位省份编码
                            modelName: '', // 所属模块  暂时为空
                            pageName: '', // 所属菜单   暂时为空
                            dataType: '业务组件', // 数据类型（应用、元素、组件、接口）
                            operType: '删除', // 操作类型（新增/编辑/删除/导入）
                            dataId: record.id, // 操作数据ID
                            dataName: record.componentName, // 操作数据名称
                            editContent: `删除${record.componentName}业务组件`, // 操作内容简述
                            staffId: userInfo.staffId, // 操作人工号
                        };
                        recodeLog(logParams);
                        fetchData({
                            ...formData,
                            start: 0,
                            page: 1,
                            limit: 10,
                        });
                    }
                })
                .catch((err) => {});
        } else {
            console.warn('id 不存在，无法执行删除');
        }
    };

    return (
        <div className="searchResultModuleList" ref={containerRef}>
            <Table<CommponentBeansItem>
                columns={columns}
                size="small"
                rowKey={(record) => record.id}
                dataSource={data}
                pagination={tableParams.pagination}
                loading={loading}
                onChange={handleTableChange}
                {...(tableScrollY < ((tableParams.pagination.pageSize || 10) * 40) ? { scroll: { y: `${tableScrollY}px` } } : {})}
            />
            {/* 弹窗组件 */}
            <Modal
                title={`${modalContent && modalContent.componentName ? modalContent.componentName : ''}详情`}
                open={visible}
                onCancel={handleCloseModal}
                maskClosable={false} // 设置为false，点击遮罩不关闭
                styles={modalStyles}
                footer={null} // 移除默认底部按钮
                width={850}
                destroyOnClose // 关闭时销毁子元素
            >
                <BusinessComponentPreview componentData={modalContent} BusinessListData={BusinessListData} cancelEvent={handleCloseModal} />
            </Modal>
            {/* 二次确认弹窗 */}
            <Modal
                // wrapClassName={styles.modal}
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
                        <div style={{ fontSize: '13px', color: '#666666' }}>请确认是否删除</div>
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
                    <Button type="primary" onClick={() => reconfirmFun()} style={{ marginRight: 17, width: '140px', height: '40px' }}>
                        确定
                    </Button>
                    <Button onClick={() => setDeleteVisible(false)} style={{ width: '140px', height: '40px' }}>
                        取消
                    </Button>
                </div>
            </Modal>
        </div>
    );
});
export default SearchResultModuleList;
