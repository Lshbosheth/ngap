import request from '../utils/request';
export default {
    // 获取页面列表
    async getPageList(params: any) {
        return {
            total: 1,
            list: [
                {
                    id: 100000,
                    name: 'CRUD',
                    userId: 100000,
                    remark: '调用线上接口',
                    isPublic: 1,
                    projectId: 100000,
                    updatedAt: '2025-01-14 17:29:15',
                    userName: 'ngapview',
                },
            ],
        };
    },

    // 获取页面详情
    async getPageDetail(params: any) {
        const result = await request.post('/appComponent/queryAppComponentInfo', {
            params: params,
        });
        return result.bean;
    },

    // 复制页面数据
    async copyPageData(params: any) {
        return '';
    },

    // 删除页面数据
    async delPageData(params: any) {
        return '';
    },

    // 创建页面数据
    async createPageData(params: any) {
        return '';
    },

    // 保存页面数据
    async updatePageData(params: any) {
        return '';
    },

    // 发布
    async publishPage(params: any) {
        return '';
    },

    // 发布记录
    async publishList(params: any) {
        return '';
    },

    // 页面回滚
    async rollbackPage(params: any) {
        return '';
    },
};
