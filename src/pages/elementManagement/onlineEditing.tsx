import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'antd';
import { message } from '@/utils/AntdGlobal';
import VsEditor from '@/components/VsEditor';
import { objectToFormData } from '@/utils/objectToFormData'; // 对象转 FormData 工具函数
import request from '@/utils/request';
import styles from './index.module.less';
import JSZip from 'jszip';

interface EditorFile {
    id: string;
    name: string;
    content: string;
    language: string;
}

// 定义组件props接口
interface DetailProps {
    elementInfos: any;
    detailFiles: EditorFile[];
    cancel?: () => void;
    saveCode?: (values: EditorFile[]) => void;
}

const ElementDetailPage: React.FC<DetailProps> = ({ elementInfos, detailFiles, cancel, saveCode }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<EditorFile[]>([]);
    const [activeFileId, setActiveFileId] = useState<string | null>(null);
    const [activeFile, setActiveFile] = useState<EditorFile>();

    useEffect(() => {
        if (detailFiles.length === 3) {
            setFiles(detailFiles);
            setActiveFileId(detailFiles[0].id);
        }
    }, [detailFiles]);

    useEffect(() => {
        if (elementInfos?.elementJsDemo) {
            // fetchFileStream(elementInfos.elementJsDemo);
            // fetchAndCreateFile(elementInfos.elementJsDemo, '');
        }
    }, [elementInfos.elementJsDemo]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFiles = e.target.files;
        if (!uploadedFiles) return;
        // File类型转化为content
        Array.from(uploadedFiles).forEach((file) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result as string;
                const language = file.name.split('.').pop() || 'javascript';
                if (language === 'zip') {
                    fetchAndProcessRar(file);
                } else {
                    // 添加到文档列表
                    setFiles((prev) => [
                        ...prev,
                        {
                            id: (Date.now() + Math.random()).toString(),
                            name: file.name,
                            content,
                            language: getLanguageByExtension(language),
                        },
                    ]);
                }
            };
            reader.readAsText(file);
        });
    };

    // 文件类型映射
    const getLanguageByExtension = (ext: string) => {
        switch (ext) {
            case 'tsx':
                return 'typescript';
            case 'ts':
                return 'typescript';
            case 'js':
                return 'javascript';
            case 'less':
                return 'less';
            default:
                return 'text';
        }
    };

    const handleContentChange = (value: string) => {
        setFiles((prev) => prev.map((file) => (file.id === activeFileId ? { ...file, content: value } : file)));
    };

    useEffect(() => {
        setActiveFile(files.find((f) => f.id === activeFileId));
    }, [activeFileId]);

    // 源文件获取文件流
    const fetchFileStream = (url: string) => {
        try {
            const params = {
                url: url,
            };
            request
                .post('/csf/call/getFileFromOss', objectToFormData(params))
                .then((res) => {
                    console.log(res);
                    const language = elementInfos?.elementJsDemo.split('.').pop() || 'javascript';
                    // 添加到文档列表
                    setFiles((prev) => [
                        ...prev,
                        {
                            id: (Date.now() + Math.random()).toString(),
                            name: elementInfos?.elementJsDemo.split('/').pop() || '',
                            content: res.bean.demo,
                            language: getLanguageByExtension(language),
                        },
                    ]);
                    // fetchAndProcessRar(res.bean);
                })
                .catch((err) => {});
        } catch (error) {
            return null;
        }
    };

    const fetchAndCreateFile = async (url: string, fileName: string) => {
        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const blob = await response.blob();

            // 创建标准 File 对象
            const file = new File([blob], fileName || getFileNameFromUrl(url), {
                type: blob.type,
                lastModified: Date.now(),
            });

            return file;
        } catch (error) {
            console.error('获取文件失败:', error);
            return null;
        }
    };

    const getFileNameFromUrl = (url: string) => {
        const pathname = new URL(url).pathname;
        return pathname.substring(pathname.lastIndexOf('/') + 1) || 'download.file';
    };

    const fetchAndProcessRar = async (file: any) => {
        try {
            const zip = new JSZip();
            const result = await zip.loadAsync(file);
            const fileTypes = ['tsx', 'ts', 'less', 'js'];
            const filePromises: Promise<any>[] = [];
            result.forEach((relativePath, file) => {
                const extension = relativePath.split('.').pop()?.toLowerCase();
                if (extension && fileTypes.includes(extension)) {
                    const promise = file.async('text').then((content) => {
                        const newFile: EditorFile = {
                            id: relativePath.replace(/\//g, '-'), // ID用路径生成
                            name: relativePath.split('/').pop() || '',
                            content,
                            language: extension === 'js' ? 'javascript' : extension,
                        };

                        setFiles((prev) => [...prev, newFile]);
                        return {
                            id: relativePath.replace(/\//g, '-'), // ID用路径生成
                            name: relativePath.split('/').pop() || '',
                            content,
                            language: extension === 'js' ? 'javascript' : extension,
                        };
                    });
                    filePromises.push(promise);
                }
            });

            // const fileData = await Promise.all(filePromises);
            // return fileData;
        } catch (error) {
            console.error('处理失败:', error);
            throw error;
        }
    };

    return (
        <div className={styles.editorContainer}>
            {/* <input
                type="file"
                ref={fileInputRef}
                multiple
                onChange={handleFileUpload}
                accept=".tsx,.less,.ts,.js"
                style={{ display: 'none' }}
            />
            <Button onClick={() => fileInputRef.current?.click()}>
                上传文件
            </Button> */}
            <Button style={{ position: 'absolute', right: '85px' }} onClick={() => cancel && cancel()}>
                取消
            </Button>
            <Button style={{ position: 'absolute', right: '10px' }} onClick={() => saveCode && saveCode(files)}>
                保存
            </Button>
            <div className="tab-bar">
                {files.map((file) => (
                    <Button
                        key={file.id}
                        onClick={() => setActiveFileId(file.id)}
                        className={activeFileId === file.id ? 'active' : ''}
                        style={{ margin: '5px', background: activeFileId === file.id ? '#ECF6FF' : '#ffffff' }}
                    >
                        {file.name}
                    </Button>
                ))}
            </div>
            {activeFile ? (
                <VsEditor height="calc(100% - 50px)" language={activeFile.language} value={activeFile.content} onChange={handleContentChange} />
            ) : (
                // <div>请上传文件或选择文档</div>
                <div>暂无数据</div>
            )}
        </div>
    );
};

export default ElementDetailPage;
