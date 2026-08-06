import React, { useEffect, useRef, useState, useCallback } from 'react';

import { AppTemptypeData, OrchestrationFormData, AppModuleItem } from './appOrchestrationTypes';
import OrchestrationFrom from './orchestrationFrom';
import AppTempCont from './appTempCont';
import request from '../../utils/request';
import { objectToFormData } from '../../utils/objectToFormData'; // 对象转 FormData 工具函数
import { menu } from '@/stores/menuStore';
import { crossApiUserInfo } from '@/stores/crossapiStore';
import PageCanvas from '@/pages/applicationOrchestration/pageCanvas';
import { Button } from 'antd';
import styles from './index.module.less';
import SubmitReviewDrawer from '../applicationList/SubmitReviewDrawer';
import { isLocalMockMode } from '@/mock/localMock';
import { GUIDED_MOCK_APP_TYPES, GUIDED_MOCK_BASE_CONFIG } from '@/mock/guidedProcessMock';
import { appTypeListInfo } from '@/stores/appTypeListStore';

interface LoadData {
    appTypeIds: string;
    startNum: number;
    pageNum: number;
    appCategory: string;
    sceneType: string;
    queryType: string;
}

interface AppTempForm {
    provId: string;
    appCategory: string;
    appTypeIds: string;
    sceneType: string;
    dataType: string;
    limit: number;
}
interface ChildProps {
    onCancel: () => void;
    showButton: boolean;
    isFromApplicationList?: boolean;
}
const Page: React.FC<ChildProps> = ({ onCancel, showButton, isFromApplicationList }) => {
    const guidedMock = isLocalMockMode('guided');
    // 触发查询事件
    const searchItem = (values: OrchestrationFormData) => {
        setAppModuleData([]);
        setHasMore(true);
        setLoading(false);
        const appTypeIdList = [values.appTypeIds];
        getChildIdList(values.appTypeIds, appTypeIdList);

        loadMoreData({
            startNum: 0,
            pageNum: 1,
            appCategory: values.appCategory,
            appTypeIds: values.appTypeIds === '-1' ? '' : appTypeIdList.join(','),
            queryType: '1',
            sceneType: values.appCategory === '2' ? 'base' : values.sceneType,
        });
        setAppTempForm({
            ...appTempForm,
            appCategory: values.appCategory,
            appTypeIds: values.appTypeIds === '-1' ? '' : values.appTypeIds,
            sceneType: values.appCategory === '2' ? 'base' : values.sceneType,
        });
    };
    // 根据ID查找数据
    const getChildIdList = (appTypeId: string, result: string[]) => {
        for (const item of appTypeList) {
            if (item.pId == appTypeId) {
                result.push(item.appTypeId);
                getChildIdList(item.appTypeId, result);
            }
        }
    };
    // 获取用户信息
    const userInfo = crossApiUserInfo((state) => state.userInfo);
    // 应用分类数据
    // let appTemplateTabs: AppTemptypeData[] = [];
    // let appTypeList: AppTemptypeData[] = [];
    const [appTypeList, setAppTypeList] = useState<AppTemptypeData[]>([]);
    const [appTemplateTabs, setAppTemplateTabs] = useState<AppTemptypeData[]>([]);
    const setGlobalAppTypeList = appTypeListInfo((state: any) => state.setAppTypeList);

    const [appModuleData, setAppModuleData] = useState<AppModuleItem[]>([]);
    const [appTempForm, setAppTempForm] = useState<AppTempForm>({
        provId: userInfo.provinceId,
        appCategory: '1',
        appTypeIds: '-1',
        sceneType: 'base',
        dataType: '2',
        limit: 9,
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [start, setStart] = useState<number>(0);
    const [limit, setLimit] = useState<number>(9);
    const [totalPage, setTotalpage] = useState<number>(0);
    const listRef = useRef<HTMLDivElement>(null);

    // 模拟从API获取选项数据
    useEffect(() => {
        if (guidedMock) {
            setConfig(GUIDED_MOCK_BASE_CONFIG);
            setEditCanvas('open');
            setAppTypeList(GUIDED_MOCK_APP_TYPES);
            setGlobalAppTypeList(GUIDED_MOCK_APP_TYPES.map((item) => ({ ...item })) as any);
            return;
        }
        const fetchOptions = async () => {
            try {
                request
                    .post('/appType/queryAppTypeList', {})
                    .then((res) => {
                        const appTypeListBeans = res.beans;
                        setAppTypeList((pev) => {
                            return appTypeListBeans.map((item: AppTemptypeData) => {
                                return {
                                    appTypeCategory: item.appTypeCategory,
                                    appTypeId: item.appTypeId,
                                    appTypeName: item.appTypeName,
                                    pId: item.pId,
                                    typeLevel: item.typeLevel,
                                };
                            });
                        });
                        setAppTemplateTabs((pev) => {
                            return appTypeListBeans.filter((item: AppTemptypeData) => {
                                if (item.typeLevel == '1') {
                                    return {
                                        appTypeCategory: item.appTypeCategory,
                                        appTypeId: item.appTypeId,
                                        appTypeName: item.appTypeName,
                                        pId: item.pId,
                                        typeLevel: item.typeLevel,
                                    };
                                }
                            });
                        });
                    })
                    .catch((err) => {});
            } catch (error) {
                console.error('获取选项数据失败:', error);
            } finally {
                //
            }
        };
        fetchOptions();
        // loadMoreData({
        //     startNum: 0,
        //     pageNum: 1,
        //     appCategory: appTempForm.appCategory,
        //     appTypeIds: appTempForm.appTypeIds,
        //     queryType: '1',
        //     sceneType: appTempForm.sceneType,
        // });
    }, [guidedMock, setGlobalAppTypeList]);

    // 请求应用编排页面列表数据
    const fetchData = async (searchCurrentData: OrchestrationFormData, pageNum: number): Promise<AppModuleItem[]> => {
        return new Promise((resolve) => {
            request.post('/app/queryAppList', objectToFormData(searchCurrentData)).then((appInfoList) => {
                // 业务组件列表数据
                const data: AppModuleItem[] = appInfoList.beans;
                setTotalpage(Math.ceil(appInfoList.bean.total / limit));
                setStart(limit * pageNum);
                setPage(pageNum + 1);

                // 请求次数
                resolve(data);
            });
        });
    };

    // 加载数据
    const loadMoreData = useCallback(
        async (loadData: LoadData) => {
            if (loading || !hasMore) return;

            setLoading(true);
            try {
                const searchListData = {
                    ...appTempForm,
                    sceneType: loadData.sceneType,
                    appTypeIds: loadData.appTypeIds !== '-1' ? loadData.appTypeIds : '',
                    appCategory: loadData.appCategory,
                    page: loadData.pageNum,
                    start: loadData.startNum,
                };
                const newData = await fetchData(searchListData, loadData.pageNum);
                if (loadData.queryType === '1') {
                    if (newData.length === 0) {
                        setHasMore(true);
                    }
                    setAppModuleData((prevData) => [...prevData, ...newData]);
                } else {
                    setAppModuleData(newData);
                }
            } catch (error) {
                console.error('数据加载失败:', error);
            } finally {
                setLoading(false);
            }
        },
        [loading, hasMore, page],
    );
    // 检查是否需要加载更多
    const checkIfNeedLoadMore = useCallback(() => {
        if (!listRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = listRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 10 && !loading && hasMore) {
            loadMoreData({
                startNum: start,
                pageNum: page,
                appCategory: appTempForm.appCategory,
                appTypeIds: appTempForm.appTypeIds,
                queryType: '1',
                sceneType: appTempForm.sceneType,
            });
        }
    }, [loading, hasMore, loadMoreData]);

    // 监听滚动事件
    useEffect(() => {
        const listElement = listRef.current;
        if (!listElement) return;

        listElement.addEventListener('scroll', checkIfNeedLoadMore);
        return () => {
            listElement.removeEventListener('scroll', checkIfNeedLoadMore);
        };
    }, [checkIfNeedLoadMore]);
    const [updateConfig, setConfig] = useState({});
    const [editCanvas, setEditCanvas] = useState('close');

    // 提交审核抽屉相关状态
    const [submitReviewDrawerVisible, setSubmitReviewDrawerVisible] = useState(false);
    const pageCanvasRef = useRef<any>(null);

    // 打开提交审核抽屉
    const handleOpenSubmitReviewDrawer = () => {
        setSubmitReviewDrawerVisible(true);
    };

    // 关闭提交审核抽屉
    const handleCloseSubmitReviewDrawer = () => {
        setSubmitReviewDrawerVisible(false);
    };

    // 处理抽屉中的提交操作
    const handleSubmitReview = async (pubSubInfo: any) => {
        if (pageCanvasRef.current && pageCanvasRef.current.submitReview) {
            const success = await pageCanvasRef.current.submitReview(pubSubInfo);
            if (success) {
                handleCloseSubmitReviewDrawer();
                onCancel();
            }
            return success;
        }
        return false;
    };

    const openMenu: any = menu((state: any) => state.openMenu);
    const addCanvans = (options: any) => {
        setConfig({
            config: {
                ...options,
                id: '',
                templateId: options.id,
                serviceTypeId: userInfo.serviceTypeId,
            },
            id: '',
            backComponentPage: () => {
                openMenu({ key: 'applicationList' });
            },
        });
        setEditCanvas('open');
    };
    //返回页面 关闭画布
    const backApplyPageEvent = (state: string) => {
        setEditCanvas('close');
        if (state == 'save') {
            openMenu({ key: 'applicationList' });
        }
    };
    const onCancle = () => {};
    return (
        <div className={`${styles.applicationOrchestration} ${isFromApplicationList ? 'isFromApplicationOrchestrationBox' : 'applicationOrchestrationBox'}`}>
            <div className={styles.appArrange_page} style={guidedMock ? { display: 'none' } : undefined}>
                <div className={styles.cancel}>
                    {showButton && (
                        <Button type="primary" ghost onClick={onCancel}>
                            返回
                        </Button>
                    )}
                </div>
                <OrchestrationFrom onSearch={searchItem} addCanvans={addCanvans} appTemplateTabs={appTemplateTabs} appTypeList={appTypeList} />
                <div className={styles.appTemplateList}>
                    {appModuleData.length === 0 ? (
                        <div className={styles.searchResultVoid}>
                            <div className={styles.nodataCont}>
                                <div className={styles.nodataImg}></div>
                                <span className={styles.nodataTitle}>暂无匹配数据</span>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.searchResultList} ref={listRef}>
                            {appModuleData.map((item) => (
                                <AppTempCont
                                    key={item.id} //必须提供唯一key
                                    cardData={item}
                                    appTypeList={appTypeList}
                                    addCanvans={addCanvans}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {/* 应用新增 */}
            {editCanvas === 'open' && (
                <React.Suspense fallback={<div />}>
                    <PageCanvas
                        ref={pageCanvasRef}
                        pageCase="1"
                        baseConfig={updateConfig}
                        appTypeList={appTypeList}
                        backApplyPage={backApplyPageEvent}
                        onOpenSubmitReviewDrawer={handleOpenSubmitReviewDrawer}
                        isFromApplicationList={isFromApplicationList}
                    />

                    {/* 提交审核抽屉 */}
                    <SubmitReviewDrawer
                        visible={submitReviewDrawerVisible}
                        onClose={handleCloseSubmitReviewDrawer}
                        onSubmit={handleSubmitReview}
                    />
                </React.Suspense>
            )}
        </div>
    );
};
export default Page;
