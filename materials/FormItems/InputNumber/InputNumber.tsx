import { Form, FormItemProps, InputNumber, InputNumberProps } from 'antd';
import { useEffect, useState, useImperativeHandle, forwardRef, memo, useCallback } from 'react';
import { ComponentType } from '@materials/types';
import { isNull } from '@materials/utils/util';
import { useFormContext } from '@materials/utils/context';
import styles from './index.module.less'

/* 泛型只需要定义组件本身用到的属性，当然也可以不定义，默认为any */
export interface IConfig {
    defaultValue: any;
    formItem: FormItemProps;
    formWrap: InputNumberProps;
}
/**
 *
 * @param config 组件配置属性值
 * @param props 系统属性值：componentid、componentname等
 * @returns 返回组件
 */
const MInputNumber = ({id, type, config, onChange }: ComponentType<IConfig>, ref: any) => {
    const { initValues } = useFormContext();
    const [visible, setVisible] = useState(true);
    const [disabled, setDisabled] = useState<boolean | undefined>();
    const [mStyle,setMStyle] = useState<any>({})

    // 初始化默认值
    useEffect(() => {
        const name: string = config.props.formItem?.name;
        if (config.props.defaultValue?.value !== undefined) return;
        const value = config.props.defaultValue;
        if(value !== undefined && value !== null) initValues(type, name, value);
    }, [config.props.defaultValue]);

    // 启用和禁用
    useEffect(() => {
        if (typeof config?.props?.formWrap?.disabled === 'boolean') setDisabled(config?.props?.formWrap?.disabled);
    }, [config?.props?.formWrap?.disabled]);

    // 对外暴露方法
    useImperativeHandle(ref, () => {
        return {
            show() {
                setVisible(true);
            },
            hide() {
                setVisible(false);
            },
            enable() {
                setDisabled(false);
            },
            disable() {
                setDisabled(true);
            },
            setStyle:(style:any)=>{
                setMStyle(style)
            }
        };
    });

    const handleChange = (val: number | string | null) => {
        onChange?.({
            [config?.props?.formItem?.name]: val || '',
        });
    };
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
    const formatterFn = useCallback((val: any) => {
        let formatter: any = config.props.formWrap.formatter;
        if(formatter?.value){
            return handleFormatter(formatter?.value)?.(val);
        }else{
            return val
        }
    }, [config.props.formWrap?.formatter])
    const parserFn = useCallback((val: any) => {
        let parser: any = config.props.formWrap?.parser;
        if(parser?.value){
            return handleFormatter(parser?.value)?.(val);
        }else{
            return val;
        }
    }, [config.props.formWrap?.parser])
    return (
        visible && (
            <Form.Item {...config.props.formItem}>
                <InputNumber
                    className={styles.inputNumberBox}
                    data-id={id}
                    data-type={type}
                    {...config.props.formWrap}
                    disabled={disabled}
                    variant={config?.props?.formWrap?.variant || undefined}
                    style={{...config.style,...mStyle}}
                    formatter={formatterFn}
                    parser={parserFn}
                    onChange={handleChange}
                />
            </Form.Item>
        )
    );
};

export default memo(forwardRef(MInputNumber));
