import React, { Component, useEffect, useRef, useState } from 'react';
import styles from '../index.module.less';
import { Modal, Button } from 'antd';
import { ExclamationCircleTwoTone } from '@ant-design/icons';
import { componentTempData, appTempData } from '../templateManageTypes';
import { menu } from '@/stores/menuStore';

interface CommponentItem {
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
    appPicture?: string; //应用缩略图
}
interface IProps {
    cardData: CommponentItem;
    key: string;
    onDelete: (itemId: string) => void;
    jumpEditorPage: (pos: string, data: appTempData) => void;
}
interface IStates {
    cardData: CommponentItem;
    ngshCenterPermission: string;
}
const CommponentCard: React.FC<IProps> = ({ cardData, onDelete, jumpEditorPage }) => {
    const openPreview = menu((state) => state.openPreview);
    const [deleteVisible, setDeleteVisible] = useState(false); // 删除二次确认弹窗显隐
    // 编辑按钮点击
    const handleEditClick = () => {
        const jumpData: appTempData = {
            provId: cardData.provId ?? '',
            serviceTypeId: cardData.serviceTypeId ?? '',
            staffId: cardData.updateStaffId ?? '',
            appName: cardData.appName ?? '', // 模板名称
            appCategory: cardData.appCategory ?? '',
            appDesc: cardData.appDesc ?? '', // 业务组件描述
            sceneType: cardData.sceneType ?? '',
            appTypeId: cardData.appTypeId ?? '',
            belongModule: cardData.belongModule ?? '',
            dataType: '3',
            id: cardData.id ? cardData.id : '',
        };

        jumpEditorPage('2', jumpData);
    };

    // 处理删除按钮点击事件：调用父组件传递的 onDelete 回调
    const handleDeleteClick = () => {
        setDeleteVisible(true);
    };

    // 二次确认方法
    const reconfirmFun = () => {
        if (cardData?.id && onDelete) {
            setDeleteVisible(false);
            onDelete(cardData.id);
        } else {
            console.warn('id 不存在，无法执行删除');
        }
    };

    // 装配式预览
    const previewBtnClick = () => {
        if (cardData.sceneType == 'base') {
            //  装配式预览
            openPreview(cardData.appName, cardData.id, 'yy-base');
        } else if (cardData.sceneType == 'process') {
            //  步骤式4预览
            openPreview(cardData.appName, cardData.id, 'Step-base');
        }
    };
    return (
        <div className={styles.appTemplateCard}>
            <div className={styles.appCardCont}>
                {cardData.appPicture ? <img src={cardData.appPicture} /> : <div className={styles.appCardDot}></div>}
            </div>
            <div className={styles.appCardBottom}>
                <h1>{cardData.appName}</h1>
                <div className={styles.operateBtns}>
                    <span
                        className={styles.previewBtn}
                        onClick={() => {
                            previewBtnClick();
                        }}
                    >
                        预览
                    </span>
                    <span
                        className={styles.modifyBtn}
                        onClick={() => {
                            handleEditClick();
                        }}
                    >
                        编辑
                    </span>
                    <span
                        className={styles.deleteBtn}
                        onClick={() => {
                            handleDeleteClick();
                        }}
                    >
                        删除
                    </span>
                </div>
            </div>
            {/* 二次确认弹窗 */}
            <Modal
                // wrapClassName={styles.modal}
                open={deleteVisible}
                closable={false}
                maskClosable={false}
                onCancel={() => setDeleteVisible(false)}
                width={420}
                footer={null} // 移除默认底部按钮
                destroyOnClose // 关闭时销毁子元素
            >
                <div style={{ marginTop: 36 }}>
                    <div style={{ display: 'inline-block', margin: '0px 20px 116px 15px' }}>
                        <ExclamationCircleTwoTone twoToneColor="#FFAB00" style={{ fontSize: '48px' }} />
                    </div>
                    <div style={{ display: 'inline-block', width: 'calc(100% - 85px)', verticalAlign: 'top' }}>
                        <div style={{ fontSize: '16px', color: '#333333', fontWeight: 'bold' }}>提示</div>
                        <div style={{ fontSize: '13px', color: '#666666' }}>是否确定删除该应用模板？</div>
                    </div>
                </div>
                <div
                    style={{
                        height: '60px',
                        width: '420px',
                        background: '#F9FAFC',
                        position: 'absolute',
                        bottom: '0px',
                        left: '0px',
                        borderTop: '1px solid #D0D6D9',
                        textAlign: 'center',
                        paddingTop: '10px',
                    }}
                >
                    <Button type="primary" onClick={() => reconfirmFun()} style={{ marginRight: 17, width: '140px', height: '40px' }}>
                        确定
                    </Button>
                    <Button onClick={() => setDeleteVisible(false)} style={{ width: '140px', height: '40px' }}>
                        取消
                    </Button>
                </div>
            </Modal>
        </div>
    );
};
export default CommponentCard;
