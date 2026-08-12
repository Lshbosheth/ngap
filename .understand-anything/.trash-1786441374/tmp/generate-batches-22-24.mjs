import fs from 'node:fs';
import path from 'node:path';

const projectRoot = 'C:/Users/EDY/Desktop/ngap';
const uaRoot = path.join(projectRoot, '.understand-anything');
const batchesDoc = JSON.parse(fs.readFileSync(path.join(uaRoot, 'intermediate', 'batches.json'), 'utf8'));

const summaries = {
  'page/src/api/index.ts': '提供独立 page 运行时的页面详情查询接口，组装页面标识并通过统一请求层获取发布态页面数据。',
  'page/src/page/TemplateNav.tsx': '实现独立 page 运行时的模板导航视图，展示页面模板入口并复用页面级样式。',
  'page/src/page/index.tsx': '作为独立 page 运行时核心入口，加载页面详情、注册变量与接口、转换画布数据、渲染物料并协调模板导航和全局状态。',
  'page/src/types/index.ts': '定义独立 page 运行时使用的页面、变量和基础数据类型，为接口与工具层提供 TypeScript 约束。',
  'page/src/utils/ChromeVersionLow.tsx': '提供浏览器版本过低提示组件，根据 Chrome 版本检测结果阻止不兼容页面继续运行。',
  'page/src/utils/dataToCanvas.ts': '把发布态页面数据转换为物料渲染需要的画布结构，补齐元素标识并递归处理嵌套页面数据。',
  'page/src/utils/dealApiGlobal.ts': '更新页面接口配置中的环境与全局参数，把运行时公共配置合并到各接口定义。',
  'page/src/utils/request.ts': '封装独立 page 运行时的 HTTP 请求层，处理请求配置、缓存、错误提示、响应转换和并发复用。',
  'page/src/utils/util.ts': '提供独立 page 运行时的环境判断、页面标识、树转换、接口兼容、签名和浏览器版本工具。',
  'materials/Advanced/Steps/StepCircleIcon.tsx': '绘制步骤条未完成状态的圆形图标，并通过物料样式参数控制尺寸和颜色。',
  'materials/Advanced/Steps/StepFinishIcon.tsx': '绘制步骤条已完成状态图标，呈现完成标记及可配置的主题样式。',
  'materials/Advanced/Steps/StepLoadingIcon.tsx': '绘制步骤条进行中状态的加载图标，使用动画表现当前步骤正在处理。',
  'materials/Advanced/Steps/Steps.tsx': '实现低代码步骤条物料，管理当前步骤、状态图标、标题描述、方向和步骤切换交互。',
  'src/api/page.ts': '集中定义设计器页面相关接口请求，包括页面创建、详情读取、更新、复制和状态操作。',
  'src/api/project.ts': '集中定义设计器项目相关接口请求，包括项目列表、创建、详情和维护操作。',
  'src/components/CreatePage.tsx': '实现创建页面弹窗，加载所属项目信息、校验页面表单并调用页面接口完成创建。',
  'src/components/CreateProject.tsx': '实现创建项目弹窗，校验项目基础信息并调用项目接口完成创建。'
};

const functionSummaries = {
  getPageDetail: '根据当前运行环境和页面标识请求发布态页面详情。',
  Pages: '引导独立 page 运行时完成页面初始化、变量和接口注册、数据转换以及物料树渲染。',
  ChromeVersionLow: '检测浏览器版本并在不满足要求时渲染兼容性提示。',
  dealDataId: '递归补齐页面元素的数据标识，保证运行时可按标识定位组件。',
  dealPageData: '递归转换页面及嵌套元素结构，规范化运行时渲染所需的数据。',
  dealPageDataId: '从页面根数据开始执行标识补齐和画布结构转换。',
  updateApiConfig: '把环境级公共参数合并进页面接口定义并返回更新后的接口配置。',
  loadCache: '读取请求缓存并处理有效期、复用中的 Promise 与缓存结果。',
  isEnv: '判断当前地址是否属于指定的运行环境。',
  getPageId: '从路由或运行环境中解析当前页面标识。',
  arrayToTree: '根据父子标识把扁平数组转换为树形结构。',
  baseApiConvert: '把基础接口定义转换为独立 page 请求层可执行的配置。',
  createId: '生成页面运行时使用的随机标识。',
  generateSign: '依据请求参数生成接口签名字符串。',
  getChromeVersion: '解析浏览器 User-Agent 并返回可用于兼容性判断的 Chrome 版本。',
  StepCircleIcon: '渲染步骤条未完成状态使用的圆形 SVG 图标。',
  StepFinishIcon: '渲染步骤条完成状态使用的勾选 SVG 图标。',
  StepLoadingIcon: '渲染步骤条当前状态使用的动画加载图标。',
  MSteps: '实现步骤条的核心渲染和交互逻辑，依据步骤数据选择状态图标并同步当前步骤。',
  CreatePage: '实现创建页面表单、项目选择、字段校验和提交反馈。',
  CreateProject: '实现创建项目表单、字段校验和提交反馈。'
};

function complexity(lines) {
  if (lines < 50) return 'simple';
  if (lines <= 200) return 'moderate';
  return 'complex';
}

function tags(filePath) {
  if (filePath === 'page/src/page/index.tsx') return ['entry-point', 'page-runtime', 'runtime-renderer', 'state-management'];
  if (filePath.startsWith('page/src/api/')) return ['api-client', 'page-runtime', 'data-fetching'];
  if (filePath.startsWith('page/src/types/')) return ['type-definition', 'page-runtime', 'data-model'];
  if (filePath.startsWith('page/src/utils/')) return ['utility', 'page-runtime', 'data-transformation'];
  if (filePath.includes('/Advanced/Steps/')) return ['react-component', 'steps', 'low-code-material'];
  if (filePath.startsWith('src/api/')) return ['api-client', 'designer', 'data-fetching'];
  if (filePath.endsWith('CreatePage.tsx')) return ['react-component', 'page-management', 'form-editor'];
  if (filePath.endsWith('CreateProject.tsx')) return ['react-component', 'project-management', 'form-editor'];
  return ['react-component', 'page-runtime', 'navigation'];
}

function functionTags(name, filePath) {
  if (filePath.startsWith('page/src/utils/')) return ['utility', 'page-runtime', 'data-transformation'];
  if (filePath.includes('/Advanced/Steps/')) return ['react-component', 'steps', 'rendering'];
  if (name === 'Pages') return ['entry-point', 'page-runtime', 'runtime-renderer'];
  if (name.startsWith('Create')) return ['react-component', 'form-editor', 'resource-creation'];
  return ['api-client', 'page-runtime', 'data-fetching'];
}

function validate(fragment, allowed) {
  const ids = new Set(fragment.nodes.map((node) => node.id));
  for (const edge of fragment.edges) {
    if (!ids.has(edge.source)) throw new Error(`Missing source ${edge.source}`);
    if (ids.has(edge.target)) continue;
    const fileMatch = /^file:(.+)$/.exec(edge.target);
    const symbolMatch = /^(function|class):(.+):([^:]+)$/.exec(edge.target);
    if (fileMatch && allowed.files.has(fileMatch[1])) continue;
    if (symbolMatch && allowed.symbols.has(`${symbolMatch[2]}:${symbolMatch[3]}`)) continue;
    throw new Error(`Invalid target ${edge.target}`);
  }
}

for (const batchIndex of [22, 23, 24]) {
  const batch = batchesDoc.batches.find((item) => item.batchIndex === batchIndex);
  const extraction = JSON.parse(fs.readFileSync(path.join(uaRoot, 'tmp', `ua-file-extract-results-${batchIndex}.json`), 'utf8'));
  if (!batch || !extraction.scriptCompleted || extraction.results.length !== batch.files.length) throw new Error(`Incomplete batch ${batchIndex}`);
  const byPath = new Map(extraction.results.map((result) => [result.path, result]));
  const nodes = [];
  const edges = [];
  const localDefs = new Map();

  for (const file of batch.files) {
    const result = byPath.get(file.path);
    if (!result || !summaries[file.path]) throw new Error(`Missing result/summary ${file.path}`);
    const fileNode = {
      id: `file:${file.path}`, type: 'file', name: path.basename(file.path), filePath: file.path,
      summary: summaries[file.path], tags: tags(file.path), complexity: complexity(result.nonEmptyLines ?? result.totalLines ?? 0)
    };
    if (file.path === 'page/src/page/index.tsx') fileNode.languageNotes = '以 React Hooks 串联页面加载、全局变量合并和物料树渲染，同时兼容独立发布运行环境。';
    if (file.path === 'page/src/utils/request.ts') fileNode.languageNotes = '请求缓存同时保存已完成响应与进行中的 Promise，用于合并并发的相同请求。';
    nodes.push(fileNode);
    const exports = new Set((result.exports || []).map((item) => item.name));
    const defs = new Map();
    for (const fn of result.functions || []) {
      const lines = Number(fn.endLine) - Number(fn.startLine) + 1;
      if (!fn.name || fn.name === '-' || (lines < 10 && !exports.has(fn.name))) continue;
      const id = `function:${file.path}:${fn.name}`;
      nodes.push({
        id, type: 'function', name: fn.name, filePath: file.path,
        lineRange: [Number(fn.startLine), Number(fn.endLine)],
        summary: functionSummaries[fn.name] || `${summaries[file.path].replace(/。$/, '')}；${fn.name} 承担其中的核心处理逻辑。`,
        tags: functionTags(fn.name, file.path), complexity: complexity(lines)
      });
      defs.set(fn.name, id);
      edges.push({source:`file:${file.path}`,target:id,type:'contains',direction:'forward',weight:1.0});
      if (exports.has(fn.name)) edges.push({source:`file:${file.path}`,target:id,type:'exports',direction:'forward',weight:0.8});
    }
    localDefs.set(file.path, defs);
  }

  for (const file of batch.files) {
    for (const target of batch.batchImportData[file.path] || []) {
      edges.push({source:`file:${file.path}`,target:`file:${target}`,type:'imports',direction:'forward',weight:0.7});
    }
  }

  const seen = new Set();
  for (const file of batch.files) {
    const result = byPath.get(file.path);
    const defs = localDefs.get(file.path);
    const neighbors = batch.neighborMap[file.path] || [];
    for (const call of result.callGraph || []) {
      const source = defs.get(call.caller);
      if (!source) continue;
      let target = defs.get(call.callee);
      if (!target) {
        const neighbor = neighbors.find((item) => (item.symbols || []).includes(call.callee));
        if (neighbor) target = `function:${neighbor.path}:${call.callee}`;
      }
      const key = `${source}|${target}`;
      if (!target || target === source || seen.has(key)) continue;
      seen.add(key);
      edges.push({source,target,type:'calls',direction:'forward',weight:0.8});
    }
  }

  const expectedImports = batch.files.reduce((sum, file) => sum + (batch.batchImportData[file.path] || []).length, 0);
  const importCount = edges.filter((edge) => edge.type === 'imports').length;
  if (importCount !== expectedImports) throw new Error(`Imports mismatch ${batchIndex}`);
  const partCount = Math.ceil(Math.max(nodes.length / 60, edges.length / 120));
  const sortedPaths = batch.files.map((file) => file.path).sort((a,b) => a.localeCompare(b));
  const chunkSize = Math.ceil(sortedPaths.length / partCount);
  const allowedFiles = new Set(sortedPaths);
  const allowedSymbols = new Set();
  for (const file of batch.files) {
    for (const target of batch.batchImportData[file.path] || []) allowedFiles.add(target);
    for (const neighbor of batch.neighborMap[file.path] || []) {
      allowedFiles.add(neighbor.path);
      for (const symbol of neighbor.symbols || []) allowedSymbols.add(`${neighbor.path}:${symbol}`);
    }
  }
  for (let i=0; i<partCount; i++) {
    const partPaths = new Set(sortedPaths.slice(i * chunkSize, (i + 1) * chunkSize));
    const partNodes = nodes.filter((node) => partPaths.has(node.filePath));
    const sources = new Set(partNodes.map((node) => node.id));
    const fragment = {nodes:partNodes,edges:edges.filter((edge) => sources.has(edge.source))};
    validate(fragment,{files:allowedFiles,symbols:allowedSymbols});
    const suffix = partCount === 1 ? '' : `-part-${i+1}`;
    fs.writeFileSync(path.join(uaRoot,'intermediate',`batch-${batchIndex}${suffix}.json`),`${JSON.stringify(fragment,null,2)}\n`,'utf8');
  }
  console.log(JSON.stringify({batchIndex,files:batch.files.length,nodes:nodes.length,edges:edges.length,imports:importCount,parts:partCount}));
}
