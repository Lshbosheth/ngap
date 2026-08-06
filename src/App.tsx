import React, { useState, useEffect, useRef } from 'react';
import * as antd from 'antd';
import { StyleProvider, legacyLogicalPropertiesTransformer, createCache } from '@ant-design/cssinjs';
import { message as messageStatic, ConfigProvider, Modal, App as AntdApp, theme, Layout } from 'antd';
import { message } from '@/utils/AntdGlobal';
import AntdGlobal from '@/utils/AntdGlobal';
import crossAPI from './utils/crossAPI';
import locale from 'antd/locale/zh_CN';
import * as antdIcons from '@ant-design/icons';
import * as echarts from 'echarts';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import relativeTime from 'dayjs/plugin/relativeTime';
import useMessageListener from './utils/useMessageListener';
import crossAPIDistributeMessages from './utils/crossAPIDistributeMessages';
import { execInterface } from './utils/apiUtilForInterface';
import { isLocalMockMode } from './mock/localMock';

// 日期格式化
dayjs.extend(relativeTime);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.locale('zh-cn');
import './App.less';
import request from './utils/request';
import { crossApiUserInfo, CrossApiUserInfoState } from './stores/crossapiStore';
import { publictData } from './utils/appMenuData';
import { getUrlParams } from './utils/util';
import { LogoutFun } from './utils/Logout';
// 业务分类数据管理
import { businessDataListInfo } from '@/stores/businessCategoryStore';
import { appTypeListInfo } from '@/stores/appTypeListStore';
import { initChama } from '@/utils/commonGdp';

import EditLayout from '@/layout/EditLayout';
import Router from './router';
import ErrorBoundary from './ErrorBoundary';
//默认隐藏客户信息栏
try {
    crossAPI.getContact('changeClientInfoBar', { operType: 0 }, function (data: any) { });
} catch (e) {
    console.log(e);
}

const cache = createCache();

// 挂载全局组件
window.React = React;
window.antd = antd;
window.antdIcons = antdIcons;
window.echarts = echarts;
window.execInterface = execInterface
interface UserInfoData {
    roleInfos: string[];
    permissionInfos: string[];
    isAdmin: string;
    staffId: string;
    staffName: string;
    serviceTypeId: string;
    selfServiceTypeId: string;
    initServiceTypeId: string;
    provinceId: string;
    proviceId: string;
    toolsStaffSelfServiceTypeId: string;
    addressFlag: string;
    isTopShow: boolean;
    iframeName: string;
    eHumanRsNo?: string;
    orgaName?: string;
    personLabel?: string;
    accountType?: string;
}
// 初始化插码工具记录日志
initChama();
// App组件
function App() {
    // 使用自定义hook监听message事件,处理crossAPI消息
    useMessageListener((event: MessageEvent) => {
        // 获取message返回的数据
        let dataJson: any;
        if (typeof event.data === 'string') {
            try {
                dataJson = JSON.parse(event.data);
            } catch (e) {
                dataJson = event.data;
            }
        } else {
            dataJson = event.data;
        }
        // 获取页面链接中的URL参数 区分是否为独立入口
        const urlParams: any = getUrlParams();
        if (!urlParams.ticket) {
            return
        }
        crossAPIDistributeMessages(dataJson)

    });

    // 通过crossAPI获取的省份信息
    const setCrossAPIUserInfo = crossApiUserInfo((state) => state.setCrossAPIUserInfo);
    const [hasUserInfo, setHasUserInfo] = useState(false);
    const getUserInfo = async () => {
        // 默认调试信息  //此代码禁止提交正式分支
        let userInfoData:UserInfoData = {
            staffId: '',
            staffName: '',
            serviceTypeId: 'jsytck',
            selfServiceTypeId: '',
            initServiceTypeId: '',
            provinceId: '',
            proviceId: '',
            toolsStaffSelfServiceTypeId: '',
            addressFlag: '',
            isTopShow: false,
            isAdmin: '',
            roleInfos:[],
            permissionInfos: [],
            iframeName: '应用集成平台',
            // E开头工号
            eHumanRsNo: '',
            orgaName: "", //组织机构名称
            personLabel: "", //人员标识,枚举值
            accountType: "",//账号类别
        };
        if (import.meta.env.VITE_ENV_TYPE_PROD === 'true') {
            try {
                const data:any = await new Promise((resolve) => {
                    crossAPI.getIndexInfo(resolve);
                });
                 //备用逻辑
                let addressFlag = window.location.href.indexOf('cs.cmos:8080') > -1 ? 'test' : 'prd';
                data.userInfo.isTopShow = false;
                const { serviceTypeId2ProvId } = publictData;
                const userInfo = (data as CrossApiUserInfoState).userInfo;
                const urlName = data.iframe?.title || ''; // 页签打开名称
                userInfoData = JSON.parse(JSON.stringify(userInfo));
                userInfoData.roleInfos = data?.userInfo?.rolesData?.map((item: any) => item.roleId) || [];
                userInfoData.eHumanRsNo = data?.userInfo?.eHumanRsNo|| "";
                userInfoData.orgaName = data?.userInfo?.orgaName|| "";
                userInfoData.personLabel = data?.userInfo?.personLabel|| "";
                userInfoData.accountType = data?.userInfo?.accountType|| "";
                if (userInfoData.staffId) {
                    try {
                        let permissionResponse = await request.post('/appTenant/getUserFunctionPermList', {
                            params: {
                                staffId: userInfoData.staffId
                            }
                        });

                        // 处理功能权限数据并封装到 store 中
                        if (permissionResponse?.bean) {
                            let permissions = Array.isArray(permissionResponse?.bean?.permissionInfos)
                                ? permissionResponse?.bean?.permissionInfos
                                : permissionResponse?.bean?.permissionInfos || [];

                            userInfoData.permissionInfos = permissions;
                            addressFlag = permissionResponse?.bean?.isTest === '1'?'test' : 'prd';
                            userInfoData.addressFlag = permissionResponse?.bean?.isTest === '1'?'test' : 'prd';
                            // console.log('员工功能权限已更新到 store:', permissions);
                        }
                    } catch (permissionError) {
                        // console.warn('查询员工功能权限失败:', permissionError);
                        // 权限查询失败不影响主流程
                    }
                }
                let provId = userInfo.provinceId;
                if(!userInfoData.isAdmin &&  userInfoData.isAdmin !== '0'){
                    let textNum = '020283001'
                    let prdNum = '020263004'
                    userInfoData.isAdmin = '0'
                    if(userInfoData?.roleInfos.length>0){
                        //测试
                        if (userInfoData.addressFlag == 'test' && userInfoData?.roleInfos.includes(textNum)) {
                            userInfo.isAdmin = '1'
                        }
                        //生产
                        if (userInfoData.addressFlag == 'prd' && userInfoData?.roleInfos?.includes(prdNum)) {
                            userInfo.isAdmin = '1'
                        };
                    }
                }


                if (userInfo.initServiceTypeId) {
                    provId = serviceTypeId2ProvId[userInfo.initServiceTypeId];
                    userInfoData.toolsStaffSelfServiceTypeId = userInfo.initServiceTypeId;
                } else if (userInfo.selfServiceTypeId) {
                    provId = serviceTypeId2ProvId[userInfo.selfServiceTypeId];
                    userInfoData.toolsStaffSelfServiceTypeId = userInfo.selfServiceTypeId;
                } else {
                    userInfoData.toolsStaffSelfServiceTypeId = userInfo.serviceTypeId;
                }
                if (!provId) {
                    provId = userInfo.provinceId;
                }
                userInfoData.provinceId = provId;
                userInfoData.proviceId = provId;
                userInfoData.addressFlag = addressFlag;
                userInfoData.iframeName = urlName;
            } catch (e) {
                console.log(e);
            }
        }else{

        }
        setCrossAPIUserInfo(userInfoData);
        setHasUserInfo(true);
    };
    const [fixedSessioned, setfixedSessioned] = useState('N');
    const timerRef = useRef<NodeJS.Timeout>();
    //封装自动退出
     window.onbeforeunload = function (event) {
         LogoutFun({logoutType:0});
    }
     const handleBeforeUnload = (e:any) => {
        // 2. 同时调用你的 logout（但大概率执行不完）
         LogoutFun({logoutType:0});
    };
    useEffect(() => {
        if(fixedSessioned === 'Y'){
             // 设置定时器
            timerRef.current = setTimeout(() => {
                try {
                    LogoutFun({logoutType:1});
                    if (timerRef.current) {
                        clearTimeout(timerRef.current);
                    }
                }catch (error) {
                    console.log('登出请求sb');
                }
            }, 43200000);
        }
    }, [fixedSessioned]);
    // 业务分类状态管理
    const setBusinessDataList = businessDataListInfo((state: any) => state.setBusinessDataList);
    // 查询业务分类
    const queryBussinessList = async () => {
        await request
            .post('/appComponentBusiness/queryComponentBusinessList', { params: { provId: '' } })
            .then((data) => {
                setBusinessDataList(data.beans);
            })
            .catch((err) => {
                return err;
            });
    };
    // 查询应用分类
    const setAppTypeList = appTypeListInfo((state: any) => state.setAppTypeList);
    const queryAppTypeList = () => {
        request.post('/appType/queryAppTypeList', { params: {} }).then((res) => {
            if (res.beans && res.beans.length) {
                setAppTypeList(res.beans);
            }
        });
    };

    // 查询登录信息封装用户基本信息
    const getLoginUserInfo = async (urlParams:any) => {

        // 调用登录信息获取接口，传递URL参数
        try {
            // {"params":{"ticket":"uY08jq1MzRD4Et0FxjyctHDgVZP8SHUb/OAfMQji+gpzgcsUQ6at5+Po7pNA/0KnkNymPMq/6Hu4ABNwyW6odzwqbWeRFy2No7GgafVWcb0="}}
            const loginResponse = await request.post('/appTenant/loginAuthBySerialno', {
                params: {
                    ...urlParams,
                }
            });
            // 处理接口返回数据，将 staffId 和 fixedSession 封装到 store 中
            if (loginResponse?.bean) {
                const { staffId, fixedSession } = loginResponse.bean;
                //备用逻辑
                let addressFlag = window.location.href.indexOf('cs.cmos:8080') > -1 ? 'test' : 'prd';
                if (staffId || fixedSession) {
                    setCrossAPIUserInfo({
                        isTopShow: true,
                        staffId: staffId || '',
                        fixedSession: fixedSession || ''
                    });
                    setfixedSessioned(fixedSession || '');
                    // console.log('登录信息已更新到 store:', { staffId, fixedSession });

                    // 如果获取到 staffId，则查询员工功能权限
                    if (staffId) {
                        try {
                            let permissionResponse = await request.post('/appTenant/getUserFunctionPermList', {
                                params: {
                                    staffId: staffId
                                }
                            });

                            // 处理功能权限数据并封装到 store 中
                            if (permissionResponse?.bean) {
                                let permissions = Array.isArray(permissionResponse?.bean?.permissionInfos)
                                    ? permissionResponse?.bean?.permissionInfos
                                    : permissionResponse?.bean?.permissionInfos || [];
                                addressFlag = permissionResponse?.bean?.isTest === '1'?'test' : 'prd';
                                setCrossAPIUserInfo({
                                    addressFlag: addressFlag,
                                    permissionInfos: permissions
                                });
                                // console.log('员工功能权限已更新到 store:', permissions);
                            }
                        } catch (permissionError) {
                            // console.warn('查询员工功能权限失败:', permissionError);
                            // 权限查询失败不影响主流程
                        }

                        // 查询员工角色信息
                        try {
                            const roleResponse = await request.post('/appTenant/staffRoleAllByStaffId', {
                                params: {
                                    staffId: staffId
                                }
                            });

                            // 处理角色信息数据并封装到 store 中
                            if (roleResponse?.bean) {
                                const roles = Array.isArray(roleResponse?.bean?.roleInfos)
                                    ? roleResponse?.bean?.roleInfos
                                    : roleResponse?.bean?.roleInfos || [];

                                const isAdmin = roleResponse?.bean?.isAdmin;
                                const tenantInfos = roleResponse?.bean?.tenantInfos;
                                setCrossAPIUserInfo({
                                    roleInfos: roles,
                                    isAdmin: isAdmin || '0',
                                    tenantInfos: tenantInfos || []
                                });
                                // console.log('员工角色信息已更新到 store:', roles);
                            }
                        } catch (roleError) {
                            // console.warn('查询员工角色信息失败:', roleError);
                            // 角色查询失败不影响主流程
                        }
                        // 根据业务账号ID查询账号信息
                        try {
                            const staffInfoByStaffId = await request.post('/appTenant/queryStaffInfoByStaffId', {
                                params: {
                                    staffId: staffId
                                }
                            });

                            // 处理账号信息数据并封装到 store 中
                            if (staffInfoByStaffId?.bean) {
                                setCrossAPIUserInfo({
                                    ...staffInfoByStaffId?.bean
                                });
                            }
                            setHasUserInfo(true);
                        } catch (roleError) {
                            // console.warn('查询账号信息失败:', roleError);
                            // 角色查询失败不影响主流程
                        }
                    }
                }
            }
        } catch (apiError) {
            // 接口调用失败不影响原有流程
            message.warning('鉴权未通过，已启用本地模拟数据！');
        }

    }

    useEffect(() => {
        // 获取页面链接中的URL参数
        const urlParams: any = getUrlParams();
        if (urlParams.ticket) {
            // 查询登录信息封装用户基本信息
            getLoginUserInfo(urlParams);
        } else {
            getUserInfo();
        }
        if (!isLocalMockMode()) {
            queryBussinessList();
            queryAppTypeList();
        }
        window.addEventListener('beforeunload', handleBeforeUnload);

        // 清理函数：组件卸载时执行
        return () => {
            try {
                // 1. 销毁所有antd弹窗
                Modal.destroyAll();
                // 清空消息队列
                message.destroy();
                // 2. 清空所有全局链表、数组
                // 清空定时器
                if (timerRef.current) {
                    clearTimeout(timerRef.current);
                    timerRef.current = undefined;
                }
                // 清空业务分类数据
                setBusinessDataList([]);
                // 清空应用类型数据
                setAppTypeList([]);
                // 清空crossAPI用户信息
                setCrossAPIUserInfo({});
                // 移除事件监听
                window.removeEventListener('beforeunload', handleBeforeUnload);
            } catch (error) {
                console.error('清理过程中出现错误:', error);
            }
        };
    }, []);

    // 全局配置消息提示
    messageStatic.config({
        // 消息显示时长（秒），设置为 0 表示不会自动关闭
        duration: 3,
        // 消息提示最大显示数量
        maxCount: 3,
        // 消息提示距离顶部的距离
        top: 24,
    });

    return (
        <ErrorBoundary>
            <ConfigProvider
                locale={locale}
                theme={{
                    cssVar: true,
                    hashed: false,
                    token: {
                        colorPrimary: '#0085d0',
                        colorLink: '#0085d0',
                        colorInfo: '#0085d0',
                    },
                    components: {
                        Menu: {
                            darkItemBg: '#000',
                            darkItemHoverColor: '#0085d0',

                            itemSelectedBg: '#c4e4f5',
                            subMenuItemBg: '#f7f7f7',
                            itemHoverBg: '#e5f2fa',
                            itemColor: '#333',
                            darkGroupTitleColor: 'rgba(255,255,255,0.70)',
                            darkItemColor: 'rgba(255,255,255,0.70)',
                            // darkItemBg: "#00273d", //后续抽离需使用
                            darkSubMenuItemBg: '#000f17',
                            // darkItemHoverColor: "#fff", //后续抽离需使用

                            darkPopupBg: '#00273d',
                        },
                        // Modal组件配置（原componentConfig.Modal）
                        Modal: {
                            borderRadius: 6, // 圆角（样式属性，合法）
                        },
                        // Select 仅配置样式令牌
                        Select: {
                            paddingSM: 8, // 内边距
                        },
                        // Table 样式配置（适配Chrome8x）
                        Table: {
                            // borderColor: '#0085d0',
                            rowSelectedBg: '#ffce66', // 选中行背景
                            rowSelectedHoverBg: '#ffbd32', // 选中行 hover
                        },
                        Button: {
                            borderRadius: 6,
                        },
                        Badge: {
                            dotSize: 10,
                            indicatorHeight: 16,
                            indicatorHeightSM: 12,
                            textFontSize: 11,
                            textFontSizeSM: 11,
                            statusSize: 10,
                        },
                        Progress: {
                            remainingColor: '#f4f4f4',
                            circleTextColor: '#333',
                        },
                    },
                    algorithm: theme.defaultAlgorithm,
                }}
                prefixCls="ant"
            >
                <StyleProvider
                    //彻底移除 :where 选择器
                    hashPriority="high"
                    //将 CSS 逻辑属性 (inline-size) 转为宽高 (width/height)
                    transformers={[legacyLogicalPropertiesTransformer]}
                    cache={cache}
                >
                    {/* 解决 Message/Modal/Notification 静态调用样式失效 */}
                    <AntdApp>
                        <AntdGlobal />
                        {/*{hasUserInfo && <EditLayout />}*/}
                        {hasUserInfo && <Router />}
                    </AntdApp>
                </StyleProvider>
            </ConfigProvider>
        </ErrorBoundary>
    );
}

export default App;
