import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

import { baseApiConvert, generateSign } from './util';

// 扩展 Axios 配置接口：声明所有自定义属性
declare module 'axios' {
    interface AxiosRequestConfig {
        showError?: boolean; // 控制是否显示错误提示
        showLoading?: boolean; // 控制是否显示加载中
        filename?: string; // 下载文件的自定义文件名（新增）
        onUploadProgress?: (progressEvent: any) => void; // 上传进度回调
    }
    interface AxiosError<T = unknown, D = any> {
        returnCode?: string; // 业务错误码
        returnMessage?: string; // 业务错误信息
    }
}

// 泛型化响应体接口
interface IResult<T = any> {
    returnCode: string;
    data: T;
    returnMessage: string;
}

// 常量定义
const DEFAULT_ERROR_MSG = '服务异常，请稍后再试';
const TIMEOUT_ERROR_MSG = '请求超时，请稍后再试';
const DOWNLOAD_ERROR_MSG = '文件下载失败，请稍后重试';

// 全局节流变量
let lastErrorTime = 0;
const THROTTLE_TIME = 2000; // 2秒
const showErrorIfNeeded = (msg: any) => {
    const now = Date.now();
    if (now - lastErrorTime >= THROTTLE_TIME) {
        lastErrorTime = now;
    }
};

/**
 * 创建 Axios 实例
 */
const instance = axios.create({
    timeout: 15000,
    timeoutErrorMessage: TIMEOUT_ERROR_MSG,
    withCredentials: true, // 跨域携带 Cookie
    headers: {
        'Content-Type': 'application/json;charset=UTF-8',
    },
});

// 请求拦截器
instance.interceptors.request.use(
    (config: AxiosRequestConfig): AxiosRequestConfig => {
        // 设置基础接口地址
        if (window.location.host && window.location.protocol) {
            config.baseURL = baseApiConvert(window.location.protocol + '//' + window.location.host + '/ngapcontrol');
        }
        // 生成签名信息
        const signInfo = generateSign();

        // 合并请求头，追加 Token
        config.headers = {
            ...config.headers,
            'X-Request-Timestamp': signInfo.timestamp,
            'X-Request-Nonce': signInfo.nonce,
            'X-Request-SignatureBase': signInfo.signatureBase
        };

        return config;
    },
    (error: AxiosError): Promise<never> => {
        return Promise.reject(error);
    },
);

// 响应拦截器
instance.interceptors.response.use(
    (response: AxiosResponse<IResult>): any => {
        const res = response.data;

        if (!res) {
            throw new Error(DEFAULT_ERROR_MSG);
        }

        if (res.returnCode === '0') {
            return res;
        }

        const errorMsg = res?.returnMessage || DEFAULT_ERROR_MSG;
        const shouldShowError = response?.config?.showError !== false;
        if (shouldShowError) {
            showErrorIfNeeded(errorMsg); // 使用节流提示
        }
        throw new Error(JSON.stringify({ code: res.returnCode, message: errorMsg }));
    },
    (error: AxiosError): Promise<never> => {
        let errorMsg = DEFAULT_ERROR_MSG;

        if (error.returnMessage?.startsWith('{')) {
            try {
                const { message } = JSON.parse(error.returnMessage);
                errorMsg = message;
            } catch {
                errorMsg = DEFAULT_ERROR_MSG;
            }
        }
        // 网络/超时/HTTP错误
        else if (error.returnCode === 'ERR_NETWORK') {
            errorMsg = '网络异常，请检查网络后重试';
        } else if (['ECONNABORTED', 'ERR_TIMED_OUT'].includes(error.returnCode!)) {
            errorMsg = TIMEOUT_ERROR_MSG;
        } else if (['ERR_BAD_REQUEST', 'ERR_BAD_RESPONSE'].includes(error.returnCode!)) {
            errorMsg = '服务接口异常，请联系管理员';
        }
        // 其他错误
        else if (error.returnMessage) {
            errorMsg = error.returnMessage;
        }

        // 显示错误提示（排除主动关闭的场景）
        const showError = error.config?.showError !== false;
        if (showError) {
            showErrorIfNeeded(errorMsg); // 使用节流提示
        }

        // 拒绝 Promise，传递错误信息
        return Promise.reject(new Error(errorMsg));
    },
);
window.requestCache = [];
// 清除缓存，每5分钟清除一次
setInterval(() => {
    window.requestCache = [];
}, 5 * 60 * 1000)
const loadCache = (url: string, data: Record<string, any> = {}, options: AxiosRequestConfig = { showError: true, showLoading: false }) => {
    let result = window.requestCache.filter((item: any) => item.url == url && item.params == JSON.stringify(data))
    if (result && result.length > 0) {
        if (result[0].result) {
            if (result[0].resultType == "success") {
                return Promise.resolve(result[0].result);
            } else {
                return Promise.reject(new Error(result[0].result));
            }
        } else {
            return new Promise((resolve, reject) => {
                let times = 0;
                const loading = () => {
                    times++;
                    let result = window.requestCache.filter((item: any) => item.url == url && item.params == JSON.stringify(data));
                    if (result && result.length > 0) {
                        if (result[0].result) {
                            if (result[0].resultType == "success") {
                                resolve(result[0].result);
                            } else {
                                reject(new Error(result[0].result));
                            }
                        } else {
                            if (times < 100) {
                                setTimeout(() => {
                                    loading();
                                }, 100)
                            } else {
                                reject(new Error(TIMEOUT_ERROR_MSG));
                            }
                        }
                    } else {
                        instance.post(url, data, options).then((res: any) => {
                            updateRequestCache(url, data, res, "success");
                            resolve(res);
                        }).catch(err => {
                            updateRequestCache(url, data, err, "fail");
                            reject(new Error(err));
                        })
                    }
                }
                loading();
            })
        }
    }
    window.requestCache.push({
        url,
        params: JSON.stringify(data)
    })
    return new Promise((resolve, reject) => {
        instance.post(url, data, options).then((res: any) => {
            updateRequestCache(url, data, res, "success");
            resolve(res);
        }).catch(err => {
            updateRequestCache(url, data, err, "fail");
            reject(new Error(err));
        })
    })
}
const updateRequestCache = (url: string, params: any, res: any, resultType: string) => {
    for (let i = 0; i < window.requestCache.length; i++) {
        if (window.requestCache[i].url == url && window.requestCache[i].params == JSON.stringify(params)) {
            window.requestCache[i].result = res;
            window.requestCache[i].resultType = resultType;
        }
    }
}
// 封装所有请求方法（含新增的 put/delete/patch/download/upload）
const request = {
    /**
     * GET 请求
     * @param url 接口地址
     * @param params URL查询参数
     * @param options 自定义配置
     */
    get<T = any>(url: string, params: Record<string, any> = {}, options: AxiosRequestConfig = { showError: true, showLoading: false }): Promise<T> {
        return instance.get(url, { params, ...options });
    },

    /**
     * POST 请求
     * @param url 接口地址
     * @param data 请求体参数
     * @param options 自定义配置
     */
    post<T = any>(url: string, data: Record<string, any> = {}, options: AxiosRequestConfig = { showError: true, showLoading: false }): Promise<T> {
        // if(url.indexOf("csf/appInterface/getInterfaceParamsAndCheck") > -1){
        //     return loadCache(url, data, options);
        // }else if(url.indexOf("csf/appInterface/execInterfaceCp") > -1){
        //     return loadCache(url, data, options);
        // }
        return instance.post(url, data, options);
    },

    /**
     * PUT 请求（全量更新）
     * @param url 接口地址
     * @param data 请求体参数
     * @param options 自定义配置
     */
    put<T = any>(url: string, data: Record<string, any> = {}, options: AxiosRequestConfig = { showError: true, showLoading: false }): Promise<T> {
        return instance.put(url, data, options);
    },

    /**
     * DELETE 请求
     * @param url 接口地址
     * @param params URL查询参数（delete请求参数通常拼在URL上）
     * @param options 自定义配置
     */
    delete<T = any>(
        url: string,
        params: Record<string, any> = {},
        options: AxiosRequestConfig = { showError: true, showLoading: false },
    ): Promise<T> {
        return instance.delete(url, { params, ...options });
    },

    /**
     * PATCH 请求（局部更新）
     * @param url 接口地址
     * @param data 请求体参数
     * @param options 自定义配置
     */
    patch<T = any>(url: string, data: Record<string, any> = {}, options: AxiosRequestConfig = { showError: true, showLoading: false }): Promise<T> {
        return instance.patch(url, data, options);
    },

    /**
     * 文件下载方法（默认POST，支持GET）
     * @param url 下载接口地址
     * @param params 请求参数（POST为请求体，GET为URL参数）
     * @param options 自定义配置（可传 filename 指定下载文件名）
     * @param method 请求方法（默认 'post'，可选 'get'）
     */
    download(
        url: string,
        params: Record<string, any> = {},
        options: AxiosRequestConfig = { showError: true, showLoading: false },
        method: 'post' | 'get' = 'post',
    ): Promise<Blob> {
        // 下载配置：强制响应类型为 blob，保留自定义配置
        const downloadConfig = {
            ...options,
            responseType: 'blob' as const, // 固定为 blob 类型
            showError: options.showError ?? true, // 兜底显示下载错误
        };

        let requestPromise: Promise<AxiosResponse<Blob>>;
        // 区分 POST/GET 下载方式
        if (method === 'post') {
            requestPromise = instance.post(url, params, downloadConfig);
        } else {
            requestPromise = instance.get(url, { params, ...downloadConfig });
        }

        // 处理下载流程
        return requestPromise
            .then((response: AxiosResponse<Blob>) => {
                // 校验 blob 数据是否有效
                if (!response?.data || response?.data?.size === 0) {
                    throw new Error(DOWNLOAD_ERROR_MSG);
                }

                // 解析文件名：优先从响应头获取，其次用自定义 filename，最后兜底
                const fileNameHeader = response.headers['filename'] || response.headers['x-filename'];
                const fileName = fileNameHeader
                    ? decodeURIComponent(fileNameHeader) // 解码中文文件名
                    : options.filename || 'download.file';

                // 创建下载链接
                const blob = new Blob([response.data], { type: response?.data?.type || 'application/octet-stream' });
                const blobUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');

                link.href = blobUrl;
                link.download = fileName;
                document?.body?.appendChild(link);
                link.click(); // 触发下载

                // 清理资源：避免内存泄漏
                setTimeout(() => {
                    document?.body?.removeChild(link);
                    URL.revokeObjectURL(blobUrl);
                }, 100);

                return response.data;
            })
            .catch((err) => {
                return Promise.reject(err);
            });
    },
    /**
     * 图片/文件上传方法
     * @param url 上传接口地址
     * @param fileParam 后端接收文件的key（如file/avatar/imgs）
     * @param file 单个File / FileList / File[]（自动兼容三种文件格式）
     * @param data 额外非文件参数（type）
     * @param options 自定义配置（支持onUploadProgress/showError/showLoading）
     * @returns Promise<T> 返回后端业务数据，与get/post方法返回值类型统一
     */
    upload<T = any>(
        url: string,
        fileParam: string,
        file: File | FileList | File[],
        data: Record<string, any> = {},
        options: AxiosRequestConfig = { showError: true, showLoading: false },
    ): Promise<T> {
        // 创建FormData，遵循multipart/form-data文件上传规范
        const formData = new FormData();

        // 兼容处理单文件/FileList/File数组，自动适配后端接收逻辑
        if (file instanceof FileList) {
            Array.from(file).forEach((f) => formData.append(fileParam, f));
        } else if (Array.isArray(file)) {
            file.forEach((f) => formData.append(fileParam, f));
        } else {
            formData.append(fileParam, file);
        }

        // 追加非文件参数，统一转字符串避免后端解析类型问题
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, String(value));
        });

        // 构建合法请求头：过滤undefined/null，严格匹配Axios头信息类型要求
        const validHeaders: Record<string, string | number | boolean> = {};
        if (options.headers) {
            Object.entries(options.headers).forEach(([key, val]) => {
                if (val !== undefined && val !== null) {
                    validHeaders[key] = val;
                }
            });
        }

        // 上传配置
        const uploadConfig = {
            ...options,
            isBusiness: true, // 标记为业务请求
            headers: validHeaders, // 确保headers为非空合法对象
        } as AxiosRequestConfig;

        // 非空校验后删除Content-Type，让浏览器自动生成带boundary的上传头
        if (uploadConfig.headers && uploadConfig.headers['Content-Type']) {
            delete uploadConfig.headers['Content-Type'];
        }

        // 返回data属性，匹配Promise<T>声明
        return instance.post<T>(url, formData, uploadConfig) as Promise<T>;
    },
};

export default request;
