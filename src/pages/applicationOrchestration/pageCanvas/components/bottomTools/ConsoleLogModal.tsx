import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Modal, Empty, Input, Select, Tag, Button } from 'antd';
import styles from './ConsoleLogModal.module.less';

// 日志级别类型
type LogLevel = 'log' | 'warn' | 'error' | 'info';

// 日志项接口
interface LogItem {
    level: LogLevel;
    message: string;
    timestamp?: string;
    stack?: string;
}

interface ConsoleLogModalProps {
    visible: boolean;
    onClose: () => void;
    logs: any[];
    onClearLogs?: () => void;
}

const ConsoleLogModal: React.FC<ConsoleLogModalProps> = ({ visible, onClose, logs, onClearLogs }) => {
    const [filterLevel, setFilterLevel] = useState<LogLevel | 'all'>('all');
    const [searchText, setSearchText] = useState('');

    // 每次打开弹窗时，重置筛选条件并确保使用最新的 logs
    useEffect(() => {
        if (visible) {
            setFilterLevel('all');
            setSearchText('');
        }
    }, [visible]);

    // 清除所有日志
    const handleClearLogs = useCallback(() => {
        if (onClearLogs) {
            onClearLogs();
        }
    }, [onClearLogs]);

    // 过滤日志
    const filteredLogs = useMemo(() => {
        let filtered = logs;

        // 按级别过滤
        if (filterLevel !== 'all') {
            filtered = filtered.filter((log) => log.level === filterLevel);
        }

        // 按搜索文本过滤
        if (searchText.trim()) {
            const searchLower = searchText.toLowerCase();
            filtered = filtered.filter((log) => {
                const messageStr = typeof log.message === 'string'
                    ? log.message
                    : JSON.stringify(log.message || log);
                const messageMatch = messageStr.toLowerCase().includes(searchLower);

                const logStr = JSON.stringify(log);
                const logMatch = logStr.toLowerCase().includes(searchLower);

                // 只要有一个匹配就返回true
                return messageMatch || logMatch;
            });
        }

        // 过滤掉没有有效内容的日志（没有 message 且没有 stack）
        filtered = filtered.filter((log) => {
            const hasMessage = log.message !== undefined && log.message !== null && log.message !== '';
            const hasStack = log.stack !== undefined && log.stack !== null && log.stack !== '';
            return hasMessage || hasStack;
        });

        return filtered;
    }, [logs, filterLevel, searchText]);

    // 获取日志级别的颜色和标签
    const getLevelConfig = (level: LogLevel) => {
        const configs = {
            log: { color: '#333', bgColor: '#f0f0f0', label: 'LOG' },
            info: { color: '#0066cc', bgColor: '#e6f3ff', label: 'INFO' },
            warn: { color: '#ff9800', bgColor: '#fff3e0', label: 'WARN' },
            error: { color: '#f44336', bgColor: '#ffebee', label: 'ERROR' },
        };
        return configs[level];
    };

    // 格式化日志内容
    const formatLogContent = (log: any): string | null => {
        // 空值直接返回 null
        if (log === undefined || log === null) {
            return null;
        }

        // 处理字符串类型
        if (typeof log === 'string') {
            const trimmed = log.trim();
            if (trimmed === '' || trimmed === '{}') {
                return null;
            }
            return log;
        }

        // 处理数组类型（重点！针对你当前的场景）
        if (Array.isArray(log)) {
            const lines: string[] = [];
            log.forEach((item, index) => {
                // 1. 处理字符串项（比如"组件崩溃:"）
                if (typeof item === 'string') {
                    lines.push(item);
                }
                // 2. 处理 Error 对象（比如下标1的那个对象）
                else if (item instanceof Error) {
                    // 直接拼接 message 和 stack，保留换行
                    if (item.message) {
                        lines.push(item.message);
                    }
                    if (item.stack) {
                        lines.push(item.stack);
                    }
                }
                // 3. 处理普通对象（比如下标2的 { componentStack: "..." }）
                else if (typeof item === 'object' && item !== null) {
                    // 优先处理 componentStack（React 组件栈信息）
                    if (item.componentStack) {
                        lines.push(item.componentStack);
                    }
                    // 其他对象，格式化输出，但不丢失内容
                    else {
        try {
                            const jsonStr = JSON.stringify(item, null, 2);
                            if (jsonStr !== '{}' && jsonStr !== '[]') {
                                lines.push(jsonStr);
                            }
                        } catch (e) {
                            lines.push(String(item));
                        }
                    }
                }
                // 4. 其他类型（比如 number/boolean）
                else {
                    lines.push(String(item));
            }
            });
            // 用真正的换行符连接所有行，这样<pre>标签就能正常换行
            return lines.join('\n');
        }

        // 处理普通对象（非数组）
        if (typeof log === 'object' && log !== null) {
            try {
                const jsonStr = JSON.stringify(log, null, 2);
                if (jsonStr !== '{}' && jsonStr !== '[]') {
                    return jsonStr;
                }
        } catch (e) {
                // 序列化失败，用 toString 兜底
                const str = String(log);
                if (str !== '' && str !== '[object Object]') {
                    return str;
                }
            }
                return null;
            }

        // 其他基本类型
        return String(log);
    };

    // 获取日志统计信息（只统计有有效内容的日志）
    const logStats = useMemo(() => {
        let log = 0;
        let info = 0;
        let warn = 0;
        let error = 0;

        logs.forEach((item) => {
            // 检查是否有有效内容
            const hasMessage = item.message !== undefined && item.message !== null && item.message !== '';
            const hasStack = item.stack !== undefined && item.stack !== null && item.stack !== '';
            if (!hasMessage && !hasStack) {
                return; // 跳过无效日志
            }

            const level = item.level;
            if (level === 'log') log++;
            else if (level === 'info') info++;
            else if (level === 'warn') warn++;
            else if (level === 'error') error++;
        });

        return {
            total: log + info + warn + error,
            log,
            info,
            warn,
            error,
        };
    }, [logs]);

    return (
        <Modal
            title={
                <div className={styles.modalHeader}>
                    <span>日志</span>
                    {/* <div className={styles.logStats}>
                        <Tag color="grey">打印: {logStats.log}</Tag>
                        <Tag color="blue">信息: {logStats.info}</Tag>
                        <Tag color="orange">警告: {logStats.warn}</Tag>
                        <Tag color="red">错误: {logStats.error}</Tag>
                    </div> */}
                </div>
            }
            open={visible}
            onCancel={onClose}
            footer={null}
            width={800}
            className={styles.consoleLogModal}
            destroyOnClose
        >
            <div className={styles.consoleContainer}>
                {/* 过滤器 */}
                <div className={styles.filters}>
                    <Select
                        value={filterLevel}
                        onChange={setFilterLevel}
                        size="small"
                        style={{ width: 110 }}
                        options={[
                            { value: 'all', label: `全部(${logStats.total})` },
                            { value: 'log', label: `打印(${logStats.log})` },
                            { value: 'info', label: `信息(${logStats.info})` },
                            { value: 'warn', label: `警告(${logStats.warn})` },
                            { value: 'error', label: `错误(${logStats.error})` },
                        ]}
                    />

                    <Input
                        placeholder="日志搜索..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        allowClear
                        size="small"
                        className={styles.searchInput}
                    />

                    <Button
                        size="small"
                        onClick={handleClearLogs}
                        className={styles.clearLogsBtn}
                    >
                        全部清除
                    </Button>
                </div>

                {/* 日志列表 */}
                <div className={styles.logList}>
                    {filteredLogs.length === 0 ? (
                        <Empty description="暂无日志数据" />
                    ) : (
                        filteredLogs.map((log, index) => {
                            const level = log.level || 'log';
                            const config = getLevelConfig(level);

                            // 格式化日志内容，检查是否为空对象
                            const formattedContent = formatLogContent(log.message || log);
                            const isEmptyLog = formattedContent === null;

                            // 如果日志内容为空且没有堆栈信息，则不显示该日志项
                            if (isEmptyLog && !log.stack) {
                                return null;
                            }

                            return (
                                <div key={index} className={styles.logItem} style={{ borderLeftColor: config.color }}>
                                    {!isEmptyLog && (
                                        <div className={styles.logHeader}>
                                            <Tag
                                                color={config.bgColor.replace('#', '')}
                                                style={{
                                                    color: config.color,
                                                    border: `1px solid ${config.color}`,
                                                    margin: 0
                                                }}
                                            >
                                                {config.label}
                                            </Tag>
                                            {log.timestamp && (
                                                <span className={styles.timestamp}>{log.timestamp}</span>
                                            )}
                                        </div>
                                    )}
                                    {!isEmptyLog && (
                                        <div className={styles.logContent}>
                                            <pre>{formattedContent}</pre>
                                        </div>
                                    )}
                                    {log.stack && (
                                        <div className={styles.logStack}>
                                            <details>
                                                <summary>调用栈详情</summary>
                                                <pre>{log.stack || '无调用栈详情信息'}</pre>
                                            </details>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default ConsoleLogModal;
