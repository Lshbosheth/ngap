import { Form, FormItemProps, RadioProps, Checkbox } from 'antd';
import { forwardRef, useEffect, useImperativeHandle, useState, memo, useMemo, useRef, useCallback, CSSProperties, ForwardedRef } from 'react';
import { ComponentType } from '@materials/types';
import { handleApi } from '@materials/utils/handleApi';
import { isNotEmpty } from '@materials/utils/util';
import { useFormContext } from '@materials/utils/context';
import { usePageStore } from '@materials/stores/pageStore';
import { debounce, isEmpty, isNil } from 'lodash-es';
import { getDictionary } from '@materials/utils/dictionary';
import { useDeepCompareEffect } from 'ahooks';
import { useWatchVariable } from '@materials/utils/useWatchVariable';
import './index.less';

interface RefConfig {
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    update: (params?: Record<string, any>) => void;
    setStyle: (style: CSSProperties) => void;
}

export interface IConfig {
    defaultValue: any;
    formItem: FormItemProps;
    formWrap: RadioProps & {
        checkboxPosition?: 'before' | 'after';
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
const MCheckBox = ({ id, type, config, onChange }: ComponentType<IConfig>, ref: ForwardedRef<RefConfig>) => {
    const [data, setData] = useState<Array<{ label: string; value: any }>>([]);
    const [visible, setVisible] = useState(true);
    const [disabled, setDisabled] = useState(false);
    const mapping = useRef<Record<string, any>>({});
    const [mStyle, setMStyle] = useState<CSSProperties>({});
    const { initValues } = useFormContext();
    const variableData = usePageStore((state) => state?.page?.pageData?.variableData || {});

    /**
     * 初始化默认值
     * 此处需要注意：默认值可能是一个数组，必须比对字符串，否则会出现死循环
     */
    useEffect(() => {
        const name: string = config?.props?.formItem?.name;
        if (config?.props?.defaultValue?.value !== undefined) return;
        let value = config?.props?.defaultValue;
        if (isNil(value)) return;
        if (typeof value === 'string') {
            try {
                if (value.indexOf('[') < value.indexOf(']')) {
                    value = JSON.parse(value);
                } else if (value.indexOf('[') == -1 && value.indexOf(']') == -1) {
                    value = value.split(',');
                }
            } catch (e) {
                console.log(e);
            }
        }
        initValues(type, name, value);
    }, [JSON.stringify(config?.props?.defaultValue)]);

    // 启用和禁用
    useEffect(() => {
        setDisabled(!!config?.props?.formWrap?.disabled);
    }, [config?.props?.formWrap?.disabled]);

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

    const dealData = (data: any): IConfig['field'][] => {
        if (isEmpty(data)) return [];

        const { label, value } = config.props.field || {};
        const len = data?.[label]?.length || 0;
        if (!len) return [];

        return Array.from(
            { length: len },
            (_, i) =>
                ({
                    label: data?.[label]?.[i] || '-',
                    value: data?.[value]?.[i] || 0,
                } as IConfig['field']),
        );
    };
    const apiData = useRef<Record<string, any>>();

    useEffect(() => {
        setData(dealData(apiData.current));
    }, [dealData]);

    const getDataList = debounce(
        (params: Record<string, any> = {}) => {
            if (isEmpty(config.api)) return;
            handleApi(config.api, params).then((res) => {
                if (res?.code !== 0) return;
                if (isNotEmpty(res?.data)) {
                    let resData = res.data;
                    if (config.api.sourceType != 'json') {
                        resData = Object.fromEntries(
                            Object.entries(res?.data || {}).map(([key, value]) => [
                                mapping.current?.[key] || key, // 如果有映射就用新键，否则保留原键
                                value,
                            ]),
                        );
                    }
                    apiData.current = resData;
                    setData(dealData(resData));
                } else {
                    console.error('[checkbox]', 'data数据格式错误，请检查');
                    setData([]);
                }
            });
        },
        300,
        {
            trailing: true,
            leading: true,
        },
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
            enable() {
                setDisabled(false);
            },
            disable() {
                setDisabled(true);
            },
            update: (params?: Record<string, any>) => {
                getDataList(params);
            },
            setStyle: (style: CSSProperties) => {
                setMStyle(style);
            },
        };
    });

    const handleChange = (val: any) => {
        onChange?.({
            [config?.props?.formItem?.name]: val,
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
    }, [config.style, mStyle, config.props.formWrap.fixedColumn]);

    const afterStyle: CSSProperties = useMemo(() => {
        const itemWidth =
            config.props.formWrap.fixedColumn && config.props.formWrap.columnsPerRow
                ? `calc(${100 / Math.min(Math.max(config.props.formWrap.columnsPerRow, 1), 3)}% - 6px)`
                : undefined;
        return config.props.formWrap.fixedColumn
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
        const itemWidth =
            config.props.formWrap.fixedColumn && config.props.formWrap.columnsPerRow
                ? `calc(${100 / Math.min(Math.max(config.props.formWrap.columnsPerRow, 1), 3)}% - 6px)`
                : undefined;
        return config.props.formWrap.fixedColumn
            ? {
                  width: itemWidth,
                  margin: '5px 0 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  columnGap: 0,
              }
            : {};
    }, [config.props.formWrap.fixedColumn, config.props.formWrap.columnsPerRow]);

    return (
        visible && (
            <Form.Item {...config.props.formItem}>
                <Checkbox.Group
                    {...config.props.formWrap}
                    disabled={disabled}
                    style={baseStyle}
                    data-id={id}
                    data-type={type}
                    onChange={handleChange}
                    rootClassName="checkbox-override"
                >
                    {data.map((item, index) => {
                        // 计算每个Checkbox选项的宽度百分比（仅在固定列模式下）
                        const isAfterPosition = config?.props?.formWrap?.checkboxPosition === 'after';

                        if (isAfterPosition) {
                            // 勾选框在文本后
                            return (
                                <Checkbox key={item.value || index} value={item.value} style={afterStyle}>
                                    <span style={{ marginRight: '8px' }}>{item.label}</span>
                                </Checkbox>
                            );
                        } else {
                            // 默认：勾选框在文本前
                            return (
                                <Checkbox key={item.value || index} value={item.value} style={beforeStyle}>
                                    {item.label}
                                </Checkbox>
                            );
                        }
                    })}
                </Checkbox.Group>
            </Form.Item>
        )
    );
};
export default memo(forwardRef(MCheckBox));
