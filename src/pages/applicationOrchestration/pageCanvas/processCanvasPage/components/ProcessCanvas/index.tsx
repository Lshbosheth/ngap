import React, { useState, useEffect, useCallback, useRef, useImperativeHandle, forwardRef, ReactNode, MouseEvent as ReactMouseEvent, memo } from 'react';
import { Modal, Tooltip, Button, Input, Select, Switch, Tag } from 'antd';
import { message } from '@/utils/AntdGlobal';
import { useDrop } from 'react-dnd';
import { useCanvas } from '../../hooks/useCanvas';
import { ProcessCanvasRefApi, ProcessCanvasProps, CanvasNode, AddNodeParams, CanvasLine, ComponentData } from '../../processCanvasPageType';
import beginImg from '@/pages/applicationOrchestration/imgs/node-begin.png';
import endImg from '@/pages/applicationOrchestration/imgs/node-end.png';
import businessImg from '@/pages/applicationOrchestration/imgs/node-business.png';
import errorTipImg from '@/pages/applicationOrchestration/imgs/errorTip.png';
import eyeImg from '@/pages/applicationOrchestration/imgs/eye.png';
import moreImg from '@/pages/applicationOrchestration/imgs/more.png';
import './index.less';
import { useAppContext } from '@/utils/AppProvider';
import { IDragTargetItem } from '@/packages/types';
import dealPageData, { dealPageDataId } from '@/utils/dataToCanvas';
import request from '@/utils/request.ts';
import { crossApiUserInfo } from '@/stores/crossapiStore';
import { createLine, initSVG, updateLine } from '@/pages/applicationOrchestration/pageCanvas/components/lineUtil.tsx';
import { useDebounceFn } from 'ahooks';
import ProcessComponentPreview from '@/layout/Preview/ProcessComponentPreview/ProcessComponentPreview';
import { apiListInfo } from '../../../../../../stores/apiListStore';
import { debounce, isEqual, cloneDeep } from 'lodash-es';
import { useShallow } from 'zustand/react/shallow';
import { normalizeNodePresentation } from '../../config/processPresentation';

// 定义弹窗状态接口
interface ModalState {
    visible: boolean;
    currentNodeId?: string | number;
    currentComponentData?: ComponentData;
}

// 序列化快照数据，移除 DOM 元素

const ProcessCanvas = forwardRef<Partial<ProcessCanvasRefApi>, ProcessCanvasProps>((props, ref) => {
    const { handleOpenBrachConfig, closeFloatConfigPage, addComponentNode, configPageDom, _handleMouseMove } = props;
    const { pageStore } = useAppContext();
    const config = pageStore(useShallow((state: any) => state.config));
    const componentId = pageStore(useShallow((state: any) => state.id));
    const addNodeData = pageStore(useShallow((state: any) => state.addNodeData));
    const setComponentsData = pageStore(useShallow((state: any) => state.setComponentsData));
    const setBranchComponentsData = pageStore(useShallow((state: any) => state.setBranchComponentsData));
    const setBranchConfigModalVisible = pageStore((state: any) => state.setBranchConfigModalVisible);
    const clearPageInfo = pageStore(useShallow((state: any) => state.clearPageInfo));
    const componentsData = pageStore(useShallow((state: any) => state.page.componentsData));
    const branchComponentsData = pageStore(useShallow((state: any) => state.page.branchComponentsData));
    const zoomRatio = pageStore(useShallow((state: any) => state.zoomRatio));
    const apiList = apiListInfo((state: any) => state.apiList);
    const _zoomRatio = useRef(zoomRatio);
    const snapshotInitializedRef = useRef(false);
    useEffect(() => {
        _zoomRatio.current = zoomRatio
    }, [zoomRatio])
    const userInfo = crossApiUserInfo((state) => state.userInfo);
    const lineType = 'svg';
    // ************************** 核心状态管理 **************************
    const [nodeMap, setNodeMap] = useState<Record<string | number, CanvasNode>>({});
    const nodeMapRef = useRef(nodeMap);
    useEffect(() => {
        nodeMapRef.current = nodeMap;
    }, [nodeMap])
    const [lineArr, setLineArr] = useState<CanvasLine[]>([]);
    // 存储最新的 lineArr
    const lineArrRef = useRef(lineArr);
    const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 600 });
    // 弹窗状态管理
    const [previewModal, setPreviewModal] = useState<ModalState>({ visible: false });
    const [editModal, setEditModal] = useState<ModalState>({ visible: false });

    let nodeCanvasRef: any = useRef(null);
    const tempLine: any = useRef(null);

    // 恢复连线 DOM
    const restoreLinesFromData = useCallback((lineDataArr: any[]) => {
        // 先清除现有连线
        lineArrRef.current.forEach((lineItem: any) => {
            lineItem.line?.remove();
        });
        // 重建连线
        const newLineArr: CanvasLine[] = [];
        const lineType = 'svg';
        lineDataArr.forEach((lineData: any) => {
            const startNodeDom = document.querySelector(`[node-id="${lineData.startNodeId}"]`) as HTMLElement | null;
            const endNodeDom = document.querySelector(`[node-id="${lineData.endNodeId}"]`) as HTMLElement | null;
            if (!startNodeDom || !endNodeDom) {
                return;
            }

            let startDom: HTMLElement | null = startNodeDom.querySelector('.allowLineDom') as HTMLElement | null;
            if (lineData.startNodeOptionIndex !== -1) {
                const optionDivs = startNodeDom.querySelectorAll('.optionDiv');
                if (optionDivs.length === 0) {
                    return;
                }
                if (optionDivs.length <= lineData.startNodeOptionIndex) {
                    return;
                }
                startDom = (optionDivs[lineData.startNodeOptionIndex] as HTMLElement)?.querySelector('.optionEnd') as HTMLElement | null;
            }
            if (!startDom) {
                return;
            }

            const line = createLine(
                {
                    lineType,
                    canvas: nodeCanvasRef.current,
                    allowLineStartDom: '.allowLineDom',
                    allowLineEndDom: '.canvasNodeBlock',
                    scale: _zoomRatio.current
                },
                startDom,
                endNodeDom,
            );
            newLineArr.push({
                line,
                lineId: lineData.lineId,
                startNodeId: lineData.startNodeId,
                endNodeId: lineData.endNodeId,
                startNodeOptionIndex: lineData.startNodeOptionIndex,
                startNode: nodeMapRef.current[lineData.startNodeId],
                endNode: nodeMapRef.current[lineData.endNodeId],
                startDom,
                endDom: endNodeDom,
            });
        });
        lineArrRef.current = newLineArr;
        setLineArr(newLineArr);
    }, []);

    // 序列化快照数据，移除 DOM 元素
    const serializeSnapshot = useCallback((snapNodeMap: any, snapLineArr: any[]) => {
        const state = pageStore.getState();
        return {
            nodeMap: cloneDeep(snapNodeMap),
            lineArr: snapLineArr.map((line: any) => ({
                lineId: line.lineId,
                startNodeId: line.startNodeId,
                endNodeId: line.endNodeId,
                startNodeOptionIndex: line.startNodeOptionIndex,
            })),
            branchData: cloneDeep(state.page.branchComponentsData),
            componentList: cloneDeep(state.page.componentList),
            processData: cloneDeep(state.processData.nodeData),
        };
    }, []);

    // 监听 store 的变化，用于撤销/重做时同步
    const lastSyncedIdRef = useRef(0);
    useEffect(() => {
        const unsubscribe = pageStore.subscribe((state: any) => {
            const currentSyncId = state._lastComponentsDataSyncId;
            if (currentSyncId && currentSyncId !== lastSyncedIdRef.current) {
                lastSyncedIdRef.current = currentSyncId;
                // 只有在 undo/redo 操作时才恢复状态，普通操作不恢复
                if (!state._isUndoRedoInProgress) {
                    return;
                }
                const snapshot = state._lastUndoSnapshot;
                if (snapshot) {
                    // 恢复节点 - 直接赋值而非依赖 prev
                    const restoredNodeMap = snapshot.nodeMap;
                    if (restoredNodeMap) {
                        nodeMapRef.current = restoredNodeMap;
                        setNodeMap(restoredNodeMap);
                        // 立即更新 store 中的 componentsData 保持同步
                        setComponentsData(restoredNodeMap);
                        // 恢复分支数据
                        if (snapshot.branchData) {
                            setBranchComponentsData(snapshot.branchData);
                        }
                        // 恢复连线 - 延迟执行确保节点已渲染
                        setTimeout(() => {
                            if (snapshot.lineArr !== undefined && snapshot.lineArr !== null) {
                                restoreLinesFromData(snapshot.lineArr);
                            }
                        }, 200);
                    }
                }
                // 重置 undo/redo 状态
                pageStore.getState().setUndoRedoInProgress(false);
            }
        });
        return () => unsubscribe();
    }, [restoreLinesFromData, setComponentsData, setBranchComponentsData]);

    const setApiList = apiListInfo((state: any) => state.setApiList);
    const getApiList = async () => {
        if(!apiList || apiList.length == 0){
            const params = {
                provId: userInfo.provinceId === '0000' ? '00030089' : (userInfo.provinceId || '00030021'),
            };
            const { beans } = await request.post('/csf/appInterface/abilityArrangeList', { params: params });
            setApiList(beans);
        }
    };
    useEffect(() => {
        getApiList();
    }, [userInfo.provinceId]);

    // ************************** 引入画布Hook **************************
    const { canvasRef, scale, calculateLinePos, generateNodeId, extendCanvas, handleMouseDown } = useCanvas(nodeMap, lineArr, setLineArr, pageStore);
    useEffect(() => {
        lineArrRef.current = lineArr;
    }, [lineArr]);
    // 初始化开始/结束节点（移到 useEffect 之前）
    const initDefaultNodes = useCallback(() => {
        const beginNode: CanvasNode = {
            nodeId: 'begin',
            nodeType: 'begin',
            top: canvasSize.height / 2 - 80,
            left: 8,
            pNodeId: [],
            pBranchId: [],
        };
        const endNode: CanvasNode = {
            nodeId: 'end',
            nodeType: 'end',
            top: canvasSize.height / 2 - 80,
            left: canvasSize.width - 100,
            pNodeId: [],
            pBranchId: [],
        };
        const newNodeMap = {
            ['begin']: beginNode,
            ['end']: endNode,
        };
        if(!isEqual(newNodeMap, nodeMapRef.current)){
            setNodeMap(newNodeMap);
            setComponentsData(newNodeMap);
        }
    }, [canvasSize]); // 依赖项细化（可选，增强稳定性）
    useEffect(() => {
        if (canvasRef.current) {
            initDefaultNodes();
        }
    }, []);

    // 拖拽接收
    const [, drop] = useDrop({
        accept: 'MENU_ITEM',
        async drop(item: IDragTargetItem & { componentId: string }, monitor: any) {
            // 此处必须检测该组件是否已经被放入完成，如果已经放置到其它容器中，直接返回。
            if (monitor.didDrop()) return;
            if (item.type == 'businessComponent') {
                // 获取鼠标的屏幕坐标
                const clientOffset = monitor.getClientOffset();
                if (!clientOffset) return;

                // 关键：获取目标元素的引用
                const dropZoneElement = canvasRef.current;
                if (!dropZoneElement) return;

                // 获取目标元素的边界信息
                const dropZoneRect = dropZoneElement.getBoundingClientRect();

                // 核心计算：鼠标相对于目标元素的位置
                const mouseX = (clientOffset.x - dropZoneRect.left)/_zoomRatio.current;
                const mouseY = (clientOffset.y - dropZoneRect.top)/_zoomRatio.current;

                dropEndBusinessComponent(item, mouseX, mouseY);
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
                serviceTypeId: userInfo.serviceTypeId,
                id: componentid,
            },
        });
    };

    const dropEndBusinessComponent = async (
        item: IDragTargetItem & {
            componentId: string;
        },
        mouseX: string | number,
        mouseY: string | number,
    ) => {
        const nodes = await getBusinessComponent(item.componentId + '');
        const { pageData } = dealPageData(JSON.parse(JSON.stringify(nodes.bean)));
        console.log(pageData,'123123123123')
        dealPageDataId(pageData);
        await updateApiConfig(pageData);
        pageData.componentName = nodes.bean.componentName;
        const newNode: CanvasNode = addNode({
            nodeType: 'business',
            componentData: pageData,
            top: mouseY,
            left: mouseX,
        });
        addNodeData({pageData, id: newNode.nodeId});
        pageStore.getState().pushProcessHistory({
            type: 'ADD_NODE',
            data: serializeSnapshot(nodeMapRef.current, lineArrRef.current),
            description: `新增节点: ${pageData.componentName || '业务节点'}`,
        });
    };

    const updateApiConfig = async (pageData: any) => {
        return new Promise(async (resolve) => {
            let requestArr: any = [];
            (pageData.apisGlobal || []).forEach((api: any) => {
                const params = {
                    params: {
                        interfaceId: api.id,
                        staffId: userInfo.staffId,
                    },
                };
                requestArr.push(request.post('/csf/appInterface/getInterfaceParamsAndCheck', params));
            })
            let apiOutParam: any = {};
            pageData.apiVariables = [];
            if(requestArr.length > 0){
                let res = await Promise.all(requestArr);
                res.forEach((item: any, index: number) => {
                    let api: any = {};
                    for (let i = 0; i < apiList.length; i++) {
                        api = apiList[i].children.filter((item: any) => item.value == pageData.apisGlobal[index].id);
                        if (api.length > 0) {
                            break;
                        }
                    }
                    apiOutParam[pageData.apisGlobal[index].id] = item.beans;
                    let _n: any = {
                        id: pageData.apisGlobal[index].id,
                        name: api?.[0]?.label || '',
                        type: 'api',
                        elements: [],
                    };
                    const apiInterfaceId = api?.[0]?.interfaceId || '';
                    (item.beans || []).forEach((_api: any) => {
                        _n.elements.push({
                            name: _api.name,
                            type: "apiOutParam",
                            id: `id_${apiInterfaceId}.${_api.value}`,
                            elements: []
                        })
                    })
                    pageData.apiVariables.push(_n);
                })
            }
            pageData.apiOutParam = apiOutParam;
            resolve("");
        })
    }
    const lineEndDom: any = useRef(null);
    const lineStartDom: any = useRef(null);
    //绑定连线图标的鼠标按下事件
    //鼠标按下并移动时，判断节点是否已存在连线，若已存在则删除原有连线,并重新设置临时连线
    //移动过程中获取并缓存鼠标移入元素
    //鼠标抬起时移除临时连线，添加最终连线
    const selectedNode = useRef(false);
    const nodeEndHandleMouseDown = useCallback(
        (e: ReactMouseEvent<HTMLDivElement>) => {
            if (canvasRef.current) {
                nodeCanvasRef.current = canvasRef.current.querySelector('.nodeCanvas');
            }
            e.preventDefault();
            e.stopPropagation();
            lineStartDom.current = e.currentTarget as HTMLElement;
            // 删除原有节点
            delLineFun(lineStartDom.current);
            if(tempLine.current) tempLine.current.remove()
            // 创建临时连线
            if(!lineEndDom.current || !lineStartDom.current) return;
            selectedNode.current = false;
            lineEndDom.current.style.left = `${(e.clientX - (nodeCanvasRef.current?.getBoundingClientRect().left || 0))/_zoomRatio.current}px`;
            lineEndDom.current.style.top = `${(e.clientY - (nodeCanvasRef.current?.getBoundingClientRect().top || 0))/_zoomRatio.current}px`;
            setTimeout(() => {
                const line = createLine(
                    {
                        lineType,
                        canvas: nodeCanvasRef.current,
                        allowLineStartDom: '.allowLineDom',
                        allowLineEndDom: '.canvasNodeBlock',
                        scale: _zoomRatio.current
                    },
                    lineStartDom.current, // 直接传入 HTMLElement
                    lineEndDom.current, // 直接传入 HTMLElement
                );
                tempLine.current = line;
            })
        },
        []
    );
    const handleMouseMove = useCallback((e: MouseEvent) => {
        //防止默认选中
        e.preventDefault();
        e.stopPropagation();
        _handleMouseMove && _handleMouseMove(e);
        if (lineEndDom.current && lineStartDom.current && tempLine.current && !selectedNode.current) {
            lineEndDom.current.style.left = `${(e.clientX - (nodeCanvasRef.current?.getBoundingClientRect().left || 0)) / _zoomRatio.current}px`;
            lineEndDom.current.style.top = `${(e.clientY - (nodeCanvasRef.current?.getBoundingClientRect().top || 0)) / _zoomRatio.current}px`;
            updateLine(
                tempLine.current,
                {
                    lineType,
                    canvas: nodeCanvasRef.current,
                    allowLineStartDom: '.allowLineDom',
                    allowLineEndDom: '.canvasNodeBlock',
                    scale: _zoomRatio.current
                },
                lineStartDom.current,
                lineEndDom.current,
            ); // 直接传入 HTMLElement
        }
    }, []);

    //鼠标点击可连接节点松开的事件
    const handleMouseUp = useCallback((e: MouseEvent) => {
        if (tempLine.current) {
            let target: HTMLElement | null = e.target as HTMLElement;
            const lineEndNode: HTMLElement | null = target?.closest('.canvasNodeBlock');
            if (lineEndNode) {
                tempLine.current.remove();
                tempLine.current = null;
                addLine(lineStartDom.current, lineEndNode);
                lineStartDom.current = null;
            } else {
                // 释放位置在空白区域时，显示关联推荐信息
                selectedNode.current = true;
                addComponentNode.show({
                    e: e,
                });
            }
        }
        return false;
    }, []);

    // 鼠标点击可连接节点移动的事件
    useEffect(() => {
        if(canvasRef.current){
            canvasRef.current.removeEventListener('mousemove', handleMouseMove);
            canvasRef.current.removeEventListener('mouseup', handleMouseUp);
            canvasRef.current.addEventListener('mousemove', handleMouseMove);
            canvasRef.current.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            if(canvasRef.current){
                canvasRef.current.removeEventListener('mousemove', handleMouseMove);
                canvasRef.current.removeEventListener('mouseup', handleMouseUp);
            }
        }
    }, [handleMouseMove, handleMouseUp])

    // 添加组件节点
    const addNode = useCallback(
        (params: AddNodeParams): CanvasNode => {
            const nodeId = params.nodeId || generateNodeId();
            //选择组件弹窗添加组件设置添加组件的位置
            if (params.type == 'addNodeBlock') {
                const lineEndEle = lineEndDom.current as HTMLElement;
                if (lineEndEle) {
                    params.top = lineEndEle.offsetTop - 13;
                    params.left = lineEndEle.offsetLeft;
                }
            }
            // 处理位置参数（统一转为数字）
            const top = typeof params.top === 'string' ? parseFloat(params.top) : params.top;
            const left = typeof params.left === 'string' ? parseFloat(params.left) : params.left;

            const newNode: CanvasNode = {
                nodeId,
                nodeType: params.nodeType,
                componentData: params.componentData,
                top: top || 0, // 空值兜底
                left: left || 0, // 空值兜底
                pNodeId: [],
                pBranchId: [],
                presentation: normalizeNodePresentation(params.presentation || params.componentData?.presentation),
            };
            // 更新节点映射表
                const updatedNodeMap = {
                    ...nodeMapRef.current,
                    [nodeId]: newNode,
                };
                setNodeMap(updatedNodeMap);
                nodeMapRef.current = updatedNodeMap; // 同步更新 ref
            pageStore.getState().setComponentsData(updatedNodeMap);
            // 异步绑定拖拽事件（DOM渲染完成后）
            setTimeout(() => {
                // 扩展画布
                const nodeDom = document.querySelector(`[node-id="${nodeId}"]`) as HTMLElement | null;
                if (nodeDom) extendCanvas(nodeDom);
                if(params.type == 'addNodeBlock'){
                    if(lineStartDom.current){
                        addLine(lineStartDom.current, nodeDom);
                        lineStartDom.current = null;
                        if(tempLine.current){
                            tempLine.current.remove();
                            tempLine.current = null;
                        }
                        selectedNode.current = false;
                    }
                    // 记录新增节点的历史记录（用于撤销/恢复）
                    const componentName = params.componentData?.componentName || '业务节点';
                    const newNodeMap = nodeMapRef.current;
                    const newLineArr = lineArrRef.current;
                    pageStore.getState().pushProcessHistory({
                        type: 'ADD_NODE',
                        data: serializeSnapshot(newNodeMap, newLineArr),
                        description: `新增节点: ${componentName}`,
                    });
                }
            }, 100);

            return newNode;
        },
        [generateNodeId, extendCanvas, setNodeMap],
    ); // 依赖中加入 initBranchConfig

    // 校验连线是否存在
    const checkParentNode = useCallback(
        ($startNodeId: any, $endNodeId: any, lineArr: any): boolean => {
            // 不能自己连自己
            if ($startNodeId === $endNodeId) {
                return false;
            }
            for (let i = 0; i < lineArrRef.current.length; i++) {
                if ($startNodeId === lineArrRef.current[i].endNodeId) {
                    // 如果父节点等于目标节点，返回false
                    if (lineArrRef.current[i].startNodeId === $endNodeId) {
                        return false;
                    } else {
                        if (!checkParentNode(lineArrRef.current[i].startNodeId, $endNodeId, lineArr)) {
                            return false;
                        }
                    }
                }
            }
            return true;
        },
        [lineArr],
    );

    // 校验连线是否存在
    const checkLineExist = useCallback((startNodeId: string | number, startOptionIndex: number): boolean => {
        const latestLineArr = lineArrRef.current;
        for (var i = 0; i < latestLineArr.length; i++) {
            if (String(latestLineArr[i].startNodeId) == String(startNodeId) && latestLineArr[i].startNodeOptionIndex == startOptionIndex) {
                return true;
            }
        }
        return false;
    }, []);

    // 添加节点之间的连线
    const addLine = useCallback(
        (startDom: HTMLElement, endDom: HTMLElement | null) => {
            if (canvasRef.current) {
                nodeCanvasRef.current = canvasRef.current.querySelector('.nodeCanvas');
            }
            startDom = startDom as HTMLElement;
            endDom = endDom as HTMLElement;
            const businessNodeDom = startDom?.closest('.canvasNodeBlock') as HTMLElement;

            const startNodeId = businessNodeDom?.getAttribute('node-id') || '';
            const endNodeId = endDom.getAttribute('node-id')!;

            const pos = calculateLinePos(startDom, endDom);
            const lineId = `line_${generateNodeId()}`;

            const startNode = nodeMapRef.current[startNodeId];
            const endNode = nodeMapRef.current[endNodeId];

            // 向导式节点，获取对应的选项下标
            let startNodeOptionIndex = -1;
            // 分支连线时获取分支下标
            // 在 startDom 内部查找包含 optionEnd 类名的元素
            const targetDom = startDom.closest('.optionDiv');
            if (startDom.classList.contains('optionEnd') && targetDom) {
                const optionDiv = businessNodeDom.querySelectorAll('.optionDiv');
                startNodeOptionIndex = Array.from(optionDiv).indexOf(targetDom);
            }
            if (!checkParentNode(startNodeId, endNodeId, lineArr)) {
                message.error('目标节点不能为父节点或自身!');
                return;
            }

            const line = createLine(
                {
                    lineType,
                    canvas: nodeCanvasRef.current,
                    allowLineStartDom: '.allowLineDom',
                    allowLineEndDom: '.canvasNodeBlock',
                    scale: _zoomRatio.current
                },
                startDom, // 直接传入 HTMLElement
                endDom, // 直接传入 HTMLElement
            );
            const newLine: CanvasLine = {
                line,
                lineId,
                startNodeId,
                endNodeId,
                startNode,
                endNode,
                startDom,
                endDom,
                startNodeOptionIndex: startNodeOptionIndex,
                ...pos,
            };
            const isLoading = !pageStore.getState().isProcessLoadingComplete;
            setLineArr((prev) => {
                let curLinesId = (prev || []).map((line: any) => {
                    return `${line.startNodeId}-${line.startNodeOptionIndex}-${line.endNodeId}`
                })
                let newLineId = `${newLine.startNodeId}-${newLine.startNodeOptionIndex}-${newLine.endNodeId}`;
                if(curLinesId.indexOf(newLineId) == -1){
                    const newLineArr = [...prev, newLine];
                    lineArrRef.current = newLineArr; // 同步更新 ref
                    const newSnapshot = serializeSnapshot(nodeMapRef.current, newLineArr);
                    if (!isLoading) {
                        pageStore.getState().pushProcessHistory({
                            type: 'ADD_LINE',
                            data: newSnapshot,
                            description: `添加连线: ${startNode?.componentData?.componentName || '起始节点'} -> ${endNode?.componentData?.componentName || '结束节点'}`,
                        });
                    }
                    pageStore.getState().setLastUndoSnapshotField('lineArr', newSnapshot.lineArr);
                    pageStore.getState().setLastUndoSnapshotField('nodeMap', newSnapshot.nodeMap);
                    return newLineArr;
                }else{
                    newLine.line.remove();
                    return prev
                }
            } );
            let curNodes = nodeMapRef.current[endNodeId];
            if(!curNodes) return;
            let parentBranch = curNodes.pNodeId.map((pNodeId: string | number, index: number) => {
                return `${pNodeId}-${(curNodes.pBranchId || [])[index] ?? -1}`
            })
            let newNodeId = `${startNodeId}-${startNodeOptionIndex}`;
            if(parentBranch.indexOf(newNodeId) == -1){
                setNodeMap((prev) => {
                    return {
                        ...prev,
                        [endNodeId]: {
                            ...nodeMapRef.current[endNodeId],
                            pBranchId: [...nodeMapRef.current[endNodeId].pBranchId, startNodeOptionIndex],
                            pNodeId: [...nodeMapRef.current[endNodeId].pNodeId, startNodeId],
                        }
                    }
                })
            }
            addComponentNode?.close();
        },
        [calculateLinePos, generateNodeId, addComponentNode, checkParentNode, setNodeMap],
    );

    //删除连线逻辑
    const delLineFun = ($lineStartDom: HTMLElement) => {
        addComponentNode.close();
        delLine($lineStartDom);
    };

    const delLine = ($lineStartDom: HTMLElement) => {
        const deletedLines = lineArrRef.current.filter((line) => line.startDom === $lineStartDom);
        setLineArr((prev) => {
            // 找到所有 startDom 相等的线
            const matchedLines = prev.filter((line) => line.startDom === $lineStartDom);
            // 从页面上移除相同起点的线
            matchedLines.forEach((item) => {
                item.line.remove();
            });
            // 从变量中删除 startDom 相等的线
            const remainingLineArr = prev.filter((line) => line.startDom !== $lineStartDom);
            const serializedLineArr = remainingLineArr.map((line: any) => ({
                lineId: line.lineId,
                startNodeId: line.startNodeId,
                endNodeId: line.endNodeId,
                startNodeOptionIndex: line.startNodeOptionIndex,
            }));
            pageStore.getState().setLastUndoSnapshotField('lineArr', serializedLineArr);
            pageStore.getState().setLastUndoSnapshotField('nodeMap', cloneDeep(nodeMapRef.current));
            const newSnapshot = serializeSnapshot(nodeMapRef.current, remainingLineArr);
            deletedLines.forEach((line) => {
                const startNode = nodeMapRef.current[line.startNodeId];
                const endNode = nodeMapRef.current[line.endNodeId];
                pageStore.getState().pushProcessHistory({
                    type: 'DELETE_LINE',
                    data: newSnapshot,
                    description: `删除连线: ${startNode?.componentData?.componentName || '起始节点'} -> ${endNode?.componentData?.componentName || '结束节点'}`,
                });
            });
            return remainingLineArr;
        });
    };


    // 更新节点（替代原 updateNode）

    /**
     * 递归判断链接节点不是自己的父节点
     * @param $startNode
     * @param $endNode
     * @return {boolean}
     */
    // ************************** 事件处理 **************************

    // 节点拖拽结束事件处理 拖拽结束更新缓存的节点坐标位置
    const handleNodeDragEnd = useCallback((e: CustomEvent) => {
        const { nodeId, top, left } = e.detail || {};
        if (!nodeId || top === undefined || left === undefined) return;
        const oldNode = nodeMapRef.current[nodeId];
        setNodeMap((prev: Record<string | number, CanvasNode>) => {
            const newNodeMap = { ...prev };
            if (newNodeMap[nodeId]) {
                newNodeMap[nodeId] = {
                    ...newNodeMap[nodeId],
                    top,
                    left,
                };
            }
            setComponentsData(newNodeMap);
            return newNodeMap;
        });
        if (oldNode) {
            pageStore.getState().pushProcessHistory({
                type: 'MOVE_NODE',
                data: serializeSnapshot(nodeMapRef.current, lineArrRef.current),
                description: `移动节点: ${oldNode.componentData?.componentName || '业务节点'}`,
            });
        }
    }, [setNodeMap, setComponentsData]);

    // 节点预览
    const previewNode = useCallback(
        (nodeId: string | number) => {
            const node = nodeMapRef.current[nodeId];
            if (!node || !node.componentData) return;

            setPreviewModal({
                visible: true,
                currentNodeId: nodeId,
                currentComponentData: node.componentData,
            });
        },
        [],
    );

    const handleAddbrach = useCallback((nodeId: string | number) => {
        handleOpenBrachConfig(nodeMapRef.current[nodeId]);
    }, []);

    // 编辑节点
    const editNode = useCallback(
        (e: any, nodeId: string | number) => {
            closeFloatConfigPage?.();
            const node = nodeMapRef.current[nodeId];
            if (!node || !node.componentData) return;

            setEditModal({
                visible: true,
                currentNodeId: nodeId,
                currentComponentData: node.componentData,
            });
            e.stopPropagation();
        },
        [closeFloatConfigPage],
    );

    // 复制节点
    const copyNode = useCallback(
        (nodeId: string | number) => {
            closeFloatConfigPage?.();
            const node = nodeMapRef.current[nodeId];
            if (!node || node.nodeType !== 'business' || !node.componentData) return;

            const newComponentData = JSON.parse(JSON.stringify(node.componentData));
            newComponentData.elements = dealElements(newComponentData.elements, newComponentData.elementsMap);
            dealPageDataId(newComponentData);
            newComponentData.id = generateNodeId();
            const newNode = addNode({
                nodeType: 'business',
                componentData: newComponentData,
                top: node.top + 10,
                left: node.left + 10,
            });
            pageStore.getState().pushProcessHistory({
                type: 'COPY_NODE',
                data: serializeSnapshot(nodeMapRef.current, lineArrRef.current),
                description: `复制节点: ${node.componentData?.componentName || '业务节点'}`,
            });
        },
        [closeFloatConfigPage, addNode],
    );

    const dealElements = useCallback((elements: any, elementsMap: any) => {
        elements.forEach((element: any, index: number) => {
            elements[index] = {
                ...elementsMap[element.id],
                elements: dealElements(element.elements, elementsMap)
            }
        });
        return elements;
    }, [])

    // 删除节点
    const delNode = useCallback(
        (nodeId: string | number) => {
            closeFloatConfigPage?.();
            const node = nodeMapRef.current[nodeId];
            let remainingLineArr: any[] = [];
            // 更新连线
            setLineArr((prev) => {
                // 找到所有与当前节点相连的线
                const matchedLines = prev.filter((line) => {
                    return String(line.startNodeId) === String(nodeId) || String(line.endNodeId) === String(nodeId);
                });
                // 从页面上移除与节点相连的线
                matchedLines.forEach((item) => {
                    item.line.remove();
                });
                // 从变量中删除 startNodeId 相等的线
                remainingLineArr = prev.filter((line) => line.startNodeId !== nodeId && line.endNodeId !== nodeId);
                const serializedLineArr = remainingLineArr.map((line: any) => ({
                    lineId: line.lineId,
                    startNodeId: line.startNodeId,
                    endNodeId: line.endNodeId,
                    startNodeOptionIndex: line.startNodeOptionIndex,
                }));
                pageStore.getState().setLastUndoSnapshotField('lineArr', serializedLineArr);
                pageStore.getState().setLastUndoSnapshotField('nodeMap', cloneDeep(nodeMapRef.current));
                // 保存删除后的快照用于历史记录（这样 undo 恢复到删除前，redo 恢复到删除后）
                const snapshotAfterDelete = serializeSnapshot(nodeMapRef.current, remainingLineArr);
                pageStore.getState().pushProcessHistory({
                    type: 'DELETE_NODE',
                    data: snapshotAfterDelete,
                    description: `删除节点: ${node?.componentData?.componentName || '业务节点'}`,
                });
                return remainingLineArr;
            });
            // 更新节点状态
            const newNodeMap = { ...nodeMapRef.current };
            delete newNodeMap[nodeId];
            // 同步更新 ref 和 state，确保撤销/重做时状态一致
            nodeMapRef.current = newNodeMap;
            setNodeMap(newNodeMap);
            setComponentsData(newNodeMap);
        },
        [closeFloatConfigPage, setLineArr, setNodeMap, setComponentsData],
    );

    const closeAbout = useCallback(() => {
        tempLine.current?.remove();
        tempLine.current = null;
    }, []);

    const setData = useCallback((defaultNodeList: any[]) => {
        if (!Array.isArray(defaultNodeList)) {
            message.error('无效的节点配置数据');
            return;
        }
        // 关闭历史记录并清空，重置初始化标记
        snapshotInitializedRef.current = false;
        pageStore.getState().setProcessLoadingComplete(false);
        pageStore.getState().clearProcessHistory();

        setLineArr((prev) => {
            prev.forEach((line) => {
                line.line.remove();
            })
            return []
        });
        pageStore.getState().setLastUndoSnapshotField('lineArr', []);
        let maxRight = 150; // 默认起始位置
        //回显节点
        defaultNodeList.forEach(nodeData => {
            const [left, top] = (nodeData.canvasPoint || '0,0').split(',').map(Number);
            addNode({
                nodeId: nodeData.nodeId || generateNodeId(),
                nodeType: 'business',
                componentData: nodeData.componentData || {},
                presentation: nodeData.presentation || nodeData.componentData?.presentation,
                top: top / (scale / 100),
                left: left / (scale / 100),
            });
            maxRight = Math.max(maxRight, left / (scale / 100) + 160);
        });
        setNodeMap((prev) => {
            return{
                ...prev,
                ['end']: {
                    ...prev['end'],
                    left: maxRight + 200,
                }
            }
        })
        setTimeout(() => {
            showLine(defaultNodeList);
            // 等待节点和连线都渲染完成
            setTimeout(() => {
                snapshotInitializedRef.current = true;
                pageStore.getState().setProcessLoadingComplete(true);
                pageStore.getState().pushProcessHistory({
                    type: 'INIT_SNAPSHOT',
                    data: serializeSnapshot(nodeMapRef.current, lineArrRef.current),
                    description: '初始状态',
                });
            }, 200);
        }, 300);
    }, [addNode]);

    const showLine = useCallback((defaultNodeList: any) => {
        let lineStart: any = [];
        //回显连线
        defaultNodeList.forEach((nodeData: any) => {
            const parentIds = (nodeData.parentId || '').split(',');
            const branchIndexes = (nodeData.branchIndex || '-1').split(',').map(Number);
            parentIds.forEach((parentId: string | number, i: number) => {
                const realParentId = parentId && parentId != "null" ? parentId : "begin";
                const startNodeDom = document.querySelector(`[node-id="${realParentId}"]`) as HTMLElement | null;
                const endNodeDom = document.querySelector(`[node-id="${nodeData.nodeId}"]`) as HTMLElement | null;
                if (!startNodeDom || !endNodeDom) return;
                let startDom: HTMLElement | null = startNodeDom.querySelector('.allowLineDom') as HTMLElement | null;
                if (branchIndexes[i] !== -1) {
                    const optionDivs = startNodeDom.querySelectorAll('.optionDiv');
                    startDom = (optionDivs[branchIndexes[i]] as HTMLElement)?.querySelector('.optionEnd') as HTMLElement | null;
                }
                if (startDom) {
                    lineStart.push(`${realParentId}-${branchIndexes[i]}`);
                    addLine(startDom, endNodeDom);
                }
            });
        });
        //连接结束节点
        defaultNodeList.forEach((nodeData: any) => {
            const nodeDom = document.querySelector(`[node-id="${nodeData.nodeId}"]`) as HTMLElement | null;
            const endNodeDom = document.querySelector(`[node-id="end"]`) as HTMLElement | null;
            if (!nodeDom || !endNodeDom) return;
            const componentData = nodeData.componentData;
            const optionsList = componentData?.branchName?.optionsList || [];
            if (optionsList.length > 0) {
                optionsList.forEach((_:any, index:number) => {
                    if (lineStart.indexOf(`${nodeData.nodeId}-${index}`) == -1 && !checkLineExist(nodeData.nodeId, index)) {
                        const startDom = nodeDom.querySelector(`.optionDiv:nth-child(${index + 1}) .optionEnd`) as HTMLElement | null;
                        if (startDom) {
                            addLine(startDom, endNodeDom);
                        }
                    }
                });
            } else {
                if (lineStart.indexOf(`${nodeData.nodeId}--1`) == -1 && !checkLineExist(nodeData.nodeId, -1)) {
                    const startDom = nodeDom.querySelector('.allowLineDom') as HTMLElement | null;
                    if (startDom) {
                        addLine(startDom, endNodeDom);
                    }
                }
            }
        });
    }, [])

    const getData = useCallback(() => {
        const newNodeMap: Record<string | number, CanvasNode> = { ...componentsData };
        // 遍历每个节点，直接给 pNodeId 和 pBranchId 赋值为空数组
        Object.entries(newNodeMap).forEach(([key, node]: [string | number, any]) => {
            newNodeMap[key] = {
                ...node,
                pNodeId: [],
                pBranchId: []
            };
        });
        lineArr.forEach((line: CanvasLine) => {
            const endNode = newNodeMap[line.endNodeId];
            if (endNode && endNode.nodeType === 'business') {
                newNodeMap[line.endNodeId] = {
                    ...endNode,
                    pNodeId: [...endNode.pNodeId, line.startNodeId],
                    pBranchId: [...endNode.pBranchId, line.startNodeOptionIndex],
                };
            }
        });
        setNodeMap(newNodeMap);

        const nodeResultList: CanvasNode[] = []; // 正常的业务节点数据
        const noLineNodeList: CanvasNode[] = []; // 未建立父子节点关系的节点
        const noLineEndList: CanvasNode[] = []; // 未连接结束节点的节点

        Object.values(newNodeMap).forEach((node) => {
            if (node.nodeType !== 'business') return;

            if (node.pNodeId.length === 0) {
                noLineNodeList.push(node);
                const nodeDom = document.querySelector(`[node-id="${node.nodeId}"]`) as HTMLElement | null;
                nodeDom?.classList.add('errorTipNode');
                const tipTextDom = nodeDom?.querySelector('.errorNodeTipText') as HTMLElement | null;
                if (tipTextDom) {
                    tipTextDom.textContent = '未建立父子节点关系';
                }
            } else {
                nodeResultList.push(node);
                const nodeDom = document.querySelector(`[node-id="${node.nodeId}"]`) as HTMLElement | null;
                nodeDom?.classList.remove('errorTipNode');
            }

            const optionsList = branchComponentsData?.[node.nodeId]?.branchName?.optionsList || [];
            let noEndFlag = false;

            let startOptionIndex = -1;
            if (optionsList.length > 0) {
                optionsList.forEach((_: any, index: number) => {
                    startOptionIndex = index;
                    if (!checkLineExist(node.nodeId, startOptionIndex)) {
                        noEndFlag = true;
                    }
                });
            } else {
                if (!checkLineExist(node.nodeId, startOptionIndex)) {
                    noEndFlag = true;
                }
            }

            if (noEndFlag) {
                noLineEndList.push(node);
            }
        });

        if (noLineNodeList.length > 0 || noLineEndList.length > 0) {
            return {
                type: 'error',
                noLineNodeList,
                noLineEndList,
            };
        } else {
            const componentList = nodeResultList.map((node) => {
                const nodeDom = document.querySelector(`[node-id="${node.nodeId}"]`) as HTMLElement | null;
                const top = nodeDom ? parseFloat(nodeDom.style.top || '0') * (scale / 100) : node.top * (scale / 100);
                const left = nodeDom ? parseFloat(nodeDom.style.left || '0') * (scale / 100) : node.left * (scale / 100);

                return {
                    nodeId: node.nodeId,
                    componentType: 'business',
                    componentData: {
                        ...node.componentData,
                        branchName: branchComponentsData?.[node.nodeId]?.branchName ?? '',
                    },
                    componentId: node.componentData?.id,
                    position: 'processPage',
                    parentId: node.pNodeId.join(','),
                    branchIndex: node.pBranchId.join(','),
                    canvasPoint: `${left},${top}`,
                    presentation: normalizeNodePresentation(node.presentation || node.componentData?.presentation),
                };
            });

            return {
                type: 'success',
                componentList,
            };
        }
    }, [lineArr, componentsData, branchComponentsData]);
    const deleteBranch = (nodeId: string) => {
        const snapshot = serializeSnapshot(nodeMapRef.current, lineArrRef.current);
        setLineArr((prev) => {
            let newLineArr = prev;
            for(let i = newLineArr.length - 1;i >= 0;i--){
                if(newLineArr[i].startNodeId == nodeId){
                    newLineArr[i].line.remove();
                    newLineArr.splice(i, 1);
                }
            }
            const remainingLineArr = newLineArr;
            const serializedLineArr = remainingLineArr.map((line: any) => ({
                lineId: line.lineId,
                startNodeId: line.startNodeId,
                endNodeId: line.endNodeId,
                startNodeOptionIndex: line.startNodeOptionIndex,
            }));
            pageStore.getState().setLastUndoSnapshotField('lineArr', serializedLineArr);
            pageStore.getState().setLastUndoSnapshotField('nodeMap', cloneDeep(nodeMapRef.current));
            pageStore.getState().pushProcessHistory({
                type: 'DELETE_BRANCH',
                data: serializeSnapshot(nodeMapRef.current, remainingLineArr),
                description: `删除分支: ${nodeId}`,
            });
            return remainingLineArr;
        })
        setNodeMap((prev) =>{
            let newNodeMap = prev;
            for(let nodeId in newNodeMap){
                while(newNodeMap[nodeId].pNodeId.indexOf(nodeId) > -1){
                    newNodeMap[nodeId].pNodeId.splice(newNodeMap[nodeId].pNodeId.indexOf(nodeId), 1);
                    newNodeMap[nodeId].pBranchId.splice(newNodeMap[nodeId].pNodeId.indexOf(nodeId), 1);
                }
            }
            return newNodeMap
        })
    }
    // 新增分支后删除原来直接连接下一个节点的连线
    const deleteOriginalLine = useCallback((nodeId: string) => {
        if(lineArrRef.current && lineArrRef.current.length > 0){
            const oldLineArr = [...lineArrRef.current];
            let newLineArr = lineArrRef.current.filter((line: any) => {
                let flag = line.startNodeId != nodeId || line.startNodeOptionIndex != -1;
                if(!flag){
                    line.line?.remove?.();
                }
                return flag;
            })
            if(oldLineArr.length != newLineArr.length){
                setLineArr(newLineArr);
                lineArrRef.current = newLineArr;
                const serializedLineArr = newLineArr.map((line: any) => ({
                    lineId: line.lineId,
                    startNodeId: line.startNodeId,
                    endNodeId: line.endNodeId,
                    startNodeOptionIndex: line.startNodeOptionIndex,
                }));
                pageStore.getState().setLastUndoSnapshotField('lineArr', serializedLineArr);
                pageStore.getState().setLastUndoSnapshotField('nodeMap', cloneDeep(nodeMapRef.current));
                setNodeMap((prev: any) => {
                    let newNodeMap: any = prev;
                    Object.keys(newNodeMap).forEach((_nodeId: any) => {
                        let node = newNodeMap[_nodeId];
                        if(node.pNodeId.indexOf(nodeId) > -1){
                            node.pNodeId.forEach((pNodeId: any, index: number) => {
                                if(pNodeId == nodeId && node.pBranchId[index] == -1){
                                    node.pNodeId.splice(index, 1);
                                    node.pBranchId.splice(index, 1);
                                }
                            })
                        }
                    })
                    return newNodeMap
                })
                pageStore.getState().pushProcessHistory({
                    type: 'DELETE_LINE',
                    data: serializeSnapshot(nodeMapRef.current, newLineArr),
                    description: `删除分支连线`,
                });
            }

        }
    }, [setLineArr, setNodeMap])
    // 更新结束节点相关连线的函数
    const updateEndNodeLines = useCallback(() => {
        if (!canvasRef.current) {
            console.warn('canvasRef 不存在，无法更新连线');
            return;
        }

        if (!nodeCanvasRef.current) {
            nodeCanvasRef.current = canvasRef.current.querySelector('.nodeCanvas');
        }

        const endNodeDom = document.querySelector(`[node-id="end"]`) as HTMLElement | null;
        if (!endNodeDom) {
            console.warn('结束节点DOM不存在，无法更新连线');
            return;
        }

        console.log('开始更新结束节点连线，结束节点位置:', endNodeDom.style.left);
        
        // 使用 lineArrRef 获取最新的连线数据
        const currentLines = [...lineArrRef.current];
        console.log('当前连线总数:', currentLines.length, '其中指向结束节点的:', currentLines.filter(l => l.endNodeId === 'end').length);
        
        let updatedCount = 0;
        
        currentLines.forEach((line) => {
            if (line.endNodeId === 'end') {
                const startNodeDom = document.querySelector(`[node-id="${line.startNodeId}"]`) as HTMLElement | null;
                
                if (startNodeDom) {
                    let startDom: HTMLElement | null = startNodeDom.querySelector('.allowLineDom') as HTMLElement | null;
                    
                    if (line.startNodeOptionIndex !== -1) {
                        const optionDivs = startNodeDom.querySelectorAll('.optionDiv');
                        startDom = (optionDivs[line.startNodeOptionIndex] as HTMLElement)?.querySelector('.optionEnd') as HTMLElement | null;
                    }

                    if (startDom) {
                        console.log('正在更新连线:', line.lineId, '从', line.startNodeId, '到结束节点');
                        
                        try {
                            updateLine(
                                line.line,
                                {
                                    lineType,
                                    canvas: nodeCanvasRef.current,
                                    allowLineStartDom: '.allowLineDom',
                                    allowLineEndDom: '.canvasNodeBlock',
                                    scale: _zoomRatio.current
                                },
                                startDom,
                                endNodeDom,
                            );
                            
                            // 更新连线对象的引用
                            line.endDom = endNodeDom;
                            line.startDom = startDom;
                            updatedCount++;
                        } catch (error) {
                            console.error('更新连线失败:', error);
                        }
                    } else {
                        console.warn('找不到起始连接点，节点ID:', line.startNodeId, '选项索引:', line.startNodeOptionIndex);
                    }
                } else {
                    console.warn('找不到起始节点DOM，节点ID:', line.startNodeId);
                }
            }
        });

        console.log('连线更新完成，共更新了', updatedCount, '条连线');
    }, [lineArrRef]);

    // 向外暴漏方法
    useImperativeHandle(ref, () => ({
        setData,
        getData,
        closeAbout,
        deleteBranch,
        deleteOriginalLine,
        updateEndNodeLines
    }), [setData, getData, closeAbout, deleteBranch, deleteOriginalLine, updateEndNodeLines]);

    const customModalStyle = {
        content: {
            padding: 0,
        },

        header: {
            padding: "14px",
            borderBottom: "1px solid #d0d6d9",
        },
        body: {
            maxHeight: "500px",
            overflow: "hidden",
        },
        footer: {
            width: "100%",
            textAlign: "center" as const,
            background: "#ebf1f5",
            padding: "10px"
        }
    };

    const handleClosePreviewModal = (e: any) => {
        e.stopPropagation()
        setPreviewModal({
            visible: false,
        });
    };
    const saveEditModal = useCallback((e: any) => {
        e.stopPropagation();
        const newData = nodeEditRef.current.getData();
        let newNodeMap: Record<string | number, CanvasNode> = {};
        setNodeMap((prev) => {
            newNodeMap = {
                ...prev,
                [newData.nodeId]: {
                    ...prev[newData.nodeId],
                    componentData: {
                        ...prev[newData.nodeId].componentData,
                        id: newData.pageData.pageData.id ?? prev[newData.nodeId].componentData?.id ?? newData.nodeId,
                        apis: newData.pageData.pageData.apis,
                        apiVariables: newData.pageData.pageData.apiVariables,
                        apisGlobal: newData.pageData.pageData.apisGlobal,
                        config: newData.pageData.pageData.config,
                        crossApisGlobal: newData.pageData.pageData.crossApisGlobal,
                        elements: newData.pageData.pageData.elements,
                        elementsMap: newData.pageData.pageData.elementsMap,
                        events: newData.pageData.pageData.events,
                        interceptor: newData.pageData.pageData.interceptor,
                        variables: newData.pageData.pageData.variables,
                        componentName: newData.pageData.pageData.componentName ?? prev[newData.nodeId]?.componentData?.componentName ?? '',
                        nodeType: newData.pageData.pageData.nodeType ?? prev[newData.nodeId].componentData?.nodeType ?? 'AT',
                    }
                },
            };
            setComponentsData(newNodeMap);
            return newNodeMap;
        });
        pageStore.getState().pushProcessHistory({
            type: 'UPDATE_NODE',
            data: serializeSnapshot(newNodeMap, lineArrRef.current),
            description: '编辑业务节点',
        });
        setEditModal({
            visible: false,
        });
    }, [setNodeMap, setComponentsData]);
    const closeEditModal = () => {
        setEditModal({
            visible: false,
        });
    }
    // ************************** 组件初始化 **************************
    useEffect(() => {
        // 新增时清空
        if (canvasRef.current && !componentId && !config.templateId) {
            clearPageInfo();
            pageStore.getState().setProcessLoadingComplete(true);
        }
        const element = canvasRef.current;
        if (!element) return;
        nodeCanvasRef.current = canvasRef.current.querySelector('.nodeCanvas');
        initSVG(nodeCanvasRef.current);

        setCanvasSize({ width: element.clientWidth, height: element.clientHeight });

        // 新建应用时，初始化完成后设置初始快照（只执行一次）
        if (!componentId && !config.templateId && !snapshotInitializedRef.current) {
            snapshotInitializedRef.current = true;
            setTimeout(() => {
                pageStore.getState().pushProcessHistory({
                    type: 'INIT_SNAPSHOT',
                    data: serializeSnapshot(nodeMapRef.current, lineArrRef.current),
                    description: '初始状态',
                });
            }, 500);
        }
    }, [configPageDom]);

    // 挂载到window上
    useEffect(() => {
        window.processAddBussinessNode = addNode;
        const handleNodeDragEndWrapper = (e: CustomEvent) => handleNodeDragEnd(e);
        window.addEventListener('node-drag-end', handleNodeDragEndWrapper);
        return () => {
            delete window.processAddBussinessNode;
            window.removeEventListener('node-drag-end', handleNodeDragEndWrapper);
        };
    }, []);
    const nodeEditRef: any = useRef();
    const buttonClick = useCallback((type: string, nodeId: string | number, e?: ReactMouseEvent<HTMLDivElement>) => {
          console.log(pageStore.getState().page.pageData.variables,pageStore.getState().page.pageData.variableData,'123123123')
        debugger
        if(type == "editNode") editNode(e, nodeId);
        if(type == "copyNode") copyNode(nodeId);
        if(type == "delNode") delNode(nodeId);
        if(type == "handleAddbrach") handleAddbrach(nodeId);
    }, [editNode, copyNode, delNode, handleAddbrach])
    const updateComponentName1 = useCallback((name: string, nodeId: string | number) => {
        setNodeMap((prev: any) => {
            return {
                ...prev,
                [nodeId]: {
                    ...prev[nodeId],
                    componentData: {
                        ...prev[nodeId].componentData,
                        componentName: name
                    }
                }
            }
        })
    }, [setNodeMap])
    // ************************** 组件渲染 **************************
    return (
        <>
            {/* 画布缩放控制 */}
            {/* 流程画布核心区域 */}
            <div className="canvasBox" ref={canvasRef} style={{ height: '100%' }}>
                <div
                    ref={drop}
                    className="nodeCanvas"
                    style={{
                        width: canvasSize.width,
                    }}
                >
                    {Object.values(nodeMap).map((node) => (
                        <RenderNode
                            key={node.nodeId}
                            node={node}
                            handleMouseDown={handleMouseDown}
                            buttonClick={buttonClick}
                            nodeEndHandleMouseDown={nodeEndHandleMouseDown}
                            previewNode={previewNode}
                            updateComponentName1={updateComponentName1}
                            nodeMapRef={nodeMapRef}
                            lineArrRef={lineArrRef}
                            setNodeMap={setNodeMap}
                            serializeSnapshot={serializeSnapshot}
                         />
                    ))}
                    <div
                        style={{width: "10px", height: "10px", opacity: "0", pointerEvents: "none", position: "absolute", background: "#0085d0", left: "0", top: "0"}}
                        id="lineEnd"
                        ref={lineEndDom}
                    ></div>
                </div>
            </div>


            {/*业务组件预览弹窗*/}
            <Modal
                title={previewModal.currentComponentData?.componentName}
                styles={customModalStyle}
                open={previewModal.visible}
                onCancel={handleClosePreviewModal}
                wrapClassName="previewBox"
                footer={[<Button onClick={handleClosePreviewModal}>关闭</Button>]}
                width="80%"
                height="100%"
                maskClosable={false}
                destroyOnClose
                getContainer="document.body"
            >
                <ProcessComponentPreview _mode="preview" pageData={previewModal.currentComponentData} />
            </Modal>
            <Modal
                title={editModal.currentComponentData?.componentName}
                styles={customModalStyle}
                open={editModal.visible}
                onCancel={closeEditModal}
                wrapClassName="editBox"
                footer={[<Button onClick={saveEditModal}>确定</Button>]}
                width="80%"
                height="100%"
                maskClosable={false}
                destroyOnClose
                getContainer="document.body"
            >
                <ProcessComponentPreview ref={nodeEditRef} _mode="edit" pageData={editModal.currentComponentData} currentNodeId={editModal.currentNodeId} />
            </Modal>
        </>
    );
});

export default React.memo(ProcessCanvas);
// ************************** 渲染节点 **************************
const RenderNode = memo(({
    node,
    handleMouseDown,
    buttonClick,
    nodeEndHandleMouseDown,
    previewNode,
    updateComponentName1,
    nodeMapRef,
    lineArrRef,
    setNodeMap,
    serializeSnapshot
}: {
    node: CanvasNode;
    handleMouseDown: (e: any) => void;
    buttonClick: (type: string, nodeId: string | number, e?: ReactMouseEvent<HTMLDivElement>) => void;
    nodeEndHandleMouseDown: (e: ReactMouseEvent<HTMLDivElement>) => void;
    previewNode: (nodeId: string | number) => void;
    updateComponentName1: (name: string, nodeId: string | number) => void;
    nodeMapRef: React.MutableRefObject<Record<string | number, CanvasNode>>;
    lineArrRef: React.MutableRefObject<CanvasLine[]>;
    setNodeMap: React.Dispatch<React.SetStateAction<Record<string | number, CanvasNode>>>;
    serializeSnapshot: (snapNodeMap: any, snapLineArr: any[], branchData?: any) => any;
}) => {
    const { pageStore } = useAppContext();
    const branchComponentsData = pageStore(useShallow((state: any) => state.page.branchComponentsData));
    const updateComponentName = pageStore(useShallow((state: any) => state.updateComponentName));
    const setBranchConfigModalVisible = pageStore((state: any) => state.setBranchConfigModalVisible);
    const nodeStyle: React.CSSProperties = {
        top: `${node.top}px`,
        left: `${node.left}px`,
        position: 'absolute',
    };
    const [nodeIcon, setNodeIcon] = useState(beginImg);
    const [nodeTitle, setNodeTitle] = useState("开始");
    const [optionsList, setOptionsList] = useState<any>([]);
    useEffect(() => {
        if (node.nodeType === 'end') {
            setNodeIcon(endImg);
            setNodeTitle('结束');
        } else if (node.nodeType === 'business') {
            setNodeIcon(businessImg);
            if (branchComponentsData[node.nodeId]?.branchName?.branchType === 'MT') setNodeTitle(`【手动】${node.componentData?.componentName || '业务节点'}`);
            else setNodeTitle(`【自动】${node.componentData?.componentName || '业务节点'}`);
            setOptionsList(branchComponentsData[node.nodeId]?.branchName?.optionsList || [])
        }
    }, [branchComponentsData, branchComponentsData[node.nodeId]?.branchName, node.componentData?.componentName])
    const handleRunClick = useCallback(() => {
        if(node.nodeType !== 'business'){
            setBranchConfigModalVisible(false);
        }
    }, [setBranchConfigModalVisible])
    const [modalAppBaseVisible, setModalAppBaseVisible] = useState(false);
    const [presentationVisible, setPresentationVisible] = useState(false);
    const [presentation, setPresentation] = useState(() => normalizeNodePresentation(node.presentation || node.componentData?.presentation));
    const editName = useCallback(() => {
        setTimeout(() => {
            setModalAppBaseVisible(true);
        }, 200)
    }, [setModalAppBaseVisible]);
    const closeEditName = useCallback(() => {
        setModalAppBaseVisible(false);
    }, [setModalAppBaseVisible]);
    const [nodeName, setNodeName] = useState(node.componentData?.componentName || '业务节点');
    const changeNodeName = (value: any) => {
        setNodeName(value?.target?.value)
    }
    const saveNodeName = useCallback(() => {
        const oldName = node.componentData?.componentName || '业务节点';
        setNodeMap((prev) => {
            const prevNode = prev[node.nodeId];
            const newNodeMap: Record<string | number, CanvasNode> = {} as Record<string | number, CanvasNode>;
            Object.keys(prev).forEach((key) => {
                newNodeMap[key] = prev[key];
            });
            const updatedNode: CanvasNode = {
                ...prevNode,
                componentData: {
                    ...prevNode.componentData,
                    componentName: nodeName
                } as CanvasNode['componentData']
            };
            newNodeMap[node.nodeId] = updatedNode;
            nodeMapRef.current = newNodeMap;
            pageStore.getState().setComponentsData(newNodeMap);
            return newNodeMap;
        });
        pageStore.getState().pushProcessHistory({
            type: 'UPDATE_NODE_NAME',
            data: serializeSnapshot(nodeMapRef.current, lineArrRef.current),
            description: `修改节点名称: ${oldName} → ${nodeName}`,
        });
        pageStore.getState().updateComponentName(nodeName, String(node.nodeId));
        closeEditName();
        if (branchComponentsData[node.nodeId]?.branchName?.branchType === 'MT') setNodeTitle(`【手动】${nodeName || '业务节点'}`);
        else setNodeTitle(`【自动】${nodeName || '业务节点'}`);
    }, [nodeName, branchComponentsData[node.nodeId]?.branchName?.branchType, node.nodeId, node.componentData?.componentName, serializeSnapshot])
    const savePresentation = useCallback(() => {
        const normalized = normalizeNodePresentation(presentation);
        if (normalized.region === 'header' || normalized.region === 'footer') {
            const conflict = Object.values(nodeMapRef.current).find((item: any) =>
                item.nodeType === 'business' &&
                String(item.nodeId) !== String(node.nodeId) &&
                normalizeNodePresentation(item.presentation || item.componentData?.presentation).region === normalized.region
            );
            if (conflict) {
                message.warning(`一个流程只能配置一个${normalized.region === 'header' ? '顶部' : '底部'}节点`);
                return;
            }
        }
        const newNodeMap = { ...nodeMapRef.current };
        newNodeMap[node.nodeId] = {
            ...newNodeMap[node.nodeId],
            presentation: normalized,
            componentData: { ...(newNodeMap[node.nodeId].componentData || node.componentData), presentation: normalized } as ComponentData,
        };
        nodeMapRef.current = newNodeMap;
        setNodeMap(newNodeMap);
        pageStore.getState().setComponentsData(newNodeMap);
        pageStore.getState().updateNodePresentation(node.nodeId, normalized);
        pageStore.getState().pushProcessHistory({
            type: 'UPDATE_NODE_PRESENTATION',
            data: serializeSnapshot(newNodeMap, lineArrRef.current),
            description: `修改节点展示区域: ${node.componentData?.componentName || node.nodeId}`,
        });
        setPresentationVisible(false);
    }, [presentation, node.nodeId, node.componentData?.componentName, serializeSnapshot]);
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
    return (
        <div
            key={node.nodeId}
            node-id={node.nodeId}
            className={node.nodeType === 'business' ? 'canvasNodeBlock businessNode' : 'canvasNodeBlock'}
            style={nodeStyle}
            onClick={handleRunClick}
            onMouseDown={(e) => {e.stopPropagation();handleMouseDown(e);}}
        >
            <div className="errorTipDiv">
                <img src={errorTipImg} />
                <span className="errorNodeTipText"></span>
            </div>

            <div className="nodePage">
                <img className="nodeTypeImg" src={nodeIcon} />
                <Tooltip title={nodeTitle}>
                    <div className="nodeTitle">{nodeTitle}</div>
                </Tooltip>
                {node.nodeType === 'business' && <Tag color="blue" style={{ marginLeft: 4, fontSize: 10 }}>
                    {{ header: '顶部', content: '环节', footer: '底部', control: '控制' }[normalizeNodePresentation(node.presentation || node.componentData?.presentation).region]}
                </Tag>}

                <div className="operateBtnDiv">
                    <div className="previewNodeBtn" onClick={() => previewNode(node.nodeId)} onMouseDown={(e) => e.stopPropagation()}>
                        <img src={eyeImg} />
                    </div>
                    <div className="moreOperateBtn">
                        <img src={moreImg} />
                        <div className="topBtnDiv operateButton">
                            <div className="editNodeBtn operateButton" onClick={(e) => buttonClick("editNode", node.nodeId, e)} onMouseDown={(e) => e.stopPropagation()}>
                                编辑
                            </div>
                            <div className="copyNodeBtn operateButton" onClick={() => buttonClick("copyNode", node.nodeId)} onMouseDown={(e) => e.stopPropagation()}>
                                复制
                            </div>
                            <div className="delNodeBtn operateButton" onClick={() => buttonClick("delNode", node.nodeId)} onMouseDown={(e) => e.stopPropagation()}>
                                删除
                            </div>
                            <div className="editNameNodeBtn operateButton" onClick={editName} onMouseDown={(e) => e.stopPropagation()}>
                                修改节点名称
                            </div>
                            <div className="editNameNodeBtn operateButton" onClick={() => setPresentationVisible(true)} onMouseDown={(e) => e.stopPropagation()}>
                                展示设置
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {
                node.nodeType == "business" && optionsList.length > 0
                && (<div className="optionsBlock">
                    {optionsList.map((option: any, index: number) => {
                        return <OptionDiv key={index} {...{index: index, optionsName: option.optionsName, nodeEndHandleMouseDown}} />
                    })} 
                </div>)
            }
            {    
                (node.nodeType != "end" && (!optionsList || optionsList.length == 0)) && <i onMouseDown={nodeEndHandleMouseDown} className="nodeEnd allowLineDom"></i>
            }
            {node.nodeType === 'business' && <div className="addBranchBtn" onClick={() => buttonClick("handleAddbrach", node.nodeId)}>
                +添加分支
            </div>}
            <Modal
                className="editNodeName"
                title="编辑节点名称"
                open={modalAppBaseVisible}
                onCancel={closeEditName}
                styles={modalStyles}
                footer={null} // 移除默认底部按钮
                width={800}
                maskClosable={false} // 设置为false，点击遮罩不关闭
                destroyOnClose // 关闭时销毁子元素
            >
                <div onMouseDown={(e) => e.stopPropagation()}>
                    <div className="app_modules">
                        <label id="applyNameCont">
                            <i className="icon-config">*</i>应用名称：
                        </label>
                        <div className="appName">
                            <Input value={nodeName} onChange={changeNodeName} placeholder="请输入" onMouseDown={(e) => e.stopPropagation()} />
                        </div>
                    </div>
                    <div className="busiButton">
                        <Button type="primary" onClick={saveNodeName} onMouseDown={(e) => e.stopPropagation()} style={{ marginRight: 8 }}>
                            确定
                        </Button>
                        <Button onClick={closeEditName} onMouseDown={(e) => e.stopPropagation()}>取消</Button>
                    </div>
                </div>
            </Modal>
            <Modal
                title="节点展示设置"
                open={presentationVisible}
                onCancel={() => setPresentationVisible(false)}
                onOk={savePresentation}
                width={520}
                maskClosable={false}
            >
                <div onMouseDown={(e) => e.stopPropagation()} style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '16px 12px', alignItems: 'center', padding: '16px 8px' }}>
                    <span>展示区域</span>
                    <Select
                        value={presentation.region}
                        onChange={(region) => setPresentation(normalizeNodePresentation({ ...presentation, region }))}
                        options={[
                            { value: 'header', label: '顶部核心信息区' },
                            { value: 'content', label: '普通环节内容区' },
                            { value: 'footer', label: '底部操作区' },
                            { value: 'control', label: '流程控制（不渲染）' },
                        ]}
                    />
                    <span>显示在导航</span>
                    <Switch
                        disabled={presentation.region !== 'content'}
                        checked={presentation.region === 'content' && presentation.showInNavigator}
                        onChange={(showInNavigator) => setPresentation({ ...presentation, showInNavigator })}
                    />
                    <span>导航标题</span>
                    <Input
                        disabled={presentation.region !== 'content' || !presentation.showInNavigator}
                        value={presentation.navigatorTitle}
                        placeholder="为空时使用节点名称"
                        onChange={(e) => setPresentation({ ...presentation, navigatorTitle: e.target.value })}
                    />
                </div>
            </Modal>
        </div>
    );
}, (prevProps, nextProps) => {
    if (prevProps.node.nodeId !== nextProps.node.nodeId) return false;
    if (prevProps.node.componentData?.componentName !== nextProps.node.componentData?.componentName) return false;
    if (JSON.stringify(prevProps.node.presentation) !== JSON.stringify(nextProps.node.presentation)) return false;
    if (prevProps.node.top !== nextProps.node.top || prevProps.node.left !== nextProps.node.left) return false;
    return true;
})
const OptionDiv = memo((
    {
        index, 
        optionsName,
        nodeEndHandleMouseDown
    } : {
        index: number,
        optionsName: string;
        nodeEndHandleMouseDown: (e: ReactMouseEvent<HTMLDivElement>) => void;
    }) => {
        return <div key={index} className="optionDiv">
                <span>选项{index + 1}：</span>
                <span className="optionName">{optionsName || ''}</span>
                <i className="optionEnd allowLineDom"  onMouseDown={nodeEndHandleMouseDown} ></i>
            </div>
})
