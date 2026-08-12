import fs from 'node:fs';
import path from 'node:path';

const root = 'C:/Users/EDY/Desktop/ngap';
const intermediate = path.join(root, '.understand-anything/intermediate');
const tmp = path.join(root, '.understand-anything/tmp');
const batches = JSON.parse(fs.readFileSync(path.join(intermediate, 'batches.json'), 'utf8')).batches;

const batch1Summaries = {
  'src/components/ColorPicker.tsx': '封装 Ant Design 颜色选择器，统一颜色值转换、预设面板、清空能力及表单回调，是属性编辑器复用的颜色输入控件。',
  'src/components/InputSelect/InputSelect.tsx': '提供输入框与下拉选项组合的受控编辑控件，用于属性面板中同时录入数值并选择单位或候选值。',
  'src/components/SetterRender/SetterRender.tsx': '按组件 Schema 中的设置器类型分派并渲染对应表单控件，覆盖上传、变量绑定、尺寸和通用输入等低代码属性配置场景。',
  'src/components/StyleConfig/BackgroundImage.tsx': '编辑元素背景图地址及相关展示值，并把变更写回样式配置，是通用样式面板的背景图子控件。',
  'src/components/StyleConfig/BackgroundSize.tsx': '编辑 CSS background-size，支持预设模式与自定义尺寸输入并回传标准化样式值。',
  'src/components/StyleConfig/DirectionInput.tsx': '提供四方向联动或独立输入模式，用于边距、圆角等方向性 CSS 属性的可视化编辑。',
  'src/components/StyleConfig/FlexStyle.tsx': '提供 Flex 布局方向、对齐、换行和间距等属性的成组编辑，并将选择结果映射为 CSS 样式。',
  'src/components/StyleConfig/InputPx.tsx': '提供带 px 等单位处理的数值输入控件，兼容空值、字符串和受控回调，是样式面板的基础输入单元。',
  'src/components/StyleConfig/MarginInput.tsx': '组合四个尺寸输入框编辑 margin 四方向值，并在联动与独立模式间同步配置。',
  'src/components/StyleConfig/PaddingInput.tsx': '组合四个尺寸输入框编辑 padding 四方向值，并在联动与独立模式间同步配置。',
  'src/components/StyleConfig/Shadow.tsx': '编辑阴影偏移、模糊、扩散与颜色参数，将表单输入组装为可直接应用的 CSS box-shadow。',
  'src/components/StyleConfig/StyleConfig.tsx': '低代码元素的综合样式编辑面板，集中编排尺寸、布局、背景、边框、阴影及自定义 CSS，并向画布同步样式变更。',
  'src/components/StyleConfig/TitleStyle.tsx': '为样式配置面板的小节标题提供统一的标题结构和模块化样式。',
  'src/packages/Advanced/Pagination/Schema.tsx': '声明分页组件的属性 Schema，配置页码、总数、尺寸、展示数量及文本等可视化设置器。',
  'src/packages/Advanced/Pagination/ShowNumberSetting.tsx': '提供分页展示数量相关的表单设置控件，供分页 Schema 嵌入属性面板。',
  'src/packages/Advanced/Progress/Schema.tsx': '声明进度条组件的属性 Schema，覆盖进度值、形态、颜色、描边、文本和状态等配置。',
  'src/packages/Advanced/Progress/StrokeColorSetting.tsx': '提供进度条描边颜色设置器，复用平台颜色选择控件写入指定表单字段。',
  'src/packages/Basic/Statistic/Schema.tsx': '声明统计数值组件的属性 Schema，包括标题、数值、精度、前后缀与文本表现。',
  'src/packages/Basic/Text/Schema.tsx': '声明文本组件的内容、排版、样式和事件 Schema，是文本元素属性面板与交互配置的元数据入口。',
  'src/packages/Basic/Text/TextEventsSetting.tsx': '提供文本组件事件动作的可视化编辑器，维护事件列表、动作类型及其参数并同步到表单。',
  'src/packages/Basic/Title/Schema.tsx': '声明标题组件的文本内容、标题级别与通用文本样式 Schema。',
  'src/packages/EChart/BarAndLine/Schema.tsx': '声明柱线混合图的 ECharts 属性 Schema，覆盖数据、坐标轴、图例、系列颜色、半径和通用图表选项。',
  'src/packages/EChart/BarChart/Schema.tsx': '声明条形图的 ECharts 属性 Schema，定义数据映射、坐标轴、图例、颜色和系列表现配置。',
  'src/packages/EChart/ColumnChart/Schema.tsx': '声明柱状图的 ECharts 属性 Schema，覆盖数据源、坐标系、系列、图例、标签和视觉样式。',
  'src/packages/EChart/LineChart/Schema.tsx': '声明折线图的 ECharts 属性 Schema，覆盖数据映射、坐标轴、图例、平滑曲线、区域与颜色配置。',
  'src/packages/EChart/MapChart/Schema.tsx': '声明地图图表的 ECharts 属性 Schema，配置地图数据、区域映射、视觉分段、标签和颜色。',
  'src/packages/EChart/PieChart/Schema.tsx': '声明饼图的 ECharts 属性 Schema，配置数据映射、图例、标签、内外半径和系列配色。',
  'src/packages/EChart/components/ColorSet.tsx': '提供图表系列颜色数组的属性设置器，通过颜色选择器维护可增删的配色集合。',
  'src/packages/EChart/components/RadiusSet.tsx': '提供图表内外半径等成组数值的属性设置器，供饼图和混合图 Schema 复用。',
  'src/packages/FormItems/Transfer/KeySetting.tsx': '提供穿梭框数据键字段的表单设置器，用于指定 label、value 等字段映射。',
  'src/packages/FormItems/Transfer/OperationStyleSetting.tsx': '提供穿梭框操作区样式的表单设置器，维护按钮与布局相关配置。',
  'src/packages/FormItems/Transfer/OperationsSetting.tsx': '提供穿梭框左右操作文案的表单设置器。',
  'src/packages/FormItems/Transfer/Schema.tsx': '声明穿梭框表单组件的属性 Schema，覆盖数据源、字段映射、操作文案、样式与交互行为。',
  'src/packages/components/TextSetting.tsx': '通用文本表达式设置器，使用代码编辑器为指定表单字段录入静态文本或可执行表达式。',
};

const functionSummaries = {
  MColorPicker: '渲染平台统一颜色选择器，将 Ant Design Color 对象转换为表单可持久化的颜色字符串。',
  InputSelect: '渲染输入框与下拉选择的组合控件，并把用户输入以受控值形式回传。',
  UploadItem: '渲染属性设置器中的上传项，处理文件状态、地址回填和预览交互。',
  BackgroundImage: '渲染背景图设置项并同步受控值变化。',
  BackgroundSize: '渲染背景尺寸预设和自定义尺寸输入，并输出 CSS background-size。',
  DirectionInput: '渲染四方向样式输入，协调联动和独立编辑状态。',
  FlexStyle: '渲染 Flex 布局属性表单并组合输出布局样式。',
  InputPx: '渲染带单位的数值输入并规范化样式值。',
  MarginInput: '渲染 margin 四方向输入并输出合并后的边距配置。',
  PaddingInput: '渲染 padding 四方向输入并输出合并后的内边距配置。',
  Shadow: '渲染阴影参数编辑器并生成 CSS box-shadow 字符串。',
  StyleConfig: '渲染完整样式属性面板，协调各子设置器并向上游提交样式变化。',
  TitleStyle: '渲染样式面板统一的小节标题。',
  TextSetting: '渲染文本或表达式代码编辑器并绑定指定表单字段。',
  queryElementTypeFun: '查询自定义元素分类，并触发分类下已发布元素的菜单数据加载。',
  queryElementFun: '查询已发布自定义元素，按分类增量更新或移除全局组件菜单项。',
  updateCustomElementMenu: '按元素标识重新加载自定义元素菜单。',
  getComponentMenu: '返回当前内存中的组件菜单配置。',
};

function complexity(nonEmptyLines) {
  if (nonEmptyLines > 200) return 'complex';
  if (nonEmptyLines >= 50) return 'moderate';
  return 'simple';
}

function iconLabel(filePath) {
  return path.basename(filePath, '.tsx').replace(/^Icon/, '') || '组件';
}

function isIcon(filePath) {
  return filePath.startsWith('src/config/icons/');
}

function fileSummary(filePath) {
  if (batch1Summaries[filePath]) return batch1Summaries[filePath];
  if (filePath === 'src/config/components.tsx') {
    return '定义低代码编辑器组件物料菜单及其分类、图标和说明，并通过接口加载已发布的自定义元素，使内置物料与动态物料共享同一菜单入口。';
  }
  if (isIcon(filePath)) {
    return `为低代码组件菜单中的 ${iconLabel(filePath)} 物料提供轻量 React 图标，作为组件分类和拖拽入口的视觉标识。`;
  }
  return `${path.basename(filePath)} 的项目实现文件，承载对应低代码编辑能力。`;
}

function fileTags(filePath) {
  if (isIcon(filePath)) return ['component', 'icon', 'component-menu'];
  if (filePath === 'src/config/components.tsx') return ['configuration', 'component-registry', 'custom-element', 'component-menu'];
  if (filePath.endsWith('/Schema.tsx')) {
    if (filePath.includes('/EChart/')) return ['configuration', 'component-schema', 'chart', 'setter'];
    return ['configuration', 'component-schema', 'low-code', 'setter'];
  }
  if (filePath.includes('/StyleConfig/')) return ['component', 'style-editor', 'form-control'];
  if (filePath.includes('SetterRender')) return ['component', 'setter', 'factory', 'form-control'];
  if (filePath.includes('Setting')) return ['component', 'setter', 'configuration'];
  return ['component', 'react', 'form-control'];
}

function functionTags(filePath, name) {
  if (isIcon(filePath)) return ['component', 'icon', 'presentation'];
  if (name.startsWith('query')) return ['service', 'custom-element', 'data-loader'];
  if (name === 'updateCustomElementMenu' || name === 'getComponentMenu') return ['utility', 'component-registry', 'public-api'];
  if (filePath.includes('/StyleConfig/')) return ['component', 'style-editor', 'event-handler'];
  if (name === 'UploadItem') return ['component', 'setter', 'file-upload'];
  return ['component', 'react', 'form-control'];
}

function explicitExport(source, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [
    new RegExp(`export\\s+default\\s+(?:function\\s+)?${escaped}\\b`),
    new RegExp(`export\\s+(?:const|function|class)\\s+${escaped}\\b`),
    new RegExp(`export\\s*\\{[^}]*\\b${escaped}\\b[^}]*\\}`),
  ].some((pattern) => pattern.test(source));
}

function functionSummary(filePath, name) {
  if (functionSummaries[name]) return functionSummaries[name];
  if (isIcon(filePath)) return `渲染 ${iconLabel(filePath)} 物料在组件菜单中使用的图标。`;
  return `实现 ${name} 对应的组件或交互逻辑。`;
}

function makeFileNode(result) {
  const node = {
    id: `file:${result.path}`,
    type: 'file',
    name: path.basename(result.path),
    filePath: result.path,
    summary: fileSummary(result.path),
    tags: fileTags(result.path),
    complexity: complexity(result.nonEmptyLines),
  };
  if (result.path === 'src/config/components.tsx') {
    node.languageNotes = '该 TSX 文件以大型对象字面量注册内置物料，同时通过异步接口直接修改模块级菜单数组以接入自定义元素。';
  } else if (result.path.endsWith('/Schema.tsx')) {
    node.languageNotes = '以 TypeScript/TSX 对象字面量声明组件属性 Schema，并嵌入 React 设置器作为可视化配置元数据。';
  }
  return node;
}

function analyzeBatch(batchIndex) {
  const batch = batches.find((entry) => entry.batchIndex === batchIndex);
  const extracted = JSON.parse(fs.readFileSync(path.join(tmp, `ua-file-extract-results-${batchIndex}.json`), 'utf8'));
  if (!extracted.scriptCompleted || extracted.filesAnalyzed !== batch.files.length) {
    throw new Error(`Batch ${batchIndex} extraction incomplete`);
  }
  const nodes = [];
  const edges = [];
  const filePathSet = new Set(batch.files.map((file) => file.path));

  for (const result of extracted.results) {
    const fileNode = makeFileNode(result);
    nodes.push(fileNode);
    const imports = batch.batchImportData[result.path] || [];
    for (const targetPath of imports) {
      edges.push({ source: fileNode.id, target: `file:${targetPath}`, type: 'imports', direction: 'forward', weight: 0.7 });
    }

    const source = fs.readFileSync(path.join(root, result.path), 'utf8');
    for (const fn of result.functions || []) {
      if (!fn.name || fn.name === '-') continue;
      const span = fn.endLine - fn.startLine + 1;
      const exported = explicitExport(source, fn.name);
      if (span < 10 && !exported) continue;
      const functionId = `function:${result.path}:${fn.name}`;
      nodes.push({
        id: functionId,
        type: 'function',
        name: fn.name,
        filePath: result.path,
        lineRange: [fn.startLine, fn.endLine],
        summary: functionSummary(result.path, fn.name),
        tags: functionTags(result.path, fn.name),
        complexity: complexity(span),
      });
      edges.push({ source: fileNode.id, target: functionId, type: 'contains', direction: 'forward', weight: 1.0 });
      if (exported) edges.push({ source: fileNode.id, target: functionId, type: 'exports', direction: 'forward', weight: 0.8 });
    }
  }

  if (batchIndex === 2) {
    const base = 'src/config/components.tsx';
    edges.push({ source: `function:${base}:queryElementTypeFun`, target: `function:${base}:queryElementFun`, type: 'calls', direction: 'forward', weight: 0.8 });
    edges.push({ source: `function:${base}:updateCustomElementMenu`, target: `function:${base}:queryElementTypeFun`, type: 'calls', direction: 'forward', weight: 0.8 });
  }

  const expectedImports = batch.files.reduce((sum, file) => sum + (batch.batchImportData[file.path] || []).length, 0);
  const actualImports = edges.filter((edge) => edge.type === 'imports').length;
  if (expectedImports !== actualImports) throw new Error(`Batch ${batchIndex} import mismatch: ${actualImports}/${expectedImports}`);
  if (new Set(nodes.map((node) => node.id)).size !== nodes.length) throw new Error(`Batch ${batchIndex} duplicate node IDs`);
  if (edges.some((edge) => edge.source === edge.target)) throw new Error(`Batch ${batchIndex} self edge`);

  const parts = Math.ceil(Math.max(nodes.length / 60, edges.length / 120));
  const sortedFiles = [...filePathSet].sort((a, b) => a.localeCompare(b));
  const chunkSize = Math.ceil(sortedFiles.length / parts);
  const outputs = [];
  for (let part = 0; part < parts; part += 1) {
    const partFiles = new Set(sortedFiles.slice(part * chunkSize, (part + 1) * chunkSize));
    const partNodes = nodes.filter((node) => partFiles.has(node.filePath));
    const partNodeIds = new Set(partNodes.map((node) => node.id));
    const partEdges = edges.filter((edge) => partNodeIds.has(edge.source));
    const importTargets = new Set(Object.values(batch.batchImportData).flat().map((p) => `file:${p}`));
    for (const edge of partEdges) {
      if (!partNodeIds.has(edge.source)) throw new Error(`Batch ${batchIndex} part ${part + 1}: missing source ${edge.source}`);
      if (!partNodeIds.has(edge.target) && !importTargets.has(edge.target)) {
        throw new Error(`Batch ${batchIndex} part ${part + 1}: invalid target ${edge.target}`);
      }
    }
    const filename = parts === 1 ? `batch-${batchIndex}.json` : `batch-${batchIndex}-part-${part + 1}.json`;
    const outputPath = path.join(intermediate, filename);
    fs.writeFileSync(outputPath, `${JSON.stringify({ nodes: partNodes, edges: partEdges }, null, 2)}\n`);
    JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    outputs.push({ filename, nodes: partNodes.length, edges: partEdges.length });
  }
  return { batchIndex, files: batch.files.length, nodes: nodes.length, edges: edges.length, imports: actualImports, parts: outputs };
}

for (const batchIndex of [1, 2, 3]) {
  process.stdout.write(`${JSON.stringify(analyzeBatch(batchIndex))}\n`);
}
