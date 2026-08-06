import React, { useState, useEffect, useRef } from 'react';
import { Input, Select, Button, Row, Col, Spin } from 'antd';
import { CommponentBeansItem } from './types';
import { publictData } from '@/utils/appMenuData';
import { crossApiUserInfo } from '@/stores/crossapiStore';
import dealPageData, { dealPageDataId } from '@/utils/dataToCanvas';
import { isLocalMockMode } from '@/mock/localMock';
import { GUIDED_MOCK_COMPONENTS } from '@/mock/guidedProcessMock';
import processDealPageData, { processDealDataId } from '../../processCanvasPage/utils/processDataToCanvas';
import { useAppContext } from '@/utils/AppProvider';
// 业务分类数据管理
import { BusinessData, businessDataListInfo } from '@/stores/businessCategoryStore';
import request from '@/utils/request';
import CollapsibleList from './collapsibleList';
import { mergeApis, updateApiConfig } from '../../../../../utils/dealApiGlobal';
import { apiListInfo } from '../../../../../stores/apiListStore';

import styles from './index.module.less';
type StringMap = {
    [key: string]: string;
};
export interface OptionItem {
    value: string;
    label: string;
    id: string;
}
interface ParentProps {
    // closeMoal: () => void;
    sceneType: string;
    appCategory: string;
}
interface SearchDataObj {
    componentName: string;
    serviceLink: string;
    levelFirst: string;
    componentLevel: string;
}

const AddComponentNode: React.FC<ParentProps> = ({ sceneType, appCategory }) => {
    // 获取用户信息
    const userInfo = crossApiUserInfo((state) => state.userInfo);
    // 获取业务分类数据
    const businessDataList = businessDataListInfo((state) => state.businessDataList);
    // 根据应用分类过滤
    const businessDataFifter = businessDataList.filter((item: BusinessData) => {
        return item.businessCategory === appCategory;
    });
    const businessTypeMap: StringMap = {}; // 业务分类map
    const businessTypeData: OptionItem[] = []; // 业务分类集合
    businessDataFifter.forEach((item: BusinessData) => {
        if (item.businessId) {
            businessTypeMap[item.businessId] = item.businessName;
            businessTypeData.push({
                value: item.businessId,
                label: item.businessName,
                id: item.businessId,
            });
        }
    });
    // 业务组件列表
    const [componentList, setComponentList] = useState<CommponentBeansItem[]>([]);

    // 业务组件列表源数据
    const [componentSourceData, setComponentSourceData] = useState<CommponentBeansItem[]>([]);

    // 业务组件列表查询表单数据
    const [searchData, setSearchData] = useState<SearchDataObj>({
        componentName: '',
        serviceLink: '123',
        levelFirst: '123',
        componentLevel: '123',
    });
    // 服务环节和适用范围数据
    const { appServiceLinkArr, appPlatLevelArr } = publictData;
    // 查询关键字
    const [nameKeyword, setNameKeyWord] = useState<string>('');
    // 一级分类
    const businessData = businessDataListInfo((state: any) => state.businessDataList);
    const businessLevelFirst = businessData
        .filter((item: any) => item.businessLevel == '1')
        .map((item: any) => ({ label: item.businessName, value: item.businessId }));

    // 初始化查询业务组件列表
    useEffect(() => {
        const sceneComponentParams = {
            provId: userInfo.provinceId,
            serviceTypeId: userInfo.serviceTypeId,
            dataType: '1',
            componentStatus: '1',
            componentCategory: appCategory,
            componentType: '',
        };
        const componentRequest = isLocalMockMode('guided')
            ? Promise.resolve({ beans: GUIDED_MOCK_COMPONENTS })
            : request.post('/appComponent/queryAppComponentList', { params: sceneComponentParams });
        componentRequest.then((businessComponentBeans: any) => {
            // 业务组件列表数据
            if (businessComponentBeans.beans && businessComponentBeans.beans.length > 0) {
                const newArray = businessComponentBeans.beans.map((item: any) => ({
                    ...item,
                    parentId: businessData.find((items: any) => items.businessId === item.businessId)?.parentId,
                }));
                const data: CommponentBeansItem[] = newArray;
                setComponentSourceData(data);
                setComponentList(data);
            }
        });
    }, []);

    // 获取业务组件配置信息
    const getBusinessComponent = (componentid: string) => {
        if (isLocalMockMode('guided')) {
            return Promise.resolve({ bean: GUIDED_MOCK_COMPONENTS.find((item) => item.id === componentid) });
        }
        return request.post('/appComponent/queryAppComponentInfo', {
            params: {
                serviceTypeId: userInfo.serviceTypeId,
                id: componentid,
            },
        });
    };
    const _state = useAppContext();
    const { pageStore } = _state;
    const addBussinessElement = pageStore((state: any) => state.addBussinessElement);
    // 添加组件内容
    const { nodeModelOpenType, nodeModelFlag, nodeModeTop, nodeModeLeft, setNodeModelState } = pageStore((state: any) => {
        return {
            nodeModelOpenType: state.nodeModelOpenType,
            nodeModelFlag: state.nodeModelFlag,
            nodeModeTop: state.nodeModeTop,
            nodeModeLeft: state.nodeModeLeft,
            setNodeModelState: state.setNodeModelState,
        };
    });

    const nodeStyle = {
        top: nodeModeTop,
        left: nodeModeLeft,
    };

    const variables = pageStore((state: any) => state?.page?.pageData?.variables || []);
    const addVariable = pageStore((state: any) => state.addVariable);
    const editVariable = pageStore((state: any) => state.editVariable);
    const setVariableData = pageStore((state: any) => state.setVariableData);
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
    // 选择组件时返回的组件信息
    const apisGlobal = pageStore((state: any) => state.page.pageData.apisGlobal);
    const apiOutParam = pageStore((state: any) => state.page.pageData.apiOutParam);
    const apiOutData = pageStore((state: any) => state.page.pageData.apiOutData);
    const updateApiGlobal = pageStore((state: any) => state.updateApiGlobal);
    const addApiOutParam = pageStore((state: any) => state.addApiOutParam);
    const editApiOutData = pageStore((state: any) => state.editApiOutData);
    const apiList = apiListInfo((state: any) => state.apiList);
    const checkComponent = async (commponentData: CommponentBeansItem) => {
        const nodes = await getBusinessComponent(commponentData.id + '');
        if (sceneType == 'base') {
            const { pageData } = dealPageData(nodes.bean);
            dealPageDataId(pageData);
            console.log(pageData);
            addBussinessElement(pageData);
            mergeVariable(pageData);
            // 获取新增api相关的出口参数和api出参
            updateApiConfig({
                api: mergeApis(apisGlobal, pageData, updateApiGlobal), // 合并api配置
                apiOutParam,
                addApiOutParam,
                apiOutData,
                editApiOutData,
                _state: _state,
                userInfo,
                apiList,
            });
        }

        if (sceneType == 'process') {
            const {pageData} = dealPageData(JSON.parse(JSON.stringify(nodes.bean)));
            dealPageDataId(pageData);
            pageData.componentName = nodes.bean.componentName;
            if (window.processAddBussinessNode) {
                window.processAddBussinessNode({
                    nodeType: 'business',
                    type: 'addNodeBlock',
                    componentData: pageData,
                    top: nodeModeTop,
                    left: nodeModeLeft,
                });
            }
        }
        // 并且关闭选择组件框
        setNodeModelState(false);
    };

    // 按业务分类的对象
    const businessClassify = (componentTreeList: CommponentBeansItem[]) => {
        const componentListMap: { [key: string]: CommponentBeansItem[] } = {};
        // 遍历业务组件列表
        componentTreeList.forEach((componentData: CommponentBeansItem) => {
            if (componentData.businessId) {
                if (componentListMap[componentData.businessId]) {
                    componentListMap[componentData.businessId].push(componentData);
                } else {
                    componentListMap[componentData.businessId] = [];
                    componentListMap[componentData.businessId].push(componentData);
                }
            }
        });
        return componentListMap;
    };

    // 渲染业务组件列表
    const randerComponentList = (businessId: string, componentList: CommponentBeansItem[]) => {
        const allMap = businessClassify(componentList);
        const componentData = allMap[businessId];
        return <CollapsibleList items={componentData} maxVisible={5} keywords={nameKeyword} checkComponent={checkComponent} />;
    };
    // 根据传递过来的组件列表增加业务分类组
    const randerBusinessTypeGroup = (componentList: CommponentBeansItem[]) => {
        const componentBusinessArr: string[] = [];
        return componentList.map(function (componentData, index) {
            if (componentData.businessId && componentBusinessArr.indexOf(componentData.businessId) == -1) {
                componentBusinessArr.push(componentData.businessId);
                const businessName = businessTypeMap[componentData.businessId];
                return (
                    <div className={styles.businessTypeDiv} key={index}>
                        <div className={styles.businessName}>{businessName}</div>
                        <div className={styles.businessTypeNameCont}>{randerComponentList(componentData.businessId, componentList)}</div>
                    </div>
                );
            }
        });
    };
    // 输入框修改
    const componentNameChange = (e: { target: { name: string; value: string } }) => {
        const { name, value } = e.target;
        changeStateFn(name, value);
    };
    const serviceLinkChange = (value: string | number | string[] | number[]) => {
        changeStateFn('serviceLink', value);
    };
    const levelFirstChange = (value: string | number | string[] | number[]) => {
        changeStateFn('levelFirst', value);
    };
    const componentLevelChange = (value: string | number | string[] | number[]) => {
        changeStateFn('componentLevel', value);
    };
    // 表单数据修改
    const changeStateFn = (key: string, value: string | number | string[] | number[]) => {
        setSearchData((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    // 查询列表
    const queryComponentList = () => {
        const searchRes = [];
        // 循环找出满足条件的结果
        for (let i = 0; i < componentSourceData.length; i++) {
            const componentInfo = componentSourceData[i];
            if (
                componentInfo.componentName &&
                componentInfo.componentName.indexOf(searchData.componentName) > -1 &&
                componentInfo.serviceLink.indexOf(searchData.serviceLink !== '123' ? searchData.serviceLink : '') > -1 &&
                componentInfo.parentId &&
                componentInfo.parentId.indexOf(searchData.levelFirst !== '123' ? searchData.levelFirst : '') > -1 &&
                componentInfo.componentLevel &&
                componentInfo.componentLevel.indexOf(searchData.componentLevel !== '123' ? searchData.componentLevel : '') > -1
            ) {
                searchRes.push(componentInfo);
            }
        }
        // 用于标红的关键字查询时触发
        setNameKeyWord(searchData.componentName);
        // 查询业务组件
        setComponentList(searchRes);
    };

    // 重置列表
    const resetComponentList = () => {
        setSearchData({
            componentName: '',
            serviceLink: '123',
            levelFirst: '123',
            componentLevel: '123',
        });
    };

    return (
        nodeModelFlag && (
            <div id="addNodeBlock" className={styles.addNodeBlock} style={nodeStyle}>
                <div className={styles.searchNodeDiv}>
                    <div className={styles.searchTitle}>
                        <div className={styles.titleName}>选择组件</div>
                        {nodeModelOpenType != 'auto' && (
                            <div
                                className={styles.closeIcon}
                                onClick={() => {
                                    setNodeModelState(false);
                                }}
                            ></div>
                        )}
                    </div>
                    <div className={styles.searchHome}>
                        <div className={styles.searchCont}>
                            <div className={styles.configItem}>
                                <label>组件名称</label>
                                <div className={styles.inputItem}>
                                    <Input
                                        className={styles.componentNameIpt}
                                        name="componentName"
                                        value={searchData.componentName}
                                        placeholder="请输入"
                                        onChange={componentNameChange}
                                    />
                                </div>
                            </div>
                            {/* <div className={[styles.configItem, styles.servieceCont].join(' ')}>
                                <label>服务环节</label>
                                <div className={styles.inputItem}>
                                    <Select
                                        className={styles.serviceLinkSelect}
                                        value={searchData.serviceLink}
                                        placeholder="请选择"
                                        options={[
                                            {
                                                label: '请选择',
                                                value: '123',
                                                id: '123',
                                            },
                                        ].concat(appServiceLinkArr)}
                                        onChange={serviceLinkChange}
                                    ></Select>
                                </div>
                            </div> */}
                            <div className={[styles.configItem, styles.servieceCont].join(' ')}>
                                <label>一级分类</label>
                                <div className={styles.inputItem}>
                                    <Select
                                        className={styles.serviceLinkSelect}
                                        value={searchData.levelFirst}
                                        placeholder="请选择"
                                        options={[
                                            {
                                                label: '请选择',
                                                value: '123',
                                                id: '123',
                                            },
                                        ].concat(businessLevelFirst)}
                                        onChange={levelFirstChange}
                                    ></Select>
                                </div>
                            </div>
                            <div className={styles.configItem}>
                                <label>适用范围</label>
                                <div className={styles.inputItem}>
                                    <Select
                                        className={styles.componentLevelSelect}
                                        value={searchData.componentLevel}
                                        placeholder="请选择"
                                        options={[
                                            {
                                                label: '请选择',
                                                value: '123',
                                                id: '123',
                                            },
                                        ].concat(appPlatLevelArr)}
                                        onChange={componentLevelChange}
                                    ></Select>
                                </div>
                            </div>
                            <div className={[styles.configItem, styles.searchBtn].join(' ')}>
                                <div
                                    className={styles.searchReset}
                                    onClick={() => {
                                        resetComponentList();
                                    }}
                                >
                                    重 置
                                </div>
                                <div
                                    className={styles.searchQuery}
                                    onClick={() => {
                                        queryComponentList();
                                    }}
                                >
                                    查 询
                                </div>
                            </div>
                        </div>
                        <div className={styles.searchResCont}>
                            <div className={styles.searchNodeCont}>{randerBusinessTypeGroup(componentList)}</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    );
};

export default AddComponentNode;
