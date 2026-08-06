import { useEffect, useCallback } from 'react';

// 定义消息事件处理器类型
type MessageEventHandler = (event: MessageEvent) => void;

// 定义依赖项数组类型
type DependencyList = ReadonlyArray<any>;

// 定义来源限制类型
type OriginType = string | string[];

/**
 * 自定义Hook：监听window.postMessage消息
 * @param callback 接收到消息后的回调函数
 * @param deps 依赖数组，控制effect重新执行时机
 * @param allowedOrigins 来源限制，用于安全验证，可以是字符串或字符串数组，'*'表示允许所有来源
 */
function useMessageListener(callback: MessageEventHandler, deps: DependencyList = [], allowedOrigins: OriginType = '*'): void {
    useEffect(() => {
        // 定义消息处理函数
        const handleMessage = (event: MessageEvent) => {
            // 来源验证：支持字符串或字符串数组的来源限制
            const isOriginAllowed = (origin: OriginType): boolean => {
                if (origin === '*') return true;
                if (typeof origin === 'string') {
                    return event.origin === origin;
                }
                if (Array.isArray(origin)) {
                    return origin.includes(event.origin);
                }
                return false;
            };

            if (!isOriginAllowed(allowedOrigins)) {
                console.warn(`useMessageListener: 收到来自不被信任的来源的消息: ${event.origin}, 允许的来源: ${allowedOrigins}`);
                return;
            }

            try {
                // 调用传入的回调函数处理接收到的消息
                callback(event);
            } catch (error) {
                console.log('useMessageListener: 处理消息时发生错误:', JSON.stringify(error));
            }
        };

        // 添加message事件监听器，第三个参数确保正确捕获事件
        window.addEventListener('message', handleMessage, false);

        // 清理函数：组件卸载时移除监听器
        return () => {
            window.removeEventListener('message', handleMessage, false);
        };
    }, deps); // 依赖数组可控制effect重新执行时机
}

/**
 * 发送消息到父窗口的辅助函数
 * @param data 要发送的数据
 * @param targetOrigin 目标窗口的origin，'*'表示任何窗口都可以接收
 */
export const postMessageToParent = (data: any, targetOrigin: string = '*') => {
    try {
        if (window.parent !== window) {
            window.parent.postMessage(data, targetOrigin);
            console.log('postMessageToParent: 消息已发送到父窗口', data);
        } else {
            console.warn('postMessageToParent: 当前没有父窗口');
        }
    } catch (error) {
        console.error('postMessageToParent: 发送消息失败:', error);
    }
};

export default useMessageListener;
