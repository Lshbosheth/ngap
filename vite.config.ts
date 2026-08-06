import { defineConfig, PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import svgr from 'vite-plugin-svgr';
import { createHtmlPlugin } from 'vite-plugin-html';
import viteCompression from 'vite-plugin-compression'
import fs from 'fs';

const getGitBranch = require('./scripts/get-git-branch');
const GIT_BRANCH: string = getGitBranch();
const isLinux = process.platform === 'linux';
const missingBinaryPlaceholder = (): PluginOption => ({
    name: 'ngap-missing-binary-placeholder',
    enforce: 'pre',
    resolveId(source, importer) {
        if (!importer || !/\.(png|jpe?g|gif|webp|ico|woff2?|ttf|eot)$/i.test(source)) return null;
        const resolved = path.resolve(path.dirname(importer), source);
        if (!fs.existsSync(resolved)) return '\0ngap-missing-binary:' + resolved;
        return null;
    },
    load(id) {
        if (!id.startsWith('\0ngap-missing-binary:')) return null;
        const label = path.basename(id.slice('\0ngap-missing-binary:'.length));
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="8" fill="#eaf0f6"/><path d="M18 40l9-10 7 7 6-7 8 10" fill="none" stroke="#90a4b5" stroke-width="3"/><circle cx="25" cy="23" r="4" fill="#90a4b5"/><title>${label}</title></svg>`;
        return `export default ${JSON.stringify(`data:image/svg+xml,${encodeURIComponent(svg)}`)};`;
    },
});
export default defineConfig({
    build: {
        outDir: './dist/',
        assetsDir: 'apps',
        minify: false,
        emptyOutDir: false,
        copyPublicDir: true,
        target: ['chrome80', 'es2020'],
        cssCodeSplit: false,
        cssMinify: true,
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    // 将echarts单独打包
                    if (id.includes('echarts')) {
                        return 'echarts';
                    }
                    // 将antd相关库打包在一起
                    if (id.includes('antd') || id.includes('@ant-design')) {
                        return 'antd';
                    }
                    // 将polyfills单独打包
                    if (id.includes('core-js')) {
                        return 'polyfills';
                    }
                    // 分离组件和schema文件
                    if (id.includes('/src/packages/') && id.includes('/Schema.')) {
                        return 'packages-schema';
                    }
                    if (id.includes('/src/packages/') && !id.includes('/Schema.') && !id.includes('/index.tsx') && !id.includes('/components.ts')) {
                        return 'packages-components';
                    }
                },
            },
            cache: false,
            plugins: [],
        },
        terserOptions: {
            // 压缩配置
            compress: {
                drop_console: false,
                drop_debugger: true,
                collapse_vars: true,
                // pure_funcs: ['console.log']
            },
            // 混淆配置
            mangle: {
                toplevel: true,
                keep_classnames: false,
                keep_fnames: false,
                properties: {
                    regex: /^_/, // 仅混淆以下划线开头的属性
                },
            },
            format: {
                comments: false, // 移除所有注释
                beautify: false, // 不格式化
            },
        },
    },
    cacheDir: isLinux ? undefined : '.vite',
    server: {
        proxy: {
            '/ngapcontrol': {
                // 后端同事本地电脑地址和端口
                target: 'http://172.22.37.150:18080/',
                changeOrigin: true,
                rewrite: (path) => path
            },
        },
        host: '127.0.0.1',
        port: 8892,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    base: '/ngap/',
    esbuild: {
        target: ['chrome80', 'es2020'], // 匹配 Chrome 80+ 支持的 ES 版本
        legalComments: 'eof',
    },
    css: {
        // 开启CSS模块化
        modules: {
            generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
        // 配置CSS预处理器
        preprocessorOptions: {
            less: {
                javascriptEnabled: true, // 兼容极少数antd5.x残留Less语法
            },
        },
        // 强制开启PostCSS
        postcss: {},
    },
    optimizeDeps: {
        esbuildOptions: {
            platform: 'neutral', //不绑定 Windows/Linux
            target: ['chrome80', 'es2020'],
            format: 'esm',
        },
        exclude: ['monaco-editor', '@rollup/rollup-win32-x64-msvc', '@rollup/rollup-linux-x64-gnu', '@rollup/rollup-linux-arm64-gnu', 'echarts'],
    },
    plugins: [
        missingBinaryPlaceholder(),
        react({
            babel: {
                presets: [
                    [
                        '@babel/preset-env',
                        {
                            targets: { chrome: '80' },
                            useBuiltIns: 'usage', // 按需注入 core-js 兼容
                            corejs: 3, // 指定 core-js 版本
                            modules: false, // 保留 ES Module
                        },
                    ],
                ],
                plugins: ['@babel/plugin-proposal-private-property-in-object', '@babel/plugin-proposal-private-methods'],
            },
        }) as PluginOption,
        createHtmlPlugin({
            minify: false, // 禁用 HTML 压缩
            inject: {
                data: {
                    GIT_BRANCH: GIT_BRANCH,
                },
            },
        }),
        svgr({
            svgrOptions: {
                icon: true, // 图标配置
            },
        }) as PluginOption,
        viteCompression({
            algorithm: 'gzip',
            ext: '.gz',
            threshold: 1024,
            deleteOriginFile: false,
            verbose: true,
            filter: (file) => !/index.html$/.test(file)
        })
    ],
    define: {
        __GIT_BRANCH__: JSON.stringify(GIT_BRANCH),
    },
});
