export type LocalMockMode = 'guided' | 'element';

const readHashSearch = () => {
    if (typeof window === 'undefined') return new URLSearchParams();
    const queryIndex = window.location.hash.indexOf('?');
    return new URLSearchParams(queryIndex >= 0 ? window.location.hash.slice(queryIndex + 1) : '');
};

export const getLocalMockMode = (): LocalMockMode | undefined => {
    if (typeof window === 'undefined') return undefined;
    const value = new URLSearchParams(window.location.search).get('mock') || readHashSearch().get('mock');
    return value === 'guided' || value === 'element' ? value : undefined;
};

export const isLocalMockMode = (mode?: LocalMockMode) => {
    const current = getLocalMockMode();
    return mode ? current === mode : Boolean(current);
};

