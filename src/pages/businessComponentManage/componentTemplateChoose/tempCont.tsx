import React, { Component, useEffect, useRef, useState } from 'react';
import { Select, Input, Spin, Alert, Modal } from 'antd';
import AddBusponentTemp from './addBusponentTemp';
import BusinessComponentPreview from '../businessComponentPreview';

import { CommponentItem, ComponentTempData, BusinessData } from '../businessComponentMangeTypes';
import { menu } from '@/stores/menuStore';

import styles from './index.module.less';

interface IProps {
    cardData: CommponentItem;
    key: string;
    confirmEvent: (data: ComponentTempData) => void;
    BusinessListData: BusinessData[];
}

const TempCont: React.FC<IProps> = ({ cardData, confirmEvent, BusinessListData }) => {
    const [ngshCenterPermission, setNgshCenterPermission] = useState<string>('1');
    const [componentData, setDomponentData] = useState<CommponentItem>({ ...cardData });
    // 预览方法
    const openPreview: any = menu((state) => state.openPreview);

    // 控制使用弹窗显示状态
    const [baseModalVisible, setBaseModalVisible] = useState(false);
    // 打开弹窗
    const handleOpenBaseModal = () => {
        setBaseModalVisible(true);
    };

    // 关闭弹窗
    const handleCloseBaseModal = () => {
        setBaseModalVisible(false);
    };
    // 控制预览弹窗显示状态
    const [previewVisible, setPreviewVisible] = useState(false);
    const handlePreviewModal = () => {
        // setPreviewVisible(true);
        openPreview(cardData.componentName, cardData.id, 'ywzj');
    };
    const handleClosePreviewModal = () => {
        setPreviewVisible(false);
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

    const handleConfirmEvent = (data: ComponentTempData) => {
        confirmEvent(data);
        setBaseModalVisible(false);
    };

    return (
        <div className={styles.searchComponentDiv}>
            <div className={styles.cardPageComponent}>
                <div className={styles.componentCont}>{cardData.componentPicture ? <img src={cardData.componentPicture} /> : ''}</div>
                <div className={styles.componentContRemark}></div>
                <div className={styles.operateComponent}>
                    <div className={[styles.operateBtn, styles.viewComponentBtn].join(' ')} onClick={handlePreviewModal}>
                        预览
                    </div>
                    <div className={[styles.operateBtn, styles.useComponentBtn].join(' ')} onClick={handleOpenBaseModal}>
                        使用
                    </div>
                    {/*新增业务组件 弹窗组件 */}
                    <Modal
                        className={styles.addTempModal}
                        title="新增业务组件"
                        open={baseModalVisible}
                        onCancel={handleCloseBaseModal}
                        styles={modalStyles}
                        maskClosable={false} // 设置为false，点击遮罩不关闭
                        footer={null} // 移除默认底部按钮
                        width={800}
                        destroyOnClose // 关闭时销毁子元素
                    >
                        <AddBusponentTemp
                            componentData={componentData}
                            cancelEvent={handleCloseBaseModal}
                            confirmEvent={handleConfirmEvent}
                            businessListData={BusinessListData}
                        />
                    </Modal>

                    {/*业务组件预览弹窗组件 */}
                    <Modal
                        title={`${componentData.componentName}详情`}
                        open={previewVisible}
                        onCancel={handleClosePreviewModal}
                        maskClosable={false} // 设置为false，点击遮罩不关闭
                        styles={modalStyles}
                        footer={null} // 移除默认底部按钮
                        width={850}
                        destroyOnClose // 关闭时销毁子元素
                    >
                        <BusinessComponentPreview
                            componentData={componentData}
                            BusinessListData={BusinessListData}
                            cancelEvent={handleClosePreviewModal}
                        />
                    </Modal>
                </div>
            </div>
            <div className={styles.componentTitle}>
                <div className={styles.titleName} title={componentData.componentName}>
                    {componentData.componentName}
                </div>
            </div>
        </div>
    );
};
export default TempCont;
