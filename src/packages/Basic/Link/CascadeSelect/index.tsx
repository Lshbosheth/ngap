import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Input, Button } from 'antd';
import { message } from '@/utils/AntdGlobal';
import request from '@/utils/request';
import styles from './index.module.less';
import { SearchOutlined } from '@ant-design/icons';
import { appTypeListInfo } from '@/stores/appTypeListStore';
interface AppTemptypeData {
    pId: string;
    typeLevel: string;
    appTypeCategory: string;
    appTypeId: string;
    menuURL: string;
    appTypeName: string;
}
interface AppType {
    pId: string | null;
    appTypeId: string;
    appTypeName: string;
    typeLevel: string;
    menuURL: string;
    appTypeCategory: string;
}

interface DialogProps {
    onSure: (values: any) => void;
    onCancel: () => void;
    appCategory: string;
    appTypeId?: string;
    appTypeList: AppTemptypeData[];
}

interface LevelsState {
    level3: string;
    level4: string;
    level5: string;
    level6: string;
    [key: string]: string; // 索引签名：允许任意字符串键，值类型为string
}

const CascadeSelectDialog: React.FC<DialogProps> = ({ onSure, onCancel, appCategory, appTypeId,appTypeList}) => {
    // 定义状态变量
    const [searchInput, setSearchInput] = useState('');
    const [appTypeObj, setAppTypeObj] = useState<Record<string, AppType[]>>({});
    const [selectNameList, setSelectNameList] = useState<string[]>([]);
    const [selectIdList, setSelectIdList] = useState<string[]>([]);
    const [detailIdList, setDetailIdList] = useState<string[]>([]);
    const [isEcho, setIsEcho] = useState(true);
   // const [appTypeList, setAppTypeList] = useState<AppType[]>(appTypeList);
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
    const firstLevelItemRef = useRef<HTMLDivElement>(null);
    const secondLevelItemRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const similarLevelRef = useRef<HTMLDivElement>(null);
    const secondLevelRef = useRef<HTMLDivElement>(null);

    const closeDialog = () => {
        onCancel();
    };

    const saveTempData = () => {
        if(selectIdList.length == 0){
            message.warning('请选择菜单数据信息');
            return;
        };
        if (selectIdList.length > 0) {
            if(!selectIdList[selectIdList.length-1]){
                message.warning('所选的菜单数据无链接地址！请重新选择');
                return;
            };
        };
        onSure({
            appTypeName: selectNameList.join('-'),
            appTypeId: selectIdList[selectIdList.length - 1],
        });
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
        appTypeList.forEach((item) => {
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
    }, [appTypeList, appTypeId]);

    // 递归查询所有父级ID
    const queryAllIdInfo = (appTypeId: string, result: string[]): void => {
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
        const firstLevelItems = appTypeList.filter((item) => item.typeLevel === '1');
        return firstLevelItems.map((item, index) => (
            <div
                key={item.appTypeId}
                ref={index === 0 ? firstLevelItemRef : null}
                className={`${styles.levelNode} ${firstLevelId === item.appTypeId ? styles.selectNode : ''}`}
                data-app-type-id={item.appTypeId}
                onClick={() => firstLevelNodesClick(item)}
            >
                <p title={item.appTypeName}>{item.appTypeName}</p>
                {firstLevelId === item.appTypeId && <span></span>}
            </div>
        ));
    };

    // 过滤二级节点
    const secondLevelNodesData = (appTypeId: string) => {
        const secondLevelItems = appTypeList.filter((item) => item.typeLevel === '2' && item.pId == appTypeId);
        return secondLevelItems.map((item, index) => (
            <div
                key={item.appTypeId}
                ref={index === 0 ? secondLevelItemRef : null}
                className={`${styles.uniqueNode} ${secondLevelId === item.appTypeId ? styles.selectNode : ''}`}
                data-app-type-id={item.appTypeId}
                onClick={() => secondLevelNodesClick(item)}
            >
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
        const initSimilarLevelItems = appTypeList3_6.filter((item) => Number(item.typeLevel) === realTypeLevel && item.pId == appTypeId);
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
            newIds[num - 1] = data.menuURL;
            return newIds;
        });
    }, []);

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
        // if (similarLevelRef.current) {
        //     const children = similarLevelRef.current.children;
        //     // 遍历所有子元素并处理
        //     Array.from(children).forEach((child) => {
        //         const element = child as HTMLElement;
        //         if (text) {
        //             const hasText = element.textContent && element.textContent.indexOf(text) > -1;
        //             element.style.display = hasText ? 'inline-flex' : 'none';
        //         } else {
        //             element.style.display = 'inline-flex';
        //         }
        //     });
        // }
    };

    return (
        <div className={styles.CascadeSelectDialog}>
            <div className={styles.CascadeSelectCont}>
                <div className={styles.cascadeSelect}>
                    <div className={styles.selectCont}>
                        <label>已选择：</label>
                        <div className={styles.selectNodeName} title={selectNameList.join('-')}>
                            {selectNameList.join('-')}
                        </div>
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
