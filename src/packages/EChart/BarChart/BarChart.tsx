import { ComponentType } from './../../types';
import { forwardRef, useEffect, useImperativeHandle, memo, useRef, useState, useMemo, CSSProperties, ForwardedRef } from 'react';
import { Bar } from '@ant-design/plots';
import { handleApi } from './../../utils/handleApi';
import { Spin } from 'antd';
import { useAppContext } from './../../../utils/AppProvider';
import { useShallow } from 'zustand/react/shallow';
import { getDictionary } from '@/packages/utils/dictionary';
import { debounce, isEmpty } from 'lodash-es';
import { isNotEmpty } from '@/packages/utils/util';
import { useDeepCompareEffect } from 'ahooks';
import { useWatchVariable } from '@/packages/utils/useWatchVariable.ts';

interface RefConfig {
    show: () => void;
    hide: () => void;
    update: (params?: Record<string, any>) => void;
    setStyle: (style: CSSProperties) => void;
}

/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @param attr 组件其它属性，比如：id、type、className
 * @returns
 */
const BarChart = ({ id, type, config }: ComponentType, ref: ForwardedRef<RefConfig>) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(true);
    const mapping = useRef<Record<string, any>>({});
    const [mStyle, setMStyle] = useState<CSSProperties>({});

    const _state = useAppContext();
    const { pageStore } = _state;
    const { formData, setElementAlias, variableData } = pageStore(
        useShallow((state: any) => ({
            formData: state.page?.pageData?.formData || {},
            variableData: state.page?.pageData?.variableData || {},
            setElementAlias: state.setElementAlias,
        })),
    );
    // 设置组件别名
    useEffect(() => {
        setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
    }, [config.props.elementAlias]);

    const apiData = useRef<Record<string, any>>({});

    const dealData = (data: Record<string, any> = {}) => {
        if (isEmpty(data)) return [];
        const { xField, yField, seriesField } = config.props || {};
        if (!xField?.length) return [];
        const len: number = data?.[yField]?.length || 0;
        if (!len) return [];
        return xField.reduce((prev: Record<string, any>[], xKey: string) => {
            return prev.concat(
                Array.from({ length: len }, (_, i) => {
                    return {
                        xField: data?.[xKey]?.[i],
                        [yField]: data?.[yField]?.[i],
                        [seriesField]: xKey,
                    };
                }),
            );
        }, []);
    };
    useEffect(() => {
        setData(dealData(apiData.current));
    }, [config.props.xField, config.props.yField, config.props.seriesField]);

    useDeepCompareEffect(() => {
        if (config.api.sourceType == 'api' && config?.api?.id) {
            getDictionary(config.api.id, (mappingObj) => {
                mapping.current = mappingObj;
                getDataList();
            });
        } else {
            getDataList();
        }
    }, [config.api]);

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
                    if (isNotEmpty(res?.data)) {
                        let resData = res.data;
                        if (config.api.sourceType == 'api') {
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
                        console.error('[BarChart]', 'data数据格式错误，请检查');
                    }
                })
                .finally(() => {
                    setLoading(false);
                });
        },
        300,
        { trailing: true, leading: true },
    );

    useWatchVariable({
        apiVariable: config.api,
        variableData,
        variablePrefix: 'content.variable.',
        callback: getDataList,
    });
    useWatchVariable({
        apiVariable: config.api,
        variableData: formData,
        variablePrefix: 'context.Form_',
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
    const color = useMemo(() => {
        return config.props.seriesField ? config.props.color : config.props.color[0];
    }, [config.props.seriesField, config.props.color]);
    return (
        visible && (
            <div data-id={id} data-type={type} style={{ ...config.style, ...mStyle }}>
                <Spin spinning={loading} size="large" wrapperClassName="spin-loading">
                    <Bar {...config.props} xField="xField" color={color} data={data} />
                </Spin>
            </div>
        )
    );
};
export default memo(forwardRef(BarChart));
