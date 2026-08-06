import {
    ActionNode,
    ApiConfig,
    ConfirmAction,
    CopyAction,
    JumpLinkAction,
    MessageAction,
    MethodsAction,
    NotificationAction,
    VariableAction,
    CrossAPIFnAction,
    GoldBankCheckFnAction,
    DestroyPageAction,
} from '@materials/types';
import CrossAPI from '../utils/crossAPI';
import { getComponentRef } from './useComponentRefs';
import { handleApi } from './handleApi';
import { useShallow } from 'zustand/react/shallow';
import { usePageStore } from '@materials/stores/pageStore';
import { copyText, handleArrayVariable, handleParamVariable, isNotEmpty, renderFormula, renderTemplate } from './util';
import { Modal, message, notification } from '@materials/utils/AntdGlobal';
import { baseApiConvert } from './util';
import { crossAPIAction } from './crossAPIAction';
import { GoldBankCheckAction } from './goldBankCheckfn'; // 金库校验

const timerList: (ReturnType<typeof setInterval> | ReturnType<typeof setTimeout> | null)[] = [];
// 在文件顶部添加全局去重 Set
const processedMessageIds = new Set<string>();

// 导出清理函数供外部调用
export const clearTimerList = () => {
    timerList.forEach((timer) => {
        if (timer) {
            clearTimeout(timer as ReturnType<typeof setTimeout>);
            clearInterval(timer as ReturnType<typeof setInterval>);
        }
    });
    timerList.length = 0;
};

export const clearProcessedMessageIds = () => {
    processedMessageIds.clear();
};
// import router from '../../admin/src/router/index';

// 把工作流转换为链表结构。
function convertArrayToLinkedList(nodes: any, _behindList?: any) {
    let linkedList = null;
    let currentNode: any = null;
    // 空数组存在两种情况，1、没有事件流；2、所在分支节点没有事件处理
    // 上述两种情况都返回_behindList，将后续节点放到分支节点后面
    if (!nodes || nodes.length == 0) {
        return _behindList || null;
    }
    for (let i = 0; i < nodes.length; i++) {
        const node: any = nodes[i];
        if (node.type === 'start' || node.type === 'end') {
            continue;
        }
        let newNode: any = { action: { ...node.config } };
        if (node.type === 'condition') {
            // 获取到当前分支节点之后的所有节点，拼接到分支节点所有末尾结点之后的next中
            const behindList = convertArrayToLinkedList(nodes.slice(i + 1), _behindList || null);
            // 获取到分支节点的两个分支节点，需要将分支节点之后的节点放单分支节点末尾节点之后
            const successBranch = convertArrayToLinkedList(
                node.children.find((child: any) => child.title === '成功')?.children || [],
                behindList || _behindList || null,
            );
            const failBranch = convertArrayToLinkedList(
                node.children.find((child: any) => child.title === '失败')?.children || [],
                behindList || _behindList || null,
            );
            newNode = {
                success: successBranch,
                fail: failBranch,
            };
            currentNode.next = newNode;
            currentNode = currentNode.next;
        } else {
            // 非分支类节点直接向next指针放数据并将指针指向下一个节点
            if (!currentNode) {
                linkedList = currentNode = newNode;
            } else {
                currentNode.next = newNode;
                // 赋值后将指针指向下一个节点
                currentNode = currentNode.next;
            }
            if (i == nodes.length - 1) {
                currentNode.next = _behindList || null;
            }
        }
    }
    return linkedList;
}
/**
 * 事件行为是数组结构，为了保证串联执行，需要转换成链表结构
 * 必须保证第一个行为执行完以后，再执行第二个行为
 * @param params 事件触发时，组件传递的参数
 */
export function handleActionFlow(actions: any[] = [], params: any) {
    /**
     * 行为数组转换成链表结构
     */
    const nodes = convertArrayToLinkedList(actions);
    if (nodes?.action) {
        execAction(nodes, params);
    }
}

/**
 * 递归执行事件行为
 * params是按钮触发是，组件传递的参数
 * action中的data为行为配置中手工配置的参数
 */
const execAction = (node: any, params: any = {}) => {
    if (!node || !node?.action) return;
    try {
        sessionStorage.setItem('Ngap-event-flow-wait', String(0));
        const data = mergeParams(node.action.data, params);
        delete node.action.data;
        node.action = handleParamVariable(node.action, params);
        if (node.action.actionType === 'methods') {
            // 执行组件方法时，增加延时，解决set方法异步导致表格组件每次取选中值拿到的上次选中项等问题
            setTimeout(function () {
                handleMethods(node, data);
            }, 200);
        } else if (node.action.actionType === 'showConfirm') {
            handleShowConfirm(node, data);
        } else if (node.action.actionType === 'message') {
            handleMessage(node, data);
        } else if (node.action.actionType === 'notification') {
            handleNotification(node, data);
        } else if (node.action.actionType === 'request' || node.action.actionType === 'download') {
            handleRequest(node, data);
        } else if (node.action.actionType === 'formReset') {
            node.action.method = 'reset';
            handleMethods(node, data);
        } else if (node.action.actionType === 'formSubmit') {
            node.action.method = 'submit';
            handleMethods(node, data);
        } else if (node.action.actionType === 'formValidate') {
            node.action.method = 'validate';
            handleMethods(node, data);
        } else if (node.action.actionType === 'formAssignment') {
            node.action.method = 'init';
            handleMethods(node, data);
        } else if (node.action.actionType === 'formGetValue') {
            node.action.method = 'getFormData';
            handleMethods(node, data);
        } else if (['openModal', 'openDrawer'].includes(node.action.actionType)) {
            handleOpenModal(node, data, 'open');
        } else if (['closeModal', 'closeDrawer'].includes(node.action.actionType)) {
            handleOpenModal(node, data, 'close');
        } else if (node.action.actionType === 'jumpLink') {
            handleJumpLink(node, data);
        } else if (node.action.actionType === 'destroyPage') {
            handleDestroyPage(node, data);
        } else if (node.action.actionType === 'reloadPage') {
            window?.location?.reload();
        } else if (node.action.actionType === 'variable') {
            handleVariable(node, data);
        } else if (node.action.actionType === 'copy') {
            handleCopy(node, data);
        } else if (node.action.actionType === 'setTimeout') {
            handleSetTimeout(node, data);
        } else if (node.action.actionType === 'visible') {
            handleVisible(node, data);
        } else if (node.action.actionType === 'disable') {
            handleDisable(node, data);
        } else if (node.action.actionType === 'script') {
            handleRunScripts(node, data);
        } else if (node.action.actionType === 'crossAPIfn') {
            handleCrossAPIfn(node, data);
        } else if (node.action.actionType === 'goldBankCheck') {
            handleGoldBankCheckfn(node, data);
        } else if (node.action.actionType === 'style') {
            handleStyle(node, data);
        } else if (node.action.actionType === 'messAge') {
            messAgeParams(node, data);
        } else if (node.action.actionType === 'openPopover') {
            handleOpenPopover(node, data);
        } else if (node.action.actionType === 'closePopover') {
            handleClosePopover(node, data);
        }
    } catch (error) {
        console.error(`事件流[${node.actionType}执行异常]`, error);
        throw {
            message: `事件流[${node.actionType}执行异常]`,
            error: error,
        };
    }
};
//触发联动 shijain
const messAgeParams = ({ action, next }: ActionNode<ConfirmAction>, eventParams: any = {}) => {
    // 获取行为中配置的静态参数
    //CrossAPI.trigger(['slf测试接收事件流'],'submit_ngap',{ dataId:eventParams?.action?.commenId });
    const params = {
        sendEventName: 'ngap_commonMsgSendEvent',
        sendEventType: '1', //1页签 2,ngfv，3小球
        sendEventParams: {
            sendType: 'ngapComponentlinkage',
            dataId: action?.commenId,
            _timestamp: Date.now(), // 添加时间戳
            _uid: Math.random().toString(36).slice(2), // 唯一ID
            dataArr: eventParams,
        },
        accessCode: 'ngapforeignSendTrigger',
    };
    CrossAPI.getContact('foreignSendTrigger', params, function () {});
    console.log('推送params', params);
    const params3 = {
        sendEventName: 'ngap_commonMsgSendEvent',
        sendEventType: '3', //1页签 2,ngfv，3小球
        sendEventParams: {
            sendType: 'ngapComponentlinkage',
            dataId: action?.commenId,
            _timestamp: Date.now(), // 添加时间戳
            _uid: Math.random().toString(36).slice(2), // 唯一ID
            dataArr: eventParams,
        },
        accessCode: 'ngapforeignSendTrigger',
    };
    CrossAPI.getContact('foreignSendTrigger', params3, function () {});
    console.log('推送params3', params3);
    execAction(next?.success || next, eventParams);
};
/**
 * 合并行为中的参数
 * @param eventParams 事件行为中配置的参数
 * @param initData 事件触发时，组件传递的参数
 */
const mergeParams = (eventParams: any = [], initData: any = {}) => {
    // 获取行为中配置的静态参数
    const data = handleArrayVariable(eventParams, initData);
    // 如果行为配置参数为空，而上一个行为返回的数据（initData）为基础类型，则直接返回，因为基础类型没有属性，无法合并。
    if (
        !eventParams?.length &&
        (Array.isArray(initData) || typeof initData === 'string' || typeof initData === 'number' || typeof initData === 'boolean')
    ) {
        return initData;
    }
    // 处理params
    initData &&
        Object.keys(initData).forEach((key) => {
            if (key && typeof initData[key] != 'undefined' && initData[key] != null) {
                data[key] = initData[key];
            }
        });
    return handleParamVariable(data);
};

/**
 * 处理组件方法
 */
async function handleMethods({ action, next }: ActionNode<MethodsAction>, data: any = {}) {
    const ref = getComponentRef(action.target);
    // TODO 需要等待组件完全加载后，才可执行(此处有漏洞，如果组件被删除，会一直找不到)
    if (!ref) {
        // 添加计数器，防止死循环
        const currentCount = Number(sessionStorage.getItem('ngap-event-flow-wait')) || 0;
        sessionStorage.setItem('Ngap-event-flow-wait', String(currentCount + 1));
        if (currentCount < 100) {
            setTimeout(() => {
                handleMethods({ action, next }, data);
            }, 100);
        } else {
            console.error('组件加载超时，请检查组件是否存在');
        }
        return;
    }
    try {
        //滚动
        const result = await ref?.[action.method]?.({ ...action?.params, ...data });
        if (typeof result === 'boolean') {
            if (result) {
                execAction(next?.success || next, data);
            } else {
                execAction(next?.fail || next, data);
            }
        } else {
            setTimeout(() => {
                // 基础类型不能使用对象合并的方式
                if ((Array.isArray(result) || typeof result !== 'object') && isNotEmpty(result)) {
                    execAction(next?.success || next, result);
                } else {
                    execAction(next?.success || next, Object.assign(data, result || {}));
                }
            });
        }
    } catch (error) {
        execAction(next?.fail || next, data);
        console.error(`【${action.method}】方法调用失败：`, error);
        throw {
            message: `【${action.method}】方法调用失败：`,
            error: error,
        };
    }
}

/**
 * 打开/关闭弹窗
 */
async function handleOpenModal({ action, next }: ActionNode<MethodsAction>, data: any = {}, type: 'open' | 'close') {
    const ref = getComponentRef(action.target);
    if (type === 'close') ref.close({ ...data });
    if (type === 'open') await ref.open({ ...data });
    execAction(next?.success || next, data);
}

/**
 * 处理确认框
 */
const handleShowConfirm = ({ action, next }: ActionNode<ConfirmAction>, data: any) => {
    Modal[action.type]?.({
        title: action.title,
        content: action.content,
        okText: action.okText,
        cancelText: action.cancelText,
        onOk: () => {
            execAction(next?.success || next, data);
        },
        onCancel: () => {
            execAction(next?.fail || next, data);
        },
    });
};

/**
 * 全局提示
 */
const handleMessage = ({ action, next }: ActionNode<MessageAction>, data: any) => {
    message
        .open({
            type: action.type,
            content: action.content,
            duration: action.duration,
        })
        .then(() => {
            execAction(next?.success || next, data);
        });
};

/**
 * 消息通知
 */
const handleNotification = ({ action, next }: ActionNode<NotificationAction>, data: any) => {
    notification.open({
        type: action.type,
        message: action.message,
        description: action.description,
        placement: action.placement,
        duration: action.duration,
    });
    execAction(next?.success || next, data);
};

/**
 * 请求处理
 */
const handleRequest = async ({ action, next }: ActionNode<ApiConfig>, data: any) => {
    const res = await handleApi(action, data);
    if (res.code === 0) {
        execAction(next?.success || next, res.data);
    } else {
        execAction(next?.fail || next, res.data);
    }
};
/**
 * 框架方法
 */
const handleCrossAPIfn = async ({ action, next }: ActionNode<CrossAPIFnAction>, data: any) => {
    try {
        crossAPIAction(action, data, (data: any) => {
            execAction(next?.success || next, data);
        });
    } catch (e) {
        console.log(e);
        throw {
            message: '触发crossAPI失败！',
            error: e,
        };
    }
};

/**
 * 金库校验
 */
const handleGoldBankCheckfn = async ({ action, next }: ActionNode<GoldBankCheckFnAction>, data: any) => {
    try {
        GoldBankCheckAction(action, function (checkData: any) {
            if (checkData) {
                execAction(next?.success || next, data);
            } else {
                execAction(next?.fail || next, data);
            }
        });
    } catch (e) {
        console.log(e);
    }
};

/**
 * 跳转链接
 */
const handleJumpLink = async ({ action, next }: ActionNode<JumpLinkAction>, data: any) => {
    // 将对象转换为 URL 查询参数字符串
    const convertToQueryString = (obj: any): string => {
        if (!obj) return '';

        // 如果已经是字符串且符合查询参数格式，直接返回
        if (typeof obj === 'string' && obj.includes('=')) {
            return obj.startsWith('?') ? obj.substring(1) : obj;
        }

        const params: string[] = [];

        // 递归处理对象
        const processValue = (key: string, value: any, prefix = '') => {
            const fullKey = prefix ? `${prefix}[${key}]` : key;

            if (value === null || value === undefined) {
                return;
            }

            if (typeof value === 'object' && !Array.isArray(value)) {
                // 处理嵌套对象
                Object.keys(value).forEach((k) => processValue(k, value[k], fullKey));
            } else if (Array.isArray(value)) {
                // 处理数组
                value.forEach((v, index) => processValue(index.toString(), v, fullKey));
            } else {
                // 处理基本类型
                params.push(`${encodeURIComponent(fullKey)}=${encodeURIComponent(String(value))}`);
            }
        };

        // 处理对象或数组
        if (typeof obj === 'object') {
            Object.keys(obj).forEach((key) => processValue(key, obj[key]));
        } else {
            // 如果是其他类型，尝试作为字符串处理
            return String(obj);
        }

        return params.join('&');
    };

    const queryString = convertToQueryString(data);
    if (action.jumpType === 'route') {
        let url = action.url;
        if (queryString.length > 0) {
            url += (action.url.indexOf('?') > -1 ? '&' : '?') + queryString;
        }
        // router.navigate(url);
    } else if (action.jumpType === 'micro') {
        if (!window.microApp) {
            console.warn('跨服务跳转：当前页面不在微应用环境中，无法跳转');
        }
        window.microApp?.dispatch({ type: 'router', path: action.url, data });
    } else if (action.jumpType === 'link') {
        const url = `${action.url}${action.url?.indexOf('?') > -1 ? '&' : '?'}${queryString}`;
        if (action.isNewWindow) {
            window.open(url);
        } else {
            if (window?.location) {
                window.location.href = url;
            }
        }
    } else if (action.jumpType === 'crossAPI') {
        let crossAPIUrl = baseApiConvert(action.url);
        if (queryString && action.linkParamType === '1') {
            crossAPIUrl = crossAPIUrl + (crossAPIUrl.indexOf('?') > -1 ? '&' : '?') + queryString;
        }
        if (action.openType === '2') {
            window?.crossAPI?.destroyDialog(action.showDialogId || 'feedbackPagePC');
            window?.crossAPI?.showDialog({
                id: action.showDialogId || 'feedbackPagePC',
                title: action.tabName ? action.tabName : '测试页面',
                url: baseApiConvert(crossAPIUrl),
                param: data,
                modal: false,
                width: action.showDialogW || '700',
                height: action.showDialogH || '500',
            });
        } else {
            window?.crossAPI?.createTab(action.tabName ? action.tabName : '测试页面', crossAPIUrl, data);
        }
    }
};

/**
 * 关闭页面
 */
const handleDestroyPage = async ({ action, next }: ActionNode<DestroyPageAction>, data: any) => {
    if (action.destroyTabName) {
        // 关闭客服系统菜单页签
        window?.crossAPI?.destroyTab(action.destroyTabName);
    }
    execAction(next?.success || next, data);
};

/**
 * 变量赋值
 */
const handleVariable = ({ action, next }: ActionNode<VariableAction>, data: any) => {
    let value = action.assignmentType === 'reset' ? undefined : data[action.name];
    /**
     * 1. 变量重置，清空variableData中的数据
     * 2. 变量静态赋值，直接使用定义的value
     * 3. 变量动态赋值，使用上一个行为中返回的数据作为结果赋值
     */
    if (action.assignmentType === 'reset') {
        value = undefined;
    } else if (action.assignmentType === 'assignment') {
        if (action.assignmentWay === 'static') {
            value = action.value;
        } else {
            value = data;
        }
    }
    usePageStore.getState().setVariableData({
        name: action.name,
        value,
    });
    execAction(next?.success || next, data);
};

/**
 * 复制内容
 */
const handleCopy = async ({ action, next }: ActionNode<CopyAction>, data: any) => {
    try {
        const copyContent = renderTemplate(action.content, data || {});
        await copyText(copyContent);
        execAction(next?.success || next, data);
    } catch (error) {
        console.error('执行复制行为：', error);
        throw {
            message: '执行复制行为：',
            error: error,
        };
    }
};

/**
 * 定时器
 */
const handleSetTimeout = async ({ action, next }: ActionNode<any>, data: any, state?: any) => {
    if (action.timeType === 'timeOut') {
        const timeoutId = setTimeout(() => {
            execAction(next?.success || next, data);
        }, action.duration * 1000);
        // 把定时器 ID 存进数组
        timerList.push(timeoutId);
    } else if (action.timeType === 'timeInterval') {
        if (action.timeCount && action.timeCount > 0) {
            let count = 0;
            const maxCount = action.timeCount;
            const intervalId = setInterval(() => {
                execAction(next?.success || next, data);
                count++;
                if (count >= maxCount) {
                    clearInterval(intervalId);
                    // 执行完后从数组里移除（可选，不移除也没关系，下次清的时候会安全处理）
                    const index = timerList.indexOf(intervalId);
                    if (index > -1) timerList.splice(index, 1);
                }
            }, action.duration * 1000);
            timerList.push(intervalId);
        } else if (action.timeCount === undefined || action.timeCount === null) {
            const intervalId = setInterval(() => {
                execAction(next?.success || next, data);
            }, action.duration * 1000);
            timerList.push(intervalId);
        }
    } else if (action.timeType === 'timeClean') {
        // 使用导出的清理函数清除所有定时器
        clearTimerList();
    }
};

/**
 * 组件显示和隐藏
 */
const handleVisible = async (
    {
        action,
        next,
    }: ActionNode<{ target: string | string[] | { label: string; value: string }[]; showType: string; showResult: string; expression: any }>,
    data: any,
) => {
    const targetList = (Array.isArray(action.target)
        ? action.target.map((t) => (typeof t === 'object' ? (t as { value: string }).value : t))
        : [action.target]) as string[];
    const show = action.showType === 'static' ? action.showResult === 'show' : !!action.expression;
    for (const targetId of targetList) {
        const ref = getComponentRef(targetId);
        if (ref) {
            if (show) {
                ref.show({ ...data });
            } else {
                ref.hide({ ...data });
            }
        }
    }
    execAction(next?.success || next, data);
};

/**
 * 组件禁用
 */
const handleDisable = async (
    { action, next }: ActionNode<{ target: string; disableType: string; disableResult: string; expression: any }>,
    data: any,
) => {
    const ref = getComponentRef(action.target);
    if (action.disableType === 'static') {
        if (action.disableResult) {
            ref.disable({ ...data });
        } else {
            ref.enable({ ...data });
        }
    } else {
        const expression = action.expression ?? {};
        const formula = expression.value;
        const result = renderFormula(formula);
        if (result ? true : false) {
            ref.disable({ ...data });
        } else {
            ref.enable({ ...data });
        }
    }
    execAction(next?.success || next, data);
};

//组件样式
const handleStyle = async (
    { action, next }: ActionNode<{ target: string; disableType: string; disableResult: string; expression: any; background: string }>,
    data: any,
) => {
    const ref = getComponentRef(action.target);
    ref.setStyle({ background: action.background, ...data });
    execAction(next?.success || next, data);
};

/**
 * 运行脚本
 */
const handleRunScripts = async ({ action, next }: ActionNode<{ scripts: string }>, data: any) => {
    const result = renderFormula(action.scripts, data);
    if (typeof result === 'boolean') {
        if (result) {
            execAction(next?.success || next, data);
        } else {
            execAction(next?.fail || next, data);
        }
    } else {
        execAction(next?.success || next, result || data);
    }
};

/**
 * 打开气泡弹窗
 */
const handleOpenPopover = ({ action, next }: ActionNode<any>, data: any) => {
    const ref = getComponentRef(action.target);

    if (!ref) {
        const currentCount = Number(sessionStorage.getItem('ngap-event-flow-wait')) || 0;
        sessionStorage.setItem('ngap-event-flow-wait', String(currentCount + 1));
        if (currentCount < 100) {
            setTimeout(() => {
                handleOpenPopover({ action, next }, data);
            }, 100);
        } else {
            console.error('气泡弹窗组件加载超时，请检查组件是否存在');
        }
        return;
    }
    // 获取触发元素ID，用于计算气泡弹窗位置
    const triggerElementId = action.triggerElementId || data.triggerElementId;
    if (ref.show && triggerElementId) {
        ref.show(triggerElementId);
    } else {
        console.error('[handleOpenPopover] triggerElementId is undefined, ref:', ref);
    }
    execAction(next?.success || next, data);
};

/**
 * 关闭气泡弹窗
 */
const handleClosePopover = ({ action, next }: ActionNode<any>, data: any) => {
    const ref = getComponentRef(action.target);
    if (!ref) {
        const currentCount = Number(sessionStorage.getItem('ngap-event-flow-wait')) || 0;
        sessionStorage.setItem('ngap-event-flow-wait', String(currentCount + 1));
        if (currentCount < 100) {
            setTimeout(() => {
                handleClosePopover({ action, next }, data);
            }, 100);
        } else {
            console.error('气泡弹窗组件加载超时，请检查组件是否存在');
        }
        return;
    }
    if (ref.hide) {
        ref.hide();
    }
    execAction(next?.success || next, data);
};

/**
 * 根据 data-id 滚动定位到元素
 * @param dataId 元素的 data-id 值
 * @param options 滚动配置项
 */
export function scrollToElementByDataId(
    dataId: string,
    options?: {
        behavior?: 'smooth' | 'auto';
        block?: 'start' | 'center' | 'end';
        highlight?: boolean;
    },
) {
    if (!dataId) {
        console.warn('[ngap-scroll] dataId 为空，跳过滚动定位');
        return;
    }
    const performScroll = (element: Element) => {
        element.scrollIntoView({
            behavior: options?.behavior || 'smooth',
            block: options?.block || 'center',
        });

        if (options?.highlight !== false) {
            const highlightClass = 'ngap-scroll-highlight';
            element.classList.add(highlightClass);
            setTimeout(() => {
                element.classList.remove(highlightClass);
            }, 2000);
        }
    };

    const element = document.querySelector(`[data-id="${dataId}"]`);
    if (!element) {
        console.warn(`[ngap-scroll] 未找到 data-id="${dataId}" 的元素`);
        return;
    }

    const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
            const { width, height } = entry.contentRect;
            if (width > 0 || height > 0) {
                observer.unobserve(entry.target);
                observer.disconnect();
                performScroll(element);
            }
        }
    });

    const rect = element.getBoundingClientRect();
    if (rect.width > 0 || rect.height > 0) {
        performScroll(element);
    } else {
        observer.observe(element);
    }
}

/**
 * 根据 data-id 触发组件事件
 * @param dataId 元素的 data-id 值
 * @param eventName 事件名称（如 onClick, onChange, onOpen 等）
 * @param params 事件参数
 */
export function triggerComponentEventByDataId(dataId: string, eventName: string, actions: any, params: any = {}) {
    if (!dataId || !eventName || !actions) {
        console.log('[ngap-event] dataId 或 eventName 为空，跳过事件触发');
        return;
    }
    handleActionFlow(actions, params);
}

/**
 * 根据 data-id 执行完整流程：滚动定位 + 触发事件
 * @param dataId 元素的 data-id 值
 * @param eventName 事件名称
 * @param params 事件参数
 * @param options 滚动配置项
 */
export function handleExternalScroll(pparms: any) {
    if (!pparms?.dataId) {
        console.log('初始化推送数据缺少 dataId');
        return;
    }
    const crossApisGlobal2: any = usePageStore.getState().page.pageData.crossApisGlobal || {};
    const elementsMap2 = usePageStore.getState().page?.pageData?.elementsMap || {};
    const handleExternalTrigger = (payload: any) => {
        if (!payload || typeof payload !== 'object') return;

        const { dataId, _uid, eventName, actions, params, options } = payload;
        // 基于 _uid 去重
        if (_uid && processedMessageIds.has(_uid)) {
            console.warn(`[ngap-external] 重复消息 _uid="${_uid}"，跳过`);
            return;
        }
        if (_uid) processedMessageIds.add(_uid);
        if (payload.flagsxa) {
            handleActionFlow(actions, params);
        } else {
            handleExternalScrollAndTrigger(dataId, eventName, actions, params, options);
        }
    };

    if (pparms.sendType === 'ngapComponentlinkage') {
        const flagsxa = false;
        console.log('crossApisGlobal2', crossApisGlobal2);
        console.log('elementsMap2', elementsMap2);
        for (let j = 0; j < crossApisGlobal2.length; j++) {
            if (crossApisGlobal2[j].eventName === 'masterAuxLinkage') {
                const actionAll: any = crossApisGlobal2[j].actions;
                for (let i = 0; i < actionAll.length; i++) {
                    const arrDatas: any = {
                        dataId: '',
                        _uid: '',
                        eventName: '',
                        actions: [],
                        params: {},
                        options: '',
                        flagsxa: false,
                    };
                    if (actionAll[i].config && actionAll[i].config.actionType === 'metlink') {
                        const linkRuleAll = actionAll[i].config.linkRules;
                        for (let g = 0; g < linkRuleAll.length; g++) {
                            if (linkRuleAll[g].triggerElement === pparms.dataId) {
                                arrDatas.dataId = linkRuleAll[g].linkElement;
                                console.log('循环中的', arrDatas.dataId);
                                arrDatas.flagsxa = false;
                                if (!elementsMap2[arrDatas.dataId]?.config) {
                                    console.warn(`!elementsMap2[arrDatas.dataId]?.config未找到 data-id="${arrDatas.dataId}" 的元素，中断推送`);
                                    break;
                                }
                                if (elementsMap2[arrDatas.dataId]?.config) {
                                    if (elementsMap2[arrDatas.dataId]?.config?.events?.[0]) {
                                        arrDatas.eventName = elementsMap2[arrDatas.dataId]?.config?.events[0]?.eventName || '';
                                        arrDatas.actions = elementsMap2[arrDatas.dataId]?.config?.events[0]?.actions || [];
                                    }
                                }
                                if (!arrDatas.dataId) {
                                    console.warn(`[arrDatas.dataId] 未找到 data-id="${arrDatas.dataId}" 的元素，中断推送`);
                                    break;
                                }
                                console.log('arrDatas1', arrDatas);
                                handleExternalTrigger(arrDatas);
                            }
                        }
                    } else if (actionAll[i].config && actionAll[i].config.actionType === 'variable') {
                        const valuePls = actionAll[i]?.config?.value?.value || '';
                        // 循环所有key
                        for (const key of Object.keys(pparms.dataArr)) {
                            if (valuePls.includes(key)) {
                                arrDatas.actions = actionAll;
                                arrDatas.flagsxa = true;
                                arrDatas.params = pparms.dataArr;
                                console.log('arrDatas2', arrDatas);
                                handleExternalTrigger(arrDatas);
                            }
                        }
                    } else if (actionAll[i].config && actionAll[i].config.actionType !== 'metlink' && actionAll[i].config.actionType !== 'variable') {
                        arrDatas.actions = actionAll;
                        arrDatas.flagsxa = true;
                        arrDatas.params = pparms.dataArr;
                        console.log('arrDatas3', arrDatas);
                        handleExternalTrigger(arrDatas);
                        break;
                    }
                }
            }
        }
    }
}
export function handleExternalScrollAndTrigger(
    dataId: string,
    eventName: string = 'onClick',
    actions: any,
    params: any = {},
    options?: {
        behavior?: 'smooth' | 'auto';
        block?: 'start' | 'center' | 'end';
        highlight?: boolean;
    },
) {
    // 1. 先滚动定位
    scrollToElementByDataId(dataId, options);

    // 2. 等待滚动完成后触发事件（滚动动画约 500ms）
    setTimeout(() => {
        triggerComponentEventByDataId(dataId, eventName, actions, params);
    }, 1000);
}
