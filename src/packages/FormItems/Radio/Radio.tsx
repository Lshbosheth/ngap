import { ComponentType } from './../../types';
import { Form, Radio, FormItemProps, RadioProps } from 'antd';
import { forwardRef, useEffect, useImperativeHandle, useState, memo, useMemo, useCallback, CSSProperties, useRef, ForwardedRef } from 'react';
import { handleApi } from './../../utils/handleApi';
import { useFormContext } from './../../utils/context';
import { useAppContext } from './../../../utils/AppProvider';
import { getDictionary } from './../../utils/dictionary';
import './index.less';
import { debounce, isEmpty, isNil } from 'lodash-es';
import { useDeepCompareEffect } from 'ahooks';
import { isNotEmpty, renderAsyncFormula } from '@/packages/utils/util';
import { useWatchVariable } from '@/packages/utils/useWatchVariable';

interface RefConfig {
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    update: (params?: Record<string, any>) => void;
    setStyle: (style: CSSProperties) => void;
}

export interface IConfig {
    elementAlias?: string;
    defaultValue: any;
    formItem: FormItemProps;
    formWrap: RadioProps & {
        radioPosition?: 'before' | 'after';
        fixedColumn?: boolean;
        columnsPerRow?: number;
    };
    field: {
        label: string;
        value: string;
    };
    source: Array<{ label: string; value: any }>;
}
/**
 *
 * @param config 组件配置属性值
 * @param props 系统属性值：componentid、componentname等
 * @returns 返回组件
 */
const MRadio = ({ id, type, config, onLoad, onChange }: ComponentType<IConfig>, ref: ForwardedRef<RefConfig>) => {
    const [data, setData] = useState<Array<{ label: string; value: any }>>([]);
    const [visible, setVisible] = useState(true);
    const [disabled, setDisabled] = useState(false);
    const mapping = useRef<Record<string, any>>({});
    const [mStyle, setMStyle] = useState<CSSProperties>({});
    const form = Form.useFormInstance();
    const [disItem, setDisItem] = useState<any[]>([]);
    const { initValues } = useFormContext();
    const _state = useAppContext();
    const { pageStore } = _state;
    const variableData = pageStore((state: any) => state.page?.pageData?.variableData || {});
    // 初始化默认值
    useEffect(() => {
        const name: string = config.props.formItem?.name;
        if (config.props.defaultValue?.value !== undefined) return;
        const value = config.props.defaultValue;
        if (!isNil(value)) initValues(type, name, value);
    }, [config.props.defaultValue]);
    useEffect(() => {
        visible && onLoad?.();
    }, [data]);
    // 设置组件别名
    const setElementAlias = pageStore((state: any) => state.setElementAlias);
    useEffect(() => {
        setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
    }, [config.props.elementAlias]);
    // 启用和禁用
    useEffect(() => {
        setDisabled(!!config.props.formWrap.disabled);
    }, [config.props.formWrap.disabled]);
    useDeepCompareEffect(() => {
        if (config.api.sourceType == 'api' && config?.api?.id) {
            getDictionary(config?.api?.id, (mappingObj: Record<string, any>) => {
                mapping.current = mappingObj;
                getDataList();
            });
        } else {
            getDataList();
        }
    }, [config.api]);

    const dealData = useCallback(
        (data: Record<string, any> = {}): IConfig['field'][] => {
            if (isEmpty(data)) return [];

            const { label, value } = config.props.field || {};
            const len: number = data?.[label]?.length || 0;
            if (!len) return [];

            return Array.from(
                { length: len },
                (_, i) =>
                    ({
                        label: data?.[label]?.[i] || '-',
                        value: data?.[value]?.[i] || 0,
                    } as IConfig['field']),
            );
        },
        [config.props.field],
    );
    const apiData = useRef<Record<string, any>>({});

    useEffect(() => {
        setData(dealData(apiData.current));
    }, [config.props.field]);

    const getDataList = debounce(
        (params: Record<string, any> = {}) => {
            if (isEmpty(config.api)) return;
            handleApi(config.api, params, _state).then((res) => {
                if (res?.code !== 0) return;
                if (isNotEmpty(res?.data)) {
                    let resData = res.data;
                    if (config.api.sourceType != 'json') {
                        resData = Object.fromEntries(
                            Object.entries(resData).map(([key, value]) => [
                                mapping.current?.[key] || key, // 如果有映射就用新键，否则保留原键
                                value,
                            ]),
                        );
                    }
                    apiData.current = resData;
                    setData(dealData(resData));
                } else {
                    console.error('[radio]', 'data数据格式错误，请检查');
                    setData([]);
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

    // 格式化 label 名字， 从 type: 'Variable'中
    const formatLabelName = useCallback(
        (label: any) => {
            if (typeof label === 'string') return label;
            if (typeof label === 'object' && label !== null) {
                if (label.type === 'static') {
                    return label.value;
                }
                if (label.type === 'variable') {
                    return renderAsyncFormula(label.value, {}, _state);
                }
            }
            return '';
        },
        [_state],
    );

    useImperativeHandle(ref, () => {
        return {
            show() {
                setVisible(true);
            },
            hide() {
                setVisible(false);
            },
            enable() {
                setDisabled(false);
            },
            disable() {
                setDisabled(true);
            },
            update: (params?: Record<string, any>) => {
                getDataList(params);
            },
            selectItem: (params: any) => {
                form.setFieldsValue({ [config.props.formItem?.name]: formatLabelName(params?.target) });
            },
            disableItem: (params: any) => {
                setDisItem((prev:any)=>{
                    const arr = [...prev]
                    arr.push(formatLabelName(params?.target))
                    return [...new Set(arr)]
                });
            },
            enableItem:(params:any)=>{
                setDisItem((prev:any)=>{
                    let arr = [...prev]
                    arr = arr?.filter((value:any)=>value !== formatLabelName(params?.target))
                    return [...new Set(arr)]
                });
            },
            setStyle: (style: CSSProperties) => {
                setMStyle(style);
            },
        };
    });

    const handleChange = (val: any) => {
        onChange?.({
            [config.props.formItem.name]: val,
        });
    };

    const baseStyle: CSSProperties = useMemo(() => {
        return config.props.formWrap.fixedColumn
            ? {
                  ...config.style,
                  display: 'flex',
                  flexWrap: 'wrap',
                  width: '100%',
                  ...mStyle,
              }
            : { ...config.style, ...mStyle };
    }, [config.style, config.props.formWrap.fixedColumn, mStyle]);

    const afterStyle: CSSProperties = useMemo(() => {
        const { fixedColumn, columnsPerRow } = config.props.formWrap;
        const itemWidth = fixedColumn && columnsPerRow ? `calc(${100 / Math.min(Math.max(columnsPerRow, 1), 6)}% - 6px)` : undefined;
        return fixedColumn
            ? {
                  width: itemWidth,
                  margin: '5px 0 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  flexDirection: 'row-reverse' as const,
                  justifyContent: 'flex-end',
                  columnGap: 0,
                  marginLeft: 0,
              }
            : {
                  display: 'flex',
                  alignItems: 'center',
                  flexDirection: 'row-reverse' as const,
                  justifyContent: 'flex-end',
                  marginLeft: 0,
                  marginRight: '8px',
              };
    }, [config.props.formWrap.fixedColumn, config.props.formWrap.columnsPerRow]);

    const beforeStyle: CSSProperties = useMemo(() => {
        const { fixedColumn, columnsPerRow } = config.props.formWrap;
        const itemWidth = fixedColumn && columnsPerRow ? `calc(${100 / Math.min(Math.max(columnsPerRow, 1), 6)}% - 6px)` : undefined;
        return fixedColumn
            ? {
                  width: itemWidth,
                  margin: '5px 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  columnGap: 0,
              }
            : {};
    }, [config.props.formWrap.fixedColumn, config.props.formWrap.columnsPerRow]);

    const getItemDisabled = (value: any) => {
        return disItem?.some((v: any) => v == value);
    };
    return (
        visible && (
            <Form.Item {...config.props.formItem} data-id={id} data-type={type}>
                <Radio.Group {...config.props.formWrap} disabled={disabled} style={baseStyle} onChange={handleChange} rootClassName="radio-override">
                    {data.map((item, index) => {
                        // 计算每个Radio选项的宽度百分比（仅在固定列模式下）
                        const isAfterPosition = config?.props?.formWrap?.radioPosition === 'after';
                        if (isAfterPosition) {
                            // 单选框在文本后
                            return (
                                <Radio key={item.value || index} value={item.value} disabled={disabled || getItemDisabled(item.value)} style={afterStyle}>
                                    <span style={{ marginRight: '8px', opacity: disabled || getItemDisabled(item.value) ? 0.5 : 1 }}>{item.label}</span>
                                </Radio>
                            );
                        } else {
                            // 默认：单选框在文本前
                            return (
                                <Radio key={item.value || index} value={item.value} disabled={disabled || getItemDisabled(item.value)} style={beforeStyle}>
                                    <span style={{ opacity: disabled || getItemDisabled(item.value) ? 0.5 : 1 }}>{item.label}</span>
                                </Radio>
                            );
                        }
                    })}
                </Radio.Group>
            </Form.Item>
        )
    );
};
export default memo(forwardRef(MRadio));
