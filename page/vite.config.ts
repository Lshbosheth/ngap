import { defineConfig, PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import viteCompression from 'vite-plugin-compression';
import type { OutputChunk, OutputAsset } from 'rollup';

const isLinux = process.platform === 'linux';
const ROOT_PARENT = path.resolve(__dirname, '..');
const MATERIALS_DIR = path.resolve(ROOT_PARENT, 'materials');
const EDITOR_DIR = path.resolve(ROOT_PARENT, 'src');

const THIRD_PARTY_CHUNKS = ['vendor', 'icons', 'echarts', 'plots', 'babel-standalone', 'china-geojson'];
const BUSINESS_CHUNKS = ['index', 'components'];

const MATERIALS_COMPONENT_GROUPS = [
    { name: 'materials-basic', path: 'Basic' },
    { name: 'materials-container', path: 'Container' },
    { name: 'materials-formitems', path: 'FormItems' },
    { name: 'materials-feedback', path: 'FeedBack' },
    { name: 'materials-functional', path: 'Functional' },
    { name: 'materials-layout', path: 'Layout' },
    { name: 'materials-advanced', path: 'Advanced' },
    { name: 'materials-scene', path: 'Scene' },
    { name: 'materials-other', path: 'Other' },
];

function splitChunk(id: string | undefined) {
    if (!id) return false;
    const nodeModules = 'node_modules/';

    if (id.includes(nodeModules + 'babel/standalone') || id.includes(nodeModules + '@babel/standalone')) {
        return 'babel-standalone';
    }

    if (id.includes(nodeModules + 'lodash') || id.includes(nodeModules + 'lodash-es')) {
        return 'vendor';
    }

    if (id.includes(nodeModules + '@ant-design/icons') || id.includes(nodeModules + 'pinyin-pro')) {
        return 'icons';
    }

    if (id.includes(nodeModules + '@ant-design/plots')) {
        return 'plots';
    }

    if (id.includes(nodeModules + 'ant-design') || id.includes(nodeModules + '@ant-design')) {
        return 'vendor';
    }

    if (id.includes(nodeModules + 'less')) {
        return 'vendor';
    }

    if (id.includes(nodeModules + 'echarts') && !id.includes('echarts-for-react')) {
        return 'echarts';
    }

    if (id.includes(nodeModules + 'react') || id.includes(nodeModules + 'react-dom')) {
        return 'vendor';
    }

    if (id.includes(nodeModules + 'zustand')) {
        return 'vendor';
    }

    if (id.includes(nodeModules + 'ahooks') || id.includes(nodeModules + '@ahooks')) {
        return 'vendor';
    }

    if (id.includes(nodeModules + 'rc-')) {
        return 'vendor';
    }

    if (id.includes(nodeModules + 'monaco-editor')) {
        return 'monaco';
    }

    if (id.includes(nodeModules + 'bytemd')) {
        return 'editor-md';
    }

    if (id.includes(nodeModules + 'immer') || id.includes(nodeModules + 'qs') ||
        id.includes(nodeModules + 'jszip') || id.includes(nodeModules + 'axios')) {
        return 'vendor';
    }

    for (const group of MATERIALS_COMPONENT_GROUPS) {
        if (id.includes(MATERIALS_DIR + '/' + group.path)) {
            return group.name;
        }
    }

    if (id.includes('chinaGeoJSON') || id.includes('mapJson')) {
        return 'china-geojson';
    }

    return false;
}

function isThirdPartyChunk(fileName: string) {
    return THIRD_PARTY_CHUNKS.some(name => fileName.includes(name));
}

function isBusinessChunk(fileName: string) {
    return BUSINESS_CHUNKS.some(name => fileName.startsWith(name + '-') || fileName === name + '.js');
}

const preloadHintsPlugin = () => {
    return {
        name: 'preload-hints',
        apply: 'build' as const,
        generateBundle(options: any, bundle: Record<string, OutputChunk | OutputAsset>) {
            let html = '';
            for (const [fileName, chunk] of Object.entries(bundle)) {
                if (fileName.endsWith('.html') && chunk.type === 'asset') {
                    html = String((chunk as OutputAsset).source);
                    break;
                }
            }

            const jsFiles = Object.keys(bundle).filter(f => f.endsWith('.js'));
            const thirdPartyFiles = jsFiles.filter(f => isThirdPartyChunk(f));
            const preloadHints = thirdPartyFiles.map(f => {
                return `    <link rel="preload" href="${f}" as="script" crossorigin="anonymous">`;
            }).join('\n');

            const modulePreload = thirdPartyFiles.map(f => {
                return `    <link rel="modulepreload" href="${f}" crossorigin="anonymous">`;
            }).join('\n');

            if (html && preloadHints) {
                html = html.replace('</head>', `${preloadHints}\n</head>`);
                html = html.replace('</head>', `${modulePreload}\n</head>`);
            }

            for (const [fileName, chunk] of Object.entries(bundle)) {
                if (fileName.endsWith('.html') && chunk.type === 'asset') {
                    (chunk as OutputAsset).source = html;
                    break;
                }
            }
        }
    };
};

export default defineConfig({
    base: '/ngap/page/',
    build: {
        outDir: './../dist/page/',
        minify: false,
        sourcemap: false,
        emptyOutDir: true,
        target: ['chrome80', 'es2020'],
        cssCodeSplit: false,
        cssMinify: false,
        rollupOptions: {
            output: {
                entryFileNames: 'js/index.js',
                chunkFileNames: 'js/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]',
                manualChunks(id) {
                    const chunkName = splitChunk(id);
                    if (chunkName) {
                        return chunkName;
                    }
                }
            },
            cache: false,
            treeshake: false,
            onwarn: (warning, warn) => {
                if (warning.code === 'UNKNOWN_COMMENT' || warning.message.includes('contains an annotation that Rollup cannot interpret')) {
                    return;
                }
                if (
                    warning.code === 'MODULE_LEVEL_DIRECTIVE' ||
                    (warning.message.includes('dynamically imported') && warning.message.includes('statically imported'))
                ) {
                    return;
                }
                warn(warning);
            }
        },
        chunkSizeWarningLimit: 1024 * 20,
        modulePreload: {
            polyfill: false,
            resolveDependencies: (filename, deps) => {
                return deps
            }
        }
        },
    esbuild: false,
    plugins: [
        react({
            babel: {
                presets: [
                    [
                        '@babel/preset-env',
                        {
                            targets: { chrome: '80' },
                            useBuiltIns: 'usage',
                            corejs: 3,
                            modules: false
                        }
                    ]
                ],
                plugins: ['@babel/plugin-proposal-private-property-in-object', '@babel/plugin-proposal-private-methods']
    },
            jsxRuntime: 'automatic'
        }) as PluginOption,
        viteCompression({
            algorithm: 'gzip',
            threshold: 1024,
            ext: '.gz',
            deleteOriginFile: false,
            filter: (file) => {
                const fileName = file.split(/[/\\]/).pop() || '';
                if (fileName.startsWith('index') || fileName.startsWith('components')) {
                    return false;
                }
                if (fileName.startsWith('vendor') || fileName.startsWith('icons') ||
                    fileName.startsWith('echarts') || fileName.startsWith('plots') ||
                    fileName.startsWith('babel-standalone') || fileName.startsWith('china-geojson')) {
                    return true;
                }
                return /\.(css|html|svg|json|txt|woff|woff2|ttf|eot)$/.test(file);
            }
        }),
        preloadHintsPlugin()
    ],
    css: {
        modules: {
            generateScopedName: '[name]__[local]___[hash:base64:5]'
        },
        preprocessorOptions: {
            less: {
                additionalData: `@import "${path.resolve(__dirname, 'src/styles/global-vars.less')}";`,
                javascriptEnabled: true
            }
        },
        postcss: {}
    },
    optimizeDeps: {
        esbuildOptions: {
            platform: 'neutral',
            target: ['chrome80', 'es2020'],
            format: 'esm',
        },
        exclude: ['src/**/*', 'monaco-editor', '@rollup/rollup-win32-x64-msvc', '@rollup/rollup-linux-x64-gnu', '@rollup/rollup-linux-arm64-gnu'],
        force: true,
        include: [
            'react',
            'react-dom',
            'react-router-dom',
            'antd',
            '@ant-design/icons',
            '@ant-design/plots',
            '@ant-design/pro-components',
            'axios',
            'lodash-es',
            'dayjs',
            'echarts',
            'ahooks',
            'byte-md',
            'less'
        ]
    },
    cacheDir: isLinux ? undefined : '.vite',
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@materials': MATERIALS_DIR,
            '@editor': EDITOR_DIR
        }
    },
    server: {
        headers: {
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Vary': 'Accept-Encoding'
        }
    }
});
