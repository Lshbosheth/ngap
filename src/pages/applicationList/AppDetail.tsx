import React, { useState, useEffect } from 'react';
import { Descriptions, Button, Modal, Checkbox } from 'antd';
import { message } from '@/utils/AntdGlobal';
import request from '@/utils/request';
import { crossApiUserInfo } from '@/stores/crossapiStore';

import { useParams } from 'react-router-dom';
import './appDetail.less';
import { publictData } from '../../utils/appMenuData';

// 定义组件props接口
interface AppDetailProps {
    appId?: string;
    onBack?: () => void;
    data?: object;
}
const moduleOptions = publictData.appBelongModuleArr;

const statusOptions = publictData.schemeStateArr;
const displayFormOptions = publictData.showFormArr;
const provinceMap = publictData.provinceSelectValue;

const appLevelOptions = publictData.appListLevelArr;
const shareProv = [{ label: '全网', value: '0000', id: '0000' }];
const provinceOptions = shareProv.concat(publictData.provinceSelectValue);
const AppDetail: React.FC<AppDetailProps> = ({ appId, onBack, data }) => {
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const currentUserProvince = userInfo.provinceId;
    const [appDetail, setAppDetail] = useState<any>(null);
    const [appType, setAppType] = useState<any>(null);
    const { id } = useParams<{ id: string }>();
    // 共享弹窗相关状态
    const [shareModalVisible, setShareModalVisible] = useState(false);
    const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);
    const [allSelected, setAllSelected] = useState(false);
    // 所有三级类目数据（从接口获取）
    const [allFlatData, setAllFlatData] = useState<any[]>([]);
    // 应用详情数据
    useEffect(() => {
        console.log(data, 'data');
        request
            .post('/appType/queryAppTypeList', {})
            .then((res) => {
                setAllFlatData(res.beans);
            })
            .catch((err) => {
                setAllFlatData([]);
            });
        setAppDetail(data);
    }, []);
    useEffect(() => {
        const arr: any = [];
        getAppTypeNameById(appDetail?.appTypeId, arr);
        console.log(appDetail, 'appDetail');
        setAppType(arr.join('-'));
    }, [allFlatData]);
    // 打开共享弹窗
    const handleShareClick = () => {
        setShareModalVisible(true);
        // 初始化选择状态，默认全选
        const allProvinceValues = provinceMap?.map((item) => item.value).filter((value) => value !== currentUserProvince) || [];
        setSelectedProvinces(allProvinceValues);
        setAllSelected(true);
    };

    // 关闭共享弹窗
    const handleShareModalClose = () => {
        setShareModalVisible(false);
    };

    // 处理共享确认
    const handleShareConfirm = () => {
        // 这里可以添加实际的共享逻辑，比如调用API保存共享设置
        console.log('共享省份：', selectedProvinces);
        console.log('是否全网共享：', allSelected);
        if (allSelected) {
            selectedProvinces.push('0000');
        }
        const params = {
            id: appDetail.id,
            shareStatus: selectedProvinces.length > 0 ? '1' : '0',
            shareProv: selectedProvinces.join(','),
            staffId: userInfo.staffId,
        };
        request
            .post('/app/saveAppInfoForShare', { params })
            .then((res) => {
                if (res && res.returnCode == '0') {
                    message.success('共享成功');
                } else {
                    message.error('共享失败');
                }
            })
            .catch((err) => { });

        setShareModalVisible(false);
    };
    const getAppTypeNameById = (appTypeId: any, result: any) => {
        for (const item of allFlatData) {
            if (item.appTypeId == appTypeId) {
                result.unshift(item.appTypeName);
                getAppTypeNameById(item.pId, result);
            }
        }
    };
    return (
        <div className="app-detail-container">
            <div className="detail-header">
                <h2>应用详情</h2>
                <div className="header-buttons">
                    {appDetail?.provId == currentUserProvince && (
                        <Button type="primary" style={{ width: 82, height: 28, fontSize: 12 }} onClick={handleShareClick}>
                            共享
                        </Button>
                    )}
                    <Button
                        type="primary"
                        ghost
                        style={{ width: 82, height: 28, fontSize: 12 }}
                        onClick={() => {
                            if (onBack) {
                                onBack();
                            }
                        }}
                    >
                        返回
                    </Button>
                </div>
            </div>
            <div className="detail-content">
                <div className="preview-section">
                    <div className="section-title">应用预览</div>
                    <div className="preview-card">
                        <div className="preview-content">{/* 应用预览作为主区域，暂时不添加内容 */}</div>
                    </div>
                </div>
                <div className="info-section">
                    <div className="section-title">基础信息</div>
                    <div className="section-divider"></div>

                    <div className="info-card">
                        <Descriptions column={1} size="middle">
                            <Descriptions.Item label="应用名称">{appDetail?.appName}</Descriptions.Item>
                            <Descriptions.Item label="应用级别">
                                {appDetail?.appLevel ? appLevelOptions?.find((item) => item.value == appDetail.appLevel)?.label : '--'}
                            </Descriptions.Item>
                            <Descriptions.Item label="应用描述">{appDetail?.appDesc}</Descriptions.Item>

                            <Descriptions.Item label="应用分类">{appType}</Descriptions.Item>
                            <Descriptions.Item label="应用类别">{appDetail?.appCategory === '1' ? '生产应用' : '运营应用'}</Descriptions.Item>

                            <Descriptions.Item label="所属省份">
                                {appDetail?.provId ? provinceOptions?.find((item) => item.value == appDetail.provId)?.label : '--'}
                            </Descriptions.Item>
                            <Descriptions.Item label="归属模块">{appDetail?.belongModule ? appDetail?.belongModule : '--'}</Descriptions.Item>
                            <Descriptions.Item label="展示形式">
                                {displayFormOptions.find((item) => item.value == appDetail?.sceneType)?.label}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                    <div className="section-title">审核记录</div>
                    <div className="section-divider"></div>
                    <div className="audit-card">{/* 审核记录暂时不添加内容 */}</div>
                </div>
            </div>

            <Modal
                title="应用共享"
                open={shareModalVisible}
                onCancel={handleShareModalClose}
                onOk={handleShareConfirm}
                okText="确认"
                cancelText="关闭"
                width={800}
                destroyOnClose
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '16px',
                    }}
                >
                    <div
                        style={{
                            width: '100px',

                            paddingTop: '2px',
                        }}
                    >
                        <span style={{ color: '#ff4d4f' }}>*</span>共享省份:
                    </div>
                    <div
                        style={{
                            flex: 1,
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '30px 10px',
                            alignItems: 'center',
                            marginTop: '4px',
                        }}
                    >
                        {/* 全网选项 */}
                        <div style={{ width: 'calc(16.666% - 10px)' }}>
                            <Checkbox
                                checked={allSelected}
                                onChange={(e) => {
                                    // 直接控制所有省份的选择状态
                                    const checked = e.target.checked;
                                    setAllSelected(checked);
                                    if (checked) {
                                        // 勾选所有省份（除了当前用户所在省份）
                                        const allProvinceValues = provinceMap
                                            .map((item) => item.value)
                                            .filter((value) => value !== currentUserProvince);
                                        setSelectedProvinces(allProvinceValues);
                                    } else {
                                        // 取消所有省份的选择
                                        setSelectedProvinces([]);
                                    }
                                }}
                            >
                                全网
                            </Checkbox>
                        </div>

                        {/* 省份选项 */}
                        {provinceMap.map((item) => (
                            <div key={item.value} style={{ width: 'calc(16.666% - 10px)' }}>
                                <Checkbox
                                    checked={selectedProvinces.includes(item.value)}
                                    onChange={(e) => {
                                        const newSelected = e.target.checked
                                            ? [...selectedProvinces, item.value]
                                            : selectedProvinces.filter((v) => v !== item.value);
                                        setSelectedProvinces(newSelected);

                                        // 更新全网状态
                                        const allProvinceValues = provinceMap?.map((prov) => prov.value).filter((v) => v !== currentUserProvince) || [];
                                        setAllSelected(newSelected.length === allProvinceValues.length);
                                    }}
                                    disabled={item.value === currentUserProvince}
                                >
                                    {item.label}
                                </Checkbox>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AppDetail;
