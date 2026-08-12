# NGAP 核心改造记录（REFACTOR_NOTES.md）

## 改造目标

1. 优化并升级引导式流程编排：拆分流程数据模型、编辑器与运行引擎，改善节点、连线、条件分支、校验、回退、预览和版本管理。
2. 升级自定义元素：从上传 TSX、配置 TS、Less 三份文件，改成上传一个受约束的 React 组件 ZIP 包；平台读取 `ngap.json`、分析入口和模块图，生成默认属性、属性面板和事件，并完成服务端构建、注册、画布预览及运行时渲染。

## 本地模拟实现状态（2026-08-05）

- 保留原 `AppBuild → EditLayout → applicationOrchestration → PageCanvas → ProcessCanvasPage` 页面链路；本地模式只注入 Mock 数据。
- 保留原 `elementManagement → previewElementModal → CanvasEditingComponent → NgapRender` 链路；当前模拟的单 TSX 上传按钮嵌入原元素管理顶部操作栏，正式实现需要替换为 ZIP 包上传向导。
- 引导式 Mock URL：`#/build?mock=guided`。
- 函数组件 Mock URL：`#/build?mock=element`。
- 节点配置已支持 `header/content/footer/control`、导航显示开关和导航标题。
- 流程配置已支持导航总开关、标题和 `fixed-top/full-page`。
- `BottomBanner` 增加 `positionMode=container`，新引导式底部由流程壳定位，旧数据仍可保留绝对定位。
- 当前属于可运行的前端模拟，尚未接正式后端保存、上传安全扫描和独立 `page` 运行时同步。
- 引导式 Mock 的创建/编辑基础信息已补齐应用分类、应用标签、归属项目默认值，并提供对应分类树、标签树和项目候选；创建表单的 6 个必填项均有值。
- 本地请求会按 `/appType/queryAppTypeList` 的 `categoryType` 区分分类与标签，并为 `/app/querySeatTenantList`、`/app/saveAppInfo` 返回可操作的模拟响应。
- 已在原页面实际验证：分类与标签弹窗可回显候选，基础信息“确定”无校验提示，“保存草稿”显示成功；归属模块不是必填项，但 Mock 使用原下拉已有值“业务受理”。

## 自定义元素 v2 设计状态（2026-08-10）

- 已新增自定义元素完整设计·理想方案（`CUSTOM_ELEMENT_REDESIGN(完整设计-理想方案).md`），完成 React 组件 ZIP 包的详细重写设计。
- 已确定使用“标准 ZIP 目录 + 根目录 `ngap.json` + `src/index.tsx` 默认导出组件”的协议方向；可拆分本地 TSX/TS 模块、样式和静态资源。
- 已确定以标准 manifest 为核心，再转换成现有 `attrs/config/events/methods` Schema 以降低首期编辑器改造面。
- 已确定 v2 运行时使用扁平业务 Props + 稳定 `context`，同时保留旧 `config/id/type/elements/loopVariable` 兼容 Props。
- 已确定页面变量、接口、事件、消息、上传、跳转、用户和 CrossAPI 等能力必须由项目通过版本化 SDK 显式暴露，并按 `ngap.json` 权限裁剪；组件不能直接依赖项目 Store、内部 request 或原始 CrossAPI。
- 已确定主 `src` 与独立 `page/materials` 必须共用 analyzer、manifest、registry 和 Props adapter。
- 浏览器只做 ZIP 安全预检；本地开发可使用 Vite/esbuild-wasm。正式预览和生产必须服务端构建、扫描并产出不可变 ESM/CSS/assets、runtime manifest、hash 和签名，不能仅用 Babel 转入口文件。
- 首期仍需确认后端是否支持 `elementProtocolVersion`、manifest/bundle URL 以及运行版本锁定。

## 需求人员入门文档（2026-08-11）

- 已新增 `NGAP_REQUIREMENTS_ONBOARDING.md`，面向刚进入项目的需求/产品人员介绍当前 NGAP 平台能力和业务闭环。
- 文档重点说明元素、业务组件、模板、应用、接口、变量、事件、流程、审核发布和运行治理之间的关系。
- 文档详细介绍两个重点优化项目，并明确当前顺序为：先完成步骤引导式流程改造及双运行时回归，再启动自定义元素 ZIP + SDK 正式改造。
- 文档包含跨项目组协作清单、需求产出、验收门槛、常见误区和建议学习路径。

## 引导式节点数据域设计（2026-08-11）

- 已通过 `/understand` 完成全仓知识图谱：1208 个文件、2112 个节点、3219 条边、8 个架构层、12 步中文导览；正式图谱位于 `.understand-anything/knowledge-graph.json`。
- 已确认当前 `canvasPageStore` 与 `materials/pageStore` 都使用页面级扁平 `variables/variableData/formData/apiOutData`。
- 编辑器侧虽存在 `processData.nodeData[nodeId]`，但元素、表单和变量仍会并入页面级 Store，没有形成运行时数据边界。
- `ProcessPage.tsx` 当前 `isPrivate + zjId` 只是变量名后缀方案；独立 `page/src/page/index.tsx` 甚至仍直接按变量名去重，双运行时行为不完全一致。
- 目标方案确定为 `runtime.nodes[nodeId]` 节点私有域 + `runtime.shared` 显式流程共享域；跨节点通过 input/output binding 传递。
- 节点执行类型确定为 `manual/automatic/service`，与 `presentation.region` 正交；服务节点默认 `control` 且不渲染。
- 用户只维护显示名称和业务输出名，平台用不可变 `nodeId` 隔离；可读 alias 仅用于跨节点展示，不能作为主键。
- 兼容期以 scoped runtime 为主数据，旧 `context.variable/context.api` 只由 legacy projection 生成。
- 详细数据结构、平台 Runtime API、编辑器选择器、迁移阶段、测试矩阵和验收标准已追加到 `GUIDED_PROCESS_REDESIGN.md` 第 15 章；需求侧说明已追加到 `NGAP_REQUIREMENTS_ONBOARDING.md` 第 8.11 节。

## 引导式环节输出和待完善事项（2026-08-11）

- 已确认当前人工分支具备“读取多个内部原子值 + conditionList + AND/OR + 数组逐项比较”能力，但不存在正式、声明式、可版本化的环节输出契约。
- 已确认新模型需要区分 `input/draft/private/apiData/output/status/validation`，内部字段默认私有，分支和下游主要读取正式 `node.output`。
- 人工环节默认按“填写草稿 → 校验就绪 → 用户确认 → 生成输出 → 判断分支”推进；任一字段变化不再默认代表环节完成。
- 现有低代码业务组件通过输出映射形成标准输出；未来 React ZIP 组件通过平台 SDK 提交相同输出。
- 多选组合需要补充集合操作符，包括 `containsAny/containsAll/equalsSet/notContains/size...`。
- 组件可以输出业务 `decisionCode`，但不能直接输出 `nextNodeId`；画布连线仍然是流程推进关系。
- 已冻结单活动路径范围：支持 `A-B-D / A-C-D` 互斥分支后进入同一 D，不实现 B、C 同时执行并等待汇聚。
- 上述完整方案已追加到引导式流程展示编排升级详细设计（`GUIDED_PROCESS_REDESIGN.md`）第 16 章。
- 已新增引导式流程待完善事项（`GUIDED_PROCESS_PENDING_ITEMS(引导式待完善事项).md`），按 P0/P1/P2 记录完成边界、状态机、输出协议、条件语言、分支唯一命中、图校验、回滚、刷新恢复、失败策略、双运行时和版本治理等事项。
- 当前用户要求先讨论和评审待完善事项，尚未要求开始本轮引导式主干编码。

## 第一批需要采集的接口响应

### 引导式流程（必需）

#### 1. 查询流程结构

`POST /app/queryAppAndNodeInfo`

需要保存：请求参数和完整脱敏响应。重点字段包括应用信息、`componentList`、`nodeId`、`componentId`、`parentId`、`branchIndex`、`canvasPoint`、`refreshPageEvent`。

#### 2. 批量查询流程节点对应的业务组件

`POST /appComponent/queryAppComponentInfoList`

需要保存：请求参数和完整脱敏响应。它用于编辑器一次性获得流程涉及的业务组件定义。

#### 3. 查询单个业务组件

`POST /appComponent/queryAppComponentInfo`

需要保存：至少一个完整组件响应；最好覆盖一个普通节点和一个带条件分支的节点。它用于运行/预览时按 `componentId` 加载组件。

### 自定义元素（必需）

#### 4. 查询自定义元素清单

`POST /element/queryElementList`

需要保存：请求参数和一份包含至少一个已发布自定义元素（`elementStatus = 2`）的完整脱敏响应。重点字段包括 `elementId`、`elementName`、`elementTypeId`、`elementJsDemo`、`elementConfigDemo`、`elementCssDemo`。

#### 5. 获取自定义元素源码

优先采集当前批量接口：

`POST /csf/call/getElementFileInfo`

需要保存：请求参数和完整响应，响应应包含同一个自定义元素的 `tsxCode`、`jsCode`、`lessCode` 对应内容。

若现场没有调用批量接口，则采集旧接口：

`POST /csf/call/getFileFromOss`

需要分别保存 TSX、配置 TS、Less 三次请求与响应。

## 第二批按场景补充

### 流程包含自动接口分支或组件接口时

- `POST /csf/appInterface/abilityArrangeList`
- `POST /csf/appInterface/getInterfaceParamsAndCheck`
- `POST /csf/appInterface/abilityArrangeDetails`
- 自动分支实际调用的业务接口响应

### 需要复现流程保存、发布和历史版本时

- `POST /app/saveAppInfo`
- `POST /app/queryAppInfoHistory`
- `POST /app/delAppInfoHistory`

### 需要复现自定义元素上传和保存时

- `POST /csf/call/importOssByFileList`
- `POST /csf/call/importOssByFile`
- `POST /element/saveElementInfo`
- `POST /element/queryElementTypeList`

## 采集要求

- 从浏览器开发者工具 Network 的 Fetch/XHR 中复制请求载荷与 Response。
- 保留 JSON 层级、字段名、节点 ID 之间的引用关系，不要只截屏表格。
- Token、Cookie、手机号、姓名、员工号、内网域名等可脱敏，但同一个 ID 在不同响应中应保持一致。
- 若响应过大，可以分别保存为 JSON 文件，不必再次生成 Repomix。

## 已收到的数据（new 67.txt）

已收到并验证：

- `/app/queryAppAndNodeInfo`：流程 `2607011011050101555`，共 8 个节点。
- `/appComponent/queryAppComponentInfo`：组件 `2608031511180114031`，与上述流程匹配；包含人工分支 `MT`、两个选项及关联的 Radio 元素。
- `/element/queryElementList`：共 36 个自定义元素，其中 34 个已发布。
- `/csf/call/getElementFileInfo`：自定义元素 `2608051421540100045` 的 TSX、Schema TS 和 Less 内容完整。

需要补采或更正：

- 当前 `/appComponent/queryAppComponentInfoList` 请求使用 `260703...` 组件 ID，而流程结构使用 `260803...` 组件 ID，两组数据匹配数为 0。需要按 `/app/queryAppAndNodeInfo` 返回的 8 个 `componentId` 重新调用批量查询。
- 若要研究自动分支 `AT`，还需额外提供一个 `branchName.branchType = AT` 的组件响应及它调用的接口样例；当前匹配组件只覆盖人工分支 `MT`。
