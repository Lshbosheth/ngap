import React from 'react';
import { create } from 'zustand';
import { produce } from 'immer';
import { ComponentType, ApiType, PageVariable, EventType, ComItemType } from './../packages/types';
import { cloneDeep, isEqual } from 'lodash-es';
import { createId, getElement, checkComponentType } from './../utils/util';
import { message } from './../utils/AntdGlobal';
import { merge } from 'lodash-es';
import request from '../utils/request';
import dealPageData, { dealPageDataId } from '@/utils/dataToCanvas';
import { mergeApis, updateApiConfig } from '../utils/dealApiGlobal';
import { handleApi } from '../packages/utils/handleApi';

/**
 * 流程画布历史记录操作类型
 */
export type ProcessHistoryActionType =
    | 'ADD_NODE'           // 新增节点
    | 'DELETE_NODE'        // 删除节点
    | 'COPY_NODE'          // 复制节点
    | 'MOVE_NODE'          // 移动节点
    | 'ADD_LINE'           // 添加连线
    | 'DELETE_LINE'        // 删除连线
    | 'UPDATE_BRANCH_TYPE'      // 更新分支类型
    | 'UPDATE_BRANCH_INTERFACE' // 更新分支接口
    | 'ADD_BRANCH'         // 新增分支
    | 'DELETE_BRANCH'      // 删除分支
    | 'UPDATE_BRANCH_CONDITION' // 更新分支条件
    | 'UPDATE_NODE_NAME';       // 修改节点名称

/**
 * 流程画布历史记录项
 */
export interface ProcessHistoryRecord {
    type: ProcessHistoryActionType;
    timestamp: number;
    data: {
        nodeMap?: any;
        lineArr?: any[];
        branchData?: any;
        [key: string]: any;
    };
    description: string;
}

/**
 * 分支条件历史记录操作类型
 */
export type BranchHistoryActionType =
    | 'ADD_BRANCH'           // 新增分支
    | 'DELETE_BRANCH'        // 删除分支
    | 'UPDATE_BRANCH_TYPE'   // 更新分支类型
    | 'UPDATE_BRANCH_INTERFACE' // 更新分支接口
    | 'ADD_BRANCH_CONDITION' // 新增分支条件
    | 'UPDATE_BRANCH_CONDITION' // 修改分支条件
    | 'DELETE_BRANCH_CONDITION'; // 删除分支条件

/**
 * 分支条件历史记录项
 */
export interface BranchHistoryRecord {
    type: BranchHistoryActionType;
    timestamp: number;
    nodeId: string | number;
    data: any;
    description: string;
}

/**
 * 页面信息存储
 */
export interface UserInfoStore {
    userId: number;
    userName: string;
    nickName: string;
    avatar: string;
}
export interface PageConfig {
    provId: string;
    serviceTypeId: string;
    staffId?: string;
    dataType: string;
    componentName?: string;
    componentDesc?: string;
    businessId?: string;
    componentStatus: string;
    componentLevel?: string;
    serviceLink?: string;
    belongModule: string;
    componentCategory: string;
    appPicture?: string;
    componentPicture?: string;
    componentType?: string;
    appCategory: string;
    appDesc: string;
    appLevel: string;
    appName: string;
    appTypeId?: string;
    appTypeName?: string;
    sceneType: string;
    appStatus?: string;
    createStaffId?: string;
    createTime?: string;
    defaultRefresh?: string;
    id?: string;
    isShowNavBar?: string;
    shareStatus?: string;
    showRegion?: string;
    type?: string;
    updateStaffId?: string;
    updateTime?: string;
    templateId?: string;
}
export interface PageState {
    id: string;
    config: PageConfig;
    userInfo: UserInfoStore;
    mode: 'edit' | 'preview';
    theme: 'light' | 'dark';
    selectedElement: { type: string; id: string } | undefined;
    isUpdateToolbar: boolean; // 更新遮罩
    isEdit: boolean; // 是否编辑了页面
    pendingFormItemElement: any;
    setPendingFormItemElement: (element: any) => void;
    page: {
        id: number;
        name: string;
        remark: string;
        projectId: number;
        isPublic: 1 | 2;
        stgState: 1 | 2 | 3 | 4; // 1:未保存 2:已保存 3:已发布 4:已回滚
        preState: 1 | 2 | 3 | 4; // 1:未保存 2:已保存 3:已发布 4:已回滚
        prdState: 1 | 2 | 3 | 4; // 1:未保存 2:已保存 3:已发布 4:已回滚
        stgPublishId: number;
        prePublishId: number;
        prdPublishId: number;
        previewImg?: string;
        userId: number;
        userName: string;
        componentsData: object;
        targetNodeId:string;
        branchComponentsData: object;
        componentList: Array<any>;//已选的业务组件
        processConfig: {
            navigator: { enabled: boolean; title: string };
            scrollMode: 'fixed-top' | 'full-page';
        };
        refreshPageEvent: string;
        relationId?: string;
        belongVersion?: string;
        provId?: string;
        appLevel?: string;
        pageData: {
            // 页面配置数据
            config: {
                props: any;
                // 页面综合样式(scopeCss + scopeStyle)
                style: React.CSSProperties;
                scopeCss: string;
                scopeStyle: React.CSSProperties;
                events: EventType[];
                api: {
                    sourceType: 'json' | 'api';
                    id: string;
                    source: any;
                    sourceField: string | { type: 'variable' | 'static'; value: string };
                };
            };
            events: Array<{ name: string; value: string }>;
            // 页面全局接口
            apis: { [key: string]: ApiType };
            apisGlobal: { [key: string]: ApiType }[];
            apiOutParam: { [key: string]: ApiType };
            apiOutData: { [key: string]: ApiType };
            apiVariables: { [key: string]: any }[];
            crossApisGlobal: { [key: string]: ApiType }[];
            currentCrossApiRow: any;
            elements: ComponentType[];
            elementsMap: { [key: string]: ComponentType };
            // 页面变量
            variables: PageVariable[];
            variableData: { [key: string]: any };
            // 表单数据
            formData: { [key: string]: any };
            // 循环变量数据
            forEachVariables: { [componentId: string]: any };
            // 循环变量可选择值数据
            forEachVariableSelect: { [componentId: string]: any };
            defaultValueInvalidMap: { [key: string]: any };
            // 全局拦截器
            interceptor: {
                headers?: {
                    key: string;
                    value: string;
                }[];
                timeout: number;
                timeoutErrorMessage: string;
                requestInterceptor?: string;
                responseInterceptor?: string;
            };
        };
    };
    processData: {
        nodeData: { [key: string]: any };
    };
    canvasWidthKey: string;
    canvasWidth: string;
    fullScreenState: boolean;
    historyStack: any[];
    redoStack: any[];
    // 流程画布历史记录
    processHistoryStack: ProcessHistoryRecord[];
    processRedoStack: ProcessHistoryRecord[];
    isProcessLoadingComplete: boolean;
    _lastComponentsDataSyncId?: number;
    _isUndoRedoInProgress: boolean;
    _lastUndoSnapshot?: any;
    // 分支条件历史记录
    branchHistoryStack: BranchHistoryRecord[];
    branchRedoStack: BranchHistoryRecord[];
    _lastBranchUndoSnapshot?: any;
    _lastBranchDataSyncId?: number;
    // 条件分支配置弹窗可见性
    isBranchConfigModalVisible: boolean;
}
export interface PageAction {
    setCurrentCrossApiRow: (data: any) => void;
    setRefreshPageEvent: (state: string) => void;
    addBussinessElement: (pageData: any) => void;
    clearBussinessElement: () => void;
    updateId: (id: string) => void;
    updateConfig: (config: PageConfig, id: string, backComponentPage: (state: string) => void) => void;
    saveUserInfo: (userInfo: UserInfoStore) => void;
    savePageInfo: (pageInfo: any) => void;
    updatePageState: (payload: any) => void;
    updateEditState: (isEdit: boolean) => void;
    addApi: (api: ApiType) => void;
    updateApi: (api: ApiType) => void;
    removeApi: (name: string) => void;
    setMode: (mode: 'edit' | 'preview') => void;
    setTheme: (theme: 'light' | 'dark') => void;
    addElement: (element: any, skipHistory?: boolean) => void;
    addChildElements: (element: any, skipHistory?: boolean) => void;
    editElement: (payload: any) => void;
    editTableProps: (payload: any) => void;
    editEvents: (payload: any) => void;
    moveElements: (payload: any) => void;
    setElementAlias: (payload: any) => void; // 设置组件别名方法
    setSelectedElement: (payload: any) => void;
    removeElements: (payload: any) => void;
    dragSortElements: (payload: any) => void;
    addVariable: (payload: PageVariable) => void;
    editVariable: (payload: PageVariable) => void;
    removeVariable: (name: string) => void;
    setVariableData: (payload: any) => void;
    setComponentListData: (data: any) => void;
    setProcessConfig: (data: any) => void;
    updateNodePresentation: (nodeId: string | number, data: any) => void;
    updateComponentName: (nodeName: any, id: string) => void;
    setFormData: (payload: any) => void;
    setForEachVariable: (componentId: string, value: any) => void;
    getForEachVariable: (componentId: string) => any;
    clearForEachVariable: (componentId: string) => void;
    setForEachVariableSelect: (componentId: string, value: any) => void;
    getForEachVariableSelect: (componentId: string) => any;
    clearForEachVariableSelect: (componentId: string) => void;
    setInterceptor: (payload: any) => void;
    setBranchComponentsData: (data: any) => void;
    confiEventbusTem: (payload: any) => void;
    updateApiGlobal: (payload: any) => void;
    addNodeData: (payload: any) => void;
    apiListAddApi: (payload: any) => void | boolean;
    setTargetNodeId: (data: string) => void;
    updateAddApi: (payload: any) => void;
    setComponentsData: (data: any) => void;
    addApiOutParam: (id: string, payload: any, apiList: any) => void;
    editApiOutData: (apiId: any, apiOutData: any) => void;
    updateToolbar: () => void;
    clearPageInfo: () => void;
    backComponentPage: (state: string) => void;
    setCanvasWidthKey: (key: string) => void;
    setCanvasWidth: (width: string) => void;
    setDefaultValueInvalidMap: (key: string) => void;
    setFullScreenState: (fullScreenState: boolean) => void;
    setPendingFormItemElement: (element: any) => void;
    pushHistory: (state: any) => void;
    undo: () => any;
    redo: () => any;
    clearHistory: () => void;
    initHistoryStack: () => void;
    // 流程画布历史记录相关方法
    pushProcessHistory: (record: Omit<ProcessHistoryRecord, 'timestamp'>) => void;
    undoProcess: () => void;
    redoProcess: () => void;
    clearProcessHistory: () => void;
    setUndoRedoInProgress: (inProgress: boolean) => void;
    setProcessLoadingComplete: (complete: boolean) => void;
    // 分支条件历史记录相关方法
    pushBranchHistory: (record: Omit<BranchHistoryRecord, 'timestamp'>) => void;
    undoBranch: () => void;
    redoBranch: () => void;
    clearBranchHistory: () => void;
    // 条件分支配置弹窗可见性
    setBranchConfigModalVisible: (visible: boolean) => void;
    clearFormData: () => void;
    clearVariableData: () => void;
}
export const createCanvasPageStore = (config: any, flag: any, pageData?: any) => {
    return create<PageState & PageAction>((set) => ({
        id: config.id || '',
        config: {
            provId: '',
            serviceTypeId: '',
            staffId: '',
            dataType: '',
            componentName: '',
            componentDesc: '',
            businessId: '',
            componentLevel: '',
            serviceLink: '',
            belongModule: '',
            componentStatus: '',
            componentCategory: '',
            componentType: '',
            appPicture: '', //应用缩略图
            componentPicture: '', //组件缩略图
            appCategory: '',
            appDesc: '',
            appLevel: '',
            appName: '',
            appTypeId: '',
            appTypeName: '',
            sceneType: '',
            appStatus: '',
            createStaffId: '',
            createTime: '',
            defaultRefresh: '',
            id: '',
            isShowNavBar: '',
            shareStatus: '',
            showRegion: '',
            type: '',
            updateStaffId: '',
            updateTime: '',
            templateId: '',
            ...config.config,
        },
        userInfo: {
            userId: 0,
            userName: '',
            nickName: '',
            avatar: '',
        },
        mode: 'edit',
        flag: flag,
        // 是否编辑了页面
        isEdit: false,
        // 画布缩放比例
        zoomRatio: 1,
        //选择组件弹窗
        nodeModelFlag: false,
        nodeModelOpenType: 'click',
        nodeModeTop: '0px',
        nodeModeLeft: '0px',
        theme: 'light',
        selectedElement: undefined,
        isUpdateToolbar: false,
        pendingFormItemElement: null,
        page: {
            id: 0,
            name: '',
            remark: '',
            projectId: 0,
            isPublic: 2,
            userId: 0,
            userName: '',
            previewImg: '',
            stgState: 1,
            preState: 1,
            prdState: 1,
            targetNodeId: '',
            stgPublishId: 0,
            prePublishId: 0,
            prdPublishId: 0,
            componentsData: {},
            branchComponentsData: {},
            refreshPageEvent: "",
            componentList: [],
            processConfig: {
                navigator: { enabled: true, title: '智能诊断' },
                scrollMode: 'fixed-top',
            },
            relationId: "",
            belongVersion: "",
            provId: "",
            appLevel: "",
            pageData: {
                config: {
                    props: {},
                    style: {},
                    scopeCss: '',
                    scopeStyle: {},
                    events: [],
                    api: {
                        sourceType: 'json',
                        id: '',
                        source: {},
                        sourceField: '',
                    },
                },
                events: [],
                // 页面全局接口
                apis: {},
                apisGlobal: [],
                apiOutParam: {},
                apiOutData: {},
                apiVariables: [],
                crossApisGlobal: [],
                currentCrossApiRow: [],
                elements: [], // 组件列表，单个值为组件对象
                elementsMap: {}, // 组件列表转换为对象，key为组件id，value为组件对象
                // 页面变量定义列表
                variables: [],
                // 页面变量数据
                variableData: {},
                // 表单数据
                formData: {},
                // 循环变量数据
                forEachVariables: {},
                // 循环变量可选择值数据
                forEachVariableSelect: {},
                defaultValueInvalidMap: {},
                // 全局拦截器
                interceptor: {
                    headers: [{ key: '', value: '' }],
                    timeout: 8,
                    timeoutErrorMessage: '请求超时，请稍后再试',
                },
                ...pageData,
            },
        },
        // 是否全屏
        fullScreenState: false,
        setDefaultValueInvalidMap: (key: string) => {
            set(
                produce((state) => {
                    if(!state.page.pageData.defaultValueInvalidMap) state.page.pageData.defaultValueInvalidMap = {};
                    state.page.pageData.defaultValueInvalidMap[key] = true;
                })
            )
        },
        processData: {
            nodeData: {}
        },
        canvasWidthKey: '-1',
        canvasWidth: '标准页面-自适应',
        historyStack: [],
        redoStack: [],
        // 流程画布历史记录
        processHistoryStack: [],
        processRedoStack: [],
        isProcessLoadingComplete: false,
        _isUndoRedoInProgress: false,
        // 分支条件历史记录
        branchHistoryStack: [],
        branchRedoStack: [],
        // 条件分支配置弹窗可见性
        isBranchConfigModalVisible: false,
        clearFormData: () => {
            set(
                produce((state) => {
                    state.page.pageData.formData = {};
                    state.page.pageData.defaultValueInvalidMap = {};
                })
            )
        },
        clearVariableData: () => {
            set(
                produce((state) => {
                    state.page.pageData.variableData = {};
                })
            )
        },
        setCurrentCrossApiRow: (data: any) => {
            set(
                produce((state) => {
                    state.currentCrossApiRow = data;
                }),
            );
        },
        setRefreshPageEvent(refreshPageEvent: string) {
            set(
                produce((state) => {
                    state.page.refreshPageEvent = refreshPageEvent
                })
            )
        },
        setTargetNodeId(data: string) {
            set(
                produce((state) => {
                    state.page.targetNodeId = data;
                }),
            );
        },
        setComponentListData(data: any) {
            set(
                produce((state) => {
                    if(data){
                        state.page.componentList = data;
                        // 为了解决向导式新建页面预览获取不到数据的问题，在保存的时候替换掉create
                        if(!state.id){
                            state.id = "create"
                        }
                        data.forEach((node: any) => {
                            for(let key in node.componentData.elementsMap){
                                state.page.pageData.elementsMap[key] = node.componentData.elementsMap[key];
                            }
                        })
                    }
                }),
            );
        },
        setProcessConfig(data: any) {
            set(produce((state) => {
                state.page.processConfig = {
                    navigator: {
                        enabled: data?.navigator?.enabled !== false,
                        title: data?.navigator?.title || '智能诊断',
                    },
                    scrollMode: data?.scrollMode === 'full-page' ? 'full-page' : 'fixed-top',
                };
            }));
        },
        updateNodePresentation(nodeId: string | number, data: any) {
            set(produce((state) => {
                const node = state.page.componentsData?.[nodeId];
                if (node) node.presentation = data;
                state.page.componentList?.forEach((item: any) => {
                    if (String(item.nodeId) === String(nodeId)) {
                        item.presentation = data;
                        if (item.componentData) item.componentData.presentation = data;
                    }
                });
            }));
        },
        updateComponentName(nodeName: any, id: string){
            set(
                produce((state) => {
                    state.page.componentList.forEach((component: any) => {
                        if(component.nodeId === id){
                            component.componentData.componentName = nodeName;
                        }
                    })
                    if(state.page.componentsData[id] && state.page.componentsData[id].componentData){
                        state.page.componentsData[id].componentData.componentName = nodeName;
                    }
                })
            )
        },
        addNodeData: (nodeData: any) => {
            set(
                produce((state) => {
                    if(!state.processData.nodeData)  state.processData.nodeData = {};
                    state.processData.nodeData[nodeData.id] = nodeData.pageData;
                    for(let key in nodeData.pageData.elementsMap){
                        state.page.pageData.elementsMap[key] = nodeData.pageData.elementsMap[key];
                    }
                })
            )
        },
        setComponentsData(data: any) {
            set(
                produce((state) => {
                    state.page.componentsData = data;
                }),
            );
        },
        apiListAddApi: () => {
            return true;
        },
        updateAddApi: (apiListAddApi: any) => {
            set(
                produce((state) => {
                    state.apiListAddApi = apiListAddApi;
                }),
            );
        },
        editApiOutData: (apiId: any, apiOutData: any) => {
            set(
                produce((state) => {
                    if (!state.page?.pageData?.apiOutData) {
                        if (!state.page?.pageData) state.page.pageData = {};
                        state.page.pageData.apiOutData = {};
                    }
                    state.page.pageData.apiOutData[`id_${apiId}`] = apiOutData;
                    if (!state.page?.pageData?.elementsMap) {
                        if (!state.page?.pageData) state.page.pageData = {};
                        state.page.pageData.elementsMap = {};
                    }
                    for (let nodeid in state.page.pageData.elementsMap) {
                        const node = state.page.pageData.elementsMap[nodeid];
                        if (node?.config?.props) {
                            Object.assign(state.page.pageData.elementsMap[nodeid].config.props, { updateFlag: new Date().getTime() });
                        }
                    }
                }),
            );
        },
        updateApiGlobal: (apisGlobal: any) => {
            set(
                produce((state) => {
                    if (!state.page?.pageData) {
                        state.page.pageData = {};
                    }
                    state.page.pageData.apisGlobal = apisGlobal;
                }),
            );
        },
        updateCrossApisGlobal: (crossApisGlobal: any) => {
            set(
                produce((state) => {
                    if (!state.page?.pageData) state.page.pageData = {};
                    state.page.pageData.crossApisGlobal = crossApisGlobal;
                }),
            );
        },
        addApiOutParam: (id: string, outParam?: any, apiList?: any) => {
            set(
                produce((state) => {
                    if (!state.page?.pageData?.apiOutParam) {
                        if (!state.page?.pageData) state.page.pageData = {};
                        state.page.pageData.apiOutParam = {};
                    }
                    state.page.pageData.apiOutParam[id] = outParam;
                    let flag = true;
                    if (!state.page?.pageData?.apiVariables) {
                        if (!state.page?.pageData) state.page.pageData = {};
                        state.page.pageData.apiVariables = [];
                    }
                    for (let i = 0; i < state.page.pageData.apiVariables.length; i++) {
                        if (state.page.pageData.apiVariables[i]?.id == id) {
                            flag = false;
                        }
                    }
                    if (flag) {
                        let api: any = {};
                        for (let i = 0; i < apiList.length; i++) {
                            api = apiList[i].children.filter((item: any) => item.value == id);
                            if (api.length > 0) {
                                break;
                            }
                        }
                        if (api && api.length > 0) {
                            const _n: any = {
                                name: api[0].label,
                                type: 'api',
                                id: id,
                                elements: [],
                            };
                            outParam.forEach((_api: any) => {
                                _n.elements.push({
                                    name: _api.name,
                                    type: 'apiOutParam',
                                    id: `id_${api[0].interfaceId}.${_api.value}`,
                                    elements: [],
                                });
                            });
                            const apiVariables = state.page.pageData.apiVariables;
                            apiVariables.push(_n);
                            state.page.pageData.apiVariables = apiVariables;
                        }
                    }
                }),
            );
        },
        updateId: (id: string) => {
            set(
                produce((state) => {
                    state.id = id;
                }),
            );
        },
        updateConfig: (config: PageConfig, id: string, backComponentPage: (state: string) => void) => {
            set(
                produce((state) => {
                    state.id = id;
                    state.config = { ...config };
                    backComponentPage && (state.backComponentPage = backComponentPage);
                }),
            );
        },
        updateConfig1: (config1: PageConfig) => {
            set(
                produce((state) => {
                    state.config = { ...config1 };
                }),
            );
        },
        saveUserInfo: (userInfo: UserInfoStore) =>
            set(
                produce((state) => {
                    state.userInfo = userInfo;
                }),
            ),
        // 保存页面信息
        savePageInfo: (payload: any) =>
            set(
                produce((state) => {
                    state.isEdit = true; // 标记为编辑状态
                    if (payload.type === 'props') {
                        if (!state.page?.pageData?.config) {
                            if (!state.page?.pageData) state.page.pageData = {};
                            state.page.pageData.config = {};
                        }
                        state.page.pageData.config.props = payload.props;
                    } else if (payload.type === 'style') {
                        // 如果是style，则直接更新
                        if (!state.page?.pageData?.config) {
                            if (!state.page?.pageData) state.page.pageData = {};
                            state.page.pageData.config = {};
                        }
                        state.page.pageData.config.scopeCss = payload.scopeCss;
                        state.page.pageData.config.scopeStyle = payload.scopeStyle;
                        state.page.pageData.config.style = payload.style;
                    } else if (payload.type === 'events') {
                        if (!state.page?.pageData?.config) {
                            if (!state.page?.pageData) state.page.pageData = {};
                            state.page.pageData.config = {};
                        }
                        state.page.pageData.config.events = payload.events || [];
                    } else if (payload.type === 'api') {
                        if (!state.page?.pageData?.config) {
                            if (!state.page?.pageData) state.page.pageData = {};
                            state.page.pageData.config = {};
                        }
                        state.page.pageData.config.api = payload.api;
                    } else if (payload.page) {
                        state.isEdit = false;
                        state.page = merge({}, state.page, payload.page);
                        state.historyStack = state.page.pageData ? [cloneDeep(state.page.pageData)] : [];
                        state.redoStack = [];
                    } else {
                        state.isEdit = false; // 标记为编辑状态
                        state.page = merge({}, state.page, payload);
                        state.historyStack = state.page.pageData ? [cloneDeep(state.page.pageData)] : [];
                        state.redoStack = [];
                    }
                }),
            ),
        updatePageState: ({ env, pageState }) => {
            set(
                produce((state) => {
                    if (env === 'all') {
                        state.page.stgState = 2;
                        state.page.preState = 2;
                        state.page.prdState = 2;
                    } else {
                        state.page[env] = pageState;
                    }
                }),
            );
        },
        // 设置画布缩放比例
        setZoomRatio: (zoomRatio: number) => {
            set(
                produce((state) => {
                    state.zoomRatio = zoomRatio;
                }),
            );
        },
        updateEditState: (isEdit: boolean) => {
            set(
                produce((state) => {
                    state.isEdit = isEdit;
                }),
            );
        },
        addApi: (api) => {
            set(
                produce((state) => {
                    state.isEdit = true; // 标记为编辑状态
                    if (!state.page?.pageData?.apis) {
                        if (!state.page?.pageData) state.page.pageData = {};
                        state.page.pageData.apis = {};
                    }
                    state.page.pageData.apis[api.id] = api;
                    const newState = cloneDeep(state.page.pageData);
                    const lastRecord = state.historyStack[state.historyStack.length - 1];
                    if (lastRecord && isEqual(lastRecord, newState)) {
                        return;
                    }
                    state.historyStack.push(newState);
                    state.redoStack = [];
                    if (state.historyStack.length > 20) {
                        state.historyStack.shift();
                    }
                }),
            );
        },
        updateApi: (api) => {
            set(
                produce((state) => {
                    state.isEdit = true; // 标记为编辑状态
                    if (!state.page?.pageData?.apis) {
                        if (!state.page?.pageData) state.page.pageData = {};
                        state.page.pageData.apis = {};
                    }
                    if (!state.page.pageData.apis[api.id]) {
                        state.page.pageData.apis[api.id] = {};
                    }
                    Object.assign(state.page.pageData.apis[api.id], api);
                    const newState = cloneDeep(state.page.pageData);
                    const lastRecord = state.historyStack[state.historyStack.length - 1];
                    if (lastRecord && isEqual(lastRecord, newState)) {
                        return;
                    }
                    state.historyStack.push(newState);
                    state.redoStack = [];
                    if (state.historyStack.length > 20) {
                        state.historyStack.shift();
                    }
                }),
            );
        },
        removeApi: (id) => {
            set(
                produce((state) => {
                    state.isEdit = true; // 标记为编辑状态
                    if (state.page?.pageData?.apis && state.page.pageData.apis[id]) {
                        delete state.page.pageData.apis[id];
                    }
                    const newState = cloneDeep(state.page.pageData);
                    const lastRecord = state.historyStack[state.historyStack.length - 1];
                    if (lastRecord && isEqual(lastRecord, newState)) {
                        return;
                    }
                    state.historyStack.push(newState);
                    state.redoStack = [];
                    if (state.historyStack.length > 20) {
                        state.historyStack.shift();
                    }
                }),
            );
        },
        // 切换编辑模式
        setMode: (mode: 'edit' | 'preview') => set({ mode }),
        // 切换主题
        setTheme: (theme: 'light' | 'dark') => set({ theme }),
        // 添加业务组件
        addBussinessElement: (element: any) => {
            set(
                produce((state) => {
                    if (!state.page?.pageData?.elements) {
                        if (!state.page?.pageData) state.page.pageData = {};
                        state.page.pageData.elements = [];
                    }
                    if (!state.page?.pageData?.elementsMap) {
                        if (!state.page?.pageData) state.page.pageData = {};
                        state.page.pageData.elementsMap = {};
                    }
                    if (!state.page?.pageData?.formData) {
                        if (!state.page?.pageData) state.page.pageData = {};
                        state.page.pageData.formData = {};
                    }

                    state.page.pageData.elements.push(...(element.elements || []));
                    for (let key in element.elementsMap) {
                        state.page.pageData.elementsMap[key] = element.elementsMap[key];
                    }
                    for (let key in element.formData) {
                        state.page.pageData.formData[key] = element.formData[key];
                    }
                    const newState = cloneDeep(state.page.pageData);
                    const lastRecord = state.historyStack[state.historyStack.length - 1];
                    if (lastRecord && isEqual(lastRecord, newState)) {
                        return;
                    }
                    state.historyStack.push(newState);
                    state.redoStack = [];
                    if (state.historyStack.length > 20) {
                        state.historyStack.shift();
                    }
                }),
            );
        },
        clearBussinessElement: () => {
            set(
                produce((state) => {
                    state.page.pageData.elements = [];
                    state.page.pageData.elementsMap = {};
                    state.page.pageData.formData = {};
                    const newState = cloneDeep(state.page.pageData);
                    const lastRecord = state.historyStack[state.historyStack.length - 1];
                    if (lastRecord && isEqual(lastRecord, newState)) {
                        return;
                    }
                    state.historyStack.push(newState);
                    state.redoStack = [];
                    if (state.historyStack.length > 20) {
                        state.historyStack.shift();
                    }
                }),
            );
        },
        // 添加组件, skipHistory: 是否跳过历史记录（用于批量添加时）
        addElement: (element: ComponentType, skipHistory?: boolean) => {
            set(
                produce((state) => {
                    state.isEdit = true; // 标记为编辑状态
                    if (!state.page?.pageData?.elements) {
                        if (!state.page?.pageData) state.page.pageData = {};
                        state.page.pageData.elements = [];
                    }
                    state.page.pageData.elements.push({
                        id: element.id,
                        parentId: element.parentId,
                        type: element.type,
                        name: element.name,
                        elementAlias: element.name,
                        elements:
                            element.elements?.map((item) => ({
                                id: item.id,
                                parentId: element.id,
                                type: item.type,
                                name: item.name,
                                elementAlias: item.name,
                            })) || [],
                    });
                    const childElement = cloneDeep({
                        ...element,
                        elements: undefined,
                        remoteUrl: element.remoteUrl,
                        remoteConfigUrl: element.remoteConfigUrl,
                        remoteCssUrl: element.remoteCssUrl,
                    });
                    // 修复 Tabs 组件默认 Tab1 的 id 匹配问题
                    if (element.type === 'Tabs' && element?.elements && element.elements.length > 0 && childElement?.config?.props?.items) {
                        // 同步更新 items 中的 id 与实际添加的子组件 id 一致
                        childElement.config.props.items = childElement.config.props.items.map((item: any, index: number) => {
                            if (element.elements && element.elements[index]) {
                                return { ...item, id: element.elements[index].id };
                            }
                            return item;
                        });
                    }
                    if (element.type === 'Collapse' && element.elements && element.elements.length > 0 && childElement?.config?.props?.items) {
                        // 同步更新 items 中的 id 与实际添加的子组件 id 一致
                        childElement.config.props.items = childElement.config.props.items.map((item: any, index: number) => {
                            if (element.elements && element.elements[index]) {
                                return { ...item, id: element.elements[index].id };
                            }
                            return item;
                        });
                    }
                    if (element.config?.props.formItem) {
                        childElement.config.props.formItem.name = element.id;
                    }
                    // 添加当前组件对象
                    state.page.pageData.elementsMap[element.id] = childElement;
                    // 添加子组件对象
                    element.elements?.map((item) => {
                        state.page.pageData.elementsMap[item.id] = item;
                    });
                    const newState = cloneDeep(state.page.pageData);
                    const lastRecord = state.historyStack[state.historyStack.length - 1];
                    if (lastRecord && isEqual(lastRecord, newState)) {
                        return;
                    }
                    if (!skipHistory) {
                        state.historyStack.push(newState);
                        state.redoStack = [];
                        if (state.historyStack.length > 20) {
                            state.historyStack.shift();
                        }
                    }
                }),
            );
        },
        // 添加子组件, skipHistory: 是否跳过历史记录（用于批量添加时）
        addChildElements(element: ComponentType, skipHistory?: boolean) {
            if (element.type == 'businessComponent') {
                (async () => {
                    try {
                        let configServiceTypeId: any;
                        set(
                            produce((state) => {
                                configServiceTypeId = state.config.serviceTypeId;
                            }),
                        );

                        const data = await request.post('/appComponent/queryAppComponentInfo', {
                            params: {
                                serviceTypeId: configServiceTypeId,
                                id: (element as any).componentId,
                            },
                        });

                        const { pageData } = dealPageData(data.bean);
                        dealPageDataId(pageData);
                        set(
                            produce((state) => {
                                // 处理变量
                                const variablesNames = state.page.pageData.variables.map((variable: any) => variable.name);
                                (pageData.variables || []).forEach((variable: any) => {
                                    if (variablesNames.indexOf(variable.name) == -1) {
                                        state.addVariable(variable);
                                    } else {
                                        state.editVariable(variable);
                                    }
                                });

                                // 变量数据
                                for (let key in pageData.variableData) {
                                    state.setVariableData({ name: key, value: pageData.variableData[key] });
                                }

                                // API 配置
                                updateApiConfig({
                                    api: mergeApis(state.page.pageData.apisGlobal, pageData, state.updateApiGlobal),
                                    apiOutParam: state.page.pageData.apiOutParam,
                                    addApiOutParam: state.addApiOutParam,
                                    apiOutData: state.page.pageData.apiOutData,
                                    editApiOutData: state.editApiOutData,
                                    handleApi,
                                    _state: (element as any)._state,
                                    userInfo: (element as any).userInfo,
                                    apiList: (element as any).apiList,
                                });
                                function deepMoreFind(list: ComItemType[]) {
                                    for (let i = 0; i < list.length; i++) {
                                        const item = list[i];
                                        if (item.id == element.parentId) {
                                            if (item.elements === undefined) {
                                                item.elements = [];
                                            }
                                            pageData.elements.forEach((item2: any) => {
                                                item2.parentId = element.parentId;
                                                item.elements.push(item2);
                                            });
                                            function setElementsToMap(elements: any[]) {
                                                if (!elements || elements.length === 0) return;
                                                elements.forEach((item3) => {
                                                    state.page.pageData.elementsMap[item3.id] = item3;
                                                    // 递归子元素
                                                    if (item3.elements?.length) {
                                                        setElementsToMap(item3.elements);
                                                    }
                                                });
                                            }
                                            setElementsToMap(pageData.elements);
                                        } else if (item.elements?.length) {
                                            deepMoreFind(item.elements);
                                        }
                                    }
                                    return list;
                                }
                                deepMoreFind(state.page.pageData.elements);
                                state.isEdit = true;
                                const newState = cloneDeep(state.page.pageData);
                                const lastRecord = state.historyStack[state.historyStack.length - 1];
                                if (lastRecord && isEqual(lastRecord, newState)) {
                                    state.isUpdateToolbar = !state.isUpdateToolbar;
                                    return;
                                }
                                if (!skipHistory) {
                                    state.historyStack.push(newState);
                                    state.redoStack = [];
                                    if (state.historyStack.length > 20) {
                                        state.historyStack.shift();
                                    }
                                }
                                state.isUpdateToolbar = !state.isUpdateToolbar;
                            }),
                        );
                    } catch (err) {
                        console.error('业务组件加载失败', err);
                    }
                })();
                return;
            } else {
                set(
                    produce((state) => {
                        state.isEdit = true; // 标记为编辑状态
                        let parentItem: any;
                        function deepFind(list: ComItemType[]) {
                            for (let i = 0; i < list.length; i++) {
                                const item = list[i];
                                // 根据parentId先找到当前组件的父组件
                                if (item.id == element.parentId) {
                                    parentItem = item;
                                    break;
                                } else if (item.elements?.length) {
                                    deepFind(item.elements);
                                }
                            }
                            return list;
                        }
                        deepFind(state.page.pageData.elements);
                        if (parentItem) {
                            if (!checkComponentType(element.type, parentItem?.id, parentItem?.type, state.page.pageData.elementsMap)) {
                                state.pendingFormItemElement = element;
                                return;
                            }
                            if (parentItem.elements === undefined) {
                                parentItem.elements = [];
                            }
                            parentItem.elements.push({
                                id: element.id,
                                parentId: element.parentId,
                                type: element.type,
                                name: element.name,
                                elementAlias: element.name,
                                param: element.param,
                                elements:
                                    element.elements?.map((parentItem) => ({
                                        id: parentItem.id,
                                        parentId: element.id,
                                        type: parentItem.type,
                                        name: parentItem.name,
                                        elementAlias: element.name,
                                        elements: [],
                                    })) || [],
                            });
                            const childElement = cloneDeep({
                                ...element,
                                elements: undefined,
                                remoteUrl: element.remoteUrl,
                                remoteConfigUrl: element.remoteConfigUrl,
                                remoteCssUrl: element.remoteCssUrl,
                            });
                            // 默认给表单组件添加name属性
                            if (element.type !== 'FormItem' && element?.config?.props?.formItem) {
                                childElement.config.props.formItem.name = element.id;
                            }
                            // 添加当前组件对象
                            state.page.pageData.elementsMap[element.id] = childElement;
                            // 添加子组件对象
                            element.elements?.map((item) => {
                                state.page.pageData.elementsMap[item.id] = item;
                            });
                        }
                        const newState = cloneDeep(state.page.pageData);
                        const lastRecord = state.historyStack[state.historyStack.length - 1];
                        if (lastRecord && isEqual(lastRecord, newState)) {
                            state.isUpdateToolbar = !state.isUpdateToolbar;
                            return;
                        }
                        if (!skipHistory) {
                            state.historyStack.push(newState);
                            state.redoStack = [];
                            if (state.historyStack.length > 20) {
                                state.historyStack.shift();
                            }
                        }
                        state.isUpdateToolbar = !state.isUpdateToolbar;
                    }),
                );
            }
        },
        // 更新组件属性、样式
        editElement(payload: any) {
            set(
                produce((state) => {
                    state.isEdit = true; // 标记为编辑状态
                    const item = state.page.pageData.elementsMap[payload.id];
                    // 属性修改
                    if (payload.type === 'props') {
                        Object.assign(item.config.props, payload.props);
                        // Tabs标签对象需要同步属性值到Tab组件中
                        if (item.type === 'Tabs') {
                            const { element: parentItem } = getElement(state.page.pageData.elements, payload.id);
                            if (parentItem?.elements.length === payload.props.items.length) {
                                parentItem?.elements.map((item, index) => {
                                    Object.assign(state.page.pageData.elementsMap[item.id].config.props, payload.props.items[index]);
                                });
                            } else {
                                parentItem?.elements.map((item, index) => {
                                    if (!payload.props.items.find((prop: { id: string }) => prop.id === item.id)) {
                                        parentItem?.elements.splice(index, 1);
                                        delete state.page.pageData.elementsMap[item.id];
                                        // 递归删除相互引用的嵌套父子组件
                                        const deepRemove = (id: string) => {
                                            // 删除子组件
                                            Object.values(state.page.pageData.elementsMap).map((item: any) => {
                                                if (item.parentId == id) {
                                                    delete state.page.pageData.elementsMap[item.id];
                                                    deepRemove(item.id);
                                                }
                                                return item;
                                            });
                                        };
                                        deepRemove(item.id);
                                    }
                                });
                            }
                        }
                        // Tab对象需要同步属性值到Tabs组件中
                        if (item.type === 'Tab') {
                            const parentItem = state.page.pageData.elementsMap[item.parentId];
                            if (parentItem && parentItem?.config?.props?.items) {
                                const tabItem = parentItem.config.props.items.find((tab: { id: string }) => tab.id === item.id);
                                if (tabItem) {
                                    tabItem.label = payload.props.label;
                                    tabItem.key = payload.props.key;
                                    tabItem.icon = payload.props.icon;
                                    tabItem.closable = payload.props.closable;
                                    tabItem.disabled = payload.props.disabled;
                                }
                            }
                        }
                        if (item.type === 'Collapse') {
                            const { element: parentItem } = getElement(state.page.pageData.elements, payload.id);
                            if (parentItem?.elements.length === payload.props.items.length) {
                                parentItem?.elements.map((item, index) => {
                                    Object.assign(state.page.pageData.elementsMap[item.id].config.props, payload.props.items[index]);
                                });
                            } else {
                                parentItem?.elements.map((item, index) => {
                                    if (!payload.props.items.find((prop: { id: string }) => prop.id === item.id)) {
                                        parentItem?.elements.splice(index, 1);
                                        delete state.page.pageData.elementsMap[item.id];
                                        // 递归删除相互引用的嵌套父子组件
                                        const deepRemove = (id: string) => {
                                            // 删除子组件
                                            Object.values(state.page.pageData.elementsMap).map((item: any) => {
                                                if (item.parentId == id) {
                                                    delete state.page.pageData.elementsMap[item.id];
                                                    deepRemove(item.id);
                                                }
                                                return item;
                                            });
                                        };
                                        deepRemove(item.id);
                                    }
                                });
                            }
                        }
                        if (item.type === 'CollapseItem') {
                            const parentItem = state?.page?.pageData?.elementsMap?.[item.parentId];
                            if (parentItem && parentItem?.config?.props?.items) {
                                const CollapseItem = parentItem.config.props.items.find((tab: { id: string }) => tab.id === item.id);
                                if (CollapseItem) {
                                    CollapseItem.label = payload.props.label;
                                    CollapseItem.key = payload.props.key;
                                    CollapseItem.icon = payload.props.icon;
                                    CollapseItem.closable = payload.props.closable;
                                    CollapseItem.disabled = payload.props.disabled;
                                }
                            }
                        }
                    } else if (payload.type === 'style') {
                        // 如果是style，则直接更新
                        item.config.scopeCss = payload.scopeCss;
                        item.config.scopeStyle = payload.scopeStyle;
                        item.config.style = payload.style;
                    } else if (payload.type === 'events') {
                        item.config.events = payload.events || [];
                    } else if (payload.type === 'api') {
                        item.config.api = payload.api;
                        if (payload.api.sourceType !== 'api') {
                            item.config.api.id = undefined;
                        } else {
                            // 如果ID存在，更新一下数据源字段即可。使用现有的api列表，不需要繁琐的配置
                            // if (payload.api.id) {
                            //   state.page.pageData.apis[payload.api.id].sourceField = payload.api.sourceField;
                            // }
                        }
                    }
                    state.isUpdateToolbar = !state.isUpdateToolbar;
                    const newState = cloneDeep(state.page.pageData);
                    const lastRecord = state.historyStack[state.historyStack.length - 1];
                    if (lastRecord && isEqual(lastRecord, newState)) {
                        return;
                    }
                    state.historyStack.push(newState);
                    state.redoStack = [];
                    if (state.historyStack.length > 20) {
                        state.historyStack.shift();
                    }
                }),
            );
        },
        // 更新表格列表的操作按钮
        editTableProps(payload: any) {
            set(
                produce((state) => {
                    state.isEdit = true; // 标记为编辑状态
                    const item = state.page.pageData.elementsMap[payload.id];
                    if (payload.type === 'column') {
                        if (!item.config.props.columns) item.config.props.columns = [];
                        item.config.props.columns[payload.index] = payload.props;
                    } else if (payload.type === 'formTable') {
                        if (!item?.config?.props?.formWrap?.columns) {
                            if (!item?.config?.props?.formWrap) item.config.props.formWrap = {};
                            item.config.props.formWrap.columns = [];
                        }
                        item.config.props.formWrap.columns[payload.index] = payload.props;
                    } else if (payload.type === 'items') {
                        if (!item.config.props.items) item.config.props.items = [];
                        item.config.props.items[payload.index] = payload.props;
                    } else if (payload.type === 'props') {
                        Object.assign(item.config.props, payload.props);
                    } else {
                        if (!item.config.props.bulkActionList) item.config.props.bulkActionList = [];
                        item.config.props.bulkActionList[payload.index] = payload.props;
                    }
                    state.isUpdateToolbar = !state.isUpdateToolbar;
                    const newState = cloneDeep(state.page.pageData);
                    const lastRecord = state.historyStack[state.historyStack.length - 1];
                    if (lastRecord && isEqual(lastRecord, newState)) {
                        return;
                    }
                    state.historyStack.push(newState);
                    state.redoStack = [];
                    if (state.historyStack.length > 20) {
                        state.historyStack.shift();
                    }
                }),
            );
        },
        // 更新组件事件，比如表格中动态新加的按钮，需要更新事件
        editEvents(payload: any) {
            set(
                produce((state) => {
                    state.isEdit = true; // 标记为编辑状态
                    const item = state.page.pageData.elementsMap[payload.id];
                    item.events = payload.events;
                }),
            );
        },
        // 组件排序
        moveElements(payload: any) {
            set(
                produce((state) => {
                    state.isEdit = true; // 标记为编辑状态
                    const { componentId, direction } = payload;
                    function deepFind(list: ComponentType[]) {
                        for (let index = 0; index < list.length; index++) {
                            const item = list[index];
                            if (item.id == componentId) {
                                if (direction === 'up' && index > 0) {
                                    [list[index], list[index - 1]] = [list[index - 1], list[index]];
                                } else if (direction === 'down' && list.length - 1 > index) {
                                    [list[index], list[index + 1]] = [list[index + 1], list[index]];
                                }
                                break;
                            } else if (item.elements?.length) {
                                deepFind(item.elements);
                            }
                        }
                    }
                    deepFind(state.page.pageData.elements);
                    const newState = cloneDeep(state.page.pageData);
                    const lastRecord = state.historyStack[state.historyStack.length - 1];
                    if (lastRecord && isEqual(lastRecord, newState)) {
                        return;
                    }
                    state.historyStack.push(newState);
                    state.redoStack = [];
                    if (state.historyStack.length > 20) {
                        state.historyStack.shift();
                    }
                }),
            );
        },
        // 设置元素别名
        setElementAlias(payload: any) {
            set(
                produce((state) => {
                    const { componentId, elementAlias } = payload;
                    function deepFind(list: ComponentType[]) {
                        for (let index = 0; index < list.length; index++) {
                            const item = list[index];
                            if (item.id == componentId) {
                                if (elementAlias) {
                                    item.elementAlias = `${elementAlias}(${item.name})`;
                                } else {
                                    item.elementAlias = item.name;
                                }

                                break;
                            } else if (item.elements?.length) {
                                deepFind(item.elements);
                            }
                        }
                    }
                    deepFind(state.page.pageData.elements);
                }),
            );
        },
        // 组件大纲拖拽排序
        dragSortElements({ id, list, parentId }: any) {
            set(
                produce((state) => {
                    state.isEdit = true; // 标记为编辑状态
                    state.page.pageData.elements = list;
                    state.page.pageData.elementsMap[id].parentId = parentId;
                    const newState = cloneDeep(state.page.pageData);
                    const lastRecord = state.historyStack[state.historyStack.length - 1];
                    if (lastRecord && isEqual(lastRecord, newState)) {
                        return;
                    }
                    state.historyStack.push(newState);
                    state.redoStack = [];
                    if (state.historyStack.length > 20) {
                        state.historyStack.shift();
                    }
                }),
            );
        },
        // 设置选中的组件列表
        setSelectedElement(payload: any) {
            set(() => {
                return { selectedElement: payload };
            });
        },
        setPendingFormItemElement(element: any) {
            set(() => {
                return { pendingFormItemElement: element };
            });
        },
        removeElements(payload: any) {
            set(
                produce((state) => {
                    state.isEdit = true; // 标记为编辑状态
                    const id = payload;
                    function deepFind(list: ComponentType[]) {
                        for (let i = 0; i < list.length; i++) {
                            const item = list[i];
                            if (item.id == id) {
                                // CollapseItem 和 Tab 类型特殊处理：检查父组件 items 列表
                                if (['CollapseItem', 'Tab'].includes(item.type) && item.parentId) {
                                    const parentItem = state.page.pageData.elementsMap[item.parentId];
                                    if (parentItem?.config?.props?.items && parentItem.config.props.items.length <= 1) {
                                        return; // 列表只剩最后一个，不执行删除
                                    }
                                    // 删除父组件 items 中对应的元素
                                    if (parentItem?.config?.props?.items) {
                                        parentItem.config.props.items = parentItem.config.props.items.filter(
                                            (tab: any) => tab.id !== id
                                        );
                                    }
                                }

                                list.splice(i, 1);
                                delete state.page.pageData.elementsMap[id];

                                // 递归删除相互引用的嵌套父子组件
                                const deepRemove = (id: string) => {
                                    // 删除子组件
                                    Object.values(state.page.pageData.elementsMap).map((item: any) => {
                                        if (item.parentId == id) {
                                            delete state.page.pageData.elementsMap[item.id];
                                            deepRemove(item.id);
                                        }
                                        return item;
                                    });
                                };
                                deepRemove(id);
                                break;
                            } else if (item.elements?.length) {
                                deepFind(item.elements);
                            }
                        }
                    }
                    deepFind(state.page.pageData.elements);
                    state.selectedElement = undefined;
                    const newState = cloneDeep(state.page.pageData);
                    const lastRecord = state.historyStack[state.historyStack.length - 1];
                    if (lastRecord && isEqual(lastRecord, newState)) {
                        return;
                    }
                    state.historyStack.push(newState);
                    state.redoStack = [];
                    if (state.historyStack.length > 20) {
                        state.historyStack.shift();
                    }
                }),
            );
        },
        // 添加变量
        addVariable(payload: PageVariable) {
            set(
                produce((state) => {
                    state.isEdit = true; // 标记为编辑状态
                    state.page.pageData.variables.push(payload);
                }),
            );
        },
        // 更新变量
        editVariable(payload: PageVariable) {
            set(
                produce((state) => {
                    state.isEdit = true; // 标记为编辑状态
                    const index = state.page.pageData.variables.findIndex((item: PageVariable) => item.name == payload.name);
                    if (index > -1) {
                        if(!state.page.pageData.variableData) state.page.pageData.variableData = {};
                        state.page.pageData.variableData[payload.name] = payload.defaultValue;
                        state.page.pageData.variables[index] = payload;
                    }
                }),
            );
        },
        // 删除变量
        removeVariable(name: string) {
            set(
                produce((state) => {
                    state.isEdit = true; // 标记为编辑状态
                    state.page.pageData.variables = state.page.pageData.variables.filter((item: PageVariable) => item.name !== name);
                }),
            );
        },
        setVariableData({ name, value }: any) {
            set(
                produce((state) => {
                    if(!state.page.pageData.variableData) state.page.pageData.variableData = {};
                    state.page.pageData.variableData[name] = value;
                }),
            );
        },
        setForEachVariable: (componentId: string, value: any) => {
            set(
                produce((state) => {
                    if (!state.page.pageData.forEachVariables) {
                        state.page.pageData.forEachVariables = {};
                    }
                    state.page.pageData.forEachVariables[componentId] = value;
                }),
            );

        },
        setForEachVariableSelect: (componentId: string, value: any) => {
            set(
                produce((state) => {
                    if (!state.page.pageData.forEachVariableSelect) {
                        state.page.pageData.forEachVariableSelect = {};
                    }
                    state.page.pageData.forEachVariableSelect[componentId] = value;
                }),
            );

        },
        getForEachVariable: (componentId: string) => {
            // 这个方法需要在具体使用时通过 store 实例调用
            return (state: any) => state.page.pageData.forEachVariables[componentId];
        },
        getForEachVariableSelect: (componentId: string) => {
            // 这个方法需要在具体使用时通过 store 实例调用
            return (state: any) => state.page.pageData.forEachVariableSelect[componentId];
        },
        clearForEachVariable: (componentId: string) => {
            set(
                produce((state) => {
                    delete state.page.pageData.forEachVariables[componentId];
                }),
            );
        },
        clearForEachVariableSelect: (componentId: string) => {
            set(
                produce((state) => {
                    delete state.page.pageData.forEachVariableSelect[componentId];
                }),
            );
        },
        setFormData({ name, value, type, skipHistory }: any) {
            set(
                produce((state) => {
                    if(!state.page.pageData.formData){
                        state.page.pageData.formData = {};
                    }
                    if (type === 'override') {
                        state.page.pageData.formData[name] = value;
                    } else {
                        // ✅ 使用immer的merge功能，避免不必要的对象创建
                        const existingData = state.page.pageData.formData[name] || {};
                        Object.assign(existingData, value);
                        state.page.pageData.formData[name] = existingData;
                    }
                    // 只有在明确需要记录历史时才添加
                    if (!skipHistory) {
                        state.historyStack.push(cloneDeep(state.page.pageData));
                        state.redoStack = [];
                        if (state.historyStack.length > 20) {
                            state.historyStack.shift();
                        }
                    }
                }),
            );
        },
        setInterceptor(payload: any) {
            set(
                produce((state) => {
                    state.isEdit = true; // 标记为编辑状态
                    state.page.pageData.interceptor = payload;
                    state.historyStack.push(cloneDeep(state.page.pageData));
                    state.redoStack = [];
                    if (state.historyStack.length > 20) {
                        state.historyStack.shift();
                    }
                }),
            );
        },
        // 有些场景下，需要手工更新组件选中的工具条
        updateToolbar: () => {
            set((state) => {
                return {
                    isUpdateToolbar: !state.isUpdateToolbar,
                };
            });
        },
        setBranchComponentsData(data: any = {}) {
            set(
                produce((state) => {
                    if(!state.page.branchComponentsData) state.page.branchComponentsData = {};
                    let branchComponentsData = JSON.parse(JSON.stringify(state.page.branchComponentsData));
                    Object.keys(data).forEach((nodeId: string | number) => {
                        branchComponentsData[nodeId] = data[nodeId];
                    })
                    state.page.branchComponentsData = branchComponentsData;
                }),
            );
        },
        // 清除页面信息
        clearPageInfo() {
            set(
                produce((state) => {
                    state.page = {
                        id: 0,
                        name: '',
                        remark: '',
                        projectId: 0,
                        userId: 0,
                        userName: '',
                        previewImg: '',
                        stgState: 1,
                        preState: 1,
                        prdState: 1,
                        stgPublishId: 0,
                        prePublishId: 0,
                        prdPublishId: 0,
                        targetNodeId:'',
                        componentsData:{},
                        branchComponentsData:{},
                        componentList: [],
                        processConfig: {
                            navigator: { enabled: true, title: '智能诊断' },
                            scrollMode: 'fixed-top',
                        },
                        refreshPageEvent: "",
                        pageData: {
                            config: {
                                props: {},
                                style: {},
                                scopeCss: '',
                                scopeStyle: {},
                                events: [],
                                api: {
                                    sourceType: 'json',
                                    id: '',
                                    source: {},
                                    sourceField: '',
                                },
                            },
                            events: [],
                            // 页面全局接口
                            apis: {},
                            apisGlobal: [],
                            apiOutParam: {},
                            apiOutData: {},
                            apiVariables: [],
                            crossApisGlobal: [],
                            elements: [],
                            elementsMap: {},
                            // 页面变量定义列表
                            variables: [],
                            // 页面变量数据
                            variableData: {},
                            // 表单数据
                            formData: {},
                            // 循环变量数据
                            forEachVariables: {},
                            // 循环变量可选择值数据
                            forEachVariableSelect: {},
                            // 全局拦截器
                            interceptor: {
                                headers: [{ key: '', value: '' }],
                                timeout: 8,
                                timeoutErrorMessage: '请求超时，请稍后再试',
                            },
                        },
                        processData: {
                            nodeData: {}
                        },
                        canvasWidthKey: '-1',
                        canvasWidth: '标准页面-自适应',
                    };
                    state.historyStack = [];
                    state.redoStack = [];
                    state.processHistoryStack = [];
                    state.processRedoStack = [];
                    state.isProcessLoadingComplete = false;
                }),
            );
        },
        backComponentPage(state: string) {
            config.backComponentPage();
        },
        confiEventbusTem(state: string) {
            config.confiEventbusTem();
        },
        //设置选择组件弹窗显示和隐藏
        setNodeModelState: (nodeModelFlag: boolean, nodeModelOpenType?: string, top?: string, left?: string) => {
            set(
                produce((state) => {
                    state.nodeModelFlag = nodeModelFlag;
                    state.nodeModelOpenType = nodeModelOpenType;
                    state.nodeModeTop = top;
                    state.nodeModeLeft = left;
                }),
            );
        },
        setCanvasWidthKey: (key: string) => {
            set(
                produce((state) => {
                    state.canvasWidthKey = key;
                }),
            );
        },
        setCanvasWidth: (width: string) => {
            set(
                produce((state) => {
                    state.canvasWidth = width;
                }),
            );
        },
        setFullScreenState: (fullScreenState: boolean) => {
            set(
                produce((state) => {
                    state.fullScreenState = fullScreenState;
                }),
            );
        },
        pushHistory: (historyState: any) => {
            set(
                produce((state) => {
                    const lastRecord = state.historyStack[state.historyStack.length - 1];
                    if (lastRecord && isEqual(lastRecord, historyState)) {
                        return;
                    }
                    state.historyStack.push(historyState);
                    state.redoStack = [];
                    if (state.historyStack.length > 20) {
                        state.historyStack.shift();
                    }
                }),
            );
        },
        undo: () => {
            set(
                produce((state) => {
                    if (state.historyStack.length > 1) {
                        const currentState = state.historyStack.pop();
                        state.redoStack.push(currentState);
                        const prevState = state.historyStack[state.historyStack.length - 1];
                        Object.assign(state.page.pageData, cloneDeep(prevState));
                    }
                }),
            );
        },
        redo: () => {
            set(
                produce((state) => {
                    if (state.redoStack.length > 0) {
                        const redoState = state.redoStack.pop();
                        state.historyStack.push(redoState);
                        Object.assign(state.page.pageData, cloneDeep(redoState));
                    }
                }),
            );
        },
        clearHistory: () => {
            set(
                produce((state) => {
                    state.historyStack = [];
                    state.redoStack = [];
                }),
            );
        },
        initHistoryStack: () => {
            set(
                produce((state) => {
                    const currentPageData = state.page.pageData;
                    const hasExistingRecord = state.historyStack.length === 1 &&
                        currentPageData &&
                        isEqual(state.historyStack[0], currentPageData);
                    if (!hasExistingRecord) {
                        state.historyStack = currentPageData ? [cloneDeep(currentPageData)] : [];
                        state.redoStack = [];
                    }
                }),
            );
        },
        // 分支条件历史记录 - 推入历史
        pushBranchHistory: (record: Omit<BranchHistoryRecord, 'timestamp'>) => {
            set(
                produce((state) => {
                    if (!state.isProcessLoadingComplete) return;
                    const fullRecord: BranchHistoryRecord = {
                        ...record,
                        timestamp: Date.now(),
                    };
                    state.branchHistoryStack.push(fullRecord);
                    state.branchRedoStack = [];
                    if (state.branchHistoryStack.length > 20) {
                        state.branchHistoryStack.shift();
                    }
                }),
            );
        },
        // 分支条件历史记录 - 撤销
        undoBranch: () => {
            set(
                produce((state) => {
                    if (state.branchHistoryStack.length > 1) {
                        const currentRecord = state.branchHistoryStack.pop();
                        if (currentRecord) {
                            state.branchRedoStack.push(currentRecord);
                        }
                        const undoneRecord = state.branchHistoryStack[state.branchHistoryStack.length - 1];
                        if (undoneRecord?.data?.branchData) {
                            Object.assign(state.page.branchComponentsData, undoneRecord.data.branchData);
                            state._lastBranchUndoSnapshot = cloneDeep(undoneRecord.data);
                            state._lastBranchDataSyncId = Date.now();
                        }
                    }
                }),
            );
        },
        // 分支条件历史记录 - 重做
        redoBranch: () => {
            set(
                produce((state) => {
                    if (state.branchRedoStack.length > 0) {
                        const record = state.branchRedoStack.pop();
                        if (record) {
                            state.branchHistoryStack.push(record);
                            if (state.branchHistoryStack.length > 20) {
                                state.branchHistoryStack.shift();
                            }
                            if (record?.data?.branchData) {
                                Object.assign(state.page.branchComponentsData, record.data.branchData);
                                state._lastBranchUndoSnapshot = cloneDeep(record.data);
                                state._lastBranchDataSyncId = Date.now();
                            }
                        }
                    }
                }),
            );
        },
        // 流程画布历史记录 - 推入历史
        pushProcessHistory: (record: Omit<ProcessHistoryRecord, 'timestamp'>) => {
            set(
                produce((state) => {
                    if (!state.isProcessLoadingComplete) return;
                    const lastRecord = state.processHistoryStack[state.processHistoryStack.length - 1];
                    // 只有当操作类型相同时才进行 isEqual 去重检查
                    if (lastRecord && lastRecord.type === record.type && isEqual(lastRecord.data, record.data)) {
                        return;
                    }
                    const fullRecord: ProcessHistoryRecord = {
                        ...record,
                        timestamp: Date.now(),
                    };
                    state.processHistoryStack.push(fullRecord);
                    state.processRedoStack = [];
                    if (state.processHistoryStack.length > 20) {
                        state.processHistoryStack.shift();
                    }
                }),
            );
        },
        // 流程画布历史记录 - 撤销
        undoProcess: () => {
            set(
                produce((state) => {
                    state.isBranchConfigModalVisible = false;
                    if (state.processHistoryStack.length > 1) {
                        const currentRecord = state.processHistoryStack.pop();
                        if (currentRecord) {
                            state.processRedoStack.push(currentRecord);
                        }
                        const undoneRecord = state.processHistoryStack[state.processHistoryStack.length - 1];
                        if (undoneRecord?.data) {
                            state.page.componentsData = cloneDeep(undoneRecord.data.nodeMap);
                            if (undoneRecord.data.componentList) {
                                state.page.componentList = cloneDeep(undoneRecord.data.componentList);
                            }
                            if (undoneRecord.data.processData) {
                                state.processData.nodeData = cloneDeep(undoneRecord.data.processData);
                            }
                            if (undoneRecord.data.branchData) {
                                state.page.branchComponentsData = cloneDeep(undoneRecord.data.branchData);
                            }
                            state._lastUndoSnapshot = cloneDeep(undoneRecord.data);
                            state._lastComponentsDataSyncId = Date.now();
                            state._isUndoRedoInProgress = true;
                        }
                    }
                }),
            );
        },
        // 流程画布历史记录 - 重做
        redoProcess: () => {
            set(
                produce((state) => {
                    state.isBranchConfigModalVisible = false;
                    if (state.processRedoStack.length > 0) {
                        const record = state.processRedoStack.pop();
                        if (record) {
                            state.processHistoryStack.push(record);
                            if (state.processHistoryStack.length > 20) {
                                state.processHistoryStack.shift();
                            }
                            if (record?.data) {
                                state.page.componentsData = cloneDeep(record.data.nodeMap);
                                if (record.data.componentList) {
                                    state.page.componentList = cloneDeep(record.data.componentList);
                                }
                                if (record.data.processData) {
                                    state.processData.nodeData = cloneDeep(record.data.processData);
                                }
                                if (record.data.branchData) {
                                    state.page.branchComponentsData = cloneDeep(record.data.branchData);
                                }
                                state._lastUndoSnapshot = cloneDeep(record.data);
                                state._lastComponentsDataSyncId = Date.now();
                                state._isUndoRedoInProgress = true;
                            }
                        }
                    }
                }),
            );
        },
        // 流程画布历史记录 - 清空
        clearProcessHistory: () => {
            set(
                produce((state) => {
                    state.processHistoryStack = [];
                    state.processRedoStack = [];
                }),
            );
        },
        // 设置流程加载完成状态
        setProcessLoadingComplete: (complete: boolean) => {
            set(
                produce((state) => {
                    state.isProcessLoadingComplete = complete;
                }),
            );
        },
        // 设置撤销恢复状态
        setUndoRedoInProgress: (inProgress: boolean) => {
            set(
                produce((state) => {
                    state._isUndoRedoInProgress = inProgress;
                }),
            );
        },
        // 分支条件历史记录 - 清空
        clearBranchHistory: () => {
            set(
                produce((state) => {
                    state.branchHistoryStack = [];
                    state.branchRedoStack = [];
                }),
            );
        },
        // 设置条件分支配置弹窗可见性
        setBranchConfigModalVisible: (visible: boolean) => {
            set(
                produce((state) => {
                    state.isBranchConfigModalVisible = visible;
                }),
            );
        },
        // 更新 _lastUndoSnapshot 中的指定字段
        setLastUndoSnapshotField: (field: string, value: any) => {
            set(
                produce((state) => {
                    if (!state._lastUndoSnapshot) {
                        state._lastUndoSnapshot = {};
                    }
                    (state._lastUndoSnapshot as any)[field] = value;
                }),
            );
        },
        // 设置当前 lineArr
        setCurrentLineArr: (lineArr: any[]) => {
            set(
                produce((state) => {
                    state._lastUndoSnapshot = {
                        ...(state._lastUndoSnapshot || {}),
                        lineArr: lineArr,
                    };
                }),
            );
        },
    }));
};
