// 分发CrossAPI消息
import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { crossApiUserInfo, CrossApiUserInfoState } from '../stores/crossapiStore';
import { CrossAPIStaticData } from '../stores/crossAPIStaticDataStore';

import { menu } from '../stores/menuStore';
import { Modal } from 'antd';
import React from 'react';
// import ReactDOM from 'react-dom'; // 移除旧的导入

// 业务参数
let businessOptions = {};

// 分发userinfo数据
const sendUserInfoEvent = (dataJson: any) => {
    // 从store中获取用户信息
    const userInfoData = crossApiUserInfo.getState().userInfo;
    const callingInfo = CrossAPIStaticData.getState().callingInfo;
    const clientBusiInfo = CrossAPIStaticData.getState().clientBusiInfo;
    const serialNo = CrossAPIStaticData.getState().serialNo;
    const getAgentState = CrossAPIStaticData.getState().getAgentState;
    let setParam;
    if (dataJson.name === 'cross_data') {
        const userData = JSON.parse(JSON.stringify(userInfoData));
        // 独立入口总部省份编码转换
        if (userData.proviceId == '0000') {
            userData.provinceId = '00030089';
            userData.proviceId = '00030089';
        }
        setParam = {
            userInfo: userData,
            iframe: {
                businessOptions: businessOptions,
            }
        }
    } else if (dataJson.name === 'getCallingInfo') {
        setParam = callingInfo
    } else if (dataJson.name === 'getClientBusiInfo') {
        setParam = clientBusiInfo
    } else if (dataJson.name === 'getAgentState') {
        setParam = getAgentState
    } else if (dataJson.name === 'getSerialNo') {
        setParam = serialNo
    } else {
        setParam = { text: '暂无数据' }
    }

    // 构建要发送的响应数据
    const responseData = {
        type: "setData",
        name: dataJson.name,
        param: setParam,
        __cross__: "true"
    };

    return responseData;

}

// 存储所有活动的弹窗根节点
const activeDialogRoots = new Map<string, ReturnType<typeof createRoot>>();

// 消息队列系统，确保连续消息按顺序处理
const messageQueue: any[] = [];
let isProcessingMessage = false;

/**
 * 处理消息队列中的下一条消息
 */
const processNextMessage = () => {
    if (isProcessingMessage || messageQueue.length === 0) {
        return;
    }

    isProcessingMessage = true;
    const nextMessage = messageQueue.shift();

    try {
        processSingleMessage(nextMessage);
    } catch (error) {
        console.error('处理消息队列中的消息时发生错误:', error);
    } finally {
        // 使用 setTimeout 确保下一个消息在下一个事件循环中处理
        setTimeout(() => {
            isProcessingMessage = false;
            processNextMessage();
        }, 10);
    }
};

/**
 * 处理iframeDialog弹窗功能
 * @param dialogConfig 弹窗配置参数
 */
const handleIframeDialog = (dialogConfig: {
    id: string;
    title: string;
    url: string;
    param?: { [key: string]: any };
    modal: boolean;
    width: string;
    height: string;
}) => {
    try {
        const { id, title, url, param, modal, width, height } = dialogConfig;

        // 检查是否已存在相同ID的弹窗
        const existingContainer = document.getElementById(`iframe-dialog-container-${id}`);
        if (existingContainer) {
            console.warn(`ID为${id}的iframeDialog已存在，将先关闭旧弹窗`);
            handleCloseDialog([id]);
        }


        // 构建iframe URL，如果有参数则拼接
        let iframeUrl = url;
        if (param && Object.keys(param).length > 0) {
            // 额外参数赋值
            businessOptions = param;
            const queryParams = new URLSearchParams();
            Object.entries(param).forEach(([key, value]) => {
                queryParams.append(key, String(value));
            });
            const separator = url.includes('?') ? '&' : '?';
            iframeUrl = `${url}${separator}${queryParams.toString()}`;
        }

        // 创建容器元素
        const container = document.createElement('div');
        container.id = `iframe-dialog-container-${id}`;
        document.body.appendChild(container);

        // 创建React 18的根节点
        const root = createRoot(container);
        activeDialogRoots.set(id, root);

        // 定义IFrameDialogContent组件
        const IFrameDialogContent: React.FC = () => {
            return React.createElement('iframe', {
                src: iframeUrl,
                style: {
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: '8px'
                },
                title: title,
                allowFullScreen: true
            });
        };

        // 配置Modal参数
        const modalConfig = {
            title: title,
            open: true,
            mask: modal !== false, // 默认显示遮罩层
            maskClosable: modal !== false, // 默认允许点击遮罩关闭
            keyboard: modal !== false, // 默认允许按ESC关闭
            width: parseInt(width) || 860,
            height: parseInt(height) || 590,
            style: { top: '50px' },
            rootClassName: 'iframe-dialog-modal', // 添加自定义类名
            styles: {
                content: { padding: '0' }, // 设置ant-modal-content内边距为0
                header: { padding: '8px' }, // 为header区域添加8像素内边距
                body: {
                    height: parseInt(height) || 590, // 减去头部高度
                    padding: '0px'
                }
            },
            onCancel: () => {
                // 关闭Modal时清理DOM
                root.unmount(); // 使用新的unmount方法
                activeDialogRoots.delete(id);
                if (container.parentNode) {
                    container.parentNode.removeChild(container);
                }
            },
            footer: null, // 不显示底部按钮
            destroyOnClose: true // 关闭时销毁内容
        };

        // 渲染Modal
        const modalElement = React.createElement(
            Modal,
            modalConfig,
            React.createElement(IFrameDialogContent)
        );

        // 使用新的render方法
        root.render(modalElement);

        console.log('iframeDialog弹窗已打开:', { id, title, url, modal, width, height });
    } catch (error) {
        console.error('处理iframeDialog失败:', error);
    }
};

/**
 * 处理createTab功能，在标签页中打开外部URL页面
 * @param param 参数数组：[标题, URL, 参数对象]
 */
const handleCreateTab = (param: any[]) => {
    try {
        const title = param[0]; // 页面名称
        const url = param[1];   // 页面地址
        const params = param[2]; // 携带的参数

        // 调用menuStore中的openExternalUrl方法
        const openExternalUrl = menu.getState().openExternalUrl;
        // 额外参数赋值
        businessOptions = params;
        if (typeof openExternalUrl === 'function') {
            openExternalUrl({
                title: title,
                url: url,
                params: params
            });
            console.log('createTab已执行:', { title, url, params });
        } else {
            console.error('openExternalUrl方法未在menuStore中正确注册');
        }
    } catch (error) {
        console.error('处理createTab失败:', error);
    }
};

/**
 * 处理destroyTab功能，关闭指定名称的标签页
 * @param param 参数数组：[标签页名称]
 */
const handleDestroyTab = (param: any[]) => {
    try {
        const tabName = param[0]; // 标签页名称

        // 调用menuStore中的closeTab方法
        const closeTab = menu.getState().closeTab;

        if (typeof closeTab === 'function') {
            closeTab(tabName);
            console.log('destroyTab已执行:', { tabName });
        } else {
            console.error('closeTab方法未在menuStore中正确注册');
        }
    } catch (error) {
        console.error('处理destroyTab失败:', error);
    }
};

/**
 * 处理closeDialog功能，根据id关闭特定的iframeDialog，如果没有提供id则关闭所有iframeDialog
 * @param param 参数数组：[弹窗ID(可选)]
 */
const handleCloseDialog = (param: any[]) => {
    try {
        const dialogId = param[0]; // 弹窗ID(可选)

        // 如果没有提供dialogId，则关闭所有iframeDialog
        if (!dialogId) {
            const allContainers = document.querySelectorAll('[id^="iframe-dialog-container-"]');
            let closedCount = 0;

            allContainers.forEach((container) => {
                try {
                    const containerElement = container as HTMLElement;
                    // 从容器ID中提取弹窗ID
                    const idMatch = containerElement.id.match(/iframe-dialog-container-(.+)/);
                    const id = idMatch ? idMatch[1] : '';

                    // 从Map中获取对应的root并卸载
                    const root = activeDialogRoots.get(id);
                    if (root) {
                        root.unmount();
                        activeDialogRoots.delete(id);
                    }

                    if (container.parentNode) {
                        container.parentNode.removeChild(container);
                    }
                    closedCount++;
                } catch (error) {
                    console.error('关闭弹窗容器失败:', error);
                }
            });

            console.log(`closeDialog已执行，关闭了${closedCount}个iframeDialog弹窗`);
            return;
        }

        // 如果提供了dialogId，则关闭特定的弹窗
        const containerId = `iframe-dialog-container-${dialogId}`;
        const container = document.getElementById(containerId);

        if (container) {
            // 从Map中获取对应的root并卸载
            const root = activeDialogRoots.get(dialogId);
            if (root) {
                root.unmount();
                activeDialogRoots.delete(dialogId);
            } else {
                // 兼容处理：如果Map中没有，尝试直接卸载
                try {
                    // 对于旧版本的兼容，这里不做操作，因为unmountComponentAtNode已被弃用
                    console.warn(`未找到ID为${dialogId}的弹窗root实例`);
                } catch (err) {
                    // 忽略错误
                }
            }

            if (container.parentNode) {
                container.parentNode.removeChild(container);
            }
            console.log(`closeDialog已执行，关闭ID为${dialogId}的弹窗`);
        } else {
            console.warn(`未找到ID为${dialogId}的iframeDialog容器`);
        }
    } catch (error) {
        console.error('处理closeDialog失败:', error);
    }
};

/**
 * 处理单个消息的核心逻辑
 */
const processSingleMessage = (dataJson: any) => {
    try {
        let responseData = {}; // 响应数据
        switch (dataJson.type) {
            case 'getData':     // 如果type类型为getData，则向对应origin字段的iframe页面发送useInfo数据
                switch (dataJson.name) {
                    case 'cross_data':
                        responseData = sendUserInfoEvent(dataJson);
                        break;
                    case 'getCallingInfo':
                        responseData = sendUserInfoEvent(dataJson);
                        break;
                    case 'getClientBusiInfo':
                        responseData = sendUserInfoEvent(dataJson);
                        break;
                    case 'getAgentState':
                        responseData = sendUserInfoEvent(dataJson);
                        break;
                    case 'getSerialNo':
                        responseData = sendUserInfoEvent(dataJson);
                        break;
                    default:
                        return {
                            type: "setData",
                            name: dataJson.name,
                            param: {},
                            __cross__: "true"
                        }; // 默认返回值
                }
                // 向指定的origin发送响应数据
                if (dataJson.origin) {

                    // 给自己也发一份
                    if (dataJson.origin.indexOf('ngap') > -1) {
                        window.postMessage(JSON.stringify(responseData), dataJson.origin)
                    }

                    // 查找所有 iframe 元素
                    const iframes = document.querySelectorAll('iframe');

                    // 遍历查找匹配 origin 的 iframe
                    for (const iframe of iframes) {
                        const iframeSrc = iframe.src;
                        // 检查 iframe 的 src 是否包含或匹配 dataJson.origin
                        if (iframeSrc && (iframeSrc.includes(dataJson.origin) || dataJson.origin.includes(iframeSrc))) {
                            // 使用 iframe.contentWindow.postMessage 方法发送数据
                            iframe.contentWindow?.postMessage(JSON.stringify(responseData), dataJson.origin);
                            console.log('已向iframe发送用户信息:', iframeSrc, dataJson.origin, responseData);
                            break; // 找到匹配的 iframe 后退出循环
                        }
                    }
                }
                break;
            case 'function':
                try {
                    console.log('处理function类型消息:', dataJson.name, dataJson.param);

                    if (dataJson.name == 'iframeDialog') { // 用于弹出弹框
                        handleIframeDialog(dataJson.param[0]);
                    } else if (dataJson.name == 'createTab') {
                        handleCreateTab(dataJson.param);
                    } else if (dataJson.name == 'destroyTab') {
                        handleDestroyTab(dataJson.param);
                    } else if (dataJson.name == 'closeDialog') {
                        handleCloseDialog(dataJson.param);
                    }

                    console.log('function类型消息处理完成:', dataJson.name);
                } catch (functionError) {
                    console.error(`处理${dataJson.name}函数时发生错误:`, functionError);
                }
                break;
            case 'event': // 处理trigger事件
                break;
        }
    } catch (error) {
        console.error('处理crossAPI消息时发生错误:', error);
    }
};

// 分发CrossAPI消息（对外接口）
const crossAPIDistributeMessages = (dataJson: any) => {
    try {
        console.log('收到新消息，加入队列:', dataJson.name);
        messageQueue.push(dataJson);
        processNextMessage();
    } catch (error) {
        console.error('将消息加入队列时发生错误:', error);
    }
};

export default crossAPIDistributeMessages;
