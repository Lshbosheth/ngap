export const hasFontColorStrict = (text?: string) => {
    if (!text || typeof text !== 'string') return false;

    // 只匹配字体颜色相关
    const fontColorPatterns = [
        // style 属性中的 color（非 background-color）
        /style\s*=\s*["'][^"']*\bcolor\s*:\s*[^"';]+["']/i,

        // font 标签
        /<font\s+[^>]*\bcolor\s*=/i,

        // 模板 color 过滤器/函数
        /\{\{[^}]*\bcolor\b[^}]*\}\}/i,
        /\$\{[^}]*\bcolor\b[^}]*\}/i,
        /\|\s*color\s*[:\(]/i,
    ];

    return fontColorPatterns.some((p) => p.test(text));
};
