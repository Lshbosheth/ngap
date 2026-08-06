interface IMenuItem {
    title: string;
    url: string;
    param?: any;
}
interface IDialogItem {
    id: string;
    title: string;
    url: string;
    modal: boolean;
    height?: string;
    width?: string;
    param?: any;
}
interface IPopAlertItem {
    type: string;
    title: string;
    message: string;
}
declare class CrossAPI {
    constructor();
    private _listeners;
    private listeners;
    private callbackSize;
    private callbackIndex;
    private _crossDataListeners;
    private url;
    private init;
    private EventListener;
    private handleEvent;
    getUserInfo(callback: (o: object) => any): void;
    getIndexInfo(callback: (o: object) => any): void;
    getContact(name: string, param: object, callback?: (o: object) => any): void;
    createTab(title: string, url: string, param?: any): void;
    destroyTab(tabName: string): void;
    showDialog(item: IDialogItem): void;
    destroyDialog(id: string | undefined): void;
    refreshTab(tabNames: string[], param?: object): void;
    popAlert(item: IPopAlertItem): void;
    set(name: string, param: object): void;
    get(name: string, callback: (o: object) => any): void;
    private sendFuntionMsg;
    private sendGetDataMsg;
    private getCrossData;
    private sendSetDataMsg;
    private sendEventMsg;
    _on(type: string, listener: (...arr: any[]) => any): void | boolean;
    private _trigger;
    on(type: string, listener: (...arr: any[]) => any): void | boolean;
    removeListener(type: string, listener: (...arr: any[]) => any): void | boolean;
    private eventDeal;
    trigger(tabArr: string[], name: string, param?: object): void;
    oncross(listener: (...arr: any[]) => any): void | boolean;
    private crossTrigger;
    private sendMsg;
    private getMsgId;
}
declare const crossAPI: CrossAPI;
export default crossAPI;
