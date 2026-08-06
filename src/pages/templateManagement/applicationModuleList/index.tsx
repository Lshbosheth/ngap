import React, { Component, LegacyRef, useEffect, useRef, useState } from 'react';
import ApplicationCard from './applicationCard';
import request from '../../../utils/request';
import { objectToFormData } from '../../../utils/objectToFormData'; // 对象转 FormData 工具函数
import { message } from '@/utils/AntdGlobal';
import { userInfoState } from '@/stores/crossapiStore';
import { componentTempData, appTempData } from '../templateManageTypes';
import recodeLog from '../../../utils/operLog';

import styles from '../index.module.less';

interface CommponentBeansItem {
    appCategory?: string;
    appDesc?: string;
    appLevel?: string;
    appName: string;
    appStatus?: string;
    appTypeId?: string;
    belongModule?: string;
    createStaffId?: string;
    createTime?: string;
    dataType?: string;
    defaultRefresh?: string;
    id: string;
    isShowNavBar?: string;
    provId?: string;
    sceneType?: string;
    serviceTypeId?: string;
    shareStatus?: string;
    showRegion?: string;
    updateStaffId?: string;
    updateTime?: string;
    imageUrl?: string; //快照图片
}
interface IProps {
    formData: FormData;
    onRef: (ref: ApplicationMuduleCard) => void;
    userInfo: userInfoState;
    jumpEditorPage: (pos: string, data: appTempData) => void;
}
interface IStates {
    provId: string; // 省份id
    serviceTypeId: string; // 融合系统编码
    dataType: string; //默认'2'

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
    appName: string; //模板名称
    appCategory: string; //模板类别
    appTypeIds: string; //应用分类
    sceneType: string; //应用形式
}
interface searchData {
    provId: string; // 省份id
    serviceTypeId: string; // 融合系统编码
    dataType: string; //默认'2'
    appName: string; //模板名称
    appCategory: string; //模板类别
    appTypeIds: string; //应用分类
    sceneType: string; //应用形式
    tenantCode:string;
    start: number;
    limit: number;
    page: number; // 当前页码
}

interface LazyListState {
    data: CommponentBeansItem[];
    hasMore: boolean;
}

export default class ApplicationMuduleCard extends Component<IProps, IStates> {
    state: IStates = {
        dataType: '2', //默认'2'
        provId: '',
        serviceTypeId: '',
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
    handleDeleteItem = (itemId: any) => {
        // 新删除接口
        const params = { params: { appStatus: '0', relationId: itemId?.relationId, id: itemId?.id, staffId: this.props.userInfo.staffId } };
        request
            .post('/app/deleteAppByNewVervion', params)
            .then((result) => {
                if (result && result.returnCode == '0') {
                    message.success('删除成功！');
                    this.loadData();
                    const logParams = {
                        provCode: this.props.userInfo.provinceId, // 8位省份编码
                        modelName: '', // 所属模块  暂时为空
                        pageName: '', // 所属菜单   暂时为空
                        dataType: '应用模板', // 数据类型（应用、元素、组件、接口）
                        operType: '删除', // 操作类型（新增/编辑/删除/导入）
                        dataId: itemId.id, // 操作数据ID
                        dataName: '', // 操作数据名称
                        editContent: `删除应用模板`, // 操作内容简述
                        staffId: this.props.userInfo.staffId, // 操作人工号
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
        this.setState({ isLoading: true, error: '', listData: [] });

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
            tenantCode:this.state.serviceTypeId,
            provId: this.state.provId,
            serviceTypeId: this.state.serviceTypeId,
        };

        return new Promise<LazyListState>((resolve, reject) => {
            request.post('/app/queryAppList', objectToFormData(searchData)).then((businessComponentBeans) => {
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
        return (
            <div className={styles.searchResultModuleCard} ref={this.scrollContainerRef}>
                {listData.length > 0 ? (
                    <div className={[styles.searchList, styles.searchListThreeColumn].join(' ')}>
                        {listData.map((item) => (
                            <ApplicationCard
                                key={item.id} // 必须提供唯一key
                                cardData={item}
                                onDelete={()=>{this.handleDeleteItem(item)}}
                                jumpEditorPage={this.props.jumpEditorPage}
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
