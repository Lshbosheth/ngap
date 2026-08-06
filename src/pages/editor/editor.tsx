import React, { MouseEvent, useState, useEffect, memo, useMemo, useRef, useImperativeHandle, forwardRef } from 'react';
import { ConfigProvider, theme as AntdTheme, Modal } from 'antd';
import { cloneDeep } from 'lodash-es';
import { LeftOutlined } from '@ant-design/icons';
import { useDrop } from 'react-dnd';
import { useDebounceFn, useKeyPress } from 'ahooks';
import { getComponent } from '@/packages/index';
import { IDragTargetItem } from '@/packages/types/index';
import { checkComponentType, checkHasBottomBannerSimple, createId, getElement } from '@/utils/util';
import storage from '@/utils/storage';
import dealPageData, { dealPageDataId } from '@/utils/dataToCanvas';
import api from '@/api/page';
import Toolbar from '@/components/Toolbar/Toolbar';
import { message } from '@/utils/AntdGlobal';
import Page from '@/packages/Page/Page';
import PageConfig from '@/packages/Page/Schema';
import FloatingCollector from '@/components/FloatingCollector';
import TopBar from './topbar/TopBar';
import { useAppContext } from '@/utils/AppProvider';
import { useShallow } from 'zustand/react/shallow';
import styles from './index.module.less';
import request from '@/utils/request';
import { mergeApis, updateApiConfig } from '../../utils/dealApiGlobal';
import { apiListInfo } from '../../stores/apiListStore';
import { crossApiUserInfo } from '../../stores/crossapiStore';
import FormItemModal from '@/components/FormItemModal';


interface TransformMatrixObj {
    scale: number;
    translateX: number;
    translateY: number;
}
interface Position {
    x: number;
    y: number;
}

interface AddElementModalProps {
    typeZDY?: any; // 自定义组件
    type?: string;
    pageLoaded?: () => void;
}

export interface EditorRef {
    getData?: () => any;
}

/**
 * 画布
 * 1. 从左侧拖拽组件到画布中
 * 2. 画布接收拖拽目标值，根据type动态渲染组件到画布中
 */
const Editor = forwardRef<EditorRef, AddElementModalProps>(({ typeZDY, type, pageLoaded }, ref) => {
    const _state = useAppContext();
    const { pageStore, pageType, mode, setMode, configPanelPinned } = _state;
    const canvasWidthKey = pageStore((state: any) => state.canvasWidthKey);
    // 页面组件
    const {
        baseInfo,
        config,
        page,
        selectedElement,
        componentId,
        theme,
        elements,
        elementsMap,
        savePageInfo,
        addElement,
        addChildElements,
        setSelectedElement,
        removeElements,
        clearPageInfo,
        variables,
        updateEditState,
        pageConfig,
        addVariable,
        editVariable,
        setVariableData,
        apisGlobal,
        zoomRatio, // 画布缩放比例
        addBussinessElement,
        updateApiGlobal,
        apiOutParam,
        addApiOutParam,
        apiOutData,
        editApiOutData,
        initHistoryStack,
        pendingFormItemElement,
        setPendingFormItemElement,
    } = pageStore(
        useShallow((state: any) => ({
            baseInfo: state.config,
            page: state.page,
            componentId: state.id,
            config: state.config,
            isEdit: state.isEdit,
            selectedElement: state.selectedElement,
            theme: state.page?.pageData?.config?.props?.theme,
            elements: state.page?.pageData?.elements || [],
            variables: state.page?.pageData?.variables || [],
            elementsMap: state.page?.pageData?.elementsMap || {},
            apisGlobal: state.page?.pageData?.apisGlobal || {},
            apiOutParam: state.page?.pageData?.apiOutParam || {},
            apiOutData: state.page?.pageData?.apiOutData || {},
            pageConfig: state.page?.pageData?.config || {},
            savePageInfo: state.savePageInfo,
            editApiOutData: state.editApiOutData,
            addElement: state.addElement,
            addChildElements: state.addChildElements,
            setSelectedElement: state.setSelectedElement,
            removeElements: state.removeElements,
            addApiOutParam: state.addApiOutParam,
            addVariable: state.addVariable,
            updateApiGlobal: state.updateApiGlobal,
            editVariable: state.editVariable,
            setVariableData: state.setVariableData,
            clearPageInfo: state.clearPageInfo,
            updateToolbar: state.updateToolbar,
            updatePageState: state.updatePageState,
            updateEditState: state.updateEditState,
            zoomRatio: state.zoomRatio,
            addBussinessElement: state.addBussinessElement,
            initHistoryStack: state.initHistoryStack,
            pendingFormItemElement: state.pendingFormItemElement,
            setPendingFormItemElement: state.setPendingFormItemElement,
        }))
    );
    useEffect(() => {
        if (pendingFormItemElement) {
            setPendingItem(pendingFormItemElement);
            setModalOpen(true);
            setPendingFormItemElement(null);
        }
    }, [pendingFormItemElement]);
    useEffect(() => {
        if (typeZDY === 'ZDY') {
            dropEndComponent({
                id: 'customComponent_5l2y4qph83',
                name: 'customComponent容器',
                type: 'customComponent',
            });
        }
    }, [typeZDY]);

    // 画布放大缩小比例
    const [transformMatrix, setTransformMatrix] = useState<TransformMatrixObj>({
        scale: 1,
        translateX: 8,
        translateY: (pageType == 'YYBPZPS' || type == "data") ? 8 : 48,
    });

    // 设置缩放比例
    useEffect(() => {
        setTransformMatrix({
            ...transformMatrix,
            scale: zoomRatio,
        });
    }, [zoomRatio]);
    const [transformMatrixEdit, setTransformMatrixEdit] = useState<TransformMatrixObj>({
        scale: 1,
        translateX: 10,
        translateY: (pageType == 'YYBPZPS' || type == "data") ? 8 : 51,
    });
    useEffect(() => {
        if (mode == 'edit') {
            setTransformMatrix({ ...transformMatrixEdit });
        } else {
            setTransformMatrixEdit({ ...transformMatrix });
            setTransformMatrix({
                scale: 1,
                translateX: 10,
                translateY: (pageType == "YYBPZPS" || type == "data") ? 8 : 51
            })
        }
    }, [mode]);
    const [isDragging, setIsDragging] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [pendingItem, setPendingItem] = useState<IDragTargetItem | null>(null);
    const elementRef = useRef<HTMLDivElement>(null);
    const startPos = useRef<Position>({ x: 0, y: 0 });
    const initialTransform = useRef<Position>({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!elementRef.current) return;
        if (mode !== 'edit') return;
        setIsDragging(true);
        startPos.current = { x: e.clientX, y: e.clientY };

        // 获取初始transform值
        const transform = window.getComputedStyle(elementRef.current).transform;
        if (transform !== 'none') {
            const matrix = new DOMMatrix(transform);
            initialTransform.current = { x: matrix.m41, y: matrix.m42 };
        } else {
            initialTransform.current = { x: 0, y: 0 };
        }
    };

    // 使用类型断言解决冲突
    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging || !elementRef.current) return;
        const deltaX = e.clientX - startPos.current.x;
        const deltaY = e.clientY - startPos.current.y;

        // 应用变换
        const newX = initialTransform.current.x + deltaX;
        const newY = initialTransform.current.y + deltaY;
        //   elementRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
        setTransformMatrix({
            ...transformMatrix,
            translateX: newX,
            translateY: newY,
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            // 使用类型断言避免类型冲突
            const mouseMoveHandler = (e: any) => handleMouseMove(e);
            const mouseUpHandler = () => handleMouseUp();
            // 方式1: 使用类型断言
            window.addEventListener('mousemove', mouseMoveHandler);
            window.addEventListener('mouseup', mouseUpHandler);
            return () => {
                window.removeEventListener('mousemove', mouseMoveHandler);
                window.removeEventListener('mouseup', mouseUpHandler);
            };
        }
    }, [isDragging]);

    // 悬浮组件 - 展示悬浮条
    const [hoverTarget, setHoverTarget] = useState<HTMLElement | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [canvasWidth, setCanvasWidth] = useState('auto');
    const { id } = { id: componentId };
    useEffect(() => {
        async function fetchData() {
            clearPageInfo();
            if (!id && !config.templateId) {
                // 新增页面时，设置默认的事件配置
                // 只有应用画布(pageType == 'YYBPZPS')才设置初始化事件
                const defaultPageData: any = {
                    config: PageConfig.config,
                    elements: [],
                    elementsMap: {},
                    formData: {},
                    apis: {},
                };
                // 只有应用画布才展示初始化事件
                // 业务组件画布(pageType == 'YWZJGL')不展示初始化事件
                if (pageType == 'YYBPZPS') {
                    defaultPageData.events = PageConfig.events || [];
                } else {
                    defaultPageData.events = [];
                }
                savePageInfo({ pageData: defaultPageData });
                setLoaded(true);
                initHistoryStack && initHistoryStack();
                pageLoaded && pageLoaded();
                return;
            }
            setLoaded(false);
            setCanvasWidth(storage.get('canvasWidth') || 'auto');
            let res: any;
            if (pageType == 'YYBPZPS') {
                const params = {
                    provId: config.provId,
                    serviceTypeId: config.serviceTypeId,
                    id: id || config.templateId,
                };
                res = await request.post('/app/queryAppAndNodeInfo', { params: params });
                res = res.bean;
            } else {
                res = await api.getPageDetail({ id: id || config.templateId, serviceTypeId: config.serviceTypeId });
            }
            let pageData: any = {};
            let _res;
            try {
                _res = dealPageData(res);
                pageData = _res.pageData || { config: PageConfig.config };
                // 合并页面事件配置（从 Schema.ts 的 events 字段）
                // 只有应用画布(pageType == 'YYBPZPS')才展示初始化事件
                // 业务组件画布(pageType == 'YWZJGL')不展示初始化事件
                if (pageType == 'YYBPZPS') {
                    const backendEvents = _res.pageData?.events;
                    if (backendEvents && backendEvents.length > 0) {
                        pageData.events = backendEvents;
                    } else if (PageConfig.events && PageConfig.events.length > 0) {
                        // 如果后端没有返回事件配置，使用 Schema.ts 中的默认事件
                        pageData.events = PageConfig.events;
                    }
                } else {
                    // 业务组件画布不展示初始化事件，清除后端返回的事件
                    pageData.events = [];
                }
                await updateApiConfig({
                    api: pageData.apisGlobal,
                    addApiOutParam,
                    editApiOutData,
                    _state,
                    userInfo,
                    apiList,
                });
            } catch (error) {
                pageData = { config: PageConfig.config };
                console.error(error);
                console.info('【json数据】', res.pageData);
            }
            savePageInfo({ ..._res, pageData });
            setLoaded(true);
            updateEditState(false);
            initHistoryStack && initHistoryStack();
            pageLoaded && pageLoaded();
        }
        if (type != 'data') {
            fetchData();
        } else {
            // type="data" 模式也需要合并页面事件配置
            // 只有应用画布(pageType == 'YYBPZPS')才展示初始化事件
            const currentPageData = page?.pageData || {};
            const mergedPageData: any = {
                ...currentPageData,
                // 确保 config.events 存在
                config: {
                    ...PageConfig.config,
                    ...currentPageData.config,
                    events: currentPageData.config?.events || [],
                },
            };
            // 只有应用画布才展示初始化事件
            // 业务组件画布(pageType == 'YWZJGL')不展示初始化事件
            if (pageType == 'YYBPZPS') {
                mergedPageData.events = (currentPageData.events && currentPageData.events.length > 0)
                    ? currentPageData.events
                    : (PageConfig.events || []);
            } else {
                mergedPageData.events = [];
            }
            // 直接更新 pageData，不使用 merge
            savePageInfo({
                page: {
                    ...page,
                    pageData: mergedPageData
                }
            });
            setTimeout(() => {
                setLoaded(true);
                updateEditState(false);
            }, 1000);
        }
        return () => {
            setHoverTarget(null);
            setSelectedElement(undefined);
        };
    }, [id]);

    // 当页面和用户有交互时，增加刷新和返回提示。
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            // Cancel the event as stated by the standard.
            event.preventDefault();
            // Chrome requires returnValue to be set.
            event.returnValue = '';
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    // 拖拽接收
    const [, drop] = useDrop({
        accept: 'MENU_ITEM',
        async drop(item: IDragTargetItem & { componentId: string }, monitor: any) {
            // 此处必须检测该组件是否已经被放入完成，如果已经放置到其它容器中，直接返回。
            if (monitor.didDrop()) return;
            if (item.type == 'businessComponent') {
                dropEndBusinessComponent(item);
            } else {
                dropEndComponent(item);
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });
    // 获取业务组件配置信息
    const getBusinessComponent = (componentid: string) => {
        return request.post('/appComponent/queryAppComponentInfo', {
            params: {
                serviceTypeId: baseInfo.serviceTypeId,
                id: componentid,
            },
        });
    };
    const mergeVariable = (pageData: any) => {
        const variablesNames = variables.map((variable: any) => variable.name);
        (pageData.variables || []).forEach((variable: any) => {
            if (variablesNames.indexOf(variable.name) == -1) {
                addVariable(variable);
            } else {
                editVariable(variable);
            }
        });
        for (let key in pageData.variableData) {
            setVariableData({ name: key, value: pageData.variableData[key] });
        }
    };


    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const apiList = apiListInfo((state: any) => state.apiList);
    const dropEndBusinessComponent = async (item: IDragTargetItem & { componentId: string }) => {
    const nodes = await getBusinessComponent(item.componentId + '');
        const { pageData } = dealPageData(nodes.bean);
        dealPageDataId(pageData);
        addBussinessElement(pageData);
        mergeVariable(pageData);
        // 获取新增api相关的出口参数和api出参
        updateApiConfig({
            api: mergeApis(apisGlobal, pageData, updateApiGlobal), // 合并api配置
            apiOutParam,
            addApiOutParam,
            apiOutData,
            editApiOutData,
            _state,
            userInfo,
            apiList,
        });
    };
    const handleAddToContainer = async (containerType: string, item: IDragTargetItem) => {
        let {
            config: formItemConfig,
            events: formItemEvents,
            methods: formItemMethods = [],
            elements: formItemElements = [],
        } = (await getComponent(item.type + 'Config'))?.default || {};
        const formItemId = createId(item.type);

        // getComponent 返回的组件配置对象是冻结的，直接赋值会抛出 TypeError
        // 使用 cloneDeep 深拷贝后再修改，避免污染原始配置
        if (formItemConfig?.props?.formItem?.name) {
            formItemConfig = cloneDeep(formItemConfig);
            formItemConfig.props.formItem.name = formItemId;
        }
        const {
            config: containerConfig,
            events: containerEvents,
            methods: containerMethods = [],
        } = (await getComponent(containerType + 'Config'))?.default || {};
        const containerId = createId(containerType);
        const containerName = containerType === 'SearchForm' ? '行内表单' : containerType === 'GridForm' ? '网格表单' : '表单容器';
        const childElement =
            formItemElements.map(async (child: IDragTargetItem & { id: string }) => {
                const { config, events, methods = [] }: any = (await getComponent(child.type + 'Config'))?.default || {};
                return {
                    id: child.id || createId(child.type),
                    name: child.name,
                    type: child.type,
                    parentId: formItemId,
                    config,
                    events,
                    methods,
                };
            }) || [];
        Promise.all(childElement).then((res) => {
            addElement({
                type: containerType,
                name: containerName,
                id: containerId,
                config: containerConfig,
                events: containerEvents,
                methods: containerMethods,
                elements: [
                    {
                        id: formItemId,
                        parentId: containerId,
                        type: item.type,
                        name: item.name,
                        config: formItemConfig,
                        events: formItemEvents,
                        methods: formItemMethods,
                        elements: res,
                    },
                ],
            });
        });
    };

    const handleModalOk = (containerType: string) => {
        if (pendingItem) {
            handleAddToContainer(containerType, pendingItem);
        }
        setModalOpen(false);
        setPendingItem(null);
    };

    const handleModalCancel = () => {
        setModalOpen(false);
        setPendingItem(null);
    };

    const dropEndComponent = async (item: IDragTargetItem) => {
        // 生成默认配置
        const {
            config,
            events,
            methods = [],
            elements = [],
        }: any = (typeZDY === 'ZDY' ? window.MyComponentJsData : (await getComponent(item.type + 'Config'))?.default) || {};

        if (!checkComponentType(item.type, "", "", elementsMap)) {
            setPendingItem({ ...item });
            setModalOpen(true);
            return;
        }

        if (checkHasBottomBannerSimple(elementsMap) && item.type == 'BottomBanner') {
            message.info('底部通栏已存在');
            return;
        }
        const childElement =
            elements.map(async (child: IDragTargetItem) => {
                const {
                    config,
                    events,
                    methods = [],
                }: any = (typeZDY === 'ZDY' ? window.MyComponentJsData : (await getComponent(child.type + 'Config'))?.default) || {};
                return {
                    id: createId(child.type),
                    name: child.name,
                    type: child.type,
                    parentId: item.id,
                    config,
                    events,
                    methods,
                };
            }) || [];
        Promise.all(childElement).then((res) => {
            addElement({
                type: item.type,
                name: item.name,
                id: item.id,
                config,
                events,
                methods,
                elements: res,
            });
        });
    };

    // 点击画布，选中目标对象
    const handleClick = (event: MouseEvent) => {
        event.stopPropagation();
        if (mode === 'preview') return;
        const target = event.target as HTMLElement;
        // 如果当前点击的不是自定义组件，需要获取最近的组件对象
        const targetDom = target.closest('[data-id]') as HTMLElement;
        if (targetDom) {
            const id = targetDom?.dataset.id as string;
            if (id === selectedElement?.id) return;
            // 保存在store中，用于更新配置面板
            setSelectedElement({
                id,
                type: targetDom?.dataset.type,
            });
            setHoverTarget(null);
        } else if (selectedElement?.id) {
            setSelectedElement(undefined);
        }
    };

    // 鼠标悬浮事件
    const handleOver = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (mode === 'preview') return;
        // 如果当前点击的不是自定义组件，需要获取最近的组件对象
        const targetDom = target.closest('[data-id]') as HTMLElement;
        if (targetDom) {
            const componentid = targetDom?.dataset.id as string;
            if (componentid === selectedElement?.id || componentid === hoverTarget?.dataset.id) return;
            setHoverTarget(targetDom);
        } else if (hoverTarget) {
            setHoverTarget(null);
        }
        event.stopPropagation();
    };

    // 鼠标悬浮防抖监听
    const { run: handleRunOver } = useDebounceFn(handleOver, { wait: 300 });

    // 键盘快捷复制、删除事件
    useKeyPress(['ctrl.c', 'meta.c'], (event: any) => {
        if (['INPUT', 'TEXTAREA'].includes(event.target.tagName)) return;
        copyElement();
    });

    /**
     * 组件复制，需要考虑到嵌套组合情况
     * 1. 单个组件复制
     * 2. 多个组件复制
     * 3. 嵌套组件复制
     */
    useKeyPress(['ctrl.v', 'meta.v'], (event: any) => {
        if (['INPUT', 'TEXTAREA'].includes(event.target.tagName)) return;
        pastElement();
    });

    // 快捷删除
    useKeyPress(['delete', 'backspace'], (event: any) => {
        if (['INPUT', 'TEXTAREA'].includes(event.target.tagName) || event.target.contentEditable === 'true') return;
        delElement();
    });

    // 复制元素
    const copyElement = () => {
        storage.set('copy_component', selectedElement?.id);
    };

    // 粘贴元素
    const pastElement = () => {
        const id = storage.get('copy_component');
        if (!id) {
            return message.info('暂无复制内容');
        }
        let parentId = elementsMap[id]?.parentId;
        if (selectedElement?.id !== id) {
            parentId = selectedElement?.id;
        }
        // 如果没有父组件，在页面最外层先复制一个元素
        if (!parentId || parentId === 'id_undefined') {
            const { element: current } = getElement(elements, id);
            const newId = createId(id.split('_')[0]) + (id.indexOf("_titleContent") > -1 ? "_titleContent" : "");
            addElement({
                ...elementsMap[id],
                elements: [],
                id: newId,
            }, true);

            // 如果该元素存在子元素，需要递归复制（跳过历史记录）
            deepCopy(current?.elements || [], newId);
        } else {
            const { element: current } = getElement(elements, id);
            // 复制元素时，需要从新生成组件ID
            const newId = createId(id.split('_')[0]) + (id.indexOf("_titleContent") > -1 ? "_titleContent" : "");
            addChildElements({
                ...elementsMap[id],
                elements: [],
                parentId,
                id: newId,
            }, true);
            // 如果该元素存在子元素，需要递归复制（跳过历史记录）
            deepCopy(current?.elements || [], newId);
        }
        // 复制完成后，推送一次历史记录（此时getState已获取到最新状态）
        pageStore.getState().pushHistory(pageStore.getState().page.pageData);
    };

    // 深度递归复制
    function deepCopy(list: any[], parentId: string) {
        for (let i = 0; i < list.length; i++) {
            const pId = createId(list[i].id.split('_')[0]) + (list[i].id.indexOf("_titleContent") > -1 ? "_titleContent" : "");
            addChildElements({
                ...elementsMap[list[i].id],
                parentId,
                elements: [],
                id: pId,
            }, true);
            if (list[i].elements?.length > 0) {
                deepCopy(list[i].elements, pId);
            }
        }
    }

    // 删除元素
    const delElement = () => {
        if (selectedElement) {
            removeElements(selectedElement.id);
        }
    };

    // 自适应时，需要计算画布宽度
    const editorWidth = useMemo(() => {
        if (canvasWidth !== 'auto') return '';
        const editorWidth = document.querySelector('#designer')?.getBoundingClientRect()?.width;
        return `${editorWidth}px`;
    }, [canvasWidth]);

    const pageRef = useRef<HTMLInputElement>(null);
    const [pageDom, setPageDom] = useState<HTMLInputElement | null>(null);
    useEffect(() => {
        setPageDom(pageRef.current);
    }, [pageRef.current]);
    const updateRef = (ref: any) => {
        setPageDom(ref);
    };
    useImperativeHandle(ref, () => ({
        getData: () => {
            // 返回当前页面的完整数据，包括配置、元素、变量等
            return page;
        },
    }));
    return (
        <div id={pageType} ref={drop} className={styles.designer} style={{ width: mode == "edit" && configPanelPinned ? 'calc(100% - 320px)' : undefined }} onClick={handleClick}>
            {pageType == 'YWZJGL' && pageDom && typeZDY !== 'ZDY' && type != 'data' && (
                <React.Suspense fallback={<div>Loading...</div>}>
                    <TopBar updateCanvas={setCanvasWidth} canvasWidth={canvasWidth} pageRef={pageDom} />
                </React.Suspense>
            )}
            <ConfigProvider
                theme={{
                    cssVar: true,
                    hashed: false,
                    algorithm: AntdTheme.defaultAlgorithm,
                    token: {
                        colorPrimary: theme || '#0085d0',
                        colorLink: theme || '#0085d0',
                        colorInfo: theme || '#0085d0',
                    },
                }}
            >
                {config.showArea !== '2' && mode === 'preview' && (
                    <div className="exitPreview">
                        <div className="exitPreviewButton" onClick={() => setMode('edit')}>
                            <LeftOutlined />
                            退出预览
                        </div>
                    </div>
                )}
                <div
                    id="designer"
                    ref={elementRef}
                    // onMouseDown={handleMouseDown}
                    className={`${styles['designer-editor']} ${typeZDY === 'ZDY' ? styles['designer-editor-zdy'] : ''}`}
                    style={{
                        width:
                            canvasWidthKey !== '-1' ? `${canvasWidthKey}px` : pageType == 'YWZJGL' && mode == 'edit' ? 'calc(100% - 20px)' : 'calc(100% - 20px)',
                        height: pageType == 'YWZJGL' && mode == 'edit' && type != 'data' ? 'calc(100% - 60px)' : 'calc(100% - 10px)',
                        cursor: isDragging ? 'grabbing' : 'grab',
                        transform: `matrix(${transformMatrix.scale}, 0, 0, ${transformMatrix.scale}, ${transformMatrix.translateX}, ${transformMatrix.translateY})`,
                        margin: canvasWidthKey !== '-1' ? '0 auto' : 0,
                    }}
                >
                    <div
                        id="editor"
                        className={styles.pageWrapper}
                        style={
                            mode === 'preview' ? { height: '100%', overflow: 'auto', padding: 0 } : { width: '100%', height: '100%' }
                        }
                        onMouseOver={handleRunOver}
                    >
                        {/* 根据选中目标的相对位置，设置工具条 */}
                        {mode === 'edit' && typeZDY !== 'ZDY' && (
                            <Toolbar copyElement={copyElement} pastElement={pastElement} delElement={delElement} hoverTarget={hoverTarget} />
                        )}
                        {mode === 'edit' && (
                            <React.Suspense fallback={<div>Loading...</div>}>
                                {loaded && (
                                    <Page
                                        updateRef={updateRef}
                                        mode={mode}
                                        config={pageConfig}
                                        elements={elements}
                                        state={_state}
                                        setSelectedElement={setSelectedElement}
                                    />
                                )}
                            </React.Suspense>
                        )}
                        {mode === 'preview' && (
                            <React.Suspense fallback={<div>Loading...</div>}>
                                {loaded && (
                                    <Page
                                        mode={mode}
                                        config={pageConfig}
                                        elements={JSON.parse(JSON.stringify(elements))}
                                        state={_state}
                                        setSelectedElement={setSelectedElement}
                                    />
                                )}
                            </React.Suspense>
                        )}
                    </div>
                </div>
            </ConfigProvider>

            {/* 弹框收集器 */}
            {mode === 'edit' && typeZDY !== 'ZDY' && <FloatingCollector />}

            {/* 表单项模态框 */}
            {mode === 'edit' && typeZDY !== 'ZDY' && (
                <FormItemModal open={modalOpen} elementName={pendingItem?.name || ''} onOk={handleModalOk} onCancel={handleModalCancel} />
            )}

            {/* 底部工具按钮 */}
            {/* <BottomTools setZoomRatio={setZoomRatio} /> */}
        </div>
    );
});

export default memo(Editor);
export { Editor };
