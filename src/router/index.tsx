import { createHashRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import Workbench from '../pages/Workbench/Workbench';
import AppBuild from '../pages/AppBuild/AppBuild';
import AppRun from '../pages/AppRun/AppRun';
import TManage from '../pages/tenantManage/index';
import TaskCenter from '../pages/taskCenter/index';
import MyActivity from '../pages/MyActivity/index';
import { crossApiUserInfo } from '../stores/crossapiStore';

// 动态路由组件，根据用户权限决定跳转路径
function DynamicRouter() {
    const userInfo = crossApiUserInfo((state) => state.userInfo);

    // 如果 isTopShow 为 false，直接返回 AppBuild 组件
    if (userInfo.isTopShow === false) {
        return <AppBuild />;
    }

    // 默认情况：显示顶部导航栏的路由
    return <MainLayout />;
}


export default function Router() {
    return <RouterProvider router={createHashRouter([
    {
        path: '/',
            element: <DynamicRouter />,
        errorElement: <div style={{ padding: '20px' }}>页面不存在</div>,
        children: [
                {
                    index: true,
                    element: <Workbench />
            },
            { 
                    path: 'TaskCenter',
                    element: <TaskCenter />
            },
            { 
                    path: 'MyActivity',
                    element: <MyActivity />
            },
            { path: 'build', element: <AppBuild /> },
            { path: 'run', element: <AppRun /> },
            { path: 'tmanage', element: <TManage /> },
        ],
    },
    ])} />;
}
