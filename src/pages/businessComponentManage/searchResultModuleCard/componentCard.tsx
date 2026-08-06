import React, { Component, useEffect, useRef, useState } from 'react';
import { publictData } from '../../../utils/appMenuData';
import { ComponentTempData, BusinessData } from '../businessComponentMangeTypes';
import { Modal, Button } from 'antd';
import { message } from '@/utils/AntdGlobal';
import BusinessComponentPreview from '../businessComponentPreview';
import { menu } from '@/stores/menuStore';
import { ExclamationCircleTwoTone } from '@ant-design/icons';

import '../index.less';

interface CommponentItem {
    belongModule?: string;
    businessId?: string;
    componentCategory: string;
    componentDesc?: string;
    componentLevel?: string;
    componentName?: string;
    componentStatus?: string;
    createStaffId?: string;
    createTime?: string;
    dataType?: string;
    id?: string;
    provId: string;
    serviceLink?: string;
    serviceTypeId?: string;
    updateStaffId?: string;
    updateTime?: string;
    componentPicture?: string;
}
interface IProps {
    jumpEditorPage: (pos: string, data: ComponentTempData) => void;
    deleteModuleCard: (data: ComponentTempData) => void;
    cardData: CommponentItem;
    key: string;
    BusinessListData: BusinessData[];
}

const CommponentCard: React.FC<IProps> = ({ jumpEditorPage, deleteModuleCard, cardData, BusinessListData }) => {
    const [ngshCenterPermission, setNgshCenterPermission] = useState<string>('1');
    const [componentData, setDomponentData] = useState<CommponentItem>({ ...cardData });
    // 控制弹窗显示状态
    const [listCardPreview, setListCardPreviewVisible] = useState(false);
    const [confirmVisible, setConfirmVisible] = useState(false); // 编辑二次确认弹窗显隐
    const [deleteVisible, setDeleteVisible] = useState(false); // 删除二次确认弹窗显隐
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
    // 打开弹窗
    const handleOpenListCardPreviewModal = () => {
        setListCardPreviewVisible(true);
    };

    // 关闭弹窗
    const handleCloseListCardPreviewModal = () => {
        setListCardPreviewVisible(false);
    };

    const operateBtnEvent = (componentData: CommponentItem) => {
        if ((ngshCenterPermission == '1' && componentData.componentLevel == '1') || componentData.componentLevel == '2') {
            return (
                <div className="operateComponent">
                    <div className="operateBtn viewComponentBtn" onClick={() => handlePreviewClick(componentData)}>
                        预览
                    </div>
                    <div className="operateBtn editComponentBtn" onClick={() => handleEditClick(componentData)}>
                        编辑
                    </div>
                    <div className="operateBtn delComponentBtn" onClick={handleDelClick}>
                        删除
                    </div>
                </div>
            );
        }
        return (
            <div className="operateComponent">
                <div className="operateBtn viewComponentBtn" onClick={() => handlePreviewClick(componentData)}>
                    预览
                </div>
            </div>
        );
    };

    const { provId2provName } = publictData;

    // 编辑按钮点击
    const handleEditClick = (componentData: CommponentItem) => {
        // 待审核的不可编辑   需进行提示
        if (componentData.componentStatus === '3') {
            message.error('待审核状态不允许编辑，请先审核！');
            return;
        }
        setConfirmVisible(true);
    };

    const editConfirmClick = () => {
        setConfirmVisible(false);
        const jumpData: ComponentTempData = {
            provId: componentData.provId,
            serviceTypeId: componentData.serviceTypeId,
            staffId: componentData.updateStaffId ? componentData.updateStaffId : '',
            componentName: componentData.componentName, // 模板名称
            componentDesc: componentData.componentDesc, // 业务组件描述
            businessId: componentData.businessId, // 业务分类
            belongModule: componentData.belongModule, //归属模块
            serviceLink: componentData.serviceLink, // 服务环节
            componentCategory: componentData.componentCategory, //模板类别
            componentLevel: componentData.componentLevel, //适用范围
            dataType: '1',
            id: componentData.id ? componentData.id : '',
            componentPicture: componentData.componentPicture ? componentData.componentPicture : '',
        };
        jumpEditorPage('2', jumpData);
    };

    // 删除按钮点击
    const handleDelClick = () => {
        setDeleteVisible(true);
    };

    // 二次确认方法
    const reconfirmFun = () => {
        if (componentData?.id && deleteModuleCard) {
            setDeleteVisible(false);
            deleteModuleCard(componentData);
        } else {
            console.warn('id 不存在，无法执行删除');
        }
    };

    const openPreview: any = menu((state) => state.openPreview);
    // 预览按钮点击
    const handlePreviewClick = (data: any) => {
        openPreview(data.componentName, data.id, 'ywzj');
        // handleOpenListCardPreviewModal();
    };

    return (
        <div className="searchComponentDiv" id={componentData.id}>
            {/* 这里写组件预览 */}
            <div className="componentCont">{componentData.componentPicture ? <img src={componentData.componentPicture} /> : '这里写组件预览'}</div>
            <div className="componentContRemark"></div>
            <div className="componentTitle">
                <div className="titleName" title={componentData.componentName}>
                    {componentData.componentName}
                </div>
                <div>
                    {componentData.provId === '0000' ? (
                        <span className="componentProv componentProvCenter">中心</span>
                    ) : (
                        <span className="componentProv">{provId2provName[cardData.provId]}</span>
                    )}
                </div>
                {operateBtnEvent(componentData)}
            </div>
            {/* 弹窗组件 */}
            <Modal
                title={`${componentData.componentName}详情`}
                open={listCardPreview}
                onCancel={handleCloseListCardPreviewModal}
                maskClosable={false} // 设置为false，点击遮罩不关闭
                styles={modalStyles}
                footer={null} // 移除默认底部按钮
                width={850}
                destroyOnClose // 关闭时销毁子元素
            >
                <BusinessComponentPreview
                    componentData={componentData}
                    BusinessListData={BusinessListData}
                    cancelEvent={handleCloseListCardPreviewModal}
                />
            </Modal>
            {/* 编辑二次确认弹窗组件 */}
            <Modal
                open={confirmVisible}
                closable={false}
                maskClosable={false}
                onCancel={() => setConfirmVisible(false)}
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
                        <div style={{ fontSize: '13px', color: '#666666' }}>仅修改当前组件,不影响应用已关联组件,请确认是否编辑?</div>
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
                    <Button type="primary" onClick={() => editConfirmClick()} style={{ marginRight: 17, width: '140px', height: '40px' }}>
                        确定
                    </Button>
                    <Button onClick={() => setConfirmVisible(false)} style={{ width: '140px', height: '40px' }}>
                        取消
                    </Button>
                </div>
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
