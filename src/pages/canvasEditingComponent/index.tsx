import React, { lazy, useEffect, useState } from 'react';
import { Splitter } from 'antd';
import { menu, componentModel } from '@/stores/menuStore';
import { apiListInfo } from '@/stores/apiListStore';
import { crossApiUserInfo } from '@/stores/crossapiStore';
import SpinLoading from '@/components/SpinLoading';
import { AppProvider, useAppContext } from '@/utils/AppProvider';

const ComponentPanel = lazy(() => import('../../layout/components/Menu/ComponentPanel'));
const ConfigPanel = lazy(() => import('../../layout/components/ConfigPanel/ConfigPanel'));
const Editor = lazy(() => import('@/pages/editor/editor'));
import request from '@/utils/request';
import { ComponentTempData } from '../businessComponentManage/businessComponentMangeTypes';
/**
 * 编辑器布局组件
 */
interface configInterface {
    config: ComponentTempData;
    id: string;
    backComponentPage: (state: string) => void;
    confiEventbusTem: (data: any) => void;
}
const BusinessComponentConfig = (config: configInterface) => {
    const initLeftSize = 260
    const menuState = menu((state) => state.menuState);
    const [sizes, setSizes] = useState<(number | string)[]>([ initLeftSize, window.innerWidth -  initLeftSize - (menuState ? 180 : 0), 0]);
    const showComponent = componentModel((state) => state.showComponent);
    const [mode, setMode] = useState('edit');
    const _setMode = (state: string) => {
        setMode(state);
    };
    useEffect(() => {
        if (mode === 'preview') {
            setSizes([0, window.innerWidth - (menuState ? 180 : 0), 0]);
        } else {
            setSizes([showComponent ?  initLeftSize : 0, window.innerWidth - (showComponent ?  initLeftSize : 0) - (menuState ? 180 : 0), 0]);
        }
    }, [mode, menuState, showComponent]);
    const _userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const setApiList = apiListInfo((state: any) => state.setApiList);
    const getApiList = async () => {
        const params = {
            provId: _userInfo.provinceId === '0000' ? '00030089' : (_userInfo.provinceId || '00030021'),
        };
        const { beans } = await request.post('/csf/appInterface/abilityArrangeList', { params: params });
        setApiList(beans);
    };
    useEffect(() => {
        getApiList();
    }, []);
    const getOutParams = (interfaceCode: string) => {
        const params: object = {
            provId: '',
            interfaceCode: interfaceCode,
        };
        request.post('/csf/appInterface/abilityArrangeDetails', params);
    };
    // 模式切换，会导致子组件重新渲染
    return (
        <AppProvider pageType="YWZJGL" config={config} mode={mode} setMode={_setMode}>
            <div className={menuState ? 'content' : 'content w100'}>
                <div className="editContent">
                    <Splitter onResize={setSizes}>
                        {config?.config?.typeZDY !== 'ZDY' && (
                            <Splitter.Panel min={200} max={370}
                                size={sizes[0]} className={showComponent ? '' : 'closeComponentSplitter'}>
                                <React.Suspense fallback={<SpinLoading />}>
                                    <ComponentPanel />
                                </React.Suspense>
                            </Splitter.Panel>
                        )}
                        <Splitter.Panel size={sizes[1]}>
                            <React.Suspense fallback={<SpinLoading />}>
                                <Editor typeZDY={config?.config?.typeZDY} />
                            </React.Suspense>
                        </Splitter.Panel>
                        <Splitter.Panel
                            resizable={false}
                            size={sizes[2]}
                            min={sizes[2]}
                            className={mode == 'preview' ? 'configPanelBox hide' : 'configPanelBox'}
                        >
                            <React.Suspense fallback={<SpinLoading />}>
                                <ConfigPanel />
                            </React.Suspense>
                        </Splitter.Panel>
                    </Splitter>
                </div>
            </div>
        </AppProvider>
    );
};

export default BusinessComponentConfig;
