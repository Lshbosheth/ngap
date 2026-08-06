import { useState, useImperativeHandle, forwardRef, useMemo, useEffect, useCallback, CSSProperties, ForwardedRef } from 'react';
import { Tag } from 'antd';
import { ComponentType } from '@materials/types';
import { handleApi } from '@materials/utils/handleApi';
import { UpOutlined, DownOutlined } from '@ant-design/icons';
import { useDeepCompareEffect } from 'ahooks';
import { debounce, isEmpty } from 'lodash-es';

interface RefConfig {
    show: () => void;
    hide: () => void;
    getSelectTag: () => () => string[];
    setStyle: (style: CSSProperties) => void;
}

/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const MCheckableTagGroup = ({ id, type, config, onChange }: ComponentType, ref: any) => {
    const [visible, setVisible] = useState(true);
    const [checked, setChecked] = useState<Array<boolean>>([true, false, false, false]);
    const [data, setData] = useState<any[]>([]);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mStyle, setMStyle] = useState<CSSProperties>({});

    useDeepCompareEffect(() => {
        getDataList();
    }, [config?.api]);

    const getDataList = debounce(
        (params: Record<string, any> = {}) => {
            if (isEmpty(config?.api)) return;
            handleApi(config.api, params).then((res) => {
                if (res?.code !== 0) return;
                if (Array.isArray(res.data)) {
                    setData(res.data);
                } else {
                    setData([]);
                    console.error('[标签组]数据格式错误');
                }
            });
        },
        300,
        { trailing: true, leading: true },
    );

    useEffect(() => {
        setIsCollapsed(!!config.props.isCollapsed);
    }, [config.props.isCollapsed]);

    useImperativeHandle(ref, () => {
        return {
            show() {
                setVisible(true);
            },
            hide() {
                setVisible(false);
            },
            getSelectTag() {
                const getCheckedIds = () => data.filter((_, index) => checked[index]).map((item) => item.id.toString() as string);
                return getCheckedIds;
            },
            setStyle: (style: CSSProperties) => {
                setMStyle(style);
            },
        };
    });
    const handleChange = (index: number, value: boolean) => {
        const newChecked = [...checked];
        const checkedCount = newChecked.filter(Boolean).length;

        let maxSelect: number | null = null;
        if (config?.props?.maxSelect != null) {
            const parsed = Number(config.props.maxSelect);
            if (!isNaN(parsed) && parsed > 0) {
                maxSelect = parsed;
            }
        }

        if (value && maxSelect !== null && checkedCount >= maxSelect) {
            return;
        }
        newChecked[index] = value;
        setChecked(newChecked);
        onChange?.(newChecked);
    };

    const baseStyle: CSSProperties = useMemo(() => {
        return { ...config.style, ...mStyle, position: 'relative' };
    }, [config.style, mStyle]);

    const innerStyle: CSSProperties = useMemo(() => {
        return {
            display: 'flex',
            flexWrap: isCollapsed ? ('nowrap' as const) : ('wrap' as const),
            alignItems: 'center',
            gap: `${config.props.tagSpace}px`,
            overflow: isCollapsed ? 'hidden' : 'visible',
            paddingRight: '40px',
            ...(config.style?.width && {
                width: `calc(${config.style.width} - 50px)`,
            }),
        };
    }, [isCollapsed, config.props.tagSpace, config.style?.width]);

    const divStyle: CSSProperties = useMemo(() => {
        return {
            position: 'absolute' as const,
            right: '-50px',
            top: 0,
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            // color: '#1677ff',
            paddingLeft: '8px',
            background: '#fff',
        };
    }, []);
    const getTagHandler = useCallback(
        (index: number) => {
            return (value: boolean) => handleChange(index, value);
        },
        [handleChange],
    );
    return (
        visible && (
            <div style={baseStyle} data-id={id} data-type={type}>
                <div style={innerStyle}>
                    {data.map((item, index) => (
                        <Tag.CheckableTag key={item.key} checked={checked[index]} onChange={getTagHandler(index)}>
                            {item.label}
                        </Tag.CheckableTag>
                    ))}
                </div>
                {config.props.isCollapsed && (
                    <div onClick={() => setIsCollapsed(!isCollapsed)} style={divStyle}>
                        {isCollapsed ? '展开' : '折叠'}
                        {isCollapsed ? <DownOutlined /> : <UpOutlined />}
                    </div>
                )}
            </div>
        )
    );
};
export default forwardRef(MCheckableTagGroup);
