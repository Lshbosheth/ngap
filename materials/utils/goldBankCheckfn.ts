import { GoldBankCheckFnAction } from '../types';
import { baseApiConvert } from './util';
import { message } from './AntdGlobal';
import GoldBank from './goldbank';

// 框架方法执行
export const GoldBankCheckAction = async (action: GoldBankCheckFnAction, callBack?: any) => {

    const indexInfo: any = await new Promise((resolve) => {
        window?.crossAPI?.getIndexInfo(resolve);
    });
    const userInfo = indexInfo.userInfo;

    const windowUrl = window?.location?.href;
    const goldBank: any = {};
    //触发4A金库审批流程
    if (goldBank && goldBank.current) {
        goldBank.current.open();
    } else {
        let url = 'https://zx4a.cs.cmos/goldbank/goldbank3!goldBankIframeAction.action'; //应用侧对应后台服务action
        let iframeUrl = 'http://ngap.cs.cmos/ngap/page/index.html'
        if (windowUrl.indexOf('cs.cmos:8080') > -1) {
            // 测试环境
            url = 'http://yy4a.test.cmos:8080/goldbank/goldbank3!goldBankIframeAction.action';
            iframeUrl = 'http://ngap.cs.cmos:8080/ngap/page/index.html'
        }

        const options = {
            appCode: 'RHKF',
            operContent: action.operContent || '',
            operCode: action.operCode || '',
            subLoginName: userInfo.staffId,
            userInfo: userInfo,
            menuName: userInfo.iframeName || '应用集成平台运行页面',
            menuPath: baseApiConvert(iframeUrl),
            operateTypeName: action.operCode || '',
            operateContent: action.operContent || '',
            operateTypeCode: action.operateTypeCode || '99',
        }
        goldBank.current = new GoldBank(baseApiConvert(url), options, (data: any) => {
            if (data) {
                callBack(data);
            } else {
                message.error('审批未通过，不允许业务继续访问');
                callBack(data);
            }
        })
        goldBank.current.open();
    }
}
