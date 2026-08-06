import { CrossAPIFnAction } from '../types';
import { baseApiConvert } from './util';
import request from './request';
import { Modal, message, notification } from './AntdGlobal';
import { proid8to3 } from './ProvinceIdCon';
import { usePageStore } from '@materials/stores/pageStore';
import { getUrlName } from './util';

interface ListData {
    key: string;
    value: any;
}
// 业务流水前端自动生成方法
const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

const getCardBusiNo = function () {
    const uuid = 'xxxxxx'.replace(/x/g, function () {
        const i = (Math.random() * 40) | 0;
        return CHARS[i];
    });
    return getFormatTime() + uuid;
};

const getFormatTime = function () {
    const date = new Date();
    return (
        date.getFullYear().toString() +
        format(date.getMonth() + 1) +
        format(date.getDate()) +
        format(date.getHours()) +
        format(date.getMinutes()) +
        format(date.getSeconds())
    );
};

const format = function (n: number) {
    return n < 10 ? '0' + n : n;
};

// 同屏卡片方法
const openScreenCardParams = (provId: string, listParams: ListData[], screenCardPreviewUrl: string) => {
    window?.crossAPI?.getContact('getCallingInfo', function (callingInfo: any) {
        const provCode = proid8to3(provId);
        const busiNo = getCardBusiNo();
        const msisdn = callingInfo ? callingInfo.subsNumber : undefined;
        let cardUrl = screenCardPreviewUrl + 'provCode=' + provCode + '&channelId=ngsh' + '&msisdn=' + msisdn + '&busiNo=' + busiNo;
        let cardUrlParamStr = '';
        for (let i = 0; i < listParams.length; i++) {
            cardUrlParamStr += '&' + listParams[i].key + '=' + listParams[i].value;
        }
        cardUrl = cardUrl + cardUrlParamStr;
        cardUrl = baseApiConvert(cardUrl);
        window?.crossAPI?.destroyDialog('ngshToolScreenCard');
        window?.crossAPI?.showDialog({
            id: 'ngshToolScreenCard',
            title: '',
            url: cardUrl,
            param: '',
            modal: false,
            width: '0',
            height: '0',
        });
    });
};

// 请求一键办理弹窗
const getOneKeyHandleDialog = (oneKeyParams: any, nodeObj: any) => {
    let dialogWidth = '840';
    let dialogHeight = '600';
    if (oneKeyParams.serivcerTypeId == 'jsytck') {
        dialogWidth = '1200';
        dialogHeight = '660';
        oneKeyParams.businessType = nodeObj.businessType; // 业务类型
        oneKeyParams.tyProdCode = nodeObj.suplerProdCode; // 业务包编码
        oneKeyParams.mcdsNm = nodeObj.mcdsNm; // 商品名称
    }
    let onekeyurl = 'http://ngbusi.cs.cmos/ngbusi/dist/module/ngbusi/quickOrder/quickOrder.html';
    if (window?.location?.href?.indexOf('.cs.cmos:8080') >= 0) {
        // 测试环境
        onekeyurl = 'http://172.20.127.233:20010/ngbusi/dist/module/ngbusi/quickOrder/quickOrder.html';
    }
    onekeyurl = baseApiConvert(onekeyurl);
    //打开弹框
    window?.crossAPI?.showDialog({
        id: 'openNgrcEightMajorAreasOpenDialog',
        title: nodeObj.mcdsNm,
        url: onekeyurl,
        param: oneKeyParams,
        modal: true,
        width: dialogWidth,
        height: dialogHeight,
    });
};
const cipherCheckCallback = (data: any) => {
    window?.crossAPI?.removeListener("validateResultEvent", cipherCheckCallback);
    cipherCheckWithMsisdnCallback && cipherCheckWithMsisdnCallback(data);
    cipherCheckWithMsisdnCallback = null;
}
let cipherCheckWithMsisdnCallback: any = null;

const cipherCheckPlusCallback = (data:any) => {
    window?.crossAPI?.removeListener("validateResultEvent", cipherCheckPlusCallback);
    cipherCheckPluscallback && cipherCheckPluscallback(data);
    cipherCheckPluscallback = null;
}
let cipherCheckPluscallback: any = null;

const businessResultEventCallback = (data:any) => {
    window?.crossAPI?.removeListener("businessResultEvent", businessResultEventCallback);
    unifiedProcessCallback && unifiedProcessCallback(data);
    unifiedProcessCallback = null;
}
let unifiedProcessCallback: any = null;

let voiceText: any = [];
const imMessageEventCallback = (info: any) => {
    voiceText.push(info);
}
// 框架方法执行
export const crossAPIAction = async (action: CrossAPIFnAction, data: any, callback: any) => {
    const indexInfo: any = await new Promise((resolve) => {
        window?.crossAPI?.getIndexInfo(resolve);
    });
    const userInfo = indexInfo.userInfo;
    const url = window?.location?.href || '';
    if (action.eventNm === '6') {
        // 下发短信类
        let iframeHtml = 'http://ngsh.cs.cmos/ngsh/dist/modules/tools/toolsViewManage/sendMessageType.html';
        if (url.indexOf('cs.cmos:8080') > -1) {
            // 测试环境
            iframeHtml = 'http://ngsh.cs.cmos:8080/ngsh/dist/modules/tools/toolsViewManage/sendMessageType.html';
        }
        iframeHtml = iframeHtml + '?smsId=' + (action.smsId ? action.smsId : '');
        iframeHtml = baseApiConvert(iframeHtml);
        window?.crossAPI?.showDialog({
            id: 'openNgahSendMessageDialog',
            title: '短信发送',
            url: iframeHtml,
            param: '',
            modal: true,
            width: '600',
            height: '400',
        });
    } else if (action.eventNm == '7') {
        // 一键立单类
        window?.crossAPI?.getContact('getCallingInfo', function (CallingInfo: any) {
            const lidanParam: {
                [key: string]: string | undefined;
            } = {
                provCode: userInfo.provinceId,
                tenantId: '100000',
                sysType: '01',
                serviceTypeId: userInfo.serviceTypeId || '',
                staffId: userInfo.staffId || '',
                deptId: userInfo.deptId || '',
                acptStaffNum: userInfo.staffId || '',
                acptDeptId: userInfo.deptId || '',
                acptNum: '', // 受理号码
                callingNum: CallingInfo && CallingInfo.callerNo ? CallingInfo.callerNo : '', //主叫号码
                cntmngId: CallingInfo && CallingInfo.contactId ? CallingInfo.contactId : '', //接触编码
                callId: CallingInfo && CallingInfo.serialNo ? CallingInfo.serialNo : '', //接触流水、通话流水
                calledNum: CallingInfo && CallingInfo.calledNo ? CallingInfo.calledNo : '', //被叫号码
                cntmngCustSrvUnfyCode: CallingInfo && CallingInfo.unifiedCode ? CallingInfo.unifiedCode : '', //服务请求客户服务统一编码
                channelCode: 'NGSH',
                channelSysCode: 'SAS',
                srvReqstTypeId: action.srvReqstTypeId,
                toolInfo: action.fillFormType ? action.fillFormType.join(',') : '', // 填单类型
                srvReqstTypeFullName: action.srvReqstTypeFullNm,
            };
            if (action.verno) {
                lidanParam.verno = action.verno;
            }

            const busiInfoParam = {
                accessCode: 'ngshgetClientBusiInfo',
                authenticationCode: 'f832b2e808c6d6f9aa13e75e5afd9b99',
            };
            window?.crossAPI?.getContact('getClientBusiInfo', busiInfoParam, function (clientBusiInfo: any) {
                if (clientBusiInfo.bean && clientBusiInfo.bean.msisdn) {
                    lidanParam.acptNum = clientBusiInfo.bean.msisdn;
                }
                if (action.fillFormType && action.fillFormType.indexOf('2') != -1) {
                    let iframeHtml =
                        'http://ngsh.cs.cmos/ngsh/src/js/tools/serviceRequest/serviceRequest.html?param=' + encodeURI(JSON.stringify(lidanParam));
                    if (url.indexOf('cs.cmos:8080') != -1) {
                        iframeHtml =
                            'http://ngsh.cs.cmos:8080/ngsh/src/js/tools/serviceRequest/serviceRequest.html?param=' +
                            encodeURI(JSON.stringify(lidanParam));
                    }
                    iframeHtml = baseApiConvert(iframeHtml);
                    window?.crossAPI?.showDialog({
                        id: 'serviceRequestDialog',
                        title: '服务请求',
                        url: iframeHtml,
                        param: lidanParam,
                        modal: true,
                        width: '600',
                        height: '400',
                    });
                } else {
                    let srvReqst = 'http://ngwf.cs.cmos/ngwf/src/module/basesr/v4new/srAcceptServiceRequest.html';
                    if (url.indexOf('cs.cmos:8080') > -1) {
                        // 测试环境
                        srvReqst = 'http://ngwf.cs.cmos:8080/ngwf/src/module/basesr/accept/srAcceptServiceRequest.html';
                    }
                    try {
                        window?.crossAPI?.createTab(
                            '工单受理(' + action.srvReqstTypeId + ')',
                            baseApiConvert(srvReqst) + '#' + action.srvReqstTypeId,
                            lidanParam,
                        );
                    } catch (e) {
                        console.log(e);
                    }
                }
            });
        });
    } else if (action.eventNm == '4') {
        // 转接专席类
        window?.crossAPI?.getContact('getAgentState', function (data: any) {
            if (data.agentState != '7') {
                // 提示转接专席需在通话中进行操作！
                // 提示转接专席需在通话中进行操作！
                message.open({
                    type: 'error',
                    content: '转接专席需在通话中进行操作！',
                });
            } else {
                const relationArr = action.transferAgentVal ? action.transferAgentVal.split('#') : [];
                if (relationArr.length <= 0) {
                    return;
                }
                const params = {
                    trstchTypeId: relationArr[1],
                    trstchTypeDtId: relationArr[0],
                    operType: 'NGSH',
                    accessCode: 'ngshshowTransferOpen',
                    authenticationCode: '1f6701301d9ca19d0ab7d943d89f0694',
                    transferAgentDesc: action.transferInfo,
                };
                window?.crossAPI?.getContact('showTransferOpen', params, function (data: any) { });
            }
        });
    } else if (action.eventNm == '5') {
        // 一键甩单类
        const ticketNm = '新任务单受理';
        let taskAccptUrl = 'http://ngosc.cs.cmos/ngosc/src/modules/middleGroundViews/task/newTaskAccept.html';
        if (url.indexOf('cs.cmos:8080') > -1) {
            // 测试环境
            taskAccptUrl = 'http://ngosc.cs.cmos:8080/ngosc/src/modules/middleGroundViews/task/newTaskAccept.html';
        }
        //获取当前选中的
        const busiInfoData = action.oneKeyOrderId ? action.oneKeyOrderId.split(',') : [];
        const param = {
            busiInfo: {
                superBusiType: busiInfoData[0],
                busiType: busiInfoData[1],
                subBusiType: busiInfoData[2],
            },
        };
        taskAccptUrl = baseApiConvert(taskAccptUrl);
        window?.crossAPI?.destroyTab(ticketNm);
        window?.crossAPI?.createTab(ticketNm, taskAccptUrl, param);
    } else if (action.eventNm == '11') {
        // 知识详情类
        let ngkmUrl = 'http://ngkm.cs.cmos';
        if (url.indexOf('cs.cmos:8080') > -1) {
            // 测试环境
            ngkmUrl = 'http://ngkm.cs.cmos:8080';
        }
        const knwlgAtomIdList = action.knwlgAtomId ? action.knwlgAtomId.split('#') : [];
        if (!knwlgAtomIdList[0]) return;
        const knowlgParam = {
            provCode: userInfo.provinceId,
            knwlgId: knwlgAtomIdList[0],
        };

        request
            .post('/csf/call/queryKnowledgeUrl', { params: knowlgParam })
            .then((knowlgResData: any) => {
                if (knowlgResData.returnCode == '0' && knowlgResData.bean && knowlgResData.bean.url) {
                    let knowledgeUrl = ngkmUrl + knowlgResData.bean.url + '&sysCode=ngsh&serviceName=坐席助手&accessType=1';
                    if (knwlgAtomIdList[1]) {
                        knowledgeUrl = knowledgeUrl + '&atomId=' + knwlgAtomIdList[1];
                    }
                    window?.crossAPI?.createTab(action.knwlgAtomNm ? action.knwlgAtomNm : '', baseApiConvert(knowledgeUrl), {});
                }
            })
            .catch(() => {
            });
    } else if (action.eventNm == '10') {
        // 一键同屏类
        const listParams: ListData[] = [
            { key: 'oneKey', value: action.isPreview ? action.isPreview : '1' },
            { key: 'cardId', value: action.cardId },
            { key: 'pageName', value: '23' },
        ];
        let screenCardPreviewUrl = 'http://ngcard.cs.cmos:31213/ngcardma/v2/dist/sameScreen.html?';
        if (url.indexOf('cs.cmos:8080') > -1) {
            // 测试环境
            screenCardPreviewUrl = 'http://ngcard-test.cs.cmos:8080/ngcardma/v2/dist/sameScreen.html?';
        }
        openScreenCardParams(userInfo.provinceId, listParams, screenCardPreviewUrl);
    } else if (action.eventNm == '8') {
        // 一键办理类
        const nodeObj = {
            suplerProdCode: action.suplerProdCode,
            mcdsNm: action.mcdsNm,
            categoryCode: action.categoryCode,
            provinceOfferType: action.provinceOfferType,
            businessType: '',
            mcdsBigCatgCode: '',
            catgNmPath: '',
        };

        if (nodeObj.provinceOfferType) {
            const arr = nodeObj.provinceOfferType.split('##');
            nodeObj.businessType = arr[0];
            if (arr[1]) {
                nodeObj.mcdsBigCatgCode = arr[1];
            }
        }
        if (nodeObj.provinceOfferType) {
            const arr = nodeObj.provinceOfferType.split('##');
            if (arr[1]) {
                nodeObj.businessType = arr[0];
                const chbnType = arr[1].split('&&');
                if (chbnType[1]) {
                    nodeObj.catgNmPath = chbnType[1]; //CHBN商品分类使用
                }
                nodeObj.mcdsBigCatgCode = chbnType[0];
            } else {
                const chbnType = arr[0].split('&&');
                if (chbnType[1]) {
                    nodeObj.catgNmPath = chbnType[1]; //CHBN商品分类使用
                }
                nodeObj.businessType = chbnType[0];
            }
        }
        //获取当前通话的客户资料
        const getClientBusiInfo = {
            accessCode: 'ngshgetClientBusiInfo',
            authenticationCode: 'f832b2e808c6d6f9aa13e75e5afd9b99',
        };
        window?.crossAPI?.getContact('getClientBusiInfo', getClientBusiInfo, function (clientBusiInfo: any) {
            if (clientBusiInfo && clientBusiInfo.bean && clientBusiInfo.bean.msisdn && clientBusiInfo.bean.msisdn != '') {
                const oneKeyParams = {
                    prodCode: nodeObj.suplerProdCode, // 商品编号
                    acptNum: clientBusiInfo.bean.msisdn, // 受理号码
                    serivcerTypeId: userInfo.serviceTypeId,
                    provCode: proid8to3(userInfo.provinceId), // 三位省份编码
                    channelCode: 'FZSTBL', // 渠道编码
                    subChannelName: '营销助手标准化业务办理', // 子渠道名称
                    opTypeCd: 2, // 操作类型代码
                    isQuickOrder: 1, // 是否一键办理
                    categoryCode: nodeObj.categoryCode, // 后台类目编码
                    catgNmPath: nodeObj.catgNmPath, // CHBN商品编码
                    mcdsBigCatgCode: nodeObj.mcdsBigCatgCode,
                    origProdCode: '',
                    origProdNm: '',
                };

                if (nodeObj.categoryCode && nodeObj.categoryCode != '') {
                    const codeList = nodeObj.categoryCode.split('_');
                    if (codeList.length == 2 && codeList[1] == 'package') {
                        const cList = [codeList[0].slice(0, 1), codeList[0].slice(1, codeList[0].length)];
                        if (cList.length == 2 && cList[0] == 'C' && Number(cList[1]) >= 1 && Number(cList[1]) <= 32) {
                            const userparams = {
                                provCode: proid8to3(userInfo.provinceId),
                                staffId: userInfo.staffId,
                                oldStaffId:
                                    userInfo.systermOldStaffId && userInfo.systermOldStaffId[0] && userInfo.systermOldStaffId[0].origStaffId
                                        ? userInfo.systermOldStaffId[0].origStaffId
                                        : '',
                                userMobile: clientBusiInfo.bean.msisdn,
                            };
                            request.post('/csf/call/queryUserMainOffer', { params: userparams }).then((res: any) => {
                                if (res && res.returnCode == '0') {
                                    oneKeyParams.origProdCode = res?.object?.result?.curOfferId; // 原产品编码
                                    oneKeyParams.origProdNm = res?.object?.result?.curOfferName; // 原产品名称
                                    getOneKeyHandleDialog(oneKeyParams, nodeObj);
                                }
                            });
                        } else {
                            getOneKeyHandleDialog(oneKeyParams, nodeObj);
                        }
                    } else {
                        getOneKeyHandleDialog(oneKeyParams, nodeObj);
                    }
                } else {
                    getOneKeyHandleDialog(oneKeyParams, nodeObj);
                }
            }
        });
    } else if (action.eventNm == "26") {
        // 转密码认证（他机）
        const getClientBusiInfo = {
            accessCode: 'ngshgetClientBusiInfo',
            authenticationCode: 'f832b2e808c6d6f9aa13e75e5afd9b99',
        };
        window?.crossAPI?.getContact('getClientBusiInfo', getClientBusiInfo, function (busiInfo: any) {
            const params = {
                msisdn: busiInfo.msisdn,
                validationTypeId: action.validationTypeId,
                ...data
            }
            window?.crossAPI?.getContact("cipherCheckWithMsisdn", params, () => { });
            cipherCheckCallback && window?.crossAPI?.removeListener("validateResultEvent", cipherCheckCallback);
            window?.crossAPI?.on("validateResultEvent", cipherCheckCallback);
            cipherCheckWithMsisdnCallback = callback;
        })
    } else if (action.eventNm == "25") {
        // 转密码认证（本机）
        cipherCheckPluscallback = callback;
        window?.crossAPI?.removeListener("validateResultEvent", cipherCheckPlusCallback);
        const params = {
            validationTypeId: action.validationTypeId,
            ...data
        }
        window?.crossAPI?.getContact("cipherCheckPlus", params);
        window?.crossAPI?.on("validateResultEvent", cipherCheckPlusCallback);
    } else if (action.eventNm == "14") {
        // 一键转自助流程
        const getClientBusiInfo = {
            accessCode: 'ngshgetClientBusiInfo',
            authenticationCode: 'f832b2e808c6d6f9aa13e75e5afd9b99',
        };
        window?.crossAPI?.getContact('getClientBusiInfo', getClientBusiInfo, function (busiInfo: any) {
            unifiedProcessCallback = callback;
            const params = {
                businessTypeId: action.businessTypeId,
                sceneType: action.sceneType,
                transferMode: action.transferMode,
                subsNumber: busiInfo.msisdn,
                transferType: action.transferType,
                accessCode: action.accessCode,
                authenticationCode: action.authenticationCode,
                ...data
            }
            window?.crossAPI?.getContact("unifiedProcess", params);
            window?.crossAPI?.on("businessResultEvent", businessResultEventCallback);
        })
    } else if (action.eventNm == "224") {
        // 发起辅助视频
        const getClientBusiInfo = {
            accessCode: 'ngshgetClientBusiInfo',
            authenticationCode: 'f832b2e808c6d6f9aa13e75e5afd9b99',
        };
        window?.crossAPI?.getContact('getClientBusiInfo', getClientBusiInfo, function (busiInfo: any) {
            const params = {
                subsNumber: busiInfo.msisdn,
                accessCode: "ngap",
                ...data
            }
            window?.crossAPI?.getContact("initiateAuxiliaryVideo", params, (data: any) => {
                callback && callback(data);
            });
        })
    } else if (action.eventNm == "31") {
        if(action.imMessageType == "0"){
            // 开始收集语音转文本消息
            voiceText = [];
            window?.crossAPI?.removeListener("imMessageEvent", imMessageEventCallback);
            window?.crossAPI?.on("imMessageEvent", imMessageEventCallback);
            callback && callback();
        }else if(action.imMessageType == "1"){
            // 结束收集语音转文本消息，并返回文本数据
            window?.crossAPI?.removeListener("imMessageEvent", imMessageEventCallback);
            callback && callback(voiceText);
            voiceText = [];
        }
    } else if (action.eventNm == "24") {
        window?.crossAPI?.getContact('getCallingInfo', function (CallingInfo: any) {
            const getClientBusiInfo = {
                accessCode: 'ngshgetClientBusiInfo',
                authenticationCode: 'f832b2e808c6d6f9aa13e75e5afd9b99',
            };
            window?.crossAPI?.getContact('getClientBusiInfo', getClientBusiInfo, function (clientBusiInfo: any) {
                if (clientBusiInfo && clientBusiInfo.bean && clientBusiInfo.bean.msisdn && clientBusiInfo.bean.msisdn != '') {
                    const params = {
                        calledDeviceType: "5",
                        transferMode: "2",
                        calledDigits: (clientBusiInfo?.bean?.numAssignmentCode || "") + "10086",
                        callerDigits: clientBusiInfo.bean.msisdn,
                        logParams: {
                            isExt: true,
                            operator: userInfo.staffId,
                            operBeginTime: new Date(),
                            operId: "011",
                            accessCode: CallingInfo && CallingInfo.calledNo ? CallingInfo.calledNo : '',
                            subsNumber: clientBusiInfo.bean.msisdn,
                            failId: "",
                            finalStatus: "0",
                            transferMode: "2",
                            serialNo: CallingInfo && CallingInfo.serialNo ? CallingInfo.serialNo : '',
                            contactId: CallingInfo && CallingInfo.contactId ? CallingInfo.contactId : '',
                            callerNo: CallingInfo && CallingInfo.callerNo ? CallingInfo.callerNo : '',
                            serviceTypeId: userInfo.serviceTypeId || '',
                            deptId: userInfo.deptId || '',
                            deptName: userInfo.deptName || '',
                            transferDestEqupId: (clientBusiInfo?.bean?.numAssignmentCode || "") + "10086"
                        },
                        ...data
                    }
                    window?.crossAPI?.getContact("transOutNum", params, () => {
                        callback && callback();
                    })
                }
            })
        })
    } else if (action.eventNm == '17') {
        // 用后即评操作
        if (!action.serviceId) {
            message.open({
                type: 'error',
                content: '使用用后即评功能需要申请该应用对应的服务ID',
            });
            return
        }
        let cardUrl = "https://ng86app.cs.cmos/ng86app/ng86app-react/dist/FeedbackPage.html";
        const pageData = usePageStore.getState()?.page;
        const appSequenceData = window.appSequenceData || {};
        const appId = pageData?.id || appSequenceData.id || '';
        const appName = pageData?.name || appSequenceData.appName ||'';
        const serviceParams = {
            "projectId": pageData?.projectId || appSequenceData.projectId,  //应用所属项目,
            "appLevel": pageData?.appLevel || appSequenceData.appLevel, //应用级别,
            "relationID": pageData?.relationId || appSequenceData.relationId, //应用的关系ID,
            "appVersion": pageData?.belongVersion || appSequenceData.belongVersion, //应用版本号,
            "appPovcode": pageData?.provId || appSequenceData.provId, //所属应用的省份,
            "appId": appId, //应用id,
            "staffId": userInfo.staffId,
            "staffProvCode": userInfo.provinceId,
            "staffType": userInfo.accountType || "" //"人员类型"
        }
        const params = {
            "serviceId": action.serviceId, // 下发接入侧服务id
            "hrId": userInfo.eHumanRsNo || "",    // 当前登陆人hrId ，自有人员用E开头工号
            "staffId": serviceParams.staffId,    // 坐席工号，如果hrId为空，此字段必传
            "serviceParams": JSON.stringify(serviceParams) // 业务侧自定义参数，为对象json序列号后字符串（长度建议少于4000）
        }

        request.post('/appDashboard/getAppSign', { params: params }).then((res: any) => {
            if (res?.object) {
                const result = JSON.parse(res?.object);
                // 验签成功
                cardUrl = cardUrl+ '?appSign=' + result?.appSign;
                console.log(cardUrl);
                window?.crossAPI?.destroyDialog("feedbackPagePC");
                window?.crossAPI?.showDialog({
                    id: "feedbackPagePC",
                    title: (appName|| "") + '用后即评',
                    url: cardUrl,
                    param: "",
                    modal: true,
                    width: '800',
                    height: '600',
                });
            } else {
                message.open({
                    type: 'error',
                    content: '用后即评弹框验签失败！',
                });
            }
        }).catch((err: any) => {
            // 拦截器抛出的错误在这里捕获
            message.open({
                type: 'error',
                content: err?.message || err?.data?.message || '用后即评弹框失败！',
            });
        });
    } else if (action.eventNm === '18') {
        // 获取通话流水号
        window?.crossAPI?.getContact('getCallingInfo', function (CallingInfo: any) {
            // 发送消息到交谈区
            const receiveSendMsgParam = {
                serialNo: CallingInfo && CallingInfo.serialNo ? CallingInfo.serialNo : '', //接触流水、通话流水,//会话流水号
                content: action.receiveSendMsgContent,//不支持富文本
                sendType: action.receiveSendMsgType,//1是编辑区 2是交谈区
                callerSystemId: 'NGAP'
            }
            window?.crossAPI?.getContact('ngfv_receive_sendMsg', receiveSendMsgParam, () => {
                callback && callback();
            })

        })

    } else if (action.eventNm == '33') {
        // 获取行为中配置的静态参数
        //CrossAPI.trigger(['slf测试接收事件流'],'submit_ngap',{ dataId:eventParams?.action?.commenId });
        const paramsOne = {
            sendEventName: "ngap_commonMsgSendEvent",
            sendEventType: "3",//1页签 2,ngfv，3小球
            sendEventParams: {
                sendType: "ngapOpenOnenegativeFunc",
                dataId:action?.commenId,
                _timestamp: Date.now(), // 添加时间戳
                _uid: Math.random().toString(36).slice(2), // 唯一ID
                dataArr:data
            },
            accessCode: "ngapforeignSendTrigger"
        }
        window?.crossAPI?.getContact("foreignSendTrigger", paramsOne, function () {});
        callback && callback();
        console.log('打开负一屏推送',paramsOne)
    }else if (action.eventNm == '34') {
        Modal.confirm({
            title: '号码变更提醒',
            content: '本次业务操作将全程系统记录留痕，请您确认信息操作无误，违规操作将按规定承担相应责任。',
            okText: '确认',
            cancelText: '取消',
            onOk: async () => {
                const telphone = data[action.acceptTelphoneField as string];
                const params = {
                    newSubsNumber: telphone,
                };
                window?.crossAPI?.getContact('setInputSubsNumber', params, function (res: any) {
                    console.log('受理号码结果通知', res);
                    window.gdp('track', 'clk', {
                        WT_et: 'clk',
                        WT_event: 'ngap_' + getUrlName(),
                        WT_envName: document.title + '=点击 “受理号码变更” 按钮',
                        userId: telphone
                    });
                });
                callback && callback();
                console.log('受理号码变更', params);
            },
        });
    }
};
