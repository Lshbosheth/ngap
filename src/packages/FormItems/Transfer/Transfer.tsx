import { ComponentType } from './../../types';
import { forwardRef, useEffect, useImperativeHandle, useState, Key, memo, CSSProperties, ForwardedRef } from 'react';
import { Form, Transfer } from 'antd';
import { handleApi } from './../../utils/handleApi';
import { handleFormatter, isNotEmpty } from './../../utils/util';
import React from 'react';
import styles from './index.module.less';
import { useAppContext } from './../../../utils/AppProvider';
import paginationStyles from '../../Advanced/Pagination/index.module.less';
import { useFormContext } from './../../utils/context';
import { debounce, isEmpty } from 'lodash-es';
import { useDeepCompareEffect } from 'ahooks';
import { useWatchVariable } from '@/packages/utils/useWatchVariable.ts';

interface RefConfig {
    show: () => void;
    hide: () => void;
    setStyle: (style: CSSProperties) => void;
}

/**
 *
 * @param props 组件本身属性
 * @returns
 * @param ref
 */
const MTransfer = ({ id, type, config, onChange, onScroll, onSearch, onSelectChange }: ComponentType, ref: ForwardedRef<RefConfig>) => {
    const { form } = useFormContext();
    const [data, setData] = useState<any[]>([]);
    const [targetKeysArr, setTargetKeysArr] = useState<any>(form?.getFieldValue(config.props?.formItem?.name) || []);
    const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);
    const [visible, setVisible] = useState(true);
    const [mStyle, setMStyle] = useState<CSSProperties>({});

    const _state = useAppContext();
    const { mode, pageStore } = _state;
    const variableData = pageStore((state: any) => state.page.pageData.variableData);
    useEffect(() => {
        setTargetKeysArr(form?.getFieldValue(config.props?.formItem?.name));
    }, [form?.getFieldValue(config.props?.formItem?.name)]);
    const setElementAlias = pageStore((state: any) => state.setElementAlias);
    useEffect(() => {
        setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
    }, [config.props.elementAlias]);
    useDeepCompareEffect(() => {
        getDataList();
    }, [config.api]);
    const dealData = (data: Record<string, any> = {}) => {
        if (isEmpty(data)) return [];
        const len: number = data?.['key']?.length || 0;
        if (!len) return [];
        return Array.from({ length: len }, (_, i) => ({
            key: data?.['key']?.[i],
            value: data?.['value']?.[i],
            label: data?.['label']?.[i],
        }));
    };
    const getDataList = debounce(
        (params: Record<string, any> = {}) => {
            if (isEmpty(config.api)) return;
            handleApi(config.api, params).then((res) => {
                if (res?.code !== 0) return;
                if (isNotEmpty(res?.data)) {
                    setData(dealData(res.data));
                } else {
                    setData([]);
                    console.error('[穿梭框]数据格式错误');
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
    // 对外暴露方法
    useImperativeHandle(ref, () => {
        return {
            show() {
                setVisible(true);
            },
            hide() {
                setVisible(false);
            },
            setStyle: (style: CSSProperties) => {
                setMStyle(style);
            },
        };
    });
    const renderText = config.props?.renderText;
    const renderTextFn = renderText ? handleFormatter(renderText) : null;
    const operationStyleObj = Object.fromEntries(
        config.props?.operationStyle
            ?.map((item: Record<string, any>) => {
                if (item.value && item.key) {
                    return [item.key, item.value];
                }
            })
            ?.filter(Boolean) || [],
    );

    // 切换事件
    const handleChange = (targetKeys: any, direction: any, moveKeys: any) => {
        setTargetKeysArr(targetKeys);
        if (mode === 'preview') {
            onChange?.({ targetKeys: targetKeys, direction: direction, moveKeys: moveKeys });
        }
    };
    const handleScroll = (direction: any, event: any) => {
        if (mode === 'preview') {
            onScroll?.({ direction: direction, event: event });
        }
    };
    const handleSearch = (direction: any, value: any) => {
        if (mode === 'preview') {
            onSearch?.({ direction: direction, value: value });
        }
    };
    const handleSelectChange = (sourceSelectedKeys: any, targetSelectedKeys: any) => {
        setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
        if (mode === 'preview') {
            onSelectChange?.({ sourceSelectedKeys: sourceSelectedKeys, targetSelectedKeys: targetSelectedKeys });
        }
    };
    const pagination = config.props?.pagination || false;
    return (
        visible && (
            <Form.Item {...config.props.formItem} style={{ ...config.style, ...mStyle }} data-id={id} data-type={type}>
                <Transfer
                    {...config.props}
                    className={`${styles.Transfer} ${paginationStyles.Pagination}`}
                    dataSource={data}
                    render={renderTextFn}
                    operationStyle={operationStyleObj}
                    targetKeys={targetKeysArr}
                    onChange={handleChange}
                    onScroll={handleScroll}
                    onSearch={handleSearch}
                    onSelectChange={handleSelectChange}
                    selectedKeys={selectedKeys}
                    pagination={pagination ? { pageSize: 10, simple: false, showSizeChanger: false, showLessItems: true } : false}
                />
            </Form.Item>
        )
    );
};
export default memo(forwardRef(MTransfer));
