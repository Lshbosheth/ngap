import request from './request';
import { handleApi } from '../packages/utils/handleApi';
export const mergeApis = (apisGlobal: any, pageData: any, updateApiGlobal: any) => {
    const ids = (apisGlobal || []).map((item: any) => item.id);
    const _apisGlobal = JSON.parse(JSON.stringify(apisGlobal || []));
    (pageData.apisGlobal || []).forEach((api: any) => {
        if (ids.indexOf(api.id) == -1) {
            _apisGlobal.push(api);
        }
    });
    updateApiGlobal(_apisGlobal);
    return _apisGlobal;
};
export const updateApiConfig = ({
    api,
    apiOutParam,
    addApiOutParam,
    apiOutData,
    editApiOutData,
    _state,
    userInfo,
    apiList,
}: {
    [key: string]: any;
}) => {
    return new Promise((resolve) => {
        !apiOutParam && (apiOutParam = {});
        !apiOutData && (apiOutData = {});
        let handleApiNum: number = 0;
        if(!api || api.length == 0){
            resolve(true)
        }
        (api || []).forEach((_api: any) => {
            if (_api.id && !apiOutParam[_api.id]) {
                const id = _api.id;
                const params = {
                    params: {
                        interfaceId: id,
                        staffId: userInfo.staffId,
                    },
                };
                request.post('/csf/appInterface/getInterfaceParamsAndCheck', params).then((data: any) => {
                    addApiOutParam(id, data.beans, apiList);
                    console.log(data.beans);
                });
            }
            if (_api.id && !apiOutData[_api.id]) {
                const id = _api.id;
                handleApiNum++;
                handleApi(
                    {
                        sourceType: 'api',
                        id: id,
                        source: '',
                        sourceField: {
                            type: 'variable',
                            value: 'Map',
                        },
                        params: _api.params,
                    },
                    {},
                    _state,
                ).then((res: any) => {
                    if (res?.code === 0) {
                        editApiOutData(id, res.data);
                        handleApiNum--;
                        if(handleApiNum == 0){
                            resolve(true);
                        }
                    }
                });
            }
        });
        // 超时处理
        setTimeout(() => {
            resolve(false);
        }, 6000)
    })
};
