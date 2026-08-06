import { Form, FormItemProps, InputNumber, InputNumberProps } from 'antd';
import { useEffect, useState, useImperativeHandle, forwardRef, memo, useCallback } from 'react';
import { ComponentType } from './../../types';
import { useFormContext } from './../../utils/context';
import { handleFormatter } from './../../utils/util';
import { useAppContext } from './../../../utils/AppProvider';
import styles from './index.module.less'

/* 泛型只需要定义组件本身用到的属性，当然也可以不定义，默认为any */
export interface IConfig {
    elementAlias?: string;
    defaultValue: any;
    formItem: FormItemProps;
    formWrap: InputNumberProps & {
        formatter?: {
            type: 'variable';
            value: string;
        };
        parser?: {
            type: 'variable';
            value: string;
        };
    };
}
/**
 *
 * @param config 组件配置属性值
 * @param props 系统属性值：componentid、componentname等
 * @returns 返回组件
 */
const MInputNumber = ({ id, type, config, onChange }: ComponentType<IConfig>, ref: any) => {
    const { initValues, form } = useFormContext();
    const [visible, setVisible] = useState(true);
    const [disabled, setDisabled] = useState<boolean | undefined>();
    const [mStyle,setMStyle] = useState<any>({})

    const _state = useAppContext();
    const { pageStore } = _state;
    const setElementAlias = pageStore((state: any) => state.setElementAlias);
    // 设置组件别名
    useEffect(() => {
        setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
    }, [config.props.elementAlias]);

    // 初始化默认值
    useEffect(() => {
        const name: string = config.props.formItem?.name;
        if (config.props.defaultValue?.value !== undefined) return;
        const value = config.props.defaultValue;
        if(value !== undefined && value !== null){
            initValues(type, name, value);
        }
    }, [config.props.defaultValue]);

    // 启用和禁用
    useEffect(() => {
        if (typeof config.props.formWrap.disabled === 'boolean') setDisabled(config.props.formWrap.disabled);
    }, [config.props.formWrap.disabled]);

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
            [config.props.formItem.name]: val || '',
        });
    };
    const formatterFn = useCallback((val: any) => {
        if(config.props.formWrap?.formatter?.value){
            return handleFormatter(config.props.formWrap?.formatter?.value)?.(val);
        }else{
            return val
        }
    }, [config.props.formWrap?.formatter?.value])
    const parserFn = useCallback((val: any) => {
        if(config.props.formWrap?.parser?.value){
            return handleFormatter(config.props.formWrap?.parser?.value)?.(val);
        }else{
            return val;
        }
    }, [config.props.formWrap?.parser?.value])
    return (
        visible && (
            <Form.Item {...config.props.formItem} data-id={id} data-type={type}>
                <InputNumber
                    className={styles.inputNumberBox}
                    {...config.props.formWrap}
                    disabled={disabled}
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
