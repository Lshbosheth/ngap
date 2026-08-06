import { FunctionOutlined } from '@ant-design/icons';
import { Select, Input } from 'antd';
import { useRef } from 'react';
import VariableSelect from './VariableSelect';

interface Value {
    type: 'static' | 'variable';
    value: any;
}

interface Props {
    value?: Value;
    [key: string]: any;
}

const VariableBind: React.FC<Props> = ({ type, value, onChange, ...props }: any) => {
    const selectRef = useRef<{ open: (id: string) => void }>();

    function valueChange(e: any) {
        onChange({
            type: 'static',
            value: e?.target?.value,
        });
    }

    function select(record: any) {
        onChange({
            type: 'variable',
            ...record,
        });
    }

    function select1(record: any) {
        onChange({
            type: 'variable',
            value: record,
        });
    }

    const val = typeof value === 'string' || typeof value === 'number' ? { type: 'static', value } : value;
    const variableOption = [
        {
            label: '对象',
            value: 'Map',
        },
        {
            label: '列表',
            value: 'List',
        },
    ];
    return (
        <>
            {type != 'dataResult' && (
                <Input
                    readOnly={val?.type === 'variable' && val.value}
                    allowClear
                    value={val?.value}
                    onChange={valueChange}
                    addonAfter={
                        <FunctionOutlined
                            onClick={() => {
                                selectRef.current?.open(val?.value);
                            }}
                            style={{ color: value?.type === 'variable' ? '#0085d0' : '' }}
                        />
                    }
                    placeholder="请选择变量"
                    {...props}
                />
            )}

            {/* 选择变量弹框 */}
            {type != 'dataResult' && <VariableSelect ref={selectRef} onSelect={select} dataSource={props.dataSource} />}
            {type == 'dataResult' && <Select value={val?.value} onChange={select1} options={variableOption}></Select>}
        </>
    );
};

export default VariableBind;
