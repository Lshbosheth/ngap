import { ComponentType } from '@/packages/types';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState, memo, useMemo, ForwardedRef, CSSProperties } from 'react';
import { handleApi } from '@/packages/utils/handleApi';
import styles from './index.module.less';
import { Breadcrumb, Spin, Tooltip } from 'antd';
import { useAppContext } from '@/utils/AppProvider';
import { useDeepCompareEffect } from 'ahooks';
import { isEmpty, debounce } from 'lodash-es';
import { ItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { useWatchVariable } from '@/packages/utils/useWatchVariable.ts';

interface RefConfig {
    show: () => void;
    hide: () => void;
    update: (params: Record<string, any>) => void;
    setStyle: (style: CSSProperties) => void;
}

/**
 *
 * @param config 组件配置属性值
 * @param props 系统属性值：componentid、componentname等
 * @returns 返回组件
 */
const WBreadcrumb = ({ id, type, config, onClick }: ComponentType, ref: ForwardedRef<RefConfig>) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(true);
    const breadcrumbWrapperRef = useRef<HTMLDivElement>(null);
    const [mStyle, setMStyle] = useState<CSSProperties>({});
    const _state = useAppContext();
    const { pageStore, mode } = _state;
    const variableData = pageStore((state: any) => state.page.pageData.variableData);
    const setElementAlias = pageStore((state: any) => state.setElementAlias);

    useDeepCompareEffect(() => {
        getDataList();
    }, [config.api]);

    useEffect(() => {
        setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
    }, [config.props.elementAlias]);

    const getDataList = debounce(
        (params: Record<string, any> = {}) => {
            if (isEmpty(config?.api)) {
                setLoading(false);
                return;
            }
            setLoading(true);
            handleApi(config.api, params, _state)
                .then((res: any) => {
                    if (res?.code !== 0) return;
                    if (Array.isArray(res.data)) {
                        setData(res.data);
                    } else {
                        setData([]);
                        console.error('[面包屑]数据格式错误');
                    }
                })
                .finally(() => {
                    setLoading(false);
                });
        },
        300,
        {
            trailing: true,
            leading: true,
        },
    );
    useWatchVariable({
        apiVariable: config?.api,
        variableData,
        variablePrefix: 'context.variable.',
        callback: getDataList,
    });
    useImperativeHandle(ref, () => {
        return {
            show() {
                setVisible(true);
            },
            hide() {
                setVisible(false);
            },
            update: (params: Record<string, any>) => {
                getDataList(params);
            },
            setStyle: (style: CSSProperties) => {
                setMStyle(style);
            },
        };
    });
    const transformItems = () => {
        const selectedIndex = config.props?.selectedIndex || 0;
        const maxLength = config.props?.maxLength || 5;
        const menuMountIndex = config.props?.menuMountIndex ?? 2;
        let truncated: ItemType[] = [];
        const removed: ItemType[] = [];
        if (maxLength > 1 && maxLength < data.length && menuMountIndex >= 0 && menuMountIndex < maxLength) {
            // 计算需要截取的数量
            const removeCount = data.length - maxLength;

            removed.push(...data.slice(menuMountIndex, menuMountIndex + 1 + removeCount));
            truncated = [
                ...data.slice(0, menuMountIndex),
                { title: '...', path: '/', disabled: false },
                ...data.slice(menuMountIndex + 1 + removeCount),
            ];

            truncated[menuMountIndex].menu = {
                items: removed.map((item) => {
                    const randomKey = `key_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
                    return {
                        key: randomKey,
                        label: (
                            <a target="_blank" rel="noopener noreferrer" href={item.path}>
                                {item.title}
                            </a>
                        ),
                    };
                }),
            };
        } else {
            truncated = data
                .filter((item) => !!item?.title)
                .map((item, index) => ({
                    ...item,
                    key: index,
                    title:
                        selectedIndex === index ? (
                            <span className="breadcrumbActive">{item.title}</span>
                        ) : item.title?.length > 8 ? (
                            <span>
                                <Tooltip title={item.title} placement="top">
                                    {item.title.substring(0, 8) + '...'}
                                </Tooltip>
                            </span>
                        ) : (
                            <span>{item.title}</span>
                        ),
                    // 核心：绑定点击事件（Antd v4+ 通过onClick配置）
                    onClick: () => handleItemClick(item, index),
                }));
        }
        return {
            truncated,
            removed,
        };
    };
    const handleItemClick = (item: Record<string, any>, index: number) => {
        if (mode === 'preview') {
            onClick?.({
                ...item,
                [config?.props?.selectedIndex]: index,
            });
        }
    };
    useEffect(() => {
        const ol = breadcrumbWrapperRef.current?.querySelector<HTMLOListElement>('.ant-breadcrumb > ol');
        if (!ol) return;

        const align = config?.style?.textAlign;
        switch (align) {
            case 'center':
                ol.style.justifyContent = 'center';
                break;
            case 'right':
                ol.style.justifyContent = 'flex-end';
                break;
            default:
                ol.style.justifyContent = 'flex-start';
        }
    }, [config?.style?.textAlign]);

    return (
        visible && (
            <div ref={breadcrumbWrapperRef} data-id={id} data-type={type} style={{ ...config.style, ...mStyle }} className={styles.breadcrumbItem}>
                <Spin spinning={loading} size="large" wrapperClassName="spin-loading">
                    <Breadcrumb items={transformItems().truncated} separator={config?.props?.separator} />
                </Spin>
            </div>
        )
    );
};
export default memo(forwardRef(WBreadcrumb));
