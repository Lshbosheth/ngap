import { CrossAPIFnAction } from '../types';
import { baseApiConvert } from '../../utils/util';
import request from '../../utils/request';
import { Modal, message, notification } from '../../utils/AntdGlobal';
import CrossAPI from '../../utils/crossAPI';
import { proid8to3 } from '../../utils/ProvinceIdCon';
import { crossApiUserInfo, CrossApiUserInfoState } from '../../stores/crossapiStore';
import { CrossAPIStaticData } from '../../stores/crossAPIStaticDataStore';
import { getClientBusiInfo } from "../../utils/crossAPIUtil"
import { getUrlName } from './util'

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
    const callingInfo = CrossAPIStaticData.getState().callingInfo;

    // CrossAPI.getContact('getCallingInfo', function (callingInfo: any) {
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
    CrossAPI.destroyDialog('ngshToolScreenCard');
    CrossAPI.showDialog({
        id: 'ngshToolScreenCard',
        title: '',
        url: cardUrl,
        param: '',
        modal: false,
        width: '0',
        height: '0',
    });
    // });
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
    CrossAPI.showDialog({
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
    CrossAPI.removeListener("validateResultEvent", cipherCheckCallback);
    cipherCheckWithMsisdnCallback && cipherCheckWithMsisdnCallback(data);
    cipherCheckWithMsisdnCallback = null;
}
let cipherCheckWithMsisdnCallback: any = null;

const cipherCheckPlusCallback = (data:any) => {
    CrossAPI.removeListener("validateResultEvent", cipherCheckPlusCallback);
    cipherCheckPluscallback && cipherCheckPluscallback(data);
    cipherCheckPluscallback = null;
}
let cipherCheckPluscallback: any = null;

const businessResultEventCallback = (data:any) => {
    CrossAPI.removeListener("businessResultEvent", businessResultEventCallback);
    unifiedProcessCallback && unifiedProcessCallback(data);
    unifiedProcessCallback = null;
}
let unifiedProcessCallback: any = null;

let voiceText: any = [];
const imMessageEventCallback = (info: any) => {
    voiceText.push(info);
}
// 框架方法执行
export const crossAPIAction = async (action: CrossAPIFnAction, data: any, callback: any, state?: any) => {
    const userInfo = crossApiUserInfo.getState().userInfo;
    const CallingInfo = CrossAPIStaticData.getState().callingInfo;
    const clientBusiInfo = CrossAPIStaticData.getState().clientBusiInfo;
    const serialNo = CrossAPIStaticData.getState().serialNo;
    const getAgentState = CrossAPIStaticData.getState().getAgentState;
    const url = window?.location?.href;
    if (action.eventNm === '6') {
        // 下发短信类
        let iframeHtml = 'http://ngsh.cs.cmos/ngsh/dist/modules/tools/toolsViewManage/sendMessageType.html';
        if (url.indexOf('cs.cmos:8080') > -1) {
            // 测试环境
            iframeHtml = 'http://ngsh.cs.cmos:8080/ngsh/dist/modules/tools/toolsViewManage/sendMessageType.html';
        }
        iframeHtml = iframeHtml + '?smsId=' + (action.smsId ? action.smsId : '');
        iframeHtml = baseApiConvert(iframeHtml);
        CrossAPI.showDialog({
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
            CrossAPI.showDialog({
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
                CrossAPI.createTab(
                    '工单受理(' + action.srvReqstTypeId + ')',
                    baseApiConvert(srvReqst) + '#' + action.srvReqstTypeId,
                    lidanParam,
                );
            } catch (e) {
                console.log(e);
            }
        }
    } else if (action.eventNm == '4') {
        // 转接专席类
        // CrossAPI.getContact('getAgentState', function (data: any) {
        if (getAgentState.agentState != '7') {
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
            CrossAPI.getContact('showTransferOpen', params, function (data) { });
        }
        // });
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
        CrossAPI.destroyTab(ticketNm);
        CrossAPI.createTab(ticketNm, taskAccptUrl, param);
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
                    CrossAPI.createTab(action.knwlgAtomNm ? action.knwlgAtomNm : '', baseApiConvert(knowledgeUrl), {});
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
                            if (res?.returnCode == '0') {
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
        // });
    } else if (action.eventNm == "26") {
        // 转密码认证（他机）
        getClientBusiInfo({}, (busiInfo: any) => {
            const params = {
                msisdn: busiInfo.msisdn,
                validationTypeId: action.validationTypeId,
                ...data
            }
            CrossAPI.getContact("cipherCheckWithMsisdn", params, (_data) => { });
            cipherCheckCallback && CrossAPI.removeListener("validateResultEvent", cipherCheckCallback);
            CrossAPI.on("validateResultEvent", cipherCheckCallback);
            cipherCheckWithMsisdnCallback = callback;
        })
    } else if (action.eventNm == "25") {
        // 转密码认证（本机）
        cipherCheckPluscallback = callback;
        CrossAPI.removeListener("validateResultEvent", cipherCheckPlusCallback);
        const params = {
            validationTypeId: action.validationTypeId,
            ...data
        }
        CrossAPI.getContact("cipherCheckPlus", params);
        CrossAPI.on("validateResultEvent", cipherCheckPlusCallback);
    } else if (action.eventNm == "14") {
        // 一键转自助流程
        unifiedProcessCallback = callback;
        const params = {
            businessTypeId: action.businessTypeId,
            sceneType: action.sceneType,
            transferMode: action.transferMode,
            subsNumber: clientBusiInfo.bean.msisdn,
            transferType: action.transferType,
            accessCode: action.accessCode,
            authenticationCode: action.authenticationCode,
            ...data
        }
        CrossAPI.getContact("unifiedProcess", params);
        CrossAPI.on("businessResultEvent", businessResultEventCallback);
    } else if (action.eventNm == "224") {
        // 发起辅助视频
        getClientBusiInfo({}, (busiInfo: any) => {
            const params = {
                subsNumber: busiInfo.msisdn,
                accessCode: "ngap",
                ...data
            }
            CrossAPI.getContact("initiateAuxiliaryVideo", params, (data) => {
                callback && callback(data);
            });
        })
    } else if (action.eventNm == "31") {
        if(action.imMessageType == "0"){
            // 开始收集语音转文本消息
            voiceText = [];
            CrossAPI.removeListener("imMessageEvent", imMessageEventCallback);
            CrossAPI.on("imMessageEvent", imMessageEventCallback);
            callback && callback();
        }else if(action.imMessageType == "1"){
            // 结束收集语音转文本消息，并返回文本数据
            CrossAPI.removeListener("imMessageEvent", imMessageEventCallback);
            callback && callback(voiceText);
            voiceText = [];
        }
    } else if (action.eventNm == "24") {
        const params = {
            calledDeviceType: "5",
            transferMode: "2",
            calledDigits: (clientBusiInfo?.bean?.numAssignmentCode || "") + "10086",      // 怎么获取地市
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
        CrossAPI.getContact("transOutNum", params, () => {
            callback && callback();
        })
    } else if (action.eventNm === '17') {
        // 用后即评操作
        if (!action.serviceId) {
            message.open({
                type: 'error',
                content: '使用用后即评功能需要申请该应用对应的服务ID',
            });
            return
        }
        const appSequenceData = state?.pageStore?.getState?.() || {};
        let cardUrl = 'https://ng86app.cs.cmos/ng86app/ng86app-react/dist/FeedbackPage.html';
        const appId = appSequenceData.config?.id || appSequenceData.id || '';
        const appName = appSequenceData.config?.appName || appSequenceData.page.name || '';
        const serviceParams = {
            projectId: appSequenceData.page?.projectId || appId,
            appLevel: appSequenceData.config?.appLevel || '',
            relationID: appSequenceData.config?.relationId || '',
            appVersion: appSequenceData.config?.belongVersion || '',
            appPovcode: appSequenceData.config?.provId || '',
            appId: appId,
            staffId: userInfo.staffId,
            staffProvCode: userInfo.provinceId,
            staffType: userInfo.accountType || '',
        };
        // 验签请求参数
        const params = {
            serviceId: action.serviceId,
            hrId: userInfo.eHumanRsNo || '',
            staffId: serviceParams.staffId,
            serviceParams: JSON.stringify(serviceParams),
        };
        request.post('/appDashboard/getAppSign', { params: params })
        .then((res: any) => {
            if (res?.object) {
                const result = JSON.parse(res?.object);
                // 验签成功
                cardUrl = cardUrl + '?appSign=' + result?.appSign;
                CrossAPI.destroyDialog("feedbackPagePC");
                CrossAPI.showDialog({
                    id: "feedbackPagePC",
                    title: (appName || "") + '用后即评',
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
        })
        .catch((err: any) => {
            // 拦截器抛出的错误在这里捕获
            message.open({
                type: 'error',
                content: err?.message || err?.data?.message || '用后即评弹框失败！',
            });
        });
    } else if (action.eventNm === '18') {
        // 发送消息到交谈区
        const receiveSendMsgParam = {
            serialNo: CallingInfo && CallingInfo.serialNo ? CallingInfo.serialNo : '', //接触流水、通话流水,//会话流水号
            content: action.receiveSendMsgContent,//不支持富文本
            sendType: action.receiveSendMsgType,//1是编辑区 2是交谈区
            callerSystemId: 'NGAP'
        }
        CrossAPI.getContact('ngfv_receive_sendMsg', receiveSendMsgParam, () => {
            callback && callback();
        })
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
