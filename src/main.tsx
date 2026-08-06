import './polyfills';
import './styles/antd-compat-chrome8x.css';
import './utils/logCapture';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
window.zxhtest = 1;
// 屏蔽鼠标右键菜单
document.addEventListener('contextmenu', (e) => {
    e.preventDefault(); // 阻止默认右键菜单
});

// 屏蔽键盘触发右键菜单（Shift+F10/键盘右键菜单键）
document.addEventListener('keydown', (e) => {
    if ((e.shiftKey && e.keyCode === 121) || e.keyCode === 93) {
        e.preventDefault();
    }
});
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
