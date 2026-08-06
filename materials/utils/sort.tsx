import { Tooltip } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, SortAscendingOutlined } from '@ant-design/icons';
import { MixedTypeSorter } from './windowSort';

/**
 * 数字排序（金额千分位、数字千分位）
 * 正序：小 → 大，倒序：大 → 小
 */
const numberSort = (a: string, b: string) => {
    const valA = parseFloat(String(a).replace(/,/g, '')) || 0;
    const valB = parseFloat(String(b).replace(/,/g, '')) || 0;
    return valA - valB;
};

/**
 * 日期排序
 * 正序：时间早 → 时间晚，倒序：时间晚 → 时间早
 */
const dateSort = (a: string, b: string) => {
    const timeA = new Date(a).getTime() || 0;
    const timeB = new Date(b).getTime() || 0;
    return timeA - timeB;
};

/**
 * 布尔/状态等不排序，返回 0（保持原顺序）
 */
const noSort = () => 0;

interface RecordData {
    id: string | number;
    [key: string]: any;
}
export interface SorterItemProps {
    type: string;
    dataIndex: string;
    sortable?: boolean;
    sortableType?: string;
    [key: string]: any;
}
// 获取排序函数
export const getSorter = (item?: SorterItemProps) => {
    if (!item) return () => 0;
    const { dataIndex, sortable, sortableType, type } = item;
    if (!sortable) return () => 0;
    if (sortableType === 'static') {
        // 前端排序
        return (a: RecordData, b: RecordData) => {
            const valA = a[dataIndex];
            const valB = b[dataIndex];

            let result;
            switch (type) {
                case 'number':
                case 'money':
                    result = numberSort(valA, valB);
                    break;
                case 'date1':
                case 'date2':
                    result = dateSort(valA, valB);
                    break;
                case 'text':
                case 'multiline':
                    result = MixedTypeSorter.compare(valA, valB);
                    break;
                case 'boolean':
                case 'status':
                case 'image':
                case 'tag':
                case 'action':
                default:
                    result = noSort();
            }
            return result;
        };
    } else {
        return () => 0;
    }
};
// 自定义排序图标
const getSortIcon = (item: SorterItemProps) => {
    const { type: dataType, sortable } = item;
    return ({ sortOrder }: { sortOrder?: 'ascend' | 'descend' }) => {
        if (!sortable) return null;

        if (!sortOrder) return <SortAscendingOutlined style={{ color: '#bfbfbf' }} />;

        const isAscend = sortOrder === 'ascend';

        // 根据数据类型显示不同提示
        let tooltip = '';
        switch (dataType) {
            case 'number':
            case 'money':
                tooltip = isAscend ? '从小到大排序' : '从大到小排序';
                break;
            case 'date1':
            case 'date2':
                tooltip = isAscend ? '时间从早到晚' : '时间从晚到早';
                break;
            case 'text':
            case 'multiline':
                tooltip = isAscend ? '数字→大写→小写→中文' : '中文→小写→大写→数字';
                break;
            default:
                tooltip = isAscend ? '正序' : '倒序';
        }

        return (
            <Tooltip title={tooltip}>
                {isAscend ? <ArrowUpOutlined style={{ color: '#1890ff' }} /> : <ArrowDownOutlined style={{ color: '#1890ff' }} />}
            </Tooltip>
        );
    };
};

// Column Sorter 配置： 1、前段排序(static) 2、服务端排序(service)
export const sortConfig = (item: any) =>
    item?.sortable
        ? {
              //   sorter: getSorter(item),
              sorter: true,
              sortIcon: getSortIcon(item),
              sortDirections: ['ascend', 'descend'],
              showSorterTooltip: false, // 禁用默认 tooltip，用自定义的
          }
        : {};
