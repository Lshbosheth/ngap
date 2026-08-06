import { create } from 'zustand';
import { produce } from 'immer';

export interface businessComponent {
    //应用编排基础信息
    provId: string;
    serviceTypeId: string;
    appName: string;
    appTypeId: string;
    appTypeName: string;
    appCategory: string;
    appLevel: string;
    belongModule: string;
    sceneType: string;
    appDesc: string;
}
//获取应用编排基础信息
export interface BusinessComponentState {
    baseComponents: businessComponent;
}
const initBusinessComponentState: BusinessComponentState = {
    baseComponents: {
        //坐席账号
        provId: '',
        serviceTypeId: '',
        appName: '',
        appTypeId: '',
        appTypeName: '',
        appCategory: '',
        appLevel: '',
        belongModule: '',
        sceneType: '',
        appDesc: '',
    },
};
export const crossApiUserInfo = create<
    BusinessComponentState & {
        setBusinessComponentInfo: (data: Partial<BusinessComponentState['baseComponents']>) => void;
    }
>((set) => ({
    ...initBusinessComponentState,
    // 更新应用编排基础信息
    setBusinessComponentInfo: (data) =>
        set(
            produce((draft) => {
                (Object.keys(data) as Array<keyof BusinessComponentState['baseComponents']>).forEach((key) => {
                    if (key in draft.baseComponents) {
                        draft.baseComponents[key] = data[key]!;
                    }
                });
            }),
        ),
}));
