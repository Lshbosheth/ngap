/**
 * 对组件配置的api进行处理
 */

import { ApiConfig } from '../types';
import { handleArrayVariable } from './util';
import { UseMaterialTools } from './useMaterialTools';
import { get } from 'lodash-es';
import { isObject } from 'lodash-es';
import { isPlainObject } from 'lodash-es';
import getFieldFromAPI from './../../utils/apiUtilForInterface';

interface UseHandleApiReturn {
    handleApi: (api: ApiConfig, sendParams: any) => any;
    mergeParams: (method: string, replaceData: 'merge' | 'cover' | 'reserve', params: any, sendParams: any) => any;
}

/**
 * handleAapi自定义Hook
 */
export function UseHandleApi(): UseHandleApiReturn {
    const materialTools = UseMaterialTools();

    /**
     * 请求处理，事件行为模块配置的请求也会执行此方法
     * @param api 组件接口配置
     * @param sendParams 发送参数
     * @returns 返回结果
     */
    const handleApi = async (
        api: ApiConfig & { actionType?: string; filename?: string; params?: object } = { sourceType: 'json', id: '', source: '', sourceField: '' },
        sendParams: any = {},
    ) => {
        console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
        if (api.sourceType === 'json') {
            let renderData = api.source;
            if (isPlainObject(renderData)) {
                if (typeof api.sourceField === 'object') {
                    if (api.sourceField.type === 'static') {
                        renderData = api.sourceField.value ? get(renderData, api.sourceField.value) : renderData;
                    } else {
                        renderData = materialTools.renderFormula(api.sourceField.value, renderData);
                    }
                } else if (typeof api.sourceField === 'string' && api.sourceField) {
                    renderData = get(renderData, api.sourceField);
                }
            }

            return { code: 0, data: renderData };
        } else if (api.sourceType === 'api' || api.actionType === 'request' || api.actionType === 'download') {
            if (!api.id) {
                return { code: 0, data: '' };
            }
            // const apis = pageStore.getState().page.pageData.config.apis;
            const { params } = api || {};
            const result: any = {
                code: 'returnCode',
                data: 'bean',
                msg: 'returnMessage',
            };
            const tips: any = {};
            // 处理参数
            const config: any = mergeParams('post', 'merge', params, sendParams);
            const response: any = await getFieldFromAPI(api.id, '', config.data, 1);
            let res: { [key: string]: any } | any[] = response;
            // 判断是否是数组，如果是数组，则拼接标准结构进行返回，严格意义将，此处必须返回完整结构
            if (Array.isArray(res) || typeof res === 'string' || typeof res === 'number' || typeof res === 'boolean') {
                res = { code: 0, data: res, msg: '' };
            }
            // 字段映射
            const code = result.code ? Number(res[result.code] || 0) : 0;
            const data = result.data ? res[result.data] : res;
            const msg = result.msg ? res[result.msg] || '' : '';

            // if (code === result.codeValue) {
            //     // 如果开启了系统提示，则优先使用系统提示
            //     if (tips?.isSuccess) {
            //         msg && message.success(msg);
            //     } else if (tips?.success) {
            //         // 最后使用自定义错误
            //         message.success(tips?.success);
            //     }
            // } else {
            //     // 如果开启了系统错误，则优先使用系统报错
            //     if (tips?.isError && msg) {
            //         message.error(msg);
            //     } else if (tips?.fail) {
            //         // 最后使用自定义错误
            //         message.error(tips?.fail);
            //     }
            // }
            // 根据 sourceField 解析数据
            let renderData = data;
            if (typeof api.sourceField === 'object') {
                if (api.sourceField.type === 'static') {
                    renderData = api.sourceField.value ? get(res, api.sourceField.value) : data;
                } else {
                    if (api.sourceField.value == 'List') {
                        const bean = data;
                        const keys = Object.keys(bean);
                        const _result = [];
                        for (let i = 0; i < bean[keys[0]].length; i++) {
                            const obj: any = {};
                            keys.forEach((key) => {
                                obj[key] = bean[key][i];
                            });
                            _result.push(obj);
                        }
                        renderData = _result;
                    } else if (api.sourceField.value == 'Map') {
                        // renderData = data;
                    } else {
                        renderData = materialTools.renderFormula(api.sourceField.value, res);
                    }
                }
            } else if (typeof api.sourceField === 'string' && api.sourceField) {
                renderData = get(res, api.sourceField);
            }
            return { code: code === result.codeValue ? 0 : code, data: renderData, originData: data, msg };
        } else {
            // 解析动态变量
            if (api.name?.value) {
                const value = materialTools.renderFormula(api.name?.value, {});
                return { code: 0, data: value };
            }
            return { code: 0, data: '' };
        }
    };
    /**
     * 合并处理参数，包含静态数据和动态数据
     * @param method 当前请求方法
     * @param replaceData 是否替换默认参数
     * @param params 接口中配置的默认参数列表
     * @param sendParams 从事件中传递的参数对象，优先级高于params
     * @returns 合并后的参数对象
     */
    const mergeParams = (method: string, replaceData: 'merge' | 'cover' | 'reserve', params: any = [], sendParams: any) => {
        const values = handleArrayVariable(params, sendParams);
        let mergeValues: any = {};
        // 参数合并
        if (replaceData === 'merge') {
            // 基础类型不能合并，否则会报错
            if (Array.isArray(sendParams) || typeof sendParams !== 'object') {
                if (Object.keys(values).length > 0) {
                    mergeValues = values;
                } else {
                    mergeValues = sendParams;
                }
            } else {
                mergeValues = { ...values, ...sendParams };
            }
        } else if (replaceData === 'cover') {
            // 覆盖的前提是，sendParams 必须有值，否则会保留当前参数
            if ((isObject(sendParams) && Object.keys(sendParams).length > 0) || (!isObject(sendParams) && sendParams)) {
                mergeValues = sendParams;
            } else {
                mergeValues = values;
            }
        } else {
            mergeValues = values;
        }
        // 根据请求方法，处理参数
        if (method === 'GET' || method === 'DELETE') {
            return {
                params: mergeValues,
            };
        } else {
            return {
                data: mergeValues,
            };
        }
    };

    return {
        handleApi,
        mergeParams,
    };
}
