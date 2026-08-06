import React, { useEffect, useRef, useCallback, useState, useImperativeHandle, forwardRef} from 'react';

import ProcessCanvas from './components/ProcessCanvas';
import ConditionalBranch from './components/ConditionalBranchConfig';
import ProcessPage from './components/ProcessPage/ProcessPage.tsx';
import { ProcessCanvasProps, ProcessCanvasRefApi, ComponentData, ComponentNode, CanvasNode } from './processCanvasPageType.ts';
import { useAppContext } from '@/utils/AppProvider';
import styles from './index.module.less';
import request from "@/utils/request.ts";
import dealPageData from "../../../../utils/dataToCanvas";
import { crossApiUserInfo } from '@/stores/crossapiStore';
import { apiListInfo } from '../../../../stores/apiListStore';
import { useShallow } from 'zustand/react/shallow';
import { isLocalMockMode } from '@/mock/localMock';
import { GUIDED_MOCK_NODES, GUIDED_MOCK_PROCESS_CONFIG } from '@/mock/guidedProcessMock';

import './index.less'
interface TransformMatrixObj {
    scale: number;
    translateX: number;
    translateY: number;
}
interface Position {
    x: number;
    y: number;
}

interface NodeBranchData {
    [key: string | number]: any;
}
interface Page2Ref {
  processCanvasData: () => void; // 要暴露的方法
}
const ProcessCanvasPage = forwardRef<Page2Ref, {pageLoaded: () => void}>((props, ref) => {
    const pageStore = useAppContext().pageStore;
    const pageType = useAppContext().pageType;
    const mode = useAppContext().mode;
    const config = pageStore(useShallow((state: any) => state.config));
    const componentId = pageStore(useShallow((state: any) => state.id));
    const clearPageInfo = pageStore(useShallow((state: any) => state.clearPageInfo));
    const nodeModelOpenType = pageStore(useShallow((state: any) => state.nodeModelOpenType));
    const setNodeModelState = pageStore(useShallow((state: any) => state.setNodeModelState));
    const setBranchComponentsData = pageStore(useShallow((state: any) => state.setBranchComponentsData));
    const setComponentListData = pageStore(useShallow((state: any) => state.setComponentListData));
    const zoomRatio = pageStore(useShallow((state: any) => state.zoomRatio));
    const setRefreshPageEvent = pageStore(useShallow((state: any) => state.setRefreshPageEvent));
    const setProcessConfig = pageStore(useShallow((state: any) => state.setProcessConfig));
    const initHistoryStack = pageStore(useShallow((state: any) => state.initHistoryStack));
    const branchModalVisible = pageStore(useShallow((state: any) => state.isBranchConfigModalVisible));
    const setBranchConfigModalVisible = pageStore((state: any) => state.setBranchConfigModalVisible);

    const processCanvas: any = useRef(null);
    const userInfo = crossApiUserInfo((state) => state.userInfo);
    const apiList = apiListInfo((state: any) => state.apiList);
    const setApiList = apiListInfo((state: any) => state.setApiList);
    const getApiList = async () => {
        if (isLocalMockMode('guided')) {
            setApiList([]);
            fetchData();
            return;
        }
        if(!apiList || apiList.length == 0){
            const params = {
                provId: userInfo.provinceId === '0000' ? '00030089' : (userInfo.provinceId || '00030021'),
            };
            const { beans } = await request.post('/csf/appInterface/abilityArrangeList', { params: params });
            setApiList(beans);
        }else{
            fetchData();
        }
    };
    const prevApiList = useRef(apiList);
    useEffect(() => {
        if(apiList && apiList.length > 0 && JSON.stringify(prevApiList.current) != JSON.stringify(apiList)){
            fetchData();
        }
        prevApiList.current = apiList;
    }, [apiList])
    useEffect(() => {
        getApiList();
    }, [userInfo.provinceId]);
    // 画布实例引用
    const canvasRef = useRef<ProcessCanvasRefApi | null>(null);

    const handleCloseBrachConfig = () => {
        setBranchConfigModalVisible(false);
    };
    const [branchModalData, setBranchModalData] = useState<CanvasNode>();
    
    // 画布放大缩小比例
    const [transformMatrix, setTransformMatrix] = useState<TransformMatrixObj>({
        scale: 1,
        translateX: 8,
        translateY: pageType == 'YYBPZPS' ? 8 : 48,
    });
    const [isDragging, setIsDragging] = useState(false);
    const isDraggingRef = useRef(isDragging);
    useEffect(() => {
        isDraggingRef.current = isDragging;
    }, [isDragging])
    // 使用类型断言解决冲突
    const _handleMouseMove = (e: any) => {
        if (!isDraggingRef.current || !elementRef.current) return;
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
    // 画布配置参数
    const canvasOptions: ProcessCanvasProps = {
        _handleMouseMove,
        options: {
            provId: '1001',
            serviceTypeId: '2002',
        },
        handleOpenBrachConfig: (node: CanvasNode) => {
            setBranchModalData(node);
            setBranchConfigModalVisible(true);
        },
        closeFloatConfigPage: () => {
            console.log('关闭浮层配置页');
        },
        addComponentNode: {
            show: (params) => {
                console.log('显示新增组件节点弹窗', params);
                const designerBox = document.querySelector('.designerBox') as HTMLElement;
                if (designerBox) {
                    const x = params.e.offsetX + 10;
                    const y = params.e.offsetY - 442 / 2 - 3;
                    const nodeModeTop = `${y < 0 ? 0 : y}px`;
                    const nodeModeLeft = x + 440 > designerBox.clientWidth ? designerBox.clientWidth - 440 : x + 'px';
                    setNodeModelState(true, 'auto' ,nodeModeTop, nodeModeLeft);
                }
            },
            close: () => {
                setNodeModelState(false);
                canvasRef.current?.closeAbout();
                console.log('关闭新增组件节点弹窗');
            },
            content: document.getElementById('addNodeBlock') as HTMLElement,
        },
        configPageDom: document.getElementById('config-page'),
    };

    // 画布配置节点数据封装
    const processCanvasData = () => {
        if (canvasRef.current) {
            const result = canvasRef.current.getData();
            setComponentListData(result.componentList);
            return result;
        }
    };

     // 向外暴漏方法
        useImperativeHandle(ref, () => ({
            processCanvasData
        }), [processCanvasData]);

    const defaultConfigData: any = {
        branchType: 'MT',
        interfaceId: '',
        optionsList: [],
    }

    // 设置缩放比例
    useEffect(() => {
        setTransformMatrix({
            ...transformMatrix,
            scale: zoomRatio,
        });
    }, [zoomRatio]);

    const elementRef = useRef<HTMLDivElement>(null);
    const startPos = useRef<Position>({ x: 0, y: 0 });
    const initialTransform = useRef<Position>({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        const target: any = e.target;
        if (!elementRef.current || target?.closest(".processCanvas") == null) return;
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

        if (canvasRef.current && nodeModelOpenType === 'auto') {
            canvasRef.current.closeAbout();
            canvasOptions.addComponentNode.close();
        }

    };
    

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const [loaded, setLoaded] = useState(false);
    const { id } = { id: componentId };
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

    // 获取应用数据渲染画布
    const fetchData = async () => {
        clearPageInfo();
        if (isLocalMockMode('guided')) {
            const nodeList = JSON.parse(JSON.stringify(GUIDED_MOCK_NODES));
            const componentMap: Record<string, any> = {};
            nodeList.forEach((item: any) => {
                componentMap[item.nodeId] = {
                    nodeId: item.nodeId,
                    nodeType: 'business',
                    componentData: item.componentData,
                    presentation: item.presentation,
                    top: Number(item.canvasPoint.split(',')[1]),
                    left: Number(item.canvasPoint.split(',')[0]),
                    pNodeId: [],
                    pBranchId: [],
                };
            });
            setProcessConfig(GUIDED_MOCK_PROCESS_CONFIG);
            setBranchComponentsData({});
            setComponentListData(nodeList);
            setLoaded(true);
            props?.pageLoaded();
            setTimeout(() => canvasRef.current?.setData(nodeList), 100);
            return;
        }
        if (!id && !config.templateId) {
            setLoaded(true);
            initHistoryStack && initHistoryStack();
            props?.pageLoaded();
            return;
        }
        setLoaded(false);
        let params = {
            provId: config.provId,
            serviceTypeId: config.serviceTypeId,
            id: id || config.templateId,
        };
        //获取应用信息
        const nodeInfoResult = await request.post('/app/queryAppAndNodeInfo', { params: params });
        setProcessConfig(nodeInfoResult.bean.processConfig);
        setRefreshPageEvent(nodeInfoResult.bean.refreshPageEvent ?? "")
        const nodeList = nodeInfoResult.bean.componentList;
        const componentIds:Array<string> = [];

        nodeList.forEach((item:any ) => {
            if (item.componentId && item.componentType == "business") {
                componentIds.push(item.componentId);
            }
        });

        let componentInfoResult: any = {beans: []};
        //根据应用配置的节点查询节点配置详情
        if(componentIds.length > 0){
            componentInfoResult = await request.post('/appComponent/queryAppComponentInfoList', { params: { ids: componentIds.join(",") }});
        }
        const componentList = componentInfoResult.beans;
        const componentMap = new Map(componentList.map((component: ComponentData) => [component.id, component]));
        const branchComponentsData: NodeBranchData = {};
        for(let i = 0;i < nodeList.length;i++){
            let item: ComponentNode = nodeList[i];
            let matchedComponent: any = componentMap.get(item.componentId);
            if (matchedComponent) {
                matchedComponent.dataFromType = 'edit';
                
                let { pageData } = dealPageData(matchedComponent);
                await updateApiConfig(pageData);
                matchedComponent = {
                    ...pageData,
                    ...matchedComponent
                }
                delete matchedComponent.atomList;
                //存在分支数据时设置分支数据
                if (matchedComponent && matchedComponent.branchName && typeof matchedComponent.branchName == 'string') {
                    matchedComponent.branchName = JSON.parse(matchedComponent.branchName);
                    branchComponentsData[item.nodeId] = {
                        branchName: matchedComponent.branchName,
                    };
                }
                item.componentData = matchedComponent;
            }
        }
        setBranchComponentsData(branchComponentsData);
        setComponentListData(nodeList);
        setTimeout(() => {
            setLoaded(true);
            initHistoryStack && initHistoryStack();
            props?.pageLoaded();
            //画布节点渲染
            setTimeout(() => {
                if (canvasRef.current) {
                    canvasRef.current.setData(nodeList);
                }
            }, 300)
        }, 300);
    }

    const deleteBranch = (nodeId: string) => {
        canvasRef?.current?.deleteBranch(nodeId);
    }

    const deleteOriginalLine = (nodeId: string) => {
        canvasRef?.current?.deleteOriginalLine(nodeId);
    }
    return (
        <>
            {/*向导式场景配置区域*/}
           <div className="processCanvas" ref={processCanvas}> 
                <div style={{ display: mode === 'edit' ? 'block' : 'none', height: '100%' }}>

                    {loaded && (<div
                        id="designer"
                        ref={elementRef}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        className={styles['designer-editor']}
                        style={{
                            height: pageType == 'YWZJGL' && mode == 'edit' ? 'calc(100% - 40px)' : '100%',
                            cursor: isDragging ? 'grabbing' : 'grab',
                            transform: `matrix(${transformMatrix.scale}, 0, 0, ${transformMatrix.scale}, ${transformMatrix.translateX}, ${transformMatrix.translateY})`,
                        }}
                    >
                        {/*流程画布页面*/}
                        <div className="nodeCanvasPage">
                            {loaded && (<ProcessCanvas {...canvasOptions} ref={canvasRef} />)}
                        </div>
                    </div>)}
                </div>
                {/* 预览页面 */}
                {mode === 'preview' && (<div style={{ display: mode === 'preview' ? 'block' : 'none' }}>
                    {loaded && (<ProcessPage />)}
                </div>)}
            </div>
            {/*条件分支属性设置*/}
            { mode === 'edit' && loaded && (<div id="config-page">
                {branchModalVisible && (
                    <ConditionalBranch branchModalData={branchModalData} deleteBranch={deleteBranch} deleteOriginalLine={deleteOriginalLine} handleCloseBrachConfig={handleCloseBrachConfig} />
                )}
            </div>)}

        </>
    );
});
export default ProcessCanvasPage;
