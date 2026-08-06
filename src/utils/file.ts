/**
 * Base64 字符串转换为 Blob 对象（兼容所有图片格式）
 * @param base64 Base64 完整字符串（含 data:image/xxx;base64, 前缀）
 * @returns Blob 对象 | null（转换失败返回null）
 */
export function base64ToBlob(base64: string): Blob | null {
    try {
        // 分割 Base64 前缀和实际编码内容
        const [base64Head, base64Body] = base64.split(',');
        if (!base64Head || !base64Body) {
            console.error('Base64 格式错误，缺少 data:image/xxx;base64, 前缀');
            return null;
        }

        // 解析文件类型（如 data:image/png;base64 → image/png）
        const mimeType = base64Head.match(/:(.*?);/)?.[1] || 'image/png';

        // 解码 Base64 为二进制数据
        const byteCharacters = atob(base64Body);
        const byteArrays = [];
        for (let i = 0; i < byteCharacters.length; i++) {
            byteArrays.push(byteCharacters.charCodeAt(i));
        }
        const byteArray = new Uint8Array(byteArrays);

        // 创建 Blob 对象，指定正确的文件类型
        return new Blob([byteArray], { type: mimeType });
    } catch (error) {
        console.error('Base64 转 Blob 失败：', error);
        return null;
    }
}

/**
 * Blob 对象转换为 File 对象（可选，与普通上传文件格式完全一致）
 * @param blob Blob 对象
 * @param fileName 自定义文件名（如 avatar.png）
 * @returns File 对象
 */
export function blobToFile(blob: Blob, fileName: string): File {
    // File 是 Blob 的子类，通过构造函数转换，保持类型一致
    return new File([blob], fileName, { type: blob.type });
}
