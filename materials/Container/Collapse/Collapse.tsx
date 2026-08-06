import React, { forwardRef, memo, useImperativeHandle, useState, useCallback, useMemo } from 'react';
import { Collapse } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { ComponentType } from './../../types';
import NgapRender from './../../NgapRender/NgapRender';
import { usePageStore } from '@materials/stores/pageStore';
import { renderAsyncFormula } from '@materials/utils/util';
import { omit } from 'lodash-es';
import './index.less';
/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const MCollapse = (
    { id, type, config, elements, onCollapseOpenItem, onCollapseCloseItem, loopVariable }: ComponentType & { loopVariable?: any },
    ref: any,
) => {
    const [visible, setVisible] = useState(true);
    const [mStyle, setMStyle] = useState<any>({});
    // 折叠面板展开状态 activeKey
    const [activeKey, setActiveKey] = useState<string[] | undefined>(undefined);

    const { elementsMap } = usePageStore((state: any) => {
        return {
            elementsMap: state.page.pageData.elementsMap,
        };
    });

    const handleChange = useCallback((activeKey: string[]) => {
        setActiveKey((prevState) => {
            const prevData = prevState || [];
            // 需求不明确
            if (prevData.length === activeKey.length) {
                // 手风琴效果， 同时展开和收起
                if (activeKey.length === 0) {
                    onCollapseCloseItem?.();
                } else {
                    onCollapseCloseItem?.();
                    onCollapseOpenItem?.();
                }
            } else if (prevData.length > activeKey.length) {
                // const activeKeyMap = new Set(prevState);
                // if (activeKey.some((value) => activeKeyMap.has(value))) {
                //
                // }
                // 收起
                onCollapseCloseItem?.();
            } else {
                // 展开
                onCollapseOpenItem?.();
            }
            return activeKey;
        });
    }, []);

    // 对外暴露方法
    useImperativeHandle(ref, () => {
        return {
            show() {
                setVisible(true);
            },
            hide() {
                setVisible(false);
            },
            setOpenCollapse(data: { activeKey: string }) {
                setActiveKey((prevState) => {
                    const setKey = data.activeKey.split(',');
                    return [...new Set([...(prevState || []), ...setKey])];
                });
            },
            setCloseCollapse(data: { activeKey: string }) {
                setActiveKey((prevState) => {
                    const prevData = prevState || [];

                    const setKey = data.activeKey.split(',');
                    const setList = [...new Set([...prevData, ...setKey])];
                    return prevData.filter((value) => !setList.includes(value));
                });
            },
            setCollapseOpenAll(...args: any) {
                const allIds = list.map((item: any) => item.key);
                setActiveKey(allIds);
            },
            setCollapseCloseAll(...args: any) {
                setActiveKey([]);
            },
            setStyle: (style: any) => {
                setMStyle(style);
            },
        };
    });
    // 格式化 label 名字， 从 type: 'Variable'中
    function formatLabelName(label: any) {
        if (typeof label === 'string') return label;
        if (typeof label === 'object' && label !== null) {
            if (label.type === 'static') {
                return label.value;
            }
            if (label.type === 'variable') {
                return renderAsyncFormula(label.value, {}, loopVariable);
            }
        }
        return '';
    }

    const { items = [], ...props } = config.props;
    const list = items.reduce((prev: any[], item: any, index: number) => {
        // 隐藏item
        if (item.hidden) return prev;
        // 优先通过 id 查找对应的 Tab 组件
        let childrenElement = elements.find((el) => el.id === item.id);
        // 如果找不到，使用索引查找（兼容默认 Tab1 的情况）
        if (!childrenElement && elements[index]) {
            childrenElement = elements[index];
        }
        if (!childrenElement) {
            prev.push({ label: formatLabelName(item.label), key: item.key });
            return prev;
        }
        const prop = elementsMap[childrenElement.id]?.config.props;
        if (!prop) return prev;

        // 子组件判断隐藏组件
        if (prop.showOrHide && prop.showOrHide.value !== '') {
            const showOrHide = formatLabelName(prop.showOrHide);
            if (!showOrHide) return prev;
        }

        let label = formatLabelName(prop.label) || '';

        let titleElements: any = (childrenElement.elements || []).filter((element: any) => element.id.indexOf('_titleContent') > -1);
        let children = {
            ...childrenElement,
            elements: (childrenElement.elements || []).filter((element: any) => element.id.indexOf('_titleContent') == -1),
        };

        prev.push({
            ...prop,
            key: item.id,
            label: <TitleContent label={label} titleElements={titleElements} loopVariable={loopVariable}></TitleContent>,
            children: <NgapRender elements={[children]} loopVariable={loopVariable} />,
        });

        return prev;
    }, []);

    const other = useMemo(() => {
        let defaultActiveKey: string | string[] = props.defaultActiveKey || [];

        if (typeof defaultActiveKey === 'string' && defaultActiveKey.length && defaultActiveKey.indexOf(',') !== -1) {
            defaultActiveKey = defaultActiveKey.split(',');
        }
        return { ...omit(props, ['authInfo']), defaultActiveKey };
    }, [props]);

    return (
        visible && (
            <>
                <div className="mCollapse">
                    <Collapse
                        defaultActiveKey={['active1']}
                        style={{ ...config.style, ...mStyle }}
                        {...other}
                        activeKey={activeKey}
                        items={list}
                        data-id={id}
                        data-type={type}
                        expandIcon={({ isActive }) => {
                            if (!isActive) {
                                return (
                                    <span>
                                        <span style={{ margin: '0 6px' }}>{formatLabelName(props.openIconText)}</span>
                                        <RightOutlined rotate={0} />
                                    </span>
                                );
                            }
                            return (
                                <span>
                                    <span style={{ margin: '0 6px' }}>{formatLabelName(props.closeIconText)}</span>
                                    <RightOutlined rotate={90} />
                                </span>
                            );
                        }}
                        onChange={handleChange}
                    />
                </div>
            </>
        )
    );
};
export default memo(forwardRef(MCollapse));
const TitleContent = memo(({ label, titleElements, loopVariable }: any) => {
    return (
        <>
            {!!label && <div className="collapseTitle">{label || ''}</div>}
            <div
                className="collapseContent"
                onClick={(e: any) => {
                    e.stopPropagation();
                    return false;
                }}
            >
                <NgapRender elements={titleElements} loopVariable={loopVariable} />
            </div>
        </>
    );
});
