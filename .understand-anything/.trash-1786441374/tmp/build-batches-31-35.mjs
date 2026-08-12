import fs from 'node:fs';
import path from 'node:path';

const root = 'C:/Users/EDY/Desktop/ngap';
const intermediate = path.join(root, '.understand-anything/intermediate');
const tmp = path.join(root, '.understand-anything/tmp');
const batches = JSON.parse(fs.readFileSync(path.join(intermediate, 'batches.json'), 'utf8')).batches;

const exactSummaries = {
  'src/packages/component.module.less': '定义主物料组件共享的局部样式，统一组件根容器、编辑态和画布交互相关视觉规则。',
  'src/packages/index.less': '定义主物料运行时的全局基础样式与第三方组件覆盖，保证画布内各物料展示一致。',
  'src/packages/readme.md': '说明平台物料为何使用 forwardRef、组件 Schema 的完整结构、NgapRender 渲染链路以及事件和接口公共能力。',
  'src/pages/applicationList/SubmitReviewDrawer.module.less': '定义应用提交审核抽屉的完整布局、表单、流程节点和审核状态样式。',
  'src/pages/applicationList/appDetail.less': '定义应用详情区域的基础信息、版本信息和内容分区样式。',
  'src/pages/applicationList/appList.less': '定义应用列表页的筛选区、列表项、操作区和分页样式。',
  'src/pages/applicationList/backrelation.less': '定义应用关联关系回显区域的节点、连线和说明样式。',
  'src/pages/applicationList/index.module.less': '定义应用管理主页面的模块化布局，覆盖工具栏、卡片、状态标识、弹窗和响应式细节。',
  'src/pages/applicationList/upcheckty.less': '定义应用升级检查与类型选择区域的表单和状态提示样式。',
  'src/pages/applicationList/versionHost.less': '定义应用版本宿主信息展示区的紧凑布局和文本样式。',
  'src/pages/businessComponentManage/businessComponent.json': '提供业务组件管理页面的静态接口样例，包含组件标识、名称、分类、状态、归属和创建更新信息。',
  'src/pages/businessComponentManage/componentBusinessList.json': '提供业务组件分类列表的静态接口样例，包含业务分类名称、标识、类型和审计时间。',
  'src/pages/businessComponentManage/index.less': '定义业务组件管理页面的查询、列表、树形分类、表单弹窗和操作按钮样式。',
  '.gitattributes': '配置 Git 对仓库文本文件、换行符及文件属性的处理规则。',
  '.npmrc': '配置 npm 依赖安装时使用的仓库和客户端行为。',
  '.prettierignore': '列出 Prettier 格式化时应跳过的构建产物、依赖和生成文件。',
  '.understand-anything/.understandignore': '定义 Understand-Anything 项目扫描的忽略建议与当前扫描边界。',
  'materials/components.ts': '作为独立 materials 运行时的物料导出总入口，按布局、功能、高级、基础、容器、图表、反馈和表单分类重导出全部组件。',
  'materials/Advanced/Pagination/ShowNumberSetting.tsx': '提供独立运行时分页组件的展示数量设置器，并把值绑定到指定表单字段。',
  'materials/Container/Cycle/BasicConfig.tsx': '提供循环容器的基础配置表单，用于设置列表项唯一性字段。',
  'materials/EChart/MapChart/mapJson/chinaGeoJSON.json': '保存中国行政区域边界的 GeoJSON FeatureCollection，供地图图表注册底图和绘制省级区域。',
  'materials/EChart/MapChart/README.md': '说明 MapChart 对 ECharts 的动态导入、NgapRender 预加载、Vite 分包策略、验证步骤和扩展方式。',
  'materials/FormItems/Counter/CounterDouble.tsx': '实现双值计数输入物料，维护两个数值、范围约束和变化回调，并应用独立运行时样式。',
  'materials/FormItems/Transfer/OperationsSetting.tsx': '提供独立运行时穿梭框左右操作文案的属性设置器。',
  'materials/FormItems/Transfer/ShowNumberSetting.tsx': '提供独立运行时穿梭框展示数量相关的属性设置器。',
  'materials/typings.d.ts': '声明独立 materials 构建所需的资源模块、全局变量和第三方模块类型。',
  'materials/utils/crossAPI.d.ts': '声明 CrossAPI 浏览器桥接对象、方法参数和回调的 TypeScript 类型，供宿主能力调用获得类型提示。',
};

const styleComponentNames = {
  AIChat: 'AI 对话', Breadcrumb: '面包屑', FloatingWindow: '悬浮窗口', Menu: '菜单', Pagination: '分页',
  Steps: '步骤条', Tree: '树', AudioPlayer: '音频播放器', Badge: '徽标', Carousel: '轮播', CollapseBtn: '折叠按钮',
  Text: '文本', Timer: '计时器', Video: '视频', Card: '卡片容器', Collapse: '折叠容器', Form: '表单容器',
  GridForm: '栅格表单', Popover: '气泡卡片', Spin: '加载反馈', CheckBox: '复选框', Counter: '计数器',
  InputNumber: '数字输入', Radio: '单选框', Slider: '滑块', Transfer: '穿梭框', TreeSelect: '树选择',
  Descriptions: '描述列表', List: '列表', Tabs: '页签', BottomBanner: '底部横幅', Span: '行内容器',
  NgapRender: '物料渲染器', BusinessTable: '业务表格', NgapTable: '通用表格', SearchForm: '搜索表单',
};

function complexity(lines) {
  if (lines > 200) return 'complex';
  if (lines >= 50) return 'moderate';
  return 'simple';
}

function nodeKind(fileCategory, filePath) {
  if (fileCategory === 'config') return { type: 'config', prefix: 'config' };
  if (fileCategory === 'docs') return { type: 'document', prefix: 'document' };
  if (fileCategory === 'infra') {
    if (/workflows|gitlab-ci|jenkins|circleci/i.test(filePath)) return { type: 'pipeline', prefix: 'pipeline' };
    if (/docker|compose|k8s|kubernetes/i.test(filePath)) return { type: 'service', prefix: 'service' };
    return { type: 'resource', prefix: 'resource' };
  }
  if (fileCategory === 'data') return { type: 'schema', prefix: 'schema' };
  return { type: 'file', prefix: 'file' };
}

function materialStyleSummary(filePath) {
  const parts = filePath.split('/');
  const filename = parts.at(-1);
  const owner = filename.startsWith('index') ? parts.at(-2) : path.basename(filename, path.extname(filename));
  const label = styleComponentNames[owner] || owner;
  return `定义独立 materials 运行时中${label}物料的布局、状态和交互视觉样式。`;
}

function fileSummary(filePath) {
  if (exactSummaries[filePath]) return exactSummaries[filePath];
  if (filePath.startsWith('materials/') && filePath.endsWith('.less')) return materialStyleSummary(filePath);
  if (filePath.endsWith('.less')) return `定义 ${path.basename(filePath)} 所属界面的布局和交互样式。`;
  return `${path.basename(filePath)} 提供对应模块的配置或运行时定义。`;
}

function tagsFor(result) {
  if (result.fileCategory === 'docs') return ['documentation', 'architecture', 'runtime-guide'];
  if (result.fileCategory === 'config') {
    if (result.path.includes('chinaGeoJSON')) return ['configuration', 'geojson', 'map-data', 'static-data'];
    return ['configuration', 'mock-data', 'management-ui'];
  }
  if (result.fileCategory === 'markup') return ['style', 'less', 'component-theme'];
  if (result.path.endsWith('.d.ts')) return ['type-definition', 'runtime-contract', 'typescript'];
  if (result.path === 'materials/components.ts') return ['barrel', 'entry-point', 'component-registry', 'exports'];
  if (result.path.startsWith('.')) return ['configuration', 'tooling', 'repository'];
  return ['component', 'react', 'configuration'];
}

function explicitExport(source, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [
    new RegExp(`export\\s+default[^;\\n]{0,160}\\b${escaped}\\b`),
    new RegExp(`export\\s+(?:const|function|class)\\s+${escaped}\\b`),
    new RegExp(`export\\s*\\{[^}]*\\b${escaped}\\b[^}]*\\}`),
  ].some((pattern) => pattern.test(source));
}

function functionSummary(name) {
  if (name === 'BasicConfig') return '渲染循环容器的基础配置项并绑定唯一性字段。';
  if (name === 'CounterDouble') return '渲染双值计数输入并同步两个受控数值。';
  return `实现 ${name} 对应的组件逻辑。`;
}

function analyze(batchIndex) {
  const batch = batches.find((entry) => entry.batchIndex === batchIndex);
  const extracted = JSON.parse(fs.readFileSync(path.join(tmp, `ua-file-extract-results-${batchIndex}.json`), 'utf8'));
  if (!extracted.scriptCompleted || extracted.filesAnalyzed !== batch.files.length || extracted.filesSkipped.length) throw new Error(`Batch ${batchIndex} extraction incomplete`);
  const nodes = [];
  const edges = [];
  const nodeIdByPath = new Map();

  for (const result of extracted.results) {
    const kind = nodeKind(result.fileCategory, result.path);
    const id = `${kind.prefix}:${result.path}`;
    nodeIdByPath.set(result.path, id);
    const node = { id, type: kind.type, name: path.basename(result.path), filePath: result.path, summary: fileSummary(result.path), tags: tagsFor(result), complexity: complexity(result.nonEmptyLines) };
    if (result.path === 'materials/components.ts') node.languageNotes = '纯 TypeScript barrel 文件，通过命名重导出形成独立物料包的公共组件表面。';
    if (result.path.includes('chinaGeoJSON')) node.languageNotes = '采用标准 GeoJSON FeatureCollection 结构保存大量 Polygon/MultiPolygon 坐标，文件体积较大但不包含执行逻辑。';
    nodes.push(node);
  }

  for (const result of extracted.results) {
    const fileId = nodeIdByPath.get(result.path);
    for (const targetPath of batch.batchImportData[result.path] || []) {
      const target = nodeIdByPath.get(targetPath) || `file:${targetPath}`;
      edges.push({ source: fileId, target, type: 'imports', direction: 'forward', weight: 0.7 });
    }
    if (result.fileCategory !== 'code') continue;
    const source = fs.readFileSync(path.join(root, result.path), 'utf8');
    for (const fn of result.functions || []) {
      if (!fn.name || fn.name === '-') continue;
      const span = fn.endLine - fn.startLine + 1;
      const exported = explicitExport(source, fn.name);
      if (span < 10 && !exported) continue;
      const functionId = `function:${result.path}:${fn.name}`;
      nodes.push({ id: functionId, type: 'function', name: fn.name, filePath: result.path, lineRange: [fn.startLine, fn.endLine], summary: functionSummary(fn.name), tags: ['component', 'react', 'form-control'], complexity: complexity(span) });
      edges.push({ source: fileId, target: functionId, type: 'contains', direction: 'forward', weight: 1.0 });
      if (exported) edges.push({ source: fileId, target: functionId, type: 'exports', direction: 'forward', weight: 0.8 });
    }
  }

  const expectedImports = batch.files.reduce((sum, file) => sum + (batch.batchImportData[file.path] || []).length, 0);
  const actualImports = edges.filter((edge) => edge.type === 'imports').length;
  if (expectedImports !== actualImports) throw new Error(`Batch ${batchIndex}: imports ${actualImports}/${expectedImports}`);

  const parts = Math.ceil(Math.max(nodes.length / 60, edges.length / 120));
  const sortedFiles = batch.files.map((file) => file.path).sort((a, b) => a.localeCompare(b));
  const chunkSize = Math.ceil(sortedFiles.length / parts);
  const allNodeIds = new Set(nodes.map((node) => node.id));
  const importTargets = new Set(Object.values(batch.batchImportData).flat().map((targetPath) => nodeIdByPath.get(targetPath) || `file:${targetPath}`));
  const outputs = [];
  for (let index = 0; index < parts; index += 1) {
    const filePaths = new Set(sortedFiles.slice(index * chunkSize, (index + 1) * chunkSize));
    const partNodes = nodes.filter((node) => filePaths.has(node.filePath));
    const ids = new Set(partNodes.map((node) => node.id));
    const partEdges = edges.filter((edge) => ids.has(edge.source));
    for (const edge of partEdges) {
      if (!allNodeIds.has(edge.target) && !importTargets.has(edge.target)) throw new Error(`Batch ${batchIndex} invalid edge target ${edge.target}`);
    }
    const filename = parts === 1 ? `batch-${batchIndex}.json` : `batch-${batchIndex}-part-${index + 1}.json`;
    fs.writeFileSync(path.join(intermediate, filename), `${JSON.stringify({ nodes: partNodes, edges: partEdges }, null, 2)}\n`);
    JSON.parse(fs.readFileSync(path.join(intermediate, filename), 'utf8'));
    outputs.push({ filename, nodes: partNodes.length, edges: partEdges.length });
  }
  return { batchIndex, files: batch.files.length, nodes: nodes.length, edges: edges.length, imports: actualImports, outputs };
}

const indices = process.argv.slice(2).map(Number).filter(Number.isInteger);
for (const batchIndex of indices.length ? indices : [31, 32, 33, 34, 35]) process.stdout.write(`${JSON.stringify(analyze(batchIndex))}\n`);
