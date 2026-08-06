import React, { useState } from 'react';
import type { BranchConfigItem, ConditionItem } from '../ConditionalBranchConfig/types';
import { DeleteOutlined, BranchesOutlined, ShrinkOutlined } from '@ant-design/icons';
import { Radio, Select, Input, Modal, Typography, Divider } from 'antd';
import { message } from '@/utils/AntdGlobal';

interface DialogProps {
    branchType: string;
    formAtomList: any[];
    outParamsList: any[];
    closeDiaolg: (option: any) => void;
    editData: BranchConfigItem;
}

const ConditionModal: React.FC<DialogProps> = ({ branchType, formAtomList, outParamsList, closeDiaolg, editData }) => {
    const [dataConfig, setDataConfig] = useState<BranchConfigItem>({
        rule: '&', //默认全部
        operationRes: '', //展示结果
        status: '1', //分支状态 默认正常
        conditionList: [], //条件关系
        ...editData,
    });

    const relationData = [
        { name: '==', value: '==' },
        { name: '!=', value: '!=' },
        { name: '>', value: 'greater' },
        { name: '<', value: '<' },
        { name: '>=', value: 'equalOrGreater' },
        { name: '<=', value: '<=' },
        { name: '包含', value: 'contains' },
        { name: '不包含', value: 'notContains' },
    ];

    // 添加新条件
    const handleAddCondition = () => {
        setDataConfig((prevData) => {
            const currentList = Array.isArray(prevData.conditionList) ? prevData.conditionList : [];
            // 生成新数据
            const newCondition: ConditionItem = {
                id: Date.now(),
                filedKey: '',
                atomId: '',
                value: '',
                relation: '',
            };
            return {
                ...prevData,
                conditionList: [...currentList, newCondition],
            };
        });
    };

    // 删除条件
    const handleRemoveCondition = (id: number) => {
        if (id) {
            setDataConfig((prevData) => {
                const currentList = Array.isArray(prevData.conditionList) ? prevData.conditionList : [];
                return {
                    ...prevData,
                    conditionList: currentList.filter((item) => item.id !== id),
                };
            });
        }
    };

    const ruleTypes = [
        { name: '全部', value: '&' },
        { name: '任一', value: '|' },
    ];
    const handleRuleChange = (val: string) => {
        setDataConfig((prev) => ({
            ...prev,
            rule: val,
        }));
    };

    // 操作结果
    const handleResultChange = (e: { target: { name: string; value: string } }) => {
        const { name, value } = e.target;
        setDataConfig((prev) => ({
            ...prev,
            operationRes: value,
        }));
    };

    const statusTypes = [
        { name: '正常', value: '1' },
        { name: '异常', value: '2' },
    ];
    const handleStatusChange = (val: string) => {
        setDataConfig((prev) => ({
            ...prev,
            status: val,
        }));
    };

    // 列表中数据改变
    // 选择组件元素
    const handleFiledKeyChange = (newValue: string, itemId: number | undefined) => {
        if (itemId) {
            setDataConfig((prevData) => {
                const currentList = Array.isArray(prevData.conditionList) ? prevData.conditionList : [];
                if (branchType === 'MT') {
                    return {
                        ...prevData,
                        conditionList: currentList.map((item) => (item.id === itemId ? { ...item, atomId: newValue } : item)),
                    };
                } else if (branchType === 'AT') {
                    return {
                        ...prevData,
                        conditionList: currentList.map((item) => (item.id === itemId ? { ...item, filedKey: newValue } : item)),
                    };
                }
            });
        }
    };

    //选择关系类型
    const handleRelationChange = (newValue: string, itemId: number | undefined) => {
        if (itemId) {
            setDataConfig((prevData) => {
                const currentList = Array.isArray(prevData.conditionList) ? prevData.conditionList : [];
                return {
                    ...prevData,
                    conditionList: currentList.map((item) => (item.id === itemId ? { ...item, relation: newValue } : item)),
                };
            });
        }
    };

    //输入的枚举值
    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>, itemId: number | undefined) => {
        if (itemId) {
            const newValue = e.target.value; // 获取Input的新输入值
            setDataConfig((prevData) => {
                const currentList = Array.isArray(prevData.conditionList) ? prevData.conditionList : [];
                return {
                    ...prevData,
                    conditionList: currentList.map((item) => (item.id === itemId ? { ...item, value: newValue } : item)),
                };
            });
        }
    };

    // 关闭弹窗
    const handleCustomClose = () => {
        if (!dataConfig.operationRes) {
            message.error('请配置操作结果展示信息');
            return;
        }
        if (dataConfig.conditionList && dataConfig.conditionList.length == 0) {
            message.error('请选择判断条件');
            return;
        }
        if (dataConfig.conditionList) {
            for (let i = 0; i < dataConfig.conditionList.length; i++) {
                const conditionData = dataConfig.conditionList[i];
                // 非空校验
                if (branchType == 'MT') {
                    if (!conditionData.atomId && formAtomList.length > 0) {
                        message.error('请设置组件元素');
                        return;
                    }
                } else {
                    if (!conditionData.filedKey && outParamsList.length > 0) {
                        message.error('请设置接口出参');
                        return;
                    }
                }

                if (!conditionData.relation) {
                    message.error('请选择关系运算符');
                    return;
                }
                if (!conditionData.value) {
                    message.error('请输入比较值');
                    return;
                }
            }
        }

        closeDiaolg(dataConfig);
    };

    return (
        <div style={{ position: 'relative', padding: 16 }}>
            {/* 自定义关闭图标（悬浮在子组件右上角） */}
            <ShrinkOutlined
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    cursor: 'pointer',
                    fontSize: 16,
                    color: '#999',
                }}
                onClick={handleCustomClose}
            />
            {/* 子组件的表单内容 */}
            <Typography.Title level={5} style={{ position: 'absolute', top: 0, fontSize: '15px' }}>
                绑定页面元素操作结果
            </Typography.Title>
            {/* 顶部条件逻辑 */}
            <div style={{ marginBottom: 16, marginTop: 16 }}>
                <span>满足以下</span>
                <Select value={dataConfig.rule} onChange={handleRuleChange}>
                    {ruleTypes.map((item: any) => (
                        <Select.Option key={item.name} value={item.value}>
                            {item.name}
                        </Select.Option>
                    ))}
                </Select>
                <span>条件时，流程将继续按当前分支执行。</span>
            </div>

            {/* 操作结果展示 */}
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
                <span>操作结果展示</span>
                <Input value={dataConfig.operationRes} onChange={handleResultChange} style={{ width: '150px' }} placeholder="请输入" />
                <span>，分支状态*为</span>
                <Select value={dataConfig.status} onChange={handleStatusChange}>
                    {statusTypes.map((item: any) => (
                        <Select.Option key={item.name} value={item.value}>
                            {item.name}
                        </Select.Option>
                    ))}
                </Select>
            </div>

            {/* 条件列表 */}
            <div>
                {dataConfig.conditionList &&
                    dataConfig.conditionList.map((item) => (
                        <div
                            key={item.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: 12,
                                gap: 8,
                            }}
                        >
                            {/* 组件元素 */}
                            {branchType !== "VA" && <Select
                                style={{ width: '160px' }}
                                placeholder="请选择"
                                value={branchType === 'MT' ? item.atomId : item.filedKey}
                                onChange={(newValue) => handleFiledKeyChange(newValue, item.id)}
                            >
                                <Select.Option value="" disabled style={{ display: 'none' }}>
                                    {branchType === 'MT' ? '请选择当前组件元素' : '请选择'}
                                </Select.Option>
                                {branchType === 'MT' &&
                                    formAtomList.map((item) => (
                                        <Select.Option key={item.name} value={item.value}>
                                            {item.name}
                                        </Select.Option>
                                    ))}
                                {branchType === 'AT' &&
                                    outParamsList.map((item) => (
                                        <Select.Option key={item.name} value={item.value}>
                                            {item.name}
                                        </Select.Option>
                                    ))}
                            </Select>}
                            {/* 关系== */}
                            <Select
                                style={{ width: 80 }}
                                placeholder="请选择"
                                value={item.relation}
                                onChange={(newValue) => handleRelationChange(newValue, item.id)}
                            >
                                <Select.Option value="" disabled style={{ display: 'none' }}>
                                    请选择
                                </Select.Option>
                                {relationData.map((item: any) => (
                                    <Select.Option key={item.name} value={item.value}>
                                        {item.name}
                                    </Select.Option>
                                ))}
                            </Select>
                            <Input
                                value={item.value}
                                style={{ width: '150px' }}
                                placeholder="请输入枚举值"
                                onChange={(e) => handleValueChange(e, item.id)}
                            />
                            <button
                                onClick={() => {
                                    if (item.id) {
                                        handleRemoveCondition(item.id);
                                    }
                                }}
                                style={{
                                    color: '#ef4444',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: 18,
                                }}
                            >
                                ×
                            </button>
                        </div>
                    ))}
            </div>

            {/* 添加条件按钮 */}
            <button
                onClick={handleAddCondition}
                style={{
                    color: '#90c31f',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    marginTop: 8,
                }}
            >
                + 添加条件
            </button>
        </div>
    );
};

export default ConditionModal;
