import { create } from 'zustand';
import { produce } from 'immer';
interface appTypeInterface {
    appTypeCategory?: string;
    appTypeId?: string;
    appTypeName?: string;
    createStaffId?: string;
    createTime?: string;
    pId?: string;
    typeLevel?: string;
    updateStaffId?: string;
    updateTime?: string;
}
interface apiInfo {
    appTypeList: [];
    setAppTypeList: (_apiInfo: [appTypeInterface]) => void;
}
export const appTypeListInfo = create<apiInfo>((set) => ({
    appTypeList: [],
    setAppTypeList: (appTypeList: [appTypeInterface]) =>
        set(
            produce((state) => {
                const dealData = (api: any) => {
                    (api || []).forEach((item: any) => {
                        item.label = item.interfaceName;
                        item.value = item.interfaceId;
                        dealData(item.children);
                    });
                };
                dealData(appTypeList);
                state.appTypeList = appTypeList;
            }),
        ),
}));
