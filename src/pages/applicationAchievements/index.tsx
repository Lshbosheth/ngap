import React, { useState, useEffect, useRef } from 'react';

import {
    Table,
    Button,
    Space,
    Select,
    Form,
} from 'antd';
import request from "@/utils/request.ts";
import { trackClk } from '@/utils/commonGdp';
import EvaluationDetailModal from './evaluationDetailsModal';
import { IAchievementsListItem } from './types';
import { publictData } from '@/utils/appMenuData.ts'

interface initialParams {
    [key: string]: any;
}

interface appAccessDetailsProps {
    initialParams?: initialParams
}


interface ISelectItem {
    label: string;
    value: any;
}

const serviceTypeId2ProvId = publictData.serviceTypeId2ProvId;
const provId2provName = publictData.provId2provName;
// 应用成效明细页面
const ApplicationAchievements: React.FC<appAccessDetailsProps> = ({ initialParams }) => {
    const [form] = Form.useForm();
    const [filteredData, setFilteredData] = useState<IAchievementsListItem[]>([]);
    const [total, setTotal] = useState(0);
    // 加载状态
    const [loading, setLoading] = useState<boolean>(false);
    // 分页状态
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);

    const [tenantNameItems, setTenantNameItems] = useState<ISelectItem[]>([{ value: '0000', label: '全部租户' }])
    const tenantCodeMap = useRef<Record<string, string>>({})
    const [projectIdItems, setProjectIdItems] = useState<ISelectItem[]>([{ value: '0000', label: '全部项目' }])
    const [appNameItems, setAppNameItems] = useState<ISelectItem[]>([{ value: '0000', label: '全部应用' }])
    const [detailVisible, setDetailVisible] = useState<boolean>(false);
    const [detailInfo, setDetailInfo] = useState<IAchievementsListItem>();
    const hasInitialQuery = useRef<boolean>(false);
    // const [searchParams, setSearchParams] = useState<any>({});
    // 查询按钮点击事件
    const handleClick = () => {
        setCurrentPage(1);
        getAccessDetailData();
        // 记录插码日志
        trackClk('ApplicationAchievements_query', '查询应用成效明细');
    };
    // 查询区重置按钮点击事件
    const handleResetClick = () => {
        form.setFieldsValue({
            tenantId: (initialParams?.provId && tenantCodeMap.current[initialParams?.provId])  || '',
            appName: "0000",
            project: "0000"
        });
    }
    // 表格分页事件
    const handleTableChange = (page: number, pageSize: number) => {
        trackClk('ApplicationAchievements_tableChange', '查询应用成效明细');
        setCurrentPage(page);
        setPageSize(pageSize);
    }
    // 获取应用评估模块明细列表
    const getAccessDetailData = () => {
        // 进行数据查询
        // 1 是否进行数据校验
        // 2 进行数据查询
        setFilteredData([]);
        setTotal(0);
        setLoading(true);
        const formValues = form.getFieldsValue();
        const selectedTenantId = formValues.tenantId;
        const tenantCode = selectedTenantId  ? tenantCodeMap.current[selectedTenantId] : "";
        const queryParams = {
            page: currentPage,
            limit: pageSize,
            start: (currentPage - 1) * pageSize,
            provCode:  serviceTypeId2ProvId[tenantCode] || "", //租户对应的tenantCode
            projectId: formValues.project === "0000" ? "" : formValues.project || "", //项目projectId
            relationId: formValues.appName === "0000" ? "" : formValues.appName || "", //应用
        }
        request.post('appDashboard/queryEmunList', {params: queryParams})
            .then((res) => {
                setFilteredData(res.beans);
                setTotal(res.bean?.total || 0);
            }
            ).finally(() => {
                setLoading(false);
            })
    }
    // 租户信息
    const fetchTenantItems = () => {
        request.post('/appTenant/queryAppTenantList', {
            start: 0,
            page: 1,
            limit: 50
        })
            .then((res) => {
                const items = (res?.beans || []).map((item: any) => {
                    tenantCodeMap.current[item.configId] = item.tenantCode;
                    tenantCodeMap.current[serviceTypeId2ProvId[item.tenantCode]] = item.configId;
                    tenantCodeMap.current["tenantName" + serviceTypeId2ProvId[item.tenantCode]] = item.tenantName;
                    return { value: item.configId, label: item.tenantName };
                });
                setTenantNameItems([{ value: '', label: '全部租户' }, ...items]);
            })
    }
    // 项目信息（联动租户）
    const fetchProjectItems = () => {
        const currentTenantId = form.getFieldValue('tenantId'); // 租户的configId
        request.post('appDashboard/queryProjectList', {
            params: {
                tenantId: currentTenantId && currentTenantId !== '0000' ? currentTenantId : ""
            }
        })
            .then((res) => {
                if (res && res.beans && res.beans.length) {
                    const items = (res?.beans || []).map((item: any) => ({ value: item.projectId, label: item.projectNm }));
                    setProjectIdItems([{ value: '0000', label: '全部项目' }, ...items]);
                } else {
                    setProjectIdItems([{ value: '0000', label: '全部项目' }]);
                }

            }
            )
    };
    // 应用名称（联动项目）
    const fetchAppNameItems = () => {
        const currentTenantId = form.getFieldValue('tenantId'); // 租户的configId
        const tenantCode = currentTenantId && tenantCodeMap.current[currentTenantId] || "";
        const currentProjectId = form.getFieldValue('project');
        request.post('appDashboard/queryAppEffectModuleList', {
            params: {
                provId: tenantCode && serviceTypeId2ProvId[tenantCode] || "", // 省份
                projectId: currentProjectId && currentProjectId !== '0000' ? currentProjectId : "",
                appStatus: "6,10,11",
            }
        }).then((res) => {
                const items = (res?.beans || []).map((item: any) => ({ label: item.appName, value: item.relationId }));
                setAppNameItems([{ value: '0000', label: '全部应用' }, ...items]);
            })
    };
    // 租户变化 - 联动项目、应用
    const handleTenantChange = () => {
        setProjectIdItems([{ value: '0000', label: '全部项目' }]);
        setAppNameItems([{ value: '0000', label: '全部应用' }]);
        form.setFieldValue('project', '0000');
        form.setFieldValue('appName', '0000');
        fetchProjectItems();
    };
    // 项目变化 - 联动应用
    const handleProjectChange = () => {
        form.setFieldValue('appName', '0000');
        setAppNameItems([{ value: '0000', label: '全部应用' }]);
        fetchAppNameItems();
    };
    // 获取查询条件数据源
    useEffect(() => {
        fetchTenantItems();
    }, []);

    useEffect(() => {
        if (tenantNameItems.length > 1) {
            form.setFieldsValue({
                tenantId: (initialParams?.provId && tenantCodeMap.current[initialParams?.provId])  || '',
            });
            fetchProjectItems();
        }
    }, [tenantNameItems]);

    useEffect(() => {
        if (projectIdItems.length >= 1) {
            form.setFieldsValue({
                project: initialParams?.project || "0000",
                appName:'0000'
            });
            fetchAppNameItems();
        }
    }, [projectIdItems]);

    useEffect(() => {
        if (appNameItems.length > 1 && !hasInitialQuery.current) {
            hasInitialQuery.current = true;
            getAccessDetailData();
        }
    }, [appNameItems]);

    useEffect(() => {
        if (hasInitialQuery.current && filteredData.length > 0) {
            getAccessDetailData();
        }
    }, [currentPage, pageSize]);
    // 详情弹框按钮点击事件
    const handleDetailModeClick = (record: IAchievementsListItem) => {
        setDetailInfo(record);
        setDetailVisible(true);
    }

    // table配置项
    // 表格列配置
    const columns = [
        {
            title: '应用名称',
            dataIndex: 'relationNm',
            key: 'relationNm',
            width: 180,
            fixed: true,
            render: (text: string) => (
                <div
                    title={text}
                    style={{
                        cursor: 'pointer',
                        whiteSpace: 'nowrap', // 防止文本换行
                        overflow: 'hidden', // 隐藏溢出内容
                        textOverflow: 'ellipsis',
                    }}
                >
                    {text}
                </div>
            ),
        },
        {
            title: '租户',
            dataIndex: 'appProvcode',
            key: 'appProvcode',
            render: (text: string) => {
                if(tenantCodeMap.current && tenantCodeMap.current["tenantName" + text]) {
                    return tenantCodeMap.current["tenantName" + text];
                }
                return text ? provId2provName[text] : text;

            }
        },
        {
            title: '项目',
            dataIndex: 'projectNm',
            key: 'projectNm',
            ellipsis: true,
        },
        {
            title: '点赞量',
            dataIndex: 'likeCount',
            key: 'likeCount',

        },
        {
            title: '点赞率',
            dataIndex: 'likeCount',
            key: 'feedRate',
            render: (value: number, record: any) => {
                if (!record.totalCount || record.totalCount === 0) return '-';
                return ((value / record.totalCount) * 100).toFixed(2) + '%';
            }
        },
        {
            title: '点踩量',
            dataIndex: 'disLikeCount',
            key: 'disLikeCount',
        },
        {
            title: '点踩率',
            dataIndex: 'disLikeCount',
            key: 'disLikeRate',
            render: (value: number, record: any) => {
                if (!record.totalCount || record.totalCount === 0) return '-';
                return ((value / record.totalCount) * 100).toFixed(2) + '%';
            }
        },
        {
            title: '操作',
            key: 'action',
            render: (_: string, record: IAchievementsListItem) => (
                <Space size="middle">
                    <span
                        onClick={() => {
                            handleDetailModeClick(record);
                        }}
                        style={{
                            cursor: 'pointer',
                            color: '#0085d0'
                        }}
                    > 查看明细 </span>
                </Space>
            ),
        },
    ];

    return (
        <>
            <div className="appAccessDetailsContainer">
                <div className="app-accesslist-container">
                    <div className="app-accesslist-filter">
                        <Form form={form} layout="horizontal">
                            <div className="filter-categories">
                                {/* 应用名称、描述、归属模块筛选 - 水平布局 */}
                                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <div
                                        className="filter-section"
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            marginBottom: 0,
                                        }}
                                    >
                                        <Form.Item
                                            label="租户"
                                            name="tenantId"
                                            labelCol={{ span: 5 }}
                                            wrapperCol={{ span: 19 }}
                                            style={{
                                                marginBottom: 10,
                                                width: '33%',
                                            }}
                                        >
                                            <Select
                                                placeholder="请选择"
                                                options={tenantNameItems}
                                                showSearch
                                                optionFilterProp="label"
                                                onChange={handleTenantChange}
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            label="项目"
                                            name="project"
                                            labelCol={{ span: 5 }}
                                            wrapperCol={{ span: 19 }}
                                            style={{
                                                marginBottom: 10,
                                                width: '33%',
                                            }}
                                        >
                                            <Select
                                                placeholder="请选择"
                                                defaultValue={initialParams?.project || '0'}
                                                options={projectIdItems}
                                                showSearch
                                                optionFilterProp="label"
                                                onChange={handleProjectChange}
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            label="应用名称"
                                            name="appName"
                                            labelCol={{ span: 5 }}
                                            wrapperCol={{ span: 19 }}
                                            style={{
                                                marginBottom: 10,
                                                width: '33%',
                                            }}
                                        >
                                            <Select
                                                placeholder="请选择"
                                                // mode="combobox"
                                                options={appNameItems}
                                                showSearch
                                                optionFilterProp="label"
                                                allowClear
                                            />
                                        </Form.Item>

                                        {/* 查询和重置按钮 */}

                                        <Form.Item
                                            name=""
                                            wrapperCol={{ span: 24 }}
                                            style={{
                                                marginLeft: 'auto',
                                                marginBottom: 16,
                                                width: '33%',
                                                display: 'flex',
                                                justifyContent: 'flex-end',
                                            }}
                                        >
                                            <Space>
                                                <Button type="primary" onClick={handleClick}>
                                                    查询
                                                </Button>
                                                <Button style={{ marginRight: 15 }} onClick={handleResetClick}>
                                                    重置
                                                </Button>
                                            </Space>
                                        </Form.Item>
                                    </div>
                                </div>
                            </div>
                        </Form>
                    </div>

                    <div className="app-accesslist-table">
                        <Table
                            size="small"
                            columns={columns}
                            dataSource={filteredData}
                            rowKey="appId"
                            pagination={{
                                current: currentPage,
                                pageSize: pageSize,
                                total: total,
                                showSizeChanger: true,      // 显示“每页显示条数”下拉框
                                showQuickJumper: true,      // 显示“快速跳转”输入框
                                pageSizeOptions: ['5', '10', '20', '50'],
                                showTotal: (total) => `共 ${total} 条数据`,
                                locale: { items_per_page: '/页' },
                                onChange: handleTableChange,
                            }}
                            scroll={{ y: 250 }} // 调整表格高度以适应新增的查询表单
                            className="table-container"
                            loading={loading}
                        />
                    </div>
                </div>
            </div>
            <EvaluationDetailModal
                modalVisible={detailVisible}
                setModalVisible={setDetailVisible}
                relationId={detailInfo?.relationId || ""}
                relationNm={detailInfo?.relationNm || ""}
                searchParams={form.getFieldsValue()}
            ></EvaluationDetailModal>
        </>
    )
}
export default ApplicationAchievements;
