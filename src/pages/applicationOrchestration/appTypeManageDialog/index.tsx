import React, { useEffect, useState } from 'react';
import { Modal, Input, Select, Button, Space, Form } from 'antd';
import { message } from '@/utils/AntdGlobal';
import styles from './index.module.less';
import { crossApiUserInfo } from '@/stores/crossapiStore';
import request from '@/utils/request';
import recodeLog from '../../../utils/operLog';

interface ModalProps {
    appCategory: string;
    onSaveManage: () => void;
    onCloseManage: () => void;
    data: any;
    type: string;
    categoryType?: string;
}

const AppTypeManageDialog: React.FC<ModalProps> = ({ appCategory, onSaveManage, onCloseManage, data, type, categoryType }) => {
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);

    const [dialogTitle, setDialogTitle] = useState('新增');
    const [levelText, setLevelText] = useState('一级');

    const [form] = Form.useForm();
    const initialValues = {
        provId: userInfo.provinceId,
        typeLevel: '1',
        appTypeCategory: appCategory,
    };
    
    // 判断是标签分类还是应用分类
    const isTagCategory = categoryType === '2';
    const categoryTypeName = isTagCategory ? '标签分类' : '应用分类';
    const appTypeProductLevelObj: { [key: string]: string } = {
        '1': '一级',
        '2': '二级',
        '3': '三级',
        '4': '四级',
        '5': '五级',
        '6': '六级',
    };

    const appTypeProductLevelOptions = [
        { label: '请选择', value: '' },
        { label: '一级', value: '1' },
        { label: '二级', value: '2' },
        { label: '三级', value: '3' },
        { label: '四级', value: '4' },
        { label: '五级', value: '5' },
        { label: '六级', value: '6' },
    ];

    const appCategoryOptions = [
        { label: '生产应用', value: '1' },
        { label: '运营应用', value: '2' },
    ];

    const [levelOptions, setLevelOptions] = useState(appTypeProductLevelOptions);

    const handleSubmit = () => {
        form.validateFields().then((values) => {
            saveAppTypeInfo();
        });
    };

    const saveAppTypeInfo = async () => {
        // 如果有总部权限则省份id传4个0000，如果没有总部权限（但是有对应的管控权限）则传坐席的省份; 注：（能进新增、编辑页面代表已经有权限）
        const provId = userInfo.ngshCenterPermission == '0' ? userInfo.provinceId : '0000';

        const params = {
            provId: provId,
            staffId: userInfo.staffId,
            pId: data.appTypeId || '0',
            ...form.getFieldsValue(),
            ...(categoryType && { categoryType: categoryType }), // 当categoryType存在时才添加该参数
        };

        // 修改应用分类接口
        if (type == 'edit') {
            // 修改时有appTypeId
            params.appTypeId = data.appTypeId;
            params.pId = data.pId || '0';
        } else {
            // 新增时有创建人工号
            params.createStaffId = userInfo.staffId;
        }
        const result = await request.post('/appType/saveAppTypeInfo', { params: params });
        if (result.returnCode === '0') {
            message.success(`${levelText} ${categoryTypeName}保存成功！`);
            const logParams = {
                provCode: userInfo.provinceId, // 8位省份编码
                modelName: '', // 所属模块  暂时为空
                pageName: '', // 所属菜单   暂时为空
                dataType: categoryTypeName, // 数据类型（应用、元素、组件、接口）
                operType: params.appTypeId ? '编辑' : '新增', // 操作类型（新增/编辑/删除/导入）
                dataId: params.appTypeId || '', // 操作数据ID
                dataName: params.appTypeName, // 操作数据名称
                editContent: `${(params.appTypeId ? '编辑' : '新增') + params.appTypeName}${categoryTypeName}`, // 操作内容简述
                staffId: userInfo.staffId, // 操作人工号
            };
            recodeLog(logParams);
        }
        form.resetFields();
        onSaveManage();
    };

    const getRules = (levelText: string) => [
        {
            required: true,
            message: `请输入${levelText}分类名称！`,
        },
        {
            max: 20,
            message: `${levelText}分类名称限20个字符！`,
        },
    ];
    useEffect(() => {
        let level = data.typeLevel;
        if (type === 'add') {
            level = String(Number(data.typeLevel) + 1);
        }

        if (type === 'edit') {
            form.setFieldsValue({ appTypeName: data.appTypeName || '' });
        }

        setLevelText(appTypeProductLevelObj[level]);
        form.setFieldsValue({ typeLevel: level });
        form.setFieldsValue({ appTypeCategory: data.appTypeCategory });

        if (type === 'add') {
            setDialogTitle('新增');
        }
        if (type === 'edit') {
            setDialogTitle('编辑');
        }
    }, []);

    return (
        <Modal
            title={dialogTitle + levelText + categoryTypeName}
            centered
            open={true}
            onOk={handleSubmit}
            onCancel={() => {
                onCloseManage();
            }}
            destroyOnClose
            // footer={null}
            maskClosable={false}
            width={600}
            classNames={{
                content: 'customModalContent',
                header: 'customModalHeader',
                footer: 'customModalFooter',
            }}
        >
            <div className={styles.appTypeManageContent}>
                <Form form={form} layout="horizontal" initialValues={initialValues} requiredMark={false}>
                    <Form.Item label={levelText + '分类名称'} name="appTypeName" rules={getRules(levelText)}>
                        <Input placeholder="请输入（最大可输入20个字符）" />
                    </Form.Item>
                    <Form.Item label={isTagCategory ? '标签分类级别' : '应用分类级别'} name="typeLevel">
                        <Select placeholder="请选择" disabled options={levelOptions}></Select>
                    </Form.Item>
                    <Form.Item label="归属应用类别" name="appTypeCategory">
                        <Select placeholder="请选择" disabled options={appCategoryOptions}></Select>
                    </Form.Item>
                </Form>
            </div>
        </Modal>
    );
};

export default AppTypeManageDialog;
