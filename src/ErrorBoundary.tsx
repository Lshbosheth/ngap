import React, { Component, ReactNode } from 'react';
import FailPng from './assets/icons/failed_to_load2.png';
interface Props {
    fallback?: any;
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // 可在这里上报日志
        console.error('组件崩溃:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                this.props.fallback || (
                    <div style={{ padding: '24px', textAlign: 'center' }}>
                        <img style={{ width: '360px', height: '234px' }} src={FailPng} />
                        <h3 style={{ color: '#262626', margin: '6px 0 2px 0' }}>当前页面加载出错</h3>
                        <p style={{ color: '#595959' }}>请关闭后重新打开</p>
                        {/* <p>{this.state.error?.message}</p> */}
                        {/* <button
                            onClick={() => {
                                window.location.reload()
                            }}
                            style={{ marginTop: 12 }}
                        >
                            刷新页面
                        </button> */}
                    </div>
                )
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
