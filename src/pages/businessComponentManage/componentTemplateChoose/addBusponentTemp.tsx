import React, { useState, useEffect } from 'react';
import { Input, Select, Button, TreeSelect, Spin } from 'antd';
import { message } from '@/utils/AntdGlobal';
import type { TreeSelectProps } from 'antd';
import styles from './index.module.less';
import { publictData } from '../../../utils/appMenuData';
import { fromPairs } from 'lodash-es';
import { CommponentItem, ComponentTempData, BusinessData, OptionItem } from '../businessComponentMangeTypes';
import BusinessCategoryConfig from './businessCategoryConfig';

const { TextArea } = Input;

const { Option } = Select;

interface SearchFormProps {
    confirmEvent?: (values: ComponentTempData) => void;
    editconfirmEvent?: (data: any) => void;
    cancelEvent: () => void;
    componentData: CommponentItem;
    businessListData: BusinessData[];
    editData?: ComponentTempData;
    bannedCheckFlag?: boolean;
}

// 定义原始数据类型
interface BusinessItem {
    // createStaffId: string;
    // createTime: string;
    businessId: string;
    businessName: string;
    // businessCategory: string;
    // updateStaffId: string;
    // updateTime: string;
    parentId?: string; // 父级ID，一级分类为空
    businessLevel?: string; // 层级 1/2
}

// 定义树节点类型（适配Antd TreeSelect）
interface TreeNode {
    value: string; // 对应businessId
    title: string; // 对应businessName
    key: string; // 唯一标识，同value
    disabled: boolean; // 是否禁用选择（一级分类禁用）
    children?: TreeNode[]; // 子节点（二级分类）
}

const AddComponentTemp: React.FC<SearchFormProps> = ({
    confirmEvent,
    editconfirmEvent,
    cancelEvent,
    componentData,
    businessListData,
    editData,
    bannedCheckFlag = true,
}) => {
    const [options, setOptions] = useState<ComponentTempData>({
        provId: '',
        serviceTypeId: '',
        staffId: componentData.updateStaffId,
        componentName: '', // 模板名称
        componentDesc: '', // 业务组件描述
        businessId: '', // 业务分类
        businessName: '', // 业务分类名称
        belongModule: '', //归属Name模块
        serviceLink: '', // 服务环节
        componentCategory: '1', //模板类别
        componentLevel: '2', //适用范围
        ...componentData,
        ...editData,
    });

    // 控制业务分类配置弹窗
    const [categoryModalVisible, setCategoryModalVisible] = useState<boolean>(false);

    // 处理数据，构建树结构
    const buildTreeData = (data: BusinessItem[]): TreeNode[] => {
        // 1. 过滤：只保留有businessLevel的节点
        const validData = data.filter((item) => item.businessLevel);

        // 2. 提取一级节点（level=1）
        const level1Nodes = validData
            .filter((item) => item.businessLevel === '1')
            .map((item) => ({
                value: item.businessId,
                title: item.businessName,
                key: item.businessId,
                disabled: true, // 一级分类禁用选择
                children: [] as TreeNode[],
            }));

        // 3. 提取二级节点（level=2）并挂载到对应父节点
        const level2Nodes = validData.filter((item) => item.businessLevel === '2');
        level2Nodes.forEach((level2Item) => {
            // 找到父节点（一级节点）
            const parentNode = level1Nodes.find((node) => node.value === level2Item.parentId);
            if (parentNode) {
                parentNode.children?.push({
                    value: level2Item.businessId,
                    title: level2Item.businessName,
                    key: level2Item.businessId,
                    disabled: false, // 二级分类可选
                });
            }
        });

        // // 4. 过滤掉没有子节点的一级节点（可选，根据业务需求）
        // return level1Nodes.filter(node => node.children?.length > 0);
        return level1Nodes;
    };

    const treeData = buildTreeData(businessListData);

    const handleChange = (value: string, label: any) => {
        console.log(label, 'labellabel');

        setOptions((prev) => ({
            ...prev,
            businessId: value,
            businessName: label[0],
        }));
        // console.log("选中的二级分类ID：", value);
        // const selectedItem = businessListData.find(item => item.businessId === value);
        // console.log("选中的二级分类详情：", selectedItem);
    };

    // 自定义节点渲染（给占位节点加样式类）
    const renderTreeNode = (props: any) => {
        const { node } = props;
        // 给禁用节点（一级节点）添加专属样式类
        const nodeClass = node.disabled && !node.isPlaceholder ? 'disabled-tree-node' : node.isPlaceholder ? 'placeholder-tree-node' : '';

        return <span className={nodeClass}>{node.title}</span>;
    };
    // TreeSelect配置
    const treeSelectProps: TreeSelectProps = {
        treeData: treeData,
        placeholder: '请选择二级分类',
        value: options.businessId,
        style: { width: 450 },
        onChange: handleChange,
        treeNodeFilterProp: 'title', // 搜索时匹配title（分类名称）
        treeDefaultExpandAll: true, // 默认展开所有一级节点
        // treeNodeRender: renderTreeNode, // 自定义节点渲染
    };

    // 打开弹窗
    const handleOpenCategoryModal = () => {
        setCategoryModalVisible(true);
    };

    // 关闭弹窗
    const handleCloseCategoryModal = () => {
        setCategoryModalVisible(false);
    };

    const closeDialog = () => {
        cancelEvent();
    };

    const saveTempData = () => {
        const baseInfo: ComponentTempData = {
            belongModule: options.belongModule,
            businessId: options.businessId,
            businessName: options.businessName,
            componentCategory: options.componentCategory,
            componentDesc: options.componentDesc,
            componentLevel: options.componentLevel,
            componentName: options.componentName,
            provId: options.componentLevel === '2' ? options.provId : '0000',
            serviceLink: options.serviceLink,
            serviceTypeId: options.componentLevel === '2' ? options.serviceTypeId : '0000',
            staffId: options.staffId,
            dataType: '1',
            templateId: options.id,
        };

        // 校验业务组件名称
        if (baseInfo.componentName === '') {
            message.error('请输入业务组件名称！');
            return;
        }
        if(!baseInfo.componentLevel){
            message.error('请输入业务组件适用范围！');
            return;
        }
        // 校验业务分类
        if (baseInfo.businessId === '') {
            message.error('请选择业务分类！');
            return false;
        }
        // 校验业务组件描述
        if (baseInfo.componentDesc === '') {
            message.error('请输入业务组件描述！');
            return false;
        }

        if (editData) {
            editconfirmEvent && editconfirmEvent(baseInfo);
            cancelEvent();
        } else {
            confirmEvent && confirmEvent(baseInfo);
        }
    };

    // 组件名称
    const componentNameChange = (e: { target: { name: string; value: string } }) => {
        const { name, value } = e.target;
        setOptions((prev) => ({
            ...prev,
            componentName: value,
        }));
    };

    const { appBelongModuleArr, componentTypeInfo, appServiceLinkArr, appPlatLevelArr } = publictData;

    //适用范围
    const randetLevelItems = (data: OptionItem[]) => {
        return data.map((item: OptionItem) => {
            const activeClass = item.value === options.componentLevel ? 'componentItemNameActive' : '';
            return (
                <div className={[styles.componentItemName, styles[activeClass]].join(' ')} key={item.value} onClick={() => handleLevelClick(item)}>
                    {item.label}
                </div>
            );
        });
    };
    // 适用范围点击
    const handleLevelClick = (item: OptionItem) => {
        if (editData) return;
        setOptions((prev) => ({
            ...prev,
            componentLevel: item.value,
        }));
    };
    // 业务组件类别
    const randerCategoryItems = (data: OptionItem[]) => {
        return data.map((item: OptionItem) => {
            const baseClass = 'componentItemName'; // 基础类名
            const activeClass = item.value === options.componentCategory ? 'componentItemNameActive' : '';
            return (
                <div className={[styles.componentItemName, styles[activeClass]].join(' ')} key={item.value} onClick={() => handleCategoryClick(item)}>
                    {item.label}
                </div>
            );
        });
    };

    // 业务组件类别点击
    const handleCategoryClick = (item: OptionItem) => {
        if (bannedCheckFlag) return;
        console.log(item, 'itemitem');

        setOptions((prev) => ({
            ...prev,
            componentCategory: item.value,
            //    businessName: item.businessName,
        }));
    };
    // 业务分类
    const randerBusinessCategoryItems = (data: BusinessData[]) => {
        const businessIdFifter: BusinessData[] = data.filter((item: BusinessData) => {
            return item.businessCategory === options.componentCategory;
        });
        return businessIdFifter.map((item: BusinessData) => {
            const activeClass = item.businessId === options.businessId ? 'businessNameActive' : '';
            return (
                <div
                    className={[styles.componentItemName, styles[activeClass]].join(' ')}
                    key={item.businessId}
                    onClick={() => handleBusinessIdClick(item)}
                >
                    {item.businessName}
                </div>
            );
        });
    };
    const handleBusinessIdClick = (item: BusinessData) => {
        setOptions((prev) => ({
            ...prev,
            businessId: item.businessId,
        }));
    };

    //归属模块切换
    const belongModuleChange = (value: string) => {
        setOptions((prev) => ({
            ...prev,
            belongModule: value,
        }));
    };
    // 服务环节
    const serviceLinkChange = (value: string) => {
        setOptions((prev) => ({
            ...prev,
            serviceLink: value,
        }));
    };

    // 组件描述
    const schemeDescChange = (e: { target: { name: string; value: string } }) => {
        const { name, value } = e.target;
        setOptions((prev) => ({
            ...prev,
            componentDesc: value,
        }));
    };

    return (
        <div className={styles.componentTempDialog}>
            <div className={styles.componentInfoDom}>
                <div className={styles.optionsItem}>
                    <label>
                        <span>*</span>业务组件名称:
                    </label>
                    <div className={styles.optionsItemCont}>
                        <Input
                            name="componentName"
                            className="componentName"
                            value={options.componentName}
                            placeholder="请输入"
                            onChange={componentNameChange}
                        />
                    </div>
                </div>
                <div className={styles.optionsItem}>
                    <label>
                        <span>*</span>适用范围:
                    </label>
                    <div className={styles.optionsItemCont}>
                        <div className={[styles.componentLevel, styles[editData ? 'bannedClick' : '']].join(' ')}>
                            {randetLevelItems(appPlatLevelArr)}
                        </div>
                    </div>
                </div>
                <div className={styles.optionsItem}>
                    <label>
                        <span>*</span>业务组件类别:
                    </label>
                    <div className={styles.optionsItemCont}>
                        <div className={[styles.componentCategory, styles[bannedCheckFlag ? 'bannedClick' : 'enableClick']].join(' ')}>
                            {randerCategoryItems(componentTypeInfo)}
                        </div>
                    </div>
                </div>
                <div className={[styles.optionsItem, styles.businessCategoryCont].join(' ')}>
                    <label>
                        <span>*</span>业务分类:
                    </label>
                    <div className={styles.optionsItemCont}>
                        <div className={styles.businessCategoryDom}>
                            {/* {randerBusinessCategoryItems(businessListData)} */}
                            <TreeSelect {...treeSelectProps} />
                            <button
                                className={styles.addAppTypeBtn}
                                style={{ display: 'none' }}
                                onClick={() => {
                                    handleOpenCategoryModal();
                                }}
                            >
                                +业务分类
                            </button>
                        </div>
                    </div>
                </div>
                {/* <div className={[styles.optionsItem, styles.belongLinkCont].join(' ')}>
                    <label>归属模块:</label>
                    <div className={styles.optionsItemCont}>
                        <Select
                            className={styles.belongLinkSelect}
                            placeholder="请选择"
                            value={options.belongModule}
                            options={appBelongModuleArr}
                            onChange={belongModuleChange}
                        ></Select>
                    </div>
                </div>
                {options.componentCategory === '1' && (
                    <div className={[styles.optionsItem, styles.serviceLinkCont].join(' ')}>
                        <label>服务环节:</label>
                        <div className={styles.optionsItemCont}>
                            <Select
                                className={styles.serviceLinkSelect}
                                value={options.serviceLink}
                                options={[
                                    {
                                        label: '请选择',
                                        value: '-1',
                                        id: '-1',
                                    },
                                ].concat(appServiceLinkArr)}
                                onChange={serviceLinkChange}
                            // 属性控制挂载节点
                            // getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
                            ></Select>
                        </div>
                    </div>
                )} */}
                <div className={[styles.optionsItem, styles.schemeDesc].join(' ')}>
                    <label>
                        <span>*</span>业务组件描述:
                    </label>
                    <div className={styles.optionsItemCont}>
                        <TextArea
                            rows={4}
                            className="schemeDescInput"
                            value={options.componentDesc}
                            placeholder="请输入"
                            maxLength={100}
                            onChange={schemeDescChange}
                        />
                    </div>
                </div>
            </div>

            <div className={styles.busiButton}>
                <Button type="primary" onClick={saveTempData} style={{ marginRight: 8 }}>
                    确定
                </Button>
                <Button onClick={closeDialog}>取消</Button>
            </div>
            {categoryModalVisible && <BusinessCategoryConfig onClose={handleCloseCategoryModal} componentCategory={options.componentCategory} />}
        </div>
    );
};

export default AddComponentTemp;
