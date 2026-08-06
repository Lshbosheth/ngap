import request from './../utils/request';
import { baseApiConvert } from './../utils/util';

// 获取页面详情
export const getPageDetail = (id: string, serviceTypeId: string, provinceId: string, relationId?: string, appStatus?: string) => {
    let params = {
        provId: provinceId,
        serviceTypeId: serviceTypeId,
        id: id ? id : "",
        relationId: relationId ? relationId : "",

    };
    let crossAPIUrl = baseApiConvert(window.location.protocol + '//' + window.location.host + '/ngapcontrol');
    let appUrl = '/app/queryAppAndNodeInfo2'
    if (appStatus && appStatus == "1") (
        appUrl = '/app/queryAppAndNodeInfo'
    )
    return request.post(crossAPIUrl + appUrl, { params: params });
};
