import { ComponentType } from './../../types';
import { forwardRef, useEffect, useImperativeHandle, useState, memo, useRef, useMemo, CSSProperties, ForwardedRef } from 'react';
import { DualAxes } from '@ant-design/plots';
import { handleApi } from './../../utils/handleApi';
import { useShallow } from 'zustand/react/shallow';
import { Spin } from 'antd';
import { useAppContext } from './../../../utils/AppProvider';
import { useDeepCompareEffect } from 'ahooks';
import { getDictionary } from '@/packages/utils/dictionary';
import { isEmpty, debounce } from 'lodash-es';
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
const BarAndLine = ({ id, type, config }: ComponentType, ref: ForwardedRef<RefConfig>) => {
    const [data, setData] = useState<any[]>([[], []]);
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
    const dealData = (data: Record<string, any> = {}): Record<string, any>[] => {
        if (isEmpty(data)) return [[], []];
        const { xField, yField_bar: barKey, yField_line: lineKey } = config.props;
        const xLen: number = data?.[xField]?.length || 0;
        if (!xLen) return [[], []];
        const barArr: Record<string, any>[] =
            barKey?.reduce((prev: Record<string, any>[], key: string): Record<string, any>[] => {
                return prev.concat(
                    Array.from({ length: xLen }, (_, i) => ({
                        name: key,
                        barYField: data?.[key]?.[i],
                        [xField]: data?.[xField]?.[i],
                    })),
                );
            }, []) || [];
        const lineArr: Record<string, any>[] =
            lineKey?.reduce((prev: Record<string, any>[], key: string): Record<string, any>[] => {
                return prev.concat(
                    Array.from({ length: xLen }, (_, i) => ({
                        name: key,
                        lineYField: data?.[key]?.[i],
                        [xField]: data?.[xField]?.[i],
                    })),
                );
            }, []) || [];
        return [barArr, lineArr];
    };
    // 配置项变化，重新格式化 ApiData 数据
    const apiData = useRef<Record<string, any>>({});
    useEffect(() => {
        setData(dealData(apiData.current));
    }, [config.props.xField, config.props.yField_bar, config.props.yField_line]);

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
                        setData(dealData(resData));
                    } else {
                        setData([[], []]);
                        console.error('[BarAndLine]数据格式错误');
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

    const config_props: any = useMemo(() => {
        const {
            theme,
            xField,
            appendPadding,
            legend,
            color,
            label,
            smooth,
            lineStyle,
            point, //line

            columnWidthRatio,
            columnStyle,
            isGroup,
            dodgePadding,
            intervalPadding, //bar
        } = config.props;

        const themeConf: any = {
            defaultColor: color[0],
            colors10: color,
            styleSheet: {
                backgroundColor: theme == 'dark' ? '#141414' : 'white',
            },
            components: {
                tooltip: {
                    domStyles: {
                        'g2-tooltip': {
                            backgroundColor: theme == 'dark' ? '#141414' : 'white',
                            color: theme == 'dark' ? 'white' : 'black',
                            boxShadow: '0px 0px 0px #aeaeae',
                        },
                    },
                },
            },
        };

        const configProps: any = Object.assign(
            {
                theme: themeConf, // 主题
                xField: 'time',
                yField: 'value+count',
                geometryOptions: [
                    {
                        geometry: 'column',
                    },
                    {
                        geometry: 'line',
                        lineStyle: {
                            lineWidth: 2,
                        },
                    },
                ],
                seriesField: 'name',
                color: ['#009af1', '#00d4bc', '#97d60c', '#f8d822', '#ffa034', '#f64541', '#f02ca0', '#9d59fa', '#34cbfe', '#0d89e9'],
                autoFit: true, // 图表自适应
                appendPadding: 20, // 图表内边距
                legend: {
                    layout: 'horizontal',
                    position: 'top',
                },
                point: {
                    shape: 'circle',
                    size: 5,
                },
            },
            { xField, appendPadding, legend },
            color,
        );
        configProps['yField'] = ['barYField', 'lineYField'];
        // if (yField_bar && yField_bar.length > 0) {
        //     configProps['yField'].push("barYField");
        // }
        // if (yField_line && yField_line.length > 0) {
        //     configProps['yField'].push("lineYField");
        // }
        configProps.geometryOptions = configProps.geometryOptions.map((item: any) => {
            const { geometry } = item;
            if (geometry == 'column') {
                item.columnWidthRatio = columnWidthRatio;
                item.columnStyle = columnStyle;
                item.label = label;
                item.isGroup = isGroup;
                item.dodgePadding = dodgePadding;
                item.intervalPadding = intervalPadding;
                item.seriesField = 'name';
            }
            if (geometry == 'line') {
                item.smooth = smooth;
                item.lineStyle = lineStyle;
                item.point = point;
                item.label = label;
                item.seriesField = 'name';
            }

            return item;
        });

        return configProps;
    }, [config.props]);

    return (
        visible && (
            <div data-id={id} data-type={type} style={{ ...config.style, ...mStyle }}>
                <Spin spinning={loading} size="large" wrapperClassName="spin-loading">
                    <DualAxes {...config_props} color={config?.props?.color} data={data} />
                </Spin>
            </div>
        )
    );
};
export default memo(forwardRef(BarAndLine));
