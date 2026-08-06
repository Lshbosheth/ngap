import { useState, useImperativeHandle, forwardRef, useEffect, useMemo, useCallback, CSSProperties, ForwardedRef } from 'react';
import { Tag } from 'antd';
import { ComponentType } from '@/packages/types';
import { useAppContext } from '@/utils/AppProvider';
import { handleApi } from '@/packages/utils/handleApi';
import { UpOutlined, DownOutlined } from '@ant-design/icons';
import { useDeepCompareEffect } from 'ahooks';
import { debounce, isEmpty } from 'lodash-es';
import { useWatchVariable } from '@/packages/utils/useWatchVariable.ts';

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
const MCheckableTagGroup = ({ id, type, config, onChange }: ComponentType, ref: ForwardedRef<RefConfig>) => {
    const [visible, setVisible] = useState(true);
    const [checked, setChecked] = useState<Array<boolean>>([false, false, false, false]);
    const [data, setData] = useState<any[]>([]);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mStyle, setMStyle] = useState<CSSProperties>({});

    const _state = useAppContext();
    const { mode, pageStore } = _state;
    const variableData = pageStore((state: any) => state.page.pageData.variableData);

    // 设置组件别名
    const setElementAlias = pageStore((state: any) => state.setElementAlias);
    useEffect(() => {
        setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
    }, [config.props.elementAlias]);

    useDeepCompareEffect(() => {
        getDataList();
    }, [config?.api]);

    const getDataList = debounce(
        (params: Record<string, any> = {}) => {
            if (isEmpty(config?.api)) return;
            handleApi(config.api, params, _state).then((res) => {
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
    useWatchVariable({
        apiVariable: config.api,
        variableData,
        variablePrefix: 'context.variable.',
        callback: getDataList,
    });
    useEffect(() => {
        setIsCollapsed(!!config.props.isCollapsed);
    }, [config.props.isCollapsed]);

    // 对外暴露方法
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
        if (mode === 'preview') {
            onChange?.(newChecked);
        }
    };
    const baseStyle: CSSProperties = useMemo(() => {
        return {
            ...config.style,
            position: 'relative',
            ...mStyle,
        };
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
            paddingLeft: '8px',
            background: '#fff',
        };
    }, []);
    return (
        visible && (
            <div style={baseStyle} data-id={id} data-type={type}>
                <div style={innerStyle}>
                    {data.map((item, index) => (
                        <Tag.CheckableTag key={item.key} checked={checked[index]} onChange={(checked) => handleChange(index, checked)}>
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
