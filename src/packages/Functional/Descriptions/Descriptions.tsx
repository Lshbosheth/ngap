import { ComponentType } from './../../types';
import { ConfigProvider, Descriptions, Image, Tag, Tooltip, Typography } from 'antd';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState, memo, CSSProperties, ForwardedRef, ReactNode } from 'react';
import { handleApi } from './../../utils/handleApi';
import * as util from './../../utils/util';
import { handleActionFlow } from './../../utils/action';
import { useAppContext } from './../../../utils/AppProvider';
import { debounce, isEmpty } from 'lodash-es';
import { useDeepCompareEffect } from 'ahooks';
import { useWatchVariable } from '@/packages/utils/useWatchVariable.ts';
import styles from './index.module.less';

interface RefConfig {
    show: () => void;
    hide: () => void;
    setStyle: (style: CSSProperties) => void;
}

export interface IConfig {
    elementAlias?: string;
    items: Array<{
        key: string;
        label: string;
        name: string;
        type: string;
        ellipsis: boolean;
        copyable: boolean;
        clickable: boolean;
        eventName: string;
        render: string;
        span?: number | object;
        openTooltip?: boolean;
        tipContent?: string;
        fontSize?: number | string;
    }>;
    empty: string;
    labelBg: string;
}
/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */

const TextStyle = { marginLeft: 4, flexShrink: 0 };

const MButton = ({ id, type, config }: ComponentType<IConfig>, ref: ForwardedRef<RefConfig>) => {
    const [visible, setVisible] = useState(true);
    const [data, setData] = useState<any[]>([]);
    const [mStyle, setMStyle] = useState<CSSProperties>({});
    const _state = useAppContext();
    const { pageStore } = _state;
    const variableData = pageStore((state: any) => state.page.pageData.variableData);

    useDeepCompareEffect(() => {
        getDataList();
    }, [config.api]);

    // 设置组件别名
    const setElementAlias = pageStore((state: any) => state.setElementAlias);
    useEffect(() => {
        setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
    }, [config.props.elementAlias]);

    const getDataList = debounce(
        (params: Record<string, any> = {}) => {
            if (isEmpty(config.api)) return;
            handleApi(config.api, params, _state).then((res) => {
                if (res?.code !== 0) return;
                if (Array.isArray(res.data)) {
                    setData(res.data);
                } else {
                    setData([res.data]);
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
    // 对外暴露方法
    useImperativeHandle(ref, () => {
        return {
            show() {
                setVisible(true);
            },
            hide() {
                setVisible(false);
            },
            setStyle: (style: CSSProperties) => {
                setMStyle(style);
            },
        };
    });

    // 表格行中的操作按钮点击
    const handleActionClick = (eventName: string, record: any) => {
        const btnEvent = config.events.find((event) => event.eventName === eventName);
        handleActionFlow(btnEvent?.actions, record, _state);
    };

    // 解析HTML字符串
    const renderText = (text: string) => {
        const textStr = typeof text === 'string';
        const originText = util.cleanHtml(textStr ? text : '');
        // 解析带html标签的文本
        // 使用span替代div以支持省略号
        return <span dangerouslySetInnerHTML={{ __html: originText }} className="text-container-span" />;
    };

    // 提取纯文本（去除HTML标签），用于Tooltip显示
    const stripHtmlTags = (html: any): string => {
        if (typeof html !== 'string') return '';
        return html.replace(/<[^>]*>/g, '');
    };

    // 渲染内容
    const renderChildren = (txt: any, item: any, record: any) => {
        // 1. 先处理空值和数据类型转换
        let processedTxt = txt;
        if (!util.isNotEmpty(processedTxt)) {
            if (typeof config.props.empty === 'undefined') {
                processedTxt = '-';
            } else if (config.props.empty) {
                processedTxt = config.props.empty;
            }
        } else if (item.type === 'money') processedTxt = util.formatNumber(processedTxt, 'currency');
        else if (item.type === 'number') processedTxt = util.formatNumber(processedTxt);
        else if (item.type === 'date1') processedTxt = util.formatDate(processedTxt, 'YYYY-MM-DD');
        else if (item.type === 'date2') processedTxt = util.formatDate(processedTxt);

        // 2. 如果存在render，则执行render（render的返回值可能为React组件或字符串）
        let renderedContent: ReactNode = processedTxt;
        if (item.render) {
            try {
                const renderFn = new Function('text', 'record', `return (${item.render})(text,record);`);
                // render可能返回React组件或字符串
                renderedContent = renderFn(processedTxt, record);
            } catch (error) {
                console.error(`列[${item.label}]渲染失败`, error);
                renderedContent = '解析异常';
            }
        }

        // 3. 根据type类型进行基础渲染
        if (item.type === 'text') {
            // 转换为字符串用于省略计算
            const contentText = typeof renderedContent === 'string' ? renderedContent : String(renderedContent);
            // 使用renderText解析HTML（如果renderedContent是字符串）
            const htmlContent = typeof renderedContent === 'string' ? renderText(renderedContent) : renderedContent;
            // 提取纯文本用于复制（去除HTML标签）
            const plainText = stripHtmlTags(contentText);

            // 超出省略 + 可复制 + 可点击
            if (item.ellipsis && item.copyable && item.clickable) {
                // 提取纯文本用于Tooltip显示和复制
                const tooltipTitle = item.openTooltip ? item.tipContent || stripHtmlTags(contentText) : undefined;
                return (
                    <Tooltip title={tooltipTitle}>
                        <span
                            onClick={() => handleActionClick(item.eventName, record)}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                maxWidth: '100%',
                                cursor: 'pointer',
                                color: '#1890ff',
                            }}
                        >
                            <span
                                style={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: 'calc(100% - 20px)',
                                }}
                            >
                                {htmlContent}
                            </span>
                            <Typography.Text copyable={{ text: plainText }} style={TextStyle} />
                        </span>
                    </Tooltip>
                );
            }

            // 超出省略 + 可复制（无点击）
            if (item.ellipsis && item.copyable) {
                // 提取纯文本用于Tooltip显示和复制
                const tooltipTitle = item.openTooltip ? item.tipContent || stripHtmlTags(contentText) : undefined;
                return (
                    <Tooltip title={tooltipTitle}>
                        <span
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                maxWidth: '100%',
                            }}
                        >
                            <span
                                style={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: 'calc(100% - 20px)',
                                }}
                            >
                                {htmlContent}
                            </span>
                            <Typography.Text copyable={{ text: plainText }} style={TextStyle} />
                        </span>
                    </Tooltip>
                );
            }

            // 超出省略 + 可点击（无复制）
            if (item.ellipsis && item.clickable) {
                // 提取纯文本用于Tooltip显示
                const tooltipTitle = item.openTooltip ? item.tipContent || stripHtmlTags(contentText) : undefined;
                return (
                    <Tooltip title={tooltipTitle}>
                        <span
                            onClick={() => handleActionClick(item.eventName, record)}
                            style={{
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                cursor: 'pointer',
                                color: '#1890ff',
                            }}
                        >
                            {htmlContent}
                        </span>
                    </Tooltip>
                );
            }

            // 超出省略（无复制、无点击）
            if (item.ellipsis) {
                // 提取纯文本用于Tooltip显示
                const tooltipTitle = item.openTooltip ? item.tipContent || stripHtmlTags(contentText) : undefined;
                return (
                    <Tooltip title={tooltipTitle}>
                        <span
                            style={{
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {htmlContent}
                        </span>
                    </Tooltip>
                );
            }

            // 可复制 + 可点击（无省略）
            if (item.copyable && item.clickable) {
                const tooltipTitle = item.openTooltip ? item.tipContent || plainText : undefined;
                return (
                    <Tooltip title={tooltipTitle}>
                        <span onClick={() => handleActionClick(item.eventName, record)} style={{ cursor: 'pointer', color: '#1890ff' }}>
                            <Typography.Text copyable={{ text: plainText }}>{htmlContent}</Typography.Text>
                        </span>
                    </Tooltip>
                );
            }

            // 仅可复制（无省略）
            if (item.copyable) {
                const tooltipTitle = item.openTooltip ? item.tipContent || plainText : undefined;
                return (
                    <Tooltip title={tooltipTitle}>
                        <Typography.Text copyable={{ text: plainText }}>{htmlContent}</Typography.Text>
                    </Tooltip>
                );
            }

            // 仅可点击（无省略、无复制）- 使用块级元素支持换行
            if (item.clickable) {
                const tooltipTitle = item.openTooltip ? item.tipContent || plainText : undefined;
                return (
                    <Tooltip title={tooltipTitle}>
                        <span
                            onClick={() => handleActionClick(item.eventName, record)}
                            style={{ cursor: 'pointer', color: '#1890ff', wordBreak: 'break-all' }}
                        >
                            {htmlContent}
                        </span>
                    </Tooltip>
                );
            }

            // 无省略、无复制、无点击的情况
            const tooltipText = item.tipContent || contentText;
            return item.openTooltip ? (
                <Tooltip title={tooltipText}>
                    <Typography.Text style={{ fontSize: item.fontSize }}>{renderText(contentText)}</Typography.Text>
                </Tooltip>
            ) : (
                <Typography.Text style={{ fontSize: item.fontSize }}>{renderText(contentText)}</Typography.Text>
            );
        }

        // image类型
        if (item.type === 'image') {
            return <Image src={txt} width={30} />;
        }

        // tag类型
        if (item.type === 'tag') {
            if (Array.isArray(txt)) {
                return txt.map((tag) => <Tag key={tag}>{tag}</Tag>);
            } else if (typeof txt === 'string' || typeof txt === 'number') {
                return <Tag>{txt}</Tag>;
            }
            return txt?.toString();
        }

        // 其他类型（默认文本）
        const otherContentText = typeof renderedContent === 'string' ? renderedContent : String(renderedContent);
        const otherTooltipText = item.tipContent || otherContentText;
        return item.openTooltip ? (
            <Tooltip title={otherTooltipText}>
                <Typography.Text style={{ fontSize: item.fontSize }}>{renderText(otherContentText)}</Typography.Text>
            </Tooltip>
        ) : (
            <Typography.Text style={{ fontSize: item.fontSize }}>{renderText(otherContentText)}</Typography.Text>
        );
    };

    const items = useMemo(() => {
        return config.props.items.map((item) => {
            const txt = data[0]?.[item.name] || '';
            const children = renderChildren(txt, item, data[0] || {});
            return {
                key: item.key,
                label: item.label,
                children,
                span: item.span,
            };
        });
    }, [config.props.items, data]);

    return (
        visible && (
            <ConfigProvider theme={{ components: { Descriptions: { labelBg: config.props.labelBg } } }}>
                <Descriptions className={styles.descriptionsBox} {...config.props} items={items} data-id={id} data-type={type} style={{ ...config.style, ...mStyle }} />
            </ConfigProvider>
        )
    );
};
export default memo(forwardRef(MButton));
