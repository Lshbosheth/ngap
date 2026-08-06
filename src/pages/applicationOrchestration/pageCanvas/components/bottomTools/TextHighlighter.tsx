// 对文本中的指定关键字进行高亮标记
import React from 'react';

interface TextHighlighterProps {
    text: string;
    keywords: string | string[];
    highlightStyle?: { [key: string]: string };
    caseSensitive?: boolean;
}

const TextHighlighter: React.FC<TextHighlighterProps> = ({ text, keywords, highlightStyle = {}, caseSensitive = false }) => {
    if (!text) return null;

    const keywordsArray = Array.isArray(keywords) ? keywords : [keywords];

    // 过滤掉空的关键字
    const validKeywords = keywordsArray.filter((keyword) => keyword && keyword.trim() !== '');

    if (validKeywords.length === 0) return <>{text}</>;

    // 创建正则表达式
    const escapedKeywords = validKeywords.map((keyword) => keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

    const regexPattern = `(${escapedKeywords.join('|')})`;
    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(regexPattern, flags);

    // 分割文本
    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, index) => {
                if (index % 2 === 1) {
                    // 匹配的关键字部分
                    return (
                        <span key={index} style={highlightStyle}>
                            {part}
                        </span>
                    );
                }
                return part;
            })}
        </>
    );
};

export default TextHighlighter;
