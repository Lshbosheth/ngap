/**
 * 物料工具箱
 */

import dayjs from 'dayjs';
import { usePageStore } from './../stores/pageStore';
import { ComponentType } from './../types';
import { get } from 'lodash-es';
import { cloneDeep } from 'lodash-es';
import copy from 'copy-to-clipboard';
import storage from './storage';
import CryptoJS from 'crypto-js';
import parse, { HTMLReactParserOptions } from 'html-react-parser';
import DOMPurify from 'dompurify';
import { isNil } from 'lodash-es';

/**
 * 生成ID
 * @param name
 * @returns
 */
export const createId = (name: string = 'Ngap', len = 11) => {
    return (
        name +
        '_' +
        Number(Math.random().toString().substring(2, 12) + Date.now())
            .toString(36)
            .slice(0, len)
    );
};
/**
 * 数字格式化，支持数字、金额、百分百；
 * @param num
 * @returns
 */
export const formatNumber = (num?: number | string, formatType?: 'decimal' | 'currency' | 'percent') => {
    if (!num) return '0.00';
    const numStr = num?.toString();
    const a = parseFloat(numStr);
    if (isNaN(a)) return numStr;
    if (!formatType) return a.toLocaleString();
    return a.toLocaleString('zh-CN', { style: formatType, currency: 'CNY' });
};

/**
 * 格式化日期
 * @param date
 * @param rule
 * @returns
 */
export const formatDate = (date?: Date | string, rule: string = 'YYYY-MM-DD HH:mm:ss') => {
    return date ? dayjs(date).format(rule) : '';
};

// 获取单个日期
export const getDateByType = (type: string) => {
    const date = new Date();
    if (!type) return undefined;
    if (type == 'today') return dayjs(date.getTime());
    if (type == 'yesterday') {
        date.setDate(date.getDate() - 1);
    }
    if (type == 'last7') {
        date.setDate(date.getDate() - 7);
    }
    if (type == 'last30') {
        date.setMonth(date.getMonth() - 1);
    }
    if (type == 'last90') {
        date.setMonth(date.getMonth() - 3);
    }
    return dayjs(date.getTime());
};
/**
 * 获取日期范围
 * now: 当前时间戳
 * today: 今天0-24点
 * yesterday: 昨天0-24点
 * last7: 最近7天
 * last30: 最近30天
 * last60: 最近60天
 * last90: 最近90天
 * curWeek: 本周
 * lastWeek: 上周
 * curMonth: 本月
 * curYear: 本年
 * lastYear: 去年
 * curQuarter: 当前季度
 * @returns [startTime,endTime]
 */
export const getDateRangeByType = (type: string) => {
    const startDate = new Date();
    const endDate = new Date();
    if (!type) return [undefined, undefined];
    // 今天、本周、本月、本年
    if (['today', 'curWeek', 'curMonth', 'curYear', 'curQuarter'].includes(type)) {
        if (type == 'today') {
            //默认即为当天
        } else if (type == 'curWeek') {
            startDate.setDate(startDate.getDate() - startDate.getDay() + 1);
        } else if (type == 'curMonth') {
            startDate.setDate(1);
        } else if (type == 'curYear') {
            startDate.setDate(1);
            startDate.setMonth(0);
        } else if (type == 'curQuarter') {
            startDate.setDate(1);
            const month = startDate.getMonth();
            startDate.setMonth(Math.floor(month / 3) * 3);
        }
        return [dayjs(startDate.getTime()), dayjs(endDate.getTime())];
    }
    // 昨天、上周、上月
    if (['yesterday', 'lastWeek', 'lastMonth', 'last3Month', 'lastYear'].includes(type)) {
        if (type == 'yesterday') {
            startDate.setDate(startDate.getDate() - 1);
        } else if (type == 'lastWeek') {
            startDate.setDate(startDate.getDate() - 7);
        } else if (type == 'lastMonth') {
            startDate.setMonth(startDate.getMonth() - 1);
        } else if (type == 'last3Month') {
            startDate.setMonth(startDate.getMonth() - 3);
        } else if (type == 'lastYear') {
            startDate.setFullYear(startDate.getFullYear() - 1);
        }
        return [dayjs(startDate.getTime()), dayjs(endDate.getTime())];
    }
};

/**
 * 判断变量是否为空
 */
export const isNull = (value: any) => {
    if (value === undefined || value === null) return true;
    return false;
};

/**
 * 判断变量是否为空
 */
export const isNotEmpty = (value: any) => {
    if (value === '' || value === undefined || value === null) return false;
    return true;
};

/**
 * 复制文本到剪切板
 * @param text 复制内容
 * @param callback 兼容历史代码，作为成功识别的回调,1:成功 2:失败
 */
export function copyText(text: string) {
    return copy(text);
}

/**
 * 模板解析:
 * 1. ${ id } => 101
 * 2. ${ status == 0 ? 1:0 } => 1
 */
export function renderTemplate(template: string, data: any) {
    return template?.replace(/\$\{([^}]+)\}/g, (match, key) => {
        if (key.includes('?')) {
            try {
                const fn = new Function('param', `return param.${key}`);
                return fn(data);
            } catch (error) {
                return key;
            }
        }
        return get(data, key) || '';
    });
}

/**
 * 获取页面变量
 */
export function getPageVariable(name?: string) {
    const pageStore = usePageStore.getState()?.page?.pageData;
    const data: { [key: string]: any } = {};
    if (pageStore?.variables) {
        pageStore.variables.forEach((item) => {
            data[item.name] = pageStore?.variableData?.[item.name] ?? item.defaultValue;
        });
    }
    return name ? data[name] : data;
}

/**
 * 获取页面接口出参
 */
export function getPageApiData() {
    const pageData = usePageStore.getState()?.page?.pageData;
    const apisGlobal = pageData?.apisGlobal || [];
    const data: { [key: string]: any } = {};
    apisGlobal.forEach((item: any) => {
        data['id_' + item.id] = pageData?.apiOutData?.['id_' + item.id] ? pageData?.apiOutData?.['id_' + item.id] : {};
    });
    return data;
}
/**
 * 创建动态函数
 */
export function createFunction(params: Array<string> | string, body: string) {
    // 删除注释
    const scripts = body
        .replace(/^\s*\/\/.*$/gm, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .trim();
    // 将参数列表转换为字符串
    const paramStr = Array.isArray(params) ? params.join(', ') : params;
    // 支持内部嵌套函数
    if (scripts.startsWith('function')) {
        return new Function(paramStr, `return ${scripts};`);
    }
    // 构造函数体
    const funcStr = scripts.indexOf('return') > -1 ? scripts : `return ${scripts};`;
    return new Function(paramStr, funcStr);
}

// 循环组件渲染逻辑表达式
export function renderAsyncFormula(formula: string, eventParams?: any, loopVariable: any = {}) {
    try {
        if (!formula) return '';
        // 通过正则获取表单ID
        // eslint-disable-next-line no-useless-escape
        const formIds: Array<string> = formula.match(/([A-Za-z]+_\w+)\.[\w\.]*/g) || [];
        const originIds: Array<string> = [...new Set(formIds.map((id) => id.split('.')[0]))];
        const fnParams: Array<string> = ['context', 'eventParams'];
        const {
            page: { pageData },
            userInfo,
        } = usePageStore.getState();
        const formData = cloneDeep(pageData.formData || {});
        originIds.forEach((id: string) => {
            // 如果绑定的是表单项，则通过Form实例对象获取对应表单值
            const formValues = pageData.formData?.[id] || {};
            if (!formData?.id) {
                formData[id] = formatFormValues(pageData.elementsMap, formValues);
            }
        });
        // let formulaArr = formula.split(".");
        // if (formulaArr[1] == "api") {
        //   let result: any = pageData.apiOutData?.[formulaArr[2]] || {};
        //   return result[formulaArr[3]]
        // }
        const variableData = getPageVariable();
        const dynamicFunc = createFunction(fnParams, formula);
        // 添加日期格式化
        const FORMAT = (date: any, fmt: string = 'YYYY-MM-DD HH:mm:ss') => {
            return dayjs(date).format(fmt);
        };
        // 这样可以保持循环组件内部的直接传递方式的性能优势
        const actualLoopVariable = loopVariable;
        const apiData = getPageApiData();
        const context = {
            store: userInfo,
            variable: variableData,
            api: apiData,
            eventParams,
            forEachValue: actualLoopVariable,
            FORMAT,
            ...formData,
        };
        const result = dynamicFunc(context, eventParams || {});
        if (typeof result === 'function') return result(context, eventParams || {});
        return result;
    } catch (error) {
        throw {
            message: '表达式解析失败：',
            error: error,
        };
    }
    return '';
}

/**
 * 渲染逻辑表达式
 * @param formula 表达式字符串
 * @param eventParams 表达式参数，在事件流执行的过程中，如果调用的是脚本运行，则会传入上一个事件流的返回值
 */
export function renderFormula(formula: string, eventParams?: any, loopVariable: any = {}) {
    try {
        if (!formula) return '';
        // 通过正则获取表单ID
        // eslint-disable-next-line no-useless-escape
        const formIds: Array<string> = formula.match(/([A-Za-z]+_\w+)\.[\w\.]*/g) || [];
        const originIds: Array<string> = [...new Set(formIds.map((id) => id.split('.')[0]))];
        const fnParams: Array<string> = ['context', 'eventParams'];
        const {
            page: { pageData },
            userInfo,
        } = usePageStore.getState();
        const formData = cloneDeep(pageData.formData || {});
        originIds.forEach((id: string) => {
            // 如果绑定的是表单项，则通过Form实例对象获取对应表单值
            const formValues = pageData.formData?.[id] || {};
            if (!formData?.id) {
                formData[id] = formatFormValues(pageData.elementsMap, formValues);
            }
        });
        // let formulaArr = formula.split(".");
        // if (formulaArr[1] == "api") {
        //   let result: any = pageData.apiOutData?.[formulaArr[2]] || {};
        //   return result[formulaArr[3]]
        // }
        const variableData = getPageVariable();
        const dynamicFunc = createFunction(fnParams, formula);
        // 添加日期格式化
        const FORMAT = (date: any, fmt: string = 'YYYY-MM-DD HH:mm:ss') => {
            return dayjs(date).format(fmt);
        };
        // 这样可以保持循环组件内部的直接传递方式的性能优势
        let actualLoopVariable = loopVariable;
        // 检查loopVariable是否是有效的循环变量对象
        if (JSON.stringify(loopVariable) === '{}') {
            //       let forEachVariables = await new Promise((resolve) => {
            //     setTimeout(() => {
            // 		//const rs = getForEachVariable()
            //       resolve(pageData.forEachVariables);
            //     }, 500);
            //   });;

            // 获取循环变量，统一使用全局存储
            const forEachVariables = pageData.forEachVariables || {};
            // 优先使用活跃组件ID来确定使用哪个循环组件的变量
            const activeComponentId = forEachVariables['activeComponentId'];

            if (activeComponentId && forEachVariables[activeComponentId]) {
                // 使用活跃组件的循环变量
                const currentItem = forEachVariables[`${activeComponentId}_currentItem`];
                if (currentItem !== null && currentItem !== undefined) {
                    actualLoopVariable = currentItem;
                    console.log(`使用活跃组件 ${activeComponentId} 的 currentItem:`, currentItem);
                } else {
                    actualLoopVariable = {};
                    console.log('没有活跃组件ID，返回空对象');
                }
            }
        } else {
            console.log('直接使用传入的循环变量 loopVariable:', loopVariable);
        }

        const apiData = getPageApiData();

        const context = {
            store: userInfo,
            variable: variableData,
            api: apiData,
            eventParams,
            forEachValue: actualLoopVariable,
            FORMAT,
            ...formData,
        };
        const result = dynamicFunc(context, eventParams || {});
        if (typeof result === 'function') return result(context, eventParams || {});
        return result;
    } catch (error) {
        console.error('表达式解析失败：', error);
    }
    return '';
}

/**
 * 递归查找日期组件
 */
export const getDateItem = (elements: ComponentType[], list: string[]): string[] => {
    for (let i = 0; i < elements.length; i++) {
        const item = elements[i];
        if (['DatePicker', 'TimePicker', 'DatePickerRange', 'TimePickerRange', 'EditTable'].includes(item.type)) {
            list.push(item.id);
        } else if (item.elements?.length) {
            getDateItem(item.elements, list);
        }
    }
    return list;
};

/**
 * 针对日期组件值做特殊处理，因为日期赋值必须转换为dayjs对象
 * @param list 组件列表
 * @param values 表单数据值
 */
export const dateFormat = (list: Array<ComponentType>, values: any) => {
    const elementsMap = usePageStore.getState()?.page?.pageData?.elementsMap || {};
    const dates = getDateItem(list, []);
    const result = { ...values };
    dates?.map((id: string) => {
        const { type, config } = elementsMap[id] || {};
        const {
            startField,
            endField,
            formItem: { name },
            formWrap: { format, columns },
        } = config?.props || { formItem: { name: '' }, formWrap: { format: '', columns: [] } };
        if (['DatePicker', 'TimePicker'].includes(type)) {
            if (!result[name] || result[name]?.format) return;
            if (type === 'TimePicker') {
                if (/^\d{4}-\d{2}-\d{2}/.test(result[name])) {
                    result[name] = dayjs(result[name]);
                } else {
                    const today = dayjs().format('YYYY-MM-DD');
                    result[name] = dayjs(`${today} ${result[name]}`, 'YYYY-MM-DD HH:mm:ss');
                }
            } else {
                if (/^\d{4}-\d{2}-\d{2}$/.test(result[name])) {
                    result[name] = dayjs(`${result[name]} 00:00:00`, 'YYYY-MM-DD HH:mm:ss');
                } else {
                    result[name] = dayjs(result[name]);
                }
            }
        } else if (['DatePickerRange', 'TimePickerRange'].includes(type)) {
            if (Array.isArray(result[name]) && result[name].length == 2) {
                if (type === 'TimePickerRange') {
                    const today = dayjs().format('YYYY-MM-DD');
                    result[name] = result[name].map((time: any) => {
                        if (time?.format) return time;
                        if (/^\d{4}-\d{2}-\d{2}/.test(time)) {
                            return dayjs(time);
                        }
                        return dayjs(`${today} ${time}`, 'YYYY-MM-DD HH:mm:ss');
                    });
                } else {
                    result[name] = result[name].map((date: any) => {
                        if (date?.format) return date;
                        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                            return dayjs(`${date} 00:00:00`, 'YYYY-MM-DD HH:mm:ss');
                        }
                        return dayjs(date);
                    });
                }
            } else {
                if (result[startField] && result[endField]) {
                    result[name] = [dayjs(result[startField]), dayjs(result[endField])];
                }
            }
        } else if (type === 'EditTable') {
            columns
                .filter((item: any) => item.type === 'date')
                .map(({ dataIndex }: { dataIndex: string }) => {
                    result[name].map((item: any) => {
                        if (item[dataIndex]) item[dataIndex] = dayjs(item[dataIndex]);
                    });
                });
        }
    });
    return result;
};

/**
 * 解析参数中包含的变量
 * 1. 组件属性配置中的变量参数
 */
export const handleParamVariable = (params: any = {}, data?: any) => {
    return Object.keys(params).reduce<any>((prev, cur) => {
        const variableObj = params[cur];
        // 如果组件属性是对象，则判断是静态值还是变量
        if (typeof variableObj === 'object') {
            // 如果是静态值，则直接赋值。
            if (variableObj?.type === 'static') {
                prev[cur] = variableObj.value;
            } else if (variableObj?.type === 'variable') {
                // 绑定变量时，可能是变量，也可能是绑定某一个表单值
                prev[cur] = renderFormula(variableObj.value, data);
            } else {
                prev[cur] = variableObj;
            }
        } else {
            prev[cur] = variableObj;
        }
        return prev;
    }, {});
};

/**
 * 解析数组中包含的变量
 * 1. Http设置中的请求头参数
 * 2. Http设置中的发送参数
 * 3. 事件行为中的发送参数
 */
export const handleArrayVariable = (list: any = [], data: any = {}) => {
    return list?.reduce((prev: any, next: any) => {
        if (next?.key) {
            if (typeof next.value === 'string') {
                if (isNotEmpty(next.value)) {
                    // 解析模板语法
                    const val: any = renderTemplate(next.value, data);
                    // 数字转换
                    prev[next.key] = isNotEmpty(val) ? val : '';
                } else {
                    prev[next.key] = '';
                }
            } else {
                if (next.value.type === 'static') {
                    if (isNotEmpty(next.value.value)) {
                        // 解析模板语法
                        const val: any = renderTemplate(next.value.value, data);
                        // 数字转换
                        prev[next.key] = isNotEmpty(val) ? val : '';
                    } else {
                        prev[next.key] = '';
                    }
                } else {
                    // 变量不支持模板字符串语法
                    const result = renderFormula(next.value.value, data);
                    prev[next.key] = isNotEmpty(result) ? result : '';
                }
            }
        }
        return prev;
    }, {});
};

/**
 * 动态加载css
 * @param src
 * @returns Promise
 */
export const loadStyle = (id: string, src: string) => {
    if (!src) return;
    return new Promise((resolve, reject) => {
        if (document.getElementById(id)) return;
        // 创建一个新的link元素
        const link = document.createElement('link');

        // 设置link元素的属性
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = src;
        link.onload = resolve;
        link.onerror = reject;
        link.setAttribute('id', id);
        // 将link元素添加到DOM的head部分
        document.getElementsByTagName('HEAD')[0].appendChild(link);
    });
};

/**
 * 动态加载JS，主要用于解决不常用的JS包，防止影响整体性能，比如抖音和快手
 * @param src
 * @returns Promise
 */
export const loadScript = (src: string) => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        script.src = src;
        document?.body?.append(script);
    });
};

/**
 * 获取环境变量
 * 开发环境默认返回 stg
 * 页面打开，获取环境参数
 * 项目打开，优先通过storage获取环境参数
 * 5. env 当前真实环境
 */
export const getEnv = () => {
    const isDev = /^\/editor\/\d+\/edit/.test(location?.pathname || '');
    if (isDev) return 'stg';
    const isPage = /^\/page\/\d+/.test(location?.pathname || '');
    if (isPage) {
        const search = new URLSearchParams(location?.search || '');
        return search.get('env') || 'prd';
    }
    const match = location?.pathname?.match(/^\/project\/(\d+)\/(\d+)/);
    if (match && match[1]) {
        return storage.get(match[1] + '-env') || 'prd';
    }
    return 'prd';
};

/**
 * 获取页面ID
 * @param pageId 页面路径或者页面ID
 * @param pageMap 菜单映射对象
 * @returns
 */
export function getPageId(pageId: string | undefined, pageMap: Record<number, any>): number {
    if (!pageId || !pageMap) return 0;
    const id = isNaN(Number(pageId))
        ? Object.values(pageMap || {}).filter((item) => {
              return item?.path?.startsWith('/') ? item.path?.slice(1) === pageId : item.path === pageId;
          })?.[0]?.pageId
        : pageId;
    return id;
}

/**
 * 判断协议http/https
 * 返回映射后地址
 */
export const baseApiConvert = (url: string) => {
    //先判断协议
    const addressFlag = window?.location?.href?.indexOf('cs.cmos:8080') > -1 ? 'test' : 'prd';
    const urlFlag = url.indexOf('cs.cmos:8080') > -1 ? 'test' : 'prd';
    const ishttps = 'https:' == document?.location?.protocol ? true : false;
    let returnUrl = url;
    if (url) {
        const dataDictUrlSubstrSix = returnUrl.substring(0, 6).toUpperCase();
        //再判断环境
        if (addressFlag === 'test' && urlFlag === 'prd') {
            url = url.replace('cs.cmos', 'cs.cmos:8080');
            returnUrl = url;
        }
        try {
            if (ishttps && dataDictUrlSubstrSix != 'HTTPS:') {
                //生产环境下，直接替换http
                returnUrl = url.replace('http:', 'https:');
                const Url = new URL(returnUrl);
                if (Url.port != '') {
                    returnUrl = Url.href.replace(':' + Url.port, '');
                }
            }
        } catch (error) {
            /* empty */
        }
    }
    return returnUrl;
};

/**
 * 生成时间戳、随机值、拼接原文
 * @param nill 可选，默认使用当前页面URL
 * @returns 包含时间戳、随机值、拼接原文参数的对象
 */
export const generateSign = () => {
    // 生成时间戳
    const timestamp = String(new Date().getTime());
    // 生成随机值 nonce（用于加密扰动，防重放）
    const nonce = Math.random().toString(36).substr(2, 10);
    // 拼接原文（timestamp + nonce）
    const signatureBase = CryptoJS.MD5(timestamp + nonce)
        .toString()
        .toUpperCase();
    // 返回header自定义签名字段
    return {
        timestamp: timestamp,
        nonce: nonce,
        signatureBase: signatureBase,
    };
};

/**
 * 树形数据节点类型（通用）
 * @template T - 数据记录的类型，必须包含唯一标识字段和子节点字段
 */
type TreeNode<T = any> = T & {
    /** 子节点数组，可选 */
    children?: TreeNode<T>[];
};

/**
 * 递归遍历树形数据，收集所有含有非空 children 数组的节点的 rowKey
 *
 * @template T - 数据记录类型
 * @param {TreeNode<T>[]} data - 树形数据源（Table 的 dataSource）
 * @param {keyof T} rowKeyField - 作为 rowKey 的字段名（必填，确保存在于 T 中）
 * @param {keyof T} childrenField - 子节点数组字段名，默认为 'children'
 * @returns {Array<T[keyof T]>} 包含所有父节点 rowKey 的数组（类型与 rowKey 字段类型一致）
 *
 * @example
 * const keys = getParentKeys(data, 'id', 'children');
 */
export const getParentKeys = <T extends Record<string, any>>(
    data: TreeNode<T>[],
    rowKeyField: keyof T = 'id',
    childrenField: keyof T = 'children' as keyof T,
): T[keyof T][] => {
    let keys: T[keyof T][] = [];

    data.forEach((item) => {
        const children = item[childrenField] as TreeNode<T>[] | undefined;
        // 检查 children 是否存在且为数组且长度 > 0
        if (Array.isArray(children) && children.length > 0) {
            // 添加当前节点的 rowKey
            keys.push(item[rowKeyField]);
            // 递归处理子节点
            keys = keys.concat(getParentKeys(children, rowKeyField, childrenField));
        }
    });

    return keys;
};

/**
 * 检查传入的值能否被解析成一个时间日期
 * @param dateStr
 * @returns
 */
export const dateIsValid = (dateStr: string) => {
    return dayjs(dateStr).isValid();
};

/**
 * 根据 key 前缀判断组件类型（DatePicker/DatePickerRange/TimePicker/TimePickerRange）
 * @param k 字段 key
 * @returns 组件类型
 */
const getDateComponentType = (k: string): string => {
    if (k.startsWith('DatePickerRange')) return 'DatePickerRange';
    if (k.startsWith('TimePickerRange')) return 'TimePickerRange';
    if (k.startsWith('DatePicker')) return 'DatePicker';
    if (k.startsWith('TimePicker')) return 'TimePicker';
    return '';
};

/**
 * 格式化日期值：将 dayjs 对象或日期字符串按照指定格式输出
 * @param type 组件类型
 * @param value 值
 * @param format 格式
 * @returns 格式化后的字符串
 */
const formatDateValue = (value: any, format: string): any => {
    if (isNil(value)) return value;
    if (dayjs.isDayjs(value)) {
        return value.format(format);
    }
    if (typeof value === 'string' && dateIsValid(value)) {
        return dayjs(value).format(format);
    }
    return value;
};

/**
 * 格式化 Form 组件内的日期/时间字段
 * @param elementsMap 组件映射表
 * @param formData 表单数据
 * @returns 格式化后的表单数据
 */
export const formatFormValues = (elementsMap: Record<string, any>, formData: any): any => {
    if (!formData || typeof formData !== 'object') return formData;

    // 递归转换：遍历表单值，对日期类型字段按配置的 format 进行格式化
    const convertDayjsToString = (k: string, obj: any): any => {
        if (isNil(obj)) return obj;
        // 从 elementsMap 获取组件配置的 format，通过 name 匹配，默认为 'YYYY-MM-DD HH:mm:ss'
        const element: Record<string, any> = Object.values(elementsMap).find((e: any) => e?.config?.props?.formItem?.name === k);
        const format = element?.config?.props?.formWrap?.format || 'YYYY-MM-DD HH:mm:ss';
        if (Array.isArray(obj)) {
            return obj.map((item: any) => convertDayjsToString(k, item));
        } else {
            return formatDateValue(obj, format);
        }
    };

    // 判断是否格式化日期
    const needsDateConversion = (value: any, type: any) => {
        if (type) return true;
        if (dayjs.isDayjs(value)) return true;
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return true;
        if (Array.isArray(value)) {
            for (const item of value) {
                if (dayjs.isDayjs(item)) return true;
                if (typeof item === 'string' && /^\d{4}-\d{2}-\d{2}/.test(item)) return true;
            }
        }
        return false;
    };

    // 遍历所有表单字段，对日期类型字段进行格式化转换
    const result: any = {};
    for (const k in formData) {
        if (!Object.hasOwn(formData, k)) break;
        const type = getDateComponentType(k);
        if (needsDateConversion(formData[k], type)) {
            result[k] = convertDayjsToString(k, formData[k]);
        } else {
            result[k] = formData[k];
        }
    }
    return result;
};

/**
 * 将字符串转为dayjs
 * @param dateStr
 * @returns
 */
export const dateStrToDayjs = (dateStr: string) => {
    if (dateIsValid(dateStr)) {
        return dayjs(dateStr);
    }
    return undefined;
};

/**
 * 过滤恶意代码
 * @param str 待恶意的字符串
 */
export const cleanHtml = (str: string) => {
    return DOMPurify.sanitize(str);
};

/**
 * 解析字符串中的 HTML
 * @param str 待解析的字符串
 * @param options html-react-parser options
 */
export const analysisHtmlToStr = (str: string, options: HTMLReactParserOptions = {}) => {
    const parseHtml = parse(cleanHtml(str).trim(), options);
    return parseHtml;
};

export function getUrlName(url?: string): string {
    let xUrl = url || window.location.href;
    if (xUrl.indexOf('/') > -1) {
        xUrl = xUrl.substring(xUrl.lastIndexOf('/') + 1);
        if (xUrl.indexOf('.') > -1) {
            xUrl = xUrl.substring(0, xUrl.lastIndexOf('.'));
        }
    }
    return xUrl;
}
