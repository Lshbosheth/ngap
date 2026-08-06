import components from './../config/components';
import { ComponentType, ComItemType } from './../packages/types';
import dayjs from 'dayjs';
import parse from 'style-to-object';
import CryptoJS from 'crypto-js';
/**
 * 生成组件ID
 * @param name 组件类型名称
 * @returns 新名称
 */
export const createId = (name: string, len: number = 10) => {
    return (
        name +
        '_' +
        Number(Math.random().toString().substring(2, 12) + Date.now())
            .toString(36)
            .slice(0, len)
    );
};

/**
 * 生成UUID
 * @returns
 */
export function generateUUID(): string {
    if (crypto?.randomUUID) {
        return crypto.randomUUID();
    }
    const randomMethod = () => {
        if (crypto?.getRandomValues) {
            return crypto.getRandomValues(new Uint8Array(1))[0];
        } else {
            return Math.floor(Math.random() * 256);
        }
    };
    return (String(1e7) + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) => (Number(c) ^ (randomMethod() & (15 >> (Number(c) / 4)))).toString(16));
}

/**
 * 递归查找组件
 * element：返回当前元素
 * index：返回当前元素在父级中的索引
 * elements：返回父级列表
 */
export const getElement = (elements: ComItemType[], id?: string): { element: ComItemType | null; index: number; elements: ComItemType[] } => {
    if (!id) return { element: null, index: -1, elements: [] };
    for (let i = 0; i < elements.length; i++) {
        const item = elements[i];
        if (item.id == id) {
            return { element: item, index: i, elements };
        } else if (item.elements?.length) {
            const result = getElement(item.elements, id);
            if (result.element) return result;
        }
    }
    return { element: null, index: -1, elements: [] };
};

/**
 * 解析CSS样式
 */
export const parseStyle = (inputCss: string) => {
    const cssObject: { [key: string]: string } = {};
    // 如果CSS发生变化，需要把文本转换为Object对象
    if (inputCss) {
        try {
            // 删除注释、删除.ngap{}，只保留中间部分
            inputCss = inputCss
                .replace(/\/\*.*\*\//, '')
                .replace(/(\.?\w+{)/, '')
                .replace('}', '');
            parse(inputCss, (name, value) => {
                // 把中划线语法替换为驼峰
                cssObject[name.replace(/-\w/g, (item) => item.toUpperCase().replace('-', ''))] = value;
            });
        } catch (error) {
            // 如果报错，说明CSS没写完，不能生成对应object，此时直接返回，不需要保存
            return;
        }
    }
    return cssObject;
};

/**
 * 递归获取元素的相对位置(相对于pageWrapper)
 */

export function getBoundingClientRect(element: any) {
    let offsetTop = 0;
    let offsetLeft = 0;
    const { width, height } = element.getBoundingClientRect();
    while (element) {
        // 如果是顶级元素，则直接跳出循环
        if (element.id === 'editor') {
            offsetTop -= element.offsetTop;
            break;
        }
        offsetTop += element.offsetTop;
        offsetLeft += element.offsetLeft;
        element = element.offsetParent;
    }

    return {
        width: width,
        height: height,
        top: offsetTop,
        left: offsetLeft,
    };
}

/**
 * 格式化日期
 * @param date 日期对象，默认系统当前时间
 * @param rule 格式化规则，默认YYYY-MM-DD HH:mm:ss
 * @returns 格式化后的字符串
 */
export const formatDate = (date?: Date | string, rule?: string) => {
    return date ? dayjs(date).format(rule) : '';
};

// 递归生成菜单
export function arrayToTree(array: any[], parentId = null) {
    if (!Array.isArray(array)) return [];
    // 创建一个映射，将id映射到节点对象
    const map: { [key: number]: any & { children?: any[] } } = {};
    array.forEach((item) => {
        map[item.id] = { ...item };
    });

    // 找到每个节点的父节点
    array.forEach((item) => {
        if (item.parentId !== null && map[item.parentId]) {
            const parentItem = map[item.parentId];
            if (!parentItem.children) parentItem.children = [];
            parentItem.children?.push(map[item.id]);
            // 按照sortNum进行降序排序
            parentItem.children = parentItem.children.sort((a: any, b: any) => a.sortNum - b.sortNum);
        }
    });
    return Object.values(map)
        .filter((item) => (parentId ? item.parentId === parentId : !item.parentId))
        .sort((a, b) => a.sortNum - b.sortNum);
}

/**
 * 动态加载JS，主要用于解决不常用的JS包，防止影响整体性能
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
        document?.head?.append(script);
    });
};

/**
 * 查找某组件的所有父元素类型
 * @param id 组件ID
 * @param elementsMap 所有组件映射对象
 * @returns
 */
function findParentTypesById(id: string, elementsMap: { [id: string]: ComponentType }) {
    const types = [elementsMap[id].type];
    let parentItem = elementsMap[id];
    while (parentItem && parentItem.parentId) {
        const parentType = elementsMap[parentItem.parentId] && elementsMap[parentItem.parentId].type;
        parentType && types.push(parentType);
        parentItem = elementsMap[parentItem.parentId];
    }
    return types;
}

/**
 * 判断组件是否允许添加
 * 主要判断表单组件只能添加到Form或者SearchForm中
 */
export const checkComponentType = (type: string, parentId: string = '', parentType: string = '', elementsMap: { [id: string]: ComponentType }) => {
    const childFormList = components.find((item) => item.type === 'FormItems')?.data.map((item) => item.type);
    if (!parentType) {
        if (childFormList?.includes(type)) {
            return false;
        }
        return true;
    } else {
        if (childFormList?.includes(type)) {
            const types = findParentTypesById(parentId, elementsMap);
            if (types.includes('Form') || types.includes('SearchForm') || types.includes('GridForm')) return true;
            return false;
        }
    }
    return true;
};
/**
 * 判断底部通栏
 *
 */
export const checkHasBottomBannerSimple = (elementsMap: { [id: string]: ComponentType }): boolean => {
    // 空值保护 + 遍历判断
    return !!elementsMap && Object.values(elementsMap).some((item) => item?.type === 'BottomBanner');
};

/**
 * 文件导出
 * 由于只支持https协议，所以当前在http下不可用。
 */
export async function saveFile(name: string, content: string) {
    try {
        const handle = await window.showSaveFilePicker({
            suggestedName: name + '.json',
            types: [
                {
                    accept: {
                        'text/json': ['.json'],
                    },
                },
            ],
        });

        // create a FileSystemWritableFileStream to write to
        const writableStream = await handle.createWritable();

        // write our file
        await writableStream.write(content);

        // close the file and write the contents to disk.
        await writableStream.close();

        //setHandle(newHandle);

        return handle.name;
    } catch (error) {
        console.error(error);
        return false;
    }
}

/**
 *
 * @param children 组件树
 * @param nodeId 节点id
 * @param parentNode 父节点
 * @returns {
 * index: number, // 节点在父节点中的索引
 * parentNode: any, // 父节点
 * selfNode: any // 当前节点
 * }
 */
export function findNodeIndexAndParent(
    children: any,
    nodeId: string,
    parentNode = null,
): {
    index: number;
    parentNode: any;
    selfNode: any;
} | null {
    for (let i = 0; i < children.length; i++) {
        if (children[i].id === nodeId) {
            return { index: i, parentNode, selfNode: children[i] };
        }
        if (children[i].children) {
            const result = findNodeIndexAndParent(children[i].children, nodeId, children[i]);
            if (result) {
                return result;
            }
        }
    }
    return null;
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
        if (addressFlag == 'prd' && urlFlag == 'test') {
            url = url.replace('cs.cmos:8080', 'cs.cmos');
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
            console.log(error)
        }
    }
    return returnUrl;
};

/**
 * 获取URL中的查询参数
 * @param url 可选，默认使用当前页面URL
 * @returns 包含所有查询参数的对象
 */
export const getUrlParams = (url?: string): Record<string, string> => {
    const urlString = url || window.location.href;
    const urlObj = new URL(urlString);
    const params: Record<string, string> = {};

    // 获取查询字符串部分
    const queryString = urlObj.search.substring(1); // 去掉开头的 '?'

    // 手动解析参数以保持 + 字符
    if (queryString) {
        const pairs = queryString.split('&');
        for (const pair of pairs) {
            const [key, ...valueParts] = pair.split('=');
            if (key) {
                // 使用 decodeURIComponent 解码，但保持 + 字符
                const decodedKey = decodeURIComponent(key);
                const value = valueParts.join('='); // 处理值中包含 = 的情况
                const decodedValue = value ? decodeURIComponent(value) : '';

                // 将空格还原为 + 字符（因为浏览器通常将 + 解码为空格）
                const finalValue = decodedValue.replace(/ /g, '+');

                params[decodedKey] = finalValue;
            }
        }
    }

    return params;
};

/**
 * 获取URL中的指定查询参数
 * @param param 参数名
 * @param url 可选，默认使用当前页面URL
 * @returns 参数值，如果不存在则返回空字符串
 */
export const getUrlParam = (param: string, url?: string): string => {
    const params = getUrlParams(url);
    return params[param] || '';
};

export function isEmpty(value: any) {
    return value === '' || value === undefined || value === null || value.length === 0 || value === 'null'
}

export function getValue(key: string, obj: any) {
    return isEmpty(obj) ? '-' : (obj[key] || '-')
}

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
    const signatureBase = CryptoJS.MD5(timestamp + nonce).toString().toUpperCase();
    // 返回header自定义签名字段
    return {
        timestamp: timestamp,
        nonce: nonce,
        signatureBase: signatureBase
    };
};

export function getKey(...args: any) {
    let key = ''
    args.forEach((arg: any) => {
        if (Array.isArray(arg)) {
            key = `${key}_${arg.length}`
        } else {
            key = `${key}_${JSON.stringify(arg)}`
        }
    })
    return key
}

export function isTest(){
    return window?.location?.href?.includes('.cs.cmos:8080')
}

export const formatSize = (bytes?: number) => {
    if (!bytes) return '--';
    const units = ['B', 'K', 'M', 'G'];
    let size = bytes;
    let idx = 0;
    while (size >= 1024 && idx < units.length - 1) {
        size /= 1024;
        idx++;
    }
    return `${size.toFixed(2)} ${units[idx]}`;
};

// 获取浏览器版本
export const getChromeVersion = () => {
    const _navigator: any = navigator;
    // 获取完整的 userAgent 字符串
    const ua = _navigator.userAgent;

    // 方法1：通过 Chrome/ 标识获取（主流方法）
    let chromeMatch = ua.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/);

    if (chromeMatch && chromeMatch[1]) {
        // 检查是否为 Edge 或其他基于 Chromium 的浏览器
        // Edge 也包含 Chrome/ 标识，需要排除
        const isEdge = ua.indexOf('Edg/') > -1 || ua.indexOf('Edge/') > -1;
        const isOpera = ua.indexOf('OPR/') > -1;
        const isBrave = _navigator.brave !== undefined;

        if (!isEdge && !isOpera && !isBrave) {
            return chromeMatch[1];
        }
    }

    // 方法2：通过 Google Chrome 标识（旧版本兼容）
    chromeMatch = ua.match(/Google Chrome\/(\d+\.\d+\.\d+\.\d+)/);
    if (chromeMatch && chromeMatch[1]) {
        return chromeMatch[1];
    }

    // 方法3：通过 CrMo 标识（Chrome Mobile 兼容）
    chromeMatch = ua.match(/CrMo\/(\d+\.\d+\.\d+\.\d+)/);
    if (chromeMatch && chromeMatch[1]) {
        return chromeMatch[1];
    }

    // 方法4：通过 CriOS 标识（iOS Chrome）
    chromeMatch = ua.match(/CriOS\/(\d+\.\d+\.\d+\.\d+)/);
    if (chromeMatch && chromeMatch[1]) {
        return chromeMatch[1];
    }

    // 如果都不是，返回 null
    return null;
}
