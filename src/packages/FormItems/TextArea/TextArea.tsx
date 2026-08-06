import { Form, Input, FormItemProps } from 'antd';
import { useEffect, useState, useImperativeHandle, forwardRef, memo } from 'react';
import { ComponentType } from './../../types';
import { isNull } from './../../utils/util';
import { useFormContext } from './../../utils/context';
import { useAppContext } from './../../../utils/AppProvider';

/* 泛型只需要定义组件本身用到的属性，当然也可以不定义，默认为any */
export interface IConfig {
    elementAlias?: string;
    defaultValue: any;
    formItem: FormItemProps;
    formWrap: any;
}
/**
 *
 * @param config 组件配置属性值
 * @param props 系统属性值：componentid、componentname等
 * @returns 返回组件
 */
const MTextArea = ({ id, type, config, onChange }: ComponentType<IConfig>, ref: any) => {
    const { initValues } = useFormContext();
    const [visible, setVisible] = useState(true);
    const [disabled, setDisabled] = useState<boolean | undefined>();
    const [mStyle,setMStyle] = useState<any>({})

    const { mode, pageStore } = useAppContext();
    const setElementAlias = pageStore((state: any) => state.setElementAlias);
    useEffect(() => {
        // 设置组件别名
        setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
    }, [config.props.elementAlias]);

    // 初始化默认值
    useEffect(() => {
        const name: string = config.props.formItem?.name;
        if (config.props.defaultValue?.value !== undefined) return;
        const value = config.props.defaultValue;
        if(value !== undefined && value !== null) initValues(type, name, value);
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

    const handleChange = (val: string) => {
        onChange &&
            onChange({
                [config.props.formItem.name]: val,
            });
    };
    return (
        visible && (
            <Form.Item {...config.props.formItem} data-id={id} data-type={type}>
                <Input.TextArea
                    {...config.props.formWrap}
                    disabled={disabled}
                    variant={config.props.formWrap.variant || undefined}
                    style={{...config.style,...mStyle}}
                    onChange={(event) => handleChange(event.target.value)}
                />
            </Form.Item>
        )
    );
};

export default memo(forwardRef(MTextArea));
