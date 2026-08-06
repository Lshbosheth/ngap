import { ReactNode } from 'react';

/** 组件外部配置参数 */
export interface CanvasOptions {
    provId: string | number;
    serviceTypeId: string | number;
    [key: string]: any;
}

/** 画布整体配置（传入组件的Props） */
export interface ProcessCanvasProps {
    options: CanvasOptions;
    handleOpenBrachConfig: (node: CanvasNode) => void;
    /** 关闭浮层配置页回调 */
    closeFloatConfigPage: () => void;
    /** 新增组件节点弹窗操作 */
    addComponentNode: {
        show: (params: { e: MouseEvent }) => void;
        close: () => void;
        content: HTMLElement;
    };
    /** 配置页DOM容器 */
    configPageDom: HTMLElement | null;
    /** 初始化渲染的DOM容器（可选） */
    initDom?: HTMLElement | null;
    _handleMouseMove?: any;
}

/** 业务组件数据 */
export interface ComponentData {
    id: string | number;
    componentName: string;
    nodeType: 'AT' | 'MT'; // 自动/手动节点
    branchName?: {
        optionsList: BranchOption[];
        [key: string]: any;
    };
    atomList?: AtomItem[];
    dataFromType?: string;
    [key: string]: any;
}

/** 分支选项 */
export interface BranchOption {
    optionsName: string;
    [key: string]: any;
}

/** 原子组件项 */
export interface AtomItem {
    atomId: string | number;
    atomType: string;
    [key: string]: any;
}

/** 节点类型 */
export type NodeType = 'begin' | 'end' | 'business';

export type ProcessNodeRegion = 'header' | 'content' | 'footer' | 'control';

export interface ProcessNodePresentation {
    region: ProcessNodeRegion;
    showInNavigator: boolean;
    navigatorTitle?: string;
}

export interface GuidedProcessConfig {
    navigator: {
        enabled: boolean;
        title: string;
    };
    scrollMode: 'fixed-top' | 'full-page';
}

/** 节点对象 */
export interface CanvasNode {
    nodeId: string | number;
    nodeType: NodeType;
    componentData?: ComponentData;
    top: number; // 节点top值（数字，避免字符串拼接）
    left: number; // 节点left值（数字）
    /** 父节点ID集合（用于数据导出） */
    pNodeId: (string | number)[];
    /** 父节点分支索引集合（用于数据导出） */
    pBranchId: number[];
    presentation?: ProcessNodePresentation;
}

export interface ComponentNode {
    nodeId: string | number;
    componentId?: ComponentData;
    canvasPoint: string;
    [key: string]: any;
}

/** 连线起始DOM类型 */
export type LineStartDom = 'nodeEnd' | 'optionEnd';

/** 连线对象 */
export interface CanvasLine {
    line: SVGPathElement | HTMLDivElement;
    lineId: string; // 唯一标识
    startNodeId: string | number;
    endNodeId: string | number;
    startNodeOptionIndex: number; // 起始分支索引，-1表示节点默认出口
    startNode: CanvasNode | string | number;
    endNode: CanvasNode | string | number;
    startDom: HTMLElement;
    endDom: HTMLElement;

    /** 连线SVG元素属性 */
    // x1: number;
    // y1: number;
    // x2: number;
    // y2: number;
}

/** 节点添加参数 */
export interface AddNodeParams {
    nodeId?: string | number;
    nodeType: NodeType;
    componentData?: ComponentData;
    top: number | string;
    left: number | string;
    type?: string;
    presentation?: ProcessNodePresentation;
}

/** 连线添加参数 */
export interface AddLineParams {
    startDom: HTMLElement;
    endDom: HTMLElement;
}

/** 画布缩放比例 */
export type CanvasScale = number; // 支持80%/100%/120%/150%缩放

/** 流程画布组件暴露给外部的 API 方法接口（核心：约束 ref 类型） */
export interface ProcessCanvasRefApi {
    // 回显配置数据（参数为原默认节点列表，返回值为空）
    setData: (
        defaultNodeList: Array<{
            nodeId: string | number;
            componentData: ComponentData;
            parentId: string;
            branchIndex: string;
            canvasPoint: string;
        }>,
    ) => void;
    // 获取配置数据（返回值为校验结果，与原 getData 一致）
    getData: () => {
        componentList?: any;
        // componentList?: Array<{
        //     nodeId: string | number;
        //     componentType: 'business';
        //     componentData?: ComponentData;
        //     componentId?: string | number;
        //     position: 'processPage';
        //     parentId: string;
        //     branchIndex: string;
        //     canvasPoint: string;
        // }>;
        // noLineNodeList?: CanvasNode[];
        // noLineEndList?: CanvasNode[];
    };
    // 搜索节点（参数为搜索文本，返回匹配的节点数组）
    searchNode: (searchText: string) => CanvasNode[];
    // 拖拽组件到画布（参数为鼠标事件和节点数据，返回值为空）
    dragNodeToCanvas: (e: React.MouseEvent<HTMLElement>, nodeData: { componentData: ComponentData }) => void;
    // 缩放画布（参数为缩放比例，返回值为空）
    scaleCanvas: (curScale: CanvasScale) => void;
    closeAbout: () => void;
    deleteBranch: (nodeId: string) => void;
    deleteOriginalLine: (nodeId: string) => void;
    updateEndNodeLines?: () => void;
}

/**
 * 节点拖拽结束的自定义事件类型声明
 * 明确事件名、事件类型、detail 数据结构
 */
export interface NodeDragEndEvent extends CustomEvent {
    // 事件名固定为 node-drag-end
    type: 'node-drag-end';
    // 携带的拖拽数据（与原有 dispatch 中的 detail 一致）
    detail: {
        nodeId: string | number;
        top: number;
        left: number;
    };
}

// 扩展 WindowEventMap，让 TypeScript 识别该自定义事件（核心）
declare global {
    interface WindowEventMap {
        'node-drag-end': NodeDragEndEvent;
    }
}
