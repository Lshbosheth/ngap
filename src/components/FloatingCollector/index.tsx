import React, { useCallback, useEffect, useState } from 'react';
import styles from './index.module.less';
import { Badge, Button, Tooltip } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { getComponentRef } from './../../packages/utils/useComponentRefs';
import { useAppContext } from './../../utils/AppProvider';
import { useShallow } from 'zustand/react/shallow';
type CollectorItem = {
    id: string;
    name: string;
};
const FloatingCollector = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [modalList, setModalList] = useState<CollectorItem[]>([]);
    const [drawerList, setDrawerList] = useState<CollectorItem[]>([]);
    const [popoverList, setPopoverList] = useState<CollectorItem[]>([]);
    const [currentItems, setCurrentItems] = useState<CollectorItem[]>([]);
    const [currentType, setCurrentType] = useState<number>(1);
    const { pageStore } = useAppContext();
    const { elementsMap, removeElements, setSelectedElement } = pageStore(
        useShallow((state: any) => ({
            elementsMap: state.page.pageData.elementsMap,
            removeElements: state.removeElements,
            setSelectedElement: state.setSelectedElement,
        }))
    );

    // 过滤弹框、抽屉和气泡弹窗组件
    useEffect(() => {
        setModalList([]);
        setDrawerList([]);
        setPopoverList([]);
        Object.keys(elementsMap)
            .filter((id) => id.startsWith('Modal') || id.startsWith('Drawer') || id.startsWith('Popover'))
            ?.forEach((id: string) => {
                const element = elementsMap[id];
                // 气泡、弹窗、抽屉在画布中编辑时优先展示别名，无别名时展示组件类型名称
                if (id.startsWith('Modal')) {
                    setModalList((prevList) => [...prevList, { id, name: element.config?.props?.elementAlias || element.name }]);
                } else if (id.startsWith('Drawer')) {
                    setDrawerList((prevList) => [...prevList, { id, name: element.config?.props?.elementAlias || element.name }]);
                } else if (id.startsWith('Popover')) {
                    setPopoverList((prevList) => [...prevList, { id, name: element.config?.props?.elementAlias || element.name }]);
                }
            });
    }, [elementsMap]);

    // 更新当前显示的列表
    useEffect(() => {
        if (currentType === 1) {
            setCurrentItems(modalList);
            setIsExpanded(isExpanded && modalList.length > 0);
        } else if (currentType === 2) {
            setCurrentItems(drawerList);
            setIsExpanded(isExpanded && drawerList.length > 0);
        } else if (currentType === 3) {
            setCurrentItems(popoverList);
            setIsExpanded(isExpanded && popoverList.length > 0);
        }
    }, [currentType, modalList, drawerList, popoverList]);

    // 切换类型
    const handleTypeClick = (type: number) => {
        setCurrentType(type);
        setIsExpanded(!isExpanded);
    };

    // 打开弹框、抽屉或气泡弹窗
    const handleItemClick = useCallback((item: CollectorItem, clickType: string,  e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedItem(item.id);

        // 更新全局选中状态，使右侧设置页面能够更新
        const element = elementsMap[item.id];
        if (element) {
            setSelectedElement({
                id: item.id,
                type: element.type,
            });
        }

        if (clickType === 'double') {
            setIsExpanded(false);
            const ref = getComponentRef(item.id);
            if (ref) {
                // Drawer 使用 show 方法，Modal 使用 open 方法，Popover 使用 open 方法
                if (ref.show) {
                    ref.show();
                } else if (ref.open) {
                    ref.open();
                }
            }
        }
    }, [elementsMap, setSelectedElement]);

    // 删除弹框或抽屉
    const handleDelete = useCallback((targetId: string) => {
        setSelectedItem(null);
        removeElements(targetId);
    }, []);

    return (
        <div className={styles.container}>
            {/* 展开内容区域 */}
            {isExpanded && (
                <div className={`${styles.collectorContent} ${styles.expanded}`}>
                    <div className={styles.itemList}>
                        {currentItems.map((item) => (
                            <Tooltip title="单击选中，双击打开" placement="top" key={item.id}>
                                <Button
                                    onClick={(e) => handleItemClick(item, 'single', e)}
                                    onDoubleClick={(e) => handleItemClick(item, 'double', e)}
                                    className={`${styles.item} ${selectedItem === item.id ? styles.active : ''}`}
                                >
                                    <span className={styles.title}>{item.name}</span>
                                    <span className={styles.action}>
                                        <DeleteOutlined
                                            style={{ marginLeft: '5px' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(item.id);
                                            }}
                                        />
                                    </span>
                                </Button>
                            </Tooltip>
                        ))}
                    </div>
                </div>
            )}

            <div className={`${styles.iconContainer} ${isExpanded ? styles.expanded : ''}`}>
                <Button disabled={popoverList.length === 0} className={styles.iconButton} onClick={() => handleTypeClick(3)}>
                    <Badge count={popoverList.length} size="small" color="#0085d0" showZero>
                        <PopoverIcon />
                    </Badge>
                    <span style={{ marginLeft: '5px' }}>气泡弹窗</span>
                </Button>
                <Button disabled={modalList.length === 0} className={styles.iconButton} onClick={() => handleTypeClick(1)}>
                    <Badge count={modalList.length} size="small" color="#0085d0" showZero>
                        <ModalIcon />
                    </Badge>
                    <span style={{ marginLeft: '5px' }}>弹窗</span>
                </Button>
                <Button disabled={drawerList.length === 0} className={styles.iconButton} onClick={() => handleTypeClick(2)}>
                    <Badge count={drawerList.length} size="small" color="#0085d0" showZero>
                        <DrawerIcon />
                    </Badge>
                    <span style={{ marginLeft: '5px' }}>抽屉</span>
                </Button>
            </div>
        </div>
    );
};

const ModalIcon: React.FC = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
        />
        <path d="M9 4v16M15 4v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 4" />
    </svg>
);

const DrawerIcon: React.FC = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3h18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="2" />
        <path d="M15 3v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const PopoverIcon: React.FC = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export default FloatingCollector;
