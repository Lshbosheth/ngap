import CrossAPI from './crossAPI';
import { crossApiUserInfo, CrossApiUserInfoState } from '../stores/crossapiStore';
import { CrossAPIStaticData } from '../stores/crossAPIStaticDataStore';
export const authCode = {
    //获取员工基本资料
    getIndexInfo: {
        accessCode: 'ngshgetIndexInfo',
        authenticationCode: '00c05b9e6058b7ffece1eaa6435b2b7e',
    },
    //获取当前通话的客户资料
    getClientBusiInfo: {
        accessCode: 'ngshgetClientBusiInfo',
        authenticationCode: 'f832b2e808c6d6f9aa13e75e5afd9b99',
    },
    //获取当前会话信息
    getCallingInfo: {
        accessCode: 'ngshgetCallingInfo',
        authenticationCode: '631f7fe9d30483bff96224c586a2d9c6',
    },
    //获取当前客服代表状态
    getAgentState: {
        accessCode: 'ngshgetAgentState',
        authenticationCode: '6f86fff91d1a7f694e3d0f213731e3bf',
    },
    //服务助手转接专席
    showTransferOpen: {
        accessCode: 'ngshshowTransferOpen',
        authenticationCode: '1f6701301d9ca19d0ab7d943d89f0694',
    },
    //统一自动流程接口
    unifiedProcess: {
        accessCode: 'ngshunifiedProcess',
        authenticationCode: 'e96943b082db761c3ba91b8d603fef4b',
    },
    //获取可支撑省份信息
    getPropProvInfo: {
        accessCode: 'ngshgetPropProvInfo',
        authenticationCode: '994ec23e4768f2aa712b2105bbec3812',
    },
    //获取老工号及平台名称
    getSystermOldStaffIdList: {
        accessCode: 'ngshgetSystermOldStaffIdList',
        authenticationCode: '75b7fc7243ca79ad143123a481cc168c',
    },
    //获取流水号
    getSerialNo: {
        accessCode: 'ngshgetSerialNo',
        authenticationCode: 'cb8921ec568a8828a61b2186aa40d405',
    },
    //获取坐席签入技能
    getAgentCurSignInSkills: {
        accessCode: 'ngshgetAgentCurSignInSkills',
        authenticationCode: 'b9df533197871ded7de9ba9dada0b37f',
    },
    //有弹窗外呼
    callOut: {
        accessCode: 'ngshcallOut',
        authenticationCode: '55867a98b40a0123e8a8c471a5afbb28',
    },
    getSendIMLinkTo: {
        accessCode: 'ngshsendIMLinkto',
        authenticationCode: '56ae4cab9ece116933c6ccff315505f5',
    },
    sendCardMessage: {
        //已按照申请的进行传递
        accessCode: 'ngshsendCardMessage',
        authenticationCode: '25f5b58e58fef0e396bf9ca4bfe28d77',
    },
    getCenterCode: {
        accessCode: 'ngshgetCenterCode',
        authenticationCode: '56ae4cab9ece116933c6ccff315505f5',
    },
};
    const CallingInfo = CrossAPIStaticData.getState().callingInfo;
    const clientBusiInfo = CrossAPIStaticData.getState().clientBusiInfo;
    const serialNo = CrossAPIStaticData.getState().serialNo;
    const AgentState = CrossAPIStaticData.getState().getAgentState;
    const userInfo = crossApiUserInfo.getState().userInfo;

/**
 * 获取当前坐席基本资料
 * @param callback
 */
export const getIndexInfo = (callback: (o: object) => any) => {
    if (userInfo.isTopShow) {
        callback({ userInfo: userInfo });
    } else {
        CrossAPI.getContact('cross_data', authCode.getIndexInfo, (data:any) => {
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
            callback(data);
        });
    }
};
/**
 * 获取当前会话信息，非通话中则为上一通会话或者为空
 * @param callback
 */
export const getCallingInfo = (callback: (o: object) => any) => {
    if (userInfo.isTopShow) {
        callback(CallingInfo);
    } else {
        CrossAPI.getContact('getCallingInfo', authCode.getCallingInfo, (data:any) => {
            if (data && data.sessionValidationInfoNew && Object.keys(data.sessionValidationInfoNew).length !== 0) {
                data.sessionValidationInfoNewNgsh = JSON.stringify(data.sessionValidationInfoNew);
            }
            if(data && data.subsNumber && data.sessionValidationInfo && data.sessionValidationInfo[data.subsNumber]){
                data.cipher = data.sessionValidationInfo[data.subsNumber].cipher;
            }
            callback(data);
        });
    }
   
};
/**
 * 获取当前通话的客户资料，若当前无通话，则获取当前受理号码的资料
 * @param param
 * @param callback
 */
export const getClientBusiInfo = (param: any, callback: (o: object) => any) => {
    if (userInfo.isTopShow) {
        callback(clientBusiInfo);
    } else {
        param.accessCode = authCode.getClientBusiInfo.accessCode
        param.authenticationCode = authCode.getClientBusiInfo.authenticationCode
        CrossAPI.getContact('getClientBusiInfo', {}, (res) => {
            callback(res);
        });
    }
    
};
/**
 * 获取当前客服代表状态
 * @param callback
 */
export const getAgentState = (callback: (o: object) => any) => {
    if (userInfo.isTopShow) {
        callback(AgentState);
    } else {
        CrossAPI.getContact('getAgentState', authCode.getAgentState, (data) => {
            callback(data);
        });
    }
 
};
/**
 * 服务助手转接专席
 */
export const showTransferOpen = () => {
    CrossAPI.getContact('showTransferOpen', authCode.showTransferOpen);
};
/**
 * 转出统一自助流程接口（支持返回人工和不返回人工两种方式）
 * @param param
 * @param callback
 */
export const unifiedProcess = (param: any, callback: (o: object) => any) => {
    param.accessCode = authCode.unifiedProcess.accessCode;
    param.authenticationCode = authCode.unifiedProcess.authenticationCode;
    CrossAPI.getContact('unifiedProcess', param, (data) => {
        callback(data);
    });
};
/**
 * 获取当前会话信息，非通话中则为上一通会话或者为空
 * @param getPropProvInfo
 */
export const getPropProvInfo = (callback: (o: object) => any) => {
    CrossAPI.getContact('getPropProvInfo', authCode.getPropProvInfo, (data) => {
        callback(data);
    });
};
/**
 * 获取当前会话信息，非通话中则为上一通会话或者为空
 * @param getSerialNo
 */
export const getSerialNo = (callback: (o: object) => any) => {
    callback(serialNo)
    // CrossAPI.getContact('getSerialNo', authCode.getSerialNo, (data) => {
    //     callback(data);
    // });
};
/**
 * 获取当前会话信息，非通话中则为上一通会话或者为空
 * @param getAgentCurSignInSkills
 */
export const getAgentCurSignInSkills = (callback: (o: object) => any) => {
    CrossAPI.getContact('getAgentCurSignInSkills', authCode.getAgentCurSignInSkills, (data) => {
        callback(data);
    });
};
/**
 * 获取当前会话信息，非通话中则为上一通会话或者为空
 * @param callOut
 */
export const callOut = (callback: (o: object) => any) => {
    CrossAPI.getContact('callOut', authCode.callOut, (data) => {
        callback(data);
    });
};
/**
 * 获取当前会话信息，非通话中则为上一通会话或者为空
 * @param getSystermOldStaffIdList
 */
export const getSystermOldStaffIdList = (callback: (o: object) => any) => {
    CrossAPI.getContact('getSystermOldStaffIdList', authCode.getSystermOldStaffIdList, (data) => {
        callback(data);
    });
};
/**
 * 获取当前会话信息，非通话中则为上一通会话或者为空
 * @param sendIMLinkto
 */
export const sendIMLinkto = (param: any, callback: (o: object) => any) => {
    param.accessCode = authCode.getSendIMLinkTo.accessCode;
    param.authenticationCode = authCode.getSendIMLinkTo.authenticationCode;
    CrossAPI.getContact('sendIMLinkto', param, (data) => {
        callback(data);
    });
};
/**
 * 通过交互中心获取  im相关信息
 */
export const sendCardMessage = (callback: (o: object) => any) => {
    CrossAPI.getContact('sendCardMessage', authCode.sendCardMessage, (data) => {
        callback(data);
    });
};
export const getCenterCode = (callback: (o: object) => any) => {
    CrossAPI.getContact('getCenterCode', authCode.getCenterCode, (data) => {
        callback(data);
    });
};
/**
 * 预校验
 */
export const faceCheckPrevalidation = (callback: (o: object) => any) => {
    CrossAPI.getContact('faceCheckPrevalidation', {}, (data) => {
        callback(data);
    })
}
/**
 * 转密码认证（他机）
 */
const cipherCheckCallback = (data: any) => {
    CrossAPI.removeListener("validateResultEvent", cipherCheckCallback);
    cipherCheckWithMsisdnCallback && cipherCheckWithMsisdnCallback(data);
    cipherCheckWithMsisdnCallback = null;
}
let cipherCheckWithMsisdnCallback: any = null;
export const cipherCheckWithMsisdn = (params: object, callback: (o: object) => any) => {
    getClientBusiInfo({}, (busiInfo: any) => {
        CrossAPI.getContact("cipherCheckWithMsisdn", {msisdn: busiInfo.msisdn, ...params}, (data) => { });
        cipherCheckCallback && CrossAPI.removeListener("validateResultEvent", cipherCheckCallback);
        CrossAPI.on("validateResultEvent", cipherCheckCallback);
        cipherCheckWithMsisdnCallback = callback;
    })
}
/**
 * 转密码认证（本机）
 */
const cipherCheckPlusCallback = (data:any) => {
    CrossAPI.removeListener("validateResultEvent", cipherCheckPlusCallback);
    cipherCheckPluscallback && cipherCheckPluscallback(data);
    cipherCheckPluscallback = null;
}
let cipherCheckPluscallback: any = null;
export const cipherCheckPlus = (params: object, callback: (o: object) => any) => {
    cipherCheckPluscallback = callback;
    CrossAPI.removeListener("validateResultEvent", cipherCheckPlusCallback);
    CrossAPI.getContact("cipherCheckPlus", {...params});
    CrossAPI.on("validateResultEvent", cipherCheckPlusCallback);
}
/**
 * 一键转自助流程
 */
const businessResultEventCallback = (data:any) => {
    CrossAPI.removeListener("businessResultEvent", businessResultEventCallback);
    unifiedProcessCallback && unifiedProcessCallback(data);
    unifiedProcessCallback = null;
}
let unifiedProcessCallback: any = null;
export const unifiedProcess1 = (params: object, callback: (o: object) => any) => {
    unifiedProcessCallback = callback;
    CrossAPI.getContact("unifiedProcess", {...params});
    CrossAPI.on("businessResultEvent", businessResultEventCallback);
}
/**
 * 发起辅助视频
 */
export const initiateAuxiliaryVideo = ( callback: (o: object) => any ) => {
    getClientBusiInfo({}, (busiInfo: any) => {
        CrossAPI.getContact("initiateAuxiliaryVideo", {subsNumber: busiInfo.msisdn, accessCode: "ngap"}, (data) => {
            callback && callback(data);
        });
    })
}
/**
 * 获取热线语音转文本消息
 */
let voiceText: any = [];
const imMessageEventCallback = (info: any) => {
    voiceText.push(info);
}
// 开始收集语音转文本消息
export const startVoice2TextListerner = (callback: (o: object) => any) => {
    voiceText = [];
    CrossAPI.removeListener("imMessageEvent", imMessageEventCallback);
    CrossAPI.on("imMessageEvent", imMessageEventCallback)
}
// 结束收集语音转文本消息，并返回文本数据
export const stopVoice2TextListerner = (callback: (o: any) => any) => {
    CrossAPI.removeListener("imMessageEvent", imMessageEventCallback);
    callback && callback(voiceText);
    voiceText = [];
}
