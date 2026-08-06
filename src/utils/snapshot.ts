// snapshot.ts
import { useState, useCallback } from 'react';
import html2canvas, { Options as Html2CanvasOptions } from 'html2canvas';
import request from '@/utils/request';
import { base64ToBlob, blobToFile } from '@/utils/file';

// 类型定义
type SnapshotTarget = HTMLElement | string | React.RefObject<HTMLElement> | null;

interface SnapshotOptions extends Partial<Html2CanvasOptions> {
    imageType?: string;
    imageQuality?: number;
}

type ImageData = string | null;

interface SnapshotUploadParams {
    target: SnapshotTarget;
    options?: SnapshotOptions;
    fileParam?: string;
    extraData?: Record<string, any>;
}

export function Snapshot(defaultOptions: SnapshotOptions = {}) {
    const [imageUrl, setImageUrl] = useState<string>('');
    const [isCapturing, setIsCapturing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    /**
     *  获取目标元素
     * @param target 需要保存为快照的元素，支持id,类名，标签，ref，DOM元素，为空则截图整个页面
     * @returns  返回DOM元素
     */
    const getTargetElement = useCallback((target: SnapshotTarget): HTMLElement | null => {
        if (!target) return document.querySelector('body');

        if (typeof target === 'string') {
            return document.querySelector(target);
        }

        if ('current' in target) {
            return target.current;
        }

        if (target instanceof HTMLElement) {
            return target;
        }

        return document.querySelector('body');
    }, []);

    /**
     *  元素转为图片
     * @param target 目标DOM元素
     * @param options html2canvas配置项
     * @returns 完整Base64字符串
     */
    const capture = useCallback(
        async (target: SnapshotTarget, options: SnapshotOptions = {}): Promise<ImageData | null> => {
            setIsCapturing(true);
            setError(null);

            try {
                const element = getTargetElement(target);

                if (!element) {
                    throw new Error('没有目标元素');
                }

                // 合并配置
                const mergedOptions: SnapshotOptions = {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    ...defaultOptions,
                    ...options,
                };

                const canvas = await html2canvas(element, mergedOptions);
                const dataUrl = canvas.toDataURL(options.imageType || 'image/png', options.imageQuality ?? 1);

                setImageUrl(dataUrl);

                return dataUrl;
            } catch (err) {
                const message = err instanceof Error ? err.message : '生成图片失败';
                setError(message);
                return null;
            } finally {
                setIsCapturing(false);
            }
        },
        [defaultOptions, getTargetElement],
    );

    /**
     * Base64 图片上传核心方法
     * @param base64 完整Base64字符串（含前缀）
     * @param fileParam 后端接收文件的key（如file/avatar/imgs）
     * @param extraData 额外非文件参数（如staffId/type）
     * @returns Promise<T> 后端业务数据
     */
    const uploadBase64Image = useCallback(
        async <T = any>(base64: string, fileParam: string = 'file', extraData: Record<string, any> = {}): Promise<any> => {
            try {
                // Base64 转 Blob
                const blob = base64ToBlob(base64);
                if (!blob) {
                    return Promise.reject(new Error('Base64 转换失败'));
                }

                // 前端校验：限制文件大小
                const maxSize = 5 * 1024 * 1024; // 5MB
                if (blob.size > maxSize) {
                    return Promise.reject(new Error('图片大小超出限制'));
                }

                // 自定义文件名
                const fileName = `upload_${Date.now()}.${blob.type.split('/')[1]}`;
                const file = blobToFile(blob, fileName);

                try {
                    // 上传
                    const res = await request.upload<T>(
                        '/csf/call/importOssByFile', // 文件上传接口地址
                        fileParam, // 后端接收文件的key
                        file, // 转换后的File对象
                        extraData, // 额外参数
                        {
                            showLoading: true,
                            // 支持进度监控（纯Base64上传无此功能）
                            onUploadProgress: (e) => {
                                const progress = e.lengthComputable ? Math.round((e.loaded / e.total) * 100) : 0;
                                // 可绑定到进度条组件：setProgress(progress)
                            },
                        },
                    );
                    return res;
                } catch (err) {
                    console.error('上传失败原因：', err);
                    return Promise.reject(err);
                }
            } catch (error) {
                throw error;
            }
        },
        [],
    );

    //截图后上传，接收上传后返回的图片地址
    const snapshotUpload = useCallback(
        async <T = any>(
            target: SnapshotTarget,
            options: SnapshotOptions = {},
            fileParam: string = 'file',
            extraData: Record<string, any> = {},
        ): Promise<any> => {
            const dataUrl = await capture(target, options);
            if (dataUrl) {
                const res = await uploadBase64Image(dataUrl, fileParam, extraData);
                if (res?.bean?.url) {
                    return res.bean.url;
                }
            }
            return null;
        },
        [],
    );

    // 下载图片至本地
    const download = useCallback(
        (filename: string = `snapshot_${Date.now()}.png`) => {
            if (!imageUrl) return;

            const link = document.createElement('a');
            link.download = filename;
            link.href = imageUrl;
            link.click();
        },
        [imageUrl],
    );

    // 清除图片
    const clear = useCallback(() => {
        setImageUrl('');
        setError(null);
    }, []);

    return {
        // 状态
        imageUrl,
        isCapturing,
        error,

        // 方法
        capture,
        uploadBase64Image,
        download,
        clear,
        snapshotUpload,
    };
}

// 类型导出
export type { SnapshotTarget, SnapshotOptions };
