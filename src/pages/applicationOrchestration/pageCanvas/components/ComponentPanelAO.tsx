// 应用编排左侧组件和元素
import React, { useEffect, useMemo, memo, useRef, useState, useImperativeHandle, useCallback, forwardRef } from 'react';
import { Row, Col, Tabs, Collapse, Input, Divider, Empty, Select, Tree, Tooltip, Flex, Button, Form } from 'antd';
import {
    SearchOutlined,
    UpOutlined,
    AppstoreOutlined,
    PartitionOutlined,
    ApiOutlined,
    FunctionOutlined,
    ProductOutlined,
    MonitorOutlined,
} from '@ant-design/icons';
import { useDebounceFn } from 'ahooks';
import DragMenuItem from '@/layout/components/Menu/DragMenuItem';
import components, { SysComItem, getComponentMenu } from '@/config/components';
import styles from './index.module.less';
import { componentModel } from '@/stores/menuStore';
import { useAppContext } from '@/utils/AppProvider';
import { publictData } from '@/utils/appMenuData';
import request from '@/utils/request';
import { crossApiUserInfo } from '@/stores/crossapiStore';
// 业务分类数据管理
import { businessDataListInfo } from '@/stores/businessCategoryStore';
import { useShallow } from 'zustand/react/shallow';
import { isLocalMockMode } from '@/mock/localMock';
import { GUIDED_MOCK_COMPONENTS } from '@/mock/guidedProcessMock';
import VariableList from '@/layout/components/Variable/VariableList';
import ApiList from '../../../../layout/components/ApiList/ApiList';
import CrossApiList from '../../../../layout/components/CrossApiList/CrossApiList';
import OutlinePanel from '../../../../layout/components/OutlinePanel';
import { message } from '@/utils/AntdGlobal';

/**
 * 组件
 */
interface ComponentPanelRef {
    getRecordedComponentIds: () => string[];
}

const ComponentPanel = forwardRef<ComponentPanelRef>((props, ref) => {
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const customRef = useRef<{ reload: () => void }>();
    const [keyword, setKeyword] = useState('');
    const [componentKeyword, setComponentKeyword] = useState(''); // 组件搜索内容
    const [elementKeyword, setElementKeyword] = useState(''); // 元素搜索内容
    const [componentKeywordv, setComponentKeywordv] = useState(''); // 组件搜索框默认展示
    const [elementKeywordv, setElementKeywordv] = useState(''); // 元素搜索框默认展示
    const [activeKeys, setActiveKeys] = useState<string[]>([]);
    const [tabKey, setTabKey] = useState<string>('component');
    const [list, setList] = useState<Array<{ key: string; label: string; children: JSX.Element }>>([]);

    // 记录拖动和双击的组件ID列表
    const [recordedComponentIds, setRecordedComponentIds] = useState<string[]>([]);
    const { pageStore } = useAppContext();

    // 处理组件拖动或双击事件，记录组件ID
    const handleComponentAction = (componentId: string) => {
        if (componentId) {
            setRecordedComponentIds(prev => [...prev, componentId]);
        }
    };

    // 暴露给父组件的方法
    useImperativeHandle(ref, () => ({
        getRecordedComponentIds: () => recordedComponentIds
    }));
    const config = pageStore(useShallow((state: any) => state.config));
    const flag1 = pageStore(useShallow((state: any) => state.flag));

    useEffect(() => {
        if (tabKey == 'component') {
            setKeyword(componentKeyword);
        } else if (tabKey == 'element') {
            setKeyword(elementKeyword);
        }
    }, [componentKeyword, elementKeyword]);

    // 根据场景类型切换Tab：向导式(process)显示组件(component)Tab，组装式(base)显示元素(element)Tab
    useEffect(() => {
        if (config.sceneType) {
            setTabKey(config.sceneType === 'process' ? 'component' : 'element');
        }
    }, [config.sceneType]);

    useEffect(() => {
        const componentMenu = getComponentMenu(); // 获取元素菜单
        // 过滤组件：只显示全网('0000')和当前租户(userInfo.provinceId)的组件
        const filteredMenu = componentMenu.map((category: SysComItem) => ({
            ...category,
            data: category.data.filter((item: any) => {
                // 如果组件没有provId字段，说明是系统默认组件，默认显示
                if (!item.provId) {
                    return true;
                }
                // 只显示全网组件('0000')和当前租户组件
                return item.provId === '0000' || item.provId === userInfo.provinceId;
            }),
        })).filter((category: SysComItem) => category.data.length > 0); // 过滤掉没有数据的分类
        // 系统自带组件
        const items: Array<{ key: string; label: string; children: React.JSX.Element }> = (
            keyword ? searchByName(filteredMenu, keyword) : filteredMenu
        )
            .filter((item: SysComItem) => !item.hidden)
            .map((item: SysComItem) => {
                return {
                    key: item.type,
                    label: item.title,
                    children: (
                        <div style={{display:'flex',flexWrap:'wrap',marginRight:-20}}>
                            {item.data
                                .filter((sub) => !sub.hidden)
                                .map((subItem) => {
                                    return (
                                        <div style={{marginRight:6,width:50,textAlign:'center'}} key={subItem.type}>
                                            <DragMenuItem {...subItem} onComponentAction={handleComponentAction} />
                                        </div>
                                    );
                                })}
                        </div>
                    ),
                };
            });
        setActiveKeys(items.map((item) => item.key));
        setList(items);
    }, [keyword, components]);

    // 组件搜索
    function searchByName(data: any, keyword: string) {
        const results: SysComItem[] = [];

        function searchInArray(arr: any, parent: any) {
            for (const item of arr) {
                if (Array.isArray(item.data)) {
                    // 如果当前项有子数组，递归搜索子数组
                    searchInArray(item.data, { ...item, data: [] });
                } else if (item.name.includes(keyword)) {
                    parent.data.push(item);
                    if (results.filter((r) => r.type === parent.type).length > 0) continue;
                    results.push({ ...parent });
                }
            }
        }
        if (keyword) {
            searchInArray(data, null);
            return results;
        }
        return data;
    }

    // collapse事件
    const handleCollapse = (keys: string | string[]) => {
        setActiveKeys(typeof keys === 'string' ? [keys] : keys);
    };
    const [componentTreeData, setComponentTreeData] = useState<any[]>([]);
    const baseInfo = pageStore((state: any) => state.config);

    const flag = pageStore((state: any) => state.flag);
    const businessData = businessDataListInfo((state: any) => state.businessDataList);
    const businessMap: any = {};
    useEffect(() => {
        businessData.forEach((item: any) => {
            businessMap[`id_${item.businessId}`] = item.businessName;
        });
    }, []);
    const [componentTreeDataAll, setComponentTreeDataAll] = useState([{}]);
    useEffect(() => {
        const sceneComponentParams = {
            provId: userInfo.provinceId,
            serviceTypeId: baseInfo.serviceTypeId,
            dataType: '1',
            componentStatus: 1,
            componentCategory: baseInfo.appCategory,
            componentType: '',
        };
        const componentRequest = isLocalMockMode('guided')
            ? Promise.resolve({ beans: GUIDED_MOCK_COMPONENTS.map((item) => ({ ...item, businessId: 'mock-business', componentPicture: '' })) })
            : request.post('/appComponent/queryAppComponentList', { params: sceneComponentParams });
        componentRequest.then(({ beans }: any) => {
            const _componentTreeDataAll: any[] = [{}];
            const levelTwo = businessData.filter((item: any) => item.businessLevel == '2');
            levelTwo?.forEach((item: any) => {
                _componentTreeDataAll.push({
                    title: item.businessName,
                    key: item.businessId,
                    businessId: item.businessId,
                    parentId: item.parentId,
                    icon: <div className="folderIcon" />,
                    isLeaf: false,
                    serviceLink: '',
                    componentLevel: '',
                    children: beans
                        .filter((_item: any) => _item.businessId == item.businessId)
                        .map((_item1: any) => {
                            return {
                                title: <DragMenuItem
                                    type="businessComponent"
                                    name={_item1.componentName}
                                    componentid={_item1.id}
                                    onComponentAction={handleComponentAction}
                                />,
                                titleSrc: _item1.componentName,
                                key: _item1.id,
                                icon: <div className="fileIcon" />,
                                isLeaf: true,
                                serviceLink: _item1.serviceLink,
                                businessId: _item1.businessId,
                                parentId: _item1.parentId,
                                componentLevel: _item1.componentLevel,
                                componentPicture:_item1.componentPicture
                            };
                        }),
                });
            });
            _componentTreeDataAll.shift();

            // 核心过滤函数：过滤掉一级 children 为空的对象
            const filterEmptyChildren = (arr: any[]): any[] => {
                return arr.filter((item) => {
                    // 条件：children 存在 且 是数组 且 长度 > 0
                    return Array.isArray(item.children) && item.children.length > 0;
                });
            };

            // 执行过滤
            const _componentTreeDataAllNew = filterEmptyChildren(_componentTreeDataAll);
            setComponentTreeDataAll(_componentTreeDataAllNew);
            filterComponentData(_componentTreeDataAllNew);
        });
    }, [baseInfo, businessData]);
    const [appPlatLevel, setAppPlatLevel] = useState('123');
    const [serviceLink, setServiceLink] = useState('123');
    const [levelFirst, setLevelFirst] = useState('123');
    useEffect(() => {
        if (componentTreeDataAll && componentTreeDataAll.length > 0 && JSON.stringify(componentTreeDataAll[0]) != '{}') {
            filterComponentData(componentTreeDataAll);
        }
    }, [appPlatLevel, serviceLink, levelFirst, keyword]);
    const filterComponentData = (data: any) => {
        const _treeNode: [any] = [{}];
        if (!data || data.length < 1) {
            setComponentTreeData([]);
        }
        data.forEach((item: any) => {
            if (
                (serviceLink == '123' || item.serviceLink == serviceLink) &&
                (levelFirst == '123' || item.parentId == levelFirst) &&
                (!keyword || item.title.indexOf(keyword) > -1) &&
                appPlatLevel == '123'
            ) {
                const _node = {
                    ...item,
                };
                if (item.children) {
                    _node.children = item.children.map((item: any) => item);
                }
                _treeNode.push(_node);
            } else {
                const node: [any] = [{}];
                (item.children || []).forEach((child: any) => {
                    if (
                        (serviceLink == '123' || child.serviceLink == serviceLink) &&
                        (levelFirst == '123' || child.parentId == levelFirst) &&
                        (!keyword || child.titleSrc.indexOf(keyword) > -1) &&
                        (appPlatLevel == '123' || child.componentLevel == appPlatLevel)
                    ) {
                        node.push({ ...child });
                    }
                });
                if (node.length > 1) {
                    node.shift();
                    _treeNode.push({
                        title: item.title,
                        key: item.key,
                        businessId: item.businessId,
                        icon: item.icon,
                        isLeaf: item.isLeaf,
                        serviceLink: item.serviceLink,
                        parentId: item.parentId,
                        children: [...node],
                    });
                }
            }
        });
        _treeNode.shift();
        setComponentTreeData(_treeNode);
    };

    const preview = (item: any) => {
        if (!item.isLeaf){
            return <div>{item.title}</div>
        }
        return <div style={{width:'100%',display:'flex',flexDirection:'column',justifyContent:'center'}}>
            <div style={{fontSize:14,fontWeight:"bold"}}>{item.titleSrc}</div>

            <Divider style={{margin:'10px 0'}}/>
            {item.componentPicture ? (
                <img style={{ width: '100%', height: 120 }} src={item.componentPicture} />
            ) : (
                <div className="componentDataNoImg">暂无预览效果</div>
            )}
        </div>;
    };

    // 页签
    const tabs = useMemo(() => {
        const baseTabs = [
            {
                key: 'component', // 业务组件
                label: (
                    <Flex vertical justify="center" align="center" gap={5}>
                        <ProductOutlined style={{ fontSize: 16 }} />
                        <span style={{ fontSize: 12 }}>组件</span>
                    </Flex>
                ),
                children: (
                    <>
                        {componentTreeData.length > 0 && (
                            <React.Suspense fallback={<span />}>
                                <Tree
                                    showIcon
                                    treeData={componentTreeData}
                                    defaultExpandAll
                                    className={styles.componentTree}
                                    titleRender={(item:any) => {
                                        return (
                                            <Tooltip title={preview(item)}
                                                     overlayClassName={styles.customTooltip}>
                                                <span>{item.title}</span>
                                            </Tooltip>
                                        );
                                    }}
                                ></Tree>
                            </React.Suspense>
                        )}
                        {componentTreeData.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                    </>
                ),
            },
            {
                key: "monitor",
                label: (
                    <Flex vertical justify="center" align="center" gap={5}>
                        <ProductOutlined style={{ fontSize: 16 }} />
                        <span style={{ fontSize: 12 }}>监听</span>
                    </Flex>
                ),
                children: <Monitor></Monitor>
            },
            {
                key: 'element',
                label: (
                    <Flex vertical justify="center" align="center" gap={5}>
                        <AppstoreOutlined style={{ fontSize: 16 }} />
                        <span style={{ fontSize: 12 }}>元素</span>
                    </Flex>
                ),
                children: (
                    <>
                        <Collapse
                            className="elementCont"
                            style={{ height: list.length > 0 ? 'calc(-42px + 100%)' : '', overflowY: 'auto' ,overflowX:'hidden'}}
                            items={list}
                            ghost
                            expandIconPosition={'end'}
                            size={'small'}
                            activeKey={activeKeys}
                            onChange={handleCollapse}
                            expandIcon={({ isActive }) => <UpOutlined rotate={isActive ? 0 : -180} />}
                        />
                        {list.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                    </>
                ),
            },
            {
                key: 'variableList',
                label: (
                    <Flex vertical justify="center" align="center" gap={5}>
                        <FunctionOutlined style={{ fontSize: 16 }} />
                        <span style={{ fontSize: 12 }}>变量</span>
                    </Flex>
                ),
                children: <VariableList></VariableList>,
            },
            {
                key: 'apiConfig',
                label: (
                    <Flex vertical justify="center" align="center" gap={5}>
                        <ApiOutlined style={{ fontSize: 16 }} />
                        <span style={{ fontSize: 12 }}>接口</span>
                    </Flex>
                ),
                children: <ApiList></ApiList>,
            },
            {
                key: 'outlinePanel',
                label: (
                    <Flex vertical justify="center" align="center" gap={5}>
                        <PartitionOutlined style={{ fontSize: 16 }} />
                        <span style={{ fontSize: 12 }}>大纲</span>
                    </Flex>
                ),
                children: <OutlinePanel></OutlinePanel>,
            },
            {
                key: 'crossAPIConfig',
                label: (
                    <Flex vertical justify="center" align="center" gap={5}>
                        <MonitorOutlined style={{ fontSize: 16 }} />
                        <span style={{ fontSize: 12 }}>监听</span>
                    </Flex>
                ),
                children: <CrossApiList></CrossApiList>,
            },
        ];
        if(config.sceneType === 'process'){
            baseTabs.splice(2, baseTabs.length - 2);
        }else{
            baseTabs.splice(1, 1);
        }
        return baseTabs
    }, [list, activeKeys, componentTreeData, config.sceneType]);

    // 切换时，刷新自定义组件
    const handleTabChange = useCallback((key: string) => {
        setTabKey(key);
        if (key == 'component') {
            setKeyword(componentKeyword);
            setComponentKeywordv(componentKeyword);
        } else if (key == 'element') {
            setKeyword(elementKeyword);
            setElementKeywordv(elementKeyword);
        }
        if (key === 'custom') {
            customRef.current?.reload();
        }
    }, [componentKeyword, elementKeyword]);

    // 监听自定义事件切换到元素Tab（用于操作指引时自动切换）
    useEffect(() => {
        const handleSwitchToElement = () => {
            handleTabChange('element');
        };
        window.addEventListener('switchToElementTab', handleSwitchToElement);
        return () => {
            window.removeEventListener('switchToElementTab', handleSwitchToElement);
        };
    }, [handleTabChange]);

    // 组件搜索
    const { run } = useDebounceFn(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const name = event.target.value;
            if (tabKey == 'component') {
                setComponentKeyword(name);
            } else if (tabKey == 'element') {
                setElementKeyword(name);
            }
            // setKeyword(name);
        },
        { wait: 500 },
    );
    const showComponent: boolean = componentModel((state: any) => state.showComponent);
    const setComponentState = componentModel((state: any) => state.setComponentState);
    // 应用级别变化
    const appPlatLevelChange = (val: string) => {
        setAppPlatLevel(val);
    };
    // serviceLink变化
    const serviceLinkChange = (val: string) => {
        setServiceLink(val);
    };
    // levelFirst变化
    const levelFirstChange = (val: string) => {
        setLevelFirst(val);
    };
    const _appPlatLevelArr: any[] = [{ label: '全部', value: '123', id: '0' }, ...publictData.appPlatLevelArr];
    const _appServiceLinkArr: any[] = [{ label: '全部', value: '123', id: '0' }, ...publictData.appServiceLinkArr];
    const businessLevelFirst = businessData
        .filter((item: any) => item.businessLevel == '1')
        .map((item: any) => ({ label: item.businessName, value: item.businessId }));
    const businessLevelFirsts: any[] = [{ label: '全部', value: '123', id: '0' }, ...businessLevelFirst];
    return (
        <div className={styles.componentPanel}>
            {!showComponent && <div className="openComponent" onClick={() => setComponentState(true)} />}
            {showComponent && (
                <React.Suspense fallback={<span />}>
                    <div className="closeComponent" onClick={() => setComponentState(false)}></div>
                </React.Suspense>
            )}
            {showComponent && (
                <Tabs
                    size={'small'}
                    className={styles.tabs}
                    activeKey={tabKey}
                    tabPosition={'left'}
                    onChange={handleTabChange}
                    items={tabs.map((item) => {
                        return {
                            key: item.key,
                            label: item.label,
                            children: (
                                <>
                                    {tabKey == 'component' && (
                                        <>
                                            <Input placeholder="输入组件名称查询"  allowClear suffix={<SearchOutlined />} defaultValue={componentKeywordv} onChange={run} />
                                            <Select
                                                style={{ width: '49%', marginTop: '10px' }}
                                                placeholder="全部"
                                                onChange={appPlatLevelChange}
                                                options={_appPlatLevelArr}
                                            />
                                            {/* <Select
                                                style={{ width: '49%', marginTop: '10px', marginLeft: '2%' }}
                                                placeholder="全部"
                                                onChange={serviceLinkChange}
                                                options={_appServiceLinkArr}
                                            /> */}
                                            <Select
                                                style={{ width: '49%', marginTop: '10px', marginLeft: '2%' }}
                                                placeholder="全部"
                                                onChange={levelFirstChange}
                                                options={businessLevelFirsts}
                                            />
                                        </>
                                    )}
                                    {tabKey === 'element' && (
                                        <>
                                            <Input placeholder="输入元素名称查询" allowClear suffix={<SearchOutlined />} defaultValue={elementKeywordv} onChange={run} />
                                            <Divider style={{ margin: '12px 0 0 0' }} />
                                        </>
                                    )}
                                    {item.children}
                                </>
                            ),
                        };
                    })}
                />
            )}
        </div>
    );
});

ComponentPanel.displayName = 'ComponentPanel';

export default ComponentPanel;
const Monitor = memo(() => {
    const { pageStore } = useAppContext();
    const setRefreshPageEvent = pageStore(useShallow((state: any) => state.setRefreshPageEvent));
    const refreshPageEvent = pageStore(useShallow((state: any) => state.page.refreshPageEvent));
    const [form] = Form.useForm();
    useEffect(() => {
        let newData = refreshPageEvent ? { refreshPage: refreshPageEvent.split(",").map((item: any) => ({eventName: item})) } : { refreshPage: [{ eventName: '' }] };
        if (JSON.stringify(form.getFieldsValue()) !== JSON.stringify(newData)) {
            form.setFieldsValue(newData);
        }
    }, [refreshPageEvent]);
    // 防抖
    const { run } = useDebounceFn(
        (api: any, apis) => {
            updateApi(apis.refreshPage);
        },
        { wait: 800 },
    );
    const updateApi = (api: any = []) => {
        setRefreshPageEvent(api.map((item: any) => item.eventName).join(","));
    };
    const addCrossApi = (add: any) => {
        if (form.getFieldsValue().refreshPage.length >= publictData.crossApiEventFlow.length) {
            message.warning('事件监听已新增最大！');
        } else {
            add({ eventName: '' });
        }
    };
    const deleteCrossApi = (api: any, remove: any) => {
        remove(api.name);
    };
    return (
        <>
            <Form form={form} onValuesChange={run}>
                <Form.List name="refreshPage">
                    {(refreshPage: any, { add: addOuter, remove: removeOuter }) =>
                        refreshPage.map((api: any, _index: number) => (
                            <div className={styles.refreshPageItem} key={`api_${_index}`}>
                                <Form.Item label="事件名称" name={[api.name, 'eventName']}>
                                    <Select
                                        defaultValue=""
                                        className="apiTreeData"
                                        options={publictData.crossApiEventFlow}
                                    />
                                </Form.Item>
                                {refreshPage.length > 1 && (
                                    <Button
                                        type="primary"
                                        className="apiOperate"
                                        onClick={() => {
                                            deleteCrossApi(api, removeOuter);
                                        }}
                                    >
                                        删除
                                    </Button>
                                )}
                                <Button
                                    type="primary"
                                    className="apiOperate"
                                    onClick={() => {
                                        addCrossApi(addOuter);
                                    }}
                                >
                                    新增
                                </Button>
                            </div>
                        ))
                    }
                </Form.List>
            </Form>
        </>
    );
}, (prev, next) => {
    return true
})
