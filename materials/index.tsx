import { message } from '@materials/utils/AntdGlobal';
import request from './utils/request';
import { handleApi, mergeParams } from './utils/handleApi';
import less from 'less';
import { objectToFormData } from './../src/utils/objectToFormData'; // 对象转 FormData 工具函数

(window as any).__NGAP_UTILS__ = {
        handleApi,
        mergeParams,
    };

const componentMap: { [key: string]: any } = {};
let componentsLoaded = false;

async function loadComponents() {
    if (componentsLoaded) return componentMap;
    const Components = await import('./components');
Object.keys(Components).forEach(key => {
    componentMap[key] = (Components as any)[key];
});
    componentsLoaded = true;
    return componentMap;
}

(window as any).__NGAP_COMPONENTS__ = {
    loadComponents,
    getComponent: (name: string) => componentMap[name],
};

const onPreviewTsx = async (code: any, elementId: string): Promise<void> => {
    try {
        await loadComponents();
        const Babel = await (window as any).__BABEL_STANDALONE_LOADER__();
        const injectedCode = `
            const ngapUtils = (typeof globalThis !== 'undefined' && globalThis.__NGAP_UTILS__) || {};
            const { handleApi = () => ({ code: 0, data: '' }), mergeParams = () => ({}) } = ngapUtils;
            ${code}
        `;
        const result = Babel.transform(injectedCode, {
            presets: [
                ['typescript', { isTSX: true, allExtensions: true }],
                'react',
                ['env', { modules: false }],
            ],
            filename: 'dynamic.tsx',
        });
        const compiledCode: any = result.code;
        const blob = new Blob([compiledCode], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        const module = await import(url);
        componentMap[elementId] = module.default;
    } catch (error: any) {
        console.error('tsx文件编译失败,请按照远程组件规范要求开发！', error);
    }
};

const onPreviewJs = async (code: any, elementId: string): Promise<void> => {
    try {
        await loadComponents();
        const Babel = await (window as any).__BABEL_STANDALONE_LOADER__();
        const result = Babel.transform(code, {
            presets: [
                ['typescript', { isTSX: true, allExtensions: true }],
                'react',
                ['env', { modules: false }],
            ],
            filename: 'dynamic.tsx',
        });
        const compiledCode: any = result.code;
        const blob = new Blob([compiledCode], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        const module = await import(url);
        componentMap[elementId] = module;
    } catch (error: any) {
        console.error('js文件编译失败,请按照远程组件规范要求开发！', error);
    }
};

// 编译挂载Less代码
const onPreviewLess = async (code: any, elementId: string): Promise<void> => {
    if (!code) {
        return;
    }
    try {
        const { css } = await less.render(code, { compress: true });
                if (!css) return;
                const style = document.createElement('style');
        style.id = 'customize' + elementId;
                style.innerHTML = css;
                document.head.appendChild(style);
    } catch (error) {
        console.error('less文件编译失败,请按照远程组件规范要求开发！', error);
    }
};

// 映射文件的MIME类型
const extensionToMimeType = (extension: string | undefined) => {
    switch (extension) {
        case 'js':
            return 'application/javascript';
        case 'tsx':
            return 'text/javascript';
        case 'ts':
            return 'application/typescript';
        case 'json':
            return 'application/json';
        case 'less':
            return 'text/less';
        case 'zip':
            return 'application/zip';
        default:
            return 'text/plain';
    }
};

// 把content转化为File类型
const downloadFile = (item: any) => {
    try {
        const extension = item.name?.split('.').pop()?.toLowerCase();
        const fileType = extensionToMimeType(extension);

        // 创建Blob对象
        const blob = new Blob([item.content], { type: fileType || 'text/plain' });
        return new File([blob], item.name, {
            type: fileType,
            lastModified: Date.now(),
        });
    } catch (error) {
        console.error('下载文件失败:', error);
        return null;
    }
};

// 文件类型映射
const getLanguageByExtension = (ext: string) => {
    switch (ext) {
        case 'tsx':
            return 'typescript';
        case 'ts':
            return 'typescript';
        case 'js':
            return 'javascript';
        case 'less':
            return 'less';
        default:
            return 'text';
    }
};

// 源文件路径获取文件流
const fetchFileStream = async (url: string | undefined) => {
    if (!url) {
        return;
    }
    try {
        const params = {
            url: url,
        };
        const res = await request.post('/csf/call/getFileFromOss', objectToFormData(params));
        const language = url.split('.').pop() || 'text';
        const name = url.split('/').pop() || '';
        const file = downloadFile({
            id: (Date.now() + Math.random()).toString(),
            name: name,
            content: res.bean.demo,
            language: getLanguageByExtension(language),
        });
        return file?.text();
    } catch (error) {
        return null;
    }
};

const fetchAllFileStream = async (fetchFileParams: any[], elementId: string) => {
    const result: { [key: string]: string } = {};

    try {
        const urls = fetchFileParams.map(item => item.url).filter(Boolean);
        if (urls.length === 0) {
            return result;
        }

        const params = {
            params: {
                elementId: elementId,
                fetchFileParams: fetchFileParams,
            }
        };
        const res = await request.post('/csf/call/getElementFileInfo', params);

        if (res && res.bean) {
            const textPromises = fetchFileParams.map(async (item) => {
                if (item.name && res.bean[item.name]) {
                    const language = item.url ? getLanguageByExtension(item.url.split('.').pop() || 'text') : 'text';
                    const name = item.url ? item.url.split('/').pop() || '' : '';

                    const file = downloadFile({
                        id: (Date.now() + Math.random()).toString(),
                        name: name,
                        content: res.bean[item.name].bean.demo,
                        language: language,
                    });

                    if (file) {
                        const text = await file.text();
                            result[item.name] = text;
                    }
                }
            });

            await Promise.all(textPromises);
        }

        return result;
    } catch (error) {
        console.error('批量获取文件流失败:', error);
        return result;
    }
};


// 异步挂载自定义元素
const elementInfoFun = async (elementInfo: any): Promise<void> => {
    const promises: Promise<void>[] = [];
    for (const item of elementInfo) {
        const promise = (async () => {
            const fetchFileParams: any[] = [
                {
                    name: 'lessCode',
                    url: item.elementCssDemo,
                },
                {
                    name: 'jsCode',
                    url: item.elementConfigDemo,
                },
                {
                    name: 'tsxCode',
                    url: item.elementJsDemo,
                }
            ]
            const fetchFileData = await fetchAllFileStream(fetchFileParams, item.elementId);
            // const lessCode = await fetchFileStream(item.elementCssDemo);
            // await onPreviewLess(lessCode, item.elementId);
            await onPreviewLess(fetchFileData.lessCode, item.elementId);
            // const jsCode = await fetchFileStream(item.elementConfigDemo);
            // await onPreviewJs(jsCode, item.elementId);
            await onPreviewJs(fetchFileData.jsCode, item.elementId);
            // const tsxCode = await fetchFileStream(item.elementJsDemo);
            // await onPreviewTsx(tsxCode, item.elementId);
            await onPreviewTsx(fetchFileData.tsxCode, item.elementId);
        })();
        promises.push(promise);
    }
    await Promise.all(promises);
};

export const queryElementFun = async (responseData: any): Promise<void> => {
    try {
        await loadComponents();
        const elementInfo = responseData.filter((item: any) => item.elementStatus === '2');
        if (elementInfo.length > 0) {
            await elementInfoFun(elementInfo);
        }
    } catch (error) {
        message.error('元素处理失败');
    }
};

// 导出一个函数来获取注册的组件
export const getComponent = (name: string) => {
    const component = componentMap[name];
    if (!component) {
        return null;
    }

    // 如果组件是工厂函数（返回React组件的函数），则调用它
    // 这是为了支持懒加载场景，但不能用于普通的React组件
    if (typeof component === 'function' && component.isLazyFactory) {
        return component();
    }

    // 否则直接返回组件（普通React组件或已加载的动态组件）
    return component;
};

export const module = componentMap;

// 辅助函数：标记一个函数为懒加载工厂函数
export const createLazyFactory = (factoryFn: () => any) => {
    const lazyFn = factoryFn as any;
    lazyFn.isLazyFactory = true;
    return lazyFn;
};

// 清理动态加载的组件缓存
export const clearElementComponents = () => {
    Object.keys(componentMap).forEach(key => {
        delete componentMap[key];
    });
    componentsLoaded = false;
};

// 清理 Babel 缓存
export const clearBabelCache = () => {
    if ((window as any).Babel) {
        (window as any).Babel = null;
    }
    if ((window as any).__BABEL_STANDALONE_LOADER__) {
        (window as any).__BABEL_STANDALONE_LOADER__ = null;
    }
};

(window as any).__BABEL_STANDALONE_LOADER__ = async () => {
    if (!(window as any).Babel) {
        const Babel = await import('@babel/standalone');
        (window as any).Babel = Babel.default || Babel;
    }
    return (window as any).Babel;
};

window.addEventListener('DOMContentLoaded', () => {
    loadComponents();
});
