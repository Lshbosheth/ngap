import React, { Component, useEffect, useRef, useState } from 'react';
import styles from '../index.module.less';
import { Modal, Button } from 'antd';
import { ExclamationCircleTwoTone } from '@ant-design/icons';
import { componentTempData, BusinessData, CommponentItem } from '../templateManageTypes';
import BusinessTemplatePreview from '../businessTemplatePreview';
import { menu } from '@/stores/menuStore';

interface IProps {
    cardData: CommponentItem;
    key: string;
    onDelete: (itemId: string) => void;
    jumpEditorPage: (pos: string, data: componentTempData) => void;
    businessData: BusinessData[];
}
const CommponentCard: React.FC<IProps> = ({ jumpEditorPage, onDelete, cardData, businessData }) => {
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const openPreview: any = menu((state) => state.openPreview);
    const [deleteVisible, setDeleteVisible] = useState(false); // 删除二次确认弹窗显隐
    // 预览弹窗样式
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
    // 编辑按钮点击
    const handleEditClick = () => {
        const jumpData: componentTempData = {
            provId: cardData.provId ?? '',
            serviceTypeId: cardData.serviceTypeId ?? '',
            staffId: cardData.updateStaffId ?? '',
            componentName: cardData.componentName ?? '', // 模板名称
            componentDesc: cardData.componentDesc ?? '', // 业务组件描述
            businessId: cardData.businessId ?? '', // 业务分类
            serviceLink: cardData.serviceLink ?? '', // 服务环节
            componentCategory: cardData.componentCategory ?? '', //模板类别
            dataType: '3',
            id: cardData.id ? cardData.id : '',
        };
        jumpEditorPage('1', jumpData);
    };

    // 打开弹窗
    const handleOpenModal = () => {
        setModalVisible(true);
    };

    // 关闭弹窗
    const handleCloseModal = () => {
        setModalVisible(false);
    };
    // 预览按钮点击
    const handlePreviewClick = () => {
        openPreview(cardData.componentName, cardData.id, 'ywzj');
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

    const operateBtnEvent = () => {
        return (
            <div className={styles.operateComponent}>
                <div
                    className={[styles.operateBtn, styles.viewComponentBtn].join(' ')}
                    onClick={() => {
                        handlePreviewClick();
                    }}
                >
                    预览
                </div>
                <div
                    className={[styles.operateBtn, styles.editComponentBtn].join(' ')}
                    onClick={() => {
                        handleEditClick();
                    }}
                >
                    编辑
                </div>
                <div
                    className={[styles.operateBtn, styles.delComponentBtn].join(' ')}
                    onClick={() => {
                        handleDeleteClick();
                    }}
                >
                    删除
                </div>
            </div>
        );
    };
    return (
        <div className={styles.searchComponentDiv} id={cardData.id}>
            {/* 这里写组件预览 */}
            <div className={styles.componentCont}>{cardData.componentPicture ? <img src={cardData.componentPicture} /> : '这里写组件预览'}</div>
            <div className={styles.componentContRemark}></div>
            <div className={styles.componentTitle}>
                <div className={styles.titleName} title={cardData.componentName}>
                    {cardData.componentName}
                </div>
                {/* <div>{cardData.provId === "0000" ? (<span className="componentProv componentProvCenter">中心</span>) : (<span className="componentProv">{cardData.provId}</span>)}</div> */}
                {operateBtnEvent()}
            </div>
            {/* 弹窗组件 */}
            <Modal
                title={`${cardData.componentName}详情`}
                open={modalVisible}
                onCancel={() => {
                    handleCloseModal;
                }}
                maskClosable={false} // 设置为false，点击遮罩不关闭
                styles={modalStyles}
                footer={null} // 移除默认底部按钮
                width={850}
                destroyOnClose // 关闭时销毁子元素
            >
                <BusinessTemplatePreview componentData={cardData} BusinessListData={businessData} cancelEvent={handleCloseModal} />
            </Modal>
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
                        <div style={{ fontSize: '13px', color: '#666666' }}>请确认是否删除</div>
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
