/**
 * 用例列表组件
 * 展示所有用例及其分支，支持添加/删除用例、添加/删除分支、选择分支
 */
import React from 'react';
import { Button, Dropdown, Space, Tooltip, message } from 'antd';
import { DeleteOutlined, DownOutlined, PlusOutlined } from '@ant-design/icons';
import styles from './TagSetting.module.less';
import type { BranchItem, CaseItem } from '../TagSetting';

interface CaseListProps {
    cases: CaseItem[];
    selectedBranchId: string | null;
    onAddCase: () => void;
    onAddBranch: (caseId: string, type: 'if' | 'elseif' | 'else') => void;
    onRemoveCase: (caseId: string) => void;
    onRemoveBranch: (caseId: string, branchId: string) => void;
    onSelectBranch: (caseId: string, branchId: string) => void;
    readOnly?: boolean;
    options?: { label: string; value: string }[];
    matchType?: 'all' | 'any';
    getConditionDescription?: (conditions: any[], matchType: 'all' | 'any') => string;
    getEventDescription?: (events: any[]) => { title: string; content: string }[];
}

/**
 * 分支内容组件
 * 显示分支类型标签（如果/再如果/其他情况）及其配置状态摘要
 */
const BranchContent: React.FC<{
    branch: BranchItem;
    selected: boolean;
    conditionDescription?: string;
}> = ({ branch, selected, conditionDescription }) => {
    const getLabel = () => {
        switch (branch.type) {
            case 'if': return '如果';
            case 'elseif': return '再如果';
            case 'else': return '其他情况';
        }
    };

    const conditionCount = branch.config?.conditions?.length || 0;

    const hasConditionDescription = !!conditionDescription;
    const hasAnyConfig = conditionCount > 0;

return (
        <div className={`${styles.branchBlock} ${branch.type === 'else' ? styles.elseBlock : ''} ${selected ? styles.branchSelected : ''}`}>
            <div className={styles.branchHeader}>
                <span className={styles.branchText}>{getLabel()}</span>
                {hasConditionDescription && (
                    <Tooltip title={conditionDescription.replace(/^\(|\)$/g, '')} placement="topLeft">
                        <span className={styles.branchCondition}>：{conditionDescription}</span>
                    </Tooltip>
                )}
                {!hasConditionDescription && hasAnyConfig && <span className={styles.branchCondition}>：已配置 {conditionCount} 项</span>}
            </div>
        </div>
    );
};

/**
 * 触发结果汇总区域组件
 * 显示当前用例中被选中分支的触发结果，只在有选中分支时渲染
 */
const TriggerResultsSummary: React.FC<{
    caseItem: CaseItem;
    selectedBranchId: string | null;
    getEventDescription?: (events: any[]) => { title: string; content: string }[];
}> = ({ caseItem, selectedBranchId, getEventDescription }) => {
    const selectedBranch = caseItem.branches.find((b) => b.id === selectedBranchId);

    if (!selectedBranch || !getEventDescription) return null;

    const eventDescriptions = getEventDescription(selectedBranch.config?.events || []);
    if (eventDescriptions.length === 0) return null;

    return (
        <div className={styles.triggerResultsSummary}>
            <div className={styles.summaryTitle}>触发结果</div>
            {eventDescriptions.map((event, index) => (
                <div key={index} className={styles.eventResultBlock}>
                    <div className={styles.eventResultTitle}>{event.title}</div>
                    <div className={styles.eventResultContent}>{event.content}</div>
                </div>
            ))}
        </div>
    );
};

/**
 * 用例项组件
 * 展示单个用例，包含分支列表和操作按钮
 */
const CaseItemComponent: React.FC<{
    caseItem: CaseItem;
    selectedBranchId: string | null;
    onAddBranch: (caseId: string, type: 'if' | 'elseif' | 'else') => void;
    onRemoveCase: (caseId: string) => void;
    onRemoveBranch: (caseId: string, branchId: string) => void;
    onSelectBranch: (caseId: string, branchId: string) => void;
    readOnly?: boolean;
    conditionDescription?: (conditions: any[], matchType: 'all' | 'any') => string;
    matchType?: 'all' | 'any';
    getEventDescription?: (events: any[]) => { title: string; content: string }[];
}> = ({ caseItem, selectedBranchId, onAddBranch, onRemoveCase, onRemoveBranch, onSelectBranch, readOnly, conditionDescription, matchType = 'all', getEventDescription }) => {
    const hasIf = caseItem.branches.some((b) => b.type === 'if');
    const hasElseif = caseItem.branches.some((b) => b.type === 'elseif');
    const hasElse = caseItem.branches.some((b) => b.type === 'else');

const handleRemoveBranch = (branchId: string, branchType: 'if' | 'elseif' | 'else') => {
        if (branchType === 'if' && (hasElseif || hasElse)) {
            message.warning('该分支下已添加"再如果"或"其他情况"条件，无法删除"如果"分支');
            return;
        }
        onRemoveBranch(caseItem.id, branchId);
    };

    const items = [
        {
            key: 'if',
            label: '添加如果',
            disabled: hasIf || readOnly,
        },
        {
            key: 'elseif',
            label: '添加再如果',
            disabled: !hasIf || hasElse || readOnly,
        },
        {
            key: 'else',
            label: '添加其他情况',
            disabled: !hasIf || hasElse || readOnly,
        },
    ].filter((item) => !item.disabled);

    const handleAddBranch = (type: 'if' | 'elseif' | 'else') => {
        onAddBranch(caseItem.id, type);
    };

    return (
        <div className={styles.caseItem}>
            <div className={styles.caseHeader}>
                <span className={styles.caseTitle}>规则{caseItem.number}</span>
                <Space size={4}>
                    <Dropdown menu={{ items, onClick: ({ key }) => handleAddBranch(key as 'if' | 'elseif' | 'else') }} trigger={['click']} disabled={readOnly}>
                        <Button type="link" size="small" style={{ padding: '0 4px', color: '#52c41a', fontSize: 12 }}>
                            +添加分支 <DownOutlined />
                        </Button>
                    </Dropdown>
                    {!readOnly && (
                        <Button type="link" size="small" icon={<DeleteOutlined />} style={{ color: '#ff4d4f', padding: 0 }} onClick={() => onRemoveCase(caseItem.id)} />
                    )}
                </Space>
            </div>

            <div className={styles.branchesAndResults}>
                <div className={styles.caseBranches}>
                    {caseItem.branches.map((branch) => (
                        <div key={branch.id} className={styles.branchContainer} onClick={() => onSelectBranch(caseItem.id, branch.id)}>
                            <div className={styles.branchRow}>
                                <BranchContent
                                    branch={branch}
                                    selected={selectedBranchId === branch.id}
                                    conditionDescription={conditionDescription ? conditionDescription(branch.config?.conditions || [], branch.config?.matchType || 'all') : undefined}
                                />
                                {!readOnly && (
                                    <Button
                                        type="link"
                                        size="small"
                                        icon={<DeleteOutlined />}
                                        style={{ color: '#ff4d4f', padding: 0, marginLeft: 4 }}
                                        onClick={(e) => { e.stopPropagation(); handleRemoveBranch(branch.id, branch.type); }}
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <TriggerResultsSummary
                    caseItem={caseItem}
                    selectedBranchId={selectedBranchId}
                    getEventDescription={getEventDescription}
                />
            </div>
        </div>
    );
};

/**
 * 用例列表组件
 * 容器组件，渲染所有用例项和触发结果汇总
 */
const CaseList: React.FC<CaseListProps> = ({ cases, selectedBranchId, onAddCase, onAddBranch, onRemoveCase, onRemoveBranch, onSelectBranch, readOnly, getConditionDescription, matchType, getEventDescription }) => {
    return (
        <div className={styles.colLeft}>
            <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>设置规则</span>
                {!readOnly && (
                    <Button type="primary" size="small" icon={<PlusOutlined />} style={{ background: '#90C31F', borderColor: '#90C31F', color: '#fff' }} onClick={onAddCase}>
                        添加规则
                    </Button>
                )}
            </div>

            {cases.map((caseItem) => (
                <CaseItemComponent
                    key={caseItem.id}
                    caseItem={caseItem}
                    selectedBranchId={selectedBranchId}
                    onAddBranch={onAddBranch}
                    onRemoveCase={onRemoveCase}
                    onRemoveBranch={onRemoveBranch}
                    onSelectBranch={onSelectBranch}
                    readOnly={readOnly}
                    conditionDescription={getConditionDescription}
                    matchType={matchType}
                    getEventDescription={getEventDescription}
                />
            ))}
        </div>
    );
};

export default CaseList;
