import { useCallback, useEffect, useState } from 'react';
import { InputNumber, InputNumberProps, message, Select } from 'antd';
import { isEmpty, isNil, isFinite } from 'lodash-es';

const CSS_UNIT = ['px', '%', 'vw', 'vh', 'em', 'rem', 'auto'] as const;

type CSSUnit = typeof CSS_UNIT[number];
type NumericUnit = Exclude<CSSUnit, 'auto'>;

const { Option } = Select;
interface InputPx extends InputNumberProps<string | number> {
    unit?: CSSUnit;
    unitDisabled?: boolean;
}
const InputPx = ({ value, onChange, ...props }: InputPx) => {
    const [num, setNum] = useState<number | null>();
    const [unit, setUnit] = useState<string>('px');

    const handleStrMatch = (value: string) => {
        if (!value) return;
        const trimmed = value?.trim();
        const reg = /^(-?[\d.]*)(px|%|vw|vh|em|rem|auto)$/;
        const sizeMatch = trimmed.match(reg);
        return sizeMatch;
    };

    useEffect(() => {
        if (typeof value === 'number') {
            setNum(value);
        } else if (typeof value === 'string') {
            const sizeMatch = handleStrMatch(value);
            if (sizeMatch) {
                const [_fullStr, sizeNum, sizeUnit] = sizeMatch;
                !isEmpty(sizeNum) ? setNum(parseFloat(sizeNum)): setNum(undefined);
                !isEmpty(sizeUnit) && setUnit(sizeUnit as NumericUnit);
            } else {
                message.warning({ content: `无法解析尺寸字符串: "${value}"，支持的单位: px, %, vw, vh, em, rem, auto`, duration: 2 });
            }
        }
    }, [value]);

    // 输入框改变
    const handleChange = (value: number | string | null) => {
        if (unit === 'auto') {
            setNum(typeof value === 'number' ? value : null);
            onChange?.('auto');
        }
        if (typeof value === 'number') {
            setNum(value);
            onChange?.(value + unit);
        } else if (typeof value === 'string') {
            !isFinite(Number(value)) ? setNum(null) : setNum(parseFloat(value));
        } else {
            setNum(null);
            onChange?.(null);
        }
    };

    // 下拉框改变
    const handleSelect = useCallback(
        (value: string) => {
            setUnit(value);
            if (value === 'auto') {
                onChange?.('auto');
                return;
            }
            if (!isNil(num)) {
                onChange?.(num + value);
            }
        },
        [num, onChange],
    );

    const selectAfter = (
        <Select defaultValue="px" value={unit} onChange={handleSelect} size="small" style={{ width: 60 }}>
            {CSS_UNIT.map((unit) => {
                return (
                    <Option key={unit} value={unit}>
                        {unit}
                    </Option>
                );
            })}
        </Select>
    );

    return (
        <InputNumber
            placeholder="输入尺寸: 10"
            {...props}
            addonAfter={selectAfter}
            value={num}
            controls={false}
            onChange={(val) => handleChange(val)}
            style={{ width: '100%' }}
        />
    );
};

export default InputPx;
