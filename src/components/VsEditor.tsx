import { isNotEmpty } from './../packages/utils/util';
import Editor, { loader, useMonaco } from '@monaco-editor/react';
import { useEffect, useRef } from 'react';
/**
 * 封装vscode编辑器
 */

export default function VsEditor({ height, language, value, onChange }: any) {
    const monaco = useMonaco();
    const editorRef = useRef<any>(null);
    useEffect(() => {
        let completionProvider: any = null;
        
        if (monaco) {
            completionProvider = monaco.languages.registerCompletionItemProvider('javascript', {
                provideCompletionItems: function (model: any, position: any) {
                    const word = model.getWordUntilPosition(position);
                    const range = {
                        startLineNumber: position.lineNumber,
                        endLineNumber: position.lineNumber,
                        startColumn: word.startColumn,
                        endColumn: word.endColumn,
                    };
                    return {
                        suggestions: createDependencyProposals(range),
                    };
                },
            });
        }
        
        return () => {
            // 清理completion provider
            if (completionProvider) {
                completionProvider.dispose();
            }
        };
    }, [monaco]);
    function createDependencyProposals(range: any) {
        if (!monaco) return [];
        // returning a static list of proposals, not even looking at the prefix (filtering is done by the Monaco editor),
        // here you could do a server side lookup
        return [
            {
                label: 'context',
                kind: monaco.languages.CompletionItemKind.Function,
                documentation: 'context是一个全局上下文变量',
                insertText: 'context',
                range: range,
            },
            {
                label: 'variable',
                kind: monaco.languages.CompletionItemKind.Function,
                documentation: 'variable是一个系统变量',
                insertText: 'variable',
                range: range,
            },
            {
                label: 'eventParams',
                kind: monaco.languages.CompletionItemKind.Function,
                documentation: 'eventParams是事件流参数',
                insertText: 'eventParams',
                range: range,
            },
        ];
    }
    // 初始化monaco，默认为jsdelivery分发，由于网络原因改为本地cdn
    loader.config({
        paths: {
            vs: '/ngap/static/monaco-editor/vs',
        },
    });
    return (
        <Editor
            height={height || '150px'}
            language={language || 'javascript'}
            theme="vs-dark" // {theme === 'dark' ? 'vs-dark' : 'vs-light'}
            value={isNotEmpty(value) ? (typeof value === 'string' ? value : JSON.stringify(value, null, 2)) : ''}
            onChange={onChange}
            onMount={(editor, monaco) => {
                editorRef.current = { editor, monaco };
                monaco.editor.setTheme('vs-dark'); // 设置深色主题
                
                // 组件卸载时的清理函数
                return () => {
                    if (editorRef.current) {
                        const { editor, monaco } = editorRef.current;
                        // 销毁编辑器实例
                        if (editor) {
                            editor.dispose();
                        }
                        // 清理monaco实例引用
                        editorRef.current = null;
                    }
                };
            }}
            options={{
                fontSize: 14, // 字体大小
                automaticLayout: true, // 自动调整布局
                wordWrap: 'on', // 换行设置，'on’表示开启，'off’表示关闭
                lineNumbers: 'on', // 显示行号（on/off）
                folding: true, // 启用代码折叠
                wrappingIndent: 'indent', // 换行后对齐方式
                autoIndent: 'advanced', // 自动缩进
                autoClosingBrackets: 'always', // 自动闭合括号
                autoClosingQuotes: 'always', // 自动闭合引号
                formatOnPaste: true, // 粘贴时自动格式化
                formatOnType: true, // 输入时自动格式化
                cursorBlinking: 'phase', // 光标闪烁方式（blink/smooth/phase/expand/solid）
                cursorStyle: 'line-thin', // 光标样式（block/block-outline/underline/line-thin/line/line-outline）
                cursorSmoothCaretAnimation: 'on', // 光标平滑移动动画（on/explicit/off）
                selectOnLineNumbers: true, // 点击行号选中整行
                mouseWheelZoom: true, // 支持Ctrl+滚轮缩放
                suggest: { showKeywords: true }, // 显示关键字建议
                quickSuggestions: true, // 快速建议提示
                parameterHints: { enabled: true }, // 启用参数提示
                minimap: {
                    enabled: true,
                },
            }}
        />
    );
}
