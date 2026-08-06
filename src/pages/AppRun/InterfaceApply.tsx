import React, { useEffect, useRef, useState } from 'react';
import { crossApiUserInfo } from '@/stores/crossapiStore';
import styles from './index.module.less';
const InterfaceApply: React.FC = () => {
    // 获取用户信息
    const userInfo = crossApiUserInfo((state) => state.userInfo);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const frameBorder = '0';
    let dataSoureUrl = '';
    // http://ngap.cs.cmos:8080/ngapfw/interfaceManagement.html
    // 带端口的是测试环境， 去了端口是生产环境
    // 区分测试和生产
    if (userInfo.addressFlag === 'test') {
        dataSoureUrl = 'http://ngap.cs.cmos:8080/ngapfw/interfaceApply.html';
    } else {
        dataSoureUrl = 'http://ngap.cs.cmos/ngapfw/interfaceApply.html';
    }

    const transform = (url: string) => {
        //先判断协议
        const ishttps = 'https:' == document.location.protocol ? true : false;
        let returnUrl = url;
        if (url) {
            const dataDictUrlSubstrSix = returnUrl.substring(0, 6).toUpperCase();
            //再判断环境
            if (userInfo.addressFlag == 'test') {
                if (ishttps && dataDictUrlSubstrSix != 'HTTPS:') {
                    //https 协议下，需要替换http，再替换8080
                    returnUrl = url.replace('http:', 'https:').replace(':8080', '');
                    const Url = new URL(returnUrl);
                    if (Url.port != '') {
                        returnUrl = Url.href.replace(':' + Url.port, '');
                    }
                }
            } else {
                if (ishttps && dataDictUrlSubstrSix != 'HTTPS:') {
                    //生产环境下，直接替换http
                    returnUrl = url.replace('http:', 'https:');
                    const Url = new URL(returnUrl);
                    if (Url.port != '') {
                        returnUrl = Url.href.replace(':' + Url.port, '');
                    }
                }
            }
        }
        return returnUrl;
    };
    return (
        <div className={styles.serviceOrchestrationPage}>
            <div className={styles.dataSourceManage}>
                <iframe ref={iframeRef} className={styles.dataSourcePage} src={transform(dataSoureUrl)} frameBorder={frameBorder}></iframe>
            </div>
        </div>
    );
};
export default InterfaceApply;
