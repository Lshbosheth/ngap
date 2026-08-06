import { useState } from "react";
import { CloseOutlined } from '@ant-design/icons';
import { getChromeVersion } from "./util";
const ChromeVersionLow = () => {
    let version = getChromeVersion();
    const [ChromeVersionLowShow, setChromeVersionLowShow] = useState(true)
    return version?.split?.(".")?.[0] > 80 ? <></> : <>
        {ChromeVersionLowShow && <div className="chromeVersionLow">
            <CloseOutlined className="closeChromeVersionLow" onClick={() => setChromeVersionLowShow(false)} />
            <div className="CVLContent">
                <div>系统检测到您使用的浏览器版本过低，建议您下载最新版浏览器体验！</div>
                <div>当前浏览器版本：（{version}）</div>
                <div>建议浏览器版本：Chrome80以上</div>
            </div>
        </div>}
    </>
}
export default ChromeVersionLow
