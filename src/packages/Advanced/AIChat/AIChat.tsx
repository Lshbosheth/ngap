import { ComponentType } from './../../types';
import React, { forwardRef, useImperativeHandle, useState, useEffect, useRef, useCallback,useMemo, memo } from 'react';
import { renderFormula } from './../../../packages/utils/util';
import { useAppContext } from './../../../utils/AppProvider';
import request from './../../../utils/request';
import { Input, Button, Avatar, Spin, Dropdown, App, Collapse } from 'antd';
import CryptoJS from 'crypto-js';
import {
    LikeOutlined,
    DislikeOutlined,
    PaperClipOutlined,
    FileImageOutlined,
    ArrowUpOutlined,
    LoadingOutlined,
    DownOutlined
} from '@ant-design/icons';
import styles from './index.module.less';

const { Panel } = Collapse;
const { TextArea } = Input;

const generateUUID = (): string => {
    return CryptoJS.lib.WordArray.random(16).toString().replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
};

/**
 * AIChat 组件
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const AIChat = ({ id, type, config, onSend, onResponse, onInputChange }: ComponentType, ref: any) => {
    const { message } = App.useApp();
    const [visible, setVisible] = useState(true);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputValue, setInputValue] = useState('');     // 消息输入框内容
    const [loading, setLoading] = useState(false);
    const [thinking, setThinking] = useState(false);
    const [isWaitingResponse, setIsWaitingResponse] = useState(false);  // 是否正在等待AI响应
    // const [chatKey, setChatKey] = useState(0);
    const [quickReplies, setQuickReplies] = useState<any[]>([]);  // 快捷语数据
    // 流式加载相关状态
    const [streamingContent, setStreamingContent] = useState<{ [key: number]: string }>({});
    const [isStreaming, setIsStreaming] = useState(false);
    const streamingTimerRef = useRef<NodeJS.Timeout | null>(null);
    const contentAreaRef = useRef<HTMLDivElement>(null);
    const _state = useAppContext();
    const { mode, pageStore } = _state;
    const setElementAlias = pageStore((state: any) => state.setElementAlias);
    const [mStyle,setMStyle] = useState<any>({})

    useEffect(() => {
        setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
    }, [config.props.elementAlias]);

    // 组件卸载时清理定时器
    useEffect(() => {
        return () => {
            if (streamingTimerRef.current) {
                clearTimeout(streamingTimerRef.current);
            }
        };
    }, []);

    // contentArea 滚动条始终在底部
    const scrollToBottom = useCallback(() => {
        if (contentAreaRef.current) {
            setTimeout(() => {
                contentAreaRef.current!.scrollTop = contentAreaRef.current!.scrollHeight;
            }, 0);
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, streamingContent]);

    // 流式加载效果函数
    // const startStreaming = useCallback((messageId: number, fullContent: string) => {
    //     const AIMessageStyle = config.props?.AIMessageStyle || '流式加载';

    //     // 如果是非流式加载，直接显示完整内容
    //     if (AIMessageStyle === '非流式加载') {
    //         setStreamingContent(prev => ({ ...prev, [messageId]: fullContent }));
    //         return;
    //     }

    //     // 流式加载模式
    //     setIsStreaming(true);
    //     setStreamingContent(prev => ({ ...prev, [messageId]: '' }));

    //     let currentIndex = 0;
    //     const contentLength = fullContent.length;

    //     // 根据内容长度动态调整打字速度
    //     const getTypingSpeed = () => {
    //         if (contentLength < 50) return 30; // 短内容快速
    //         if (contentLength < 200) return 20; // 中等内容
    //         return 10; // 长内容稍慢
    //     };

    //     const typingSpeed = getTypingSpeed();

    //     const streamNextChar = () => {
    //         if (currentIndex < contentLength) {
    //             const char = fullContent[currentIndex];
    //             setStreamingContent(prev => ({
    //                 ...prev,
    //                 [messageId]: (prev[messageId] || '') + char
    //             }));
    //             currentIndex++;
    //             streamingTimerRef.current = setTimeout(streamNextChar, typingSpeed);
    //         } else {
    //             setIsStreaming(false);
    //         }
    //     };

    //     streamNextChar();
    // }, [config.props?.AIMessageStyle]);

    // 对外暴露方法
    useImperativeHandle(ref, () => {
        return {
            show() {
                setVisible(true);
            },
            hide() {
                setVisible(false);
            },
            setMessage(paramsObj: any) { //消息赋值
                setInputValue(paramsObj.message); 
                if (mode === 'preview') { onInputChange?.(message); }
            },
            setStyle:(style:any)=>{
                setMStyle(style)
            }
        };
    });

    const handleSend = () => {
        if (mode === 'preview') {
            onSend?.();
        }
        if (!config.props.AIPAdrss) {
            message.warning('请填写模型设置中的AIP地址');
            return;
        }
        if (!inputValue.trim() || loading) return;

        const param: any = {
            queryText: inputValue,                      //  用户问    question   userId
            templateId: '',                             //  模板id    可不传
            sessionId: generateUUID(),               //  会话ID    UUID自动生成
            type: config.props.modelType || 'jtBase',   //  模板类型
            temperature: config.props.degreeVal,        //  温度      可不传，不传走默认
                                                        // history       N  历史对话  可不传
            frontendId: '',                             //  渠道id    可不传
            msgId: generateUUID(),                   //  消息id    UUID自动生成，可与sessionId共用
            ext: {},                                    //  变量      可不传
            phone: config.props.userPhone,              //  用户手机号
            systemId: 'ngapfwengine',                        //  上游id LINGYUN 固定参数--调用方的系统编码--ngapfwengine
        };
        if(config.props.AIPAdrss === '3'){
            param.userId = config.props.userPhone;
            param.question = inputValue;
            // delete param.phone;
        }
        if(config.props.AIPAdrss === '4'){
            param.question = inputValue;
            param.appId = config.props.APPID;
            param.modelCode = config.props.modelCode;
            param.promptContent = config.props.promptContent;
        }

        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: inputValue,
            timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setLoading(true);
        setThinking(true);
        setIsWaitingResponse(true);  // 开始等待AI响应
        const params = {
            type: config.props.AIPAdrss,  //接口类型、1-大模型对话调用-非流式、2-大模型对话调用-流式、3-大模型应用调用-非流式、4-大模型应用调用-流式
            authorization: config.props.APIKey,   // 秘钥
            appId: config.props.APPID,       // 应用ID
            param,
        };

        try{
            request.post('/csf/call/getAIConversation', {params}, {
                // headers: {
                //     'LLM-Authorization': config.props.APIKey
                // }
            }).then((res) => {
                setLoading(false);
                setThinking(false);
                setIsWaitingResponse(false);  // 收到AI响应
                if (res?.returnCode === '0') {
                    const messageId = Date.now() + 1;
                    let content = '';
                    let think = '';
                    const answer = res?.bean?.answer || '抱歉，我无法理解您的问题。';
                    const thinkMatch = answer.match(/<think>([\s\S]*?)<\/think>/);
                    if (thinkMatch) {
                        think = thinkMatch[1];
                        content = answer.replace(/<think>[\s\S]*?<\/think>/, '');
                    } else {
                        content = answer;
                    }
                    const assistantMessage = {
                        id: messageId,
                        role: 'assistant',
                        content: content,
                        timestamp: Date.now(),
                        thinking: think,
                    };
                    setMessages((prev) => [...prev, assistantMessage]);
                    // 触发流式加载效果
                    // startStreaming(messageId, content);
                    if (mode === 'preview') {
                        // onSend?.({ userMessage, assistantMessage });
                        onResponse?.();
                    }
                }else{
                    message.warning(res?.bean?.answer || res.returnMessage || '接口报错了');
                    if (mode === 'preview') {
                        onResponse?.();
                    }
                }
            }).catch((error) => {
                setLoading(false);
                setThinking(false);
                setIsWaitingResponse(false);  // 收到AI响应（错误响应）
                // API调用失败时的默认回复
                const messageId = Date.now() + 1;
                const errorContent = config.props.errorTip || error?.bean?.answer || '抱歉，发生了错误，请稍后再试。';  //设置当对接模型能力出现异常时返回的默认提示语
                if(!(error?.bean?.answer)){
                    message.error(JSON.parse(error.message).message || error.returnMessage);
                }
                const errorMessage = {
                    id: messageId,
                    role: 'assistant',
                    content: errorContent,
                    timestamp: Date.now(),
                };
                setMessages((prev) => [...prev, errorMessage]);
                if (mode === 'preview') {
                    onResponse?.();
                }
                // // 触发流式加载效果
                // startStreaming(messageId, errorContent);
            });
        }catch (err) {
            console.error('接口调用失败:', err);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent | Event) => {
        if (e && typeof e === 'object' && 'key' in e) {
            const keyEvent = e as React.KeyboardEvent;
            if (keyEvent.key === 'Enter' && !keyEvent.shiftKey) {
                e.preventDefault?.();
                handleSend();
            }
        } else {
            // 对于其他类型的事件，直接发送
            handleSend();
        }
    };

    // 点赞点踩结果回传
    const handleFeedback = async (messageId: number, feedbackType: 'like' | 'dislike') => {
        const resultSendUrl = config.props?.resultSendUrl;

        // 如果没有配置回传接口，则不执行任何操作
        if (!resultSendUrl) {
            message.warning('未配置结果回传接口');
            return;
        }

        try {
            // 调用回传接口
            const res = await request.post(resultSendUrl, {
                messageId,
                feedbackType,
                timestamp: Date.now(),
            });

            if (res?.returnCode === '0' || res?.code === 0) {
                message.success('反馈成功');
            } else {
                message.error(res?.returnMessage || '反馈失败');
            }
        } catch (error) {
            console.error('反馈接口调用失败:', error);
            message.error('反馈失败，请稍后重试');
        }
    };

     const avatar = useMemo(() => config.props.src || undefined, [config.props.src]);
     const userAvatars = useMemo(() => config.props.userAvatar || undefined, [config.props.userAvatar]);
     const AIAvatars = useMemo(() => config.props.AIAvatar || undefined, [config.props.AIAvatar]);
    // 欢迎区域
    const renderWelcome = () => {
        return (
            <div className={styles.welcomeArea}>
                <div className={styles.welcomeLeft} key={Date.now()}>
                    <Avatar src={avatar} style={{ width: '100%', height: '100%' }} />
                </div>
                <div className={styles.welcomeRight}>
                    <div className={styles.welcomeTitle}>
                        {config.props?.welcomeTitle || '这是欢迎语标题展示区域'}
                    </div>
                    <div className={styles.welcomeDesc}>
                        {config.props?.welcomeDesc || '这是欢迎语描述信息展示区域'}
                    </div>
                </div>
            </div>
        );
    };

    // 会话区域
    const renderMessage = (msg: any, index: number) => {
        const isUser = msg.role === 'user';
        // 根据配置获取位置，默认为右侧
        const aiPosition = config.props?.AIPosition || 'left';
        const userPosition = config.props?.userPosition || 'right';
        // 根据角色和配置决定实际显示位置
        const position = isUser ? userPosition : aiPosition;

        // 组合样式类：保留角色样式类 + 位置样式类
        const roleClass = isUser ? styles.userMessage : styles.assistantMessage;
        const positionClass = position === 'right' ? styles.messageRight : styles.messageLeft;

        // 获取显示内容：AI消息使用流式加载内容，用户消息直接显示
        const displayContent = isUser ? msg.content : (streamingContent[msg.id] || msg.content);

        return (
            <>
                {/* AI思考过程 - 当showThink为true时显示，与messageContent同级 */}
                {!isUser && config.props.showThink && (
                    <div className={styles.thinkingWrapper}>
                        <Collapse
                            ghost
                            className={styles.thinkingCollapse}
                            expandIconPosition="end"
                        >
                            <Panel
                                header={
                                    <div className={styles.thinkingHeader}>
                                        <LoadingOutlined spin style={{display: thinking ? 'inline' : 'none'}}/>
                                        <span>{ thinking ? '思考中' : '已完成思考'}</span>
                                    </div>
                                }
                                key="1"
                            >
                                <div className={styles.thinkingContent}>
                                    {msg.thinking || '暂不支持思考内容展示'}
                                </div>
                            </Panel>
                        </Collapse>
                    </div>
                )}
                <div
                    key={msg.id || index}
                    className={`${styles.message} ${roleClass} ${positionClass}`}
                >
                    <div className={styles.avatarWrapper}>
                        {isUser?(<Avatar
                            size={36}
                            src={userAvatars}
                            className={styles.userAvatar}
                        />):(
                            <Avatar
                            size={36}
                            src={AIAvatars}
                            className={styles.assistantAvatar}
                        />
                        )}
                    </div>
                    <div className={styles.messageContent}>
                        <div
                            className={styles.messageTextWrapper}
                            style={{ flexDirection: position === 'right' ? 'row-reverse' : 'row' }}
                        >
                            <div className={styles.messageText}>
                                <span className={styles.messageContentText} style={{fontSize: config.style.fontSize, lineHeight: config.style.lineHeight, fontWeight: config.style.fontWeight, color: config.style.color, textAlign: config.style.textAlign}}>{displayContent}</span>
                                {/* AI消息的点赞点踩按钮 - 固定在消息框内的右下方，独占一行 */}
                                {!isUser && (
                                    <div className={styles.actionButtons} style={{ display: config.props.showLike ? 'flex' : 'none' }}>
                                        <LikeOutlined
                                            className={styles.likeIcon}
                                            onClick={() => handleFeedback(msg.id, 'like')}
                                        />
                                        {/* 竖线分隔符 */}
                                        <span style={{ width: '1px', height: '16px', backgroundColor: '#D2D2D2', margin: '0 8px', display: 'inline-block' }} />
                                        <DislikeOutlined
                                            className={styles.likeIcon}
                                            onClick={() => handleFeedback(msg.id, 'dislike')}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className={styles.messageTime} style={{ display: config.props.showTimestamp ? 'block' : 'none' }}>
                                {(() => {
                                    const date = new Date(msg.timestamp);
                                    const year = date.getFullYear();
                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                    const day = String(date.getDate()).padStart(2, '0');
                                    const hours = String(date.getHours()).padStart(2, '0');
                                    const minutes = String(date.getMinutes()).padStart(2, '0');
                                    const seconds = String(date.getSeconds()).padStart(2, '0');
                                    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    };
    // 快捷语选择
    const handleQuickReplySelect = (value: string) => {
        setInputValue(value);
    };
    useEffect(() => {  // 快捷语数据变化
        const quickReplyData = config.props.quickReplyData;
        if(quickReplyData){
            if (typeof quickReplyData === 'string') {
                setQuickReplies(quickReplyData.split(','));
            } else if (quickReplyData?.type === 'static') {
                setQuickReplies(quickReplyData.value.split(','));
            } else if (quickReplyData?.type === 'variable') {
                const resultData = renderFormula(quickReplyData.value, {}, _state);
                setQuickReplies(resultData.split(','));
            }
        }else{
            setQuickReplies([]);
        }
    }, [config.props.quickReplyData]);
    // 快捷语下拉菜单
    const quickReplyMenu = {
        items: quickReplies.length > 0 ? quickReplies.map((item, index) => ({
            key: index,
            label: item,
            onClick: () => handleQuickReplySelect(item),
        })) : [{ key: 'empty', label: '暂无快捷语', disabled: true }],
    };

    return (
        visible && (
            <div
                className={styles.AIChat}
                style={{...config.style, ...mStyle}}
                data-id={id} data-type={type}
            >
                <div className={styles.chatContainer}>
                    {/* 顶部标题栏 */}
                    <div className={styles.header}>对话区</div>

                    {/* 中间内容区域 */}
                    <div className={styles.contentArea} ref={contentAreaRef} style={{ minHeight: config.props.minHeight, maxHeight: config.props.maxHeight }}>
                        {/* 欢迎区域 */}
                        {config.props.welcomeMessageShow && renderWelcome()}

                        {/* 会话区域 */}
                        { (
                            <div className={styles.messagesList}>
                                {messages.map((msg, index) => renderMessage(msg, index))}
                                {/* AI响应加载中显示 */}
                                {/* { isWaitingResponse && ( */}
                                { (!config.props.showThink && isWaitingResponse) && (
                                    <div className={styles.message}>
                                        <Spin indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} />
                                        {/* <span style={{ marginLeft: 8, color: '#999' }}>AI正在思考中...</span> */}
                                    </div>      
                                )}
                            </div>
                        )}
                    </div>

                    {/* 消息发送区域 */}
                    <div className={styles.inputArea}>
                        <div className={styles.inputWrapper} style={{ height: config.props.inputHeight }}>
                            <TextArea
                                value={inputValue}
                                onChange={(e) => {setInputValue(e.target.value); if (mode === 'preview') { onInputChange?.(e.target.value); }}}
                                onPressEnter={handleKeyPress}
                                placeholder={config.props?.inputPlaceholder || '请输入消息...'}
                                className={styles.input}
                            />
                            <div className={styles.inputActions} >
                                {/* 快捷语选择框 */}
                                <Dropdown
                                    menu={quickReplyMenu as any}
                                    trigger={['click']}
                                >
                                    <Button className={styles.quickReplyBtn} style={{ display: config.props.showQuickReply ? 'inline-flex' : 'none' }}>
                                        快捷语 <DownOutlined />
                                    </Button>
                                </Dropdown>

                                {/* 发送按钮 - 圆形带向上箭头 */}
                                <Button
                                    shape="circle"
                                    icon={<ArrowUpOutlined style={{ color: "#0085D0" }}/>}
                                    onClick={handleSend}
                                    loading={loading}
                                    className={styles.sendButton}
                                    disabled={inputValue.trim() === ''}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    );
};

export default memo(forwardRef(AIChat));
