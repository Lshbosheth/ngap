import { useRef } from 'react';
import type { ColumnType, FilterDropdownProps } from 'antd/es/table/interface';
import { Button, Input, Space } from 'antd';
import { FunnelPlotOutlined, SearchOutlined } from '@ant-design/icons';

interface TextFilterDropdownProps extends FilterDropdownProps {
    dataIndex: string;
    onFilterChange: (key: string, value: string | undefined) => void;
}

const TextFilterDropdown: React.FC<TextFilterDropdownProps> = ({
    dataIndex,
    selectedKeys,
    close,
    confirm,
    clearFilters,
    onFilterChange,
    setSelectedKeys,
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSelectedKeys(value ? [value] : []);
    };

    const handleReset = (clearFilters: () => void) => {
        clearFilters();
        onFilterChange(dataIndex, undefined);
    };

    const handleQuery = () => {
        confirm();
        onFilterChange(dataIndex, selectedKeys?.[0] as string);
    };

    return (
        <div style={{ padding: 12, width: 260 }} onKeyDown={(e) => e.stopPropagation()}>
            <Input
                placeholder={`请输入${dataIndex}`}
                value={selectedKeys[0]}
                onChange={handleChange}
                onPressEnter={handleQuery}
                allowClear
                prefix={<SearchOutlined />}
                style={{ marginBottom: 12 }}
                autoFocus
            />
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button size="small" onClick={() => clearFilters && handleReset(clearFilters)}>
                    重置
                </Button>
                <Button type="primary" size="small" onClick={handleQuery}>
                    确定
                </Button>
                <Button
                    type="link"
                    size="small"
                    onClick={() => {
                        close();
                    }}
                >
                    关闭
                </Button>
            </Space>
        </div>
    );
};

function getTextFilterConfig<T>(
    dataIndex: string,
    onFilterChange: (key: string, value: string | undefined) => void,
): Pick<ColumnType<T>, 'filterDropdown' | 'filterIcon'> {
    return {
        filterDropdown: (props) => <TextFilterDropdown {...props} dataIndex={dataIndex} onFilterChange={onFilterChange} />,
        filterIcon: (filtered) => <FunnelPlotOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
    };
}

// Column Filter 配置：服务端筛选s
const filterConfig = (item: any, callback: TextFilterDropdownProps['onFilterChange']) =>
    item.filter ? getTextFilterConfig(item.dataIndex, callback) : {};

export { filterConfig };
