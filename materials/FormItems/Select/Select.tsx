import { ComponentType } from '@materials/types';
import { Form, Select, FormItemProps, SelectProps } from 'antd';
import { forwardRef, useEffect, useImperativeHandle, useState, memo, useRef, ForwardedRef, CSSProperties, useCallback } from 'react';
import { handleApi } from '@materials/utils/handleApi';
import { isNotEmpty } from '@materials/utils/util';
import { useFormContext } from '@materials/utils/context';
import { usePageStore } from '@materials/stores/pageStore';
import { CustomSelectIcon } from '../CustomCalendarIcon';
import { useDeepCompareEffect } from 'ahooks';
import { getDictionary } from '@materials/utils/dictionary';
import { isEmpty } from 'lodash-es';

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
    formWrap: SelectProps;
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
const MSelect = ({ id, type, config, onChange }: ComponentType<IConfig>, ref: ForwardedRef<RefConfig>) => {
    const [data, setData] = useState<Array<{ label: string; value: any }>>([]);
    const { initValues } = useFormContext();
    const mapping = useRef<Record<string, any>>({});
    const [visible, setVisible] = useState(true);
    const [mStyle, setMStyle] = useState<CSSProperties>({});
    const [disabled, setDisabled] = useState(false);
    const variableData = usePageStore((state) => state?.page?.pageData?.variableData || {});
    const apiOutData = usePageStore((state) => state?.page?.pageData?.apiOutData || {});
    const formData = usePageStore((state) => state?.page?.pageData?.formData || {});
    const [focused, setFocused] = useState(false);
    const [hovered, setHovered] = useState(false);
    // 初始化默认值
    useEffect(() => {
        const name: string = config?.props?.formItem?.name;
        if (config.props.defaultValue?.value !== undefined) return;
        const value = config.props.defaultValue;
        if (value !== undefined && value !== null) initValues(type, name, value);
    }, [config?.props?.defaultValue]);

    // 启用和禁用
    useEffect(() => {
        setDisabled(!!config?.props?.formWrap?.disabled);
    }, [config?.props?.formWrap?.disabled]);
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

    useDeepCompareEffect(() => {
        if (config.api?.sourceType == 'variable') {
            getDataList();
        }
    }, [variableData]);
    useDeepCompareEffect(() => {
        if (config?.api?.name?.type == 'variable' && config?.api?.name?.value?.includes?.('context.Form_')) {
            getDataList();
        }
    }, [formData]);
    useDeepCompareEffect(() => {
        if (config?.api?.name?.type == 'variable' && config?.api?.name?.value?.includes?.('context.api.id_')) {
            getDataList();
        }
    }, [apiOutData]);
    const dealData = useCallback(
        (data: any): IConfig['field'][] => {
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
    const apiData = useRef<Record<string, any>>();

    useEffect(() => {
        setData(dealData(apiData.current));
    }, [dealData]);
    const getDataList = (params: Record<string, any> = {}) => {
        if (isEmpty(config?.api)) return;
        handleApi(config.api, params).then((res) => {
            if (res?.code !== 0) return;
            if (isNotEmpty(res?.data)) {
                let resData = res.data;
                if (config.api.sourceType != 'json') {
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
                console.error('[select]', 'data数据格式错误，请检查');
                setData([]);
            }
        });
    };
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

    return (
        visible && (
            <Form.Item {...config.props.formItem}>
                <Select
                    data-id={id}
                    data-type={type}
                    {...config.props.formWrap}
                    disabled={disabled}
                    variant={config?.props?.formWrap?.variant || undefined}
                    options={data}
                    style={{ ...config.style, ...mStyle }}
                    onChange={(val) => handleChange(val)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    suffixIcon={<CustomSelectIcon color={focused || hovered ? '#0085d0' : undefined} />}
                    filterOption={(input, option) => {
                        const searchText = input.toLowerCase();
                        const label = (option?.label as string)?.toLowerCase() || '';
                        const value = String(option?.value || '').toLowerCase();
                        return label.includes(searchText) || value.includes(searchText);
                    }}
                />
            </Form.Item>
        )
    );
};
export default memo(forwardRef(MSelect));
