import React, { useState, useCallback, useEffect } from 'react';
import { Input, Select } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useAppContext } from '../../../utils/AppProvider';

interface StatisticsConfigItem {
    id: number;
    name: string;
    columns: any[];
}

interface StatisticsConfigProps {
    data: any;
    columns?: any[];
}

const StatisticsConfig: React.FC<StatisticsConfigProps> = ({ data, columns = [] }) => {
    const { pageStore } = useAppContext();
    const selectedElement = pageStore((state: any) => state.selectedElement);
    const editTableProps = pageStore((state: any) => state.editTableProps);
    const elementsMap = pageStore((state: any) => state.page.pageData.elementsMap);

    const elementConfig = selectedElement?.id ? elementsMap[selectedElement.id] : undefined;
    const storeStats: StatisticsConfigItem[] = elementConfig?.config?.props?.statisticsConfig || [];
    const [stats, setStats] = useState<StatisticsConfigItem[]>(storeStats);

    useEffect(() => {
        if (Array.isArray(storeStats)) {
            setStats(storeStats);
        }
    }, [storeStats]);

    const columnOptions = [
        ...columns.map((col: any) => {
            const label = col.title?.value || col.title || col.dataIndex;
            return {
                label: typeof label === 'string' ? label : (col.dataIndex || ''),
                value: col.dataIndex,
            };
        }),
        { label: '选中列', value: '__selectedColumns__' },
    ];

    const syncToStore = useCallback((newStats: StatisticsConfigItem[]) => {
        setStats(newStats);
        if (data?.form) {
            data.form.setFieldValue(['statisticsConfig'], newStats);
        }
        if (selectedElement?.id && editTableProps) {
            editTableProps({
                id: selectedElement.id,
                type: 'props',
                props: { statisticsConfig: newStats },
            });
        }
    }, [selectedElement, editTableProps, data?.form]);

    const addStatBox = useCallback(() => {
        const newStats: StatisticsConfigItem[] = [
            ...stats,
            {
                id: Date.now(),
                name: '数据统计',
                columns: [],
            },
        ];
        syncToStore(newStats);
    }, [stats, syncToStore]);

    const removeStatBox = useCallback((id: number) => {
        const newStats = stats.filter(s => s.id !== id);
        syncToStore(newStats);
    }, [stats, syncToStore]);

    const updateStatBox = useCallback((id: number, field: string, value: any) => {
        const newStats = stats.map(s => {
            if (s.id === id) {
                return { ...s, [field]: value };
            }
            return s;
        });
        syncToStore(newStats);
    }, [stats, syncToStore]);

    return (
        <div style={{ marginLeft: '10px' }}>
            <div onClick={addStatBox} style={{ color: '#52c41a', width: '90px', cursor: 'pointer', marginBottom: '12px', fontSize: '14px' }}>
                + 新增统计框
            </div>
            {stats.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ width: '150px', fontSize: '14px', color: '#333' }}>统计名称</div>
                    <div style={{ width: '150px', fontSize: '14px', color: '#333' }}>选择列</div>
                    <div style={{ width: '32px', marginLeft: '16px' }}></div>
                </div>
            )}
            {stats.map((stat) => (
                <div
                    key={stat.id}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '8px',
                    }}
                >
                    <div style={{ width: '130px' }}>
                        <Input
                            value={stat.name}
                            onChange={(e) => updateStatBox(stat.id, 'name', e.target.value)}
                            placeholder="请输入"
                            style={{ height: '36px' }}
                        />
                    </div>
                    <div style={{ width: '150px', marginLeft: '10px' }}>
                        <Select
                            value={stat.columns?.[0]}
                            onChange={(value) => updateStatBox(stat.id, 'columns', value ? [value] : [])}
                            options={columnOptions}
                            placeholder="请选择"
                            style={{ width: '100%', height: '36px' }}
                        />
                    </div>
                    <div style={{ width: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <DeleteOutlined
                            style={{ color: '#ff4d4f', cursor: 'pointer', fontSize: '18px' }}
                            onClick={() => removeStatBox(stat.id)}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatisticsConfig;
