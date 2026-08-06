import {
    forwardRef,
    memo,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useState,
    CSSProperties,
    useRef,
    Key,
    ReactNode,
    createElement,
    ForwardedRef,
} from 'react';
import {
    Button,
    Table,
    Image,
    Tag,
    TablePaginationConfig,
    Tooltip,
    Typography,
    Badge,
    Popover,
    Space,
    Radio,
    Checkbox,
    Descriptions,
    Table as AntTable,
} from 'antd';
import { useDrop } from 'react-dnd';
import { debounce, pickBy, omit, isEmpty, isArray, some } from 'lodash-es';
import * as icons from '@ant-design/icons';
import { getComponent } from '@/packages/index';
import NgapRender from '@/packages/NgapRender/NgapRender';
import { handleApi } from '@/packages/utils/handleApi';
import { handleActionFlow } from '@/packages/utils/action';
import * as util from '@/packages/utils/util';
import { ComponentType, IDragTargetItem } from '@/packages/types';
import { EllipsisOutlined, CaretRightOutlined } from '@ant-design/icons';
import { useAppContext } from '@/utils/AppProvider';
import { dealApiData } from '@/utils/dealApiData';
import { crossApiUserInfo } from '@/stores/crossapiStore';
import { apiListInfo } from '@/stores/apiListStore';
import { ActionType } from './TagSetting/TriggerEventItem';
import { UseMaterialTools } from '@/packages/utils/useMaterialTools';
import { sortConfig, getSorter, SorterItemProps } from './utils/sort';
import { filterConfig } from './utils/filter';
import styles from './index.module.less';
import { hasFontColorStrict } from './utils/textfilter';
import { TagSettingIcons } from './utils/columns';
import { useDeepCompareEffect } from 'ahooks';
import { getDictionary } from '@/packages/utils/dictionary.ts';
import { useWatchVariable } from '@/packages/utils/useWatchVariable.ts';

export interface IConfig {
    statisticsConfig: never[];
    selectedLevel: any;
    rowConfig: any;
    rowClick: any;
    fixNColumns: any;
    expandable: any;
    bordered: boolean;
    size: 'small' | 'middle' | 'large';
    rowKey: string;
    selectionType: 'checkbox' | 'radio' | '';
    defaultSelectedRowKeys: any;
    leftTitle: string;
    empty: string;
    bulkActionList: any[];
    columns: any[];
    hidePager: boolean;
    pagination: TablePaginationConfig;
    field: {
        pageNum: string;
        pageSize: string;
        total: string;
    };
    scroll?: {
        x?: number | true;
        y?: number;
    };
    sourceField: string;
    source: any;
    elementAlias?: string;
    virtual?: any;
    showSummary?: boolean;
    summaryFixed?: boolean;
    summaryName?: string;
    rowSelectionColumnWidth?: number | string;
}

interface RefConfig {
    startLoading: () => void;
    stopLoading: () => void;
    show: () => void;
    hide: () => void;
    search: (params: Record<string, any>) => void;
    reload: () => void;
    clearData: () => void;
    checkSelectedRow: () => boolean;
    setSelectedRowKeys: (keys: any) => void;
    getSelectedRowKeys: () => { selectedRowKeys: Key[] };
    getSelectedRow: () => Record<string, any>;
    getHeaderCheckedColumns: () => { [key: string]: boolean };
    setHeaderCheckedColumns: (columns: { [key: string]: boolean }) => void;
    getCellCheckedRows: () => { [dataIndex: string]: { [rowKey: string]: boolean } };
    setCellCheckedRows: (checkedRows: { [dataIndex: string]: { [rowKey: string]: boolean } }) => void;
    getTotal: () => number;
}

/**
 *
 * @param config 组件配置属性值
 * @param props 系统属性值：componentid、componentname等
 * @returns 返回组件
 */
const BusinessTable = ({ id, type, config, elements, onCheckedChange }: ComponentType<IConfig>, ref: ForwardedRef<RefConfig>) => {
    const [searchParams, setSearchParams] = useState<{
        [key: string]: any;
    }>({});
    const [pageParams, setPageParams] = useState({
        [config?.props?.field?.pageNum || 'pageNum']: 1,
        [config?.props?.field?.pageSize || 'pageSize']: config?.props?.pagination?.pageSize || 10,
    });
    const [data, setData] = useState<any[]>([]);
    // 保存原始树形数据（用于合并计算）
    const [originalData, setOriginalData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<Record<string, any>[]>([]);
    const [visible, setVisible] = useState(true);
    // 列头复选框选中状态
    const [headerCheckedColumns, setHeaderCheckedColumns] = useState<{ [key: string]: boolean }>({});
    // 单元格复选框选中状态 { dataIndex: { rowKey: boolean } }
    const [cellCheckedRows, setCellCheckedRows] = useState<{ [dataIndex: string]: { [rowKey: string]: boolean } }>({});
    // 统计刷新key
    const [statisticsKey, setStatisticsKey] = useState(0);
    const [expandedRowKeys, setExpandedRowKeys] = useState<Key[]>([]);
    const materialTools = UseMaterialTools();
    const rowRefs = useRef<Map<string | number, HTMLTableRowElement>>(new Map());
    const tableRef = useRef<HTMLDivElement>(null);
    const prevDefaultSelectedRowKeysRef = useRef<string>('');
    const mapping = useRef<Record<string, any>>({});
    // 映射表处理后的Table数据，用于配置解析赋值
    const [mappingData, setMappingData] = useState<Record<string, any>>({});
    // 判断是否启用虚拟滚动
    const isVirtual = config.props?.virtual;

    // 预计算所有行的tagSetting结果
    const tagSettingResultsMap = useMemo(() => {
        const resultsMap = new Map<string, { rowBgColor?: string; disabled?: boolean; textColors: Map<string, string> }>();
        const childrenColumnName = config.props?.expandable?.childrenColumnName || 'children';
        const evalCondition = (condition: any, record: any) => {
            const val = record[condition.column];
            const condVal = condition.value;
            switch (condition.operator) {
                case 'eq':
                    return val == condVal;
                case 'neq':
                    return val != condVal;
                case 'gt':
                    return Number(val) > Number(condVal);
                case 'gte':
                    return Number(val) >= Number(condVal);
                case 'lt':
                    return Number(val) < Number(condVal);
                case 'lte':
                    return Number(val) <= Number(condVal);
                case 'contains':
                    return String(val).includes(condVal);
                case 'notContains':
                    return !String(val).includes(condVal);
                default:
                    return false;
            }
        };

        const processRecord = (record: any) => {
            const rowKey = String(record[config.props.rowKey || 'id'] ?? record.id ?? record.key ?? '');
            if (!rowKey) return;

            const result: { rowBgColor?: string; disabled?: boolean; textColors: Map<string, string> } = { textColors: new Map<string, string>() };

            for (const col of config.props.columns) {
                const tagSetting = col.tagSetting || [];
                if (!tagSetting.length) continue;

                for (const caseItem of tagSetting) {
                    for (const branch of caseItem.branches || []) {
                        const { conditions = [], events = [], matchType = 'all' } = branch.config || {};
                        if (!conditions.length) continue;

                        let conditionsMet = true;
                        if (matchType === 'all') {
                            // 全部满足（且）
                            for (const cond of conditions) {
                                if (!evalCondition(cond, record)) {
                                    conditionsMet = false;
                                    break;
                                }
                            }
                        } else {
                            // 任意满足（或）
                            conditionsMet = false;
                            for (const cond of conditions) {
                                if (evalCondition(cond, record)) {
                                    conditionsMet = true;
                                    break;
                                }
                            }
                        }

                        if (conditionsMet) {
                            for (const event of events) {
                                if (event.action === ActionType.SetRowBgColor && event.color) {
                                    result.rowBgColor = event.color;
                                } else if (event.action === ActionType.SetOptionDisabled) {
                                    result.disabled = true;
                                } else if (event.action === ActionType.SetRowTextColor && event.color) {
                                    const columns = (event.columns || []).map(String);
                                    if (columns.length === 0) {
                                        // 如果没有配置columns，则该行所有列都应用该颜色
                                        result.textColors.set('__all__', event.color);
                                    } else {
                                        // 只对配置的列应用颜色
                                        for (const colDataIndex of columns) {
                                            result.textColors.set(colDataIndex, event.color);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            resultsMap.set(rowKey, result);

            const children = record[childrenColumnName];
            if (Array.isArray(children)) {
                for (const child of children) {
                    processRecord(child);
                }
            }
        };

        for (const record of data) {
            processRecord(record);
        }
        return resultsMap;
    }, [data, config.props.columns, config.props.rowKey, config.props?.expandable?.childrenColumnName]);

    const _state = useAppContext();
    const { mode, pageStore } = _state;
    const { addChildElements, variableData, updateToolbar, setElementAlias, apiOutData } = pageStore((state: any) => ({
        addChildElements: state.addChildElements,
        variableData: state.page.pageData.variableData,
        updateToolbar: state.updateToolbar,
        setElementAlias: state.setElementAlias,
        apiOutData: state.page.pageData.apiOutData,
    }));
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const apiList = apiListInfo((state: any) => state.apiList);
    // 判断是否为树形结构数据（使用原始数据判断）
    const isTreeData = useCallback(() => {
        const childrenColumnName = config?.props?.expandable?.childrenColumnName || 'children';
        if (isEmpty(originalData)) return false;
        return originalData.some((record) => Array.isArray(record?.[childrenColumnName]) && record?.[childrenColumnName].length);
    }, [originalData, config?.props?.expandable?.childrenColumnName]);

    // 展开树形数据的子节点（将children展开到与父节点同层级，用于合并计算）
    const expandTreeDataForMerge = useCallback(
        (dataList: any[], removeChildren: boolean = false) => {
            if (isEmpty(dataList)) return [];
            const childrenColumnName = config?.props?.expandable?.childrenColumnName || 'children';
            return dataList.reduce((prev, record) => {
                const recordEntries = Object.entries(record);
                // 如果需要移除 Children，过滤 Children
                const filterChildren = recordEntries.filter(([key]) => key !== childrenColumnName);
                prev.push(Object.fromEntries(removeChildren ? filterChildren : recordEntries));

                // 如果有children，递归展开
                if (Array.isArray(record[childrenColumnName]) && record[childrenColumnName]?.length) {
                    const expandedChildren = expandTreeDataForMerge(record[childrenColumnName], removeChildren);
                    prev.push(...expandedChildren);
                }
                return prev;
            }, []);
        },
        [config?.props?.expandable?.childrenColumnName],
    );

    // 获取父节点的结束索引（父节点及其所有子节点的结束位置）
    const getParentEndIndex = useCallback(
        (parentIndex: number, childrenColumnName: string): number => {
            const mergeData = expandTreeDataForMerge(originalData);
            if (parentIndex < 0) return mergeData.length;
            const parentChildren = mergeData[parentIndex]?.[childrenColumnName];
            if (!Array.isArray(parentChildren)) {
                return parentIndex + 1;
            }
            const countChildren = (records: Record<string, any>[]): number => {
                if (isEmpty(records)) return 0;
                return records.reduce((prev, record) => {
                    prev++;
                    if (Array.isArray(record[childrenColumnName]) && record[childrenColumnName].length) {
                        prev += countChildren(record[childrenColumnName]);
                    }
                    return prev;
                }, 0);
            };
            const childrenCount = countChildren(parentChildren);
            return parentIndex + 1 + childrenCount;
        },
        [originalData, expandTreeDataForMerge],
    );

    // 获取父节点索引（用于树形结构中确定叶子行的父节点范围）
    const getParentIndex = useCallback(
        (index: number, childrenColumnName: string): number => {
            const mergeData = expandTreeDataForMerge(originalData);
            if (isEmpty(mergeData)) return -1;
            for (let i = index - 1; i >= 0; i--) {
                const child = mergeData[i]?.[childrenColumnName];
                if (Array.isArray(child) && child?.length > 0) {
                    const parentEndIndex = getParentEndIndex(i, childrenColumnName);
                    if (index < parentEndIndex) {
                        return i;
                    }
                }
            }
            return -1;
        },
        [originalData, getParentEndIndex, expandTreeDataForMerge],
    );

    // 计算纵向合并的rowSpan
    const getVerticalMergeRowSpan = useCallback(
        (record: any, index: number, dataIndex: string, column: any) => {
            if (!column?.verticalMerge || column?.mergeMode !== 'continuous') {
                return {};
            }

            const isTree = isTreeData();
            const childrenColumnName = config?.props?.expandable?.childrenColumnName || 'children';
            // const defaultExpandAllRows = config?.props?.expandable?.defaultExpandAllRows;

            let mergeData;
            let expandedIndex;
            if (isTree) {
                mergeData = expandTreeDataForMerge(originalData);
                const rowKeyField = config.props.rowKey || 'id';
                const recordKey = record[rowKeyField];
                expandedIndex = mergeData.findIndex((item: any) => item[rowKeyField] === recordKey);
            } else {
                mergeData = data;
                expandedIndex = index;
            }

            // 计算当前页的范围索引（跨页时不合并）
            const pageNum = pageParams[config?.props?.field?.pageNum || 'pageNum'] || 1;
            const pageSize = pageParams[config?.props?.field?.pageSize || 'pageSize'] || 10;
            const pageStart = (pageNum - 1) * pageSize;
            const pageEnd = pageStart + pageSize - 1;

            if (isTree) {
                if (Array.isArray(record[childrenColumnName]) && record[childrenColumnName].length > 0) {
                    return { rowSpan: 1 };
                }

                const currentParentIndex = getParentIndex(expandedIndex, childrenColumnName);
                const currentValue = record?.[dataIndex];
                let rowSpan = 1;
                let nextIndex = expandedIndex + 1;
                let prevIndex = expandedIndex - 1;
                while (prevIndex >= 0 && prevIndex >= pageStart) {
                    const prevRecord = mergeData[prevIndex];
                    if (isEmpty(prevRecord)) break;
                    const prevParentIndex = getParentIndex(prevIndex, childrenColumnName);
                    if (prevParentIndex !== currentParentIndex || prevRecord[dataIndex] !== currentValue) {
                        break;
                    }
                    rowSpan++;
                    prevIndex--;
                }

                while (nextIndex < mergeData.length && nextIndex <= pageEnd) {
                    const nextRecord = mergeData[nextIndex];
                    if (!nextRecord) break;
                    const nextParentIndex = getParentIndex(nextIndex, childrenColumnName);
                    if (nextParentIndex !== currentParentIndex || nextRecord[dataIndex] !== currentValue) {
                        break;
                    }
                    rowSpan++;
                    nextIndex++;
                }

                if (rowSpan > 1) {
                    let currentPosition = 1;
                    let checkIndex = expandedIndex - 1;
                    while (checkIndex >= pageStart) {
                        const checkRecord = mergeData[checkIndex];
                        if (!checkRecord) break;
                        const checkParentIndex = getParentIndex(checkIndex, childrenColumnName);
                        if (checkParentIndex !== currentParentIndex || checkRecord[dataIndex] !== currentValue) {
                            break;
                        }
                        currentPosition++;
                        checkIndex--;
                    }
                    if (currentPosition > 1) {
                        return { rowSpan: 0 };
                    }
                    return { rowSpan };
                }
                return { rowSpan: 1 };
            } else {
                mergeData = originalData;
                const currentValue = record?.[dataIndex];
                const rowKeyField = config.props.rowKey || 'id';
                const expandedIndex = mergeData.findIndex((item: any) => String(item[rowKeyField]) === String(record[rowKeyField]));
                let rowSpan = 1;
                let nextIndex = expandedIndex + 1;

                let prevIndex = expandedIndex - 1;
                while (prevIndex >= 0 && prevIndex >= pageStart) {
                    const prevRecord = mergeData[prevIndex];
                    if (!prevRecord || prevRecord[dataIndex] !== currentValue) break;
                    rowSpan++;
                    prevIndex--;
                }

                while (nextIndex < mergeData.length && nextIndex <= pageEnd) {
                    const nextRecord = mergeData[nextIndex];
                    if (!nextRecord || nextRecord[dataIndex] !== currentValue) break;
                    rowSpan++;
                    nextIndex++;
                }

                if (rowSpan > 1) {
                    let currentPosition = 1;
                    let checkIndex = expandedIndex - 1;
                    while (checkIndex >= pageStart) {
                        const checkRecord = mergeData[checkIndex];
                        if (!checkRecord || checkRecord[dataIndex] !== currentValue) break;
                        currentPosition++;
                        checkIndex--;
                    }
                    if (currentPosition > 1) {
                        return { rowSpan: 0 };
                    }
                    return { rowSpan };
                }
                return { rowSpan: 1 };
            }
        },
        [
            data,
            originalData,
            pageParams,
            config?.props?.field?.pageNum,
            config?.props?.field?.pageSize,
            isTreeData,
            getParentIndex,
            getParentEndIndex,
            expandTreeDataForMerge,
            config?.props?.expandable?.childrenColumnName,
            config?.props?.expandable?.defaultExpandAllRows,
        ],
    );

    // 设置组件别名
    useEffect(() => {
        setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
    }, [config.props.elementAlias]);

    useDeepCompareEffect(() => {
        if (config?.api?.sourceType == 'api' && config?.api?.id) {
            getDictionary(config?.api?.id, (mappingObj) => {
                mapping.current = mappingObj;
                updateDataList();
            });
        } else {
            updateDataList();
        }
    }, [config.api]);
    // 表格列 Key 集合
    const columnsKeys = useMemo(() => {
        return config.props.columns
            .map((item: any) => item.dataIndex)
            .concat([config.props?.expandable?.childrenColumnName])
            .concat([config.props?.rowKey]);
    }, [config.props.columns, config.props.rowKey, config.props?.expandable?.childrenColumnName]);
    // 记录当前接口数据 - 以便配置更新后，重新格式化数据
    const apiData = useRef<Record<string, any>>({});
    // 递归计算每行的树层级（避免直接修改只读对象）
    const assignLevel = (items: Record<string, any>[], level: number): Record<string, any>[] => {
        if (isEmpty(items)) return [];
        return items.map((item) => {
            return { ...item, children: !isEmpty(item.children) ? assignLevel(item.children, level + 1) : undefined, __rowIndex: level };
        });
    };
    const getDataList = debounce(
        (params: Record<string, any> = {}) => {
            if (isEmpty(config.api)) {
                setLoading(false);
                return;
            }
            setLoading(true);
            handleApi(config.api, params, _state)
                .then((res) => {
                    updateToolbar();
                    if (res?.code !== 0) return;
                    if (util.isNotEmpty(res?.data)) {
                        let resData = res?.data;
                        if (config.api.sourceType != 'json') {
                            resData = Object.fromEntries(
                                Object.entries(resData).map(([key, value]) => [
                                    mapping.current?.[key] || key, // 如果有映射就用新键，否则保留原键
                                    value,
                                ]),
                            );
                        }
                        setMappingData(resData);
                        apiData.current = res?.data;
                        const data = dealApiData(res?.data, columnsKeys);
                        // 保存原始数据（用于合并计算）
                        setOriginalData([...data]);
                        // 保持原始数据不变，让Ant Design Table处理树形展开
                        setData(assignLevel(data, 0));
                        // 数据更新后清空选中状态，避免旧数据选中残留
                        setSelectedRowKeys([]);
                        setSelectedRows([]);
                        prevDefaultSelectedRowKeysRef.current = '';
                    } else {
                        console.error('【复合表格】数据格式错误');
                        setOriginalData([]);
                        setData([]);
                        setSelectedRowKeys([]);
                        setSelectedRows([]);
                    }
                })
                .finally(() => {
                    setLoading(false);
                });
        },
        300,
        { trailing: true, leading: true },
    );
    useEffect(() => {
        setData(assignLevel(dealApiData(apiData.current, columnsKeys), 0));
    }, [columnsKeys]);
    // 监听数据、选中类型、默认选中行keys变化，自动设置表格默认选中行
    useDeepCompareEffect(() => {
        const selectionType = config.props?.selectionType;
        if (!selectionType || !data?.length) return;
        // 获取默认选中行keys配置值，支持fx表达式解析
        const defaultKeysStr = config.props?.defaultSelectedRowKeys;
        // 将配置值转换为keys数组，支持逗号分隔字符串或数组格式
        const defaultKeys = defaultKeysStr
            ? (Array.isArray(defaultKeysStr) ? defaultKeysStr : String(defaultKeysStr).split(',')).map((k: any) => String(k).trim()).filter(Boolean)
            : [];
        const prevKeys = prevDefaultSelectedRowKeysRef.current;
        // 通过prevKeys对比避免重复执行
        const currentKeysStr = `${selectionType}|||${config.props?.selectedLevel}|||${defaultKeys.join(',')}`;
        if (prevKeys === currentKeysStr) return;
        prevDefaultSelectedRowKeysRef.current = currentKeysStr;
        // 清空之前的选中状态，避免状态残留
        setSelectedRowKeys([]);
        setSelectedRows([]);
        if (!defaultKeys.length) {
            return;
        }
        const rowKeyField = config.props.rowKey || 'id';
        const childrenColumnName = config.props?.expandable?.childrenColumnName || 'children';
        const selectedLevel = config.props.selectedLevel;
        // 递归查找匹配的行记录，支持树形结构
        const findMatchingRecords = (records: any[]): any[] => {
            const matched: any[] = [];
            for (const record of records) {
                if (selectedLevel === 'first' && record.__rowIndex !== 0) continue;
                const key = record[rowKeyField];
                if (defaultKeys.includes(String(key)) || defaultKeys.includes(key)) {
                    matched.push(record);
                    if (selectionType === 'radio') return matched;
                }
                if (selectionType === 'radio' && matched.length) break;
                if (Array.isArray(record[childrenColumnName]) && record[childrenColumnName].length) {
                    matched.push(...findMatchingRecords(record[childrenColumnName]));
                    if (selectionType === 'radio' && matched.length) break;
                }
            }
            return matched;
        };
        // 查找匹配的行并设置选中状态，通知父组件
        const matchedRows = findMatchingRecords(data);
        if (matchedRows.length) {
            const matchedKeys = matchedRows.map((r) => r[rowKeyField]);
            setSelectedRowKeys(matchedKeys);
            setSelectedRows(matchedRows);
            onCheckedChange?.({ selectedRowKeys: matchedKeys });
        }
    }, [data, config.props?.selectionType, config.props?.selectedLevel, config.props?.defaultSelectedRowKeys]);
    useEffect(() => {
        if (!config?.props?.field?.total) return;
        if (config.api.sourceType == 'api') {
            setTotal(mappingData?.[config?.props?.field?.total]);
        } else {
            setTotal(mappingData?.[config?.props?.field?.total] || data?.length || 0);
        }
    }, [config?.props?.field?.total, data, mappingData]);
    useEffect(() => {
        const pageNum = config?.props?.field?.pageNum || 'pageNum';
        const pageSize = config?.props?.field?.pageSize || 'pageSize';
        const pageSizeNum = config?.props?.pagination?.pageSize || 10;
        const params = {
            [pageNum]: 1,
            [pageSize]: pageSizeNum,
        };
        setPageParams(params);
    }, [config?.props?.field?.pageNum, config?.props?.field?.pageSize, config?.props?.pagination?.pageSize]);
    const updateDataList = (params: Record<string, any> = {}) => {
        const pageNum = config?.props?.field?.pageNum || 'pageNum';
        const newPageParams = {
            ...pageParams,
            [pageNum]: 1,
        };
        setPageParams(newPageParams);
        setSearchParams((prev) => {
            const newParams = {
                ...prev,
                ...params,
            };
            getDataList(config?.props?.hidePager ? { ...newParams } : { ...newParams, ...newPageParams });
            return newParams;
        });
    };
    useWatchVariable({
        apiVariable: config.api,
        variableData,
        variablePrefix: 'context.variable.',
        callback: updateDataList,
    });
    useWatchVariable({
        apiVariable: config.api,
        variableData: apiOutData,
        variablePrefix: 'context.api.id_',
        callback: updateDataList,
    });
    // 拖拽接收
    const [, drop] = useDrop({
        accept: 'MENU_ITEM',
        async drop(item: IDragTargetItem, monitor) {
            if (monitor.didDrop()) return;
            // 生成默认配置
            const { config, events, methods = [] }: any = (await getComponent(item.type + 'Config'))?.default || {};
            addChildElements({
                type: item.type,
                name: item.name,
                parentId: id,
                id: item.id,
                componentId: (item as { componentId?: string }).componentId,
                userInfo,
                apiList,
                _state,
                config,
                events,
                methods,
            });
        },
        // TODO: 拖拽组件时，容器呈现背景色（后期需要判断组件是否可以拖入）
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });

    useImperativeHandle(ref, () => {
        return {
            startLoading: () => {
                setLoading(true);
            },
            stopLoading: () => {
                setLoading(false);
            },
            show() {
                setVisible(true);
            },
            hide() {
                setVisible(false);
            },
            search: (params: Record<string, any> = {}) => {
                const filterParams = pickBy(params, (value: any) => util.isNotEmpty(value));
                setSelectedRows([]);
                setSelectedRowKeys([]);
                setExpandedRowKeys([]);
                prevDefaultSelectedRowKeysRef.current = '';
                updateDataList(filterParams);
            },
            reload: () => {
                setSelectedRows([]);
                setSelectedRowKeys([]);
                setExpandedRowKeys([]);
                prevDefaultSelectedRowKeysRef.current = '';
                getDataList(config?.props?.hidePager ? { ...searchParams } : { ...pageParams, ...searchParams });
            },
            clearData: () => {
                apiData.current = {};
                setData([]);
                setSelectedRows([]);
                setSelectedRowKeys([]);
                setExpandedRowKeys([]);
                prevDefaultSelectedRowKeysRef.current = '';
            },
            // 判断当前是否选中
            checkSelectedRow: () => {
                return !!selectedRowKeys.length;
            },
            // 设置当前默认选中的数据
            setSelectedRowKeys: (keys: any) => {
                if (keys?.selectedRowKeys) {
                    setSelectedRowKeys(keys?.selectedRowKeys);
                }
            },
            // 获取选中的key值
            getSelectedRowKeys: () => {
                return { selectedRowKeys: selectedRowKeys || [] };
            },
            // 获取选中的数据
            getSelectedRow: () => {
                return selectedRows;
            },
            // 获取选中的列数据
            getHeaderCheckedColumns: () => {
                return headerCheckedColumns;
            },
            // 设置列头勾选的列信息
            setHeaderCheckedColumns: (columns: { [key: string]: boolean }) => {
                setHeaderCheckedColumns(columns);
            },
            // 获取单元格选中的数据信息
            getCellCheckedRows: () => {
                return cellCheckedRows;
            },
            // 设置单元格选中的数据信息
            setCellCheckedRows: (checkedRows: { [dataIndex: string]: { [rowKey: string]: boolean } }) => {
                setCellCheckedRows(checkedRows);
            },
            getTotal:()=>{
                return total;
            },
        };
    });

    // 处理 Column Visible 逻辑（isHide 默认 false）
    const handleColumnsVisible = (item: any) => {
        if (item.isHide?.expression) {
            try {
                const expressionResult = materialTools.renderFormula(item.isHide.expression, {}, true);
                if (typeof expressionResult === 'function') {
                    const res = expressionResult();
                    return typeof res !== 'boolean' ? false : res;
                }
                if (typeof expressionResult === 'boolean') {
                    return expressionResult;
                }
                return false;
            } catch (error) {
                console.error('表达式错误:', error);
                return false;
            }
        }
        return item.isHide?.switch || false;
    };
    // Table Column Filter 逻辑
    const handleColumnFilter = (key: string, value: string | undefined) => {
        updateDataList({ [key]: value });
    };
    // Table Expandable Config
    useEffect(() => {
        if (data.length && config.props.expandable.defaultExpandAllRows) {
            setExpandedRowKeys(util.getParentKeys(data, config.props.rowKey || 'id', config.props.expandable.childrenColumnName || 'children'));
        } else {
            setExpandedRowKeys([]);
        }
    }, [data, config.props.expandable, config.props.rowKey]);
    const handleExpand = (expanded: boolean, record: Record<string, any>) => {
        const key = record[config.props.rowKey || 'id'];
        setExpandedRowKeys((prev) => (expanded ? [...prev, key] : prev.filter((k) => k !== key)));
    };
    // 表格配置
    const tableProps = useMemo(() => {
        // 获取行的唯一标识key
        const getRowKey = (record: any): string => {
            const rowKeyField = config.props.rowKey || 'id';
            return String(record[rowKeyField] ?? record.id ?? record.key ?? '');
        };
        const selectedLevel = config.props.selectedLevel;
        // 单选或者多选事件绑定
        let rowSelection: Record<string, any> | undefined;
        if (config.props.selectionType) {
            rowSelection = {
                type: config.props.selectionType,
                selectedRowKeys,
                columnWidth: 60,
                preserveSelectedRowKeys: true,
                onChange(newSelectRowKeys: Key[], newSelectedRows: any[]) {
                    // 当selectedLevel为first时，限制只能选中首层行，若选中了子节点则拦截
                    if (selectedLevel === 'first') {
                        // 过滤出选中首层行的keys
                        const filteredKeys = newSelectRowKeys.filter((key) => {
                            const record = newSelectedRows.find((r: any) => String(r[config.props.rowKey || 'id']) === String(key));
                            return record && record.__rowIndex === 0;
                        });
                        // 若过滤后的keys数量与原始选中keys数量不一致，说明选中了子节点，拦截此次操作
                        if (filteredKeys.length !== newSelectRowKeys.length) {
                            return;
                        }
                    }
                    onCheckedChange?.({ selectedRowKeys: newSelectRowKeys });
                    setSelectedRowKeys(newSelectRowKeys);
                    setSelectedRows(newSelectedRows);
                },
                getCheckboxProps: (record: any) => {
                    const rowKey = getRowKey(record);
                    const tagResult = tagSettingResultsMap.get(rowKey);
                    let disabled = tagResult?.disabled;
                    if (disabled === undefined && selectedLevel === 'first') {
                        disabled = record.__rowIndex !== 0;
                    }
                    return {
                        disabled,
                    };
                },
                // 自定义渲染单选单元格，用于拦截点击事件
                renderCell: (_checked: boolean, record: any, _index: number, originNode: ReactNode) => {
                    const rowKeyValue = record[config.props.rowKey || 'id'];
                    const rowKey = getRowKey(record);
                    const tagResult = tagSettingResultsMap.get(rowKey);
                    const isSelected = selectedRowKeys.includes(rowKeyValue);

                    if (selectionType === 'radio') {
                        const isDisabled = tagResult?.disabled || (selectedLevel === 'first' && record.__rowIndex !== 0);
                        // 单选点击处理：已选中则取消，未选中则选中
                        const handleClick = () => {
                            if (isDisabled) return;
                            if (isSelected) {
                                // 已选中：取消选中，清空选中状态和背景色
                                setSelectedRowKeys([]);
                                setSelectedRows([]);
                                onCheckedChange?.({ selectedRowKeys: [] });
                                const tableBody = tableRef.current?.querySelector('tbody');
                                const rowClickColor = config.props.rowConfig?.rowClickColor;
                                if (tableBody && rowClickColor) {
                                    const allTrs = tableBody.querySelectorAll('tr');
                                    allTrs.forEach((tr) => {
                                        if ((tr as HTMLElement).dataset.rowKey === String(rowKeyValue)) {
                                            for (let i = 0; i < tr.children.length; i++) {
                                                (tr.children[i] as HTMLElement).style.removeProperty('background-color');
                                            }
                                        }
                                    });
                                    rowRefs.current.delete(rowKeyValue);
                                }
                            } else {
                                // 未选中：选中该行，更新选中状态和背景色
                                setSelectedRowKeys([rowKeyValue]);
                                setSelectedRows([record]);
                                onCheckedChange?.({ selectedRowKeys: [rowKeyValue] });
                                const rowClickColor = config.props.rowConfig?.rowClickColor;
                                if (rowClickColor && !tagResult?.rowBgColor) {
                                    // 清除其他行的选中背景色
                                    rowRefs.current.forEach((node, key) => {
                                        if (key !== rowKeyValue) {
                                            for (let i = 0; i < node.children.length; i++) {
                                                (node.children[i] as HTMLElement).style.removeProperty('background-color');
                                            }
                                        }
                                    });
                                    // 给当前选中行设置背景色
                                    const tableBody = tableRef.current?.querySelector('tbody');
                                    if (tableBody) {
                                        const allTrs = tableBody.querySelectorAll('tr');
                                        allTrs.forEach((tr) => {
                                            if ((tr as HTMLElement).dataset.rowKey === String(rowKeyValue)) {
                                                for (let i = 0; i < tr.children.length; i++) {
                                                    (tr.children[i] as HTMLElement).style.setProperty('background-color', rowClickColor, 'important');
                                                }
                                            }
                                        });
                                    }
                                    rowRefs.current.set(
                                        rowKeyValue,
                                        tableRef.current?.querySelector(`tr[data-row-key="${rowKeyValue}"]`) as HTMLTableRowElement,
                                    );
                                }
                            }
                        };
                        return (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Radio checked={isSelected} disabled={isDisabled} onClick={handleClick} />
                            </div>
                        );
                    }
                    return originNode;
                },
                onSelect: (record: any, selected: boolean, _selectedRows: any[], nativeEvent: Event) => {
                    // 判断是否配置了选中背景色
                    const rowClickColor = config.props.rowConfig?.rowClickColor;
                    if (!rowClickColor) return;
                    const rowKeyValue = record[config.props.rowKey || 'id'];
                    const rowKey = getRowKey(record);
                    const tagResult = tagSettingResultsMap.get(rowKey);
                    if (tagResult?.rowBgColor) return;

                    const trElement = (nativeEvent.target as HTMLElement).closest('tr');
                    if (!trElement) return;
                    if (selected) {
                        if (selectionType === 'radio') {
                            rowRefs.current.forEach((node, key) => {
                                if (key !== rowKeyValue) {
                                    const children = node.children;
                                    for (let i = 0; i < children.length; i++) {
                                        (children[i] as HTMLElement).style.removeProperty('background-color');
                                    }
                                }
                            });
                        }
                        const children = trElement.children;
                        for (let i = 0; i < children.length; i++) {
                            (children[i] as HTMLElement).style.setProperty('background-color', rowClickColor, 'important');
                        }
                        rowRefs.current.set(rowKeyValue, trElement);
                    } else {
                        const children = trElement.children;
                        for (let i = 0; i < children.length; i++) {
                            (children[i] as HTMLElement).style.removeProperty('background-color');
                        }
                        rowRefs.current.delete(rowKeyValue);
                    }
                },
                onSelectAll: (selected: boolean, _selectedRows: any[], changeRows: any[]) => {
                    // 判断是否配置了选中背景色
                    const rowClickColor = config.props.rowConfig?.rowClickColor;
                    if (!rowClickColor) return;
                    const tableBody = tableRef.current?.querySelector('tbody');
                    if (!tableBody) return;
                    const applyBgColor = (rowKeyValue: string, apply: boolean) => {
                        const allTrs = tableBody!.querySelectorAll('tr');
                        allTrs.forEach((tr) => {
                            const trRowKey = (tr as HTMLElement).dataset.rowKey;
                            if (trRowKey === String(rowKeyValue)) {
                                const children = tr.children;
                                for (let i = 0; i < children.length; i++) {
                                    if (apply) {
                                        (children[i] as HTMLElement).style.setProperty('background-color', rowClickColor, 'important');
                                    } else {
                                        (children[i] as HTMLElement).style.removeProperty('background-color');
                                    }
                                }
                            }
                        });
                    };
                    if (selected) {
                        changeRows.forEach((record: any) => {
                            const rowKey = getRowKey(record);
                            const tagResult = tagSettingResultsMap.get(rowKey);
                            if (tagResult?.rowBgColor) return;
                            const rowKeyValue = record[config.props.rowKey || 'id'];
                            applyBgColor(rowKeyValue, true);
                        });
                    } else {
                        changeRows.forEach((record: any) => {
                            const rowKey = getRowKey(record);
                            const tagResult = tagSettingResultsMap.get(rowKey);
                            if (tagResult?.rowBgColor) return;
                            const rowKeyValue = record[config.props.rowKey || 'id'];
                            applyBgColor(rowKeyValue, false);
                        });
                    }
                },
            };
        } else {
            rowSelection = undefined;
        }

        // console.log('------------------------', config.props, variableData)
        const fixNColumns = config.props.fixNColumns;
        const rowClick = config.props.rowClick; // 是否允许行选中
        const selectionType = config.props.selectionType;
        // 行渲染属性（用于应用行背���色）
        const onRow = (record: any) => {
            const rowKey = getRowKey(record);
            const tagResult = tagSettingResultsMap.get(rowKey);
            const resObj: { [key: string]: any } = {
                onClick: (event: any) => {
                    // 开启行点击：开关组件，默认关闭，开启后对应行区域单点后可选中该行，点击其他行则取消已选中行选中效果
                    if (!rowClick) {
                        return;
                    }
                    if (selectedLevel === 'first') {
                        // 如果设置了 选择第一层级，则其他层级不允许选中
                        if (record.__rowIndex !== 0) {
                            return;
                        }
                    }
                    // 怎么判断当前行是否已经选中
                    const rowKeyValue = record[config.props.rowKey || 'id'];
                    // 显示选中的背景色
                    const rowClickColor = config.props.rowConfig?.rowClickColor;
                    if (rowKeyValue) {
                        // 判断单选和多选，背景色还不知道怎么处理
                        if (selectedRowKeys.includes(rowKeyValue)) {
                            // 当前已经选中，取消选中
                            const newSelectedRowkeys = selectedRowKeys.filter((item) => {
                                return item !== rowKeyValue;
                            });
                            const newSelectedRows = selectedRows.filter((item) => {
                                return item[config.props.rowKey || 'id'] !== rowKeyValue;
                            });
                            // 没有选择类型时更新数据
                            onCheckedChange?.({ selectedRowKeys: newSelectedRowkeys });
                            setSelectedRowKeys(newSelectedRowkeys);
                            setSelectedRows(newSelectedRows);
                            if (rowClickColor) {
                                // 如果是单选或者未设置选择模式
                                rowRefs.current.delete(rowKeyValue);
                                const node = event.currentTarget;
                                const children = node.children; // 获取所有子元素节点
                                // 如果单元格中已经设置了特殊背景色，则不再设置选中颜色
                                const tagResult = tagSettingResultsMap.get(rowKey);
                                if (!tagResult?.rowBgColor) {
                                    // 遍历所有子元素并设置背景色
                                    for (let i = 0; i < children.length; i++) {
                                        children[i].style.removeProperty('background-color');
                                    }
                                }
                            }
                        } else {
                            // 当前未选中，进行选中操作
                            const newSelectedRowkeys: Key[] = [];
                            const newSelectedRows = [];
                            let clearOthers = false;
                            const prevSelectedKey = selectedRowKeys.length && selectedRowKeys[0];
                            if (selectionType === '' || selectionType === 'radio') {
                                clearOthers = true;
                                newSelectedRowkeys.push(rowKeyValue);
                                newSelectedRows.push(record);
                            } else {
                                newSelectedRowkeys.push(...selectedRowKeys, rowKeyValue);
                                newSelectedRows.push(...selectedRows, record);
                            }
                            onCheckedChange?.({ selectedRowKeys: newSelectedRowkeys });
                            setSelectedRowKeys(newSelectedRowkeys);
                            setSelectedRows(newSelectedRows);
                            if (rowClickColor) {
                                if (clearOthers && prevSelectedKey) {
                                    const prevChildren = rowRefs.current.get(prevSelectedKey as string)?.children || [];
                                    for (let i = 0; i < prevChildren.length; i++) {
                                        (prevChildren[i] as HTMLElement).style.removeProperty('background-color');
                                    }
                                }
                                const tagResult = tagSettingResultsMap.get(rowKey);
                                if (!tagResult?.rowBgColor) {
                                    const node = event.currentTarget;
                                    rowRefs.current.set(rowKeyValue, node);
                                    const children = node.children; // 获取所有子元素节点
                                    // 遍历所有子元素并设置背景色
                                    for (let i = 0; i < children.length; i++) {
                                        children[i].style.setProperty('background-color', rowClickColor, 'important');
                                    }
                                }
                            }
                        }
                    }
                },
                onMouseEnter: (event: any) => {
                    const rowHoverColor = config.props.rowConfig?.rowHoverColor;
                    const rowClickColor = config.props.rowConfig?.rowClickColor;
                    const tagResult = tagSettingResultsMap.get(rowKey);
                    if (rowHoverColor) {
                        const rowKeyValue = record[config.props.rowKey || 'id'];
                        const isSelected = selectedRowKeys.includes(rowKeyValue);
                        if (tagResult?.rowBgColor) return;
                        if (isSelected && rowClickColor) return;
                        const node = event.currentTarget;
                        const children = node.children;
                        for (let i = 0; i < children.length; i++) {
                            children[i].style.setProperty('background-color', rowHoverColor, 'important');
                        }
                    }
                },
                onMouseLeave: (event: any) => {
                    const rowHoverColor = config.props.rowConfig?.rowHoverColor;
                    const tagResult = tagSettingResultsMap.get(rowKey);
                    if (rowHoverColor) {
                        const node = event.currentTarget;
                        const children = node.children;
                        const rowKeyValue = record[config.props.rowKey || 'id'];
                        const rowClickColor = config.props.rowConfig?.rowClickColor;
                        const isSelected = selectedRowKeys.includes(rowKeyValue);
                        for (let i = 0; i < children.length; i++) {
                            if (tagResult?.rowBgColor) {
                                children[i].style.setProperty('background-color', tagResult.rowBgColor, 'important');
                            } else if (isSelected && rowClickColor) {
                                children[i].style.setProperty('background-color', rowClickColor, 'important');
                            } else {
                                children[i].style.removeProperty('background-color');
                            }
                        }
                    }
                },
            };
            if (tagResult?.rowBgColor) {
                resObj.style = {
                    backgroundColor: tagResult.rowBgColor,
                };
            }
            return resObj;
        };

        // 函数表达式优先，开关控制
        const columnsNew = config.props.columns.filter((item) => !handleColumnsVisible(item));
        const colSortMap = new Map<string | number, SorterItemProps>();
        columnsNew.forEach((item) => colSortMap.set(item.dataIndex, item));
        const handleTableChange = (_pagination: any, _filters: any, sorter: any, { action }: any) => {
            // 表格排序处理
            if (action === 'sort') {
                if (sorter?.column?.sortableType === 'service') {
                    // 服务端排序
                    if (sorter?.order) {
                        updateDataList({ sortKey: sorter.column?.dataIndex, sortOrder: sorter?.order });
                    } else {
                        updateDataList();
                    }
                } else {
                    const sortKey = sorter.columnKey;
                    // 前端排序
                    const colSortItem = colSortMap.get(sortKey);
                    const colSorter = getSorter(colSortItem);
                    setData((prev) => {
                        if (sorter?.order === 'ascend') {
                            prev.sort((a, b) => colSorter(a, b));
                        } else if (sorter?.order === 'descend') {
                            prev.sort((a, b) => colSorter(b, a));
                        } else {
                            return [...originalData];
                        }
                        return prev;
                    });
                }
            }
        };
        // 判断数据第一层是否存在 Children
        const hasChildren = isArray(data) && some(data, 'children');
        // Table 展开功能配置
        const expandableConfig =
            !isEmpty(config?.props?.expandable) && hasChildren
                ? {
                      expandable: {
                          ...omit(config.props.expandable, ['defaultExpandAllRows']),
                          expandedRowKeys,
                          onExpand: handleExpand,
                          expandIcon: ({ expanded, record, expandable, onExpand }: any) => {
                              if (!expandable) {
                                  return <span style={{ width: 12, display: 'inline-block' }} />;
                              }
                              return (
                                  <CaretRightOutlined
                                      style={{
                                          fontSize: 12,
                                          transition: 'transform 0.2s',
                                          transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                          cursor: 'pointer',
                                      }}
                                      onClick={(e) => onExpand(record, e)}
                                  />
                              );
                          },
                      },
                  }
                : {};
        return {
            rowSelection,
            onRow,
            ...config.props,
            ...expandableConfig,
            onChange: handleTableChange,
            rowKey: config.props.rowKey || 'id',
            columns: columnsNew.map((item, index) => {
                const dataIndex = item.dataIndex || '-' + index;
                let title = item.title;
                if (typeof title !== 'string') {
                    const titleType = item.title.type;
                    if (titleType == 'variable') {
                        title = materialTools.renderFormula(title.value, {}, true);
                    } else if (titleType == 'static') {
                        title = title.value;
                    }
                }
                // 处理列表头勾选功能
                const titleRender = item.headerCheckable
                    ? (() => {
                          const handleHeaderCheck = (checkedColKeys: string[]) => {
                              const headerCheckEvent = config.events?.find((event) => event.eventName === 'headerCheck');
                              if (headerCheckEvent && checkedColKeys.length > 0) {
                                  const allColumns = config.props.columns || [];
                                  const getColSpanColumns = (startDataIndex: string, colSpan: number): string[] => {
                                      const spannedKeys: string[] = [];
                                      let found = false;
                                      let count = 0;
                                      for (const col of allColumns) {
                                          if (col.dataIndex === startDataIndex) {
                                              found = true;
                                              count = 0;
                                          }
                                          if (found) {
                                              if (col.dataIndex) {
                                                  spannedKeys.push(col.dataIndex);
                                                  count++;
                                              }
                                              if (count >= colSpan) break;
                                          }
                                      }
                                      return spannedKeys;
                                  };
                                  const allColKeys = new Set<string>();
                                  for (const colKey of checkedColKeys) {
                                      const col = allColumns.find((c: any) => c.dataIndex === colKey);
                                      const colSpan = col?.colSpan || 1;
                                      if (colSpan > 1) {
                                          const spannedKeys = getColSpanColumns(colKey, colSpan);
                                          spannedKeys.forEach((k) => allColKeys.add(k));
                                      } else {
                                          allColKeys.add(colKey);
                                      }
                                  }
                                  const columnData = data.map((record) => {
                                      const result: any = {};
                                      for (const colKey of allColKeys) {
                                          result[colKey] = record[colKey];
                                      }
                                      return result;
                                  });
                                  handleActionFlow(headerCheckEvent.actions, columnData, _state);
                                  setStatisticsKey((prev) => prev + 1);
                              }
                          };
                          return (
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <Checkbox
                                      checked={headerCheckedColumns[dataIndex] || false}
                                      onChange={(e) => {
                                          const newChecked = { ...headerCheckedColumns };
                                          if (e.target.checked) {
                                              newChecked[dataIndex] = true;
                                          } else {
                                              delete newChecked[dataIndex];
                                          }
                                          setHeaderCheckedColumns(newChecked);
                                          const checkedColKeys = Object.keys(newChecked).filter((key) => newChecked[key]);
                                          handleHeaderCheck(checkedColKeys);
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                  />
                                  <span style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{title}</span>
                              </div>
                          );
                      })()
                    : title;
                const renderTxt = (content: string) => {
                    return item.analysisHtml ? util.analysisHtmlToStr(content) : content;
                };
                return {
                    ...item,
                    ...sortConfig(item),
                    ...filterConfig(item, handleColumnFilter),
                    dataIndex,
                    key: dataIndex,
                    title: titleRender,
                    width: (item?.width && Number(String(item.width).replace(/[^0-9.]/g, ''))) || 80,
                    fixed: fixNColumns ? (item.fixed ? item.fixed : index < fixNColumns ? 'left' : '') : item.fixed,
                    onCell(record: any, index?: number) {
                        // onCell处理，用于跨行跨列展示和标签配置文字颜色
                        const cellStyle: CSSProperties = {};

                        // 应用行背景色
                        const rowKey = getRowKey(record);
                        const tagResult = tagSettingResultsMap.get(rowKey);
                        if (tagResult?.rowBgColor) {
                            cellStyle.backgroundColor = tagResult.rowBgColor;
                        }

                        // 应用行文字颜色
                        if (tagResult?.textColors) {
                            // 优先查找特定列的颜色
                            const textColorByCol = tagResult.textColors.get(dataIndex);
                            // 查找适用于所有列的颜色
                            const textColorAll = tagResult.textColors.get('__all__');
                            const textColor = textColorByCol || textColorAll;
                            if (textColor) {
                                cellStyle.color = textColor;
                            }
                        }
                        const onCellResult: any = {};
                        // 是否存在自定义字体颜色
                        const hasFontColor = hasFontColorStrict(record[dataIndex]);
                        // 表格字体颜色优先级：自定义 -> 动态规则 -> 可点击（类似链接样式，蓝色）
                        if (item.analysisHtml && hasFontColor) {
                            delete cellStyle.color;
                        }
                        if (item.onCell) {
                            try {
                                const renderFn = new Function('record', 'index', `return (${item.onCell})(record,index);`);
                                Object.assign(onCellResult, renderFn(record, index ?? 0));
                            } catch (error) {
                                console.error(`列[${item.title}]onCell渲染失败`, error);
                            }
                        }
                        // 处理纵向合并
                        const mergeResult = getVerticalMergeRowSpan(record, index ?? 0, dataIndex, item);
                        return { ...onCellResult, ...mergeResult, style: { ...onCellResult.style, ...cellStyle } };
                    },
                    render(text: any, record: any, index: number) {
                        // 1、空白文本 -> 2、格式化文本（特殊数据格式：时间、金额、日期） -> 3、自定义逻辑展示文本 -> 4、渲染单元格复选框和图标的辅助函数
                        let txt = text;
                        try {
                            if (!util.isNotEmpty(text)) {
                                txt = config.props.empty;
                            }
                            const tagSettingIconResult = TagSettingIcons(item, record);
                            // 渲染单元格复选框和图标的辅助函数
                            const renderCellContent = (content: ReactNode) => {
                                let result = content;
                                if (tagSettingIconResult.length > 0) {
                                    const iconSizeMap: Record<string, number> = { default: 16, large: 20, small: 12 };

                                    // 获取列名映射
                                    const getColumnLabel = (dataIndex: string) => {
                                        const col = config.props.columns?.find((c: any) => c.dataIndex === dataIndex);
                                        if (!col?.title) return dataIndex;
                                        let titleDisplayValue = dataIndex;
                                        const titleObj = col.title;
                                        if (typeof titleObj === 'string') {
                                            titleDisplayValue = titleObj;
                                        } else if (titleObj?.type === 'static') {
                                            titleDisplayValue = titleObj.value || dataIndex;
                                        } else if (titleObj?.type === 'variable') {
                                            titleDisplayValue =
                                                materialTools.renderFormula(titleObj.value, variableData || {}, true) || titleObj.value || dataIndex;
                                        }
                                        return titleDisplayValue;
                                    };

                                    const getColumnType = (dataIndex: string) => {
                                        const col = config.props.columns?.find((c: any) => c.dataIndex === dataIndex);
                                        return col?.type;
                                    };

                                    const formatCellValue = (value: any, type: string) => {
                                        if (value === undefined || value === null) return '-';
                                        if (type === 'money') return util.formatNumber(value, 'currency');
                                        if (type === 'number') return util.formatNumber(value);
                                        if (type === 'date1') return util.formatDate(value, 'YYYY-MM-DD');
                                        if (type === 'date2') return util.formatDate(value);
                                        return String(value);
                                    };

                                    // 渲染单个图标的tooltip
                                    const renderIconTooltip = (iconConfig: {
                                        iconUrl: string;
                                        showTooltip?: boolean;
                                        tooltipContent?: string;
                                        columns?: string[];
                                    }) => {
                                        if (!iconConfig.showTooltip) return null;
                                        const columns = iconConfig.columns || [];
                                        const renderDescriptionsTooltip = () => (
                                            <Descriptions column={1} size="small" style={{ margin: 0 }}>
                                                {columns.map((colKey: string) => (
                                                    <Descriptions.Item key={colKey} label={getColumnLabel(colKey)}>
                                                        {formatCellValue(record[colKey], getColumnType(colKey))}
                                                    </Descriptions.Item>
                                                ))}
                                            </Descriptions>
                                        );
                                        const renderTableTooltip = () => {
                                            const tableColumns = columns.map((colKey: string) => ({
                                                title: getColumnLabel(colKey),
                                                dataIndex: colKey,
                                                key: colKey,
                                                width: 120,
                                                ellipsis: true,
                                                render: (value: any) => formatCellValue(value, getColumnType(colKey)),
                                            }));
                                            const tableData = data.map((row: any, idx: number) => ({
                                                ...row,
                                                key: row[config.props.rowKey || 'id'] || row.id || row.key || idx,
                                            }));
                                            return (
                                                <AntTable
                                                    bordered
                                                    columns={tableColumns}
                                                    dataSource={tableData}
                                                    size="small"
                                                    pagination={false}
                                                    scroll={{ y: 200 }}
                                                    style={{ margin: 0 }}
                                                />
                                            );
                                        };
                                        if (iconConfig.tooltipContent === 'table') {
                                            return renderTableTooltip();
                                        }
                                        return renderDescriptionsTooltip();
                                    };

                                    // 渲染单个图标元素
                                    const renderSingleIcon = (iconConfig: {
                                        iconUrl: string;
                                        iconSize?: string;
                                        showTooltip?: boolean;
                                        tooltipContent?: string;
                                        columns?: string[];
                                    }) => {
                                        const iconPixelSize =
                                            typeof iconConfig.iconSize === 'string'
                                                ? iconSizeMap[iconConfig.iconSize] || 14
                                                : iconConfig.iconSize || 14;
                                        const tooltipContent = renderIconTooltip(iconConfig);
                                        if (tooltipContent) {
                                            return (
                                                <Popover
                                                    content={tooltipContent}
                                                    placement="topLeft"
                                                    overlayClassName={styles.iconTooltip}
                                                    overlayStyle={{
                                                        minWidth: 'auto',
                                                        maxWidth: iconConfig.tooltipContent === 'table' ? '600px' : '250px',
                                                    }}
                                                    mouseLeaveDelay={0.3}
                                                    destroyTooltipOnHide={{ keepParent: false }}
                                                >
                                                    <Image
                                                        src={iconConfig.iconUrl}
                                                        width={iconPixelSize}
                                                        height={iconPixelSize}
                                                        preview={false}
                                                        style={{ marginLeft: 4, verticalAlign: 'middle', cursor: 'pointer' }}
                                                    />
                                                </Popover>
                                            );
                                        }
                                        return (
                                            <Image
                                                src={iconConfig.iconUrl}
                                                width={iconPixelSize}
                                                height={iconPixelSize}
                                                preview={false}
                                                style={{ marginLeft: 4, verticalAlign: 'middle' }}
                                            />
                                        );
                                    };

                                    // 按位置分组图标
                                    const prefixIcons: any[] = [];
                                    const suffixIcons: any[] = [];
                                    for (const iconConfig of tagSettingIconResult) {
                                        const iconEl = renderSingleIcon(iconConfig);
                                        if (iconConfig.iconPosition === 'prefix') {
                                            prefixIcons.push(iconEl);
                                        } else {
                                            suffixIcons.push(iconEl);
                                        }
                                    }

                                    // 拼接前缀图标、内容、后缀图标
                                    result = (
                                        <span>
                                            {prefixIcons.length > 0 ? (
                                                <span>
                                                    {prefixIcons}
                                                    <span style={{ marginLeft: 4 }}>{content}</span>
                                                </span>
                                            ) : (
                                                content
                                            )}
                                            {suffixIcons.length > 0 && (
                                                <span style={{ marginLeft: prefixIcons.length > 0 ? 4 : 0 }}>{suffixIcons}</span>
                                            )}
                                        </span>
                                    );
                                }
                                if (!item.cellCheckable) return <span>{result}</span>;
                                const rowKeyField = config.props.rowKey || 'id';
                                const rowKey = record[rowKeyField] ?? record.id ?? record.key ?? index;
                                const isChecked = cellCheckedRows[dataIndex]?.[rowKey] || false;
                                const handleCellCheck = (
                                    updatedCellCheckedRows: { [dataIndex: string]: { [rowKey: string]: boolean } },
                                    clickedRecord: any,
                                    clickedRowIndex: number,
                                    clickedDataIndex: string,
                                ) => {
                                    const cellCheckEvent = config.events?.find((event) => event.eventName === 'cellCheck');
                                    if (cellCheckEvent) {
                                        // 获取所有当前被勾选的列（有选中状态的列）
                                        const checkedColKeys = Object.keys(updatedCellCheckedRows).filter(
                                            (key) => updatedCellCheckedRows[key] && Object.keys(updatedCellCheckedRows[key]).length > 0,
                                        );
                                        if (checkedColKeys.length > 0) {
                                            // 用 Set 存储所有需要返回的 rowKey，天然去重
                                            const allSelectedRowKeys = new Set<string>();
                                            const isTree = isTreeData();
                                            const childrenColumnName = config?.props?.expandable?.childrenColumnName || 'children';
                                            const rowKeyField = config.props.rowKey || 'id';
                                            // mergeData: 展开后的扁平数据（用于判断合并范围）
                                            // sourceData: 展开后不带 children 字段的数据（用于取完整行数据）
                                            const mergeData = isTree ? expandTreeDataForMerge(originalData) : data;
                                            const sourceData = isTree ? expandTreeDataForMerge(originalData, true) : data;

                                            const clickedRowKeyValue = String(clickedRecord[rowKeyField] ?? clickedRecord.id ?? clickedRecord.key);

                                            // 获取指定列在指定索引处的纵向合并组的所有 rowKey
                                            // 向前向后扫描，找到值相同且在同一父节点下的连续行
                                            const getMergeGroupKeys = (targetMergeIndex: number, targetDataIndex: string): string[] => {
                                                if (targetMergeIndex < 0 || targetMergeIndex >= mergeData.length) return [];
                                                const targetRecord = mergeData[targetMergeIndex];
                                                if (!targetRecord) return [];
                                                const targetValue = targetRecord[targetDataIndex];
                                                const targetParentIndex = isTree ? getParentIndex(targetMergeIndex, childrenColumnName) : -1;
                                                const groupKeys: string[] = [];

                                                // 向前查找合并起始位置
                                                let startIdx = targetMergeIndex;
                                                while (startIdx > 0) {
                                                    const prevRecord = mergeData[startIdx - 1];
                                                    if (!prevRecord) break;
                                                    if (prevRecord[targetDataIndex] !== targetValue) break;
                                                    if (isTree && getParentIndex(startIdx - 1, childrenColumnName) !== targetParentIndex) break;
                                                    startIdx--;
                                                }

                                                // 向后查找合并结束位置
                                                let endIdx = startIdx;
                                                while (endIdx < mergeData.length) {
                                                    const nextRecord = mergeData[endIdx];
                                                    if (!nextRecord) break;
                                                    if (nextRecord[targetDataIndex] !== targetValue) break;
                                                    if (isTree && getParentIndex(endIdx, childrenColumnName) !== targetParentIndex) break;
                                                    endIdx++;
                                                }

                                                // 收集合并组内所有行的 rowKey
                                                for (let i = startIdx; i < endIdx; i++) {
                                                    const rowRecord = mergeData[i];
                                                    if (rowRecord) {
                                                        const rowKey = String(rowRecord[rowKeyField] ?? rowRecord.id ?? rowRecord.key);
                                                        if (rowKey) groupKeys.push(rowKey);
                                                    }
                                                }
                                                return groupKeys;
                                            };

                                            // 树形数据需要将点击行的索引转换为 mergeData 中的索引
                                            let clickedMergeIndex = clickedRowIndex;
                                            if (isTree) {
                                                clickedMergeIndex = mergeData.findIndex(
                                                    (r: any) => String(r[rowKeyField] ?? r.id ?? r.key) === clickedRowKeyValue,
                                                );
                                            }

                                            // 获取点击单元格所在列的合并组
                                            const clickedCellMergeGroup = getMergeGroupKeys(clickedMergeIndex, clickedDataIndex);

                                            // 遍历所有被勾选的列和行
                                            for (const colKey of checkedColKeys) {
                                                const selectedRowKeys = Object.keys(updatedCellCheckedRows[colKey]).filter(
                                                    (k) => updatedCellCheckedRows[colKey][k],
                                                );
                                                for (const currentRowKey of selectedRowKeys) {
                                                    const normalizedRowKey = String(currentRowKey);

                                                    // 判断是否是本次点击的单元格
                                                    if (colKey === clickedDataIndex && normalizedRowKey === clickedRowKeyValue) {
                                                        // 点击的单元格有合并：将该列合并组的所有行加入结果集
                                                        if (clickedCellMergeGroup.length > 1) {
                                                            clickedCellMergeGroup.forEach((k) => allSelectedRowKeys.add(k));
                                                        } else {
                                                            allSelectedRowKeys.add(normalizedRowKey);
                                                        }
                                                    } else {
                                                        // 其他列的选中行：检查该列在该行是否也有合并，有则取整个合并组
                                                        const colRowKey = String(
                                                            mergeData.find(
                                                                (r: any) => String(r[rowKeyField] ?? r.id ?? r.key) === normalizedRowKey,
                                                            )?.[rowKeyField] ?? normalizedRowKey,
                                                        );
                                                        const colMergeIndex = mergeData.findIndex(
                                                            (r: any) => String(r[rowKeyField] ?? r.id ?? r.key) === colRowKey,
                                                        );
                                                        const colMergeGroup = getMergeGroupKeys(colMergeIndex, colKey);
                                                        if (colMergeGroup.length > 1) {
                                                            // 有纵向合并：取合并组的所有行（而非只取第一个）
                                                            colMergeGroup.forEach((k) => allSelectedRowKeys.add(k));
                                                        } else {
                                                            allSelectedRowKeys.add(normalizedRowKey);
                                                        }
                                                    }
                                                }
                                            }

                                            // 根据 rowKey 从 sourceData 中取完整行数据，按列名克隆，Map 去重
                                            const rowMap = new Map<string, any>();
                                            for (const selectedRowKey of allSelectedRowKeys) {
                                                const record = sourceData.find(
                                                    (r: any) => String(r[rowKeyField] ?? r.id ?? r.key) === String(selectedRowKey),
                                                );
                                                if (record) {
                                                    if (!rowMap.has(selectedRowKey)) {
                                                        const rowClone: any = {};
                                                        for (const col of config.props.columns) {
                                                            const colDataIndex = col.dataIndex || col.key;
                                                            if (colDataIndex && record[colDataIndex] !== undefined) {
                                                                rowClone[colDataIndex] = record[colDataIndex];
                                                            }
                                                        }
                                                        rowMap.set(selectedRowKey, rowClone);
                                                    }
                                                }
                                            }
                                            const cellDataList = Array.from(rowMap.values());
                                            handleActionFlow(cellCheckEvent.actions, { cellDataList }, _state);
                                            setStatisticsKey((prev) => prev + 1);
                                        }
                                    }
                                };
                                return (
                                    <>
                                        <span style={{ display: 'inline-block' }}>
                                            <Checkbox
                                                checked={isChecked}
                                                onChange={(e) => {
                                                    const newChecked = JSON.parse(JSON.stringify(cellCheckedRows));
                                                    if (!newChecked[dataIndex]) {
                                                        newChecked[dataIndex] = {};
                                                    }
                                                    newChecked[dataIndex][rowKey] = e.target.checked;
                                                    setCellCheckedRows(newChecked);
                                                    handleCellCheck(newChecked, record, index, dataIndex);
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </span>
                                        <span style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{result}</span>
                                    </>
                                );
                            };
                            // 优先执行render
                            if (item.render) {
                                try {
                                    const renderFn = new Function('text', 'record', 'index', `return (${item.render})(text,record,index);`);
                                    txt = renderFn(txt, record, index);
                                } catch (error) {
                                    console.error(`列[${item.title}]渲染失败`, error);
                                    txt = '解析异常';
                                }
                            }
                            if (item.type === 'money') {
                                if (item.analysisHtml) {
                                    txt = util.analysisHtmlToStr(txt, {
                                        replace: (node) => {
                                            if (node.type === 'text') {
                                                return <>{util.formatNumber(node.data, 'currency')}</>;
                                            }
                                            return undefined;
                                        },
                                    });
                                } else {
                                    txt = util.formatNumber(txt, 'currency');
                                }
                            } else if (item.type === 'number') {
                                if (item.analysisHtml) {
                                    txt = util.analysisHtmlToStr(txt, {
                                        replace: (node) => {
                                            if (node.type === 'text') {
                                                return <>{util.formatNumber(node.data)}</>;
                                            }
                                            return undefined;
                                        },
                                    });
                                } else {
                                    txt = util.formatNumber(txt);
                                }
                            } else if (item.type === 'date1') {
                                if (item.analysisHtml) {
                                    txt = util.analysisHtmlToStr(txt, {
                                        replace: (node) => {
                                            if (node.type === 'text') {
                                                const newDate = new Date(Number(node.data));
                                                return <>{util.formatDate(newDate, 'YYYY-MM-DD')}</>;
                                            }
                                            return undefined;
                                        },
                                    });
                                } else {
                                    txt = util.formatDate(txt, 'YYYY-MM-DD');
                                }
                            } else if (item.type === 'date2') {
                                if (item.analysisHtml) {
                                    txt = util.analysisHtmlToStr(txt, {
                                        replace: (node) => {
                                            if (node.type === 'text') {
                                                const newDate = new Date(Number(node.data));
                                                return <>{util.formatDate(newDate)}</>;
                                            }
                                            return undefined;
                                        },
                                    });
                                } else {
                                    txt = util.formatDate(txt);
                                }
                            } else if (item.type === 'text') {
                                const rowKey = getRowKey(record);
                                const tagResult = tagSettingResultsMap.get(rowKey);
                                // 动态规则配置 - 字体颜色
                                const textColorByCol = tagResult?.textColors?.get(dataIndex);
                                // 是否存在自定义字体颜色
                                const hasFontColor = hasFontColorStrict(txt);
                                txt = renderTxt(txt);
                                // 可点击按钮 - 表格字体颜色优先级：自定义 -> 动态规则 -> 可点击（类似链接样式，蓝色）
                                let ButtonComp = (
                                    <Typography.Link
                                        style={textColorByCol ? { color: 'inherit' } : {}}
                                        onClick={() => handleActionClick(item.eventName, record)}
                                    >
                                        {txt}
                                    </Typography.Link>
                                );

                                if (item.analysisHtml && hasFontColor) {
                                    ButtonComp = (
                                        <span style={{ cursor: 'pointer' }} onClick={() => handleActionClick(item.eventName, record)}>
                                            {txt}
                                        </span>
                                    );
                                }
                                return renderCellContent(
                                    <Tooltip title={txt} placement="topLeft">
                                        <Typography.Paragraph
                                            copyable={item.copyable}
                                            ellipsis={item.ellipsis}
                                            style={{ marginBottom: 0, display: 'inline' }}
                                        >
                                            {item.clickable ? ButtonComp : txt}
                                        </Typography.Paragraph>
                                    </Tooltip>,
                                );
                            } else if (item.type === 'multiline') {
                                let renderMultiline = renderTxt(txt);
                                if (Array.isArray(txt)) {
                                    renderMultiline = txt.map((txtItem, idx) => (
                                        <div key={idx}>
                                            <span>{renderTxt(txtItem.label)}</span>
                                            <span>{renderTxt(txtItem.value)}</span>
                                        </div>
                                    ));
                                }
                                return renderCellContent(renderMultiline);
                            } else if (item.type === 'status') {
                                let renderStatus: ReactNode | ReactNode[] = <Badge status="success" text={renderTxt(txt)} />;
                                if (Array.isArray(txt)) {
                                    renderStatus = txt.map((txtItem, idx) => (
                                        <Badge key={idx} status={txtItem.status} text={renderTxt(txtItem.text)} />
                                    ));
                                }
                                return renderCellContent(renderStatus);
                            } else if (item.type === 'image') {
                                const { width = 30, height = 30 } = item?.imageConfig || {};
                                let renderImage = item.analysisHtml ? (
                                    util.analysisHtmlToStr(txt)
                                ) : txt?.startsWith?.('http') ? (
                                    <Image src={txt} width={width} height={height} />
                                ) : (
                                    txt
                                );
                                if (Array.isArray(txt)) {
                                    renderImage = (
                                        <Image.PreviewGroup items={txt}>
                                            <Image width={width} height={height} src={txt[0]} />
                                        </Image.PreviewGroup>
                                    );
                                }
                                return renderCellContent(renderImage);
                            } else if (item.type === 'tag') {
                                let renderTag: ReactNode | ReactNode[] = <Tag color="green">{renderTxt(txt)}</Tag>;
                                if (Array.isArray(txt)) {
                                    renderTag = txt.map((txtItem, idx) => {
                                        if (typeof txtItem === 'object') {
                                            return (
                                                <Tag key={idx} color={txtItem.color}>
                                                    {renderTxt(txtItem.label)}
                                                </Tag>
                                            );
                                        }
                                        return (
                                            <Tag key={idx} color="green">
                                                {renderTxt(txtItem)}
                                            </Tag>
                                        );
                                    });
                                }
                                return renderCellContent(renderTag);
                            } else if (item.type === 'action') {
                                const { moreActionIndex } = item;
                                const btns = item.list?.map((btn: any) => {
                                    let btnTxt = '';
                                    if (typeof btn.text === 'string') {
                                        btnTxt = btn.text;
                                    } else if (btn.text?.type === 'static') {
                                        btnTxt = btn.text.value;
                                    } else {
                                        try {
                                            const renderFn = new Function(
                                                'text',
                                                'record',
                                                'index',
                                                `return (${btn.text.value})(text,record,index);`,
                                            );
                                            btnTxt = renderFn('', record, index);
                                        } catch (error) {
                                            console.error(`列[${btn.title}]渲染失败`, error);
                                            btnTxt = '解析异常';
                                        }
                                    }
                                    if (btnTxt === '') return;
                                    let btnDisable: boolean;

                                    if (typeof btn.disable !== 'object') {
                                        const raw = btn.disable;
                                        btnDisable = !(raw === 0 || raw === false || raw === undefined);
                                    } else if (btn.disable.type === 'static') {
                                        const raw = btn.disable.value;
                                        btnDisable = !(raw === 0 || raw === false || raw === undefined);
                                    } else {
                                        try {
                                            const renderDisableFn = new Function(
                                                'text',
                                                'record',
                                                'index',
                                                `return (${btn.disable.value})(text, record, index);`,
                                            );
                                            const raw = renderDisableFn('', record, index);
                                            btnDisable = !(raw === 0 || raw === false || raw === undefined);
                                        } catch (error) {
                                            console.error(`列[${btn.title}]禁用表达式解析失败`, error);
                                            btnDisable = false;
                                        }
                                    }
                                    return (
                                        <Button
                                            className={styles.actionsBtn}
                                            key={btn.eventName}
                                            type="link"
                                            size="small"
                                            danger={btn.danger}
                                            disabled={btnDisable}
                                            onClick={() => handleActionClick(btn.eventName, record)}
                                        >
                                            {renderTxt(btnTxt)}
                                        </Button>
                                    );
                                });
                                // 配置了折叠功能，且存在需要折叠的按钮
                                if (moreActionIndex && btns.slice(moreActionIndex - 1).length) {
                                    const content = (
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                            }}
                                        >
                                            {btns.slice(moreActionIndex - 1)}
                                        </div>
                                    );
                                    return renderCellContent(
                                        <div className={styles.action}>
                                            {btns.slice(0, moreActionIndex - 1)}
                                            <Popover trigger="click" content={content}>
                                                <EllipsisOutlined />
                                            </Popover>
                                        </div>,
                                    );
                                }
                                return renderCellContent(<Space className={styles.actionsBox}>{btns}</Space>);
                            }
                            return renderCellContent(txt);
                        } catch (error) {
                            console.error(`列[${item.title}]渲染失败`, error);
                            return config.props.empty;
                        }
                    },
                };
            }),
            dataSource: data,
            loading,
        };
    }, [config.props, data, loading, selectedRowKeys, headerCheckedColumns, cellCheckedRows, originalData, expandedRowKeys]);

    // 分页配置
    const pagination: TablePaginationConfig = useMemo(() => {
        const { pageNum = 'pageNum', pageSize = 'pageSize' } = config.props.field || {};
        const { showSizeChanger, showQuickJumper, showTotal, pageSize: page_size, position } = config.props.pagination || {};
        const pageSizeOptions = page_size ? [page_size, page_size * 2, page_size * 3, page_size * 4] : [10, 20, 30, 40];
        return {
            total,
            current: pageParams[pageNum] || 1,
            pageSize: pageParams[pageSize] || 10,
            pageSizeOptions,
            showSizeChanger: showSizeChanger,
            showQuickJumper: showQuickJumper,
            showTotal: showTotal ? (total: number) => `共 ${total} 条数据` : undefined,
            position: position,
            onChange: (num: number, size: number) => {
                setPageParams({
                    [pageNum]: num,
                    [pageSize]: size,
                });
                getDataList({
                    [pageNum]: num,
                    [pageSize]: size,
                    ...searchParams,
                });
            },
        };
    }, [total, config.props.field, pageParams, config.props.pagination]);

    const handleSummary = (summaryFn: any) => {
        if (!summaryFn) return undefined;
        return (pageData: any, selectedRows: any) => {
            try {
                return new Function('pageData,selectedRows', `return (${summaryFn})(pageData, selectedRows);`)(pageData, selectedRows);
            } catch (error) {
                console.error('summaryFn 函数解析失败：', error);
                return '';
            }
        };
    };

    const parseSizeString = (value: any): number => {
        if (value == null || value === '') return 0;
        const str = String(value).trim();
        const gbMBKBRegex = /^(\d+(?:\.\d+)?)\s*GB\s*(\d+(?:\.\d+)?)\s*MB\s*(\d+(?:\.\d+)?)\s*KB$/i;
        const gbMBRegex = /^(\d+(?:\.\d+)?)\s*GB\s*(\d+(?:\.\d+)?)\s*MB$/i;
        const gbKBRegex = /^(\d+(?:\.\d+)?)\s*GB\s*(\d+(?:\.\d+)?)\s*KB$/i;
        const gbRegex = /^(\d+(?:\.\d+)?)\s*GB$/i;
        const mbKBRegex = /^(\d+(?:\.\d+)?)\s*MB\s*(\d+(?:\.\d+)?)\s*KB$/i;
        const mbRegex = /^(\d+(?:\.\d+)?)\s*MB$/i;
        const kbRegex = /^(\d+(?:\.\d+)?)\s*KB$/i;
        const gbMBKBMatch = str.match(gbMBKBRegex);
        if (gbMBKBMatch) {
            return parseFloat(gbMBKBMatch[1]) * 1024 + parseFloat(gbMBKBMatch[2]) + parseFloat(gbMBKBMatch[3]) / 1024;
        }
        const gbMBMatch = str.match(gbMBRegex);
        if (gbMBMatch) {
            return parseFloat(gbMBMatch[1]) * 1024 + parseFloat(gbMBMatch[2]);
        }
        const gbKBMatch = str.match(gbKBRegex);
        if (gbKBMatch) {
            return parseFloat(gbKBMatch[1]) * 1024 + parseFloat(gbKBMatch[2]) / 1024;
        }
        const gbMatch = str.match(gbRegex);
        if (gbMatch) {
            return parseFloat(gbMatch[1]) * 1024;
        }
        const mbKBMatch = str.match(mbKBRegex);
        if (mbKBMatch) {
            return parseFloat(mbKBMatch[1]) + parseFloat(mbKBMatch[2]) / 1024;
        }
        const mbMatch = str.match(mbRegex);
        if (mbMatch) {
            return parseFloat(mbMatch[1]);
        }
        const kbMatch = str.match(kbRegex);
        if (kbMatch) {
            return parseFloat(kbMatch[1]) / 1024;
        }
        return 0;
    };

    const formatSizeTotal = (totalMB: number): string => {
        const totalGB = Math.floor(totalMB / 1024);
        const remainingMB = totalMB - totalGB * 1024;
        const totalKB = totalMB * 1024;

        if (totalGB > 0) {
            const gbRemainingMB = remainingMB;
            const hasFraction = Math.abs(gbRemainingMB - Math.round(gbRemainingMB)) > 0.001;
            if (gbRemainingMB > 0) {
                const mbStr = hasFraction ? gbRemainingMB.toFixed(2) : `${Math.round(gbRemainingMB)}`;
                return `${totalGB}GB${mbStr}MB`;
            }
            return `${totalGB}GB`;
        }
        if (totalMB >= 1) {
            const hasFraction = Math.abs(remainingMB - Math.round(remainingMB)) > 0.001;
            const mbStr = hasFraction ? remainingMB.toFixed(2) : `${Math.round(remainingMB)}`;
            return `${mbStr}MB`;
        }
        if (totalKB > 0) {
            return `${totalKB.toFixed(2)}KB`;
        }
        return '0KB';
    };

    const isSizeString = (value: any): boolean => {
        if (value == null || value === '') return false;
        const str = String(value).trim();
        const num = '\\d+(?:\\.\\d+)?';
        return (
            new RegExp(`${num}\\s*GB\\s*${num}\\s*${num}\\s*KB`, 'i').test(str) ||
            new RegExp(`${num}\\s*GB\\s*${num}\\s*MB`, 'i').test(str) ||
            new RegExp(`${num}\\s*GB\\s*${num}\\s*KB`, 'i').test(str) ||
            new RegExp(`^${num}\\s*GB$`, 'i').test(str) ||
            new RegExp(`${num}\\s*MB\\s*${num}\\s*KB`, 'i').test(str) ||
            new RegExp(`^${num}\\s*MB$`, 'i').test(str) ||
            new RegExp(`^${num}\\s*KB$`, 'i').test(str)
        );
    };

    const calculateSum = (
        data: readonly any[] | any[],
        dataIndex: string,
        includeChildren: boolean = true,
    ): { total: number; isSizeData: boolean } => {
        if (!isEmpty(data) || !dataIndex) return { total: 0, isSizeData: false };
        let total = 0;
        let hasSizeData = false;
        for (const record of data) {
            const rawValue = record[dataIndex];
            if (isSizeString(rawValue)) {
                hasSizeData = true;
                total += parseSizeString(rawValue);
            } else {
                const value = Number(rawValue);
                if (!isNaN(value)) {
                    total += value;
                }
            }
            // 如果有子行数据，且需要包含子行，递归累加
            if (includeChildren && Array.isArray(record?.children)) {
                const childResult = calculateSum(record.children, dataIndex, includeChildren);
                total += childResult.total;
                if (childResult.isSizeData) {
                    hasSizeData = true;
                }
            }
        }
        return { total, isSizeData: hasSizeData };
    };

    // 递归展开所有列（包含children嵌套的列）
    const flattenColumns = (columns: any[]): any[] => {
        if (isEmpty(columns)) return [];
        return columns.reduce((prev, col) => {
            if (handleColumnsVisible(col)) return prev;
            if (Array.isArray(col.children)) {
                prev.push(...flattenColumns(col.children));
            } else {
                prev.push(col);
            }
            return prev;
        }, []);
    };

    const getSummary = useCallback(
        (pageData: readonly any[]) => {
            const summaryFixed = config?.props?.summaryFixed;
            const summaryName = config?.props?.summaryName;
            // 递归展开所有列（包括有children的列）
            const columnsNew = flattenColumns(config.props.columns);
            const selectionType = config?.props?.selectionType;
            const hasName = selectionType === 'checkbox' || selectionType === 'radio';

            // 根据计算范围获取数据（支持每列独立配置）
            const getCalculationData = (calculationScope?: string): { data: readonly any[] | any[]; includeChildren: boolean } => {
                // 获取所有启用了合计的列
                const summaryColumns = columnsNew.filter((col) => col.summary?.enabled);
                if (summaryColumns.length === 0) return { data: pageData, includeChildren: true };

                // 使用传入的calculationScope，如果没有则使用第一个启用了合计的列的配置
                const scope = calculationScope || summaryColumns[0]?.summary?.calculationScope || 'currentPage';

                switch (scope) {
                    case 'currentPage':
                        return { data: pageData || [], includeChildren: true };
                    case 'checkedRows':
                        // 勾选行数据统计：不包含子行，只计算勾选的行
                        return { data: selectedRows || [], includeChildren: false };
                    default:
                        return { data: pageData || [], includeChildren: true };
                }
            };

            let mergeOffset = 0;

            return (
                <Table.Summary fixed={summaryFixed}>
                    <Table.Summary.Row style={{ backgroundColor: '#e0ecf4' }}>
                        {hasName ? <Table.Summary.Cell index={0}>{summaryName}</Table.Summary.Cell> : null}
                        {columnsNew.map((item, index) => {
                            const { summary = {} } = item;
                            const { enabled, calculationType, colSpan, align, color } = summary;

                            // 如果未启用合计且没有自定义title，则不显示
                            if (!enabled && !summary.title) {
                                // 只有启用合计时，跨列才生效
                                if (index < mergeOffset) {
                                    return null;
                                }
                                // 未启用合计时，跨列不生效，colSpan设为1
                                const span = enabled ? colSpan || 1 : 1;
                                mergeOffset = index + span;
                                return (
                                    <Table.Summary.Cell
                                        colSpan={span}
                                        align={align || 'left'}
                                        index={hasName ? index + 1 : index}
                                    ></Table.Summary.Cell>
                                );
                            }

                            if (index < mergeOffset) {
                                return null;
                            }

                            const span = colSpan || 1;
                            mergeOffset = index + span;

                            let lastTitle = '';

                            // 如果启用了合计，计算求和
                            if (enabled && calculationType === 'sum') {
                                // 获取当前列的计算范围配置
                                // 如果设置了跨列，使用跨列范围内第一个列的计算范围
                                let calculationScope = summary.calculationScope;
                                if (span > 1) {
                                    const firstColInSpan = columnsNew[index];
                                    calculationScope = firstColInSpan?.summary?.calculationScope;
                                }
                                const { data: columnCalculationData, includeChildren: columnIncludeChildren } = getCalculationData(calculationScope);

                                // 如果设置了跨列，计算跨列范围内所有列的总和
                                if (span > 1) {
                                    let totalSum = 0;
                                    let isSizeData = false;
                                    // 遍历跨列范围内的所有列（包括子列）
                                    for (let i = 0; i < span; i++) {
                                        const colIndex = index + i;
                                        if (colIndex < columnsNew.length) {
                                            const col = columnsNew[colIndex];
                                            if (col.dataIndex) {
                                                const result = calculateSum(columnCalculationData, col.dataIndex, columnIncludeChildren);
                                                totalSum += result.total;
                                                if (result.isSizeData) {
                                                    isSizeData = true;
                                                }
                                            }
                                        }
                                    }
                                    lastTitle = isSizeData ? formatSizeTotal(totalSum) : totalSum.toFixed(2);
                                } else {
                                    const result = calculateSum(columnCalculationData, item.dataIndex, columnIncludeChildren);
                                    lastTitle = result.isSizeData ? formatSizeTotal(result.total) : result.total.toFixed(2);
                                }
                            }

                            // 如果有自定义title，优先使用自定义title
                            if (summary.title) {
                                const customTitle = handleSummary(summary.title)?.(pageData, selectedRows);
                                if (customTitle) {
                                    lastTitle = customTitle;
                                }
                            }

                            return (
                                <Table.Summary.Cell colSpan={span} align={align || 'left'} index={hasName ? index + 1 : index}>
                                    {color ? <span style={{ color: color }}>{lastTitle}</span> : lastTitle}
                                </Table.Summary.Cell>
                            );
                        })}
                    </Table.Summary.Row>
                </Table.Summary>
            );
        },
        [
            config.api,
            config?.props?.columns,
            config?.props?.selectionType,
            config?.props?.showSummary,
            config?.props?.summaryFixed,
            config?.props?.summaryName,
            selectedRows,
        ],
    );
    /**
     * 操作按钮点击
     */
    const handleOperate = (eventName: string) => {
        const btnEvent = config.events.find((event) => event.eventName === eventName);
        handleActionFlow(btnEvent?.actions, searchParams, _state);
        setStatisticsKey((prev) => prev + 1);
    };

    /**
     * 表格行中的操作按钮点击
     */
    const handleActionClick = (eventName: string, record: any) => {
        const btnEvent = config.events.find((event) => event.eventName === eventName);
        handleActionFlow(btnEvent?.actions, record, _state);
        setStatisticsKey((prev) => prev + 1);
    };

    const title = config?.props?.leftTitle;
    const bulkActionList = config?.props?.bulkActionList || [];
    const iconsList: { [key: string]: any } = icons;
    const showSummary = config?.props?.showSummary;

    // 虚拟滚动时的容器样式
    const containerStyle: CSSProperties = isVirtual
        ? {
              ...config.style,
              width: (config.style?.width as string | number) || '100%',
              maxWidth: '100%', // 限制最大宽度为100%
              minWidth: 0, // 允许在flex容器中正确收缩
              overflow: 'hidden', // 防止宽度无限延伸
              flex: isVirtual ? '1 1 auto' : undefined, // 弹性布局中自适应
              boxSizing: 'border-box', // 盒模型计算
          }
        : config.style;

    // 虚拟滚动时的scroll配置
    const scrollConfig = isVirtual
        ? {
              x: config.props.scroll?.x || true,
              y: config.props.scroll?.y || 300,
          }
        : !isEmpty(config.props.scroll)
        ? { x: config.props.scroll?.x, y: config.props.scroll?.y }
        : undefined;

    const statisticsConfig: any[] = config?.props?.statisticsConfig || [];
    const statisticsSummary: { name: string; value: string | number; showValue: boolean }[] | null = useMemo(() => {
        if (!statisticsConfig?.length) return null;
        const allColumns = config.props.columns || [];
        const visibleColumns = allColumns.filter((col: any) => !handleColumnsVisible(col));
        const getColSpanColumns = (startDataIndex: string, colSpan: number): string[] => {
            const spannedKeys: string[] = [];
            let found = false;
            let count = 0;
            for (const col of visibleColumns) {
                if (col.dataIndex === startDataIndex) {
                    found = true;
                    count = 0;
                }
                if (found) {
                    if (col.dataIndex) {
                        spannedKeys.push(col.dataIndex);
                        count++;
                    }
                    if (count >= colSpan) break;
                }
            }
            return spannedKeys;
        };
        return statisticsConfig.map((stat: any) => {
            const columnKey = stat.columns?.[0];
            let sum = 0;
            let isSizeData = false;
            let showValue = false;
            if (!selectedRowKeys?.length) {
                showValue = false;
            } else if (columnKey === '__selectedColumns__') {
                const checkedColKeys = Object.keys(headerCheckedColumns).filter((key) => headerCheckedColumns[key]);
                const allColKeys = new Set<string>();
                for (const colKey of checkedColKeys) {
                    const col = allColumns.find((c: any) => c.dataIndex === colKey);
                    const colSpan = col?.colSpan || 1;
                    if (colSpan > 1) {
                        const spannedKeys = getColSpanColumns(colKey, colSpan);
                        spannedKeys.forEach((k) => allColKeys.add(k));
                    } else {
                        allColKeys.add(colKey);
                    }
                }
                if (allColKeys.size > 0) {
                    for (const record of selectedRows) {
                        for (const colKey of allColKeys) {
                            const rawVal = record[colKey];
                            if (isSizeString(rawVal)) {
                                isSizeData = true;
                                sum += parseSizeString(rawVal);
                            } else {
                                const val = Number(rawVal);
                                if (!isNaN(val)) {
                                    sum += val;
                                }
                            }
                        }
                    }
                    showValue = true;
                }
            } else if (columnKey) {
                const col = allColumns.find((c: any) => c.dataIndex === columnKey);
                const colSpan = col?.colSpan || 1;
                if (colSpan > 1) {
                    const spannedKeys = getColSpanColumns(columnKey, colSpan);
                    for (const record of selectedRows) {
                        for (const spanKey of spannedKeys) {
                            const rawVal = record[spanKey];
                            if (isSizeString(rawVal)) {
                                isSizeData = true;
                                sum += parseSizeString(rawVal);
                            } else {
                                const val = Number(rawVal);
                                if (!isNaN(val)) {
                                    sum += val;
                                }
                            }
                        }
                    }
                } else {
                    for (const record of selectedRows) {
                        const rawVal = record[columnKey];
                        if (isSizeString(rawVal)) {
                            isSizeData = true;
                            sum += parseSizeString(rawVal);
                        } else {
                            const val = Number(rawVal);
                            if (!isNaN(val)) {
                                sum += val;
                            }
                        }
                    }
                }
                showValue = true;
            }
            return {
                name: stat.name,
                value: isSizeData ? formatSizeTotal(sum) : sum.toFixed(2),
                showValue,
            };
        });
    }, [statisticsConfig, selectedRows, selectedRowKeys, headerCheckedColumns, data, originalData, statisticsKey]);

    return visible ? (
        <div data-id={id} data-type={type} style={containerStyle}>
            {(title || elements?.length || bulkActionList?.length || statisticsSummary?.length) && (
                <div className={styles.toolbar}>
                    {title && <div className={styles.title}>{title}</div>}
                    <div className={styles.action} ref={drop}>
                        {elements?.length ? (
                            <NgapRender elements={elements} />
                        ) : mode === 'edit' ? (
                            <div className="slots">拖拽子元素到这里，可以考虑嵌套一个搜索表单</div>
                        ) : null}
                        {bulkActionList?.map((item) => (
                            <Button
                                key={item.eventName}
                                type={item.type}
                                danger={item.danger}
                                icon={item.icon ? createElement(iconsList[item.icon]) : null}
                                onClick={() => handleOperate(item.eventName)}
                                style={{
                                    height: '30px',
                                    lineHeight: '30px',
                                    fontSize: '13px',
                                    fontWeight: '400',
                                    borderRadius: '2px',
                                }}
                            >
                                {item.text}
                            </Button>
                        ))}
                    </div>
                    {!!statisticsSummary?.length && (
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', margin: '0 -15px 0 10px' }}>
                            {statisticsSummary.map((stat, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', marginRight: '15px' }}>
                                    <span style={{ color: '#333', marginRight: '8px' }}>{stat.name}</span>
                                    <span
                                        style={{
                                            color: '#c06900',
                                            fontWeight: '500',
                                            padding: '4px 12px',
                                            backgroundColor: '#fff',
                                            border: '1px solid #d9d9d9',
                                            borderRadius: '2px',
                                        }}
                                    >
                                        {stat.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div ref={tableRef}>
                <Table
                    {...tableProps}
                    className={styles.tableWrapper}
                    virtual={isVirtual}
                    scroll={scrollConfig}
                    pagination={config.props.hidePager ? false : pagination}
                    summary={showSummary ? getSummary : undefined}
                    style={isVirtual ? { width: '100%' } : undefined}
                />
            </div>
        </div>
    ) : null;
};
export default memo(forwardRef(BusinessTable));
