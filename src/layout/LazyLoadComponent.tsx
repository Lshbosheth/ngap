// components/LazyLoadComponent.tsx
import React, { Suspense } from 'react';
import { Spin } from 'antd';

interface LazyComponentProps {
    LazyLoadComponent: React.LazyExoticComponent<React.ComponentType<any>>;
    initialParams?: any; // 初始参数
}

const LazyLoadComponent: React.FC<LazyComponentProps> = ({ LazyLoadComponent, initialParams }) => {
    return (
        <Suspense
            fallback={
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '300px',
                    }}
                >
                    <Spin tip="页面加载中..." />
                </div>
            }
        >
            <LazyLoadComponent initialParams={initialParams} />
        </Suspense>
    );
};

export default LazyLoadComponent;
