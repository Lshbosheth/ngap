// types.ts
export interface UserInfo {
    provinceId: string;
    [key: string]: any;
}

export interface InterfaceItem {
    interfaceCode: string;
    interfaceName: string;
    [key: string]: any;
}

export interface OutParamItem {
    filedKey: string;
    filedName: string;
    [key: string]: any;
}

export interface ConditionItem {
    filedKey?: string;
    atomId?: string;
    value: string;
    relation: string;
    id?: number;
}

export interface BranchConfigItem {
    optionsName?: string;
    rule?: string;
    operationRes?: string; //展示结果
    status?: string; //分支状态 默认正常
    conditionList?: ConditionItem[];
    [key: string]: any;
}

export interface ConfigData {
    branchType: string;
    interfaceId?: any;
    optionsList: BranchConfigItem[];
    [key: string]: any;
}

export interface Props {
    nodeId: string;
    userInfo: UserInfo;
    defaultConfigData?: ConfigData;
    formAtomList?: any[];
    callBack: (config: ConfigData) => void;
}
