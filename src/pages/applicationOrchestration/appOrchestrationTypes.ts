export interface OptionItem {
    value: string;
    label: string;
    id: string;
}
export interface OrchestrationFormData {
    provId: string;
    appCategory: string;
    appTypeIds: string;
    sceneType: string;
    dataType: string;
}
export interface AppCategoryData {
    appName: string;
    appType: string;
}

export interface AppTemptypeData {
    pId: string;
    typeLevel: string;
    appTypeCategory: string;
    appTypeId: string;
    appTypeName: string;
}

export interface AppModuleItem {
    appName: string;
    dataType: string;
    appCategory: string;
    updateStaffId: string;
    appLevel: string;
    updateTime: string;
    appStatus: string;
    showRegion: string;
    isShowNavBar: string;
    createStaffId: string;
    sceneType: string;
    createTime: string;
    appTypeId: string;
    appDesc: string;
    serviceTypeId: string;
    id: string;
    belongModule: string;
    defaultRefresh: string;
    provId: string;
    shareStatus: string;
    appPicture?: string; //应用缩略图
}

// 应用编排基础信息
export interface baseInfoData {
    provId: string;
    serviceTypeId: string;
    staffId: string;
    appName: string; // 应用名称
    appTypeId: string; // 应用分类ID
    appTypeName: string; // 应用分类名称
    appCategory: string; // 应用类别
    appLevel: string; // 应用级别
    belongModule: string; // 归属模块
    sceneType: string; // 展示形式（方案类型）
    appDesc: string; // 应用备注
    id?: string;
}
