import { create } from 'zustand';
import { produce } from 'immer';
interface apiListInterface {
    interfaceCode?: string;
    interfaceId?: string;
    interfaceName?: string;
    value?: string;
    title?: string;
    children?: [apiListInterface];
}
interface apiInfo {
    apiList: [];
    setApiList: (_apiInfo: [apiListInterface]) => void;
}
export const apiListInfo = create<apiInfo>((set) => ({
    apiList: [],
    setApiList: (_apiList: [apiListInterface]) =>
        set(
            produce((state) => {
                const dealData = (api: any) => {
                    (api || []).forEach((item: any) => {
                        item.label = item.interfaceName;
                        item.title = item.interfaceName;
                        item.value = item.interfaceId;
                        dealData(item.children);
                    });
                };
                dealData(_apiList);
                state.apiList = _apiList;
            }),
        ),
}));
