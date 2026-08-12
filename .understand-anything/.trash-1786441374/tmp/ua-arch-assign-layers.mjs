import fs from 'node:fs';

const [inputPath, structuralPath, outputPath] = process.argv.slice(2);
if (!inputPath || !structuralPath || !outputPath) {
  console.error('Usage: node ua-arch-assign-layers.mjs <input.json> <structural.json> <layers.json>');
  process.exit(1);
}

const input = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const structural = JSON.parse(fs.readFileSync(structuralPath, 'utf8'));
if (!structural.scriptCompleted) throw new Error('Structural analysis did not complete');

const definitions = [
  {
    id: 'layer:platform-ui',
    name: '平台编辑器与业务页面层',
    description: '承载 NGAP 主应用入口、可视化编辑器、业务管理页面、布局路由和通用交互组件。',
  },
  {
    id: 'layer:src-materials',
    name: '主 src 物料层',
    description: '维护主运行时内置物料、物料设置器、菜单注册、组件图标和设计态物料能力。',
  },
  {
    id: 'layer:materials-runtime',
    name: '独立 materials 运行时层',
    description: '提供独立物料实现、物料状态、类型与工具，支撑 page 运行壳及双运行时兼容。',
  },
  {
    id: 'layer:page-runtime',
    name: 'page 渲染壳层',
    description: '负责独立页面运行入口、动态物料装载、页面与流程渲染，以及与 materials 运行时的集成。',
  },
  {
    id: 'layer:shared-foundation',
    name: '状态、API 与共享基础层',
    description: '集中主运行时的 Zustand 状态、接口访问、类型声明、模拟数据及跨模块共享工具。',
  },
  {
    id: 'layer:static-assets',
    name: '静态资产层',
    description: '保存 Monaco、运行模板、全局样式等不参与业务编排但由构建或浏览器直接消费的资源。',
  },
  {
    id: 'layer:config-build',
    name: '配置与构建层',
    description: '管理主应用和子运行时的依赖、TypeScript/Vite/PostCSS 配置、安装脚本与仓库工具约定。',
  },
  {
    id: 'layer:documentation',
    name: '文档层',
    description: '汇总平台说明、开发记忆、重构设计、问题清单和面向研发及需求人员的入门资料。',
  },
].map((layer) => ({ ...layer, nodeIds: [] }));
const byId = new Map(definitions.map((layer) => [layer.id, layer]));

const normalize = (value = '') => value.replaceAll('\\', '/').replace(/^\.\//, '');
const isConfigLikeFile = (filePath) => {
  const base = filePath.split('/').at(-1)?.toLowerCase() ?? '';
  return filePath.startsWith('scripts/')
    || filePath.startsWith('.understand-anything/')
    || /^find-missing-.*\.ps1$/.test(base)
    || ['.gitattributes', '.npmrc', '.prettierignore', 'vite.config.ts', 'postcss.config.js'].includes(base)
    || /(^|\/)(vite|postcss|eslint|prettier|babel|webpack|rollup)\.config\./.test(filePath.toLowerCase());
};

const layerFor = (node) => {
  const filePath = normalize(node.filePath || node.name);
  if (node.type === 'document') return 'layer:documentation';
  if (node.type === 'config' || ['service', 'pipeline', 'resource'].includes(node.type)) return 'layer:config-build';
  if (['table', 'schema', 'endpoint'].includes(node.type)) return 'layer:shared-foundation';
  if (filePath.startsWith('public/')) return 'layer:static-assets';
  if (/^src\/(App\.less|styles\/)/.test(filePath)) return 'layer:static-assets';
  if (filePath.startsWith('materials/')) return 'layer:materials-runtime';
  if (filePath.startsWith('page/')) return 'layer:page-runtime';
  if (/^src\/(packages|widget|config)(\/|$)/.test(filePath)) return 'layer:src-materials';
  if (/^src\/(api|mock|stores|types|utils)(\/|$)/.test(filePath)
      || /^src\/(polyfills\.ts|typings\.d\.ts|vite-env\.d\.ts)$/.test(filePath)) {
    return 'layer:shared-foundation';
  }
  if (filePath.startsWith('src/') || filePath === 'index.html') return 'layer:platform-ui';
  if (isConfigLikeFile(filePath)) return 'layer:config-build';
  return 'layer:config-build';
};

for (const node of input.fileNodes) byId.get(layerFor(node)).nodeIds.push(node.id);

const allInputIds = new Set(input.fileNodes.map((node) => node.id));
const assignedIds = definitions.flatMap((layer) => layer.nodeIds);
const assignedSet = new Set(assignedIds);
const duplicates = assignedIds.filter((id, index) => assignedIds.indexOf(id) !== index);
const missing = [...allInputIds].filter((id) => !assignedSet.has(id));
const invented = [...assignedSet].filter((id) => !allInputIds.has(id));
const emptyLayers = definitions.filter((layer) => layer.nodeIds.length === 0).map((layer) => layer.id);

if (definitions.length < 3 || definitions.length > 10) throw new Error(`Invalid layer count: ${definitions.length}`);
if (assignedIds.length !== structural.fileStats.totalFileNodes
    || assignedSet.size !== structural.fileStats.totalFileNodes
    || duplicates.length || missing.length || invented.length || emptyLayers.length) {
  throw new Error(JSON.stringify({
    expected: structural.fileStats.totalFileNodes,
    assigned: assignedIds.length,
    unique: assignedSet.size,
    duplicates: [...new Set(duplicates)],
    missing,
    invented,
    emptyLayers,
  }, null, 2));
}

for (const layer of definitions) layer.nodeIds.sort();
fs.writeFileSync(outputPath, JSON.stringify(definitions, null, 2), 'utf8');
console.log(JSON.stringify({
  layers: definitions.length,
  expected: structural.fileStats.totalFileNodes,
  assigned: assignedIds.length,
  unique: assignedSet.size,
  counts: Object.fromEntries(definitions.map((layer) => [layer.name, layer.nodeIds.length])),
}));
