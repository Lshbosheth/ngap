export interface OptionItem {
    value: string;
    label: string;
    id: string;
}
export interface appTempFormData {
    appName: string;
    appCategory: string;
    appTypeIds: string;
    sceneType: string;
}

export interface componentTempSearch {
    componentName: string;
    componentCategory: string;
    businessId: string | undefined;
}

export interface componentTempData {
    provId: string;
    serviceTypeId: string;
    staffId: string;
    componentName: string; // 模板名称
    componentDesc: string; // 业务组件描述
    businessId: string; // 业务分类
    serviceLink: string; // 服务环节
    componentCategory: string; //模板类别
    id?: string;
    dataType?: string;
    componentPicture?: string; //组件缩略图
}

export interface appTempData {
    provId?: string;
    serviceTypeId?: string;
    staffId?: string;
    appName: string; // 模板名称
    appCategory: string; // 应用类别
    sceneType: string; // 应用形式
    appTypeId?: string; // 应用分类
    belongModule: string; // 归属模块
    appDesc: string; // 模板描述
    id?: string;
    dataType?: string;
    appPicture?: string; //应用缩略图
}

export interface BusinessData {
    businessId: string;
    businessName: string;
    businessCategory?: string;
    createStaffId?: string;
    createTime?: string;
    updateTime?: string;
    updateStaffId?: string;
    businessLevel?: string;
    parentId?: string;
}

export interface CommponentItem {
    belongModule?: string;
    businessId?: string;
    componentCategory?: string;
    componentDesc?: string;
    componentLevel?: string;
    componentName?: string;
    componentStatus?: string;
    createStaffId?: string;
    createTime?: string;
    dataType?: string;
    id?: string;
    provId?: string;
    serviceLink?: string;
    serviceTypeId?: string;
    updateStaffId?: string;
    updateTime?: string;
    componentPicture: string; //组件缩略图
}
