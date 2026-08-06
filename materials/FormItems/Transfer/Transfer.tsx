import { ComponentType } from './../../types';
import { forwardRef, useEffect, useImperativeHandle, useState, memo, ForwardedRef, CSSProperties, Key } from 'react';
import { Form, Transfer } from 'antd';
import { handleApi } from './../../utils/handleApi';
import { usePageStore } from '@materials/stores/pageStore';
import paginationStyles from '../../Advanced/Pagination/index.module.less';
import { useFormContext } from '@materials/utils/context';
import { useDeepCompareEffect } from 'ahooks';
import { debounce, isEmpty } from 'lodash-es';
import { isNotEmpty } from '@materials/utils/util';
import { useWatchVariable } from '@materials/utils/useWatchVariable';
import styles from './index.module.less';

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
    const variableData = usePageStore((state) => state?.page?.pageData?.variableData || {});
    useEffect(() => {
        setTargetKeysArr(form?.getFieldValue(config.props?.formItem?.name));
    }, [form?.getFieldValue(config.props?.formItem?.name)]);
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
                    console.error('[transfer]数据格式错误');
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
    const handleFormatter = (formatter: any) => {
        if (!formatter) return undefined;
        return (val: any) => {
            try {
                return new Function('value', `return (${formatter})(value);`)(val);
            } catch (error) {
                console.error('formatter 函数解析失败：', error);
                return val;
            }
        };
    };
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
        onChange?.({ targetKeys: targetKeys, direction: direction, moveKeys: moveKeys });
    };
    const handleScroll = (direction: any, event: any) => {
        onScroll?.({ direction: direction, event: event });
    };
    const handleSearch = (direction: any, value: any) => {
        onSearch?.({ direction: direction, value: value });
    };
    const handleSelectChange = (sourceSelectedKeys: any, targetSelectedKeys: any) => {
        setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
        onSelectChange?.({ sourceSelectedKeys: sourceSelectedKeys, targetSelectedKeys: targetSelectedKeys });
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
