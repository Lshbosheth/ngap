import fs from 'node:fs';
import path from 'node:path';

const root = 'C:/Users/EDY/Desktop/ngap';
const intermediate = path.join(root, '.understand-anything/intermediate');
const tmp = path.join(root, '.understand-anything/tmp');
const batches = JSON.parse(fs.readFileSync(path.join(intermediate, 'batches.json'), 'utf8')).batches;

const summaries = {
  'src/layout/components/Header/index.tsx': '实现低代码编辑器顶部栏，组织返回、页面信息、保存、预览、发布和其他全局操作。',
  'src/layout/components/Header/PublishPopover.tsx': '实现编辑器发布弹层，收集发布信息并触发应用或页面发布流程。',
  'src/layout/components/Menu/index.tsx': '实现编辑器侧边功能菜单，在物料、页面、变量、接口和配置等工作区之间切换。',
  'src/layout/components/Notice.tsx': '展示编辑器内的通知、警告和操作反馈内容。',
  'src/layout/components/Variable/VariableList.tsx': '展示页面变量列表并提供新增、编辑、删除和选中变量的入口。',
  'src/layout/components/Variable/VariableSetting.tsx': '实现变量新增与编辑表单，维护名称、类型、默认值和作用域等配置。',
  'src/layout/Preview/ProcessComponentPreview/ProcessComponentPreview.tsx': '实现引导式流程组件预览容器，按流程组件数据渲染页面区域和节点内容。',
  'src/mock/guidedProcessMock.ts': '提供引导式流程页面的示例元素工厂和组件数据，覆盖标题、按钮、底栏及组合组件结构。',
  'src/packages/Advanced/Breadcrumb/Breadcrumb.tsx': '实现面包屑物料，渲染配置项、响应点击事件并向动作引擎传递节点信息。',
  'src/packages/Advanced/Menu/Menu.tsx': '实现菜单物料，规范化节点键、维护选中状态并触发菜单项事件。',
  'src/packages/Advanced/NgapTable/NgapTable.tsx': '实现高级通用表格物料，集成接口数据、列配置、筛选排序、分页、选择、编辑、汇总和动作事件。',
  'src/packages/Advanced/Timeline/Timeline.tsx': '实现时间线物料，根据节点配置渲染状态、内容和自定义图标并处理交互事件。',
  'src/packages/Basic/Carousel/Carousel.tsx': '实现轮播物料，渲染配置图片或内容、控制切换行为并发布轮播事件。',
  'src/packages/Basic/CheckableTagGroup/CheckableTagGroup.tsx': '实现可选标签组物料，维护单选或多选值、样式状态和选择事件。',
  'src/packages/components/ColorPicker/ColorPicker.tsx': '实现物料属性面板使用的颜色选择控件，支持受控值、预设、清空和颜色字符串转换。',
  'src/packages/components/ColorPicker/ColorPickerSetting.tsx': '把通用颜色选择控件绑定到指定属性表单字段。',
  'src/packages/components/icon-select/IconSelect.tsx': '实现图标选择器，以弹层网格展示候选图标并回传当前选择。',
  'src/packages/components/timeline-node-config/TimelineConfig.tsx': '实现时间线节点集合编辑器，维护节点标题、内容、颜色、图标及增删排序。',
  'src/packages/components/timeline-node-config/TimelineSetting.tsx': '把时间线节点编辑器绑定到属性表单中的指定字段。',
  'src/packages/Container/Cycle/BasicConfig.tsx': '提供循环容器的唯一性字段基础配置项。',
  'src/packages/FormItems/Slider/Slider.tsx': '实现滑块表单物料，处理范围、步长、标记、受控值和表单事件。',
  'src/packages/Functional/List/List.tsx': '实现列表物料，绑定接口或变量数据源并按配置渲染列表项、空状态和交互事件。',
  'src/packages/Functional/List/useRenderItem.tsx': '封装列表项的记忆化渲染逻辑，减少无关状态变化导致的重复渲染。',
  'src/packages/utils/useWatchVariable.ts': '提供变量监听 Hook，在指定页面变量变化时触发依赖组件更新。',
  'src/packages/EChart/MapChart/mapJson/chinaGeoJSON.json': '保存主物料运行时使用的中国行政区域 GeoJSON 边界数据，供 MapChart 注册和绘制地图。',
  'src/pages/appEffectBoard/china-map/china.json': '保存应用成效看板中国地图使用的高精度 GeoJSON 行政区域边界与属性数据。',
};

const componentNames = {
  AIChat: 'AI 对话', Breadcrumb: '面包屑', BusinessTable: '业务表格', FloatingWindow: '悬浮窗口', Menu: '菜单',
  NgapTable: '通用表格', Pagination: '分页', SearchForm: '搜索表单', Steps: '步骤条', Timeline: '时间线', Tree: '树',
  AudioPlayer: '音频播放器', Badge: '徽标', Carousel: '轮播', CheckableTagGroup: '可选标签组', CollapseBtn: '折叠按钮',
  Icon: '图标', Image: '图片', Link: '链接', Tag: '标签', Text: '文本', Timer: '计时器', Video: '视频', Watermark: '水印',
  Card: '卡片容器', Collapse: '折叠容器', CollapseItem: '折叠项', Cycle: '循环容器', Div: '块容器', Flex: '弹性容器',
  Form: '表单容器', GridForm: '栅格表单', Empty: '空状态', Popover: '气泡卡片', Spin: '加载反馈', CheckBox: '复选框',
  ColorPicker: '颜色选择', Counter: '计数器', FormItem: '表单项', InputNumber: '数字输入', Radio: '单选框', Select: '下拉选择',
  Slider: '滑块', Switch: '开关', Transfer: '穿梭框', TreeSelect: '树选择', Button: '按钮', Descriptions: '描述列表',
  List: '列表', Tabs: '页签', BottomBanner: '底部横幅', Col: '列布局', Divider: '分割线', Row: '行布局', Span: '行内容器',
  Page: '页面容器', NgapRender: '物料渲染器', IFrame: '内嵌页面', Header: '顶部栏', ConfigPanel: '配置面板',
  ApiList: '接口列表', CrossApiList: 'CrossAPI 列表', Variable: '变量面板', ProcessComponentPreview: '流程组件预览',
};

function complexity(lines) {
  if (lines > 200) return 'complex';
  if (lines >= 50) return 'moderate';
  return 'simple';
}

function nodeKind(category) {
  if (category === 'config') return { type: 'config', prefix: 'config' };
  if (category === 'docs') return { type: 'document', prefix: 'document' };
  return { type: 'file', prefix: 'file' };
}

function ownerName(filePath) {
  const parts = filePath.split('/');
  const base = path.basename(filePath).replace(/\.(module\.)?(less|css|tsx?|json)$/i, '');
  if (/^(Schema|index|iFramecss|Linkcss|carousel)$/i.test(base)) return parts.at(-2);
  return base;
}

function readableOwner(filePath) {
  const owner = ownerName(filePath);
  return componentNames[owner] || owner.replace(/^Icon/, '');
}

function fileSummary(result) {
  if (summaries[result.path]) return summaries[result.path];
  if (result.path.startsWith('src/config/icons/')) return `为编辑器物料菜单中的${readableOwner(result.path)}入口提供 React 图标。`;
  if (/\/Schema\.(tsx?|js)$/i.test(result.path)) return `声明${readableOwner(result.path)}物料的属性、事件、接口和默认配置 Schema，驱动可视化属性面板。`;
  if (result.fileCategory === 'markup') return `定义${readableOwner(result.path)}相关组件的布局、状态和交互视觉样式。`;
  if (/Setting\.tsx$/i.test(result.path)) return `提供${readableOwner(result.path)}属性的表单设置器，供组件 Schema 嵌入配置面板。`;
  return `${path.basename(result.path)} 实现对应物料或编辑器模块。`;
}

function tagsFor(result) {
  if (result.fileCategory === 'config') return ['configuration', 'geojson', 'map-data', 'static-data'];
  if (result.fileCategory === 'markup') return ['style', result.path.endsWith('.css') ? 'css' : 'less', 'component-theme'];
  if (result.path.startsWith('src/config/icons/')) return ['component', 'icon', 'component-menu'];
  if (/\/Schema\.(tsx?|js)$/i.test(result.path)) return ['configuration', 'component-schema', 'setter', 'low-code'];
  if (/Setting\.tsx$/i.test(result.path)) return ['component', 'setter', 'form-control'];
  if (result.path.includes('/layout/')) return ['component', 'editor-layout', 'management-ui'];
  if (result.path.includes('/mock/')) return ['mock-data', 'guided-process', 'factory'];
  return ['component', 'react', 'runtime-renderer'];
}

function explicitExport(source, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [
    new RegExp(`export\\s+default[^;\\n]{0,180}\\b${escaped}\\b`),
    new RegExp(`export\\s+(?:const|function|class)\\s+${escaped}\\b`),
    new RegExp(`export\\s*\\{[^}]*\\b${escaped}\\b[^}]*\\}`),
  ].some((pattern) => pattern.test(source));
}

const fnSummaries = {
  IconGridForm: '渲染栅格表单物料在菜单中使用的图标。', IconModal: '渲染模态框物料的菜单图标。',
  IconRibon: '渲染飘带物料的菜单图标。', IconSearchForm: '渲染搜索表单物料的菜单图标。',
  IconTableEdit: '渲染可编辑表格物料的菜单图标。', IconTagGroup: '渲染标签组物料的菜单图标。',
  Publish: '渲染发布弹层并提交发布配置。', Menu: '渲染编辑器侧边菜单并处理工作区切换。',
  VariableSetting: '渲染变量配置表单并提交变量定义。', title: '生成引导式流程示例标题元素。',
  bottomBanner: '生成引导式流程示例底部操作栏元素。', component: '组合生成引导式流程示例组件及其子元素。',
  WBreadcrumb: '渲染面包屑物料并发布节点点击事件。', generateRandomKey: '为缺少标识的菜单节点生成随机键。',
  MMenu: '渲染菜单物料并同步选中项与动作事件。', NgapTable: '渲染高级表格并协调数据、列、筛选、选择和动作。',
  TimelineCus: '渲染配置化时间线节点及其状态。', MCarousel: '渲染轮播内容并处理切换事件。',
  MCheckableTagGroup: '渲染可选标签集合并维护选择值。', ColorPicker: '渲染颜色选择器并输出标准颜色字符串。',
  ColorPickerSetting: '把颜色选择器绑定到属性表单字段。', IconSelect: '渲染图标选择弹层并回传选中图标。',
  TimelineNodeConfig: '渲染时间线节点集合编辑器。', TimelineSetting: '把时间线节点配置绑定到属性表单。',
  BasicConfig: '渲染循环容器的唯一性字段配置。', MInput: '渲染滑块表单物料并同步受控值。',
  MList: '渲染数据驱动列表并协调列表项事件。', MemoizedListItem: '记忆化渲染单个列表项以减少重复更新。',
  useRenderItem: '返回列表项渲染函数。', useWatchVariable: '订阅指定页面变量并触发 React 更新。',
};

function functionSummary(filePath, name) {
  if (fnSummaries[name]) return fnSummaries[name];
  if (filePath.startsWith('src/config/icons/')) return `渲染 ${readableOwner(filePath)} 物料的菜单图标。`;
  return `实现 ${name} 对应的组件或配置生成逻辑。`;
}

function analyze(batchIndex) {
  const batch = batches.find((entry) => entry.batchIndex === batchIndex);
  const extracted = JSON.parse(fs.readFileSync(path.join(tmp, `ua-file-extract-results-${batchIndex}.json`), 'utf8'));
  if (!extracted.scriptCompleted || extracted.filesAnalyzed !== batch.files.length || extracted.filesSkipped.length) throw new Error(`Batch ${batchIndex} extraction incomplete`);
  const nodes = [];
  const edges = [];
  const nodeByPath = new Map();

  for (const result of extracted.results) {
    const kind = nodeKind(result.fileCategory);
    const id = `${kind.prefix}:${result.path}`;
    nodeByPath.set(result.path, id);
    const node = { id, type: kind.type, name: path.basename(result.path), filePath: result.path, summary: fileSummary(result), tags: tagsFor(result), complexity: complexity(result.nonEmptyLines) };
    if (result.fileCategory === 'config') node.languageNotes = '采用 GeoJSON FeatureCollection 保存大规模 Polygon/MultiPolygon 坐标，不包含执行逻辑。';
    if (/\/Schema\.(tsx?|js)$/i.test(result.path)) node.languageNotes = '以 TypeScript 对象字面量声明属性设置器和默认配置，由编辑器动态生成属性面板。';
    nodes.push(node);
  }

  for (const result of extracted.results) {
    const fileId = nodeByPath.get(result.path);
    for (const targetPath of batch.batchImportData[result.path] || []) {
      edges.push({ source: fileId, target: nodeByPath.get(targetPath) || `file:${targetPath}`, type: 'imports', direction: 'forward', weight: 0.7 });
    }
    if (result.fileCategory !== 'code') continue;
    const source = fs.readFileSync(path.join(root, result.path), 'utf8');
    for (const fn of result.functions || []) {
      if (!fn.name || fn.name === '-') continue;
      const span = fn.endLine - fn.startLine + 1;
      const exported = explicitExport(source, fn.name);
      if (span < 10 && !exported) continue;
      const id = `function:${result.path}:${fn.name}`;
      const tags = result.path.startsWith('src/config/icons/') ? ['component', 'icon', 'presentation'] : result.path.includes('/mock/') ? ['factory', 'mock-data', 'guided-process'] : nameToTags(fn.name);
      nodes.push({ id, type: 'function', name: fn.name, filePath: result.path, lineRange: [fn.startLine, fn.endLine], summary: functionSummary(result.path, fn.name), tags, complexity: complexity(span) });
      edges.push({ source: fileId, target: id, type: 'contains', direction: 'forward', weight: 1.0 });
      if (exported) edges.push({ source: fileId, target: id, type: 'exports', direction: 'forward', weight: 0.8 });
    }
  }

  const expectedImports = batch.files.reduce((sum, file) => sum + (batch.batchImportData[file.path] || []).length, 0);
  const actualImports = edges.filter((edge) => edge.type === 'imports').length;
  if (expectedImports !== actualImports) throw new Error(`Batch ${batchIndex}: imports ${actualImports}/${expectedImports}`);
  const parts = Math.ceil(Math.max(nodes.length / 60, edges.length / 120));
  const sortedFiles = batch.files.map((file) => file.path).sort((a, b) => a.localeCompare(b));
  const chunkSize = Math.ceil(sortedFiles.length / parts);
  const allNodeIds = new Set(nodes.map((node) => node.id));
  const importTargets = new Set(Object.values(batch.batchImportData).flat().map((targetPath) => nodeByPath.get(targetPath) || `file:${targetPath}`));
  const outputs = [];
  for (let index = 0; index < parts; index += 1) {
    const paths = new Set(sortedFiles.slice(index * chunkSize, (index + 1) * chunkSize));
    const partNodes = nodes.filter((node) => paths.has(node.filePath));
    const ids = new Set(partNodes.map((node) => node.id));
    const partEdges = edges.filter((edge) => ids.has(edge.source));
    for (const edge of partEdges) if (!allNodeIds.has(edge.target) && !importTargets.has(edge.target)) throw new Error(`Invalid target ${edge.target}`);
    const filename = parts === 1 ? `batch-${batchIndex}.json` : `batch-${batchIndex}-part-${index + 1}.json`;
    fs.writeFileSync(path.join(intermediate, filename), `${JSON.stringify({ nodes: partNodes, edges: partEdges }, null, 2)}\n`);
    JSON.parse(fs.readFileSync(path.join(intermediate, filename), 'utf8'));
    outputs.push({ filename, nodes: partNodes.length, edges: partEdges.length });
  }
  return { batchIndex, files: batch.files.length, nodes: nodes.length, edges: edges.length, imports: actualImports, outputs };
}

function nameToTags(name) {
  if (name.startsWith('use')) return ['hook', 'react', 'runtime-data'];
  if (/Setting|Config/.test(name)) return ['component', 'setter', 'form-control'];
  return ['component', 'react', 'event-handler'];
}

const indices = process.argv.slice(2).map(Number).filter(Number.isInteger);
for (const batchIndex of indices.length ? indices : [46, 47, 48, 49, 50]) process.stdout.write(`${JSON.stringify(analyze(batchIndex))}\n`);
