import React, { useState, useEffect } from 'react';
import { Input, TreeSelect, Button } from 'antd';
import { message } from '@/utils/AntdGlobal';
import type { TreeSelectProps } from 'antd';
import styles from '../index.module.less';
import { OptionItem, componentTempData, BusinessData } from '../templateManageTypes';
import { publictData } from '../../../utils/appMenuData';
import { crossApiUserInfo } from '@/stores/crossapiStore';

const { TextArea } = Input;

interface SearchFormProps {
    onSearch: (values: any) => void;
    onReset: () => void;
    addconfirmEvent?: (data: componentTempData) => void;
    editconfirmEvent?: (data: any) => void;
    businessData: BusinessData[];
    editData?: componentTempData;
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
    onSearch,
    onReset,
    addconfirmEvent,
    editconfirmEvent,
    businessData,
    editData,
    bannedCheckFlag = false,
}) => {
    const userInfo = crossApiUserInfo((state) => state.userInfo);
    const [options, setOptions] = useState<componentTempData>({
        provId: userInfo.provinceId,
        serviceTypeId: userInfo.serviceTypeId,
        staffId: userInfo.staffId,
        componentName: '', // 模板名称
        componentDesc: '', // 业务组件描述
        businessId: '', // 业务分类
        serviceLink: '', // 服务环节
        componentCategory: '1', //模板类别
        id: '',
        ...editData,
    });

    const closeDialog = () => {
        onReset();
    };

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

    const treeData = buildTreeData(businessData);

    const handleChange = (value: string) => {
        setOptions((prev) => ({
            ...prev,
            businessId: value,
        }));
        // console.log("选中的二级分类ID：", value);
        // const selectedItem = businessData.find(item => item.businessId === value);
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
        style: { width: 530 },
        onChange: handleChange,
        treeNodeFilterProp: 'title', // 搜索时匹配title（分类名称）
        treeDefaultExpandAll: true, // 默认展开所有一级节点
        // treeNodeRender: renderTreeNode, // 自定义节点渲染
    };

    const saveTempData = () => {
        if (!options.componentName) {
            message.error('请输入模板名称！');
            return;
        }
        if (!options.businessId) {
            message.error('请选择业务分类！');
            return;
        }

        if (!options.componentDesc) {
            message.error('请输入模板描述！');
            return;
        }
        onSearch(options);
        if (editData) {
            editconfirmEvent && editconfirmEvent(options);
            onReset();
        } else {
            addconfirmEvent && addconfirmEvent(options);
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

    const { componentTypeInfo, appServiceLinkArr } = publictData;
    // 业务组件类别
    const randerCategoryItems = (data: OptionItem[]) => {
        return data.map((item: OptionItem) => {
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
        setOptions((prev) => ({
            ...prev,
            componentCategory: item.value,
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
                        <span>*</span>模板名称:
                    </label>
                    <div className={styles.optionsItemCont}>
                        <Input
                            value={options.componentName}
                            name="componentName"
                            className="componentName"
                            placeholder="请输入"
                            onChange={componentNameChange}
                        />
                    </div>
                </div>
                <div className={styles.optionsItem}>
                    <label>
                        <span>*</span>模板类别:
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
                            {/* {randerBusinessCategoryItems(businessData)} */}
                            <TreeSelect {...treeSelectProps} />
                        </div>
                    </div>
                </div>
                {/* <div className={[styles.optionsItem, styles.serviceLinkCont].join(' ')}>
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
                        ></Select>
                    </div>
                </div> */}
                <div className={[styles.optionsItem, styles.schemeDesc].join(' ')}>
                    <label>
                        <span>*</span>模板描述:
                    </label>
                    <div className={styles.optionsItemCont}>
                        <TextArea
                            value={options.componentDesc}
                            rows={4}
                            className="schemeDescInput"
                            placeholder="请输入"
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
        </div>
    );
};

export default AddComponentTemp;
