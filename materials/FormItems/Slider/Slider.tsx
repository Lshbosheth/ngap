import { Form, FormItemProps, Slider } from 'antd';
import { forwardRef, useEffect, useImperativeHandle, useState, memo } from 'react';
import { ComponentType } from '@materials/types';
import { isNull } from '@materials/utils/util';
import { useFormContext } from '@materials/utils/context';
import styles from './index.module.less'

/* 泛型只需要定义组件本身用到的属性，当然也可以不定义，默认为any */
export interface IConfig {
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
const MInput = ({id, type, config, onChange }: ComponentType<IConfig>, ref: any) => {
    const { initValues } = useFormContext();
    const [visible, setVisible] = useState(true);
    const [mStyle,setMStyle] = useState<any>({})
    const [disabled, setDisabled] = useState<boolean | undefined>();
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

    const handleChange = (val: string | number) => {
        onChange?.({
            [config?.props?.formItem?.name]: val,
        });
    };

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
    return (
        visible && (
            <Form.Item {...config.props.formItem}>
                <Slider className={styles.sliderBox} data-id={id} data-type={type} {...config.props.formWrap} disabled={disabled} style={{...config.style,...mStyle}} onChange={(val) => handleChange(val)} />
            </Form.Item>
        )
    );
};

export default memo(forwardRef(MInput));
