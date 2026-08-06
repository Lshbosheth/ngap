import React, { lazy, useEffect, useState } from 'react';
import { Splitter } from 'antd';
import { menu, componentModel } from '@/stores/menuStore';
import { apiListInfo } from '@/stores/apiListStore';
import { crossApiUserInfo } from '@/stores/crossapiStore';
import SpinLoading from '@/components/SpinLoading';
import { useAppContext } from '@/utils/AppProvider';

const ComponentPanel = lazy(() => import('@/pages/applicationOrchestration/pageCanvas/components/ComponentPanelAO'));
const ConfigPanel = lazy(() => import('@/layout/components/ConfigPanel/ConfigPanel'));
const Editor = lazy(() => import('@/pages/editor/editor'));
import request from '@/utils/request';
import style from './index.module.less';
/**
 * 编辑器布局组件
 */
const BusinessComponentConfig = (props: any) => {
    const { mode } = useAppContext();
    const menuState = menu((state) => state.menuState);
    const [sizes, setSizes] = useState<(number | string)[]>([280, window.innerWidth - 280 - (menuState ? 180 : 0), 0]);
    const showComponent = componentModel((state) => state.showComponent);
    useEffect(() => {
        if (mode === 'preview') {
            setSizes([0, window.innerWidth - (menuState ? 180 : 0), 0]);
        } else {
            setSizes([0, window.innerWidth - (menuState ? 180 : 0), 0]);
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

    // 模式切换，会导致子组件重新渲染
    return (
        <div className={menuState ? style.content : style.closeMenuContent}>
            <div className={style.editContent}>
                <Splitter onResize={setSizes}>
                    {/* <Splitter.Panel size={sizes[0]} className={showComponent ? '' : 'closeComponentSplitter'}>
                        <React.Suspense fallback={<SpinLoading />}>
                            <ComponentPanel />
                        </React.Suspense>
                    </Splitter.Panel> */}
                    <Splitter.Panel size={sizes[1]}>
                        <React.Suspense fallback={<SpinLoading />}>
                            <Editor pageLoaded={props.pageLoaded} />
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
    );
};

export default BusinessComponentConfig;
