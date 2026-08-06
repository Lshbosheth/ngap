import React, { lazy, useEffect, useState } from 'react';
import { menu, componentModel } from '@/stores/menuStore';
import { useAppContext } from '@/utils/AppProvider';
import { useShallow } from 'zustand/react/shallow';
import dealPageData, { dealPageDataId } from '@/utils/dataToCanvas';
const Editor = lazy(() => import('@/pages/editor/editor'));
import { message } from '@/utils/AntdGlobal';
import api from '@/api/page';
import PageConfig from '@/packages/Page/Schema';
import request from '@/utils/request';
import style from './index.module.less';
import Page from '@/packages/Page/Page';
import { updateApiConfig } from '../../../utils/dealApiGlobal';
import { apiListInfo } from '../../../stores/apiListStore';
import { crossApiUserInfo } from '../../../stores/crossapiStore';
/**
 * 编辑器布局组件
 */
const BaseCanvasPreview = () => {
    const _state = useAppContext();
    const { pageStore, pageType, mode } = _state;
    const { clearPageInfo, componentId, config, savePageInfo, updateEditState, elements, setSelectedElement, addApiOutParam, editApiOutData, pageConfig } =
        pageStore(
            useShallow((state: any) => ({
                clearPageInfo: state.clearPageInfo,
                componentId: state.id,
                savePageInfo: state.savePageInfo,
                elements: state?.page?.pageData?.elements || [],
                updateEditState: state.updateEditState,
                config: state.config,
                pageConfig: state.page?.pageData?.config || {},
                setSelectedElement: state.setSelectedElement,
                addApiOutParam: state.addApiOutParam,
                editApiOutData: state.editApiOutData,
            }))
        );
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const apiList = apiListInfo((state: any) => state.apiList);
    useEffect(() => {
        async function fetchData() {
            clearPageInfo();
            if (!componentId) {
                setLoaded(true);
                return;
            }
            setLoaded(false);
            let res: any;
            if (pageType.split('-')[0] == 'yy') {
                // 应用编排
                const params = {
                    provId: config.provId,
                    serviceTypeId: config.serviceTypeId,
                    id: componentId,
                };
                res = await request.post('/app/queryAppAndNodeInfo', { params: params });
                res = res.bean;
            } else {
                res = await api.getPageDetail({ id: componentId, serviceTypeId: config.serviceTypeId });
            }
            let pageData: any = {};
            let _res;
            try {
                _res = dealPageData(res);
                pageData = _res.pageData || { config: PageConfig.config };
                // 合并页面事件定义列表（用于显示在事件配置面板）
                // 只有应用画布(pageType == 'yy-base')才展示初始化事件
                if (pageType == 'yy-base') {
                    const backendEvents = _res.pageData?.events;
                    if (backendEvents && backendEvents.length > 0) {
                        pageData.events = backendEvents;
                    } else if (PageConfig.events && PageConfig.events.length > 0) {
                        pageData.events = PageConfig.events;
                    }
                } else {
                    // 业务组件画布不展示初始化事件
                    pageData.events = [];
                }
                // 确保 pageData.config.events 存在（用于存储用户配置的事件行为）
                if (!pageData.config) {
                    pageData.config = PageConfig.config;
                }
                if (!pageData.config.events) {
                    pageData.config.events = [];
                }
                updateApiConfig({
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
            setTimeout(() => {
                setLoaded(true);
                updateEditState(false);
            }, 1000);
        }
        fetchData();
        return () => {
            setSelectedElement(undefined);
        };
    }, [componentId]);
    const [loaded, setLoaded] = useState(false);
    // 模式切换，会导致子组件重新渲染
    return (
        <div className={style.preview}>
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
        </div>
    );
};

export default BaseCanvasPreview;
