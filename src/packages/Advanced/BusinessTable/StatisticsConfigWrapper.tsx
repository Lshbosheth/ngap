import React from 'react';
import { Form } from 'antd';
import StatisticsConfig from './StatisticsConfig';

interface StatisticsConfigWrapperProps {
    form: any;
    config: any;
}

const StatisticsConfigWrapper: React.FC<StatisticsConfigWrapperProps> = ({ form, config }) => {
    const formColumns = Form.useWatch(['columns'], form);
    const columns = (formColumns || []).length > 0 ? formColumns : (config?.props?.columns || []);
    return <StatisticsConfig data={{ form, config }} columns={columns} />;
};

export default StatisticsConfigWrapper;
