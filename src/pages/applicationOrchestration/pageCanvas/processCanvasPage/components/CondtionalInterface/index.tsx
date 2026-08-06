import React, { useState, useEffect } from 'react';
import { TreeSelect, Spin } from 'antd';
import type { TreeSelectProps } from 'antd';
import { crossApiUserInfo } from '@/stores/crossapiStore';
import request from '@/utils/request';

// 1. 定义接口返回数据类型
interface InterfaceTreeNode {
    interfaceName: string;
    interfaceCode: string;
    interfaceId: string;
    children?: InterfaceTreeNode[];
}

// 2. 定义 TreeSelect 兼容的节点类型（替代 DataNode，避免类型不匹配）
interface TreeSelectNode {
    title: string | React.ReactNode;
    key: string | number;
    value: string | number;
    children?: TreeSelectNode[];
    disabled?: boolean;
}

interface DialogProps {
    onGetValue: (data: any) => void;
    selectedValue: string | undefined;
}
const InterfaceTreeSelect: React.FC<DialogProps> = ({ onGetValue, selectedValue }) => {
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const [treeData, setTreeData] = useState<TreeSelectNode[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedNames, setSelectedNames] = useState<string[]>([]);
    const [open, setOpen] = useState<boolean>(false);

    const transformTreeData = (data: InterfaceTreeNode[]): TreeSelectNode[] => {
        return data.map((item) => {
            const node: TreeSelectNode = {
                title: item.interfaceName, // 显示文本
                key: item.interfaceId, // 唯一标识（作为选中值）
                value: item.interfaceId, // 唯一标识（作为选中值）
                children: item.children ? transformTreeData(item.children) : undefined,
            };
            return node;
        });
    };

    const findNodeByValue = (nodes: TreeSelectNode[], targetValue: string | number): { value: string | number; title: any } | null => {
        for (const node of nodes) {
            // 找到匹配的节点
            if (node.value === targetValue) {
                return { value: node.value, title: node.title };
            }
            // 递归查找子节点
            if (node.children && node.children.length > 0) {
                const result = findNodeByValue(node.children, targetValue);
                if (result) {
                    return result;
                }
            }
        }
        return null;
    };
    const onChange = (newValue: string) => {
        const nodeInfo = findNodeByValue(treeData, newValue);
        if (nodeInfo) {
            setSelectedNames(nodeInfo.title);
            console.log('选中的value:', nodeInfo.value);
            console.log('选中的name:', nodeInfo.title);
        }
        onGetValue(nodeInfo);
    };

    const fetchTreeData = async () => {
        try {
            setLoading(true);
            const params = {
                provId: userInfo.provinceId === '0000' ? '00030089' : (userInfo.provinceId || '00030021'),
            };

            request.post('/csf/appInterface/abilityArrangeList', { params: params }).then((result) => {
                if (result.returnCode == '0') {
                    // 转换数据格式
                    const formattedData = transformTreeData(result.beans);
                    setTreeData(formattedData);
                    setOpen(true);
                }
                setLoading(false);
            });
        } catch (error) {
            console.error('获取树形数据失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const hanleClick = () => {};

    useEffect(() => {
        fetchTreeData();
    }, []);

    const treeSelectProps: TreeSelectProps = {
        treeData,
        value: selectedValue,
        onChange: onChange,
        onClick: hanleClick,
        open, // 受控打开状态
        onDropdownVisibleChange: setOpen, // 同步面板显隐状态
        placeholder: '请选择接口',
        style: { width: '100%' },
        showSearch: true,
        treeDefaultExpandAll: true, // 默认展开所有层级
        disabled: loading, // 加载中禁用，避免校验报错
    };

    return (
        <div style={{ padding: 20 }}>
            <Spin spinning={loading} tip="加载接口数据中...">
                <TreeSelect {...treeSelectProps} />
            </Spin>
        </div>
    );
};

export default InterfaceTreeSelect;
