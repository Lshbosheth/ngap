import React, { Component, createRef, useEffect, useRef, useState } from 'react';
import ComponentTempSearchCont from './componentTempSearchCont';
import { componentTempSearch, componentTempData, appTempData, BusinessData } from '../templateManageTypes';
import TempModuleList from '../tempModuleList';
import { userInfoState } from '@/stores/crossapiStore';
import request from '@/utils/request';

import styles from '../index.module.less';

interface IProps {
    userInfo: userInfoState;
    onConfirmEvent: (pos: string, data: componentTempData) => void;
}
interface IStates {
    childRef: TempModuleList | null;
    formData: componentTempSearch;
    businessData: BusinessData[];
}
export default class ComponentTemp extends Component<IProps, IStates> {
    state: IStates = {
        formData: {
            componentName: '',
            componentCategory: '',
            businessId: '',
        },
        childRef: null,
        businessData: [],
    };
    private childRef = createRef<TempModuleList>();
    handleChildRef = (child: TempModuleList) => {
        this.setState({ childRef: child });
    };
    constructor(props: IProps) {
        super(props);
    }

    private fetchData = async (): Promise<void> => {
        request
            .post('/appComponentBusiness/queryComponentBusinessList', { params: { provId: '' } })
            .then((data) => {
                this.setState({
                    businessData: data.beans,
                });
            })
            .catch((err) => {
                return err;
            });
    };

    // 组件挂载完成后执行请求（核心逻辑）
    componentDidMount(): void {
        this.fetchData();
    }
    // 触发查询事件
    handleQuery = (data: componentTempSearch) => {
        this.setState(
            (prevState: { formData: componentTempSearch }) => ({
                formData: {
                    ...prevState.formData,
                    ...data,
                },
            }),
            () => {
                // 表单内容
                if (this.state.childRef) {
                    this.state.childRef.loadData();
                }
            },
        );
    };

    resetItem() {}

    handleBaseInfo = (data: componentTempData) => {
        this.props.onConfirmEvent('1', data);
    };

    public render() {
        const { userInfo } = this.props;
        return (
            <div className={styles.componentTemp}>
                <ComponentTempSearchCont
                    onReset={this.resetItem}
                    onSearch={this.handleQuery}
                    confirmEvent={this.handleBaseInfo}
                    businessData={this.state.businessData}
                />
                <TempModuleList
                    formData={this.state.formData}
                    onRef={this.handleChildRef}
                    userInfo={userInfo}
                    jumpEditorPage={this.props.onConfirmEvent}
                    businessData={this.state.businessData}
                />
            </div>
        );
    }
}
