import React, { lazy, useState, useEffect } from 'react';
import { Menu as _Menu } from 'antd';
import styles from './index.module.less';
import { menu } from '@/stores/menuStore';
import { useShallow } from 'zustand/react/shallow';
/**
 * 左侧面板类型
 */
const menuList = [
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
                    },
                    {
                        label: '业务组件管理',
                        key: 'businessComponentList',
                    },
                    {
                        label: '模板管理',
                        key: 'templateManagement',
                    },
                ],
            },
            {
                label: '服务编排',
                key: 'serviceOrchestration',
                icon: <div className="serviceOrchestration" />,
            },
            {
                label: '应用编排',
                key: 'applicationOrchestration',
                icon: <div className="applicationOrchestration" />,
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
                    {
                        label: '应用看板',
                        key: 'applicationDashboard',
                    },
                    {
                        label: '应用地图',
                        key: 'applicationMap',
                    },
                    {
                        label: '应用列表',
                        key: 'applicationList',
                    },
                ],
            },
            {
                label: '审核管理',
                key: 'auditManagement',
                icon: <div className="auditManagement" />,
            },
        ],
    },
];
let defaultOpenKeys: any = [];
let defaultSelectedKeys: any = [];
/**
 * 生成左侧组件列表
 */
const Menu = () => {
    const changeSelectedMenu = menu((state) => state.changeSelectedMenu);
    const { selectedMenuKey, openKeys } = menu(
        useShallow((state) => ({
            selectedMenuKey: state.selectedMenuKey,
            openKeys: state.openKeys
        }))
    );
    const changeMenuState = menu((state) => state.changeMenuState);
    const changeOpenKeys = menu((state) => state.changeOpenKeys);
    const MenuChange = (menu: any) => {
        changeSelectedMenu(menu.key);
    };
    const openChange = (menu: any) => {
        changeOpenKeys(menu);
    };
    const getMenuKeys = (menuList: any) => {
        for (let i = 0; i < menuList.length; i++) {
            if (menuList[i].children && menuList[i].children.length > 0) {
                defaultOpenKeys.push(menuList[i].key);
                getMenuKeys(menuList[i].children);
            } else {
                if (defaultSelectedKeys.length == 0) {
                    defaultSelectedKeys.push(menuList[i].key);
                    changeSelectedMenu(menuList[i].key);
                }
            }
        }
    };
    useEffect(() => {
        if (defaultSelectedKeys.length == 0) {
            getMenuKeys(menuList);
            changeOpenKeys(defaultOpenKeys);
        } else {
            defaultSelectedKeys = [selectedMenuKey];
            defaultOpenKeys = openKeys;
        }
    }, []);
    return (
        <>
            <div className={styles.leftMenu}>
                {/* <div
        className={styles.leftToolTitle}
        onClick={() => changeMenuState(false)}>
          应用集成平台
          <img className={styles.tooltipIcon} src={arrowDown} />
        </div> */}
                <div className="closeIcon" onClick={() => changeMenuState(false)}></div>
                <_Menu
                    className={styles.leftTool1}
                    items={menuList}
                    mode="inline"
                    defaultOpenKeys={defaultOpenKeys}
                    defaultSelectedKeys={defaultSelectedKeys}
                    onSelect={MenuChange}
                    onOpenChange={openChange}
                />
            </div>
        </>
    );
};

export default Menu;
