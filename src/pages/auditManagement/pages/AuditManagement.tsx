import React, { useState, useEffect } from 'react';
import './AuditManagement.less';
import { Tabs, Table, Card, Button, Input, Select, DatePicker, Space, Modal, Form } from 'antd';
import { message } from '@/utils/AntdGlobal';
import request from '@/utils/request';
import { crossApiUserInfo } from '@/stores/crossapiStore';
import { objectToFormData } from '@/utils/objectToFormData'; // 对象转 FormData 工具函数
import { publictData } from '@/utils/appMenuData';
import { menu } from '@/stores/menuStore';
import { updateCustomElementMenu } from '../../../config/components';
import { updateComponent } from '../../../packages/index';
import recodeLog from '../../../utils/operLog';
import { businessDataListInfo } from '@/stores/businessCategoryStore';

import type { Dayjs } from 'dayjs';
import { render } from 'less';
const { TabPane } = Tabs;

const { RangePicker } = DatePicker;

const AuditManagement: React.FC = () => {
    const [subTab, setSubTab] = useState('2');
    const [showAppTab, setShowAppTab] = useState(false); // 控制应用标签页显示/隐藏，默认隐藏
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const openPreview = menu((state) => state.openPreview);
    const businessDataList: any = businessDataListInfo((state) => state.businessDataList);

    // 暴露到window对象，以便通过控制台控制
    useEffect(() => {
        // @ts-ignore
        window.setShowAppTab = setShowAppTab;
        // @ts-ignore
        window.getShowAppTab = () => showAppTab;

        return () => {
            // @ts-ignore
            delete window.setShowAppTab;
            // @ts-ignore
            delete window.getShowAppTab;
        };
    }, [showAppTab]);

    // 审核弹窗状态
    const [auditModalVisible, setAuditModalVisible] = useState(false);
    const [currentAuditRecord, setCurrentAuditRecord] = useState<any>(null);
    const [auditForm] = Form.useForm();
    // 应用审核筛选条件状态
    const [appFilter, setAppFilter] = useState({
        appName: '',
        appCategory: '',
        appLevel: '',
        appType: '',
        provId: userInfo.provinceId,
        description: '',
        submitterId: '',
        dateRange: [null, null] as [Dayjs | null, Dayjs | null],
    });

    // 业务组件审核筛选条件状态
    const [componentFilter, setComponentFilter] = useState({
        componentName: '',
        category: '',
        componentLevel: '',
        componentCategory: '',
        provId: userInfo.provinceId,
        description: '',
        submitterId: '',
        dateRange: [null, null] as [Dayjs | null, Dayjs | null],
    });
    // 元素审核筛选条件状态
    const [elementFilter, setElementFilter] = useState({
        elementName: '',
        elementCategory: '',
        scope: '',
        pageLayout: '',
        submitterId: '',
        dateRange: [null, null] as [Dayjs | null, Dayjs | null],
        dataType: '',
    });
    const [appAuditData, setAppAuditData] = useState([]);
    const [componentAuditData, setComponentAuditData] = useState([]);
    // 元素审核数据状态
    const [elementAuditData, setElementAuditData] = useState<any[]>([]);
    const [appTypeOptions, setAppTypeOptions] = useState<{ value: string; label: string }[]>([]);
    // 业务分类选项状态
    const [businessCategoryOptions, setBusinessCategoryOptions] = useState<{ value: string; label: string }[]>([]);
    //元素分类
    const [elementCategoryOptions, setElementCategoryOptions] = useState<{ value: string; label: string }[]>([]);
    const [appLoading, setAppLoading] = useState(false);
    const [componentLoading, setComponentLoading] = useState(false);
    const [elementLoading, setElementLoading] = useState(false);

    // 应用审核分页状态
    const [appCurrentPage, setAppCurrentPage] = useState(1);
    const [appPageSize, setAppPageSize] = useState(10);
    const [appTotal, setAppTotal] = useState(0);

    // 业务组件审核分页状态
    const [componentCurrentPage, setComponentCurrentPage] = useState(1);
    const [componentPageSize, setComponentPageSize] = useState(10);
    const [componentTotal, setComponentTotal] = useState(0);

    // 元素审核分页状态
    const [elementCurrentPage, setElementCurrentPage] = useState(1);
    const [elementPageSize, setElementPageSize] = useState(10);
    const [elementTotal, setElementTotal] = useState(0);
    // 应用审核表格列定义
    const appAuditColumns: any = [
        {
            title: '操作',
            key: 'action',
            algin: 'left',
            fixed: 'left',
            width: 80,
            render: (text: any, record: any, index: any) => (
                <Space size="middle">
                    <a onClick={() => handleAuditClick(record)}>审核</a>
                </Space>
            ),
        },
        {
            title: '应用名称',
            dataIndex: 'dataName',
            key: 'dataName',
            width: 180,

            render: (text: string, record: any) => (
                <div
                    title={text}
                    style={{
                        color: '#0085d0',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap', // 防止文本换行
                        overflow: 'hidden', // 隐藏溢出内容
                        textOverflow: 'ellipsis',
                    }}
                    onClick={() => {
                        // setSelectedAppId(record.id);
                        // setSelectedAppData(record);
                        // setDisplayMode(1);
                        const params = {
                            params: {
                                provId: record.provId,
                                // serviceTypeId: ProvinceIdCon.provIdToServiceTypeIds(itemData.provId),
                                id: record.relationId,
                            },
                        };

                        request.post('/app/queryAppInfo', params).then((res) => {
                            if (res.returnCode == '0') {
                                if (res.bean.sceneType == 'base') {
                                    //  装配式预览
                                    openPreview(record.dataName, record.relationId, 'yy-base');
                                }
                            }
                        });
                    }}
                >
                    {text}
                </div>
            ),
        },
        {
            title: '应用分类',
            dataIndex: 'dataType',
            key: 'dataType',
            render: (text: string, record: any) => (
                <div
                    title={text}
                    style={{
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
            title: '省份',
            dataIndex: 'provId',
            key: 'provId',
            render: (provId: string) => {
                return <div>{provinceOptions.find((item) => item.value == provId)?.label}</div>;
            },
        },
        {
            title: '应用描述',
            dataIndex: 'dataDesc',
            key: 'dataDesc',
        },
        {
            title: '审核人工号',
            dataIndex: 'createStaffId',
            key: 'createStaffId',
        },
        {
            title: '提交时间',
            dataIndex: 'createTime',
            key: 'createTime',
            sorter: (a: any, b: any) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime(),
        },
    ];

    // 业务组件审核表格列定义
    const componentAuditColumns = [
        {
            title: '操作',
            key: 'action',
            width: 80,

            render: (ext: any, record: any, index: any) => (
                <Space size="middle">
                    <a onClick={() => handleAuditClick(record)}>审核</a>
                </Space>
            ),
        },
        {
            title: '业务组件名称',
            dataIndex: 'dataName',
            key: 'dataName',
            width: 180,

            render: (text: string, record: any) => (
                <div
                    title={text}
                    style={{
                        color: '#0085d0',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap', // 防止文本换行
                        overflow: 'hidden', // 隐藏溢出内容
                        textOverflow: 'ellipsis',
                    }}
                    onClick={() => {
                        const params = {
                            params: {
                                // provId: record.provId,
                                // serviceTypeId: ProvinceIdCon.provIdToServiceTypeIds(itemData.provId),
                                id: record.relationId,
                            },
                        };

                        request.post('/appComponent/queryAppComponentInfo', params).then((res) => {
                            if (res.returnCode == '0') {
                                openPreview(record.dataName, record.relationId, 'ywzj');
                            }
                        });
                    }}
                >
                    {text}
                </div>
            ),
        },
        {
            title: '业务分类',
            dataIndex: 'dataType',
            key: 'dataType',
            render: (text: string, record: any) => (
                <div
                    title={text}
                    style={{
                        whiteSpace: 'nowrap', // 防止文本换行
                        overflow: 'hidden', // 隐藏溢出内容
                        textOverflow: 'ellipsis',
                    }}
                >
                    {businessDataList.find((item: any) => item.businessId == text)?.businessName}
                </div>
            ),
        },
        {
            title: '省份',
            dataIndex: 'provId',
            key: 'provId',
            render: (provId: string) => {
                return <div>{provinceOptions.find((item) => item.value == provId)?.label}</div>;
            },
        },
        {
            title: '业务组件描述',
            dataIndex: 'dataDesc',
            key: 'dataDesc',
        },
        {
            title: '审核人工号',
            dataIndex: 'createStaffId',
            key: 'createStaffId',
        },
        {
            title: '提交时间',
            dataIndex: 'createTime',
            key: 'createTime',
            sorter: (a: any, b: any) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime(),
        },
    ];
    // 元素审核表格列定义
    const elementAuditColumns = [
        {
            title: '操作',
            key: 'action',
            width: 80,

            render: (text: any, record: any) => (
                <Space size="middle">
                    <a onClick={() => handleAuditClick(record)}>审核</a>
                </Space>
            ),
        },
        {
            title: '审核类型',
            dataIndex: 'dataType',
            key: 'dataType',
            render: (text: string, record: any) => {
                return <div>{text == '1' ? '元素发布' : text == '2' ? '元素下线' : '回滚版本'}</div>;
            },
        },
        {
            title: '元素名称',
            dataIndex: 'dataName',
            key: 'dataName',
            render: (text: string) => (
                <div
                    title={text}
                    style={{
                        color: '#0085d0',
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
            title: '元素分类',
            dataIndex: 'dataDesc',
            key: 'elementCategory',
            render: (text: string, record: any) => {
                return <div>{text ? text.split(',')?.[1] : ''}</div>;
            },
        },
        {
            title: '省份',
            dataIndex: 'dataDesc',
            key: 'province',
            render: (text: string, record: any) => {
                return <div>{text ? text.split(',')?.[0] : ''}</div>;
            },
        },
        {
            title: '页面布局',
            dataIndex: 'dataDesc',
            key: 'pageLayout',
            render: (text: string, record: any) => {
                return <div>{text ? text.split(',')?.[2] : ''}</div>;
            },
        },
        {
            title: '当前版本号',
            dataIndex: 'currentVersion',
            key: 'currentVersion',
        },
        {
            title: '提交人工号',
            dataIndex: 'createStaffId',
            key: 'createStaffId',
        },
        {
            title: '提交时间',
            dataIndex: 'createTime',
            key: 'createTime',
            sorter: (a: any, b: any) => new Date(a.submitTime).getTime() - new Date(b.submitTime).getTime(),
        },
    ];
    // 应用审核查询函数
    const handleAppSearch = () => {
        setAppLoading(true);
        // 将日期范围拆分为开始时间和结束时间
        const { dateRange, ...otherFilters } = appFilter;
        const params = {
            // ...otherFilters,
            updateStartTime: dateRange?.[0]?.format('YYYY-MM-DD HH:mm:ss') || '',
            updateEndTime: dateRange?.[1]?.format('YYYY-MM-DD HH:mm:ss') || '',
            dataSource: '1',
            auditStatus: '0',
            // provId: "00030027",
            provId: appFilter.provId,
            dataName: appFilter.appName,
            dataType: appFilter.appType,
            appCategory: appFilter.appCategory,

            appLevel: appFilter.appLevel,

            dataDesc: appFilter.description,
            auditStaffId: appFilter.submitterId,
            page: appCurrentPage,
            limit: appPageSize,
        };
        // console.log('应用审核查询参数:', params);
        request
            .post('/solutionAudit/querySolutionAudit', objectToFormData(params))
            .then((res) => {
                setAppLoading(false);
                if (res.returnCode == '0') {
                    setAppAuditData(res.beans);
                    setAppTotal(res.bean.total || 0);
                }
            })
            .catch((err) => {
                setAppLoading(false);

                setAppAuditData([]);
            });
    };

    // 业务组件审核查询函数
    const handleComponentSearch = () => {
        setComponentLoading(true);
        // 将日期范围拆分为开始时间和结束时间
        const { dateRange, ...otherFilters } = componentFilter;
        const params = {
            // ...otherFilters,
            updateStartTime: dateRange?.[0]?.format('YYYY-MM-DD HH:mm:ss') || '',
            updateEndTime: dateRange?.[1]?.format('YYYY-MM-DD HH:mm:ss') || '',
            dataSource: '2',
            auditStatus: '0',
            // provId: "00030027",
            provId: componentFilter.provId,
            dataName: componentFilter.componentName,
            dataType: componentFilter.category,
            componentCategory: componentFilter.componentCategory,

            componentLevel: componentFilter.componentLevel,

            dataDesc: componentFilter.description,
            auditStaffId: componentFilter.submitterId,
            page: componentCurrentPage,

            limit: componentPageSize,
        };
        // console.log('业务组件审核查询参数:', params);
        request
            .post('/solutionAudit/querySolutionAudit', objectToFormData(params))
            .then((res) => {
                setComponentLoading(false);
                if (res.returnCode == '0') {
                    setComponentAuditData(res.beans);
                    setComponentTotal(res.bean.total || 0);
                }
            })
            .catch((err) => {
                setComponentLoading(false);

                setComponentAuditData([]);
            });
    };
    // 元素审核查询函数
    const handleElementSearch = () => {
        setElementLoading(true);
        // 将日期范围拆分为开始时间和结束时间
        const { dateRange, ...otherFilters } = elementFilter;
        const params = {
            ...otherFilters,
            updateStartTime: dateRange?.[0]?.format('YYYY-MM-DD HH:mm:ss') || '',
            updateEndTime: dateRange?.[1]?.format('YYYY-MM-DD HH:mm:ss') || '',
            dataSource: '3',
            auditStatus: '0',
            dataName: elementFilter.elementName,
            provId: elementFilter.scope,
            auditStaffId: elementFilter.submitterId,
            elementPageType: elementFilter.pageLayout,
            dataType: elementFilter.dataType,

            page: elementCurrentPage,

            limit: elementPageSize,
        };
        // console.log('元素审核查询参数:', params);
        request
            .post('/solutionAudit/querySolutionAudit', objectToFormData(params))
            .then((res) => {
                setElementLoading(false);
                if (res.returnCode == '0') {
                    setElementAuditData(res.beans);
                    setElementTotal(res.bean.total || 0);
                }
            })
            .catch((err) => {
                setElementLoading(false);

                setElementAuditData([]);
            });
    };

    // 处理应用审核表格分页变化
    const handleAppTableChange = (page: number, pageSize: number) => {
        setAppCurrentPage(page);
        setAppPageSize(pageSize);
        handleAppSearch();
    };

    // 处理业务组件审核表格分页变化
    const handleComponentTableChange = (page: number, pageSize: number) => {
        setComponentCurrentPage(page);
        setComponentPageSize(pageSize);
        handleComponentSearch();
    };
    // 处理元素审核表格分页变化
    const handleElementTableChange = (page: number, pageSize: number) => {
        setElementCurrentPage(page);
        setElementPageSize(pageSize);
        handleElementSearch();
    };
    const fetchAppTypeOptions = () => {
        request
            .post('/appType/queryAppTypeList', {})
            .then((res) => {
                const arr = res.beans.filter((item: any) => item.typeLevel == '3');
                arr.unshift({
                    appTypeName: '全部',
                    appTypeId: '',
                });
                const typeList = arr.map((item: any) => ({
                    label: item.appTypeName,
                    value: item.appTypeId,
                }));

                setAppTypeOptions(typeList);
            })
            .catch((err) => {
                setAppTypeOptions([]);
            });
    };
    // 获取业务分类选项
    const fetchBusinessCategoryOptions = () => {
        request
            .post('/appComponentBusiness/queryComponentBusinessList', {})
            .then((res) => {
                const arr = res.beans;
                arr.unshift({
                    businessName: '全部',
                    businessId: '',
                });
                const typeList = arr.map((item: any) => ({
                    label: item.businessName,
                    value: item.businessId,
                }));

                setBusinessCategoryOptions(typeList);
            })
            .catch((err) => {
                setBusinessCategoryOptions([]);
            });
        // fetch("/api/business-categories")
        //   .then((response) => response.json())
        //   .then((data) => {
        //     setBusinessCategoryOptions(data.list || []);
        //   })
        //   .catch((error) => {
        //     console.error("获取业务分类选项失败:", error);
        //     message.error("获取业务分类选项失败");
        //   });
    };
    // 元素分类查询
    const queryElementTypeFun = () => {
        request
            .post('/element/queryElementTypeList', {
                params: {},
            })
            .then((res) => {
                const arr = res.beans;
                arr.unshift({
                    elementTypeName: '全部',
                    elementTypeId: '',
                });
                const typeList = arr.map((item: any) => ({
                    label: item.elementTypeName,
                    value: item.elementTypeId,
                }));
                setElementCategoryOptions(typeList);
            })
            .catch((err) => {
                setElementCategoryOptions([]);
            });
    };
    // 首次进入页面自动查询

    useEffect(() => {
        // setAppFilter({ ...appFilter, provId: userInfo.provinceId });
        // setComponentFilter({ ...componentFilter, provId: userInfo.provinceId });
        fetchAppTypeOptions();
        fetchBusinessCategoryOptions();
        if (showAppTab) {
            handleAppSearch();
        }
        queryElementTypeFun();
        handleComponentSearch();
        handleElementSearch();

        // 控制台提示信息
        console.log('%c=== 审核管理页面 ===', 'color: #0085d0; font-size: 14px; font-weight: bold;');
        console.log('%c可以通过控制台控制应用标签页的显示/隐藏:', 'color: #0085d0;');
        console.log('%c  显示应用标签页: setShowAppTab(true)', 'color: green;');
        console.log('%c  隐藏应用标签页: setShowAppTab(false)', 'color: red;');
        console.log('%c  查看当前状态: getShowAppTab()', 'color: orange;');
    }, [showAppTab]);
    // useEffect(() => {

    // }, [appFilter.provId]);
    // 应用审核下拉选项数组
    const appCategoryOptions = [
        { value: '', label: '请选择' },
        { value: '1', label: '生产应用' },
        { value: '2', label: '运营应用' },
    ];

    const appLevelOptions = [
        { value: '', label: '请选择' },
        { value: '1', label: '中心一级' },
        { value: '2', label: '分中心二级' },
    ];

    const shareProvData = [{ label: '全网', value: '0000', id: '0000' }];
    const provinceOptions = shareProvData.concat(publictData.provinceSelectValue);

    const scopeOptions = [
        { value: '', label: '请选择' },
        { value: '1', label: '全网通用' },
        { value: '2', label: '属地个性' },
    ];
    const elementScopeOptions = [
        { value: '', label: '请选择' },
        { value: '0000', label: '全网' },
        { value: userInfo.provinceId, label: '当前租户' },
    ];
    const pageLayoutOptions = [
        { value: '', label: '请选择' },
        { value: '1', label: '标准页面元素' },
        { value: '2', label: '大屏页面元素' },
    ];
    const auditTypeOptions = [
        { value: '', label: '请选择' },
        { value: '1', label: '元素发布' },
        { value: '2', label: '元素下线' },
        { value: '3', label: '回滚版本' },
    ];

    const componentCategoryOption = [
        { value: '', label: '请选择' },
        { value: '1', label: '生产组件' },
        { value: '2', label: '运营组件' },
    ];
    // 处理审核按钮点击
    const handleAuditClick = (record: any) => {
        setCurrentAuditRecord(record);
        auditForm.resetFields();
        setAuditModalVisible(true);
    };
    // 处理审核表单提交
    const handleAuditSubmit = () => {
        auditForm
            .validateFields()
            .then((values) => {
                const params: any = {
                    params: {
                        ids: currentAuditRecord.id,
                        auditResult: values.auditResult,
                        auditIdea: values.auditComment,
                        auditType: '1', // 1手动  2自动
                        auditStaffId: userInfo.staffId,
                        relationIds: currentAuditRecord.relationId, // 关联ID
                        dataSource: currentAuditRecord.dataSource || '', // 审核来源类型}
                    },
                };

                request
                    .post('/solutionAudit/updateSolutionAudit', params)
                    .then((res) => {
                        if (res.returnCode == '0') {
                            message.success('审核完成');
                            setAuditModalVisible(false);
                            // 根据当前标签页刷新对应列表数据
                            if (subTab === '1') {
                                handleAppSearch();
                            } else if (subTab === '2') {
                                handleComponentSearch();
                            } else if (subTab === '3') {
                                handleElementSearch();
                                if (values.auditResult == '1') {
                                    updateCustomElementMenu(currentAuditRecord.relationId); // 更新画布中全局自定义元素菜单
                                    updateComponent(currentAuditRecord.relationId); // 更新画布中全局自定义元素
                                }
                            }
                            const logParams = {
                                provCode: userInfo.provinceId, // 8位省份编码
                                modelName: '', // 所属模块  暂时为空
                                pageName: '', // 所属菜单   暂时为空
                                dataType:
                                    currentAuditRecord.dataSource === '1' ? '应用' : currentAuditRecord.dataSource === '2' ? '业务组件' : '元素', // 数据类型（应用、元素、组件、接口）
                                operType: '审核', // 操作类型（新增/编辑/删除/导入）
                                dataId: currentAuditRecord.id, // 操作数据ID
                                dataName: currentAuditRecord.dataName, // 操作数据名称
                                editContent: `审核${
                                    currentAuditRecord.dataName +
                                    (currentAuditRecord.dataSource === '1' ? '应用' : currentAuditRecord.dataSource === '2' ? '业务组件' : '元素')
                                }`, // 操作内容简述
                                staffId: userInfo.staffId, // 操作人工号
                            };
                            recodeLog(logParams);
                        }
                    })
                    .catch((err) => {});
            })
            .catch((info) => {
                console.log('表单验证失败:', info);
            });
    };

    // 处理审核弹窗关闭
    const handleAuditModalClose = () => {
        setAuditModalVisible(false);
        auditForm.resetFields();
    };
    return (
        <div>
            <Tabs activeKey={subTab} onChange={setSubTab} className="content-layout">
                {showAppTab && <TabPane tab="应用" key="1">
                    <div className="">
                        <div className="filter-bar">
                            {/* 第一行筛选条件 */}
                            <div className="filter-row">
                                <div className="filter-item">
                                    <label className="label-app">应用名称</label>
                                    <Input
                                        placeholder="请输入应用名称"
                                        allowClear
                                        className="filter-input"
                                        value={appFilter.appName}
                                        onChange={(e) =>
                                            setAppFilter((prev) => ({
                                                ...prev,
                                                appName: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div className="filter-item">
                                    <label className="label-app">应用分类</label>
                                    <Select
                                        placeholder="请选择应用类别"
                                        allowClear
                                        className="filter-input"
                                        value={appFilter.appType}
                                        onChange={(value) => setAppFilter((prev) => ({ ...prev, appType: value }))}
                                        options={appTypeOptions}
                                    />
                                </div>
                                <div className="filter-item">
                                    <label className="label-app">应用级别</label>
                                    <Select
                                        placeholder="请选择应用级别"
                                        allowClear
                                        className="filter-input"
                                        value={appFilter.appLevel}
                                        onChange={(value) => setAppFilter((prev) => ({ ...prev, appLevel: value }))}
                                        options={appLevelOptions}
                                    />
                                </div>
                            </div>

                            {/* 第二行筛选条件 */}
                            <div className="filter-row">
                                <div className="filter-item">
                                    <label className="label-app">应用类别</label>
                                    <Select
                                        placeholder="请选择应用分类"
                                        allowClear
                                        className="filter-input"
                                        value={appFilter.appCategory}
                                        onChange={(value) => setAppFilter((prev) => ({ ...prev, appCategory: value }))}
                                        options={appCategoryOptions}
                                    />
                                </div>
                                <div className="filter-item">
                                    <label className="label-app">省份</label>
                                    <Select
                                        placeholder="请选择省份"
                                        allowClear
                                        disabled
                                        className="filter-input"
                                        value={appFilter.provId}
                                        options={provinceOptions}
                                    />
                                </div>
                                <div className="filter-item">
                                    <label className="label-app">应用描述</label>
                                    <Input
                                        placeholder="请输入应用描述"
                                        allowClear
                                        className="filter-input"
                                        value={appFilter.description}
                                        onChange={(e) =>
                                            setAppFilter((prev) => ({
                                                ...prev,
                                                description: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            </div>

                            {/* 第三行筛选条件 */}
                            <div className="filter-row">
                                <div className="filter-item">
                                    <label className="label-app">提交人工号</label>
                                    <Input
                                        placeholder="请输入提交人工号"
                                        allowClear
                                        className="filter-input"
                                        value={appFilter.submitterId}
                                        onChange={(e) =>
                                            setAppFilter((prev) => ({
                                                ...prev,
                                                submitterId: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <div className="filter-item">
                                    <label className="label-app">提交时间</label>
                                    <RangePicker
                                        placeholder={['开始时间', '结束时间']}
                                        allowClear
                                        format="YYYY-MM-DD HH:mm:ss"
                                        showTime={{ format: 'HH:mm:ss' }}
                                        className="filter-input"
                                        value={appFilter.dateRange}
                                        onChange={(dates) =>
                                            setAppFilter((prev) => ({
                                                ...prev,
                                                dateRange: dates as [Dayjs | null, Dayjs | null],
                                            }))
                                        }
                                    />
                                </div>
                                <div className="filter-item">
                                    {/* 操作按钮 */}
                                    <label className="label-app"></label>

                                    <div className="action-buttons filter-input">
                                        <Button type="primary" size="middle" onClick={handleAppSearch}>
                                            查询
                                        </Button>
                                        <Button
                                            size="middle"
                                            type="primary"
                                            ghost
                                            onClick={() => {
                                                setAppFilter({
                                                    appName: '',
                                                    appCategory: '',
                                                    appLevel: '',
                                                    appType: '',
                                                    provId: userInfo.provinceId,
                                                    description: '',
                                                    submitterId: '',
                                                    dateRange: [null, null] as [Dayjs | null, Dayjs | null],
                                                });
                                            }}
                                        >
                                            重置
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="result-title">查询结果</div>
                        <Table
                            columns={appAuditColumns}
                            dataSource={appAuditData}
                            size="small"
                            pagination={{
                                current: appCurrentPage,
                                pageSize: appPageSize,
                                total: appTotal,
                                showSizeChanger: true,
                                pageSizeOptions: ['5', '10', '20', '50'],
                                showQuickJumper: true,
                                showTotal: (total: any) => `共 ${total} 条记录`,
                                locale: { items_per_page: '/页' },
                                onChange: handleAppTableChange,
                            }}
                            scroll={{ y: 300 }}
                            className="table-container"
                            loading={appLoading}
                        />
                    </div>
                 </TabPane>}
                <TabPane tab="业务组件" key="2">
                    <div className="">
                        <div className="filter-bar">
                            {/* 第一行筛选条件 */}
                            <div className="filter-row">
                                <div className="filter-item">
                                    <label className="label-component">业务组件名称</label>
                                    <Input
                                        placeholder="请输入业务组件名称"
                                        allowClear
                                        className="filter-input"
                                        value={componentFilter.componentName}
                                        onChange={(e) =>
                                            setComponentFilter((prev) => ({
                                                ...prev,
                                                componentName: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <div className="filter-item">
                                    <label className="label-component">业务分类</label>
                                    <Select
                                        placeholder="请选择业务分类"
                                        allowClear
                                        className="filter-input"
                                        value={componentFilter.category}
                                        onChange={(value: any) =>
                                            setComponentFilter((prev) => ({
                                                ...prev,
                                                category: value,
                                            }))
                                        }
                                        options={businessCategoryOptions}
                                    />
                                </div>
                                <div className="filter-item">
                                    <label className="label-component">适用范围</label>
                                    <Select
                                        placeholder="请选择适用范围"
                                        allowClear
                                        className="filter-input"
                                        value={componentFilter.componentLevel}
                                        onChange={(value: any) =>
                                            setComponentFilter((prev) => ({
                                                ...prev,
                                                componentLevel: value,
                                            }))
                                        }
                                        options={scopeOptions}
                                    />
                                </div>
                            </div>

                            {/* 第二行筛选条件 */}
                            <div className="filter-row">
                                <div className="filter-item">
                                    <label className="label-component">业务组件类别</label>
                                    <Select
                                        placeholder="请选择组件类型"
                                        allowClear
                                        className="filter-input"
                                        value={componentFilter.componentCategory}
                                        onChange={(value: any) =>
                                            setComponentFilter((prev) => ({
                                                ...prev,
                                                componentCategory: value,
                                            }))
                                        }
                                        options={componentCategoryOption}
                                    />
                                </div>
                                <div className="filter-item">
                                    <label className="label-component">省份</label>
                                    <Select
                                        placeholder="请选择省份"
                                        allowClear
                                        className="filter-input"
                                        value={componentFilter.provId}
                                        disabled
                                        options={provinceOptions}
                                    />
                                </div>
                                <div className="filter-item">
                                    <label className="label-component">业务组件描述</label>
                                    <Input
                                        placeholder="请输入业务组件描述"
                                        allowClear
                                        className="filter-input"
                                        value={componentFilter.description}
                                        onChange={(e) =>
                                            setComponentFilter((prev) => ({
                                                ...prev,
                                                description: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            </div>

                            {/* 第三行筛选条件 */}
                            <div className="filter-row">
                                <div className="filter-item">
                                    <label className="label-component">提交人工号</label>
                                    <Input
                                        placeholder="请输入提交人工号"
                                        allowClear
                                        className="filter-input"
                                        value={componentFilter.submitterId}
                                        onChange={(e) =>
                                            setComponentFilter((prev) => ({
                                                ...prev,
                                                submitterId: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <div className="filter-item">
                                    <label className="label-component">提交时间</label>
                                    <RangePicker
                                        placeholder={['开始时间', '结束时间']}
                                        allowClear
                                        format="YYYY-MM-DD HH:mm:ss"
                                        showTime={{ format: 'HH:mm:ss' }}
                                        className="filter-input"
                                        value={componentFilter.dateRange}
                                        onChange={(dates) =>
                                            setComponentFilter((prev) => ({
                                                ...prev,
                                                dateRange: dates as [Dayjs | null, Dayjs | null],
                                            }))
                                        }
                                    />
                                </div>
                                <div className="filter-item">
                                    <label className="label-component "></label>

                                    {/* 操作按钮 */}
                                    <div className="action-buttons filter-input">
                                        <Button type="primary" size="middle" onClick={handleComponentSearch}>
                                            查询
                                        </Button>
                                        <Button
                                            size="middle"
                                            type="primary"
                                            ghost
                                            onClick={() => {
                                                setComponentFilter({
                                                    componentName: '',
                                                    category: '',
                                                    componentLevel: '',
                                                    componentCategory: '',
                                                    provId: userInfo.provinceId,
                                                    description: '',
                                                    submitterId: '',
                                                    dateRange: [null, null] as [Dayjs | null, Dayjs | null],
                                                });
                                            }}
                                        >
                                            重置
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="result-title">查询结果</div>
                        <Table
                            columns={componentAuditColumns}
                            dataSource={componentAuditData}
                            size="small"
                            pagination={{
                                current: componentCurrentPage,
                                pageSize: componentPageSize,
                                total: componentTotal,
                                showSizeChanger: true,
                                pageSizeOptions: ['5', '10', '20', '50'],
                                showQuickJumper: true,
                                showTotal: (total: any) => `共 ${total} 条记录`,
                                locale: { items_per_page: '/页' },
                                onChange: handleComponentTableChange,
                            }}
                            scroll={{ y: 300 }}
                            loading={componentLoading}
                            className="table-container"
                        />
                    </div>
                </TabPane>
                {/* 元素审核tab页 */}
                <TabPane tab="元素审核" key="3">
                    <div className="">
                        <div className="filter-bar">
                            {/* 第一行筛选条件 */}
                            <div className="filter-row">
                                <div className="filter-item">
                                    <label className="label-component">元素名称</label>
                                    <Input
                                        placeholder="请输入元素名称"
                                        allowClear
                                        className="filter-input"
                                        value={elementFilter.elementName}
                                        onChange={(e) => setElementFilter((prev) => ({ ...prev, elementName: e.target.value }))}
                                    />
                                </div>
                                <div className="filter-item">
                                    <label className="label-component">元素分类</label>
                                    <Select
                                        placeholder="请选择元素分类"
                                        allowClear
                                        className="filter-input"
                                        value={elementFilter.elementCategory}
                                        onChange={(value, option) =>
                                            setElementFilter((prev) => ({ ...prev, elementCategory: value ? (option as any)?.label : '' }))
                                        }
                                        options={elementCategoryOptions}
                                    />
                                </div>
                                <div className="filter-item">
                                    <label className="label-component">归属范围</label>
                                    <Select
                                        placeholder="请选择归属范围"
                                        allowClear
                                        className="filter-input"
                                        value={elementFilter.scope}
                                        onChange={(value) => setElementFilter((prev) => ({ ...prev, scope: value }))}
                                        options={elementScopeOptions}
                                    />
                                </div>
                            </div>

                            {/* 第二行筛选条件 */}
                            <div className="filter-row">
                                <div className="filter-item">
                                    <label className="label-component">页面布局</label>
                                    <Select
                                        placeholder="请选择页面布局"
                                        allowClear
                                        className="filter-input"
                                        value={elementFilter.pageLayout}
                                        onChange={(value, option) =>
                                            setElementFilter((prev) => ({ ...prev, pageLayout: value ? (option as any)?.label : '' }))
                                        }
                                        options={pageLayoutOptions}
                                    />
                                </div>
                                <div className="filter-item">
                                    <label className="label-component">提交人工号</label>
                                    <Input
                                        placeholder="请输入提交人工号"
                                        allowClear
                                        className="filter-input"
                                        value={elementFilter.submitterId}
                                        onChange={(e) => setElementFilter((prev) => ({ ...prev, submitterId: e.target.value }))}
                                    />
                                </div>
                                <div className="filter-item">
                                    <label className="label-component label-top">提交时间</label>
                                    <RangePicker
                                        placeholder={['开始时间', '结束时间']}
                                        allowClear
                                        format="YYYY-MM-DD HH:mm:ss"
                                        showTime={{ format: 'HH:mm:ss' }}
                                        className="filter-input"
                                        value={elementFilter.dateRange}
                                        onChange={(dates) =>
                                            setElementFilter((prev) => ({ ...prev, dateRange: dates as [Dayjs | null, Dayjs | null] }))
                                        }
                                    />
                                </div>
                            </div>

                            {/* 第三行筛选条件 */}
                            <div className="filter-row">
                                <div className="filter-item">
                                    <label className="label-component">审核类型</label>
                                    <Select
                                        placeholder="请选择审核类型"
                                        allowClear
                                        className="filter-input"
                                        value={elementFilter.dataType}
                                        onChange={(value) => setElementFilter((prev) => ({ ...prev, dataType: value }))}
                                        options={auditTypeOptions}
                                    />
                                </div>
                                <div className="filter-item" style={{ height: '20px' }}>
                                    <label className="label-app"></label>
                                    <div className="action-buttons filter-input"></div>
                                </div>
                                <div className="filter-item">
                                    <label className="label-app"></label>

                                    <div className="action-buttons filter-input">
                                        <Button type="primary" size="middle" onClick={handleElementSearch}>
                                            查询
                                        </Button>
                                        <Button
                                            size="middle"
                                            onClick={() => {
                                                setElementFilter({
                                                    elementName: '',
                                                    elementCategory: '',
                                                    scope: '',
                                                    pageLayout: '',
                                                    submitterId: '',
                                                    dateRange: [null, null] as [Dayjs | null, Dayjs | null],
                                                    dataType: '',
                                                });
                                            }}
                                        >
                                            重置
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="result-title">查询结果</div>
                        <Table
                            columns={elementAuditColumns}
                            dataSource={elementAuditData}
                            pagination={{
                                current: elementCurrentPage,
                                pageSize: elementPageSize,
                                total: elementTotal,
                                showSizeChanger: true,
                                pageSizeOptions: ['5', '10', '20', '50'],
                                showQuickJumper: true,
                                showTotal: (total) => `共 ${total} 条记录`,
                                locale: { items_per_page: '/页' },
                                onChange: handleElementTableChange,
                            }}
                            className="table-container"
                            loading={elementLoading}
                            scroll={{ y: 300 }}
                        />
                    </div>
                </TabPane>
            </Tabs>
            {/* 审核弹窗 */}
            <Modal
                title="审核"
                open={auditModalVisible}
                onOk={handleAuditSubmit}
                onCancel={handleAuditModalClose}
                okText="提交"
                cancelText="取消"
                width={500}
                destroyOnClose={true}
            >
                <Form form={auditForm} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                    <Form.Item name="auditResult" label="审核结果" rules={[{ required: true, message: '请选择审核结果' }]}>
                        <Select placeholder="请选择审核结果">
                            <Select.Option value="1">审核通过</Select.Option>
                            <Select.Option value="2">审核不通过</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="auditComment" label="审核意见" rules={[]}>
                        <Input.TextArea placeholder="请填写审核意见" rows={4} showCount />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AuditManagement;
