import { crossApiUserInfo } from '../stores/crossapiStore';
 // 这里是退出登录

export const LogoutFun = (options?: {
    logoutType?: number;
}) => {
     const userInfo = crossApiUserInfo.getState().userInfo;
   const finalOptions = {
        logoutType: options?.logoutType || '0'
    };
    const HTMLhref = window.location.host;
    const baseUrl = window.location.origin;
    let urlngmtt = 'ngmtt.cs.cmos';
    if(userInfo.addressFlag == 'test'){
        urlngmtt = 'ngmtt.cs.cmos:8080';
    }
    // 定义全局回调（和你原 window.jsonCallback 一致）
    window.jsonCallback = (data:any) => {
        if (data?.returnCode === '0') {
            console.log(script.src)
            window.close();
        }
        // 用完清理全局函数
        delete window.jsonCallback;
    };

    // 创建 script 标签发起 JSONP
    const script = document.createElement('script');
    script.src = 'http://'+urlngmtt+'/ngmtt/front/sh/logout!index?uid=l0001&sysId=ngap&logoutType='+finalOptions.logoutType+'&logoutChnl='+encodeURIComponent(baseUrl)+'&callback=jsonCallback';
    script.onerror = (e) => console.error('登出失败', e);
    document.body.appendChild(script);
    document.body.removeChild(script);
}
