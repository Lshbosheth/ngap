// scripts/preinstall.js
const fs = require('fs');
const path = require('path');

// 删除可能残留的 package-lock.json 专属依赖
try {
    // Linux 环境，删除 package-lock.json（避免 Windows 残留）
    if (process.platform === 'linux') {
        const lockFile = path.resolve(__dirname, '../package-lock.json');
        if (fs.existsSync(lockFile)) {
            fs.unlinkSync(lockFile);
            console.log('[Preinstall] Linux 环境：已删除 package-lock.json，避免 Windows 依赖残留');
        }
    }

    // 强制 npm 忽略平台可选依赖
    process.env.npm_config_optional_dependency = 'false';
    console.log('[Preinstall] 已配置 npm 忽略可选依赖（平台专属包）');
} catch (err) {
    console.warn('[Preinstall] 适配平台时警告：', err.message);
}
process.exit(0);
