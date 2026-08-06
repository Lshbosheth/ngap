/**
 * 可拖拽的目标组件
 * @param icon 组件图片
 * @param name 组件中文名称
 * @param type 组件类型
 * @returns 拖拽对象
 */
export interface IDragTarget {
    icon?: string;
    name: string;
    type: string;
}

/**
 * 拖拽的
 * @param text 组件中文名称
 * @returns 拖拽对象
 */
export interface IDragTargetItem {
    id: string;
    type: string;
    name: string;
}
/**
 * 组件最小颗粒度类型定义
 */
export type ComItemType = Pick<ComponentType, 'id' | 'type' | 'name' | 'parentId' | 'elements' | 'remoteUrl' | 'remoteConfigUrl' | 'remoteCssUrl' | 'belongNodeId' | 'config'>;

/**
 * stor中状态对应的组件类型，这是原始的组件类型
 * @param {string} id 组件ID(算法生成)
 * @param {string} type 组件类型，枚举值
 * @param {string} parentId 父组件ID
 * @param {config} config 组件配置
 * @param {events} api 组件自带的事件
 * @param {elements} elements 子组件
 */
export type ComponentType<T = any> = {
    id: string;
    type: string;
    name: string | number;
    remoteUrl?: string;
    remoteConfigUrl?: string;
    remoteCssUrl?: string;
    parentId?: string;
    config: ConfigType<T>;
    // 属性中用于展示的事件，跟配置中的事件不同
    events?: Array<{ name: string; value: string }>;
    // 属性中用于展示的方法，跟配置中的方法不同
    methods: ComponentMethodType[];
    apis: { [key: string]: ApiType };
    elements: ComponentType<T>[];
    belongNodeId?: string | number;
} & OnProps<string>;

type OnProps<TKeys extends string> = {
    [P in `on${TKeys}` as `on${TKeys}`]: (data?: any) => void;
};
export interface ComponentSetting {
    showOrHide?: {
        type: 'static' | 'variable';
        value: any;
    };
    elementAlias?: string;
}
/**
 * 组件配置类型
 */
export interface ConfigType<T = any> {
    props: T & ComponentSetting; // 组件自身属性
    scopeCss: string; // 自定义css
    scopeStyle: React.CSSProperties; // 配置的style
    style: React.CSSProperties; // 合并后的样式
    events: EventType[]; //事件配置
    // 接口配置
    api: ApiConfig;
}

/**
 * 组件API简化类型
 */
export interface ApiConfig {
    sourceType: 'json' | 'api' | 'variable' | 'download';
    id: string;
    source: any;
    sourceField: string | { type: 'variable' | 'static'; value: string };
    name?: {
        type: 'variable' | 'static';
        value: string;
    };
    forEachData?: any;
}

/**
 * 事件类型
 */
export interface EventType<T = any> {
    nickName: string; // 中文名称
    eventName: string; // 英文标识
    actions: T[]; // 事件行为
}

/**
 * 事件行为
 */
export interface ActionNode<T> {
    action: T;
    next: (ActionNode<T> & { success: ActionNode<T>; fail: ActionNode<T> }) | null;
}

/**
 * 组件方法行为
 */
export interface MethodsAction {
    name: string;
    target: string;
    method: string;
    params?: { [key: string]: string | number };
}

/**
 * 确认框行为
 */
export interface ConfirmAction {
    name: string; // 行为名称
    type: 'confirm' | 'info' | 'success' | 'error' | 'warning'; // 行为类型
    title: string;
    commenId:string;
    content: string;
    okText: string;
    cancelText: string;
}

/**
 * 确认框行为
 */
export interface MessageAction {
    type: 'info' | 'success' | 'error' | 'warning'; // 行为类型
    content: string;
    duration: number;
}

/**
 * 通知行为
 */
export interface NotificationAction {
    type: 'info' | 'success' | 'error' | 'warning'; // 行为类型
    message: string;
    description: string;
    placement: 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight';
    duration: number;
}

/**
 * 组件方法类型
 */
export interface ComponentMethodType {
    name: string;
    title: string;
}

/**
 * 跳转行为
 */
export interface JumpLinkAction {
    url: string;
    jumpType: 'route' | 'micro' | 'link' | 'crossAPI';
    isNewWindow: boolean;
    tabName: string;
    linkParamType: string;
     openType:string;
    showDialogH:string;
    showDialogW:string;
    showDialogId:string;
}
/**
 * 关闭页面行为
 */
export interface DestroyPageAction {
    destroyTabName: string;
}
/**
 * 变量赋值
 */

export interface VariableAction {
    assignmentType: 'assignment' | 'reset';
    assignmentWay: 'static' | 'dynamic';
    name: string;
    value: any;
}

/**
 * 内容复制
 */

export interface CopyAction {
    content: string;
}

/**
 * 接口类型定义
 */
export interface ApiType {
    id: string;
    name: string; //接口名称
    url: string;
    stgApi: string;
    preApi: string;
    prdApi: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    sourceType?: string; //数据源类型，枚举值
    // 静态数据源映射
    source: any;
    // 数据源映射，比如：{ code: { list: [] } }，这里sourceField: 'data.list'
    sourceField: string;
    contentType: string;
    baseApi?: string;
    sendOn?: string;
    replaceData: 'merge' | 'cover' | 'reserve';
    params?: {
        [key: string]: any;
    };
    isCors: boolean;
    // 字段映射
    result: {
        code: string; //状态码字段
        codeValue: number; //成功对应的值
        data: string; //结果字段
        msg: string; //报错字段
    };
    tips?: {
        success: string;
        fail: string;
        isSuccess: boolean; // 是否开启系统成功提示
        isError: boolean; // 是否开启系统错误提示
    };
}

/**
 * 请求响应接口类型
 * @param {number} code 状态码
 * @param {any} data 响应数据
 * @param {string} message 响应消息
 */
export interface ApiResponse {
    code: number;
    data: any;
    message: string;
}

/**
 * 页面变量类型
 */
export interface PageVariable {
    name: string;
    defaultValue: any;
    type: any;
    remark: string;
}

/**
 * 坐席信息
 */
export interface userInfoType {
    staffId?: string;
    serviceTypeId?: string;
    provinceId?: string;
    [key: string]: any;
}

/**
 * 框架方法
 */
export interface CrossAPIFnAction {
    eventNm: string;
    // 下发短信参数
    smsnodePath?: string;
    smsId?: string;
    smsNm?: string;
    // 一键办理参数
    mcdsNm?: string; // 商品名称
    suplerProdCode?: string; // 供应商编码
    provinceOfferType?: string; // 省端商品类型
    categoryCode?: string; // 后台类目编码
    // 转接专席参数
    transferAgentVal?: string; // 选择专席的信息
    transferInfo?: string; // 转接信息
    // 一键立单数据
    srvReqstTypeId?: string;
    srvReqstTypeNm?: string;
    srvReqstTypeFullNm?: string;
    verno?: string;
    fillFormType?: string[];
    // 一键甩单数据
    oneKeyOrderId?: string;
    // 同屏卡片数据
    cardId?: string;
    isPreview?: string;
    // 知识详情数据
    knwlgAtomId?: string;
    knwlgAtomNm?: string;
    imMessageType?: string | number;
    businessTypeId?: string | number;
    sceneType?: string | number;
    transferMode?: string | number;
    transferType?: string | number;
    accessCode?: string | number;
    authenticationCode?: string | number;
    validationTypeId?: string | number;
    // 用后即评
    serviceId?: string;
    // 发送消息到交谈区
    receiveSendMsgContent?: string;  // 文本内容
    receiveSendMsgType?: string; // sendType
    commenId?:string;
    acceptTelphoneField?:string;
}

/**
 * 金库校验
 */

export interface GoldBankCheckFnAction {
    operContent: string;
    operCode: string;
    operateTypeCode: string;
}

export interface BulkActionItem {
    text: string;
    type: 'primary' | 'default' | 'dashed' | 'text' | 'link';
    danger: boolean;
    block: boolean;
    icon?: string;
    eventName?: string;
    authCode?: string;
    authScript?: string;
}

// PostMessage Data
export interface MessageData {
    name: string;
    relationId: string;
    height: number;
    type: string;
    url: string;
}
