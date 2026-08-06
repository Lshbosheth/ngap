import { useState, useEffect } from 'react';
import { Layout, Menu, Dropdown, Avatar, Space, Select, Modal } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { DashboardOutlined, SettingOutlined, LogoutOutlined, TeamOutlined, DownOutlined, UserOutlined } from '@ant-design/icons';
import { hasPermission } from '../config/permissionConfig';
import { crossApiUserInfo } from '../stores/crossapiStore';
import { menu } from '../stores/menuStore';
import logo from '../assets/icons/logo.png';
import { LogoutFun } from '../utils/Logout';
import { baseApiConvert } from '../utils/util';
const { Header, Content } = Layout;
import request from '@/utils/request';

export default function MainLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const [modal, contextHolder] = Modal.useModal();
    const fullScreenState = menu((state: any) => state.fullScreenState);
    // 获取用户信息和租户信息
    const userInfo = crossApiUserInfo((state) => state.userInfo);
    const setSelectedTenant = crossApiUserInfo((state) => state.setSelectedTenant);
    const setCrossAPIUserInfo = crossApiUserInfo((state) => state.setCrossAPIUserInfo);
    //模拟数据
    //const tenantInfos = [{tenantCode:'jsytck',tenantName:'js'},{tenantCode:'haytck',tenantName:'ha'}]
    const tenantInfos = userInfo.tenantInfos || [];
    const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);

    // 初始化选中第一个租户
    useEffect(() => {
        if (tenantInfos.length > 0 && !userInfo.selectedTenantId) {
            const firstTenant = tenantInfos[0];
            setSelectedTenant(firstTenant.tenantCode, firstTenant.tenantName);
        }
    }, [tenantInfos, userInfo.selectedTenantId, setSelectedTenant]);
     // 处理租户选择变化
    const handleTenantChange = (key: string) => {
        const selectedTenant = tenantInfos.find((tenant: any) =>
            tenant.tenantCode === key
        );
        if (selectedTenant) {
            setSelectedTenant(key, selectedTenant.tenantName);
            setTenantDropdownOpen(false);
            console.log('选择的租户:', key, selectedTenant.tenantName);

            // 强制刷新路由并重新加载工作台
            setTimeout(() => {
                navigate('/', { replace: true });
            }, 100);
        }
    };


    // 获取当前选中的租户名称
    const getCurrentTenantName = () => {
        return userInfo.selectedTenantName || '选择租户';
    };
    // 退出登录处理函数
    const handleLogout = () => {
        modal.confirm({
            title: '确认退出登录',
            content: '您确定要退出登录吗？',
            okText: '确定',
            cancelText: '取消',
            onOk: async () => {
                try {
                   LogoutFun({logoutType:0});
                 }catch (error) {
                    console.log('登出请求失败');
                 }
            },
            onCancel: () => {
                setOpen(false);
            },
        });
    };

    const menuItems = [
         {
            key: '/',
            label: '工作台',
            onClick: () => navigate('/'),
        },
        {
            key: '/build',
            label: '应用建设',
            onClick: () => navigate('/build'),
        },
        {
            key: '/run',
            label: '应用运行',
            onClick: () => navigate('/run'),
        },
    ].filter(Boolean) as any[];

    const userMenuItems = [
        {
            key: 'user',
            label: (
                <div style={{ padding: '8px 16px', borderBottom: '1px solid #E8E8E8' }}>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{userInfo.staffName || ''}</div>
                    <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>工号：{userInfo.staffId || ''}</div>
                </div>
            ),
        },
        //{ key: 'config', icon: <SettingOutlined />, label: '首页配置' },
        { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout },
    ].filter(Boolean) as any[];

    // 租户下拉菜单项
    const tenantMenuItems = tenantInfos.map((tenant: any) => ({
        key: tenant.tenantCode,
        label: (
            <div
                style={{
                    padding: '5px 12px',
                    backgroundColor: userInfo.selectedTenantId === tenant.tenantCode ? '#E6F7FF' : 'transparent',
                    color: userInfo.selectedTenantId === tenant.tenantCode ? '#1890FF' : '#000000D9',
                    borderRadius: '4px',
                    margin: '2px 4px',
                    fontSize: '13px',
                    fontFamily: 'PingFangSC, PingFang SC',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                }}
            >
                {tenant.tenantName}
            </div>
        ),
        onClick: () => handleTenantChange(tenant.tenantCode),
        style: {
            padding: 0,
            backgroundColor: 'transparent',
        },
    }));

    return (
        <Layout style={{ height: '100%' }}>
           {userInfo.isTopShow && !fullScreenState ? ( <Header
                style={{
                    height: '52px',
                    lineHeight: '52px',
                    backgroundColor: '#fff',
                    padding: '0 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    width: "100%",
                    zIndex: 999,
                }}
            >
                <Space size={10} style={{ height: '52px', display: 'flex', alignItems: 'center' }} onClick={() => navigate('/')}>
                    <img src={logo} alt="logo" style={{ width: 26, height: 30, objectFit: 'contain', verticalAlign: 'middle' }} />
                    <span
                        style={{
                            fontSize: 16,
                            color: '#1D2129',
                            fontWeight: 500,
                            fontFamily: 'PingFangSC, PingFang SC',
                        }}
                    >
                        应用集成平台
                    </span>
                </Space>

                <Menu
                    mode="horizontal"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        border: 0,
                    }}
                />

                <Space style={{ alignItems: 'center' }}>
                    {/* 租户管理 - 仅管理员可见 */}
                    {userInfo.isAdmin === '1' &&  (
                        <div
                            onClick={() => navigate('tmanage')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                // gap: 6,
                                cursor: 'pointer',
                                fontSize: 13,
                                color: '#333333',
                                fontFamily: 'PingFangSC, PingFang SC',
                            }}
                        >
                            <TeamOutlined />
                            <span style={{ marginLeft: 6 }}>租户管理</span>
                        </div>
                    )}

                    {/* 租户管理与租户选择之间的分割线 */}
                    <div style={{
                        width: '1px',
                        height: '20px',
                        backgroundColor: '#E8E8E8',
                        margin: '0 20px'
                    }} />

                        <Dropdown
                            menu={{
                                items: tenantMenuItems,
                                style: {
                                    boxShadow: '0 3px 6px -4px rgba(0,0,0,0.12), 0 6px 16px 0 rgba(0,0,0,0.08), 0 9px 28px 8px rgba(0,0,0,0.05)',
                                    borderRadius: '6px',
                                }
                            }}
                            trigger={['click']}
                            open={tenantDropdownOpen}
                            onOpenChange={setTenantDropdownOpen}
                            placement="bottomRight"
                            dropdownRender={(menu) => (
                                <div style={{
                                    backgroundColor: '#fff',
                                    borderRadius: '6px',
                                    boxShadow: '0 3px 6px -4px rgba(0,0,0,0.12), 0 6px 16px 0 rgba(0,0,0,0.08), 0 9px 28px 8px rgba(0,0,0,0.05)',
                                    position: 'relative',
                                }}>
                                    {/* 白色向上箭头 */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '-6px',
                                        right: '16px',
                                        width: '12px',
                                        height: '12px',
                                        backgroundColor: '#fff',
                                        transform: 'rotate(45deg)',
                                        boxShadow: '-2px -2px 4px rgba(0,0,0,0.06)',
                                        zIndex: 1,
                                    }} />
                                    <style>
                                        {`
                                        .hide-scrollbar-dropdown {
                                            max-height: 300px;
                                            overflow: auto;
                                            scrollbar-width: none;  /* Firefox */
                                            -ms-overflow-style: none;  /* IE/Edge */
                                            border-radius: 6px;
                                        }
                                        .hide-scrollbar-dropdown::-webkit-scrollbar {
                                            display: none;
                                        }
                                        `}
                                    </style>
                                    <div className={'hide-scrollbar-dropdown'} style={{ position: 'relative', zIndex: 2 }}>
                                        {menu}
                                    </div>
                                </div>
                            )}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    // gap: 6,
                                    cursor: 'pointer',
                                    fontSize: 13,
                                    color: '#333333',
                                    fontFamily: 'PingFangSC, PingFang SC',
                                }}
                            >
                                <span style={{ marginRight: 6 }}>{getCurrentTenantName()}</span>
                                <DownOutlined style={{ fontSize: 12, color: '#333' }} />
                            </div>
                        </Dropdown>

                    {/* 租户选择与管理员之间的分割线 */}
                    {userInfo.isAdmin === '1' && tenantInfos.length > 0 && (
                        <div style={{
                            width: '1px',
                            height: '20px',
                            backgroundColor: '#E8E8E8',
                            margin: '0 20px'
                        }} />
                    )}

                    <Dropdown menu={{ items: userMenuItems }} trigger={['click']} open={open} onOpenChange={setOpen}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                // gap: 6,
                                cursor: 'pointer',
                            }}
                        >
                            <Avatar size={24} icon={<UserOutlined />} style={{ background: '#2ECCD8' }} />
                            <span
                                style={{
                                    fontSize: 13,
                                    color: '#333333',
                                    fontFamily: 'PingFangSC, PingFang SC',
                                    margin: '0 6px'
                                }}
                            >
                                Hi,管理员 {userInfo.staffName || ''}
                            </span>
                            <DownOutlined style={{ fontSize: 12, color: '#333' }} />
                        </div>
                    </Dropdown>
                </Space>
            </Header>):''}

            {/* Modal上下文持有者 */}
            {contextHolder}

            <Content
                style={{
                    marginTop: '0',
                    padding: '0',
                    backgroundColor: '#F5F7FA',
                    height: 'calc(100% - 52px)',
                    position: 'relative',
                }}
            >
                <div
                    style={{

                        borderRadius: 6,
                        height: '100%',
                        minHeight: '100%',
                        padding: userInfo.isTopShow?'0 6px':'',
                    }}
                >
                    <Outlet />
                </div>
            </Content>
        </Layout>
    );
}
