import React, { useEffect, useRef, useState } from 'react';
// import "./index.less";
import { Layout, Tabs } from 'antd';
const { TabPane } = Tabs;
import AuditManagement from './pages/AuditManagement';
import AuditRecord from './pages/AuditRecord';

const Page: React.FC = () => {
    const [activeKey, setActiveKey] = useState('1');

    // 当Tab变化时更新activeKey
    const handleTabChange = (key: string) => {
        setActiveKey(key);
    };
    const items = [
        { label: '审核管理', key: '1' },
        { label: '审核记录', key: '2' },
    ];
    return (
        <div>
            <Tabs className="" activeKey={activeKey} onChange={handleTabChange} items={items} style={{ padding: 0, marginBottom: '5px' }}></Tabs>
            {/* 根据activeKey条件渲染对应的组件 */}
            {activeKey === '1' ? <AuditManagement /> : <AuditRecord />}
        </div>
    );
};
export default Page;
