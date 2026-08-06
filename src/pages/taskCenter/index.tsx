import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Button, Input, Select, Table, Space, Modal, Tabs, TimePicker, DatePicker, TreeSelect } from 'antd';
import { message } from '@/utils/AntdGlobal';
import { useNavigate } from 'react-router-dom'
import styles from './index.module.less';
const { SHOW_ALL } = TreeSelect;
const { RangePicker } = DatePicker;
//import AddHtml from './myActiviChild/activityAdd';
import request from '@/utils/request';
import { crossApiUserInfo } from '@/stores/crossapiStore';
import { ArrowLeftOutlined, ExclamationCircleTwoTone } from '@ant-design/icons';
import ReviewConfigDrawer from './reviewConfig';
import ReviewDrawer from './review';
import VersionHost from '../applicationList/versionHost';

// 添加类型定义
interface DataNumDetail {
    appNum?: string;
    compNum?: string;
    apptNum?: string;
    eleNum?: string;
}

interface DataNum {
    applyNum?: string;
    toDoNum?: string;
    overPlyNum?: string;
    toDoNumDetail?: DataNumDetail;
    applyNumDetail?: DataNumDetail;
    overPlyNumDetail?: DataNumDetail;
}
interface SubTabs {
    activeKey: string; // 或 number，根据你的业务场景调整
    onChange: (key: string) => void; // 回调函数的参数类型也需要明确
    dataNum:DataNum;
}
interface SubTabContent {
    tabKey: string;
}

const TenantManagePage: React.FC = () => {
    const navigate = useNavigate()
    const updeRefs = useRef<{ open: (data: any) => void }>();
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const nodeRef = useRef<{ open: () => void }>();
    const reviewRef = useRef<{ open: (data: any, callback?: () => void) => void }>();
    // let serachType: string = 'todo';
    const [serachType, setSerachType] = useState('todo');
    const handQuerys: any = {};
    // useEffect(() => {
    //     queryNumsFun();
    // }, []);

    const shared: any = {};

    // 子 Tab 内容组件（可根据需求自定义）
    const SubTabContent = ({ tabKey }: SubTabContent) => {
        // shared.handleReset?.();
        return (
            <div style={{ padding: 5, height: '100%' }}>
                <SearHtml tabKey={tabKey} />
            </div>
        );
    };

    //搜索条件区域
    const SearHtml = ({ tabKey }: SubTabContent) => {
        let markName = '应用名称';
        if (tabKey == 'ele') {
            markName = '元素名称';
        } else if (tabKey == 'comp') {
            markName = '组件名称';
        } else if (tabKey == 'appt') {
            markName = '模板名称';
        }
        const appTypeobj: any = {}; //应用分类3及数据集合
        
        // 使用 useRef 存储 Map 引用，组件卸载时自动清空
        const nodeMapRef = useRef<Map<any, any>>(new Map());
        
        // 组件卸载时清理 Map
        useEffect(() => {
            return () => {
                nodeMapRef.current.clear();
            };
        }, []);

        // 工具函数：平级数据 → treeData
        const buildTree = (typs: string, Ids: string, pIds: string, Levels: string, data: any) => {
            // 1. 清空并使用组件内部声明的 Map 用于快速查找节点
            nodeMapRef.current.clear();
            // 2. 初始化所有节点，添加 children 属性
            data.forEach((node: any) => {
                if (typs == 'app') {
                    if (formData.appCategory && node.appTypeCategory != formData.appCategory) {
                        return;
                    }
                    nodeMapRef.current.set(node[Ids], { ...node, label: node.appTypeName, value: node[Ids], children: [] });
                }
                if (typs == 'comp') {
                    if (formData.componentCategory && node.businessCategory != formData.componentCategory) {
                        return;
                    }
                    nodeMapRef.current.set(node[Ids], { ...node, label: node.businessName, value: node[Ids], children: [] });
                }
            });
            // 3. 构建树结构
            const tree: any = [];
            data.forEach((node: any) => {
                const treeNode = nodeMapRef.current.get(node[Ids]);
                if (typs == 'app'&& formData.appCategory && node.appTypeCategory != formData.appCategory) {
                    return;
                }
                if (typs == 'comp' && formData.componentCategory && node.businessCategory != formData.componentCategory) {
                    return;
                }
                if (node[Levels] === '1') {
                    // 一级节点（根节点）
                    tree.push(treeNode);
                } else if (node[Levels] === '2' || node[Levels] === '3') {
                    // 非一级节点，找到父节点并添加
                    const parent = nodeMapRef.current.get(node[pIds]);
                    if (parent) {
                        parent.children.push(treeNode);
                    }
                    if (typs == 'app' && node[Levels] === '3') {
                        appTypeobj[node.appTypeId] = [];
                    }
                } else {
                    /*const parent = nodeMapRef.current.get(node.pId);
                    if (parent) {
                        appTypeobj[node.pId].push(node.appTypeId);
                    }*/
                }
            });
            return tree;
        };
        const [appTypeIdArr, setappTypeIdArr] = useState([]); //
        const [businessIdArr, setbusinessIdArr] = useState([]); //
        const [elementTypeArr, setelementTypeArr] = useState([]); //
        const [expandedKeys, setExpandedKeys] = useState<string[]>([]); // 控制树节点的展开状态
        const [searchText, setSearchText] = useState(''); // 搜索文本
        const [filteredTreeData, setFilteredTreeData] = useState<any[]>([]); // 过滤后的树数据
        
        // 辅助函数：获取树中所有节点的key
        const getAllKeys = (treeData: any[]): string[] => {
            const keys: string[] = [];
            const traverse = (nodes: any[]) => {
                nodes.forEach((node: any) => {
                    keys.push(node.value);
                    if (node.children && node.children.length > 0) {
                        traverse(node.children);
                    }
                });
            };
            traverse(treeData);
            return keys;
        };

        // 辅助函数：获取包含匹配结果的节点路径的keys
        const getMatchedExpandedKeys = (treeData: any[], searchValue: string): string[] => {
            const expandedKeysSet = new Set<string>();
            
            // 递归查找匹配的节点
            const findMatches = (nodes: any[], parentKeys: string[] = []): boolean => {
                let hasMatch = false;
                
                nodes.forEach((node: any) => {
                    const currentPath = [...parentKeys, node.value];
                    const label = node.label?.toLowerCase() || '';
                    const title = node.title?.toLowerCase() || '';
                    
                    const isMatch = label.includes(searchValue) || title.includes(searchValue);
                    
                    // 检查子节点是否有匹配
                    let childHasMatch = false;
                    if (node.children && node.children.length > 0) {
                        childHasMatch = findMatches(node.children, currentPath);
                    }
                    
                    if (isMatch || childHasMatch) {
                        hasMatch = true;
                        // 将父节点路径中的所有节点添加到展开keys中
                        parentKeys.forEach(key => expandedKeysSet.add(key));
                    }
                });
                
                return hasMatch;
            };
            
            findMatches(treeData);
            return Array.from(expandedKeysSet);
        };

        // 辅助函数：过滤树数据，只保留匹配的节点及其父节点
        const filterTreeData = (treeData: any[], searchValue: string): any[] => {
            if (!searchValue) return treeData;

            const filterNode = (nodes: any[]): any[] => {
                return nodes.reduce((filteredNodes: any[], node: any) => {
                    const label = String(node.label || '').toLowerCase();
                    const title = String(node.title || '').toLowerCase();
                    const isMatch = label.includes(searchValue) || title.includes(searchValue);

                    // 递归过滤子节点
                    const filteredChildren = node.children && node.children.length > 0
                        ? filterNode(node.children)
                        : [];

                    // 如果当前节点匹配或有匹配的子节点，则保留该节点
                    if (isMatch || filteredChildren.length > 0) {
                        filteredNodes.push({
                            ...node,
                            children: filteredChildren
                        });
                    }

                    return filteredNodes;
                }, []);
            };

            return filterNode(treeData);
        };

        // 更新过滤后的树数据
        const updateFilteredTreeData = () => {
            setFilteredTreeData(filterTreeData(appTypeIdArr, searchText.toLowerCase()));
        };

        useEffect(() => {
            const allKeys = getAllKeys(filteredTreeData);
            setExpandedKeys(allKeys);
        }, [filteredTreeData]);

        // 监听 appTypeIdArr 或 searchText 变化时更新过滤数据
        useEffect(() => {
            updateFilteredTreeData();
        }, [appTypeIdArr, searchText]);

        const [queryList, setqueryList] = useState(); //
        const [loading, setLoading] = useState(false); //
        const [total, setTotal] = useState(0);
        const reviewTypeArr = [
            { label: '请选择', value: '' },
            { label: '发布', value: 'publish' },
            { label: '上架', value: 'up' },
            { label: '下架', value: 'down' },
            { label: '回滚', value: 'rollback' },
        ];
        const appCategory = [
            { label: '请选择', value: '' },
            { label: '生产应用', value: '1' },
            { label: '运营应用', value: '2' },
        ];
        const componentCategory = [
            { label: '请选择', value: '' },
            { label: '生产组件', value: '1' },
            { label: '运营组件', value: '2' },
        ];
        const markType = [
            { label: '应用模板', value: 'appt' },
            { label: '组件模板', value: 'compt' },
        ];
        const [dataTypeArr, setdataTypeArr] = useState([
            { label: '请选择', value: '' },
            { label: '生产应用', value: '1' },
            { label: '运营应用', value: '2' },
        ]);

        const elementPageType = [
            { label: '标准页面', value: '1' },
            { label: '大屏页面', value: '2' },
        ];
        const reviewState = [
            { label: '请选择', value: '' },
            { label: '应用发布提交', value: 'pubSub' },
            { label: '网络安全审核', value: 'netSafe' },
            { label: '数据安全审核', value: 'dataSafe' },
            { label: '应用发布审核', value: 'app' },
            { label: '一致性确认', value: 'once' },
            { label: '应用上架提交', value: 'upSub' },
            { label: '上架审核', value: 'up' },
            { label: '应用下架提交', value: 'downSub' },
            { label: '下架审核', value: 'down' },
            { label: '下架公示', value: 'downNotice' },
            { label: '应用回滚提交', value: 'rollbackSub' },
            { label: '回滚审核', value: 'rollback' },
        ];
        const containerRef = useRef<HTMLDivElement>(null);
        
        // 计算表格内容区域的最大高度
        const [tableScrollY, setTableScrollY] = useState(300);
        
        const [formData, setFormData] = useState({
            tabKeys: tabKey,
            serachType: serachType,
            reviewType: '', // 审核类型
            markName: '', // 应用名称
            appCategory: '', //应用类别
            appTypeId: '', // 应用分类,
            componentCategory: '', //组件类别
            businessId: '', //业务分类
            elementTypeId: '', //元素分类
            markType: tabKey, //模板类型
            dataType: '', //模板类别
            elementPageType: '1', //页面布局
            reviewState: '', //当前环节
            applyStaffId: '', //提交人工号
            desc: '', //描述
            startTime: '', //开始时间
            endTime: '', //结束时间
            staffId: userInfo.staffId,
            isAdmin: userInfo.isAdmin || '0',
            page: 1, // 当前页码
            start: 0,
            limit: 10,
        });
        
        // 动态计算表格高度
        const calculateTableHeight = useCallback(() => {
            // 查找搜索区域元素
            const searchArea = document.querySelector(`.${styles.tenantContent}`);
            if (searchArea && containerRef.current) {
                const searchAreaHeight = (searchArea as HTMLElement).offsetHeight;
                // 表格高度 = 父容器高度 - 其他padding/margin
                const parentHeight = containerRef.current?.offsetHeight || 0;
                const calculatedHeight = parentHeight - 130; // 130px为其他间距
                setTableScrollY(Math.max(calculatedHeight, 40)); // 最小高度40px
            }
        }, []);
        useEffect(() => {
            appTypeIdTypeFun();
        }, [formData.appCategory, formData.tabKeys]);

        useEffect(() => {
             yyTypeIdTypeFun();
        }, [formData.componentCategory, formData.tabKeys]);

        useEffect(() => {
            formData.markType == 'appt' ? setdataTypeArr(appCategory) : setdataTypeArr(componentCategory);
        }, [formData.markType, formData.tabKeys]);
        useEffect(() => {
            setLoading(true)
            queryListFun();
            tabKey == 'ele' && eleTypeFun();
        }, [serachType, formData.tabKeys]);
        
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
        
        // useEffect(() => {}, []);
        const queryListFun = () => {
            try {
                request
                    .post('/appReview/queryAppReviewList', {
                        params: {
                            ...formData,
                            serachType: serachType,
                        },
                    })
                    .then((res) => {
                        setLoading(false)
                        setqueryList(res?.beans);
                        setTotal(res?.bean.total)
                        handQuerys.queryNumsFun?.();
                    })
                    .catch((err) => {});
            } catch (error) {
                message.error('列表查询失败');
            } finally {
            }
        };
        const handleTableChange = (page: number, pageSize: number) => {
            setFormData((prev) => ({
                ...prev,
                page: page,
                limit: pageSize,
                start: (page - 1) * pageSize,
            }));
        };
        useEffect(() => {
            setLoading(true)
            queryListFun();
        }, [formData.page, formData.limit, formData.tabKeys]);
        // 重置按钮点击事件
        const handleReset = () => {
            setFormData((prev) => ({
                ...prev,
                tabKeys: tabKey,
                serachType: serachType,
                reviewType: '', // 审核类型
                markName: '', // 应用名称
                appCategory: '', //应用类别
                appTypeId: '', // 应用分类,
                componentCategory:'', //组件类别
                businessId: '', //业务分类
                elementTypeId: '', //元素分类
                markType: tabKey, //模板类型
                dataType: '', //模板类别
                elementPageType: '1', //页面布局
                reviewState: '', //当前环节
                applyStaffId: '', //提交人工号
                desc: '', //描述
                startTime: '', //开始时间
                endTime: '', //结束时间
                staffId: userInfo.staffId,
                isAdmin: userInfo.isAdmin || '0',
                page: 1,
                start: 0,
                limit: 10,
            }));
            setRangeTime(null);
            setSearchText(''); // 清空搜索文本
        };
        shared.handleReset = handleReset;
        const TimeChange = (values: any) => {
            if (values) {
                setFormData((prev: any) => ({
                    ...prev,
                    startTime: values[0].format('YYYY-MM-DD HH:mm:ss'), //开始时间
                    endTime: values[1].format('YYYY-MM-DD HH:mm:ss'), //结束时间
                }));
            }
            setRangeTime(values);
        };
        // 组件分类查询
        const yyTypeIdTypeFun = () => {
            try {
                request
                    .post('/appComponentBusiness/queryComponentBusinessList', {
                        params: { provId: '' },
                    })
                    .then((res) => {
                        const fsfsdf = buildTree('comp', 'businessId', 'parentId', 'businessLevel', res?.beans);
                        setbusinessIdArr(fsfsdf);
                    })
                    .catch((err) => {});
            } catch (error) {
                message.error('应用分类查询失败');
            } finally {
            }
        };
        // 应用分类查询
        const appTypeIdTypeFun = () => {
            try {
                request
                    .post('/appType/queryAppTypeList', {
                        params: {},
                    })
                    .then((res) => {
                        const fsfsdf = buildTree('app', 'appTypeId', 'pId', 'typeLevel', res?.beans);
                        setappTypeIdArr(fsfsdf);
                    })
                    .catch((err) => {});
            } catch (error) {
                message.error('应用分类查询失败');
            } finally {
            }
        };
        // 元素分类查询
        const eleTypeFun = () => {
            try {
                request
                    .post('/element/queryElementTypeList', {
                        params: {},
                    })
                    .then((res) => {
                        const arr = res?.beans;
                        arr.unshift({
                            elementTypeName: '请选择',
                            elementTypeId: '',
                        });
                        const typeList = arr.map((item: any) => ({
                            label: item.elementTypeName,
                            value: item.elementTypeId,
                        }));
                        setelementTypeArr(typeList);
                    })
                    .catch((err) => {});
            } catch (error) {
                message.error('应用分类查询失败');
            } finally {
            }
        };

        const onverClick = (record:any) => {
            record.id=record.markId;
            record.belongVersion=record.markVersion;
            updeRefs.current?.open(record);
        };
        let markNameLi = '应用';
        let tegoryLi = 'appCategory';//类别
        let typeIdLi = 'appTypeName';//分类
        if (tabKey == 'ele') {
            markNameLi = '元素';
            typeIdLi = 'elementTypeId';
        } else if (tabKey == 'comp') {
            markNameLi = '组件';
            tegoryLi = 'componentCategory';
            typeIdLi = 'businessId';
        } else if (tabKey == 'appt') {
            markNameLi = '模板';
            tegoryLi = 'dataType';
        }
        const columns: any = [
            {
                title: '操作',
                key: 'action',
                width:50,
                render: (text: string, record: any) => {
                    return (
                        <Space size="middle">
                            <a
                                className={styles.actionBtn}
                                // onClick={() => {
                                //     message.warning('暂不具备该能力');
                                // }}
                                onClick={() => {
                                    reviewRef.current?.open(record, queryListFun);
                                }}
                            >
                                审核
                            </a>
                        </Space>
                    );
                },
                hidden: serachType !== 'todo',
            },
            {
                title: '工单流水',
                width:200,
                dataIndex: 'reviewNo',
                key: 'reviewNo',
                render: (text: string, record: any) => {
                    return (
                        <a
                            className={styles.actionBtn}
                            onClick={() => {
                               onverClick(record);
                            }}
                        >
                            {text}
                        </a>
                )}
            },
            {
                title:'审核类型',
                 width:100,
                dataIndex: 'reviewType',
                key: 'reviewType',
                render: (text: string, record: any) => {
                    return reviewTypeArr.map((item) => item.value == text && <span>{item.label}</span>);
                },
            },
            {
                title: markNameLi+'名称',
                dataIndex: 'markName',
                key: 'markName',
                ellipsis: true
            },
            {
                title:  serachType === 'overPly'?'操作环节':'当前环节',
                 width:100,
                dataIndex: 'reviewState',
                key: 'reviewState',
                render: (text: string, record: any) => {
                    return reviewState.map((item) => item.value == text && <span>{item.label}</span>);
                },
            },
            {
                title:'模板类型',
                width:90,
                dataIndex: 'markType',
                key: 'markType',
                hidden:tabKey !== 'appt',
                render: (text: string, record: any) => {
                    return text==='appt'?'应用模板':'组件模板';
                }
            },
            {
                title:markNameLi+'类别',
                width:90,
                dataIndex:tegoryLi,
                key: tegoryLi,
                hidden:tabKey === 'ele',
                render: (text: string, record: any) => {
                    if(tabKey === 'app'){
                        return text==='1'?'生产应用':'运营应用';
                    }
                }
            },
            {
                title: markNameLi+'分类',
                width:100,
                dataIndex: typeIdLi,
                key: typeIdLi,
                hidden:tabKey === 'appt'
            },
            {
                title:'页面布局',
                width:90,
                dataIndex: 'elementPageType',
                key: 'elementPageType',
                hidden:tabKey !== 'ele',
                render: (text: string, record: any) => {
                    return text==='1'?'标准页面':'大屏页面';
                },
            },
            {
                title: '归属租户',
                width:100,
                dataIndex: 'provName',
                key: 'provName',
            },
            {
                title: '归属项目',
                dataIndex: 'projectName',
                key: 'projectName',
                hidden:tabKey !== 'app',
                ellipsis: true
            },
            {
                title: '应用描述',
                dataIndex: 'desc',
                key: 'desc',
                width:200,
                ellipsis: true,
            },
        ];
        const [rangeTime, setRangeTime] = useState(null);
        return (
            <div className={styles.tenantBox}>
                <div style={{ height: '5px' }}></div>
                <div className={styles.tenantSearch}>
                    <div className={styles.searchCon}>
                        <div className={styles.searchItem}>
                            <label>审核类型</label>
                            <div className={styles.inputItem}>
                                <Select
                                    value={formData.reviewType}
                                    options={reviewTypeArr}
                                    onChange={(value) => setFormData((prev: any) => ({ ...prev, reviewType: value }))}
                                />
                            </div>
                        </div>
                        <div className={styles.searchItem}>
                            <label>{markName}</label>
                            <div className={styles.inputItem}>
                                <Input
                                    placeholder="请输入"
                                    value={formData.markName}
                                    onChange={(e) =>
                                        setFormData((prev: any) => ({
                                            ...prev,
                                            markName: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>
                        {tabKey == 'app' && (
                            <div className={styles.searchItem}>
                                <label>应用类别</label>
                                <div className={styles.inputItem}>
                                    <Select
                                        value={formData.appCategory}
                                        options={appCategory}
                                        onChange={(value) => {
                                            setFormData((prev: any) => ({ ...prev, appCategory: value }));
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                        {tabKey == 'app' && (
                            <div className={styles.searchItem}>
                                <label>应用分类</label>
                                <div className={styles.inputItem}>
                                    <TreeSelect
                                        treeData={filteredTreeData}
                                        placeholder="请选择三级节点"
                                        showSearch
                                        allowClear
                                        treeExpandedKeys={expandedKeys}
                                        onTreeExpand={(expandedKeysValue: any[]) => {
                                            setExpandedKeys(expandedKeysValue);
                                        }}
                                        showCheckedStrategy={SHOW_ALL}
                                        style={{ width: '100%' }}
                                        value={formData.appTypeId} // 受控模式
                                        onSearch={(value: string) => {
                                            setSearchText(value);
                                            if (!value) {
                                                // 搜索框为空时，展开所有节点
                                                const allKeys = getAllKeys(appTypeIdArr);
                                                setExpandedKeys(allKeys);
                                            } else {
                                                // 搜索时，只展开包含匹配结果的节点路径
                                                const matchedExpandedKeys = getMatchedExpandedKeys(appTypeIdArr, value.toLowerCase());
                                                setExpandedKeys(matchedExpandedKeys);
                                            }
                                        }}
                                        onChange={(value: any) => {
                                            setSearchText('');
                                            setFormData((prev: any) => ({ ...prev, appTypeId: '' }));
                                        }}
                                        onFocus={() => {
                                            // 获得焦点时，如果是首次打开且有数据，展开所有节点
                                            if (expandedKeys.length === 0 && appTypeIdArr.length > 0) {
                                                const allKeys = getAllKeys(appTypeIdArr);
                                                setExpandedKeys(allKeys);
                                            }
                                        }}
                                        filterTreeNode={(inputValue, treeNode) => {
                                            // 自定义搜索过滤逻辑，支持搜索label和title
                                            const label = String(treeNode.label || '');
                                            const title = String(treeNode.title || '');
                                            const searchValue = inputValue.toLowerCase();
                                            return label.toLowerCase().includes(searchValue) || title.toLowerCase().includes(searchValue);
                                        }}
                                        onSelect={(value: string, node: any) => {
                                            // node.pos 格式：0-0-0 数字个数 = 层级
                                            const level = node.typeLevel;
                                            if (level !== '3') {
                                                message.warning('只能选择三级节点');
                                                setFormData((prev: any) => ({ ...prev, appTypeId: '' }));
                                                setSearchText('');
                                                return false; // 阻止选中
                                            }
                                            setFormData((prev: any) => ({ ...prev, appTypeId: value }));
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                        {tabKey == 'comp' && (
                            <div className={styles.searchItem}>
                                <label>组件类别</label>
                                <div className={styles.inputItem}>
                                    <Select
                                        value={formData.componentCategory}
                                        options={componentCategory}
                                        onChange={(value) => setFormData((prev: any) => ({ ...prev, componentCategory: value }))}
                                    />
                                </div>
                            </div>
                        )}
                        {tabKey == 'comp' && (
                            <div className={styles.searchItem}>
                                <label>业务分类</label>
                                <div className={styles.inputItem}>
                                    <TreeSelect
                                        treeData={businessIdArr}
                                        placeholder="请选择"
                                        showSearch
                                        treeDefaultExpandAll
                                        showCheckedStrategy={SHOW_ALL}
                                        style={{ width: '100%' }}
                                        value={formData.businessId} // 受控模式
                                        onSelect={(value: string, node: any) => {
                                            setFormData((prev: any) => ({ ...prev, businessId: value }));
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                        {tabKey == 'ele' && (
                            <div className={styles.searchItem}>
                                <label>元素分类</label>
                                <div className={styles.inputItem}>
                                    <Select
                                        value={formData.elementTypeId}
                                        options={elementTypeArr}
                                        onChange={(value) => setFormData((prev: any) => ({ ...prev, elementTypeId: value }))}
                                    />
                                </div>
                            </div>
                        )}
                        {tabKey == 'appt' && (
                            <div className={styles.searchItem}>
                                <label>模板类型</label>
                                <div className={styles.inputItem}>
                                    <Select
                                        value={formData.markType}
                                        options={markType}
                                        onChange={(value) => setFormData((prev: any) => ({ ...prev, markType: value }))}
                                    />
                                </div>
                            </div>
                        )}
                        {tabKey == 'appt' && (
                            <div className={styles.searchItem}>
                                <label>模板类别</label>
                                <div className={styles.inputItem}>
                                    <Select
                                        value={formData.dataType}
                                        options={dataTypeArr}
                                        onChange={(value) => setFormData((prev: any) => ({ ...prev, dataType: value }))}
                                    />
                                </div>
                            </div>
                        )}
                        {tabKey == 'ele' && (<div className={styles.searchItem}>
                            <label>页面布局</label>
                            <div className={styles.inputItem}>
                                <Select
                                    value={formData.elementPageType}
                                    options={elementPageType}
                                    onChange={(value) => setFormData((prev: any) => ({ ...prev, elementPageType: value }))}
                                />
                            </div>
                        </div>)}
                        <div className={styles.searchItem}>
                            <label>{serachType === 'overPly'?'操作环节':'当前环节'}</label>
                            <div className={styles.inputItem}>
                                <Select
                                    value={formData.reviewState}
                                    options={reviewState}
                                    onChange={(value) => setFormData((prev: any) => ({ ...prev, reviewState: value }))}
                                />
                            </div>
                        </div>

                        <div className={styles.searchItem}>
                            <label>应用描述</label>
                            <div className={styles.inputItem}>
                                <Input
                                    placeholder="请输入"
                                    value={formData.desc}
                                    onChange={(e) =>
                                        setFormData((prev: any) => ({
                                            ...prev,
                                            desc: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>
                        {/* <div className={styles.searchItem}>
                            <label>提交人工号</label>
                            <div className={styles.inputItem}>
                                <Input
                                    value={formData.applyStaffId}
                                    onChange={(e) =>
                                        setFormData((prev: any) => ({
                                            ...prev,
                                            applyStaffId: e.target.value,
                                        }))
                                    }
                                    placeholder="请输入"
                                />
                            </div>
                        </div> */}
                        <div className={styles.searchItem}>
                            <label>提交时间</label>
                            <div className={styles.inputItem}>
                                <RangePicker
                                    showTime={{
                                        format: 'HH:mm:ss',
                                    }}
                                    value={rangeTime}
                                    format="YYYY-MM-DD HH:mm:ss"
                                    onChange={TimeChange}
                                    placeholder={['开始时间', '结束时间']}
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </div>
                        <div style={{ marginLeft: '0px' }} className={[styles.searchItem, styles.searchBtnItem].join(' ')}>
                            <Button
                                className={[styles.searchBtn, styles.searchQuery].join(' ')}
                                onClick={() => {
                                    setLoading(true)
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
                <div className={styles.tenantContent} ref={containerRef}>
                    <div className={styles.tenantTitle}>查询列表</div>
                    <Table
                        rowKey="id"
                        size="small"
                        columns={columns}
                        loading={loading}
                        dataSource={queryList}
                        pagination={{
                            current: formData.page,
                            pageSize: formData.limit,
                            total: total,
                            showSizeChanger: true,
                            pageSizeOptions: ['5', '10', '20', '50'],
                            showQuickJumper: true,
                            showTotal: (total) => `共 ${total} 条记录`,
                            locale: { items_per_page: '/页' },
                            onChange: handleTableChange,
                        }}
                        {...(tableScrollY < ((formData.limit || 10) * 40) ? { scroll: { y: `${tableScrollY}px` } } : {})}
                    />
                </div>
                <VersionHost
                    onrefFun={() => {''}}
                    ref={updeRefs}
                />
            </div>
        );
    };
    // 嵌套 Tab 主组件
    const NestedTabs = () => {
        // 外层 Tab 状态（默认选中第一个外层 Tab）
        // const [activeMainTab, setActiveMainTab] = useState('todo');
        // 子 Tab 状态（默认选中第一个子 Tab，所有外层 Tab 共用这个状态）
        const [activeSubTab, setActiveSubTab] = useState('app');
        // 切换主 Tab 时：重置子 Tab
        const handleMainChange = (key: string) => {
            // setActiveMainTab(key);
            setSerachType(key);
            setActiveSubTab('app'); // ✅ 核心：切换主Tab → 子Tab自动刷新重置
            // serachType = key;
        };

        const [dataNum, setdatanum] = useState({
            toDoNum: '',
            toDoNumDetail: {
                appNum: '',
                apptNum: '',
                compNum: '',
                eleNum: '',
            },
            applyNum: '',
            applyNumDetail: {
                appNum: '',
                apptNum: '',
                compNum: '',
                eleNum: '',
            },
            overPlyNum: '',
            overPlyNumDetail: {
                appNum: '',
                apptNum: '',
                compNum: '',
                eleNum: '',
            },
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
                        setdatanum((prev: any) => ({
                            ...prev,
                            toDoNum: res?.bean?.toDoNum || '0',
                            toDoNumDetail: {
                                appNum: res?.bean?.toDoNumDetail?.appNum || '0',
                                apptNum: res?.bean?.toDoNumDetail?.apptNum || '0',
                                compNum: res?.bean?.toDoNumDetail?.compNum || '0',
                                eleNum:res?.bean?.toDoNumDetail?.eleNum || '0',
                            },
                            applyNum: res?.bean?.applyNum || '0',
                            applyNumDetail: {
                                appNum: res?.bean?.applyNumDetail?.appNum || '0',
                                apptNum: res?.bean?.applyNumDetail?.apptNum || '0',
                                compNum: res?.bean?.applyNumDetail?.compNum || '0',
                                eleNum:res?.bean?.applyNumDetail?.eleNum || '0',
                            },
                            overPlyNum: res?.bean?.overPlyNum || '0',
                            overPlyNumDetail: {
                                appNum: res?.bean?.overPlyNumDetail?.appNum || '0',
                                apptNum: res?.bean?.overPlyNumDetail?.apptNum || '0',
                                compNum: res?.bean?.overPlyNumDetail?.compNum || '0',
                                eleNum:res?.bean?.overPlyNumDetail?.eleNum || '0',
                            },
                        }));
                    })
                    .catch((err) => {});
            } catch (error) {
                message.error('列表查询失败');
            } finally {
            }
        };
        handQuerys.queryNumsFun = queryNumsFun;

        // 外层 Tab 项配置
        const mainTabItems = [
            {
                key: 'todo',
                label: (
                    <span>
                        我的待办<span style={{ color: 'red' }}>（{dataNum.toDoNum}）</span>
                    </span>
                ),
                // 外层 Tab1 的内容：仅承载子 Tab 组件
                children: <SubTabs activeKey={activeSubTab} onChange={setActiveSubTab} dataNum={dataNum} />,
            },
            {
                key: 'apply',
                label: (
                    <span>
                        我申请的 <span style={{ color: 'red' }}>（{dataNum.applyNum}）</span>
                    </span>
                ),
                // 外层 Tab2 同样承载子 Tab 组件（共用同一套子 Tab）
                children: <SubTabs activeKey={activeSubTab} onChange={setActiveSubTab} dataNum={dataNum} />,
            },
            {
                key: 'overPly',
                label: (
                    <span>
                        我的已办 <span style={{ color: 'red' }}>（{dataNum.overPlyNum}）</span>
                    </span>
                ),
                // 外层 Tab3 同样承载子 Tab 组件（共用同一套子 Tab）
                children: <SubTabs activeKey={activeSubTab} onChange={setActiveSubTab} dataNum={dataNum} />,
            },
        ];

        return (
            <div className={styles.mainTabs} style={{ margin: '0px auto', position: 'relative' }}>
                {/* 外层 Tab 容器 */}
                <Tabs
                    activeKey={serachType}
                    onChange={handleMainChange}
                    items={mainTabItems}
                    size="large"
                    tabBarStyle={{ paddingLeft: '10px', marginBottom: 0 }}
                    destroyInactiveTabPane={true}
                />
                <Button
                    style={{ position: 'absolute', right: '5px', top: '6px', cursor: 'pointer' }}
                    className={[styles.searchBtn, styles.searchQuery].join(' ')}
                    onClick={() => {
                        nodeRef.current?.open();
                    }}
                    type="primary"
                >
                    审核人员配置
                </Button>
            </div>
        );
    };

    // 抽离的子 Tab 组件（供外层 Tab 共用）
    const SubTabs = ({ activeKey, onChange, dataNum }: SubTabs) => {
        // 4 个子 Tab 配置
        const subTabItems = [
            {
                key: 'app',
                label: (
                    <span>
                        应用 <span style={{ color: 'red' }}>
                        ({serachType === 'todo'
                            ? dataNum?.toDoNumDetail?.appNum
                            : serachType === 'apply'
                            ? dataNum?.applyNumDetail?.appNum
                            : dataNum?.overPlyNumDetail?.appNum
                        })
                            </span>
                    </span>
                ),
                children: <SubTabContent tabKey={'app'} />,
            },
            {
                key: 'comp',
                label: (
                    <span>
                        组件 <span style={{ color: 'red' }}>
                           ({serachType === 'todo'
                                ? dataNum?.toDoNumDetail?.compNum
                                : serachType === 'apply'
                                ? dataNum?.applyNumDetail?.compNum
                                : dataNum?.overPlyNumDetail?.compNum
                            })

                        </span>
                    </span>
                ),
                children: <SubTabContent tabKey={'comp'} />,
            },
            {
                key: 'ele',
                label: (
                    <span>
                        元素 <span style={{ color: 'red' }}>
                            
                            ({serachType === 'todo'
                                ? dataNum?.toDoNumDetail?.eleNum
                                : serachType === 'apply'
                                ? dataNum?.applyNumDetail?.eleNum
                                : dataNum?.overPlyNumDetail?.eleNum
                            })
                        </span>
                    </span>
                ),
                children: <SubTabContent tabKey={'ele'} />,
            },
            {
                key: 'appt',
                label: (
                    <span>
                        模板 <span style={{ color: 'red' }}>
                            ({serachType === 'todo'
                                ? dataNum?.toDoNumDetail?.apptNum
                                : serachType === 'apply'
                                ? dataNum?.applyNumDetail?.apptNum
                                : dataNum?.overPlyNumDetail?.apptNum
                            })
                        </span>
                    </span>
                ),
                children: <SubTabContent tabKey={'appt'} />,
            },
        ];

        return (
            <Tabs
                size="small"
                activeKey={activeKey}
                onChange={onChange}
                items={subTabItems}
                tabBarStyle={{ paddingLeft: '10px', marginBottom: 0 }}
                destroyInactiveTabPane={true}
            />
        );
    };
    return (
        <>
            <div className={styles.tenantBox}>
                <div className={styles.tenantTop}>
                    <div className={styles.tenantTitle}>任务中心</div>
                    <span
                        className={styles.backBtn}
                        onClick={() => {
                            navigate(-1)
                        }}
                    >
                        <ArrowLeftOutlined className={styles.backArrow} />
                        返回工作台
                    </span>
                </div>
                <div style={{ background: '#fff', height: 'calc(100% - 40px)' }}>
                    <NestedTabs />
                </div>
            </div>
            <ReviewConfigDrawer ref={nodeRef} />
            <ReviewDrawer ref={reviewRef} />
        </>
    );
};

export default TenantManagePage;
