import { Form, FormItemProps } from 'antd';
import { message } from '@/utils/AntdGlobal';
import { useEffect, useState, useImperativeHandle, forwardRef, useRef, memo } from 'react';
import { ComponentType } from './../../types';
import { useFormContext } from './../../utils/context';
import styles from './index.module.less';
import { useAppContext } from '@/utils/AppProvider';

/* 泛型只需要定义组件本身用到的属性，当然也可以不定义，默认为any */
interface IFormWrap {
    disabled: boolean;
    step: number;
    step2: number;
    isDouble: boolean;
    size: string;
    min?: number;
    min2?: number;
    max?: number;
    max2?: number;
}
export interface IConfig {
    defaultValue: string | { value: string };
    formItem: FormItemProps;
    formWrap: IFormWrap;
    elementAlias: any;
}
interface IMinAndMax {
    min?: number;
    max?: number;
    min2?: number;
    max2?: number;
}
/**
 *
 * @param config 组件配置属性值
 * @param props 系统属性值：componentid、componentname等
 * @returns 返回组件
 */
const MCounter = ({ id, type, config, onAddOne, onMinusOne, onChangeOne, onAddTwo, onMinusTwo, onChangeTwo }: ComponentType<IConfig>, ref: any) => {
    const oneRef = useRef<any>(null);
    const twoRef = useRef<any>(null);

    const { initValues, form } = useFormContext();
    const [visible, setVisible] = useState(true);
    const initValue = form?.getFieldValue(config.props.formItem?.name);
    const [valueOne, setValueOne] = useState<string>(initValue ? initValue.split(",")?.[0] : "");
    const [valueTwo, setValueTwo] = useState<string>((initValue && initValue.split(",")) ? initValue.split(",")?.[1] : "");
    const [disabled, setDisabled] = useState<boolean | undefined>();
    const [disAdd, setDisAdd] = useState<boolean | undefined>();
    const [disAdd2, setDisAdd2] = useState<boolean | undefined>();
    const [disMinus, setDisMinus] = useState<boolean | undefined>();
    const [disMinus2, setDisMinus2] = useState<boolean | undefined>();
    const [minAndMax, setMinAndMax] = useState<IMinAndMax>({});
    const [step2, setStep2] = useState<number>(1);
    const [mStyle,setMStyle] = useState<any>({})

    const _state = useAppContext();
    const { mode, pageStore } = _state;

    const isDouble = config.props?.formWrap?.isDouble || false;
    const size = config.props?.formWrap?.size || 'md';
    const step = config.props?.formWrap?.step || 1;
    const setElementAlias = pageStore((state: any) => state.setElementAlias);

    // 初始化默认值
    useEffect(() => {
        let _config: any = config;
        const name: string = _config.props.formItem?.name;
        if (_config.props.defaultValue?.value !== undefined) return;
        const value = _config.props.defaultValue || '';
        initValues(type, name, value);
        const valueArr = value.split(',');
        if (valueArr[0]) {
            setValueOne(valueArr[0] || '');
        }
        if (valueArr[1]) {
            setValueTwo(valueArr[1] || '');
        }
    }, [config.props.defaultValue]);
    useEffect(() => {
        setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
    }, [config.props.elementAlias]);
    // 启用和禁用
    useEffect(() => {
        if (typeof config.props.formWrap.disabled === 'boolean') setDisabled(config.props.formWrap.disabled);
    }, [config.props.formWrap.disabled]);
    useEffect(() => {
        if (isDouble) {
            const step = config.props?.formWrap?.step || 1;
            const step2 = config.props?.formWrap?.step2 || step;
            setStep2(step2);
        }
    }, [config.props.formWrap.step, config.props.formWrap.step2]);
    // 最大值和最小值
    useEffect(() => {
        const min = config.props?.formWrap?.min;
        const max = config.props?.formWrap?.max;
        const min2 = config.props?.formWrap?.min2 || min;
        const max2 = config.props?.formWrap?.max2;
        if (numExist(min) && numExist(max) && min! > max!) {
            message.error('请检查最大值和最小值配置是否错误');
        }
        if (numExist(min2) && numExist(max2) && min2! > max2!) {
            message.error('请检查步进器-2中最大值和最小值配置是否错误');
        }
        if (numExist(min) && numExist(min2) && min! > min2!) {
            message.error('请检查步进器组最小值配置是否错误');
        }
        if (numExist(max) && numExist(max2) && max! > max2!) {
            message.error('请检查步进器组最大值配置是否错误');
        }
        setMinAndMax({ min, max, min2, max2 });
    }, [config.props.formWrap.min, config.props.formWrap.max, config.props.formWrap.min2, config.props.formWrap.max2]);

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
            getValue() {
                if (isDouble) {
                    return (valueOne || '') + ',' + (valueTwo || '');
                } else {
                    return valueOne || '';
                }
            },
            setStyle:(style:any)=>{
                setMStyle(style)
            }
        };
    });
    const numExist = (value: number | undefined): boolean => {
        if (value || value === 0) {
            return true;
        } else {
            return false;
        }
    };
    const changeOne = (value: number, triggerType: string) => {
        let val = value;
        if (isDouble && valueTwo && value >= parseFloat(valueTwo)) {
            val = parseFloat(valueTwo);
        }
        setValueOne(val + '');
        if (triggerType == 'add' && mode === 'preview') {
            onAddOne?.({ value: val });
        }
        if (triggerType == 'minus' && mode === 'preview') {
            onMinusOne?.({ value: val });
        }
        if (val != parseFloat(valueOne) && mode === 'preview') {
            onChangeOne?.({ value: val, triggerType: triggerType });
        }
        const name: string = config.props.formItem?.name;
        let formVal = val + '';
        if (isDouble) {
            formVal = formVal + ',' + (valueTwo || '');
        }
        initValues(type, name, formVal);
        BtnDisabled(val); //判断按钮是否禁用
    };
    const changeTwo = (value: number, triggerType: string) => {
        let val = value;
        if (valueOne && value <= parseFloat(valueOne)) {
            val = parseFloat(valueOne);
        }
        setValueTwo(val + '');
        if (triggerType == 'add' && mode === 'preview') {
            onAddTwo?.({ value: val });
        }
        if (triggerType == 'minus' && mode === 'preview') {
            onMinusTwo?.({ value: val });
        }
        if (val != parseFloat(valueTwo) && mode === 'preview') {
            onChangeTwo?.({ value: val, triggerType: triggerType });
        }

        const name: string = config.props.formItem?.name;
        const formVal = (valueOne || '') + ',' + val;
        initValues(type, name, formVal);
        BtnDisabled2(val); //判断按钮是否禁用
    };

    const BtnDisabled = (value: number) => {
        if (disabled) {
            return;
        }
        const { min, max, min2, max2 } = minAndMax;
        if (
            numExist(value) &&
            ((numExist(max) && value >= max!) ||
                (isDouble && valueTwo && value >= parseFloat(valueTwo)) ||
                (isDouble && numExist(max2) && !valueTwo && value >= max2!))
        ) {
            setDisAdd(true);
        } else {
            setDisAdd(false);
        }

        if (numExist(value) && numExist(min) && value <= min!) {
            setDisMinus(true);
        } else {
            setDisMinus(false);
        }

        if (isDouble && valueTwo && value == parseFloat(valueTwo)) {
            setDisMinus2(true);
        } else {
            setDisMinus2(false);
        }
    };
    const BtnDisabled2 = (value: number) => {
        if (disabled) {
            return;
        }
        const { min, max, min2, max2 } = minAndMax;
        if (numExist(value) && numExist(max2) && value >= max2!) {
            setDisAdd2(true);
        } else {
            setDisAdd2(false);
        }

        if (
            numExist(value) &&
            ((numExist(min2) && value <= min2!) || (valueOne && value <= parseFloat(valueOne)) || (numExist(min) && !valueOne && value <= min!))
        ) {
            setDisMinus2(true);
        } else {
            setDisMinus2(false);
        }
        if (valueOne && value == parseFloat(valueOne)) {
            setDisAdd(true);
        } else {
            setDisAdd(false);
        }
    };
    const add = (inputNum: number) => {
        const { min, max, min2, max2 } = minAndMax;
        if (inputNum == 1) {
            if (disabled || disAdd || !valueOne) {
                return;
            }
            oneRef.current.stepUp();
            let value = parseFloat(oneRef.current.value);
            if (numExist(max) && value > max!) {
                value = max as number;
            }
            if (isDouble && !max && numExist(max2) && value > max2!) {
                value = max2 as number;
            }
            changeOne(value, 'add');
        } else {
            if (disabled || disAdd2 || !valueTwo) {
                return;
            }
            twoRef.current.stepUp();
            let value = parseFloat(twoRef.current.value);
            if (numExist(max2) && value > max2!) {
                value = max2 as number;
            }
            changeTwo(value, 'add');
        }
    };
    const minus = (inputNum: number) => {
        const { min, max, min2, max2 } = minAndMax;
        if (inputNum == 1) {
            if (disabled || disMinus || !valueOne) {
                return;
            }
            // let value = parseFloat(valueOne) - step;
            oneRef.current.stepDown();
            let value = parseFloat(oneRef.current.value);
            if (numExist(min) && value < min!) {
                value = min as number;
            }
            changeOne(value, 'minus');
        } else {
            if (disabled || disMinus2 || !valueTwo) {
                return;
            }
            // let value = parseFloat(valueTwo) - step2;
            twoRef.current.stepDown();
            let value = parseFloat(twoRef.current.value);
            if (numExist(min2) && value < min2!) {
                value = min2 as number;
            }
            if (isDouble && !min2 && numExist(min) && value < min!) {
                value = min as number;
            }
            changeTwo(value, 'minus');
        }
    };

    const inputChange = (inputNum: number) => {
        const { min, max, min2, max2 } = minAndMax;
        if (inputNum == 1) {
            let value = oneRef.current.value;
            if (!value) {
                if (valueOne != '' && mode === 'preview') {
                    onChangeOne?.({ value: '', triggerType: 'input' });
                    const name: string = config.props.formItem?.name;
                    let formVal = '';
                    if (isDouble) {
                        formVal = formVal + ',' + (valueTwo || '');
                    }
                    initValues(type, name, formVal);
                }
                setDisAdd(false);
                setDisMinus(false);
                // setDisAdd2(false);
                setDisMinus2(false);
                setValueOne('');
            } else {
                value = parseFloat(value);
                if (numExist(min) && value <= min!) {
                    value = min;
                }
                if (numExist(max) && value >= max!) {
                    value = max;
                }
                if (isDouble && !max && numExist(max2) && value >= max2!) {
                    value = max2;
                }
                changeOne(value, 'input');
            }
        } else {
            let value = twoRef.current.value;
            setValueTwo(value);
            if (!value) {
                if (valueTwo != '' && mode === 'preview') {
                    onChangeTwo?.({ value: '', triggerType: 'input' });
                    const name: string = config.props.formItem?.name;
                    const formVal = (valueOne || '') + ',' + '';
                    initValues(type, name, formVal);
                }

                setDisAdd(false);
                // setDisMinus(false);
                setDisAdd2(false);
                setDisMinus2(false);
                setValueTwo('');
            } else {
                value = parseFloat(value);
                if (numExist(min2) && value <= min2!) {
                    value = min2;
                }
                if (isDouble && !min2 && numExist(min) && value >= min!) {
                    value = min;
                }
                if (numExist(max2) && value >= max2!) {
                    value = max2;
                }
                changeTwo(value, 'input');
            }
        }
    };
    const getStyle = () => {
        let {width, height, ...otherStyle} = config.style;
        const styles:any = {...otherStyle};
        if(width && width != 'auto'){
            styles.width = width;
        }
        if(height && height != 'auto'){
            styles.height = height;
        }
        return styles;
    }
    return (
        visible && (
            <Form.Item {...config.props.formItem} data-id={id} data-type={type}>
                <div className={`${styles.Counter} ${styles[size]} ${isDouble? styles.double: ''}`} style={{...getStyle(),...mStyle}}>
                    <div
                        className={`sn-counter-size-${size} ${isDouble ? 'sn-counter-double' : ''} ${
                            disabled ? 'sn-counter-disabled' : ''
                        } sn-counter-sonBox`}
                    >
                        <div className="sn-counter-son sn-counter-one">
                            <div className="sn-counter-input"><input
                                    type="number"
                                    value={valueOne}
                                    disabled={disabled}
                                    step={step}
                                    className="sn-counterContent"
                                    ref={oneRef}
                                    onChange={() => {
                                        inputChange(1);
                                    }}
                                /></div>
                            <div className="sn-btns">
                                <div
                                    className={`sn-btn sn-addBtn ${disAdd ? 'disabledBtn' : ''}`}
                                    onClick={() => {
                                        add(1);
                                    }}
                                ></div>
                                <div
                                    className={`sn-btn sn-minusBtn ${disMinus ? 'disabledBtn' : ''}`}
                                    onClick={() => {
                                        minus(1);
                                    }}
                                ></div>
                            </div>
                        </div>
                        {isDouble ? (
                            <>
                                <div className="sn-separator">-</div>
                                <div className="sn-counter-son sn-counter-two">
                                    <div className="sn-counter-input"><input
                                            type="number"
                                            value={valueTwo}
                                            disabled={disabled}
                                            step={step2}
                                            className="sn-counterContent"
                                            ref={twoRef}
                                            onChange={() => {
                                                inputChange(2);
                                            }}
                                        /></div>
                                    <div className="sn-btns">
                                        <div
                                            className={`sn-btn sn-addBtn ${disAdd2 ? 'disabledBtn' : ''}`}
                                            onClick={() => {
                                                add(2);
                                            }}
                                        ></div>
                                        <div
                                            className={`sn-btn sn-minusBtn ${disMinus2 ? 'disabledBtn' : ''}`}
                                            onClick={() => {
                                                minus(2);
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>
            </Form.Item>
        )
    );
};

export default memo(forwardRef(MCounter));
