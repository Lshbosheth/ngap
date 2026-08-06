import { ComponentType } from './../../types';
import { Form, FormItemProps, Cascader } from 'antd';
import { forwardRef, useEffect, useImperativeHandle, useState, memo, useMemo, useCallback, CSSProperties, ForwardedRef, useRef } from 'react';
import { handleApi } from './../../utils/handleApi';
import { useFormContext } from './../../utils/context';
import { useAppContext } from './../../../utils/AppProvider';
import { debounce, isEmpty } from 'lodash-es';
import { useDeepCompareEffect } from 'ahooks';
import { isNotEmpty } from '@/packages/utils/util';
import { useWatchVariable } from '@/packages/utils/useWatchVariable.ts';

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
    formWrap: any;
    source: Array<{ label: string; value: any }>;
}
interface Option {
    value: string | number;
    label: string;
    children?: Option[];
}
/**
 *
 * @param config 组件配置属性值
 * @param props 系统属性值：componentid、componentname等
 * @returns 返回组件
 */
const MCascader = ({ id, type, config, onChange }: ComponentType<IConfig>, ref: ForwardedRef<RefConfig>) => {
    const { initValues } = useFormContext();
    const [data, setData] = useState<Option[]>([]);
    const [visible, setVisible] = useState(true);
    const [disabled, setDisabled] = useState(false);
    const [mStyle, setMStyle] = useState<CSSProperties>({});
    const _state = useAppContext();
    const { pageStore } = _state;
    const variableData = pageStore((state: any) => state.page.pageData.variableData);

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
        if (value !== undefined && value !== null) initValues(type, name, value);
    }, [config.props.defaultValue]);

    // 启用和禁用
    useEffect(() => {
        setDisabled(!!config.props.formWrap?.disabled);
    }, [config.props.formWrap.disabled]);

    useDeepCompareEffect(() => {
        getDataList();
    }, [config.api]);

    const dealData = useCallback(
        (apiData: Record<string, any[]>): Option[] => {
            if (isEmpty(apiData)) return [];

            const { value, label, children } = config.props.formWrap.fieldNames;

            const len = apiData?.[value]?.length || 0;

            if (!len) return [];

            return Array.from({ length: len }, (_, i) => {
                return {
                    value: apiData?.[value]?.[i],
                    label: apiData?.[label]?.[i],
                    children: apiData?.[children] ? dealChildren(apiData[children][i], children) : undefined,
                };
            });
        },
        [config.props.formWrap.fieldNames],
    );
    const dealChildren = (childrenData: Record<string, any>[], childrenKey: string): Option[] | undefined => {
        if (isEmpty(childrenData)) return undefined;
        const { value, label, children } = config.props.formWrap.fieldNames;
        const prefix = children.replace(/children$/g, '');
        return (
            childrenData?.map((child: Record<string, any>) => {
                const childEntries = Object.entries(child);
                const res: Record<string, any> = {};
                for (const [child_key, child_val] of childEntries) {
                    const hasChildren = child_key?.endsWith('children');
                    if (hasChildren) {
                        res[childrenKey] = dealChildren(child_val, childrenKey);
                    } else if (!prefix) {
                        const newKey = prefix + child_key;
                        res[newKey] = child_val;
                    }
                }
                return {
                    value: res[value],
                    label: res[label],
                    children: res[children],
                };
            }) || []
        );
    };

    const apiData = useRef<Record<string, any>>({});

    useDeepCompareEffect(() => {
        setData(dealData(apiData.current));
    }, [dealData]);

    const getDataList = debounce(
        (params: Record<string, any> = {}) => {
            if (isEmpty(config.api)) return;
            handleApi(config.api, params, _state).then((res) => {
                if (res?.code !== 0) return;
                if (isNotEmpty(res?.data)) {
                    apiData.current = res.data;
                    setData(dealData(res.data));
                } else {
                    console.error('[Cascader]', 'data数据格式错误，请检查');
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
        variablePrefix: 'content.variable.',
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

    const handleChange = useCallback(
        (val: any) => {
            onChange?.({ [config.props.formItem.name]: val });
        },
        [onChange, config.props.formItem.name],
    );

    return (
        visible && (
            <Form.Item {...config.props.formItem} data-id={id} data-type={type}>
                <Cascader
                    popupClassName="cascaderPopup"
                    {...config.props.formWrap}
                    disabled={disabled}
                    variant={config.props.formWrap.variant || undefined}
                    options={data}
                    style={{ ...config.style, ...mStyle }}
                    onChange={handleChange}
                />
            </Form.Item>
        )
    );
};
export default memo(forwardRef(MCascader));
