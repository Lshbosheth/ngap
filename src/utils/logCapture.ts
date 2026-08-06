/**
 * 日志捕获工具
 * 用于捕获控制台日志并存储到 window.capturedLogs 中
 */

// 日志项接口
interface LogItem {
    level: 'log' | 'warn' | 'error' | 'info';
    message: any;
    timestamp: string;
    stack?: string;
}

// 确保类型定义
declare global {
    interface Window {
        capturedLogs: LogItem[];
    }
}

// 初始化日志捕获数组
if (typeof window !== 'undefined') {
    window.capturedLogs = window.capturedLogs || [];
}

// 原始控制台方法引用
const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
};

// 格式化时间戳
const getTimestamp = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 添加日志到捕获数组
const addLog = (level: 'log' | 'warn' | 'error' | 'info', args: any[], stack?: string): void => {
    if (typeof window === 'undefined' || !window.capturedLogs) {
        return;
    }

    // 处理多个参数
    const message = args.length === 1 ? args[0] : args;

    window.capturedLogs.push({
        level,
        message,
        timestamp: getTimestamp(),
        stack,
    });

    // 限制日志数量，避免内存泄漏
    if (window.capturedLogs.length > 1000) {
        window.capturedLogs.shift(); // 移除最早的日志
    }
};

// 重写 console 方法
if (typeof window !== 'undefined') {
    console.log = (...args: any[]) => {
        originalConsole.log(...args);
        addLog('log', args);
    };

    console.warn = (...args: any[]) => {
        originalConsole.warn(...args);
        addLog('warn', args);
    };

    console.error = (...args: any[]) => {
        originalConsole.error(...args);
        // 尝试获取堆栈信息
        let stack: string | undefined;
        try {
            throw new Error();
        } catch (e) {
            if (e instanceof Error) {
                stack = e.stack?.split('\n').slice(2).join('\n'); // 跳过当前函数和错误构造函数的行
            }
        }
        addLog('error', args, stack);
    };

    console.info = (...args: any[]) => {
        originalConsole.info(...args);
        addLog('info', args);
    };
}

// 导出工具函数
export const getCapturedLogs = (): LogItem[] => {
    if (typeof window === 'undefined' || !window.capturedLogs) {
        return [];
    }
    return window.capturedLogs;
};

export const clearCapturedLogs = (): void => {
    if (typeof window === 'undefined' || !window.capturedLogs) {
        return;
    }
    window.capturedLogs = [];
};

export default {
    getCapturedLogs,
    clearCapturedLogs,
};
