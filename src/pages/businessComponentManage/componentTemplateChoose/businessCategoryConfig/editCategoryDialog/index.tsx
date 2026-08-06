import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Select, Input, Button, Modal } from 'antd';
import { message } from '@/utils/AntdGlobal';
const { Option } = Select;
import request from '@/utils/request';
import { crossApiUserInfo } from '@/stores/crossapiStore';
import recodeLog from '../../../../../utils/operLog';

import styles from './index.module.less';
interface BussinessItem {
    businessName: string;
    businessId: string;
    createStaffId: string;
    parentId?: string;
    businessLevel?: string;
}
interface parentProps {
    onClose: () => void;
    onSaved: () => void;
    componentCategory: string;
    bussinessItem: BussinessItem;
    type: string;
}
interface SaveBusinessParam {
    businessName: string;
    businessId?: string;
    updateStaffId?: string;
    createStaffId?: string;
    businessCategory: string;
    businessLevel?: string;
    parentId?: string;
}

const EditCategoryDialog: React.FC<parentProps> = ({ onClose, onSaved, componentCategory, bussinessItem, type }) => {
    let businsslevel = bussinessItem.businessLevel ? bussinessItem.businessLevel : '0';
    if (type === 'add') {
        businsslevel = String(parseInt(businsslevel) + 1);
    }
    console.log(bussinessItem);
    console.log(type);
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
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

    const businessLevelOptions = [
        { label: '请选择', value: '' },
        { label: '一级', value: '1' },
        { label: '二级', value: '2' },
    ];
    const businessLevelObj: { [key: string]: string } = {
        '1': '一级',
        '2': '二级',
    };
    const [categoryNm, setcategoryNm] = useState<string>('');

    const categoryNmChange = (e: { target: { name: string; value: string } }) => {
        const { name, value } = e.target;
        setcategoryNm(value);
    };

    // 首次进入页面监听业务分类名称变化
    useEffect(() => {
        setcategoryNm(bussinessItem.businessName);
    }, [bussinessItem]);

    const saveTempData = () => {
        if (categoryNm.length == 0) {
            message.error('请输入业务分类名称！');
            return;
        }
        if (categoryNm.length > 20) {
            message.error('业务分类名称限20个字符!');
            return;
        }

        // 新增/修改业务分类
        const saveUrl = 'appComponentBusiness/saveComponentBusiness';
        const saveParam: SaveBusinessParam = {
            businessName: categoryNm,
            businessCategory: componentCategory,
        };
        // 修改入参
        if (type === 'edit') {
            // 修改时有businessId
            saveParam.createStaffId = bussinessItem.createStaffId;
            saveParam.updateStaffId = userInfo.staffId;
            saveParam.businessId = bussinessItem.businessId ? bussinessItem.businessId : '';
        } else {
            // 新增时有创建人工号
            saveParam.createStaffId = userInfo.staffId;
            saveParam.parentId = bussinessItem.parentId;
            saveParam.businessLevel = businsslevel;
        }

        // 保存业务分类
        request
            .post(saveUrl, { params: saveParam })
            .then((result) => {
                if (result && result.returnCode == '0') {
                    message.success('业务分类保存成功！');
                    onSaved();
                    const logParams = {
                        provCode: userInfo.provinceId, // 8位省份编码
                        modelName: '', // 所属模块  暂时为空
                        pageName: '', // 所属菜单   暂时为空
                        dataType: '业务组件分类', // 数据类型（应用、元素、组件、接口）
                        operType: bussinessItem.businessId ? '编辑' : '新增', // 操作类型（新增/编辑/删除/导入）
                        dataId: bussinessItem.businessId || '', // 操作数据ID
                        dataName: saveParam.businessName, // 操作数据名称
                        editContent: `${(bussinessItem.businessId ? '编辑' : '新增') + saveParam.businessName}业务组件分类`, // 操作内容简述
                        staffId: userInfo.staffId, // 操作人工号
                    };
                    recodeLog(logParams);
                }
            })
            .catch((err) => {});
    };

    return (
        <Modal
            className={styles.editCategoryDialog}
            title={`${bussinessItem.businessId ? '编辑' : '新增'}业务分类`}
            centered
            open={true}
            onCancel={() => {
                onClose();
            }}
            destroyOnClose
            footer={null}
            maskClosable={false}
            width={480}
            styles={modalStyles}
        >
            <div className={styles.categoryEditContent}>
                <div className={styles.configItem}>
                    <label>业务分类名称</label>
                    <div className={styles.nodeItem}>
                        <div className={styles.categoryNmInput}>
                            <Input name="categoryNmInput" value={categoryNm} placeholder="请输入" onChange={categoryNmChange} />
                        </div>
                    </div>
                </div>
                <div className={styles.configItem}>
                    <label>业务分类级别</label>
                    <div className={styles.nodeItem}>
                        <Select className={styles.businessLevelSelect} disabled onChange={() => {}} value={businsslevel} placeholder="请选择">
                            {businessLevelOptions.map((item) => (
                                <Option key={item.value} value={item.value}>
                                    {item.label}
                                </Option>
                            ))}
                        </Select>
                    </div>
                </div>
            </div>
            <div className={styles.buttonGroup}>
                <Button
                    type="primary"
                    onClick={() => {
                        saveTempData();
                    }}
                    style={{ marginRight: 8 }}
                >
                    确定
                </Button>
                <Button
                    onClick={() => {
                        onClose();
                    }}
                >
                    取消
                </Button>
            </div>
        </Modal>
    );
};

export default EditCategoryDialog;
