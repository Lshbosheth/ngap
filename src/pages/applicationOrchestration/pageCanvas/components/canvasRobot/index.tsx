// 机器人智能助手
import React, { useState, useEffect, useRef } from 'react';
import { crossApiUserInfo } from '@/stores/crossapiStore';
import { Modal, Input, Button, Select } from 'antd';
import { message } from '@/utils/AntdGlobal';
import ReactMarkdown from 'react-markdown';
import request from '@/utils/request';

import styles from './index.module.less';

interface CanvasRobotProps {

}

interface Message {
    id: number;
    type: 'user' | 'bot';
    content: string;
}

const CanvasRobot: React.FC<CanvasRobotProps> = () => {
    // 获取用户信息
    const userInfo = crossApiUserInfo((state) => state.userInfo);
    const [mainPageShow, setMainPageShow] = useState(false); // 控制主页面显示状态
    const [inputValue, setInputValue] = useState(''); // 输入框的值
    const [messages, setMessages] = useState<Message[]>([]); // 消息列表
    const [loading, setLoading] = useState(false); // 加载状态
    const chatMessagesRef = useRef<HTMLDivElement>(null); // 消息区域引用

    // 初始化欢迎消息
    useEffect(() => {
        setMessages([
            {
                id: 1,
                type: 'bot',
                content: '您好！我是智能问答助手，可以回答各种问题。'
            }
        ]);
    }, []);

    // 自动滚动到底部
    useEffect(() => {
        if (chatMessagesRef.current) {
            requestAnimationFrame(() => {
                if (chatMessagesRef.current) {
                    chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
                }
            });
        }
    }, [messages, loading]);

    // 发送消息处理函数
    const handleSendMessage = async () => {
        if (!inputValue.trim()) {
            message.warning('请输入您的问题');
            return;
        }

        const userMessage: Message = {
            id: Date.now(),
            type: 'user',
            content: inputValue.trim()
        };

        // 添加用户消息
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setLoading(true);

        try {
            const params = {
                params: {
                    question: userMessage.content,
                }
            };

            // 调用 AI 查询接口
            const response = await request.post('/csf/call/queryAICreatePrompt', params, { showError: false, timeout: 50000 }); // 不显示自动错误提示，由我们自己处理

            const botMessage: Message = {
                id: Date.now() + 1,
                type: 'bot',
                content: response?.bean?.answer || '抱歉，我没有理解您的问题，请重新表述。'
            };

            // 添加机器人回复
            setMessages(prev => [...prev, botMessage]);
        } catch (error: any) {
            // console.error('查询失败:', error);
            message.error('服务器繁忙，请稍后再试');

            const errorMessage: Message = {
                id: Date.now() + 1,
                type: 'bot',
                content: '服务器繁忙...'
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    // 处理回车键发送
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div className={styles.aiPage}>
            {mainPageShow && (<div className={styles.mainPage}>
                {/* 顶部标题栏 */}
                <div className={styles.chatHeader}>
                    <div className={styles.chatTitle}>
                        <i>💬</i>
                        <h2>智能问答助手</h2>
                    </div>
                    <button className={styles.closeBtn} onClick={() => { setMainPageShow(false) }}>×</button>
                </div>

                {/* 消息区域 */}
                <div className={styles.chatMessages} ref={chatMessagesRef}>
                    {messages.map((msg) => (
                        <div key={msg.id} className={styles.message}>
                            <div className={`${styles.messageContent} ${msg.type === 'user' ? styles.userMessage : styles.botMessage}`}>
                                {msg.type === 'bot' ? <ReactMarkdown>{msg.content}</ReactMarkdown> : msg.content}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className={styles.message}>
                            <div className={`${styles.messageContent} ${styles.botMessage}`}>
                                <span>正在思考中...</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.chatInputArea}>
                    <div className={styles.inputGroup}>
                        <Input
                            className={styles.messageInput}
                            placeholder="输入您的问题..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                        />
                        <button
                            className={styles.sendButton}
                            onClick={handleSendMessage}
                            disabled={loading}
                        >
                            {loading ? '⏳' : '➤'}
                        </button>
                    </div>
                </div>
            </div>)}


            <div className={styles.aiIcon} onClick={() => { setMainPageShow(true) }}>
                <div className={styles.pulse}></div>
                <img className={styles.pulseImage} src={new URL(`./imgs/robotIcon.png`, import.meta.url).href} alt="" />
                <div className={styles.aiIconText}>点击开始对话</div>
            </div>
        </div>
    );
};

export default CanvasRobot;
