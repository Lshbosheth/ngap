import React, { useState, useEffect } from 'react';
import { Input, Select, Button, Modal, Col, Spin } from 'antd';
import { message } from '@/utils/AntdGlobal';
import { CloseCircleOutlined } from '@ant-design/icons';
import styles from './index.module.less';
import AppCategory from '../../applicationOrchestration/appCategory';
import { publictData } from '../../../utils/appMenuData';
import { fromPairs } from 'lodash-es';
import CascadeSelect from '../../applicationOrchestration/CascadeSelect';
import { crossApiUserInfo } from '@/stores/crossapiStore';

const { TextArea } = Input;

const { Option } = Select;
interface OptionItem {
    value: string;
    label: string;
    id: string;
}
interface AppTemptypeData {
    pId: string;
    typeLevel: string;
    appTypeCategory: string;
    appTypeId: string;
    appTypeName: string;
}
interface appTempData {
    provId?: string;
    serviceTypeId?: string;
    staffId?: string;
    appName: string; // 应用名称
    appTypeId?: string; // 应用分类ID
    appTypeName?: string; // 应用分类名称
    appCategory: string; // 应用类别
    belongModule?: string; // 归属模块
    sceneType: string; // 展示形式（方案类型）
    appDesc: string; // 应用备注
    id: string;
}
interface BaseInfo {
    appCategory: string; // 应用类别
    sceneType: string; // 展示形式（方案类型）
    appName?: string;
    belongModule?: string;
    appDesc?: string;
    appTypeId?: string;
}
interface DialogProps {
    onSearch: (values: any) => void;
    onReset: () => void;
    editconfirmEvent?: (data: any) => void;
    addconfirmEvent: (data: any) => void;
    appTypeList: AppTemptypeData[];
    editData?: appTempData;
    bannedCheckFlag?: boolean;
}

const AppBaseInfoDialog: React.FC<DialogProps> = ({
    onSearch,
    onReset,
    editconfirmEvent,
    addconfirmEvent,
    appTypeList,
    editData,
    bannedCheckFlag = false,
}) => {
    // 获取中心权限
    const [ngshCenterPermission, setNgshCenterPermission] = useState<string>('0');
    const [modalVisible, setModalVisible] = useState(false);
    // 用户信息
    const userInfo = crossApiUserInfo((state) => state.userInfo);
    const [options, setOptions] = useState<appTempData>({
        provId: userInfo.provinceId,
        serviceTypeId: userInfo.serviceTypeId,
        staffId: userInfo.staffId,
        appName: '', // 模板名称
        appCategory: '1', // 应用类别
        appTypeId: '', // 应用分类
        belongModule: '', // 归属模块
        sceneType: 'base', // 应用形式
        appDesc: '', // 应用备注
        id: '',
        ...editData,
    });

    const [isOpenAppType, setIsOpenAppType] = useState<boolean>(false);

    const closeDialog = () => {
        onReset();
    };

    const saveTempData = () => {
        // 校验模板名称
        if (options.appName === '') {
            message.error('请输入模板名称！');
            return;
        }

        // 校验应用分类
        if (options.appTypeId === '') {
            message.error('请选择应用分类！');
            return;
        }
        // 校验模板描述
        if (options.appDesc === '') {
            message.error('请输入模板描述！');
            return;
        }

        addconfirmEvent(options);

        if (editData) {
            editconfirmEvent && editconfirmEvent(options);
            onReset();
        } else {
            onSearch(options);
        }
    };

    const modalStyles = {
        content: {
            paddingLeft: 0,
            paddingRight: '0px',
            paddingBottom: '0px',
        },
        header: {
            paddingLeft: '8px',
            paddingBottom: '8px',
            borderBottom: '1px solid #d0d6d9',
        },
    };

    // 根据传入的应用ID获取应用名称
    useEffect(() => {
        const appTypeNames: string[] = [];
        getAppTypeNameById(appTypeNames, editData && editData.appTypeId);
        setOptions((prev) => ({
            ...prev,
            appTypeName: appTypeNames.join('-'), // 应用名称
        }));
    }, [editData && editData.appTypeId]);

    // 递归查询所有父级Name
    const getAppTypeNameById = (result: string[], appTypeId?: string): void => {
        const item = appTypeList.find((i) => i.appTypeId === appTypeId);
        if (item) {
            result.unshift(item.appTypeName);
            if (item.pId) {
                getAppTypeNameById(result, item.pId);
            }
        }
    };

    // 组件名称
    const appNameChange = (e: { target: { name: string; value: string } }) => {
        const { name, value } = e.target;
        setOptions((prev) => ({
            ...prev,
            appName: value,
        }));
    };
    // 组件描述
    const appDescChange = (e: { target: { name: string; value: string } }) => {
        const { name, value } = e.target;
        setOptions((prev) => ({
            ...prev,
            appDesc: value,
        }));
    };
    // 归属模块
    const belongModuleChange = (value: string) => {
        setOptions((prev) => ({
            ...prev,
            belongModule: value,
        }));
    };

    // 公共数据取用 应用类别 应用形式 归属模块
    const { appCategoryArr, showFormArr, appBelongModuleArr } = publictData;
    // 应用级别(应用列表页)
    const appListLevelArr: OptionItem[] = [
        { label: '中心一级', value: '1', id: '1' },
        { label: '分中心二级', value: '2', id: '2' },
    ];
    const randerAppCategory = (data: OptionItem[]) => {
        return data.map((item: OptionItem) => {
            const activeClass = options.appCategory === item.value ? 'active' : '';
            return (
                <span
                    className={styles[activeClass]}
                    key={item.value}
                    onClick={() => {
                        appCategoryClick(item);
                    }}
                >
                    {item.label}
                </span>
            );
        });
    };
    const appCategoryClick = (item: OptionItem) => {
        if (bannedCheckFlag) return;
        setOptions((prev) => ({
            ...prev,
            appCategory: item.value,
        }));
    };

    const randerShowForm = (data: OptionItem[]) => {
        return data.map((item: OptionItem) => {
            const activeClass = options.sceneType === item.value ? 'active' : '';
            return (
                <span key={item.value} className={styles[activeClass]} onClick={() => handleRanderClick(item)}>
                    {item.label}
                </span>
            );
        });
    };

    // 应用形式点击
    const handleRanderClick = (item: OptionItem) => {
        setOptions((prev) => ({
            ...prev,
            sceneType: item.value,
        }));
    };

    // 打开编辑应用分类弹窗
    const handleOpenAppTypeModal = () => {
        setIsOpenAppType(true);
    };

    // 关闭编辑应用分类弹窗
    const handleCloseAppTypeModal = () => {
        setIsOpenAppType(false);
    };

    return (
        <div className={styles.appBaseInfoDialog}>
            <div className={styles.appBaseInfoCont}>
                <div className={styles['app_modules']}>
                    <label id="applyNameCont">
                        <i className={styles['icon-config']}>*</i>模板名称：
                    </label>
                    <div className="appName">
                        <Input name="appName" value={options.appName} placeholder="请输入" onChange={appNameChange} />
                    </div>
                </div>
                <div className={styles['app_modules']}>
                    <label>
                        <i className={styles['icon-config']}>*</i>应用类别：
                    </label>

                    <div className={[styles.defaultParam, styles.appCategory, styles[bannedCheckFlag ? 'disabled' : '']].join(' ')}>
                        {randerAppCategory(appCategoryArr)}
                    </div>
                </div>

                {options.appCategory === '1' && (
                    <div className={[styles['app_modules'], styles.disabled].join(' ')}>
                        <label>
                            <i className={styles['icon-config']}>*</i>应用形式：
                        </label>
                        <div className={[styles.defaultParam, styles.appFormat].join(' ')}>{randerShowForm(showFormArr)}</div>
                    </div>
                )}

                <div className={styles['app_modules']}>
                    <label>
                        <i className={styles['icon-config']}>*</i>应用分类：
                    </label>
                    <div style={{ position: 'relative', width: 'calc(100% - 170px)' }}>
                        <Input
                            name="appType"
                            placeholder="请选择应用分类"
                            value={options.appTypeName}
                            readOnly
                            onClick={() => setModalVisible(true)}
                        />
                        <div
                            className={styles.appTypeSelector}
                            onClick={() => setModalVisible(true)}
                        >
                            选择
                        </div>
                        {/* 弹窗组件 */}
                        <Modal
                            className={styles.addTempModal}
                            title="选择应用分类"
                            open={modalVisible}
                            onCancel={() => setModalVisible(false)}
                            styles={modalStyles}
                            footer={null} // 移除默认底部按钮
                            // width={options.appCategory === '1' ? 1000 : 650}
                            width={650}
                            destroyOnClose // 关闭时销毁子元素
                        >
                            <CascadeSelect
                                appCategory={options.appCategory}
                                appTypeId={options.appTypeId ? options.appTypeId : ''}
                                appTypeList={appTypeList}
                                onCancel={() => setModalVisible(false)}
                                onSure={(data) => {
                                    setOptions((prev) => ({
                                        ...prev,
                                        appTypeName: data.appTypeName, // 应用名称
                                        appTypeId: data.appTypeId, // 应用分类ID
                                    }));
                                    setModalVisible(false);
                                }}
                            />
                        </Modal>
                    </div>
                    <button className={styles.addAppTypeBtn} style={{ display: 'none' }} onClick={handleOpenAppTypeModal}>
                        +应用分类
                    </button>
                </div>
                <div className={styles['app_modules']}>
                    <label>归属模块：</label>
                    <div className="belongModule">
                        <Select
                            className={styles.belongModuleSelect}
                            placeholder="请选择"
                            value={options.belongModule}
                            options={appBelongModuleArr}
                            onChange={belongModuleChange}
                        ></Select>
                    </div>
                </div>
                <div className={styles['app_modules']}>
                    <label id="applDesc">
                        <i className={styles['icon-config']}>*</i>模板描述：
                    </label>
                    <div className="appDesc">
                        <Input name="appDesc" value={options.appDesc} placeholder="应用概述、核心功能、适用场景" onChange={appDescChange} />
                    </div>
                </div>
            </div>

            <div className={styles.busiButton}>
                <Button type="primary" onClick={saveTempData} style={{ marginRight: 8 }}>
                    确定
                </Button>
                <Button onClick={closeDialog}>取消</Button>
            </div>
            {isOpenAppType && <AppCategory onClose={handleCloseAppTypeModal} appCategory={options.appCategory} />}
        </div>
    );
};

export default AppBaseInfoDialog;
