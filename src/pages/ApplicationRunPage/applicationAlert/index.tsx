// 应用告警
import React, { useEffect, useRef, useState } from 'react';
import { crossApiUserInfo } from '@/stores/crossapiStore';
import { baseApiConvert } from '../../../utils/util';

import styles from './index.module.less';
const Page: React.FC = () => {
    // 获取用户信息
    const userInfo = crossApiUserInfo((state) => state.userInfo);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const frameBorder = '0';
    let dataSoureUrl = '';
    // 带端口的是测试环境， 去了端口是生产环境
    // 区分测试和生产
    if (userInfo.addressFlag === 'test') {
        dataSoureUrl = 'http://ngap.cs.cmos:8080/ngaplog/warnRule.html';
    } else {
        dataSoureUrl = 'http://ngap.cs.cmos/ngaplog/warnRule.html';
    }

    return (
        <div className={styles.applicationAlertPage}>
            <div className={styles.dataSourceManage}>
                <iframe ref={iframeRef} className={styles.dataSourcePage} src={baseApiConvert(dataSoureUrl)} frameBorder={frameBorder}></iframe>
            </div>
        </div>
    );
};
export default Page;
