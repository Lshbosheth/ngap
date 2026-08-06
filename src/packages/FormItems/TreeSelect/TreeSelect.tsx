import { ComponentType } from './../../types';
import { CSSProperties, forwardRef, Key, memo, useCallback, useEffect, useImperativeHandle, useRef, useState, ForwardedRef } from 'react';
import { handleApi } from './../../utils/handleApi';
import { Form, TreeSelect } from 'antd';
import type { TreeSelectProps } from 'antd';
import { useAppContext } from './../../../utils/AppProvider';
import { useFormContext } from './../../utils/context';
import { FileOutlined } from '@ant-design/icons';
import { useDeepCompareEffect } from 'ahooks';
import { isNotEmpty } from '@/packages/utils/util';
import { debounce, isEmpty, isNil } from 'lodash-es';
import { useWatchVariable } from '@/packages/utils/useWatchVariable.ts';
import styles from './index.module.less';

interface RefConfig {
    show: () => void;
    hide: () => void;
    update: (params?: Record<string, any>) => void;
    getCheckedKeys: () => Key[];
    setCheckedKeys: (keys: Key[]) => void;
    setStyle: (style: CSSProperties) => void;
}

/**
 *
 * @param config 组件配置属性值
 * @param props 系统属性值：componentid、componentname等
 * @returns 返回组件
 */
const WTreeSelect = (
    { id, type, config, onChange, onDropdownVisibleChange, onSearch, onSelect, onTreeExpand }: ComponentType,
    ref: ForwardedRef<RefConfig>,
) => {
    const [data, setData] = useState<any[]>([]);
    const [visible, setVisible] = useState(true);
    const [params, setParams] = useState({});
    const [checkedKeys, setCheckedKeys] = useState<Key[]>(config.props.formWrap.defaultValue || []);
    const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);
    const [searchValue, setSearchValue] = useState<string>(''); // 搜索值
    const [mStyle, setMStyle] = useState<CSSProperties>({});
    const _state = useAppContext();
    const { initValues } = useFormContext();
    const { pageStore } = _state;
    const variableData = pageStore((state: any) => state.page.pageData.variableData);
    const setElementAlias = pageStore((state: any) => state.setElementAlias);
    useEffect(() => {
        setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
    }, [config.props.elementAlias]);
    useDeepCompareEffect(() => {
        getDataList();
    }, [config.api]);
    const getJsonData = function (data: string, flag: number) {
        try {
            return JSON.parse(data);
        } catch (error) {
            return flag === 1 ? data : [data];
        }
    };

    const getType = (value: any) => {
        return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
    };

    const { async, asyncKey, treeDefaultExpandAll, ...otherProps } = config.props.formWrap;

    // 初始化默认值
    useEffect(() => {
        const name: string = config.props.formItem?.name;
        if (config.props.defaultValue?.value !== undefined) return;
        const value = config.props.defaultValue;
        if (!isNil(value)) initValues(type, name, value);
    }, [config.props?.defaultValue]);

    useEffect(() => {
        if (treeDefaultExpandAll && data.length > 0) {
            setExpandedKeys(getAllKeys(data));
        } else {
            const treeDefaultExpandedKeys = config.props.formWrap.treeDefaultExpandedKeys;
            if (treeDefaultExpandedKeys) {
                const oKeysType = getType(treeDefaultExpandedKeys);
                let oKeys = [];
                if (oKeysType === 'object') {
                    const value = treeDefaultExpandedKeys?.value;
                    if (value) {
                        oKeys = getType(value) === 'string' ? getJsonData(value, 2) : value;
                    }
                } else if (oKeysType === 'array') {
                    oKeys = treeDefaultExpandedKeys;
                } else if (oKeysType === 'string') {
                    oKeys = getJsonData(treeDefaultExpandedKeys, 2);
                }
                setExpandedKeys(oKeys);
            } else {
                setExpandedKeys([]);
            }
        }
    }, [data, treeDefaultExpandAll, config.props.formWrap.treeDefaultExpandedKeys]);

    const apiData = useRef<Record<string, any>>({});

    const dealData = (data: Record<string, any>) => {
        if (isEmpty(data)) return [];
        const { label, value, children } = config.props.formWrap.fieldNames;
        const len = Math.max(data?.[label]?.length, data?.[value]?.length, 0);
        return Array.from({ length: len }, (_, i) => {
            return {
                title: data?.[label]?.[i],
                [label]: data?.[label]?.[i],
                [value]: data?.[value]?.[i],
                [children]: dealChildren(data?.[children]?.[i], children),
            };
        });
    };

    const dealChildren = (data: Record<string, any>[], childrenKey: string) => {
        if (isEmpty(data)) return undefined;
        const { label } = config.props.formWrap.fieldNames;
        const prefix = childrenKey.replace(/children$/g, '').replace(/child$/g, '');
        return (
            data?.map((item) => {
                const newItem = { ...item };
                const childEntries = Object.entries(newItem);
                for (const [child_key, child_value] of childEntries) {
                    if (child_key?.endsWith('children')) {
                        newItem[childrenKey] = dealChildren(child_value, childrenKey);
                    } else if (!child_key.includes(prefix)) {
                        const newKey = prefix + child_key;
                        newItem[newKey] = child_value;
                    }
                }
                if (newItem[label]) {
                    newItem['title'] = newItem[label];
                }
                return newItem;
            }) || []
        );
    };

    const getDataList = debounce(
        (params: Record<string, any> = {}) => {
            if (isEmpty(config?.api)) return;
            setParams(data);
            handleApi(config.api, params, _state).then((res) => {
                if (res?.code !== 0) return;
                if (isNotEmpty(res?.data)) {
                    apiData.current = res.data;
                    const formatData = dealData(res.data);
                    const treeData = formatData.map((item) => ({
                        ...item,
                        icon: config.props?.treeIcon ? <FileOutlined /> : undefined,
                    }));
                    setData(treeData);
                } else {
                    setData([]);
                    console.error('[弹出树]数据格式错误');
                }
            });
        },
        300,
        { trailing: true, leading: true },
    );
    useWatchVariable({
        apiVariable: config.api,
        variableData,
        variablePrefix: 'context.variable.',
        callback: getDataList,
    });
    useEffect(() => {
        setData(dealData(apiData.current));
    }, [config.props.formWrap.fieldNames]);
    useImperativeHandle(ref, () => {
        return {
            show() {
                setVisible(true);
            },
            hide() {
                setVisible(false);
            },
            update: (params?: Record<string, any>) => {
                getDataList(params);
            },
            getCheckedKeys: () => {
                return checkedKeys;
            },
            setCheckedKeys: (keys: Key[]) => {
                setCheckedKeys(keys);
            },
            setStyle: (style: CSSProperties) => {
                setMStyle(style);
            },
        };
    });
    const handleChange = (val: any) => {
        onChange?.(val);
    };
    const handleDropdownVisibleChange = (val: any) => {
        onDropdownVisibleChange?.(val);
    };
    const handleSelect = (selectedKeys: Key[]) => {
        onSelect?.(selectedKeys);
    };
    const handleSearch = (val: any) => {
        setSearchValue(val);
        onSearch?.(val);
    };

    // 过滤树节点
    const filterTreeNode: TreeSelectProps['filterTreeNode'] = (inputValue, treeNode) => {
        if (!inputValue) return true;
        const labelField = config.props.formWrap.fieldNames?.label || 'label';
        const label = String(treeNode[labelField] || treeNode.title || '');
        return label.toLowerCase().includes(inputValue.toLowerCase());
    };

    // 获取所有key
    const getAllKeys = useCallback(
        (treeData: Record<string, any>[]): Key[] => {
            const valueField = config.props.formWrap.fieldNames?.value || 'value';
            return treeData.reduce<Key[]>((prev, tree) => {
                if (tree.key) prev.push(tree.key);
                if (tree[valueField]) prev.push(tree[valueField]);
                if (tree.children) prev.push(...getAllKeys(tree.children));
                return prev;
            }, []);
        },
        [config.props.formWrap.fieldNames?.value],
    );
    // 树展开处理
    const handleTreeExpand = (expandedKeys: Key[]) => {
        onTreeExpand?.(expandedKeys);
        setExpandedKeys(expandedKeys);
    };
    const onLoadData: TreeSelectProps['loadData'] = (node) => {
        const value = config?.props?.formWrap?.fieldNames?.value;
        const key = asyncKey || value || 'key';
        const currentParams: any = { ...params };
        currentParams[key] = node[value];
        return handleApi(config.api, currentParams, _state).then((res) => {
            if (res?.code !== 0) return;
            if (isNotEmpty(res?.data)) {
                const formatData = dealData(res.data);
                const treeData = formatData.map((item) => ({
                    ...item,
                    icon: config.props?.treeIcon ? <FileOutlined /> : undefined,
                }));
                if (treeData.length) {
                    setData(addChildNode(data, node[key], treeData, key));
                }
            } else {
                setData([]);
                console.error('[弹出树]数据格式错误');
            }
        });
    };
    const addChildNode = (data: Record<string, any>[], parentId: string, newData: Record<string, any>[], key: string) => {
        if (isEmpty(data)) return [];
        const children = config?.props?.formWrap?.fieldNames?.children || 'children';
        return (
            data?.map((item) => {
                if (item[key] === parentId) {
                    item[children] = newData;
                } else if (item[children]) {
                    addChildNode(item[children], parentId, newData, key);
                }
            }) || []
        );
    };

    useEffect(() => {
        if (treeDefaultExpandAll && data.length > 0) {
            setExpandedKeys(getAllKeys(data));
        } else {
            const treeDefaultExpandedKeys = config.props.formWrap.treeDefaultExpandedKeys;
            if (treeDefaultExpandedKeys) {
                const oKeysType = getType(treeDefaultExpandedKeys);
                let oKeys = [];
                if (oKeysType === 'object') {
                    const value = treeDefaultExpandedKeys?.value;
                    if (value) {
                        oKeys = getType(value) === 'string' ? getJsonData(value, 2) : value;
                    }
                } else if (oKeysType === 'array') {
                    oKeys = treeDefaultExpandedKeys;
                } else if (oKeysType === 'string') {
                    oKeys = getJsonData(treeDefaultExpandedKeys, 2);
                }
                setExpandedKeys(oKeys);
            } else {
                setExpandedKeys([]);
            }
        }
    }, [data, treeDefaultExpandAll, config.props.formWrap.treeDefaultExpandedKeys]);
    return (
        visible && (
            <Form.Item {...config.props.formItem} data-id={id} data-type={type}>
                <TreeSelect
                    treeData={data}
                    rootClassName="select-override"
                    {...otherProps}
                    disabled={config.props.formWrap.disable}
                    treeDefaultExpandedKeys={expandedKeys}
                    treeDefaultExpandAll={treeDefaultExpandAll}
                    filterTreeNode={filterTreeNode}
                    treeExpandedKeys={searchValue ? getAllKeys(data) : expandedKeys}
                    defaultValue={config.props.formWrap.defaultValue}
                    popupClassName={styles.TreeSelectPopup}
                    style={{ width: '100%', ...config.style, ...mStyle }}
                    onChange={handleChange}
                    onSelect={handleSelect}
                    onSearch={handleSearch}
                    onTreeExpand={handleTreeExpand}
                    loadData={async ? onLoadData : null}
                    onDropdownVisibleChange={handleDropdownVisibleChange}
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                />
            </Form.Item>
        )
    );
};
export default memo(forwardRef(WTreeSelect));
