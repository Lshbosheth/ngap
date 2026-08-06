import React, { useRef, lazy, useEffect, useImperativeHandle, useState, forwardRef, RefObject } from 'react';
import { Splitter } from 'antd';
import { menu, componentModel } from '@/stores/menuStore';
import { apiListInfo } from '@/stores/apiListStore';
import { crossApiUserInfo } from '@/stores/crossapiStore';
import SpinLoading from '@/components/SpinLoading';
import { AppProvider } from '@/utils/AppProvider';
import Editor, { EditorRef } from '@/pages/editor/editor';

const ComponentPanel = lazy(() => import('../../../layout/components/Menu/ComponentPanel'));
const ConfigPanel = lazy(() => import('../../../layout/components/ConfigPanel/ConfigPanel'));
import request from '@/utils/request';
/**
 * 编辑器布局组件
 */
interface processPreviewInterface {
    pageData?: any;
    _mode: string;
    currentNodeId?: string | number | undefined;
}
const ProcessPreview = forwardRef(({ _mode, pageData, currentNodeId }: processPreviewInterface, ref: any) => {
    const menuState = menu((state) => state.menuState);
    const [sizes, setSizes] = useState<(number | string)[]>([280, window.innerWidth - 280 - (menuState ? 180 : 0), 0]);
    const showComponent = componentModel((state) => state.showComponent);
    const [mode, setMode] = useState(_mode);
    const _setMode = (state: string) => {
        setMode(state);
    };
    useEffect(() => {
        // 使用 setTimeout 来延迟状态更新，避免在渲染过程中直接更新其他组件
        const timer = setTimeout(() => {
            if (mode === 'preview') {
                setSizes([0, window.innerWidth - (menuState ? 180 : 0), 0]);
            } else {
                setSizes([showComponent ? 280 : 0, window.innerWidth - (showComponent ? 280 : 0) - (menuState ? 180 : 0), 0]);
            }
        }, 0);

        return () => clearTimeout(timer);
    }, [mode, menuState, showComponent]);
    const _userInfo = crossApiUserInfo((state: any) => state.userInfo);
    const setApiList = apiListInfo((state: any) => state.setApiList);
    const getApiList = async () => {
        let params = {
            provId: _userInfo.provinceId === '0000' ? '00030089' : (_userInfo.provinceId || '00030021'),
        };
        let { beans } = await request.post('/csf/appInterface/abilityArrangeList', { params: params });
        setApiList(beans);
    };
    useEffect(() => {
        getApiList();
    }, [_userInfo.provinceId]);
    const pageRef: RefObject<EditorRef> = useRef<EditorRef>(null);
    useImperativeHandle(ref, () => ({
        getData: () => {
            return {
                pageData: pageRef.current?.getData?.(),
                nodeId: currentNodeId,
            };
        },
    }));
    // 模式切换，会导致子组件重新渲染
    return (
        <AppProvider pageType="YWZJGL" config={{}} pageData={pageData} mode={mode} setMode={_setMode}>
            <div className={menuState ? 'content' : 'content w100'}>
                <div className="editContent">
                    <Splitter onResize={setSizes}>
                        {mode === 'edit' && (
                            <Splitter.Panel size={sizes[0]} className={showComponent ? '' : 'closeComponentSplitter'}>
                                <React.Suspense fallback={<SpinLoading />}>
                                    <ComponentPanel />
                                </React.Suspense>
                            </Splitter.Panel>
                        )}
                        <Splitter.Panel size={sizes[1]}>
                            <React.Suspense fallback={<SpinLoading />}>
                                <Editor ref={pageRef} typeZDY="" type="data" />
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
});

export default ProcessPreview;
