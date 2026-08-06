/**
 * 触发条件组件
 * 用于配置分支的触发条件，支持添加、删除条件
 */
import React from 'react';
import { Row, Col, Input, Button, Select } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from './TagSetting.module.less';

const { Option } = Select;

/**
 * 条件项接口
 */
export interface ConditionItem {
    id: string;
    column: string;
    operator: string;
    value: string;
}

interface TriggerConditionsProps {
    /** 条件列表 */
    conditions: ConditionItem[];
    /** 条件变化回调 */
    onChange?: (conditions: ConditionItem[]) => void;
    /** 添加条件回调 */
    onAdd?: () => void;
    /** 是否只读模式 */
    readOnly?: boolean;
    /** 列字段选项 */
    options?: { label: string; value: string }[];
    /** 匹配类型 */
    matchType?: 'all' | 'any';
    /** 匹配类型变化回调 */
    onMatchTypeChange?: (type: 'all' | 'any') => void;
    /** 当前列字段 */
    currentColumn?: string;
    /** 当前列标题 */
    currentColumnTitle?: string;
}

/**
 * 生成唯一ID
 */
export const generateId = () => Math.random().toString(36).substring(2, 9);

/**
 * 触发条件组件
 * 展示条件配置区域，包含条件匹配方式（全部/任意）和条件列表
 */
const TriggerConditions: React.FC<TriggerConditionsProps> = ({ conditions, onChange, onAdd, readOnly, options, matchType = 'all', onMatchTypeChange, currentColumn, currentColumnTitle }) => {
    const defaultColumnValue = currentColumn || options?.[0]?.value || '';

    return (
        <div className={styles.conditionArea}>
            <div className={styles.conditionRow}>
                <span>符合</span>
                <Select value={matchType} style={{ width: 100 }} disabled={readOnly} onChange={onMatchTypeChange}>
                    <Option value="all">全部</Option>
                    <Option value="any">任意</Option>
                </Select>
                <span>以下条件</span>
                {!readOnly && onAdd && (
                    <Button type="link" size="small" icon={<PlusOutlined />} style={{ color: '#52c41a', padding: 0, fontSize: 12, marginLeft: 'auto' }} onClick={onAdd}>
                        添加条件
                    </Button>
                )}
            </div>

            <div className={styles.nestedCondition}>
                <Row gutter={6} className={styles.conditionHeader}>
                    <Col span={7}>
                        <span className={styles.conditionHeaderLabel}>选择列</span>
                    </Col>
                    <Col span={6}>
                        <span className={styles.conditionHeaderLabel}>比较逻辑</span>
                    </Col>
                    <Col span={7}>
                        <span className={styles.conditionHeaderLabel}>比较值</span>
                    </Col>
                    <Col span={1} />
                </Row>
                {conditions.map((condition, index) => (
                    <Row key={condition.id} gutter={6} align="middle" style={{ marginBottom: 8 }}>
                        <Col span={7}>
                            <Select
                                value={condition.column || defaultColumnValue}
                                style={{ width: '100%' }}
                                onChange={(val) => {
                                    if (onChange) {
                                        const updated = [...conditions];
                                        updated[index] = { ...updated[index], column: val };
                                        onChange(updated);
                                    }
                                }}
                                disabled={readOnly}
                            >
                                {options?.map((opt) => (
                                    <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                                ))}
                            </Select>
                        </Col>
                        <Col span={6}>
                            <Select
                                value={condition.operator || undefined}
                                style={{ width: '100%' }}
                                onChange={(val) => {
                                    if (onChange) {
                                        const updated = [...conditions];
                                        updated[index] = { ...updated[index], operator: val };
                                        onChange(updated);
                                    }
                                }}
                                disabled={readOnly}
                            >
                                <Option value="eq">等于</Option>
                                <Option value="neq">不等于</Option>
                                <Option value="gt">大于</Option>
                                <Option value="gte">大于等于</Option>
                                <Option value="lt">小于</Option>
                                <Option value="lte">小于等于</Option>
                                <Option value="contains">包含</Option>
                                <Option value="notContains">不包含</Option>
                            </Select>
                        </Col>
                        <Col span={7}>
                            <Input
                                placeholder="请输入比较值"
                                value={condition.value}
                                onChange={(e) => {
                                    if (onChange) {
                                        const updated = [...conditions];
                                        updated[index] = { ...updated[index], value: e.target.value };
                                        onChange(updated);
                                    }
                                }}
                                disabled={readOnly}
                            />
                        </Col>
                        <Col span={1}>
                            {!readOnly && (
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    className={styles.deleteBtn}
                                    onClick={() => {
                                        if (onChange) {
                                            onChange(conditions.filter((_, i) => i !== index));
                                        }
                                    }}
                                />
                            )}
                        </Col>
                    </Row>
                ))}
            </div>
        </div>
    );
};

export { TriggerConditions };
