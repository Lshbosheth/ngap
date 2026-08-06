export interface SelectData {
    name: string;
    value: string;
}
export interface OptionItem {
    value: string;
    label: string;
    id: string;
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
    componentPicture?: string;
}

export interface ComponentListSearchData {
    provId: string;
    serviceTypeId: string;
    componentName: string;
    componentDesc: string;
    belongModule: string;
    serviceLink: string;
    componentLevel: string;
    componentCategory: string;
    businessId: string;
    dataType: string;
}
export interface OtherFormData {
    componentName: string;
    componentDesc: string;
    belongModule: string;
    serviceLink: string;
    componentLevel: string;
    createStaffName?: string;
    createOrgaId?: string;
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
export interface CommponentBeansItem {
    belongModule?: string;
    businessId?: string;
    businessName?: string;
    componentCategory: string;
    componentDesc?: string;
    componentLevel?: string;
    componentName?: string;
    componentStatus?: string;
    createStaffId?: string;
    createTime?: string;
    dataType?: string;
    id: string;
    provId: string;
    serviceLink?: string;
    serviceTypeId?: string;
    updateStaffId?: string;
    updateTime?: string;
    componentPicture?: string; //组件缩略图
}

export interface SearchCardHandle {
    queryList: () => void;
    resetHasMore: () => void;
}
export interface SearchListHandle {
    queryList: () => void;
}

export interface ModuleSelectHandle {
    funDemo: () => void;
}

export interface TempSearchData {
    dataType: string;
    componentStatus: string;
    componentCategory: string;
    componentName: string;
    businessId: string;
    provId: string;
    serviceTypeId: string;
    limit: number;
    page: number;
    start: number;
    firBusinessId?: string;
}
// 业务组件基础信息
export interface ComponentTempData {
    provId?: string;
    serviceTypeId?: string;
    staffId?: string;
    componentName?: string; // 模板名称
    componentDesc?: string; // 业务组件描述
    belongModule?: string; //归属模块
    businessId?: string; // 业务分类
    businessName?: string; // 业务分类
    serviceLink?: string; // 服务环节
    componentCategory: string; //模板类别
    componentLevel?: string; //适用范围
    dataType?: string;
    id?: string;
    componentPicture?: string; //组件缩略图
    templateId?: string; //组件缩略图
    typeZDY?: string; // 自定义组件
}
