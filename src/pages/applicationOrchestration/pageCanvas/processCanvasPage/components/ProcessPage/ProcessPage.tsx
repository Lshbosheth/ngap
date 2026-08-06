import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import NgapRender from '@/packages/NgapRender/NgapRender';
import { useAppContext } from '@/utils/AppProvider';
import getFieldFromAPI from '@/utils/apiUtilForInterface';
import './index.module.less';
import request from "@/utils/request.ts";
import { menu } from '@/stores/menuStore';
import dealPageData from '@/utils/dataToCanvas';
import { updateApiConfig } from '@/utils/dealApiGlobal';
import TemplateNav from "./TemplateNav.tsx";
import { crossApiUserInfo } from '@/stores/crossapiStore';
import { apiListInfo } from '@/stores/apiListStore';
import { useShallow } from 'zustand/react/shallow';
import { createFunction, getPageVariable } from '../../../../../../packages/utils/util';
import { debounce } from 'lodash-es';
import crossAPI from '../../../../../../utils/crossAPI';
import { normalizeNodePresentation, normalizeProcessConfig } from '../../config/processPresentation';

interface SearchFormProps {
    baseConfig?: any;
}

interface NewComRefType {
    [key: string]: any; // 假设索引后是方法，若为其他类型可改为 string/number 等
    // 如果有固定属性，也可以同时定义
    // start?: () => void;
}

/**
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const ProcessPage: React.FC<SearchFormProps> = ({ baseConfig }) => {
    const _state = useAppContext();
    const { pageStore, mode } = _state;
    //左侧导航栏展开收起状态
    const menuState = menu((state) => state.menuState);

    const newComponentMap = useRef<NewComRefType>({}); // 当前场景的所有节点数据，key值为父节点和分支index
    const branchElementData = useRef<NewComRefType>({}); // 关联到分支的元素
    const currentRenderId = useRef<number>(0); // 当前渲染批次ID，用于中断旧的渲染

    const [nodeInfoMap, setNodeInfoMap] = useState<Record<string, any>>({});

    // 1. 定义数组状态存储所有追加的 elements（初始为空数组）
    const [allRenderElements, setAllRenderElements] = useState<any[]>([]);
    const userinfo = pageStore(useShallow((state: any) => state.config));
    const componentId = pageStore(useShallow((state: any) => state.id));
    const addBussinessElement = pageStore(useShallow((state: any) => state.addBussinessElement));
    const formData = pageStore(useShallow((state: any) => state.page.pageData.formData || {}));
    const page = pageStore(useShallow((state: any) => state.page));
    const processConfig = normalizeProcessConfig(page.processConfig);
    const editApiOutData = pageStore(useShallow((state: any) => state.editApiOutData));
    const variables = pageStore(useShallow((state: any) => state.page.pageData.variables));
    const variableData = pageStore(useShallow((state: any) => state.page.pageData.variableData));
    const updateApiGlobal = pageStore(useShallow((state: any) => state.updateApiGlobal));
    const addVariable = pageStore(useShallow((state: any) => state.addVariable));
    const apiOutParam = pageStore(useShallow((state: any) => state.page.pageData.apiOutParam));
    const addApiOutParam = pageStore(useShallow((state: any) => state.addApiOutParam));
    const apiOutData = pageStore(useShallow((state: any) => state.page.pageData.apiOutData));
    const setRefreshPageEvent = pageStore(useShallow((state: any) => state.setRefreshPageEvent));
    const refreshPageEvent = pageStore(useShallow((state: any) => state.page.refreshPageEvent));
    const apiList = apiListInfo((state: any) => state.apiList);
    const [nodeList, setNodeList] = useState<any>([{}]);

    //监控页面元素选项变化
    useEffect(() => {
        // 对比formData 和 branchElementData，找到有变化的关联分支元素
        Object.entries(formData).forEach(([parentFormId, newFormItem]: [any, any]) => {
            // 遍历当前父Form下的所有元素（Radio/Select_xxx）
            Object.entries(newFormItem).forEach(([elementId, newValue]: [any, any]) => {
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

                    // 生成新的渲染ID，用于中断原分支的后续渲染
                    currentRenderId.current += 1;
                    const newRenderId = currentRenderId.current;

                    // 根据分支判断规则，获取选中的分支
                    const checkIndex = checkBranch(branchElement.branchConfig);
                    if (newComponentMap.current[branchElement.nodeId + '-' + checkIndex]) {
                        // 传入渲染ID，用于后续渲染时的中断判断
                        addProcessNode(newComponentMap.current[branchElement.nodeId + '-' + checkIndex], newRenderId);
                    }
                }
            });
        });
    }, [formData]);
    const nodeListRef = useRef(nodeList);
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
            for(let i = 0;i < nodeListRef.current.length;i++){
                let node: any = nodeListRef.current[i];
                if(nextLoadNode){
                    deleteNodeId.push(node.nodeId);
                }else{
                    if(node?.branchConfig?.branchType == "VA" && node.branchConfig?.interfaceId?.type == "variable"){
                        for(let j = 0;j < variablesRef.current.length;j++){
                            if(node.branchConfig?.interfaceId?.value.indexOf(variablesRef.current[j].name) > -1){
                                let nextNodeIndex = checkVABranch(node.branchConfig, node.nodeId)
                                if(nodeListRef.current?.[i + 1]?.nodeId != newComponentMap.current[node.nodeId + '-' + nextNodeIndex]?.nodeId){
                                    nextLoadNode = node.nodeId + '-' + nextNodeIndex;
                                }
                            }
                        }
                    }
                }
            }
            if(nextLoadNode){
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

    const { id } = { id: componentId };
    const isInitialized = useRef(false);
    //组装渲染组件的顺序
    useEffect(() => {
        if (isInitialized.current) {
            return;
        }
        // 标记为已初始化，后续即使 useEffect 执行也不会重复触发
        isInitialized.current = true;

        const fetchData = async () => {
            const params = {
                provId: userinfo.provId,
                serviceTypeId: userinfo.serviceTypeId,
                id: id || userinfo.templateId || baseConfig?.id,
            };
            let nodeList: any = {};
            if(page.componentList && page.componentList.length > 0){
                nodeList = page.componentList;
                setRefreshPageEvent(page.refreshPageEvent ?? "");
            }else{
                if (!params.id) {
                    return;
                }
                //获取组件的渲染顺序
                const nodeInfoResult: any = await request.post('/app/queryAppAndNodeInfo', { params: params });
                nodeList = nodeInfoResult.bean.componentList;
                setRefreshPageEvent(nodeInfoResult.bean.refreshPageEvent ?? "");
            }
            nodeList.forEach((componentData: any) => {
                const parentId = componentData.parentId;
                if (!parentId || parentId.indexOf("begin") > -1 || parentId.indexOf("null") > -1) {
                    newComponentMap.current['start'] = componentData;
                } else {
                    const parentIds = parentId.split(',');
                    const branchIndexes = componentData.branchIndex?.split(',') || [];
                    parentIds.forEach((pid: any, i: number) => {
                        const branchId = `${pid}-${branchIndexes[i]}`;
                        newComponentMap.current[branchId] = componentData;
                    });
                }
            });

            console.log('页面中的所有节点：', newComponentMap);
            //加载起始节点
            addProcessNode(newComponentMap.current['start']);
        };

        fetchData();
    }, [page]);
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    //渲染流程组件节点
    const addProcessNode = async (componentData: any, renderId?: number) => {
        const nodeId = componentData.nodeId;
        
        // 检查函数：验证当前渲染是否应该继续
        const shouldContinueRender = () => {
            if (renderId === undefined) {
                return true; // 没有渲染ID，允许继续渲染
            }
            // 如果当前的全局渲染ID不等于传入的渲染ID，说明有新的渲染请求
            if (currentRenderId.current !== renderId) {
                console.log(`节点 ${nodeId} 渲染被中断，渲染ID不匹配: ${renderId} vs ${currentRenderId.current}`);
                return false;
            }
            return true;
        };

        // 首次检查：如果提供了渲染ID，立即验证是否应该继续
        if (!shouldContinueRender()) {
            return;
        }

        let params = {
            id: componentData.componentId
        }
        let componentInfo: any = page?.componentsData?.[nodeId]?.componentData ? JSON.parse(JSON.stringify(page?.componentsData?.[nodeId]?.componentData)) : "";
        if(!componentInfo){
            const myComponentInfo = await request.post('/appComponent/queryAppComponentInfo', { params: params });
            
            // API请求完成后再次检查
            if (!shouldContinueRender()) {
                return;
            }
            
            componentInfo = {
                ...myComponentInfo.bean,
                ...dealPageData(myComponentInfo.bean).pageData
            };
        }
        await updateApiConfig({
            api: componentInfo?.apisGlobal,
            editApiOutData,
            userInfo,
            _state,
            apiOutParam,
            addApiOutParam,
            apiOutData,
            apiList
        })
        componentInfo?.apisGlobal && updateApiGlobal(JSON.parse(JSON.stringify(componentInfo.apisGlobal)));
        
        // 组件信息准备好后再次检查
        if (!shouldContinueRender()) {
            return;
        }

        mergeVariable(componentInfo);
        componentInfo.nodeId = nodeId;
        componentInfo.presentation = normalizeNodePresentation(componentData.presentation || componentInfo.presentation);
        const componentMap: Record<string, any> = {};
        componentMap[componentInfo.id] = componentInfo;
        setNodeInfoMap(prev => ({...prev, ...{[componentInfo.nodeId]: componentInfo}}))
        
        // 渲染业务组件
        rendererComponentNode(componentInfo);

        // 处理分支配置数据
        if (componentInfo.branchName && typeof componentInfo.branchName == 'string') {
            componentInfo.branchName = JSON.parse(componentInfo.branchName);
        }
        let branchConfig = componentInfo.branchName;
        if (!branchConfig || !branchConfig.optionsList || branchConfig.optionsList.length <= 0) {
            branchConfig = '';
        }
        console.log('当前组件分支配置branchConfig：', branchConfig);

        // 渲染完成后再次检查，决定是否继续下一节点
        if (!shouldContinueRender()) {
            return;
        }

        // 首先判断手动还是自动，自动直接掉接口，手动监听表单类原子组件操作
        if (branchConfig && branchConfig.branchType == 'AT') {
            getFieldFromAPI(branchConfig.interfaceId, "", {}, 1, _state).then((interfaceResult) => {
                // 自动分支接口返回后检查渲染ID
                if (!shouldContinueRender()) {
                    console.log(`自动分支节点 ${nodeId} 后续渲染被中断`);
                    return;
                }
                const checkIndex = checkBranch(branchConfig, interfaceResult);
                // initNextNode(index, checkIndex)
                addProcessNode(newComponentMap.current[nodeId + '-' + checkIndex], renderId);
            });
        } else if (branchConfig && branchConfig.branchType == 'MT') {
            // 手动节点 - 需要检查渲染ID，避免旧分支继续设置元素关联
            if (!shouldContinueRender()) {
                console.log(`手动分支节点 ${nodeId} 后续渲染被中断，不设置元素关联`);
                return;
            }
            
            // 1、从分支中获取当前组件分支判断关联的元素列表
            // 收集当前节点分支判断规则中关联的判断元素
            branchConfig.optionsList.forEach((optionsConfig: any) => {
                optionsConfig.conditionList.forEach((conditionConfig: any, index: number) => {
                    // 再次检查，确保在循环过程中没有被中断
                    if (!shouldContinueRender()) {
                        return;
                    }
                    branchElementData.current[conditionConfig.atomId] = {
                        nodeId: componentData.nodeId,
                        componentId: componentData.componentId, // 对应的业务组件ID
                        branchConfig: branchConfig, // 对应的详细判断规则数据，方便进行判断处理
                        // 当前表单类元素选中的值（默认为空），和fromData中的对比，如果不一致，
                        // 则拿着branchConfig和fromData调用checkBranch()方法判断能命中哪个分支
                        // 然后根据componentId + 命中的分支加载下一个节点
                        nowValue: '',
                    };
                });
            });
        } else if (branchConfig && branchConfig.branchType == "VA"){
            if (!shouldContinueRender()) {
                console.log(`手动分支节点 ${nodeId} 后续渲染被中断，不设置元素关联`);
                return;
            }
            let id = checkVABranch(branchConfig, nodeId);
            if(id !== false){
                addProcessNode(newComponentMap.current[nodeId + '-' + id]);
            }
        } else {
            // 不存在分支配置的情况下，直接加载下一个节点
            if (newComponentMap.current[nodeId + '-' + '-1']) {
                // 不存在分支配置检查时间戳
                if (!shouldContinueRender()) {
                    console.log(`不存在分支配置节点 ${nodeId} 后续渲染被中断`);
                    return;
                }
                addProcessNode(newComponentMap.current[nodeId + '--1'], renderId);
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

    useEffect(() => {
        let eventList: any = "";
        if(refreshPageEvent && typeof(refreshPageEvent) == "string"){
            eventList = refreshPageEvent.split(",");
            eventList.forEach((event: any) => {
                crossAPI.removeListener(event, refreshPage);
                crossAPI.on(event, refreshPage);
            })
        }
        return () => {
            if(eventList && eventList.length > 0){

                eventList.forEach((event: any) => {
                    crossAPI.removeListener(event, refreshPage);
                })
            }
        }
    }, [refreshPageEvent, refreshPage])

    const checkVABranch = ({interfaceId, optionsList}: any, nodeId: number | string) => {
        let value = getVariableData(interfaceId);
        typeof value == "function" && (value = value());
        for(let index = 0;index < optionsList.length;index++){
            let option = optionsList[index];
            let flag = option.rule == "&";
            option.conditionList.forEach((condition: any) => {
                let relation = getResultWithValueByRelation(value, condition.value, condition.relation)
                if(option.rule == "&"){
                    flag = flag && relation;
                }else if(option.rule == "|"){
                    flag = flag || relation
                }
            })
            if(flag){
                return index;
            }
        }
        return false
    }

    const getVariableData = (id: any) => {
        const variableData = getPageVariable('', _state);
        const dynamicFunc = createFunction(['context', 'eventParams'], id.value);
        const context = {
            variable: variableData
        }
        const result = dynamicFunc(context, {});
        return result;
    }

    // 合并全局变量
    // const mergeVariable = (pageData: any) => {
    //     console.log('mergeVariable1')
    //     let variablesNames = variables.map((variable: any) => variable.name);
    //     (pageData.variables || []).forEach((variable: any) => {
    //         // 后面的节点配置同名的变量后不再赋默认值
    //         if(variablesNames.indexOf(variable.name) == -1){
    //             addVariable(variable);
    //         }
    //     })
    // }

    const mergeVariable = (pageData: any) => {
        const variablesNames = variables.map((variable: any) => variable.name);
        (pageData.variables || []).forEach((variable: any) => {
            if (variable.isPrivate) {
                variable.name = variable.name + pageData.zjId
            }
            console.log(variable.name, 'variable.name')

            if (variablesNames.indexOf(variable.name) == -1) {
                addVariable(variable);
            }
        });

    };


    //渲染单个业务组件节点
    const rendererComponentNode = (componentData: any) => {
        if (componentData) {
            const presentation = normalizeNodePresentation(componentData.presentation);
            if (presentation.region === 'control') return;
            const pageData = JSON.parse(JSON.stringify(componentData));
            pageData.elements.forEach((item: any) => {
                item.belongNodeId = componentData.nodeId;
            });
            addBussinessElement(pageData);
            setAllRenderElements((prevElements) => [
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
                if (branchConfig.branchType == 'AT') {
                    // 从接口获取
                    fieldValue = dataResult.bean[filedKey];
                } else {
                    // 从页面元素获取
                    fieldValue = branchElementData.current[fieldAtomId].nowValue;
                }
                // 判断校验条件
                let result = false;
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
                case '|': // 逻辑或
                    return val1 || val2;
                case '&': // 逻辑且
                    return val1 && val2;
                case '==': // 相等
                    return val1 == val2;
                case '!=': // 不相等
                    return val1 != val2;
                case 'greater': // 大于
                    return Number(val1) > Number(val2);
                case '<': // 小于
                    return Number(val1) < Number(val2);
                case 'equalOrGreater': // 大于等于
                    return Number(val1) >= Number(val2);
                case '<=': // 小于等于
                    return Number(val1) <= Number(val2);
                case '>': // 大于
                    return Number(val1) > Number(val2);
                case '>=': // 大于等于
                    return Number(val1) >= Number(val2);
                case '包含': // 包含
                    return String(val1).indexOf(String(val2)) > -1;
                case 'contains': // 包含
                    return String(val1).indexOf(String(val2)) > -1;
                case 'notContains': // 不包含
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
        let _nodeList = nodeIds.map((nodeId: any, index: number)  => {
            let nodeInfo = nodeInfoMap[nodeId];
            
            // 获取用户实际选择的分支索引
            let userSelectedBranchIndex = -1;
            if (nodeInfo.branchName && nodeInfo.branchName.branchType === 'MT' && nodeInfo.branchName.optionsList) {
                // 遍历所有选项，查找哪个选项的条件与用户的实际选择匹配
                for (let optionIndex = 0; optionIndex < nodeInfo.branchName.optionsList.length; optionIndex++) {
                    const option = nodeInfo.branchName.optionsList[optionIndex];
                    if (option.conditionList && option.conditionList.length > 0) {
                        const atomId = option.conditionList[0].atomId;
                        const branchElement = branchElementData.current[atomId];
                        
                        if (branchElement && branchElement.nowValue !== undefined && branchElement.nowValue !== '') {
                            // 检查用户的实际值是否匹配当前选项的条件
                            const condition = option.conditionList[0];
                            const userValue = branchElement.nowValue;
                            const conditionValue = condition.value;
                            
                            // 使用分支配置来判断哪个分支被命中
                            const isSelected = getResultWithValueByRelation(userValue, conditionValue, condition.relation);
                            if (isSelected) {
                                userSelectedBranchIndex = optionIndex;
                                break;
                            }
                        }
                    }
                }
            } else if (index < nodeIds.length - 1) {
                // 对于自动分支或其他情况，使用原有的逻辑确定分支索引
                for(let key in newComponentMap.current){
                    if(newComponentMap.current[key].nodeId == nodeIds[index + 1] && newComponentMap.current[key].branchIndex != "-1"){
                        userSelectedBranchIndex = newComponentMap.current[key].branchIndex;
                    }
                }
            }
            
            // 根据用户选择的分支索引获取对应的 operationRes
            let actualBranchValue = "";
            if (userSelectedBranchIndex !== -1 && nodeInfo.branchName?.optionsList?.[userSelectedBranchIndex]) {
                actualBranchValue = nodeInfo.branchName.optionsList[userSelectedBranchIndex].operationRes || "";
            }
            
            const presentation = normalizeNodePresentation(nodeInfo.presentation);
            return {
                branchConfig: nodeInfo.branchName,
                nodeId: nodeId,
                branchType: nodeInfo.branchName?.branchType == "MT" ? "人工" : "自动",
                componentName: presentation.navigatorTitle || nodeInfo.componentName,
                presentation,
                branchName: actualBranchValue,
                status: userSelectedBranchIndex == -1 ? "" : (nodeInfo.branchName?.optionsList?.[userSelectedBranchIndex]?.status || "")
            }
        })
        console.log("+_+_+_+_+_+_+", _nodeList)
        setNodeList(_nodeList.filter((item: any) => item.presentation.region === 'content' && item.presentation.showInNavigator));
    }, [allRenderElements, branchElementData])
    const [componentIndex, setComponentIndex] = useState(0);
    // 监控列表的滚动事件
    const scroll = (e: any) => {
        let nodeList = componentList?.current?.querySelectorAll(".componentBox") || [];
        let scrollBox = componentList?.current?.getBoundingClientRect() || {top: 0};
        let nodeIds = Array.from(new Set(allRenderElements.map((item) => item.belongNodeId)));
        for(let i = 0;i < nodeList.length;i++){
            if(nodeList[i].children[0].getBoundingClientRect().top > scrollBox.top + 136){
                let componentIndex = nodeIds.indexOf(allRenderElements[i].belongNodeId);
                if(i > 0 && allRenderElements[i - 1].belongNodeId == allRenderElements[i].belongNodeId){
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
        let nodeIds = nodeList.map((item: any) => item.nodeId);
        let componentBoxes: any = componentList?.current?.querySelectorAll(".componentBox") || [];
        if(componentList && componentList.current){
            const target = componentBoxes[nodeIdsArr.indexOf(nodeIds[index])];
            if (target) componentList.current.scrollTop = (target.children[0]?.offsetTop || 136) - 136;
        }
    }
    const elementsByRegion = useMemo(() => {
        const result: Record<string, any[]> = { header: [], content: [], footer: [] };
        allRenderElements.forEach((item) => {
            const region = normalizeNodePresentation(nodeInfoMap[item.belongNodeId]?.presentation).region;
            if (result[region]) result[region].push(item);
        });
        return result;
    }, [allRenderElements, nodeInfoMap]);
    return (
        <div className={menuState ? 'content' : 'content w100'} id="page" style={{height: "calc(100% - 85px)", overflow: "auto", paddingBottom: elementsByRegion.footer.length ? 74 : 0}} ref={componentList} onScroll={scroll}>
            {/* 始终传递累加后的完整数组 */}
            {allRenderElements.length > 0 && <>
                <div className={processConfig.scrollMode === 'fixed-top' ? 'processFixedTop' : ''}>
                    {elementsByRegion.header.length > 0 && <NgapRender className="processHeader" elements={elementsByRegion.header} />}
                    {processConfig.navigator.enabled && nodeList.length > 0 && <TemplateNav title={processConfig.navigator.title} updateScroll={updateScroll} nodeList={nodeList} componentIndex={componentIndex} />}
                </div>
                <NgapRender className="componentList processContent" elements={elementsByRegion.content} />
                {elementsByRegion.footer.length > 0 && <div className="processFooter"><NgapRender elements={elementsByRegion.footer} /></div>}
                </>
            }
            {/* 无数据时的兜底提示（可选） */}
            {allRenderElements.length === 0 && <div style={{ color: '#999' }}>暂无渲染数据</div>}
        </div>
    );
};
export default ProcessPage;
