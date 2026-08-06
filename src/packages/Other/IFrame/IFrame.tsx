import { ComponentType } from './../../types';
import { useState, useImperativeHandle, forwardRef, useMemo, useEffect, memo, CSSProperties, useRef } from 'react';
import { useAppContext } from './../../../utils/AppProvider';
import { renderFormula } from './../../../packages/utils/util';
import { baseApiConvert } from '../../../../page/src/utils/util';
import useMessageListener from './../../../utils/useMessageListener';
import { handleActionFlow } from './../../utils/action';
import { omit, isNil } from 'lodash-es';

/**
 * 将参数数组拼接到 URL 后面
 * @param baseUrl 基础 URL
 * @param params 参数数组
 * @param _state 应用状态上下文
 * @returns 拼接后的完整 URL
 */
const buildUrlWithParams = (baseUrl: string, params: any[], _state: any): string => {
    if (!baseUrl) return '';

    if (!params || params.length === 0) {
        return baseUrl;
    }

    // 过滤掉无效的参数
    const validParams = params.filter((param) => param && param.name);

    if (validParams.length === 0) {
        return baseUrl;
    }

    // 构建查询参数字符串
    const queryString = validParams
        .map((param) => {
            const paramName = param.name;
            let paramValue = '';

            // 处理参数值
            if (param.value) {
                if (typeof param.value === 'string' || typeof param.value === 'number') {
                    // 静态值
                    paramValue = String(param.value);
                } else if (typeof param.value === 'object') {
                    if (param.value.type === 'static') {
                        // 静态值
                        paramValue = String(param.value.value || '');
                    } else if (param.value.type === 'variable') {
                        // 变量绑定，使用 renderFormula 处理
                        const formula = param.value.value || '';
                        paramValue = String(renderFormula(formula, {}, _state) || '');
                    }
                }
            }

            return `${encodeURIComponent(paramName)}=${encodeURIComponent(paramValue)}`;
        })
        .filter((str) => str && !str.endsWith('='))
        .join('&');

    if (!queryString) {
        return baseUrl;
    }

    // 判断基础 URL 是否已经包含参数
    const separator = baseUrl.includes('?') ? '&' : '?';

    return `${baseUrl}${separator}${queryString}`;
};

/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const IFrame = ({ id, type, config }: ComponentType, ref: any) => {
    const [visible, setVisible] = useState(true);
    const [src, setSrc] = useState<string>('');
    const [iframeKey, setIframeKey] = useState<number>(Date.now());
    const [mStyle, setMStyle] = useState<CSSProperties>({});
    const _state = useAppContext();
    const { pageStore } = _state;

    // 设置组件别名
    const setElementAlias = pageStore((state: any) => state.setElementAlias);
    useEffect(() => {
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
            setStyle: (style: CSSProperties) => {
                setMStyle(style);
            },
            reload() {
                setIframeKey(Date.now());
            },
        };
    });

    // 初始化默认值并拼接参数
    useEffect(() => {
        const baseUrl = typeof config.props.src === 'string' ? config.props.src : config.props.src?.value;

        // 获取 iframeParams 参数
        const iframeParams = config.props.iframeParams || [];

        // 拼接参数到 URL
        const fullUrl = buildUrlWithParams(baseUrl || '', iframeParams, _state);
        const fullUrlNew = baseApiConvert(fullUrl);
        // 同时更新 src 和 iframeKey，确保链接同时刷新
        setSrc(fullUrlNew);
        setIframeKey(Date.now());
    }, [config.props.src, config.props.iframeParams, _state]);

    // 使用自定义hook监听message事件
    useMessageListener((event: MessageEvent) => {
        try {
            // 获取message返回的数据，包含 eventName 和 datas
            let returnData: any;
            if (typeof event.data === 'string') {
                try {
                    returnData = JSON.parse(event.data);
                } catch (e) {
                    returnData = event.data;
                }
            } else {
                returnData = event.data;
            }
            // const returnData = JSON.parse(event.data);
            const { eventName, datas } = returnData || {};

            if (!eventName) return;

            // 从组件配置中获取事件列表
            const events = config.events || [];

            // 遍历事件配置，查找匹配的事件名称
            // 需要将配置的 value 与 message 中的 eventName 进行匹配
            const matchedEvent = events.find((eventConfig: any) => {
                const name = eventConfig.eventName;
                return eventName === name;
            });

            // 如果匹配到事件，则触发事件流
            if (matchedEvent?.actions && matchedEvent.actions.length > 0) {
                // 将 message 中的 datas 作为参数传递给事件流
                handleActionFlow(matchedEvent.actions, datas || {}, _state);
            }
        } catch (error) {
            console.error('解析message数据失败:', error);
        }
    });
    // 裁剪后，重新计算高度
    const height = useMemo(() => {
        // TODO: 临时兼容老版本，后续需要删除
        const { top } = config.props.clip || { top: '0px' };
        let height = '100%';
        const px = (num: string) => Number(num.replace('px', ''));
        const topPx = px(top);
        if (topPx != 0) {
            height = `calc(100% + ${-topPx}px)`;
        }
        return height;
    }, [config.props.clip]);

    const other = useMemo(() => {
        return omit(config.props, ['src', 'gridLayout']);
    }, [config.props]);

    return (
        visible && (
            <div style={{ ...config.style, ...mStyle }} data-id={id} data-type={type}>
                <iframe
                    key={iframeKey}
                    style={{
                        position: 'absolute',
                        top: config.props.clip?.top || 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: '100%',
                        height,
                        border: 'none',
                    }}
                    src={src || undefined}
                    {...omit(config.props, ['src'])}
                />
            </div>
        )
    );
};
export default memo(forwardRef(IFrame));
