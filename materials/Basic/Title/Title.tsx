import { useState, useEffect, useImperativeHandle, forwardRef,memo } from 'react';
import { Typography } from 'antd';
import dayjs from 'dayjs';
import { ComponentType } from '@materials/types';
import { formatNumber } from '@materials/utils/util';
import { omit } from 'lodash-es';
/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const MTitle = ({ id, type, config, onClick }: ComponentType, ref: any) => {
    const [visible, setVisible] = useState(true);
    const [text, setText] = useState('');
    const [mStyle,setMStyle] = useState<any>({})
    const { copyable, ...restProps } = config.props;
    const finalCopyable = copyable ? { text } : false;
    useEffect(() => {
        const textStr = typeof config?.props?.text === 'string'
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

        if (script) {
            try {
                const renderFn = new Function('value', `return (${script})(value);`);
                value = renderFn(value);
            } catch (error) {
                console.error(`脚本解析失败`, error);
            }
        }
        setText(value?.toString());
    }, [config?.props?.text]);

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
        onClick?.();
    };
    const randerText = () => {
        // 解析带html标签的文本
        // dangerouslySetInnerHTML 属性（之所以叫这个名字，是因为直接渲染 HTML 存在 XSS 安全风险）
        return (
            <div
                dangerouslySetInnerHTML={{ __html: text }}
                // 可以添加自定义 className 来样式化容器
                className="text-container-div"
            />
        );
    };

    return (
        visible && (
            <Typography.Title style={{...config.style,...mStyle}} data-id={id} data-type={type}
            {...omit(config?.props, ['script', 'text'])}
            copyable={finalCopyable}
            onClick={handleClick}>
                {randerText()}
            </Typography.Title>
        )
    );
};
export default memo(forwardRef(MTitle));
