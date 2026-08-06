import { forwardRef, useEffect, useImperativeHandle, useState, memo, useMemo, CSSProperties, ForwardedRef, useRef } from 'react';
import { ButtonProps, List } from 'antd';
import { ComponentType } from '@/packages/types';
import { handleApi } from '@/packages/utils/handleApi';
import { useAppContext } from '@/utils/AppProvider';
import { useRenderItem } from './useRenderItem';
import { getDictionary } from '@/packages/utils/dictionary';
import { debounce, isEmpty } from 'lodash-es';
import { useDeepCompareEffect } from 'ahooks';
import { isNotEmpty } from '@/packages/utils/util';
import { useWatchVariable } from '@/packages/utils/useWatchVariable.ts';
import styles from './index.module.less';

interface RefConfig {
    show: () => void;
    hide: () => void;
    update: (params?: Record<string, any>) => void;
    setStyle: (style: CSSProperties) => void;
}

export interface IConfig {
    elementAlias?: string;
    bordered: boolean;
    itemLayout: 'horizontal' | 'vertical';
    size: 'small' | 'default' | 'large';
    split: boolean;
    header: string;
    footer: string;
    avatar: string;
    useIcon: boolean;
    icon?: string;
    title: {
        name: string;
        color: string;
    };
    desc: {
        name: string;
        color: string;
    };
    content: {
        name: string;
        color: string;
        type: string;
    };
    bulkActionList: Array<ButtonProps & { eventName: string; icon: string; text: string }>;
}

/**
 * 列表组件
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const MList = ({ id, type, config }: ComponentType<IConfig>, ref: ForwardedRef<RefConfig>) => {
    const [data, setData] = useState<Array<any>>([]);
    const [visible, setVisible] = useState(true);
    const mapping = useRef<Record<string, any>>({});
    const [mStyle, setMStyle] = useState<CSSProperties>({});
    const _state = useAppContext();
    const { pageStore } = _state;
    const variableData = pageStore((state: any) => state.page.pageData.variableData);
    useDeepCompareEffect(() => {
        if (config?.api?.sourceType == 'api' && config?.api?.id) {
            getDictionary(config?.api?.id, (mappingObj) => {
                mapping.current = mappingObj;
                getDataList();
            });
        } else {
            getDataList();
        }
    }, [config.api]);

    // 设置组件别名
    const setElementAlias = pageStore((state: any) => state.setElementAlias);
    useEffect(() => {
        setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
    }, [config.props.elementAlias]);

    const dealData = (data: Record<string, any> = {}) => {
        if (isEmpty(data)) return [];
        const configProps = config?.props || {};
        const keys = [configProps?.content?.name, configProps?.desc?.name, configProps?.title?.name, configProps?.avatar];
        const len = Math.max(...keys.map((key) => data?.[key]?.length || 0));
        return Array.from({ length: len }, (_, i) => ({
            [configProps.content.name]: data?.[configProps.content?.name]?.[i],
            [configProps.title.name]: data?.[configProps.title?.name]?.[i],
            [configProps.desc.name]: data?.[configProps.desc?.name]?.[i],
            [configProps.content.name]: data?.[configProps.content?.name]?.[i],
        }));
    };

    const apiData = useRef<Record<string, any>>({});

    useEffect(() => {
        setData(dealData(apiData.current));
    }, [config?.props?.content?.name, config?.props?.desc?.name, config?.props?.title?.name, config?.props?.avatar]);

    const getDataList = debounce(
        (params: Record<string, any> = {}) => {
            if (isEmpty(config?.api)) return;
            handleApi(config.api, params, _state).then((res) => {
                if (res?.code !== 0) return;
                if (isNotEmpty(res?.data)) {
                    let resData = res.data;
                    if (config?.api?.sourceType == 'api') {
                        resData = Object.fromEntries(
                            Object.entries(res.data).map(([key, value]) => [
                                mapping.current?.[key] || key, // 如果有映射就用新键，否则保留原键
                                value,
                            ]),
                        );
                    }
                    apiData.current = resData;
                    setData(dealData(resData));
                } else {
                    setData([]);
                    console.error('[List]', 'data数据格式错误，请检查');
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
            setStyle: (style: CSSProperties) => {
                setMStyle(style);
            },
        };
    });

    const renderItem = useRenderItem(config);
    return (
        visible && (
            <List
                className={styles.listBox}
                data-id={id}
                data-type={type}
                itemLayout={config?.props?.itemLayout}
                style={{ ...config.style, ...mStyle }}
                bordered={config?.props?.bordered}
                size={config?.props?.size}
                split={config?.props?.split}
                header={config?.props?.header || null}
                footer={config?.props?.footer || null}
                dataSource={data}
                renderItem={renderItem}
            />
        )
    );
};
export default memo(forwardRef(MList));
