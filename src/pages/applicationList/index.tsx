import React, { useState, useEffect, useRef, useCallback } from 'react';
import { objectToFormData } from '@/utils/objectToFormData'; // 对象转 FormData 工具函数
import { publictData } from '../../utils/appMenuData';
import { menu } from '@/stores/menuStore';
import { ExclamationCircleTwoTone } from '@ant-design/icons';
import { crossApiUserInfo } from '@/stores/crossapiStore';
import CrossAPI from '../../utils/crossAPI';
import { baseApiConvert } from '../../utils/util';
import { AppProvider } from '@/utils/AppProvider';
import { Table, Button, Checkbox, Input, Space, Tag, Select, Row, Col, Form, Tabs, Modal, App, Tooltip, TreeSelect } from 'antd';
import { message } from '@/utils/AntdGlobal';
import { CloseOutlined, CloseCircleOutlined } from '@ant-design/icons';
import BaseCanvasPage from '@/pages/applicationOrchestration/pageCanvas/baseCanvasPage/index';
import ApplicationOrchestration from '@/pages/applicationOrchestration/index';
import { useShallow } from 'zustand/react/shallow';
import PageCanvas from '@/pages/applicationOrchestration/pageCanvas';
import CascadeSelect from '@/pages/applicationOrchestration/CascadeSelect';
import CascadeSelects from '@/pages/applicationOrchestration/CascadeSelects';
import BackCall from './backrelation'; //名称详情
import Upcheckty from './upcheckty'; //上架详情
import folderIcon from './asset/folder.png';
import request from '@/utils/request';
import recodeLog from '../../utils/operLog';
import { hasPermission } from '../../config/permissionConfig';
const { TabPane } = Tabs;

import './appList.less';
import styles from './index.module.less';
import AppDetail from './AppDetail';
import OffshelfModal from './OffshelfModal';
import SubmitReviewDrawer from './SubmitReviewDrawer';
import AppEvaluationModal from './AppEvaluationModal/AppEvaluationModal'

import { render } from 'less';

// 定义接收初始参数的接口
interface InitialParams {
    id?: string;         // 复制的应用ID
    copyFrom?: any
}

// 定义组件Props接口
interface AppListProps {
    initialParams?: InitialParams; // 从openMenu传递过来的初始参数
}

interface AppTemptypeData {
    pId: string;
    typeLevel: string;
    appTypeCategory: string;
    appTypeId: string;
    appTypeName: string;
}
export interface AppItem {
    isNewVersion: string;
    isLast: string;
    appTypeName: any;
    serviceTypeId: any;
    appTypeId: any;
    sceneId: any;
    id: string;
    name: string;
    category: string;
    level: string;
    type: string;
    status: string;
    description: string;
    appName: string;
    appStatus: string;
    appDesc: string;
    appCategory: string;
    appLevel: string;
    sceneType: string;
    provId: string;
    shareProv: string;
    firstSolutionRate: string;
    appSatisfaction: string;
    sevenDayClicks: string;
    createStaffId: string;
    updateStaffId: string;
    createTime: string;
    updateTime: string;
    devStaff?: string;
    devNo?: string;
    relationId?: string;
    projectId: string;
    isCreateMenu: string;
    firstUpTime?: string;
    evaluateState?: string;
    copyFrom?: any;
}

// 平铺的三级类目数据结构
interface FlatCategory {
    createStaffId: string;
    appTypeId: string;
    appTypeCategory: string;
    appTypeName: string;
    typeLevel: string;
    updateStaffId: string;
    pId: string;
}

// 转换后的树形结构（可选，用于兼容现有代码）
interface Category {
    value: string;
    label: string;
    children?: Category[];
}
const provinceMap = publictData.provinceSelectValue;

// 选择框选项数据
const moduleOptions = publictData.appBelongModuleArr;

const statusOptions = publictData.schemeStateArr;
const statusOptionsNew = publictData.schemeStateArr.filter(item => item.label !== '删除');

const appLevelOptions = publictData.appListLevelArr;

const displayFormOptions = publictData.showFormArr;
const showAreaOptions = publictData.showAreaArr; //展示区域
const shareProv = [{ label: '全网', value: '0000', id: '0000' }];
const provinceOptions = shareProv.concat(publictData.provinceSelectValue);

const AppList: React.FC<AppListProps> = ({ initialParams }) => {
    const { message } = App.useApp();
    const menuStore = menu((state) => state)
    // 创建本地状态来管理初始参数，以便在需要时可以重置
    const [currentInitialParams, setCurrentInitialParams] = useState<InitialParams | undefined>(initialParams);
    const [selectedTitle, setSelectedTitle] = useState<string>('应用列表');
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);

    const nodeRef = useRef<{ open: (data: any) => void; close: () => void }>();
    const updeRef = useRef<{ open: (data: any) => void }>();

    // 标签溢出检测相关状态
    const tagItemBoxRef = useRef<HTMLDivElement>(null);
    const [visibleCount, setVisibleCount] = useState<number | null>(null);
    const [hiddenTags, setHiddenTags] = useState<{name: string, id: string, originalIndex: number}[]>([]);

    const [appTypeList, setAppTypeList] = useState<AppTemptypeData[]>([]);

    // 应用标签列表数据
    const [appTagList, setAppTagList] = useState<AppTemptypeData[]>([]);

    // 共享弹窗相关状态
    const [appDetail, setAppDetail] = useState<any>(null);

    // 提交审核抽屉相关状态
    const [submitReviewDrawerVisible, setSubmitReviewDrawerVisible] = useState(false);
    const pageCanvasRef = useRef<any>(null);

    // 打开提交审核抽屉
    const handleOpenSubmitReviewDrawer = () => {
        setSubmitReviewDrawerVisible(true);
    };

    // 关闭提交审核抽屉
    const handleCloseSubmitReviewDrawer = () => {
        setSubmitReviewDrawerVisible(false);
    };

    // 处理抽屉中的提交操作
    const handleSubmitReview = async (pubSubInfo: any) => {
        if (pageCanvasRef.current && pageCanvasRef.current.submitReview) {
            const success = await pageCanvasRef.current.submitReview(pubSubInfo);
            return success;
        }
        return false;
    };

    const [shareModalVisible, setShareModalVisible] = useState(false);

    // 评估弹框
    const [appEvaluationModalVisible, setAppEvaluationModalVisible] = useState(false);
    const [modalKey, setModalKey] = useState(0);

    //应用分类弹窗
    const [modalVisible, setModalVisible] = useState(false);

    // 应用标签弹窗
    const [tagModalVisible, setTagModalVisible] = useState(false);

    // 应用标签ID和名称
    const [selTagTypeId, setSelTagTypeId] = useState<string>('');
    const [selTagTypeName, setSelTagTypeName] = useState<string>('');

    const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);
    const [allSelected, setAllSelected] = useState(false);
    const currentUserProvince = userInfo.provinceId;
    // 控制显示哪个组件的状态变量，0: AppList, 1: AppDetail
    const [displayMode, setDisplayMode] = useState<number>(0);
    // 当前选中的应用ID
    const [selectedAppId, setSelectedAppId] = useState<string>('');
    const [selectedAppData, setSelectedAppData] = useState<object>({});

    // 应用分类ID
    const [selAppTypeId, setSelAppTypeId] = useState<string>('');

    // 所有三级类目数据（从接口获取）
    const [allFlatData, setAllFlatData] = useState<any[]>([]);
    const [deleteVisible, setDeleteVisible] = useState(false); // 删除二次确认弹窗显隐
    const [activeRecord, setActiveRecord] = useState<AppItem>(); // 操作的数据
    const [pointOut, setPointOut] = useState<string>(''); // 提示语
    const [isDelete, setIsDelete] = useState(false); // 是否为删除
    const [offshelfModalVisible, setOffshelfModalVisible] = useState(false); // 下架申请弹窗显隐

    // 创建部门树形相关状态
    const [orgaTreeData, setOrgaTreeData] = useState<any[]>([]);
    const [orgaLoading, setOrgaLoading] = useState(false);
    const [orgaSearchValue, setOrgaSearchValue] = useState('');
    const [orgaExpandedKeys, setOrgaExpandedKeys] = useState<string[]>([]);

    // 创建部门树形节点结构
    interface OrgaTreeNode {
        value: string;
        label: string;
        children?: OrgaTreeNode[];
        isLeaf?: boolean;
    }

    // 创建部门搜索防抖
    const debounceOrgaSearch = useCallback((() => {
        let timeout: NodeJS.Timeout | null = null;
        return (value: string) => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => {
                handleOrgaSearch(value);
            }, 300);
        };
    })(), []);

    // 处理从保存记录回滚时重新加载页面数据
    const handleReloadPageData = (recordData: any) => {
        if (!recordData) {
            message.error('请先选择一个版本');
            return;
        }
        // 关闭当前编辑画布
        if (editCanvas !== 'close') {
            setEditCanvas('close');
        }
        let recordDataNew = recordData
        recordDataNew.appStatus = '1';
        // 使用选中的记录数据重新调用 confirmEdit
        setTimeout(() => {
            confirmEdit({
                ...recordDataNew,
                rollbackDraftId: activeRecord?.id, // 回滚草稿id
                type: 'rollback'
            });
        }, 100);
    };

    // 返回按钮点击事件
    const handleBack = () => {
        setDisplayMode(0);
        setSelectedAppId('');
        setSelectedAppData({});
        filterAppData(selectedLevel1, selectedLevel2, selectedLevel3);
    };
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
    const [activityData, setactivityData] = useState([{ "value": '-1', label: '请选择' }]);
    const [activityMo, setactivityMo] = useState('');
    // 查询项目表格查询
    const queryActSearch = () => {
        const params = {
            staffId: userInfo.staffId,
            isAdmin: userInfo.isAdmin,
            serviceTypeIds: userInfo.serviceTypeId + ',0000'
        };
        request
            .post('/app/querySeatTenantList', { params })
            .then((res) => {
                if (res?.beans?.length > 0) {
                    let NewArr = res?.beans?.map((item: any, index: number) => ({
                        value: item.projectId,
                        label: item.projectNm,
                    }));
                    setactivityData(NewArr);
                    // 使用 setFieldsValue 动态设置表单值
                    form.setFieldsValue({
                        projectId: NewArr[0].value
                    });
                } else {
                    form.setFieldsValue({
                        projectId: activityData[0].value
                    });
                }
            })
            .catch((err) => {
            });
    };
    useEffect(() => {
        queryActSearch()
        queryAppTagList() // 查询应用标签列表
        fetchOrgaTree() // 初始化创建部门树
        request
            .post('/appType/queryAppTypeList', {})
            .then((res) => {
                setAllFlatData(res.beans);
                const appTypeListBeans = res.beans;
                setAppTypeList((pev) => {
                    return appTypeListBeans.map((item: AppTemptypeData) => {
                        return {
                            appTypeCategory: item.appTypeCategory,
                            appTypeId: item.appTypeId,
                            appTypeName: item.appTypeName,
                            pId: item.pId,
                            typeLevel: item.typeLevel,
                        };
                    });
                });
            })
            .catch((err) => {
                console.log('新增失败:', err);

                setAllFlatData([]);
            });
    }, []);

    // 同步 props 到本地状态
    useEffect(() => {
        if (initialParams) {
            setCurrentInitialParams(initialParams);
        }
    }, [initialParams]);

    // 切换共享列表刷新页面
    useEffect(() => {
        handleClick();
    }, [selectedTitle]);

    // 处理从openMenu传递过来的初始参数
    useEffect(() => {
        if (currentInitialParams) {
            // 关闭详情弹窗
            nodeRef.current?.close();
            if (editCanvas != 'close') {
                message.warning('请先完成当前应用编辑！');
                return;
            }
            const params = {
                params: {
                    id: currentInitialParams.id,
                },
            };
            request.post('/app/queryAppInfo', params).then((res) => {
                if (res.returnCode === '0' && res.bean) {
                    let data = res.bean;
                    data.projectId = '';
                    handleCopy(data)
                } else {
                    message.error(res.returnMsg || '获取应用信息失败');
                }
            }).catch((err) => {
                message.error('获取应用信息失败，请稍后重试');
            });
        }
    }, [currentInitialParams?.id]);

    // 应用类型切换状态 - 默认生产应用
    const [appType, setAppType] = useState<number>(0); // 1: 生产应用, 2: 运营应用
    //应用级别
    const [appLevel, setAppLevel] = useState<number>(0); // 1: 一级应用, 2: 二级应用

    // 查询应用标签列表
    const queryAppTagList = () => {
        request
            .post('/appType/queryAppTypeList', { params: { categoryType: '2' } })
            .then((res) => {
                if (res?.beans) {
                    setAppTagList(res.beans);
                }
            })
            .catch((err) => {
                console.error('查询应用标签列表失败:', err);
            });
    };

    // 获取当前应用类型对应的平铺类目数据
    const getCurrentFlatData = () => {
        // 根据appTypeCategory的值区分生产应用和运营应用
        // appTypeCategory值为1代表生产应用，值为2代表运营应用
        if (appType === 1) {
            // 生产应用：appTypeCategory === "1"
            return allFlatData.filter((item) => item.appTypeCategory === '1');
        } else if (appType === 2) {
            // 运营应用：appTypeCategory === "2"
            return allFlatData.filter((item) => item.appTypeCategory === '2');
        } else {
            return allFlatData;
        }
    };

    // 获取创建部门树 - 初始化根节点（不自动展开）
    const fetchOrgaTree = () => {
        const provinceName = publictData.provId2provName[userInfo.provinceId] || '';
        const rootLabel = provinceName ? `${provinceName}分公司` : '公司';
        setOrgaTreeData([{
            value: userInfo.provinceId,
            label: rootLabel,
            isLeaf: false,
        }]);
        setOrgaExpandedKeys([]);
    };

    // 创建部门懒加载 - 点击展开箭头时调用
    const loadOrgaData = async (node: any) => {
        try {
            const result = await request.post('/csf/call/getDeptByDeptId', { params: { provId: userInfo.provinceId, orgaId: node.value } });
            const children = (result.beans || []).map((item: any) => ({
                value: item.value,
                label: item.name,
                isLeaf: item.isParent !== 'true',
            }));
            setOrgaTreeData((prevData) => {
                const updateTreeData = (nodes: any[]): any[] => {
                    return nodes.map((n) => {
                        if (n.value === node.value) {
                            return { ...n, children };
                        }
                        if (n.children) {
                            return { ...n, children: updateTreeData(n.children) };
                        }
                        return n;
                    });
                };
                return updateTreeData(prevData);
            });
        } catch (error) {
            console.error('加载组织失败', error);
        }
    };

// 创建部门搜索
    const handleOrgaSearch = async (value: string) => {
        setOrgaSearchValue(value);
        if (!value) {
            fetchOrgaTree();
            setOrgaExpandedKeys([userInfo.provinceId]);
            return;
        }
        setOrgaLoading(true);
        try {
            const result = await request.post('/csf/call/getDeptByDeptId', { params: { provId: userInfo.provinceId, orgaId: userInfo.provinceId, param: value } });
            const convertToTreeData = (nodes: any[]): OrgaTreeNode[] => {
                return nodes.map((node) => ({
                    value: node.value,
                    label: node.name,
                    isLeaf: false, // 搜索结果默认可展开，显示展开箭头
                    children: node.children && node.children.length > 0 ? convertToTreeData(node.children) : [],
                }));
            };
            const searchResults = convertToTreeData(result.beans || []);
            setOrgaTreeData(searchResults);
            // 搜索结果自动展开所有节点
            const allKeys = getAllNodeKeys(searchResults);
            setOrgaExpandedKeys(allKeys);
        } catch (error) {
            console.error('搜索组织失败', error);
        } finally {
            setOrgaLoading(false);
        }
    };

    // 递归获取所有节点key
    const getAllNodeKeys = (nodes: any[]): string[] => {
        const keys: string[] = [];
        const traverse = (nodeList: any[]) => {
            nodeList.forEach((node) => {
                keys.push(node.value);
                if (node.children && node.children.length > 0) {
                    traverse(node.children);
                }
            });
        };
        traverse(nodes);
        return keys;
    };

    // 三级联动查询状态
    const [form] = Form.useForm();
    const [selectedLevel1, setSelectedLevel1] = useState<string>('');
    const [selectedLevel2, setSelectedLevel2] = useState<string>('');
    const [selectedLevel3, setSelectedLevel3] = useState<string>('');
    const [filteredData, setFilteredData] = useState<AppItem[]>([]);
    const [total, setTotal] = useState(0);
    // 加载状态
    const [loading, setLoading] = useState<boolean>(false);
    // 分页状态
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);

    // 组件初始化时默认选中第一个一级、二级和三级类目
    // useEffect(() => {
    //     // 确保只有在allFlatData获取到数据后才执行初始化逻辑
    //     if (allFlatData.length === 0) {
    //         return;
    //     }

    //     const currentFlatData = getCurrentFlatData();
    //     // 获取所有一级类目（typeLevel=1）
    //     const level1Options = currentFlatData.filter((item) => item.typeLevel === '1');

    //     if (level1Options.length > 0) {
    //         // 默认选中第一个一级类目
    //         const firstLevel1 = level1Options[0];

    //         // 获取该一级类目下的二级类目
    //         const level2Options = currentFlatData.filter((item) => item.typeLevel === '2' && item.pId === firstLevel1.appTypeId);
    //         if (level2Options.length > 0) {
    //             // 默认选中第一个二级类目
    //             const firstLevel2 = level2Options[0];

    //             // 获取该二级类目下的三级类目
    //             const level3Options = currentFlatData.filter((item) => item.typeLevel === '3' && item.pId === firstLevel2.appTypeId);
    //             if (level3Options.length > 0) {
    //                 // 默认选中第一个三级类目
    //                 const firstLevel3 = level3Options[0];

    //                 // 更新表单字段
    //                 form.setFieldsValue({
    //                     level1: firstLevel1.appTypeId,
    //                     level2: firstLevel2.appTypeId,
    //                     level3: firstLevel3.appTypeId,
    //                     appName: '',
    //                     appDesc: '',
    //                     appLevel: '',
    //                     appStatus: '',
    //                     sceneType: '',
    //                     provId: userInfo.provinceId,
    //                 });

    //                 // 同时设置三个选中值，避免多次触发useEffect
    //                 setSelectedLevel1(firstLevel1.appTypeId);
    //                 setSelectedLevel2(firstLevel2.appTypeId);
    //                 setSelectedLevel3(firstLevel3.appTypeId);
    //             }
    //         }
    //     }
    // }, [appType, allFlatData]);

    // 递归获取所有相关节点的appTypeId（包括当前节点和所有子节点）
    const getAllRelatedTypeIds = (currentId: string, flatData: FlatCategory[]): string[] => {
        const result: Set<string> = new Set([currentId]);

        // 递归获取所有子节点
        const getChildrenIds = (id: string) => {
            const children = flatData.filter((item) => item.pId === id);
            children.forEach((child) => {
                result.add(child.appTypeId);
                getChildrenIds(child.appTypeId); // 递归获取子节点的子节点
            });
        };

        // 执行递归获取（只获取子节点，不需要父节点）
        getChildrenIds(currentId);

        return Array.from(result);
    };

    // 处理应用类型切换
    const handleAppTypeChange = (value: number) => {
        setAppType(value);
        // 不需要在这里直接调用filterAppData，因为appType变化会触发初始化useEffect，
        // 而初始化useEffect会设置新的selectedLevel1、selectedLevel2、selectedLevel3，
        // 这些变化会触发监听它们的useEffect来调用filterAppData
    };
    //处理应用级别切换

    const handleAppLevelChange = (value: number) => {
        setAppLevel(value);
    };

    // 根据选中的类目和应用类型过滤应用数据
    const filterAppData = (level1: string, level2: string, level3: string) => {
        // 开始加载
        setLoading(true);

        const formValues = form.getFieldsValue();
        const currentFlatData = getCurrentFlatData();

        // 计算appTypeIds - 获取所有与当前三级节点相关的节点ID
        let appTypeIds: string[] = [];
        // if (level3) {
        appTypeIds = getAllRelatedTypeIds(selAppTypeId, currentFlatData);
        // }

        // 构建查询参数 formValues 参数从新增编辑返回会丢失数据，需要从新获取
        const queryParams = {
            appCategory: appType === 0 ? '' : appType, // 0全部 1: 生产应用, 2: 运营应用
            appLevel: appLevel === 0 ? '' : appLevel, // 0全部 1: 一级应用, 2: 二级应用
            appTypeIds: appTypeIds.join(','), // 转换为逗号分隔的字符串
            tagTypeId: selTagTypeId, // 应用标签ID
            page: currentPage,
            limit: pageSize,
            start: (currentPage - 1) * pageSize,
            ...formValues,
            dataType: '1',
            // 当选择"共享列表"时，不传递provId和projectId
            ...(selectedTitle !== '共享列表' ? {
                provId: userInfo.provinceId,
                projectId: formValues.projectId || form.getFieldValue('projectId'),
            } : {}),
            shareProv: userInfo.provinceId,
            appName: formValues.appName || form.getFieldValue('appName'),
            appDesc: formValues.appDesc || form.getFieldValue('appDesc'),
            appStatus: formValues.appStatus == '-1' ? '' : form.getFieldValue('appStatus'),
            sceneType: formValues.sceneType || form.getFieldValue('sceneType'),
            isNewVersion: formValues.isNewVersion === '0' ? '0' : formValues.isNewVersion || '1',
            createStaffName: formValues.createStaffName || form.getFieldValue('createStaffName'), // 创建人姓名
            createOrgaId: formValues.createOrgaId || form.getFieldValue('createOrgaId'), // 创建部门
        };

        request
            .post('/app/queryAppList', objectToFormData(queryParams))
            .then((res) => {
                setFilteredData(res.beans);
                setTotal(res.bean.total);
                // 加载完成
                setTimeout(() => {
                    setLoading(false);
                }, 100);
            })
            .catch((err) => {
                console.log('新增失败:', err);
            });
    };

    // 重置查询条件 - 只重置其他筛选条件区域，不影响应用类别和各级类目
    const handleReset = () => {
        form.setFieldsValue({
            appName: '',
            appDesc: '',
            appStatus: undefined,
            sceneType: undefined,
            appTypeName: '',
            tagTypeName: '',
            showArea: undefined,
            isNewVersion: '1',
            provId: userInfo.provinceId,
            isCreateMenu: undefined, // 是否生成菜单
            projectId: activityData[0].value,
            createStaffName: '', // 创建人姓名
            createOrgaId: '', // 创建部门
        });
        setSelAppTypeId(''); //应用分类
        setSelTagTypeId(''); //应用标签
        setSelTagTypeName(''); //应用标签名称
        setAppType(0); //应用类别
        setAppLevel(0); //应用级别
        fetchOrgaTree(); // 重置创建部门树
    };

    //点击查询
    const handleClick = () => {
        setCurrentPage(1);
        form.getFieldValue('projectId') && filterAppData(selectedLevel1, selectedLevel2, selectedLevel3); // 归属项目有值时再查询列表，查看共享列表时归属项目一定有值
    };

    // 处理分页变化 - 根据Ant Design文档，onChange事件传递两个独立参数：page和pageSize
    const handleTableChange = (page: number, pageSize: number) => {
        console.log(page, pageSize, 'pagination');

        setCurrentPage(page);
        setPageSize(pageSize);
        // 不需要在这里直接调用filterAppData，因为useEffect会监听page和pageSize的变化并自动调用
    };

    // 当分页参数或选中的类目变化时自动重新筛选数据
    useEffect(() => {
        // 只有当allFlatData有数据且selectedLevel3不为空时才调用filterAppData
        if (allFlatData.length > 0 && form.getFieldValue('projectId')) { // 归属项目有值时再查询列表，查看共享列表时归属项目一定有值
            filterAppData(selectedLevel1, selectedLevel2, selectedLevel3);
        }
    }, [currentPage, pageSize, selectedLevel1, selectedLevel2, selectedLevel3, allFlatData]);

    // 检测标签溢出并计算可见标签数量
    useEffect(() => {
        const calculateVisibleTags = () => {
            if (!tagItemBoxRef.current || !selTagTypeName) {
                setVisibleCount(null);
                setHiddenTags([]);
                return;
            }

            const tagNames = selTagTypeName.split(',');
            const tagIds = selTagTypeId?.split(',') || [];

            // 动态根据tagItemBox的实际宽度计算最大宽度
            const containerWidth = tagItemBoxRef.current.offsetWidth;
            const ellipsisWidth = 30; // 省略号大约宽度
            const maxWidth = containerWidth;

            let visibleTags = 0;
            let currentWidth = 0;

            const tagElements = tagItemBoxRef.current.querySelectorAll(`.${styles.tagItem}`);

            // 使用 for 循环以便在超出宽度时能够立即停止遍历
            for (let index = 0; index < tagElements.length; index++) {
                const element = tagElements[index];
                const tagWidth = (element as HTMLElement).offsetWidth;
                const newWidth = currentWidth + tagWidth;

                // 检查加上这个标签和省略号是否会超出容器
                if (newWidth + ellipsisWidth <= maxWidth) {
                    visibleTags++;
                    currentWidth = newWidth;
                } else {
                    break; // 停止遍历
                }
            }

            // 如果所有标签都能放下，就不需要省略号
            if (visibleTags >= tagNames.length) {
                setVisibleCount(null);
                setHiddenTags([]);
            } else {
                setVisibleCount(visibleTags);
                // 收集隐藏的标签
                const hidden = tagNames.slice(visibleTags).map((name, index) => ({
                    name,
                    id: tagIds[visibleTags + index],
                    originalIndex: visibleTags + index
                }));
                setHiddenTags(hidden);
            }
        };

        // 延迟执行，确保DOM已经渲染
        setTimeout(calculateVisibleTags, 100);

        // 监听窗口大小变化
        window.addEventListener('resize', calculateVisibleTags);

        return () => {
            window.removeEventListener('resize', calculateVisibleTags);
        };
    }, [selTagTypeName, selTagTypeId]);
    const openPreview = menu((state) => state.openPreview);
    const openExternalUrl = menu((state) => state.openExternalUrl);

    //点击上架
    const updeClick = (items: any) => {
        if (items.appStatus != '2') {
            message.warning('仅支持已发布状态应用上架');
            return;
        }
        if (!items.projectId) {
            message.warning('该应用未关联归属项目,请核对应用信息');
            return;
        }
        updeRef.current?.open(items);
    };
    // 纯样式对
    const latestTagStyle = {
        backgroundColor: '#ffe6e6',
        border: 'none',
        borderRadius: '12px',
        color: '#ff4d4f',
        fontSize: '12px',
        fontWeight: 600,
        marginLeft: '5px',
        padding: '2px 6px',
        lineHeight: '1.5',
    };

    // 删除单个标签
    const handleRemoveTag = (index: number) => {
        const tagIdsArray = selTagTypeId?.split(',') || [];
        const tagNamesArray = selTagTypeName?.split(',') || [];

        tagIdsArray.splice(index, 1);
        tagNamesArray.splice(index, 1);

        setSelTagTypeId(tagIdsArray.join(','));
        setSelTagTypeName(tagNamesArray.join(','));

        // 同步更新表单
        form.setFieldsValue({
            tagTypeName: tagNamesArray.join(','),
        });
    };

    // 从隐藏标签中删除指定标签
    const handleRemoveHiddenTag = (originalIndex: number) => {
        handleRemoveTag(originalIndex);
    };

    // 递归查询所有父级Name
    const getAppTypeNameById = (result: string[], appTypeId?: string): void => {
        const item = appTypeList.find((i) => i.appTypeId === appTypeId);
        if (item) {
            result.unshift(item.appTypeName);
            if (item.pId) {
                getAppTypeNameById(result, item.pId);
            }
        }
    };

    // 根据应用标签ID获取应用标签名称
    const getAppTagNameById = (tagTypeId?: string): string => {
        if (!tagTypeId) return '';
        const tagIds = tagTypeId.split(',');
        const tagNames = tagIds.map(id => {
            const tag = appTagList.find((item: AppTemptypeData) => item.appTypeId === id);
            return tag ? tag.appTypeName : '';
        }).filter(name => name);
        return tagNames.join(',');
    };



    // 表格列配置
    const columns = [
        {
            title: '操作',
            key: 'action',
            width: selectedTitle === '共享列表' ? 100 : 410,
            fixed: true,
            render: (_: any, record: AppItem) => {
                // 定义各种按钮的状态判断变量
                const isUpShelf = record.appStatus == '2';  // 已发布：上架按钮可用
                const isDownShelf = record.appStatus == '6';  // 已上架：下架按钮可用
                const isEdit = record.appStatus == '1' || record.appStatus == '4' || record.appStatus == '2' ||
                    (record.appStatus == '6' && record.isLast == '1');  // 可编辑状态
                const isShare = (record.appStatus == '6' || record.appStatus == '10' || record.appStatus == '11') && record.provId !== '0000';  // 共享可用
                const isLink = record.appStatus == '6' || record.appStatus == '10' || record.appStatus == '11';  // 链接可用
                const isEvaluate = record.appStatus == '6' || record.appStatus == '10' || record.appStatus == '11';  // 评估可用
                const isDelete = record.appStatus == '1' || record.appStatus == '2' ||
                    record.appStatus == '12' || record.appStatus == '9' || record.appStatus == '4';  // 可删除状态  应用提交状态的应用可被删除
                let iscolor = record.appStatus == '6' || record.appStatus == '10' || record.appStatus == '11';
                return (
                    <Space className={styles.btnMR}>
                        {(userInfo.provinceId == record.provId || record.provId == '0000') && selectedTitle !== '共享列表' ? (
                            <>
                                <span
                                    onClick={() => {
                                        if (isUpShelf) updeClick(record);
                                    }}
                                    style={{
                                        cursor: isUpShelf ? 'pointer' : 'not-allowed',
                                        color: isUpShelf ? '#0085d0' : '#ccc'
                                    }}
                                >
                                    上架
                                </span>
                                <span
                                    onClick={() => {
                                        if (isDownShelf) handleOffshelf(record);
                                    }}
                                    style={{
                                        cursor: isDownShelf ? 'pointer' : 'not-allowed',
                                        color: isDownShelf ? '#0085d0' : '#ccc'
                                    }}
                                >
                                    下架
                                </span>
                                <span
                                    onClick={() => {
                                        if (isEdit) confirmEdit(record);
                                    }}
                                    style={{
                                        cursor: isEdit ? 'pointer' : 'not-allowed',
                                        color: isEdit ? '#0085d0' : '#ccc'
                                    }}
                                >
                                    编辑
                                </span>
                                <span
                                    onClick={() => handleCopy(record)}
                                    style={{ cursor: 'pointer', color: '#0085d0' }}
                                >
                                    复制
                                </span>
                                <span
                                    onClick={() => nodeRef.current?.open(record)}
                                    style={{ cursor: 'pointer', color: '#0085d0' }}
                                >
                                    详情
                                </span>
                                <span
                                    onClick={() => {
                                        if (isEvaluate) handleEvaluate(record);
                                    }}
                                    style={{
                                        cursor: isEvaluate ? 'pointer' : 'not-allowed',
                                        color: isEvaluate ? '#0085d0' : '#ccc'
                                    }}
                                >
                                    评估
                                </span>
                               <span
                                    onClick={() => {
                                        if (isShare) handleShare(record);
                                    }}
                                    style={{
                                        cursor: isShare ? 'pointer' : 'not-allowed',
                                        color: isShare ? '#0085d0' : '#ccc'
                                    }}
                                >
                                    共享
                                </span>
                                {!userInfo.isTopShow && (
                                    <span
                                        onClick={() => {
                                            if (isLink) linkShare(record);
                                        }}
                                        style={{
                                            cursor: isLink ? 'pointer' : 'not-allowed',
                                            color: isLink ? '#0085d0' : '#ccc'
                                        }}
                                    >
                                        链接
                                    </span>
                                )}
                                <span
                                    onClick={() => {
                                        if (isDelete) confirmDelete(record);
                                    }}
                                    style={{
                                        cursor: isDelete ? 'pointer' : 'not-allowed',
                                        color: isDelete ? '#fe3d35' : '#ccc'
                                    }}
                                >
                                    删除
                                </span>
                            </>
                        ) : (
                            <>
                                <span
                                    onClick={() => handleCopy(record)}
                                    style={{ cursor: 'pointer', color: '#0085d0' }}
                                >
                                    复制
                                </span>
                            </>
                        )}
                    </Space>
                );
            },
        },
        {
            title: '应用名称',
            dataIndex: 'appName',
            key: 'appName',
            width: 180,
            fixed: true,
            // render: (appName: string) => {
            //     return <div style={{ color: '#0085d0', cursor: 'pointer ' }}>{appName}</div>;
            // },
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
                        openExternalUrl({ title: record?.appName, url: './page/index.html?id=' + record?.id + "&appStatus=1" });
                    }}
                >
                    {text}
                </div>
            ),
        },
        {
            title: '状态',
            dataIndex: 'appStatus',
            key: 'appStatus',
            width: 100,
            render: (appStatus: string) => {
                let color = '';
                if (appStatus == '6') {
                    // 已上架
                    color = '#009944';
                } else if (appStatus == '2') {
                    // 已发布
                    color = '#0085d0';
                } else if (appStatus == '3' || appStatus == '5' || appStatus == '8' || appStatus == '10') {
                    // 发布审核、下架审核、上架审核、回滚审核
                    color = '#f38900';
                } else if (appStatus == '11') {
                    // 下架公示
                    color = '#f65a56';
                } else if (appStatus == '9' || appStatus == '12') {
                    // 已废弃、已下架
                    color = '#bfbfbf';
                } else if (appStatus == '1' || appStatus == '7' || appStatus == '4') {
                    // 草稿、已停用、应用提交
                    color = '#595959';
                }
                return <div style={{ color: color }}>{statusOptions.find((item) => item.value == appStatus)?.label}</div>;
            },
        },
        {
            title: '版本',
            dataIndex: 'belongVersion',
            key: 'belongVersion',
            width: 100,
            render: (text: string, record: any) => (
                <div>
                    {text}
                    {record.isNewVersion === '1' && <Tag style={latestTagStyle}>最新</Tag>}
                </div>
            ),
        },
        {
            title: '应用级别',
            dataIndex: 'appLevel',
            key: 'appLevel',
            width: 100,
            render: (appLevel: string) => {
                return appLevel === '1' ? '一级应用' : '二级应用';
                // return <div>{appLevelOptions.find((item) => item.value == appLevel)?.label}</div>;
            },
        },
        {
            title: '应用形式',
            dataIndex: 'sceneType',
            key: 'sceneType',
            width: 120,
            render: (sceneType: string) => {
                return <div>{displayFormOptions.find((item) => item.value == sceneType)?.label}</div>;
            },
        },
        {
            title: '展示区域',
            dataIndex: 'showArea',
            key: 'showArea',
            width: 120,
            render: (showArea: string) => {
                return <div>{showAreaOptions.find((item) => item.value == showArea)?.label}</div>;
            },
        },
        {
            title: '是否生成菜单',
            dataIndex: 'isCreateMenu',
            key: 'isCreateMenu',
            width: 110,
            render: (isCreateMenu: string) => {
                return isCreateMenu === '1' ? '是' : isCreateMenu === '0' ? '否' : '空';
            },
        },
        {
            title: '应用分类',
            dataIndex: 'appTypeId',
            key: 'appTypeId',
            width: 230,
            ellipsis: true,
            render: (appTypeId: string) => {
                const appTypeNames: string[] = [];
                const result = getAppTypeNameById(appTypeNames, appTypeId);
                return <div title={appTypeNames.join('-')}>{appTypeNames.join('-')}</div>;
            },
        },
        {
            title: '应用标签',
            dataIndex: 'tagTypeId',
            key: 'tagTypeId',
            width: 200,
            ellipsis: true,
            render: (tagTypeId: string) => {
                const tagName = getAppTagNameById(tagTypeId);
                return (
                    <div
                        title={tagName}
                        style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {tagName}
                    </div>
                );
            },
        },
        {
            title: '应用描述',
            dataIndex: 'appDesc',
            key: 'appDesc',
            width: 200,
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
            title: '应用类别',
            dataIndex: 'appCategory',
            key: 'appCategory',
            width: 100,
            render: (appCategory: string) => {
                return appCategory === '1' ? '生产应用' : '运营应用';
            },
        },
        {
            title: '评估状态',
            dataIndex: 'evaluateState',
            key: 'evaluateState',
            width: 160,
            render: (evaluateState: string, record: any) => {
                if (evaluateState == '1') {
                    return (
                        <Space>
                            <span style={{ color: '#009944' }}>已评估</span>
                            <Button type="link" style={{ color: '#1890ff' }} onClick={() => { handleEvaluateRecord(record) }}>评估记录</Button>
                        </Space>
                    );
                }
                return <span style={{ color: '#595959' }}>未评估</span>;
            },
        },
        {
            title: '归属模块',
            dataIndex: 'belongModule',
            key: 'belongModule',
            width: 120,
        },
        {
            title: '归属省份',
            dataIndex: 'provId',
            key: 'provId',
            width: 90,
            render: (provId: string) => {
                return <div>{provinceOptions.find((item) => item.value == provId)?.label}</div>;
            },
        },
        {
            title: '共享范围',
            dataIndex: 'shareProv',
            key: 'shareProv',
            width: 130,
            ellipsis: true,
            render: (text: any, record: any) => {
                if (record.provId == '0000') {
                    return <span>--</span>;
                }
                if (record.shareStatus == '0') {
                    return <span>未共享</span>;
                }

                // if (record.provId != '0000' && record.provId != userInfo.provinceId) {
                //     return <span>{provinceOptions.find((item) => item.value == record.provId)?.label}</span>;
                // }
                let shareStr = '';
                const shareArr = [];
                const shareProvArr = record.shareProv.split(',');
                for (let i = 0; i < shareProvArr.length; i++) {
                    const provName = provinceOptions.find((item) => item.value == shareProvArr[i])?.label;
                    shareArr.push(provName);
                }
                if (shareProvArr.indexOf('0000') > -1) {
                    shareStr = '全网';
                } else {
                    shareStr = shareArr.join(',');
                }

                return <span title={'已共享给：' + shareStr}>已共享给：{shareStr} </span>;
            },
        },
        // {
        //     title: '一解率',
        //     dataIndex: 'firstSolutionRate',
        //     key: 'firstSolutionRate',
        //     width: 100,
        // },
        // {
        //     title: '应用满意度',
        //     dataIndex: 'appSatisfaction',
        //     key: 'appSatisfaction',
        //     width: 120,
        // },
        // {
        //     title: '近七天点击率',
        //     dataIndex: 'sevenDayClicks',
        //     key: 'sevenDayClicks',
        //     width: 130,
        // },
        {
            title: '创建人工号',
            dataIndex: 'createStaffId',
            key: 'createStaffId',
            width: 100,
        },
        {
            title: '修改人工号',
            dataIndex: 'updateStaffId',
            key: 'updateStaffId',
            width: 100,
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
            width: 180,
        },
        {
            title: '修改时间',
            dataIndex: 'updateTime',
            key: 'updateTime',
            width: 180,
        },
    ];
    // 添加删除确认函数

    const confirmDelete = (record: AppItem) => {
        // 当应用状态为草稿态1、已发布2、已下架12、已废弃9状态时，可点击删除按钮；除此之外其他状态删除按钮均不可点击
        if (record.appStatus !== '1' && record.appStatus !== '2' && record.appStatus !== '9' && record.appStatus !== '12' && record.appStatus !== '4') {
            message.error(`${statusOptions.find((item: any) => item.value == record.appStatus)?.label}状态不允许删除！`);
            return;
        }
        setActiveRecord(record);
        setIsDelete(true);
        setPointOut('请确认是否要删除当前应用?');
        setDeleteVisible(true);
    };

    // 二次确认方法
    const reconfirmFun = () => {
        const record = activeRecord;
        if (isDelete) {
            // 删除接口
            const params = { params: { appStatus: '0', relationId: record?.relationId, id: record?.id, staffId: userInfo.staffId, provId: record?.provId } };
            request.post('app/deleteAppByNewVervion', params).then((res) => {
                if (res && res.returnCode == '0') {
                    setDeleteVisible(false);
                    message.success('应用删除成功');
                    filterAppData(selectedLevel1, selectedLevel2, selectedLevel3);
                    const logParams = {
                        provCode: userInfo.provinceId, // 8位省份编码
                        modelName: '', // 所属模块  暂时为空
                        pageName: '', // 所属菜单   暂时为空
                        dataType: '应用', // 数据类型（应用、元素、组件、接口）
                        operType: '删除', // 操作类型（新增/编辑/删除/导入）
                        dataId: record?.id, // 操作数据ID
                        dataName: record?.appName, // 操作数据名称
                        editContent: `删除${record?.appName}应用`, // 操作内容简述
                        staffId: userInfo.staffId, // 操作人工号
                    };
                    recodeLog(logParams);
                }
            });
        } else {
            setDeleteVisible(false);
            const updatedRecord = { ...record, type: 'edit' };
            setConfig({
                config: {
                    ...record,
                    serviceTypeId: userInfo.serviceTypeId,
                },
                id: record?.id,
                backComponentPage: () => {
                    setEditCanvas('close');
                },
            });
            setEditCanvas('open');
        }
    };

    // 添加复制函数
    const handleCopy = (record: AppItem) => {
        const updatedRecord = { ...record, type: 'copy' };
        console.log(record, '复制');

        setCurrentApp({ ...record, copyFrom: currentInitialParams?.copyFrom ? currentInitialParams.copyFrom : (selectedTitle === '共享列表' ? '2' : '1') })
        let recordNew = record;
        if (selectedTitle == '共享列表') { // 共享列表的应用点击复制时清空归属项目
            recordNew.projectId = '';
        }else{
            //recordNew.appLevel = '2';
            recordNew.projectId = '';
        }
        recordNew.isCreateMenu = '2';
        setConfig({
            config: {
                ...recordNew,
                serviceTypeId: userInfo.serviceTypeId,
                id: '',
                templateId: recordNew.id,
                appName: `${recordNew.appName}-副本`,
            },
            id: '',

            backComponentPage: () => {
                setEditCanvas('close');
            },
        });
        setEditCanvas('open');
    };
    // 评估按钮点击
    const handleEvaluate = (record: AppItem) => {
        // return
        setAppDetail(record);
        setAppEvaluationModalVisible(true);
    };
    const handleEvaluateSubmit = (values: any) => {
        handleClick();
    }
    // 跳转评估记录
    const handleEvaluateRecord = (params: AppItem) => {
        menuStore.closeTab('应用评估记录');
        setTimeout(() => {
            menuStore.openMenu({ key: 'evaluateRecord', params });
        });
    }

    //共享
    const handleShare = (record: AppItem) => {
        // return
        setAppDetail(record);
        setShareModalVisible(true);
        // 初始化选择状态，默认全选
        const allProvinceValues = provinceMap?.map((item) => item.value).filter((value) => value !== currentUserProvince) || [];
        setSelectedProvinces(allProvinceValues);
        setAllSelected(true);
    };
    // 关闭共享弹窗
    const handleShareModalClose = () => {
        setShareModalVisible(false);
    };
    //链接弹框
    const [linkModalVisible, setlinkModalVisible] = useState(false);
    const [linkData, setlinkData] = useState({
        url: '',
        appName: '', //归属项目ID
        id: '', // 坐席工号
        sceneType: ''
    });
       // 菜单查询查询
        const queryMenuListFun = (value: string) => {
            try {

            } catch (error) {
            } finally {
            }
        };
    //链接弹窗
    const linkShare = (record: any) => {
        if(!record.relationId){
            message.warning('数据缺少必要参数，请重新选择！')
            return
        }
        if (record.isCreateMenu !== '0') {
            request
            .post('/appReview/queryAppReviewMenuList', {
                params: {
                    relationId: record.relationId
                },
            })
            .then((res) => {
                if(res?.beans?.length !== 0){
                    setlinkModalVisible(true);
                    setlinkData((prev) => ({
                        ...prev,
                        url: res?.beans[0]?.menuUrl ? baseApiConvert(res?.beans[0]?.menuUrl) : '',
                        appName: record.appName, //
                        id: record.id, //
                        sceneType: record.sceneType
                    }));
                }
            })
            .catch((err) => { });
        } else {
            const params = {
                tenantCode: record?.serviceTypeId,
                start: 0,
                limit: 10
            };
            request
            .post('/appTenant/queryAppTenantList', { params })
            .then((res) => {
                let NewArr = res?.beans?.map((item: any, index: number) => ({
                    tenantUrl: item.tenantUrl
                }));
                const menuUrl = 'http://' + (NewArr[0]?.tenantUrl || '') + '/ngap/page/index.html?relationId=' + record.relationId;
                setlinkModalVisible(true);
                setlinkData((prev) => ({
                    ...prev,
                    url: menuUrl ? baseApiConvert(menuUrl) : '',
                    appName: record.appName, //
                    id: record.id, //
                    sceneType: record.sceneType
                }));
            })
            .catch((err) => {
            });
        }
    };
    // 关闭链接弹窗
    const linkModalVisibleClose = () => {
        setlinkModalVisible(false);
    };
    // 链接跳转
    const linkHtmlCreat = () => {
            CrossAPI.createTab(linkData.appName, linkData.url);
        //CrossAPI.createTab(linkData.appName, linkData.url);
    };
    // 处理共享确认
    const handleShareConfirm = () => {
        // 这里可以添加实际的共享逻辑，比如调用API保存共享设置
        console.log('共享省份：', selectedProvinces);
        console.log('是否全网共享：', allSelected);
        if (allSelected) {
            selectedProvinces.push('0000');
        }
        // if (selectedProvinces.length == 0) {
        //     message.error('请选择共享省份！');
        //     return;
        // }
        const params = {
            id: appDetail.relationId,
            shareStatus: selectedProvinces.length > 0 ? '1' : '0',
            shareProv: selectedProvinces.join(','),
            staffId: userInfo.staffId,
        };
        request
            .post('/app/saveAppInfoForShare', { params })
            .then((res) => {
                if (res && res.returnCode == '0') {
                    message.success('共享成功');
                    const logParams = {
                        provCode: userInfo.provinceId, // 8位省份编码
                        modelName: '', // 所属模块  暂时为空
                        pageName: '', // 所属菜单   暂时为空
                        dataType: '应用', // 数据类型（应用、元素、组件、接口）
                        operType: '共享', // 操作类型（新增/编辑/删除/导入）
                        dataId: appDetail?.id, // 操作数据ID
                        dataName: appDetail?.appName, // 操作数据名称
                        editContent: `共享${appDetail?.appName}应用`, // 操作内容简述
                        staffId: userInfo.staffId, // 操作人工号
                    };
                    recodeLog(logParams);
                    filterAppData(selectedLevel1, selectedLevel2, selectedLevel3);
                } else {
                    message.error('共享失败');
                }
            })
            .catch((err) => { });

        setShareModalVisible(false);
    };
    const [config, setConfig] = useState({});

    const [currentApp, setCurrentApp] = useState<AppItem | null>(null)

    // 添加编辑确认函数
    const confirmEdit = (record: AppItem) => {
        // 检查应用状态是否为待审核（appStatus为3）
        if (record.appStatus !== '1' && record.appStatus !== '2' && record.appStatus !== '4' && record.appStatus !== '6') {
            message.error('只有已上架、已发布、应用提交、草稿态才可编辑!');
            return;
        };
        if(record.appLevel === '1' && record.provId === '0000' && userInfo.serviceTypeId !== '0000'){
            message.error('一级应用不允许编辑');
            return
        }
        if (record.type !== 'rollback') { // 如果是草稿记录回滚则不更新选中数据
            setActiveRecord(record);
        }
        // 检查应用状态是否为已使用（appStatus为2）
        if (record.appStatus === '2') {
            setIsDelete(false);
            setPointOut('当前应用已使用，修改会影响应用展示效果');
            setDeleteVisible(true);
        } else {
            const updatedRecord = { ...record, type: 'edit' };
            console.log('编辑操作参数:', updatedRecord);

            setConfig({
                config: {
                    ...record,
                    serviceTypeId: userInfo.serviceTypeId,
                },
                id: record.id,
                backComponentPage: () => {
                    setEditCanvas('close');
                },
            });
            setEditCanvas('open');
        }
    };

    // 处理下架按钮点击
    const handleOffshelf = (record: AppItem) => {
        // 检查应用状态是否为已上架（状态值为'6'）
        if (record.appStatus !== '6') {
            message.warning('请先上架应用。');
            return;
        }
        setActiveRecord(record);
        setOffshelfModalVisible(true);
    };

    // 提交下架申请
    const handleOffshelfSubmit = async (submitData: any) => {
        const params = {
            id: activeRecord?.id || '',
            pubSubInfo: {
                reviewState: 'downSub', // 下架提交
                devNo: activeRecord?.devNo || '',
                devStaff: activeRecord?.devStaff || '',
                ...submitData,
            },
        };
        // 调用下架申请接口
        return request
            .post('/app/saveAppInfo', { params })
            .then((res) => {
                if (res && res.returnCode === '0') {
                    message.success('下架申请提交成功');
                    const logParams = {
                        provCode: userInfo.provinceId, // 8位省份编码
                        modelName: '', // 所属模块  暂时为空
                        pageName: '', // 所属菜单   暂时为空
                        dataType: '应用', // 数据类型（应用、元素、组件、接口）
                        operType: '下架', // 操作类型（新增/编辑/删除/导入）
                        dataId: activeRecord?.id, // 操作数据ID
                        dataName: activeRecord?.appName, // 操作数据名称
                        editContent: `下架${activeRecord?.appName}应用`, // 操作内容简述
                        staffId: userInfo.staffId, // 操作人工号
                    };
                    recodeLog(logParams);
                    filterAppData(selectedLevel1, selectedLevel2, selectedLevel3);
                    return Promise.resolve();
                } else {
                    message.error(res.returnMsg || '下架申请提交失败');
                    return Promise.reject();
                }
            })
            .catch((err) => {
                message.error('下架申请提交失败');
                return Promise.reject();
            });
    };

    const handleCreatApp = () => {
        setDisplayMode(2);
    };
    const [editCanvas, setEditCanvas] = useState('close');

    //返回页面 关闭画布
    const backApplyPageEvent = () => {
        setEditCanvas('close');
        // 重置初始参数
        setCurrentInitialParams(undefined);
        filterAppData(selectedLevel1, selectedLevel2, selectedLevel3);
    };
    const handleCancle = () => {
        setDisplayMode(0);
        filterAppData(selectedLevel1, selectedLevel2, selectedLevel3);
    };
    const [mode, setMode] = useState('edit');
    const _setMode = (state: string) => {
        setMode(state);
    };
    return (
        <>
            <AppProvider pageType="" config={config} mode={mode} setMode={_setMode}>
                <div style={{ height: '100%' }} className="applicationListBox">
                    {displayMode == 0 ? (
                        <div className="app-list-container">
                            {/* 三级联动查询表单 */}
                            <div className="app-list-filter">
                                <Form form={form} layout="horizontal">
                                    <div className="filter-categories">
                                        <div style={{ display: 'flex', marginBottom: 10 }}>
                                            {/* 应用类别切换Button */}
                                            <div className="category-level" style={{ flex: '0.52' }}>
                                                <div className="category-label">应用类别：</div>
                                                <div className="category-tags">
                                                    <div
                                                        key="categoryAll"
                                                        onClick={() => handleAppTypeChange(0)}
                                                        className={['category-tag-button', appType === 0 ? 'category-tag-button-selected' : ''].join(
                                                            ' ',
                                                        )}
                                                    >
                                                        全部
                                                    </div>
                                                    <div
                                                        key="production"
                                                        onClick={() => handleAppTypeChange(1)}
                                                        className={['category-tag-button', appType === 1 ? 'category-tag-button-selected' : ''].join(
                                                            ' ',
                                                        )}
                                                    >
                                                        生产应用
                                                    </div>
                                                    <div
                                                        key="operation"
                                                        onClick={() => handleAppTypeChange(2)}
                                                        className={['category-tag-button', appType === 2 ? 'category-tag-button-selected' : ''].join(
                                                            ' ',
                                                        )}
                                                    >
                                                        运营应用
                                                    </div>
                                                </div>
                                            </div>
                                            {/* 应用级别切换Button */}
                                            <div className="category-level" style={{ flex: '1' }}>
                                                <div className="category-label">应用级别：</div>
                                                <div className="category-tags">
                                                    <div
                                                        key="appLevelAll"
                                                        onClick={() => handleAppLevelChange(0)}
                                                        className={['category-tag-button', appLevel === 0 ? 'category-tag-button-selected' : ''].join(
                                                            ' ',
                                                        )}
                                                    >
                                                        全部
                                                    </div>
                                                    <div
                                                        key="appLevelFir"
                                                        onClick={() => handleAppLevelChange(1)}
                                                        className={['category-tag-button', appLevel === 1 ? 'category-tag-button-selected' : ''].join(
                                                            ' ',
                                                        )}
                                                    >
                                                        一级应用
                                                    </div>
                                                    <div
                                                        key="appLevelSec"
                                                        onClick={() => handleAppLevelChange(2)}
                                                        className={['category-tag-button', appLevel === 2 ? 'category-tag-button-selected' : ''].join(
                                                            ' ',
                                                        )}
                                                    >
                                                        二级应用
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

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
                                                    label="应用名称"
                                                    name="appName"
                                                    labelCol={{ span: 5 }}
                                                    wrapperCol={{ span: 19 }}
                                                    style={{
                                                        marginBottom: 10,
                                                        width: '33%',
                                                    }}
                                                >
                                                    <Input placeholder="请输入" />
                                                </Form.Item>
                                                <Form.Item
                                                    label="状态"
                                                    name="appStatus"
                                                    labelCol={{ span: 5 }}
                                                    wrapperCol={{ span: 19 }}
                                                    style={{ marginBottom: 10, width: '33%' }}
                                                >
                                                    <Select placeholder="请选择" options={statusOptionsNew} />
                                                </Form.Item>
                                                {/* <Form.Item
                                                    label="归属模块"
                                                    name="belongModule"
                                                    labelCol={{ span: 6 }}
                                                    wrapperCol={{ span: 18 }}
                                                    style={{
                                                        marginRight: '2%',
                                                        marginBottom: 10,
                                                        width: '23.5%',
                                                    }}
                                                >
                                                    <Select placeholder="请选择归属模块" options={moduleOptions} />
                                                </Form.Item> */}
                                                <Form.Item
                                                    label="应用分类"
                                                    name="appTypeName"
                                                    labelCol={{ span: 5 }}
                                                    wrapperCol={{ span: 19 }}
                                                    style={{
                                                        // marginRight: '2%',
                                                        marginBottom: 10,
                                                        width: '33%',
                                                    }}
                                                >
                                                    <div style={{ position: 'relative' }}>
                                                        <Input
                                                            placeholder="请选择"
                                                            readOnly
                                                            onClick={() => setModalVisible(true)}
                                                            value={form.getFieldValue('appTypeName')}
                                                        />
                                                        <div
                                                            className={styles.appTypeSelector}
                                                            onClick={() => setModalVisible(true)}
                                                        >
                                                            选择
                                                        </div>
                                                    </div>
                                                </Form.Item>
                                                <Form.Item
                                                    label="应用标签"
                                                    name="tagTypeName"
                                                    labelCol={{ span: 5 }}
                                                    wrapperCol={{ span: 19 }}
                                                    style={{
                                                        marginBottom: 10,
                                                        width: '33%',
                                                    }}
                                                >
                                                    <div style={{ position: 'relative' }}>
                                                        <div className={styles.tagContainer}>
                                                            <div className={styles.tagsWrapper}>
                                                                <div
                                                                    ref={tagItemBoxRef}
                                                                    className={styles.tagItemBox}
                                                                >
                                                                    {selTagTypeName ? (
                                                                        <>
                                                                            {selTagTypeName.split(',').slice(0, visibleCount ?? undefined).map((tagName, index) => (
                                                                                <div
                                                                                    key={`${tagName}-${index}`}
                                                                                    className={styles.tagItem}
                                                                                     title={tagName}
                                                                                >
                                                                                    <span>{tagName}</span>
                                                                                    <CloseOutlined
                                                                                        className={styles.tagCloseIcon}
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            const tagIdsArray = selTagTypeId?.split(',') || [];
                                                                                            const tagNamesArray = selTagTypeName?.split(',') || [];

                                                                                            tagIdsArray.splice(index, 1);
                                                                                            tagNamesArray.splice(index, 1);

                                                                                            setSelTagTypeId(tagIdsArray.join(','));
                                                                                            setSelTagTypeName(tagNamesArray.join(','));
                                                                                            form.setFieldsValue({
                                                                                                tagTypeName: tagNamesArray.join(','),
                                                                                            });
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            ))}

                                                                            {/* 省略号提示 */}
                                                                            {visibleCount !== null && visibleCount < selTagTypeName.split(',').length && (
                                                                                <Tooltip
                                                                                    overlayClassName={styles.hiddenTagsTooltipOverlay}
                                                                                    title={
                                                                                        <div>
                                                                                            {hiddenTags.map((tag, idx) => (
                                                                                                <div key={tag.id} title={tag.name}>
                                                                                                    <span>{tag.name}</span>
                                                                                                    <CloseOutlined
                                                                                                        onClick={(e) => {
                                                                                                            e.stopPropagation();
                                                                                                            handleRemoveHiddenTag(tag.originalIndex);
                                                                                                        }}
                                                                                                    />
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    }
                                                                                    placement="bottomLeft"
                                                                                >
                                                                                    <div className={styles.overflowEllipsis}>
                                                                                        ...
                                                                                    </div>
                                                                                </Tooltip>
                                                                            )}
                                                                        </>
                                                                    ) : (
                                                                        <span className={styles.emptyTip}>
                                                                            请选择应用标签
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {/* 选择按钮 */}
                                                                <div
                                                                    className={styles.tagSelector}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setTagModalVisible(true);
                                                                    }}
                                                                >
                                                                    选择
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Form.Item>
                                                <Form.Item
                                                    label="应用形式"
                                                    name="sceneType"
                                                    labelCol={{ span: 5 }}
                                                    wrapperCol={{ span: 19 }}
                                                    style={{
                                                        marginBottom: 10,
                                                        width: '33%',
                                                    }}
                                                >
                                                    <Select placeholder="请选择" options={displayFormOptions} />
                                                </Form.Item>
                                                <Form.Item
                                                    label="展示区域"
                                                    name="showArea"
                                                    labelCol={{ span: 5 }}
                                                    wrapperCol={{ span: 19 }}
                                                    style={{
                                                        marginBottom: 10,
                                                        width: '33%',
                                                    }}
                                                >
                                                    <Select placeholder="请选择" options={showAreaOptions} />
                                                </Form.Item>
                                                <Form.Item
                                                    label="是否生成菜单"
                                                    name="isCreateMenu"
                                                    labelCol={{ span: 5 }}
                                                    wrapperCol={{ span: 19 }}
                                                    style={{
                                                        marginBottom: 10,
                                                        width: '33%',
                                                    }}
                                                >
                                                    <Select placeholder="请选择"
                                                            options={[
                                                                { value: '1', label: '是' },
                                                                { value: '0', label: '否' },
                                                                { value: '2', label: '空' },
                                                            ]}
                                                    />
                                                </Form.Item>
                                                {selectedTitle !== '共享列表' && (
                                                    <Form.Item
                                                        label="归属项目"
                                                        name="projectId"
                                                        labelCol={{ span: 5 }}
                                                        wrapperCol={{ span: 19 }}
                                                        style={{
                                                            marginBottom: 10,
                                                            width: '33%',
                                                        }}
                                                    >
                                                        <Select placeholder="请选择" options={activityData} />
                                                    </Form.Item>
                                                )}
                                                <Form.Item
                                                    label="应用描述"
                                                    name="appDesc"
                                                    labelCol={{ span: 5 }}
                                                    wrapperCol={{ span: 19 }}
                                                    style={{
                                                        marginBottom: 10,
                                                        width: '33%',
                                                    }}
                                                >
                                                    <Input placeholder="请输入" />
                                                </Form.Item>
                                                <Form.Item
                                                    label="显示版本"
                                                    name="isNewVersion"
                                                    labelCol={{ span: 5 }}
                                                    wrapperCol={{ span: 19 }}
                                                    style={{
                                                        marginBottom: 10,
                                                        width: '33%',
                                                    }}
                                                >
                                                    <Select
                                                        defaultValue="1"
                                                        placeholder="请选择"
                                                        options={[
                                                            { value: '1', label: '最新版本' },
                                                            { value: '0', label: '全部版本' },
                                                        ]}
                                                    />
                                                </Form.Item>
                                                {userInfo.provinceId !== '0000'&& selectedTitle !== '共享列表' ? (
                                                    <>
                                                        <Form.Item
                                                            label="创建人姓名"
                                                            name="createStaffName"
                                                            labelCol={{ span: 5 }}
                                                            wrapperCol={{ span: 19 }}
                                                            style={{
                                                                marginBottom: 10,
                                                                width: '33%',
                                                            }}
                                                        >
                                                            <Input placeholder="请输入" />
                                                        </Form.Item>
                                                        <Form.Item
                                                            label="创建部门"
                                                            name="createOrgaId"
                                                            labelCol={{ span: 5 }}
                                                            wrapperCol={{ span: 19 }}
                                                            style={{
                                                                marginBottom: 10,
                                                                width: '33%',
                                                            }}
                                                        >
                                                            <TreeSelect
                                                                placeholder="请选择"
                                                                treeData={orgaTreeData}
                                                                loadData={loadOrgaData}
                                                                onSearch={debounceOrgaSearch}
                                                                showSearch
                                                                allowClear
                                                                loading={orgaLoading}
                                                                treeNodeFilterProp="label"
                                                                treeExpandedKeys={orgaExpandedKeys}
                                                                onTreeExpand={(keys: any) => setOrgaExpandedKeys(keys)}
                                                                onChange={(value) => {
                                                                    form.setFieldsValue({ createOrgaId: value });
                                                                }}
                                                            />
                                                        </Form.Item>
                                                    </>
                                                ) : (<></>)}


                                                {/* 查询和重置按钮 */}

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
                                                        <Button type="primary" onClick={handleClick}>
                                                            查询
                                                        </Button>
                                                        <Button style={{ marginRight: 15 }} onClick={handleReset}>
                                                            重置
                                                        </Button>
                                                    </Space>
                                                </Form.Item>
                                            </div>

                                            {/* 弹窗组件 */}
                                            <Modal
                                                // className={styles.addTempModal}
                                                title="选择应用分类"
                                                open={modalVisible}
                                                onCancel={() => setModalVisible(false)}
                                                styles={modalStyles}
                                                footer={null} // 移除默认底部按钮
                                                width={650}
                                                destroyOnClose // 关闭时销毁子元素
                                            >
                                                <CascadeSelect
                                                    appCategory={appType === 0 ? '' : String(appType)}
                                                    appTypeId={selAppTypeId ? selAppTypeId : ''}
                                                    appTypeList={appTypeList}
                                                    onCancel={() => setModalVisible(false)}
                                                    onSure={(data) => {
                                                        form.setFieldsValue({
                                                            appTypeName: data.appTypeName,
                                                        });
                                                        setSelAppTypeId(data.appTypeId);
                                                        setModalVisible(false);
                                                    }}
                                                />
                                            </Modal>

                                            {/* 应用标签选择弹窗 */}
                                            <Modal
                                                title="选择应用标签"
                                                open={tagModalVisible}
                                                onCancel={() => setTagModalVisible(false)}
                                                styles={modalStyles}
                                                footer={null}
                                                width={650}
                                                destroyOnClose
                                            >
                                                <CascadeSelects
                                                    appCategory={appType === 0 ? '1' : String(appType)}
                                                    appTypeId={selTagTypeId ? selTagTypeId : ''}
                                                    appTypeList={appTypeList}
                                                    selectedTagIds={selTagTypeId ? selTagTypeId : ''}
                                                    onCancel={() => setTagModalVisible(false)}
                                                    onSure={(data) => {
                                                        form.setFieldsValue({
                                                            tagTypeName: data.appTypeName,
                                                        });
                                                        setSelTagTypeId(data.appTypeId);
                                                        setSelTagTypeName(data.appTypeName);
                                                        setTagModalVisible(false);
                                                    }}
                                                />
                                            </Modal>
                                        </div>
                                    </div>
                                </Form>
                            </div>
                            <div className="app-list-table">
                                <div className="app-list-header">
                                    <div className="app-list-title">
                                        <span
                                            className={`app-list-title-span ${selectedTitle === '应用列表' ? 'selected' : ''}`}
                                            onClick={() => {
                                                setLoading(true);
                                                setTimeout(() => {
                                                    setSelectedTitle('应用列表');
                                                }, 300);
                                            }}
                                        >
                                            我的应用
                                        </span>
                                        <span
                                            className={`app-list-title-span ${selectedTitle === '共享列表' ? 'selected' : ''}`}
                                            onClick={() => {
                                                setLoading(true);
                                                setTimeout(() => {
                                                    setSelectedTitle('共享列表');
                                                }, 300);
                                            }}
                                        >
                                            他省共享
                                        </span>
                                    </div>
                                    <div className="header-actions">
                                        <Button type="primary" style={{ background: '#8fc320' }} onClick={handleCreatApp}>
                                            +标准创建
                                        </Button>
                                        <Button type="primary" disabled>
                                            +AI创建(建设中)
                                        </Button>
                                    </div>
                                </div>
                                <Table
                                    size="small"
                                    columns={columns}
                                    dataSource={filteredData}
                                    rowKey="id"
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
                                    scroll={{ y: 250 }} // 调整表格高度以适应新增的查询表单
                                    className="table-container"
                                    loading={loading}
                                />
                            </div>
                        </div>
                    ) : displayMode == 1 ? (
                        <AppDetail appId={selectedAppId} data={selectedAppData} onBack={handleBack} />
                    ) : (
                        <React.Suspense fallback={<div />}>
                            <ApplicationOrchestration onCancel={handleCancle} showButton={true} isFromApplicationList={true} />
                        </React.Suspense>
                    )}
                    {/* 编辑应用 */}
                    {editCanvas != 'close' && (
                        <React.Suspense fallback={<div />}>
                            <PageCanvas
                                ref={pageCanvasRef}
                                pageCase="1"
                                currentApp={currentApp}
                                baseConfig={config}
                                appTypeList={appTypeList}
                                backApplyPage={backApplyPageEvent}
                                onOpenSubmitReviewDrawer={handleOpenSubmitReviewDrawer}
                                onReloadPageData={handleReloadPageData}
                                isApplicationList={true}
                            />
                        </React.Suspense>
                    )}

                    {/* 提交审核抽屉 */}
                    <SubmitReviewDrawer visible={submitReviewDrawerVisible} onClose={handleCloseSubmitReviewDrawer} onSubmit={handleSubmitReview} />
                    <Modal
                        title="链接跳转"
                        open={linkModalVisible}
                        onCancel={linkModalVisibleClose}
                        onOk={linkHtmlCreat}
                        okText="跳转链接"
                        cancelText="关闭"
                        width={800}
                        destroyOnClose
                    >
                        <p>{linkData.url}</p>
                    </Modal>
                    <Modal
                        title="应用共享"
                        open={shareModalVisible}
                        onCancel={handleShareModalClose}
                        onOk={handleShareConfirm}
                        okText="确认"
                        cancelText="关闭"
                        width={800}
                        destroyOnClose
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '16px',
                            }}
                        >
                            <div
                                style={{
                                    width: '100px',

                                    paddingTop: '2px',
                                }}
                            >
                                <span style={{ color: '#ff4d4f' }}>*</span>共享省份:
                            </div>
                            <div
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '30px 10px',
                                    alignItems: 'center',
                                    marginTop: '4px',
                                }}
                            >
                                {/* 全网选项 */}
                                <div style={{ width: 'calc(16.666% - 10px)' }}>
                                    <Checkbox
                                        checked={allSelected}
                                        onChange={(e) => {
                                            // 直接控制所有省份的选择状态
                                            const checked = e.target.checked;
                                            setAllSelected(checked);
                                            if (checked) {
                                                // 勾选所有省份（除了当前用户所在省份）
                                                const allProvinceValues = provinceMap?.map((item) => item.value)
                                                    .filter((value) => value !== currentUserProvince) || [];
                                                setSelectedProvinces(allProvinceValues);
                                            } else {
                                                // 取消所有省份的选择
                                                setSelectedProvinces([]);
                                            }
                                        }}
                                    >
                                        全网
                                    </Checkbox>
                                </div>

                                {/* 省份选项 */}
                                {provinceMap.map((item) => (
                                    <div key={item.value} style={{ width: 'calc(16.666% - 10px)' }}>
                                        <Checkbox
                                            checked={selectedProvinces.includes(item.value)}
                                            onChange={(e) => {
                                                const newSelected = e.target.checked
                                                    ? [...selectedProvinces, item.value]
                                                    : selectedProvinces.filter((v) => v !== item.value);
                                                setSelectedProvinces(newSelected);

                                                // 更新全网状态
                                                const allProvinceValues =
                                                    provinceMap?.map((prov) => prov.value).filter((v) => v !== currentUserProvince) || [];
                                                setAllSelected(newSelected.length === allProvinceValues.length);
                                            }}
                                            disabled={item.value === currentUserProvince}
                                        >
                                            {item.label}
                                        </Checkbox>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Modal>
                    {/* 评估弹框组件 */}
                    <AppEvaluationModal
                        key={modalKey}
                        appDetail={appDetail}
                        appEvaluationModalVisible={appEvaluationModalVisible}
                        onCancel={() => {
                            setAppEvaluationModalVisible(false);
                            setModalKey(prev => prev + 1);
                        }}
                        onSubmit={handleEvaluateSubmit}
                    />

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

                    {/* 下架申请弹窗 */}
                    <OffshelfModal
                        visible={offshelfModalVisible}
                        onClose={() => setOffshelfModalVisible(false)}
                        record={activeRecord}
                        onSubmit={handleOffshelfSubmit}
                        onRefresh={() => filterAppData(selectedLevel1, selectedLevel2, selectedLevel3)}
                    />
                </div>
            </AppProvider>
            <BackCall ref={nodeRef} />
            <Upcheckty
                onrefFun={() => {
                    filterAppData(selectedLevel1, selectedLevel2, selectedLevel3);
                }}
                ref={updeRef}
            />
        </>
    );
};

export default AppList;
