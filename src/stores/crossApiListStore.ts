import { create } from 'zustand';
import { produce } from 'immer';
interface CrossApiListInterface {
    interfaceCode?: string;
    interfaceId?: string;
    interfaceName?: string;
    value?: string;
    title?: string;
    children?: [CrossApiListInterface];
}
interface crossApiInfo {
    CrossApiList: [];
    setCrossApiList: (_apiInfo: [CrossApiListInterface]) => void;
}
export const CrossApiListInfo = create<crossApiInfo>((set) => ({
    CrossApiList: [],
    setCrossApiList: (_CrossApiList: [CrossApiListInterface]) =>
        set(
            produce((state) => {
                const dealData = (api: any) => {
                    (api || []).forEach((item: any) => {
                        item.label = item.interfaceName;
                        item.value = item.interfaceId;
                        dealData(item.children);
                    });
                };
                dealData(_CrossApiList);
                state.CrossApiList = _CrossApiList;
            }),
        ),
}));
