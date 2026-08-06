import React, { Component, useEffect, useRef, useState } from 'react';
import OtherFiltersCont from './otherFiltersCont';
import { SelectData, OtherFormData, ComponentListSearchData, BusinessData } from '../businessComponentMangeTypes';
import { userInfoState } from '@/stores/crossapiStore';
import { trackClk } from '@/utils/commonGdp';

import '../index.less';

interface IProps {
    onQuery: (data: ComponentListSearchData) => void;
    onReset: () => void;
    BusinessData: BusinessData[];
    userInfo: userInfoState;
}
interface IStates {
    businessIdActive: string;
    businessSecondaryClassActve: string;
    queryResult: any[];
    formData: ComponentListSearchData;
    categoryActive: string;
    businessData: BusinessData[];
    businessDataSecondaryClass: BusinessData[];
}
export default class SearchCont extends Component<IProps, IStates> {
    state: IStates = {
        categoryActive: '1',
        businessIdActive: '0',
        queryResult: [],
        businessData: [],
        businessSecondaryClassActve: '00',
        businessDataSecondaryClass: [
            {
                businessId: '00',
                businessName: '全部',
                businessCategory: '1',
                createStaffId: '0000',
                createTime: '',
                updateTime: '',
                updateStaffId: '',
                businessLevel: '2',
                parentId: '0000',
            },
        ],
        formData: {
            provId: '',
            serviceTypeId: '',
            componentCategory: '1',
            businessId: '0',
            componentName: '',
            componentDesc: '',
            belongModule: '',
            serviceLink: '',
            componentLevel: '',
            dataType: '1',
        },
    };

    constructor(props: IProps) {
        super(props);
        // this.state = {
        //     categoryActive: "1",
        //     queryResult: [],
        //     formData: {
        //         componentCategory: '1',
        //         businessId: '',
        //         componentName: '',
        //         componentDesc: '',
        //         belongModule: '',
        //         serviceLink: '',
        //         componentLevel: ''
        //     },
        // }

        // 绑定this指向
        this.handleCategoryClick = this.handleCategoryClick.bind(this);
        this.handleBusinessIdClick = this.handleBusinessIdClick.bind(this);
        this.handleQuery = this.handleQuery.bind(this);
        this.handleReset = this.handleReset.bind(this);
    }

    public componentDidMount() {
        const secondClassBusinessData = this.props.BusinessData.filter((item: BusinessData) => {
            return item.businessLevel === '2';
        });
        this.setState({
            businessDataSecondaryClass: [
                {
                    businessId: '00',
                    businessName: '全部',
                    businessCategory: '1',
                    createStaffId: '0000',
                    createTime: '',
                    updateTime: '',
                    updateStaffId: '',
                    businessLevel: '2',
                    parentId: '0000',
                },
                ...secondClassBusinessData,
            ],
        });
    }

    // 提供获取状态的方法
    getState = () => {
        return { ...this.state };
    };

    // 一级业务分类点击
    handleBusinessIdClick(item: BusinessData) {
        const { userInfo } = this.props;
        this.setState({ businessIdActive: item.businessId });
        this.setState({ businessSecondaryClassActve: '00' });
        let businessFifterData: BusinessData[] = [];
        if (item.businessId === '0') {
            businessFifterData = this.props.BusinessData.filter((businessItem: BusinessData) => {
                return businessItem.businessLevel === '2';
            });
        } else {
            businessFifterData = this.props.BusinessData.filter((businessItem: BusinessData) => {
                return item.businessId === businessItem.parentId && businessItem.businessLevel === '2';
            });
        }

        this.setState({
            businessDataSecondaryClass: [
                {
                    businessId: '00',
                    businessName: '全部',
                    businessCategory: '1',
                    createStaffId: '0000',
                    createTime: '',
                    updateTime: '',
                    updateStaffId: '',
                    businessLevel: '2',
                    parentId: '0000',
                },
                ...businessFifterData,
            ],
        });
        const businessIdArr = businessFifterData.map((dataBean) => {
            return dataBean.businessId;
        });
        this.setState(
            (prevState: { formData: ComponentListSearchData }) => ({
                formData: {
                    ...prevState.formData,
                    businessId: item.businessId !== '0' ? businessIdArr.join(',') : '', // 点击一级分类查全部的业务组件
                    provId: userInfo.provinceId,
                    serviceTypeId: userInfo.serviceTypeId,
                },
            }),
            () => {
                this.props.onQuery(this.state.formData);
            },
        );
    }

    // 二级业务分类点击
    handleBusinessSecondClick(item: BusinessData) {
        const { userInfo } = this.props;
        const { businessDataSecondaryClass } = this.state;
        this.setState({ businessSecondaryClassActve: item.businessId });
        let secondClassArr = [item.businessId];
        if (item.businessId === '00') {
            // secondClassArr = []; // 点击全部时先查所有的业务组件，而非当前一级分类下的所有业务组件
            secondClassArr = businessDataSecondaryClass.map(dataBean => {
                return dataBean.businessId;
            })
        }
        this.setState(
            (prevState: { formData: ComponentListSearchData }) => ({
                formData: {
                    ...prevState.formData,
                    businessId: secondClassArr.join(','),
                    provId: userInfo.provinceId,
                    serviceTypeId: userInfo.serviceTypeId,
                },
            }),
            () => {
                this.props.onQuery(this.state.formData);
            },
        );
    }

    // 业务组件类别点击
    handleCategoryClick(item: SelectData) {
        const { userInfo } = this.props;
        this.setState({ categoryActive: item.value });
        this.setState({ businessIdActive: '0' });
        this.setState({ businessSecondaryClassActve: '00' });
        this.setState(
            (prevState: { formData: ComponentListSearchData }) => ({
                formData: {
                    ...prevState.formData,
                    businessId: '',
                    componentCategory: item.value,
                    provId: userInfo.provinceId,
                    serviceTypeId: userInfo.serviceTypeId,
                },
            }),
            () => {
                this.props.onQuery(this.state.formData);
            },
        );

        // 记录插码日志
        trackClk('businessComponent_categoryClick', '业务组件列表类别切换');
    }

    // 点击查询
    handleQuery = (data: OtherFormData) => {
        const { userInfo } = this.props;
        this.setState(
            (prevState: { formData: ComponentListSearchData }) => ({
                formData: {
                    ...prevState.formData,
                    ...data,
                    provId: userInfo.provinceId,
                    serviceTypeId: userInfo.serviceTypeId,
                },
            }),
            () => {
                this.props.onQuery(this.state.formData);
            },
        );
    };
    // 点击重置
    handleReset = (data: OtherFormData) => {
        this.setState(
            (prevState: { formData: ComponentListSearchData }) => ({
                formData: {
                    ...prevState.formData,
                    ...data,
                    componentCategory: '1',
                    businessId: '',
                },
                categoryActive: '1',
                businessIdActive: '0',
                businessSecondaryClassActve: '00',
            }),
            () => {
                // console.log("重置formData", this.state.formData)
                this.props.onReset();
            },
        );
    };

    // 业务组件类别
    randerCategoryItems(data: SelectData[]) {
        return data.map((item: SelectData) => {
            const baseClass = 'searchItemName itemCategory'; // 基础类名
            const activeClass = item.value === this.state.categoryActive ? 'itemCategoryActive' : '';
            return (
                <div className={`${baseClass} ${activeClass}`} key={item.value} onClick={() => this.handleCategoryClick(item)}>
                    {item.name}
                </div>
            );
        });
    }
    // 一级业务分类
    randerBusinessCategoryItems(data: BusinessData[]) {
        return data.map((item: BusinessData) => {
            const baseClass = 'searchItemName businessTypeItem'; // 基础类名
            const activeClass = item.businessId === this.state.businessIdActive ? 'businessNameActive' : '';
            return (
                <div className={`${baseClass} ${activeClass}`} key={item.businessId} onClick={() => this.handleBusinessIdClick(item)}>
                    {item.businessName}
                </div>
            );
        });
    }
    randerBusinessSecondItems(data: BusinessData[]) {
        return data.map((item: BusinessData) => {
            const baseClass = 'searchItemName businessTypeItem'; // 基础类名
            const activeClass = item.businessId === this.state.businessSecondaryClassActve ? 'businessNameActive' : '';
            return (
                <div className={`${baseClass} ${activeClass}`} key={item.businessId} onClick={() => this.handleBusinessSecondClick(item)}>
                    {item.businessName}
                </div>
            );
        });
    }

    public render() {
        const componentTypeInfo: SelectData[] = [
            // 业务组件类别
            { name: '生产组件', value: '1' },
            { name: '运营组件', value: '2' },
        ];
        const firstClassBusinessData = this.props.BusinessData.filter((item: BusinessData) => {
            return item.businessLevel === '1';
        });
        const businessDataFirstClass = [
            {
                businessId: '0',
                businessName: '全部',
                businessCategory: '1',
                createStaffId: '0000',
                createTime: '',
                updateTime: '',
                updateStaffId: '',
                businessLevel: '1',
                parentId: '0000',
            },
            ...firstClassBusinessData,
        ];
        const { businessDataSecondaryClass } = this.state;

        return (
            <div className="searchCont">
                <div className="componentLevelCont searchItem">
                    <div className="searchTitle"> 业务组件类别：</div>
                    <div className="searchContent componentCategoryItem">{this.randerCategoryItems(componentTypeInfo)}</div>
                </div>
                <div className="businessCategoryCont searchItem">
                    <div className="searchTitle"> 一级分类：</div>
                    <div className="searchContent businessCategoryItem">{this.randerBusinessCategoryItems(businessDataFirstClass)}</div>
                </div>
                <div className="businessCategoryCont searchItem">
                    <div className="searchTitle"> 二级分类：</div>
                    <div className="searchContent businessCategoryItem">{this.randerBusinessSecondItems(businessDataSecondaryClass)}</div>
                </div>
                <OtherFiltersCont onQuery={this.handleQuery} onReset={this.handleReset} provinceId={this.props.userInfo.provinceId} />
            </div>
        );
    }
}
