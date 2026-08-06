import React, { useState, lazy, useEffect, useMemo, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { menu } from '@/stores/menuStore';
import { useShallow } from 'zustand/react/shallow';
import { Menu, Tabs } from 'antd';
import type { MenuProps } from 'antd';
import Preview from './Preview/Preview';
import './layout.less';
import styles from '@/layout/components/Menu/index.module.less';
import type { MenuItem, TabItem } from './menuTypes';
import LazyLoadComponent from './LazyLoadComponent';
import ErrorBoundary from '@/ErrorBoundary';
import { crossApiUserInfo } from '@/stores/crossapiStore';

// 组件懒加载定义
const ElementManagement = lazy(() => import('@/pages/elementManagement/index'));
const TemplateManagement = lazy(() => import('@/pages/templateManagement/index'));
const ServiceOrchestration = lazy(() => import('@/pages/serviceOrchestration/index'));
const ApplicationOrchestration = lazy(() => import('@/pages/applicationOrchestration/index'));
const ApplicationDashboard = lazy(() => import('@/pages/applicationDashboard/index'));
const ApplicationMap = lazy(() => import('@/pages/applicationMap/index'));
const ApplicationList = lazy(() => import('@/pages/applicationList/index'));
const ApplicationAchievements = lazy(() => import('@/pages/applicationAchievements/index'));
const AuditManagement = lazy(() => import('@/pages/auditManagement/index'));
const BusinessComponentList = lazy(() => import('@/pages/businessComponentManage/index'));
const ApplicationMonitoring = lazy(() => import('@/pages/ApplicationRunPage/applicationMonitoring')); // 应用监控
const ApplicationLog = lazy(() => import('@/pages/ApplicationRunPage/applicationLog'));  // 应用日志
const ApplicationAlert = lazy(() => import('@/pages/ApplicationRunPage/applicationAlert'));  // 应用告警
const RateLimitingRuleConfiguration= lazy(() => import('@/pages/ApplicationRunPage/rateLimitingRuleConfiguration'));  // 限流规则配置
const AppEffectBoard = lazy(() => import('@/pages/appEffectBoard/index'));
const EvaluateRecord = lazy(() => import('@/pages/evaluateRecord/index'));

interface EditLayoutProps {
    path?: any;
}

const EditLayout: React.FC<EditLayoutProps> = ({path}:any) => {
    const userInfo = crossApiUserInfo((state) => state.userInfo);
    console.log(userInfo,'userInfo')
    // 多层菜单配置
    const menuItems: MenuItem[] = [
        {
            label: '应用建设',
            key: 'applicationConstruction',
            icon: <div className="applicationConstruction" />,
            children: [
                {
                    label: '资产管理',
                    key: 'assetManagement',
                    icon: <div className="assetManagement" />,
                    children: [
                        {
                            label: '元素管理',
                            key: 'elementManagement',
                            component: ElementManagement,
                        },
                        {
                            label: '业务组件管理',
                            key: 'businessComponentList',
                            component: BusinessComponentList,
                        },
                        {
                            label: '模板管理',
                            key: 'templateManagement',
                            component: TemplateManagement,
                        },
                    ],
                },
                {
                    label: '服务编排',
                    key: 'serviceOrchestration',
                    icon: <div className="serviceOrchestration" />,
                    component: ServiceOrchestration,
                },
                {
                    label: '应用编排',
                    key: 'applicationOrchestration',
                    icon: <div className="applicationOrchestration" />,
                    component: ApplicationOrchestration,
                },
            ],
        },
        {
            label: '应用运营',
            key: 'applicationOperations',
            icon: <div className="applicationOperations" />,
            children: [
                {
                    label: '应用管理',
                    key: 'applicationManagement',
                    icon: <div className="applicationManagement" />,
                    children: [
                        // {
                        //     label: '应用看板',
                        //     key: 'applicationDashboard',
                        //     component: ApplicationDashboard,
                        // },
                        {
                            label: '应用地图',
                            key: 'applicationMap',
                            component: ApplicationMap,
                        },
                        {
                            label: '应用列表',
                            key: 'applicationList',
                            component: ApplicationList,
                        },
                        {
                            label: '应用成效明细',
                            key: 'applicationAchievements',
                            component: ApplicationAchievements,
                            hide: true
                        },
                        {
                            label: '应用看板',
                            key: 'appEffectBoard',
                            component: AppEffectBoard
                        },{
                            label:'应用评估记录',
                            key:'evaluateRecord',
                            component:EvaluateRecord,
                            hide: true
                        },
                    ],
                },
                {
                    label: '审核管理',
                    key: 'auditManagement',
                    icon: <div className="auditManagement" />,
                    component: AuditManagement,
                },
                // {
                //     label: '测试',
                //     key: 'TestApi',
                //     icon: <div className="TestApi" />,
                //     component: TestApi,
                // },
                // {
                //     label: '项目管理',
                //     key: 'MyActivity',
                //     icon: <div className="MyActivity" />,
                //     component: MyActivity,
                // },
                // {
                //     label: '任务中心',
                //     key: 'TaskCenter',
                //     icon: <div className="TaskCenter" />,
                //     component: TaskCenter,
                // },
            ],

        },
        ...(userInfo.isTopShow === false ?[   {
            label: '应用运行',
            key: 'applicationRun',
            icon: <div className="applicationOperations"/>,
            children: [
                {
                    label: '应用监控',
                    key: 'applicationMonitoring',
                    icon: <div className="applicationMonitoring"/>,
                    component: ApplicationMonitoring,
                },
                {
                    label: '应用日志',
                    key: 'applicationLog',
                    icon: <div className="applicationLog"/>,
                    component: ApplicationLog,
                },
                {
                    label: '应用告警',
                    key: 'applicationAlert',
                    icon: <div className="applicationAlert"/>,
                    component: ApplicationAlert,
                },
                {
                    label: '限流规则配置',
                    key: 'rateLimitingRuleConfiguration',
                    icon: <div className="rateLimitingRuleConfiguration"/>,
                    component: RateLimitingRuleConfiguration,
                }
            ]
        }]:[])
     
        // {
        //     label: '租户管理',
        //     key: 'tenantManage',
        //     icon: <div className="tenantManage" />,
        //     component: TenantManage,
        // },
    ];

    // 状态管理
    const [selectedMenu, setSelectedMenu] = useState<string[]>(['elementManagement']);
    const [openKeys, setOpenKeys] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState('elementManagement');
    const [tabs, setTabs] = useState<TabItem[]>([
        {
            key: 'elementManagement',
            label: '元素管理',
            children: (
                <ErrorBoundary>
                    <LazyLoadComponent LazyLoadComponent={ElementManagement} />
                </ErrorBoundary>
            ),
            closable: false,
        },
    ]);

    // 获取所有可展开的菜单key
    const getAllExpandableKeys = useCallback(() => {
        const keys: string[] = [];

        const traverse = (items: MenuItem[]) => {
            items.forEach((item) => {
                // 非叶子节点则展开
                if (item.children && item.children.length > 0) {
                    keys.push(item.key);
                    traverse(item.children);
                }
            });
        };

        traverse(menuItems);
        return keys;
    }, []);

    // 根据key查找菜单项
    const findMenuItem = (items: MenuItem[], key: string): MenuItem | null => {
        for (const item of items) {
            if (item.key === key) return item;
            if (item.children) {
                const found = findMenuItem(item.children, key);
                if (found) return found;
            }
        }
        return null;
    };

    // 菜单点击事件
    const handleMenuClick: MenuProps['onClick'] = (e) => {
        // 兼容直接调用openMenu传参的情况
        // 如果是Menu的onClick事件，e包含key属性；如果是直接调用openMenu，e就是{key, params}
        const key = typeof e === 'object' && 'key' in e ? e.key : e;
        const params = typeof e === 'object' && 'params' in e ? e.params : undefined;

        // 检查是否是叶子节点（有组件的才是叶子节点）
        const menuItem = findMenuItem(menuItems, key);
        if (!menuItem || !menuItem.component) {
            // 不是叶子节点，只更新菜单选中状态
            setSelectedMenu([key]);
            return; // 不是叶子节点，不打开标签页
        }
        setSelectedMenu([key]);

        // 检查是否已打开该标签页
        const existingTab = tabs.find((tab) => tab.key === key);

        if (existingTab) {
            // 切换到已存在的标签页并传递参数
            const LazyComp = menuItem.component;

            // 重新创建标签页以传递新参数
            const updatedTab: TabItem = {
                ...existingTab,
                children: (
                    <ErrorBoundary>
                        <LazyLoadComponent
                            LazyLoadComponent={LazyComp}
                            initialParams={params}
                        />
                    </ErrorBoundary>
                ),
                closable: existingTab.closable,
            };

            // 更新标签页列表
            const updatedTabs = tabs.map(tab =>
                tab.key === key ? updatedTab : tab
            );
            setTabs(updatedTabs);
            setActiveTab(key);
        } else {
            // 创建新标签页
            const LazyComp = menuItem.component;
            const label = menuItem.label;

            const newTab: TabItem = {
                key,
                label,
                children: (
                    <ErrorBoundary>
                        <LazyLoadComponent
                            LazyLoadComponent={LazyComp}
                            initialParams={params}
                        />
                    </ErrorBoundary>
                ),
                closable: key !== 'elementManagement',
            };

            setTabs([...tabs, newTab]);
            setActiveTab(key);
        }
    };
    const updateOpenMenu: any = menu((state: any) => state.updateOpenMenu);
    updateOpenMenu(handleMenuClick);
    // 预览页面，打开一个新的tab页签
    const openPreview = (key: string = 'preview', id: string, pageType: string) => {
        // 检查是否已打开该标签页
        const existingTab = tabs.find((tab) => tab.key === key);

        if (existingTab) {
            // 切换到已存在的标签页
            setActiveTab(key);
        } else {
            const newTab: TabItem = {
                key,
                label: key || '预览',
                children: (
                    <ErrorBoundary>
                        <React.Suspense fallback={<span />}>
                            <Preview id={id} pageType={pageType} />
                        </React.Suspense>
                    </ErrorBoundary>
                ),
                closable: key !== 'elementManagement',
            };
            setTabs([...tabs, newTab]);
            setActiveTab(key);
        }
    };
    const updateOpenPreview: any = menu((state: any) => state.updateOpenPreview);
    updateOpenPreview(openPreview);

    // 打开外部URL的标签页
    const updateOpenExternalUrl: any = menu((state: any) => state.updateOpenExternalUrl);
    // 打开外部URL的标签页
    const realOpenExternalUrl = useCallback((config: any) => {
        const { title, url, params } = config;

        // 构建iframe URL，如果有参数则拼接
        let iframeUrl = url;
        if (params && Object.keys(params).length > 0) {
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                queryParams.append(key, String(value));
            });
            const separator = url.includes('?') ? '&' : '?';
            iframeUrl = `${url}${separator}${queryParams.toString()}`;
        }

        // 生成唯一的标签页key
        const tabKey = `external_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // 检查是否已打开相同URL的标签页
        const existingTab = tabs.find((tab) => tab.key.startsWith('external_') &&
            (tab as any).url === iframeUrl);

        if (existingTab) {
            // 切换到已存在的标签页
            setActiveTab(existingTab.key);
        } else {
            // 创建新的iframe标签页
            const newTab: TabItem = {
                key: tabKey,
                label: title,
                children: (
                    <ErrorBoundary>
                        <iframe
                            src={iframeUrl}
                            style={{
                                width: '100%',
                                height: 'calc(100vh - 120px)',
                                border: 'none',
                                borderRadius: '8px'
                            }}
                            title={title}
                            allowFullScreen
                            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                        />
                    </ErrorBoundary>
                ),
                closable: true,
            };

            // 添加url属性以便后续查找
            (newTab as any).url = iframeUrl;

            setTabs([...tabs, newTab]);
            setActiveTab(tabKey);
        }
    }, [tabs]);

    updateOpenExternalUrl(realOpenExternalUrl);
    const updateCloseTab: any = menu((state: any) => state.updateCloseTab);

    // 关闭指定名称的标签页
    const realCloseTab = useCallback((tabLabel: string) => {
        // 根据标签页名称查找对应的tab
        const targetTab = tabs.find((tab) => tab.label === tabLabel);

        if (!targetTab) {
            console.warn(`未找到名称为"${tabLabel}"的标签页`);
            return;
        }

        // 首页不允许关闭
        if (targetTab.key === 'elementManagement') {
            console.warn(`"${tabLabel}"是首页，不允许关闭`);
            return;
        }

        // 过滤掉要关闭的标签页
        const newTabs = tabs.filter((tab) => tab.key !== targetTab.key);
        setTabs(newTabs);

        // 如果关闭的是当前活动的标签页
        if (activeTab === targetTab.key) {
            // 切换到前一个标签页
            const lastTab = newTabs[newTabs.length - 1];
            if (lastTab) {
                setActiveTab(lastTab.key);
                setSelectedMenu([lastTab.key]);
            }
        }

        console.log(`已关闭标签页: "${tabLabel}"`);
    }, [tabs, activeTab, setActiveTab, setSelectedMenu]);

    // setCloseTab(() => realCloseTab);
    updateCloseTab(realCloseTab);

    // 菜单展开/收起事件
    const handleOpenChange = (keys: string[]) => {
        setOpenKeys(keys);
    };

    // 标签页切换事件
    const handleTabChange = (key: string) => {
        setActiveTab(key);
        setSelectedMenu([key]);
    };

    // 标签页关闭事件
    const handleTabClose = (targetKey: string) => {
        // 首页不能关闭
        if (targetKey === 'elementManagement') {
            return;
        }

        // 过滤掉要关闭的标签页
        const newTabs = tabs.filter((tab) => tab.key !== targetKey);
        setTabs(newTabs);

        // 如果关闭的是当前活动的标签页
        if (activeTab === targetKey) {
            // 切换到前一个标签页
            const lastTab = newTabs[newTabs.length - 1];
            if (lastTab) {
                setActiveTab(lastTab.key);
                setSelectedMenu([lastTab.key]);
            }
        }
    };

    // 渲染菜单项（递归渲染）
    const renderMenuItems = (items: MenuItem[]): MenuProps['items'] => {
        return items.map((item) => {
            if (item.hide) {
                return null
            }
            // 如果有多级菜单，递归渲染
            if (item.children && item.children.length > 0) {
                return {
                    key: item.key,
                    icon: typeof item.icon === 'string' ? <span style={{ fontSize: '16px' }}>{item.icon}</span> : item.icon,
                    label: item.label,
                    children: renderMenuItems(item.children),
                    type: item.type as any,
                };
            }

            // 叶子节点
            return {
                key: item.key,
                icon: typeof item.icon === 'string' ? <span style={{ fontSize: '16px' }}>{item.icon}</span> : item.icon,
                label: item.label,
            };
        });
    };

    // 渲染标签页
    const tabItems = tabs.map((tab) => ({
        key: tab.key,
        label: tab.label,
        children: tab.children,
        closable: tab.closable,
    }));

    const { menuState } = menu(
        useShallow((state) => ({
            menuState: state.menuState
        }))
    );
    const changeMenuState = menu((state) => state.changeMenuState);

    // 初始化时展开所有菜单
    useEffect(() => {
        const expandableKeys = getAllExpandableKeys();
        setOpenKeys(expandableKeys);

        setTimeout(()=>{
            path && handleMenuClick({key:path} as any)
        })
    }, []);

    return (
        <DndProvider backend={HTML5Backend}>
            <div style={{ height: '100%' }}>
                {menuState && (
                    <React.Suspense fallback={<span />}>
                        {/* 菜单列表 */}
                        <div className={styles.leftMenu}>
                            <div className="closeIcon" onClick={() => changeMenuState(false)}></div>
                            <Menu
                                className={styles.leftTool1}
                                mode="inline"
                                selectedKeys={selectedMenu}
                                openKeys={openKeys}
                                onClick={handleMenuClick}
                                onOpenChange={handleOpenChange}
                                items={renderMenuItems(menuItems)}
                            />
                        </div>
                    </React.Suspense>
                )}
                {!menuState && (
                    <div className="menuClose" onClick={() => changeMenuState(true)}>
                        <div></div>
                    </div>
                )}
                <div style={{ height: '100%' }}>
                    <Tabs
                        className={styles.menuTabsBox}
                        type="editable-card"
                        activeKey={activeTab}
                        onChange={handleTabChange}
                        onEdit={(targetKey) => handleTabClose(targetKey as string)}
                        hideAdd
                        items={tabItems}
                        size="middle"
                    />
                </div>
            </div>
        </DndProvider>
    );
};

export default EditLayout;
