import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Input, Collapse, Typography, Tag, Empty, Tabs, Select, Button, Tooltip, Dropdown } from 'antd';
import { QuestionCircleOutlined, DownOutlined, EyeOutlined, PlusOutlined, HistoryOutlined } from '@ant-design/icons';
import { useShallow } from 'zustand/react/shallow';
import { message } from '@/utils/AntdGlobal';
import TextHighlighter from './TextHighlighter';
import { componentModel, menu } from '@/stores/menuStore';
import { useAppContext } from '@/utils/AppProvider';
import HistoryModal from '../HistoryModal';

import styles from './index.module.less';
interface OptionItem {
    value: string;
    label: string;
    id: string;
}

interface MethodResult {
    type: string;
    componentList?: any;
    noLineNodeList?: any;
    noLineEndList?: any;
}

interface ParentProps {
    onTriggerPage2Method: () => MethodResult;
    previewFun: (value: string) => void;
}

// 2. 抽离组件：单独渲染 Collapse 内容，减少主组件复杂度
const CollapseContent: React.FC<{ components: { nodeId: string | number; componentName: string; issues: string[] }[] }> = ({ components }) => {
                        // ✅ 缓存子 items，避免重复生成
    const collapseChildrenItems = useMemo(() => {
        return components.map((comp) => ({
                                    key: `comp-${comp.nodeId}`,
                                    label: <span style={{ fontSize: 16 }}>{comp.componentName}</span>,
                                    children: (
                                        <ol style={{ paddingLeft: 24, margin: 0 }}>
                                            {comp.issues.map((issue, i) => (
                                                <li key={i} style={{ fontSize: 16, margin: '8px 0' }}>
                                                    {issue}
                                                </li>
                                            ))}
                                        </ol>
                                    ),
        }));
    }, [components]);

    // ✅ 缓存 items 配置，避免每次渲染重新生成
    const collapseItems = useMemo(() => {
        return [
            {
                key: '1',
                label: <span style={{ fontSize: 16 }}>组件节点</span>,
                children: (
                    <Collapse
                        ghost
                        defaultActiveKey={components.map((c) => `comp-${c.nodeId}`)}
                        items={collapseChildrenItems}
                    />
                ),
            },
        ];
    }, [components, collapseChildrenItems]);

    return <Collapse ghost defaultActiveKey={['1']} items={collapseItems} />;
};

// 日志级别类型
type LogLevel = 'log' | 'warn' | 'error' | 'info';

// 日志项接口
interface LogItem {
    level: LogLevel;
    message: string;
    timestamp?: string;
    stack?: string;
}

// 日志Tab内容组件
const LogTabContent: React.FC<{ logs: any[]; onClearLogs: () => void }> = ({ logs, onClearLogs }) => {
    const [filterLevel, setFilterLevel] = useState<LogLevel | 'all'>('all');
    const [searchText, setSearchText] = useState('');

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

                return messageMatch || logMatch;
            });
        }

        // 过滤掉没有有效内容的日志
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
        if (log === undefined || log === null) {
            return null;
        }

        if (typeof log === 'string') {
            const trimmed = log.trim();
            if (trimmed === '' || trimmed === '{}') {
                return null;
            }
            return log;
        }

        if (Array.isArray(log)) {
            const lines: string[] = [];
            log.forEach((item) => {
                if (typeof item === 'string') {
                    lines.push(item);
                } else if (item instanceof Error) {
                    if (item.message) {
                        lines.push(item.message);
                    }
                    if (item.stack) {
                        lines.push(item.stack);
                    }
                } else if (typeof item === 'object' && item !== null) {
                    if (item.componentStack) {
                        lines.push(item.componentStack);
                    } else {
                        try {
                            const jsonStr = JSON.stringify(item, null, 2);
                            if (jsonStr !== '{}' && jsonStr !== '[]') {
                                lines.push(jsonStr);
                            }
                        } catch (e) {
                            lines.push(String(item));
                        }
                    }
                } else {
                    lines.push(String(item));
                }
            });
            return lines.join('\n');
        }

        if (typeof log === 'object' && log !== null) {
            try {
                const jsonStr = JSON.stringify(log, null, 2);
                if (jsonStr !== '{}' && jsonStr !== '[]') {
                    return jsonStr;
                }
            } catch (e) {
                const str = String(log);
                if (str !== '' && str !== '[object Object]') {
                    return str;
                }
            }
            return null;
        }

        return String(log);
    };

    // 获取日志统计信息
    const logStats = useMemo(() => {
        let log = 0;
        let info = 0;
        let warn = 0;
        let error = 0;

        logs.forEach((item) => {
            const hasMessage = item.message !== undefined && item.message !== null && item.message !== '';
            const hasStack = item.stack !== undefined && item.stack !== null && item.stack !== '';
            if (!hasMessage && !hasStack) {
                return;
            }

            const level = item.level;
            if (level === 'log') log++;
            else if (level === 'info') info++;
            else if (level === 'warn') warn++;
            else if (level === 'error') error++;
        });

        return { total: log + info + warn + error, log, info, warn, error };
    }, [logs]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '700px', overflow: 'hidden' }}>
            {/* 过滤器 */}
            <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                <Select
                    value={filterLevel}
                    onChange={setFilterLevel}
                    style={{ width: 110, height: 32 }}
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
                    style={{ width: 200, height: 32 }}
                />
                <Button onClick={onClearLogs} style={{ height: 32 }}>
                    全部清除
                </Button>
            </div>

            {/* 日志列表 */}
            <div style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
                {filteredLogs.length === 0 ? (
                    <Empty description="暂无日志数据" />
                ) : (
                    filteredLogs.map((log, index) => {
                        const level = log.level || 'log';
                        const config = getLevelConfig(level);
                        const formattedContent = formatLogContent(log.message || log);
                        const isEmptyLog = formattedContent === null;

                        if (isEmptyLog && !log.stack) {
                            return null;
                        }

                        return (
                            <div key={index} style={{
                                borderLeft: `3px solid ${config.color}`,
                                padding: '8px 12px',
                                marginBottom: 15,
                                background: '#fafafa',
                                borderRadius: '0 4px 4px 0'
                            }}>
                                {!isEmptyLog && (
                                    <div style={{ marginBottom: 4 }}>
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
                                            <span style={{ marginLeft: 8, color: '#999', fontSize: 12 }}>{log.timestamp}</span>
                                        )}
                                    </div>
                                )}
                                {!isEmptyLog && (
                                    <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: 13 }}>
                                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{formattedContent}</pre>
                                    </div>
                                )}
                                {log.stack && (
                                    <details style={{ marginTop: 4 }}>
                                        <summary style={{ cursor: 'pointer', color: '#0085d0' }}>调用栈详情</summary>
                                        <pre style={{ margin: '4px 0 0 0', fontSize: 12, color: '#fff', background: '#000' }}>{log.stack || '无调用栈详情信息'}</pre>
                                    </details>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

const BottomTools: React.FC<ParentProps> = ({ onTriggerPage2Method, previewFun }) => {
    const { pageStore, pageType, mode, modalWidth, setModalWidth, modalLeft, setModalLeft } = useAppContext();
    const { Text, Title } = Typography;
    const { Panel } = Collapse;
    const pageStoreState = pageStore((state: any) => state);
    const baseInfo = pageStoreState?.config;
    const setZoomRatio = pageStoreState?.setZoomRatio;
    const nodeModelOpenType = pageStoreState?.nodeModelOpenType;
    const nodeModeTop = pageStoreState?.nodeModeTop;
    const nodeModeLeft = pageStoreState?.nodeModeLeft;
    const setNodeModelState = pageStoreState?.setNodeModelState;
    // 撤销恢复历史记录
    const setSelectedElement = pageStore((state: any) => state.setSelectedElement);
    const config = pageStore(useShallow((state: any) => state.config));
    const [historyModalVisible, setHistoryModalVisible] = useState(false);
    const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number | null>(null);
    const historyStack = pageStore((state: any) => state.historyStack);
    const redoStack = pageStore((state: any) => state.redoStack);
    const processHistoryStack = pageStore((state: any) => state.processHistoryStack);
    const processRedoStack = pageStore((state: any) => state.processRedoStack);
    const undo = pageStore((state: any) => state.undo);
    const redo = pageStore((state: any) => state.redo);
    const undoProcess = pageStore((state: any) => state.undoProcess);
    const redoProcess = pageStore((state: any) => state.redoProcess);
    const currentHistoryStack = config.sceneType === 'process' ? processHistoryStack : historyStack;
    const currentRedoStack = config.sceneType === 'process' ? processRedoStack : redoStack;
    // 控制弹窗显隐
    const [isModalOpen, setIsModalOpen] = useState(false);
    // ✅ 新增：延迟渲染 Collapse，避免 Modal 打开时同步渲染复杂内容
    const [renderCollapse, setRenderCollapse] = useState(false);
    // 弹窗高度
    const [modalHeight, setModalHeight] = useState(220);
    // 拖拽相关 - 使用ref避免重渲染
    const dragRef = useRef({ isDragging: false, startY: 0, startHeight: 220 });

    // 日志数据
    const [capturedLogs, setCapturedLogs] = useState<any[]>([]);
    const [processData, setProcessData] = useState<MethodResult>({
        type: '',
        componentList: [],
        noLineNodeList: [],
        noLineEndList: [],
    });

    // ✅ 精准缓存数据解析逻辑，依赖项仅 processData
    const validationData = useMemo(() => {
        const allComponentsMap = new Map<string | number, string>();
        const safeAA = processData.noLineEndList ?? []; // 若AA为undefined/null，取空数组
        const safeBB = processData.noLineNodeList ?? []; // 若BB为undefined/null，取空数组
        [...safeAA, ...safeBB].forEach((item) => {
            allComponentsMap.set(item.nodeId, item.componentData.componentName);
        });

        const components = Array.from(allComponentsMap.entries()).map(([nodeId, componentName]) => {
            const issues: string[] = [];
            if (processData.noLineEndList.some((item: any) => item.nodeId === nodeId)) {
                issues.push('未连接结束节点');
            }
            if (processData.noLineNodeList.some((item: any) => item.nodeId === nodeId)) {
                issues.push('未建立父子节点关系');
            }
            return { nodeId, componentName, issues };
        });

        const total = components.reduce((sum, item) => sum + item.issues.length, 0);
        const componentCount = components.length;

        return {
            total,
            tip: `涉及${componentCount}个组件节点，请完善！`,
            components,
        };
    }, [processData]);

    // ✅ 缓存事件处理函数，避免每次渲染生成新函数
    const handleOpenModal = useCallback(() => {
        // 优先使用id="designer"元素，如果不存在或隐藏则使用class="designerBox"元素
        let targetElement = document.getElementById('designer');
        if (!targetElement || targetElement.offsetWidth === 0) {
            targetElement = document.querySelector('.designerBox') as HTMLElement;
        }
        if (targetElement) {
            const rect = targetElement.getBoundingClientRect();
            setModalWidth(targetElement.offsetWidth);
            setModalLeft(rect.left);
        }
        setIsModalOpen(true);
        // ✅ 延迟 50ms 渲染 Collapse，给 Modal 打开动画留时间
        const timer = setTimeout(() => {
            setRenderCollapse(true);
        }, 50);
        return () => clearTimeout(timer); // 清理定时器
    }, [setModalWidth, setModalLeft]);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setRenderCollapse(false); // 关闭时重置，避免下次打开重复渲染
    }, []);

    // ✅ 监听 Modal 关闭，清理状态
    useEffect(() => {
        return () => {
            setRenderCollapse(false);
        };
    }, []);

    // 拖拽处理函数
    const handleDragStart = (e: React.MouseEvent) => {
        dragRef.current = {
            isDragging: true,
            startY: e.clientY,
            startHeight: modalHeight
        };
    };

    const handleDragMove = (e: MouseEvent) => {
        if (!dragRef.current.isDragging) return;
        const deltaY = dragRef.current.startY - e.clientY;
        const newHeight = Math.max(100, Math.min(800, dragRef.current.startHeight + deltaY));
        setModalHeight(newHeight);
    };

    const handleDragEnd = () => {
        dragRef.current.isDragging = false;
    };

    // 监听拖拽事件
    useEffect(() => {
        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
        return () => {
            document.removeEventListener('mousemove', handleDragMove);
            document.removeEventListener('mouseup', handleDragEnd);
        };
    }, []);

    const openNodeModel = () => {
        const designerBox = document.querySelector('.designerBox') as HTMLElement;
        if (designerBox) {
            const top = `${designerBox.clientHeight - 442 - 94}px`;
            const left = `${(designerBox.clientWidth - 440) / 2}px`;
            setNodeModelState(true, 'click', '0px', left);
        }
    };
    const sceneType = baseInfo.sceneType; // 画布类型
    const appCategory = baseInfo.appCategory; // 应用类型
    // 用于左侧显隐的标识
    const setComponentState = componentModel((state: any) => state.setComponentState);

    // 画布下拉框缩放比例选项
    const [scaleSelectOption, setScaleSelectOption] = useState<OptionItem[]>([
        { value: 'reduce', label: '缩小', id: 'reduce' },
        { value: 'add', label: '放大', id: 'add' },
        { value: '50', label: '缩放到50%', id: '50' },
        { value: '100', label: '缩放到100%', id: '100' },
        { value: '150', label: '缩放到150%', id: '150' },
        { value: '200', label: '缩放到200%', id: '200' },
    ]);
    // 用于监听关闭缩放选项弹出内容
    const scaleSelectContainerRef = useRef<HTMLDivElement>(null);
    // 缩放选项框显隐标识
    const [scaleSelectFlag, setScaleSelectFlag] = useState<string>('0');
    // 画布缩放比例
    const [scaleNumber, setScaleNumber] = useState<string>('100%');
    // 打开缩放选项弹出内容
    const scaleSelectShow = () => {
        setScaleSelectFlag('1');
    };
    // 隐藏缩放选项弹出内容
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (scaleSelectContainerRef.current && !scaleSelectContainerRef.current.contains(event.target as Node)) {
                setScaleSelectFlag('0');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // 点击缩放选项
    const scaleClick = (item: OptionItem) => {
        let curScale = parseInt(scaleNumber.replace('%', '')); // 获取画布当前缩放数值
        const mode = item.value;
        if (mode == 'reduce') {
            curScale -= 10;
        } else if (mode == 'add') {
            curScale += 10;
        } else {
            curScale = parseInt(mode);
        }
        if (curScale < 10) {
            curScale = 10;
        } else if (curScale > 200) {
            curScale = 200;
        }
        setScaleNumber(curScale.toString() + '%');
        // 调用画布缩放方法
        scaleSelectChange(curScale);
    };

    // 画布缩放选项
    const randerScaleOption = (option: OptionItem[]) => {
        return option.map((item: OptionItem) => {
            return (
                <div
                    className={styles.scaleBtn}
                    key={item.value}
                    onClick={() => {
                        scaleClick(item);
                    }}
                >
                    {item.label}
                </div>
            );
        });
    };

    // 画布缩放
    const scaleSelectChange = (curScale: number) => {
        setZoomRatio(curScale / 100);
    };

    // 全屏标识 false 非全屏 true全屏
    const fullScreenState = menu((state: any) => state.fullScreenState);
    const setFullScreenState = menu((state: any) => state.setFullScreenState);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const prevMenuStateRef = useRef<boolean>(true);

    // 左侧菜单栏状态
    const changeMenuState = menu((state) => state.changeMenuState);
    const menuState = menu((state) => state.menuState);
    // 进入全屏事件处理
    const enterFullScreen = async () => {
        prevMenuStateRef.current = menuState;
        changeMenuState(false);
        try {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            } else if ((document.documentElement as any).webkitRequestFullscreen) {
                await (document.documentElement as any).webkitRequestFullscreen();
            } else if ((document.documentElement as any).msRequestFullscreen) {
                await (document.documentElement as any).msRequestFullscreen();
            }
        } catch (err) {
            // 静默处理权限策略禁止全屏的情况
            console.log('Fullscreen blocked by permissions policy:', err);
        }
        setFullScreenState(true);
        // 左侧元素面板默认保持全屏前的现状
        // setComponentState(false);
    };
    // 退出全屏
    const outFullScreen = async () => {
        try {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            } else if ((document as any).webkitExitFullscreen) {
                await (document as any).webkitExitFullscreen();
            } else if ((document as any).msExitFullscreen) {
                await (document as any).msExitFullscreen();
            }
        } catch (e) {
            // 静默处理
        }
        setFullScreenState(false);
        changeMenuState(prevMenuStateRef.current);
        // setComponentState(true);
    };
    // 监听全屏状态变化
    useEffect(() => {
        const handleFullScreenChange = () => {
            const isFullScreen = document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).msFullscreenElement;
            if (!isFullScreen && fullScreenState) {
                setFullScreenState(false);
                changeMenuState(prevMenuStateRef.current);
                setComponentState(true);
            }
        };
        document.addEventListener('fullscreenchange', handleFullScreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
        document.addEventListener('msfullscreenchange', handleFullScreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
            document.removeEventListener('msfullscreenchange', handleFullScreenChange);
        };
    }, [fullScreenState]);
    // 页面关闭，清理状态
    useEffect(() => {
        return () => {
            outFullScreen();
        };
    }, []);
    // 初始化全屏点击工具
    const randerFullScreenTool = (fullScreenState: boolean) => {
        if (fullScreenState) {
            return (
                <>
                    <div
                        className={[styles.imgBtn, styles.outFullPageBtn].join(' ')}
                        onClick={() => {
                            outFullScreen();
                        }}
                        title="退出全屏"
                    ></div>
                    <span title="退出全屏" className={styles.fullScreenText} onClick={() => {
                        outFullScreen();
                    }}> 退出全屏</span>
                </>
            );
        } else {
            return (
                <>
                    <div
                        className={[styles.imgBtn, styles.fullPageBtn, styles.defaultNoneBlock].join(' ')}
                        onClick={() => {
                            enterFullScreen();
                        }}
                        title="全屏"
                    ></div>
                    <span title="全屏" className={styles.fullScreenText} onClick={() => {
                        enterFullScreen();
                    }}> 全屏</span>
                </>
            );
        }
    };

    // 输入框搜索标识
    const [isFocused, setIsFocused] = useState<boolean>(false);
    // 输入框输入的值
    const [searchValue, setSearchValue] = useState('');
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                if (searchValue === '') {
                    setIsFocused(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [searchValue]);

    // 搜索图标点击
    const searchIconClick = () => {
        setIsFocused(true);
    };
    // 输入框值改变
    const searchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
    };
    const searchInputBlur = () => {
        if (!searchValue) {
            setIsFocused(false);
        }
    };

    // 搜索结果点击
    const searchNodeClick = (searchNode: any) => {
        // 调用画布组件定位方法
    };

    // 输入框搜索结果
    const randerSearchResult = (searchText: string) => {
        // 获取搜索到的节点
        const searchNodeResult: any[] = [];
        // 展示节点
        if (searchNodeResult.length > 0) {
            return searchNodeResult.map((searchNode, index) => {
                const resultText = searchNode.componentData.componentName;
                return (
                    <div
                        className={styles.searchResultNode}
                        key={index}
                        onClick={() => {
                            searchNodeClick(searchNode);
                        }}
                    >
                        {
                            <TextHighlighter
                                text={resultText}
                                keywords={searchText}
                                highlightStyle={{
                                    color: '#0085d0', // 关键字高亮的样式
                                }}
                            />
                        }
                    </div>
                );
            });
        } else {
            return <div className={styles.noSearchDatda}>无搜索结果</div>;
        }
    };

    const errorCheckClick = () => {
        // 获取日志数据
        const targetPath = '/ngap/index.html';
        let allLogs: any[] = [];

        try {
            const currentUrl = window.location.href;
            if (currentUrl.includes(targetPath)) {
                const currentWindow = window as any;
                if (currentWindow.capturedLogs && Array.isArray(currentWindow.capturedLogs)) {
                    allLogs = [...currentWindow.capturedLogs];
                }
            }

            const iframes = document.querySelectorAll('iframe');
            for (const iframe of iframes) {
                try {
                    const iframeElement = iframe as HTMLIFrameElement;
                    const iframeWindow = iframeElement.contentWindow;
                    if (!iframeWindow) {
                        continue;
                    }
                    const iframeSrc = iframeElement.src || '';
                    if (iframeSrc.includes(targetPath)) {
                        if (iframeWindow.capturedLogs && Array.isArray(iframeWindow.capturedLogs)) {
                            allLogs = [...allLogs, ...iframeWindow.capturedLogs];
                        }
                    }
                } catch (e) {
                    continue;
                }
            }
        } catch (error) {
            console.error('获取日志失败:', error);
        }

        setCapturedLogs(allLogs);

        // 执行全局校验
        const processData: MethodResult = onTriggerPage2Method();
        if (processData) {
            setProcessData(processData);
            console.log('processData', processData);
            if (!processData || processData?.type === 'error') {
                handleOpenModal();
                return false;
                        }
            if (!processData.componentList || processData.componentList.length <= 0) {
                message.error('请配置组件！');
                return false;
                }
            message.success('校验通过！');
        } else {
            handleOpenModal();
            }
    };

    // 清除所有日志
    const handleClearLogs = useCallback(() => {
        // 清除当前窗口的日志
        const currentWindow = window as any;
        if (currentWindow.capturedLogs) {
            currentWindow.capturedLogs = [];
        }
        // 清除 iframe 中的日志
        const iframes = document.querySelectorAll('iframe');
        for (const iframe of iframes) {
            try {
                const iframeElement = iframe as HTMLIFrameElement;
                const iframeWindow = iframeElement.contentWindow;
                if (iframeWindow && iframeWindow.capturedLogs) {
                    iframeWindow.capturedLogs = [];
                }
            } catch (e) {
                // 跨域错误，忽略
                continue;
            }
        }
        // 清除本地状态
        setCapturedLogs([]);
    }, []);

    const testRunClick = () => { };

    // canvasWidth key到label的映射
    const canvasWidthMap: Record<string, string> = {
        '-1': '标准页面-自适应',
        '220': '伴随区卡片-220px',
        '480': '负一屏卡片-480px',
    };
    const canvasWidth = pageStore((state: any) => state.canvasWidth);
    const canvasWidthKey = pageStore((state: any) => state.canvasWidthKey);
    //切换画布大小
    const handleCanvasWidth = (label: string, val: string) => {
        pageStore.getState().setCanvasWidth(label);
        pageStore.getState().setCanvasWidthKey(val);
    };
    useEffect(() => {
        if (config.canvasWidth) {
            const key = String(config.canvasWidth);
            const label = canvasWidthMap[key];
            if (label) {
                pageStore.getState().setCanvasWidth(label);
                pageStore.getState().setCanvasWidthKey(key);
            }
        }
    }, [config.id]);

    return (
        <div className={`${styles.canvasToolsDiv} canvasToolsDivBox`}>
            {/* 判断只有应用画布才有底部内容 */}
            {pageType == 'YYBPZPS' && mode == 'edit' && (
                <>
                    <div className={styles.toolOptions}>
                        {/* 缩放功能 */}
                        <div
                            className={styles.scaleSelectDiv}
                            onClick={() => {
                                scaleSelectShow();
                            }}
                            ref={scaleSelectContainerRef}
                        >
                            <span className={styles.scaleNumber}>{scaleNumber}</span>
                            <div className={styles.downIcon}></div>

                            {scaleSelectFlag === '1' ? (
                                <div className={styles.scaleSelectOptionDiv}>{randerScaleOption(scaleSelectOption)}</div>
                            ) : (
                                <></>
                            )}
                        </div>
                        {/* 全屏工具 */}
                        <>{randerFullScreenTool(fullScreenState)}</>
                        {/* {sceneType === 'base' ? (
                            <div className={[styles.imgBtn, styles.disableFullPageBtn, styles.defaultNoneBlock].join(' ')}></div>
                        ) : (
                            <>{randerFullScreenTool(fullScreenState)}</>
                        )} */}

                        <div className={styles.splitLine}></div>
                        {/* 撤销恢复历史记录 */}
                        <Tooltip title="撤销">
                            <Button
                                type='text'
                                icon={
                                    ((config.sceneType === 'process' && processHistoryStack.length < 2) ||
                                    (config.sceneType === 'base' && historyStack.length < 2)) ? 
                                    <img src={new URL(`./imgs/undoD.png`, import.meta.url).href} alt="" /> : 
                                    <img src={new URL(`./imgs/undo.png`, import.meta.url).href} alt="" />}
                                onClick={(e) => {
                                    e.currentTarget.blur();
                                    if (config.sceneType === 'process') {
                                        undoProcess?.();
                                    } else {
                                        setSelectedElement(undefined);
                                        undo();
                                    }
                                }}
                                disabled={config.sceneType === 'process' ? processHistoryStack.length < 2 : historyStack.length < 2}
                            />
                        </Tooltip>
                        <Tooltip title="恢复">
                            <Button
                                type='text'
                                icon={
                                    ((config.sceneType === 'process' && processRedoStack.length === 0) ||
                                    (config.sceneType === 'base' && redoStack.length === 0)) ? 
                                    <img src={new URL(`./imgs/redoD.png`, import.meta.url).href} alt="" /> : 
                                    <img src={new URL(`./imgs/redo.png`, import.meta.url).href} alt="" />}
                                onClick={(e) => {
                                    e.currentTarget.blur();
                                    if (config.sceneType === 'process') {
                                        redoProcess?.();
                                    } else {
                                        setSelectedElement(undefined);
                                        redo();
                                    }
                                }}
                                disabled={config.sceneType === 'process' ? processRedoStack.length === 0 : redoStack.length === 0}
                            />
                        </Tooltip>
                        <Tooltip title="历史记录">
                            <Button
                                type='text'
                                icon={<HistoryOutlined />}
                                style={{ marginRight: '10px' }}
                                onClick={(e) => {
                                    e.currentTarget.blur();
                                    if (config.sceneType !== 'process') {
                                        setSelectedElement(undefined);
                                    }
                                    setHistoryModalVisible(true);
                                    setSelectedHistoryIndex(currentHistoryStack.length - 1);
                                }}
                            />
                        </Tooltip>


                        {/* 搜索工具 */}
                        {sceneType === 'base' ? (
                            <div className={[styles.imgBtn, styles.disableSearchNodeBtn, styles.defaultNoneBlock].join(' ')}> </div>
                        ) : (
                            <>
                                {isFocused ? (
                                    <div className={[styles.searchNodeBtn, styles.defaultNoneBlock].join(' ')} ref={searchContainerRef}>
                                        <Input
                                            prefix={<div className={styles.searchIptIcon}></div>}
                                            className={styles.searchNodeNameInput}
                                            value={searchValue}
                                            onChange={searchInputChange}
                                            onBlur={searchInputBlur}
                                        />
                                        {searchValue !== '' ? (
                                            <div className={styles.searchNodeResultDiv}>{randerSearchResult(searchValue)}</div>
                                        ) : (
                                            <></>
                                        )}
                                    </div>
                                ) : (
                                    <div className={styles.searchIptIcon} onClick={searchIconClick}></div>
                                )}
                            </>
                        )}

                        <div className={styles.splitLine}></div>

                        {/* 辅助视图画布工具 */}
                        {config.showArea === '2' && config.sceneType === 'base' && (
                            <>
                                <Tooltip title="标准页面，按照全屏展示的方式，适配所有页面；伴随区卡片适配在伴随区展示；负一屏卡片适配在负一屏区域展示">
                                    <QuestionCircleOutlined style={{ marginRight: '3px', fontSize: '14px' }} />
                                </Tooltip>
                                <Dropdown
                                    menu={
                                        {
                                            items: [
                                                { key: '-1', label: '标准页面-自适应', onClick: () => handleCanvasWidth('标准页面-自适应', '-1') },
                                                { key: '220', label: '伴随区卡片-220px', onClick: () => handleCanvasWidth('伴随区卡片-220px', '220') },
                                                { key: '480', label: '负一屏卡片-480px', onClick: () => handleCanvasWidth('负一屏卡片-480px', '480') },
                                            ],
                                            selectedKeys: [canvasWidthKey],
                                        } as any
                                    }
                                    trigger={['click']}
                                    disabled={config.firstUpTime}
                                >
                                    <span
                                        style={{
                                            cursor: config.firstUpTime ? 'not-allowed' : 'pointer',
                                            color: config.firstUpTime ? '#96909c' : '#000',
                                            fontSize: '14px',
                                        }}
                                    >
                                        {canvasWidth}
                                        <DownOutlined style={{ marginLeft: '4px' }} />
                                    </span>
                                </Dropdown>

                                <div className={styles.splitLine}></div>
                            </>
                        )}

                        <div className={styles.addNodeCont}>
                            <div
                                className={styles.addNodeBtn}
                                onClick={() => {
                                    openNodeModel();
                                }}
                            >
                                <PlusOutlined style={{ marginRight: '3px', fontSize: '14px', color: '#90C31F' }} />选择组件
                            </div>
                        </div>
                        <div className={styles.splitLine}></div>
                    </div>
                    <div className={styles.toolsTesting}>
                        <div onClick={()=>{previewFun('preview')}} className={styles.verifyCheckBtn}>
                            <div className={styles.preview_icon}><EyeOutlined /></div>
                            <span>预览</span>
                        </div>
                        <div onClick={errorCheckClick} className={styles.verifyCheckBtn} title="调测详细信息">
                            <div className={styles.testing_icon}></div>
                            <span>调测</span>
                            <span className={styles.checkErrorNumPoint}>{validationData.total > 0 ? validationData.total : ''}</span>
                        </div>
                        {/* <div onClick={testRunClick} className={styles.testRunBtn}>
                            <div className={styles.run_icon}></div>
                            <span>运行</span>
                        </div> */}
                        <div className={styles.errorCheckPage}></div>
                                </div>
                </>
            )}
            {/* 全局校验弹窗 - 包含日志和全局校验两个tab */}
            {/* 自定义弹窗 - 不使用antd Modal，避免遮挡下方元素 */}
            {pageType == 'YYBPZPS' && isModalOpen && (
                <div
                    className={styles.customModal}
                    style={{
                        position: 'fixed',
                        bottom: 10,
                        left: modalLeft,
                        width: modalWidth,
                        height: modalHeight,
                        background: '#fff',
                        boxShadow: '0 -2px 8px rgba(0,0,0,0.15)',
                        zIndex: 1050,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    {/* 拖拽手柄 */}
                    <div
                        onMouseDown={handleDragStart}
                        style={{
                            height: 8,
                            cursor: 'ns-resize',
                            background: '#f0f0f0',
                            borderTop: '1px solid #e8e8e8',
                            borderBottom: '1px solid #e8e8e8',
                            marginBottom: 8
                        }}
                    />
                    {/* Tab内容 */}
                    <div style={{ padding: '16px 24px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <Tabs
                                type="card"
                                defaultActiveKey="validation"
                                tabBarExtraContent={
                                    <span
                                        onClick={handleCloseModal}
                                        style={{ fontSize: 14, cursor: 'pointer', padding: '4px 8px', marginLeft: 16 }}
                        >
                                        ✕
                                    </span>
                                }
                                items={[
                                    {
                                        key: 'logs',
                                        label: (
                                            <span>
                                                调试日志
                                                {capturedLogs.length > 0 && (
                                                    <span style={{ color: 'red', marginLeft: 4 }}>({capturedLogs.length})</span>
                                                )}
                                            </span>
                                        ),
                                        children: (
                                            <LogTabContent
                                                logs={capturedLogs}
                                                onClearLogs={handleClearLogs}
                                            />
                                        )
                                    },
                                    {
                                        key: 'validation',
                                        label: (
                                            <span>
                                                错误
                                                {validationData.total > 0 && (
                                                    <span style={{ color: 'red', marginLeft: 4 }}>({validationData.total})</span>
                                                )}
                                            </span>
                                        ),
                                        children: (
                                            <div style={{ flex: 1, overflow: 'auto' }}>
                            <Text type="danger" style={{ fontSize: 16, marginBottom: 16, display: 'block' }}>
                                提示：{validationData.tip}
                            </Text>
                            {renderCollapse && <CollapseContent components={validationData.components} />}
                                            </div>
                                        )
                                    }
                                ]}
                        />
                    </div>
                    </div>
                </div>
            )}

            {/* 历史记录弹窗 */}
            <HistoryModal
                visible={historyModalVisible}
                historyStack={baseInfo.sceneType === 'process' ? processHistoryStack : historyStack}
                selectedHistoryIndex={selectedHistoryIndex}
                onClose={() => {
                    setHistoryModalVisible(false);
                    setSelectedHistoryIndex(null);
                }}
                onRestore={(index) => {
                    if (baseInfo.sceneType === 'process') {
                        const targetStack = processHistoryStack;
                        if (index !== targetStack.length - 1) {
                            const diff = targetStack.length - 1 - index;
                            for (let i = 0; i < diff; i++) {
                                undoProcess?.();
                            }
                        }
                    } else {
                        if (index !== historyStack.length - 1) {
                            const diff = historyStack.length - 1 - index;
                            for (let i = 0; i < diff; i++) {
                                undo();
                            }
                        }
                    }
                }}
                onSelect={(index) => setSelectedHistoryIndex(index)}
            />
        </div>
    );
};

export default BottomTools;
