import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Form, ColorPicker, ColorPickerProps, FormItemProps } from 'antd';
import { ComponentType } from '@materials/types';
import { useFormContext } from '@materials/utils/context';

/*泛型只需要定义组件本身用到的属性*/
export interface IConfig {
    defaultValue: any;
    formItem: FormItemProps;
    formWrap: ColorPickerProps;
}
/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 */
const MColorPicker = ({id, type, config, onChange, onChangeComplete }: ComponentType<IConfig>, ref: any) => {
    const { initValues } = useFormContext();
    const [disabled, setDisabled] = useState<boolean | undefined>();
    const [visible, setVisible] = useState(true);
    const [mStyle,setMStyle] = useState<any>({})

    // 初始化默认值
    useEffect(() => {
        const name: string = config.props.formItem?.name;
        if (config.props.defaultValue?.value !== undefined) return;
        const value = config.props.defaultValue;
        initValues(type, name, value);
    }, [config.props.defaultValue]);

    // 启用和禁用
    useEffect(() => {
        if (typeof config?.props?.formWrap?.disabled === 'boolean') setDisabled(config?.props?.formWrap?.disabled);
    }, [config?.props?.formWrap?.disabled]);

    /**
     * 颜色变化的回调
     */
    const handleChange = (val: string) => {
        onChange?.({
            [config?.props?.formItem?.name]: val,
        });
    };

    /**
     * 颜色选择完成的回调
     */
    const handleChangeComplete = (val: string) => {
        onChangeComplete?.({
            [config?.props?.formItem?.name]: val,
        });
    };

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

    return (
        visible && (
            <Form.Item {...config.props.formItem}>
                <ColorPicker
                    data-id={id}
                    data-type={type}
                    {...config.props.formWrap}
                    disabled={disabled}
                    style={{...config.style,...mStyle}}
                    onChange={(color) => handleChange(color.toCssString())}
                    onChangeComplete={(color) => handleChangeComplete(color.toCssString())}
                />
            </Form.Item>
        )
    );
};
export default forwardRef(MColorPicker);
