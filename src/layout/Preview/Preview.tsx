// 装配式预览页面
import React, { useState } from 'react';
import styles from './index.module.less';
import { crossApiUserInfo } from '@/stores/crossapiStore';

import BaseCanvasPreview from './BaseCanvasPreview/BaseCanvasPreview';
import PreviewPageCanvas from '@/pages/applicationOrchestration/pageCanvas/processCanvasPage/components/ProcessPage/ProcessPage';

import { menu } from '@/stores/menuStore';
import SpinLoading from '@/components/SpinLoading';
import { AppProvider } from '@/utils/AppProvider';

interface SearchFormProps {
    id: string;
    pageType: string;
}

// 接收组件属性，强类型约束外部传参
const PageCanvas: React.FC<SearchFormProps> = ({ id, pageType }) => {
    const userInfo = crossApiUserInfo((state: any) => state.userInfo);
    //左侧导航栏展开收起状态
    const menuState = menu((state) => state.menuState);
    const [mode, setMode] = useState('preview');
    const _setMode = (state: string) => {
        setMode(state);
    };
    const _config = {
        backComponentPage: () => {},
        confiEventbusTem: () => {},
        id: id,
        config: {
            provId: userInfo.provinceId,
            serviceTypeId: userInfo.serviceTypeId,
        },
    };
    // 模式切换，会导致子组件重新渲染
    return (
        <AppProvider pageType={pageType} config={_config} mode={mode} setMode={_setMode}>
            <div className={styles.content}>
                {/* 主编辑区 */}
                <div className={styles.editContent}>
                    {/* 左侧组件 */}
                    <React.Suspense fallback={<SpinLoading />}>
                        {/* 步骤引导预览页面 */}
                        {pageType === 'Step-base' && <PreviewPageCanvas />}
                        {/* 装配式预览页面 */}
                        {(pageType === 'yy-base' || pageType == 'ywzj') && <BaseCanvasPreview />}
                        {/* 信息卡片预览页面 */}
                        {/* {baseConfig.config.sceneType === 'card' && <CardCanvasPage />} */}
                    </React.Suspense>
                </div>
            </div>
        </AppProvider>
    );
};

// 导出组件，供其他模块引入使用
export default PageCanvas;
