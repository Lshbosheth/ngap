import React, { Component, useEffect, useRef, useState } from 'react';
import { AppModuleItem, AppTemptypeData } from './appOrchestrationTypes';
import { Modal } from 'antd';
import AppBaseInfoDialog from './appBaseInfoDialog';
import { menu } from '@/stores/menuStore';

import styles from './index.module.less';

interface IProps {
    cardData: AppModuleItem;
    key: string;
    appTypeList: AppTemptypeData[];
    addCanvans: (options: any) => void;
}

const AppTempCont: React.FC<IProps> = ({ cardData, key, appTypeList, addCanvans }) => {
    const [ngshCenterPermission, setNgshCenterPermission] = useState<string>('1');
    const [appTempForm, setAppTempForm] = useState<AppModuleItem>({ ...cardData });
    // 控制弹窗显示状态
    const [modalAppBaseVisible, setModalAppBaseVisible] = useState(false);
    // 预览展示方法
    const openPreview = menu((state) => state.openPreview);

    // 打开弹窗
    const handleOpenAppBaseModal = () => {
        setModalAppBaseVisible(true);
    };

    // 关闭弹窗
    const handleCloseAppBaseModal = () => {
        setModalAppBaseVisible(false);
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
    // 装配式预览
    const previewBtnClick = () => {
        if (cardData.sceneType == 'base') {
            //  装配式预览
            openPreview(cardData.appName, cardData.id, 'yy-base');
        } else if (cardData.sceneType == 'process') {
            //  步骤式预览
            openPreview(cardData.appName, cardData.id, 'Step-base');
        }
    };

    return (
        <div className={styles.appTemplateCard}>
            <div className={styles.appCardCont}>
                {appTempForm.appPicture ? <img src={appTempForm.appPicture} /> : <div className={styles.appCardDot}></div>}
                <div className={styles.operateBtns}>
                    <span
                        className={styles.previewBtn}
                        onClick={() => {
                            previewBtnClick();
                        }}
                    >
                        预览
                    </span>
                    <span className={styles.modifyBtn} onClick={handleOpenAppBaseModal}>
                        使用
                    </span>
                    {/* 弹窗组件 */}
                    <Modal
                        className={styles.addTempModal}
                        title="新增应用"
                        open={modalAppBaseVisible}
                        onCancel={handleCloseAppBaseModal}
                        styles={modalStyles}
                        footer={null} // 移除默认底部按钮
                        width={800}
                        maskClosable={false} // 设置为false，点击遮罩不关闭
                        destroyOnClose // 关闭时销毁子元素
                    >
                        <AppBaseInfoDialog
                            onReset={handleCloseAppBaseModal}
                            onSearch={(options) => {
                                handleCloseAppBaseModal();
                                addCanvans(options);
                            }}
                            baseInfo={appTempForm}
                            appTypeList={appTypeList}
                        />
                    </Modal>
                </div>
            </div>
            <div className={styles.appCardBottom}>
                <h1>{appTempForm.appName}</h1>
            </div>
        </div>
    );
};
export default AppTempCont;
