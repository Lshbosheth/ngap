import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Table, Space, Tabs ,Badge} from 'antd';
import { message } from '@/utils/AntdGlobal';
import { useNavigate } from 'react-router-dom'
import styles from './index.module.less';
import request from '@/utils/request';
import { crossApiUserInfo } from '@/stores/crossapiStore';
import { RightOutlined } from '@ant-design/icons';
import ReviewDrawer from '../taskCenter/review';

const TenantManagePage: React.FC = () => {
    const reviewRef = useRef<{ open: (data: any, callback?: () => void) => void }>();
    const navigate = useNavigate()
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const handQuerys: any = {};
    const [serachType, setSerachType] = useState('todo');

    const reviewState = [
        { label: '发布提交审核', value: 'pubSub' },
        { label: '网络安全检查', value: 'netSafe' },
        { label: '数据安全检查', value: 'dataSafe' },
        { label: '应用发布审核', value: 'app' },
        { label: '一致性', value: 'once' },
        { label: '上架提交', value: 'upSub' },
        { label: '上架审核', value: 'up' },
        { label: '下架提交', value: 'downSub' },
        { label: '下架审核', value: 'down' },
        { label: '下架公示', value: 'downNotice' },
        { label: '回滚提交', value: 'rollbackSub' },
        { label: '回滚审核', value: 'rollback' },
    ];


    //搜索条件区域
    const SearHtml = () => {
        const [queryList, setqueryList] = useState([]); //
        const [loading, setLoading] = useState(false); //
        const [total, setTotal] = useState(0);
        const [formData, setFormData] = useState({
            serachType: serachType,
            staffId: userInfo.staffId,
            isWork: '1',
            isAdmin: userInfo.isAdmin || '0',
            page: 1, // 当前页码
            start: 0,
            limit: 5,
        });
        useEffect(() => {
            queryListFun();
        }, [serachType, userInfo.selectedTenantId,formData]); // 添加租户ID作为依赖，租户切换时重新获取数据
        const queryListFun = (isReview?: any) => {
            setLoading(true)
            try {
                const params = isReview ? {
                    reviewId: isReview.reviewId,
                    markType: isReview.markType,
                    staffId: userInfo.staffId
                } : {...formData}
                request
                    .post('/appReview/queryAppReviewList', {
                        params: {
                            ...params,
                            serachType: serachType
                        },
                    })
                    .then((res) => {
                        isReview ? reviewRef.current?.open(res?.beans[0], queryListFun) : setqueryList(res?.beans);
                        !isReview && handQuerys.queryNumsFun?.();

                        setTotal(res.bean.total)
                    }).finally(() => {
                    setLoading(false)
                })
                    .catch((err) => {
                    });
            } catch (error) {
                message.error('列表查询失败');
            } finally {
            }
        };
        // handQuerys.queryListFun = queryListFun;
        const handleTableChange = (page: number, pageSize: number) => {
            setFormData((prev) => ({
                ...prev,
                page: page,
                limit: pageSize,
                start: (page - 1) * pageSize,
            }));
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
                                    queryListFun(record);
                                }}
                            >
                                审核
                            </a>
                        </Space>
                    );
                },
                hidden: serachType === 'apply',
            },
            {
                title: '审核类型',
                dataIndex: 'reviewType',
                key: 'reviewType',
                render: (text: string, record: any) => {
                    const dataArrs: any = {
                        'publish': '发布',
                        'up': '上架',
                        'down': '下架',
                        'rollback': '回滚'
                    }
                    return <span>{dataArrs[text]}</span>;
                }
            },
            {
                title: '名称',
                dataIndex: 'markName',
                key: 'markName',
                ellipsis: true,
            },
            {
                title: '类型',
                dataIndex: 'markType',
                key: 'markType',
                render: (text: string, record: any) => {
                    const dataArrs: any = {
                        'app': '应用',
                        'ele': '元素',
                        'comp': '组件',
                        'appt': '应用模板',
                        'compt': '组件模板'
                    }
                    return <span>{dataArrs[text]}</span>;
                }
            },

            {
                title: '当前环节',
                dataIndex: 'reviewState',
                key: 'reviewState',
                render: (text: string, record: any) => {
                    return reviewState.map((item) => item.value == text && <span>{item.label}</span>);
                },

                hidden: serachType !== 'apply',
            },
            {
                title: '当前处理人',
                dataIndex: 'reviewStaffId',
                key: 'reviewStaffId',
                hidden: serachType !== 'apply',
                ellipsis: true,
            },
            {
                title: '申请原因',
                dataIndex: 'applyReason',
                key: 'applyReason',
                ellipsis: true,
                hidden: serachType === 'apply',
            },
            {
                title: '提交时间',
                dataIndex: 'applyTime',
                key: 'applyTime'
            }
        ];
        return (
            <div className={styles.tenantBox}>
                <div className={styles.tenantContent}>
                    <Table
                        rowKey="id"
                        columns={columns}
                        loading={loading}
                        size='small'
                        scroll={{ y: 250 }}
                        dataSource={queryList}
                        pagination={{
                            current: formData.page,
                            pageSize: formData.limit,
                            total: total,
                            showQuickJumper: true,
                            showTotal: (total) => `共 ${total} 条记录`,
                            locale: {items_per_page: '/页'},
                            onChange: handleTableChange,
                        }}
                    />
                </div>
            </div>
        );
    };
    // 嵌套 Tab 主组件
    const NestedTabs = () => {
        // 外层 Tab 状态（默认选中第一个外层 Tab）
        // const [activeMainTab, setActiveMainTab] = useState('todo');
        // 切换主 Tab 时：重置子 Tab
        const handleMainChange = (key: string) => {
            // serachType = key;
            setSerachType(key);
            // setActiveMainTab(key);
            // handQuerys.queryListFun?.();
        };
    //     useEffect(() => {
    //     queryNumsFun();
    // }, [userInfo.selectedTenantId]); // 添加租户ID作为依赖，租户切换时重新获取数据
        const [dataNuma, setdatanuma] = useState({
            toDoNum: '',
            applyNum: '',
        });
        const queryNumsFun = () => {
            try {
                request
                    .post('/appReview/queryAppReviewCount', {
                        params: {
                            staffId: userInfo.staffId,
                        },
                    })
                    .then((res) => {
                        setdatanuma((prev: any) => ({
                            ...prev,
                            toDoNum: res?.bean?.toDoNum || '0',
                            applyNum: res?.bean?.applyNum || '0',
                        }));
                    })
                    .catch((err) => { });
            } catch (error) {
                const [dataNuma, setdatanuma] = useState({
                    toDoNum: '0',
                    applyNum: '0',
                });
            } finally {
            }
        };
        handQuerys.queryNumsFun = queryNumsFun;


        // 外层 Tab 项配置
        const mainTabItems = [
            {
                key: 'todo',
                label: (
                    <Badge count={dataNuma.toDoNum} offset={[10,0]} overflowCount={99} size={'small'}>我的待办&nbsp;&nbsp;</Badge>
                ),
                // 外层 Tab1 的内容：仅承载子 Tab 组件
                children: <SearHtml />,
            },
            {
                key: 'apply',
                label: (
                    <Badge count={dataNuma.applyNum} offset={[10,0]} overflowCount={99} size={'small'}>我申请的&nbsp;&nbsp;</Badge>
                ),
                // 外层 Tab2 同样承载子 Tab 组件（共用同一套子 Tab）
                children: <SearHtml />,
            },
        ];

        return (
            <div style={{ margin: '0px auto', position: 'relative' }}>
                <div style={{ position: 'absolute', width: '100%' }}>
                    <div style={{ position: 'absolute' }} className={styles.tenantTitlefh}>任务中心</div>
                    {/*<span style={{ position: 'absolute', left: '25%', fontSize: '12px', top: 5, color: 'red' }}>数据仅展示前五条</span>*/}
                    <span
                        style={{ position: 'absolute', right: '0px', zIndex: '20' }}
                        className={styles.backBtnfhi}
                        onClick={() => {
                            navigate('TaskCenter')
                        }}
                    >
                        查看更多
                        <RightOutlined className={styles.backArrow} />
                    </span>
                </div>
                {/* 外层 Tab 容器 */}
                <Tabs
                    activeKey={serachType}
                    onChange={handleMainChange}
                    type='card'
                    items={mainTabItems}
                    size="small"
                    tabBarStyle={{ paddingLeft: '100px' }}
                />

            </div>
        );
    };

    return (
        <>
            <div className={styles.tenantBox}>
                <div style={{ background: '#fff' }}>
                    <NestedTabs />
                </div>
            </div>
            <ReviewDrawer ref={reviewRef} />
        </>
    );
};

export default TenantManagePage;
