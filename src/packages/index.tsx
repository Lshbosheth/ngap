import React, { lazy, useState, useEffect } from 'react';
import { message } from '@/utils/AntdGlobal';
import request from './../utils/request';
import * as Babel from '@babel/standalone';
import less from 'less';
import { objectToFormData } from './../utils/objectToFormData'; // 对象转 FormData 工具函数
import { useAppContext } from './../utils/AppProvider';
import { handleApi, mergeParams } from './utils/handleApi';
import { crossApiUserInfo } from '@/stores/crossapiStore';
import './index.less';
import { cloneDeep } from 'lodash-es';

// 将 handleApi 和 mergeParams 挂载到 globalThis 对象上
if (typeof globalThis !== 'undefined') {
    (globalThis as any).__NGAP_UTILS__ = {
        handleApi,
        mergeParams,
        useAppContext
    };
}

interface EditorFile {
    id: string;
    name: string;
    content: string;
    language: string;
}
const componentMap: { [key: string]: any } = {};
const userInfo = crossApiUserInfo.getState().userInfo;
/**
 * 动态加载组件和Schema配置
 * 分别导入组件文件和Schema配置文件，以便于打包分离
 */
const componentModules: { [key: string]: () => Promise<any> } = import.meta.glob('./[a-zA-Z]+/**/[A-Z][a-zA-Z]*.{tsx,ts}');
const schemaModules: { [key: string]: () => Promise<any> } = import.meta.glob('./[a-zA-Z]+/**/Schema.{tsx,ts}');

// 合并所有模块，保持原有使用方式
const modules: { [key: string]: () => Promise<any> } = { ...componentModules, ...schemaModules };

for (const path in modules) {
    const [type, name] = path.split('/').slice(-2);
    if (type === 'NgapRender') continue;
    if (name.indexOf('Schema') > -1) {
        componentMap[type + 'Config'] = modules[path];
    }
    if (type === name.split('.')?.[0]) {
        componentMap[type] = lazy(modules[path]);
    }
}

// 编译挂载tsx代码
const onPreviewTsx = async (code: any, elementId: string) => {
    try {
        // 1. 准备自动注入的依赖代码 - 使用全局对象传递工具方法
        const injectedCode = `
            // 从全局对象获取 handleApi 、 mergeParams 、  useAppContext方法
            const ngapUtils = (typeof globalThis !== 'undefined' && globalThis.__NGAP_UTILS__) || {};
            const { handleApi = () => ({ code: 0, data: '' }), mergeParams = () => ({}), useAppContext = () => ({}) } = ngapUtils;
            ${code}
        `;

        // 2. 编译 TSX -> JS（保留 ES 模块语法 modules: false）
        const result = Babel.transform(injectedCode, {
            presets: [
                ['typescript', { isTSX: true, allExtensions: true }], // 支持 TSX
                'react', // 转换 JSX
                ['env', { modules: false }], // 不转换模块，保留 export
            ],
            filename: 'dynamic.tsx',
        });
        const compiledCode: any = result.code;

        // 3. 创建 Blob URL 并作为 ES 模块动态导入
        const blob = new Blob([compiledCode], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);

        // 4. 导入模块，获取默认导出的组件
        const module = await import(url);
        const Component = module.default;
        componentMap[elementId] = Component;
    } catch (error: any) {
        console.error('tsx文件编译失败,请按照远程组件规范要求开发！', error);
    }
};

// 编译挂载ts代码
const onPreviewJs = async (code: any, elementId: string) => {
    try {
        // 1. 编译 TS -> JS
        const result = Babel.transform(code, {
            presets: [
                ['typescript', { isTSX: true, allExtensions: true }], // 支持 TSX
                'react', // 转换 JSX
                ['env', { modules: false }], // 不转换模块，保留 export
            ],
            filename: 'dynamic.tsx',
        });
        const compiledCode: any = result.code;
        // 2. 创建 Blob URL 并作为 ES 模块动态导入
        const blob = new Blob([compiledCode], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        // 3. 导入模块，获取默认导出的组件
        const module = await import(url);
        const jsData = module.default;
        componentMap[elementId + 'Config'] = module;
    } catch (error: any) {
        console.error('js文件编译失败,请按照远程组件规范要求开发！', error);
    }
};

// 编译挂载Less代码
const onPreviewLess = async (code: any, elementId: string) => {
    if (!code) {
        return;
    }
    try {
        // 编译 Less
        less.render(code, { compress: true })
            .then((output) => {
                const css = output.css;
                if (!css) return;
                const style = document.createElement('style');
                style.id = 'customize' + elementId; // 便于后续清理
                style.innerHTML = css;
                document.head.appendChild(style);
            })
            .catch((error) => {
                console.error('less文件编译失败,请按照远程组件规范要求开发！', error);
            });
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
    } catch (error) { }
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

const fetchAllFileStream = async (fetchFileParams: any[], elementId:string) => {
    const result: { [key: string]: string } = {}; // 存储结果的键值对对象

    try {
        // 构建 URL 数组，保持原始顺序
        const urls = fetchFileParams.map(item => item.url).filter(Boolean);

        if (urls.length === 0) {
            return result;
        }

        // 调用批量获取文件接口
        const params = {
            params: {
                elementId: elementId,
                fetchFileParams: fetchFileParams,
            }
        };
        const res = await request.post('/csf/call/getElementFileInfo',params);

        // 处理接口返回结果，按照入参数组的 name 字段作为键名
        if (res && res.bean) {
            // 根据 URL 匹配对应的 name
            fetchFileParams.forEach((item) => {
                if (item.name && res.bean[item.name]) {
                    // 获取文件扩展名用于语言识别
                    const language = item.url ? getLanguageByExtension(item.url.split('.').pop() || 'text') : 'text';
                    const name = item.url ? item.url.split('/').pop() || '' : '';

                    // 处理文件内容
                    const file = downloadFile({
                        id: (Date.now() + Math.random()).toString(),
                        name: name,
                        content: res.bean[item.name].bean.demo,
                        language: language,
                    });

                    if (file) {
                        file.text().then(text => {
                            result[item.name] = text;
                        }).catch(error => {
                            console.error(`文件 ${item.name} 处理失败:`, error);
                        });
                    }
                }
            });

            // 由于 file.text() 是异步的，需要等待所有文件处理完成
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        return result;
    } catch (error) {
        console.error('批量获取文件流失败:', error);
        return result;
    }
};


// 异步挂载自定义元素
const elementInfoFun = async (elementInfo: any) => {
    for (const item of elementInfo) {
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
        // 模拟渲染自定义元素
        // const tsxCode = `
        //     const MImage1 = ({ id, type, config, onClick }: any, ref: any) => {
        //         const { useState, useImperativeHandle } = React;
        //         const { Image } = antd;
        //         const [visible, setVisible] = useState(true);
        //         // 对外暴露方法
        //         useImperativeHandle(ref, () => {
        //             return {
        //                 show() {
        //                     setVisible(true);
        //                 },
        //                 hide() {
        //                     setVisible(false);
        //                 },
        //             };
        //         });
        //         const handleClick = () => {
        //             onClick?.();
        //         };
        //         return visible && <Image style={config.style} {...config.props} data-id={id} data-type={type} className="customize_image" onClick={handleClick} />;
        //     };
        //     export default React.forwardRef(MImage1);
        // `;
        // onPreviewTsx(tsxCode, item.elementId);
        // const jsCode = `
        //     export default {
        //         // 组件属性配置JSON
        //         attrs: [
        //             {
        //                 type: 'Title',
        //                 label: '基础配置',
        //                 key: 'basic',
        //             },
        //             {
        //                 type: 'Input',
        //                 label: '图片地址',
        //                 name: 'src',
        //             },
        //             {
        //                 type: 'InputPx',
        //                 label: '图片宽度',
        //                 name: 'width',
        //             },
        //             {
        //                 type: 'InputPx',
        //                 label: '图片高度',
        //                 name: 'height',
        //             },
        //             {
        //                 type: 'Switch',
        //                 label: '是否预览',
        //                 name: 'preview',
        //             },
        //         ],
        //         config: {
        //             // 组件默认属性值
        //             props: {
        //                 src: '/ngap/imgs/kaixinwang0.png',
        //                 preview: false,
        //                 width: '200px',
        //                 height: '200px',
        //                 alt: '',
        //             },
        //             // 组件样式
        //             style: {},
        //         },
        //         // 组件事件
        //         events: [
        //             {
        //                 value: 'onClick',
        //                 name: '点击事件',
        //             },
        //         ],
        //         // 组件接口
        //         api: {},
        //     };
        // `;
        // onPreviewJs(jsCode, item.elementId);
        // const lessCode1 = `
        //     .customize_image {
        //         height: 300px;
        //     }
        // `;
        // onPreviewLess(lessCode1, item.elementId);
    }
};

// 获取自定义元素
const queryElementFun = (elementId: string) => {
    try {
        request
            .post('/element/queryElementList', {
                params: {
                    elementId: elementId,
                    provId: userInfo.provinceId,
                },
            })
            .then((res) => {
                const elementInfo = res.beans.filter((item: any) => item.elementStatus === '2'); // 已发布自定义元素
                if (elementInfo.length > 0) {
                    // 审核通过或者初始化加载，添加自定义元素
                    elementInfoFun(elementInfo);
                } else {
                    // 提交审核，移除自定义元素
                    componentMap[elementId] = null;
                    componentMap[elementId + 'Config'] = null;
                }
            })
            .catch((err) => { });
    } catch (error) {
        message.error('元素查询失败');
    } finally {
    }
};

// 查询自定义元素
queryElementFun('');

// 组件缓存 - 避免重复getComponent调用
const componentCache: { [key: string]: any } = {};

// 清除指定组件的缓存
export const clearComponentCache = (name: string) => {
    delete componentCache[name];
};

// 清除所有组件缓存
export const clearAllComponentCache = () => {
    Object.keys(componentCache).forEach((key) => delete componentCache[key]);
};

// 导出一个函数来获取注册的组件（带缓存）
export const getComponent = (name: string) => {
    if (componentCache[name] !== undefined) {
        return componentCache[name];
                        }
    let result;
    if (typeof componentMap[name] === 'function') {
        result = componentMap[name]();
        } else {
        result = componentMap[name] || null;
        }
    componentCache[name] = result;
    return result;
};

// 获取返回的类型
export const getComponentType = (name: string) => {
    return typeof componentMap[name];
};

// 更新画布中全局自定义元素
export const updateComponent = (elementId: string) => {
    queryElementFun(elementId);
};
