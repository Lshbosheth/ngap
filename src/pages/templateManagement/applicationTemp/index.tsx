import React, { useEffect, useRef, useState, createRef, Component } from 'react';
import ApplicationTempSearchCont from './applicationTempSearchCont';
import styles from '../index.module.less';
import { appTempFormData, componentTempData, appTempData } from '../templateManageTypes';
import ApplicationModuleList from '../applicationModuleList';
import { userInfoState } from '@/stores/crossapiStore';

interface IProps {
    userInfo: userInfoState;
    onConfirmEvent: (pos: string, data: appTempData) => void;
}
interface IStates {
    childRef: ApplicationModuleList | null;
    formData: appTempFormData;
}
export default class ApplicationTemp extends Component<IProps, IStates> {
    state: IStates = {
        formData: {
            appName: '', //模板名称
            appCategory: '', //模板类别
            appTypeIds: '', //应用分类
            sceneType: '', //应用形式
        },
        childRef: null,
    };
    private childRef = createRef<ApplicationModuleList>();
    handleChildRef = (child: ApplicationModuleList) => {
        this.setState({ childRef: child });
    };
    constructor(props: IProps) {
        super(props);
    }
    // 触发查询事件
    handleQuery = (data: appTempFormData) => {
        this.setState(
            (prevState: { formData: appTempFormData }) => ({
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

    handleBaseInfo = (data: appTempData) => {
        this.props.onConfirmEvent('2', data);
    };

    public render() {
        const { userInfo } = this.props;

        return (
            <div className={styles.applicationTemp}>
                <ApplicationTempSearchCont onReset={this.resetItem} onSearch={this.handleQuery} confirmEvent={this.handleBaseInfo} />
                <div className={styles.searchResultPage}>
                    <ApplicationModuleList
                        formData={this.state.formData}
                        onRef={this.handleChildRef}
                        userInfo={userInfo}
                        jumpEditorPage={this.props.onConfirmEvent}
                    />
                </div>
            </div>
        );
    }
}
