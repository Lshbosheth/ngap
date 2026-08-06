import React, { forwardRef, memo, useImperativeHandle, useState, useEffect, useCallback, useMemo } from 'react';
import { Tabs } from 'antd';
import * as icons from '@ant-design/icons';
import { ComponentType } from './../../types';
import NgapRender from './../../NgapRender/NgapRender';
import { useAppContext } from './../../../utils/AppProvider';
import { useShallow } from 'zustand/react/shallow';
import { renderAsyncFormula, createId } from '../../utils/util';
import { debounce, omit } from 'lodash-es';
import styles from './index.module.less';
import TabConfig from './../Tab/Schema';

/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const MTabs = ({ id, type, config, elements, onTabClick, onChange, loopVariable }: ComponentType & { loopVariable?: any }, ref: any) => {
    const [visible, setVisible] = useState(true);
    const [activeKey, setActiveKey] = useState('');
    const [mStyle, setMStyle] = useState<any>({});
    const { items = [], ...props } = config.props;

    const _state = useAppContext();
    const { pageStore, mode } = _state;
    const { updateToolbar, elementsMap, setElementAlias, editElement, addChildElements } = pageStore(
        useShallow((state: any) => ({
            elementsMap: state.page.pageData.elementsMap,
            updateToolbar: state.updateToolbar,
            setElementAlias: state.setElementAlias,
            editElement: state.editElement,
            addChildElements: state.addChildElements,
        })),
    );

    useEffect(() => {
        if (!activeKey) {
            activeKeyInitValue();
        }
    }, []);
    useEffect(() => {
        // 设置组件别名
        setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
    }, [config.props.elementAlias]);

    // 初始化时，如果没有子页签，自动新增一个
    const initDefaultItem = useCallback(() => {
        const items = config.props.items || [];
        if (mode === 'edit' && items.length === 0) {
            const newId = createId('Tab');
            const newItem = {
                id: newId,
                key: newId,
                label: '页签1',
                hidden: false,
            };
            editElement({
                id,
                type: 'props',
                props: {
                    ...config.props,
                    items: [newItem],
                },
            });
            const { config: itemConfig, events, methods = [] }: any = TabConfig || {};
            addChildElements({
                type: 'Tab',
                name: '子页签',
                parentId: id,
                id: newId,
                config: {
                    ...itemConfig,
                    props: {
                        ...itemConfig.props,
                        key: newId,
                        label: '页签1',
                        hidden: false,
                    },
                },
                events,
                methods,
            });
        }
    }, [mode, config.props, id, editElement, addChildElements]);

    const debouncedInitDefaultItem = useMemo(() => debounce(initDefaultItem, 300), [initDefaultItem]);

    useEffect(() => {
        debouncedInitDefaultItem();
        return () => {
            debouncedInitDefaultItem.cancel();
        };
    }, [config.props.items, mode]);
    // 对外暴露方法
    useImperativeHandle(ref, () => {
        return {
            show() {
                setVisible(true);
            },
            hide() {
                setVisible(false);
            },
            getCurrentTabId() {
                return activeKey;
            },
            setCurrentTabId(data: { id: string }) {
                if (list.length) {
                    const item = list.find((item: any) => item.key === data.id);
                    if (item) {
                        setActiveKey(item.key);
                    } else {
                        console.log('无法通过id找到页签');
                    }
                }
            },
            setStyle: (style: any) => {
                setMStyle(style);
            },
        };
    });

    // 初始化设置第一次的activeKey 状态
    function activeKeyInitValue() {
        if (list.length) {
            const initKey = list[0]?.key;
            if (initKey) {
                setActiveKey(initKey);
            }
        }
    }

    // 执行Tab切换事件
    const handleChange = (key: string) => {
        onChange?.({ activeKey: key });
        setActiveKey(key);
        updateToolbar();
    };

    // 执行Tab点击事件
    const handleTabClick = (key: string) => {
        onTabClick?.({ activeKey: key });
        updateToolbar();
    };

    // 格式化 label 名字， 从 type: 'Variable'中
    const formatLabelName = useCallback(
        (label: any) => {
            if (typeof label === 'string') return label;
            if (typeof label === 'object' && label !== null) {
                if (label.type === 'static') {
                    return label.value;
                }
                if (label.type === 'variable') {
                    return renderAsyncFormula(label.value, {}, _state);
                }
            }
            return '';
        },
        [_state],
    );

    const iconsList: { [key: string]: any } = icons;
    const list = items.reduce((prev: any[], item: any, index: number) => {
        const itemID = item.id;
        // 隐藏item
        if (item.hidden || !itemID) return prev;

        let childrenElement = elements.find((el) => el.id === itemID);
        if (!childrenElement && elements[index]) {
            childrenElement = elements[index];
        }
        if (!childrenElement) {
            prev.push({ label: formatLabelName(item.label), key: item.key });
            return prev;
        }

        const prop = elementsMap[itemID]?.config?.props;
        if (!prop) return prev;

        // 子组件判断隐藏组件
        if (prop.showOrHide && prop.showOrHide.value !== '') {
            const showOrHide = formatLabelName(prop.showOrHide);
            if (!showOrHide) return prev;
        }

        const label = formatLabelName(prop.label) || '';

        const children = [
            {
                ...childrenElement,
                elements: childrenElement.elements || [],
            },
        ];

        const renderLabel = (_label: any) => {
            if (!_label) return '';
            if (typeof _label === 'string' && /<[^>]+>/.test(_label)) {
                return <div dangerouslySetInnerHTML={{ __html: _label }} />;
            }
            return _label;
        };

        prev.push({
            ...prop,
            key: itemID,
            label: renderLabel(label) || '',
            forceRender: !!config?.props?.forceRender,
            icon: prop.icon ? React.createElement(iconsList[prop.icon]) : null,
            children: <NgapRender elements={children} loopVariable={loopVariable} />,
        });

        return prev;
    }, []);

    const baseStyle = useMemo(() => {
        return { ...config.style, ...mStyle };
    }, [config.style, mStyle]);

    const other = useMemo(() => {
        return omit(config.props, ['authInfo', 'elementAlias', 'items', 'forceRender']);
    }, [config.props]);

    return (
        visible && (
            <Tabs
                className={styles.ngapTabs}
                data-tabs-position={props.tabPosition}
                style={baseStyle}
                {...other}
                activeKey={activeKey}
                items={list}
                data-id={id}
                data-type={type}
                onChange={handleChange}
                onTabClick={handleTabClick}
            />
        )
    );
};
export default memo(forwardRef(MTabs));
