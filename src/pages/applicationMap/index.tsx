import React, { useState, useEffect, useRef } from 'react';
import { Spin, Popover, Modal, Checkbox, Input, Select, Tooltip } from 'antd';
import { message } from '@/utils/AntdGlobal';
import { CloseOutlined, CopyOutlined } from '@ant-design/icons';
import styles from './index.module.less';
import request from '@/utils/request';
import { menu } from '../../stores/menuStore';
import CascadeSelects from '../applicationOrchestration/CascadeSelects';

interface Item {
    pId: string;
    typeLevel: string;
    appTypeId: string;
}

interface AppState {
    appTypeList: any;
    appLevel: string;
    activeFirstId: string;
    appTypeCategory: string;
    expandedThirdIds: Record<string, boolean>;
    To46DataObj: Record<string, any>;
    thirdDataObj: Record<string, any>;
    popoverData: any;
    selectedTags: { tagTypeId: string; tagTypeName: string }; // 选中的应用标签
    tagModalVisible: boolean; // 应用标签弹窗状态
}

// 应用标签显示相关的状态
interface TagDisplayState {
    visibleCount: number | null; // 可见标签数量
    hiddenTags: { name: string; id: string; originalIndex: number }[]; // 隐藏的标签
}
type PopoverVisibleState = Record<string, boolean>;

const ElementManagePage: React.FC = () => {
    const [state, setState] = useState<AppState>({
        appTypeList: [],
        appLevel: '',
        activeFirstId: '',
        appTypeCategory: '',
        expandedThirdIds: {},
        To46DataObj: {},
        thirdDataObj: {},
        popoverData: [],
        selectedTags: { tagTypeId: '', tagTypeName: '' },
        tagModalVisible: false,
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [popoverVisible, setPopoverVisible] = useState<PopoverVisibleState>({}); // 悬浮提示框状态
    const [modalVisible, setModalVisible] = useState<PopoverVisibleState>({}); // 更多弹窗状态
    const [modalPopoverVisible, setModalPopoverVisible] = useState<PopoverVisibleState>({}); // 弹窗中悬浮提示框状态
    const [selectedLevels, setSelectedLevels] = useState([1, 2]); // 默认全选
    const [searchValue, setSearchValue] = useState<string>(''); // 搜索内容

    // 应用标签相关状态
    const tagItemBoxRef = useRef<HTMLDivElement>(null);
    const [tagDisplayState, setTagDisplayState] = useState<TagDisplayState>({
        visibleCount: null,
        hiddenTags: []
    });

    const openPreview = menu((state) => state.openPreview);

    const openModal = (id: string) => {
        setModalVisible((prev) => ({
            ...prev,
            [id]: true,
        }));
    };
    const closeModal = (id: string) => {
        setModalVisible((prev) => ({
            ...prev,
            [id]: false,
        }));
    };

    // useEffect(() => {
    //     initLoad();
    // }, [state.appLevel]);

    useEffect(() => {
        let appLevel = '';
        if (selectedLevels && selectedLevels.length > 0) {
            if (selectedLevels.length === 1) {
                appLevel = selectedLevels[0].toString();
            }
            // 传递当前选中的标签ID，保持标签筛选条件
            initLoad(appLevel, state.selectedTags.tagTypeId);
        } else {
            setState((prev) => ({
                ...prev,
                appTypeList: [],
            }));
        }
    }, [selectedLevels, searchValue, state.selectedTags.tagTypeId]);

    // 初始化接口
    const initLoad = async (appLevel: string, tagTypeId?: string) => {
        try {
            setLoading(true);
            const params: any = {
                appLevel: appLevel, //选择中心时入参appLevel传1，分中心传2，全部不穿这个参数
            };

            // 如果有标签ID，添加到参数中
            if (tagTypeId) {
                params.tagTypeId = tagTypeId;
            }

            request
                .post('/appType/queryAppTypeAtlasList', {
                    params: params,
                })
                .then((res) => {
                    // 查找生产应用下第一个一级分类
                    const firstProductItem = res.beans.find(
                        (item: any) => item.typeLevel === '1' && item.appTypeCategory === '1'
                    );
                    const initialActiveId = firstProductItem ? firstProductItem.appTypeId : '';

                    // 如果有搜索值，需要找到第一个有数据的一级分类
                    let finalActiveId = initialActiveId;
                    // 遍历所有一级分类，找到第一个有数据的分类
                    const firstValidItem = res.beans.find((item: any) => {
                        if (item.typeLevel === '1') {
                            const secondArry = res.beans.filter((sec: any) => sec.pId === item.appTypeId);
                            let hasApps = false;

                            for (const secItem of secondArry) {
                                const thirdArry = res.beans.filter((thir: any) => thir.pId === secItem.appTypeId);

                                if (thirdArry.length === 0) {
                                    // 只有两级时，检查二级下的应用
                                    const To46DataArry = secItem.childAppDetailList || [];
                                    const filteredApps = searchValue
                                        ? To46DataArry.filter((app: any) => app.appName.includes(searchValue))
                                        : To46DataArry;

                                    if (filteredApps.length > 0) {
                                        hasApps = true;
                                        break;
                                    }
                                } else {
                                    // 有三级时，检查所有三级下的应用
                                    for (const thirItem of thirdArry) {
                                        const To46DataArry = thirItem.childAppDetailList || [];
                                        const filteredApps = searchValue
                                            ? To46DataArry.filter((app: any) => app.appName.includes(searchValue))
                                            : To46DataArry;

                                        if (filteredApps.length > 0) {
                                            hasApps = true;
                                            break;
                                        }
                                    }
                                    if (hasApps) break;
                                }
                            }
                            return hasApps;
                        }
                        return false;
                    });

                    if (firstValidItem) {
                        finalActiveId = firstValidItem.appTypeId;
                    }

                    setState((prev) => ({
                        ...prev,
                        appTypeList: res.beans,
                        activeFirstId: finalActiveId,
                        appTypeCategory: finalActiveId ? (res.beans.find((item: any) => item.appTypeId === finalActiveId)?.appTypeCategory || '1') : '1',
                        expandedThirdIds: {},
                    }));
                })
                .catch((err) => {});
        } catch (error) {
            message.error('数据加载失败');
        } finally {
            setLoading(false);
        }
    };

    // 应用标签选择回调
    const appTagsChange = (data: any) => {
        setState((prev) => ({
            ...prev,
            selectedTags: {
                tagTypeId: data.tagTypeId,
                tagTypeName: data.tagTypeName,
            },
        }));
    };

    // 删除单个标签
    const handleRemoveTag = (index: number) => {
        const tagIdsArray = state.selectedTags.tagTypeId?.split(',') || [];
        const tagNamesArray = state.selectedTags.tagTypeName?.split(',') || [];

        tagIdsArray.splice(index, 1);
        tagNamesArray.splice(index, 1);

        const newTagTypeId = tagIdsArray.join(',');
        const newTagTypeName = tagNamesArray.join(',');

        setState((prev) => ({
            ...prev,
            selectedTags: {
                tagTypeId: newTagTypeId,
                tagTypeName: newTagTypeName,
            },
        }));
    };

    // 从隐藏标签中删除指定标签
    const handleRemoveHiddenTag = (originalIndex: number) => {
        handleRemoveTag(originalIndex);
    };

    // 检测标签溢出并计算可见标签数量
    useEffect(() => {
        const calculateVisibleTags = () => {
            if (tagItemBoxRef.current && state.selectedTags.tagTypeName) {
                const tagNames = state.selectedTags.tagTypeName.split(',');
                const tagIds = state.selectedTags.tagTypeId?.split(',') || [];
                const maxWidth = 160;
                const ellipsisWidth = 30; // 省略号大约宽度

                let visibleTags = 0;
                let currentWidth = 0;

                const tagElements = tagItemBoxRef.current.querySelectorAll(`.${styles.tagItem}`);

                tagElements.forEach((element, index) => {
                    const tagWidth = (element as HTMLElement).offsetWidth;
                    const newWidth = currentWidth + tagWidth;

                    // 检查加上这个标签和省略号是否会超出容器
                    if (newWidth + ellipsisWidth <= maxWidth) {
                        visibleTags++;
                        currentWidth = newWidth;
                    } else {
                        return false; // 停止遍历
                    }
                });

                // 如果所有标签都能放下，就不需要省略号
                if (visibleTags >= tagNames.length) {
                    setTagDisplayState({ visibleCount: null, hiddenTags: [] });
                } else {
                    // 收集隐藏的标签
                    const hidden = tagNames.slice(visibleTags).map((name, index) => ({
                        name,
                        id: tagIds[visibleTags + index],
                        originalIndex: visibleTags + index
                    }));
                    setTagDisplayState({ visibleCount: visibleTags, hiddenTags: hidden });
                }
            } else {
                setTagDisplayState({ visibleCount: null, hiddenTags: [] });
            }
        };

        // 延迟执行，确保DOM已经渲染
        setTimeout(calculateVisibleTags, 100);

        // 监听窗口大小变化
        window.addEventListener('resize', calculateVisibleTags);

        return () => {
            window.removeEventListener('resize', calculateVisibleTags);
        };
    }, [state.selectedTags.tagTypeName, state.selectedTags.tagTypeId]);

    // 左侧信息栏
    const leftFunction = (tabType: string) => {
        const productItem: React.ReactElement[] = [];
        const operationItem: React.ReactElement[] = [];
        state.appTypeList.forEach((item: any) => {
            if (item.typeLevel === '1') {
                // 动态导入图片（路径可能需要根据实际项目调整）
                const titleBg = new URL(`./imgs/titleBg.png`, import.meta.url).href;
                const firstActive = state.activeFirstId === item.appTypeId ? 'first_active' : '';
                // 当前一级下没有应用不展示一级
                let firstNumber = 0;
                const secondArry = renderChildren(item.appTypeId);
                secondArry.map((secItem: any) => {
                    const thirdArry = renderChildren(secItem.appTypeId);
                    // 检查是否只有两级分类（没有三级分类）
                    const hasTwoLevelsOnly = thirdArry.length === 0;

                    if (hasTwoLevelsOnly) {
                        // 只有两级时，统计二级下的应用数量
                        let To46DataArry = secItem.childAppDetailList || [];
                        To46DataArry = To46DataArry.filter((item: any) => item.appName.includes(searchValue));
                        firstNumber += To46DataArry.length;
                    } else {
                        // 有三级时，统计所有三级下的应用数量
                        thirdArry.map((thirItem: any) => {
                            let To46DataArry = thirItem.childAppDetailList || [];
                            To46DataArry = To46DataArry.filter((item: any) => item.appName.includes(searchValue));
                            firstNumber += To46DataArry.length;
                        });
                    }
                });
                if (searchValue && firstNumber == 0) {
                    return;
                }

                // 创建JSX元素而不是拼接字符串
                let titleElement = (
                    <div
                        key={item.appTypeId}
                        className={[styles.first_level_title, styles[firstActive]].join(' ')}
                        onClick={() => handleFirstLevelClick(item)}
                        data-id={item.appTypeId}
                    >
                        <img src={titleBg} alt="" />
                        <span className={styles.first_title}>{item.appTypeName}</span>
                    </div>
                );
                if (searchValue) {
                    titleElement = (
                        <div
                            key={item.appTypeId}
                            className={[styles.first_level_title, styles[firstActive]].join(' ')}
                            onClick={() => handleFirstLevelClick(item)}
                            data-id={item.appTypeId}
                        >
                            <img src={titleBg} alt="" />
                            <span className={styles.first_title}>{item.appTypeName}</span>
                            <div className={styles.first_number}>
                                <span>{firstNumber}</span>
                            </div>
                        </div>
                    );
                }

                // 根据类型分类
                if (item.appTypeCategory === '1') {
                    productItem.push(titleElement);
                } else {
                    operationItem.push(titleElement);
                }
            }
        });
        if (tabType == '1') {
            return productItem;
        } else {
            return operationItem;
        }
    };

    // 处理tab点击事件
    const handleTabClick = (tabType: string) => {
        setState((prev) => ({
            ...prev,
            appLevel: tabType,
        }));
    };

    // 渲染子节点
    const renderChildren = (parentId: string) => {
        const children = state.appTypeList.filter((item: any) => item.pId === parentId);
        return children.length ? children : [];
    };

    // 获取四级到六级的平铺数据
    const get4To6FlatData = (parentId: string, dataSource: Item[]): Item[] => {
        const result: Item[] = [];
        // 筛选当前父ID下的4/5/6级直接子级
        for (let i = 0; i < dataSource.length; i++) {
            const item: Item = dataSource[i];
            if (item.pId === parentId && (item.typeLevel === '4' || item.typeLevel === '5' || item.typeLevel === '6')) {
                result.push(item);
                // 递归：继续查找当前4/5/6级的子级（比如4级的子级5级、5级的子级6级）
                const childData: Item[] = get4To6FlatData(item.appTypeId, dataSource);
                // 拼接递归结果（扁平化）
                for (let j = 0; j < childData.length; j++) {
                    result.push(childData[j]);
                }
            }
        }
        return result;
    };

    // 处理一级分类点击事件
    const handleFirstLevelClick = (item: any) => {
        setState((prev) => ({
            ...prev,
            activeFirstId: item.appTypeId,
            appTypeCategory: item.appTypeCategory,
            expandedThirdIds: {}, // 重置所有三级分类的展开状态
        }));
    };

    // 提示框数据接口
    const fetchPopoverData = async (appTypeId: string) => {
        try {
            request
                .post('/app/queryAppInfoList', {
                    params: {
                        appTypeId: appTypeId,
                        appStatus: '2',
                        dataType: '1',
                        appLevel: state.appLevel, //选择中心时入参appLevel传1，分中心传2，全部不穿这个参数
                    },
                })
                .then((res) => {
                    setState((prev) => ({
                        ...prev,
                        popoverData: res.beans,
                    }));
                })
                .catch((err) => {});
        } catch (err) {
        } finally {
        }
    };
    // 用于渲染Popover的内容
    const renderPopoverContent = (appTypeName: string) => {
        return (
            <div className="moreCont" style={{ maxWidth: '500px', maxHeight: '300px', overflowY: 'auto' }}>
                <div className="moreContTitle">{appTypeName}</div>
                {state.popoverData.map((item: any, index: number) => (
                    <span key={index}>{item.appName}</span>
                ))}
            </div>
        );
    };

    // 搜索字体标红
    const HighlightText = (text: string) => {
        if (!text) return null;
        const parts = text.split(new RegExp(`(${searchValue})`, 'g'));
        return (
            <span style={{ maxWidth: 'calc(100% - 22px)', display: 'inline-block', verticalAlign: 'top', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {parts.map((part, index) =>
                    part === searchValue ? (
                        <span key={index} style={{ color: '#F65A56' }}>
                            {part}
                        </span>
                    ) : (
                        part
                    ),
                )}
            </span>
        );
    };

    // 打开预览页面
    const previewPage = (data: any) => {
        if (data.sceneType == 'base') {
            //  装配式预览
            openPreview(data.appName, data.id, 'yy-base');
        } else if (data.sceneType == 'process') {
            //步骤引导式预览
            openPreview(data.appName, data.id, 'Step-base');
        }
    };
    const openMenu: any = menu((state: any) => state.openMenu);
    // 复制应用
    const copyAppName = (item: any, event: React.MouseEvent) => {
        event.stopPropagation(); // 阻止事件冒泡
        // 传递参数到应用列表页面，可以在打开时做逻辑处理
        openMenu({
            key: 'applicationList',
            params: {
                id: item.id, // 传递复制的应用ID
                copyFrom: '3'
            }
        });
    };

    // 渲染右侧内容
    const renderRightContent = () => {
        const { activeFirstId, appTypeCategory, expandedThirdIds } = state;
        if (!activeFirstId) {
            return (
                <div className={styles.searchResultVoid}>
                    <div className={styles.nodataCont}>
                        <div className={styles.nodataImg}></div>
                        <span className={styles.nodataTitle}>暂无数据</span>
                    </div>
                </div>
            );
        }
        const secondArry = renderChildren(activeFirstId);

        // 检查是否所有二级分类都没有三级分类（即整个一级分类下只有两级结构）
        const allHasTwoLevelsOnly = secondArry.every((secItem: any) => renderChildren(secItem.appTypeId).length === 0);

        return (
            <div className={styles.applyMapRight}>
                {secondArry.length > 0 ? (
                    secondArry.map((secItem: any) => {
                        const thirdArry = renderChildren(secItem.appTypeId);
                        const className = styles[`busi${secItem.appTypeId}`];

                        // 判断是否只有两级分类（没有三级分类但有应用数据）
                        const hasTwoLevelsOnly = thirdArry.length === 0;

                        // 当前二级下没有应用不展示二级
                        let secondNumber = 0;
                        if (hasTwoLevelsOnly) {
                            // 只有两级时，统计二级下的应用数量
                            let To46DataArry = secItem.childAppDetailList || [];
                            To46DataArry = To46DataArry.filter((item: any) => item.appName.includes(searchValue));
                            secondNumber = To46DataArry.length;
                        } else {
                            // 有三级时，统计所有三级下的应用数量
                            thirdArry.map((thirItem: any) => {
                                let To46DataArry = thirItem.childAppDetailList || [];
                                To46DataArry = To46DataArry.filter((item: any) => item.appName.includes(searchValue));
                                secondNumber += To46DataArry.length;
                            });
                        }

                        if (searchValue && secondNumber == 0) {
                            return null;
                        }

                        // 如果整体都是只有两级，则直接返回卡片；否则用容器包裹
                        if (allHasTwoLevelsOnly) {
                            // 只有两级分类且整体都是两级结构的处理逻辑
                            const thirClass = styles[`busi${secItem.appTypeId}`];
                            let To46DataArry = secItem.childAppDetailList || [];

                            // 有搜索值时才进行过滤
                            if (searchValue) {
                                To46DataArry = To46DataArry.filter((item: any) => item.appName.includes(searchValue));
                                // 当前二级下没有应用不展示
                                if (To46DataArry.length == 0) {
                                    return null;
                                }
                            }

                            return (
                                <div key={secItem.appTypeId} className={`${styles.Third_level_business} ${thirClass} ${styles.twoLevelLayout}`}>
                                    <div className={styles.Third_level_title}>
                                        <span className={styles.Third_title}>{secItem.appTypeName}</span>
                                        {To46DataArry.length > 0 && <span className={styles.Third_number}>({To46DataArry.length})</span>}
                                        {To46DataArry.length > 9 && (
                                            <div className={styles.Third_more} onClick={() => openModal(secItem.appTypeId)}>
                                                <span>更多</span>
                                                <img src={new URL(`./imgs/arrowRg.png`, import.meta.url).href} alt="" />
                                            </div>
                                        )}
                                        <Modal
                                            title={`${secItem.appTypeName}  (${To46DataArry.length})`}
                                            open={modalVisible[secItem.appTypeId]}
                                            onOk={() => closeModal(secItem.appTypeId)}
                                            onCancel={() => closeModal(secItem.appTypeId)}
                                            wrapClassName={styles.custom_modal}
                                            maskClosable={false}
                                            width={600}
                                            destroyOnClose
                                        >
                                            <div className="modalBox">
                                                {To46DataArry.map((To46Item: any) => (
                                                    <span key={To46Item.id}>
                                                        <span
                                                            className={`four_title`}
                                                            title={To46Item.appName}
                                                            onClick={() => {
                                                                closeModal(secItem.appTypeId);
                                                                previewPage(To46Item);
                                                            }}
                                                        >
                                                            {HighlightText(To46Item.appName)}
                                                            <Tooltip>
                                                                <CopyOutlined
                                                                    className={styles.copyIcon}
                                                                    onClick={(e) => {
                                                                        closeModal(secItem.appTypeId);
                                                                        copyAppName(To46Item, e)
                                                                    }}
                                                                />
                                                            </Tooltip>
                                                        </span>
                                                    </span>
                                                ))}
                                            </div>
                                        </Modal>
                                    </div>
                                    <div className={styles.four_level_title}>
                                        {To46DataArry.length > 0 ? (
                                            To46DataArry.slice(0, 9).map((To46Item: any) => (
                                                <span key={To46Item.appTypeId}>
                                                    <span
                                                        className={`${styles.four_title}`}
                                                        title={To46Item.appName}
                                                        onClick={() => previewPage(To46Item)}
                                                    >
                                                        {HighlightText(To46Item.appName)}
                                                        <Tooltip>
                                                            <CopyOutlined
                                                                className={styles.copyIcon}
                                                                onClick={(e) => copyAppName(To46Item, e)}
                                                            />
                                                        </Tooltip>
                                                    </span>
                                                </span>
                                            ))
                                        ) : (
                                            <div className={styles.searchResultVoid}>
                                                <div className={styles.nodataCont}>
                                                    <div className={styles.nodataImg3}></div>
                                                    <span className={styles.nodataTitle3}>暂无数据</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        }

                        // 原有三级结构的处理逻辑
                        return (
                            <div key={secItem.appTypeId} className={`${styles.second_level_business} ${className}`}>
                                {/* 只有两级分类时不显示二级title */}
                                {!hasTwoLevelsOnly && (
                                    <div className={styles.second_level_title}>
                                        <span className={styles.secLine}></span>
                                        <span className={styles.second_title}>{secItem.appTypeName}</span>
                                    </div>
                                )}

                                {hasTwoLevelsOnly ? (
                                    // 只有两级分类的处理逻辑
                                    (() => {
                                        const thirClass = styles[`busi${secItem.appTypeId}`];
                                        let To46DataArry = secItem.childAppDetailList || [];

                                        // 有搜索值时才进行过滤
                                        if (searchValue) {
                                            To46DataArry = To46DataArry.filter((item: any) => item.appName.includes(searchValue));
                                            // 当前二级下没有应用不展示
                                            if (To46DataArry.length == 0) {
                                                return null;
                                            }
                                        }

                                        return (
                                            <div key={secItem.appTypeId} className={`${styles.Third_level_business} ${thirClass} ${styles.twoLevelLayout}`}>
                                                <div className={styles.Third_level_title}>
                                                    <span className={styles.Third_title}>{secItem.appTypeName}</span>
                                                    {To46DataArry.length > 0 && <span className={styles.Third_number}>({To46DataArry.length})</span>}
                                                    {To46DataArry.length > 9 && (
                                                        <div className={styles.Third_more} onClick={() => openModal(secItem.appTypeId)}>
                                                            <span>更多</span>
                                                            <img src={new URL(`./imgs/arrowRg.png`, import.meta.url).href} alt="" />
                                                        </div>
                                                    )}
                                                    <Modal
                                                        title={`${secItem.appTypeName}  (${To46DataArry.length})`}
                                                        open={modalVisible[secItem.appTypeId]}
                                                        onOk={() => closeModal(secItem.appTypeId)}
                                                        onCancel={() => closeModal(secItem.appTypeId)}
                                                        wrapClassName={styles.custom_modal}
                                                        maskClosable={false}
                                                        width={600}
                                                        destroyOnClose
                                                    >
                                                        <div className="modalBox">
                                                            {To46DataArry.map((To46Item: any) => (
                                                                <span key={To46Item.id}>
                                                                    <span
                                                                        className={`four_title`}
                                                                        title={To46Item.appName}
                                                                        onClick={() => {
                                                                            closeModal(secItem.appTypeId);
                                                                            previewPage(To46Item);
                                                                        }}
                                                                    >
                                                                        {HighlightText(To46Item.appName)}
                                                                        <Tooltip>
                                                                            <CopyOutlined
                                                                                className={styles.copyIcon}
                                                                                onClick={(e) => {
                                                                                    closeModal(secItem.appTypeId);
                                                                                    copyAppName(To46Item, e)
                                                                                }}
                                                                            />
                                                                        </Tooltip>
                                                                    </span>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </Modal>
                                                </div>
                                                <div className={styles.four_level_title}>
                                                    {To46DataArry.length > 0 ? (
                                                        To46DataArry.slice(0, 9).map((To46Item: any) => (
                                                            <span key={To46Item.appTypeId}>
                                                                <span
                                                                    className={`${styles.four_title}`}
                                                                    title={To46Item.appName}
                                                                    onClick={() => previewPage(To46Item)}
                                                                >
                                                                    {HighlightText(To46Item.appName)}
                                                                    <Tooltip>
                                                                        <CopyOutlined
                                                                            className={styles.copyIcon}
                                                                            onClick={(e) => copyAppName(To46Item, e)}
                                                                        />
                                                                    </Tooltip>
                                                                </span>
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <div className={styles.searchResultVoid}>
                                                            <div className={styles.nodataCont}>
                                                                <div className={styles.nodataImg3}></div>
                                                                <span className={styles.nodataTitle3}>暂无数据</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })()
                                ) : (
                                    // 原有三级分类的处理逻辑
                                    thirdArry.length > 0 ? (
                                        thirdArry.map((thirItem: any) => {
                                            const thirClass = styles[`busi${thirItem.appTypeId}`];
                                            const isExpanded = expandedThirdIds[thirItem.appTypeId];

                                            // 获取数据并根据展开状态截取
                                            let To46DataArry = thirItem.childAppDetailList || [];
                                            To46DataArry = To46DataArry.filter((item: any) => item.appName.includes(searchValue));
                                            let displayData = To46DataArry;

                                            if (!isExpanded && To46DataArry.length > 9) {
                                                displayData = To46DataArry.slice(0, 9);
                                            }
                                            // 当前三级下没有应用不展示三级
                                            if (searchValue && To46DataArry.length == 0) {
                                                return null;
                                            }
                                            return (
                                                <div key={thirItem.appTypeId} className={`${styles.Third_level_business} ${thirClass}`}>
                                                    <div className={styles.Third_level_title}>
                                                        <span className={styles.Third_title}>{thirItem.appTypeName}</span>
                                                        {To46DataArry.length > 0 && <span className={styles.Third_number}>({To46DataArry.length})</span>}
                                                        {!isExpanded && To46DataArry.length > 9 && (
                                                            <div className={styles.Third_more} onClick={() => openModal(thirItem.appTypeId)}>
                                                                <span>更多</span>
                                                                <img src={new URL(`./imgs/arrowRg.png`, import.meta.url).href} alt="" />
                                                            </div>
                                                        )}
                                                        <Modal
                                                            title={`${thirItem.appTypeName}  (${To46DataArry.length})`}
                                                            open={modalVisible[thirItem.appTypeId]}
                                                            onOk={() => closeModal(thirItem.appTypeId)}
                                                            onCancel={() => closeModal(thirItem.appTypeId)}
                                                            wrapClassName={styles.custom_modal}
                                                            maskClosable={false}
                                                            width={600}
                                                            destroyOnClose
                                                        >
                                                            <div className="modalBox">
                                                                {To46DataArry.map((To46Item: any) => (
                                                                    <span key={To46Item.id}>
                                                                        <span
                                                                            className={`four_title`}
                                                                            title={To46Item.appName}
                                                                            onClick={() => {
                                                                                closeModal(thirItem.appTypeId);
                                                                                previewPage(To46Item);
                                                                            }}
                                                                        >
                                                                            {HighlightText(To46Item.appName)}
                                                                            <Tooltip>
                                                                                <CopyOutlined
                                                                                    className={styles.copyIcon}
                                                                                    onClick={(e) => {
                                                                                        closeModal(thirItem.appTypeId);
                                                                                        copyAppName(To46Item, e)
                                                                                    }}
                                                                                />
                                                                            </Tooltip>
                                                                        </span>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </Modal>
                                                    </div>
                                                    <div className={styles.four_level_title}>
                                                        {displayData.length > 0 ? (
                                                            displayData.map((To46Item: any) => (
                                                                <span key={To46Item.appTypeId}>
                                                                    <span
                                                                        className={`${styles.four_title}`}
                                                                        title={To46Item.appName}
                                                                        onClick={() => previewPage(To46Item)}
                                                                    >
                                                                        {HighlightText(To46Item.appName)}
                                                                        <Tooltip>
                                                                            <CopyOutlined
                                                                                className={styles.copyIcon}
                                                                                onClick={(e) => copyAppName(To46Item, e)}
                                                                            />
                                                                        </Tooltip>
                                                                    </span>
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <div className={styles.searchResultVoid}>
                                                                <div className={styles.nodataCont}>
                                                                    <div className={styles.nodataImg3}></div>
                                                                    <span className={styles.nodataTitle3}>暂无数据</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className={styles.searchResultVoid}>
                                            <div className={styles.nodataCont}>
                                                <div className={styles.nodataImg}></div>
                                                <span className={styles.nodataTitle}>暂无数据</span>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className={styles.searchResultVoid}>
                        <div className={styles.nodataCont}>
                            <div className={styles.nodataImg}></div>
                            <span className={styles.nodataTitle}>暂无数据</span>
                        </div>
                    </div>
                )}
            </div>
        );
        // if (appTypeCategory === '1') {
        //     return (
        //         <div className={styles.applyMapRight}>
        //             {secondArry.map((secItem: any) => {
        //                 const thirdArry = renderChildren(secItem.appTypeId);
        //                 const className = styles[`busi${secItem.appTypeId}`];

        //                 return (
        //                     <div key={secItem.appTypeId} className={`${styles.second_level_business} ${className}`}>
        //                         <div className={styles.second_level_title}>
        //                             <span className={styles.secLine}></span>
        //                             <span className={styles.second_title}>{secItem.appTypeName}</span>
        //                         </div>
        //                         {thirdArry.map((thirItem: any) => {
        //                             const thirClass = styles[`busi${thirItem.appTypeId}`];
        //                             const isExpanded = expandedThirdIds[thirItem.appTypeId];

        //                             // 获取数据并根据展开状态截取
        //                             let To46DataArry = get4To6FlatData(thirItem.appTypeId, state.appTypeList);
        //                             let displayData = To46DataArry;

        //                             if (!isExpanded && To46DataArry.length > 9) {
        //                                 displayData = To46DataArry.slice(0, 9);
        //                             }

        //                             return (
        //                                 <div key={thirItem.appTypeId} className={`${styles.Third_level_business} ${thirClass}`}>
        //                                     <div className={styles.Third_level_title}>
        //                                         <span className={styles.Third_title}>{thirItem.appTypeName}</span>
        //                                         {!isExpanded && To46DataArry.length > 9 && (
        //                                             <div className={styles.Third_more} onClick={() => openModal(thirItem.appTypeId)}>
        //                                                 <span>更多</span>
        //                                                 <img src={new URL(`./imgs/arrowRg.png`, import.meta.url).href} alt="" />
        //                                             </div>
        //                                         )}
        //                                         <Modal
        //                                             title={`${thirItem.appTypeName}(${To46DataArry.length})`}
        //                                             open={modalVisible[thirItem.appTypeId]}
        //                                             onOk={() => closeModal(thirItem.appTypeId)}
        //                                             onCancel={() => closeModal(thirItem.appTypeId)}
        //                                             wrapClassName={styles.custom_modal}
        //                                             maskClosable={false}
        //                                             width={600}
        //                                             destroyOnClose
        //                                         >
        //                                             <div className="modalBox">
        //                                                 {To46DataArry.map((To46Item: any) => (
        //                                                     <span key={To46Item.appTypeId}>
        //                                                         <span
        //                                                             className={`four_title ${To46Item.appTypeCount ? 'moreApplycation' : ''}`}
        //                                                             title={To46Item.appTypeCount ? '' : To46Item.appTypeName}
        //                                                         >
        //                                                             <Popover
        //                                                                 key={To46Item.appTypeId}
        //                                                                 content={renderPopoverContent(To46Item.appTypeName)}
        //                                                                 trigger="hover"
        //                                                                 placement="bottom"
        //                                                                 overlayClassName={styles.custom_popover}
        //                                                                 open={
        //                                                                     To46Item.appTypeCount
        //                                                                         ? modalPopoverVisible[To46Item.appTypeId] || false
        //                                                                         : false
        //                                                                 }
        //                                                                 onOpenChange={(visible) => {
        //                                                                     if (visible && To46Item.appTypeCount) {
        //                                                                         fetchPopoverData(To46Item.appTypeId);
        //                                                                     }
        //                                                                     setTimeout(() => {
        //                                                                         setModalPopoverVisible((prev) => ({
        //                                                                             ...prev,
        //                                                                             [To46Item.appTypeId]: visible,
        //                                                                         }));
        //                                                                     }, 300);
        //                                                                 }}
        //                                                             >
        //                                                                 {To46Item.appTypeName}
        //                                                             </Popover>
        //                                                         </span>
        //                                                         {To46Item.appTypeCount && <span className="countNum">({To46Item.appTypeCount})</span>}
        //                                                     </span>
        //                                                 ))}
        //                                             </div>
        //                                         </Modal>
        //                                     </div>
        //                                     <div className={styles.four_level_title}>
        //                                         {displayData.map((To46Item: any) => (
        //                                             <span key={To46Item.appTypeId}>
        //                                                 <span
        //                                                     className={`${styles.four_title} ${To46Item.appTypeCount ? styles.moreApplycation : ''}`}
        //                                                     title={To46Item.appTypeCount ? '' : To46Item.appTypeName}
        //                                                 >
        //                                                     <Popover
        //                                                         key={To46Item.appTypeId}
        //                                                         content={renderPopoverContent(To46Item.appTypeName)}
        //                                                         trigger="hover"
        //                                                         placement="bottom"
        //                                                         overlayClassName={styles.custom_popover}
        //                                                         open={To46Item.appTypeCount ? popoverVisible[To46Item.appTypeId] || false : false}
        //                                                         onOpenChange={(visible) => {
        //                                                             if (visible && To46Item.appTypeCount) {
        //                                                                 fetchPopoverData(To46Item.appTypeId);
        //                                                             }
        //                                                             setTimeout(() => {
        //                                                                 setPopoverVisible((prev) => ({
        //                                                                     ...prev,
        //                                                                     [To46Item.appTypeId]: visible,
        //                                                                 }));
        //                                                             }, 300);
        //                                                         }}
        //                                                     >
        //                                                         {To46Item.appTypeName}
        //                                                     </Popover>
        //                                                 </span>
        //                                                 {To46Item.appTypeCount && <span className={styles.countNum}>({To46Item.appTypeCount})</span>}
        //                                             </span>
        //                                         ))}
        //                                     </div>
        //                                 </div>
        //                             );
        //                         })}
        //                     </div>
        //                 );
        //             })}
        //         </div>
        //     );
        // } else if (appTypeCategory === '2') {
        //     return (
        //         <div className={styles.applyMapRight}>
        //             {secondArry.map((secItem: any) => {
        //                 const thirdArry = renderChildren(secItem.appTypeId);
        //                 // 计算展示的数组（最多4个）
        //                 const newthirdArry = thirdArry.length > 4 ? thirdArry.slice(0, 4) : thirdArry;
        //                 const thirClass = styles[`busi${secItem.appTypeId}`];

        //                 return (
        //                     <div key={secItem.appTypeId} className={`${styles.Third_level_business} ${styles.appTypeCategoryDiv} ${thirClass}`}>
        //                         <div className={styles.Third_level_title}>
        //                             <span className={styles.Third_title}>{secItem.appTypeName}</span>
        //                             {thirdArry.length > 4 && (
        //                                 <div className={styles.Third_more} onClick={() => openModal(secItem.appTypeId)}>
        //                                     <span>更多</span>
        //                                     <img src={new URL(`./imgs/arrowRg.png`, import.meta.url).href} alt="" />
        //                                 </div>
        //                             )}
        //                             <Modal
        //                                 title={`${secItem.appTypeName}(${thirdArry.length})`}
        //                                 open={modalVisible[secItem.appTypeId]}
        //                                 onOk={() => closeModal(secItem.appTypeId)}
        //                                 onCancel={() => closeModal(secItem.appTypeId)}
        //                                 wrapClassName={styles.custom_modal}
        //                                 maskClosable={false}
        //                                 width={600}
        //                                 destroyOnClose
        //                             >
        //                                 <div className="modalBox">
        //                                     {thirdArry.map((To46Item: any) => (
        //                                         <span key={To46Item.appTypeId}>
        //                                             <span
        //                                                 className={`four_title ${To46Item.appTypeCount ? 'moreApplycation' : ''}`}
        //                                                 title={To46Item.appTypeCount ? '' : To46Item.appTypeName}
        //                                             >
        //                                                 <Popover
        //                                                     key={To46Item.appTypeId}
        //                                                     content={renderPopoverContent(To46Item.appTypeName)}
        //                                                     trigger="hover"
        //                                                     placement="bottom"
        //                                                     overlayClassName={styles.custom_popover}
        //                                                     open={To46Item.appTypeCount ? modalPopoverVisible[To46Item.appTypeId] || false : false}
        //                                                     onOpenChange={(visible) => {
        //                                                         if (visible && To46Item.appTypeCount) {
        //                                                             fetchPopoverData(To46Item.appTypeId);
        //                                                         }
        //                                                         setTimeout(() => {
        //                                                             setModalPopoverVisible((prev) => ({
        //                                                                 ...prev,
        //                                                                 [To46Item.appTypeId]: visible,
        //                                                             }));
        //                                                         }, 300);
        //                                                     }}
        //                                                 >
        //                                                     {To46Item.appTypeName}
        //                                                 </Popover>
        //                                             </span>
        //                                             {To46Item.appTypeCount && <span className="countNum">({To46Item.appTypeCount})</span>}
        //                                         </span>
        //                                     ))}
        //                                 </div>
        //                             </Modal>
        //                         </div>
        //                         <div className={styles.four_level_title}>
        //                             {newthirdArry.map((thirItem: any) => (
        //                                 <span key={thirItem.appTypeId}>
        //                                     <span
        //                                         className={`${styles.four_title} ${styles.operationType} ${
        //                                             thirItem.appTypeCount ? styles.moreApplycation : ''
        //                                         }`}
        //                                         title={thirItem.appTypeCount ? '' : thirItem.appTypeName}
        //                                     >
        //                                         <Popover
        //                                             key={thirItem.appTypeId}
        //                                             content={renderPopoverContent(thirItem.appTypeName)}
        //                                             trigger="hover"
        //                                             placement="bottom"
        //                                             overlayClassName={styles.custom_popover}
        //                                             open={thirItem.appTypeCount ? popoverVisible[thirItem.appTypeId] || false : false}
        //                                             onOpenChange={(visible) => {
        //                                                 if (visible && thirItem.appTypeCount) {
        //                                                     fetchPopoverData(thirItem.appTypeId);
        //                                                 }
        //                                                 setTimeout(() => {
        //                                                     setPopoverVisible((prev) => ({
        //                                                         ...prev,
        //                                                         [thirItem.appTypeId]: visible,
        //                                                     }));
        //                                                 }, 300);
        //                                             }}
        //                                         >
        //                                             {thirItem.appTypeName}
        //                                         </Popover>
        //                                     </span>
        //                                     {thirItem.appTypeCount && <span className={styles.countNum}>({thirItem.appTypeCount})</span>}
        //                                 </span>
        //                             ))}
        //                         </div>
        //                     </div>
        //                 );
        //             })}
        //         </div>
        //     );
        // }
        // return null;
    };

    return (
        <div className={`${styles.applicationMapBox} ${state.activeFirstId !== '' ? styles.ready : ''}`}>
            {/* {loading ? (
                <Spin spinning tip="加载中...">
                    <div style={{ minHeight: 200 }} />
                </Spin>
            ) : ( */}
            <div className={styles.applicationMap}>
                <div className={styles.applyBg} style={{ backgroundImage: `url(${new URL(`./imgs/applyBg.png`, import.meta.url).href})` }}>
                    <img className={styles.topIcon4} src={new URL(`./imgs/topIcon4.png`, import.meta.url).href} alt="" />
                    <img className={styles.topIcon3} src={new URL(`./imgs/topIcon3.png`, import.meta.url).href} alt="" />
                    <img className={styles.topIcon2} src={new URL(`./imgs/topIcon2.png`, import.meta.url).href} alt="" />
                    <img className={styles.elePng} src={new URL(`./imgs/elePng.png`, import.meta.url).href} alt="" />
                    <img className={styles.topIcon1} src={new URL(`./imgs/topIcon1.png`, import.meta.url).href} alt="" />
                    <img className={styles.elePng} src={new URL(`./imgs/elePng.png`, import.meta.url).href} alt="" />
                    <div className={styles.searchBox}>
                        <Input
                            placeholder="请搜索应用名称"
                            className={styles.searchInput}
                            allowClear
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                        <div className={styles.levelsBox}>
                            <span className={styles.label}>应用级别：</span>
                            <Select
                                className={styles.customSelect}
                                mode="multiple"
                                placeholder="请选择应用级别"
                                showSearch={false}
                                options={[
                                    { label: '一级应用', value: 1 },
                                    { label: '二级应用', value: 2 },
                                ]}
                                value={selectedLevels}
                                onChange={setSelectedLevels}
                                style={{ minWidth: 200 }}
                            />
                            <span className={styles.label}>应用标签：</span>
                            {/* 应用标签区域 */}
                            <div className={styles.tagBox}>
                                <div className={styles.tagsWrapper}>
                                    <div className={styles.tagItemBox} ref={tagItemBoxRef}>
                                        {state.selectedTags.tagTypeName ? (() => {
                                            const tagNames = state.selectedTags.tagTypeName?.split(',');
                                            const tagIds = state.selectedTags.tagTypeId?.split(',') || [];

                                            // 计算要显示的标签数量
                                            const displayCount = tagDisplayState.visibleCount !== null ? tagDisplayState.visibleCount : tagNames.length;

                                            return (
                                                <>
                                                    {/* 只渲染可见的标签 */}
                                                    {tagNames.slice(0, displayCount).map((tagName, index) => {
                                                        const tagId = tagIds[index];
                                                        return (
                                                            <div key={tagId || index} className={styles.tagItem} title={tagName}>
                                                                <span>{tagName}</span>
                                                                <CloseOutlined
                                                                    className={styles.tagCloseIcon}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleRemoveTag(index);
                                                                    }}
                                                                />
                                                            </div>
                                                        );
                                                    })}

                                                    {/* 溢出时显示省略号 */}
                                                    {tagDisplayState.visibleCount !== null && tagDisplayState.hiddenTags.length > 0 && (
                                                        <Tooltip
                                                            title={
                                                                <div className={styles.hiddenTagsTooltip}>
                                                                    {tagDisplayState.hiddenTags.map((tag) => (
                                                                        <div key={tag.id} className={styles.hiddenTagItem} title={tag.name}>
                                                                            <span>{tag.name}</span>
                                                                            <CloseOutlined
                                                                                className={styles.hiddenTagCloseIcon}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleRemoveHiddenTag(tag.originalIndex);
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            }
                                                            placement="bottomRight"
                                                            overlayClassName={styles.hiddenTagsTooltipOverlay}
                                                        >
                                                            <span className={styles.overflowEllipsis}>...</span>
                                                        </Tooltip>
                                                    )}
                                                </>
                                            );
                                        })() : <span className={styles.emptyTip}>请选择应用标签</span>}
                                    </div>

                                    {/* 选择按钮 */}
                                    <div
                                        className={styles.tagSelector}
                                        onClick={() => setState((prev) => ({ ...prev, tagModalVisible: true }))}
                                    >
                                        选择
                                    </div>
                                </div>

                                {/* 应用标签选择弹窗 */}
                                <Modal
                                    className={styles.addTempModal}
                                    title="选择应用标签"
                                    open={state.tagModalVisible}
                                    onCancel={() => setState((prev) => ({ ...prev, tagModalVisible: false }))}
                                    footer={null}
                                    width={650}
                                    destroyOnClose
                                >
                                    <CascadeSelects
                                        appCategory={'1'}
                                        selectedTagIds={state.selectedTags.tagTypeId ? state.selectedTags.tagTypeId : ''}
                                        onCancel={() => setState((prev) => ({ ...prev, tagModalVisible: false }))}
                                        onSure={(data) => {
                                            appTagsChange({
                                                tagTypeId: data.appTypeId,
                                                tagTypeName: data.appTypeName,
                                            });
                                            setState((prev) => ({ ...prev, tagModalVisible: false }));
                                        }}
                                    />
                                </Modal>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <!-- 左侧信息栏 --> */}
                <div className={styles.applyMapLeft}>
                    {/* <div className={styles.config_tab_top}>
                        <div
                            className={`${styles.business_title} ${state.appLevel === '' ? styles.title_active : ''}`}
                            tab-type="ALL"
                            onClick={() => handleTabClick('')}
                        >
                            全部
                        </div>
                        <div
                            className={`${styles.business_title} ${state.appLevel === '1' ? styles.title_active : ''}`}
                            tab-type="1"
                            onClick={() => handleTabClick('1')}
                        >
                            中心
                        </div>
                        <div
                            className={`${styles.business_title} ${state.appLevel === '2' ? styles.title_active : ''}`}
                            tab-type="2"
                            onClick={() => handleTabClick('2')}
                        >
                            分中心
                        </div>
                    </div> */}
                    <div className={styles.applyMapLeftScroll}>
                        <div className={`${styles.first_level_business} ${styles.product}`}>
                            <span className={styles.first_level}>生产应用</span>
                            <div className={styles.productBus}>{leftFunction('1')}</div>
                        </div>
                        <div className={styles.operation}>
                            <span className={styles.first_level}>运营应用</span>
                            <div className={styles.operationBus}>{leftFunction('2')}</div>
                        </div>
                    </div>
                </div>
                {/* <!-- 右侧信息栏 --> */}
                {/* <div className="applyMapRight">
                    </div> */}
                {renderRightContent()}
            </div>
            {/* )} */}
        </div>
    );
};

export default ElementManagePage;
