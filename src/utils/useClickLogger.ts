// 拦截所有click事件，记录日志
import { useEffect } from 'react';
import { trackClk } from '@/utils/commonGdp';

// 定义点击日志数据结构
interface ClickLog {
    WT_event: string;
    WT_envName: string;
}

// 点击日志Hook
const useClickLogger = () => {
    // 发送日志到服务器
    const sendLogToServer = (log: ClickLog) => {
        // 这里可以替换为实际的API调用
        console.log('点击日志:', log);
        // 记录插码日志
        trackClk(log.WT_event, log.WT_envName);
    };

    // 判断元素是否有绑定点击事件
    const hasClickHandler = (element: HTMLElement): boolean => {
        // 检查元素本身是否有onClick属性
        if ((element as any).onclick) {
            return true;
        }

        // 检查是否有addEventListener添加的click事件
        const listeners = (element as any)._reactInternalInstance?.stateNode;
        if (listeners) {
            return true;
        }

        // 检查data-onclick属性或其他标记
        if (element.hasAttribute('data-has-click-handler')) {
            return true;
        }

        return false;
    };

    // 处理点击事件
    const handleClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement;

        // 只记录有绑定点击事件的元素
        if (hasClickHandler(target)) {
            const log: ClickLog = {
                WT_event: target.textContent || target.innerText || '',
                WT_envName: target.className,
            };

            sendLogToServer(log);
        }
    };

    // 添加全局点击事件监听器
    useEffect(() => {
        document.addEventListener('click', handleClick, true);

        // 清理事件监听器
        return () => {
            document.removeEventListener('click', handleClick, true);
        };
    }, []);
};

export default useClickLogger;
