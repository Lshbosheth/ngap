import React, { useEffect, useState, useRef, useCallback } from 'react';
import styles from './index.module.less';
import request from '@/utils/request';
import { Splitter } from 'antd';

import CanvasTop from './components/CanvasTop';
import BottomTools from './components/bottomTools';
import CanvasRobot from './components/canvasRobot';
import ComponentPanelAO from './components/ComponentPanelAO';
import ProcessCanvasPage from './processCanvasPage';
import BaseCanvasPage from './baseCanvasPage';
import CardCanvasPage from './cardCanvasPage';
import { menu, componentModel } from '@/stores/menuStore';
import { crossApiUserInfo } from '@/stores/crossapiStore';
import SpinLoading from '@/components/SpinLoading';
import { AppProvider } from '@/utils/AppProvider';

import { AppTemptypeData } from '../appOrchestrationTypes';
import AddComponentNode from '@/pages/applicationOrchestration/pageCanvas/components/addComponentNode';
import { isLocalMockMode } from '@/mock/localMock';
import { GUIDED_MOCK_BUSINESS_TYPES } from '@/mock/guidedProcessMock';
import { businessDataListInfo } from '@/stores/businessCategoryStore';

// 业务分类数据项类型
interface BusinessTypeItem {
    businessId: string | number; // 业务分类ID
    businessName: string; // 业务分类名称
    [key: string]: any; // 扩展字段
}

// 场景组件数据项类型
interface SceneComponentItem {
    id: string | number; // ID
    [key: string]: any; // 扩展字段
}

// 组件外部配置参数类型
interface BusinessComponentOptions {
    provinceId: string | number; //省份编码
    serviceTypeId: string | number; //业务系统编码
    appCategory: string; //应用类别 1：生产应用 2：运营应用
    defaultConfigData: any; //应用配置信息
}

interface SearchFormProps {
    baseConfig: any;
    pageCase: string;
    appTypeList: AppTemptypeData[];
    backApplyPage: (state: string) => void;
    ispreview?: string;
    onOpenSubmitReviewDrawer?: () => void; // 打开提交审核抽屉的回调
    onReloadPageData?: (data: any) => void; // 用选中的数据重新加载编辑态页面的回调
    currentApp?:any
    isApplicationList?: boolean; // 标识是否为应用列表页面
    isFromApplicationList?: boolean; // 标识是否从应用列表页面跳转
}

interface Page2Ref {
    processCanvasData: () => void; // 要暴露的方法
}

interface ComponentPanelRef {
    getRecordedComponentIds: () => string[]; // 获取已记录的组件ID的方法
}

interface PageCanvasRef {
    submitReview: (pubSubInfo?: any) => Promise<boolean>; // 执行提交审核的方法
}

/**
 * 获取业务分类数据
 * @param options 外部参数
 * @returns Promise<BusinessTypeItem[]> 合并默认数据后的业务分类列表
 */
const getBusinessTypeData = async (options: BusinessComponentOptions): Promise<BusinessTypeItem[]> => {
    const params = {
        provId: '',
        businessCategory: options.appCategory,
    };

    try {
        // 调用请求获取业务分类信息
        const result = await request.post('/appComponentBusiness/queryComponentBusinessList', { params: params });
        // 有数据则拼接默认项，无数据则返回空数组
        if (result && result.beans && result.beans.length > 0) {
            return result.beans as BusinessTypeItem[];
        }
        return [];
    } catch (error) {
        // 请求失败仍resolve，返回错误信息对象
        return Promise.resolve({ error: '获取业务分类信息错误！' } as unknown as BusinessTypeItem[]);
    }
};

/**
 * 获取场景组件列表
 * @param options 外部参数
 * @returns Promise<SceneComponentItem[]> 场景组件列表
 */
const getSceneComponentList = async (options: BusinessComponentOptions): Promise<SceneComponentItem[]> => {
    const sceneComponentParams = {
        provId: options.provinceId,
        serviceTypeId: options.serviceTypeId,
        dataType: '1',
        componentStatus: 1,
        componentCategory: options.appCategory,
        componentType: '',
    };

    try {
        // 调用请求获取业务组件列表
        const result = await request.post('/appComponent/queryAppComponentList', { params: sceneComponentParams });
        // 有数据返回beans，无数据返回空数组
        if (result && result.beans && result.beans.length > 0) {
            return result.beans as SceneComponentItem[];
        }
        return [];
    } catch (error) {
        // 请求失败无特殊处理，默认返回空数组
        return [];
    }
};

/**
 * 判断是否需要调用接口查询应用配置数据（编辑、复制、和模板新增）
 * @param componentList 场景组件列表
 * @returns Promise<void> 初始化完成后resolve
 */
const initComponentData = async (componentList: SceneComponentItem[]): Promise<void> => {
    return new Promise((resolve) => {
        resolve();
    });
};

// 接收组件属性，强类型约束外部传参
const PageCanvas = React.forwardRef<PageCanvasRef, SearchFormProps>(({ pageCase, appTypeList, backApplyPage, baseConfig, ispreview, onOpenSubmitReviewDrawer, onReloadPageData, currentApp, isApplicationList, isFromApplicationList}, ref) => {
    const guidedMock = isLocalMockMode('guided');
    const setBusinessDataList = businessDataListInfo((state: any) => state.setBusinessDataList);
    useEffect(() => {
        if (guidedMock) setBusinessDataList(GUIDED_MOCK_BUSINESS_TYPES);
    }, [guidedMock, setBusinessDataList]);
    const initLeftSize = 260
    //左侧导航栏展开收起状态
    const menuState = menu((state) => state.menuState);
    const [sizes, setSizes] = useState<(number | string)[]>([ initLeftSize, window.innerWidth -  initLeftSize - (menuState ? 180 : 0), 0]);
    const showComponent = componentModel((state) => state.showComponent);
    const [mode, setMode] = useState('edit');
    useEffect(() => {
        if (mode === 'preview') {
            setSizes([0, window.innerWidth - (menuState ? 180 : 0), 0]);
        } else {
            setSizes([showComponent ?  initLeftSize : 0, window.innerWidth - (showComponent ?  initLeftSize : 0) - (menuState ? 180 : 0), 0]);
        }
    }, [mode, menuState, showComponent]);
    const _setMode = (state: string) => {
        if(state == "preview"){
            handleTriggerPage2Method();
        }
        setMode(state);
    };
    // 获取用户信息
    const userInfo = crossApiUserInfo((state) => state.userInfo);
    // 接收组件属性，强类型约束外部传参
    const [options, setOptions] = useState<BusinessComponentOptions>({
        provinceId: userInfo.provinceId, //省份编码
        serviceTypeId: userInfo.serviceTypeId, //业务系统编码
        appCategory: baseConfig.config.appCategory, //应用类别 1：生产应用 2：运营应用
        defaultConfigData: baseConfig.config, //应用配置信息
    });

    // 加载状态
    const [loading, setLoading] = useState<boolean>(true);

    const { provinceId, serviceTypeId, appCategory, defaultConfigData } = options; //解构参数
    // 保存Page2的ref，用于调用其方法
    const page2Ref = useRef<Page2Ref>(null);
    // 保存CanvasTop的ref，用于调用其方法
    const canvasTopRef = useRef<any>(null);
    // 保存ComponentPanelAO的ref，用于获取已记录的组件ID
    const componentPanelRef = useRef<ComponentPanelRef>(null);
    // 保存内容容器的ref，用于历史保存抽屉的getContainer
    const contentContainerRef = useRef<HTMLDivElement>(null);

    // 暴露给父组件的方法
    React.useImperativeHandle(ref, () => ({
        submitReview: async (pubSubInfo?: any) => {
            if (canvasTopRef.current && canvasTopRef.current.submitReviewAction) {
                return await canvasTopRef.current.submitReviewAction(pubSubInfo);
            }
            return false;
        },
        getRecordedComponentIds: () => {
            return componentPanelRef.current?.getRecordedComponentIds() || [];
        }
    }));
    // 父组件接收Page1的触发，调用Page2的方法
    const handleTriggerPage2Method = (): any => {
        if (page2Ref.current) {
            // 调用Page2暴露的方法
            return page2Ref.current.processCanvasData();
        }
    };
    useEffect(() => {
        //应用列表跳转预览页面
        if (ispreview === 'Yes') {
            setMode('preview');
            const aaElement = document.getElementById('editContentDiv');
            if (aaElement) {
                // 动态设置样式
                aaElement.style.top = '0';
                aaElement.style.zIndex = '2';
            }

            const targetParent = document.querySelector('div[data-node-key="applicationList"]') as HTMLDivElement;
            if (targetParent) {
                const firstChildDiv = targetParent.querySelector('div:first-child');
                if (firstChildDiv) {
                    firstChildDiv.textContent = baseConfig.config.appName;
                }
            }
        }

        const fetchAndProcessData = async () => {
            try {
                setLoading(true);
                if (guidedMock) return;
                // 实现两个请求**并行执行**
                const [businessTypeData, componentData] = await Promise.all([
                    getBusinessTypeData({ provinceId, serviceTypeId, appCategory, defaultConfigData }),
                    getSceneComponentList({ provinceId, serviceTypeId, appCategory, defaultConfigData }),
                ]);

                // 构建组件ID映射表
                const componentMap = componentData.reduce((map, item) => {
                    map[item.id] = item; // id作为key，组件数据作为value
                    return map;
                }, {} as Record<string | number, SceneComponentItem>);

                if (options.defaultConfigData && (options.defaultConfigData.id || options.defaultConfigData.copyId)) {
                    const appComponentParams = {
                        id: defaultConfigData.id,
                        provId: provinceId,
                        serviceTypeId: serviceTypeId,
                    };
                    // 调用原项目请求工具，获取场景信息
                    const result = await request.post('/appComponent/queryAppComponentList', { params: appComponentParams });

                    // 接口成功（returnCode == '0'）才处理数据
                    if (result && result.returnCode === '0' && result.bean) {
                        // 初始化组件数据后再显示页面
                        await initComponentData(result.bean.componentList);
                    }
                }
            } finally {
                // 请求成功/失败，结束加载状态
                setLoading(false);
            }
        };

        // 执行异步数据请求与处理
        fetchAndProcessData();

        // 组件卸载时清空状态（防止内存泄漏）
        return () => {};
        // options变化时重新请求数据
    }, [guidedMock]);
    const [canvasTopState, setCanvasTopState] = useState(false);
    const pageLoaded = useCallback(() => {
        setCanvasTopState(true);
    }, [])
    if (loading) {
        return <div className="business-component-loading">数据加载中...</div>;
    }
    // 模式切换，会导致子组件重新渲染
    return (
        <AppProvider pageType="YYBPZPS" config={baseConfig} mode={mode} setMode={_setMode}>
            <div ref={contentContainerRef} className={menuState ? 'content' : 'content w100'}>
                {/* 顶部工具栏 */}
                <div className={styles.topbar}>
                    {canvasTopState && <CanvasTop
                        ref={canvasTopRef}
                        currentApp={currentApp}
                        pageCase={pageCase}
                        appTypeList={appTypeList}
                        backApplyPage={backApplyPage}
                        onTriggerPage2Method={handleTriggerPage2Method}
                        onOpenSubmitReviewDrawer={onOpenSubmitReviewDrawer || (() => {})}
                        onGetRecordedComponentIds={() => componentPanelRef.current?.getRecordedComponentIds() || []}
                        onReloadPageData={onReloadPageData}
                        isApplicationList={isApplicationList}
                        isFromApplicationList={isFromApplicationList}
                        contentContainerRef={contentContainerRef}
                    />}
                </div>
                {/* 主编辑区 */}
                <div className={styles.editContent} id="editContentDiv">
                    {/* 左侧组件 */}
                    <Splitter onResize={setSizes}>
                        <Splitter.Panel min={200} max={370}
                            size={sizes[0]} className={showComponent ? '' : 'closeComponentSplitter'}>
                            <React.Suspense fallback={<SpinLoading />}>
                                {/*左侧业务组件树 */}
                                <ComponentPanelAO ref={componentPanelRef} />
                            </React.Suspense>
                        </Splitter.Panel>

                        <Splitter.Panel size={sizes[1]} className={`${styles['designer-editor']} designerBox ${pageCase === '1' ? (isFromApplicationList ? 'isFromApplicationOrchestrationBox' : 'applicationOrchestrationBox') : pageCase === '2' ? 'modeManagementBox' : ''}`}>
                            <React.Suspense fallback={<SpinLoading />}>
                                {/* 步骤引导页面 */}
                                {baseConfig.config.sceneType === 'process' && <ProcessCanvasPage pageLoaded={pageLoaded} ref={page2Ref} />}
                                {/* 组装式页面 */}
                                {baseConfig.config.sceneType === 'base' && <BaseCanvasPage pageLoaded={pageLoaded} />}
                                {/* 信息卡片 */}
                                {baseConfig.config.sceneType === 'card' && <CardCanvasPage />}
                                {/*选择组件弹窗*/}
                                <AddComponentNode sceneType={baseConfig.config.sceneType} appCategory={appCategory} />
                            </React.Suspense>
                        </Splitter.Panel>
                    </Splitter>
                </div>
                {/* 机器人智能助手 */}
                <CanvasRobot />
            </div>
        </AppProvider>
    );
});

// 导出组件，供其他模块引入使用
PageCanvas.displayName = 'PageCanvas';
export default PageCanvas;
