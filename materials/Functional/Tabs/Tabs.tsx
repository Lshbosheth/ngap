import React, { forwardRef, memo, useEffect, useImperativeHandle, useState, useMemo, useCallback } from 'react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import * as icons from '@ant-design/icons';
import { usePageStore } from '@materials/stores/pageStore';
import { ComponentType } from '@materials/types';
import NgapRender from '@materials/NgapRender/NgapRender';
import { renderAsyncFormula } from '@materials/utils/util';
import { omit } from 'lodash-es';
import styles from './index.module.less';

/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const MTabs = ({ id, type, config, elements, onTabClick, onChange, loopVariable }: ComponentType<TabsProps & {forceRender?: boolean}> & { loopVariable?: any }, ref: any) => {
    const [visible, setVisible] = useState(true);
    const [activeKey, setActiveKey] = useState("")
    const [mStyle,setMStyle] = useState<any>({})

    const { elementsMap } = usePageStore((state) => {
        return {
            elementsMap: state.page.pageData.elementsMap,
        };
    });

    useEffect(()=>{
        if(!activeKey){
            activeKeyInitValue()
        }
    },[])

    // 对外暴露方法
    useImperativeHandle(ref, () => {
        return {
            show() {
                setVisible(true);
            },
            hide() {
                setVisible(false);
            },
            getCurrentTabId(){
                return activeKey
            },
            setCurrentTabId(data: {id:string}){
                if (list.length) {
                    const item = list.find((item: any)=> item.key === data.id)
                    if (item) {
                        setActiveKey(item.key)
                    }else {
                        console.log('无法通过id找到页签')
                    }
                }
            },
            setStyle:(style:any)=>{
                setMStyle(style)
            }
        };
    });

    // 初始化设置第一次的activeKey 状态
    function activeKeyInitValue() {
        if (list.length) {
            const initKey = list[0]?.key
            if (initKey) {
                setActiveKey(initKey)
            }
        }
    }

    // 执行Tab切换事件
    const handleChange = (key: string) => {
        onChange?.({ activeKey: key });
        setActiveKey(key)
    };

    // 执行Tab点击事件
    const handleTabClick = (key: string) => {
        onTabClick?.({ activeKey: key });
    };

    // 格式化 label 名字， 从 type: 'Variable'中
    const formatLabelName = useCallback((label: any) => {
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
        }, [loopVariable]);

    const { items = [], ...props } = config.props;
    const iconsList: { [key: string]: any } = icons;
    const list = items.reduce((prev: any[], item: any, index: number) => {
        // 隐藏item
        if (item.hidden) return prev;
        const itemID = item.id;

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

        const children = [{
            ...childrenElement,
            elements: childrenElement.elements || [],
        }];

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
    },[]);

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
                data-id={id}
                data-tabs-position={props.tabPosition}
                data-type={type}
                style={baseStyle}
                {...other}
                activeKey={activeKey}
                items={list}
                onChange={handleChange}
                onTabClick={handleTabClick}
            />
        )
    );
};
export default memo(forwardRef(MTabs));
