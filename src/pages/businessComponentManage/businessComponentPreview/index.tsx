import React, { useState, useEffect } from 'react';
import { Input, Select, Button, Row, Col, Spin } from 'antd';
import styles from './index.module.less';
import { publictData } from '../../../utils/appMenuData';
import { CommponentItem, ComponentTempData, OptionItem, BusinessData } from '../businessComponentMangeTypes';

interface SearchFormProps {
    cancelEvent: () => void;
    componentData: CommponentItem;
    BusinessListData: BusinessData[];
}

const BusinessComponentPreview: React.FC<SearchFormProps> = ({ cancelEvent, componentData, BusinessListData }) => {
    const [options, setOptions] = useState<ComponentTempData>({
        provId: '',
        serviceTypeId: '',
        staffId: '',
        componentName: '', // 模板名称
        componentDesc: '', // 业务组件描述
        businessId: '', // 业务分类
        belongModule: '', //归属模块
        serviceLink: '', // 服务环节
        componentCategory: '1', //模板类别
        componentLevel: '2', //适用范围
        id: '',
        dataType: '1',
        ...componentData,
    });

    const closeDialog = () => {
        cancelEvent();
    };

    // 取出公共参数
    const { appBelongModuleArr, componentTypeInfo, appServiceLinkArr, provId2provName, appPlatLevelArr } = publictData;

    // 省份编码转文字
    const provIdToName = () => {
        const porvIdNm = componentData.provId ? componentData.provId : '';
        return provId2provName[porvIdNm] ? provId2provName[porvIdNm] : '中心';
    };
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
                        <div className={styles.titleName}>组件{options.dataType === '3' ? '模板' : ''}预览</div>
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
                                <div className={styles.basicInfoName}>{options.dataType === '3' ? '模板' : '业务组件'}名称：</div>
                                <div className={[styles.basicInfoVal, styles.componentName].join(' ')}>{componentData.componentName}</div>
                            </div>
                            {options.dataType !== '3' && (
                                <div className={styles.basicItem}>
                                    <div className={styles.basicInfoName}>通用范围：</div>
                                    <div className={[styles.basicInfoVal, styles.componentLevel].join(' ')}>
                                        {parameterToName(appPlatLevelArr, componentData.componentLevel)}
                                    </div>
                                </div>
                            )}
                            <div className={styles.basicItem}>
                                <div className={styles.basicInfoName}>{options.dataType === '3' ? '模板' : '业务组件'}类别：</div>
                                <div className={[styles.basicInfoVal, styles.componentCategory].join(' ')}>
                                    {parameterToName(componentTypeInfo, componentData.componentCategory)}
                                </div>
                            </div>
                            {options.dataType !== '3' && (
                                <div className={styles.basicItem}>
                                    <div className={styles.basicInfoName}>归属模块：</div>
                                    <div className={[styles.basicInfoVal, styles.belongModule].join(' ')}>
                                        {parameterToName(appBelongModuleArr, componentData.belongModule)}
                                    </div>
                                </div>
                            )}
                            <div className={styles.basicItem}>
                                <div className={styles.basicInfoName}>业务分类：</div>
                                <div className={[styles.basicInfoVal, styles.businessId].join(' ')}>{businessIdToName()}</div>
                            </div>
                            <div className={[styles.basicItem, styles.basicInfoNameCont].join(' ')}>
                                <div className={styles.basicInfoName}>服务环节：</div>
                                <div className={[styles.basicInfoVal, styles.serviceLink].join(' ')}>
                                    {parameterToName(appServiceLinkArr, componentData.serviceLink)}
                                </div>
                            </div>
                            {options.dataType !== '3' && (
                                <div className={styles.basicItem}>
                                    <div className={styles.basicInfoName}>省份：</div>
                                    <div className={[styles.basicInfoVal, styles.provIdNm].join(' ')}>{provIdToName()}</div>
                                </div>
                            )}

                            <div className={styles.basicItem}>
                                <div className={styles.basicInfoName}>{options.dataType === '3' ? '模板' : '组件'}描述：</div>
                                <div className={[styles.basicInfoVal, styles.componentDesc].join(' ')}>{componentData.componentDesc}</div>
                            </div>
                        </div>
                    </div>
                    {options.dataType !== '3' && (
                        <div className={styles.auditInfoCont}>
                            <div className={styles.contTitle}>
                                <div className={styles.titleName}>审核记录</div>
                            </div>
                            <div className={[styles.auditRecordCont, styles.detailCont].join(' ')}></div>
                        </div>
                    )}
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
