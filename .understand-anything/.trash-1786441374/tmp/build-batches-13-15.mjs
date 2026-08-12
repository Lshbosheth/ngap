import fs from 'node:fs';
import path from 'node:path';

const root = 'C:/Users/EDY/Desktop/ngap';
const intermediate = path.join(root, '.understand-anything/intermediate');
const tmp = path.join(root, '.understand-anything/tmp');
const batches = JSON.parse(fs.readFileSync(path.join(intermediate, 'batches.json'), 'utf8')).batches;

const summaries = {
  'src/packages/Advanced/Steps/StepCircleIcon.tsx': '渲染步骤条未完成节点的圆形状态图标，并通过模块化样式保持尺寸和颜色一致。',
  'src/packages/Advanced/Steps/StepFinishIcon.tsx': '渲染步骤条已完成节点图标，支持完成态视觉和主题样式。',
  'src/packages/Advanced/Steps/StepLoadingIcon.tsx': '渲染步骤条进行中节点的加载动画图标，提供旋转层级和状态色展示。',
  'src/packages/Advanced/Steps/Steps.tsx': '实现高级步骤条物料，根据配置的步骤数据、当前节点和状态渲染自定义图标，并向事件系统暴露步骤切换交互。',
  'src/packages/Advanced/Steps/Schema.tsx': '声明步骤条物料的属性 Schema，覆盖步骤数据、当前项、方向、尺寸、状态、样式和动作配置。',
  'src/packages/Advanced/Steps/StepSetting.tsx': '提供步骤条节点集合设置器，组织可编辑列表并把步骤配置同步到属性表单。',
  'src/packages/Advanced/Steps/stepSettingRow.tsx': '渲染步骤配置中的单行编辑项，维护标题、描述、状态和删除等字段交互。',
  'src/pages/applicationAchievements/evaluationDetailsModal/index.tsx': '实现应用成效评估详情弹窗，展示评价指标、得分、反馈和明细数据，支持查看单次评估结果。',
  'src/pages/applicationAchievements/index.tsx': '实现应用成效管理页面，提供应用评价数据查询、筛选、分页、汇总展示和详情查看。',
  'src/pages/applicationAchievements/types.ts': '定义应用成效页面的查询条件、列表记录、评估指标和详情数据等 TypeScript 类型。',
  'src/pages/taskCenter/index.tsx': '实现任务中心主页面，组织待办查询、筛选、分页、批量操作和审核抽屉，是应用及物料审核任务的统一入口。',
  'src/pages/taskCenter/review.tsx': '实现任务审核详情抽屉，展示申请信息、版本内容和流程节点，并提交通过、驳回等审核意见。',
  'src/pages/taskCenter/reviewConfig.tsx': '实现审核流程配置抽屉，用于维护应用、模板、组件和自定义元素等对象的审核环节及审批人。',
  'src/pages/taskCenter/reviewConfigCon.ts': '集中定义各类对象的默认审核流程、临时流程和审核树数据，供审核配置界面构建流程选项。',
  'src/pages/templateManagement/applicationModuleList/applicationCard.tsx': '渲染应用模块卡片及其预览、编辑、复制、发布等操作，承载模板管理中的单项交互。',
  'src/pages/templateManagement/applicationModuleList/index.tsx': '以类组件实现应用模块列表，负责查询、分页、消息监听及卡片操作后的列表刷新。',
  'src/pages/templateManagement/applicationTemp/addApplyponentTemp.tsx': '提供新增或编辑应用模板的基础信息对话框，维护模板名称、分类、图标和说明等元数据。',
  'src/pages/templateManagement/applicationTemp/applicationTempSearchCont.tsx': '实现应用模板搜索结果与操作区，负责条件查询、分页、预览和模板生命周期操作。',
  'src/pages/templateManagement/applicationTemp/index.tsx': '组织应用模板管理页的查询条件与结果列表，并提供重置和刷新入口。',
  'src/pages/templateManagement/businessTemplatePreview/index.tsx': '渲染业务组件模板预览页，根据模板信息加载并展示对应组件内容。',
  'src/pages/templateManagement/componentTemp/addComponentTemp.tsx': '提供新增或编辑组件模板的对话框，维护模板基础信息、分类、图标和关联组件。',
  'src/pages/templateManagement/componentTemp/componentTempSearchCont.tsx': '实现组件模板搜索结果与操作区，处理查询、分页、预览、编辑、复制和发布等动作。',
  'src/pages/templateManagement/componentTemp/index.tsx': '组织组件模板管理页，协调查询表单、结果列表、初始化加载与重置行为。',
  'src/pages/templateManagement/index.tsx': '提供模板管理总入口，通过页签切换应用模板、组件模板及相关模块列表。',
  'src/pages/templateManagement/tempModuleList/index.tsx': '以类组件实现模板模块搜索结果列表，处理查询结果、消息订阅、分页和模块卡片操作。',
  'src/pages/templateManagement/tempModuleList/templateCard.tsx': '渲染模板模块卡片，展示模板信息并提供预览、编辑、复制、删除等快捷操作。',
  'src/pages/templateManagement/templateManageTypes.ts': '定义模板管理页面使用的应用模板、组件模板、查询条件和卡片数据等 TypeScript 类型。',
  'src/pages/tenantManage/index.tsx': '实现租户管理主页面，提供租户查询、分页、新增、编辑、状态变更及授权等管理能力。',
  'src/pages/tenantManage/tenantModal.tsx': '实现租户新增与编辑弹窗，收集并校验租户基础资料后提交保存。',
  'src/polyfills.ts': '集中加载浏览器兼容补丁，为运行环境补齐项目依赖的标准 API 和旧浏览器行为。',
  'src/router/index.tsx': '定义应用路由入口，根据菜单状态动态生成路由并挂载主要管理页面。',
  'src/stores/menuStore.ts': '使用状态模型维护菜单树、当前组件模型和相关导航状态，供路由及页面框架共享。',
  'src/utils/Logout.ts': '封装退出登录流程，清理登录态并跳转到统一认证或登录入口。',
  'src/utils/appMenuData.ts': '提供平台内置应用菜单树和页面路由元数据，是菜单初始化与权限展示的静态数据源。',
  'src/utils/crossAPIDistributeMessages.ts': '分发来自 CrossAPI 的异步消息，串行处理用户信息、标签页、弹窗及页面销毁等跨容器指令。',
  'src/utils/goldbank.ts': '封装 GoldBank 安全能力的初始化与打开流程，管理外部脚本、参数和回调交互。',
  'src/utils/logCapture.ts': '拦截并缓存浏览器日志，提供时间戳、日志追加、读取与清空能力，便于问题诊断和上报。',
  'src/utils/objectToFormData.ts': '提供普通对象与 FormData 的双向转换及调试输出，兼容数组、嵌套对象和文件字段。',
  'src/utils/operLog.ts': '封装操作日志上报，收集当前用户、页面和业务操作信息并发送到日志接口。',
  'src/utils/request.ts': '配置平台 HTTP 请求客户端，统一鉴权、错误提示、本地 Mock、响应处理与请求缓存策略。',
  'materials/Scene/SearchForm/SearchForm.tsx': '实现独立 materials 运行时的搜索表单场景组件，根据配置生成查询项并触发查询、重置和事件流。',
  'materials/index.tsx': '作为独立 materials 运行时的动态组件加载入口，下载自定义元素源码、执行 TSX/JS/Less 转换并缓存可懒加载组件。',
  'materials/stores/pageStore.ts': '使用 Zustand 管理独立页面运行时的元素树、变量、表单、接口输出和组件引用，是 materials 渲染与动作执行的共享状态中心。',
  'materials/types/index.ts': '定义独立 materials 运行时的页面、元素、事件、接口、变量和组件配置等核心 TypeScript 类型。',
  'materials/utils/AntdGlobal.tsx': '从 Ant Design App 上下文导出全局 message、notification 和 Modal 实例，供非组件代码触发反馈。',
  'materials/utils/ProvinceIdCon.ts': '提供省份编码从八位制式到三位制式的转换映射工具。',
  'materials/utils/action.ts': '实现独立 materials 运行时的事件动作解释器，按动作链执行接口、弹窗、跳转、变量、样式、脚本和组件状态变更。',
  'materials/utils/apiUtilForInterface.ts': '解析接口编排中的入参、出参和 CrossAPI 字段，执行接口并把结果映射回页面运行时数据。',
  'materials/utils/columns.tsx': '提供表格列值格式化和标签设置图标渲染，支撑动态表格列的展示配置。',
  'materials/utils/context.ts': '定义表单上下文及其访问 Hook，使 materials 子组件共享表单实例和配置。',
  'materials/utils/crossAPI.js': '承载压缩后的 CrossAPI 浏览器桥接实现，封装宿主环境消息调用、回调登记和客户端能力访问。',
  'materials/utils/crossAPIAction.ts': '将页面动作配置映射为 CrossAPI 客户端调用，覆盖开屏卡、通话、鉴权、消息和业务办理等宿主能力。',
  'materials/utils/crossAPIUtil.ts': '提供对 CrossAPI 常用客户端能力的薄封装，统一调用格式并导出坐席、通话、鉴权和消息相关方法。',
  'materials/utils/dealApiData.ts': '递归整理接口返回的层级数据，为树形选项和组件数据源生成统一的 label/value 结构。',
  'materials/utils/dictionary.ts': '通过运行时请求获取数据字典，并转换为组件可直接使用的选项集合。',
  'materials/utils/filter.tsx': '提供表格文本筛选下拉面板和列筛选配置生成器。',
  'materials/utils/goldBankCheckfn.ts': '把页面动作参数转换为 GoldBank 安全校验调用，并统一处理成功、取消和异常回调。',
  'materials/utils/goldbank.ts': '封装独立 materials 运行时使用的 GoldBank 安全能力加载与调用。',
  'materials/utils/handleApi.ts': '执行页面配置的接口请求，合并上下文参数并将响应写入运行时变量、表单或组件数据。',
  'materials/utils/request.ts': '配置独立 materials 运行时的 HTTP 客户端，统一鉴权、错误提示、响应解析和缓存策略。',
  'materials/utils/sort.tsx': '提供表格数字、日期和混合值排序器及排序图标配置。',
  'materials/utils/storage.ts': '封装页面运行时的本地存储读写，统一序列化、键名和异常处理。',
  'materials/utils/textfilter.ts': '严格检测富文本内容是否显式设置字体颜色，用于文本样式过滤和兼容处理。',
  'materials/utils/useComponentRefs.ts': '维护按元素标识索引的组件 Ref 注册表，供动作引擎跨组件调用实例方法。',
  'materials/utils/useWatchVariable.ts': '监听页面变量变化并触发依赖更新，使配置表达式和组件属性随变量刷新。',
  'materials/utils/util.ts': '汇集独立运行时的 ID、日期、模板、公式、变量、接口数据、脚本样式加载和表单值转换工具。',
  'materials/utils/windowSort.tsx': '实现混合类型字符串排序器，对数字、尺寸、字母、中文和特殊字符分词后执行稳定比较。',
  'src/utils/useMessageListener.tsx': '提供窗口 postMessage 监听 Hook 及向父窗口发送消息的方法，用于编辑器与宿主容器通信。',
  'src/packages/Layout/Span/Span.tsx': '实现行内 Span 布局物料，应用配置样式、事件和子元素并暴露组件引用。',
  'src/packages/NgapRender/NgapRender.tsx': '实现主运行时的通用物料渲染器，根据元素类型解析组件、属性、变量和事件并递归渲染子元素。',
  'src/packages/Other/IFrame/IFrame.tsx': '实现 IFrame 物料，按配置拼接 URL 参数、控制加载状态并处理与内嵌页面的消息交互。',
  'src/packages/Page/Page.tsx': '实现页面根容器物料，负责页面样式、事件初始化、表单上下文和子元素承载。',
  'src/packages/index.tsx': '作为主 src 运行时的动态物料注册入口，下载并编译自定义元素源码、缓存组件并提供查询和更新 API。',
  'src/packages/types/index.ts': '定义主物料运行时的元素、页面、事件、接口、变量、Schema 和组件属性等公共类型契约。',
  'src/packages/utils/action.ts': '实现主物料运行时的动作链解释器，执行接口、弹窗、跳转、变量赋值、样式和组件状态等动作。',
  'src/packages/utils/context.ts': '定义主物料运行时表单上下文及访问 Hook。',
  'src/packages/utils/crossAPIAction.ts': '将主运行时动作配置转换为 CrossAPI 客户端调用，覆盖坐席、通话、鉴权和消息等宿主能力。',
  'src/packages/utils/goldBankCheckfn.ts': '把主运行时动作参数转换为 GoldBank 安全校验调用并处理回调。',
  'src/packages/utils/handleApi.ts': '执行主运行时页面接口配置，解析上下文参数并把响应映射到变量、表单和组件状态。',
  'src/packages/utils/useComponentRefs.ts': '维护主运行时的元素组件 Ref 注册表，支持动作链按元素标识调用实例。',
  'src/packages/utils/useHandleApi.ts': '封装 React 组件中的接口执行逻辑，读取页面上下文、合并参数并更新运行时数据。',
  'src/packages/utils/useMaterialTools.ts': '为物料组件提供动作执行、变量访问和组件引用等常用运行时工具。',
  'src/packages/utils/util.ts': '汇集主物料运行时的日期、公式、变量、模板、脚本样式和表单数据转换工具。',
  'src/pages/applicationOrchestration/pageCanvas/components/ComponentPanelAO.tsx': '实现应用编排画布的物料面板，展示内置与自定义组件分类并支持搜索、拖拽和菜单刷新。',
  'src/pages/editor/editor.tsx': '实现低代码编辑器主工作区，组织画布、物料、属性面板、预览、保存及跨窗口消息协作。',
  'src/stores/apiListStore.ts': '维护可选接口列表及其加载状态，为接口配置和表达式编辑提供共享数据源。',
  'src/stores/canvasPageStore.ts': '创建编辑器画布的核心 Zustand Store，统一管理页面元素、变量、表单、接口、选中态、历史记录和流程节点数据。',
  'src/stores/crossAPIStaticDataStore.ts': '维护 CrossAPI 静态字典与能力元数据，为动作配置面板提供方法和参数选项。',
  'src/stores/crossapiStore.ts': '维护当前 CrossAPI 用户、坐席及宿主上下文信息，供编辑器和运行时能力调用共享。',
  'src/utils/AntdGlobal.tsx': '从 Ant Design App 上下文导出全局反馈实例，供 Store 与工具代码调用 message、notification 和 Modal。',
  'src/utils/AppProvider.tsx': '提供应用级 React Context，集中暴露用户、环境及平台公共状态，并提供安全访问 Hook。',
  'src/utils/apiUtilForInterface.ts': '解析主编辑器接口编排的输入、输出和 CrossAPI 字段，执行接口并映射返回结果。',
  'src/utils/crossAPI.js': '承载主应用使用的压缩 CrossAPI 浏览器桥接脚本。',
  'src/utils/crossAPIUtil.ts': '封装主应用常用 CrossAPI 客户端方法，统一坐席、通话、鉴权和消息调用接口。',
  'src/utils/dealApiGlobal.ts': '合并组件与页面接口定义，并按接口标识更新全局 API 配置及其引用。',
};

const functionSummaryMap = {
  StepCircleIcon: '渲染步骤条待处理节点的圆形状态图标。',
  StepFinishIcon: '渲染步骤条已完成节点的完成态图标。',
  StepLoadingIcon: '渲染步骤条进行中节点的加载动画图标。',
  MSteps: '渲染可配置步骤条，选择对应状态图标并处理步骤切换事件。',
  EvalutionDetialModal: '渲染成效评估详情弹窗并组织指标与反馈数据展示。',
  ApplicationAchievements: '渲染应用成效管理页面并协调查询、分页和详情交互。',
  LogoutFun: '清理登录状态并执行平台退出跳转。',
  sendUserInfoEvent: '把宿主返回的用户信息转换为页面事件并向相关窗口分发。',
  processNextMessage: '从消息队列取出下一条 CrossAPI 指令并保证串行处理。',
  handleIframeDialog: '处理宿主要求打开 IFrame 弹窗的消息并维护其生命周期。',
  handleCreateTab: '处理创建宿主标签页的消息。',
  handleDestroyTab: '处理销毁宿主标签页的消息。',
  handleCloseDialog: '处理关闭弹窗消息并清理关联页面状态。',
  processSingleMessage: '识别并分派单条 CrossAPI 消息。',
  crossAPIDistributeMessages: '接收 CrossAPI 消息集合并启动有序分发。',
  getTimestamp: '生成日志记录使用的格式化时间戳。',
  addLog: '把一条日志按级别和时间写入捕获缓冲区。',
  getCapturedLogs: '返回当前已捕获的日志集合。',
  clearCapturedLogs: '清空已捕获日志。',
  objectToFormData: '递归把对象字段转换为 FormData。',
  formDataToObject: '把 FormData 条目还原为普通对象。',
  logFormData: '遍历并输出 FormData 内容用于诊断。',
  recordLog: '组装用户和业务上下文并上报操作日志。',
  showErrorIfNeeded: '根据响应状态和配置决定是否展示统一错误提示。',
  loadCache: '读取请求缓存并判断有效期与复用条件。',
  updateRequestCache: '更新请求结果缓存及时间信息。',
  getLocalMockResult: '从本地 Mock 配置中解析匹配当前请求的返回值。',
  loadComponents: '批量预加载 materials 运行时所需组件。',
  onPreviewTsx: '把下载的 TSX 源码编译为浏览器可执行模块。',
  onPreviewJs: '处理自定义元素 JavaScript 源码并生成可执行模块。',
  onPreviewLess: '编译并注入自定义元素 Less 样式。',
  extensionToMimeType: '把文件扩展名映射为下载响应的 MIME 类型。',
  downloadFile: '下载自定义元素单个源码或资源文件。',
  getLanguageByExtension: '根据扩展名识别编辑或编译使用的语言类型。',
  fetchFileStream: '获取单个自定义元素文件流。',
  fetchAllFileStream: '并行获取自定义元素包内全部文件内容。',
  elementInfoFun: '加载元素元数据和源码并创建运行时组件。',
  queryElementFun: '查询自定义元素信息并更新动态组件缓存。',
  getComponent: '按元素类型返回内置或动态加载的组件。',
  createLazyFactory: '创建可按需加载组件的 React lazy 工厂。',
  clearElementComponents: '清空动态元素组件缓存。',
  clearBabelCache: '清空源码编译缓存。',
  clearComponentCache: '按标识移除单个动态组件缓存。',
  clearAllComponentCache: '清空主运行时全部动态组件缓存。',
  getComponentType: '返回指定动态组件的注册类型信息。',
  updateComponent: '重新加载并替换指定自定义组件。',
  clearTimerList: '取消动作引擎登记的全部延时任务。',
  clearProcessedMessageIds: '清空已处理消息标识，允许新的消息周期重新执行。',
  convertArrayToLinkedList: '把线性动作配置转换为带分支和 next 指针的执行链。',
  handleActionFlow: '构建动作链并从入口开始顺序执行。',
  execAction: '识别当前动作类型、执行处理器并推进动作链或分支。',
  messAgeParams: '从页面上下文中解析消息动作参数。',
  mergeParams: '把静态配置、变量、表单和接口数据合并为调用参数。',
  handleMethods: '调用目标组件暴露的方法并处理返回结果。',
  handleOpenModal: '执行打开模态框动作。',
  handleShowConfirm: '执行确认对话框动作并根据选择进入不同分支。',
  handleMessage: '执行全局消息提示动作。',
  handleNotification: '执行通知提示动作。',
  handleRequest: '执行接口请求动作。',
  handleCrossAPIfn: '执行 CrossAPI 宿主能力动作。',
  handleGoldBankCheckfn: '执行 GoldBank 安全校验动作。',
  handleJumpLink: '解析并执行页面内、外部链接或路由跳转动作。',
  handleDestroyPage: '销毁指定页面或宿主容器。',
  handleVariable: '计算表达式并写入页面变量。',
  handleCopy: '把指定内容复制到剪贴板。',
  handleSetTimeout: '延迟执行后续动作并登记可清理定时器。',
  handleVisible: '变更目标组件的显示状态。',
  handleDisable: '变更目标组件的禁用状态。',
  handleStyle: '向目标组件应用动态样式。',
  handleRunScripts: '在受控上下文中执行配置脚本。',
  handleOpenPopover: '调用目标组件打开气泡层。',
  handleClosePopover: '调用目标组件关闭气泡层。',
  scrollToElementByDataId: '按元素标识滚动到目标组件。',
  triggerComponentEventByDataId: '按元素标识触发组件事件。',
  handleExternalScroll: '处理外部容器发来的定位滚动请求。',
  handleExternalScrollAndTrigger: '滚动到目标元素后继续触发其配置事件。',
  getParams: '解析接口入参定义并从运行时上下文取值。',
  getFieldFromCrossAPI: '从 CrossAPI 返回结构中递归提取配置字段。',
  getCrossAPIValue: '调用 CrossAPI 并取得指定路径的值。',
  getOutParams: '按接口出参映射提取响应字段。',
  getFieldFromAPI: '从接口响应中递归解析字段路径和数组结构。',
  getFormatFlag: '判断接口字段是否需要格式化处理。',
  execInterface: '解析接口配置、发起请求并处理成功或失败回调。',
  formatCellValue: '按列配置格式化表格单元格值。',
  TagSettingIcons: '渲染标签设置中使用的状态或样式图标。',
  useFormContext: '读取当前表单上下文并在缺失 Provider 时给出明确约束。',
  crossAPIAction: '按动作名称和参数分派 CrossAPI 客户端能力调用。',
  dealApiData: '把接口层级数据转换为组件选项树。',
  dealChildren: '递归处理接口数据的子节点。',
  getDictionary: '请求指定字典并转换为选项列表。',
  TextFilterDropdown: '渲染表格文本筛选输入和确认、重置操作。',
  getTextFilterConfig: '生成表格列文本筛选配置。',
  filterConfig: '返回预设的文本筛选配置。',
  GoldBankCheckAction: '解析动作参数并调用 GoldBank 安全校验。',
  handleApi: '执行配置接口并把结果写回页面运行时。',
  numberSort: '比较两个可解析为数字的单元格值。',
  dateSort: '按日期时间比较两个单元格值。',
  getSorter: '根据列类型返回对应排序比较器。',
  getSortIcon: '根据排序状态渲染列头排序图标。',
  sortConfig: '生成表格列排序配置。',
  hasFontColorStrict: '检测 HTML 内容是否明确声明字体颜色。',
  useWatchVariable: '订阅变量状态并在变化时刷新依赖组件。',
  buildUrlWithParams: '把配置参数编码并追加到 IFrame URL。',
  mergeApis: '按接口标识合并多组 API 配置。',
  updateApiConfig: '更新全局 API 配置并同步相关引用。',
  useMessageListener: '注册窗口消息监听并在组件卸载时清理。',
  postMessageToParent: '向父窗口发送结构化协作消息。',
};

function complexity(lines) {
  if (lines > 200) return 'complex';
  if (lines >= 50) return 'moderate';
  return 'simple';
}

function explicitExport(source, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [
    new RegExp(`export\\s+default\\s+(?:(?:function|class)\\s+)?${escaped}\\b`),
    new RegExp(`export\\s+(?:const|function|class)\\s+${escaped}\\b`),
    new RegExp(`export\\s*\\{[^}]*\\b${escaped}\\b[^}]*\\}`),
  ].some((pattern) => pattern.test(source));
}

function fileTags(filePath) {
  if (filePath.includes('/pages/')) return ['component', 'page', 'management-ui'];
  if (filePath.includes('/stores/')) return ['store', 'state-management', 'runtime-data'];
  if (filePath.includes('/types/')) return ['type-definition', 'runtime-contract', 'typescript'];
  if (filePath.endsWith('request.ts')) return ['utility', 'http-client', 'cache', 'error-handling'];
  if (filePath.endsWith('action.ts')) return ['service', 'action-engine', 'workflow', 'event-handler'];
  if (filePath.endsWith('crossAPI.js') || filePath.includes('crossAPI')) return ['service', 'cross-api', 'host-integration'];
  if (filePath.endsWith('/index.tsx') && filePath.includes('packages')) return ['entry-point', 'component-registry', 'dynamic-loader', 'custom-element'];
  if (filePath.includes('/packages/') || filePath.includes('/Scene/')) return ['component', 'react', 'runtime-renderer'];
  if (filePath.endsWith('polyfills.ts')) return ['compatibility', 'bootstrap', 'configuration'];
  if (filePath.includes('/router/')) return ['routing', 'entry-point', 'navigation'];
  return ['utility', 'runtime', 'data-processing'];
}

function functionTags(filePath, name) {
  if (/^[A-Z]/.test(name) && (filePath.endsWith('.tsx') || filePath.endsWith('.jsx'))) return ['component', 'react', 'event-handler'];
  if (name.startsWith('use') || name.startsWith('Use')) return ['hook', 'react', 'runtime-data'];
  if (filePath.endsWith('action.ts')) return ['service', 'action-engine', 'event-handler'];
  if (filePath.includes('crossAPI')) return ['service', 'cross-api', 'host-integration'];
  if (filePath.includes('apiUtil') || /Api|Params|Field|Interface/.test(name)) return ['utility', 'api', 'data-mapping'];
  if (/Cache|Component|Preview|File|Language/.test(name) && filePath.endsWith('/index.tsx')) return ['utility', 'dynamic-loader', 'custom-element'];
  return ['utility', 'data-processing', 'runtime'];
}

function classTags(filePath, name) {
  if (name === 'GoldBank') return ['service', 'security', 'external-integration'];
  if (name === 'MixedTypeSorter') return ['utility', 'sorting', 'data-processing'];
  return ['component', 'react', 'management-ui'];
}

function functionSummary(filePath, name) {
  if (functionSummaryMap[name]) return functionSummaryMap[name];
  if (/^[A-Z]/.test(name) && filePath.endsWith('.tsx')) return `渲染 ${path.basename(filePath, '.tsx')} 对应界面并协调其状态、数据请求和用户操作。`;
  if (filePath.endsWith('crossAPIUtil.ts')) return `封装 CrossAPI 的 ${name} 客户端能力调用并返回统一结果。`;
  if (filePath.endsWith('util.ts')) return `实现 ${name} 通用数据转换或运行时辅助逻辑。`;
  if (filePath.endsWith('crossAPI.js')) return `实现压缩 CrossAPI 桥接脚本中的 ${name} 内部调用步骤。`;
  return `实现 ${name} 对应的运行时处理逻辑。`;
}

function classSummary(filePath, name) {
  if (name === 'GoldBank') return '管理 GoldBank 外部安全组件的脚本加载、实例状态和打开调用。';
  if (name === 'MixedTypeSorter') return '把混合字符串拆分为数字、单位、字母、中文和特殊符号令牌，并提供可复用比较器。';
  return `以 React 类组件组织 ${path.basename(path.dirname(filePath))} 列表或页面的加载、渲染和生命周期。`;
}

function languageNotes(filePath) {
  if (filePath.endsWith('crossAPI.js')) return '该文件为压缩后的 JavaScript 桥接代码，函数名高度缩写，语义主要由其宿主集成角色确定。';
  if (filePath.endsWith('action.ts')) return '通过动作类型分派器解释配置化动作链，并以 next/branch 关系控制后续执行。';
  if (filePath.endsWith('canvasPageStore.ts') || filePath.endsWith('pageStore.ts')) return '使用 Zustand 集中维护可变页面运行时状态，并暴露大量细粒度更新方法。';
  if (filePath.endsWith('/packages/index.tsx') || filePath === 'materials/index.tsx') return '在浏览器侧下载源码并动态编译 TSX/JavaScript/Less，以缓存和 React.lazy 方式装载自定义元素。';
  return undefined;
}

function analyze(batchIndex) {
  const batch = batches.find((entry) => entry.batchIndex === batchIndex);
  const extracted = JSON.parse(fs.readFileSync(path.join(tmp, `ua-file-extract-results-${batchIndex}.json`), 'utf8'));
  if (!extracted.scriptCompleted || extracted.filesAnalyzed !== batch.files.length || extracted.filesSkipped.length) {
    throw new Error(`Batch ${batchIndex} extraction incomplete`);
  }
  const nodes = [];
  const edges = [];
  for (const result of extracted.results) {
    const fileNode = {
      id: `file:${result.path}`,
      type: 'file',
      name: path.basename(result.path),
      filePath: result.path,
      summary: summaries[result.path] || `${path.basename(result.path)} 提供项目对应模块的运行时实现。`,
      tags: fileTags(result.path),
      complexity: complexity(result.nonEmptyLines),
    };
    const note = languageNotes(result.path);
    if (note) fileNode.languageNotes = note;
    nodes.push(fileNode);
    for (const targetPath of batch.batchImportData[result.path] || []) {
      edges.push({ source: fileNode.id, target: `file:${targetPath}`, type: 'imports', direction: 'forward', weight: 0.7 });
    }
    const source = fs.readFileSync(path.join(root, result.path), 'utf8');
    for (const fn of result.functions || []) {
      if (!fn.name || fn.name === '-') continue;
      const span = fn.endLine - fn.startLine + 1;
      const exported = explicitExport(source, fn.name);
      if (span < 10 && !exported) continue;
      const id = `function:${result.path}:${fn.name}`;
      nodes.push({ id, type: 'function', name: fn.name, filePath: result.path, lineRange: [fn.startLine, fn.endLine], summary: functionSummary(result.path, fn.name), tags: functionTags(result.path, fn.name), complexity: complexity(span) });
      edges.push({ source: fileNode.id, target: id, type: 'contains', direction: 'forward', weight: 1.0 });
      if (exported) edges.push({ source: fileNode.id, target: id, type: 'exports', direction: 'forward', weight: 0.8 });
    }
    for (const cls of result.classes || []) {
      if (!cls.name || cls.name === '-') continue;
      const span = cls.endLine - cls.startLine + 1;
      if (span < 20 && (cls.methods || []).length < 2 && !explicitExport(source, cls.name)) continue;
      const id = `class:${result.path}:${cls.name}`;
      nodes.push({ id, type: 'class', name: cls.name, filePath: result.path, lineRange: [cls.startLine, cls.endLine], summary: classSummary(result.path, cls.name), tags: classTags(result.path, cls.name), complexity: complexity(span) });
      edges.push({ source: fileNode.id, target: id, type: 'contains', direction: 'forward', weight: 1.0 });
      if (explicitExport(source, cls.name)) edges.push({ source: fileNode.id, target: id, type: 'exports', direction: 'forward', weight: 0.8 });
    }
  }
  const expectedImports = batch.files.reduce((sum, file) => sum + (batch.batchImportData[file.path] || []).length, 0);
  const actualImports = edges.filter((edge) => edge.type === 'imports').length;
  if (expectedImports !== actualImports) throw new Error(`Batch ${batchIndex} imports ${actualImports}/${expectedImports}`);
  if (new Set(nodes.map((node) => node.id)).size !== nodes.length) throw new Error(`Batch ${batchIndex} duplicate node IDs`);

  const parts = Math.ceil(Math.max(nodes.length / 60, edges.length / 120));
  const sortedFiles = batch.files.map((file) => file.path).sort((a, b) => a.localeCompare(b));
  const chunkSize = Math.ceil(sortedFiles.length / parts);
  const importTargets = new Set(Object.values(batch.batchImportData).flat().map((filePath) => `file:${filePath}`));
  const outputs = [];
  for (let index = 0; index < parts; index += 1) {
    const filePaths = new Set(sortedFiles.slice(index * chunkSize, (index + 1) * chunkSize));
    const partNodes = nodes.filter((node) => filePaths.has(node.filePath));
    const ids = new Set(partNodes.map((node) => node.id));
    const partEdges = edges.filter((edge) => ids.has(edge.source));
    for (const edge of partEdges) {
      if (!ids.has(edge.target) && !importTargets.has(edge.target)) throw new Error(`Batch ${batchIndex} part ${index + 1}: invalid ${edge.target}`);
    }
    const filename = parts === 1 ? `batch-${batchIndex}.json` : `batch-${batchIndex}-part-${index + 1}.json`;
    fs.writeFileSync(path.join(intermediate, filename), `${JSON.stringify({ nodes: partNodes, edges: partEdges }, null, 2)}\n`);
    JSON.parse(fs.readFileSync(path.join(intermediate, filename), 'utf8'));
    outputs.push({ filename, nodes: partNodes.length, edges: partEdges.length });
  }
  return { batchIndex, files: batch.files.length, nodes: nodes.length, edges: edges.length, imports: actualImports, outputs };
}

const indices = process.argv.slice(2).map(Number).filter(Number.isInteger);
for (const batchIndex of indices.length ? indices : [13, 14, 15]) {
  process.stdout.write(`${JSON.stringify(analyze(batchIndex))}\n`);
}
