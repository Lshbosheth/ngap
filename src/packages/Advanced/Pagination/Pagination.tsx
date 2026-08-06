import { ComponentType } from './../../types';
import { forwardRef, useEffect, useImperativeHandle, useState, memo, CSSProperties, ForwardedRef } from 'react';
import { handleFormatter } from './../../utils/util';
import { Row, Pagination } from 'antd';
import { useAppContext } from '@/utils/AppProvider';
import styles from './index.module.less';

interface RefConfig {
    show: () => void;
    hide: () => void;
    setStyle: (style: CSSProperties) => void;
}

/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const MPagination = ({ id, type, config, onChange, onShowSizeChange }: ComponentType, ref: ForwardedRef<RefConfig>) => {
    const [visible, setVisible] = useState(true);
    const [pageSize, setPageSize] = useState<number>(config.props.defaultPageSize || 10);
    const [pageCurrent, setPageCurrent] = useState<number>(config.props.defaultCurrent || 1);
    const [mStyle, setMStyle] = useState<CSSProperties>({});

    const _state = useAppContext();
    const { mode, pageStore } = _state;
    const setElementAlias = pageStore((state: any) => state.setElementAlias);
    useEffect(() => {
        setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
    }, [config.props.elementAlias]);

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
    useEffect(() => {
        if (config?.props?.pageSize && config?.props?.pageSize > 0) setPageSize(config?.props?.pageSize);
    }, [config?.props?.pageSize]);
    useEffect(() => {
        if (config?.props?.current && config?.props?.current > 0) setPageCurrent(config?.props?.current);
    }, [config?.props?.current]);

    const pageSizeOptions = config.props?.pageSizeOptions?.map((item: any) => item.label) || [10, 20, 50, 100];
    const showTotal = config.props?.showTotal;
    const showTotalFn = showTotal ? handleFormatter(showTotal) : null;
    // 切换事件
    const handleChange = (page: number, pageSize: number) => {
        setPageCurrent(page);
        if (mode === 'preview') {
            onChange?.({ page, pageSize });
        }
    };
    const handleShowSizeChange = (current: number, size: number) => {
        setPageSize(size);
        setPageCurrent(current);
        if (mode === 'preview') {
            onShowSizeChange?.({ current, size });
        }
    };
    return (
        visible && (
            <Row className={styles.Pagination} style={{ ...config.style, ...mStyle }} {...config.props} data-id={id} data-type={type}>
                <Pagination
                    {...config.props}
                    pageSize={pageSize}
                    current={pageCurrent}
                    showTotal={showTotalFn}
                    pageSizeOptions={pageSizeOptions}
                    onChange={handleChange}
                    onShowSizeChange={handleShowSizeChange}
                />
            </Row>
        )
    );
};
export default memo(forwardRef(MPagination));
