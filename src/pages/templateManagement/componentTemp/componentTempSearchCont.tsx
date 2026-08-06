import React, { useEffect, useRef, useState } from 'react';
import { Select, Input, Modal, TreeSelect } from 'antd';
import type { TreeSelectProps } from 'antd';
import type { FormInstance } from 'antd/es/form';
import AddComponentTemp from './addComponentTemp';
import styles from '../index.module.less';
import { publictData } from '../../../utils/appMenuData';
import request from '../../../utils/request';

// 公共类型
import { componentTempSearch, componentTempData, appTempData, BusinessData } from '../templateManageTypes';

interface ExtendedBusinessData extends Omit<BusinessData, 'sourceKey'> {
    label: string; // 新 key
    value: string;
    id: string;
}

interface SearchFormProps {
    onSearch: (values: componentTempSearch) => void;
    onReset: () => void;
    confirmEvent: (data: componentTempData) => void;
    businessData: BusinessData[];
}

// 定义原始数据类型
interface BusinessItem {
    businessId: string;
    businessName: string;
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

const ComponentTempSearchCont: React.FC<SearchFormProps> = ({ onSearch, onReset, confirmEvent, businessData }) => {
    const [searchData, setSearchData] = useState<componentTempSearch>({
        componentName: '',
        componentCategory: '',
        businessId: undefined,
    });

    // 控制弹窗显示状态
    const [compTempModalVisible, setCompTempModalVisible] = useState(false);

    // 打开弹窗
    const openCompTempModal = () => {
        setCompTempModalVisible(true);
    };

    // 关闭弹窗
    const closeCompTempModal = () => {
        setCompTempModalVisible(false);
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

    // 组件类别下拉框数据
    const { componentTypeInfo } = publictData;
    const componentTypeArr = [
        {
            label: '请选择',
            value: '',
            id: '',
        },
    ].concat(componentTypeInfo);
    // 业务分类数据
    const [businessIdData, setBusinessIdData] = useState<any[]>([]);

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
        setSearchData((prev) => ({
            ...prev,
            businessId: value,
        }));
    };

    // TreeSelect配置
    const treeSelectProps: TreeSelectProps = {
        treeData: treeData,
        placeholder: '请选择二级分类',
        value: searchData.businessId,
        style: { width: 200 },
        onChange: handleChange,
        treeNodeFilterProp: 'title', // 搜索时匹配title（分类名称）
        treeDefaultExpandAll: true, // 默认展开所有一级节点
        // treeNodeRender: renderTreeNode, // 自定义节点渲染
    };

    // const loadBusinessIdData = (businessCategory: string | number | string[] | number[]) => {
    //     // 遍历转换
    //     const businessIdSelectData: ExtendedBusinessData[] = businessData.map((item) => ({
    //         ...item,
    //         label: item.businessName, // 原始值转换后赋值
    //         value: item.businessId,
    //         id: item.businessId,
    //     }));
    //     const filterData = businessIdSelectData.filter((item) => {
    //         if (item.businessCategory === businessCategory) {
    //             return item;
    //         }
    //     });

    //     setBusinessIdData(
    //         [
    //             {
    //                 label: '请选择',
    //                 value: '',
    //                 id: '',
    //             },
    //         ].concat(filterData),
    //     );
    // };

    // 输入框修改
    const componentNameChange = (e: { target: { name: string; value: string } }) => {
        const { name, value } = e.target;
        changeStateFn(name, value);
    };
    // 组件类别切换
    const componentTypeChange = (value: string | number | string[] | number[]) => {
        changeStateFn('componentCategory', value);
        // 先清空
        // setBusinessIdData([]);
        // setSearchData((prev) => ({
        //     ...prev,
        //     businessId: '',
        // }));
        // 再赋值
        // loadBusinessIdData(value);
    };
    // 业务分类切换
    const businessIdChange = (value: string | number | string[] | number[]) => {
        changeStateFn('businessId', value);
    };
    // 表单数据修改
    const changeStateFn = (key: string, value: string | number | string[] | number[]) => {
        setSearchData((prev) => ({
            ...prev,
            [key]: value,
        }));
    };
    // 查询按钮点击将表单数据传递到父组件
    const changeFrom = () => {
        onSearch(searchData);
    };
    // 重置按钮
    const resetSearchForm = () => {
        setSearchData({
            ...searchData,
            componentName: '',
            componentCategory: '',
            businessId: undefined,
        });
        onReset();
    };

    const addBaseInfo = (data: componentTempData) => {
        confirmEvent(data);
    };

    return (
        <div className={styles.searchModule}>
            <div className={styles.configItem}>
                <label>模板名称:</label>
                <Input
                    className={styles.fromItem}
                    name="componentName"
                    value={searchData.componentName}
                    placeholder="请输入"
                    onChange={componentNameChange}
                />
            </div>
            <div className={styles.configItem}>
                <label>组件类别:</label>
                <Select
                    className={styles.fromItem}
                    value={searchData.componentCategory}
                    options={componentTypeArr}
                    onChange={componentTypeChange}
                ></Select>
            </div>
            <div className={styles.configItem}>
                <label>业务分类:</label>
                <TreeSelect {...treeSelectProps} />
                {/* <Select className={styles.fromItem} value={searchData.businessId} options={businessIdData} onChange={businessIdChange}></Select> */}
            </div>
            <div className={[styles.configItem, styles.configBtn].join(' ')}>
                <div className={styles.searchQuery} onClick={changeFrom}>
                    查 询
                </div>
                <div className={styles.searchReset} onClick={resetSearchForm}>
                    重 置
                </div>
            </div>
            <div className={[styles.configItem, styles.configBtn1].join(' ')}>
                <div className={styles.addComTemp} onClick={openCompTempModal}>
                    新增业务组件模板
                </div>
                {/* 弹窗组件 */}
                <Modal
                    className={styles.addTempModal}
                    title="创建业务组件模板"
                    open={compTempModalVisible}
                    onCancel={closeCompTempModal}
                    styles={modalStyles}
                    footer={null} // 移除默认底部按钮
                    width={800}
                    maskClosable={false} // 设置为false，点击遮罩不关闭
                    destroyOnClose // 关闭时销毁子元素
                >
                    <AddComponentTemp
                        onReset={closeCompTempModal}
                        onSearch={closeCompTempModal}
                        addconfirmEvent={addBaseInfo}
                        businessData={businessData}
                    />
                </Modal>
            </div>
        </div>
    );
};
export default ComponentTempSearchCont;
