/**
 * 标签设置主组件
 * 用于配置表格列的标签规则，支持多用例、多分支条件判断
 * 左侧展示用例和分支列表，右侧展示选中分支的触发条件和触发事件配置
 */
import React, { useState, useMemo, useEffect } from 'react';
import { Row, Col, Form, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import CaseList from './TagSetting/CaseList';
import { TriggerConditions, generateId } from './TagSetting/TriggerConditions';
import { TriggerEvents } from './TagSetting/TriggerEvents';
import type { ConditionItem } from './TagSetting/TriggerConditions';
import type { EventItem } from './TagSetting/TriggerEventItem';
import { ActionType } from './TagSetting/TriggerEventItem';
import styles from './TagSetting/TagSetting.module.less';

/**
 * 分支配置接口
 */
export interface BranchConfig {
    conditions: ConditionItem[];
    events: EventItem[];
    matchType?: 'all' | 'any';
}

/**
 * 分支项接口
 */
export interface BranchItem {
    id: string;
    type: 'if' | 'elseif' | 'else';
    config?: BranchConfig;
}

/**
 * 用例项接口
 */
export interface CaseItem {
    id: string;
    number: number;
    branches: BranchItem[];
}

const getDefaultColumn = (currentColumn?: string, options?: { label: string; value: string }[]) => {
    return currentColumn || options?.[0]?.value || 'flow';
};

interface TagSettingProps {
    value?: CaseItem[];
    onChange?: (cases: CaseItem[]) => void;
    readOnly?: boolean;
    options?: { label: string; value: string }[];
    currentColumn?: string;
    currentColumnTitle?: string;
}

/**
 * 标签设置主组件
 * 管理用例列表和分支选中状态，协调左右两侧组件的数据同步
 */
const TagSetting: React.FC<TagSettingProps> = ({ value, onChange, readOnly, options, currentColumn, currentColumnTitle }) => {
    const defaultColumn = getDefaultColumn(currentColumn, options);
    const initialCases: CaseItem[] = value || [
        {
            id: generateId(),
            number: 1,
            branches: [
                {
                    id: generateId(),
                    type: 'if',
                    config: {
                        conditions: [{ id: generateId(), column: defaultColumn, operator: 'lte', value: '0' }],
                        events: [
                            { id: generateId(), action: ActionType.SetRowBgColor, color: '#fee6e6', columns: currentColumn ? [currentColumn] : [] },
                        ],
                    },
                },
            ],
        },
    ];

    const [cases, setCases] = useState<CaseItem[]>(initialCases);
    const [selectedBranchInfo, setSelectedBranchInfo] = useState<{ caseId: string; branchId: string } | null>(null);
    const [matchType, setMatchType] = useState<'all' | 'any'>('all');

    // 选中分支时，同步加载分支的 matchType
    const handleSelectBranch = (caseId: string, branchId: string) => {
        const caseItem = cases.find((c) => c.id === caseId);
        const branch = caseItem?.branches.find((b) => b.id === branchId);
        if (branch?.config?.matchType) {
            setMatchType(branch.config.matchType);
        } else {
            setMatchType('all');
        }
        setSelectedBranchInfo({ caseId, branchId });
    };

    // 外部 value 变化时同步内部状态
    useEffect(() => {
        if (value) {
            setCases(value);
            // 重置选中状态（不自动选中分支）
            setSelectedBranchInfo(null);
        }
    }, [value]);

    // 内部状态变化时通知外部
    useEffect(() => {
        onChange?.(cases);
    }, [cases, onChange]);

    // 计算当前选中的分支
    const selectedBranch = useMemo(() => {
        if (!selectedBranchInfo) return null;
        const caseItem = cases.find((c) => c.id === selectedBranchInfo.caseId);
        if (!caseItem) return null;
        return caseItem.branches.find((b) => b.id === selectedBranchInfo.branchId) || null;
    }, [cases, selectedBranchInfo]);

    const handleAddCase = () => {
        setCases((prev) => [
            ...prev,
            { id: generateId(), number: prev.length + 1, branches: [] },
        ]);
    };

    const handleRemoveCase = (caseId: string) => {
        setCases((prev) => {
            const filtered = prev.filter((c) => c.id !== caseId);
            const renumbered = filtered.map((c, index) => ({ ...c, number: index + 1 }));
            if (selectedBranchInfo?.caseId === caseId) {
                setSelectedBranchInfo(null);
            }
            return renumbered;
        });
    };

    const handleAddBranch = (caseId: string, type: 'if' | 'elseif' | 'else') => {
        setCases((prev) =>
            prev.map((c) =>
                c.id === caseId
                    ? {
                          ...c,
                          branches: [
                              ...c.branches,
                              {
                                  id: generateId(),
                                  type,
                                  config: {
                                      conditions: [],
                                      events: [],
                                  },
                              },
                          ],
                      }
                    : c
            )
        );
    };

    const handleRemoveBranch = (caseId: string, branchId: string) => {
        setCases((prev) =>
            prev.map((c) =>
                c.id === caseId
                    ? { ...c, branches: c.branches.filter((b) => b.id !== branchId) }
                    : c
            )
        );
        if (selectedBranchInfo?.branchId === branchId) {
            setSelectedBranchInfo(null);
        }
    };


    const handleConditionsChange = (conditions: ConditionItem[]) => {
        if (!selectedBranchInfo) return;
        setCases((prev) =>
            prev.map((c) => {
                if (c.id !== selectedBranchInfo.caseId) return c;
                return {
                    ...c,
                    branches: c.branches.map((b) => {
                        if (b.id !== selectedBranchInfo.branchId) return b;
                        return {
                            ...b,
                            config: { ...b.config, conditions } as BranchConfig,
                        };
                    }),
                };
            })
        );
    };

    const getConditionDescription = useMemo(() => {
        return (conditions: ConditionItem[], matchType: 'all' | 'any') => {
            if (conditions.length === 0) return '';
            const separator = matchType === 'all' ? ' 且 ' : ' 或 ';
            const conditionsText = conditions.map((condition) => {
                const columnLabel = options?.find((opt) => opt.value === condition.column)?.label || condition.column;
                const operatorMap: Record<string, string> = {
                    eq: '等于',
                    neq: '不等于',
                    gt: '大于',
                    gte: '大于等于',
                    lt: '小于',
                    lte: '小于等于',
                    contains: '包含',
                    notContains: '不包含',
                };
                const operatorLabel = operatorMap[condition.operator] || condition.operator;
                return `${columnLabel} ${operatorLabel} '${condition.value}'`;
            }).join(separator);
            return `(${conditionsText})`;
        };
    }, [options]);

    const getEventDescription = useMemo(() => {
        return (events: EventItem[]) => {
            if (events.length === 0) return [];
            return events.map((event) => {
                const actionMap: Record<number, string> = {
                    [ActionType.SetRowBgColor]: '设置行填充色',
                    [ActionType.SetRowTextColor]: '设置行文字色',
                    [ActionType.ShowIcon]: '设置图标',
                    [ActionType.SetOptionDisabled]: '设置行禁止勾选',
                };
                const actionTitle = actionMap[event.action] || '未知动作';

                const colorMap: Record<string, string> = {
                    '#fee6e6': '红色',
                    '#eef6de': '绿色',
                    'orange': '橙色',
                    '#f65a56': '红色',
                    '#009966': '绿色',
                    '#0085d0': '蓝色',
                    '#333333': '默认',
                };

                const getColumnLabels = (columns?: string[]) => {
                    if (!columns?.length) return '';
                    return columns.map((col) => options?.find((opt) => opt.value === col)?.label || col).join('、');
                };

                let content = '';

                if (event.action === ActionType.SetRowBgColor) {
                    const colorLabel = colorMap[event.color || ''];
                    content = colorLabel || event.color || '';
                } else if (event.action === ActionType.SetRowTextColor) {
                    const columnLabels = getColumnLabels(event.columns);
                    const colorLabel = colorMap[event.color || ''] || event.color || '';
                    content = columnLabels ? `列'${columnLabels}' ${colorLabel}` : colorLabel;
                } else if (event.action === ActionType.ShowIcon) {
                    const columnLabels = getColumnLabels(event.columns);
                    const iconName = event.iconUrl?.split('/').pop()?.split('?')[0] || '';
                    content = columnLabels ? `列'${columnLabels}'，显示图标'${iconName}'` : iconName ? `显示图标'${iconName}'` : '';
                } else if (event.action === ActionType.SetOptionDisabled) {
                    content = '';
                }

                return {
                    title: actionTitle,
                    content,
                };
            });
        };
    }, [options]);

    const handleEventsChange = (events: EventItem[]) => {
        if (!selectedBranchInfo) return;
        setCases((prev) =>
            prev.map((c) => {
                if (c.id !== selectedBranchInfo.caseId) return c;
                return {
                    ...c,
                    branches: c.branches.map((b) => {
                        if (b.id !== selectedBranchInfo.branchId) return b;
                        return {
                            ...b,
                            config: { ...b.config, events } as BranchConfig,
                        };
                    }),
                };
            })
        );
    };

    const getBranchTypeLabel = (type: 'if' | 'elseif' | 'else') => {
        switch (type) {
            case 'if': return '如果';
            case 'elseif': return '再如果';
            case 'else': return '其他情况';
        }
    };

    return (
        <div className={styles.tagSetting}>
            <div className={styles.tip}>
                温馨提示：可设置规则，并依据规则设置4类：填充色，文字色、图标显示、选项禁用
            </div>

            <Form layout="vertical">
                <Row>
                    <CaseList
                        cases={cases}
                        selectedBranchId={selectedBranchInfo?.branchId || null}
                        onAddCase={handleAddCase}
                        onAddBranch={handleAddBranch}
                        onRemoveCase={handleRemoveCase}
                        onRemoveBranch={handleRemoveBranch}
                        onSelectBranch={handleSelectBranch}
                        readOnly={readOnly}
                        options={options}
                        matchType={matchType}
                        getConditionDescription={getConditionDescription}
                        getEventDescription={getEventDescription}
                    />

                    <Col span={17} className={styles.colRight}>
                        {selectedBranch ? (
                            <>
                                <div className={styles.rightSectionHeader}>
                                    <span className={styles.sectionTitle}>
                                        {getBranchTypeLabel(selectedBranch.type)} - 触发条件
                                    </span>
                                </div>
                                <TriggerConditions
                                    conditions={selectedBranch.config?.conditions || []}
                                    onChange={handleConditionsChange}
                                    readOnly={readOnly}
                                    options={options}
                                    matchType={matchType}
                                    onMatchTypeChange={(type) => {
                                        setMatchType(type);
                                        if (selectedBranchInfo) {
                                            setCases((prev) =>
                                                prev.map((c) => {
                                                    if (c.id !== selectedBranchInfo.caseId) return c;
                                                    return {
                                                        ...c,
                                                        branches: c.branches.map((b) => {
                                                            if (b.id !== selectedBranchInfo.branchId) return b;
                                                            return {
                                                                ...b,
                                                                config: { ...b.config, matchType: type } as BranchConfig,
                                                            };
                                                        }),
                                                    };
                                                })
                                            );
                                        }
                                    }}
                                    onAdd={() => handleConditionsChange([...(selectedBranch.config?.conditions || []), { id: generateId(), column: options?.[0]?.value || '', operator: 'lte', value: '' }])}
                                />

                                <div className={styles.rightSectionHeader}>
                                    <span className={styles.sectionTitle}>
                                        {getBranchTypeLabel(selectedBranch.type)} - 触发事件
                                    </span>
                                    {!readOnly && (
                                        <Button
                                            type="link"
                                            size="small"
                                            icon={<PlusOutlined />}
                                            style={{ color: (selectedBranch.config?.events?.length || 0) >= 4 ? '#d9d9d9' : '#52c41a', padding: 0, fontSize: 12 }}
                                            disabled={(selectedBranch.config?.events?.length || 0) >= 4}
                                            onClick={() => {
                                                if ((selectedBranch.config?.events?.length || 0) < 4) {
                                                    handleEventsChange([...(selectedBranch.config?.events || []), { id: generateId(), action: ActionType.SetRowBgColor, color: '#fee6e6' }]);
                                                }
                                            }}
                                        >
                                            添加触发结果
                                        </Button>
                                    )}
                                </div>
                                <TriggerEvents
                                    events={selectedBranch.config?.events || []}
                                    onChange={handleEventsChange}
                                    readOnly={readOnly}
                                    options={options}
                                />
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                                请在左侧选择一个分支查看配置
                            </div>
                        )}
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default TagSetting;
