import request from './request';

/**
 * GoldBank 选项接口
 */
interface GoldBankOptions {
    operCode?: string;
    appCode?: string;
    operContent?: string;
    subLoginName?: string;
    userInfo: {
        staffName?: string;
        serviceTypeId?: string;
        provinceId?: string;
        staffId?: string;
    };
    operateTypeName?: string;
    operateContent?: string;
    operateTypeCode?: string;
    menuName?: string;
    menuPath?: string;
}

/**
 * 金库审批结果回调函数类型
 */
type GoldBankCallback = (isAccess: boolean) => void;

class GoldBank {
    targetWin: Window | null;
    sharedObject: Record<string, any>;
    winURL: string;
    cb: GoldBankCallback | undefined;
    options: GoldBankOptions;
    isInit: boolean;
    prsnMainAcct: string;
    mainAcctName: string;

    constructor(url: string, options: GoldBankOptions = {
        userInfo: {}
    }, cb?: GoldBankCallback) {
        this.targetWin = null;
        this.sharedObject = {};
        this.winURL = url; // 应用侧对应后台服务action
        this.cb = cb; // 回调函数
        this.options = options; // 参数
        this.isInit = true;
        this.prsnMainAcct = '';
        this.mainAcctName = '';
    }

    open(): void {
        this.creatBg();
        this.ShowDialog();
    }

    creatBg = (): void => {
        // 创建遮罩层
        if (!document.querySelector('#gold-bg')) {
            const container = document.createElement('div');
            const bg = `<div id="bg" style="display:none;background-color: #ccc;width: 100%;position:absolute;height: 100%;opacity: 0.5;z-index: 1;"></div>
            <div style="padding-top: 10%;padding-left:40%;z-index:1;"></div>`;
            container.innerHTML = bg;
            document.body.appendChild(container);
        }
    };

    ShowDialog = async (): Promise<void> => {

        const { operCode, appCode, operContent, userInfo } = this.options;
        // 获取IP地址
        const ip = await this.getIp();
        if (ip) {
            // 可以使用ip进行后续操作
        }

        // 获取主从账号信息 /goldDatabase/queryMajorInfoByStaffId
        // (调用：用户中心)根据业务账号查询主账号和应用4A账号
        const majorInfo = await request.post('/goldDatabase/queryMajorInfoByStaffId', { params: { staffId: userInfo.staffId } });
        const finalResult = {
            staffId: userInfo.staffId || '',
            staffName: userInfo.staffName || '',
            clientIp: ip || '',
            bizTypeId: userInfo.serviceTypeId || '',
            provinceId: userInfo.provinceId,
            mainAcctName: majorInfo.bean.fourAccout || '',
            prsnMainAcct: majorInfo.bean.prsnMainAcct || '',
        }
        this.prsnMainAcct = majorInfo.bean.prsnMainAcct;
        this.mainAcctName = majorInfo.bean.fourAccout;
        // 根据从账号/工号获取金库授权认证结果
        // /goldDatabase/getTreasuryVerificationForOther
        const _prsnMainAcct = (majorInfo && majorInfo.bean.prsnMainAcct) ? majorInfo.bean.prsnMainAcct : userInfo.staffId
        const serachParam = {
            "staffIdCode": operCode + "_" + _prsnMainAcct.toUpperCase(),
            "staffId": userInfo.staffId,
            "securityTypeCode": operCode
        }
        const treasuryVerificationRes = await request.post('/goldDatabase/getTreasuryVerificationForOther', { params: serachParam });
        // const treasuryVerificationRes = {
        //     bean: {
        //         securityResult: 1
        //     }
        // }
        if (treasuryVerificationRes.bean) {
            if (treasuryVerificationRes.bean.securityResult == 0) {
                this.cb && this.cb(true);
                return
            }
        }

        // 金库模式参数加密
        // /goldDatabase/goldModeEncryptParams
        const data = await request.post('/goldDatabase/goldModeEncryptParams', { operCode: operCode, subLoginName: _prsnMainAcct.toUpperCase() });
        // const data = {
        //     "returnCode": 0,
        //     "beans": [],
        //     "returnMessage": "获取CSF响应的账号信息并缓存Redis成功,缓存生效时间为：604800秒!",
        //     "rtnMsg": "成功",
        //     "bean": {
        //         "fourAccout": "zhangduoli",
        //         "prsnMainAcct": "zhangduoli",
        //         "subLoginName": "16|-85|-53|-125|-109|-47|101|-20|41|-16|-32|-4|-91|-92|-75|96|4",
        //         "mainLoginName": "",
        //         "operCode": "16|-35|48|97|103|-34|-98|65|-22|23|87|16|19|53|7|37|52",
        //         "sessionId": "445edbd2-2e17-40ff-ac13-4bc2a8216dcf"
        //     },
        //     "object": {},
        //     "rtnCode": 0
        // };
        if (data && data.bean && data.returnCode == 0) {
            const iWidth = 700; // 模态窗口宽度
            const iHeight = 480; // 模态窗口高度
            const iTop = (window.screen.height - iHeight - 100) / 2;
            const iLeft = (window.screen.width - iWidth) / 2;
            const winOption = 'height=' + iHeight + ',innerHeight=' + iHeight + ',width=' + iWidth + ',innerWidth=' + iWidth + ',top=' + iTop + ',left=' + iLeft + ',toolbar=no,menubar=no,scrollbars=no,resizeable=no,location=no,status=no';

            const obj: Record<string, any> = {};

            obj.formUrl = this.winURL; // 传递给页面form的action属性
            obj.operCode = data.bean.operCode; // 1-AIUAP-20048  操作编码加密
            obj.mainLoginName = ''; // lzq 8|15|-64|68|-18|-128|-24|90|-28   主帐号登录名加密  test
            obj.subLoginName = data.bean.subLoginName; // lizhengyang		// 从帐号名称 
            obj.appCode = appCode; // 应用编码 NGTM
            obj.operContent = operContent; // 操作内容 分中心服务大屏数据导
            obj.serverIp = ""; // 弹开金库页面前session验证的ip地址
            obj.serverPort = ""; // 弹开金库页面前session验证的ip地址对应的端口
            obj.sessionId = data.bean.sessionId; // 弹开金库页面前session验证对应的sessionid
            obj.checkSessionUrl = ""; // 弹开金库页面前session验证对应的servlet
            obj.isBasedOnLogin = "false"; // 是否是基于帐号登录  true 或者 空、false
            obj.busyType = "1"; // 基于帐号登录时的帐号类型 1：应用 2：主机 3:数据库
            // obj.systemId = "200002"; // 基于帐号登录时，帐号所在实体的id
            // obj.resAcctId = "2000000097"; // 基于帐号登录时，帐号id

            const a1 = navigator.userAgent;
            const yesIE = a1.search(/Trident/i);
            let returnValue: any;

            if (window.ActiveXObject || window.attachEvent || yesIE > 0) {
                // IE
                returnValue = window.showModalDialog("goldbank.html", obj, "dialogHeight:" + iHeight + "px; dialogWidth:" + iWidth + "px; toolbar:no; menubar:no;  titlebar:no; scrollbars:no; resizable:no; location:no; status:no;left:" + iLeft + "px;top:" + iTop + "px;");

                let isAccess = false; // 是否审批通过
                if (returnValue) {
                    const code = returnValue.split("#")[0];
                    const ls = ['-3', '-2', '1', '2', '5'];
                    if (code && ls.indexOf(code) > -1) {
                        isAccess = true;
                    }
                }
                this.cb && this.cb(isAccess);
                this.setTreasuryInfo({ isAccess: isAccess })
                return returnValue;
            } else {
                // 非IE
                this.showDiv();

                // post方式调用goldbankServlet.do
                this.openWindowWithPostRequest(iWidth, iHeight, iTop, iLeft, winOption, obj);

                // 为window注册message事件并绑定监听函数
                window.addEventListener('message', this.receiveMsg, false);
            }
        }
        // }).catch(() => {
        //     // 错误处理
        // });
    };

    /**
     * 获取本机IP地址
     */
    getIp = (): Promise<string> => {
        return new Promise((resolve) => {
            // 尝试通过 WebRTC 获取本机IP地址
            const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/;
            const candidates: string[] = [];

            // 创建 RTCPeerConnection 来获取候选地址
            const pc = new (window.RTCPeerConnection || (window as any).webkitRTCPeerConnection || (window as any).mozRTCPeerConnection)({
                iceServers: []
            });

            // 创建数据通道以触发ICE候选收集
            try {
                pc.createDataChannel("");
            } catch (e) {
                // 忽略错误
            }

            pc.onicecandidate = (evt: any) => {
                if (evt.candidate) {
                    const match = ipRegex.exec(evt.candidate.candidate);
                    if (match) {
                        const ip = match[1];
                        // 过滤掉内网地址和本地地址
                        if (!ip.startsWith("127.") &&
                            !ip.startsWith("192.168.") &&
                            !ip.startsWith("10.") &&
                            !ip.startsWith("172.16.") &&
                            !ip.startsWith("172.17.") &&
                            !ip.startsWith("172.18.") &&
                            !ip.startsWith("172.19.") &&
                            !ip.startsWith("172.2") &&
                            !ip.startsWith("172.30.") &&
                            !ip.startsWith("172.31.") &&
                            !ip.includes(":") && // 过滤IPv6
                            !candidates.includes(ip)) {
                            candidates.push(ip);
                        }
                    }
                }
            };

            pc.createOffer().then((offer: any) => pc.setLocalDescription(offer));

            // 等待一段时间后收集候选地址
            setTimeout(() => {
                pc.close();
                // 返回找到的第一个非内网IP，如果没有则返回空字符串
                if (candidates.length > 0) {
                    resolve(candidates[0]);
                } else {
                    // 备用方案：尝试通过 RTCPeerConnection 获取本地地址
                    this.getLocalIPByRTC().then(resolve).catch(() => resolve(""));
                }
            }, 1000);
        });
    };

    /**
     * 备用方法：通过RTCPeerConnection获取本地IP
     */
    getLocalIPByRTC = (): Promise<string> => {
        return new Promise((resolve, reject) => {
            const pc = new (window.RTCPeerConnection || (window as any).webkitRTCPeerConnection || (window as any).mozRTCPeerConnection)({
                iceServers: []
            });

            pc.createDataChannel("");

            pc.onicecandidate = (evt: any) => {
                if (evt.candidate) {
                    const ipMatch = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(evt.candidate.candidate);
                    if (ipMatch) {
                        pc.close();
                        resolve(ipMatch[1]);
                    }
                }
            };

            pc.createOffer().then((offer: any) => pc.setLocalDescription(offer));

            setTimeout(() => {
                pc.close();
                reject(new Error("无法获取本机IP"));
            }, 2000);
        });
    };

    receiveMsg = async (e: MessageEvent): Promise<void> => {
        const returnValue = e.data;
        let isAccess = false; // 是否审批通过
        if (returnValue) {
            const code = returnValue.split("#")[0];
            const ls = ['-2', '1', '2', '5'];
            if (code && ls.indexOf(code) > -1) {
                isAccess = true;
                try {
                    this.save4Alog(code)
                } catch (error) {
                    // 错误处理
                }
            } else if (code == '-3') {
                isAccess = true;
                try {
                    this.save4Alog(code)
                } catch (error) {
                    // 错误处理
                }
            }
            this.targetWin && this.targetWin.close();
            // 缓存金库校验结果
            this.setTreasuryInfo({ isAccess: isAccess })
            this.closeDiv(); // 关闭遮罩层
            this.cb && this.cb(isAccess);
            // 移除监听，避免重复监听
            window.removeEventListener('message', this.receiveMsg, false);
        }
    };

    openWindowWithPostRequest = (iWidth: number, iHeight: number, iTop: number, iLeft: number, winOption: string, obj: Record<string, any>): void => {
        const winName = 'bWindow';
        const winURL = this.winURL; // 应用侧对应后台服务action
        const windowoption = 'resizable=yes,height=600,width=800,location=0,menubar=0,scrollbars=1';

        const form = document.createElement("form");
        form.setAttribute("method", "post");
        form.setAttribute("action", winURL);
        form.setAttribute("target", winName);
        for (const i in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, i)) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = i;
                if (i == 'operContent') {
                    input.value = encodeURI(obj[i]);
                } else {
                    input.value = obj[i];
                }
                form.appendChild(input);
            }
        }
        document.body.appendChild(form);
        // 打开地址，刚开始时，打开一个不存在的地址，这样才有返回值                 
        this.targetWin = window.open("", winName, windowoption);
        form.target = winName;
        form.submit();
        document.body.removeChild(form);
        this.targetWin && this.targetWin.focus();
    };

    showDiv = (): void => {
        const bg = document.getElementById('glod-bg');
        bg && (bg.style.display = 'block');
    };

    closeDiv = (): void => {
        const bg = document.getElementById('glod-bg');
        bg && (bg.style.display = 'none');
    };
    // 保存金库授权结果
    setTreasuryInfo = (data: any): void => {
        const { operCode, userInfo } = this.options;
        const paramJson = {
            "staffIdCode": operCode + "_" + this.prsnMainAcct.toUpperCase(),
            "staffId": userInfo.staffId,
            "securityResult": data.isAccess ? '0' : '1',
            "securityTypeCode": operCode
        };
        request.post('/goldDatabase/setTreasuryVerificationForOther', paramJson);

    }

    // 保存4A日志
    save4Alog = async (code: any): Promise<void> => {
        const logRecordObj = {
            resourceCode: "RHKF",
            persionName: this.options.userInfo ? this.options.userInfo.staffName : "", // 操作人姓名
            serviceTypeId: this.options.userInfo ? this.options.userInfo.serviceTypeId : '', // 业务系统编码
            provinceId: this.options.userInfo ? this.options.userInfo.provinceId : '', //  省份编码(示例 本部:ZB,北京:BJ)
            mainAcctName: this.mainAcctName, //操作人4A账号
            subAcctName: this.prsnMainAcct || '', // 系统应用账号
            operateId: this.options.operCode,
            operateName: this.options.operContent,
            operateTypeCode: this.options.operateTypeCode,  // 4A操作日志类型编码,1增加,2删除,3修改,4查询,5导入(含上传),6导出(含下载),7登录,8登出,99其他
            operateContent: this.options.operContent,
            operateResult: code,
            clientAddress: "", // 客户端IP地址 //getIp获取
            serverAddress: "", // 服务端IP地址
            appLoginUrl: 'https://nguc.cs.cmos/nguc/ngucportal/check4AEvidence.html',
            menuName: this.options.menuName,
            menuPath: this.options.menuPath
        };
        const ip = await this.getIp();
        if (ip) {
            logRecordObj.clientAddress = ip;
        }
        try {
            request.post('/goldDatabase/insertOperationLogback', { params: logRecordObj });
        } catch (error) {
            console.log('金库校验保存4A日志失败:', error);
        }
    }

}

export default GoldBank;
