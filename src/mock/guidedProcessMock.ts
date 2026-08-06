import type { GuidedProcessConfig, ProcessNodePresentation } from '@/pages/applicationOrchestration/pageCanvas/processCanvasPage/processCanvasPageType';

const elementConfig = (props: any, style: any = {}) => ({
    config: { props, style, events: [], api: {} },
    events: [],
    methods: [],
    apis: {},
});

const title = (id: string, text: string, style: any = {}) => ({
    id,
    type: 'Title',
    name: '标题',
    elements: [],
    ...elementConfig({ text, level: 4, type: '', script: 'function render(value){ return value; }' }, {
        margin: 0,
        padding: '16px 20px',
        background: '#fff',
        fontSize: '14px',
        lineHeight: '24px',
        ...style,
    }),
});

const button = (id: string, text: string, type = 'default') => ({
    id,
    type: 'Button',
    name: '按钮',
    elements: [],
    ...elementConfig({ text, type, size: 'middle', shape: 'default' }, { marginRight: '12px' }),
});

const bottomBanner = (id: string) => {
    const children = [button(`${id}-reply`, '直接答复'), button(`${id}-success`, '挽留成功', 'primary')];
    return {
        id,
        type: 'BottomBanner',
        name: '底部通栏',
        elements: children.map((item) => ({ ...item, parentId: id })),
        ...elementConfig({ paddingTop: '12px', paddingBottom: '12px', paddingLeft: '20px', paddingRight: '20px', line: true, positionMode: 'container' }, {
            width: '100%',
            textAlign: 'right',
            background: '#fff',
        }),
    };
};

const component = (
    id: string,
    componentName: string,
    elements: any[],
    presentation: ProcessNodePresentation,
    branchName: any = '',
) => {
    const elementsMap: Record<string, any> = {};
    const collect = (items: any[]) => items.forEach((item) => {
        elementsMap[item.id] = item;
        collect(item.elements || []);
    });
    collect(elements);
    return {
        id,
        componentName,
        nodeType: branchName?.branchType || 'AT',
        branchName,
        presentation,
        elements,
        elementsMap,
        formData: {},
        variables: [],
        variableData: {},
        apisGlobal: [],
        apiOutParam: {},
        apiOutData: {},
        events: [],
    };
};

const presentations = {
    header: { region: 'header', showInNavigator: false } as ProcessNodePresentation,
    content: { region: 'content', showInNavigator: true } as ProcessNodePresentation,
    hidden: { region: 'content', showInNavigator: false } as ProcessNodePresentation,
    control: { region: 'control', showInNavigator: false } as ProcessNodePresentation,
    footer: { region: 'footer', showInNavigator: false } as ProcessNodePresentation,
};

export const GUIDED_MOCK_PROCESS_CONFIG: GuidedProcessConfig = {
    navigator: { enabled: true, title: '智能诊断' },
    scrollMode: 'fixed-top',
};

export const GUIDED_MOCK_COMPONENTS = [
    component('mock-component-header', '诊断核心信息', [title('mock-header-title', '<b>客户核心信息</b>　号码：138****0000　客户等级：五星　当前套餐：畅享套餐', { background: '#f7fbff', borderBottom: '1px solid #dceaf5' })], presentations.header),
    component('mock-component-order', '是否有在途工单', [title('mock-order-title', '<b>是否有在途工单</b><br/>当前未查询到在途降档工单，可继续下一环节。')], { ...presentations.content, navigatorTitle: '在途工单' }),
    component('mock-component-offer', '优惠方案诊断', [title('mock-offer-title', '<b>优惠方案诊断</b><br/>当前客户可办理融合优惠与存量权益方案。')], presentations.content),
    component('mock-component-hidden', '内部信息补充', [title('mock-hidden-title', '<b>内部信息补充</b><br/>该环节正常展示，但已配置为不进入智能导航。', { background: '#fffdf5' })], presentations.hidden),
    component('mock-component-control', '流程条件判断（无页面）', [], presentations.control),
    component('mock-component-result', '挽留结果确认', [title('mock-result-title', '<b>挽留结果确认</b><br/>请核对诊断结论并选择底部操作。')], presentations.content),
    component('mock-component-footer', '底部操作通栏', [bottomBanner('mock-footer-banner')], presentations.footer),
];

export const GUIDED_MOCK_NODES = GUIDED_MOCK_COMPONENTS.map((item, index) => ({
    nodeId: `mock-node-${index + 1}`,
    componentId: item.id,
    componentType: 'business',
    componentData: JSON.parse(JSON.stringify(item)),
    presentation: item.presentation,
    parentId: index === 0 ? 'begin' : `mock-node-${index}`,
    branchIndex: '-1',
    canvasPoint: `${80 + index * 230},140`,
}));

export const GUIDED_MOCK_BASE_CONFIG = {
    config: {
        id: 'mock-guided-app',
        appName: '引导式流程改造模拟',
        appTypeId: 'mock-app-type-leaf',
        appTypeName: '生产应用-客户服务-智能诊断',
        tagTypeId: 'mock-tag-leaf',
        tagTypeName: '智能诊断',
        projectId: 'mock-project-guided',
        appCategory: '1',
        sceneType: 'process',
        provId: '0000',
        serviceTypeId: 'local-mock',
        dataType: '1',
        appDesc: '本地模拟数据，仅用于引导式流程改造',
        appLevel: '1',
        belongModule: '业务受理',
        showArea: '1',
        componentCategory: '1',
        componentStatus: '1',
    },
    id: 'mock-guided-app',
    backComponentPage: () => undefined,
};

export const GUIDED_MOCK_BUSINESS_TYPES = [
    { businessId: 'mock-business', businessName: '引导式模拟组件', businessLevel: '2', parentId: '' },
];

export const GUIDED_MOCK_APP_TYPES = [
    { appTypeId: 'mock-app-type-root', appTypeName: '生产应用', typeLevel: '1', pId: '', appTypeCategory: '1' },
    { appTypeId: 'mock-app-type-group', appTypeName: '客户服务', typeLevel: '2', pId: 'mock-app-type-root', appTypeCategory: '1' },
    { appTypeId: 'mock-app-type-leaf', appTypeName: '智能诊断', typeLevel: '3', pId: 'mock-app-type-group', appTypeCategory: '1' },
];

export const GUIDED_MOCK_TAG_TYPES = [
    { appTypeId: 'mock-tag-root', appTypeName: '业务场景', typeLevel: '1', pId: '', appTypeCategory: '1' },
    { appTypeId: 'mock-tag-group', appTypeName: '客户运营', typeLevel: '2', pId: 'mock-tag-root', appTypeCategory: '1' },
    { appTypeId: 'mock-tag-leaf', appTypeName: '智能诊断', typeLevel: '3', pId: 'mock-tag-group', appTypeCategory: '1' },
];

export const GUIDED_MOCK_PROJECTS = [
    { projectId: 'mock-project-guided', projectNm: '本地引导式改造项目' },
];
