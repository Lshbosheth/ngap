import { ComponentType } from '@materials/types';
import { forwardRef, useImperativeHandle, useState, memo, CSSProperties, ForwardedRef, useMemo, useCallback } from 'react';
import { Progress, ProgressProps } from 'antd';
import { handleFormatter } from '../../../src/packages/utils/util';

interface RefConfig {
    show: () => void;
    hide: () => void;
    setStyle: (style: CSSProperties) => void;
}

export interface IConfig {
    text: string;
}
type ILabelAndColorObject = {
    label?: string;
    color?: string;
};
/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const MProgress = ({ id, type, config }: ComponentType, ref: ForwardedRef<RefConfig>) => {
    const [visible, setVisible] = useState(true);
    const [mStyle, setMStyle] = useState<CSSProperties>({});

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
        };
    });
    const handleFormatter = (formatter: any) => {
        if (!formatter) return undefined;
        return (val: any) => {
            try {
                return new Function('value', `return (${formatter})(value);`)(val);
            } catch (error) {
                console.error('formatter 函数解析失败：', error);
                return val;
            }
        };
    };
    const color: ProgressProps['strokeColor'] = useMemo(() => {
        const strokeColor = config.props?.strokeColor;
        const gradientColor = config.props?.gradientColor;
        if (strokeColor) {
            return strokeColor;
        } else {
            let colorObj: { [name: string]: string } | null = null;
            gradientColor?.forEach(({ label, color }: ILabelAndColorObject) => {
                if (label && color) {
                    if (!colorObj) {
                        colorObj = {};
                    }
                    colorObj[label] = color;
                }
            });
            return colorObj;
        }
    }, [config.props?.strokeColor, config.props?.gradientColor]);

    const formatFn = useCallback(() => {
        return config.props?.format ? handleFormatter(config.props?.format) : null;
    }, [config.props?.format]);

    const steps: ProgressProps['steps'] = useMemo(() => {
        return config.props?.steps || undefined;
    }, [config.props?.steps]);

    const getStyle = () => {
        const styles = { ...config.style };
        if (styles.width == 'auto') {
            delete styles.width;
        }
        if (styles.height == 'auto') {
            delete styles.height;
        }
        if (styles.fontSize == 'auto') {
            delete styles.fontSize;
        }
        if (styles.lineHeight == 'auto') {
            delete styles.lineHeight;
        }
        return styles;
    };

    return (
        visible && (
            <Progress
                data-id={id}
                data-type={type}
                style={{ ...getStyle(), ...mStyle }}
                {...config.props}
                strokeColor={color}
                format={formatFn}
                steps={steps}
            />
        )
    );
};
export default memo(forwardRef(MProgress));
