import React, { useState, useEffect } from 'react';
import type { Dayjs } from 'dayjs';
import { Tabs, Table, Card, Button, Input, Select, DatePicker, Space, Modal, Form } from 'antd';
import { message } from '@/utils/AntdGlobal';
import request from '@/utils/request';
import { crossApiUserInfo } from '@/stores/crossapiStore';

import { objectToFormData } from '@/utils/objectToFormData'; // 对象转 FormData 工具函数
import { publictData } from '@/utils/appMenuData';
import './AuditRecord.less';
import { menu } from '@/stores/menuStore';

const { RangePicker } = DatePicker;
// 省份下拉选项
const shareProvData = [{ label: '全网', value: '0000', id: '0000' }];
const provinceOptions = shareProvData.concat(publictData.provinceSelectValue);

const AuditRecord: React.FC = () => {
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const openPreview = menu((state) => state.openPreview);

    // 审核记录数据状态
    const [auditRecordData, setAuditRecordData] = useState([]);
    // 审核记录表格列定义
    const auditRecordColumns = [
        {
            title: '名称',
            dataIndex: 'dataName',
            key: 'dataName',
            render: (text: string, record: any) => (
                <div
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
            title: '审核结果',
            dataIndex: 'auditResult',
            key: 'auditResult',

            render: (text: any, record: any, index: any) => {
                return <div>{record.auditResult == '1' ? '审核通过' : record.auditResult == '2' ? '审核不通过' : '--'}</div>;
            },
        },
        {
            title: '审核意见',
            dataIndex: 'auditIdea',
            key: 'auditIdea',
        },
        {
            title: '分类',
            dataIndex: 'dataSource',
            key: 'dataSource',
            render: (text: any, record: any, index: any) => {
                return <div>{record.dataSource == '1' ? '应用' : record.dataSource == '2' ? '业务组件' : '元素'}</div>;
            },
        },
        {
            title: '类别',
            dataIndex: 'dataType',
            key: 'dataType',
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
            title: '审核人工号',
            dataIndex: 'auditStaffId',
            key: 'auditStaffId',
        },
        {
            title: '审核时间',
            dataIndex: 'auditTime',
            key: 'auditTime',
        },
    ];
    // 分页相关状态
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    // 审核记录筛选条件状态
    const [recordFilter, setRecordFilter] = useState({
        name: '',
        auditResult: '',
        auditOpinion: '',
        province: userInfo.provinceId,
        auditorId: '',
        dataSource: '',
        dataType: '',
        dateRange: [null, null] as [Dayjs | null, Dayjs | null],
    });
    const [loading, setLoading] = useState(false);

    // 审核结果下拉选项
    const auditResultOptions = [
        { value: '', label: '请选择' },
        { value: '1', label: '审核通过' },
        { value: '2', label: '审核不通过' },
    ];
    const categoryOptions = [
        { value: '', label: '请选择' },

        { value: '1', label: '应用' },
        { value: '2', label: '业务组件' },
        { value: '3', label: '元素' },
    ];
    const dataTypeOptions = [
        { value: '', label: '请选择' },
        { value: '1', label: '元素发布' },
        { value: '2', label: '元素下线' },
        { value: '3', label: '回滚版本' },
    ];
    // 查询按钮点击事件
    const handleSearch = () => {
        setLoading(true);
        // 将日期范围拆分为开始时间和结束时间
        const { dateRange, ...otherFilters } = recordFilter;
        const params = {
            auditStartDate: dateRange?.[0]?.format('YYYY-MM-DD HH:mm:ss') || '',
            auditEndDate: dateRange?.[1]?.format('YYYY-MM-DD HH:mm:ss') || '',
            page: currentPage,
            limit: pageSize,
            auditStatus: 1,
            provId: recordFilter.province,
            // provId: "00030027",
            dataName: recordFilter.name,
            auditResult: recordFilter.auditResult,
            auditIdea: recordFilter.auditOpinion,
            auditStaffId: recordFilter.auditorId,
        };
        console.log('审核记录查询参数:', params);
        request
            .post('/solutionAudit/querySolutionAudit', objectToFormData(params))
            .then((res) => {
                setLoading(false);
                if (res.returnCode == '0') {
                    setAuditRecordData(res.beans);
                    setTotal(res.bean.total || 0);
                }
            })
            .catch((err) => {
                setLoading(false);
                setAuditRecordData([]);
            });
    };
    // 分页处理函数
    const handleTableChange = (page: number, pageSize: number) => {
        setCurrentPage(page);
        setPageSize(pageSize);
        handleSearch();
    };
    // 首次进入页面自动查询
    useEffect(() => {
        handleSearch();
    }, []);

    // 重置按钮点击事件
    const handleReset = () => {
        setRecordFilter({
            name: '',
            dataSource: '',
            auditResult: '',
            auditOpinion: '',
            province: userInfo.provinceId,
            auditorId: '',
            dataType: '',
            dateRange: [null, null] as [Dayjs | null, Dayjs | null],
        });
    };

    return (
        <div className="sub-card">
            <div className="filter-bar">
                {/* 第一行筛选条件 */}
                <div className="filter-row">
                    <div className="filter-item">
                        <label className="label">名称</label>
                        <Input
                            placeholder="请输入名称"
                            allowClear
                            className="filter-input"
                            value={recordFilter.name}
                            onChange={(e) => setRecordFilter((prev) => ({ ...prev, name: e.target.value }))}
                        />
                    </div>
                    <div className="filter-item">
                        <label className="label">审核结果</label>
                        <Select
                            placeholder="请选择审核结果"
                            allowClear
                            className="filter-input"
                            value={recordFilter.auditResult}
                            onChange={(value) => setRecordFilter((prev) => ({ ...prev, auditResult: value }))}
                            options={auditResultOptions}
                        />
                    </div>
                    <div className="filter-item">
                        <label className="label">审核意见</label>
                        <Input
                            placeholder="请输入审核意见"
                            allowClear
                            className="filter-input"
                            value={recordFilter.auditOpinion}
                            onChange={(e) =>
                                setRecordFilter((prev) => ({
                                    ...prev,
                                    auditOpinion: e.target.value,
                                }))
                            }
                        />
                    </div>
                </div>

                {/* 第二行筛选条件 */}
                <div className="filter-row">
                    <div className="filter-item">
                        <label className="label">省份</label>
                        <Select
                            placeholder="请选择省份"
                            allowClear
                            className="filter-input"
                            value={recordFilter.province}
                            disabled
                            options={provinceOptions}
                        />
                    </div>
                    <div className="filter-item">
                        <label className="label">审核人工号</label>
                        <Input
                            placeholder="请输入审核人工号"
                            allowClear
                            className="filter-input"
                            value={recordFilter.auditorId}
                            onChange={(e) =>
                                setRecordFilter((prev) => ({
                                    ...prev,
                                    auditorId: e.target.value,
                                }))
                            }
                        />
                    </div>
                    <div className="filter-item">
                        <label className="label">审核时间</label>
                        <RangePicker
                            placeholder={['开始时间', '结束时间']}
                            allowClear
                            format="YYYY-MM-DD HH:mm:ss"
                            showTime={{ format: 'HH:mm:ss' }}
                            className="filter-input"
                            value={recordFilter.dateRange}
                            onChange={(dates) =>
                                setRecordFilter((prev) => ({
                                    ...prev,
                                    dateRange: dates as [Dayjs | null, Dayjs | null],
                                }))
                            }
                        />
                    </div>
                </div>
                <div className="filter-row">
                    <div className="filter-item">
                        <label className="label">分类</label>
                        <Select
                            placeholder="请选择分类"
                            allowClear
                            className="filter-input"
                            value={recordFilter.dataSource}
                            onChange={(value) => setRecordFilter((prev) => ({ ...prev, dataSource: value }))}
                            options={categoryOptions}
                        />
                    </div>

                    {recordFilter.dataSource === '3' ? (
                        <div className="filter-item">
                            <label className="label">审核类型</label>
                            <Select
                                placeholder="请选择审核类型"
                                allowClear
                                className="filter-input"
                                value={recordFilter.dataType}
                                onChange={(value) => setRecordFilter((prev) => ({ ...prev, auditType: value }))}
                                options={dataTypeOptions}
                            />
                        </div>
                    ) : (
                        <div className="filter-item">
                            <label className="label"></label>

                            <div className="action-buttons filter-input"></div>
                        </div>
                    )}
                    <div className="filter-item">
                        <div className="action-buttons filter-input">
                            <Button type="primary" size="middle" onClick={handleSearch}>
                                查询
                            </Button>
                            <Button size="middle" ghost type="primary" onClick={handleReset}>
                                重置
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 操作按钮 */}
            </div>
            <div className="result-info">查询结果</div>
            <Table
                columns={auditRecordColumns}
                dataSource={auditRecordData}
                size="small"
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
                className="table-container2"
                scroll={{ y: 300 }}
                loading={loading}
            />
        </div>
    );
};

export default AuditRecord;
