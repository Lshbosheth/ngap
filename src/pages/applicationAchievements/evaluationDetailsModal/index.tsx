import { Modal, Form, Select, DatePicker, Input, Table, Button, Space } from "antd"
import dayjs from "dayjs"
import React, { useEffect, useState } from "react"
import { IAchievementsDetailItem } from '../types';
import { publictData } from '@/utils/appMenuData';
import request from "@/utils/request.ts";

const { provinceSelectValue, provId2provName } = publictData;

interface EvalutionDetialModalProps {
    modalVisible: boolean;
    setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
    relationId: string;
    relationNm: string;
    searchParams?: any;
}

const { RangePicker } = DatePicker;

// 成效明细列表-详情弹框
const EvalutionDetialModal: React.FC<EvalutionDetialModalProps> = ({ modalVisible, setModalVisible, relationId, searchParams }) => {
    const [form] = Form.useForm();
    const [tableData, setTableData] = useState<IAchievementsDetailItem[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);

    useEffect(() => {
        if (modalVisible && relationId) {
            const initialValues: any = {};
            if (searchParams?.accsssTime && searchParams.accsssTime.length === 2) {
                initialValues.evaluateTime = searchParams.accsssTime;
            }
            initialValues.enumType = "";
            initialValues.staffProvCode = "";
            initialValues.staffType2 = "";
            form.setFieldsValue(initialValues);
            setCurrentPage(1);
            getEvaluationDetailData(initialValues);
        } else if (!modalVisible) {
            form.resetFields();
            setTableData([]);
            setTotal(0);
            setCurrentPage(1);
            setPageSize(10);
        }
    }, [modalVisible, relationId]);

    const getEvaluationDetailData = (formValues?: any) => {
        setTableData([]);
        setTotal(0);
        setLoading(true);
        const queryParams: any = {
            page: currentPage,
            limit: pageSize,
            start: (currentPage - 1) * pageSize,
            relationId: relationId,
        };
        if (formValues?.evaluateTime && formValues.evaluateTime.length === 2) {
            queryParams.startTime = formValues.evaluateTime[0].format('YYYY-MM-DD HH:mm:ss');
            queryParams.endTime = formValues.evaluateTime[1].format('YYYY-MM-DD HH:mm:ss');
        }
        const { evaluateTime, ...restValues } = formValues || {};
        Object.assign(queryParams, restValues);

        request.post('/appDashboard/queryEmunDetiai', {params: queryParams})
            .then((res) => {
                setTableData(res.beans);
                setTotal(res.bean?.total || 0);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleSearch = () => {
        const values = form.getFieldsValue();
        setCurrentPage(1);
        getEvaluationDetailData(values);
    };

    const handleReset = () => {
        form.resetFields();
        form.setFieldsValue({
            enumType: "",
            staffProvCode: "",
            staffType2: ""
        });
    };

    const handleTableChange = (page: number, size: number) => {
        setCurrentPage(page);
        setPageSize(size);
        const values = form.getFieldsValue();
        getEvaluationDetailData(values);
    };

    const columns = [
        {
            title: '应用名称',
            dataIndex: 'relationNm',
            key: 'relationNm',
            width: 150,
            ellipsis: true,
        },
        {
            title: '评价类型',
            dataIndex: 'enumType',
            key: 'enumType',
            ellipsis: true,
            width: 100,
            render: (text: string) =>{
                if (text ==="like"){
                    return "点赞"
                } else if (text ==="disLike") {
                    return "点踩"
                }
            }
        },
        {
            title: '评价结果',
            dataIndex: 'enumResult',
            key: 'enumResult',
            ellipsis: true,
            width: 150,
        },
        {
            title: '评价时间',
            dataIndex: 'enumTime',
            key: 'enumTime',
            ellipsis: true,
            width: 120,
        },
        {
            title: '评价人工号',
            dataIndex: 'staffId',
            key: 'staffId',
            ellipsis: true,
            width: 100,
        },
        {
            title: '评价人省份',
            dataIndex: 'staffProvCode',
            key: 'staffProvCode',
            width: 100,
            render: (provCode: string) => (
                provCode ? provId2provName[provCode] : provCode
            )
        },
        {
            title: '人员类型',
            dataIndex: 'staffType2',
            key: 'staffType2',
            width: 100,
        },
    ];
    const formItemStyle = {
        marginBottom: 10,
        width: '33%'
    }
    return (
        <>
            <Modal
                title="评价明细"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={1200}
                destroyOnClose
            >
                <div style={{ marginBottom: 16 }}>
                    <Form form={form} layout="horizontal">
                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                            <Form.Item
                                label="评价时间"
                                name="evaluateTime"
                                labelCol={{ span: 6 }}
                                wrapperCol={{ span: 17 }}
                                style={formItemStyle}
                            >
                                <RangePicker
                                    showTime={{ format: 'HH:mm:ss' }}
                                    format="YYYY-MM-DD HH:mm:ss"
                                    style={{ width: '100%', backgroundColor: '#f5fdff' }}
                                    disabledDate={(current) => current && current > dayjs().endOf('day')}
                                    disabledTime={(current, type) => {
                                        if (type === 'start') {
                                            return {
                                                disabledHours: () => current && current.isSame(dayjs(), 'day') ? Array.from({ length: dayjs().hour() }, (_, i) => i).slice(dayjs().hour() + 1, 24) : [],
                                                disabledMinutes: () => current && current.isSame(dayjs(), 'day') && current.hour() === dayjs().hour() ? Array.from({ length: dayjs().minute() }, (_, i) => i) : [],
                                                disabledSeconds: () => current && current.isSame(dayjs(), 'day') && current.hour() === dayjs().hour() && current.minute() === dayjs().minute() ? Array.from({ length: dayjs().second() }, (_, i) => i) : [],
                                            }
                                        } else {
                                            return {
                                                disabledHours: () => current && current.isAfter(dayjs(), 'day') ? [] : Array.from({ length: dayjs().hour() + 1 }, (_, i) => i),
                                                disabledMinutes: () => current && current.isSame(dayjs(), 'day') ? Array.from({ length: dayjs().minute() + 1 }, (_, i) => i).slice(0, -1) : [],
                                                disabledSeconds: () => current && current.isSame(dayjs(), 'day') && current.hour() === dayjs().hour() ? Array.from({ length: dayjs().second() }, (_, i) => i) : [],
                                            }
                                        }
                                    }}
                                />
                            </Form.Item>
                            <Form.Item
                                label="评价类型"
                                name="enumType"
                                labelCol={{ span: 6 }}
                                wrapperCol={{ span: 17 }}
                                style={formItemStyle}
                            >
                                <Select placeholder="请选择" allowClear>
                                    <Select.Option value="">请选择</Select.Option>
                                    <Select.Option value="like">点赞</Select.Option>
                                    <Select.Option value="disLike">点踩</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                label="评价人工号"
                                name="staffId"
                                labelCol={{ span: 6 }}
                                wrapperCol={{ span: 17 }}
                                style={formItemStyle}
                            >
                                <Input placeholder="请输入" allowClear />
                            </Form.Item>
                            <Form.Item
                                label="评价人省份"
                                name="staffProvCode"
                                labelCol={{ span: 6 }}
                                wrapperCol={{ span: 17 }}
                                style={formItemStyle}
                            >
                                <Select placeholder="请选择" allowClear>
                                    <Select.Option value="">请选择</Select.Option>
                                    {provinceSelectValue.map((item) => (
                                        <Select.Option key={item.value} value={item.value}>
                                            {item.label}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item
                                label="人员类型"
                                name="staffType2"
                                labelCol={{ span: 6 }}
                                wrapperCol={{ span: 17 }}
                                style={formItemStyle}
                            >
                                <Select placeholder="请选择" allowClear>
                                    <Select.Option value="">请选择</Select.Option>
                                    <Select.Option value="自有">自有</Select.Option>
                                    <Select.Option value="众包">众包</Select.Option>
                                    <Select.Option value="其他">其他</Select.Option>
                                    <Select.Option value="数字员工">数字员工</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                name=""
                                wrapperCol={{ span: 24 }}
                                style={{
                                    marginLeft: 'auto',
                                    marginBottom: 16,
                                    width: '29%',
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                }}
                            >
                                <Space>
                                    <Button type="primary" onClick={handleSearch}>
                                        查询
                                    </Button>
                                    <Button style={{ marginRight: 15 }} onClick={handleReset}>
                                        重置
                                    </Button>
                                </Space>
                            </Form.Item>
                        </div>
                    </Form>
                </div>
                <Table
                    size="small"
                    columns={columns}
                    dataSource={tableData}
                    rowKey={(record) => record.appId}
                    loading={loading}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: total,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        pageSizeOptions: ['5', '10', '20', '50'],
                        showTotal: (total) => `共 ${total} 条数据`,
                        onChange: handleTableChange,
                    }}
                    scroll={{ y: 400 }}
                />
            </Modal>
        </>
    )
}
export default EvalutionDetialModal
