import React, { Component, useEffect, useRef, useState, createRef } from 'react';
import SearchCont from './searchCont';
import SearchResultModuleList from './searchResultModuleList';
import SearchResultModuleCard from './searchResultModuleCard';
import ComponentTemplateChoose from './componentTemplateChoose';
import CanvasEditingComponent from '@/pages/canvasEditingComponent/index';
import { crossApiUserInfo } from '@/stores/crossapiStore';
import {
    ComponentListSearchData,
    SelectData,
    BusinessData,
    SearchCardHandle,
    SearchListHandle,
    ModuleSelectHandle,
    ComponentTempData,
} from './businessComponentMangeTypes';

// 业务分类数据管理
import { businessDataListInfo } from '@/stores/businessCategoryStore';

import './index.less';

const BusinessComponentManage: React.FC = () => {
    // 获取用户信息
    const userInfo = crossApiUserInfo((state) => state.userInfo);
    // 获取业务分类数据
    const businessDataList = businessDataListInfo((state) => state.businessDataList);

    const listTypeArr: SelectData[] = [
        { name: '卡片', value: 'card' },
        { name: '列表', value: 'list' },
    ];
    const [businessData, setBusinessData] = useState<BusinessData[]>(businessDataList);
    const [formData, setFormData] = useState<ComponentListSearchData>({
        provId: userInfo.provinceId,
        serviceTypeId: userInfo.serviceTypeId,
        componentCategory: '1',
        businessId: '',
        componentName: '',
        componentDesc: '',
        belongModule: '',
        serviceLink: '',
        componentLevel: '',
        dataType: '1',
    });
    const formDataRef = useRef(formData);
    const [listType, setListType] = useState<string>('card');
    const [baseInfo, setBaseInfo] = useState<ComponentTempData>({
        provId: userInfo.provinceId,
        serviceTypeId: userInfo.serviceTypeId,
        staffId: userInfo.staffId,
        componentName: '', // 模板名称
        componentDesc: '', // 业务组件描述
        belongModule: '', //归属模块
        businessId: '', // 业务分类
        serviceLink: '', // 服务环节
        componentCategory: '', //模板类别
        componentLevel: '', //适用范围
        dataType: '1',
        id: '',
        componentPicture: '', //组件缩略图
    });
    // 创建 ref 引用子组件
    const listResultRef = createRef<SearchListHandle>(); // 主页面列表选项
    const cardResultRef = createRef<SearchCardHandle>(); // 主页面卡片选项
    const moduleSelectRef = createRef<ModuleSelectHandle>(); // 业务组件模板选项

    const resetCardResultRef = () => {
        if (cardResultRef.current) {
            cardResultRef.current.resetHasMore();
        }
    };
    const resetCardSearch = () => {
        if (cardResultRef.current) {
            cardResultRef.current.queryList();
        }
    };

    const resetChildData = () => {
        if (listResultRef.current) {
            listResultRef.current.queryList();
        }
    };

    const [pagePos, setPagePos] = useState<string>('0');

    // 监听业务分类列表变化修改值
    useEffect(() => {
        setBusinessData(businessDataList);
    }, [businessDataList]);

    // 首次进入页面自动查询
    useEffect(() => {
        formDataRef.current = formData;
    }, [formData]);
    // 触发查询事件
    const handleQuery = (data: ComponentListSearchData) => {
        setFormData({
            ...data,
        });
        // resetCardSearch();
        // resetChildData();
    };

    const handleReset = () => {
        resetCardResultRef();
    };

    // 列表类型
    const randerListTypeItems = (data: SelectData[]) => {
        return data.map((item: SelectData) => {
            const baseClass = 'listType'; // 基础类名
            const activeClass = item.value === listType ? 'tabActive' : '';
            return (
                <div
                    className={`${baseClass} ${activeClass}`}
                    key={item.value}
                    onClick={() => {
                        handleListTypeClick(item);
                    }}
                >
                    {item.name}
                </div>
            );
        });
    };
    const handleListTypeClick = (item: SelectData) => {
        setListType(item.value);
    };
    const randerListCont = () => {
        if (listType === 'card') {
            return <SearchResultModuleCard ref={cardResultRef} formData={formData} BusinessListData={businessData} jumpEditorPage={jumpEditorPage} />;
        } else {
            return <SearchResultModuleList ref={listResultRef} formData={formData} BusinessListData={businessData} jumpEditorPage={jumpEditorPage} />;
        }
    };

    // 新增跳转页面
    const addComponentEvent = (pos: string) => {
        setPagePos(pos);
        // 保存/编辑返回，保存查询条件，重新进行一次查询
        if (pos == '0') {
            if (listType === 'card') {
                cardResultRef.current && cardResultRef.current.queryList();
            } else {
                listResultRef.current && listResultRef.current.queryList();
            }
        }
    };
    // 跳转到画布
    const jumpEditorPage = (pos: string, data: ComponentTempData) => {
        setBaseInfo(data);
        setPagePos(pos);
    };

    //组件编辑保存
    const jumpEditorPageBUs = (data: ComponentTempData) => {
        setBaseInfo(data);
    };

    return (
        <div className="businessComponentManagementBox">
            <div className={`businessComponentMainPage`}>
                <SearchCont onQuery={handleQuery} onReset={handleReset} BusinessData={businessData} userInfo={userInfo} />
                <div className={`listTitle`}>
                    <div className={`listName`}> 业务组件列表</div>
                    <div className={`componentListTab`}>{randerListTypeItems(listTypeArr)}</div>
                    <button
                        className={`sceneBtn`}
                        onClick={() => {
                            addComponentEvent('1');
                        }}
                    >
                        新增业务组件
                    </button>
                </div>
                <div className={`businessComponentList`}>{randerListCont()}</div>
            </div>
            {pagePos === '1' && (
                <ComponentTemplateChoose
                    ref={moduleSelectRef}
                    onBack={addComponentEvent}
                    onConfirmEvent={jumpEditorPage}
                    businessListData={businessData}
                />
            )}
            {pagePos === '2' && (
                <CanvasEditingComponent
                    config={baseInfo}
                    id={baseInfo && baseInfo.id ? baseInfo.id : ''}
                    backComponentPage={() => {
                        addComponentEvent('0');
                    }}
                    confiEventbusTem={jumpEditorPageBUs}
                />
            )}
        </div>
    );
};
export default BusinessComponentManage;
