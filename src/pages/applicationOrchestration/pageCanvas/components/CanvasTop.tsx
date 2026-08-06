import React, { useState, useRef, useImperativeHandle, useEffect, useMemo, lazy, Suspense, useCallback } from 'react';
import { Button, Space, Modal, Radio, Flex, Tooltip, Dropdown, Tour, type TourProps, Drawer, Input, Switch, Select } from 'antd';
import { message } from '@/utils/AntdGlobal';
import { ShareAltOutlined, FundProjectionScreenOutlined, FormOutlined, QuestionCircleOutlined, LeftOutlined, FileTextOutlined, SettingOutlined } from '@ant-design/icons';
import { useShallow } from 'zustand/react/shallow';
import { crossApiUserInfo } from '../../../../stores/crossapiStore';
import styles from './index.module.less';
import AppBaseInfoDialog from '../../../applicationOrchestration/appBaseInfoDialog';
import AddApplyComponentTemp from '../../../templateManagement/applicationTemp/addApplyponentTemp';
import { AppTemptypeData } from '../../appOrchestrationTypes';
import request from '@/utils/request';
import { useAppContext } from '@/utils/AppProvider';
import { Snapshot } from '@/utils/snapshot';
import { menu, componentModel } from '@/stores/menuStore';
import recodeLog from '../../../../utils/operLog';
import ConfirmModal, { ConfirmModalRef } from "@/widget/confirmModal";
import { isEmpty } from "@/utils/util";
import BottomTools from './bottomTools';
import Preview from '../../../../layout/Preview/Preview';
import ProcessPage from '../processCanvasPage/components/ProcessPage/ProcessPage';
const Page = lazy(() => import('@/packages/Page/Page'));

interface MethodResult {
    type: string;
    componentList?: any;
    noLineNodeList?: any;
    noLineEndList?: any;
}

interface SearchFormProps {
    pageCase: string;
    appTypeList: AppTemptypeData[];
    backApplyPage: (state: string) => void;
    onTriggerPage2Method: () => MethodResult;
    onOpenSubmitReviewDrawer: () => void; // 打开提交审核抽屉的回调
    onGetRecordedComponentIds?: () => string[]; // 获取已记录的组件ID的回调
    onReloadPageData?: (data: any) => void; // 用选中的数据重新加载编辑态页面的回调
    currentApp?:any
    isApplicationList?: boolean; // 标识是否为应用列表页面
    isFromApplicationList?: boolean; // 标识是否从应用列表页面跳转
    contentContainerRef?: React.RefObject<HTMLDivElement>; // 内容容器ref
}

interface SaveRecord {
    id: string;
    appName: string;
    createTime: string;
    saveWay: string;
    createStaffId: string;
    data: any; // 保存的页面数据
}

const CanvasTop = React.forwardRef<any, SearchFormProps>(({ pageCase, appTypeList, backApplyPage, onTriggerPage2Method, onOpenSubmitReviewDrawer, onGetRecordedComponentIds, onReloadPageData, currentApp, isApplicationList, isFromApplicationList, contentContainerRef}, ref) => {
    const changeSelectedMenu = menu((state) => state.changeSelectedMenu);
    // 左侧组件面板显示状态
    const showComponent = componentModel((state) => state.showComponent);
    // 设置左侧组件面板显示状态
    const setComponentState = componentModel((state) => state.setComponentState);

    // 暴露给父组件的方法
    useImperativeHandle(ref, () => ({
        submitReviewAction: async (pubSubInfo: any) => {
            return await executeSubmitReview(pubSubInfo);
        },
    }));

    const confirmModalRef = useRef<ConfirmModalRef | undefined>()
    const [loading, setLoading] = useState(false);
    const [historyModalVisible, setHistoryModalVisible] = useState(false);
    const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number | null>(null);
    const lastRunRef1 = useRef(0);
    const lastRunRef3 = useRef(0);
    const lastRunRef2 = useRef(0);
    const clearHistoryConfirmRef = useRef<ConfirmModalRef | undefined>() // 清空历史记录确认弹窗ref
    const switchVersionConfirmRef = useRef<ConfirmModalRef | undefined>() // 切换版本确认弹窗ref
    const [saveRecordModalVisible, setSaveRecordModalVisible] = useState(false); // 保存记录弹窗显示状态
    const [saveRecords, setSaveRecords] = useState<SaveRecord[]>([]); // 保存记录列表
    const [selectedRecordIndex, setSelectedRecordIndex] = useState<number | null>(null); // 选中的记录索引
    const [selectedRecordData, setSelectedRecordData] = useState<any>(null); // 选中的记录数据
    const [previewLoading, setPreviewLoading] = useState(false); // 预览加载状态
    const currentDataRef = useRef<any>(null); // 当前页面数据引用
    const previewStateRef = useRef<any>(null); // 预览状态引用
    // 获取用户信息
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);

    const [size, setSize] = useState<string>('large');
    const { pageStore, pageType, mode, setMode, setModalWidth, setModalLeft } = useAppContext();

     // 缓存预览state，避免每次渲染都创建新对象
    useEffect(() => {
        previewStateRef.current = {
            pageStore,
            pageType,
            mode: 'preview',
            setMode
        };
    }, [pageStore, pageType, setMode]);
    
    const canvasWidthKey = pageStore((state: any) => state.canvasWidthKey);
    const appIdRef = useRef<any>()
    const setSelectedElement = pageStore((state: any) => state.setSelectedElement);
    const historyStack = pageStore((state: any) => state.historyStack);
    const redoStack = pageStore((state: any) => state.redoStack);
    const processHistoryStack = pageStore((state: any) => state.processHistoryStack);
    const processRedoStack = pageStore((state: any) => state.processRedoStack);
    const undo = pageStore((state: any) => state.undo);
    const redo = pageStore((state: any) => state.redo);
    const undoProcess = pageStore((state: any) => state.undoProcess);
    const redoProcess = pageStore((state: any) => state.redoProcess);
    const clearFormData = pageStore((state: any) => state.clearFormData);
    const clearVariableData = pageStore((state: any) => state.clearVariableData);
    const appVersionRef = useRef<any>()


    // 监听mode变化，更新弹窗宽度和左侧位置
    useEffect(() => {
        // 等待DOM更新完成后获取元素尺寸
        const updateModalPosition = () => {
            // 优先使用id="designer"元素，如果不存在或隐藏则使用class="designerBox"元素
            let targetElement = document.getElementById('designer');
            if (!targetElement || targetElement.offsetWidth === 0) {
                targetElement = document.querySelector('.designerBox') as HTMLElement;
            }
            if (targetElement) {
                const rect = targetElement.getBoundingClientRect();
                setModalWidth(targetElement.offsetWidth);
                setModalLeft(rect.left);
            }
        };

        // 立即执行一次
        updateModalPosition();

        // 延迟再次执行，确保DOM完全渲染
        const timer = setTimeout(updateModalPosition, 100);
        return () => clearTimeout(timer);
    }, [mode, setModalWidth, setModalLeft]);
    const { clearBussinessElement, clearPageInfo } = pageStore((state: any) => {
        return {
            clearBussinessElement: state.clearBussinessElement,
            clearPageInfo: state.clearPageInfo,
        };
    });
    const config = pageStore(useShallow((state: any) => state.config));
    const { pageData } = pageStore(
        useShallow((state: any) => ({
            pageData: state.page.pageData
        }))
    );
    const refreshPageEvent = pageStore((state: any) => state.page.refreshPageEvent);
    const setPage = pageStore((state: any) => state.setPage);
    const setComponentListData = pageStore(useShallow((state: any) => state.setComponentListData));
    const processConfig = pageStore(useShallow((state: any) => state.page.processConfig));
    const setProcessConfig = pageStore(useShallow((state: any) => state.setProcessConfig));
    const [processConfigVisible, setProcessConfigVisible] = useState(false);
    const [processConfigDraft, setProcessConfigDraft] = useState(processConfig);

    const currentHistoryStack = config.sceneType === 'process' ? processHistoryStack : historyStack;
    const currentRedoStack = config.sceneType === 'process' ? processRedoStack : redoStack;

// Ctrl+Z 撤销、Ctrl+Y 重做 快捷键
    useEffect(() => {
        if (mode !== 'edit' || pageCase !== '1') return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const state = pageStore.getState();
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                if (config.sceneType === 'process') {
                    if (state.processHistoryStack.length >= 2) {
                        state.undoProcess?.();
                    }
                } else {
                    if (state.historyStack.length >= 2) {
                        setSelectedElement(undefined)
                        state.undo();
                    }
                }
            }
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                if (config.sceneType === 'process') {
                    if (state.processRedoStack.length > 0) {
                        state.redoProcess?.();
                    }
                } else if (state.redoStack.length > 0) {
                    setSelectedElement(undefined)
                    state.redo();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [mode, pageCase, config.sceneType]);

    // 控制弹窗显示状态
    const [modalAppBaseVisible, setModalAppBaseVisible] = useState(false);
    // 操作指引弹窗显示状态
    const [tourOpen, setTourOpen] = useState(false);
    // 当前指引步骤索引
    const [tourCurrentStep, setTourCurrentStep] = useState(0);
    // 操作指引作用域：'modeManagement'（模板管理）或 'applicationOrchestration'（应用编排）
    const [tourScope, setTourScope] = useState<string>('applicationList');

    // 根据 pageCase 设置指引作用域
    useEffect(() => {
        if (pageCase === '1') {
            // 根据 isApplicationList 标识来区分应用列表和应用编排
            if (isApplicationList) {
                setTourScope('applicationList');
            } else {
                if (isFromApplicationList) {
                    setTourScope('isFromApplicationOrchestration');
                } else {
                    setTourScope('applicationOrchestration');
                }
            }
        } else if (pageCase === '2') {
            setTourScope('modeManagement');
        }
    }, [pageCase, isApplicationList, isFromApplicationList]);

    // 指引到第3步时自动展开右侧配置面板
    useEffect(() => {
        if (tourOpen && tourCurrentStep === 2) {
            const scopeSelector = (scope: string, elementClass: string) => {
                return `.${scope}Box ${elementClass}`;
            };
            const selector = scopeSelector(tourScope, '.attrBox');
            const attrBox = document.querySelector(selector) as HTMLElement;
            if (attrBox) {
                const parent = attrBox.parentElement;
                if (parent) {
                    const isOpen = parent.classList.contains('openContent');
                    if (!isOpen) {
                        const toggleBtn = parent.querySelector('.openConfig') as HTMLElement;
                        if (toggleBtn) {
                            toggleBtn.click();
                        }
                    }
                }
            }
        }
    }, [tourOpen, tourCurrentStep, tourScope]);

    // 操作指引步骤配置
    const tourSteps: TourProps['steps'] = useMemo(() => {
        const scopeSelector = (scope: string, elementClass: string) => {
            return `.${scope}Box .${elementClass}`;
        };

        const getTarget = (elementClass: string) => {
            return () => document.querySelector(scopeSelector(tourScope, elementClass)) as unknown as HTMLElement;
        };

        return [
            // 第1步：基础元素 - 引导用户从左侧面板拖拽元素到画布
            {
                title: (
                    <div>
                        <img src={new URL(`../../../../layout/components/Menu/Imgs/firstStep.png`, import.meta.url).href} alt="" style={{ width: '100%', height: '96px' }} />
                        <b>基础元素</b>
                    </div>
                ),
                description: (
                    <div>
                        <p>· 选择元素，直接「拖拽」至画布区域即可使用；</p>
                        <p>· 部分元素需搭配布局元素使用，请参考系统提示操作。</p>
                    </div>
                ),
                placement: 'rightTop',
                target: getTarget('elementCont'),
            },
            // 第2步：画布控制 - 引导用户了解画布缩放、全屏、撤销重做等功能
            {
                title: (
                    <div>
                        <img src={new URL(`../../../../layout/components/Menu/Imgs/secondStep.png`, import.meta.url).href} alt="" style={{ width: '100%', height: '96px' }} />
                        <b>画布控制</b>
                    </div>
                ),
                description: (
                    <div>
                        <p>· 可缩放画布视图、切换全屏编辑模式，同时支持撤销与重做，调整编辑视野、修正误操作。</p>
                    </div>
                ),
                placement: 'topLeft',
                target: getTarget('canvasToolsDivBox'),
            },
            // 第3步：内容配置 - 引导用户了解属性、样式、事件、数据等配置面板
            {
                title: (
                    <div>
                        <img src={new URL(`../../../../layout/components/Menu/Imgs/thirdStep.png`, import.meta.url).href} alt="" style={{ width: '100%', height: '96px' }} />
                        <b>内容配置</b>
                    </div>
                ),
                description: (
                    <div>
                        <p>选中元素，编辑元素内容；</p>
                        <p>·「属性」编辑元素基础参数；</p>
                        <p>·「样式」编辑元素视觉外观；</p>
                        <p>·「事件」编辑元素交互逻辑；</p>
                        <p>·「数据」编辑元素绑定数据。</p>
                    </div>
                ),
                placement: 'leftTop',
                nextButtonProps: { children: '关闭' },
                target: getTarget('attrBox'),
            },
        ];
    }, [tourScope]);

    // 打开弹窗
    const handleOpenAppBaseModal = () => {
        setModalAppBaseVisible(true);
    };

    // 关闭弹窗
    const handleCloseAppBaseModal = () => {
        setModalAppBaseVisible(false);
    };

    //编辑页面
    const editPageData = () => {
        setModalAppBaseVisible(true);
    };

    useEffect(() => {
        // 应用地图点击复制跳转打开时和共享应用点击复制时自动打开编辑应用弹窗
        if (!config.projectId && pageCase === '1') {
            setModalAppBaseVisible(true);
        }
    }, [config]);

    // 点击取消按钮
    const backPage = (state: string = 'cancel') => {
        backApplyPage(state);
    };
    const addBaseInfo = () => { };
    const updateConfig = pageStore(useShallow((state: any) => state.updateConfig));

    const confiEventbusTem = (options: any) => {
        updateConfig(
            {
                ...options,
                serviceTypeId: userInfo.serviceTypeId,
            },
            options.id,
            () => { },
        );
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

    // 点击保存草稿按钮
    const saveDrafts = () => {
        const now = Date.now();
        if (now - lastRunRef1.current < 2000) {
            return;
        }
        lastRunRef1.current = now;
        saveData('1');
    };
    // 点击提交审核按钮 - 触发打开抽屉
    const submitReview = () => {
        // const now = Date.now();
        // if (now - lastRunRef3.current < 2000) {
        //     return;
        // }
        // lastRunRef3.current = now;
        window.dispatchEvent(new CustomEvent('submitReviewShowArea', { detail: { showArea: config.showArea } }));
        onOpenSubmitReviewDrawer();
    };

    // 执行实际提交审核逻辑
    const executeSubmitReview = async (pubSubInfo?: any): Promise<boolean> => {
        try {
            return await saveData('3', pubSubInfo);
        } catch (error) {
            console.error('提交审核失败:', error);
            return false;
        }
    };
    // 点击保存按钮
    const save = () => {
        const now = Date.now();
        if (now - lastRunRef2.current < 2000) {
            return;
        }
        lastRunRef2.current = now;
        saveData('2');
    };

    interface componentListInterface {
        componentId: string;
        componentType: string;
        position: string;
    }
    const getComponentList = (elements: any) => {
        const _elements: any = [...elements];
        const componentList: componentListInterface[] = [];
        while (_elements.length > 0) {
            const item = _elements.shift();
            if (item) {
                componentList.push({
                    componentId: item.id,
                    componentType: 'atom',
                    position: 'left',
                });
                if (item.elements && item.elements.length > 0) {
                    _elements.push(...item.elements);
                }
            }
        }
        return componentList;
    };

    const getAtomList = (pageData: any) => {
        let atomList: any = [
            {
                atomId: '0000',
                atomType: '0000',
                id: '0000',
                pageType: '2',
                provId: '00030021',
                relationId: '',
                serviceTypeId: 'jsytck',
                staffId: 'JST5069',
                contConfig: {
                    apis: pageData.apis,
                    config: pageData.config,
                    events: pageData.events,
                    // formData: pageData.formData,
                    interceptor: pageData.interceptor,
                    // variableData: pageData.variableData,
                    variables: pageData.variables,
                    apisGlobal: pageData.apisGlobal,
                    crossApisGlobal: pageData.crossApisGlobal,
                    componentList: getComponentList(pageData.elements),
                },
                contCss: {},
                parentId: '0000',
                parentIndex: '0',
            },
        ];
        for (const key in pageData.elementsMap) {
            const value = pageData.elementsMap[key];
            atomList.push({
                atomId: value.id,
                atomType: value.type,
                id: value.id,
                pageType: '2',
                provId: '00030021',
                relationId: '',
                serviceTypeId: 'jsytck',
                staffId: 'JST5069',
                contConfig: {
                    config: value.config,
                    events: value.events,
                    methods: value.methods,
                    nodeId: value.id,
                    parentId: value.parentId,
                    param: value.param,
                },
                contCss: { name: value.name },
                parentId: value.parentId,
                parentIndex: '0',
            });
        }
        return atomList;
    };

    // 保存数据
    const saveData = async (status: string, pubSubInfo?: any): Promise<boolean> => {
        console.log('保存信息', config);
        // 获取已记录的组件ID
        const recordedComponentIds = onGetRecordedComponentIds ? onGetRecordedComponentIds() : [];
        setLoading(true);

        const insertAppParams = (appData:any)=>{
            if (currentApp?.copyFrom){
                //如果是复制
                appData.copyFrom = currentApp.copyFrom
                appData.copyRelId = currentApp.relationId

                //如果是二级复制一级
                if (appData.appLevel === '2' && currentApp.appLevel === '1'){
                    appData.copyTopRelId = currentApp.copyRelId ? currentApp.copyRelId:currentApp.relationId
                }
            }
        }

        const appData: any = {
            provId: config.appLevel == '1' ? '0000' : userInfo.provinceId,
            serviceTypeId: config.appLevel == '1' ? '0000' : config.serviceTypeId,
            staffId: userInfo.staffId,
            appName: config.appName, // 应用名称
            appTypeId: config.appTypeId, // 应用分类ID
            tagTypeId: config.tagTypeId, // 应用标签ID
            appCategory: config.appCategory, // 应用类别
            appLevel: config.appLevel, // 应用级别
            belongModule: config.belongModule, // 归属模块
            projectId: config.projectId,
            sceneType: config.sceneType, // 展示形式（方案类型）
            appDesc: config.appDesc, // 应用备注
            dataType: pageCase, // 1 应用 2 应用模板
            id: config.rollbackDraftId || config.id || appIdRef.current || '', // 应用ID，优先级：回滚草稿ID > 配置ID > 已保存的ID
            appStatus: status,
            sceneData: '',
            appPicture: '',
            isCreateMenu: config.isCreateMenu && config.isCreateMenu != '2' ? config.isCreateMenu : '2', // 是否生成菜单0否1是2空待定
            componentIdList: recordedComponentIds, // 新增参数：记录的所有组件ID
            refreshPageEvent: refreshPageEvent, // 是否受理号码变更刷新页面
            showArea: config.showArea, //展示区域
            canvasWidth: canvasWidthKey, //画布大小
            sceneTypeNm: config.sceneTypeNm, // 场景名称
            sceneTypeId: config.sceneTypeId, // 场景名称Id
        };

        // 添加创建人姓名和部门
        if (config.id === '') {
            appData.createStaffName =  userInfo.staffName || '';
            appData.createOrgaId = userInfo.orgaId || userInfo.deptId || '';
            appData.createOrgaName = userInfo.orgaName || userInfo.deptName || '';
        }

        if (!config.projectId && status !== '2' && pageCase === '1') {
            message.error('请选择归属项目！');
            setLoading(false);
            return false;
        }

        // 当status为'3'时，添加pubSubInfo参数
        if (status === '3' && pubSubInfo) {
            appData.pubSubInfo = pubSubInfo;
        }

        if (config.sceneType == 'base') {
            //组装式
            let sceneData = {
                atomList: JSON.stringify(getAtomList(pageData)),
                componentList: getComponentList(pageData.elements),
            };
            appData.sceneData = JSON.stringify(sceneData);
        } else if (config.sceneType == 'process') {
            const processData: MethodResult = JSON.parse(JSON.stringify(onTriggerPage2Method()));
            if (!processData || processData?.type === 'error') {
                message.error('校验不通过！');
                setLoading(false);
                return false;
            }
            processData.componentList.forEach((component: any) => {
                // 表单数据和全局变量数据不保存
                delete component.componentData.formData;
                delete component.componentData.variableData;
                component.componentData.atomList = JSON.stringify(getAtomList(component.componentData));
                delete component.componentData.config;
                delete component.componentData.elements;
                delete component.componentData.elementsMap;
                delete component.componentData.events;
            })
            const result = {
                processConfig,
                componentList: processData.componentList,
            };
            appData.sceneData = JSON.stringify(result);
        }

        //保存时生成快照，获取图片的oss地址
        // const appPicture = await snapshotUpload('#page', {}, 'fileupload', { type: 'image' });
        // appPicture && (appData.appPicture = appPicture);
        const getAppTypeName = (appTypeId: string, appTypeList: AppTemptypeData[]): string => {
            if (!appTypeId) return '';
            const appTypeNames: string[] = [];
            const getAppTypeNameById = (result: string[], typeId?: string): void => {
                const item = appTypeList.find((i) => i.appTypeId === typeId);
                if (item) {
                    result.unshift(item.appTypeName);
                    if (item.pId) {
                        getAppTypeNameById(result, item.pId);
                    }
                }
            };
            getAppTypeNameById(appTypeNames, appTypeId);
            return appTypeNames.join('-');
        };
        try {
            //插入数据
            insertAppParams(appData)

            const result = await request.post('/app/saveAppInfo', { params: appData });
            if (result.returnCode == '0') {
                //    跳转到应用列表
                // alert('保存成功');
                // changeSelectedMenu('applicationList');
                status === '3' ? message.success('应用发布申请成功') : message.success('保存草稿成功');
                if (status == '3') {
                    const _p = {
                        provId: appData.provId, // 省份编号
                        serviceTypeId: appData.serviceTypeId, // 业务系统编号

                        dataSource: '1', // 数据来源
                        relationId: result.bean.id || config.id, // 关联ID
                        dataName: appData.appName,
                        // dataType: config.appTypeName,
                        dataType: config.appTypeName || getAppTypeName(config.appTypeId, appTypeList),
                        dataDesc: appData.appDesc,
                        auditDesc: '已完成应用编辑，请审批',
                        createStaffId: userInfo.staffId,
                    };

                    await request.post('/solutionAudit/insertSolutionAudit', {
                        params: _p,
                    });
                }

                const insertLogParams = (logParams:any)=>{

                    const getCopyFrom = ()=>{
                        if (currentApp?.copyFrom === '1'){
                            return '我的应用'
                        }
                        if (currentApp?.copyFrom === '2'){
                            return '他省共享'
                        }
                        if (currentApp?.copyFrom === '3'){
                            return '应用地图'
                        }
                        return ''
                    }

                    if (currentApp?.copyFrom){
                        //复制
                        logParams.operType = '复制'
                        logParams.editContent = `${getCopyFrom()}复制${appData.appName}`
                        logParams.editBefore = `被复制的id:${currentApp.id},被复制的relationId:${currentApp.relationId},被复制的应用名称:${currentApp.appName},被复制应用是否他省共享标识:${currentApp.shareStatus == '1'?'是':'否'}`
                        logParams.editAfter = `复制后的应用名称:${appData.appName}`
                    }
                }

                const logParams = {
                    provCode: userInfo.provinceId, // 8位省份编码
                    modelName: '', // 所属模块  暂时为空
                    pageName: '', // 所属菜单   暂时为空
                    dataType: appData.dataType === '1' ? '应用' : '应用模板', // 数据类型（应用、元素、组件、接口）
                    operType: appData.id ? '编辑' : '新增', // 操作类型（新增/编辑/删除/导入）
                    dataId: appData.id || '', // 操作数据ID
                    dataName: appData.appName, // 操作数据名称
                    editContent: `${(appData.id ? '编辑' : '新增') + appData.appName + (appData.dataType === '1' ? '应用' : '应用模板')}`, // 操作内容简述
                    staffId: userInfo.staffId, // 操作人工号
                };

                insertLogParams(logParams)

                recodeLog(logParams);

                setLoading(false);
                if (appData.id == '') { // 第一次保存草稿时储存id和版本，用于历史记录查询
                    appIdRef.current = result.bean?.id;
                    appVersionRef.current = result.bean?.belongVersion;
                } else {
                    if (status === '1' && config.appStatus !== '6'){ // 已上架应用再次编辑保存草稿关闭画布
                        if (!isEmpty(result.bean?.id)){
                            appIdRef.current = result.bean?.id
                        }
                        return true
                    }
                }
                clearPageInfo();
                // 先返回编排首页
                backPage('save');
                return true;
            }
            setLoading(false);
            return false;
        } catch (error) {
            console.error('保存失败:', error);
            setLoading(false);
            return false;
        }
    };

    const showConfirmModal = () => {
        confirmModalRef?.current?.showModal('请确认内容已保存，是否退出？')
    };

    const onBackPage = () => {
        backPage('save');
    };

    //切换业务逻辑和界面预览
    const handleChange = (value: string) => {
        // 使用 setTimeout 来延迟状态更新，避免在渲染过程中直接更新其他组件
        setTimeout(() => {
            if (config.sceneType == 'process') {
                clearBussinessElement();
            }
            clearFormData();
            clearVariableData();
            setMode(value);
        }, 0);
    };

    // 是否首次打开标识
    const [isFirstOpen, setIsFirstOpen] = useState(false);

    // 首次打开检测 - 页面初始化时调用接口判断用户是否首次打开，是则自动触发操作指引
    useEffect(() => {
        // 非编辑模式、无用户工号、无应用ID或向导式场景不进行检测
        if (mode !== 'edit' || !userInfo?.staffId || !config?.id || config.sceneType === 'process') return;

        // 调用接口查询用户首次打开次数
        request.post('/appFirstOpenStaff/queryAppFirstOpenStaffCount', {
            params: { staffId: userInfo.staffId }
        }).then((result: any) => {
            // total为0代表首次打开，设置标识并打开操作指引
            if (result.returnCode === '0' && result.bean?.total !== undefined && result.bean?.total !== null && result.bean?.total !== '' && result.bean?.total === 0) {
                setIsFirstOpen(true);
                setTourOpen(true);
            } else if (result.returnCode !== '0' && result.returnMessage) {
                message.error(result.returnMessage);
            }
        }).catch((error: any) => {
            console.error('首次打开检测失败:', error);
        });
    }, [mode, pageCase, userInfo?.staffId, config?.id]);

    // 关闭操作指引 - 首次打开时调用接口保存记录
    const handleCloseTour = () => {
        // 如果是首次打开，调用接口保存首次打开记录
        if (isFirstOpen) {
            request.post('/appFirstOpenStaff/saveAppFirstOpenStaff', {
                params: { staffId: userInfo.staffId }
            }).catch((error: any) => {
                console.error('保存首次打开记录失败:', error);
            });
        }
        setTourOpen(false);
        setTourCurrentStep(0);
    };

    // 打开保存记录弹窗 - 查询并显示历史保存记录列表
    const handleOpenSaveRecordModal = async () => {
        // 先关闭抽屉，确保后续打开时 getContainer 重新执行
        setSaveRecordModalVisible(false);
        
        // 等待一个事件循环，让之前的抽屉完全卸载
        await new Promise(resolve => setTimeout(resolve, 100));
        let records: any[] = [];
        try {
            const result = await request.post('/app/queryAppInfoHistory', {
                params: {
                    relationId: config.relationId || appIdRef.current,
                    belongVersion: config.belongVersion || appVersionRef.current,
                    appStatus: -1
                }
            });
            if (result.returnCode === '0' && result.bean) {
                records = result.beans || [];
            }
        } catch (error) {
            console.error('查询历史草稿记录失败:', error);
        }
        
        // 向导式场景下，需要将当前版本数据存储到 pageStore，以便 ProcessPage 能够访问
        if (config.sceneType === 'process') {
            try {
                const processData = onTriggerPage2Method();
                if (processData && processData.componentList) {
                    setComponentListData(processData.componentList);
                }
            } catch (error) {
                console.error('获取向导式当前版本数据失败:', error);
            }
        }
        
        setSaveRecords(records);
        setSelectedRecordIndex(null);
        setSelectedRecordData(null);
        setSaveRecordModalVisible(true);
    };

    // 关闭保存记录弹窗
    const handleCloseSaveRecordModal = () => {
        setSaveRecordModalVisible(false);
        setSelectedRecordIndex(null);
        setSelectedRecordData(null);
    };

    // 切换到选中版本
    const switchToVersion = () => {
        if (!selectedRecordData) {
            message.warning('请先选择一个版本');
            return;
        }
        switchVersionConfirmRef.current?.showModal('将替换当前编辑内容为所选保存记录，当前未保存的修改将会丢失，操作记录也将清空，确定要切换到该版本吗？');
    };

    // 确认切换版本
    const handleSwitchVersionConfirm = () => {
        if (!selectedRecordData) {
            message.warning('请先选择一个版本');
            return;
        }

        if (onReloadPageData) {
            setLoading(true);
            onReloadPageData(selectedRecordData);
            setLoading(false);
        } else {
            message.error('未提供页面数据重载回调函数');
            return;
        }

        message.success('已切换到选定版本');

        // 关闭保存记录弹框
        handleCloseSaveRecordModal();
    };

    // 清空历史记录
    const clearHistory = () => {
        clearHistoryConfirmRef.current?.showModal('确定要清空所有历史记录吗？此操作不可撤销。');
    };

    // 处理清空历史记录确认 - 调用接口删除历史记录并更新状态
    const handleClearHistoryConfirm = async () => {
        try {
            const result = await request.post('/app/delAppInfoHistory', {
                params: {
                    relationId: config.relationId,
                    belongVersion: config.belongVersion,
                    appStatus: -1
                }
            });
            if (result.returnCode === '0') {
                const storageKey = `saveRecords_${config.id || 'temp'}`;
                setSaveRecords([]);
                localStorage.removeItem(storageKey);
                setSelectedRecordIndex(null);
                setSelectedRecordData(null);
                message.success('历史记录已清空');
            } else {
                message.error(result.returnMessage || '清空历史记录失败');
            }
        } catch (error) {
            message.error('清空历史记录失败');
        }
    };

    // 监听选中记录数据变化，延迟隐藏加载状态以让Preview组件有时间加载
    useEffect(() => {
        if (selectedRecordData) {
            const timer = setTimeout(() => {
                setPreviewLoading(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [selectedRecordData]);

    // 渲染预览组件
    const renderPreview = useCallback(() => {
        if (!previewStateRef.current) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>加载中...</div>;
        
        // 向导式使用 ProcessPage 组件
        if (config.sceneType === 'process') {
            return (
                <div style={{ height: '100%', overflow: 'auto', background: '#f5f5f5' }}>
                    <div style={{
                        width: `${canvasWidthKey !== '-1' ? canvasWidthKey : 'calc(100% - 20px)'}px`,
                        margin: '0 auto',
                        background: '#fff',
                        minHeight: '100%',
                        position: 'relative'
                    }}>
                        <Suspense fallback={<div style={{ textAlign: 'center', padding: '20px' }}>加载中...</div>}>
                            <ProcessPage />
                        </Suspense>
                    </div>
                </div>
            );
        }
        
        // 装配式使用 Page 组件
        return (
            <div style={{ height: '100%', overflow: 'auto', background: '#f5f5f5' }}>
                <div style={{
                    width: `${canvasWidthKey !== '-1' ? canvasWidthKey : 'calc(100% - 20px)'}px`,
                    margin: '0 auto',
                    background: '#fff',
                    minHeight: '100%',
                    height: '100%',
                    // pointerEvents: 'none'
                }}>
                    <Suspense fallback={<div style={{ textAlign: 'center', padding: '20px' }}>加载中...</div>}>
                        <Page
                            key="current"
                            mode="preview"
                            config={pageData?.config || {}}
                            elements={pageData?.elements || []}
                            state={previewStateRef.current}
                            setSelectedElement={() => {}}
                        />
                    </Suspense>
                </div>
            </div>
        );
    }, [canvasWidthKey, config.sceneType, pageData]);

    // 点击操作指引按钮 - 打开组件面板并启动操作指引
    const handleGuideClick = () => {
        // 组件面板未打开时，先打开面板再启动指引
        if (!showComponent) {
            setComponentState(true);
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('switchToElementTab'));
                setTourOpen(true);
            }, 0);
        } else {
            // 组件面板已打开时，直接切换tab到元素并启动指引
            window.dispatchEvent(new CustomEvent('switchToElementTab'));
            setTimeout(() => {
                setTourOpen(true);
            }, 100);
        }
    };

    return (
        <div className={styles.designerBar}>
            <Flex align='center'>
                {mode == 'edit' && (<Tooltip placement="top" title={config.appName}>
                    <span className={styles.appNameText}>{config.appName}</span>
                </Tooltip>)}
                {mode == 'edit' && <Button type="text" icon={<FormOutlined />} onClick={editPageData} loading={loading}></Button>}
                {mode == 'preview' && <Button type="text" icon={<LeftOutlined />} onClick={() => handleChange('edit')}>退出预览</Button>}
            </Flex>
            <Space>
                {/* 底部悬浮工具栏 */}
                <BottomTools onTriggerPage2Method={onTriggerPage2Method} previewFun={handleChange} />
                {/* 操作指引 */}
                {mode == 'edit' && config.sceneType !== 'process' && (
                    <Tooltip title="操作指引">
                        <span style={{cursor: 'pointer', color: '#333', fontSize: '14px', }}onClick={handleGuideClick} >
                            <QuestionCircleOutlined style={{ marginRight: '3px', fontSize: '14px' }} />操作指引
                        </span>
                    </Tooltip>
                )}
                {mode == 'edit' && config.sceneType === 'process' && (
                    <Tooltip title="引导式页面布局设置">
                        <span style={{ cursor: 'pointer', color: '#333', fontSize: '14px' }} onClick={() => { setProcessConfigDraft(processConfig); setProcessConfigVisible(true); }}>
                            <SettingOutlined style={{ marginRight: 3 }} />页面布局
                        </span>
                    </Tooltip>
                )}
                {mode == 'edit' && pageCase === '1' && (
                    <Tooltip title="历史保存">
                        <span style={{cursor: 'pointer', color: '#333', fontSize: '14px', }}onClick={handleOpenSaveRecordModal} >
                            <FileTextOutlined style={{ marginRight: '3px', fontSize: '14px' }} />历史保存
                        </span>
                    </Tooltip>
                )}
            </Space>
            <Space>
                {mode == 'edit' && (
                    <Space>
                        <Button type="primary" ghost onClick={() => {showConfirmModal()}}>退出</Button>
                        {pageCase === '1' && (
                            <span>
                                <Button type="primary" onClick={saveDrafts} ghost loading={loading}>
                                    保存草稿
                                </Button>
                                <Button type="primary" onClick={submitReview} style={{ marginLeft: '8px' }}>
                                    提交审核
                                </Button>
                            </span>
                        )}
                        {pageCase === '2' && (
                            <Button type="primary" onClick={save} loading={loading}>
                                保存
                            </Button>
                        )}
                    </Space>
                )}
            </Space>

            {/* 操作指引弹窗 - 新用户引导使用，包含基础元素、画布控制、内容配置三个步骤 */}
            <Tour
                open={tourOpen} // 控制弹窗显示/隐藏
                onClose={handleCloseTour} // 关闭时处理首次打开记录保存
                steps={tourSteps} // 指引步骤配置
                closable={false} // 隐藏右上角关闭按钮
                disabledInteraction={true} // 禁用指引步骤的元素交互
                gap={{ offset: 5, radius: 12 }} // 高亮区域与目标的间距和圆角
                onChange={(current) => setTourCurrentStep(current)} // 步骤变化时更新当前步骤索引
                indicatorsRender={(current, total) => ( // 自定义底部指示器渲染
                    <span style={{ fontSize: '16px', opacity: '0.8' }}>
                        {/* 跳过按钮 - 点击时保存首次打开记录并关闭指引 */}
                        <Button size="small" type="text" style={{ fontSize: '16px', color: '#ffffff'}} onClick={handleCloseTour}>跳过</Button>
                        ({current + 1}/{total})
                    </span>
                )}
            />

            {/* 弹窗组件 */}
            <Modal
                className={styles.addTempModal}
                title={pageCase === '1' ? '编辑应用' : '编辑应用模板'}
                open={modalAppBaseVisible}
                onCancel={handleCloseAppBaseModal}
                styles={modalStyles}
                footer={null} // 移除默认底部按钮
                width={800}
                maskClosable={false} // 设置为false，点击遮罩不关闭
                destroyOnClose // 关闭时销毁子元素
            >
                {/* 应用 */}
                {pageCase === '1' && (
                    <AppBaseInfoDialog
                        onReset={handleCloseAppBaseModal}
                        onSearch={handleCloseAppBaseModal}
                        baseInfo={{
                            ...config,
                            sceneType: config.appCategory !== '2' ? config.sceneType : 'base',
                        }}
                        appTypeList={appTypeList}
                        editconfirmEvent={confiEventbusTem}
                        editData={config}
                        showTitleBox={!config.projectId} // 从应用地图跳转时显示标题提示框
                    />
                )}
                {/* 应用模板 */}
                {pageCase === '2' && (
                    <AddApplyComponentTemp
                        onReset={handleCloseAppBaseModal}
                        onSearch={handleCloseAppBaseModal}
                        appTypeList={appTypeList}
                        addconfirmEvent={addBaseInfo}
                        editconfirmEvent={confiEventbusTem}
                        editData={config}
                        bannedCheckFlag={true}
                    />
                )}
            </Modal>
            <Modal
                title="引导式页面布局"
                open={processConfigVisible}
                onCancel={() => setProcessConfigVisible(false)}
                onOk={() => { setProcessConfig(processConfigDraft); setProcessConfigVisible(false); }}
                width={520}
            >
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '18px 12px', alignItems: 'center', padding: '16px 8px' }}>
                    <span>启用智能导航</span>
                    <Switch checked={processConfigDraft?.navigator?.enabled !== false} onChange={(enabled) => setProcessConfigDraft({ ...processConfigDraft, navigator: { ...processConfigDraft.navigator, enabled } })} />
                    <span>导航标题</span>
                    <Input disabled={processConfigDraft?.navigator?.enabled === false} value={processConfigDraft?.navigator?.title} onChange={(e) => setProcessConfigDraft({ ...processConfigDraft, navigator: { ...processConfigDraft.navigator, title: e.target.value } })} />
                    <span>页面滚动方式</span>
                    <Select value={processConfigDraft?.scrollMode} onChange={(scrollMode) => setProcessConfigDraft({ ...processConfigDraft, scrollMode })} options={[
                        { value: 'fixed-top', label: '顶部信息和导航固定' },
                        { value: 'full-page', label: '随整页滚动' },
                    ]} />
                </div>
            </Modal>

            <ConfirmModal ref={confirmModalRef} onConfirm={onBackPage}/>
            <ConfirmModal ref={clearHistoryConfirmRef} onConfirm={handleClearHistoryConfirm} />
            <ConfirmModal ref={switchVersionConfirmRef} onConfirm={handleSwitchVersionConfirm} />

            {/* 保存记录抽屉 */}
            <Drawer
                title="历史保存"
                open={saveRecordModalVisible}
                onClose={handleCloseSaveRecordModal}
                width="calc(100% - 186px)"
                footer={null}
                destroyOnClose
                maskClosable={false}
                getContainer={() => contentContainerRef?.current || document.body}
                rootStyle={{
                    position: 'absolute'
                }}
                styles={{ body: { padding: 0 } }}
                afterOpenChange={(open) => {
                    if (!open) {
                        setSelectedRecordIndex(null);
                        setSelectedRecordData(null);
                    }
                }}
            >
                <div style={{ display: 'flex', height: 'calc(100% - 7px)' }}>
                    {/* 左侧预览区域 */}
                    <div style={{ flex: 1, border: '1px solid #e0e0e0', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '10px', backgroundColor: '#EAF0F6' }}>
                        <div style={{ flex: 1, overflow: 'auto', background: '#f5f7fa' }}>
                            {previewLoading ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
                                    加载中...
                                </div>
                            ) : selectedRecordData ? (
                                <Preview key={selectedRecordData.id || selectedRecordData.relationId} id={selectedRecordData.id} pageType={selectedRecordData.sceneType == 'base' ? 'yy-base' : 'Step-base'} />
                            ) : (
                                renderPreview()
                            )}
                        </div>
                    </div>

                    {/* 右侧版本列表 */}
                    <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ height: '40px', borderBottom: '1px solid #e0e0e0', padding: '10px', flexShrink: 0 }}>
                            <Space>
                                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>历史保存版本</span>
                                <Tooltip title="点击记录可预览并选择恢复到对应版本数据，当前版本不可恢复。">
                                    <QuestionCircleOutlined style={{ color: '#999', cursor: 'help' }} />
                                </Tooltip>
                            </Space>
                        </div>
                            {/* 当前版本卡片和历史版本列表共用一个滚动区域 */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '10px', paddingBottom: '16px' }}>
                            {/* 当前版本卡片 */}
                            <div style={{ marginBottom: '8px' }}>
                                <div
                                    style={{
                                        padding: '10px',
                                        background: selectedRecordData === null ? '#ECF5F9' : '#fff',
                                        borderRadius: '4px',
                                        border: '1px solid #e8e8e8',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s'
                                    }}
                                    onClick={() => {
                                        setSelectedRecordIndex(null);
                                        setSelectedRecordData(null);
                                        // 向导式场景下，点击当前版本时需要重新刷新数据到 pageStore
                                        if (config.sceneType === 'process') {
                                            try {
                                                const processData = onTriggerPage2Method();
                                                if (processData && processData.componentList && setComponentListData) {
                                                    setComponentListData(processData.componentList);
                                                }
                                            } catch (error) {
                                                console.error('刷新向导式当前版本数据失败:', error);
                                            }
                                        }
                                    }}
                                >
                                    <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>当前版本</div>
                                </div>
                            </div>
                            
                            {saveRecords.length === 0 ? (
                                <div style={{ textAlign: 'center', marginTop: '100px', color: '#999', fontSize: '13px', lineHeight: '2' }}>
                                    <div>暂无保存记录</div>
                                    <div>点击「保存草稿」后在此处查看</div>
                                </div>
                            ) : (
                                saveRecords.map((record: any, index: number) => {
                                    const getKey = (item: any) => item.id || item.relationId;
                                    const isSelected = selectedRecordIndex === index;
                                    const saveWayMap: Record<string, string> = {
                                        '1': '手动保存',
                                        '3': '提交审核',
                                        '当前版本': '当前版本'
                                    };
                                    const saveWayText = saveWayMap[record.saveWay] || record.saveWay || '-';
                                    
                                    return (
                                        <div
                                            key={getKey(record)}
                                            style={{
                                                padding: '10px',
                                                marginBottom: '8px',
                                                background: isSelected ? '#ECF5F9' : '#fff',
                                                borderRadius: '4px',
                                                border: '1px solid #e8e8e8',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s'
                                            }}
                                            onClick={() => {
                                                setSelectedRecordIndex(index);
                                                setPreviewLoading(true);
                                                setSelectedRecordData(record);
                                                // 如果是向导式场景且有componentList，则存储到pageStore以便Preview组件能够访问
                                                if (record.sceneType === 'process' && record.componentList && setComponentListData) {
                                                    setComponentListData(record.componentList);
                                                    if (record.refreshPageEvent && pageStore) {
                                                        const state = pageStore();
                                                        state.setRefreshPageEvent && state.setRefreshPageEvent(record.refreshPageEvent);
                                                    }
                                                }
                                            }}
                                        >
                                            <Tooltip title={record.appName || '-'}>
                                                <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '230px' }}>
                                                    {record.appName || '-'}
                                                </div>
                                            </Tooltip>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <span style={{ color: '#666', fontSize: '12px' }}>{record.createStaffId || '-'}</span>
                                                    <span style={{ color: '#999', fontSize: '12px' }}>{saveWayText}</span>
                                                </div>
                                                <span style={{ color: '#999', fontSize: '12px' }}>
                                                    {record.createTime || '-'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '10px', borderTop: '1px solid #e8e8e8', flexShrink: 0 }}>
                            <Button
                                type="primary"
                                onClick={switchToVersion}
                                disabled={selectedRecordIndex === null}
                            >
                                切换该版本
                            </Button>
                            <Button
                                danger
                                onClick={clearHistory}
                                disabled={saveRecords.length === 0}
                            >
                                清空历史
                            </Button>
                        </div>
                    </div>
                </div>
            </Drawer>
        </div>
    );
});

CanvasTop.displayName = 'CanvasTop';
export default CanvasTop;
