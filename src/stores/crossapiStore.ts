import { create } from 'zustand';
import { produce } from 'immer';
import { publictData } from '../utils/appMenuData';
const serviceTypeId2ProvId = publictData.serviceTypeId2ProvId
export interface userInfoState {
    //坐席账号
    staffId: string;
    staffName: string;
    //业务系统
    serviceTypeId: string;
    selfServiceTypeId: string;
    initServiceTypeId: string;
    //省份编码
    provinceId: string;
    proviceId: string;
    selfProvCode: string;
    destProvId: string;
    sysNo: string;
    //灰度线路
    cmos_vision: string;
    //部门组织机构
    deptId: string;
    deptName: string;
    orgaCode: string;
    orgaName: string;
    toolsStaffSelfServiceTypeId: string;
    addressFlag: string;
    ngapIsHttps: boolean;
    systermOldStaffId: any;
    //固定会话ID
    fixedSession: string;
    //功能权限列表
    permissionInfos: string[];
    //角色信息列表
    roleInfos: any[];
    // 是否为管理员
    isAdmin: string;
    // 租户信息列表
    tenantInfos: any[];
    tenantId?:string;
    // 当前选中的租户信息
    selectedTenantId: string;
    selectedTenantName: string;
    emailAddress?: string;
    mobilePhone?: string;
    // orgaCode?:string;
    orgaId?: string;
    // orgaName?:string;
    orgaNameRoute?: string;
    resouceNo?: string;
    // staffId?:string;
    staffIdStatus?: string;
    // staffName?:string;
    staffState?: string;
    isTopShow?: boolean;
    ngshCrmStaffId?: string;
    ngshBossStaffId?: string;
    iframeName?: string; // 打开菜单的名称
    // E开头工号
    eHumanRsNo?: string;
    personLabel?: string;
    accountType?: string;
}

//crossAPI获取的用户信息
export interface CrossApiUserInfoState {
    userInfo: userInfoState;
}
const initCrossApiUserInfoStateState: CrossApiUserInfoState = {
    userInfo: {
        //坐席账号
        staffId: '',
        staffName: '',
        //业务系统
        serviceTypeId: '',
        selfServiceTypeId: '',
        initServiceTypeId: '',
        //省份编码
        provinceId: '',
        proviceId: '',
        selfProvCode: '',
        destProvId: '',
        sysNo: '',
        //灰度线路
        cmos_vision: '',
        //部门组织机构
        deptId: '',
        deptName: '',
        orgaCode: '',
        orgaName: '',
        toolsStaffSelfServiceTypeId: '',
        addressFlag: '',
        ngapIsHttps: window?.location?.protocol === 'https' ? true : false,
        systermOldStaffId: [],
         //固定会话ID
        fixedSession: '',
        //功能权限列表
        permissionInfos: [],
        //角色信息列表
        roleInfos: [],
        //是否为管理员
        isAdmin:'',
        tenantInfos:[],
        selectedTenantId:'',
        selectedTenantName:'',
        emailAddress: '',
        mobilePhone: '',
        // orgaCode?:string;
        orgaId: '',
        // orgaName?:string;
        orgaNameRoute: '',
        resouceNo: '',
        // staffId?:string;
        staffIdStatus: '',
        // staffName?:string;
        staffState: '',
        isTopShow: false,
        ngshCrmStaffId: '',
        ngshBossStaffId: '',
        iframeName: '应用集成平台',
        // E开头工号
        eHumanRsNo: '',
        personLabel: '',
        accountType: "",
    },
};
export const crossApiUserInfo = create<
    CrossApiUserInfoState & {
        setCrossAPIUserInfo: (data: Partial<CrossApiUserInfoState['userInfo']>) => void;
        setSelectedTenant: (tenantId: string, tenantName: string) => void;
    }
>((set) => ({
    ...initCrossApiUserInfoStateState,
    // 更新用户信息
    setCrossAPIUserInfo: (data) =>
        set(
            produce((draft) => {
                (Object.keys(data) as Array<keyof CrossApiUserInfoState['userInfo']>).forEach((key) => {
                    if (key in draft.userInfo) {
                        draft.userInfo[key] = data[key]!;
                    }
                });
            }),
        ),
    // 更新选中的租户信息
    setSelectedTenant: (tenantId: string, tenantName: string) =>
        set(
            produce((draft) => {
                draft.userInfo.selectedTenantId = tenantId;
                draft.userInfo.selectedTenantName = tenantName;
                draft.userInfo.serviceTypeId = tenantId;
                draft.userInfo.provinceId = serviceTypeId2ProvId[tenantId];
                draft.userInfo.proviceId = serviceTypeId2ProvId[tenantId];
            }),
        ),
}));
