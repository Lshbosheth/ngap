import fs from 'node:fs';
import path from 'node:path';

const projectRoot = 'C:/Users/EDY/Desktop/ngap';
const uaRoot = path.join(projectRoot, '.understand-anything');
const batchesDoc = JSON.parse(fs.readFileSync(path.join(uaRoot, 'intermediate', 'batches.json'), 'utf8'));

const summaries = {
  'materials/Advanced/AIChat/AIChat.tsx': '实现可配置的 AI 对话物料，管理消息列表、用户输入、接口请求与会话展示，并接入平台属性和样式配置。',
  'materials/Advanced/Breadcrumb/Breadcrumb.tsx': '实现面包屑导航物料，通过接口或变量生成导航项，并把选择变化同步到页面运行时。',
  'materials/Advanced/FloatingWindow/FloatingWindow.tsx': '实现浮动窗口容器，在可定位、可显隐的浮层中调用 NgapRender 渲染嵌套低代码元素。',
  'materials/Advanced/Menu/Menu.tsx': '实现动态菜单物料，负责菜单树数据、选中状态、样式配置和菜单项交互事件。',
  'materials/Advanced/Pagination/Pagination.tsx': '封装分页物料，将页码、每页数量和总数等低代码属性映射为分页交互。',
  'materials/Advanced/Progress/Progress.tsx': '封装进度展示物料，支持数值、状态、颜色及格式化等可配置展示能力。',
  'materials/Advanced/Timeline/Timeline.tsx': '实现时间轴物料，可从配置或接口数据生成时间节点并呈现业务过程。',
  'materials/Advanced/Tree/Tree.tsx': '实现复杂树形物料，处理异步数据、选择与勾选、展开状态、节点事件及低代码数据绑定。',
  'materials/Basic/AudioPlayer/AudioPlayer.tsx': '实现音频播放器物料，管理播放进度、音量、倍速、循环和控制栏状态，并暴露可配置交互。',
  'materials/Basic/Avatar/Avatar.tsx': '封装头像展示物料，将图片、图标、文字及尺寸样式配置映射到头像组件。',
  'materials/Basic/Badge/Badge.tsx': '封装徽标物料，并通过 NgapRender 支持徽标包裹的嵌套低代码内容。',
  'materials/Basic/BownloadButton/BownloadButton.tsx': '实现下载按钮物料，根据接口配置构造下载请求并处理文件获取、按钮状态和运行时参数。',
  'materials/Basic/Carousel/Carousel.tsx': '实现轮播展示物料，支持接口或变量驱动的轮播项、当前项状态和切换事件。',
  'materials/Basic/CheckableTagGroup/CheckableTagGroup.tsx': '实现可勾选标签组物料，维护选中集合并支持动态选项与事件回调。',
  'materials/Basic/CollapseBtn/CollapseBtn.tsx': '实现折叠控制按钮，通过 NgapRender 管理目标内容的展开收起与图标状态。',
  'materials/Basic/Icon/Icon.tsx': '封装图标物料，将图标、颜色和尺寸配置与平台动作流事件连接。',
  'materials/Basic/Image/Image.tsx': '封装图片展示物料，提供图片地址、适配方式、预览和样式等低代码属性。',
  'materials/Basic/Link/Link.tsx': '封装链接物料，提供文本、目标地址、打开方式和展示样式配置。',
  'materials/Basic/Statistic/Statistic.tsx': '封装统计数值物料，支持标题、数值、前后缀、精度和格式化展示。',
  'materials/Basic/Tag/Tag.tsx': '封装标签物料，提供文本、颜色、边框与交互状态等低代码配置。',
  'materials/Basic/Text/Text.tsx': '实现文本物料，支持模板化内容、HTML/纯文本处理、样式配置以及点击等动作流事件。',
  'materials/Basic/Timer/Timer.tsx': '实现计时器物料，解析初始时间并维护倒计时或正计时状态、格式化显示和完成事件。',
  'materials/Basic/Title/Title.tsx': '实现标题物料，支持动态内容解析、标题层级与文本样式配置。',
  'materials/Basic/Video/Video.tsx': '封装视频播放物料，提供媒体地址、封面、控制栏、自动播放和循环等属性。',
  'materials/Basic/Watermark/Watermark.tsx': '实现水印容器物料，在水印覆盖层内调用 NgapRender 渲染嵌套内容。',
  'materials/Container/Card/Card.tsx': '实现卡片容器物料，承载标题、边框和布局配置，并通过 NgapRender 渲染子元素。',
  'materials/Container/Collapse/Collapse.tsx': '实现折叠面板容器，管理活动面板、动态标题和面板状态，并渲染嵌套低代码内容。',
  'materials/Container/CollapseItem/CollapseItem.tsx': '实现单个折叠项容器，作为折叠结构的内容节点调用 NgapRender 渲染子元素。',
  'materials/Container/Cycle/Cycle.tsx': '实现循环容器物料，依据接口或运行时列表重复渲染子元素并维护循环项上下文。',
  'materials/Container/Div/Div.tsx': '实现通用块级容器，将布局和样式属性应用到容器并渲染其低代码子元素。',
  'materials/Container/Flex/Flex.tsx': '实现 Flex 布局容器，将方向、对齐、间距和换行配置应用到嵌套低代码元素。',
  'materials/Container/Form/Form.tsx': '实现表单容器，连接页面表单数据、校验与提交上下文，并通过 NgapRender 组织表单子元素。',
  'materials/Container/GridForm/GridForm.tsx': '实现网格化表单容器，负责响应式字段布局、表单上下文、数据格式化与字段动作流。',
  'materials/EChart/BarAndLine/BarAndLine.tsx': '实现柱线组合图物料，从接口或变量装配系列数据、坐标轴和图例，并同步图表交互状态。',
  'materials/EChart/BarChart/BarChart.tsx': '实现条形图物料，将数据源与字典配置转换为 ECharts 选项并支持动态刷新。',
  'materials/EChart/ColumnChart/ColumnChart.tsx': '实现柱状图物料，处理多系列数据、单位换算、差异展示、配色和交互事件。',
  'materials/EChart/LineChart/LineChart.tsx': '实现折线图物料，处理多系列数据、单位格式化、趋势差异、坐标轴和交互事件。',
  'materials/EChart/MapChart/MapChart.tsx': '实现地图图表物料，根据接口或变量数据生成区域指标与 ECharts 地图展示。',
  'materials/EChart/PieChart/PieChart.tsx': '实现饼图物料，将动态数据与字典信息转换为扇区、图例、提示和交互配置。',
  'materials/EChart/chartCalculationUtil.ts': '提供图表数值单位检测、换算、格式化、差值展示和颜色派生工具，供柱状图与折线图复用。',
  'materials/FeedBack/Drawer/Drawer.tsx': '实现抽屉反馈容器，管理打开状态、位置和关闭动作，并渲染嵌套低代码内容。',
  'materials/FeedBack/Empty/Empty.tsx': '封装空状态物料，支持图像、描述文字与展示样式配置。',
  'materials/FeedBack/Modal/Modal.tsx': '实现模态框容器，管理显隐、确认取消动作和内部低代码内容渲染。',
  'materials/FeedBack/Popover/Popover.tsx': '实现气泡卡片容器，按触发方式和位置展示由 NgapRender 生成的嵌套内容。',
  'materials/FeedBack/Result/Result.tsx': '封装结果反馈物料，展示状态、标题、说明和操作区，并连接平台动作流。',
  'materials/FeedBack/Spin/Spin.tsx': '封装加载状态物料，提供尺寸、提示文字、遮罩和旋转指示样式配置。',
  'materials/FormItems/Cascader/Cascader.tsx': '实现级联选择表单物料，连接表单上下文、动态选项、变量监听和接口数据。',
  'materials/FormItems/CheckBox/CheckBox.tsx': '实现复选框组物料，处理字典或接口选项、表单值同步、变量监听和选择事件。',
  'materials/FormItems/ColorPicker/ColorPicker.tsx': '封装颜色选择表单物料，将选色结果和格式配置同步到表单上下文。',
  'materials/FormItems/Counter/Counter.tsx': '实现计数器表单物料，管理增减、步长、边界、格式化和表单值同步。',
  'materials/FormItems/CustomCalendarIcon.tsx': '定义日期时间类表单控件复用的日历与下拉 SVG 图标组件。',
  'materials/FormItems/DatePicker/DatePicker.tsx': '封装日期选择表单物料，处理日期格式、禁用状态、默认值转换和表单同步。',
  'materials/FormItems/DatePickerRange/DatePickerRange.tsx': '封装日期范围选择物料，处理起止值格式转换、快捷范围与表单同步。',
  'materials/FormItems/FormItem/FormItem.tsx': '实现表单项布局容器，将标签、校验提示和字段布局包裹到嵌套低代码控件外层。',
  'materials/FormItems/Input/Input.tsx': '封装单行输入框物料，处理值格式化、占位提示、状态配置和表单数据同步。',
  'materials/FormItems/InputNumber/InputNumber.tsx': '封装数字输入物料，处理精度、范围、步长、格式化与表单值同步。',
  'materials/FormItems/InputPassword/InputPassword.tsx': '封装密码输入物料，管理可见性、输入状态、格式处理和表单值同步。',
  'materials/FormItems/Json/Json.tsx': '实现 JSON 编辑与查看表单物料，在结构化展示和文本值之间转换并同步表单数据。',
  'materials/FormItems/Radio/Radio.tsx': '实现单选组物料，处理字典或接口选项、变量监听、表单值同步和选择事件。',
  'materials/FormItems/Rate/Rate.tsx': '封装评分表单物料，支持数量、半选、字符样式、提示文案和表单值同步。',
  'materials/FormItems/Select/Select.tsx': '实现选择器表单物料，整合字典、接口和运行时选项，并处理搜索、选择与表单同步。',
  'materials/FormItems/Slider/Slider.tsx': '封装滑块表单物料，支持范围、步长、刻度、格式化和表单数据同步。',
  'materials/FormItems/StaticItem/StaticItem.tsx': '实现只读表单展示项，将标签与动态格式化后的字段值按统一布局呈现。',
  'materials/FormItems/Switch/Switch.tsx': '封装开关表单物料，处理开关值映射、禁用状态、文案与表单同步。',
  'materials/FormItems/TextArea/TextArea.tsx': '封装多行文本输入物料，支持字数限制、自动尺寸、格式处理和表单同步。',
  'materials/FormItems/TimePicker/TimePicker.tsx': '封装时间选择表单物料，处理时间格式、默认值转换、状态配置和表单同步。',
  'materials/FormItems/TimePickerRange/TimePickerRange.tsx': '封装时间范围选择物料，处理起止时间格式转换、状态配置和表单同步。',
  'materials/FormItems/Transfer/Transfer.tsx': '实现穿梭框表单物料，支持动态数据源、搜索、分页、目标键集合和表单同步。',
  'materials/FormItems/TreeSelect/TreeSelect.tsx': '实现树选择表单物料，处理异步树数据、搜索、展开选择、变量监听和表单同步。',
  'materials/FormItems/Upload/Upload.tsx': '实现文件上传物料，管理上传接口、文件列表、校验、预览下载和表单值同步。',
  'materials/Functional/Button/AuthButton.tsx': '提供权限感知按钮，根据本地权限信息控制按钮可用性，并生成可复用的权限按钮封装。',
  'materials/Functional/Button/Button.tsx': '封装通用按钮物料，将类型、图标、加载状态与点击配置映射为按钮交互。',
  'materials/Functional/Descriptions/Descriptions.tsx': '实现描述列表物料，按配置或动态数据生成字段展示、操作项和事件交互。',
  'materials/Functional/List/List.tsx': '实现通用列表物料，从接口或变量读取数据，并委托渲染钩子生成列表项与操作行为。',
  'materials/Functional/List/useRenderItem.tsx': '提供列表项渲染钩子，对单项内容进行模板化展示、记忆化优化并连接动作流。',
  'materials/Functional/Tab/Tab.tsx': '实现单个页签内容容器，通过 NgapRender 渲染页签内部的低代码元素。',
  'materials/Functional/Tabs/Tabs.tsx': '实现多页签容器，管理活动页签、动态标题和切换状态，并渲染各页签内容。',
  'materials/Layout/BottomBanner/BottomBanner.tsx': '实现底部横幅布局容器，固定组织底部内容并通过 NgapRender 渲染嵌套元素。',
  'materials/Layout/Col/Col.tsx': '封装栅格列布局物料，将跨列、偏移和响应式属性应用到嵌套元素。',
  'materials/Layout/Divider/Divider.tsx': '封装分割线布局物料，提供方向、文字位置、虚线和样式配置。',
  'materials/Layout/Row/Row.tsx': '封装栅格行布局物料，将间距、对齐和换行配置应用到嵌套列元素。',
  'materials/Layout/Space/Space.tsx': '实现间距布局容器，统一管理方向、尺寸、换行和嵌套低代码内容。',
  'materials/Layout/Span/Col.tsx': '实现 Span 布局内部列节点，通过 NgapRender 承载实际嵌套内容。',
  'materials/Layout/Span/Span.tsx': '实现按比例分栏的 Span 容器，组合内部列节点并应用布局与样式配置。',
  'materials/NgapRender/NgapRender.tsx': '提供物料运行时核心渲染器，解析元素类型、动态加载组件、注入页面状态与引用，并优化 ECharts 预加载。',
  'materials/Other/IFrame/IFrame.tsx': '实现 IFrame 集成物料，拼装动态 URL 参数、监听跨窗口消息并连接页面动作流。',
  'materials/Page/Page.tsx': '实现页面根容器，应用页面级样式与动作处理，并通过 NgapRender 渲染顶层元素树。',
  'materials/Scene/BusinessTable/BusinessTable.tsx': '实现高能力业务表格场景物料，覆盖接口取数、列配置、筛选排序、分页选择、编辑操作、标签设置和动作流。',
  'materials/Scene/BusinessTable/TagSetting/TriggerEventItem.tsx': '定义业务表格标签设置使用的触发事件项类型，约束事件标识、名称与处理配置。',
  'materials/Scene/NgapTable/NgapTable.tsx': '实现平台通用数据表格场景物料，整合接口数据、列渲染、筛选排序、分页选择和动作事件。'
};

const componentNames = {
  AIChat: 'AI 对话', Breadcrumb: '面包屑', MFloatingWindow: '浮动窗口', MMenu: '菜单', MPagination: '分页器',
  MProgress: '进度条', TimelineCus: '时间轴', MTree: '树形控件', AudioPlayer: '音频播放器', MAvatar: '头像',
  MBadge: '徽标', BownloadButton: '下载按钮', MCarousel: '轮播图', MCheckableTagGroup: '可选标签组', CollapseBtn: '折叠按钮',
  MIcon: '图标', MImage: '图片', MLink: '链接', MStatistic: '统计数值', MTag: '标签', MText: '文本', MTimer: '计时器',
  MTitle: '标题', MVideo: '视频', MRow: '布局容器', MCard: '卡片', MCollapse: '折叠面板', MTabs: '页签/容器',
  Cycle: '循环容器', Div: '通用容器', MFlex: 'Flex 容器', MForm: '表单容器', GridForm: '网格表单',
  BarAndLine: '柱线组合图', EChart: '条形图', ColumnChart: '柱状图', LineChart: '折线图', MapChart: '地图图表', PieChart: '饼图',
  MEmpty: '空状态', MPopover: '气泡卡片', MResult: '结果反馈', MSpin: '加载状态', MCascader: '级联选择器',
  MCheckBox: '复选框组', MColorPicker: '颜色选择器', MCounter: '计数器', MDatePicker: '日期选择器', MDatePickerRange: '日期范围选择器',
  MFormItem: '表单项', MInput: '输入/滑块控件', MInputNumber: '数字输入框', MInputPassword: '密码输入框', JsonView: 'JSON 查看器',
  MJson: 'JSON 表单控件', MRadio: '单选组', MSelect: '选择器', StaticItem: '静态表单项', Label: '字段标签', MSwitch: '开关',
  MTextArea: '多行输入框', MTimePicker: '时间选择器', MTimePickerRange: '时间范围选择器', MTransfer: '穿梭框', WTreeSelect: '树选择器',
  MUpload: '文件上传', AuthButton: '权限按钮', genAuthButton: '权限按钮工厂', MButton: '按钮/描述列表', MList: '列表', MemoizedListItem: '列表项',
  MTab: '单页签', MBottomBanner: '底部横幅', MCol: '栅格列', MDevider: '分割线', MSpace: '间距容器', SpanCol: 'Span 内部列',
  MSpan: 'Span 分栏', IFrame: 'IFrame', Page: '页面容器', BusinessTable: '业务表格', NgapTable: '通用表格'
};

const functionSummaries = {
  parseInitialTime: '把可配置的初始时间值解析为计时器内部使用的时分秒结构。',
  detectUnitType: '根据数值规模识别适合图表展示的单位类型。',
  convertValueToNumber: '把带单位或格式的输入值转换为可计算的数值。',
  formatValueWithUnit: '按选定单位和精度格式化图表数值。',
  formatDifferenceWithUnit: '按单位格式化两个指标之间的差值展示。',
  getLighterColor: '根据基础颜色计算更浅的派生色，用于图表层次化配色。',
  JsonView: '递归呈现 JSON 数据的对象、数组和基础值结构。',
  useRenderItem: '返回列表项渲染函数，复用记忆化列表项并注入当前列表上下文。',
  MemoizedListItem: '渲染并记忆化单个列表项，解析模板字段并绑定项目级动作事件。',
  renderBtn: '根据权限判断结果渲染可用或受限状态的按钮节点。',
  genAuthButton: '生成带权限校验能力的按钮封装，供不同按钮配置复用。',
  preloadEcharts: '提前加载 ECharts 相关运行时代码，减少首次渲染图表时的等待。',
  resetEchartsPreload: '重置 ECharts 预加载缓存，使运行时可以重新发起加载。',
  buildUrlWithParams: '解析 IFrame 地址并合并静态参数、页面变量和运行时动态参数。'
};

const languageNotes = {
  'materials/EChart/chartCalculationUtil.ts': '使用无副作用的 TypeScript 工具函数统一图表单位与格式化规则。',
  'materials/NgapRender/NgapRender.tsx': '通过 React.lazy、Suspense 与组件映射实现运行时物料分派，并缓存图表预加载状态。',
  'materials/Scene/BusinessTable/BusinessTable.tsx': '单个大型 React 函数组件集中编排大量 Hooks、派生配置和表格事件，复杂度较高。',
  'materials/Scene/NgapTable/NgapTable.tsx': '采用 React Hooks 汇聚表格数据请求、列状态和交互行为。',
  'materials/Advanced/AudioPlayer/AudioPlayer.tsx': '以 React Hooks 管理媒体元素引用和连续播放状态。'
};

function basenameWithoutExt(filePath) {
  return path.basename(filePath).replace(/\.[^.]+$/, '');
}

function complexity(nonEmptyLines) {
  if (nonEmptyLines < 50) return 'simple';
  if (nonEmptyLines <= 200) return 'moderate';
  return 'complex';
}

function fileTags(filePath) {
  const tags = ['react-component', 'low-code-material'];
  if (filePath.includes('/Advanced/')) tags.push('advanced-widget');
  else if (filePath.includes('/Basic/')) tags.push('display-widget');
  else if (filePath.includes('/Container/')) tags.push('container', 'nested-rendering');
  else if (filePath.includes('/EChart/')) tags.push('data-visualization', 'echarts');
  else if (filePath.includes('/FeedBack/')) tags.push('feedback', 'interaction');
  else if (filePath.includes('/FormItems/')) tags.push('form-control', 'data-binding');
  else if (filePath.includes('/Functional/')) tags.push('functional-widget', 'event-handler');
  else if (filePath.includes('/Layout/')) tags.push('layout', 'nested-rendering');
  else if (filePath.includes('/Scene/')) tags.push('scene-component', 'data-table');
  else if (filePath.includes('/NgapRender/')) tags.push('runtime-renderer', 'component-registry');
  else if (filePath.includes('/IFrame/')) tags.push('iframe', 'integration');
  else if (filePath.includes('/Page/')) tags.push('page-container', 'runtime-renderer');
  if (filePath.endsWith('chartCalculationUtil.ts')) return ['utility', 'data-visualization', 'formatting', 'unit-conversion'];
  if (filePath.endsWith('CustomCalendarIcon.tsx')) return ['react-component', 'icon', 'svg', 'form-control'];
  if (filePath.endsWith('TriggerEventItem.tsx')) return ['type-definition', 'data-table', 'event-config'];
  return [...new Set(tags)].slice(0, 5);
}

function functionSummary(fnName, filePath) {
  if (functionSummaries[fnName]) return functionSummaries[fnName];
  const label = componentNames[fnName] || basenameWithoutExt(filePath);
  if (/^(M|W)[A-Z]|^[A-Z]/.test(fnName)) {
    return `实现${label}的核心渲染与交互逻辑，衔接低代码属性、运行时数据和组件事件。`;
  }
  return `为${basenameWithoutExt(filePath)}提供${fnName}辅助逻辑，封装该物料内部复用的数据处理步骤。`;
}

function functionTags(fnName, filePath) {
  if (filePath.endsWith('chartCalculationUtil.ts')) return ['utility', 'data-conversion', 'formatting'];
  if (fnName === 'useRenderItem') return ['hook', 'list-rendering', 'factory'];
  if (fnName === 'buildUrlWithParams') return ['utility', 'url-builder', 'parameter-binding'];
  if (fnName === 'genAuthButton') return ['factory', 'authorization', 'react-component'];
  if (fnName === 'resetEchartsPreload' || fnName === 'preloadEcharts') return ['utility', 'lazy-loading', 'echarts'];
  if (fnName === 'parseInitialTime') return ['utility', 'time-parsing', 'timer'];
  return ['react-component', 'rendering', 'event-handler'];
}

function makeFileNode(result) {
  const node = {
    id: `file:${result.path}`,
    type: 'file',
    name: path.basename(result.path),
    filePath: result.path,
    summary: summaries[result.path] || `实现 ${basenameWithoutExt(result.path)} 低代码物料及其运行时交互。`,
    tags: fileTags(result.path),
    complexity: complexity(result.nonEmptyLines ?? result.totalLines ?? 0)
  };
  if (languageNotes[result.path]) node.languageNotes = languageNotes[result.path];
  return node;
}

function significantFunction(fn, exportNames) {
  const length = Number(fn.endLine) - Number(fn.startLine) + 1;
  return Boolean(fn.name) && fn.name !== '-' && (length >= 10 || exportNames.has(fn.name));
}

function validatePart(fragment, allowedExternal) {
  const ids = new Set(fragment.nodes.map((node) => node.id));
  const errors = [];
  for (const edge of fragment.edges) {
    if (!ids.has(edge.source)) errors.push(`source missing: ${edge.source}`);
    if (ids.has(edge.target)) continue;
    const fileMatch = /^file:(.+)$/.exec(edge.target);
    const symbolMatch = /^(function|class):(.+):([^:]+)$/.exec(edge.target);
    if (fileMatch && allowedExternal.files.has(fileMatch[1])) continue;
    if (symbolMatch && allowedExternal.symbols.has(`${symbolMatch[2]}:${symbolMatch[3]}`)) continue;
    errors.push(`target not allowed: ${edge.target}`);
  }
  if (errors.length) throw new Error(errors.slice(0, 20).join('\n'));
}

for (const batchIndex of [7, 8, 9]) {
  const batch = batchesDoc.batches.find((item) => item.batchIndex === batchIndex);
  if (!batch) throw new Error(`Batch ${batchIndex} not found`);
  const extractionPath = path.join(uaRoot, 'tmp', `ua-file-extract-results-${batchIndex}.json`);
  const extraction = JSON.parse(fs.readFileSync(extractionPath, 'utf8'));
  if (!extraction.scriptCompleted || extraction.results.length !== batch.files.length) {
    throw new Error(`Extraction for batch ${batchIndex} is incomplete`);
  }

  const nodes = [];
  const edges = [];
  const functionIdsByFile = new Map();
  const resultByPath = new Map(extraction.results.map((result) => [result.path, result]));

  for (const file of batch.files) {
    const result = resultByPath.get(file.path);
    if (!result) throw new Error(`Missing extraction result: ${file.path}`);
    nodes.push(makeFileNode(result));
    const exportNames = new Set((result.exports || []).map((entry) => entry.name));
    const localFunctions = new Map();
    for (const fn of result.functions || []) {
      if (!significantFunction(fn, exportNames)) continue;
      const id = `function:${file.path}:${fn.name}`;
      nodes.push({
        id,
        type: 'function',
        name: fn.name,
        filePath: file.path,
        lineRange: [Number(fn.startLine), Number(fn.endLine)],
        summary: functionSummary(fn.name, file.path),
        tags: functionTags(fn.name, file.path),
        complexity: complexity(Number(fn.endLine) - Number(fn.startLine) + 1)
      });
      localFunctions.set(fn.name, id);
      edges.push({ source: `file:${file.path}`, target: id, type: 'contains', direction: 'forward', weight: 1.0 });
      if (exportNames.has(fn.name)) {
        edges.push({ source: `file:${file.path}`, target: id, type: 'exports', direction: 'forward', weight: 0.8 });
      }
    }
    functionIdsByFile.set(file.path, localFunctions);
  }

  // Import edges are emitted verbatim, one per resolved internal import.
  for (const file of batch.files) {
    const imports = batch.batchImportData[file.path] || [];
    for (const target of imports) {
      edges.push({ source: `file:${file.path}`, target: `file:${target}`, type: 'imports', direction: 'forward', weight: 0.7 });
    }
  }

  // Add function-level calls only when structural call data and a known local/cross-batch symbol agree.
  const seenCalls = new Set();
  for (const file of batch.files) {
    const result = resultByPath.get(file.path);
    const localFunctions = functionIdsByFile.get(file.path);
    const neighbors = batch.neighborMap[file.path] || [];
    for (const call of result.callGraph || []) {
      const source = localFunctions.get(call.caller);
      if (!source) continue;
      let target = localFunctions.get(call.callee);
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
  if (expectedImports !== actualImports) {
    throw new Error(`Batch ${batchIndex}: expected ${expectedImports} imports, emitted ${actualImports}`);
  }

  const partCount = Math.ceil(Math.max(nodes.length / 60, edges.length / 120));
  const sortedFiles = batch.files.map((file) => file.path).sort((a, b) => a.localeCompare(b));
  const chunkSize = Math.ceil(sortedFiles.length / partCount);
  const allReferencedFiles = new Set();
  const allReferencedSymbols = new Set();
  for (const file of batch.files) {
    allReferencedFiles.add(file.path);
    for (const imported of batch.batchImportData[file.path] || []) allReferencedFiles.add(imported);
    for (const neighbor of batch.neighborMap[file.path] || []) {
      allReferencedFiles.add(neighbor.path);
      for (const symbol of neighbor.symbols || []) allReferencedSymbols.add(`${neighbor.path}:${symbol}`);
    }
  }

  for (let partIndex = 0; partIndex < partCount; partIndex += 1) {
    const partFiles = new Set(sortedFiles.slice(partIndex * chunkSize, (partIndex + 1) * chunkSize));
    const partNodes = nodes.filter((node) => partFiles.has(node.filePath));
    const sourceIds = new Set(partNodes.map((node) => node.id));
    const partEdges = edges.filter((edge) => sourceIds.has(edge.source));
    const fragment = { nodes: partNodes, edges: partEdges };
    validatePart(fragment, { files: allReferencedFiles, symbols: allReferencedSymbols });
    const outPath = path.join(uaRoot, 'intermediate', `batch-${batchIndex}-part-${partIndex + 1}.json`);
    fs.writeFileSync(outPath, `${JSON.stringify(fragment, null, 2)}\n`, 'utf8');
  }

  console.log(JSON.stringify({ batchIndex, files: batch.files.length, nodes: nodes.length, edges: edges.length, imports: actualImports, parts: partCount }));
}
