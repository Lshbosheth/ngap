import React, { forwardRef, useImperativeHandle, useState, useEffect, memo, useMemo, useCallback, CSSProperties, ForwardedRef } from 'react';
import { ComponentType } from '@/packages/types';
import { handleApi } from '@/packages/utils/handleApi';
import { useAppContext } from '@/utils/AppProvider';
import * as icons from '@ant-design/icons';
import { Menu, Spin } from 'antd';
import styles from './index.module.less';
import { useDeepCompareEffect } from 'ahooks';
import { debounce, isEmpty } from 'lodash-es';

interface RefConfig {
    show: () => void;
    hide: () => void;
    getSelectKeys: () => React.Key[];
    setSelectKeys: (selectedKeys: React.Key[]) => void;
    getOpenKeys: () => React.Key[];
    setStyle: (style: CSSProperties) => void;
}

const generateRandomKey = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        key += chars.charAt(randomIndex);
    }
    return key;
};
/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const MMenu = ({ id, type, config, onClick, onDeselect, onOpenChange, onSelect }: ComponentType, ref: ForwardedRef<RefConfig>) => {
    const [visible, setVisible] = useState(true);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [menuKey, setMenuKey] = useState(generateRandomKey());
    const [openKeys, setOpenKeys] = useState<React.Key[]>([]);
    const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
    const [iconProps, setIconProps] = useState<{ [name: string]: any }>({});
    const [mStyle, setMStyle] = useState<CSSProperties>({});
    const _state = useAppContext();
    const { mode, pageStore } = _state;
    const setElementAlias = pageStore((state: any) => state.setElementAlias);
    useEffect(() => {
        setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
    }, [config.props.elementAlias]);

    useEffect(() => {
        const defaultOpenKeys = config.props?.defaultOpenKeys || [];
        if (!Array.isArray(defaultOpenKeys)) {
            console.error('初始展开的子菜单项 主键值 数组');
            setOpenKeys([]);
        } else {
            setOpenKeys(defaultOpenKeys);
        }
        const defaultSelectedKeys = config.props?.defaultSelectedKeys;
        if (!Array.isArray(defaultSelectedKeys)) {
            console.error('初始选中的菜单项 主键值 数组');
            setSelectedKeys([]);
        } else {
            setSelectedKeys(defaultSelectedKeys);
        }
        setMenuKey(generateRandomKey());
    }, [config.props.defaultOpenKeys, config.props.defaultSelectedKeys]);

    useDeepCompareEffect(() => {
        getDataList();
    }, [config.api]);

    const getDataList = debounce(
        (params: Record<string, any> = {}) => {
            if (isEmpty(config.api)) {
                setLoading(false);
                return;
            }
            setLoading(true);
            handleApi(config.api, params, _state)
                .then((res) => {
                    if (res?.code !== 0) return;
                    if (Array.isArray(res?.data)) {
                        setData(processMenuData(res.data));
                    } else {
                        setData([]);
                        console.error('[Menu]数据格式错误');
                    }
                })
                .finally(() => {
                    setLoading(false);
                });
        },
        300,
        {
            trailing: true,
            leading: true,
        },
    );
    const iconsList: { [key: string]: any } = icons;
    const processMenuData = (data: any[]) => {
        return data.map((item) => ({
            ...item,
            icon: item?.icon ? React.createElement(iconsList[item.icon]) : null,
        }));
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
            getSelectKeys() {
                return selectedKeys;
            },
            setSelectKeys(selectedKeys: React.Key[]) {
                setSelectedKeys(selectedKeys);
            },
            getOpenKeys() {
                return openKeys;
            },
            setStyle: (style: CSSProperties) => {
                setMStyle(style);
            },
        };
    });
    useEffect(() => {
        const iconParams: any = {};
        if (config.props?.expandIcon) {
            iconParams[config.props?.expandIcon] = React.createElement(iconsList[config.props?.expandIcon]);
        }
        if (config.props?.overflowedIndicator) {
            iconParams[config.props?.overflowedIndicator] = React.createElement(iconsList[config.props?.overflowedIndicator]);
        }
        setIconProps(iconParams);
    }, [config.props?.expandIcon, config.props?.overflowedIndicator]);

    const onOpenChangeHandle = (openKeys: React.Key[]) => {
        if (mode === 'preview') {
            onOpenChange?.(openKeys);
        }
        setOpenKeys(openKeys);
    };
    const onSelectHandle = (selectObj: any) => {
        const { selectedKeys } = selectObj;
        if (mode === 'preview') {
            onSelect?.(selectObj);
        }
        setSelectedKeys(selectedKeys);
    };
    const onDeselectHanle = (selectObj: any) => {
        const { selectedKeys } = selectObj;
        if (mode === 'preview') {
            onDeselect?.(selectObj);
        }
        setSelectedKeys(selectedKeys);
    };
    const onClick1 = ({ key, keyPath, domEvent }: any) => {
        if (mode === 'preview') {
            onClick?.({ key, keyPath, domEvent });
        }
    };

    return (
        visible && (
            <div className={styles.Menu} style={{ width: config.style.width, height: config.style.height, ...mStyle }}>
                <Spin key={menuKey} data-id={id} data-type={type} spinning={loading} size="large" wrapperClassName="spin-loading">
                    <Menu
                        style={config.style}
                        {...config.props}
                        defaultOpenKeys={openKeys}
                        defaultSelectedKeys={selectedKeys}
                        {...iconProps}
                        selectable={config.props.selectable}
                        items={data}
                        onClick={onClick1}
                        onDeselect={onDeselectHanle}
                        onOpenChange={onOpenChangeHandle}
                        onSelect={onSelectHandle}
                    />
                </Spin>
            </div>
        )
    );
};
export default memo(forwardRef(MMenu));
