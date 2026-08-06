import React, { useState, useEffect, useRef } from 'react';
import { Modal } from 'antd';
import { publictData } from '../../utils/appMenuData';
import { OptionItem, OrchestrationFormData, AppTemptypeData } from './appOrchestrationTypes';
import AppBaseInfoDialog from './appBaseInfoDialog';
import { crossApiUserInfo } from '@/stores/crossapiStore';

import styles from './index.module.less';

interface SearchFormProps {
    onSearch: (values: OrchestrationFormData) => void;
    addCanvans: (options: any) => void;
    appTemplateTabs: AppTemptypeData[];
    appTypeList: AppTemptypeData[];
}

const OrchestrationFrom: React.FC<SearchFormProps> = ({ onSearch, addCanvans, appTemplateTabs, appTypeList }) => {
    // 获取用户信息
    const userInfo = crossApiUserInfo((state) => state.userInfo);
    const { appCategoryArr, showFormArr } = publictData;
    const [options, setOptions] = useState<{
        appCategoryOption: OptionItem[]; // 应用模板类别
        appTypeOption: AppTemptypeData[]; // 应用分类
        showFormOption: OptionItem[]; // 应用形式
    }>({
        appCategoryOption: appCategoryArr, // 应用模板类别
        appTypeOption: appTemplateTabs, // 应用分类
        showFormOption: showFormArr, // 应用形式
    });

    const [appTempForm, setAppTempForm] = useState<OrchestrationFormData>({
        provId: userInfo.provinceId,
        appCategory: '1',
        appTypeIds: '-1',
        sceneType: 'base',
        dataType: '2',
    });
    const appTempDataRef = useRef(appTempForm);
    useEffect(() => {
        appTempDataRef.current = appTempForm;
        onSearch(appTempForm);
    }, [appTempForm]);

    useEffect(() => {
        const { appCategoryArr, showFormArr } = publictData;
        setOptions({
            appCategoryOption: appCategoryArr,
            appTypeOption: [...appTemplateTabs],
            showFormOption: showFormArr,
        });
    }, [appTemplateTabs]);

    // 控制弹窗显示状态
    const [createDirectlyVisible, setCreateDirectlyVisible] = useState(false);

    // 打开弹窗
    const openCreateDirectlyModal = () => {
        setCreateDirectlyVisible(true);
    };
    // 关闭弹窗
    const closeCreateDirectlyModal = () => {
        setCreateDirectlyVisible(false);
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

    // 模板类别
    const randerAppCategory = (data: OptionItem[]) => {
        return data.map((item: OptionItem) => {
            const baseClass = item.value === '1' ? 'productApp' : 'operateApp';
            const appDesc = item.value === '1' ? '创建各类坐席生产类应用，菜单集成在生产门户' : '创建各类业务运营类应用，菜单集成在运营门户';

            const activeClass = appTempForm.appCategory === item.value ? 'active' : '';
            return (
                <div
                    key={item.value}
                    className={[styles.appName, styles[baseClass], styles[activeClass]].join(' ')}
                    onClick={() => {
                        handleAppCategory(item);
                    }}
                >
                    <div className={styles.title}>
                        <label>{item.label}</label>
                        <p>{appDesc}</p>
                    </div>
                    <div className={styles.imgIcon}></div>
                </div>
            );
        });
    };
    const handleAppCategory = (item: OptionItem) => {
        setAppTempForm({
            ...appTempForm,
            appCategory: item.value,
            appTypeIds: '-1',
        });
    };

    // 应用形式
    const randerShowForm = (data: OptionItem[]) => {
        return data.map((item: OptionItem) => {
            const activeClass = appTempForm.sceneType === item.value ? 'active' : '';
            return (
                <div
                    key={item.value}
                    className={[styles.appFormatItem, styles[activeClass]].join(' ')}
                    onClick={() => {
                        handleShowFormChange(item);
                    }}
                >
                    {item.label}
                </div>
            );
        });
    };
    const handleShowFormChange = (item: OptionItem) => {
        setAppTempForm({
            ...appTempForm,
            sceneType: item.value,
        });
    };
    const randerAppTemplate = (data: AppTemptypeData[]) => {
        const dataFifter: AppTemptypeData[] = data.filter((item: AppTemptypeData) => {
            return item.appTypeCategory === appTempForm.appCategory;
        });
        const apptypes = [{ appTypeCategory: '-1', appTypeName: '全部', appTypeId: '-1', pId: '', typeLevel: '' }].concat(dataFifter);
        return apptypes.map((item: AppTemptypeData) => {
            const activeClass = item.appTypeId === appTempForm.appTypeIds ? 'appTypeItemActive' : '';
            return (
                <div
                    className={[styles.appTypeItem, styles[activeClass]].join(' ')}
                    key={item.appTypeId}
                    onClick={() => handleAppTypeNameClick(item)}
                >
                    {item.appTypeName}
                </div>
            );
        });
    };

    const handleAppTypeNameClick = (item: AppTemptypeData) => {
        setAppTempForm({
            ...appTempForm,
            appTypeIds: item.appTypeId,
        });
    };
    return (
        <div>
            <div className={styles.appCategory}>{randerAppCategory(options.appCategoryOption)}</div>
            {appTempForm.appCategory === '1' && (
                <div className={styles.appLabel}>
                    <label>
                        <i className={styles.appFormatI}>*</i>选择应用形式
                    </label>
                    <div className={styles.appFormat}>{randerShowForm(options.showFormOption)}</div>
                </div>
            )}

            <div className={styles.appLabel}>
                <label>选择应用模板</label>
                <div className={styles.appTemplate}>{randerAppTemplate(options.appTypeOption)}</div>
                <div className={styles.addTemplateDiv}>
                    <p>不使用模板</p>
                    <button className={styles.addAppBtn} onClick={openCreateDirectlyModal}>
                        +直接创建
                    </button>
                    {/* 弹窗组件 */}
                    <Modal
                        className={styles.addTempModal}
                        title="新增应用"
                        open={createDirectlyVisible}
                        onCancel={closeCreateDirectlyModal}
                        styles={modalStyles}
                        footer={null} // 移除默认底部按钮
                        width={800}
                        maskClosable={false} // 设置为false，点击遮罩不关闭
                        destroyOnClose // 关闭时销毁子元素
                    >
                        <AppBaseInfoDialog
                            onReset={closeCreateDirectlyModal}
                            onSearch={(options) => {
                                closeCreateDirectlyModal();
                                addCanvans(options);
                            }}
                            appTypeList={appTypeList}
                            baseInfo={{
                                ...appTempForm,
                                sceneType: appTempForm.appCategory !== '2' ? appTempForm.sceneType : 'base',
                            }}
                        />
                    </Modal>
                </div>
            </div>
        </div>
    );
};

export default OrchestrationFrom;
