import { ComponentType } from './../../types';
import { forwardRef, useEffect, useImperativeHandle, useState, memo, ForwardedRef, CSSProperties } from 'react';
import { Row, Pagination } from 'antd';
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
    const [pageSize, setpageSize] = useState<number>(config.props.defaultPageSize || 10);
    const [pageCurrent, setPageCurrent] = useState<number>(config.props.defaultCurrent || 1);
    const [mStyle, setMStyle] = useState<CSSProperties>({});

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
    useEffect(() => {
        if (config?.props?.pageSize && config?.props?.pageSize > 0) setpageSize(config?.props?.pageSize);
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
        onChange?.({ page, pageSize });
    };
    const handleShowSizeChange = (current: number, size: number) => {
        setpageSize(size);
        setPageCurrent(current);
        onShowSizeChange?.({ current, size });
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
