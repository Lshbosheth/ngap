import { ComponentType } from './../../types';
import { forwardRef, useEffect, useImperativeHandle, memo, useRef, useState, useMemo, CSSProperties, ForwardedRef } from 'react';
import { Pie } from '@ant-design/plots';
import { handleApi } from './../../utils/handleApi';
import { Spin } from 'antd';
import { useAppContext } from './../../../utils/AppProvider';
import { useShallow } from 'zustand/react/shallow';
import { useDeepCompareEffect } from 'ahooks';
import { debounce, isEmpty } from 'lodash-es';
import { getDictionary } from '@/packages/utils/dictionary';
import { isNotEmpty } from '@/packages/utils/util';
import { useWatchVariable } from '@/packages/utils/useWatchVariable.ts';

interface RefConfig {
    show: () => void;
    hide: () => void;
    update: (params?: Record<string, any>) => void;
    setStyle: (style: CSSProperties) => void;
}

/**
 *
 * @param config 组件配置属性值
 * @param props 系统属性值：componentid、componentname等
 * @returns 返回组件
 */
const PieChart = ({ id, type, config }: ComponentType, ref: ForwardedRef<RefConfig>) => {
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

    useDeepCompareEffect(() => {
        if (config?.api?.sourceType == 'api' && config?.api?.id) {
            getDictionary(config.api.id, (mappingObj) => {
                mapping.current = mappingObj;
                getDataList();
            });
        } else {
            getDataList();
        }
    }, [config.api]);

    const apiData = useRef<Record<string, any>>({});

    const dealApiData = (data: Record<string, any> = {}) => {
        if (isEmpty(data)) return [];
        const { angleField, colorField } = config.props;
        const length = Math.max(data?.[angleField]?.length, data?.[colorField]?.length, 0);
        if (!length) return [];
        return Array.from({ length }, (_, i) => ({
            [angleField]: Number(data?.[angleField]?.[i]) || data?.[angleField]?.[i],
            [colorField]: Number(data?.[colorField]?.[i]) || data?.[colorField]?.[i],
        }));
    };

    const getDataList = debounce(
        (params: Record<string, any> = {}) => {
            if (isEmpty(config?.api)) {
                setLoading(false);
                return;
            }
            setLoading(true);
            handleApi(config.api, params, _state)
                .then((res) => {
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
                        setData(dealApiData(resData));
                    } else {
                        setData([]);
                        console.error('[PieChart]数据格式错误');
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
    useEffect(() => {
        setData(dealApiData(apiData.current));
    }, [config.props.angleField, config.props.colorField]);

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

    const baseStyle: CSSProperties = useMemo(() => {
        return { ...config.style, ...mStyle };
    }, [config.style, mStyle]);

    const divStyle: CSSProperties = useMemo(() => {
        return { textAlign: 'center' as const, fontWeight: 'bold', fontSize: 20, marginBottom: 10 };
    }, []);

    return (
        visible && (
            <div data-id={id} data-type={type} style={baseStyle}>
                <Spin spinning={loading} size="large" wrapperClassName="spin-loading">
                    <div>
                        <div style={divStyle}>{config.props.title}</div>
                        <Pie {...config.props} data={data} />
                    </div>
                </Spin>
            </div>
        )
    );
};
export default memo(forwardRef(PieChart));
