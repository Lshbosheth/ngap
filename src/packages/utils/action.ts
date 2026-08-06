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
} from '../types';
import { getComponentRef } from './useComponentRefs';
import { handleApi } from './handleApi';
import { copyText, handleArrayVariable, handleParamVariable, isNotEmpty, renderFormula, renderTemplate } from './util';
import { Modal, message, notification } from './../../utils/AntdGlobal';
import { baseApiConvert } from './../../utils/util';
import CrossAPI from './../../utils/crossAPI';
import { crossAPIAction } from './crossAPIAction';
import { GoldBankCheckAction } from './goldBankCheckfn'; // 金库校验
import { menu } from '../../stores/menuStore';
const timerList: (ReturnType<typeof setInterval> | ReturnType<typeof setTimeout> | null)[] = [];

// 把工作流转换为链表结构，此算法需要进一步优化。
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
export function handleActionFlow(actions: any[] = [], params: any, state?: any) {
    /**
     * 行为数组转换成链表结构
     */
    const nodes = convertArrayToLinkedList(actions);
    if (nodes?.action) {
        execAction(nodes, params, state);
    }
}

/**
 * 递归执行事件行为
 * params是按钮触发是，组件传递的参数
 * action中的data为行为配置中手工配置的参数
 */
const execAction = (node: any, params: any = {}, state?: any) => {
    if (!node || !node?.action) return;
    try {
        sessionStorage.setItem('ngap-event-flow-wait', String(0));
        const data = mergeParams(node.action.data, params, state);
        delete node.action.data;
        node.action = handleParamVariable(node.action, params, state);
        if (node.action.actionType === 'methods') {
            // 执行组件方法时，增加延时，解决set方法异步导致表格组件每次取选中值拿到的上次选中项等问题
            setTimeout(function () {
                handleMethods(node, data, state);
            }, 200);
        } else if (node.action.actionType === 'showConfirm') {
            handleShowConfirm(node, data, state);
        } else if (node.action.actionType === 'message') {
            handleMessage(node, data, state);
        } else if (node.action.actionType === 'notification') {
            handleNotification(node, data, state);
        } else if (node.action.actionType === 'request' || node.action.actionType === 'download') {
            handleRequest(node, data, state);
        } else if (node.action.actionType === 'formReset') {
            node.action.method = 'reset';
            handleMethods(node, data, state);
        } else if (node.action.actionType === 'formSubmit') {
            node.action.method = 'submit';
            handleMethods(node, data, state);
        } else if (node.action.actionType === 'formValidate') {
            node.action.method = 'validate';
            handleMethods(node, data, state);
        } else if (node.action.actionType === 'formAssignment') {
            node.action.method = 'init';
            handleMethods(node, data, state);
        } else if (node.action.actionType === 'formGetValue') {
            node.action.method = 'getFormData';
            handleMethods(node, data, state);
        } else if (['openModal', 'openDrawer'].includes(node.action.actionType)) {
            handleOpenModal(node, data, 'open', state);
        } else if (['closeModal', 'closeDrawer'].includes(node.action.actionType)) {
            handleOpenModal(node, data, 'close', state);
        } else if (node.action.actionType === 'jumpLink') {
            handleJumpLink(node, data);
        } else if (node.action.actionType === 'reloadPage') {
            window?.location?.reload();
        } else if (node.action.actionType === 'destroyPage') {
            handleDestroyPage(node, data, state);
        } else if (node.action.actionType === 'variable') {
            handleVariable(node, data, state);
        } else if (node.action.actionType === 'copy') {
            handleCopy(node, data, state);
        } else if (node.action.actionType === 'setTimeout') {
            handleSetTimeout(node, data, state);
        } else if (node.action.actionType === 'visible') {
            handleVisible(node, data, state);
        } else if (node.action.actionType === 'disable') {
            handleDisable(node, data, state);
        } else if (node.action.actionType === 'script') {
            handleRunScripts(node, data, state);
        } else if (node.action.actionType === 'crossAPIfn') {
            handleCrossAPIfn(node, data, state);
        } else if (node.action.actionType === 'goldBankCheck') {
            handleGoldBankCheckfn(node, data, state);
        } else if (node.action.actionType === 'style') {
            handleStyle(node, data, state);
        } else if (node.action.actionType === 'messAge') {
            messAgeParams(node, data, state);
        } else if (node.action.actionType === 'openPopover') {
            handleOpenPopover(node, data, state);
        } else if (node.action.actionType === 'closePopover') {
            handleClosePopover(node, data, state);
        }
    } catch (error) {
        console.error(`事件流[${node.actionType}执行异常]`, error);
    }
};
//触发联动 shijain
const messAgeParams = (eventParams: any = [], initData: any = {}, state?: any) => {
    // 获取行为中配置的静态参数
    //const data = handleArrayVariable(eventParams, initData, state);
    console.log(eventParams);
};

/**
 * 合并行为中的参数
 * @param eventParams 事件行为中配置的参数
 * @param initData 事件触发时，组件传递的参数
 */
const mergeParams = (eventParams: any = [], initData: any = {}, state?: any) => {
    // 获取行为中配置的静态参数
    const data = handleArrayVariable(eventParams, initData, state);
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
    return handleParamVariable(data, {}, state);
};

/**
 * 处理组件方法
 */
async function handleMethods({ action, next }: ActionNode<MethodsAction>, data: any = {}, state?: any) {
    const ref = getComponentRef(action.target);
    // TODO 需要等待组件完全加载后，才可执行(此处有漏洞，如果组件被删除，会一直找不到)
    if (!ref) {
        // 添加计数器，防止死循环
        const currentCount = Number(sessionStorage.getItem('ngap-event-flow-wait')) || 0;
        sessionStorage.setItem('ngap-event-flow-wait', String(currentCount + 1));
        if (currentCount < 100) {
            setTimeout(() => {
                handleMethods({ action, next }, data, state);
            }, 100);
        } else {
            console.error('组件加载超时，请检查组件是否存在');
        }
        return;
    }
    try {
        const result = await ref?.[action.method]?.({ ...action?.params, ...data });
        if (typeof result === 'boolean') {
            if (result) {
                execAction(next?.success || next, data, state);
            } else {
                execAction(next?.fail || next, data, state);
            }
        } else {
            setTimeout(() => {
                // 基础类型不能使用对象合并的方式
                if ((Array.isArray(result) || typeof result !== 'object') && isNotEmpty(result)) {
                    execAction(next?.success || next, result, state);
                } else {
                    execAction(next?.success || next, Object.assign(data, result || {}), state);
                }
            });
        }
    } catch (error) {
        execAction(next?.fail || next, data, state);
        console.error(`【${action.method}】方法调用失败：`, error);
    }
}

/**
 * 打开/关闭弹窗
 */
async function handleOpenModal({ action, next }: ActionNode<MethodsAction>, data: any = {}, type: 'open' | 'close', state?: any) {
    const ref = getComponentRef(action.target);
    if (type === 'close') ref.close({ ...data });
    if (type === 'open') await ref.open({ ...data });
    execAction(next?.success || next, data, state);
}

/**
 * 处理确认框
 */
const handleShowConfirm = ({ action, next }: ActionNode<ConfirmAction>, data: any, state?: any) => {
    Modal[action.type]?.({
        title: action.title,
        content: action.content,
        okText: action.okText,
        cancelText: action.cancelText,
        onOk: () => {
            execAction(next?.success || next, data, state);
        },
        onCancel: () => {
            execAction(next?.fail || next, data, state);
        },
    });
};

/**
 * 全局提示
 */
const handleMessage = ({ action, next }: ActionNode<MessageAction>, data: any, state?: any) => {
    message
        .open({
            type: action.type,
            content: action.content,
            duration: action.duration,
        })
        .then(() => {
            execAction(next?.success || next, data, state);
        });
};

/**
 * 消息通知
 */
const handleNotification = ({ action, next }: ActionNode<NotificationAction>, data: any, state?: any) => {
    notification.open({
        type: action.type,
        message: action.message,
        description: action.description,
        placement: action.placement,
        duration: action.duration,
    });
    execAction(next?.success || next, data, state);
};

/**
 * 请求处理
 */
const handleRequest = async ({ action, next }: ActionNode<ApiConfig>, data: any, state?: any) => {
    const res = await handleApi(action, data, state);
    if (res.code === 0 && res.data) {
        execAction(next?.success || next, res.data, state);
    } else {
        execAction(next?.fail || next, res.data, state);
    }
};

/**
 * 框架方法
 */
const handleCrossAPIfn = async ({ action, next }: ActionNode<CrossAPIFnAction>, data: any, state?: any) => {
    try {
        crossAPIAction(
            action,
            data,
            (_data: any) => {
                execAction(next?.success || next, _data, state);
            },
            state,
        );
    } catch (e) {
        console.log(e);
    }
};

/**
 * 金库校验
 */
const handleGoldBankCheckfn = async ({ action, next }: ActionNode<GoldBankCheckFnAction>, data: any, state?: any) => {
    try {
        GoldBankCheckAction(action, state, function (checkData: any) {
            if (checkData) {
                execAction(next?.success || next, data, state);
            } else {
                execAction(next?.fail || next, data, state);
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
        if (queryString) {
            url += action.url.indexOf('?') > -1 ? '&' : '?' + queryString;
        }
    } else if (action.jumpType === 'micro') {
        if (!window.microApp) {
            console.warn('跨服务跳转：当前页面不在微应用环境中，无法跳转');
        }
    } else if (action.jumpType === 'link') {
        const url = `${action.url}${action.url.indexOf('?') > -1 ? '&' : '?'}${queryString}`;
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
            CrossAPI.destroyDialog(action.showDialogId || 'feedbackPagePC');
            CrossAPI.showDialog({
                id: action.showDialogId || 'feedbackPagePC',
                title: action.tabName ? action.tabName : '测试页面',
                url: baseApiConvert(crossAPIUrl),
                param: data,
                modal: false,
                width: action.showDialogW || '700',
                height: action.showDialogH || '500',
            });
        } else {
            CrossAPI.createTab(action.tabName ? action.tabName : '测试页面', crossAPIUrl, data);
        }
    }
};
/**
 * 关闭页面
 */
const handleDestroyPage = async ({ action, next }: ActionNode<DestroyPageAction>, data: any, state: any) => {
    if (action.destroyTabName) {
        // 关闭客服系统菜单页签
        CrossAPI.destroyTab(action.destroyTabName);
        try {
            // 兼容预览时关闭平台某个tab
            menu.getState().closeTab(action.destroyTabName);
        } catch (e) {
            console.log(e);
        }
    }
    execAction(next?.success || next, data, state);
};

/**
 * 变量赋值
 */
const handleVariable = ({ action, next }: ActionNode<VariableAction>, data: any, state: any) => {
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
    const { pageStore } = state;
    const setVariableData = pageStore.getState().setVariableData;
    setVariableData({
        name: action.name,
        value,
    });
    execAction(next?.success || next, data, state);
};

/**
 * 复制内容
 */
const handleCopy = async ({ action, next }: ActionNode<CopyAction>, data: any, state?: any) => {
    try {
        const copyContent = renderTemplate(action.content, data || {});
        await copyText(copyContent);
        execAction(next?.success || next, data, state);
    } catch (error) {
        console.log('执行复制行为：', error);
    }
};

/**
 * 定时器
 */
const handleSetTimeout = async ({ action, next }: ActionNode<any>, data: any, state?: any) => {
    if (action.timeType === 'timeOut') {
        const timeoutId = setTimeout(() => {
            execAction(next?.success || next, data, state);
        }, action.duration * 1000);
        // 把定时器 ID 存进数组
        timerList.push(timeoutId);
    } else if (action.timeType === 'timeInterval') {
        if (action.timeCount && action.timeCount > 0) {
            let count = 0;
            const maxCount = action.timeCount;
            const intervalId = setInterval(() => {
                execAction(next?.success || next, data, state);
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
                execAction(next?.success || next, data, state);
            }, action.duration * 1000);
            timerList.push(intervalId);
        }
    } else if (action.timeType === 'timeClean') {
        // 遍历数组，清除所有定时器
        timerList.forEach((timer) => {
            if (timer) {
                // 同时调用两种清除方法，对不存在的 ID 调用是安全的，不会报错
                clearTimeout(timer as ReturnType<typeof setTimeout>);
                clearInterval(timer as ReturnType<typeof setInterval>);
            }
        });
        // 清空数组，避免下次重复清除
        timerList.length = 0;
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
    state?: any,
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
    execAction(next?.success || next, data, state);
};

/**
 * 组件禁用
 */
const handleDisable = async (
    { action, next }: ActionNode<{ target: string; disableType: string; disableResult: string; expression: any }>,
    data: any,
    state?: any,
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
        const result = renderFormula(formula, {}, state);
        if (result) {
            ref.disable({ ...data });
        } else {
            ref.enable({ ...data });
        }
    }
    execAction(next?.success || next, data, state);
};

//组件样式
const handleStyle = async (
    { action, next }: ActionNode<{ target: string; disableType: string; disableResult: string; expression: any; background: string }>,
    data: any,
    state?: any,
) => {
    const ref = getComponentRef(action.target);
    ref.setStyle({ background: action.background, ...data });
    execAction(next?.success || next, data, state);
};

/**
 * 运行脚本
 */
const handleRunScripts = async ({ action, next }: ActionNode<{ scripts: string }>, data: any, state?: any) => {
    const result = renderFormula(action.scripts, data, state);
    if (typeof result === 'boolean') {
        if (result) {
            execAction(next?.success || next, data, state);
        } else {
            execAction(next?.fail || next, data, state);
        }
    } else {
        // result 为undfined/null时才用data兜底
        execAction(next?.success || next, result ?? data, state);
    }
};

/**
 * 打开气泡弹窗
 */
const handleOpenPopover = ({ action, next }: ActionNode<any>, data: any, state?: any) => {
    const ref = getComponentRef(action.target);

    if (!ref) {
        const currentCount = Number(sessionStorage.getItem('ngap-event-flow-wait')) || 0;
        sessionStorage.setItem('ngap-event-flow-wait', String(currentCount + 1));
        if (currentCount < 100) {
            setTimeout(() => {
                handleOpenPopover({ action, next }, data, state);
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
    execAction(next?.success || next, data, state);
};

/**
 * 关闭气泡弹窗
 */
const handleClosePopover = ({ action, next }: ActionNode<any>, data: any, state?: any) => {
    const ref = getComponentRef(action.target);
    if (!ref) {
        const currentCount = Number(sessionStorage.getItem('ngap-event-flow-wait')) || 0;
        sessionStorage.setItem('ngap-event-flow-wait', String(currentCount + 1));
        if (currentCount < 100) {
            setTimeout(() => {
                handleClosePopover({ action, next }, data, state);
            }, 100);
        } else {
            console.error('气泡弹窗组件加载超时，请检查组件是否存在');
        }
        return;
    }
    if (ref.hide) {
        ref.hide();
    }
    execAction(next?.success || next, data, state);
};
