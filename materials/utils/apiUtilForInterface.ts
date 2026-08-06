import { getIndexInfo, getCallingInfo, getClientBusiInfo, getSerialNo, faceCheckPrevalidation, getAgentState } from './crossAPIUtil';
import { usePageStore } from '@materials/stores/pageStore';
import request from './request';

interface IBaseInfo {
    index: number;
    length: number;
    crossAPILen: number;
    crossAPIArr: any[];
}

interface ISource {
    value: string;
    type: string;
    fieldType: string;
    fieldContent: string;
    children?: ISource[];
}

const countNodes = (arr: ISource[]) => {
    let count = 0;
    arr.forEach((item) => {
        count++;
        if (item.children && item.children.length && item.type != 'array') {
            count += countNodes(item.children);
        }
    });
    return count;
};

const getIntParmas = (treeArr: ISource[], defaultObj: { [name: string]: any }, baseInfo: IBaseInfo, callback: (o: object) => any) => {
    const params = {};
    getParams(treeArr, params, params, defaultObj, baseInfo, callback);
};

const goCallback = (baseInfo: IBaseInfo, callback: (o: object) => any, allParams: any, isCrossAPI?: boolean) => {
    if (
        (baseInfo.length - 1 == baseInfo.index && baseInfo.crossAPILen == baseInfo.crossAPIArr.length) ||
        (isCrossAPI && baseInfo.crossAPILen == baseInfo.crossAPIArr.length)
    ) {
        callback(allParams);
    }
};

/**
 * 获取数据源的值
 * @param arr 数据源数组
 * @param params 数据对象
 * @param defaultObj 默认值对象
 */
const getParams = (arr: ISource[], params: any, allParams: any, defaultObj: any, baseInfo: IBaseInfo, callback: (o: object) => any) => {
    for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        const key = item.value;
        const type = item.type;
        const fieldType = item.fieldType;

        if (type == 'map') {
            params[key] = {};
            if (typeof defaultObj[key] === 'object' && !Array.isArray(defaultObj[key]) && defaultObj[key] != null) {
                params[key] = defaultObj[key];
            }
            if (item.children && item.children.length) {
                baseInfo.index++;
                getParams(item.children, params[key], allParams, defaultObj, baseInfo, callback);
            } else {
                goCallback(baseInfo, callback, allParams);
                baseInfo.index++;
            }
        } else if (type == 'array') {
            params[key] = [];
            if (typeof defaultObj[key] === 'object' && Array.isArray(defaultObj[key])) {
                params[key] = defaultObj[key];
            }
            goCallback(baseInfo, callback, allParams);
            baseInfo.index++;
        } else {
            if (fieldType == '1') {
                if (item.fieldContent || defaultObj[key]) {
                    params[key] = item.fieldContent || defaultObj[key];
                }
                goCallback(baseInfo, callback, allParams);
            } else if (fieldType == '2') {
                const crossAPIStr = item.fieldContent;
                if (crossAPIStr) {
                    baseInfo.crossAPILen++;
                    getCrossAPIValue(crossAPIStr, params, key, defaultObj[key], allParams, baseInfo, callback);
                } else {
                    if (defaultObj[key]) {
                        params[key] = defaultObj[key];
                    }
                    goCallback(baseInfo, callback, allParams);
                }
            } else {
                if (defaultObj[key]) {
                    params[key] = defaultObj[key];
                }
                goCallback(baseInfo, callback, allParams);
            }
            baseInfo.index++;
        }
    }
};

const getFieldFromCrossAPI = (index: number, apiName: string, callback: (index: number, o: object) => any) => {
    switch (apiName) {
        case 'cross_data':
            getIndexInfo((data: any) => {
                data.userInfo.ngshBossStaffId = '';
                data.userInfo.ngshCrmStaffId = '';
                if (data?.userInfo && data?.userInfo?.systermOldStaffId && data?.userInfo?.systermOldStaffId?.length > 0) {
                    data.userInfo.systermOldStaffId.map((index: number, bean: any) => {
                        if (bean.systemNo == 'BOSS') {
                            data.userInfo.ngshBossStaffId = bean.origStaffId ? bean.origStaffId : '';
                        } else if (bean.systemNo == 'CRM') {
                            data.userInfo.ngshCrmStaffId = bean.origStaffId ? bean.origStaffId : '';
                        }
                    });
                } else {
                    data.userInfo.ngshBossStaffId = '';
                    data.userInfo.ngshCrmStaffId = '';
                }
                callback(index, data);
            });
            break;
        case 'getCallingInfo':
            getCallingInfo((data: any) => {
                if (data && data.sessionValidationInfoNew && Object.keys(data.sessionValidationInfoNew).length !== 0) {
                    data.sessionValidationInfoNewNgsh = JSON.stringify(data.sessionValidationInfoNew);
                }
                callback(index, data);
            });
            break;
        case 'getClientBusiInfo':
            getClientBusiInfo({}, (data: object) => {
                callback(index, data);
            });
            break;
            case 'getAgentState':
                getAgentState((data: any) => {
                    // if (data && data.sessionValidationInfoNew && Object.keys(data.sessionValidationInfoNew).length !== 0) {
                    //     data.sessionValidationInfoNewNgsh = JSON.stringify(data.sessionValidationInfoNew);
                    // }
                    callback(index, data);
                });
                break;
        case 'getSerialNo':
            getSerialNo((data) => {
                callback(index, data);
            });
            break;
            
        case 'getIndexInfo':
            getIndexInfo((data: any) => {
                data.userInfo.ngshBossStaffId = '';
                data.userInfo.ngshCrmStaffId = '';
                if (data?.userInfo && data?.userInfo?.systermOldStaffId && data?.userInfo?.systermOldStaffId?.length > 0) {
                    data.userInfo.systermOldStaffId.map((index: number, bean: any) => {
                        if (bean.systemNo == 'BOSS') {
                            data.userInfo.ngshBossStaffId = bean.origStaffId ? bean.origStaffId : '';
                        } else if (bean.systemNo == 'CRM') {
                            data.userInfo.ngshCrmStaffId = bean.origStaffId ? bean.origStaffId : '';
                        }
                    });
                } else {
                    data.userInfo.ngshBossStaffId = '';
                    data.userInfo.ngshCrmStaffId = '';
                }
                callback(index, data);
            });
            break;
        case 'faceCheckPrevalidation':
            faceCheckPrevalidation((data: any) => {
                callback(index, data);
            })
            break;
    }
};

/**
 * 数据源中需要从crossAPI方法获取值
 * @param fieldContent crossAPI方法字符串 crossData.info.userInfo.staffId
 * @param params 数据对象
 * @param key 数据对象中的key
 * @param defaultValue 默认值
 */
const getCrossAPIValue = (
    crossAPIStr: string,
    params: { [key: string]: any },
    key: string,
    defaultValue: object,
    allParams: object,
    baseInfo: IBaseInfo,
    callback: (o: object) => any,
) => {
    const valArr = crossAPIStr.split('.');
    getFieldFromCrossAPI(0, valArr[0], (index, info) => {
        let value: any = info;
        for (let j = 2; j < valArr.length; j++) {
            value = (value && value[valArr[j]]) || '';
        }
        if (value || defaultValue) {
            params[key] = value || defaultValue;
        }
        baseInfo.crossAPIArr.push(value || defaultValue);
        goCallback(baseInfo, callback, allParams, true);
    });
};

const getOutParams = (arr: ISource[], params: any, allParams: any, infoData: any, prefix: string) => {
    console.log('getOutParams---------开始')
    console.log('arr', JSON.stringify(arr))
    console.log('params', JSON.stringify(params))
    console.log('allParams', JSON.stringify(allParams))
    console.log('infoData', JSON.stringify(infoData))
    console.log('prefix', JSON.stringify(prefix))

    for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        const key = item.value;
        const type = item.type;
        const newKey = prefix + key;
        const newInfo = (infoData && infoData[key]) || '';
        const newPrefix = prefix + key + '__';
        if (type == 'map') {
            if (item.children && item.children.length) {
                console.log('arr-map', JSON.stringify(arr))
                console.log('infoData-map', JSON.stringify(infoData))
                console.log('prefix-map', JSON.stringify(prefix))
                getOutParams(item.children, params, allParams, newInfo, newPrefix);
            } else {
                console.log('map--else')
            }
        } else if (type == 'array') {
            if (item.children && item.children.length) {
                params[newKey] = [{}];
                getOutParams(item.children, params[newKey][0], allParams, newInfo, newPrefix);
            } else {
                console.log('array--else')
            }
        } else {
            const valArr = key.split('.');
            console.log('end--else-infoData', JSON.stringify(infoData))
            let value = infoData;
            for (let j = 0; j < valArr.length; j++) {
                value = (value && value[valArr[j]]) || '';
            }
            allParams[newKey] = value;
            params[newKey] = value;
            console.log('end--else', JSON.stringify(valArr))
        }
    }
};

/**
 * @param interfaceId 接口id
 * @param selectText  划词
 * @param defaultObj 默认值对象{key: value}， 非必填
 * @param prodflag 不传或传入prodflag=1代表真实数据，prodflag=0 代表mock数据
 * @returns {Promise}
 */
const getFieldFromAPI = (interfaceId: string, selectText?: string, defaultObj = {}, prodflag?: number) => {
    console.log("getFieldFromAPI开始----");
    console.log("defaultObj", defaultObj);
    const { userInfo, appSequenceId, appPageId, page } = usePageStore.getState();
    return new Promise((resolve) => {
        // 基础信息
        request
            .post('/csf/appInterface/getInterfaceParamsAndCheck', { params: { interfaceId: interfaceId, staffId: userInfo.staffId } })
            .then((data) => {
                const baseInfo = {
                    index: 0,
                    length: 0,
                    crossAPILen: 0,
                    crossAPIArr: [],
                };
                const isCrossAPI = (data.object && data.object.isCrossAPI) || '';
                const intfName = (data.object && data.object.intfName) || '';
                const bean = data.bean;
                if (data.returnCode == '0' && bean) {
                    const arr = [];
                    const treeArr: ISource[] = [];
                    for (const key in bean) {
                        const item = bean[key];
                        arr.push(item);
                    }
                    for (let i = 0; i < arr.length; i++) {
                        const obj = arr[i],
                            pObj = bean[obj['superFieldId']];
                        if (pObj) {
                            !pObj['children'] && (pObj['children'] = []);
                            pObj['children'].push(obj);
                        } else {
                            treeArr.push(obj);
                        }
                    }

                    baseInfo.length = countNodes(treeArr);
                    if (isCrossAPI == 'crossAPI') {
                        getFieldFromCrossAPI(0, intfName, (index, info) => {
                            const params = { bean: {} };
                            const arr = treeArr[0].children || [];
                            const prefix = 'object__';
                            console.log('isCrossAPI == crossAPI--info', JSON.stringify(info))
                            getOutParams(arr, params.bean, params.bean, info, prefix);
                            console.log('isCrossAPI == crossAPI--params', JSON.stringify(params))
                            resolve(params);
                        });
                    } else {
                        getIntParmas(treeArr, defaultObj, baseInfo, (params: { [name: string]: any }) => {
                            params.selectText = selectText;
                            const allParams: any = {
                                interfaceId: interfaceId,
                                prodflag: prodflag,
                                param: params,
                                appSequenceId: appSequenceId,
                                appId: appPageId,
                                provCode: page && page.provId,
                            };
                            if (getFormatFlag(allParams, "formatFlag")) {
                                allParams.formatFlag = 1;
                            }
                            // 调用保存接口保存数据
                            request
                                .post('/csf/appInterface/execInterfaceCp', {
                                    params: { dataInfo: JSON.stringify(allParams), staffId: userInfo.staffId },
                                })
                                .then(
                                    result => {
                                        resolve(result);
                                    },
                                    err => {
                                        let parsedError;
                                        try {
                                            if (err instanceof Error && typeof err.message === 'string' && err.message.startsWith('{')) {
                                                parsedError = JSON.parse(err.message);
                                            }
                                        } catch (e) {
                                            parsedError = { code: '-9999', message: err instanceof Error ? err.message : String(err) };
                                        }
                                        resolve({
                                            returnCode: parsedError?.code || '-9999',
                                            returnMessage: parsedError?.message || '服务异常，请稍后再试',
                                            bean: {
                                                returnCode: parsedError?.code || '-9999',
                                                returnMessage: parsedError?.message || '服务异常，请稍后再试'
                                            },
                                            ...parsedError
                                        });
                                    }
                                );
                        });
                    }
                } else {
                    resolve(data);
                }
            })
            .catch(err => {
                resolve({ returnCode: '-1', returnMessage: '请求异常', bean: null });
            });
    });
};
const getFormatFlag = (params: any, key: string) => {
    // 交互中心parmas会存在null 和 undefined的情况
    if (params == null || params == undefined) {
        params = "";  
    } 
    let keys = Object.keys(params) || [];
    for (let i = 0; i < keys.length; i++) {
        if (typeof (params[keys[i]]) == "object") {
            if (getFormatFlag(params[keys[i]], key)) return true
        }
        if (keys[i] == key) {
            if (params[key] == "1") return true
        }
    }
    return false
}


/**
 * 执行接口
 * @param interfaceId
 * @param params
 */
export const execInterface = (interfaceId: string, params: { [key: string]: any }, options?: any) => {
    return new Promise((resolve) => {
        // 基础信息
        const { userInfo, appPageId } = usePageStore.getState();

        // 检查必要的参数是否存在，如果不存在则提供默认值或报错
        if (!userInfo || !userInfo.staffId) {
            resolve({});
            return;
        }
        request
            .post('/csf/appInterface/execInterfaceCp', {
                params: {
                    dataInfo: JSON.stringify({
                        interfaceId,
                        param: {
                            params
                        }
                    }), staffId: userInfo.staffId
                },
            }, options)
            .then(
                result => resolve(result),
                err => {
                    let parsedError;
                    try {
                        if (err instanceof Error && typeof err.message === 'string' && err.message.startsWith('{')) {
                            parsedError = JSON.parse(err.message);
                        }
                    } catch (e) {
                        parsedError = { code: '-1', message: err instanceof Error ? err.message : String(err) };
                    }
                    resolve({
                        returnCode: parsedError?.code || '-1',
                        returnMessage: parsedError?.message || '服务异常，请稍后再试',
                        bean: {
                            returnCode: parsedError?.code || '-1',
                            returnMessage: parsedError?.message || '服务异常，请稍后再试'
                        },
                        ...parsedError
                    });
                }
            );
    });
}

export default getFieldFromAPI;
