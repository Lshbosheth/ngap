// 插码工具
import crossAPI from '@/utils/crossAPI';
import './cmos-full-es5-H5-5.1.0';

// 插码初始化事件
export async function initChama() {
    const isHttps = 'https:' == document.location.protocol ? true : false;
    let host = 'cmxt.cs.cmos:8081';
    let scheme = 'https';
    const isPro = true;
    if (isHttps) {
        host = 'cmxt.cs.cmos:8081';
        scheme = 'https';
    } else {
        host = '172.19.46.88:8081';
        scheme = 'http';
    }

    const dataSourceId = isPro ? 'bci65h8yufjolt0e' : 'x9nzkqwdpm680ta3';
    window.gdp('init', '9e4e5fa7244c6b6e', dataSourceId, {
        // dataSourceId获取请走线上需求流程。如在测试环境使用，请使用测试环境dataSourceid  'x9nzkqwdpm680ta3''
        host: host, // 数据发送地址。
        autotrack: !isPro, // 关闭无埋点事件发送，生产环境设置为关闭。
        compress: isPro, // 开启数据压缩模式，整体报文加密，生产环境设置为开启。
        dataCollect: true,
        debug: !isPro,
        hashtag: isPro, // 开启页面URL混淆采集，生产环境设置为开启。
        scheme: scheme, // 指定请求协议，生产环境填https
    });

    try {
        const data: any = await new Promise((resolve) => {
            crossAPI.getIndexInfo(resolve);
        });
        const userInfo = data.userInfo;
        const iframeInfo: { title: string; url: string } = data.iframe;
        window.gdp('track', 'pageview', {
            WT_et: 'pageview',
            WT_ti: iframeInfo.title || '',
            WT_es: location.href,
            WT_systemCode: 'ngap',
        });
    } catch (error) {
        console.log(error);
    }
}

// 插码点击事件
export async function trackClk(wtEvent: any, wtEnvName: any) {
    try {
        const data: any = await new Promise((resolve) => {
            crossAPI.getIndexInfo(resolve);
        });
        const userInfo = data.userInfo;
        const iframeInfo = data.iframe;
        const staffId = data && userInfo && userInfo.staffId;
        window.gdp('track', 'clk', {
            WT_et: 'clk',
            WT_event: wtEvent || '',
            WT_envName: wtEnvName || '',
            WT_staffId: staffId || '',
            WT_callId: '',
            WT_ti: iframeInfo.title || '',
            WT_es: location.href,
            WT_systemCode: 'ngap',
        });
    } catch (error) {
        console.log(error);
    }
}
