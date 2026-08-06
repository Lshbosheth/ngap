import { ComponentType } from '@materials/types';
import { useState, useEffect, useImperativeHandle, forwardRef, useMemo, memo, useCallback, CSSProperties, ForwardedRef, useRef, Key } from 'react';
import { Tree, Spin } from 'antd';
import type { TreeSelectProps } from 'antd';
import { handleApi } from './../../utils/handleApi';
import { FolderOpenTwoTone, FileOutlined, CaretDownOutlined, FolderTwoTone } from '@ant-design/icons';
import type { TreeDataNode, TreeProps } from 'antd';
import { debounce, isEmpty } from 'lodash-es';
import { useDeepCompareEffect } from 'ahooks';
import classNames from 'classnames';
import { isNotEmpty } from '@materials/utils/util';
import styles from './index.module.less';

interface RefConfig {
    show: () => void;
    hide: () => void;
    update: (params?: Record<string, any>) => void;
    getCheckedKeys: () => Key[];
    setCheckedKeys: (keys: any) => void;
    getSelectedKeys: () => Key[];
    setSelectedKeys: (keys: Key[]) => void;
    getExpandedKeys: () => Key[];
    setExpandedKeys: (keys: Key[]) => void;
    setStyle: (style: CSSProperties) => void;
}

const generateRandomKey = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        key += chars.charAt(randomIndex);
    }
    return key;
};
/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */

const MTree = ({ id, type, config, onCheck, onExpand, onLoad, onRightClick, onSelect }: ComponentType, ref: ForwardedRef<RefConfig>) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(true);
    const [treeKey, setTreeKey] = useState(generateRandomKey());
    const [checkedKeys, setCheckedKeys] = useState<Key[]>([]);
    const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);
    const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);
    const [params, setParams] = useState({});
    const [draggable, setDraggable] = useState(config.props.draggable);
    const [mStyle, setMStyle] = useState<CSSProperties>({});

    const getType = (value: any) => Object.prototype.toString.call(value).slice(8, -1).toLowerCase();

    const getJsonData = (data: string) => {
        try {
            return JSON.parse(data);
        } catch (error) {
            console.warn('JSON 解析失败:', error instanceof Error ? error.message : String(error));
            return [];
        }
    };

    useEffect(() => {
        const defaultSelectedKeys = config.props.defaultSelectedKeys;
        if (defaultSelectedKeys) {
            const oKeysType = getType(defaultSelectedKeys);
            let oKeys = [];
            if (oKeysType === 'object') {
                const value = defaultSelectedKeys?.value;
                if (value) {
                    oKeys = getType(value) === 'string' ? getJsonData(value) : value;
                }
            } else if (oKeysType === 'array') {
                oKeys = defaultSelectedKeys;
            } else if (oKeysType === 'string') {
                oKeys = getJsonData(defaultSelectedKeys);
            }
            setSelectedKeys(oKeys);
        } else {
            setSelectedKeys([]);
        }

        const defaultCheckedKeys = config.props.defaultCheckedKeys;
        if (defaultCheckedKeys) {
            const oKeysType = getType(defaultCheckedKeys);
            let oKeys = [];
            if (oKeysType === 'object') {
                const value = defaultCheckedKeys?.value;
                if (value) {
                    oKeys = getType(value) === 'string' ? getJsonData(value) : value;
                }
            } else if (oKeysType === 'array') {
                oKeys = defaultCheckedKeys;
            } else if (oKeysType === 'string') {
                oKeys = getJsonData(defaultCheckedKeys);
            }
            setCheckedKeys(oKeys);
        } else {
            setCheckedKeys([]);
        }
        setTreeKey(generateRandomKey());
    }, [
        config.props.defaultCheckedKeys,
        config.props.defaultExpandAll,
        config.props.defaultExpandedKeys,
        config.props.defaultExpandParent,
        config.props.defaultSelectedKeys,
        config.props.fieldNames,
    ]);
    useEffect(() => {
        const defaultExpandedKeys = config.props.defaultExpandedKeys;
        if (defaultExpandedKeys) {
            const oKeysType = getType(defaultExpandedKeys);
            let oKeys = [];
            if (oKeysType === 'object') {
                const value = defaultExpandedKeys?.value;
                if (value) {
                    oKeys = getType(value) === 'string' ? getJsonData(value) : value;
                }
            } else if (oKeysType === 'array') {
                oKeys = defaultExpandedKeys;
            } else if (oKeysType === 'string') {
                oKeys = getJsonData(defaultExpandedKeys);
            }
            if (!Array.isArray(oKeys)) {
                setExpandedKeys([]);
                console.error("默认展开节类型必须是数组，例如['parent', '0-0']");
            } else {
                setExpandedKeys(oKeys);
            }
        } else {
            setExpandedKeys([]);
        }
    }, [config?.props?.defaultExpandedKeys]);
    useEffect(() => {
        setDraggable(config?.props?.draggable);
    }, [config?.props?.draggable]);

    const onDrop: TreeProps['onDrop'] = (info: any) => {
        console.log(info);
        const { node, dragNode, dropPosition, dropToGap } = info;
        const dropKey = node.key;
        const dragKey = dragNode.key;

        // 如果拖拽节点和目标节点相同，或者未找到节点，则不处理
        if (dragKey === dropKey || !dragKey || !dropKey) return;

        /**
         * 1. 递归查找并移除拖拽节点，返回新数组和被移除的节点
         */
        const findAndRemoveNode = (treeData: TreeDataNode[], key: Key): [TreeDataNode | null, TreeDataNode[]] => {
            let removedNode: TreeDataNode | null = null;
            const newTreeData = treeData
                .map((node) => {
                    // 如果是当前要移除的节点，标记为 null
                    if (node.key === key) {
                        removedNode = node;
                        return null;
                    }
                    // 如果有子节点，递归处理
                    if (node.children && node.children.length > 0) {
                        const [childRemoved, newChildren] = findAndRemoveNode(node.children, key);
                        if (childRemoved) {
                            removedNode = childRemoved;
                            // 返回新的节点对象，包含更新后的子节点
                            return { ...node, children: newChildren };
                        }
                    }
                    // 其他节点保持不变
                    return node;
                })
                .filter(Boolean) as TreeDataNode[]; // 过滤掉 null，即删除了目标节点
            return [removedNode, newTreeData];
        };

        /**
         * 2. 递归查找目标节点，并将拖拽节点插入到指定位置
         */
        const insertNode = (treeData: TreeDataNode[], targetKey: Key, nodeToInsert: TreeDataNode, position: number): TreeDataNode[] => {
            // 先判断目标节点是否在当前层级
            const targetIndex = treeData.findIndex((n) => n.key === targetKey);

            // 情况1：目标节点在当前层级，且是同级插入（dropToGap 为 true）
            if (targetIndex !== -1 && dropToGap) {
                const newSiblings = [...treeData];
                newSiblings.splice(targetIndex + (position === -1 ? 0 : 1), 0, nodeToInsert);
                return newSiblings;
            }

            // 情况2：目标节点在子层级，或拖入内部（dropToGap 为 false），递归处理
            return treeData.map((node) => {
                if (node.key === targetKey && !dropToGap) {
                    // 拖入节点内部（作为子节点）
                    return {
                        ...node,
                        children: [nodeToInsert, ...(node.children || [])],
                    };
                }
                if (node.children && node.children.length > 0) {
                    // 递归处理子节点
                    return {
                        ...node,
                        children: insertNode(node.children, targetKey, nodeToInsert, position),
                    };
                }
                // 其他节点保持不变
                return node;
            });
        };

        // 执行第一步：移除拖拽节点
        const [removedNode, dataAfterRemove] = findAndRemoveNode(data, dragKey);
        if (!removedNode) return; // 如果没有找到要移除的节点，直接返回

        // 执行第二步：插入到新位置
        let finalData: TreeDataNode[];
        if (!dropToGap) {
            // 拖入节点内部
            finalData = insertNode(dataAfterRemove, dropKey, removedNode, 0);
        } else {
            // 拖到节点间隙，需要先找到目标节点所在的数组，再插入
            const insertIntoSiblings = (treeData: TreeDataNode[]): TreeDataNode[] => {
                const targetIndex = treeData.findIndex((n) => n.key === dropKey);
                if (targetIndex !== -1) {
                    const newData = [...treeData];
                    newData.splice(targetIndex + (dropPosition === -1 ? 0 : 1), 0, removedNode);
                    return newData;
                }
                // 如果目标节点不在当前层级，递归查找子节点
                return treeData.map((node) => {
                    if (node.children) {
                        return { ...node, children: insertIntoSiblings(node.children) };
                    }
                    return node;
                });
            };
            finalData = insertIntoSiblings(dataAfterRemove);
        }

        // 更新状态
        setData(finalData);
    };

    useDeepCompareEffect(() => {
        getDataList();
    }, [config.api]);

    const dealData = useCallback(
        (apiData: Record<string, any>) => {
            if (isEmpty(apiData)) return [];

            const showEndIcon = config.props?.showEndIcon;
            const leafKey = config.props.leafKey || 'isLeaf';
            const { key, title, children, imgUrl } = config.props.fieldNames;

            const len = apiData?.[key]?.length || 0;

            if (!len) return [];

            return Array.from({ length: len }, (_, i) => {
                const newItem: { [k: string]: any } = {
                    [key]: apiData?.[key]?.[i],
                    [title]: apiData?.[title]?.[i],
                    [imgUrl]: showEndIcon && apiData?.[imgUrl] ? apiData[imgUrl][i] : null,
                };
                if (!isEmpty(apiData?.[children]?.[i])) {
                    newItem[children] = dealChildren(apiData[children][i], children);
                }
                // 异步加载的isLeaf字段处理，只有配置了异步加载才生效；
                if (config.props.async && leafKey) {
                    newItem['isLeaf'] = apiData?.[leafKey]?.[i] === 'true' || apiData?.[leafKey]?.[i] === true;
                }
                return newItem;
            });
        },
        [config.props.fieldNames, config.props?.showEndIcon, config.props.leafKey],
    );
    const dealChildren = (childrenData: Record<string, any>[], childrenKey: string) => {
        if (isEmpty(childrenData)) return undefined;
        const prefix = childrenKey.replace(/children$/g, '').replace(/child$/g, '');
        return (
            childrenData?.map((child: Record<string, any>) => {
                if (isEmpty(child)) return undefined;
                const newChild = { ...child };
                const childEntries = Object.entries(newChild);
                for (const [child_key, child_val] of childEntries) {
                    const hasChildren = child_key?.endsWith('children') || child_key?.endsWith('child');
                    if (hasChildren && !isEmpty(child_val)) {
                        newChild[childrenKey] = dealChildren(child_val, childrenKey);
                    } else if (!child_key.includes(prefix) && !hasChildren) {
                        const newKey = prefix + child_key;
                        newChild[newKey] = child_val;
                    }
                    // 异步加载的isLeaf字段处理，只有配置了异步加载才生效；
                    if ((config.props.async && config.props.leafKey && child_key == config.props.leafKey) || child_key == 'isLeaf') {
                        newChild['isLeaf'] = child_val === 'true' || child_val === true;
                    }
                }
                return newChild;
            }) || []
        );
    };

    const apiData = useRef({});

    useEffect(() => {
        setData(dealData(apiData.current));
    }, [dealData]);

    const getDataList = debounce(
        (params: Record<string, any> = {}) => {
            if (isEmpty(config.api)) {
                setLoading(false);
                return;
            }
            setLoading(true);
            setParams(params);
            handleApi(config.api, params)
                .then((res) => {
                    if (res?.code !== 0) return;
                    if (isNotEmpty(res?.data)) {
                        apiData.current = res.data;
                        setData(dealData(res.data));
                    } else {
                        setData([]);
                        console.error('[Tree]数据格式错误');
                    }
                })
                .finally(() => {
                    setLoading(false);
                });
        },
        300,
        { trailing: true, leading: true },
    );

    useImperativeHandle(ref, () => {
        return {
            show() {
                setVisible(true);
            },
            hide() {
                setVisible(false);
            },
            update: (params?: Record<string, any>) => {
                setSelectedKeys([]);
                getDataList(params);
            },
            getCheckedKeys: () => {
                return checkedKeys;
            },
            setCheckedKeys: (keys: any) => {
                setCheckedKeys(keys.key);
            },
            getSelectedKeys: () => {
                return selectedKeys;
            },
            setSelectedKeys: (keys: Key[]) => {
                setSelectedKeys(keys);
            },
            getExpandedKeys: () => {
                return expandedKeys;
            },
            setExpandedKeys: (keys: Key[]) => {
                setExpandedKeys(keys);
            },
            setStyle: (style: CSSProperties) => {
                setMStyle(style);
            },
        };
    });

    //自定义节点前面的图标
    const icon = (props: any) => {
        if (props?.data?.children?.length) {
            return props.expanded ? <FolderOpenTwoTone /> : <FolderTwoTone />;
        } else {
            return <FileOutlined />;
        }
    };

    const handleFilterFunction = (formatter: any) => {
        if (!formatter) return undefined;
        return (node: any) => {
            try {
                return new Function('node', `return (${formatter})(node);`)(node);
            } catch (error) {
                console.error('filterTreeNode 函数解析失败：', error);
                return node;
            }
        };
    };

    const filterTreeNodeFn = useCallback(() => {
        return config.props?.filterTreeNode ? handleFilterFunction(config.props?.filterTreeNode) : null;
    }, [config.props?.filterTreeNode]);

    //加载异步数据
    const onLoadData: TreeSelectProps['loadData'] = useCallback(
        (node: any) => {
            const key = config?.props?.fieldNames?.key;
            const asyncKey = config?.props?.asyncKey;
            const currentKey = asyncKey || key || 'key';
            const currentParams: any = { ...params };
            currentParams[currentKey] = node[key];
            setLoading(true);
            return new Promise((resolve) => {
                if (node[config?.props?.fieldNames?.children || 'children']) {
                    setLoading(false);
                    resolve([]);
                    return;
                }
                handleApi(config.api, currentParams)
                    .then((res) => {
                        if (res?.code !== 0) return;
                        if (isNotEmpty(res?.data)) {
                            const formatData = dealData(res.data);
                            setData(addChildNode(data, node[key], formatData, key));
                            resolve([]);
                        } else {
                            console.error('[目录树]数据格式错误');
                            setData([]);
                            resolve([]);
                        }
                    })
                    .finally(() => {
                        setLoading(false);
                    });
            });
        },
        [config.props.async, config?.props?.fieldNames?.key, config?.props?.asyncKey, data],
    );

    const addChildNode = (data: Record<string, any>[], parentId: string, newData: any, key: string) => {
        if (isEmpty(data)) return [];
        const children = config?.props?.fieldNames?.children || 'children';
        return data.map((item) => {
            if (item[key] === parentId) {
                item[children] = newData;
            } else if (item[children]) {
                addChildNode(item[children], parentId, newData, key);
            }
            return item;
        });
    };

    const handleCheck = useCallback(
        (checkedKeys: Key[]) => {
            onCheck?.(checkedKeys);
            setCheckedKeys(checkedKeys);
        },
        [onCheck],
    );

    const handleSelect = useCallback(
        (selectedKeys: Key[]) => {
            onSelect?.(selectedKeys);
            setSelectedKeys(selectedKeys);
        },
        [onSelect],
    );

    const handleExpand = useCallback(
        (expandedKeys: Key[]) => {
            onExpand?.(expandedKeys);
            setExpandedKeys(expandedKeys);
        },
        [onExpand],
    );

    const other = useMemo(() => {
        const { async, asyncKey, ...otherProps } = config.props;
        return otherProps;
    }, [config.props]);

    const expanded = useMemo(() => {
        return config.props?.defaultExpandAll ? {} : { expandedKeys };
    }, [config.props?.defaultExpandAll, expandedKeys]);

    const baseStyle: CSSProperties = useMemo(() => {
        return { ...config.style, ...mStyle };
    }, [config.style, mStyle]);

    const titleRender = useCallback(
        (nodeData: any) => {
            const imgKey = config?.props?.fieldNames?.imgUrl || 'imgUrl';
            if (!nodeData[imgKey]) return nodeData.title;

            const imgKeyArr = typeof nodeData[imgKey] == 'string' ? [nodeData[imgKey]] : nodeData[imgKey];

            return (
                <span>
                    {nodeData.title}
                    {imgKeyArr
                        .filter((imgUrl: string) => imgUrl)
                        .map((imgUrl: string, idx: number) => (
                            <img key={idx} className="nodeEndIcon" src={imgUrl} />
                        ))}
                </span>
            );
        },
        [config?.props?.fieldNames?.imgUrl],
    );

    return (
        visible && (
            <Spin spinning={loading} size="large" wrapperClassName={classNames(['spin-loading', styles.Tree])}>
                <Tree
                    data-id={id}
                    data-type={type}
                    key={treeKey}
                    {...other}
                    defaultExpandedKeys={expandedKeys}
                    defaultSelectedKeys={selectedKeys}
                    defaultCheckedKeys={checkedKeys}
                    {...expanded}
                    selectedKeys={selectedKeys}
                    checkedKeys={checkedKeys}
                    icon={icon}
                    switcherIcon={<CaretDownOutlined />}
                    treeData={data}
                    style={baseStyle}
                    filterTreeNode={filterTreeNodeFn}
                    loadData={config.props.async ? onLoadData : null}
                    onCheck={handleCheck}
                    onSelect={handleSelect}
                    onExpand={handleExpand}
                    onLoad={onLoad}
                    onRightClick={onRightClick}
                    onDrop={onDrop}
                    draggable={draggable}
                    titleRender={config.props.showEndIcon ? titleRender : null}
                />
            </Spin>
        )
    );
};
export default memo(forwardRef(MTree));
