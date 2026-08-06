import React, { useState, useEffect } from 'react';
import { Input, Select, Button, Row, Col, Spin } from 'antd';
import styles from './index.module.less';
import { publictData } from '../../../utils/appMenuData';
import { CommponentItem, OptionItem, BusinessData } from '../templateManageTypes';

interface SearchFormProps {
    cancelEvent: () => void;
    componentData: CommponentItem;
    BusinessListData: BusinessData[];
}

const BusinessComponentPreview: React.FC<SearchFormProps> = ({ cancelEvent, componentData, BusinessListData }) => {
    const closeDialog = () => {
        cancelEvent();
    };

    // 取出公共参数
    const { componentTypeInfo } = publictData;

    // 公共参数转换
    const parameterToName = (data: OptionItem[], val?: string) => {
        const res = data.filter((item: OptionItem) => item.value === val);
        return res && res[0] && res[0].label ? res[0].label : '';
    };

    // 业务分类转换
    const businessIdToName = () => {
        const businessFilter = BusinessListData.filter((item: BusinessData) => item.businessId === componentData.businessId);
        return businessFilter && businessFilter[0] && businessFilter[0].businessName ? businessFilter[0].businessName : '';
    };

    return (
        <div className={styles.businessComponentPreview}>
            <div className={styles.componentDetailCont}>
                <div className={styles.contLeft}>
                    <div className={styles.contTitle}>
                        <div className={styles.titleName}>组件预览</div>
                    </div>
                    <div className={styles.businessComponentDetailContent}></div>
                </div>
                <div className={styles.contRight}>
                    <div className={styles.basicCont}>
                        <div className={styles.contTitle}>
                            <div className={styles.titleName}>基础信息</div>
                        </div>
                        <div className={[styles.basicInfoCont, styles.detailCont].join(' ')}>
                            <div className={styles.basicItem}>
                                <div className={styles.basicInfoName}>模板名称：</div>
                                <div className={[styles.basicInfoVal, styles.componentName].join(' ')}>{componentData.componentName}</div>
                            </div>
                            <div className={styles.basicItem}>
                                <div className={styles.basicInfoName}>模板类别：</div>
                                <div className={[styles.basicInfoVal, styles.componentCategory].join(' ')}>
                                    {parameterToName(componentTypeInfo, componentData.componentCategory)}
                                </div>
                            </div>
                            <div className={styles.basicItem}>
                                <div className={styles.basicInfoName}>业务分类：</div>
                                <div className={[styles.basicInfoVal, styles.businessId].join(' ')}>{businessIdToName()}</div>
                            </div>

                            <div className={styles.basicItem}>
                                <div className={styles.basicInfoName}>模板描述：</div>
                                <div className={[styles.basicInfoVal, styles.componentDesc].join(' ')}>{componentData.componentDesc}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.busiButton}>
                <Button className={styles.closeBtn} onClick={closeDialog}>
                    取消
                </Button>
            </div>
        </div>
    );
};

export default BusinessComponentPreview;
