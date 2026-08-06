import React, { useEffect, useRef, useState } from 'react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import ComponentTemp from './componentTemp'; // 业务组件模板
import ApplicationTemp from './applicationTemp'; // 应用模板
import styles from './index.module.less';
import { crossApiUserInfo } from '@/stores/crossapiStore';
import CanvasEditingComponent from '@/pages/canvasEditingComponent/index';
import { componentTempData, appTempData } from './templateManageTypes';
import PageCanvas from '@/pages/applicationOrchestration/pageCanvas';
import request from '@/utils/request';
interface AppTemptypeData {
    pId: string;
    typeLevel: string;
    appTypeCategory: string;
    appTypeId: string;
    appTypeName: string;
}

const { TabPane } = Tabs;

const onChange = (key: string) => {
    console.log(key);
};

const Page: React.FC = () => {
    // 获取用户信息
    const userInfo = crossApiUserInfo((state) => state.userInfo);
    const [pagePos, setPagePos] = useState<string>('0');
    const [appTypeList, setAppTypeList] = useState<AppTemptypeData[]>([]);
    const [activeKey, setActiveKey] = useState('1'); // 使用 useState 管理 tab页签的默认选中

    //业务组件
    const [businessOp, setbusinessOptions] = useState<componentTempData>({
        provId: '',
        serviceTypeId: '',
        staffId: '',
        componentName: '', // 模板名称
        componentDesc: '', // 业务组件描述
        businessId: '', // 业务分类
        serviceLink: '', // 服务环节
        componentCategory: '1', //模板类别
        id: '',
        dataType: '3',
        componentPicture: '', //组件缩略图
    });

    //应用模板
    const [applyOp, setapplyOptions] = useState<appTempData>({
        provId: '',
        serviceTypeId: '',
        staffId: '',
        appName: '', // 模板名称
        appCategory: '1', // 应用类别
        appTypeId: '', // 应用形式
        belongModule: '', // 归属模块
        sceneType: '1', // 展示形式（方案类型）
        appDesc: '', // 应用备注
        // id: '',
        dataType: '3',
        appPicture: '', //应用缩略图
    });
    const [updateConfig, setConfig] = useState({});

    // 跳转到画布
    const jumpEditorPage1 = (pos: string, data: componentTempData) => {
        setbusinessOptions((prev) => ({ ...prev, ...data }));
        setPagePos(pos);
    };
    const jumpEditorPage2 = (pos: string, data: any) => {
        setapplyOptions((prev) => ({ ...prev, ...data }));
        setPagePos(pos);
        setConfig({
            config: {
                ...data,
                serviceTypeId: userInfo.serviceTypeId,
            },
            id: data.id,
            backComponentPage: () => {},
        });
    };

    //组件编辑保存
    const jumpEditorPageBUs = (data: componentTempData) => {
        setbusinessOptions((prev) => ({ ...prev, ...data }));
    };

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                request
                    .post('/appType/queryAppTypeList', {})
                    .then((res) => {
                        const appTypeListBeans = res.beans;
                        setAppTypeList((pev) => {
                            return appTypeListBeans.map((item: AppTemptypeData) => {
                                return {
                                    appTypeCategory: item.appTypeCategory,
                                    appTypeId: item.appTypeId,
                                    appTypeName: item.appTypeName,
                                    pId: item.pId,
                                    typeLevel: item.typeLevel,
                                };
                            });
                        });
                    })
                    .catch((err) => {});
            } catch (error) {
                console.error('获取选项数据失败:', error);
            }
        };
        fetchOptions();
    }, []);

    useEffect(() => {
        // 当 app 状态更新后，这个钩子会执行，能拿到最新值
        console.log('状态更新后：', businessOp);
        console.log('状态更新后2222：', applyOp);
        // 赋值后会输出 {AA:'1', BB:'2'}
    }, [businessOp, applyOp]); // 依赖项为 app，只有 app 变化时才执行

    // 新增跳转页面
    const addComponentEvent = (pos: string) => {
        setPagePos('0');
        setActiveKey('1');
    };

    //页面返回
    const backApplyPageEvent = () => {
        setPagePos('0');
        setActiveKey('2');
    };

    const items: TabsProps['items'] = [
        {
            label: '业务组件模板',
            key: '1',
            children: (
                <div style={{height: '100%'}}>
                    <ComponentTemp userInfo={userInfo} onConfirmEvent={jumpEditorPage1} />
                </div>
            ),
        },
        {
            label: '应用模板',
            key: '2',
            children: (
                <div style={{height: '100%'}}>
                    <ApplicationTemp userInfo={userInfo} onConfirmEvent={jumpEditorPage2} />
                </div>
            ),
        },
    ];

    return (
        <div className={`${styles.modeManagement} modeManagementBox`}>
            {pagePos === '0' && <Tabs defaultActiveKey={activeKey} items={items} onChange={onChange} />}
            {/* 业务组件模板 */}
            {pagePos === '1' && (
                <CanvasEditingComponent
                    config={businessOp}
                    id={businessOp.id ? businessOp.id : ''}
                    backComponentPage={addComponentEvent}
                    confiEventbusTem={jumpEditorPageBUs}
                />
            )}
            {/* 应用模板 */}
            {pagePos === '2' && <PageCanvas baseConfig={updateConfig} pageCase="2" appTypeList={appTypeList} backApplyPage={backApplyPageEvent} />}
        </div>
    );
};
export default Page;
