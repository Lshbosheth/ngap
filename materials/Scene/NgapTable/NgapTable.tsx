import {
    forwardRef,
    memo,
    useMemo,
    useEffect,
    useImperativeHandle,
    useState,
    useRef,
    CSSProperties,
    Key,
    createElement,
    ForwardedRef,
    useCallback,
} from 'react';
import { Button, Table, Image, Tag, TablePaginationConfig, Tooltip, Typography, Badge, Popover, Space } from 'antd';
import { debounce, pickBy, isEmpty, isNumber, omit } from 'lodash-es';
import * as icons from '@ant-design/icons';
import NgapRender from '@materials/NgapRender/NgapRender';
import { handleApi } from '@materials/utils/handleApi';
import { handleActionFlow } from '@materials/utils/action';
import { dealApiData } from './../../utils/dealApiData';
import * as util from '@materials/utils/util';
import { usePageStore } from '@materials/stores/pageStore';
import { ComponentType } from '@materials/types';
import { EllipsisOutlined } from '@ant-design/icons';
import { useDeepCompareEffect } from 'ahooks';
import { useWatchVariable } from '@materials/utils/useWatchVariable';
import styles from './index.module.less';

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
    getSelectedRow: () => Record<string, any>[];
    setStyle: (style: CSSProperties) => void;
    getTotal: () => number;
}

export interface IConfig {
    virtual: boolean;
    expandable: any;
    bordered: boolean;
    size: 'small' | 'middle' | 'large';
    rowKey: string;
    selectionType: 'checkbox' | 'radio';
    leftTitle: string;
    empty: string;
    bulkActionList: any[];
    columns: any[];
    authMoInfo?: any;
    hidePager: boolean;
    pagination: TablePaginationConfig;
    field: {
        pageNum: string;
        pageSize: string;
        total: string;
    };
    sourceField: string;
    source: any;
    scroll?: {
        x?: number | true;
        y?: number;
    };
    elementAlias?: string;
    showSummary?: boolean;
    summaryFixed?: boolean;
    summaryName?: string;
}
/**
 *
 * @param props 组件配置属性值
 * @param ref 组件实例
 * @returns 返回组件
 */
const NgapTable = ({ id, type, config, elements, onCheckedChange }: ComponentType<IConfig>, ref: ForwardedRef<RefConfig>) => {
    const [searchParams, setSearchParams] = useState<{
        [key: string]: any;
    }>({});
    const [pageParams, setPageParams] = useState({
        [config?.props?.field?.pageNum || 'pageNum']: 1,
        [config?.props?.field?.pageSize || 'pageSize']: config?.props?.pagination?.pageSize || 10,
    });
    const authMoInfos = config.props?.authMoInfo || {};
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const [visible, setVisible] = useState(true);
    const [expandedRowKeys, setExpandedRowKeys] = useState<Key[]>([]);
    const [mStyle, setMStyle] = useState<CSSProperties>({});
    const variableData = usePageStore((state) => state?.page?.pageData?.variableData || {});
    const apiOutData = usePageStore((state: any) => state?.page?.pageData?.apiOutData || {});
    useDeepCompareEffect(() => {
        updateDataList();
    }, [config.api]);
    // Table 数据格式化依赖 Key
    const tableFormatKeys = useMemo(() => {
        const colDataIndex = config.props?.columns?.map((column) => column.dataIndex) || [];
        return [...colDataIndex, config.props?.expandable?.childrenColumnName, config.props?.rowKey];
    }, [config.props?.columns, config.props?.expandable?.childrenColumnName, config.props?.rowKey]);
    // 记录当前接口数据 - 以便配置更新后，重新格式化数据
    const apiData = useRef<Record<string, any>>({});
    const getDataList = debounce(
        (params: Record<string, any> = {}) => {
            if (isEmpty(config.api)) {
                setLoading(false);
                return;
            }
            setLoading(true);
            handleApi(config.api, params)
                .then((res) => {
                    if (res?.code !== 0) return;
                    apiData.current = res.data;
                    if (util.isNotEmpty(res?.data)) {
                        setData(dealApiData(res.data, tableFormatKeys));
                        setSelectedRowKeys([]);
                        setSelectedRows([]);
                    } else {
                        console.error('[基础表格] 数据格式错误');
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
        { leading: true, trailing: true },
    );
    useEffect(() => {
        if (!config?.props?.field?.total) return;
        if (config.api.sourceType == 'api') {
            setTotal(apiData.current?.[config?.props?.field?.total]);
        } else {
            setTotal(apiData.current?.[config?.props?.field?.total] || data?.length || 0);
        }
    }, [config?.props?.field?.total, data]);
    const updateDataList = () => {
        setPageParams((prev) => {
            const pageNum = config?.props?.field?.pageNum || 'pageNum';
            const newParams = {
                ...prev,
                [pageNum]: 1,
            };
            getDataList(config?.props?.hidePager ? {} : newParams);
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
    useEffect(() => {
        updateDataList();
    }, [config?.props?.hidePager]);
    useEffect(() => {
        if (isEmpty(apiData.current)) {
            setData([]);
        } else {
            setData(dealApiData(apiData.current, tableFormatKeys));
        }
    }, [tableFormatKeys]);
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
                // 过滤空值
                const filterParams = pickBy(params, (value: any) => util.isNotEmpty(value));
                const newPageParams = {
                    ...pageParams,
                    [config?.props?.field?.pageNum]: 1,
                };
                setPageParams(newPageParams);
                setSearchParams(filterParams);
                setSelectedRows([]);
                setSelectedRowKeys([]);
                setExpandedRowKeys([]);
                getDataList({ ...newPageParams, ...filterParams });
            },
            reload: () => {
                setSelectedRows([]);
                setSelectedRowKeys([]);
                setExpandedRowKeys([]);
                getDataList({ ...pageParams, ...searchParams });
            },
            clearData: () => {
                apiData.current = {};
                setData([]);
                setSelectedRows([]);
                setSelectedRowKeys([]);
                setExpandedRowKeys([]);
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
            getTotal: () => {
                return total;
            },
            setStyle: (style: CSSProperties) => {
                setMStyle(style);
            },
        };
    });

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
        // 单选或者多选事件绑定
        let rowSelection: any = null;
        if (config.props.selectionType) {
            rowSelection = {
                type: config.props.selectionType,
                selectedRowKeys,
                columnWidth: 60,
                preserveSelectedRowKeys: true,
                onChange(newSelectRowKeys: Key[], newSelectedRows: any[]) {
                    onCheckedChange?.({ selectedRowKeys: newSelectRowKeys });
                    setSelectedRowKeys(newSelectRowKeys);
                    setSelectedRows(newSelectedRows);
                },
            };
        } else {
            rowSelection = null;
        }
        const columnsNew = config.props.columns.filter((item) => item.isShow != 'hide');
        return {
            rowSelection,
            ...config.props,
            expandable: {
                ...omit(config.props.expandable, ['defaultExpandAllRows']),
                expandedRowKeys,
                onExpand: handleExpand,
            },
            rowKey: config.props.rowKey || 'id',
            bordered: config.props.bordered,
            size: config.props.size,
            columns: columnsNew.map((item, index: number) => {
                const dataIndex = item.dataIndex || '-' + index;
                return {
                    ...item,
                    dataIndex,
                    key: dataIndex,
                    onCell(record: any, index: number) {
                        // onCell处理，用于跨行跨列展示
                        if (item.onCell) {
                            try {
                                const renderFn = new Function('record', 'index', `return (${item.onCell})(record,index);`);
                                return renderFn(record, index);
                            } catch (error) {
                                console.error(`列[${item.title}]渲染失败`, error);
                            }
                        }
                        return {};
                    },
                    render(text: any, record: any, index: number) {
                        let txt = text;
                        try {
                            if (!util.isNotEmpty(txt)) {
                                if (typeof config.props.empty === 'undefined') {
                                    txt = '-';
                                } else if (config.props.empty) {
                                    txt = config.props.empty;
                                }
                            } else if (item.type === 'money') txt = util.formatNumber(text, 'currency');
                            else if (item.type === 'number') txt = util.formatNumber(text);
                            else if (item.type === 'date1') txt = util.formatDate(text, 'YYYY-MM-DD');
                            else if (item.type === 'date2') txt = util.formatDate(text);

                            // 文本处理完后，如果存在render，则执行render
                            if (item.render) {
                                try {
                                    const renderFn = new Function('text', 'record', 'index', `return (${item.render})(text,record,index);`);
                                    txt = renderFn(txt, record, index);
                                } catch (error) {
                                    console.error(`列[${item.title}]渲染失败`, error);
                                    txt = '解析异常';
                                }
                            }

                            // 处理后缀图标
                            let suffixIconElement = null;
                            if (item.suffixIcon?.enabled && item.suffixIcon?.iconSrc) {
                                // 检查显隐逻辑
                                let isVisible = true;
                                if (item.suffixIcon.visibleLogic) {
                                    try {
                                        const logicFn = new Function(`return ${item.suffixIcon.visibleLogic}`);
                                        const fn = logicFn();
                                        isVisible = fn(record);
                                    } catch (error) {
                                        console.error(`后缀图标显隐逻辑表达式解析失败: ${item.suffixIcon.visibleLogic}`, error);
                                        isVisible = true;
                                    }
                                }

                                if (isVisible) {
                                    const iconProps: any = {
                                        src: item.suffixIcon.iconSrc,
                                        style: { marginLeft: 4, cursor: 'pointer', width: 16, height: 16 },
                                        alt: 'suffix icon',
                                    };

                                    // 添加点击事件
                                    if (item.suffixIcon.onClickEvent) {
                                        iconProps.onClick = () => handleActionClick(item.suffixIcon.onClickEvent, record);
                                    }

                                    // 添加鼠标移入事件
                                    if (item.suffixIcon.onMouseEnterEvent) {
                                        iconProps.onMouseEnter = () => handleActionClick(item.suffixIcon.onMouseEnterEvent, record);
                                    }

                                    // 添加鼠标移出事件
                                    if (item.suffixIcon.onMouseLeaveEvent) {
                                        iconProps.onMouseLeave = () => handleActionClick(item.suffixIcon.onMouseLeaveEvent, record);
                                    }

                                    suffixIconElement = <img {...iconProps} />;
                                }
                            }

                            if (item.type === 'text') {
                                // 提取公共组件
                                const ButtonComp = (
                                    <Typography.Link onClick={() => handleActionClick(item.eventName, record)}>{txt.toString()}</Typography.Link>
                                );
                                // 超出省略、可复制、可点击
                                if (item.ellipsis && item.copyable) {
                                    return (
                                        <Tooltip title={txt} placement="top">
                                            <Typography.Paragraph copyable ellipsis style={{ marginBottom: 0 }}>
                                                {item.clickable ? (
                                                    ButtonComp
                                                ) : (
                                                    <span>
                                                        {txt.toString()}
                                                        {suffixIconElement}
                                                    </span>
                                                )}
                                            </Typography.Paragraph>
                                        </Tooltip>
                                    );
                                }
                                // 超出省略
                                if (item.ellipsis)
                                    return (
                                        <Tooltip title={txt} placement="top">
                                            <span
                                                style={{
                                                    display: 'block',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {item.clickable ? (
                                                    ButtonComp
                                                ) : (
                                                    <span>
                                                        {txt.toString()}
                                                        {suffixIconElement}
                                                    </span>
                                                )}
                                            </span>
                                        </Tooltip>
                                    );
                                // 可复制
                                if (item.copyable) {
                                    return (
                                        <Typography.Paragraph style={{ marginBottom: 0 }} copyable>
                                            {item.clickable ? (
                                                ButtonComp
                                            ) : (
                                                <span>
                                                    {txt.toString()}
                                                    {suffixIconElement}
                                                </span>
                                            )}
                                        </Typography.Paragraph>
                                    );
                                }
                                return item.clickable ? (
                                    <Typography.Link onClick={() => handleActionClick(item.eventName, record)}>
                                        {txt.toString()}
                                        {suffixIconElement}
                                    </Typography.Link>
                                ) : (
                                    <span>
                                        {txt.toString()}
                                        {suffixIconElement}
                                    </span>
                                );
                            }
                            if (item.type === 'multiline') {
                                if (Array.isArray(txt)) {
                                    return txt.map((item, index) => {
                                        return (
                                            <div key={index}>
                                                <span>{item.label}</span>
                                                <span>
                                                    {item.value}
                                                    {suffixIconElement}
                                                </span>
                                            </div>
                                        );
                                    });
                                }
                                return (
                                    <span>
                                        {txt.toString()}
                                        {suffixIconElement}
                                    </span>
                                );
                            }
                            if (item.type === 'status') {
                                if (Array.isArray(txt)) {
                                    return txt.map((item, index) => {
                                        return (
                                            <span key={index}>
                                                <Badge status={item.status} text={item.text} />
                                                {suffixIconElement}
                                            </span>
                                        );
                                    });
                                }
                                if (typeof txt === 'object') {
                                    return (
                                        <span>
                                            <Badge status={txt.status} text={txt.text} />
                                            {suffixIconElement}
                                        </span>
                                    );
                                }
                                return (
                                    <span>
                                        <Badge status="success" text={txt.toString()} />
                                        {suffixIconElement}
                                    </span>
                                );
                            }
                            if (item.type === 'image') {
                                const { width = 30, height = 30 } = item?.imageConfig || {};
                                if (Array.isArray(txt)) {
                                    const adaptVal = (val: string) => (isNumber(Number(val)) ? Number(val) : val);
                                    return (
                                        <Image.PreviewGroup items={txt}>
                                            <Image width={adaptVal(width)} height={adaptVal(height)} src={txt[0]} />
                                        </Image.PreviewGroup>
                                    );
                                }
                                const adaptVal = (val: string) => (isNumber(Number(val)) ? Number(val) : val);
                                return (txt?.startsWith?.('http') && <Image src={txt} width={adaptVal(width)} height={adaptVal(height)} />) || txt;
                            }
                            if (item.type === 'tag') {
                                if (Array.isArray(txt)) {
                                    return txt.map((tag, index) => {
                                        if (typeof tag === 'object') {
                                            return (
                                                <Tag key={index} color={tag.color}>
                                                    {tag.label}
                                                    {suffixIconElement}
                                                </Tag>
                                            );
                                        }
                                        return (
                                            <Tag key={tag} color="green">
                                                {tag}
                                                {suffixIconElement}
                                            </Tag>
                                        );
                                    });
                                } else if (typeof txt === 'string' || typeof txt === 'number') {
                                    return (
                                        <Tag color="green">
                                            {txt}
                                            {suffixIconElement}
                                        </Tag>
                                    );
                                }
                                return (
                                    <span>
                                        {txt?.toString()}
                                        {suffixIconElement}
                                    </span>
                                );
                            }
                            if (item.type === 'action') {
                                const { moreActionIndex } = item;
                                const btns = item.list?.map((btn: any) => {
                                    let flage = true;
                                    if (btn.authCode) {
                                        flage = authMoInfos[btn.authCode] === '1';
                                        console.log('xxxx1', authMoInfos, item.authCode);
                                    }
                                    if (!flage) return; //没有权限
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
                                    let btnDisable: boolean = false;

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
                                            key={btn.eventName}
                                            type="link"
                                            size="small"
                                            danger={btn.danger}
                                            disabled={btnDisable}
                                            onClick={() => handleActionClick(btn.eventName, record)}
                                        >
                                            {btnTxt}
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
                                    return (
                                        <div className={styles.action}>
                                            {btns.slice(0, moreActionIndex - 1)}
                                            <Popover trigger="click" content={content}>
                                                <EllipsisOutlined />
                                            </Popover>
                                        </div>
                                    );
                                }
                                return <Space className={styles.actionsBox}>{btns}</Space>;
                            }
                            return txt;
                        } catch (error) {
                            console.error(`列[${item.title}]渲染失败`, error);
                            return config.props.empty || '-';
                        }
                    },
                };
            }),
            dataSource: data,
            loading,
        };
    }, [data, loading, selectedRowKeys, expandedRowKeys]);

    // 分页配置
    const pagination: TablePaginationConfig = useMemo(() => {
        const { pageNum = 'pageNum', pageSize = 'pageSize' } = config.props.field;
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

    /**
     * 操作按钮点击
     */
    const handleOperate = (eventName: string) => {
        const btnEvent = config.events.find((event) => event.eventName === eventName);
        handleActionFlow(btnEvent?.actions, searchParams);
    };

    /**
     * 表格行中的操作按钮点击
     */
    const handleActionClick = (eventName: string, record: any) => {
        const btnEvent = config.events.find((event) => event.eventName === eventName);
        handleActionFlow(btnEvent?.actions, record);
    };

    const title = config.props.leftTitle;
    const bulkActionList = config.props.bulkActionList || [];
    const iconsList: { [key: string]: any } = icons;
    const showSummary = config?.props?.showSummary;
    const scrollConfig = useMemo(() => {
        return config.props?.virtual
            ? ({
                  x: typeof config.props.scroll?.x === 'boolean' ? true : config.props.scroll?.x || true,
                  y: config.props.scroll?.y || 300,
              } as { x: number | true; y: number })
            : { x: config.props.scroll?.x, y: config.props.scroll?.y };
    }, [config.props?.virtual, config.props.scroll]);
    const baseStyle: CSSProperties = useMemo(() => {
        return config.props?.virtual
            ? {
                  ...config.style,
                  width: (config.style?.width as string | number) || '100%',
                  maxWidth: '100%', // 限制最大宽度为100%
                  minWidth: 0, // 允许在flex容器中正确收缩
                  overflow: 'hidden', // 防止宽度无限延伸
                  flex: '1 1 auto', // 弹性布局中自适应
                  boxSizing: 'border-box', // 盒模型计算
                  ...mStyle,
              }
            : { ...config.style, ...mStyle };
    }, [config.style, config.props?.virtual, mStyle]);

    const paginationOther = useMemo(() => {
        return config.props.hidePager ? false : pagination;
    }, [config.props.hidePager, pagination]);

    const tableStyle = useMemo(() => {
        return config.props?.virtual ? { width: '100%' } : undefined;
    }, [config.props?.virtual]);

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

    const getSummary = useCallback(
        (pageData: readonly any[]) => {
            const summaryFixed = config?.props?.summaryFixed;
            const summaryName = config?.props?.summaryName;
            const columnsNew = config.props.columns.filter((item) => item.isShow !== 'hide');
            const selectionType = config?.props?.selectionType;
            const hasName = selectionType === 'checkbox' || selectionType === 'radio';
            let mergeOffset = 0;
            return (
                <Table.Summary fixed={summaryFixed}>
                    <Table.Summary.Row style={{ backgroundColor: '#e0ecf4' }}>
                        {hasName ? <Table.Summary.Cell index={0}>{summaryName}</Table.Summary.Cell> : null}
                        {columnsNew.map((item, index) => {
                            const { summary = {} } = item;
                            const { title, colSpan, align, color } = summary;
                            let lastTitle = handleSummary(title)?.(pageData, selectedRows);
                            if (lastTitle) {
                                lastTitle = lastTitle || '';
                            }

                            if (index < mergeOffset) {
                                return null;
                            }

                            const span = colSpan || 1;
                            mergeOffset = index + span;

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
    return (
        visible && (
            <div data-id={id} data-type={type} style={baseStyle}>
                {title || elements?.length || bulkActionList?.length ? (
                    <div className={styles.toolbar}>
                        {title && <div className={styles.title}>{config?.props?.leftTitle}</div>}
                        <div className={styles.action}>
                            {elements?.length ? <NgapRender elements={elements} /> : null}
                            {bulkActionList?.map((item) => {
                                let flage = true;
                                if (item.authCode) {
                                    flage = authMoInfos[item.authCode] === '1';
                                }
                                if (!flage) return; //没有权限
                                return (
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
                                );
                            })}
                        </div>
                    </div>
                ) : null}

                <Table
                    {...tableProps}
                    className={styles.tableWrapper}
                    expandable={{ childrenColumnName: tableProps.expandable.childrenColumnName }}
                    virtual={config.props?.virtual}
                    scroll={scrollConfig}
                    style={tableStyle}
                    pagination={paginationOther}
                    summary={showSummary ? getSummary : undefined}
                />
            </div>
        )
    );
};
export default memo(forwardRef(NgapTable));
