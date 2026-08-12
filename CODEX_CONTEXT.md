# NGAP 项目上下文交接记忆（CODEX_CONTEXT.md）

> 用途：在 Codex 新建对话后，先让 Codex 完整阅读本文件，再继续本项目工作。
>
> 建议新对话第一句话：`请先完整阅读项目里的 CODEX_CONTEXT.md、GUIDED_PROCESS_REDESIGN.md 和 GUIDED_PROCESS_PENDING_ITEMS(引导式待完善事项).md，然后接着讨论引导式改造，先不要生成代码。`

## 1. 项目位置

工作目录：

```text
C:\Users\EDY\Desktop\ngap
```

原始 Repomix 文件：

```text
D:\download\repomix-output\repomix-output.xml
```

已从 Repomix 还原 1,206 个文本文件到项目目录。Repomix 不包含 PNG、GIF、字体、音视频等二进制资源。

接口采集文件：

```text
D:\download\new 67.txt
```

界面参考截图（临时目录文件可能在系统清理后失效）：

```text
C:\Users\EDY\AppData\Local\Temp\codex-clipboard-3aa4392c-c0aa-4746-b9ef-c6e37b8d763d.png
```

## 2. 用户的两个核心目标

### 目标 A：升级引导式流程编排

希望把当前引导式流程升级为可配置的四区页面：

```text
顶部核心信息区
智能导航区（可全局关闭）
普通环节内容区
底部操作区
```

要求：

- 每个流程节点可配置展示区域；
- 普通正文环节默认进入智能导航，不提供节点级显示开关；
- 有些环节没有页面组件，只参与流程控制，不进入导航；
- 一个流程最多一个顶部节点、一个底部节点；
- 整个流程可以不显示智能导航；
- 顶部核心信息和导航可以共同固定，也可以随整页滚动；
- 不改变现有人工、自动、变量分支的核心业务能力。

已确定节点模型：

```ts
interface ProcessNodePresentation {
    region: 'header' | 'content' | 'footer' | 'control';
    navigatorTitle?: string;
}

interface ProcessNodeExecution {
    interactionMode: 'manual' | 'automatic';
}
```

已确定流程全局配置：

```ts
interface GuidedProcessConfig {
    navigator: {
        enabled: boolean;
        title: string;
    };
    scrollMode: 'fixed-top' | 'full-page';
}
```

关键业务约束：

- `header`：渲染在顶部，不进入导航，最多一个；
- `content`：未设置特殊用途时的默认正文区域，自动进入导航，不要求用户逐个配置；
- `footer`：渲染在底部，不进入导航，最多一个；
- `control`：参与流程判断和流转，但不渲染 UI、不进入导航；
- 展示配置属于当前流程中的节点实例，不属于业务组件模板。
- `header/footer/control` 是需要显式设置的特殊用途；未设置时按 `content` 处理；
- “人工/自动”是 `content` 环节的交互方式，同时作为智能导航文案：自动环节在接口或组件逻辑完成后静默判断分支并连续加载，人工环节进入后等待用户点选、选择、输入或确认；
- 自动环节即使有多条条件分支也不暂停，取得数据后直接使用已有分支规则选择唯一出线；只有进入人工环节、结束节点或发生执行异常时才正常停止连续加载；
- 自动环节不需要为了推进流程额外输出一个“继续”结果；人工环节的单一选择变化或多字段确认信号才是恢复推进的触发点；
- 一个引导式流程最多一个 `header`、一个 `footer`，可以有多个 `content` 和 `control`。

新增的数据域结论：

- `header/content/footer/control` 是展示区域；普通环节默认属于 `content`；人工/自动是正文环节的交互与推进方式，并同时显示在智能导航中；
- `control` 节点不渲染，但仍可调用服务、转换数据、执行条件判断并推进分支；
- 每个流程节点实例以不可变 `nodeId` 拥有独立的变量、表单、API、输出和状态数据域；
- 相同业务组件在同一流程使用两次时，也必须按两个 `nodeId` 隔离，不能使用 `componentId` 做数据主键；
- 本地变量默认不注册到全局，跨节点只通过声明的输入、输出和 binding 传递；
- 用户不负责流程级唯一命名，平台维护技术 ID；显示名称可以重复，可读别名仅在跨节点引用时按需生成；
- 流程共享变量必须显式声明；旧 `context.variable/context.api` 由兼容投影生成；
- 分支回滚按节点域整体释放数据和异步任务，不再按全局变量名清理；
- 主 `src` 和独立 `page/materials` 必须使用同一 GuidedRuntime、binding 和表达式语义。

新增的环节输出和流程推进结论：

- 当前人工分支能读取多个内部 `Select/Radio` 原子值，支持条件列表和 AND/OR，也会处理数组值，但这只是“内部原子值判断”，不是正式组件输出；
- 新模型必须区分节点 `input/draft/private/apiData/output/status/validation`；
- 自动 content 在接口或组件自动逻辑完成后立即评估分支并继续，后续仍为自动节点时连续静默加载，不需要用户动作或 `isNext`；
- 人工 content 进入后暂停：单一决策元素可在点选变化后继续，多输入或复杂交互由组件确认/完成信号恢复推进；
- “组件输出”是应用组件对外提供的环节结果，默认属于当前 `nodeId`，不是全局参数；主要用于分支判断，也可被智能导航和下游节点按需引用；
- 分支判断字段与导航展示字段可以不同。简单人工选择可暂用 `value` 判断分支、`label` 展示导航；复杂组件可以分别提供判断字段和一个或多个诊断展示字段；
- 自动环节可由接口单独返回 `success/failure` 业务诊断状态供导航显示红色或绿色；完整列表仍可留在环节正文，除非分支或下游确实需要，否则不必全部发布为组件输出；
- 复杂选择和计算当前倾向集中在应用组件内部：组件声明稳定的分支结果变量，通过 `onChange → 脚本/表达式 → 变量赋值` 更新，流程只根据该业务代码选择连线；该方向暂定，下一轮继续讨论完成时机；
- 已核对当前代码：仅声明变量或设置默认表达式不会自动响应表单变化，必须显式配置事件赋值；变量变化后现有 `VA` 监听可以重算分支；
- 当前变量赋值仍写入页面级 `variableData`，新模型需要按 `nodeId` 隔离，并支持“人工交互 + 组件变量分支”，不再把交互方式和 `MT/VA` 数据来源绑定在一起；
- P0-05 多出线唯一命中规则已冻结：正常推进只命中一条出线，同优先级冲突停止并诊断，无命中时走唯一默认分支或显式阻塞；自动多分支仍静默连续执行；
- P0-06 拓扑规则已冻结：单活动路径 DAG，只允许一个开始节点和一个结束节点；所有有效分支最终必须汇合并连接到同一个结束节点；
- P0-07 分支回滚范围已冻结：旧路径节点域、输出、接口数据、DOM、订阅和异步任务整体失效，后端副作用按具体接口语义处理；
- 多选条件需要明确支持 `containsAny/containsAll/equalsSet/notContains/size...` 等集合语义；
- 现有低代码业务组件通过输出映射形成 `node.output`，未来完整 React ZIP 组件通过平台 SDK 提交同一种输出；
- 组件可以输出业务 `decisionCode`，但不能输出 `nextNodeId`，下一节点仍由画布连线和分支规则选择；
- 设计图可以分支和重新汇合，但一次运行只有一条活动路径；支持 `A-B-D / A-C-D`，本期不支持 B、C 同时执行后等待汇聚；
- 前端 GuidedRuntime 是流程推进主引擎，后端负责业务 API、可信业务规则、权限、定义持久化和可选运行快照；
- 用户修改前序环节时，旧输出、旧分支数据、DOM 和异步结果必须一起失效，不能只截断页面元素。

详细数据域设计位于《引导式流程展示编排升级设计（`GUIDED_PROCESS_REDESIGN.md`）》第 15 章；环节正式输出和单活动路径推进位于第 16 章。尚未冻结的问题单独记录在《引导式流程待完善事项（`GUIDED_PROCESS_PENDING_ITEMS(引导式待完善事项).md`）》中。

### 目标 B：升级自定义元素为“上传一个组件 ZIP 包”

当前系统已经支持：

- 获取 TSX、Schema TS、Less 三个源码文件；
- 浏览器使用 `@babel/standalone` 编译；
- 生成 Blob URL 并动态 `import()`；
- 读取默认导出的 React 组件；
- 注册到组件表；
- 使用 `NgapRender` 在画布和预览中渲染。

目标是把三文件、强平台规范的使用方式，改成用户上传一个受约束的 React 组件 ZIP 包。ZIP 内允许拆分 TSX/TS 模块、Less/CSS 和静态资源，由 `ngap.json` 声明入口、元数据、SDK 版本和权限；平台自动生成或读取：

- 默认属性；
- 属性面板配置；
- 事件定义；
- 组件名称和描述；
- 画布预览和运行时注册。

组件使用页面变量、接口、事件、上传、消息、跳转、CrossAPI 等项目能力时，必须通过项目显式注入的版本化 SDK `context`；不能 import 项目 Store、内部 `request`、Token、环境地址或原始 CrossAPI 对象。

正式实施前需要设计安全边界。当前 Blob 动态执行相当于运行任意 JavaScript，生产环境至少需要可信上传者和审核；更严格方案是沙箱 iframe 或服务端构建、扫描和签名。

## 3. 已完成的工作

- 已解析 `package.json`；
- 已从 Repomix 还原文本源码；
- 已安装依赖；
- TypeScript `npx tsc --noEmit` 已通过；
- Vite 开发服务器曾成功启动，入口和 `src/main.tsx` 返回 HTTP 200；
- 完整构建会被 Repomix 缁失的二进制资源阻断；
- 已生成缺失二进制资源清单；
- 已分析引导式流程编辑、保存、预览和运行链路；
- 已分析自定义元素上传、源码获取、动态编译、注册和渲染链路；
- 已编写详细引导式流程重构设计文档。
- 已把环节正式输出、草稿/完成边界、多字段和多选组合、低代码/React 组件统一输出协议、单活动路径与分支汇合追加到引导式详细设计第 16 章。
- 已新增独立的引导式流程待完善事项文档，按 P0/P1/P2 记录需要后续评审的产品和技术决策；当前用户要求先讨论、看清待完善点，再决定实现，不要直接生成代码。
- 已编写详细自定义元素 v2 React 组件 ZIP 包重写设计文档，包含 ZIP/ngap.json 协议、AST 推导、平台 SDK 与权限、manifest、服务端构建、注册、安全、双运行时兼容、迁移、测试和分阶段实施方案。
- 已编写需求人员入门文档 `NGAP_REQUIREMENTS_ONBOARDING.md`，介绍当前 NGAP 平台能力、核心业务对象、多项目组协作方式和两个重点优化项目；明确先完成引导式流程改造，再启动自定义元素正式改造。
- 已增加保留原页面结构的本地模拟模式，不再采用独立“实验台”页面：
  - `#/build?mock=guided` 自动打开原应用编排画布；
  - `#/build?mock=element` 当前仍自动打开原元素管理并弹出现有“单 TSX 函数组件”模拟上传；它只是旧的链路验证样例，正式目标已改为 ZIP 包上传；
  - 缺失二进制图片由 Vite 开发插件提供 SVG 占位，不改变原组件结构。
- 原流程节点菜单已增加“展示设置”，原顶部工具栏已增加“页面布局”；预览仍复用 `ProcessPage`。
- 原元素管理顶部操作栏当前已增加“上传函数组件”模拟入口，预览仍复用 `previewElementModal` 和 `NgapRender`；正式改造应替换为组件 ZIP 包向导。
- 引导式 Mock 基础信息已补齐应用分类、应用标签、归属项目及对应候选数据；基础信息“确定”和“保存草稿”已通过实际页面验证。

## 4. 必读文档

### NGAP 平台与重点优化需求入门指南（NGAP_REQUIREMENTS_ONBOARDING.md）

```text
C:\Users\EDY\Desktop\ngap\NGAP_REQUIREMENTS_ONBOARDING.md
```

包含：

- 当前 NGAP 的产品定位和完整能力地图；
- 元素、业务组件、模板、应用、变量、接口、事件和流程等核心对象；
- 应用从建设、审核、发布、上架到运行治理的闭环；
- 多项目组协作和需求文档检查清单；
- 引导式流程四区改造的需求目标、范围、规则和完成门槛；
- 自定义元素 ZIP + SDK 改造的需求目标和启动条件；
- 明确实施顺序：引导式稳定后再改造自定义元素。

### 引导式流程展示编排升级详细设计（GUIDED_PROCESS_REDESIGN.md）

```text
C:\Users\EDY\Desktop\ngap\GUIDED_PROCESS_REDESIGN.md
```

包含：

- 现状分析；
- 数据模型；
- 编辑器交互；
- 四区运行时；
- 智能导航升级；
- BottomBanner 改造；
- 保存接口；
- 旧数据兼容；
- 具体文件修改清单；
- 测试方案；
- 分阶段实施计划。

新增内容：

- 节点域、输入输出和数据绑定；
- 融合式 React 环节的职责边界；
- `draft → ready → completed → output` 完成过程；
- 多字段、多选组合和集合条件；
- 单活动路径、互斥分支和重新进入同一后续节点；
- 前端 GuidedRuntime 与后端业务 API 的职责划分。

### 引导式流程待完善事项（GUIDED_PROCESS_PENDING_ITEMS）

```text
C:\Users\EDY\Desktop\ngap\GUIDED_PROCESS_PENDING_ITEMS(引导式待完善事项).md
```

包含：

- 已经确认的方案前提；
- 开发主干前必须确认的 P0 事项；
- 主干开发期间确认的 P1 事项；
- 主链路稳定后完善的 P2 事项；
- 当前代码风险依据；
- 推荐评审顺序和开始编码前冻结门槛。

### 自定义元素完整设计·理想方案（CUSTOM_ELEMENT_REDESIGN）

```text
C:\Users\EDY\Desktop\ngap\CUSTOM_ELEMENT_REDESIGN(完整设计-理想方案).md
```

包含：

- 三文件旧链路、现有单 TSX 模拟与已有简易 JSZip 解包代码的问题分析；
- 标准 ZIP 目录、`ngap.json`、多模块、样式和资源协议；
- Props、默认值、事件、方法、名称和描述的 AST 推导规则；
- 扁平 Props、版本化平台 SDK、权限、错误模型和现有项目能力映射；
- 标准 manifest 及到现有 Schema 的兼容转换；
- 依赖白名单、浏览器预检/开发构建和生产服务端异步构建方案；
- registry、NgapRender Props adapter、样式和资源生命周期；
- 元素管理、预览、保存、审核、发布和版本锁定；
- `src` 与 `page/materials` 双运行时统一；
- 安全边界、旧元素迁移、测试矩阵和分阶段实施计划。

### NGAP 核心改造记录（REFACTOR_NOTES.md）

```text
C:\Users\EDY\Desktop\ngap\REFACTOR_NOTES.md
```

### 缺失二进制资源清单（missing-binary-assets.txt）

```text
C:\Users\EDY\Desktop\ngap\missing-binary-assets.txt
```

缺失约 315 个二进制资源。当前两个核心改造不要求先补齐全部资源，可以用 CSS 图标或占位资源开发。

## 5. 引导式流程关键源码

### 编排入口

```text
src/pages/applicationOrchestration/pageCanvas/processCanvasPage/index.tsx
```

职责：

- 加载流程应用和节点；
- 批量加载业务组件；
- 编辑/预览模式切换；
- 调用流程画布 `setData/getData`；
- 保存前把数据写入 Store。

### 流程画布

```text
src/pages/applicationOrchestration/pageCanvas/processCanvasPage/components/ProcessCanvas/index.tsx
```

职责：

- 节点与连线；
- 拖拽；
- 分支出口；
- `getData()` 序列化；
- `setData()` 回显；
- undo/redo 快照；
- `RenderNode` 节点展示。

### 类型

```text
src/pages/applicationOrchestration/pageCanvas/processCanvasPage/processCanvasPageType.ts
```

### 运行和预览

```text
src/pages/applicationOrchestration/pageCanvas/processCanvasPage/components/ProcessPage/ProcessPage.tsx
```

当前问题：

- 使用扁平 `allRenderElements` 保存所有节点元素；
- 运行时节点边界只靠 `belongNodeId`；
- 导航条先于全部元素固定渲染；
- 分支回滚按元素数组 slice/filter；
- 导航定位依赖 DOM 元素下标。

建议：改为 `RenderedProcessNode[]`，每个运行节点保留 `nodeId`、展示配置、状态和 `elements`。

### 智能导航

```text
src/pages/applicationOrchestration/pageCanvas/processCanvasPage/components/ProcessPage/TemplateNav.tsx
```

当前明确写死：

```tsx
<h1>智能诊断</h1>
```

总数和异常数也写死为 0。应改为读取流程配置和实际导航节点。

### 智能导航及运行时样式

```text
src/pages/applicationOrchestration/pageCanvas/processCanvasPage/components/ProcessPage/index.module.less
```

当前导航使用：

```less
position: sticky;
top: 0;
```

### 保存

```text
src/pages/applicationOrchestration/pageCanvas/components/CanvasTop.tsx
```

当前引导式保存为：

```ts
const result = {
    componentList: processData.componentList,
};
appData.sceneData = JSON.stringify(result);
```

目标：增加 `processConfig`，并在每个 `componentList` 节点中保存 `presentation`。

### Store

主要使用：

```text
src/stores/canvasPageStore.ts
```

另有：

```text
src/stores/processCanvasStore.ts
```

实施前应确认后者是否仍有实际入口使用，避免维护两套重复状态。

### BottomBanner

```text
src/packages/Layout/BottomBanner/BottomBanner.tsx
src/packages/Layout/BottomBanner/index.module.less
src/packages/Layout/BottomBanner/Schema.ts
```

当前 `.bottomBannerAtom` 使用绝对定位：

```less
position: absolute;
bottom: 0;
```

这会在引导式流程中覆盖内容或与其他节点通栏重叠。目标是让物料只负责内容布局，固定位置由新的 `ProcessFooter` 页面区域负责，同时兼容旧组装式页面。

### 独立运行页

```text
page/src/page/index.tsx
page/src/page/TemplateNav.tsx
page/src/page/index.module.less
```

注意：这里有一套和主项目高度重复的引导式运行逻辑。生产构建会先构建 `page`，所以不能只修改 `src`。长期应抽取共享运行时。

## 6. 自定义元素关键源码

### 动态编译和注册

```text
src/packages/index.tsx
```

关键函数：

- `onPreviewTsx()`；
- `onPreviewJs()`；
- `onPreviewLess()`；
- `fetchAllFileStream()`；
- `elementInfoFun()`；
- `queryElementFun()`；
- `getComponent()`；
- `updateComponent()`。

### 统一元素渲染

```text
src/packages/NgapRender/NgapRender.tsx
```

自定义元素和内置元素最终都通过这里的 `Material` 渲染。组件接收的主要参数包括：

```text
id
type
config
elements
loopVariable
事件回调
ref
```

### 自定义元素管理和预览

```text
src/pages/elementManagement/index.tsx
src/pages/elementManagement/elementDetail.tsx
src/pages/elementManagement/previewElementModal.tsx
src/pages/elementManagement/AddElementModal.tsx
src/pages/elementManagement/onlineEditing.tsx
```

### 自定义元素菜单

```text
src/config/components.tsx
```

## 7. 已取得的接口数据

数据在：

```text
D:\download\new 67.txt
```

### 已验证有效

#### `/app/queryAppAndNodeInfo`

- 流程 ID：`2607011011050101555`；
- 场景：`process`；
- 共 8 个流程节点；
- 包含 `componentId`、`nodeId`、`parentId`、`branchIndex`、`canvasPoint`。

#### `/appComponent/queryAppComponentInfo`

- 组件 ID：`2608031511180114031`；
- 与上述流程匹配；
- 组件名：客户是否认可挽留；
- 包含 `MT` 人工分支；
- Radio 值 1 和 2 分别命中两条分支。

#### `/element/queryElementList`

- 共 36 个自定义元素；
- 34 个状态为已发布。

#### `/csf/call/getElementFileInfo`

- 自定义元素 ID：`2608051421540100045`；
- 包含完整 TSX、Schema TS、Less；
- TSX 是默认导出的 React 函数组件。

### 数据缺口

`/appComponent/queryAppComponentInfoList` 使用了 `260703...` 的 8 个组件 ID，而流程结构使用 `260803...`，匹配数为 0。

需要用以下 ID 重新请求批量组件：

```text
2608031511180114027
2608031511180114028
2608031511180114029
2608031511180114030
2608031511180114031
2608031511180114032
2608031511180114033
2608031511180114034
```

若要完整研究自动分支，还需一个 `branchType = AT` 的组件实例及实际接口响应；当前匹配样例只覆盖 `MT`。

## 8. 已做的本地依赖调整

为了在当前云桌面复现：

- `.npmrc` 从不可达内网 registry 改为 `https://registry.npmjs.org/`；
- 移除了未被源码引用且公网不存在的 `common-crossAPI` 依赖；
- 补充 `lodash-es`；
- 补充 `@types/lodash`；
- 补充 `@babel/helper-create-class-features-plugin`；
- 补充 `framework-utils`、`@daybrush/utils`；
- 生成了新的 `package-lock.json`。

这些修改面向当前复现副本，不代表原生产项目一定应该采用完全相同的依赖处理方式。

## 9. 当前验证状态

- `npm install`：已完成；
- `npx tsc --noEmit --pretty false`：通过；
- `npm run start`：Vite 可启动；
- `http://127.0.0.1:8892/ngap/`：曾返回 HTTP 200；
- 完整 `npm run build`：被缺失二进制资源阻断；
- 当前没有要求为了两个核心改造先补齐所有二进制资源。
- 2026-08-05 本地模拟改造后：`npx tsc --noEmit --pretty false` 通过；Vite 入口以及应用编排、元素管理、函数组件上传模块均返回 HTTP 200。

### 本地模拟启动

```powershell
pwsh -NoProfile -Command "npm run start"
```

原布局引导式模拟：

```text
http://127.0.0.1:8892/ngap/#/build?mock=guided
```

原布局单 TSX 函数组件上传模拟（旧链路验证，不是正式 ZIP 方案）：

```text
http://127.0.0.1:8892/ngap/#/build?mock=element
```

引导式操作：原流程节点右上角更多菜单选择“展示设置”；原顶部工具栏选择“页面布局”；点击原预览按钮查看四区布局。

当前模拟操作：在原元素管理顶部点击“上传函数组件”，上传或编辑单个 TSX/JSX 文件，再点击“编译并预览”。该模拟源码不能带 `import`，直接使用全局 `React`、`antd`、`antdIcons`；正式 ZIP 包方案不沿用这一限制，也不把该模拟编译器用于生产。

## 10. 下一步建议

当前用户要求先讨论方案，不要直接生成代码。下一步应先打开《引导式流程待完善事项（`GUIDED_PROCESS_PENDING_ITEMS(引导式待完善事项).md`）》逐项沟通，优先确认 P0-01 至 P0-07，再决定第一期实现范围。

如果用户后续明确要求开始实现引导式改造：

1. 先完整阅读 `GUIDED_PROCESS_REDESIGN.md`；
2. 再完整阅读 `GUIDED_PROCESS_PENDING_ITEMS(引导式待完善事项).md`，确认 P0 结论已经冻结；
3. 从节点域、组件输出、人工/自动推进方式、条件模型和保存闭环开始；
4. 验证后端是否透传 `sceneData`、节点输出定义、绑定和连线新字段；
5. 抽取主 `src` 与独立 `page/materials` 共享的 GuidedRuntime；
6. 再把运行时从 `allRenderElements` 重构为节点级 `renderedNodes` 和节点执行状态；
7. 然后实现四区页面壳、导航升级、分支回滚和异常处理；
8. 最后处理 BottomBanner、旧数据迁移和双运行时完整回归。

如果用户要求开始实现组件 ZIP 包上传：

1. 先完整阅读 `CUSTOM_ELEMENT_REDESIGN(完整设计-理想方案).md`；
2. 先冻结 ZIP 目录、`ngap.json`、runtime manifest、SDK 版本与权限字典；
3. 优先实施共享 package reader、contract、analyzer、manifest、manifest-to-schema 和 SDK types/mock；
4. 并行准备服务端异步构建/扫描接口；正式 ZIP 多模块预览不能只依赖浏览器 Babel；
5. 再实现 Preview Registry、host adapter、依赖白名单和 Props adapter；
6. 然后接入元素管理 ZIP 向导、ConfigPanel、拖拽和主 `NgapRender`；
7. 同步改造 `materials/page` 独立运行时并跑 SDK contract tests；
8. 生产开放前完成不可变产物、runtime manifest、版本锁定、hash、签名和回滚策略。

## 11. 新对话注意事项

- 新对话先完整阅读 `CODEX_CONTEXT.md`，它是本项目的长期记忆入口；
- 讨论或实现引导式时，再完整阅读 `GUIDED_PROCESS_REDESIGN.md` 和 `GUIDED_PROCESS_PENDING_ITEMS(引导式待完善事项).md`；
- 当前讨论进度是：已经确认组件输出、自动环节静默连续执行、人工环节等待交互、智能导航诊断结果、节点变量域、单活动路径和前端引擎方向；P0-05、P0-06、P0-07 已冻结，P0-06 明确全流程只有一个结束节点且所有路径最终连到该节点；组件内计算分支结果变量的方向暂定，下一轮继续讨论其赋值/完成时机和 P0-04 范围，尚未授权开始主干编码；
- 不要重新要求用户提供整个项目；文本源码已还原。
- 不要要求用户传十几 MB 的全部图片；核心改造可先使用占位资源。
- 不要把顶部/底部属性加到业务组件模板；必须加到流程节点实例。普通环节无需配置 `content`，只有 `header/footer/control` 作为特殊用途显式设置。
- 不要继续以第一个节点固定作为 header 或最后节点作为 footer；应显式配置。
- 不要继续用扁平元素下标实现导航定位；使用 nodeId 和节点容器 ref。
- 不要只修改 `src`，还要考虑 `page` 子项目的独立运行时。
- 修改 BottomBanner 时必须回归普通组装式页面。
- 用户目前首先要求的是设计和上下文记录，尚未明确授权开始大规模实现。
