import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Row, Col, Tabs, Collapse, Input, Divider, Empty, Flex } from 'antd';
import { SearchOutlined, UpOutlined, AppstoreOutlined, PartitionOutlined, ApiOutlined, FunctionOutlined } from '@ant-design/icons';
import { useDebounceFn } from 'ahooks';
import DragMenuItem from './DragMenuItem';
import components, { SysComItem, getComponentMenu } from '@/config/components';
import styles from './index.module.less';
import { componentModel } from '@/stores/menuStore';
import VariableList from '@/layout/components/Variable/VariableList';
import OutlinePanel from '@/layout/components/OutlinePanel';
import ApiList from '../ApiList/ApiList';
import { crossApiUserInfo } from '@/stores/crossapiStore';

/**
 * 组件
 */
const ComponentPanel = () => {
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const customRef = useRef<{ reload: () => void }>();
    const [keyword, setKeyword] = useState('');
    const [activeKeys, setActiveKeys] = useState<string[]>([]);
    const [tabKey, setTabKey] = useState<string>('system');
    const [list, setList] = useState<Array<{ key: string; label: string; children: JSX.Element }>>([]);
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
                                            <DragMenuItem {...subItem} />
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
    // 组件搜索
    const { run } = useDebounceFn(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const name = event.target.value;
            setKeyword(name);
        },
        { wait: 500 },
    );
    // 页签
    const tabs = useMemo(
        () => [
            {
                key: 'system',
                label: (
                    <Flex vertical justify="center" align="center" gap={5}>
                        <AppstoreOutlined style={{ fontSize: 16 }} />
                        <span style={{ fontSize: 12 }}>元素</span>
                    </Flex>
                ),
                children: (
                    <>
                        {tabKey === 'system' && (
                            <>
                                <Input placeholder="输入元素名称查询"  allowClear suffix={<SearchOutlined />} onChange={run} />
                                <Divider style={{ margin: '12px 0 0 0' }} />
                            </>
                        )}
                        <Collapse
                            className="elementCont"
                            style={{ height: list.length > 0 ? 'calc(100% - 42px)' : '', overflow: 'hidden auto' }}
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
        ],
        [list, activeKeys],
    );

    // 切换时，刷新自定义组件
    const handleTabChange = (key: string) => {
        setTabKey(key);
        if (key === 'custom') {
            customRef.current?.reload();
        }
    };

    const showComponent: boolean = componentModel((state: any) => state.showComponent);
    const setComponentState = componentModel((state: any) => state.setComponentState);
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
                    defaultActiveKey={tabs[0].key}
                    tabPosition={'left'}
                    onChange={handleTabChange}
                    items={tabs}
                />
            )}
        </div>
    );
};

export default ComponentPanel;
