import fs from 'node:fs';
import path from 'node:path';

const projectRoot = 'C:/Users/EDY/Desktop/ngap';
const uaRoot = path.join(projectRoot, '.understand-anything');
const batchesDoc = JSON.parse(fs.readFileSync(path.join(uaRoot, 'intermediate', 'batches.json'), 'utf8'));

const summaries = {
  'src/components/ApiConfig/ApiConfig.tsx': '提供接口配置主编辑器，组织接口选择、请求参数、响应处理和高级设置，并与接口列表状态及变量绑定能力联动。',
  'src/components/ApiConfig/components/BaseSetting.tsx': '实现接口基础设置表单，编辑请求地址、方法、参数和认证等通用接口属性。',
  'src/components/ApiConfig/components/HttpSetting.tsx': '实现 HTTP 请求高级设置，配置请求头、请求体及可脚本化的请求内容。',
  'src/components/ApiConfig/components/InterceptorModal.tsx': '提供接口拦截器配置弹窗，编辑请求前后处理设置并保存到接口定义。',
  'src/components/ApiConfig/components/ReturnStructure.tsx': '展示接口返回结构的配置区域，帮助编辑器维护响应字段结构。',
  'src/components/ApiConfig/components/ReturnTips.tsx': '展示接口返回值配置提示，说明响应结构和字段绑定的使用方式。',
  'src/components/ApiConfig/components/SettingModal.tsx': '提供接口详细设置弹窗，组合基础设置、返回结构和提示信息并完成配置校验与提交。',
  'src/components/BulkAction/ActionButtonModal.tsx': '实现批量操作按钮配置弹窗，编辑按钮文案、样式、权限与动作参数。',
  'src/components/BulkAction/ActionSetting.tsx': '实现批量操作列表编辑器，管理多个操作按钮的新增、排序、修改和删除。',
  'src/components/EventConfig/ActionModal/ActionModal.tsx': '提供事件动作总配置弹窗，根据动作类型分派各类编辑器并统一管理动作数据、校验和保存。',
  'src/components/EventConfig/ActionModal/ClosePopoverAction.tsx': '编辑关闭气泡卡片动作，配置目标组件及关闭行为参数。',
  'src/components/EventConfig/ActionModal/CopyAction.tsx': '编辑复制动作，配置需要写入剪贴板的固定值或动态表达式。',
  'src/components/EventConfig/ActionModal/CreateNodeAction.tsx': '编辑创建节点动作，配置节点来源及创建时使用的变量参数。',
  'src/components/EventConfig/ActionModal/CrossAPIEventAction.tsx': '实现跨应用 API 事件的复杂配置器，处理服务选择、参数映射、消息通信、接口试调和响应配置。',
  'src/components/EventConfig/ActionModal/DestroyPageAction.tsx': '编辑销毁页面动作，配置运行时页面实例的关闭与清理行为。',
  'src/components/EventConfig/ActionModal/DisableAction.tsx': '编辑组件禁用动作，选择目标组件并配置禁用或恢复状态。',
  'src/components/EventConfig/ActionModal/FormAction.tsx': '编辑表单动作，配置目标表单及提交、重置或校验等操作。',
  'src/components/EventConfig/ActionModal/GoldBankCheckAction.tsx': '编辑金库校验动作，配置校验目标、接口来源及所需变量参数。',
  'src/components/EventConfig/ActionModal/JumpLinkAction.tsx': '编辑跳转链接动作，支持内部页面、外部地址、动态参数和打开方式配置。',
  'src/components/EventConfig/ActionModal/MessageAction.tsx': '编辑消息提示动作，配置消息内容、类型和动态变量绑定。',
  'src/components/EventConfig/ActionModal/MessageChangeAction.tsx': '编辑消息内容变更动作，配置目标消息组件及新的展示内容。',
  'src/components/EventConfig/ActionModal/NotificationAction.tsx': '编辑通知动作，配置通知标题、正文、状态类型和显示行为。',
  'src/components/EventConfig/ActionModal/OpenDrawerAction.tsx': '编辑打开抽屉动作，选择目标抽屉并配置打开时传递的参数。',
  'src/components/EventConfig/ActionModal/OpenModalAction.tsx': '编辑打开模态框动作，选择目标弹窗并配置打开时的参数。',
  'src/components/EventConfig/ActionModal/OpenPopoverAction.tsx': '编辑打开气泡卡片动作，选择目标组件并配置触发参数。',
  'src/components/EventConfig/ActionModal/ReloadPageAction.tsx': '编辑刷新页面动作，配置运行时重新加载当前页面的行为。',
  'src/components/EventConfig/ActionModal/RunScriptAction.tsx': '编辑执行脚本动作，通过代码编辑器维护运行时脚本内容。',
  'src/components/EventConfig/ActionModal/SendParams.tsx': '编辑参数发送动作，配置向目标组件或页面传递的键值映射。',
  'src/components/EventConfig/ActionModal/SetTimeoutAction.tsx': '编辑延时动作，配置等待时长及延时后的动作执行策略。',
  'src/components/EventConfig/ActionModal/ShowConfirmAction.tsx': '编辑确认对话框动作，配置标题、正文和确认取消交互。',
  'src/components/EventConfig/ActionModal/VariableAssignment.tsx': '编辑变量赋值动作，选择目标变量并配置固定值、变量或脚本表达式来源。',
  'src/components/EventConfig/ActionModal/VisibleAction.tsx': '编辑组件显隐动作，选择目标组件并配置显示、隐藏或切换行为。',
  'src/components/EventConfig/ActionModal/openOneScreenAction.tsx': '编辑打开一屏应用动作，选择目标应用页面并配置打开参数。',
  'src/components/VariableBind/VariableBind.tsx': '提供统一变量绑定输入器，在固定值、页面变量、接口数据和表达式等来源之间建立配置引用。',
  'src/components/VsEditor.tsx': '封装 Monaco 风格代码编辑器，提供脚本输入、语言模式、格式化和受控值同步能力。',
  'src/packages/Advanced/BusinessTable/BusinessTable.tsx': '实现设计态业务表格物料，覆盖示例数据、列渲染、筛选排序、分页选择、编辑操作和标签规则预览。',
  'src/packages/Advanced/BusinessTable/ColumnSetting.tsx': '提供业务表格列设置面板，分区编辑字段属性、显示格式、自定义渲染、汇总和标签规则。',
  'src/packages/Advanced/BusinessTable/DragColumn.tsx': '实现业务表格列拖拽排序配置，并支持列项的动态标题与基础属性编辑。',
  'src/packages/Advanced/BusinessTable/Schema.tsx': '定义业务表格物料的设计态属性架构，组织数据、列、统计、批量操作和外观配置入口。',
  'src/packages/Advanced/BusinessTable/StatisticsConfig.tsx': '提供业务表格统计项配置器，编辑统计字段、聚合方式和展示属性。',
  'src/packages/Advanced/BusinessTable/StatisticsConfigWrapper.tsx': '为业务表格统计配置提供表单适配包装，连接外层属性编辑器与统计项配置。',
  'src/packages/Advanced/BusinessTable/TableSetting.tsx': '提供业务表格列管理入口，协调列设置、拖拽排序、远程字段加载和配置提交。',
  'src/packages/Advanced/BusinessTable/TagSetting.tsx': '实现业务表格标签规则编辑器，维护条件分支、触发条件、事件结果及列标签样式。',
  'src/packages/Advanced/BusinessTable/TagSetting/CaseList.tsx': '管理标签规则的条件分支列表，呈现每个分支的条件摘要、触发结果和编辑操作。',
  'src/packages/Advanced/BusinessTable/TagSetting/TriggerConditions.tsx': '编辑单个标签规则分支的组合条件，维护字段、运算符和值及条件关系。',
  'src/packages/Advanced/BusinessTable/TagSetting/TriggerEventItem.tsx': '编辑标签规则触发结果，配置单元格颜色、图标、文字及相关展示参数。',
  'src/packages/Advanced/BusinessTable/TagSetting/TriggerEvents.tsx': '管理标签规则分支的多个触发结果项并协调增删编辑。',
  'src/packages/Advanced/BusinessTable/utils/columns.tsx': '提供业务表格单元格格式化和标签效果渲染工具，将标签规则转为图标与样式。',
  'src/packages/Advanced/BusinessTable/utils/filter.tsx': '提供业务表格文本筛选下拉面板及 Ant Design 列筛选配置构造器。',
  'src/packages/Advanced/BusinessTable/utils/sort.tsx': '提供业务表格列排序配置，根据字段类型选择比较器并生成排序图标和排序属性。',
  'src/packages/Advanced/BusinessTable/utils/textfilter.ts': '检测 HTML 文本中是否包含严格匹配的字体颜色样式，供表格标签展示判断使用。',
  'src/packages/Advanced/BusinessTable/utils/windowSort.tsx': '实现混合类型排序器，统一比较数字、文件尺寸、英文、中文和特殊字符，并支持拼音排序。',
  'src/packages/Advanced/NgapTable/ColumnSetting.tsx': '提供通用 NgapTable 列设置面板，编辑字段属性、显示格式、自定义渲染和汇总规则。',
  'src/packages/Advanced/NgapTable/DragColumn.tsx': '实现 NgapTable 列拖拽排序配置，并维护列项顺序和动态标题。',
  'src/packages/Advanced/NgapTable/Schema.tsx': '定义 NgapTable 物料的设计态属性架构，组织数据源、列配置、批量操作和表格外观设置。',
  'src/packages/Advanced/NgapTable/TableSetting.tsx': '提供 NgapTable 列管理入口，协调列设置、拖拽排序、远程字段加载与保存。',
  'src/packages/Advanced/SearchForm/Schema.tsx': '定义搜索表单物料的设计态属性架构，配置表单布局、查询按钮、批量动作和展示行为。',
  'src/packages/Advanced/Tree/FunctionSetting.tsx': '提供树组件函数脚本配置器，通过代码编辑器维护自定义节点处理逻辑。',
  'src/packages/Advanced/Tree/Schema.tsx': '定义树物料的设计态属性架构，组织数据源、字段映射、选择展开、事件和自定义函数配置。',
  'src/packages/Basic/Avatar/Schema.tsx': '定义头像物料的设计态属性架构，配置图片、文字、尺寸、形状和交互动作。',
  'src/packages/Basic/BownloadButton/DataSetting.tsx': '提供下载按钮请求数据配置器，编辑接口参数与变量绑定关系。',
  'src/packages/Basic/BownloadButton/Schema.tsx': '定义下载按钮物料的设计态属性架构，组织接口数据、文件名、按钮外观和事件配置。',
  'src/packages/FeedBack/Drawer/Schema.tsx': '定义抽屉物料的设计态属性架构，配置位置、尺寸、遮罩、标题、显隐和动作。',
  'src/packages/FeedBack/Modal/Schema.tsx': '定义模态框物料的设计态属性架构，配置标题、尺寸、按钮、遮罩、显隐和动作。',
  'src/packages/FeedBack/Result/Schema.tsx': '定义结果反馈物料的设计态属性架构，配置状态、标题、说明、图标和操作区。',
  'src/packages/FeedBack/Spin/Schema.tsx': '定义加载状态物料的设计态属性架构，配置指示器、提示、尺寸和遮罩样式。',
  'src/packages/FormItems/StaticItem/Schema.tsx': '定义静态表单项的设计态属性架构，配置字段来源、格式化、标签和只读展示样式。',
  'src/packages/FormItems/StaticItem/StaticSetting.tsx': '提供静态表单项格式化脚本配置器，通过代码编辑器维护自定义展示逻辑。',
  'src/packages/Functional/List/Schema.tsx': '定义列表物料的设计态属性架构，组织数据源、字段模板、分页、样式和项目事件。',
  'src/packages/Other/IFrame/IFrameEventsSetting.tsx': '提供 IFrame 消息事件配置器，管理接收消息条件、参数处理和对应动作流。',
  'src/packages/Other/IFrame/IframeParamsSetting.tsx': '提供 IFrame 地址参数配置器，维护参数名、固定值和变量绑定映射。',
  'src/packages/Other/IFrame/Schema.tsx': '定义 IFrame 物料的设计态属性架构，组合地址、参数、跨窗口事件和展示样式设置。',
  'src/packages/Other/IFrame/iFrameSetting.tsx': '提供 IFrame 地址与页面选择设置，支持远程页面查询、变量参数和嵌入方式配置。',
  'src/pages/applicationOrchestration/pageCanvas/processCanvasPage/components/ConditionDialog/index.tsx': '提供引导式流程条件编辑弹窗，维护条件组、逻辑关系、字段运算符和值并回写分支配置。',
  'src/pages/applicationOrchestration/pageCanvas/processCanvasPage/components/ConditionalBranchConfig/index.tsx': '实现引导式流程条件分支配置面板，管理自动、人工和变量分支的条件、接口及脚本规则。',
  'src/pages/applicationOrchestration/pageCanvas/processCanvasPage/components/ConditionalBranchConfig/types.ts': '定义引导式流程条件配置的数据类型，包括条件项、条件组、运算关系和接口选项结构。',
  'src/pages/applicationOrchestration/pageCanvas/processCanvasPage/components/CondtionalInterface/index.tsx': '提供条件分支接口树选择器，按接口分类展示可用服务并回传选中的接口节点。',
  'src/utils/ProvinceIdCon.ts': '提供行政区划编码转换数据与工具，将八位地区编码映射为三位平台编码。'
};

const functionSummaries = {
  ApiConfigComponent: '实现接口配置器主体，协调接口定义、参数编辑、高级设置和配置值回写。',
  ApiInput: '渲染接口选择输入区域并负责打开接口配置入口。',
  generateId: '生成标签条件项使用的轻量唯一标识。',
  formatCellValue: '把业务表格单元格原始值格式化为可展示文本。',
  TagSettingIcons: '根据标签规则与单元格数据渲染匹配的图标、颜色和文字效果。',
  TextFilterDropdown: '渲染业务表格文本筛选下拉面板并管理查询、重置操作。',
  filterConfig: '返回业务表格列使用的标准文本筛选配置。',
  getSorter: '根据字段类型和排序模式选择合适的比较函数。',
  getSortIcon: '根据当前排序方向渲染表格列排序图标。',
  sortConfig: '组合比较器和图标，生成业务表格列排序配置。',
  hasFontColorStrict: '严格检测 HTML 片段是否包含指定字体颜色样式。',
  proid8to3: '把八位行政区划编码转换为平台使用的三位编码。',
  BranchContent: '渲染单个标签规则分支的条件内容与操作区。',
  TriggerResultsSummary: '汇总展示标签规则分支配置的触发结果。',
  CaseItemComponent: '渲染可编辑的标签规则分支项并处理分支增删改。',
  CaseList: '维护并渲染标签规则的条件分支集合。',
  MixedTypeSorter: '对数字、容量单位、英文、中文及特殊字符进行分词和稳定比较，并生成表格排序函数。'
};

function complexity(lines) {
  if (lines < 50) return 'simple';
  if (lines <= 200) return 'moderate';
  return 'complex';
}

function fileTags(filePath) {
  if (filePath.includes('/ApiConfig/')) return ['react-component', 'api-configuration', 'editor-ui'];
  if (filePath.includes('/BulkAction/')) return ['react-component', 'bulk-action', 'property-editor'];
  if (filePath.includes('/EventConfig/')) return ['react-component', 'action-configuration', 'event-flow'];
  if (filePath.includes('/VariableBind/')) return ['react-component', 'variable-binding', 'data-binding'];
  if (filePath.endsWith('/VsEditor.tsx')) return ['react-component', 'code-editor', 'script-config'];
  if (filePath.includes('/BusinessTable/TagSetting/')) return ['react-component', 'rule-editor', 'data-table'];
  if (filePath.includes('/BusinessTable/utils/')) return ['utility', 'data-table', 'sorting'];
  if (filePath.includes('/BusinessTable/')) return ['react-component', 'property-editor', 'data-table'];
  if (filePath.includes('/NgapTable/')) return ['react-component', 'property-editor', 'data-table'];
  if (filePath.includes('/packages/') && filePath.endsWith('/Schema.tsx')) return ['component-schema', 'property-editor', 'low-code-designer'];
  if (filePath.includes('/packages/Other/IFrame/')) return ['react-component', 'iframe', 'property-editor'];
  if (filePath.endsWith('/ConditionalBranchConfig/types.ts')) return ['type-definition', 'guided-process', 'branch-config'];
  if (filePath.includes('/processCanvasPage/')) return ['react-component', 'guided-process', 'branch-config'];
  if (filePath.endsWith('/ProvinceIdCon.ts')) return ['utility', 'code-conversion', 'region-data'];
  return ['react-component', 'property-editor', 'low-code-designer'];
}

function functionTags(name, filePath, type = 'function') {
  if (type === 'class') return ['sorting', 'data-table', 'utility'];
  if (['formatCellValue', 'hasFontColorStrict', 'proid8to3'].includes(name)) return ['utility', 'data-conversion', 'formatting'];
  if (['getSorter', 'getSortIcon', 'sortConfig', 'filterConfig'].includes(name)) return ['utility', 'data-table', 'configuration'];
  if (name === 'generateId') return ['utility', 'identifier', 'rule-editor'];
  if (filePath.includes('/EventConfig/')) return ['react-component', 'action-configuration', 'form-editor'];
  if (filePath.includes('/BusinessTable/')) return ['react-component', 'data-table', 'property-editor'];
  if (filePath.includes('/processCanvasPage/')) return ['react-component', 'guided-process', 'branch-config'];
  return ['react-component', 'property-editor', 'form-editor'];
}

function genericFunctionSummary(name, filePath) {
  if (functionSummaries[name]) return functionSummaries[name];
  const fileSummary = summaries[filePath];
  const role = fileSummary.replace(/[。]$/, '');
  return `${role}；${name} 承担该文件的核心渲染、状态管理或配置回写逻辑。`;
}

function makeFileNode(result) {
  if (!summaries[result.path]) throw new Error(`Missing Chinese summary: ${result.path}`);
  const node = {
    id: `file:${result.path}`,
    type: 'file',
    name: path.basename(result.path),
    filePath: result.path,
    summary: summaries[result.path],
    tags: fileTags(result.path),
    complexity: complexity(result.nonEmptyLines ?? result.totalLines ?? 0)
  };
  if (result.path.endsWith('windowSort.tsx')) node.languageNotes = '使用 TypeScript 类封装多阶段分词与比较算法，并缓存中文拼音首字母以降低重复计算。';
  if (result.path.endsWith('/ConditionalBranchConfig/index.tsx')) node.languageNotes = '以 React 表单状态统一承载多种分支类型的条件配置，是引导式流程设计态的核心交互组件。';
  return node;
}

function isSignificant(definition, exportNames) {
  return Boolean(definition.name) && definition.name !== '-' &&
    (Number(definition.endLine) - Number(definition.startLine) + 1 >= 10 || exportNames.has(definition.name));
}

function validatePart(fragment, allowed) {
  const localIds = new Set(fragment.nodes.map((node) => node.id));
  const errors = [];
  for (const edge of fragment.edges) {
    if (!localIds.has(edge.source)) errors.push(`missing source ${edge.source}`);
    if (localIds.has(edge.target)) continue;
    const fileMatch = /^file:(.+)$/.exec(edge.target);
    const symbolMatch = /^(function|class):(.+):([^:]+)$/.exec(edge.target);
    if (fileMatch && allowed.files.has(fileMatch[1])) continue;
    if (symbolMatch && allowed.symbols.has(`${symbolMatch[2]}:${symbolMatch[3]}`)) continue;
    errors.push(`invalid target ${edge.target}`);
  }
  if (errors.length) throw new Error(errors.slice(0, 20).join('\n'));
}

for (const batchIndex of [16, 17, 18]) {
  const batch = batchesDoc.batches.find((item) => item.batchIndex === batchIndex);
  const extraction = JSON.parse(fs.readFileSync(path.join(uaRoot, 'tmp', `ua-file-extract-results-${batchIndex}.json`), 'utf8'));
  if (!batch || !extraction.scriptCompleted || extraction.results.length !== batch.files.length) {
    throw new Error(`Incomplete input for batch ${batchIndex}`);
  }
  const resultByPath = new Map(extraction.results.map((result) => [result.path, result]));
  const nodes = [];
  const edges = [];
  const functionsByFile = new Map();

  for (const file of batch.files) {
    const result = resultByPath.get(file.path);
    if (!result) throw new Error(`Missing extraction result: ${file.path}`);
    nodes.push(makeFileNode(result));
    const exportNames = new Set((result.exports || []).map((item) => item.name));
    const localFunctions = new Map();
    for (const fn of result.functions || []) {
      if (!isSignificant(fn, exportNames)) continue;
      const id = `function:${file.path}:${fn.name}`;
      nodes.push({
        id, type: 'function', name: fn.name, filePath: file.path,
        lineRange: [Number(fn.startLine), Number(fn.endLine)],
        summary: genericFunctionSummary(fn.name, file.path),
        tags: functionTags(fn.name, file.path),
        complexity: complexity(Number(fn.endLine) - Number(fn.startLine) + 1)
      });
      localFunctions.set(fn.name, id);
      edges.push({ source: `file:${file.path}`, target: id, type: 'contains', direction: 'forward', weight: 1.0 });
      if (exportNames.has(fn.name)) edges.push({ source: `file:${file.path}`, target: id, type: 'exports', direction: 'forward', weight: 0.8 });
    }
    for (const cls of result.classes || []) {
      if (!isSignificant(cls, exportNames)) continue;
      const id = `class:${file.path}:${cls.name}`;
      nodes.push({
        id, type: 'class', name: cls.name, filePath: file.path,
        lineRange: [Number(cls.startLine), Number(cls.endLine)],
        summary: genericFunctionSummary(cls.name, file.path),
        tags: functionTags(cls.name, file.path, 'class'),
        complexity: complexity(Number(cls.endLine) - Number(cls.startLine) + 1),
        languageNotes: `类中集中封装 ${Array.isArray(cls.methods) ? cls.methods.length : 0} 个比较与解析方法。`
      });
      localFunctions.set(cls.name, id);
      edges.push({ source: `file:${file.path}`, target: id, type: 'contains', direction: 'forward', weight: 1.0 });
      if (exportNames.has(cls.name)) edges.push({ source: `file:${file.path}`, target: id, type: 'exports', direction: 'forward', weight: 0.8 });
    }
    functionsByFile.set(file.path, localFunctions);
  }

  for (const file of batch.files) {
    for (const target of batch.batchImportData[file.path] || []) {
      edges.push({ source: `file:${file.path}`, target: `file:${target}`, type: 'imports', direction: 'forward', weight: 0.7 });
    }
  }

  const seenCalls = new Set();
  for (const file of batch.files) {
    const result = resultByPath.get(file.path);
    const local = functionsByFile.get(file.path);
    const neighbors = batch.neighborMap[file.path] || [];
    for (const call of result.callGraph || []) {
      const source = local.get(call.caller);
      if (!source) continue;
      let target = local.get(call.callee);
      if (!target) {
        const neighbor = neighbors.find((item) => (item.symbols || []).includes(call.callee));
        if (neighbor) target = `function:${neighbor.path}:${call.callee}`;
      }
      if (!target || target === source) continue;
      const key = `${source}|${target}`;
      if (seenCalls.has(key)) continue;
      seenCalls.add(key);
      edges.push({ source, target, type: 'calls', direction: 'forward', weight: 0.8 });
    }
  }

  const expectedImports = batch.files.reduce((sum, file) => sum + (batch.batchImportData[file.path] || []).length, 0);
  const actualImports = edges.filter((edge) => edge.type === 'imports').length;
  if (expectedImports !== actualImports) throw new Error(`Batch ${batchIndex} imports ${actualImports}/${expectedImports}`);

  const partCount = Math.ceil(Math.max(nodes.length / 60, edges.length / 120));
  const sortedFiles = batch.files.map((file) => file.path).sort((a, b) => a.localeCompare(b));
  const chunkSize = Math.ceil(sortedFiles.length / partCount);
  const allowedFiles = new Set(sortedFiles);
  const allowedSymbols = new Set();
  for (const file of batch.files) {
    for (const target of batch.batchImportData[file.path] || []) allowedFiles.add(target);
    for (const neighbor of batch.neighborMap[file.path] || []) {
      allowedFiles.add(neighbor.path);
      for (const symbol of neighbor.symbols || []) allowedSymbols.add(`${neighbor.path}:${symbol}`);
    }
  }

  for (let partIndex = 0; partIndex < partCount; partIndex += 1) {
    const partFiles = new Set(sortedFiles.slice(partIndex * chunkSize, (partIndex + 1) * chunkSize));
    const partNodes = nodes.filter((node) => partFiles.has(node.filePath));
    const sourceIds = new Set(partNodes.map((node) => node.id));
    const partEdges = edges.filter((edge) => sourceIds.has(edge.source));
    const fragment = { nodes: partNodes, edges: partEdges };
    validatePart(fragment, { files: allowedFiles, symbols: allowedSymbols });
    const suffix = partCount === 1 ? '' : `-part-${partIndex + 1}`;
    fs.writeFileSync(path.join(uaRoot, 'intermediate', `batch-${batchIndex}${suffix}.json`), `${JSON.stringify(fragment, null, 2)}\n`, 'utf8');
  }
  console.log(JSON.stringify({ batchIndex, files: batch.files.length, nodes: nodes.length, edges: edges.length, imports: actualImports, parts: partCount }));
}
