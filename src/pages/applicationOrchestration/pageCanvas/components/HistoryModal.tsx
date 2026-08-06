import React, { useMemo } from 'react';
import { Modal, List, Tag } from 'antd';
import { DiffEditor, loader } from '@monaco-editor/react';
import styles from './HistoryModal.module.less';

loader.config({
    paths: {
        vs: '/ngap/static/monaco-editor/vs',
    },
});

interface HistoryModalProps {
    visible: boolean;
    historyStack: any[];
    selectedHistoryIndex: number | null;
    onClose: () => void;
    onRestore: (index: number) => void;
    onSelect: (index: number) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({
    visible,
    historyStack,
    selectedHistoryIndex,
    onClose,
    onRestore,
    onSelect,
}) => {
    const selectedHistoryItem = useMemo(() => {
        if (selectedHistoryIndex === null) return null;
        return historyStack[selectedHistoryIndex];
    }, [historyStack, selectedHistoryIndex]);

    const currentHistoryItem = useMemo(() => {
        return historyStack[historyStack.length - 1];
    }, [historyStack]);

    const originalJson = useMemo(() => {
        return selectedHistoryItem ? JSON.stringify(selectedHistoryItem, null, 2) : '';
    }, [selectedHistoryItem]);

    const modifiedJson = useMemo(() => {
        return currentHistoryItem ? JSON.stringify(currentHistoryItem, null, 2) : '';
    }, [currentHistoryItem]);

    const historyListData = useMemo(() => {
        return historyStack.map((item: any, index: number) => ({
            key: index,
            title: `本地记录`,
            description: `${item.description || ''} 索引：${index} ${item.elements ? '| 组件数量：' + item.elements.length : ''}`,
            isCurrent: index === historyStack.length - 1,
            isSelected: selectedHistoryIndex === index,
            type: item.type,
        })).reverse();
    }, [historyStack, selectedHistoryIndex]);

    return (
        <Modal
            title="历史记录"
            open={visible}
            onCancel={onClose}
            onOk={() => selectedHistoryIndex !== null && onRestore(selectedHistoryIndex)}
            width={1200}
            okText="恢复至此"
            cancelText="关闭"
            destroyOnClose
            maskClosable={false}
            keyboard={false}
        >
            <div className={styles.container}>
                <div className={styles.diffPanel}>
                    <DiffEditor
                        original={originalJson}
                        modified={modifiedJson}
                        language="json"
                        theme="vs-dark"
                        height="100%"
                        options={{
                            readOnly: true,
                            renderSideBySide: true,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            lineNumbers: 'on',
                            glyphMargin: false,
                            folding: true,
                            renderLineHighlight: 'none',
                            wordWrap: 'on',
                            automaticLayout: true,
                            fontSize: 13,
                            scrollbar: {
                                vertical: 'visible',
                                horizontal: 'auto',
                                useShadows: false,
                                verticalScrollbarSize: 10,
                                horizontalScrollbarSize: 10,
                            },
                            renderOverviewRuler: true,
                        }}
                    />
                </div>

                <div className={styles.rightPanel}>
                    <div className={styles.versionList}>
                        <List
                            size="small"
                            dataSource={historyListData}
                            renderItem={(item: any) => (
                                <List.Item
                                    className={`${styles.versionItem} ${item.isSelected ? styles.selected : ''} ${item.isCurrent ? styles.current : ''}`}
                                    onClick={() => onSelect(item.key)}
                                >
                                    <List.Item.Meta
                                        title={
                                            <span className={styles.versionTitle}>
                                                {item.title}
                                                {item.isCurrent && <Tag color="green" className={styles.currentTag}>当前</Tag>}
                                            </span>
                                        }
                                        description={item.description}
                                    />
                                </List.Item>
                            )}
                            className={styles.versionListContent}
                        />
                    </div>

                    <div className={styles.helpPanel}>
                        <div className={styles.helpTitle}>使用说明</div>
                        <ul className={styles.helpList}>
                            <li>点击历史记录可以预览并选择恢复到哪个版本</li>
                            <li>当前状态会以高亮显示</li>
                            <li>使用 Ctrl+Z / Ctrl+Y 快捷键进行撤销/恢复</li>
                            <li>历史记录会自动保存，最多保存20条</li>
                        </ul>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default HistoryModal;
