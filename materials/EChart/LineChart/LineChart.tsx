import { ComponentType } from '@materials/types';
import { forwardRef, useEffect, useImperativeHandle, memo, useState, useRef, useMemo, CSSProperties, ForwardedRef } from 'react';
import { Line } from '@ant-design/plots';
import { handleApi } from '@materials/utils/handleApi';
import { useShallow } from 'zustand/react/shallow';
import { Spin } from 'antd';
import { usePageStore } from '@materials/stores/pageStore';
import {
    UnitType,
    detectUnitType,
    convertValueToNumber,
    formatValueWithUnit,
    formatDifferenceWithUnit,
    getLighterColor,
} from '../chartCalculationUtil';
import { debounce, isEmpty } from 'lodash-es';
import { isNotEmpty } from '@materials/utils/util';
import { useDeepCompareEffect } from 'ahooks';
import { getDictionary } from '@materials/utils/dictionary';
import { useWatchVariable } from '@materials/utils/useWatchVariable';

interface RefConfig {
    show: () => void;
    hide: () => void;
    update: (params?: Record<string, any>) => void;
    updateyField: (params: Record<string, any>) => void;
    setStyle: (style: CSSProperties) => void;
}

/**
 *
 * @param config 组件配置属性值
 * @param props 系统属性值：componentid、componentname等
 * @returns 返回组件
 */
const LineChart = ({ id, type, config }: ComponentType, ref: ForwardedRef<RefConfig>) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(true);
    const mapping = useRef<Record<string, any>>({});
    const [mStyle, setMStyle] = useState<CSSProperties>({});
    const { variableData, formData } = usePageStore(
        useShallow((state: any) => ({
            formData: state.page.pageData.formData || {},
            variableData: state?.page?.pageData?.variableData || {},
        })),
    );

    const dealData = (data: Record<string, any> = {}): any[] => {
        if (isEmpty(data)) return [];
        const { xField, yField, seriesField } = config.props;
        const len: number = data?.[xField]?.length || 0;
        if (!len) return [];
        // 检测第一个有效数据的单位类型
        let detectedUnitType: UnitType = { type: 'number', unit: '' };
        return yField.reduce((prev: any[], y: string) => {
            return prev.concat(
                Array.from({ length: len }, (_, i) => {
                    // 获取原始值
                    const originalValue = data?.[y]?.[i];

                    // 第一次检测到有效的单位类型时进行保存
                    if (detectedUnitType.type === 'number' && typeof originalValue === 'string' && originalValue !== '') {
                        detectedUnitType = detectUnitType(originalValue);
                    }
                    return {
                        // 转换值为数字用于图表显示
                        yField: convertValueToNumber(originalValue),
                        originalValue,
                        unitType: detectedUnitType.type,
                        [xField]: data?.[xField]?.[i],
                        [seriesField]: y,
                    };
                }),
            );
        }, []);
    };
    // 生成对比虚线数据（前一个节点的值）
    const generateComparisonData = (currentData: any[], xField: string, seriesField?: string) => {
        if (isEmpty(currentData)) return [];
        const comparisonLineStyle = config.props.comparisonLineStyle || 'sameColorDashed'; // 默认同色虚线
        // 筛选当前系列的所有数据并按顺序排列
        const allSeriesData = currentData.filter((item) => (seriesField ? item[seriesField] : true));

        return allSeriesData.map((item, index) => {
            if (index > 0) {
                // 获取当前系列的键
                const key = seriesField ? item[seriesField] : 'default';
                // 如果不是第一个点，添加对比数据点（前一个节点的值）
                return {
                    [xField]: item[xField],
                    yField: allSeriesData?.[index - 1]?.yField,
                    [seriesField || 'series']: `${key}_comparison`,
                    isComparison: true,
                    originalSeries: key,
                    comparisonStyle: comparisonLineStyle, // 记录使用的样式类型
                };
            } else {
                // 原始数据点
                return { ...item, isComparison: false };
            }
        });
    };
    // 自定义 tooltip 内容
    const customTooltip = (title: any, items: any[]) => {
        if (!items || items.length === 0) return '';

        // 如果启用了对比虚线功能，过滤掉对比线的提示信息
        const filteredItems = config.props.showPreviousNodeLine
            ? items.filter((item: any) => {
                  const seriesField = config.props.seriesField;
                  const name = item.name;
                  // 过滤掉包含 _comparison 的系列名（对比线）
                  if (seriesField && name.includes('_comparison')) {
                      return false;
                  }
                  return true;
              })
            : items;

        // 如果过滤后没有数据项，返回空字符串
        if (filteredItems.length === 0) return '';

        let html = `<div style="margin: 0;padding: 0;line-height: 1.5;">`;

        filteredItems.forEach((item: any, index: number) => {
            const { name, value } = item;
            const xField = config.props.xField;
            const seriesField = config.props.seriesField;

            // 用于存储差值颜色，供当前值使用
            let diffColor = '#333'; // 默认颜色

            html += `<div style="margin-bottom: ${index === filteredItems.length - 1 ? '0' : '8px'};">`;
            html += `<span style="display:inline-block;margin-right:8px;border-radius:50%;width:10px;height:10px;background-color:${item.color};"></span>`;
            html += `<span style="font-weight:bold;">${name}:</span> `;
            html += `<br/>`;

            // 如果启用了差值对比功能，先计算差值获取颜色
            if (config?.props?.showDifference) {
                const currentSeries = seriesField ? name : 'default';

                // 查找当前系列的所有数据点（排除对比线）
                const currentSeriesData = data.filter((d: any) => {
                    const isSameSeries = seriesField ? d[seriesField] === currentSeries : true;
                    const isNotComparison = !d.isComparison;
                    return isSameSeries && isNotComparison;
                });

                // 按x轴排序以确保顺序正确
                currentSeriesData.sort((a: any, b: any) => {
                    const aIndex = data.indexOf(a);
                    const bIndex = data.indexOf(b);
                    return aIndex - bIndex;
                });

                // 找到当前值的索引
                const currentIndex = currentSeriesData.findIndex((d: any) => d[xField] === title);

                // 获取单位类型用于格式化显示
                const unitType = currentSeriesData[currentIndex]?.unitType || 'number';

                // 获取当前数据点，使用原始值进行格式化显示
                const currentDataPoint = currentSeriesData[currentIndex];

                // 格式化当前值显示
                let formattedCurrentValue = value;
                if (currentDataPoint && currentDataPoint.originalValue !== undefined) {
                    // 优先使用原始值，保持原始格式
                    formattedCurrentValue = currentDataPoint.originalValue;
                } else {
                    // 如果没有原始值，则使用formatValueWithUnit进行格式化
                    formattedCurrentValue = formatValueWithUnit(parseFloat(value), unitType);
                }

                // 显示当前值，格式为：X轴内容+当前值
                const currentValueLabel = config.props.currentValueLabel || '当前值:';
                html += `<span style="color:#999;">${title}</span>`;
                html += `<br/>`;
                html += `<span style="color:#999;">${currentValueLabel}</span>`;
                html += `<span style="color:#999;font-weight:bold;">${formattedCurrentValue}</span>`;
                html += `<br/>`;

                // 第一个节点时，仅展示当前值，不展示差值信息
                if (currentIndex === 0) {
                    html += `</div>`;
                    return; // 跳过后续的差值计算逻辑
                }

                if (currentIndex > 0) {
                    const prevDataPoint = currentSeriesData[currentIndex - 1];
                    const currentDataPoint = currentSeriesData[currentIndex];

                    // 转换当前值和上个节点的值为数字进行计算
                    const currentValue = currentDataPoint.yField; // 已经是转换后的数字值
                    const prevValue = prevDataPoint.yField; // 已经是转换后的数字值

                    // 异常处理：上节点数据为0或上节点数据为空，差值类型计算百分比时，对应提示框差值展示为"--"
                    if (
                        prevValue === 0 ||
                        prevDataPoint.originalValue === '' ||
                        prevDataPoint.originalValue === null ||
                        prevDataPoint.originalValue === undefined
                    ) {
                        // 格式化上个节点值显示（使用原始值）
                        let formattedPrevValue;
                        if (prevDataPoint && prevDataPoint.originalValue !== undefined) {
                            formattedPrevValue = prevDataPoint.originalValue;
                        } else {
                            formattedPrevValue = formatValueWithUnit(prevValue, unitType);
                        }

                        // 显示上个节点值
                        const previousValueLabel = config.props.previousValueLabel || '上个节点值:';
                        html += `<span style="color:#999;font-size:12px;">${previousValueLabel} </span>`;
                        html += `<span style="color:#333;font-weight:bold;font-size:12px;">${formattedPrevValue}</span>`;
                        html += `<br/>`;

                        // 差值显示为"--"
                        const differenceLabel = config.props.differenceLabel || '较上个节点';
                        html += `<span style="color:#999;font-size:12px;">${differenceLabel}: </span>`;
                        html += `<span style="color:#999;font-weight:bold;font-size:12px;">--</span>`;
                        html += `<br/>`;

                        // 环比显示为"--"
                        if (config.props.showMomRate) {
                            const momLabel = config.props.momRateLabel || '环比:';
                            html += `<span style="color:#999;font-size:12px;">${momLabel} </span>`;
                            html += `<span style="color:#999;font-weight:bold;font-size:12px;">--</span>`;
                            html += `<br/>`;
                        }
                    } else {
                        // 正常计算差值
                        const diff = currentValue - prevValue;
                        diffColor = diff >= 0 ? config.props.positiveColor || '#52c41a' : config.props.negativeColor || '#ff4d4f';

                        // 格式化上个节点值显示（使用原始值）
                        let formattedPrevValue;
                        if (prevDataPoint && prevDataPoint.originalValue !== undefined) {
                            formattedPrevValue = prevDataPoint.originalValue;
                        } else {
                            formattedPrevValue = formatValueWithUnit(prevValue, unitType);
                        }

                        // 显示上个节点值
                        const previousValueLabel = config.props.previousValueLabel || '上个节点值:';
                        html += `<span style="color:#999;font-size:12px;">${previousValueLabel} </span>`;
                        html += `<span style="color:#333;font-weight:bold;font-size:12px;">${formattedPrevValue}</span>`;
                        html += `<br/>`;

                        const diffSymbol = diff >= 0 ? '+' : '';
                        const arrow = diff >= 0 ? '↑' : '↓';

                        // 计算环比（与前一个节点相比的百分比变化）
                        let momPercentage = null;
                        let momText = '';
                        if (prevValue !== 0) {
                            momPercentage = ((currentValue - prevValue) / Math.abs(prevValue)) * 100;
                            const momSymbol = momPercentage >= 0 ? '+' : '';
                            const momColor = momPercentage >= 0 ? config.props.positiveColor || '#52c41a' : config.props.negativeColor || '#ff4d4f';
                            momText = `<span style="color:${momColor};font-weight:bold;font-size:12px;">${momSymbol}${momPercentage.toFixed(
                                2,
                            )}%</span>`;
                        }

                        // 格式化差值显示（按实际差值展示并携带单位）
                        const formattedDiff = formatDifferenceWithUnit(diff, unitType);

                        const differenceLabel = config.props.differenceLabel || '较上个节点';
                        html += `<span style="color:#999;font-size:12px;">${differenceLabel}: </span>`;
                        html += `<span style="color:${diffColor};font-weight:bold;font-size:12px;">${arrow} ${diffSymbol}${formattedDiff}</span>`;
                        html += `<br/>`;

                        // 显示环比
                        if (momPercentage !== null && config.props.showMomRate) {
                            const momLabel = config.props.momRateLabel || '环比:';
                            html += `<span style="color:#999;font-size:12px;">${momLabel} </span>`;
                            html += momText;
                            html += `<br/>`;
                        }
                    }
                }
            }

            html += `</div>`;
        });

        html += `</div>`;
        return html;
    };

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

    // 监听配置变化，重新处理数据
    useEffect(() => {
        const newData = dealData(apiData.current);

        // 重新处理数据以添加或移除对比线
        let finalData = newData.filter((item: any) => !item.isComparison); // 先移除所有对比线

        // 如果启用，生成新的对比数据
        if (config.props.showPreviousNodeLine) {
            finalData = generateComparisonData(finalData, config.props.xField, config.props.seriesField);
        }

        setData(finalData);
    }, [config.props.showPreviousNodeLine, config.props.xField, config.props.yField, config.props.seriesField]);

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
                        if (config?.api?.sourceType == 'api') {
                            resData = Object.fromEntries(
                                Object.entries(res.data).map(([key, value]) => [
                                    mapping.current?.[key] || key, // 如果有映射就用新键，否则保留原键
                                    value,
                                ]),
                            );
                        }

                        apiData.current = resData;
                        let finalData = dealData(resData);

                        // 如果启用上个节点对比虚线功能，生成对比数据
                        if (config.props.showPreviousNodeLine) {
                            finalData = generateComparisonData(finalData, config.props.xField, config.props.seriesField);
                        }

                        setData(finalData);
                    } else {
                        setData([]);
                        console.error('[LineChart]数据格式错误');
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
        variablePrefix: 'context.variable.',
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
            updateyField: (params: Record<string, any>) => {
                if (params[`${id}`]) {
                    config.props.yField = params[`${id}`].split(',');
                }
                getDataList(params);
            },
            setStyle: (style: CSSProperties) => {
                setMStyle(style);
            },
        };
    });
    return (
        visible && (
            <div style={{ ...config.style, ...mStyle }} data-id={id} data-type={type}>
                <Spin spinning={loading} size="large" wrapperClassName="spin-loading">
                    <Line
                        {...config.props}
                        yField="yField"
                        smooth={config.props.smooth}
                        meta={{
                            yField: {
                                alias: config.props.yAxis?.title?.text || '',
                                formatter: (text: string, item: any, index: number) => {
                                    // 获取当前数据点的原始值用于折线上显示
                                    const currentData = data.find((d: any) => d.yField === text);
                                    if (currentData && currentData.originalValue) {
                                        return currentData.originalValue;
                                    }
                                    return text;
                                },
                            },
                        }}
                        yAxis={{
                            ...config.props.yAxis,
                            title: {
                                ...config.props.yAxis?.title,
                                text: (() => {
                                    // 在Y轴标题上添加单位，如果没有标题则只显示单位
                                    if (data.length > 0 && data[0].unitType) {
                                        const unitInfo = detectUnitType(data[0].originalValue);
                                        // 只返回单位，不包含原标题，确保单位在Y轴顶部显示
                                        return unitInfo.unit;
                                    }
                                    return config.props.yAxis?.title?.text || '';
                                })(),
                            },
                            label: {
                                ...config.props.yAxis?.label,
                                formatter: (text: string, item: any, index: number) => {
                                    // 获取数据的单位类型用于Y轴显示
                                    if (data.length > 0 && data[0].unitType) {
                                        const unitType = data[0].unitType;
                                        const value = parseFloat(text);
                                        return formatValueWithUnit(value, unitType);
                                    }
                                    return text;
                                },
                            },
                        }}
                        // 根据是否启用对比虚线设置颜色和系列字段
                        seriesField={config.props.showPreviousNodeLine ? config.props.seriesField || 'series' : config.props.seriesField}
                        color={
                            config.props.showPreviousNodeLine
                                ? (datum: any) => {
                                      // 通过系列名称判断是否为对比线
                                      const seriesName = datum[config.props.seriesField || 'series'];
                                      const isComparisonLine = seriesName && seriesName.includes('_comparison');
                                      if (isComparisonLine) {
                                          // 从系列名称中提取原始系列名称
                                          const originalSeries = seriesName.replace('_comparison', '');
                                          const originalColor = config.props.seriesField
                                              ? config.props.color[originalSeries] || '#5B8FF9'
                                              : Array.isArray(config.props.color)
                                              ? config.props.color[0]
                                              : config.props.color;

                                          // 根据对比线样式类型返回不同的颜色
                                          const comparisonLineStyle = config.props.comparisonLineStyle || 'sameColorDashed';

                                          if (comparisonLineStyle === 'lighterColor') {
                                              // 同色系浅一色：返回浅色版本
                                              return getLighterColor(originalColor, 0.3);
                                          } else {
                                              // 同色虚线（默认）：使用相同颜色但更高透明度
                                              if (originalColor.startsWith('#')) {
                                                  const r = parseInt(originalColor.slice(1, 3), 16);
                                                  const g = parseInt(originalColor.slice(3, 5), 16);
                                                  const b = parseInt(originalColor.slice(5, 7), 16);
                                                  const opacity = 0.85; // 提高透明度到 0.85，使线条更加明显
                                                  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
                                              }
                                              return originalColor;
                                          }
                                      }
                                      // 原始线使用主题配置下的颜色色系
                                      if (config.props.seriesField) {
                                          const seriesName = datum[config.props.seriesField];
                                          // 如果有自定义颜色配置，使用配置的颜色
                                          if (config.props.color && typeof config.props.color === 'object' && !Array.isArray(config.props.color)) {
                                              return config.props.color[seriesName];
                                          }
                                          // 否则返回undefined，让Line组件使用默认的主题色系
                                          return undefined;
                                      }
                                      // 没有系列字段时，返回undefined使用默认主题色系
                                      return undefined;
                                  }
                                : config.props.seriesField
                                ? config.props.color
                                : config.props.color[0]
                        }
                        data={data}
                        lineStyle={
                            config.props.showPreviousNodeLine
                                ? (datum: any) => {
                                      const seriesName = datum[config.props.seriesField || 'series'];
                                      const isComparisonLine = seriesName && seriesName.includes('_comparison');

                                      if (isComparisonLine) {
                                          // 根据对比线样式类型设置不同的线条样式
                                          const comparisonLineStyle = config.props.comparisonLineStyle || 'sameColorDashed';

                                          if (comparisonLineStyle === 'sameColorDashed') {
                                              // 同色虚线：使用虚线样式
                                              return {
                                                  lineDash: [4, 4], // 设置虚线模式：4px实线，4px空白
                                                  lineWidth: config.props.lineStyle?.lineWidth || 2,
                                              };
                                          } else {
                                              // 其他样式（如同色系浅一色）：使用实线样式
                                              return {
                                                  lineWidth: config.props.lineStyle?.lineWidth || 2,
                                              };
                                          }
                                      }

                                      // 原始线始终使用实线样式
                                      return {
                                          lineWidth: config.props.lineStyle?.lineWidth || 2,
                                      };
                                  }
                                : (() => {
                                      // 当showPreviousNodeLine关闭时，确保原始线始终为实线
                                      if (typeof config.props.lineStyle === 'function') {
                                          return (datum: any) => {
                                              const style = config.props.lineStyle(datum);
                                              return {
                                                  ...style,
                                                  lineDash: undefined, // 移除任何虚线设置，确保为实线
                                              };
                                          };
                                      }
                                      return {
                                          ...(config.props.lineStyle || {}),
                                          lineDash: undefined, // 移除任何虚线设置，确保为实线
                                      };
                                  })()
                        }
                        state={
                            config.props.showPreviousNodeLine
                                ? {
                                      active: {
                                          style: {
                                              lineWidth: 2,
                                          },
                                      },
                                      selected: {
                                          style: {
                                              lineWidth: 2,
                                          },
                                      },
                                  }
                                : undefined
                        }
                        legend={
                            config.props.showLegend !== false
                                ? config.props.showPreviousNodeLine
                                    ? (() => {
                                          // 获取所有唯一的系列名称（排除对比线）
                                          const uniqueSeries = Array.from(
                                              new Set(data.map((item: any) => item[config.props.seriesField || 'series'])),
                                          ).filter((name: string) => !name.includes('_comparison'));

                                          return {
                                              ...config.props.legend,
                                              custom: true,
                                              items: uniqueSeries.map((seriesName: string) => ({
                                                  name: seriesName,
                                                  value: seriesName,
                                                  marker: {
                                                      style: {
                                                          fill: config.props.seriesField
                                                              ? config.props.color?.[seriesName] || undefined
                                                              : Array.isArray(config.props.color)
                                                              ? config.props.color[0]
                                                              : config.props.color,
                                                      },
                                                  },
                                              })),
                                          };
                                      })()
                                    : config.props.legend
                                : false
                        }
                        tooltip={{
                            customContent: config.props.showDifference ? customTooltip : undefined,
                        }}
                        xAxis={
                            config.props.xAxisLabelInterval
                                ? {
                                      ...config.props.xAxis,
                                      label: {
                                          ...config.props.xAxis?.label,
                                          formatter: (text: string, item: any, index: number) => {
                                              // 获取所有X轴数据的总数
                                              const totalItems = data.length;
                                              const interval = config.props.xAxisLabelInterval;

                                              // 第一个和最后一个节点始终显示
                                              if (index === 0 || index === totalItems - 1) {
                                                  return text;
                                              }

                                              // 根据配置的间隔显示标签
                                              if (interval && index % interval === 0) {
                                                  return text;
                                              }

                                              // 其他情况隐藏标签
                                              return '';
                                          },
                                      },
                                  }
                                : config.props.xAxis
                        }
                        slider={config.props.enableSlider ? {} : undefined}
                        scrollbar={config.props.enableScrollbar ? {} : undefined}
                    />
                </Spin>
            </div>
        )
    );
};
export default memo(forwardRef(LineChart));
