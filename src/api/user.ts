// 登录
export const login = async (params: any) => {
    return {
        userId: 100000,
        userName: 'ngapview',
        nickName: 'Demo',
        token: '123456',
        avatar: '/imgs/ngap-logo.png',
    };
};
// 获取用户信息
export const getUserInfo = async () => {
    return {
        userId: 100000,
        userName: 'ngapview',
        nickName: 'Demo',
        avatar: '/imgs/ngap-logo.png',
    };
};

// 搜索用户
export const searchUser = async (params: any) => {
    return {
        id: '100000',
        userName: 'ngapview',
    };
};
