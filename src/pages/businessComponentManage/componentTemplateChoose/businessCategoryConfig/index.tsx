import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Table, Input, Select, Modal, Button, Form, Space } from 'antd';
import { message } from '@/utils/AntdGlobal';
import type { TableColumnsType, TableProps } from 'antd';
import { ExclamationCircleTwoTone } from '@ant-design/icons';

import {
    ModuleSelectHandle,
    BusinessData,
    OptionItem,
    TempSearchData,
    CommponentBeansItem,
    ComponentTempData,
} from '../../businessComponentMangeTypes';
// import { publictData } from '@utils/appMenuData';
import request from '@/utils/request';
import { crossApiUserInfo } from '@/stores/crossapiStore';
import EditCategoryDialog from './editCategoryDialog';
import { businessDataListInfo } from '@/stores/businessCategoryStore';
import recodeLog from '../../../../utils/operLog';

import styles from './index.module.less';
interface parentProps {
    onClose: () => void;
    componentCategory: string;
}
interface BussinessItem {
    businessName: string;
    businessId: string;
    createStaffId: string;
    parentId?: string;
    businessLevel?: string;
}

interface ColumnsDataType {
    key: string;
    businessName: string;
    businessLevel: string;
    businessCategory: string;
    parentId: string;
    businessId: string;

    [key: string]: any;

    children?: ColumnsDataType[];
}

const BusinessCategoryConfig: React.FC<parentProps> = ({ onClose, componentCategory }) => {
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const setBusinessDataList = businessDataListInfo((state: any) => state.setBusinessDataList);
    const [form] = Form.useForm();
    const [deleteVisible, setDeleteVisible] = useState(false); // 删除二次确认弹窗显隐
    const [activeRecord, setActiveRecord] = useState<any>(); // 操作的数据
    const initialValues = {
        provId: userInfo.provinceId,
    };
    // 操作类型
    const [operType, setOperType] = useState<string>('');
    const [tableKey, setTableKey] = useState(0);

    const businessLevelOptions = [
        { label: '请选择', value: '' },
        { label: '一级', value: '1' },
        { label: '二级', value: '2' },
    ];
    const businessLevelObj: { [key: string]: string } = {
        '1': '一级',
        '2': '二级',
    };
    const [levelOptions, setLevelOptions] = useState(businessLevelOptions);

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
    const columns = [
        {
            title: '业务分类名称',
            key: 'businessName',
            dataIndex: 'businessName',
        },
        {
            title: '业务分类级别',
            dataIndex: 'businessLevel',
            key: 'businessLevel',
            width: 180,
            render: (text: string, record: any) => {
                const businessLevel = record.businessLevel;
                return businessLevelObj[businessLevel] ? businessLevelObj[businessLevel] : '--';
            },
        },
        {
            title: '操作',
            key: 'action',
            width: 180,
            render: (record: BusinessData) => {
                const showAdd = record.businessLevel && record.businessLevel < '2' ? true : false;
                return (
                    <Space size="middle">
                        {showAdd && (
                            <span className={styles.actionBtn} onClick={() => addBusinessData(record.businessId, record.businessLevel)}>
                                新增
                            </span>
                        )}
                        <span className={styles.actionBtn} onClick={() => handleClick(record)}>
                            编辑
                        </span>
                        <span className={styles.actionBtn} onClick={() => deleteFn(record)}>
                            删除
                        </span>
                    </Space>
                );
            },
        },
    ];
    // 业务分类数据
    const [businessData, setBusinessData] = useState<ColumnsDataType[]>([]);
    // 操作业务分类的数据
    const [bussinessItem, setBussinessItem] = useState<BussinessItem>({
        businessName: '',
        businessId: '',
        createStaffId: '',
        parentId: '',
        businessLevel: '1',
    });

    const [itemModalVisible, setItemModalVisible] = useState<boolean>(false);
    // 打开弹窗
    const handleOpenItemModal = () => {
        setItemModalVisible(true);
    };

    // 关闭弹窗
    const handleCloseItemModal = () => {
        setItemModalVisible(false);
    };

    // 生成树结构
    const getTree = (beans: Array<ColumnsDataType>) => {
        let maxNum: number = 1;
        let minNum: number = 2;
        for (const item of beans) {
            maxNum = maxNum > Number(item.businessLevel) ? maxNum : Number(item.businessLevel);
            minNum = minNum < Number(item.businessLevel) ? minNum : Number(item.businessLevel);
        }
        console.log(maxNum, minNum);

        const result = [];

        for (let i = 0; i < beans.length; i++) {
            if (Number(beans[i].businessLevel) == minNum) {
                if (minNum < maxNum) {
                    const child = getChild(beans, beans[i].businessId, maxNum);
                    child.length && (beans[i].children = child);
                }
                result.push(beans[i]);
            }
        }
        return result;
    };

    const getChild = (beans: Array<ColumnsDataType>, pId: string, maxNum: number) => {
        const childrenList = [];
        for (let i = 0; i < beans.length; i++) {
            if (beans[i].parentId == pId) {
                if (Number(beans[i].businessLevel) < maxNum) {
                    const child = getChild(beans, beans[i].businessId, maxNum);
                    child.length && (beans[i].children = child);
                }
                childrenList.push(beans[i]);
            }
        }
        return childrenList;
    };

    // 删除
    const deleteFn = (record: BusinessData) => {
        setActiveRecord(record);
        setDeleteVisible(true);
    };

    // 二次确认方法
    const reconfirmFun = () => {
        const record = activeRecord;
        if (record?.businessId) {
            const delparams = {
                params: {
                    businessId: record?.businessId,
                    updateStaffId: userInfo.staffId,
                },
            };
            request
                .post('/appComponentBusiness/delComponentBusiness', delparams)
                .then((result) => {
                    if (result && result.returnCode == '0') {
                        setDeleteVisible(false);
                        message.success('删除成功！');
                        fromReset();
                        queryBussinessList('1');
                        const logParams = {
                            provCode: userInfo.provinceId, // 8位省份编码
                            modelName: '', // 所属模块  暂时为空
                            pageName: '', // 所属菜单   暂时为空
                            dataType: '业务组件分类', // 数据类型（应用、元素、组件、接口）
                            operType: '删除', // 操作类型（新增/编辑/删除/导入）
                            dataId: record?.businessId, // 操作数据ID
                            dataName: record?.businessName, // 操作数据名称
                            editContent: `删除${record?.businessName}业务组件分类`, // 操作内容简述
                            staffId: userInfo.staffId, // 操作人工号
                        };
                        recodeLog(logParams);
                    }
                })
                .catch((err) => {});
        } else {
            console.warn('id 不存在，无法执行删除');
        }
    };

    // 编辑
    const handleClick = (record: BusinessData) => {
        setOperType('edit');
        setBussinessItem({
            businessName: record.businessName,
            businessId: record.businessId,
            createStaffId: record.createStaffId ? record.createStaffId : '',
            parentId: record.parentId,
            businessLevel: record.businessLevel,
        });
        handleOpenItemModal();
    };
    // 新增
    const addBusinessData = (parentId: string, businessLevel: string | undefined) => {
        setOperType('add');
        setBussinessItem({
            businessName: '',
            businessId: '',
            parentId: parentId,
            businessLevel: businessLevel,
            createStaffId: '',
        });

        handleOpenItemModal();
    };
    // 业务分类操作完之后重新更新
    const categorySaved = () => {
        handleCloseItemModal();
        fromReset();
        queryBussinessList('1');
    };
    const fromSearch = () => {
        queryBussinessList('2');
    };

    const fromReset = () => {
        form.resetFields();
    };
    // 首次进入页面自动查询
    useEffect(() => {
        queryBussinessList('1');
    }, []);
    // 查询业务分类
    const queryBussinessList = async (type: string) => {
        const params = {
            ...form.getFieldsValue(),
        };
        const result = await request.post('/appComponentBusiness/queryComponentBusinessList', { params: params });
        setTableKey((tableKey) => tableKey + 1);

        for (let i = 0; i < result.beans.length; i++) {
            if (result.beans[i].parentId === '') {
                result.beans[i].parentId = '0';
            }
            if (!result.beans[i].businessLevel) {
                result.beans[i].businessLevel = '1';
            }
        }

        setBusinessData(getTree(result.beans));
        // 区分什么时候更新store
        if (type === '1') {
            setBusinessDataList(result.beans);
        }
    };
    return (
        <Modal
            className={styles.categoryManageConfig}
            title="业务分类"
            centered
            open={true}
            onCancel={() => {
                onClose();
            }}
            destroyOnClose
            footer={null}
            maskClosable={false}
            width={880}
            styles={modalStyles}
        >
            <div className={styles.categoryManageContent}>
                <div className={styles.searchResultModule}>
                    <Form
                        form={form}
                        layout="inline"
                        initialValues={initialValues}
                        style={{
                            marginRight: 0,
                            width: '66%',
                        }}
                    >
                        <Form.Item
                            label="业务分类名称"
                            name="businessName"
                            labelCol={{ flex: '110px' }}
                            wrapperCol={{ flex: 1 }}
                            style={{
                                marginRight: 0,
                                width: '50%',
                            }}
                        >
                            <Input placeholder="请输入" />
                        </Form.Item>
                        <Form.Item
                            label="业务分类级别"
                            name="businessLevel"
                            labelCol={{ flex: '110px' }}
                            wrapperCol={{ flex: 1 }}
                            style={{
                                marginRight: 0,
                                width: '50%',
                            }}
                        >
                            <Select placeholder="请选择" options={levelOptions}></Select>
                        </Form.Item>
                    </Form>
                    <div className={styles.listTitle}>
                        <button
                            className={styles.addBtn}
                            onClick={() => {
                                fromSearch();
                            }}
                        >
                            查询
                        </button>
                        <button
                            className={styles.resetBtn}
                            onClick={() => {
                                fromReset();
                            }}
                        >
                            重置
                        </button>
                    </div>
                </div>
                <div className={styles.gapElement}></div>

                <div className={styles.searchList}>
                    <div className={styles.topArea}>
                        <p>查询结果</p>
                        <Button type="primary" className={styles.addBusinessLevelBtn} onClick={() => addBusinessData('', '0')}>
                            +新增一级分类
                        </Button>
                    </div>
                    <div className={styles.tableCont}>
                        <Table
                            key={tableKey}
                            columns={columns}
                            dataSource={businessData}
                            pagination={false}
                            rowKey="businessId"
                            // scroll={{ y: 200 }}
                            expandable={{
                                defaultExpandAllRows: true,
                            }}
                            bordered
                            size="middle"
                        />
                    </div>
                </div>
            </div>
            {itemModalVisible && (
                <EditCategoryDialog
                    onSaved={categorySaved}
                    onClose={handleCloseItemModal}
                    componentCategory={componentCategory}
                    bussinessItem={bussinessItem}
                    type={operType}
                />
            )}
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
                        <div style={{ fontSize: '13px', color: '#666666' }}>是否确认删除已选中业务分类？</div>
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
        </Modal>
    );
};

export default BusinessCategoryConfig;
