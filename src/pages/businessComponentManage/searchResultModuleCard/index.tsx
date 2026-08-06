import React, { Component, LegacyRef, useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Spin, Alert, Card, Typography } from 'antd';
import { message } from '@/utils/AntdGlobal';

import ComponentCard from './componentCard';
import {
    ComponentListSearchData,
    CommponentBeansItem,
    SearchCardHandle,
    ComponentTempData,
    CommponentItem,
    BusinessData,
} from '../businessComponentMangeTypes';
import request from '../../../utils/request';
import { objectToFormData } from '../../../utils/objectToFormData'; // 对象转 FormData 工具函数
import '../index.less';
import { crossApiUserInfo } from '@/stores/crossapiStore';
import recodeLog from '../../../utils/operLog';

interface IProps {
    formData: ComponentListSearchData;
    jumpEditorPage: (pos: string, data: ComponentTempData) => void;
    BusinessListData: BusinessData[];
}

interface searcTableData {
    provId: string;
    serviceTypeId: string;
    componentName: string;
    componentDesc: string;
    belongModule: string;
    serviceLink: string;
    componentLevel: string;
    componentCategory: string;
    businessId: string;
    dataType: string;
    page: number | undefined; // 当前页码
    start: number | undefined;
    limit: number | undefined;
}

const SearchResultModuleCard = forwardRef<SearchCardHandle, IProps>((props, ref) => {
    // 获取用户信息
    const userInfo = crossApiUserInfo((state) => state.userInfo);
    const { formData, jumpEditorPage, BusinessListData } = props;
    const [data, setData] = useState<CommponentBeansItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [start, setStart] = useState<number>(0);
    const [limit, setLimit] = useState<number>(12);
    const listRef = useRef<HTMLDivElement>(null);
    const [searchData, setSearchData] = useState<searcTableData>({
        ...formData,
        page: 1, // 当前页码
        start: 0,
        limit: 12,
    });
    const formDataRef = useRef(formData);
    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
        resetHasMore, // 重置
        queryList, // 查询
    }));
    const resetHasMore = () => {
        setHasMore(true);
        setPage(1);
        setStart(0);
    };
    const queryList = () => {
        if (searchData.page != 1 || searchData.start != 0) {
            setPage(1);
            setStart(0);
        } else {
            setData([]);
            loadMoreData(searchData.start, searchData.page);
        }
    };
    // 模拟API请求数据
    const fetchData = async (searchCurrentData: searcTableData): Promise<CommponentBeansItem[]> => {
        return new Promise((resolve) => {
            searchCurrentData.businessId = searchCurrentData.businessId !== '0' ? searchCurrentData.businessId : '';
            request.post('/appComponent/queryAppComponentList2', objectToFormData(searchCurrentData)).then((businessComponentBeans) => {
                // 业务组件列表数据
                const data: CommponentBeansItem[] = businessComponentBeans.beans;
                const pageNum = searchCurrentData.page ? searchCurrentData.page : 1;
                setPage(pageNum + 1);
                setStart(limit * pageNum);
                // 请求次数
                resolve(data);
            });
        });
    };

    // 加载数据
    const loadMoreData = useCallback(
        async (startNum: number, pageNum: number) => {
            if ((loading || !hasMore) && pageNum !== 1) return;

            setLoading(true);
            try {
                const searchListData = {
                    ...formDataRef.current,
                    start: startNum,
                    page: pageNum,
                    limit: 12,
                };
                const newData = await fetchData(searchListData);

                if (newData.length === 0) {
                    setHasMore(false);
                } else {
                    setData((prevData) => [...prevData, ...newData]);
                    // setSearchData({
                    //     ...searchData,
                    //     start: start,
                    //     page: page,
                    // });
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
            loadMoreData(start, page);
        }
    }, [loading, hasMore, loadMoreData]);

    // 初始化加载
    useEffect(() => {
        formDataRef.current = formData;
        setData([]);
        setHasMore(true);
        setLoading(false);
        loadMoreData(0, 1);
    }, [formData]);

    // 监听滚动事件
    useEffect(() => {
        const listElement = listRef.current;
        if (!listElement) return;

        listElement.addEventListener('scroll', checkIfNeedLoadMore);
        return () => {
            listElement.removeEventListener('scroll', checkIfNeedLoadMore);
        };
    }, [checkIfNeedLoadMore]);

    // 业务组件删除方法
    const deleteModuleCard = async (data: CommponentItem) => {
        setHasMore(true);
        setLoading(false);
        setPage(1);
        setStart(0);
        const queryparams = {
            params: {
                provId: userInfo.provinceId,
                serviceTypeId: userInfo.serviceTypeId,
                staffId: userInfo.staffId,
                ids: data.id,
                status: '1', // 操作前状态 1正常
                componentStatus: '0', // 操作后状态 0:删除，1正常
            },
        };
        const result = await request.post('/appComponent/updateAppComponentStatus', queryparams);
        if (result && result.returnCode == '0') {
            message.success('删除成功！');
            const logParams = {
                provCode: userInfo.provinceId, // 8位省份编码
                modelName: '', // 所属模块  暂时为空
                pageName: '', // 所属菜单   暂时为空
                dataType: '业务组件', // 数据类型（应用、元素、组件、接口）
                operType: '删除', // 操作类型（新增/编辑/删除/导入）
                dataId: data.id, // 操作数据ID
                dataName: data.componentName, // 操作数据名称
                editContent: `删除${data.componentName}业务组件`, // 操作内容简述
                staffId: userInfo.staffId, // 操作人工号
            };
            recodeLog(logParams);
            setTimeout(() => {
                setData([]);
                loadMoreData(0, 1);
            }, 1000);
        }
    };

    return (
        <div className="searchResultModuleCard">
            <div className="searchList searchListThreeColumn" ref={listRef}>
                {data.length > 0 ? (
                    data.map((item) => (
                        <ComponentCard
                            key={item.id} //必须提供唯一key
                            cardData={item}
                            jumpEditorPage={jumpEditorPage}
                            deleteModuleCard={deleteModuleCard}
                            BusinessListData={BusinessListData}
                        />
                    ))
                ) : (
                    <div className="searchResultVoid">
                        <div className="nodataCont">
                            <div className="nodataImg"></div>
                            <span className="nodataTitle">暂无匹配数据</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

export default SearchResultModuleCard;
