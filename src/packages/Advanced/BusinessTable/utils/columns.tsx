import { formatDate, formatNumber } from '@/packages/utils/util';
import { isEmpty } from 'lodash-es';
import { ActionType } from '../TagSetting/TriggerEventItem';

export const formatCellValue = (value: any, type: string) => {
    if (isEmpty(value)) return '-';
    if (type === 'money') return formatNumber(value, 'currency');
    if (type === 'number') return formatNumber(value);
    if (type === 'date1') return formatDate(value, 'YYYY-MM-DD');
    if (type === 'date2') return formatDate(value);
    return String(value);
};

type TagSettingIconResultItem = {
    iconUrl: string;
    iconPosition: string;
    iconSize?: string;
    showTooltip?: boolean;
    tooltipContent?: string;
    columns?: string[];
};

// 评估标签配置的ShowIcon事件
export const TagSettingIcons = (item: any, record: any) => {
    const tagSettingIconResult: TagSettingIconResultItem[] = [];

    if (!item.tagSetting?.length) return tagSettingIconResult;

    const handleOperator = (operator: string, value: string, recordVal: string) => {
        let met = false;
        switch (operator) {
            case 'eq':
                met = value == recordVal;
                break;
            case 'neq':
                met = value != recordVal;
                break;
            case 'gt':
                met = Number(value) > Number(recordVal);
                break;
            case 'gte':
                met = Number(value) >= Number(recordVal);
                break;
            case 'lt':
                met = Number(value) < Number(recordVal);
                break;
            case 'lte':
                met = Number(value) <= Number(recordVal);
                break;
            case 'contains':
                met = String(value).includes(recordVal);
                break;
            case 'notContains':
                met = !String(value).includes(recordVal);
                break;
        }
        return met;
    };

    const handleMatchType = (matchType: string, conditions: any[]) => {
        for (const { value, operator, column } of conditions) {
            const isMeets = handleOperator(operator, value, record[column]);
            if (matchType === 'all' && !isMeets) {
                return false;
            } else if (matchType !== 'all' && isMeets) {
                return true;
            }
        }
        return matchType === 'all';
    };

    const handleTagSettingIcon = (caseItem: any) => {
        for (const branch of caseItem.branches || []) {
            const { conditions = [], events = [], matchType = 'all' } = branch.config || {};
            if (!conditions.length) continue;
            const conditionsMet = handleMatchType(matchType, conditions);
            if (conditionsMet) {
                for (const event of events) {
                    if (event.action === ActionType.ShowIcon && event.iconUrl) {
                        tagSettingIconResult.push({
                            iconUrl: event.iconUrl,
                            iconPosition: event.position || 'prefix',
                            iconSize: event.iconSize,
                            showTooltip: event.showTooltip,
                            tooltipContent: event.tooltipContent,
                            columns: event.columns,
                        });
                    }
                }
            }
        }
    };

    for (const caseItem of item.tagSetting) handleTagSettingIcon(caseItem);

    return tagSettingIconResult;
};
