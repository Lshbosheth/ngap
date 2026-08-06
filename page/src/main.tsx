import '@editor/polyfills';
import '@editor/styles/antd-compat-chrome8x.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

let librariesMounted = false;

async function mountGlobalLibraries() {
    if (librariesMounted) return;
    try {
        const [antd, antdIcons, Plots, echarts] = await Promise.all([
            import('antd'),
            import('@ant-design/icons'),
            import('@ant-design/plots'),
            import('echarts')
        ]);
        (window as any).antd = antd;
        (window as any).antdIcons = antdIcons;
        (window as any).Plots = Plots;
        (window as any).echarts = echarts;
        librariesMounted = true;
    } catch (error) {
        console.error('挂载全局库失败:', error);
    }
}

export const clearGlobalLibraries = () => {
    delete (window as any).antd;
    delete (window as any).antdIcons;
    delete (window as any).Plots;
    delete (window as any).echarts;
    delete (window as any).Babel;
    delete (window as any).__BABEL_STANDALONE_LOADER__;
    delete (window as any).__NGAP_UTILS__;
    delete (window as any).__NGAP_COMPONENTS__;
    librariesMounted = false;
};

window.addEventListener('beforeunload', () => {
    clearGlobalLibraries();
});

try {
    function loadOldScript(url: string) {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        document.body.appendChild(script);
        const append = () => {
            script.onload = function () {
                const Monitor = window?.__MONITOR_SDK__?.default;
                if (Monitor) {
                window._monitor = Monitor('bci65h8yufjolt0e', {
                    host: 'cmxt.cs.cmos:8081',
                    scheme: 'https',
                    compress: true,
                    hashtag: true,
                    debug: false,
                });
                }
            };
        };
        append();
    }
    loadOldScript('./../static/index.browser.js');
} catch (error) {
    throw {
        message: '加载日志SDK失败',
        error: error
    };
}

mountGlobalLibraries();
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
