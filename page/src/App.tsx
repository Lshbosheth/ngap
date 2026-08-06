import React, { useEffect, useState } from 'react';
import { ConfigProvider, App as AntdApp, theme } from 'antd';
import locale from 'antd/locale/zh_CN';
import crossAPI from '@editor/utils/crossAPI';
import Pages from '@/page';
import AntdGlobal from '@materials/utils/AntdGlobal';
import { createId } from '@materials/utils/util';
import request from '@materials/utils/request';
import './App.less';
import './index.less';

const appSequenceId = createId();
(window as any).React = React;
(window as any).crossAPI = crossAPI;
(window as any).appSequenceId = appSequenceId;

const clearAppGlobals = () => {
    delete (window as any).React;
    delete (window as any).crossAPI;
    delete (window as any).appSequenceId;
};

if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', clearAppGlobals);
}

function App() {
    const [userInfo, setUserInfo] = useState<any>(null); // 改为 null 初始状态，明确表示未加载
    const [serialNo, setSerialNo] = useState<any>(null); // SerialNo
    const [isLoading, setIsLoading] = useState(true); // 添加加载状态
    const getUserInfo = async () => {
        try {
            if (import.meta.env.VITE_ENV_TYPE_PROD === 'true') {
                const data: any = await new Promise((resolve) => {
                    crossAPI.getIndexInfo(resolve);
                });
                setUserInfo(data.userInfo);
            }
        } catch (e) {
            setUserInfo({
                staffId: '',
                staffName: '',
                serviceTypeId: '',
                provinceId: '',
                deptId: '',
                deptName: '',
                orgaCode: '',
                orgaName: '',
                selfServiceTypeId: '',
                initServiceTypeId: '',
                selfProvCode: '',
                destProvId: '',
                sysNo: '',
                cmos_vision: '',
            });
        }
    };
    const getSerialNo = async () => {
        try {
            console.log('serialNo-------start', new Date())
            const CallingInfo: any = await new Promise((resolve) => {
                crossAPI.getContact('getCallingInfo', resolve)
            });
            console.log('serialNo-------end', new Date())
            console.log('CallingInfo-------', CallingInfo)
            setSerialNo(CallingInfo && CallingInfo.serialNo ? CallingInfo.serialNo : '');
        } catch (e) {
            setSerialNo('');
        }
    };

    useEffect(() => {
        // 先获取用户信息，再查询自定义元素
        const initApp = async () => {
            await getUserInfo();
            await getSerialNo();
            setIsLoading(false);
        };

        initApp();
    }, []);
    // 如果正在加载，显示加载提示
    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                backgroundColor: '#f5f5f5',
                gap: '20px'
            }}>
                {/* 加载动画 */}
                <div style={{
                    width: '50px',
                    height: '50px',
                    border: '4px solid #e8e8e8',
                    borderTop: '4px solid #0085d0',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />

                {/* 加载文字 */}
                <div style={{
                fontSize: '16px',
                    color: '#666',
                    fontWeight: 500
            }}>
                页面加载中...
            </div>

                {/* 进度条占位 */}
                <div style={{
                    width: '200px',
                    height: '4px',
                    backgroundColor: '#e8e8e8',
                    borderRadius: '2px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: '60%',
                        height: '100%',
                        backgroundColor: '#0085d0',
                        borderRadius: '2px',
                        animation: 'progress 1.5s ease-in-out infinite'
                    }} />
                </div>

                {/* 提示信息 */}
                <div style={{
                    fontSize: '12px',
                    color: '#999',
                    marginTop: '10px'
                }}>
                    加载速度优化中，请稍候...
                </div>

                {/* 添加CSS动画 */}
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    @keyframes progress {
                        0% { width: 0%; opacity: 0.5; }
                        50% { width: 70%; opacity: 1; }
                        100% { width: 100%; opacity: 0.5; }
                    }
                `}</style>
            </div>
        );
    }

    return (
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
        >
            <AntdApp>
                <AntdGlobal />
                <Pages userInfo={userInfo} serialNo={serialNo} />
            </AntdApp>
        </ConfigProvider>
    );
}

export default App;
