import React, { Component, LegacyRef, useEffect, useRef, useState } from 'react';
import ComponentCard from './templateCard';
import request from '../../../utils/request';
import { objectToFormData } from '../../../utils/objectToFormData'; // 对象转 FormData 工具函数
import { userInfoState } from '@/stores/crossapiStore';
import { componentTempData, BusinessData } from '../templateManageTypes';
import recodeLog from '../../../utils/operLog';

import styles from '../index.module.less';
import { message } from '@/utils/AntdGlobal';

interface CommponentBeansItem {
    belongModule?: string;
    businessId?: string;
    componentCategory?: string;
    componentDesc?: string;
    componentLevel?: string;
    componentName?: string;
    componentStatus?: string;
    createStaffId?: string;
    createTime?: string;
    dataType?: string;
    id: string;
    provId?: string;
    serviceLink?: string;
    serviceTypeId?: string;
    updateStaffId?: string;
    updateTime?: string;
    componentPicture: string; //组件缩略图
}
interface IProps {
    formData: FormData;
    onRef: (ref: SearchResultModuleCard) => void;
    userInfo: userInfoState;
    jumpEditorPage: (pos: string, data: componentTempData) => void;
    businessData: BusinessData[];
}
interface IStates {
    provId: string; // 省份id
    serviceTypeId: string; // 融合系统编码
    staffId: string;
    dataType: string; //默认'3'
    componentStatus: string; //默认‘1’

    listData: CommponentBeansItem[];
    isBottom: boolean;
    page: number; // 当前页码
    isLoading: boolean; // 是否正在加载
    hasMore: boolean; // 是否还有更多数据
    error: string; // 错误信息
    totalPage: number; // 总页数
    ifCurrentPageFlag: boolean; //等待上一页数据返回，是否可以加载
    searchLimit: number; // 每页展示数量
    start: number;
    limit: number;
}
interface FormData {
    componentName: string; // 模板名称
    componentCategory: string; // 组件类别
    businessId: string | undefined; //业务分类
}
interface searchData {
    provId: string; // 省份id
    serviceTypeId: string; // 融合系统编码
    componentName: string; // 模板名称
    componentCategory: string; // 组件类别
    businessId: string | undefined; //业务分类
    dataType: string; //默认'3'
    componentStatus: string; //默认‘1’
    start: number;
    limit: number;
    page: number; // 当前页码
}

interface LazyListState {
    data: CommponentBeansItem[];
    hasMore: boolean;
}

export default class SearchResultModuleCard extends Component<IProps, IStates> {
    state: IStates = {
        dataType: '3', //默认'3'
        componentStatus: '1', //默认‘1’
        provId: '',
        serviceTypeId: '',
        staffId: '',
        listData: [],
        isBottom: false,
        isLoading: false,
        hasMore: true,
        error: '',
        page: 1,
        start: 0,
        limit: 12,
        totalPage: 0,
        ifCurrentPageFlag: false,
        searchLimit: 12,
    };

    // 定义删除回调函数：接收子组件传递的 id，过滤数据源并更新 state
    handleDeleteItem = (itemId: string) => {
        const queryparams = {
            params: {
                staffId: this.state.staffId,
                ids: itemId,
                status: '1', // 操作前状态 1正常
                serviceTypeId: this.state.serviceTypeId,
                componentStatus: '0', // 操作后状态 0:删除，1正常
            },
        };
        request
            .post('/appComponent/updateAppComponentStatus', queryparams)
            .then((result) => {
                if (result && result.returnCode == '0') {
                    message.success('删除成功！');
                    this.loadData();
                    const logParams = {
                        provCode: this.props.userInfo.provinceId, // 8位省份编码
                        modelName: '', // 所属模块  暂时为空
                        pageName: '', // 所属菜单   暂时为空
                        dataType: '业务组件模板', // 数据类型（应用、元素、组件、接口）
                        operType: '删除', // 操作类型（新增/编辑/删除/导入）
                        dataId: itemId, // 操作数据ID
                        dataName: '', // 操作数据名称
                        editContent: `删除业务组件模板`, // 操作内容简述
                        staffId: this.state.staffId, // 操作人工号
                    };
                    recodeLog(logParams);
                }
            })
            .catch((err) => {});
    };

    constructor(props: IProps) {
        super(props);
        // 绑定事件处理函数（避免每次渲染都创建新函数）
        this.handleScroll = this.handleScroll.bind(this);
    }
    // 创建一个ref用于绑定到滚动容器，如果不指定容器，则监听window的滚动
    private scrollContainerRef = React.createRef<HTMLDivElement>();

    public componentDidMount() {
        const { userInfo } = this.props;

        // 将组件实例传递给父组件
        if (this.props.onRef) {
            this.props.onRef(this);
        }
        // 添加滚动事件监听
        const scrollContainer = this.scrollContainerRef.current;
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', this.handleScroll);
        }

        this.setState(
            (prevState, props) => ({
                ...prevState,
                provId: userInfo.provinceId,
                serviceTypeId: userInfo.serviceTypeId,
                staffId: userInfo.staffId,
            }),
            () => {
                // 初始加载数据
                this.loadData();
            },
        );
    }
    public componentWillUnmount() {
        // 组件卸载时移除事件监听
        const scrollContainer = this.scrollContainerRef.current;
        if (scrollContainer) {
            scrollContainer.removeEventListener('scroll', this.handleScroll);
        }

        // 组件卸载时清空，避免内存泄漏
        if (this.props.onRef) {
            this.props.onRef(null!);
        }
    }

    // 处理滚动条滚动事件
    handleScroll = () => {
        // 获取窗口高度和文档高度
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // 判断是否滚动到底部（这里设置一个阈值，比如距离底部50px内算到底）
        const threshold = 50;
        const isBottom = scrollTop + windowHeight >= documentHeight - threshold;
        // 更新状态
        this.setState({ isBottom });

        // 如果滚动到底部，可以执行一些操作，比如加载更多数据
        if (isBottom) {
            // console.log('滚动到底部了！');
            // 这里可以调用加载更多的方法
            this.loadMoreData();
        }
    };

    // 加载初始数据
    loadData = async () => {
        this.setState({ isLoading: true, error: '', listData: [], page: 1 });

        try {
            // 模拟API调用 - 实际项目中替换为真实API
            const response: LazyListState = await this.fetchMockData(1);

            this.setState({
                listData: response.data,
                page: this.state.page,
                isLoading: false,
                hasMore: response.hasMore,
            });
        } catch (error) {
            this.setState({
                isLoading: false,
                error: '加载数据失败，请重试',
            });
        }
    };

    // 加载更多数据
    loadMoreData = async () => {
        if (this.state.isLoading || !this.state.hasMore) return;

        this.setState({ isLoading: true, error: '' });
        const nextPage = this.state.page + 1;

        try {
            const response = await this.fetchMockData(nextPage);

            this.setState((prevState: { listData: CommponentBeansItem[] }) => ({
                listData: [...prevState.listData, ...response.data],
                page: nextPage,
                isLoading: false,
                hasMore: response.hasMore,
            }));
        } catch (error) {
            this.setState({
                isLoading: false,
                error: '加载更多数据失败',
            });
        }
    };

    // 模拟API数据获取
    fetchMockData = (page: number) => {
        // 业务组件列表接口查询入参
        const { formData } = this.props;
        this.state.page = page;
        this.state.start = this.state.limit * (page - 1);

        const searchData: searchData = {
            ...formData,
            start: this.state.start,
            page: this.state.page,
            limit: this.state.limit,
            dataType: this.state.dataType,
            componentStatus: this.state.componentStatus,
            provId: this.state.provId,
            serviceTypeId: this.state.serviceTypeId,
        };

        // const searchData = objectToFormData(formData)
        return new Promise<LazyListState>((resolve, reject) => {
            request.post('/appComponent/queryAppComponentList2', objectToFormData(searchData)).then((businessComponentBeans) => {
                // 业务组件列表数据
                const data: CommponentBeansItem[] = businessComponentBeans.beans;
                const totalPage: number = Math.ceil(businessComponentBeans.bean.total / this.state.searchLimit);

                // 请求次数
                resolve({
                    data,
                    hasMore: this.state.page < totalPage,
                });
            });
        });
    };

    public render() {
        const { listData, isLoading, hasMore, error } = this.state;
        const { businessData } = this.props;
        return (
            <div className={styles.searchResultModuleCard} ref={this.scrollContainerRef}>
                {listData.length > 0 ? (
                    <div className={[styles.searchList, styles.searchListThreeColumn].join(' ')}>
                        {listData.map((item) => (
                            <ComponentCard
                                key={item.id} // 必须提供唯一key
                                cardData={item}
                                onDelete={this.handleDeleteItem}
                                jumpEditorPage={this.props.jumpEditorPage}
                                businessData={businessData}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="searchListNoDataSpc">
                        <div className={styles.searchListNoDatacont}>
                            <img src={new URL(`../imgs/nodata.png`, import.meta.url).href} alt="" />
                            <span>暂无匹配数据</span>
                        </div>
                    </div>
                )}
                {/* 加载状态 */}
                {isLoading && <div className={styles.loadingIndicator}>加载中...</div>}
            </div>
        );
    }
}
