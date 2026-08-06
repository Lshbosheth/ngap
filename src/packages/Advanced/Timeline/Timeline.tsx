import { useState, useEffect, useImperativeHandle, forwardRef, memo, useMemo, CSSProperties, ForwardedRef } from 'react';
import { Timeline, Spin } from 'antd';
import { handleApi } from '@/packages/utils/handleApi';
import { useAppContext } from '@/utils/AppProvider';
import { useDeepCompareEffect } from 'ahooks';
import { debounce, isEmpty } from 'lodash-es';

interface RefConfig {
    show: () => void;
    hide: () => void;
    update: (params: Record<string, any>) => void;
    setStyle: (style: CSSProperties) => void;
}

/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const TimelineCus = (props: any, ref: ForwardedRef<RefConfig>) => {
    const { id, type, config } = props;
    const [propsConf, setPropsConf] = useState({});
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(true);
    const [dataList, setDataList] = useState<any[]>([]);
    const [mStyle, setMStyle] = useState<CSSProperties>({});

    const _state = useAppContext();
    const { pageStore } = _state;

    const setElementAlias = pageStore((state: any) => state.setElementAlias);
    useEffect(() => {
        setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
    }, [config.props.elementAlias]);

    useEffect(() => {
        setPropsConf(config?.props || {});
    }, [config.props]);

    useEffect(() => {
        setDataList(config.props?.dataSource);
    }, [config.props?.dataSource]);

    useDeepCompareEffect(() => {
        getDataList();
    }, [config.api]);

    const getDataList = debounce(
        (params: Record<string, any> = {}) => {
            if (isEmpty(config.api)) {
                setLoading(false);
                return;
            }
            const sourceType = config.api?.sourceType;
            if (sourceType) {
                if (sourceType === 'json') {
                    setDataList(config.props?.dataSource);
                    setLoading(false);
                    return;
                } else {
                    setDataList([]);
                }
            }
            setLoading(true);
            handleApi(config.api, params, _state)
                .then((res) => {
                    if (res?.code !== 0) return;
                    if (!Array.isArray(res?.data)) {
                        console.error('[select]', 'data数据格式错误，请检查');
                        setDataList([]);
                    } else {
                        setDataList(res?.data || []);
                    }
                })
                .finally(() => {
                    setLoading(false);
                });
        },
        300,
        { trailing: true, leading: true },
    );

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
    return (
        visible && (
            <Spin spinning={loading} size="large" wrapperClassName="spin-loading">
                <Timeline {...propsConf} items={dataList} style={{ ...config.style, ...mStyle, paddingTop: 10 }} data-id={id} data-type={type} />
            </Spin>
        )
    );
};
export default memo(forwardRef(TimelineCus));
