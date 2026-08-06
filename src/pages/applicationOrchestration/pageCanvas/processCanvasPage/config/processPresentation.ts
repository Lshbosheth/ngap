import type { GuidedProcessConfig, ProcessNodePresentation } from '../processCanvasPageType';

export const DEFAULT_NODE_PRESENTATION: ProcessNodePresentation = {
    region: 'content',
    showInNavigator: true,
    navigatorTitle: '',
};

export const DEFAULT_GUIDED_PROCESS_CONFIG: GuidedProcessConfig = {
    navigator: {
        enabled: true,
        title: '智能诊断',
    },
    scrollMode: 'fixed-top',
};

export const normalizeNodePresentation = (value?: Partial<ProcessNodePresentation>): ProcessNodePresentation => {
    const region = ['header', 'content', 'footer', 'control'].includes(value?.region || '')
        ? value!.region!
        : DEFAULT_NODE_PRESENTATION.region;
    return {
        ...DEFAULT_NODE_PRESENTATION,
        ...value,
        region,
        showInNavigator: region === 'content' ? value?.showInNavigator !== false : false,
    };
};

export const normalizeProcessConfig = (value?: Partial<GuidedProcessConfig>): GuidedProcessConfig => ({
    navigator: {
        ...DEFAULT_GUIDED_PROCESS_CONFIG.navigator,
        ...(value?.navigator || {}),
    },
    scrollMode: value?.scrollMode === 'full-page' ? 'full-page' : 'fixed-top',
});

