import { create } from 'zustand';
import { produce } from 'immer';

// 外部URL打开接口
export interface ExternalTabConfig {
    title: string;
    url: string;
    params?: Record<string, any>;
}

interface menuInterface {
    selectedMenuKey: string;
    menuState: boolean;
    openKeys: any;
    fullScreenState: boolean;
    changeSelectedMenu: (payload: any) => void;
    changeMenuState: (payload: any) => void;
    changeOpenKeys: (payload: any) => void;
    updateOpenPreview: (payload: any) => void;
    openPreview: (type: string, id: string, pageType: string) => void;
    updateOpenMenu: (payload: any) => void;
    openMenu: (payload: { key: string; params?: any }) => void;
    openExternalUrl: (config: ExternalTabConfig) => void;
    updateOpenExternalUrl: (func: (config: ExternalTabConfig) => void) => void;
    closeTab: (tabLabel: string) => void;
    updateCloseTab: (func: (tabLabel: string) => void) => void;
    setFullScreenState: (payload: any) => void;
}
export const menu = create<menuInterface>((set: any) => ({
    selectedMenuKey: '',
    menuState: true,
    fullScreenState: false,
    openKeys: [],
    changeSelectedMenu: (menuKey: string) => {
        set(
            produce((state: any) => {
                state.selectedMenuKey = menuKey;
            }),
        );
    },
    changeMenuState: (menuState: boolean) => {
        set(
            produce((state: any) => {
                state.menuState = menuState;
            }),
        );
    },
    setFullScreenState: (fullScreenState: boolean) => {
        set(
            produce((state: any) => {
                state.fullScreenState = fullScreenState;
            }),
        );
    },
    changeOpenKeys: (openKeys: any) => {
        set(
            produce((state: any) => {
                state.openKeys = openKeys;
            }),
        );
    },
    openPreview: () => {},
    updateOpenPreview: (func: any) => {
        set(
            produce((state: any) => {
                state.openPreview = func;
            }),
        );
    },
    openMenu: () => {},
    updateOpenMenu: (func: any) => {
        set(
            produce((state: any) => {
                state.openMenu = func;
            }),
        );
    },
    openExternalUrl: () => {},
    updateOpenExternalUrl: (func: (config: ExternalTabConfig) => void) => {
        set(
            produce((state: any) => {
                state.openExternalUrl = func;
            }),
        );
    },
    closeTab: () => {},
    updateCloseTab: (func: (tabLabel: string) => void) => {
        set(
            produce((state: any) => {
                state.closeTab = func;
            }),
        );
    },
}));
interface componentMenu {
    showComponent: boolean;
    showAttribute: boolean;
    setComponentState: (showState: boolean) => void;
    setAttributeState: (showState: boolean) => void;
}
export const componentModel = create<componentMenu>((set: any) => ({
    showComponent: true,
    showAttribute: false,
    setComponentState: (showState: boolean) => {
        set(
            produce((state: any) => {
                state.showComponent = showState;
            }),
        );
    },
    setAttributeState: (showState: boolean) => {
        set(
            produce((state: any) => {
                state.showAttribute = showState;
            }),
        );
    },
}));
