import { memo, useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { ConfigProvider, Alert } from 'antd';
import { useShallow } from 'zustand/react/shallow';
import Page from '@materials/Page/Page';
import { usePageStore } from '@materials/stores/pageStore';
import { message } from '@materials/utils/AntdGlobal';
import { getPageDetail } from '@/api/index';
import locale from 'antd/locale/zh_CN';
import 'dayjs/locale/zh-cn';
import { ComItemType, ConfigType, userInfoType } from '@materials/types/index';
import dealPageData from '../utils/dataToCanvas';
// 性能优化：Schema 解析 Web Worker
import DataWorker from '../utils/dataToCanvas.worker?worker';
import { updateApiConfig } from "./../utils/dealApiGlobal";
import request from '../utils/request';
import getFieldFromAPI from '@materials/utils/apiUtilForInterface';
import NgapRender from '@materials/NgapRender/NgapRender';
import TemplateNav from './TemplateNav';
import "./index.module.less"
import { queryElementFun, getComponent, clearElementComponents, clearBabelCache } from '@materials/index';
import { createFunction, getPageVariable } from '../../../materials/utils/util';
import { debounce } from 'lodash-es';
import CrossAPI from '@materials/utils/crossAPI';
import { handleExternalScroll, handleActionFlow, clearTimerList, clearProcessedMessageIds } from '@materials/utils/action';
import { clearComponentRef } from '@materials/utils/useComponentRefs';
import { resetEchartsPreload } from '@materials/NgapRender/NgapRender';

type DynamicObj = {
    [key: string]: string; // 字符串索引签名
};

const Pages = ({ userInfo, serialNo }: { userInfo?: userInfoType, serialNo?: string }) => {
    const [theme, setTheme] = useState('');
    const [pageData, setPageData] = useState<{ config: ConfigType; elements: ComItemType[] }>();
    const [pageDataLoading, setPageDataLoading] = useState(false); // 性能优化：页面数据加载状态
    const saveUserInfo = usePageStore((state: any) => state.saveUserInfo);
    const [componentInfoMap, setComponentInfoMap] = useState<Record<string, any>>({});
    const [nodeInfoMap, setNodeInfoMap] = useState<Record<string, any>>({});
    const [appStatus, setAppStatus] = useState<string>(""); // 新增：应用状态
    const [downNotice, setDownNotice] = useState<string>(''); // 下架公告内容
    interface NewComRefType {
        [key: string]: any; // 假设索引后是方法，若为其他类型可改为 string/number 等
        // 如果有固定属性，也可以同时定义
        // start?: () => void;
    }

    // 关联到分支的元素
    let branchElementData = useRef<NewComRefType>({});
    const searchStr = window.location.search.slice(1);
    const addBussinessElement = usePageStore(useShallow((state: any) => state.addBussinessElement));
    const formData = usePageStore(useShallow((state: any) => state.page.pageData.formData || {}));
    const variables = usePageStore(useShallow((state: any) => state.page.pageData.variables));
    const addVariable = usePageStore(useShallow((state: any) => state.addVariable));
    const updateApiGlobal = usePageStore(useShallow((state: any) => state.updateApiGlobal));
    const apiOutData = usePageStore(useShallow((state: any) => state.page.pageData.apiOutData));
    const variableData = usePageStore(useShallow((state: any) => state.page.pageData.variableData));
    const setRefreshPageEvent = usePageStore(useShallow((state: any) => state.setRefreshPageEvent));
    const refreshPageEvent = usePageStore(useShallow((state: any) => state.page.refreshPageEvent));
    const crossApisGlobal = usePageStore(useShallow((state: any) => state.page.pageData.crossApisGlobal));

    // ===== 新增：监听外部推送的滚动定位 + 事件触发 =====
    const handleSubmitNgapRef = useRef<(param: any) => void>();
    useEffect(() => {
        if (!handleSubmitNgapRef.current) {
            handleSubmitNgapRef.current = (param: any) => {
            if (param.sendType === 'ngapComponentlinkage') {
                handleExternalScroll(param)
            }
        };
        }
        const handler = handleSubmitNgapRef.current;
        CrossAPI.removeListener('ngap_commonMsgSendEvent', handler);
        CrossAPI.on("ngap_commonMsgSendEvent", handler);
        return () => {
            CrossAPI.removeListener('ngap_commonMsgSendEvent', handler);
        }
    }, []);

    // 应用监听到crossAPI事件( 例如:受理号码变更、进话等)执行对应的事件流
    const eventFunctionRef = useRef<{ [key: string]: (params: any) => void }>({});
    useEffect(() => {
        if (crossApisGlobal && crossApisGlobal.length > 0) {
            const eventFunction = createCrossAPIEvents(crossApisGlobal);
            eventFunctionRef.current = eventFunction;
            interface itemCrossAPIType {
                eventName: string;
                actions: any;
            }
            const handlers: Array<{ eventName: string; handler: (data: any) => void }> = [];
            crossApisGlobal?.forEach((itemCrossAPI: itemCrossAPIType) => {
                    if (itemCrossAPI && itemCrossAPI.eventName) {
                    const handler = (data: any) => {
                        eventFunction[itemCrossAPI.eventName]?.(data);
                    };
                    handlers.push({ eventName: itemCrossAPI.eventName, handler });
                    CrossAPI.on(itemCrossAPI.eventName, handler);
                    }
                });
            return () => {
                handlers.forEach(({ eventName, handler }) => {
                    CrossAPI.removeListener(eventName, handler);
                });
            };
        }
    }, [crossApisGlobal]);

    // 生成事件函数，挂载到应用页面上，应用中监听到crossAPI事件时，会执行这里的事件函数
    const createCrossAPIEvents = (eventsData: any) => {
        const eventFunction: { [key: string]: (params: any) => void } = {};
        const events = eventsData || [];

        // 没有配置事件流，直接返回
        if (!events?.length) {
            return {};
        }
        // 把重复的事件push到数组中（一个点击事件，可能有多个事件流）
        const obj: { [key: string]: any[] } = {};
        events?.forEach((event: any) => {
            if (event?.actions?.length > 0) {
                obj[event.eventName] = (obj[event.eventName] || []).concat([event.actions]);
            }
        });
        // 遍历对象，按顺序执行事件流
        for (const key in obj) {
            eventFunction[key] = (params: any) => {
                // 同一个事件：循环执行多个事件流
                obj[key]?.forEach((actions) => {
                    // 延迟执行获取循环变量
                    setTimeout(() => {
                        handleActionFlow(actions, params);
                    }, 200);
                });
            };
        }
        return eventFunction;
    };

    // 1. 定义数组状态存储所有追加的 elements（初始为空数组）
    const [allRenderElements, setAllRenderElements] = useState<any[]>([]);

    if (!searchStr) {
        message.error('页面地址参数错误，请检查！');
    }

    const paramObj: DynamicObj = {};
    const paramPairs = searchStr.split('&');
    paramPairs.forEach(pair => {
        // 处理参数值包含=的情况
        const [key, ...valueParts] = pair.split('=');
        if (key) { // 跳过空键（如：?&a=1 中的空键）
            const value = valueParts.join('=') || ''; // 拼接被拆分的value，无值则为空字符串
            // 解码
            paramObj[decodeURIComponent(key)] = decodeURIComponent(value);
        }
    });


    if (!paramObj.id && !paramObj.relationId) {
        message.error('地址缺少页面信息，请检查！');
        return;
    }

    const pageId = paramObj.id || paramObj.relationId;

    // 确保 userInfo 有基本的 staffId 属性，如果没有则提供默认值
    const safeUserInfo = userInfo && userInfo.staffId ? userInfo : {
        staffId: '',
        staffName: '',
        serviceTypeId: '',
        provinceId: '',
        deptId: '',
        deptName: '',
        orgaCode: '',
        orgaName: '',
        selfServiceTypeId: '',
        initServiceTypeId: '',
        selfProvCode: '',
        destProvId: '',
        sysNo: '',
        cmos_vision: '',
    };

    // 只在 userInfo 变化时保存到 store，避免每次渲染都触发更新
    useEffect(() => {
        saveUserInfo(safeUserInfo);
    }, [userInfo]);

    const { savePageInfo, clearPageInfo, editApiOutData, saveAppSequenceId, saveAppPageId } = usePageStore(
        useShallow((state) => {
            return {
                savePageInfo: state.savePageInfo,
                saveAppSequenceId: state.saveAppSequenceId,
                saveAppPageId: state.saveAppPageId,
                clearPageInfo: state.clearPageInfo,
                editApiOutData: state.editApiOutData,
            };
        })
    );

    let newComponentMap = useRef<NewComRefType>({}); // 当前场景的所有节点数据，key值为父节点和分支index
    const [pageType, setPageType] = useState("");
    const pageDataWorkerRef = useRef<Worker | null>(null);
    const pageDataTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const appSequenceData: Record<string, string | undefined> = {};

    useEffect(() => {
        if (pageId) {
            saveAppSequenceId(window.appSequenceId);
            saveAppPageId(pageId);
            getPageDetail(paramObj.id, userInfo?.serviceTypeId!, userInfo?.provinceId!, paramObj.relationId, paramObj.appStatus)
                .then(async (res: any) => {
                    // 存储全局变量
                    if (res.bean) {
                        appSequenceData.appLevel = res.bean.appLevel;
                        appSequenceData.belongVersion = res.bean.belongVersion;
                        appSequenceData.projectId = res.bean.projectId;
                        appSequenceData.provId = res.bean.provId;
                        appSequenceData.relationId = res.bean.relationId;
                        appSequenceData.appName = res.bean.appName;
                        appSequenceData.id = res.bean.id;
                        appSequenceData.sceneTypeNm = res.bean.sceneTypeNm;
                        console.log('serialNo-------page------val', serialNo)
                        appSequenceData.serialNo = serialNo || '';
                        const pageBaseInfo: any = {
                            relationId: res.bean.relationId || '',
                            belongVersion: res.bean.belongVersion || '',
                            provId: res.bean.provId || '',
                            appLevel: res.bean.appLevel || '',
                            id: res.bean.id,
                            name: res.bean.appName,
                            projectId: res.bean.projectId,
                        };
                        savePageInfo(pageBaseInfo);
                    }
                    // 检查应用状态，如果状态为11则显示下架公告
                    if (res.bean.appStatus == "11") {
                        setAppStatus('11');
                        setDownNotice(res.bean.downNotice || '该应用目前已下架，暂时无法提供服务。'); // 从 DOWN_NOTICE 字段获取公告内容

                    }
                    try {
                        if (res.bean.elementIds && res.bean.elementIds.length > 0) {
                            const elementList: any = await request.post('/element/queryElementList', {
                                params: {
                                    elementIds: res.bean.elementIds, // 查询所有自定义元素
                                    // provId: userInfo?.provinceId,
                                },
                            });

                            if (elementList && elementList.beans) {
                                // 将接口返回的数据传递给 materials/index.tsx 的 queryElementFun 处理
                                // 等待所有自定义元素加载完成
                                await queryElementFun(elementList.beans);
                            }
                        }
                    } catch (error) {
                        console.error('查询自定义元素失败:', error);
                    }
                    if (res.bean.atomList && res.bean.atomList.length > 0) {
                        setPageType("ZPS");
                        setPageDataLoading(true);
                        let pageData: any = {};
                        let pageBaseInfo: any = {};
                        try {
                            // 性能优化：使用 Web Worker 异步解析 Schema
                            const worker = new DataWorker();
                            pageDataWorkerRef.current = worker;
                            worker.postMessage({ rawData: res.bean });
                            worker.onmessage = (e) => {
                                const { success, data, error, rawData } = e.data;
                                if (success && data) {
                                    pageData = data.pageData || {};
                                    updateApiConfig({
                                        api: pageData.apisGlobal,
                                        editApiOutData,
                                    });
                                    if (window.gdp && window._monitor) {
                                        window._monitor.setJson(pageData);
                                        console.log('serialNo-------appSequenceData', appSequenceData)
                                        console.log('serialNo-------appSequenceData------val', appSequenceData.serialNo)
                                        const monitorJson: Record<string, any> = {
                                            appSequenceId: window.appSequenceId, // 页面访问业务侧全局变量
                                            appId: appSequenceData.id, // 应用ID
                                            appLevel: appSequenceData.appLevel, // 应用级别
                                            appVersion: appSequenceData.belongVersion, // 应用版本号
                                            projectId: appSequenceData.projectId, // 应用所属项目
                                            appPovcode: appSequenceData.provId, // 所属应用的省份
                                            relationID: appSequenceData.relationId, // 应用的关系ID
                                            sceneTypeNm: appSequenceData.sceneTypeNm, // 应用的关系ID
                                            serialNo: appSequenceData.serialNo,
                                            appName: appSequenceData.appName,
                                        };
                                        if (paramObj && paramObj.appStatus == "1") {
                                            monitorJson.isTestShow = "1";
                                        }
                                        window._monitor.setGeneralProps(monitorJson);
                                    }
                                    clearPageInfo();
                                    pageBaseInfo = {
                                        relationId: rawData?.relationId || data?.relationId || '',
                                        belongVersion: rawData?.belongVersion || data?.belongVersion || '',
                                        provId: rawData?.provId || data?.provId || '',
                                        appLevel: rawData?.appLevel || data?.appLevel || '',
                                        id: rawData?.id || data?.id || "",
                                        name: rawData?.appName || data?.appName || "",
                                        projectId: rawData?.projectId || data?.projectId || "",
                                    };
                                    savePageInfo({
                                        ...pageBaseInfo,
                                        pageData,
                                    });
                                    setPageData(pageData);
                                    setTheme(pageData.config?.props?.theme || '#0085d0');
                                } else {
                                    console.error('Schema 解析失败:', error);
                                }
                                setPageDataLoading(false);
                                worker.terminate();
                                pageDataWorkerRef.current = null;
                            };
                            worker.onerror = (error) => {
                                console.error('Worker 错误:', error);
                                message.error('页面数据解析失败');
                                setPageDataLoading(false);
                                worker.terminate();
                                pageDataWorkerRef.current = null;
                            };
                            // 如果 Worker 没有在 10 秒内返回，使用备用方案
                            const timeoutId = setTimeout(() => {
                                if (pageDataLoading) {
                                    worker.terminate();
                                    pageDataWorkerRef.current = null;
                                    // 备用：同步解析
                                    const _res = dealPageData(res.bean);
                                    pageData = _res.pageData || {};
                                    updateApiConfig({ api: pageData.apisGlobal, editApiOutData });
                                    clearPageInfo();
                                    savePageInfo({ ..._res, pageData });
                                    setPageDataLoading(false);
                                    setPageData(pageData);
                                    setTheme(pageData.config?.props?.theme || '#0085d0');
                                }
                            }, 10000);
                            pageDataTimeoutRef.current = timeoutId;
                        } catch (error) { }
                    } else if (res.bean.componentList && res.bean.componentList.length > 0) {
                        setPageType("XDS");
                        setRefreshPageEvent(res.bean.refreshPageEvent ?? "");
                        let nodeList: any = res.bean.componentList;
                        nodeList.forEach((componentData: any) => {
                            const parentId = componentData.parentId;
                            if (!parentId || parentId.indexOf("begin") > -1 || parentId.indexOf("null") > -1) {
                                newComponentMap.current["start"] = componentData;
                            } else {
                                const parentIds = parentId.split(",");
                                const branchIndexes = componentData.branchIndex?.split(",") || [];
                                parentIds.forEach((pid: any, i: number) => {
                                    const branchId = `${pid}-${branchIndexes[i]}`;
                                    newComponentMap.current[branchId] = componentData;
                                });
                            }
                        });
                        // 加载起始节点
                        addProcessNode(newComponentMap.current["start"]);
                        if (window.gdp && window._monitor) {
                            window._monitor.setJson(pageData);
                            const monitorJson: Record<string, any> = {
                                appSequenceId: window.appSequenceId, // 页面访问业务侧全局变量
                                appId: appSequenceData.id, // 应用ID
                                appLevel: appSequenceData.appLevel, // 应用级别
                                appVersion: appSequenceData.belongVersion, // 应用版本号
                                projectId: appSequenceData.projectId, // 应用所属项目
                                appPovcode: appSequenceData.provId, // 所属应用的省份
                                relationID: appSequenceData.relationId // 应用的关系ID
                            };
                            if (paramObj && paramObj.appStatus == "1") {
                                monitorJson.isTestShow = "1";
                            }
                            window._monitor.setGeneralProps(monitorJson);
                        }
                    }
                })
                .catch(() => { });
        }
    }, [pageId]);

    // 监控页面元素选项变化
    useEffect(() => {
        // 对比formData 和 branchElementData，找到有变化的关联分支元素
        Object.entries(formData || {}).forEach(([parentFormId, newFormItem]: [any, any]) => {
            // 遍历当前父Form下的所有元素（Radio/Select_xxx）
            Object.entries(newFormItem || {}).forEach(([elementId, newValue]: [any, any]) => {
                const branchElement = branchElementData.current[elementId];
                if (branchElement && branchElement.nowValue != newValue) {
                    branchElement.nowValue = newValue;

                    // 删除该组件后面的所有
                    // 找到数组中【最后一个匹配】的 index
                    let lastMatchIndex = -1;
                    for (let i = allRenderElements.length - 1; i >= 0; i--) {
                        if (allRenderElements[i].belongNodeId == branchElement.nodeId) {
                            lastMatchIndex = i;
                            break;
                        }
                    }
                    // 3. 保留到匹配项为止，删除后面所有
                    if (lastMatchIndex !== -1) {
                        const newArr = allRenderElements.slice(0, lastMatchIndex + 1);
                        setAllRenderElements(newArr); // 更新 state
                    }

                    // 根据分支判断规则，获取选中的分支
                    var checkIndex = checkBranch(branchElement.branchConfig);
                    if (newComponentMap.current[branchElement.nodeId + "-" + checkIndex]) {
                        addProcessNode(newComponentMap.current[branchElement.nodeId + "-" + checkIndex]);
                    }
                    // initNextNode(index, checkIndex)
                }
            });
        });
    }, [formData]);

    const [nodeList, setNodeList] = useState([{}]);
    const nodeListRef = useRef<any>(nodeList);
    useEffect(() => {
        nodeListRef.current = nodeList;
    }, [nodeList])
    const allRenderElementsRef = useRef(allRenderElements);
    useEffect(() => {
        allRenderElementsRef.current = allRenderElements;
    }, [allRenderElements])
    const variablesRef = useRef(variables);
    useEffect(() => {
        variablesRef.current = variables;
    }, [variables])
    const debouncedSetConfig = useMemo(
        () => debounce((variableData: any) => {
            let nextLoadNode = "";
            let deleteNodeId = [];
            for (let i = 0; i < nodeListRef.current.length; i++) {
                let node: any = nodeListRef.current[i];
                if (nextLoadNode) {
                    deleteNodeId.push(node.nodeId);
                } else {
                    if (node.branchConfig?.branchType == "VA" && node.branchConfig?.interfaceId?.type == "variable") {
                        for (let j = 0; j < variablesRef.current.length; j++) {
                            if (node.branchConfig?.interfaceId?.value.indexOf(variablesRef.current[j].name) > -1) {
                                let nextNodeIndex = checkVABranch(node.branchConfig)
                                if (nextNodeIndex !== false && nodeListRef.current?.[i + 1]?.nodeId != newComponentMap.current[node.nodeId + '-' + nextNodeIndex]?.nodeId) {
                                    nextLoadNode = node.nodeId + '-' + nextNodeIndex;
                                }
                            }
                        }
                    }
                }
            }
            if (nextLoadNode) {
                let newArr = allRenderElementsRef.current.filter((item) => deleteNodeId.indexOf(item.belongNodeId) == -1);
                setAllRenderElements(newArr);
                addProcessNode(newComponentMap.current[nextLoadNode]);
            }
        }, 300),
        []
    );
    useEffect(() => {
        debouncedSetConfig(variableData);
    }, [JSON.stringify(variableData)])

    // 合并全局变量
    const mergeVariable = (pageData: any) => {
        let variablesNames = variables.map((variable: any) => variable.name);
        (pageData.variables || []).forEach((variable: any) => {
            // 后面的节点配置同名的变量后不再赋默认值
            if (variablesNames.indexOf(variable.name) == -1) {
                addVariable(variable);
            }
        })
    }

    // 渲染流程组件节点
    const addProcessNode = async (componentData: any) => {
        const nodeId = componentData.nodeId;
        let params = {
            id: componentData.componentId,
        };
        const myComponentInfo = await request.post('/appComponent/queryAppComponentInfo', { params: params });
        let elementIds: any = myComponentInfo?.bean?.elementIds || [];
        elementIds = elementIds.filter((item: any) => !!!getComponent(item));
        try {
            if (elementIds && elementIds.length > 0) {
                const elementList: any = await request.post('/element/queryElementList', {
                    params: {
                        elementIds: elementIds, // 查询所有自定义元素
                        // provId: userInfo?.provinceId,
                    },
                });

                if (elementList && elementList.beans) {
                    // 将接口返回的数据传递给 materials/index.tsx 的 queryElementFun 处理
                    // 等待所有自定义元素加载完成
                    await queryElementFun(elementList.beans);
                }
            }
        } catch (error) {
            console.error('查询自定义元素失败:', error);
        }
        // 使用 Web Worker 异步解析 Schema
        const componentWorker = new DataWorker();
        const componentDataPromise = new Promise<object>((resolve) => {
            componentWorker.postMessage({ rawData: myComponentInfo.bean });
            componentWorker.onmessage = (e) => {
                const { success, data } = e.data;
                componentWorker.terminate();
                resolve(success && data ? data.pageData : dealPageData(myComponentInfo.bean).pageData);
            };
            componentWorker.onerror = () => {
                componentWorker.terminate();
                resolve(dealPageData(myComponentInfo.bean).pageData);
            };
        });
        const componentPageData = await componentDataPromise as Record<string, any>;
        let componentInfo: any = {
            ...myComponentInfo.bean,
            ...dealPageData(myComponentInfo.bean).pageData,
        };
        await updateApiConfig({
            api: componentInfo.apisGlobal,
            apiOutData,
            editApiOutData,
        });
        updateApiGlobal(JSON.parse(JSON.stringify(componentInfo.apisGlobal)));
        mergeVariable(componentInfo);
        componentInfo.nodeId = nodeId;
        const componentMap: Record<string, any> = {};
        componentMap[componentInfo.id] = componentInfo;
        setComponentInfoMap(prev => ({ ...prev, ...componentMap }));
        setNodeInfoMap(prev => ({ ...prev, ...{ [componentInfo.nodeId]: componentInfo } }))
        // 渲染业务组件
        rendererComponentNode(componentInfo);

        // 维护一份已经渲染的节点数据,用于刷新节点和加载导航条
        // setcomponentListArry(prevElements => [
        //     ...prevElements, // 保留原有数据
        //     componentData // 追加新数据
        // ]);
        // console.log('已经渲染的节点数据：', componentListArry)

        // 处理分支配置数据
        if (componentInfo.branchName && typeof (componentInfo.branchName) == "string") {
            componentInfo.branchName = JSON.parse(componentInfo.branchName);
        }
        var branchConfig = componentInfo.branchName;
        if (!branchConfig || !branchConfig.optionsList || branchConfig.optionsList.length <= 0) {
            branchConfig = "";
        }
        console.log('当前组件分支配置branchConfig：', branchConfig);

        // 首先判断手动还是自动，自动直接掉接口，手动监听表单类原子组件操作
        if (branchConfig && branchConfig.branchType == "AT") {
            getFieldFromAPI(branchConfig.interfaceId).then((interfaceResult) => {
                const checkIndex = checkBranch(branchConfig, interfaceResult);
                // initNextNode(index, checkIndex)
                addProcessNode(newComponentMap.current[nodeId + "-" + checkIndex]);
            });
        } else if (branchConfig && branchConfig.branchType == "MT") {
            // 手动节点
            // 1、从分支中获取当前组件分支判断关联的元素列表
            // 收集当前节点分支判断规则中关联的判断元素
            branchConfig.optionsList.forEach((optionsConfig: any) => {
                optionsConfig.conditionList.forEach((conditionConfig: any, index: number) => {
                    branchElementData.current[conditionConfig.atomId] = {
                        nodeId: componentData.nodeId,
                        componentId: componentData.componentId, // 对应的业务组件ID
                        branchConfig: branchConfig, // 对应的详细判断规则数据，方便进行判断处理
                        // 当前表单类元素选中的值（默认为空），和fromData中的对比，如果不一致，
                        // 则拿着branchConfig和fromData调用checkBranch()方法判断能命中哪个分支
                        // 然后根据componentId + 命中的分支加载下一个节点
                        nowValue: "",
                    };
                });
            });
        } else if (branchConfig && branchConfig.branchType == "VA") {
            let id = checkVABranch(branchConfig);
            if (id !== false) {
                addProcessNode(newComponentMap.current[nodeId + '-' + id]);
            }
        } else {
            // 不存在分支配置的情况下，直接加载下一个节点
            if (newComponentMap.current[nodeId + "-" + "-1"]) {
                addProcessNode(newComponentMap.current[nodeId + "--1"]);
            }
        }
    };

    const refreshPage = useCallback(() => {
        if (newComponentMap.current['start']) {
            console.log("acceptNumberChangeRefreshPage");
            setAllRenderElements([])
            addProcessNode(newComponentMap.current['start']);
        }
    }, [setAllRenderElements, addProcessNode])

    const refreshPageRef = useRef(refreshPage);
    refreshPageRef.current = refreshPage;
    useEffect(() => {
        if (!refreshPageEvent) return;
        let eventList = refreshPageEvent.split(",").filter(Boolean);
        const handler = () => refreshPageRef.current();
        eventList.forEach((event: any) => {
            CrossAPI.removeListener(event, handler);
            CrossAPI.on(event, handler);
        })
        return () => {
            eventList.forEach((event: any) => {
                CrossAPI.removeListener(event, handler);
            })
        }
    }, [refreshPageEvent])

    const checkVABranch = ({ interfaceId, optionsList }: any) => {
        let value = getVariableData(interfaceId);
        typeof value == "function" && (value = value());
        for (let index = 0; index < optionsList.length; index++) {
            let option = optionsList[index];
            let flag = option.rule == "&";
            option.conditionList.forEach((condition: any) => {
                let relation = getResultWithValueByRelation(value, condition.value, condition.relation)
                if (option.rule == "&") {
                    flag = flag && relation;
                } else if (option.rule == "|") {
                    flag = flag || relation
                }
            })
            if (flag) {
                return index;
            }
        }
        return false
    }

    const getVariableData = (id: any) => {
        const variableData = getPageVariable('');
        const dynamicFunc = createFunction(['context', 'eventParams'], id.value);
        const context = {
            variable: variableData
        }
        const result = dynamicFunc(context, {});
        return result;
    }
    // 渲染单个业务组件节点
    const rendererComponentNode = (componentData: any) => {
        if (componentData) {
            const pageData = JSON.parse(JSON.stringify(componentData));
            pageData.elements.forEach((item: any) => {
                item.belongNodeId = componentData.nodeId;
            });
            addBussinessElement(pageData);
            setAllRenderElements(prevElements => [
                ...prevElements, // 保留原有数据
                ...(pageData.elements || []), // 追加新数据
            ]);
        }
    };

    /**
     * 根据接口出参或者表单值判断选中分支
     * @param branchConfig
     * @param dataResult
     */
    const checkBranch = (branchConfig: any, dataResult?: any) => {
        // 循环选项根据配置的条件进行判断是否选中
        for (let i = 0; i < branchConfig.optionsList.length; i++) {
            const optionsConfig = branchConfig.optionsList[i];
            const conditionList = optionsConfig.conditionList;
            const rule = optionsConfig.rule;
            // 循环判断条件
            let flag = false; // 且或关系结果
            conditionList.forEach((conditionConfig: any, index: number) => {
                const fieldAtomId = conditionConfig.atomId; // 取值元素,手动节点
                const filedKey = conditionConfig.filedKey; // 判断条件取值字段,自动节点
                const value = conditionConfig.value; // 条件值 value
                const relation = conditionConfig.relation; // 判断规则 relation
                // 获取字段值
                let fieldValue;
                if (branchConfig.branchType == "AT") {
                    // 从接口获取
                    fieldValue = dataResult.bean[filedKey];
                } else {
                    // 从页面元素获取
                    fieldValue = branchElementData.current[fieldAtomId].nowValue;
                }
                // 判断校验条件
                var result = false;
                if (fieldValue instanceof Array) {
                    for (let j = 0; j < fieldValue.length; j++) {
                        result = getResultWithValueByRelation(fieldValue[j], value, relation);
                        if (result) {
                            break;
                        }
                    }
                } else {
                    result = getResultWithValueByRelation(fieldValue, value, relation);
                }

                conditionConfig.fieldValue = fieldValue;
                conditionConfig.result = result;

                if (index == 0) {
                    flag = conditionConfig.result;
                } else {
                    flag = getResultWithValueByRelation(flag, result, rule);
                }
            });

            // 校验通过，返回选项下标，
            if (flag) {
                return i;
            }
        }

        return -1;
    };

    // 获取两个值之间的关系结果
    const getResultWithValueByRelation = (val1: any, val2: any, relationRule: string) => {
        try {
            if (['greater', '<', 'equalOrGreater', '<=', '>', '>='].indexOf(relationRule) > -1) {
                if (Number.isNaN(Number(val1)) || Number.isNaN(Number(val2))) {
                    return false;
                }
            }
            switch (relationRule) {
                case "|": // 逻辑或
                    return val1 || val2;
                case "&": // 逻辑且
                    return val1 && val2;
                case "==": // 相等
                    return val1 == val2;
                case "!=": // 不相等
                    return val1 != val2;
                case "greater": // 大于
                    return Number(val1) > Number(val2);
                case "<": // 小于
                    return Number(val1) < Number(val2);
                case "equalOrGreater": // 大于等于
                    return Number(val1) >= Number(val2);
                case "<=": // 小于等于
                    return Number(val1) <= Number(val2);
                case ">": // 大于
                    return Number(val1) > Number(val2);
                case ">=": // 大于等于
                    return Number(val1) >= Number(val2);
                case "包含": // 包含
                    return String(val1).indexOf(String(val2)) > -1;
                case "contains": // 包含
                    return String(val1).indexOf(String(val2)) > -1;
                case "notContains": // 不包含
                    return String(val1).indexOf(String(val2)) === -1;
                default:
                    return false;
            }
        } catch (error) {
            return false;
        }
    };
    useEffect(() => {
        let nodeIds = Array.from(new Set(allRenderElements.map((item) => item.belongNodeId)));
        let _nodeList = nodeIds.map((nodeId: any, index: number) => {
            let nodeInfo = nodeInfoMap[nodeId];
            let branchIndex = -1;
            if (index < nodeIds.length - 1) {
                for (let key in newComponentMap.current) {
                    if (newComponentMap.current[key].nodeId == nodeIds[index + 1] && newComponentMap.current[key].branchIndex != "-1") {
                        branchIndex = newComponentMap.current[key].branchIndex;
                    }
                }
            }
            return {
                branchConfig: nodeInfo.branchName,
                nodeId: nodeId,
                branchType: nodeInfo.branchName?.branchType == "MT" ? "人工" : "自动",
                componentName: nodeInfo.componentName,
                branchName: branchIndex == -1 ? "" : (nodeInfo.branchName?.optionsList?.[branchIndex]?.operationRes || ""),
                status: branchIndex == -1 ? "" : (nodeInfo.branchName?.optionsList?.[branchIndex]?.status || "")
            }
        })
        setNodeList(_nodeList);
    }, [allRenderElements])
    const [componentIndex, setComponentIndex] = useState(0);
    // 监控列表的滚动事件
    const scroll = (e: any) => {
        let nodeList = componentList?.current?.querySelectorAll(".componentBox") || [];
        let scrollBox = componentList?.current?.getBoundingClientRect() || { top: 0 };
        let nodeIds = Array.from(new Set(allRenderElements.map((item) => item.belongNodeId)));
        for (let i = 0; i < nodeList.length; i++) {
            if (nodeList[i].children[0].getBoundingClientRect().top > scrollBox.top + 136) {
                let componentIndex = nodeIds.indexOf(allRenderElements[i].belongNodeId);
                if (i > 0 && allRenderElements[i - 1].belongNodeId == allRenderElements[i].belongNodeId) {
                    componentIndex++;
                }
                setComponentIndex(componentIndex);
                break;
            }
        }
    }
    const componentList = useRef<HTMLDivElement>(null);
    // 点击导航条定位列表
    const updateScroll = (index: number) => {
        let nodeIdsArr = allRenderElements.map((item) => item.belongNodeId);
        let nodeIds = Array.from(new Set(nodeIdsArr));
        let nodeList: any = componentList?.current?.querySelectorAll(".componentBox") || [];
        if (componentList && componentList.current) {
            componentList.current.scrollTop = (nodeList[nodeIdsArr.indexOf(nodeIds[index])].children[0]?.offsetTop || 136) - 136;
        }
    }

    // 清理iframe卸载时的资源，防止内存泄漏
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (pageDataWorkerRef.current) {
                pageDataWorkerRef.current.terminate();
                pageDataWorkerRef.current = null;
            }
            if (pageDataTimeoutRef.current) {
                clearTimeout(pageDataTimeoutRef.current);
                pageDataTimeoutRef.current = null;
            }
            clearComponentRef();
            clearTimerList();
            clearProcessedMessageIds();
            resetEchartsPreload();
            clearElementComponents();
            clearBabelCache();
            usePageStore.getState().clearPageInfo();
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            // 组件卸载时也清理资源
            if (pageDataWorkerRef.current) {
                pageDataWorkerRef.current.terminate();
                pageDataWorkerRef.current = null;
            }
            if (pageDataTimeoutRef.current) {
                clearTimeout(pageDataTimeoutRef.current);
                pageDataTimeoutRef.current = null;
            }
            clearComponentRef();
            clearTimerList();
            clearProcessedMessageIds();
            resetEchartsPreload();
            clearElementComponents();
            clearBabelCache();
        };
    }, []);

    return (
        <ConfigProvider
            locale={locale}
            theme={{
                cssVar: true,
                hashed: false,
                token: {
                    colorPrimary: theme,
                    colorLink: theme,
                    colorInfo: theme,
                },
            }}
        >  {/* 应用下架公告 */}
            {appStatus == "11" && (

                <Alert
                    description={downNotice}
                    type="warning"
                    showIcon
                    closable
                    onClose={() => {
                        setAppStatus("");
                        setDownNotice('');
                    }}
                />

            )}
            {pageType == "ZPS" && (<Page config={pageData?.config} elements={pageData?.elements} relationId={paramObj.relationId} />)}
            {pageType == "XDS" && (<div className="XDSBox" ref={componentList} onScroll={scroll}><TemplateNav updateScroll={updateScroll} nodeList={nodeList} componentIndex={componentIndex} /><NgapRender className="componentList" elements={allRenderElements} /></div>)}
        </ConfigProvider>
    );
};

export default memo(Pages);
