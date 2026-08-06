import { IMenuItem } from './../types/index';
import CryptoJS from 'crypto-js';

/**
 * 判断环境变量是否合法
 */
export function isEnv(env?: string) {
    return env && ['stg', 'pre', 'prd'].includes(env);
}
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
            return item?.path?.startsWith('/') ? item?.path?.slice(1) === pageId : item?.path === pageId;
        })?.[0]?.pageId
        : pageId;
    return id;
}
/**
 * 菜单数据转换
 * treeList: 树形菜单
 * buttons: 按钮
 * pageMap: 页面ID映射
 * menuMap: 菜单ID映射
 * @returns
 */
export function arrayToTree(array: IMenuItem[] = []) {
    const buttons: IMenuItem[] = [];
    const pageMap: { [key: number]: Pick<IMenuItem, 'id' | 'pageId' | 'parentId' | 'name' | 'path'> } = {};
    const menuMap: { [key: number]: IMenuItem } = {};
    // 创建一个映射，将id映射到节点对象
    const map: { [key: number]: IMenuItem & { children?: IMenuItem[] } } = {};
    array.forEach((item) => {
        map[item.id] = { ...item };
        if (item.type === 2) buttons.push(item);
        if (item.type === 1 || item.type === 3) {
            if (item.pageId) {
                pageMap[item.pageId] = { id: item.id, pageId: item.pageId, parentId: item.parentId, name: item.name, path: item.path };
            } else {
                menuMap[item.id] = { ...item };
            }
        }
    });

    // 找到每个节点的父节点
    array.forEach((item) => {
        if (item.parentId && map[item.parentId]) {
            const parentItem = map[item.parentId];
            if (item.type === 1 || item.type === 3) {
                if (!parentItem.children) parentItem.children = [];
                parentItem.children?.push(map[item.id]);
                // 按照sortNum进行降序排序
                parentItem.children = (parentItem.children || []).sort((a: any, b: any) => a.sortNum - b.sortNum);
            } else {
                if (!parentItem.buttons) parentItem.buttons = [];
                parentItem.buttons?.push(map[item.id]);
            }
        }
    });
    const menuTree = Object.values(map)
        .filter((item) => !item.parentId)
        .sort((a, b) => a.sortNum - b.sortNum);
    return {
        menuTree,
        buttons,
        pageMap,
        menuMap,
    };
}

/**
 * 判断协议http/https
 * 返回映射后地址
 */
export const baseApiConvert = (url: string) => {
    //先判断协议
    let addressFlag = window?.location?.href?.indexOf('cs.cmos:8080') > -1 ? 'test' : 'prd';
    let urlFlag = url?.indexOf('cs.cmos:8080') > -1 ? 'test' : 'prd';
    let ishttps = 'https:' == document?.location?.protocol ? true : false;
    let returnUrl = url;
    if (url) {
        let dataDictUrlSubstrSix = returnUrl.substring(0, 6).toUpperCase();
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
                let Url = new URL(returnUrl);
                if (Url?.port != '') {
                    returnUrl = Url?.href?.replace(':' + Url.port, '');
                }
            }
        } catch (error) {

        }
    }
    return returnUrl;
};

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
