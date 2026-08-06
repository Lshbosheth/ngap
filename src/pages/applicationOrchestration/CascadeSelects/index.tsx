import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Input, Button, Checkbox } from 'antd';
import { message } from '@/utils/AntdGlobal';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { CloseOutlined, CloseCircleOutlined } from '@ant-design/icons';
import request from '@/utils/request';
import { AppTemptypeData } from '../appOrchestrationTypes';
import styles from './index.module.less';
import { SearchOutlined } from '@ant-design/icons';
import { appTypeListInfo } from '@/stores/appTypeListStore';

interface AppType {
    pId: string | null;
    appTypeId: string;
    appTypeName: string;
    typeLevel: string;
    appTypeCategory: string;
}

interface DialogProps {
    onSure: (values: any) => void;
    onCancel: () => void;
    appCategory: string;
    appTypeId?: string;
    appTypeList?: AppTemptypeData[];
    selectedTagIds?: string; // 已选择的标签ID，用于回显
}

interface LevelsState {
    level3: string;
    level4: string;
    level5: string;
    level6: string;
    [key: string]: string; // 索引签名：允许任意字符串键，值类型为string
}

const CascadeSelectDialog: React.FC<DialogProps> = ({ onSure, onCancel, appCategory, appTypeId, selectedTagIds }) => {
    // 定义状态变量
    const [searchInput, setSearchInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [appTypeObj, setAppTypeObj] = useState<Record<string, AppType[]>>({});
    const [selectNameList, setSelectNameList] = useState<string[]>([]);
    const [selectIdList, setSelectIdList] = useState<string[]>([]);
    const [detailIdList, setDetailIdList] = useState<string[]>([]);
    const [isEcho, setIsEcho] = useState(true);
    const [appTypeList, setAppTypeList] = useState<AppType[]>([]);
    const [appTypeList3_6, setAppTypeList3_6] = useState<AppType[]>([]);
    const [selectedId, setSelectedId] = useState<string>('');
    const [firstLevelId, setFirstLevelId] = useState<string>(''); // 一级节点选中appTypeId
    const [secondLevelId, setSecondLevelId] = useState<string>(''); // 二级节点选中appTypeId
    const [initSimilarLevelId, setInitSimilarLevelId] = useState<LevelsState>({
        level3: '',
        level4: '',
        level5: '',
        level6: '',
    });
    const [keyword, setKeyword] = useState('');
    const [globalKeyword, setGlobalKeyword] = useState(''); // 全局搜索关键词
    const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set()); // 复选框选中的ID集合
    const [selectedItems, setSelectedItems] = useState<Array<{ id: string; name: string }>>([]); // 已选择的项数组
    const [filteredAppTypeList, setFilteredAppTypeList] = useState<AppType[]>([]); // 全局搜索过滤后的列表
    const firstLevelItemRef = useRef<HTMLDivElement>(null);
    const secondLevelItemRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const similarLevelRef = useRef<HTMLDivElement>(null);
    const secondLevelRef = useRef<HTMLDivElement>(null);

    const closeDialog = () => {
        onCancel();
    };

    const saveTempData = () => {
        // 校验是否选择了标签
        // if (selectedItems.length === 0) {
        //     message.error('请选择标签');
        //     return;
        // }
        
        // 将已选择的标签数据传递给父组件
        const tagIds = selectedItems.map(item => item.id).join(',');
        const tagNames = selectedItems.map(item => item.name).join(',');
        
        onSure({
            appTypeId: tagIds,
            appTypeName: tagNames,
        });
    };

    useEffect(() => {
        initLoad();
    }, []);

    // 回显已选择的标签
    useEffect(() => {
        if (selectedTagIds && selectedTagIds.length > 0 && appTypeList.length > 0) {
            const tagIds = selectedTagIds.split(',');
            const newCheckedIds = new Set<string>();
            const newSelectedItems: Array<{ id: string; name: string }> = [];

            tagIds.forEach(tagId => {
                const tag = appTypeList.find(item => item.appTypeId === tagId);
                if (tag) {
                    newCheckedIds.add(tagId);
                    newSelectedItems.push({ id: tagId, name: tag.appTypeName });
                }
            });

            setCheckedIds(newCheckedIds);
            setSelectedItems(newSelectedItems);

            // 根据第一个已选标签自动设置下方标签树的选中状态
            if (newSelectedItems.length > 0) {
                const firstTagId = newSelectedItems[0].id;
                const firstTag = appTypeList.find(item => item.appTypeId === firstTagId);
                
                if (firstTag) {
                    // 获取该标签的完整路径
                    const pathIds: string[] = [];
                    queryAllIdInfo(firstTagId, pathIds);
                    
                    // 根据路径设置各个层级的选中状态
                    if (pathIds.length >= 1) {
                        setFirstLevelId(pathIds[0]);
                        setSelectIdList([pathIds[0]]);
                        const firstTagInfo = appTypeList.find(item => item.appTypeId === pathIds[0]);
                        if (firstTagInfo) {
                            setSelectNameList([firstTagInfo.appTypeName]);
                        }
                    }
                    
                    if (pathIds.length >= 2) {
                        setSecondLevelId(pathIds[1]);
                        setSelectIdList(prev => [...prev.slice(0, 1), pathIds[1]]);
                        const secondTagInfo = appTypeList.find(item => item.appTypeId === pathIds[1]);
                        if (secondTagInfo) {
                            setSelectNameList(prev => [...prev.slice(0, 1), secondTagInfo.appTypeName]);
                        }
                        
                        // 设置其他层级的选中状态
                        const levelsState: LevelsState = {
                            level3: '',
                            level4: '',
                            level5: '',
                            level6: '',
                        };
                        
                        if (pathIds.length >= 3) levelsState.level3 = pathIds[2];
                        if (pathIds.length >= 4) levelsState.level4 = pathIds[3];
                        if (pathIds.length >= 5) levelsState.level5 = pathIds[4];
                        if (pathIds.length >= 6) levelsState.level6 = pathIds[5];
                        
                        setInitSimilarLevelId(levelsState);
                        
                        // 更新selectNameList和selectIdList
                        pathIds.slice(2).forEach((id, index) => {
                            const tagInfo = appTypeList.find(item => item.appTypeId === id);
                            if (tagInfo) {
                                setSelectNameList(prev => {
                                    const newNames = [...prev];
                                    newNames[2 + index] = tagInfo.appTypeName;
                                    return newNames;
                                });
                                setSelectIdList(prev => {
                                    const newIds = [...prev];
                                    newIds[2 + index] = id;
                                    return newIds;
                                });
                            }
                        });
                    }
                }
            }
        }
    }, [selectedTagIds, appTypeList]);

    const { appTypeListAll } = appTypeListInfo((state: any) => {
        return {
            appTypeListAll: state.appTypeList,
        };
    });
    // 初始化接口
    const initLoad = async () => {
        try {
            setLoading(true);
            await request
                .post('/appType/queryAppTypeList', { params: { categoryType: '2' } })
                .then((res) => {
                    if (res.beans && res.beans.length) {
                        const result = res.beans.filter((item: any) => item.appTypeCategory === appCategory);
                        setAppTypeList(result);
                    }
                })
                .catch((err) => {});
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setAppTypeList3_6(
            filterTreeData(
                appTypeList,
                '1', // 根节点层级
                firstLevelId, // 根节点 ID
                '2', // 二级节点层级
                secondLevelId, // 二级节点 ID
                keyword, // 搜索内容
            ),
        );
    }, [appTypeList, firstLevelId, secondLevelId, keyword]);

    useEffect(() => {
        const newAppTypeObj: Record<string, AppType[]> = {};
        // 根据是否有全局搜索关键词，决定使用哪个数据源
        const sourceData = globalKeyword ? filteredAppTypeList : appTypeList;
        sourceData.forEach((item) => {
            const parentId = item.pId || 'root'; // 根节点处理
            if (!newAppTypeObj[parentId]) {
                newAppTypeObj[parentId] = [];
            }
            newAppTypeObj[parentId].push(item);
        });
        setAppTypeObj(newAppTypeObj);
        // 查询配置的数据ID信息
        if (appTypeId) {
            const ids: string[] = [];
            queryAllIdInfo(appTypeId, ids);
            setDetailIdList(ids);
            if (ids.length > 0) {
                ids.forEach((item, index) => {
                    if (index > 0) {
                        setTimeout(() => {
                            const target: HTMLElement | null =
                                containerRef.current && containerRef.current.querySelector(`[data-app-type-id="${ids[index]}"]`);
                            if (target) {
                                target.click();
                            }
                        }, 100);
                    } else {
                        const target: HTMLElement | null =
                            containerRef.current && containerRef.current.querySelector(`[data-app-type-id="${ids[index]}"]`);
                        if (target) {
                            target.click();
                        }
                    }
                });
            }
        } else {
            firstLevelItemRef.current && firstLevelItemRef.current.click();
            setTimeout(() => {
                secondLevelItemRef.current && secondLevelItemRef.current.click();
            }, 200);
        }
    }, [appTypeList, appTypeId, filteredAppTypeList, globalKeyword]);

    // 递归查询所有父级ID
    const queryAllIdInfo = (appTypeId: string, result: string[]): void => {
        // 总是在原始数据中查找，确保能找到正确的父级关系
        const item = appTypeList.find((i) => i.appTypeId === appTypeId);
        if (item) {
            result.unshift(item.appTypeId);
            if (item.pId) {
                queryAllIdInfo(item.pId, result);
            }
        }
    };

    // 过滤一级节点
    const firstLevelNodesData = () => {
        // 如果有全局搜索关键词，使用过滤后的数据，否则使用原始数据
        const sourceData = globalKeyword ? filteredAppTypeList : appTypeList;
        const firstLevelItems = sourceData.filter((item) => item.typeLevel === '1');
        
        // 辅助函数：检查一级节点下是否有二级节点
        const hasChildNodes = (appTypeId: string): boolean => {
            const sourceDataForCheck = globalKeyword ? filteredAppTypeList : appTypeList;
            const childItems = sourceDataForCheck.filter((item) => item.typeLevel === '2' && item.pId == appTypeId);
            return childItems.length > 0;
        };
        
        return firstLevelItems.map((item, index) => (
            <div
                key={item.appTypeId}
                ref={index === 0 ? firstLevelItemRef : null}
                className={`${styles.levelNode} ${firstLevelId === item.appTypeId ? styles.selectNode : ''}`}
                data-app-type-id={item.appTypeId}
                onClick={() => firstLevelNodesClick(item)}
            >
                <Checkbox
                    checked={checkedIds.has(item.appTypeId)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleCheckboxChange(e, item.appTypeId, item.appTypeName)}
                    style={{ marginRight: 8 }}
                />
                <p title={item.appTypeName}>{item.appTypeName}</p>
                {firstLevelId === item.appTypeId && hasChildNodes(item.appTypeId) && <span></span>}
            </div>
        ));
    };

    // 过滤二级节点
    const secondLevelNodesData = (appTypeId: string) => {
        // 如果有全局搜索关键词，使用过滤后的数据，否则使用原始数据
        const sourceData = globalKeyword ? filteredAppTypeList : appTypeList;
        const secondLevelItems = sourceData.filter((item) => item.typeLevel === '2' && item.pId == appTypeId);
        return secondLevelItems.map((item, index) => (
            <div
                key={item.appTypeId}
                ref={index === 0 ? secondLevelItemRef : null}
                className={`${styles.uniqueNode} ${secondLevelId === item.appTypeId ? styles.selectNode : ''}`}
                data-app-type-id={item.appTypeId}
                onClick={() => secondLevelNodesClick(item)}
            >
                <Checkbox
                    checked={checkedIds.has(item.appTypeId)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleCheckboxChange(e, item.appTypeId, item.appTypeName)}
                    style={{ marginRight: 8 }}
                />
                <p title={item.appTypeName}>{item.appTypeName}</p>
            </div>
        ));
    };

    // 过滤相似节点
    const initSimilarLevelNodesData = (appTypeId: string, typeLevel: number) => {
        let realTypeLevel = typeLevel;
        if (appCategory == '2' || appCategory == '1'|| appCategory == '') {
            realTypeLevel = realTypeLevel - 1;
        }
        // 如果有全局搜索关键词，使用过滤后的数据，否则使用原始数据
        const sourceData = globalKeyword ? filteredAppTypeList : appTypeList3_6;
        const initSimilarLevelItems = sourceData.filter((item) => Number(item.typeLevel) === realTypeLevel && item.pId == appTypeId);
        return initSimilarLevelItems.map((item) => (
            <div
                key={item.appTypeId}
                className={`${styles.levelNode} ${
                    ((appCategory == '2' || appCategory == '1'|| appCategory == '') && realTypeLevel === 2
                        ? secondLevelId
                        : initSimilarLevelId[`level${realTypeLevel}`]) === item.appTypeId
                        ? styles.selectNode
                        : ''
                }`}
                data-app-type-id={item.appTypeId}
                onClick={() => initSimilarLevelNodesClick(item)}
            >
                <Checkbox
                    checked={checkedIds.has(item.appTypeId)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleCheckboxChange(e, item.appTypeId, item.appTypeName)}
                    style={{ marginRight: 8 }}
                />
                <p title={item.appTypeName}>{item.appTypeName}</p>
                {appTypeObj[item.appTypeId] && appTypeObj[item.appTypeId].length && realTypeLevel != 3 && <span></span>}
            </div>
        ));
    };

    // 处理一级节点点击事件
    const firstLevelNodesClick = useCallback((item: AppType) => {
        setFirstLevelId(item.appTypeId);
        showSelectInfo(item, Number(item.typeLevel));
        if (appCategory == '2' || appCategory == '1'|| appCategory == '') {
            setSecondLevelId('');
            setInitSimilarLevelId((prev) => ({
                ...prev,
                level3: '',
                level4: '',
                level5: '',
                level6: '',
            }));
        } else {
            setTimeout(() => {
                secondLevelItemRef.current && secondLevelItemRef.current.click();
            }, 200);
        }
    }, []);

    // 处理二级节点点击事件
    const secondLevelNodesClick = useCallback((item: AppType) => {
        setSecondLevelId(item.appTypeId);
        showSelectInfo(item, Number(item.typeLevel));
        setInitSimilarLevelId((prev) => ({
            ...prev,
            level3: '',
            level4: '',
            level5: '',
            level6: '',
        }));
    }, []);

    // 处理相似节点点击事件
    const initSimilarLevelNodesClick = useCallback((item: AppType) => {
        if (item.typeLevel === '2' && (appCategory == '2' || appCategory == '1'|| appCategory == '')) {
            setSecondLevelId(item.appTypeId);
            setInitSimilarLevelId((prev) => ({
                ...prev,
                level3: '',
                level4: '',
                level5: '',
                level6: '',
            }));
        } else if (item.typeLevel === '3') {
            setInitSimilarLevelId((prev) => ({
                ...prev,
                level3: item.appTypeId,
                level4: '',
                level5: '',
                level6: '',
            }));
        } else if (item.typeLevel === '4') {
            setInitSimilarLevelId((prev) => ({
                ...prev,
                level4: item.appTypeId,
                level5: '',
                level6: '',
            }));
        } else if (item.typeLevel === '5') {
            setInitSimilarLevelId((prev) => ({
                ...prev,
                level5: item.appTypeId,
                level6: '',
            }));
        } else {
            setInitSimilarLevelId((prev) => ({
                ...prev,
                [`level${item.typeLevel}`]: item.appTypeId,
            }));
        }
        showSelectInfo(item, Number(item.typeLevel));
    }, []);

    const showSelectInfo = useCallback((data: AppType, num: number) => {
        // 更新selectNameList
        setSelectNameList((prevNames) => {
            const newNames = prevNames.slice(0, num);
            newNames[num - 1] = data.appTypeName;
            return newNames;
        });
        // 更新selectIdList
        setSelectIdList((prevIds) => {
            const newIds = prevIds.slice(0, num);
            newIds[num - 1] = data.appTypeId;
            return newIds;
        });
    }, []);

    // 处理复选框变化
    const handleCheckboxChange = (e: CheckboxChangeEvent, appTypeId: string, appTypeName: string) => {
        const newCheckedIds = new Set(checkedIds);
        if (e.target.checked) {
            // 检查是否超过20个限制
            if (selectedItems.length >= 20) {
                message.warning('最多只能选择20个标签');
                return;
            }
            newCheckedIds.add(appTypeId);
            // 添加到已选择列表
            setSelectedItems(prev => {
                // 检查是否已经存在
                if (!prev.find(item => item.id === appTypeId)) {
                    return [...prev, { id: appTypeId, name: appTypeName }];
                }
                return prev;
            });
        } else {
            newCheckedIds.delete(appTypeId);
            // 从已选择列表中移除
            setSelectedItems(prev => prev.filter(item => item.id !== appTypeId));
        }
        setCheckedIds(newCheckedIds);
    };

    // 处理删除已选择项
    const handleRemoveSelectedItem = (id: string) => {
        // 取消勾选复选框
        const newCheckedIds = new Set(checkedIds);
        newCheckedIds.delete(id);
        setCheckedIds(newCheckedIds);
        // 从已选择列表中移除
        setSelectedItems(prev => prev.filter(item => item.id !== id));
    };

    // 处理清除所有已选择项
    const handleClearAllSelected = () => {
        // 清空所有复选框
        setCheckedIds(new Set());
        // 清空已选择列表
        setSelectedItems([]);
    };

    const handleSearch = (e: any) => {
        setKeyword(e.target.value.trim());
        const text = e.target.value.trim();
        setAppTypeList3_6(
            filterTreeData(
                appTypeList,
                '1', // 根节点层级
                firstLevelId, // 根节点 ID
                '2', // 二级节点层级
                secondLevelId, // 二级节点 ID
                text, // 搜索内容
            ),
        );
    };

    // 处理全局搜索
    const handleGlobalSearch = (e: any) => {
        const searchText = e.target.value.trim();
        setGlobalKeyword(searchText);
        
        if (!searchText) {
            // 如果搜索框为空，显示原始数据
            setFilteredAppTypeList(appTypeList);
        } else {
            // 搜索所有分类下包含关键词的项
            const filteredItems = appTypeList.filter(item =>
                item.appTypeName.includes(searchText)
            );
            
            if (filteredItems.length === 0) {
                setFilteredAppTypeList([]);
                return;
            }
            
            // 收集所有需要显示的节点ID（包括匹配项及其所有祖先节点）
            const resultIds = new Set<string>();
            
            // 为每个匹配项收集其所有祖先节点
            filteredItems.forEach(matchedItem => {
                let currentId: string | null = matchedItem.appTypeId;
                
                // 向上追溯所有祖先节点
                while (currentId) {
                    const currentNode = appTypeList.find(item => item.appTypeId === currentId);
                    if (!currentNode) break;
                    
                    resultIds.add(currentId);
                    currentId = currentNode.pId;
                }
            });
            
            // 过滤出所有包含在结果ID集合中的节点
            const filtered = appTypeList.filter(item => resultIds.has(item.appTypeId));
            setFilteredAppTypeList(filtered);
            
            // 默认选择第一个一级节点和第一个子节点
            setTimeout(() => {
                const firstLevelItems = filtered.filter(item => item.typeLevel === '1');
                if (firstLevelItems.length > 0) {
                    const firstItem = firstLevelItems[0];
                    setFirstLevelId(firstItem.appTypeId);
                    showSelectInfo(firstItem, Number(firstItem.typeLevel));
                    
                    // 清空下级节点选中状态
                    setSecondLevelId('');
                    setInitSimilarLevelId({
                        level3: '',
                        level4: '',
                        level5: '',
                        level6: '',
                    });
                    
                    // 选择第一个子节点
                    const secondLevelItems = filtered.filter(item => item.typeLevel === '2' && item.pId === firstItem.appTypeId);
                    if (secondLevelItems.length > 0) {
                        setTimeout(() => {
                            const secondItem = secondLevelItems[0];
                            setSecondLevelId(secondItem.appTypeId);
                            showSelectInfo(secondItem, Number(secondItem.typeLevel));
                            
                            // 清空更深层级节点选中状态
                            setInitSimilarLevelId({
                                level3: '',
                                level4: '',
                                level5: '',
                                level6: '',
                            });
                        }, 100);
                    }
                }
            }, 100);
        }
    };

    return (
        <div className={styles.CascadeSelectDialog}>
            {loading && (
                <div id="loading" className={styles.loadingOverlay}>
                    <div className={styles.loadingContent}>
                        加载中...
                    </div>
                </div>
            )}
            <div className={styles.CascadeSelectCont}>
                <div className={styles.cascadeSelect}>
                    <div className={styles.selectCont}>
                        <label>已选择：</label>
                        <div className={styles.selectedItemsContainer}>
                            {selectedItems.map((item) => (
                                <div key={item.id} className={styles.selectedItem}>
                                    <span>{item.name}</span>
                                    <CloseOutlined
                                        className={styles.closeIcon}
                                        onClick={() => handleRemoveSelectedItem(item.id)}
                                    />
                                </div>
                            ))}
                        </div>
                        {selectedItems.length > 0 && (
                            <CloseCircleOutlined
                                className={styles.clearAllIcon}
                                onClick={handleClearAllSelected}
                                title="清除所有"
                            />
                        )}
                    </div>
                    {/* 全局搜索框 */}
                    <div className={styles.globalSearchContainer}>
                        <Input
                            placeholder="请输入关键词搜索"
                            suffix={<SearchOutlined />}
                            value={globalKeyword}
                            onChange={handleGlobalSearch}
                            allowClear
                        />
                    </div>
                    <div className={styles.selectArea} ref={containerRef}>
                        <div className={styles.firstLevelNodes}>{firstLevelNodesData()}</div>
                        <div className={styles.otherLevelNodes}>
                            {/* {appCategory === '1' ? (
                                <div className={styles.secondLevelNodes} ref={secondLevelRef}>
                                    {secondLevelNodesData(firstLevelId)}
                                </div>
                            ) : null}
                            {appCategory === '1' ? (
                                <div className={styles.searchNode}>
                                    <Input
                                        placeholder="请输入关键词"
                                        suffix={<SearchOutlined />}
                                        value={keyword}
                                        onChange={handleSearch}
                                        onPressEnter={handleSearch}
                                    />
                                </div>
                            ) : null} */}
                            <div
                                className={styles.remainLevelNodes}
                                style={{
                                    // top:
                                    //     appCategory === '1'
                                    //         ? secondLevelRef.current && secondLevelRef.current.offsetHeight > 45
                                    //             ? '126px'
                                    //             : '90px'
                                    //         : '0',
                                    top: '0',
                                }}
                            >
                                <div
                                    className={styles.similarLevelNodes}
                                    ref={similarLevelRef}
                                    // style={{ width: appCategory === '1' ? '25%' : '50%' }}
                                    style={{ width: '50%' }}
                                >
                                    {/* {initSimilarLevelNodesData(appCategory === '1' ? secondLevelId : firstLevelId, 3)} */}
                                    {initSimilarLevelNodesData(firstLevelId, 3)}
                                </div>
                                <div
                                    className={styles.similarLevelNodes}
                                    // style={{ width: appCategory === '1' ? '25%' : '50%' }}
                                    style={{ width: '50%' }}
                                >
                                    {/* {initSimilarLevelNodesData(appCategory === '1' ? initSimilarLevelId[`level3`] : secondLevelId, 4)} */}
                                    {initSimilarLevelNodesData(secondLevelId, 4)}
                                </div>
                                {/* {appCategory === '1' ? (
                                    <div className={styles.similarLevelNodes}>{initSimilarLevelNodesData(initSimilarLevelId[`level4`], 5)}</div>
                                ) : null}
                                {appCategory === '1' ? (
                                    <div className={styles.similarLevelNodes}>{initSimilarLevelNodesData(initSimilarLevelId[`level5`], 6)}</div>
                                ) : null} */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.busiButton}>
                <Button type="primary" onClick={saveTempData} style={{ marginRight: 8 }}>
                    确定
                </Button>
                <Button onClick={closeDialog}>取消</Button>
            </div>
        </div>
    );
};

export default CascadeSelectDialog;

/**
 * 在指定路径下筛选符合条件的节点及其所有祖先
 * @param data 原始数据数组
 * @param rootLevel 根节点层级（'1'）
 * @param rootId 根节点 ID（'000000001'）
 * @param secondLevel 二级节点层级（'2'）
 * @param secondId 二级节点 ID（'000000002'）
 * @returns 过滤后的节点数组（保持原顺序）
 */
export function filterTreeData(data: AppType[], rootLevel: string, rootId: string, secondLevel: string, secondId: string, text: string): AppType[] {
    if (!text) {
        return data;
    }
    // 1. 建立 ID 到节点的映射
    const nodeMap = new Map<string, AppType>();
    data.forEach((item) => nodeMap.set(item.appTypeId, item));

    // 2. 找到根节点
    const rootNode = data.find((item) => item.appTypeId === rootId && item.typeLevel === rootLevel);
    if (!rootNode) return [];

    // 3. 找到二级节点（必须是根节点的直接子节点）
    let secondNode: AppType | undefined;
    if (rootNode.pId === null) {
        // 根节点无父级，它的子节点中找二级节点
        secondNode = data.find((item) => item.pId === rootId && item.appTypeId === secondId && item.typeLevel === secondLevel);
    } else {
        // 如果根节点不是真正的根（有 pId），我们仍以 id 和 level 为准，但需要确保它在数据中
        secondNode = data.find((item) => item.appTypeId === secondId && item.typeLevel === secondLevel);
        // 可选：检查 secondNode 的父级是否是 rootNode
        if (secondNode && secondNode.pId !== rootId) {
            // 如果二级节点不是根节点的直接子节点，根据需求决定是否处理，这里保守返回空
            return [];
        }
    }
    if (!secondNode) return [];

    // 4. 构建父子关系映射（用于向下遍历）
    const childrenMap = new Map<string, AppType[]>();
    data.forEach((item) => {
        if (item.pId) {
            const list = childrenMap.get(item.pId) || [];
            list.push(item);
            childrenMap.set(item.pId, list);
        }
    });

    // 5. 从二级节点开始深度优先遍历，收集符合条件的节点
    const matchedNodes: AppType[] = [];
    const dfs = (node: AppType) => {
        const level = Number(node.typeLevel);
        if ([3, 4, 5, 6].includes(level) && node.appTypeName.includes(text)) {
            matchedNodes.push(node);
        }
        const children = childrenMap.get(node.appTypeId) || [];
        children.forEach((child) => dfs(child));
    };
    dfs(secondNode);

    // 如果没有符合条件的节点，返回空数组（也可以返回仅包含根和二级节点？根据需求，这里返回空）
    if (matchedNodes.length === 0) return [];

    // 6. 收集所有需要展示的节点 ID（包括符合条件的节点及其所有祖先直到根节点）
    const resultIds = new Set<string>();
    // 先把根节点和二级节点加入（保证路径完整）
    resultIds.add(rootId);
    resultIds.add(secondId);

    for (const node of matchedNodes) {
        let currentId: string | null = node.appTypeId;
        while (currentId) {
            const currentNode = nodeMap.get(currentId);
            if (!currentNode) break;
            resultIds.add(currentId);
            if (currentId === rootId) break; // 到达根节点，停止向上
            currentId = currentNode.pId;
        }
    }

    // 7. 按原数据顺序返回结果
    return data.filter((item) => resultIds.has(item.appTypeId));
}
