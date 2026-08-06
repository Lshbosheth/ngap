import { useState, useEffect, useImperativeHandle, memo, useMemo, forwardRef, useCallback } from 'react';
import { Typography, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { ComponentType } from './../../types';
import { formatNumber, handleFormatter } from './../../utils/util';
import { omit } from 'lodash-es';
import { useAppContext } from './../../../utils/AppProvider';
import styles from './index.module.less';
import { handleActionFlow } from '../../utils/action';
/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const MText = ({ id, type, config, onClick }: ComponentType, ref: any) => {
    const [text, setText] = useState('');
    const [visible, setVisible] = useState(true);
    const _state = useAppContext();
    const { mode, pageStore } = _state;
    const [mStyle,setMStyle] = useState<any>({})

    const setElementAlias = pageStore((state: any) => state.setElementAlias);
    const [key, setKey] = useState(new Date().getTime());
    const { copyable, ...restProps } = config.props;
    const finalCopyable = copyable ? { text } : false;
    useEffect(() => {
        const textStr = typeof config?.props?.text === 'string';
        const originText = textStr ? config.props?.text : '';
        const format = config.props?.format;
        const script = config.props?.script;
        let value: string | number = originText;
        if (format === 'YYYY-MM-DD HH:mm:ss') {
            value = dayjs(originText).format(format);
        } else if (format === 'YYYY-MM-DD') {
            value = dayjs(originText).format(format);
        } else if (format === 'HH:mm:ss') {
            value = dayjs(originText).format(format);
        } else if (format === 'money') {
            value = formatNumber(originText, 'currency');
        } else if (format === 'number') {
            value = formatNumber(originText, 'decimal');
        } else if (format === 'percent') {
            value = formatNumber(originText, 'percent');
        }
        const renderText = handleFormatter(script)?.(value);
        setText(renderText || originText);
        setKey(new Date().getTime());
    }, [config.props]);

    useEffect(() => {
        // 设置组件别名
        setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
    }, [config.props.elementAlias]);



    // 对外暴露方法
    useImperativeHandle(ref, () => {
        return {
            show() {
                setVisible(true);
            },
            hide() {
                setVisible(false);
            },
            setStyle:(style:any)=>{
                setMStyle(style)
            }
        };
    });
    const handleClick = () => {
        if (mode === 'preview') {
            onClick?.();
        }
    };

    // 处理事件点击：根据事件名称查找对应的事件配置，执行事件流
    const handleEventClick = useCallback((eventName: string) => {
        // 仅在预览模式下执行事件流，编辑态不触发
        if (mode == 'edit') return;
        const events = config.events || [];
        // 根据事件名称匹配对应的事件配置
        const matchedEvent = events.find((event: any) => event.eventName === eventName);
        // 如果匹配到事件且配置了事件流行为，则执行事件流
        if (matchedEvent?.actions && matchedEvent.actions.length > 0) {
            handleActionFlow(matchedEvent.actions, {}, _state);
        }
    }, [mode, config.events, _state]);

    // 处理文本点击事件：判断点击目标是否为事件链接文本（通过 data-event-name 属性识别），触发对应事件流
    const handleTextClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        // 判断是否为事件链接文本（SPAN标签且包含 data-event-name 属性）
        if (target.tagName === 'SPAN' && target.getAttribute('data-event-name')) {
            // 编辑态不阻止事件冒泡，避免影响组件选中
            if (mode !== 'edit') {
                e.stopPropagation();
            }
            const eventName = target.getAttribute('data-event-name');
            // 触发对应事件流
            if (eventName) {
                handleEventClick(eventName);
            }
        }
    }, [handleEventClick]);

    const renderText = () => {
        // 解析带html标签的文本
        // dangerouslySetInnerHTML 属性（之所以叫这个名字，是因为直接渲染 HTML 存在 XSS 安全风险）
        return (
            <div
                dangerouslySetInnerHTML={{ __html: highlightText }}
                // 可以添加自定义 className 来样式化容器
                className="text-container-div"
                onClick={handleTextClick}
                style={{  ...(config.props.ellipsis && {
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                    }),}}
            />
        );
    };
    const renderInlineText = () => {
        // 解析带html标签的文本
        // dangerouslySetInnerHTML 属性（之所以叫这个名字，是因为直接渲染 HTML 存在 XSS 安全风险）
        return (
            <div
                dangerouslySetInnerHTML={{ __html: highlightText }}
                // 可以添加自定义 className 来样式化容器
                className="text-container-div"
                onClick={handleTextClick}
                style={{
                    // ...config.style,  文本的样式不用加在这个上面
                    display: 'inline-block',
                    ...(config.props.ellipsis && {
                        // 解决出现省略时，提示不居中
                        maxWidth: '100%',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                    }),
                }}
            />
        );
    };

    // 高亮文本：将文本中匹配事件名称的内容渲染为可点击的蓝色链接
    const highlightText = useMemo(() => {
        if (!text) return text;
        const events = config.events || [];
        // 过滤出新增的自定义事件名称（排除默认的 onClick）
        const eventNames = events
            .filter((event: any) => event.eventName && event.eventName !== 'onClick')
            .map((event: any) => event.eventName)
            .filter(Boolean);

        if (eventNames.length === 0) return text;

        // 按事件名称长度降序排序，避免短名称优先匹配导致长名称无法完整匹配
        const sortedEventNames = [...eventNames].sort((a, b) => b.length - a.length);
        const cursorStyle = mode === 'preview' ? 'cursor: pointer;' : '';

        // 将HTML文本拆分为标签和文本部分，只替换文本部分中的事件名称，避免替换HTML标签属性
        const parts = text.split(/(<[^>]+>)/g);
        let highlightedText = '';

        parts.forEach(part => {
            if (!part) return;

            // 如果是HTML标签（如 <div class='abc'>），直接保留不做替换
            if (/^<[^>]+>$/.test(part)) {
                highlightedText += part;
                return;
            }

            // 如果是文本内容，遍历事件名称进行匹配替换
            let result = part;
            sortedEventNames.forEach(eventName => {
                if (eventName) {
                    const regex = new RegExp(eventName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
                    // 将匹配到的事件名称替换为带样式的可点击span标签
                    result = result.replace(regex, `<span style="color: #0085D0; ${cursorStyle}" data-event-name="${eventName}">${eventName}</span>`);
                }
            });
            highlightedText += result;
        });

        return highlightedText;
    }, [text, config.events, mode]);

    const getToolTipsContent = (text:any, fontSize:any) =>{
        return <div style={{ fontSize: fontSize ? `${fontSize}px` : '14px' }} dangerouslySetInnerHTML={{__html:text}}/>
    }

    return (
        visible &&
        (config.props.showtips ? (
            <Typography.Text
                style={{
                    ...config.style,
                    ...(config.props.ellipsis && {
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                    }),
                    ...mStyle
                }}
                key={key}
                {...omit(config.props, ['script', 'text'])}
                    copyable={finalCopyable}
                onClick={handleClick}
                data-id={id}
                data-type={type}
            >
                <Tooltip
                    title={getToolTipsContent(config.props.tip_text? (typeof config.props.tip_text === 'string' ? config.props.tip_text : config.props.tip_text?.value) : text, config.props.tipFontSize)}
                    overlayClassName={styles.customLightTooltip}
                >
                    {renderInlineText()}
                </Tooltip>

            </Typography.Text>

        ) : (
            <Typography.Text
                style={{
                    ...config.style,
                    ...(config.props.ellipsis && {
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                    }),
                    ...mStyle
                }}
                key={key}
                {...omit(config.props, ['script', 'text'])}
                copyable={finalCopyable}
                onClick={handleClick}
                data-id={id}
                data-type={type}
            >
                {renderText()}
            </Typography.Text>
        ))
    );
};
export default memo(forwardRef(MText));
