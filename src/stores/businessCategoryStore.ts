import { create } from 'zustand';
import { produce } from 'immer';
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
interface apiInfo {
    businessDataList: [];
    setBusinessDataList: (_businessDataList: BusinessData[]) => void;
}
export const businessDataListInfo = create<apiInfo>((set) => ({
    businessDataList: [],
    setBusinessDataList: (_businessDataList: BusinessData[]) =>
        set(
            produce((state) => {
                state.businessDataList = _businessDataList;
            }),
        ),
}));
