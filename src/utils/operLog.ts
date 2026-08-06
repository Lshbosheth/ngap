import request from './request';

interface logParams {
    provCode: string; // 8位省份编码
    modelName?: string; // 所属模块
    pageName?: string; // 所属菜单
    dataType?: string; // 数据类型（应用、元素、组件、接口）
    operType: string; // 操作类型（新增/编辑/删除/导入）
    dataId?: string; // 操作数据ID
    dataName?: string; // 操作数据名称
    editContent: string; // 操作内容简述
    staffId: string; // 操作人工号
}

const recordLog = (logParams: logParams) => {
    return new Promise((resolve) => {
        const params = {
            ...logParams,
            type: 'operLog', // 日志类型
        };
        request
            .post('/csf/call/saveOperLogToCsf', { params: logParams })
            .then((data) => {
                resolve(data);
            })
            .catch((error) => {
                console.error('记录操作日志失败:', error);
                // 注意：这里不应该影响主流程，所以可以不 reject 或静默失败
            });
    });
};

export default recordLog;
