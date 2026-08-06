import { ComponentType } from './../../types';
import { isNull } from './../../utils/util';
import { Form, Switch } from 'antd';
import { useEffect, useState, useImperativeHandle, forwardRef, memo } from 'react';
import { useFormContext } from './../../utils/context';
import { useAppContext } from './../../../utils/AppProvider';

/**
 *
 * @param config 组件配置属性值
 * @param props 系统属性值：componentid、componentname等
 * @returns 返回组件
 */
const MSwitch = ({ id, type, config, onChange }: ComponentType, ref: any) => {
    const { initValues } = useFormContext();
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

    // 监听表单值变化
    const handleChange = (val: string) => {
        onChange &&
            onChange({
                [config.props.formItem.name]: val,
            });
    };
    return (
        visible && (
            <Form.Item {...config.props.formItem} data-id={id} data-type={type} valuePropName="checked">
                <Switch {...config.props.formWrap} disabled={disabled} style={{...config.style,...mStyle}} onChange={handleChange} />
            </Form.Item>
        )
    );
};
export default memo(forwardRef(MSwitch));
