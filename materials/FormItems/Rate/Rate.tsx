import { ComponentType } from '@materials/types';
import { forwardRef, useEffect, useImperativeHandle, useState, memo } from 'react';
import { Form, FormItemProps, Rate, RateProps } from 'antd';
import { useFormContext } from '@materials/utils/context';
import * as icons from '@ant-design/icons';

/* 泛型只需要定义组件本身用到的属性，当然也可以不定义，默认为any */
export interface IConfig {
    defaultValue: any;
    formItem: FormItemProps;
    formWrap: RateProps;
}

type MRateRef = {
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
};

const MRate = forwardRef<MRateRef, ComponentType<IConfig>>(({id, type, config, onChange, onHoverChange }, ref) => {
    const [visible, setVisible] = useState(true);
    const [disabled, setDisabled] = useState(false);
    const [character, setCharacter] = useState();
    const [mStyle,setMStyle] = useState<any>({})

    const { initValues } = useFormContext();
    useImperativeHandle(ref, () => ({
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
    }));

    useEffect(() => {
        const name: string = config.props.formItem?.name;
        if (config.props.defaultValue?.value !== undefined) return;
        const value = config.props.defaultValue;
        if(value !== undefined && value !== null) initValues(type, name, value);
    }, [config.props.defaultValue]);

    // 启用和禁用
    useEffect(() => {
        setDisabled(config?.props?.formWrap?.disabled || false);
    }, [config?.props?.formWrap?.disabled]);

    // 获取对应的组件实例
    useEffect(() => {
        const iconsList: { [key: string]: any } = icons;
        setCharacter(iconsList[config?.props?.formWrap?.character as string]?.render());
    }, [config?.props?.formWrap?.character]);

    // 输入事件
    const handleChange = (val: number) => {
        onChange?.({
            [config?.props?.formItem?.name]: val,
        });
    };

    // 鼠标经过时数值变化的回调
    const handleHoverChange = (val: number) =>
        onHoverChange?.({
            [config?.props?.formItem?.name]: val,
        });

    if (!visible) {
        return null;
    }

    return (
        <Form.Item {...config.props.formItem}>
            <Rate
                data-id={id}
                data-type={type}
                {...config.props.formWrap}
                disabled={disabled}
                character={character}
                style={{...config.style,...mStyle}}
                onChange={handleChange}
                onHoverChange={handleHoverChange}
            />
        </Form.Item>
    );
});

export default memo(MRate);
