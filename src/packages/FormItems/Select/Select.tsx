import { ComponentType } from './../../types';
import { Form, Select, FormItemProps, SelectProps } from 'antd';
import { forwardRef, useEffect, useImperativeHandle, useState, memo, useRef, useMemo, useCallback, CSSProperties, ForwardedRef } from 'react';
import { handleApi } from './../../utils/handleApi';
import { isNotEmpty } from './../../utils/util';
import { useFormContext } from './../../utils/context';
import { useAppContext } from './../../../utils/AppProvider';
import { CustomSelectIcon } from '../CustomCalendarIcon';
import { isEmpty, isNil, debounce } from 'lodash-es';
import { getDictionary } from '@/packages/utils/dictionary';
import { useDeepCompareEffect } from 'ahooks';
import { useWatchVariable } from '@/packages/utils/useWatchVariable.ts';
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
    elementAlias?: string;
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
    const { initValues } = useFormContext();
    const [data, setData] = useState<Array<{ label: string; value: any }>>([]);
    const [visible, setVisible] = useState(true);
    const [disabled, setDisabled] = useState(false);
    const [focused, setFocused] = useState(false);
    const [hovered, setHovered] = useState(false);
    const mapping = useRef<Record<string, any>>({});
    const [mStyle, setMStyle] = useState<CSSProperties>({});

    const _state = useAppContext();
    const { pageStore } = _state;
    const variableData = pageStore((state: any) => state.page?.pageData?.variableData || {});
    const apiOutData: Record<string, any> = pageStore((state: any) => state.page?.pageData?.apiOutData || {});
    const formData: Record<string, any> = pageStore((state: any) => state.page?.pageData?.formData || {});
    // 设置组件别名
    const setElementAlias = pageStore((state: any) => state.setElementAlias);
    useEffect(() => {
        setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
    }, [config.props.elementAlias]);
    // 初始化默认值
    useEffect(() => {
        const name: string = config.props.formItem?.name;
        if (config.props.defaultValue?.value !== undefined) return;
        const value = config.props.defaultValue;
        if (!isNil(value)) initValues(type, name, value);
    }, [config.props.defaultValue]);
    // 启用和禁用
    useEffect(() => {
        setDisabled(!!config.props.formWrap.disabled);
    }, [config.props.formWrap.disabled]);
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

    const dealData = useCallback(
        (data: Record<string, any> = {}): IConfig['field'][] => {
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
        },
        [config.props.field],
    );
    const apiData = useRef<Record<string, any>>({});

    useEffect(() => {
        setData(dealData(apiData.current));
    }, [dealData]);

    const getDataList = debounce(
        (params: Record<string, any> = {}) => {
            if (isEmpty(config?.api)) return;
            const mappingObj = mapping.current;
            handleApi(config.api, params, _state).then((res) => {
                if (res?.code !== 0) return;
                if (isNotEmpty(res?.data)) {
                    let resData = res.data;
                    if (config.api.sourceType != 'json') {
                        resData = Object.fromEntries(
                            Object.entries(res.data).map(([key, value]) => [
                                mappingObj?.[key] || key, // 如果有映射就用新键，否则保留原键
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
        variablePrefix: 'content.variable.',
        callback: getDataList,
    });
    useWatchVariable({
        apiVariable: config.api,
        variableData: apiOutData,
        variablePrefix: 'context.api.id_',
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
            [config.props.formItem.name]: val,
        });
    };

    return (
        visible && (
            <Form.Item {...config.props.formItem} data-id={id} data-type={type}>
                <Select
                    rootClassName="select-override"
                    {...config.props.formWrap}
                    disabled={disabled}
                    options={data}
                    style={{ ...config.style, ...mStyle }}
                    onChange={handleChange}
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
