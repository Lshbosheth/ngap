import React, { useRef, createContext, useContext, ReactNode, useState } from 'react';
import { createCanvasPageStore } from '../stores/canvasPageStore';
// 创建Context
const pageStoreContext = createContext<any | undefined>(undefined);
// 2. 创建Provider组件
interface AppProviderProps {
    children: ReactNode;
    pageType: string;
    config: any;
    mode: string;
    setMode: any;
    pageData?: any;
}
export const AppProvider: React.FC<AppProviderProps> = ({ children, pageType = 'YYBPZPS', config = {}, pageData = {}, mode = 'edit', setMode }) => {
    const pageStore = useRef<any>();
    if (!pageStore.current) {
        pageStore.current = createCanvasPageStore(config, window.zxhtest, pageData);
        window.zxhtest++;
    }
    // 弹窗宽度状态
    const [modalWidth, setModalWidth] = useState(800);
    const [modalLeft, setModalLeft] = useState(0);
    const [configPanelPinned, setConfigPanelPinned] = useState(false);
    return (
        <pageStoreContext.Provider
            value={{
                pageStore: pageStore.current,
                pageType: pageType,
                mode: mode,
                setMode: setMode,
                modalWidth,
                setModalWidth,
                modalLeft,
                setModalLeft,
                configPanelPinned,
                setConfigPanelPinned,
            }}
        >
            {children}
        </pageStoreContext.Provider>
    );
};
// 3. 创建自定义Hook便于使用
export const useAppContext = () => {
    const context = useContext(pageStoreContext);
    if (context === undefined) {
        throw new Error('useAppContext必须在AppProvider内使用');
    }
    return context;
};
