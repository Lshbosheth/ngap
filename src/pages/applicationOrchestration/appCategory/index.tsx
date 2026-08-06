import React, { useEffect, useState } from 'react';
import { Modal, Input, Select, Table, Button, Space, Form } from 'antd';
import { message } from '@/utils/AntdGlobal';
import { CaretDownOutlined, CaretRightOutlined } from '@ant-design/icons';
import styles from './index.module.less';
import { crossApiUserInfo } from '@/stores/crossapiStore';
import request from '@/utils/request';
import AppTypeManageDialog from '../appTypeManageDialog';
import recodeLog from '../../../utils/operLog';
import { ExclamationCircleTwoTone } from '@ant-design/icons';
interface ModalProps {
    appCategory: string;
    onClose: () => void;
    categoryType?: string;
}

interface ColumnsDataType {
    key: string;
    appTypeName: string;
    typeLevel: string;
    appTypeCategory: string;
    pId: string;
    appTypeId: string;

    [key: string]: any;

    children?: ColumnsDataType[];
}

const AppCategory: React.FC<ModalProps> = ({ appCategory, onClose, categoryType }) => {
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const [operType, setOperType] = useState('');
    const [currentData, setCurrentData] = useState(null);
    const [form] = Form.useForm();
    const [deleteVisible, setDeleteVisible] = useState(false); // 删除二次确认弹窗显隐
    const [activeRecord, setActiveRecord] = useState<any>(); // 操作的数据
    const [pointOut, setPointOut] = useState<string>(''); // 提示语
    const [isDelete, setIsDelete] = useState(false); // 是否为删除
    
    // 判断是标签分类还是应用分类
    const isTagCategory = categoryType === '2';
    const categoryTypeName = isTagCategory ? '标签分类' : '应用分类';
    const initialValues = {
        provId: userInfo.provinceId,
        appTypeCategory: appCategory,
    };
    const appTypeProductLevelObj: { [key: string]: string } = {
        '1': '一级',
        '2': '二级',
        '3': '三级',
        '4': '四级',
        '5': '五级',
        '6': '六级',
    };

    const appTypeProductLevelOptions = [
        { label: '请选择', value: '' },
        { label: '一级', value: '1' },
        { label: '二级', value: '2' },
        { label: '三级', value: '3' },
        { label: '四级', value: '4' },
        { label: '五级', value: '5' },
        { label: '六级', value: '6' },
    ];

    const appTypeOperateInfoOptions = [
        { label: '请选择', value: '' },
        { label: '一级', value: '1' },
        { label: '二级', value: '2' },
        { label: '三级', value: '3' },
    ];

    const appCategoryOptions = [
        { label: '生产应用', value: '1' },
        { label: '运营应用', value: '2' },
    ];

    const [loading, setLoading] = useState(true);
    const [appTypeList, setAppTypeList] = useState<ColumnsDataType[]>([]);
    const [tableKey, setTableKey] = useState(0);

    const [levelOptions, setLevelOptions] = useState(appTypeProductLevelOptions);
    const [isOpenAppTypeManage, setIsOpenAppTypeManage] = useState<boolean>(false);

    // 关闭编辑应用分类弹窗
    const handleCloseModal = () => {
        setCurrentData(null);
        setIsOpenAppTypeManage(false);
    };

    const handleSave = () => {
        setCurrentData(null);
        setIsOpenAppTypeManage(false);
        queryAppTypeList();
    };

    const addBtnClick = (data: any, type: string) => {
        if (!data.appTypeCategory) {
            const { appTypeCategory } = form.getFieldsValue();
            data.appTypeCategory = appTypeCategory;
            data.typeLevel = '0';
        }
        setOperType(type);
        setCurrentData(data);
        setIsOpenAppTypeManage(true);
    };
    const editBtnClick = (data: any, type: string) => {
        setActiveRecord(data);
        setIsDelete(false);
        setPointOut(isTagCategory ? '当前标签分类已关联应用，修改会影响应用展示效果' : '当前应用分类已关联应用，修改会影响应用展示效果');
        setDeleteVisible(true);
    };
    const delBtnClick = (data: any, type: string) => {
        if (data.children && data.children.length) {
            message.warning(isTagCategory ? '当前标签分类节点存在子节点，不允许删除！' : '当前应用分类节点存在子节点，不允许删除！');
            return;
        }
        setActiveRecord(data);
        setIsDelete(true);
        setPointOut(isTagCategory ? '请确认是否删除此标签分类名称，点击确认则删除?' : '请确认是否删除此应用分类名称，点击确认则删除?');
        setDeleteVisible(true);
    };

    // 二次确认方法
    const reconfirmFun = () => {
        const data = activeRecord;
        if (isDelete) {
            // 删除接口
            const deleteParams = {
                staffId: userInfo.staffId,
                appTypeId: data?.appTypeId,
            };
            request.post('/appType/deleteAppType', { params: deleteParams }).then((res) => {
                if (res && res.returnCode == '0') {
                    setDeleteVisible(false);
                    message.success('删除成功');
                    queryAppTypeList();
                    const logParams = {
                        provCode: userInfo.provinceId, // 8位省份编码
                        modelName: '', // 所属模块  暂时为空
                        pageName: '', // 所属菜单   暂时为空
                        dataType: isTagCategory ? '标签分类' : '应用分类', // 数据类型（应用、元素、组件、接口）
                        operType: '删除', // 操作类型（新增/编辑/删除/导入）
                        dataId: data?.appTypeId, // 操作数据ID
                        dataName: data?.appTypeName, // 操作数据名称
                        editContent: isTagCategory ? `删除${data?.appTypeName}标签分类` : `删除${data?.appTypeName}应用分类`, // 操作内容简述
                        staffId: userInfo.staffId, // 操作人工号
                    };
                    recodeLog(logParams);
                }
            });
        } else {
            setDeleteVisible(false);
            setOperType('edit');
            setCurrentData(data);
            setIsOpenAppTypeManage(true);
        }
    };

    const columns = [
        {
            title: isTagCategory ? '标签分类名称' : '应用分类名称',
            dataIndex: 'appTypeName',
            key: 'appTypeName',
            width: 200,
            ellipsis: true,
        },
        {
            title: isTagCategory ? '标签分类级别' : '应用分类级别',
            dataIndex: 'typeLevel',
            key: 'typeLevel',
            width: 100,
            render: (text: string, record: any) => {
                const typeLevel = record.typeLevel;
                return appTypeProductLevelObj[typeLevel];
            },
        },
        {
            title: '归属应用类别',
            dataIndex: 'appTypeCategory',
            key: 'appTypeCategory',
            width: 100,
            render: (text: string, record: any) => {
                return record.appTypeCategory === '1' ? '生产应用' : record.appTypeCategory === '2' ? '运营应用' : '--';
            },
        },
        {
            title: '操作',
            key: 'action',
            render: (text: string, record: any) => {
                const showAdd =
                    (record.appTypeCategory === '1' && record.typeLevel < '6') || (record.appTypeCategory === '2' && record.typeLevel < '3');
                return (
                    <Space size="middle">
                        {showAdd && (
                            <span className={styles.actionBtn} onClick={() => addBtnClick(record, 'add')}>
                                新增
                            </span>
                        )}
                        <span className={styles.actionBtn} onClick={() => editBtnClick(record, 'edit')}>
                            编辑
                        </span>
                        <span className={styles.actionBtn} onClick={() => delBtnClick(record, 'delete')}>
                            删除
                        </span>
                    </Space>
                );
            },
            width: 100,
        },
    ];

    const customExpandIcon = (props: any) => {
        const { expanded, onExpand, record } = props;

        // 如果没有子节点，不显示图标
        const fields = form.getFieldsValue();
        const appCategoryType = fields.appCategoryType;
        if ((appCategoryType === '1' && record.typeLevel === '6') || (appCategoryType === '2' && record.typeLevel === '3')) {
            return <span style={{ display: 'inline-block', width: 16 }} />;
        }
        return (
            <Button
                type="text"
                size="small"
                onClick={(e) => {
                    e.stopPropagation();
                    onExpand(record, e);
                }}
                style={{
                    width: 16,
                    height: 16,
                    minWidth: 16,
                    padding: 0,
                    color: '#78909c',
                    outline: 'none',
                    background: 'transparent',
                }}
            >
                {expanded ? <CaretDownOutlined style={{ fontSize: 12 }} /> : <CaretRightOutlined style={{ fontSize: 12 }} />}
            </Button>
        );
    };

    const setRowClass = (record: ColumnsDataType, index: number) => {
        return record.typeLevel === '1' ? (index % 2 === 0 ? 'evenTr' : 'oddTr') : '';
    };

    // 生成树结构
    const getTree = (beans: Array<ColumnsDataType>) => {
        let maxNum: number = 1;
        let minNum: number = 6;
        for (const item of beans) {
            maxNum = maxNum > Number(item.typeLevel) ? maxNum : Number(item.typeLevel);
            minNum = minNum < Number(item.typeLevel) ? minNum : Number(item.typeLevel);
        }

        const result = [];

        for (let i = 0; i < beans.length; i++) {
            if (Number(beans[i].typeLevel) == minNum) {
                if (minNum < maxNum) {
                    const child = getChild(beans, beans[i].appTypeId, maxNum);
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
            if (beans[i].pId == pId) {
                if (Number(beans[i].typeLevel) < maxNum) {
                    const child = getChild(beans, beans[i].appTypeId, maxNum);
                    child.length && (beans[i].children = child);
                }
                childrenList.push(beans[i]);
            }
        }
        return childrenList;
    };

    //选择归属应用类别
    const appCategoryChange = (value: string) => {
        value == '1' ? setLevelOptions(appTypeProductLevelOptions) : setLevelOptions(appTypeOperateInfoOptions);
        form.setFieldsValue({ typeLevel: undefined });
    };

    const queryAppTypeList = async () => {
        setLoading(true);
        try {
            const params = {
                ...form.getFieldsValue(),
                provId: userInfo.provinceId,
                ...(categoryType && { categoryType: categoryType }), // 当categoryType存在时才添加该参数
            };
            const result = await request.post('/appType/queryAppTypeList', { params: params });
            setAppTypeList(getTree(result.beans));
            setTableKey((tableKey) => tableKey + 1);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const fromSearch = () => {
        queryAppTypeList();
    };

    const fromReset = () => {
        form.resetFields();
        queryAppTypeList();
    };

    useEffect(() => {
        form.setFieldsValue({ appTypeCategory: appCategory });
        queryAppTypeList();
    }, []);

    return (
        <>
            <Modal
                title={categoryTypeName}
                centered
                open={true}
                onCancel={() => {
                    onClose();
                }}
                destroyOnClose
                footer={null}
                maskClosable={false}
                width={1000}
                classNames={{
                    content: 'customModalContent',
                    header: 'customModalHeader',
                    footer: 'customModalFooter',
                }}
            >
                <div className={styles.appTypeManage}>
                    <div className={styles.searchModule}>
                        <Form form={form} layout="inline" initialValues={initialValues}>
                            <Form.Item
                                label={isTagCategory ? '标签分类名称' : '应用分类名称'}
                                name="appTypeName"
                                labelCol={{ flex: '110px' }}
                                wrapperCol={{ flex: 1 }}
                                style={{
                                    marginBottom: 10,
                                    marginRight: 0,
                                    width: '33.3%',
                                }}
                            >
                                <Input placeholder="请输入" />
                            </Form.Item>
                            <Form.Item
                                label={isTagCategory ? '标签分类级别' : '应用分类级别'}
                                name="typeLevel"
                                labelCol={{ flex: '110px' }}
                                wrapperCol={{ flex: 1 }}
                                style={{
                                    marginBottom: 10,
                                    marginRight: 0,
                                    width: '33.3%',
                                }}
                            >
                                <Select placeholder="请选择" options={levelOptions}></Select>
                            </Form.Item>
                            <Form.Item
                                label="归属应用类别"
                                name="appTypeCategory"
                                labelCol={{ flex: '110px' }}
                                wrapperCol={{ flex: 1 }}
                                style={{
                                    marginBottom: 10,
                                    marginRight: 0,
                                    width: '33.3%',
                                }}
                            >
                                <Select placeholder="请选择" onChange={appCategoryChange} options={appCategoryOptions}></Select>
                            </Form.Item>
                        </Form>

                        <div className={`${styles.configItem} ${styles.operateBtn}`}>
                            <button className={styles.searchQuery} onClick={fromSearch}>
                                查 询
                            </button>
                            <button onClick={fromReset}>重 置</button>
                        </div>
                    </div>
                    <div className={styles.gapElement}></div>
                    <div className={styles.searchCont}>
                        <div className={styles.topArea}>
                            <p>查询结果</p>
                            <Button type="primary" className={styles.addTypeLevelBtn} onClick={() => addBtnClick({}, 'add')}>
                                +新增一级分类
                            </Button>
                        </div>
                        <div className={styles.tableCont}>
                            <Table
                                key={tableKey}
                                columns={columns}
                                dataSource={appTypeList}
                                loading={loading}
                                pagination={false}
                                rowKey="appTypeId"
                                size="small"
                                bordered
                                virtual
                                scroll={{ y: 390 }}
                                expandable={{
                                    defaultExpandAllRows: true,
                                    expandIcon: customExpandIcon,
                                }}
                                rowClassName={setRowClass}
                            />
                        </div>
                    </div>
                </div>
            </Modal>

            {isOpenAppTypeManage && (
                <AppTypeManageDialog
                    onSaveManage={handleSave}
                    onCloseManage={handleCloseModal}
                    data={currentData}
                    type={operType}
                    appCategory={appCategory}
                    categoryType={categoryType}
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
                        <div style={{ fontSize: '13px', color: '#666666' }}>{pointOut}</div>
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
        </>
    );
};

export default AppCategory;
