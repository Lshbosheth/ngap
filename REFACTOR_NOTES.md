# NGAP 核心改造记录

## 改造目标

1. 优化并升级引导式流程编排：拆分流程数据模型、编辑器与运行引擎，改善节点、连线、条件分支、校验、回退、预览和版本管理。
2. 升级自定义元素：从上传 TSX、配置 TS、Less 三份文件，改成上传一个默认导出的 React 函数组件；平台从组件元数据生成默认属性、属性面板和事件，并完成注册、画布预览及运行时渲染。

## 本地模拟实现状态（2026-08-05）

- 保留原 `AppBuild → EditLayout → applicationOrchestration → PageCanvas → ProcessCanvasPage` 页面链路；本地模式只注入 Mock 数据。
- 保留原 `elementManagement → previewElementModal → CanvasEditingComponent → NgapRender` 链路；单文件上传按钮嵌入原元素管理顶部操作栏。
- 引导式 Mock URL：`#/build?mock=guided`。
- 函数组件 Mock URL：`#/build?mock=element`。
- 节点配置已支持 `header/content/footer/control`、导航显示开关和导航标题。
- 流程配置已支持导航总开关、标题和 `fixed-top/full-page`。
- `BottomBanner` 增加 `positionMode=container`，新引导式底部由流程壳定位，旧数据仍可保留绝对定位。
- 当前属于可运行的前端模拟，尚未接正式后端保存、上传安全扫描和独立 `page` 运行时同步。
- 引导式 Mock 的创建/编辑基础信息已补齐应用分类、应用标签、归属项目默认值，并提供对应分类树、标签树和项目候选；创建表单的 6 个必填项均有值。
- 本地请求会按 `/appType/queryAppTypeList` 的 `categoryType` 区分分类与标签，并为 `/app/querySeatTenantList`、`/app/saveAppInfo` 返回可操作的模拟响应。
- 已在原页面实际验证：分类与标签弹窗可回显候选，基础信息“确定”无校验提示，“保存草稿”显示成功；归属模块不是必填项，但 Mock 使用原下拉已有值“业务受理”。

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
