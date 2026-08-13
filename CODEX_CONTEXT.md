# NGAP 项目上下文交接记忆（CODEX_CONTEXT.md）

> 用途：在 Codex 新建对话后，先让 Codex 完整阅读本文件，再继续本项目工作。
>
> 建议新对话第一句话：`请先完整阅读项目里的 CODEX_CONTEXT.md、GUIDED_PROCESS_REDESIGN(引导式流程展示编排升级设计).md 和 GUIDED_PROCESS_PENDING_ITEMS(引导式待完善事项).md，然后接着讨论引导式改造，先不要生成代码。`

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
- header/footer 生命周期已冻结：进入页面或整体重启时先定位二者；header 作为 content 前置环节，接口和初始化逻辑完成并写入所需显式全局变量后，才加载 content/control 活动路径；后续 content 可读取这些全局数据；
- footer 是页面初始化时固定挂载的操作区，一般由流程进行状态控制其内部按钮或其他元素显隐；它没有“完成”动作，按钮只执行各自业务操作，不负责推进流程；活动路径到达 footer 时自动进入唯一结束节点，footer 不重复挂载；

新增的数据域结论：

- `header/content/footer/control` 是展示区域；普通环节默认属于 `content`；人工/自动是正文环节的交互与推进方式，并同时显示在智能导航中；
- `control` 节点不渲染，但仍可调用服务、转换数据、执行条件判断并推进分支；
- 每个流程节点实例以不可变 `nodeId` 拥有独立的变量、表单、API、输出和状态数据域；
- 相同业务组件在同一流程使用两次时，也必须按两个 `nodeId` 隔离，不能使用 `componentId` 做数据主键；
- 本地变量默认不注册到全局，跨节点只通过声明的输入、输出和 binding 传递；
- 组件变量设计已冻结：当前组件可直接读取和修改自己的内部变量；需要取得其他组件的全部变量时，通过明确的组件实例标识获取只读快照，产品界面可称“组件 ID”，引导式底层保存 `nodeId + variableKey`；
- 组件可以读取流程中显式定义的全局变量；写入全局变量必须明确选择全局赋值目标，组件变量不会因同名或被引用而自动变成全局变量；
- 用户不负责流程级唯一命名，平台维护技术 ID；显示名称可以重复，可读别名仅在跨节点引用时按需生成；
- 流程共享变量必须显式声明；旧 `context.variable/context.api` 由兼容投影生成；
- 分支回滚按节点域整体释放数据和异步任务，不再按全局变量名清理；
- 主 `src` 和独立 `page/materials` 必须使用同一 GuidedRuntime、binding 和表达式语义。

新增的环节输出和流程推进结论：

- 当前人工分支能读取多个内部 `Select/Radio` 原子值，支持条件列表和 AND/OR，也会处理数组值，但这只是“内部原子值判断”，不是正式组件输出；
- 新模型必须区分节点 `input/draft/private/apiData/output/status/validation`；
- 自动 content 在接口或组件自动逻辑完成后立即评估分支并继续，后续仍为自动节点时连续静默加载，不需要用户动作或 `isNext`；
- 人工 content 进入后暂停，组件自行定义有效结果的产生时机：单一决策元素可在点选变化后继续；多字段组件可在字段完整且校验通过后自动计算，也可按业务需要通过确认/完成动作计算；
- “组件输出”是应用组件对外提供的环节结果，默认属于当前 `nodeId`，不是全局参数；主要用于分支判断，也可被智能导航和下游节点按需引用；
- 分支判断字段与导航展示字段可以不同。简单人工选择可暂用 `value` 判断分支、`label` 展示导航；复杂组件可以分别提供判断字段和一个或多个诊断展示字段；
- 自动环节可由接口单独返回 `success/failure` 业务诊断状态供导航显示红色或绿色；完整列表仍可留在环节正文，除非分支或下游确实需要，否则不必全部发布为组件输出；
- 复杂选择和计算确定集中在应用组件内部：组件声明稳定的分支结果变量，通过 `onChange → 脚本/表达式 → 变量赋值` 更新，流程只根据该业务代码选择连线；变量作用域和访问规则已冻结，人工环节的自动推进或确认完成时机仍待按组件类型确定；
- 已核对当前代码：仅声明变量或设置默认表达式不会自动响应表单变化，必须显式配置事件赋值；变量变化后现有 `VA` 监听可以重算分支；
- 当前变量赋值仍写入页面级 `variableData`，新模型需要按 `nodeId` 隔离，并支持“人工交互 + 组件变量分支”，不再把交互方式和 `MT/VA` 数据来源绑定在一起；
- P0-05 多出线唯一命中规则已冻结：正常推进只命中一条出线，同优先级冲突停止并诊断，无命中时走唯一默认分支或显式阻塞；自动多分支仍静默连续执行；
- P0-06 拓扑规则已冻结：单活动路径 DAG，只允许一个开始节点和一个结束节点；所有有效分支最终必须汇合并连接到同一个结束节点；
- P0-07 分支回滚范围已冻结：旧路径节点域、输出、接口数据、DOM、订阅和异步任务整体失效，后端副作用按具体接口语义处理；
- P0-08 的刷新规则已冻结：第一版不做浏览器刷新断点恢复，刷新后一律从开始节点重新执行；监听到手机号变更事件时弹框告知，随后使旧运行整体失效、读取新手机号并从开始节点重新渲染；
- 浏览器刷新和手机号变更重启都必须更换 `runId/executionId`，清理旧节点域、变量、表单、输出、接口结果、导航、DOM 和订阅，并拒绝旧异步结果回写；前端重启不撤销后端业务结果，配置开发人员负责保证接口及其重复调用符合业务要求；
- P0-08 不设计“返回上一步”和“重新进入”机制；切换到其他宿主页签再切回时不触发任何流程动作，原 DOM、活动路径和运行态保持不变；直接修改仍可编辑的前序环节属于 P0-07 分支回滚；
- P0-09 已冻结：接口及返回完整性由配置开发人员保证；请求异常、超时、无有效返回或结构不符时直接展示技术错误并停止流程，不设计自动/手动重试、失败出线、通用补偿或幂等机制；正常返回的业务 `success/failure` 仍作为诊断和业务分支结果；
- P0-10 暂缓：主 `src` 是管理应用内的编辑/预览入口，独立 `page` 是单独构建的运行页面；其实际生产用途和共享代码落点转为开发实施阶段核查，不作为当前产品讨论和需求冻结门槛；
- P1-01 已冻结为“引用完整性校验”，不额外建设输出契约主版本体系：组件/变量删除或结构性修改前即时检查反向引用，保存草稿时全量校验并标记不可发布，发布时存在硬错误必须阻止；
- 所有引用保存不可变技术 ID 和结构化依赖，不能按显示名称或字符串搜索变量名；脚本动作必须声明 `reads/writes`，无法追踪的动态变量访问不得通过新配置校验；
- 全局变量还要校验赋值可达性：默认值或 header 初始化赋值可保证后续使用；条件事件和部分路径赋值不保证所有路径。必需读取点在每条可达路径上都必须先有值，footer 响应式显隐可以允许初始无值并配置默认隐藏/显示；
- 人工环节中作为“产生有效结果并继续流程”必经步骤的 change/确认赋值，成功后才允许推进时可视为节点完成前保证赋值；普通可选事件赋值仍只算条件来源；
- P1-02 已冻结：同一通用组件模板可在流程中使用多次，`componentId` 标识模板、`nodeId` 标识环节实例、`nodeExecutionId` 标识一次执行；每个实例的接口、标题、导航文案、变量、API 数据、输出和诊断结果完全隔离；
- 通用表格等模板声明可配置接口能力/接口槽位，各节点实例选择不同后端接口并配置入参和结果映射；节点复制生成新 `nodeId`，一个实例的刷新、回滚、删除或报错不影响其他实例；
- P1-03 已冻结：不考虑多页签并发；人工操作和 footer 按钮增加实例级前端动作锁，相同结果重复点击不执行，不同结果按 P0-07 回滚；每次有效动作使用新执行 ID，旧异步结果拒绝回写；
- P1-04 已冻结：平台完全不管业务日志，环节记录、人工点选记录和按钮记录由各业务模块通过自己的接口完成；第一版只补当前缺失的节点实例级 `onNodeLoaded` 通用事件，点选/按钮/确认记录继续复用元素现有 `change/click/confirm` 事件；
- 所有事件上下文提供只读 `context.process.activeContentPath`，按加载顺序返回当前已经加载且最终仍成立的 content 摘要（节点、标题、人工/自动、正式输出、诊断结果）；它就是当前有效轨迹/当前最终态，分支回滚后旧路径移除且不保留历史；
- P1-05 已移出范围：表达式沙箱、`new Function` 替换和受限 DSL 属于全平台安全专项；引导式沿用现有脚本能力、不新增自由脚本分支入口，只为 P1-01 记录脚本变量 `reads/writes`；
- P1-06 已移出范围：敏感字段、字段权限、脱敏和Token治理属于平台级数据安全；引导式只落实节点作用域、组件实例引用和显式全局变量读取规则；
- P1-07 已重新打开：header/footer会先上线并创建少量试点流程，届时节点变量作用域尚未完成，这些流程会成为过渡版；第一阶段必须保存稳定 `nodeId` 和 `guidedSchemaVersion`，后续用轻量升级迁移可确定的组件变量/引用，歧义由配置人员确认并通过P1-01校验，不建设重型通用迁移系统；
- P1-08 已移出范围：业务结果应由前端脚本还是后端接口产生属于各业务模块和整个项目的架构责任；引导式只消费稳定业务结果并按连线推进；
- P1-09和P1-10合并为“流程画布体验与容量”专题：性能容量与左右/上下连线方向可一起开发，但仍分别验收；容量按最多150个业务节点及节点内元素体量压测，方向按整图切换且不改变流程语义；
- P2 当前阶段整体暂不考虑：P2-01～P2-05均不纳入本轮设计、开发、验收或正式推广前置条件，只保留未来备忘；其中P2-04因项目属于内网场景，本轮不提出可访问性和移动端适配要求；
- P0-04 已冻结：复杂组合条件优先在组件内部通过事件和脚本计算为稳定业务值，流程第一版只需匹配该值；集合操作符降为旧组件兼容或后续增强，不再作为 P0 门槛；
- “意向降档金额＋意向降档套餐”属于即时决策组件：字段完整有效后自动计算结果，不需要确认按钮；任一字段变化导致结果变化时，按 P0-07 清理并重载后续分支；
- 已记录该真实例子的三档结果：`PLAN_8`、`PLAN_8_49`、`PLAN_49_PLUS`；已走8元分支后改成28元时，组件结果变为 `PLAN_8_49`，旧后续路径整体释放并加载新分支；字段不完整或校验失败时不推进；
- 现有低代码业务组件通过输出映射形成 `node.output`，未来完整 React ZIP 组件通过平台 SDK 提交同一种输出；
- 组件可以输出业务 `decisionCode`，但不能输出 `nextNodeId`，下一节点仍由画布连线和分支规则选择；
- 设计图可以分支和重新汇合，但一次运行只有一条活动路径；支持 `A-B-D / A-C-D`，本期不支持 B、C 同时执行后等待汇聚；
- 前端 GuidedRuntime 是流程推进主引擎，后端负责业务 API、可信业务规则、权限、定义持久化和可选运行快照；
- 用户修改前序环节时，旧输出、旧分支数据、DOM 和异步结果必须一起失效，不能只截断页面元素。

详细数据域设计位于《引导式流程展示编排升级设计（`GUIDED_PROCESS_REDESIGN(引导式流程展示编排升级设计).md`）》第 15 章；环节正式输出和单活动路径推进位于第 16 章。尚未冻结的问题单独记录在《引导式流程待完善事项（`GUIDED_PROCESS_PENDING_ITEMS(引导式待完善事项).md`）》中。

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
- 已将 `GUIDED_PROCESS_HEADER_FOOTER_REQUIREMENTS(引导式Header与Footer第一期需求).md` 收口为第一期冻结需求：Header 先初始化再启动 Content，Footer 页面启动时固定挂载，按钮只执行业务动作且不推进流程，活动路径到达 Footer 后自动进入唯一结束节点；画布容量/方向、完整节点作用域和 P2 不混入第一期。
- 已新增 `GUIDED_PROCESS_PHASE_PLAN(引导式流程分期实施规划).md` 作为当前引导式产品分期基线：一期 Header/Footer，二期组件作用域与引用，三期正式输出/诊断/动态分支，四期后续路径回滚与运行时稳定性，五期画布体验与容量，六期整体验收与推广准备；详细设计中的旧技术阶段不再代表产品版本顺序。
- 已完成第一至第六期全部详细开发方案：一期 Header/Footer，二期组件作用域与引用，三期正式输出/诊断/动态分支，四期路径回滚与运行时稳定性，五期画布体验与容量，六期整体验收与推广准备；每期均包含范围边界、协议、前后端任务、双入口、测试、完成门槛和单前端/单后端预计时间。
- 第三期明确组件内部计算、正式输出 value/label、多条诊断、自动 success/failure、人工/自动完成策略和唯一分支；第四期接管 `BRANCH_RECONCILIATION_REQUIRED`，实现执行身份、旧路径释放、异步旧写隔离、activeContentPath、onNodeLoaded、刷新/手机号/页签生命周期；第五期按真实110/模拟150节点以及重组件基准先优化现有画布，再决定是否换库，并支持整图左右/上下方向；第六期只做组合验收、试点升级、文档和推广收口，不新增大范围产品能力。
- 已新增三份引导式“开发前置包”：`GUIDED_PROCESS_DEVELOPMENT_CONTRACTS(引导式开发契约总表).md` 汇总跨期稳定身份、Schema、作用域、输出、诊断、分支、执行身份、路径和错误契约；`GUIDED_PROCESS_PRE_DEVELOPMENT_CHECKLIST(引导式开发前技术核查清单).md` 按当前真实前端入口和每期准入列核查项；`GUIDED_PROCESS_FRONTEND_BACKEND_CONTRACT(引导式前后端接口与数据契约).md` 冻结 sceneData、组件定义、保存/查询/发布/影响分析/迁移等职责，不虚构后端最终 URL。
- 已把 `GUIDED_PROCESS_PHASE_PLAN(引导式流程分期实施规划).md` 优化为“总览与执行规划”：增加步骤0～34的逐步实施表、每期G-A开发准入/G-B契约冻结/G-C功能完成/G-D双入口联调/G-E阶段验收五道关口、六个里程碑可用程度、累计33～46周、角色责任、范围变化处理，以及一期下一次启动和向二期交接的明确清单。当前执行位置为步骤0/1，下一项实质工作是步骤2“一期T1真实技术核查”，尚未授权主干编码。
- 已把环节正式输出、草稿/完成边界、多字段和多选组合、低代码/React 组件统一输出协议、单活动路径与分支汇合追加到引导式详细设计第 16 章。
- 已新增独立的引导式流程待完善事项文档，按 P0/P1/P2 记录需要后续评审的产品和技术决策；当前用户要求先讨论、看清待完善点，再决定实现，不要直接生成代码。
- 已编写详细自定义元素 v2 React 组件 ZIP 包重写设计文档，包含 ZIP/ngap.json 协议、AST 推导、平台 SDK 与权限、manifest、服务端构建、注册、安全、双运行时兼容、迁移、测试和分阶段实施方案。
- 已编写需求人员入门文档 `NGAP_REQUIREMENTS_ONBOARDING(NGAP需求人员入门指南).md`，介绍当前 NGAP 平台能力、核心业务对象、多项目组协作方式和两个重点优化项目；明确先完成引导式流程改造，再启动自定义元素正式改造。
- 已增加保留原页面结构的本地模拟模式，不再采用独立“实验台”页面：
  - `#/build?mock=guided` 自动打开原应用编排画布；
  - `#/build?mock=element` 当前仍自动打开原元素管理并弹出现有“单 TSX 函数组件”模拟上传；它只是旧的链路验证样例，正式目标已改为 ZIP 包上传；
  - 缺失二进制图片由 Vite 开发插件提供 SVG 占位，不改变原组件结构。
- 原流程节点菜单已增加“展示设置”，原顶部工具栏已增加“页面布局”；预览仍复用 `ProcessPage`。
- 原元素管理顶部操作栏当前已增加“上传函数组件”模拟入口，预览仍复用 `previewElementModal` 和 `NgapRender`；正式改造应替换为组件 ZIP 包向导。
- 引导式 Mock 基础信息已补齐应用分类、应用标签、归属项目及对应候选数据；基础信息“确定”和“保存草稿”已通过实际页面验证。

## 4. 必读文档

### NGAP 平台与重点优化需求入门指南（NGAP_REQUIREMENTS_ONBOARDING）

```text
C:\Users\EDY\Desktop\ngap\NGAP_REQUIREMENTS_ONBOARDING(NGAP需求人员入门指南).md
```

包含：

- 当前 NGAP 的产品定位和完整能力地图；
- 元素、业务组件、模板、应用、变量、接口、事件和流程等核心对象；
- 应用从建设、审核、发布、上架到运行治理的闭环；
- 多项目组协作和需求文档检查清单；
- 引导式流程四区改造的需求目标、范围、规则和完成门槛；
- 自定义元素 ZIP + SDK 改造的需求目标和启动条件；
- 明确实施顺序：引导式稳定后再改造自定义元素。

### 引导式流程展示编排升级详细设计（GUIDED_PROCESS_REDESIGN）

```text
C:\Users\EDY\Desktop\ngap\GUIDED_PROCESS_REDESIGN(引导式流程展示编排升级设计).md
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

### 引导式 Header / Footer 第一期冻结需求（GUIDED_PROCESS_HEADER_FOOTER_REQUIREMENTS）

```text
C:\Users\EDY\Desktop\ngap\GUIDED_PROCESS_HEADER_FOOTER_REQUIREMENTS(引导式Header与Footer第一期需求).md
```

包含：

- Header、Content、Footer 第一期范围和页面骨架；
- Header 前置初始化、Footer 固定挂载和到达 Footer 后自动结束；
- 编辑器区域配置、唯一性、首尾拓扑和发布校验；
- Footer 响应式显隐、按钮业务动作及生命周期；
- 稳定 `nodeId`、`guidedSchemaVersion`、兼容规则和双运行时验收；
- 第一期测试场景及开发前技术核查清单。

### 引导式流程分期实施规划（GUIDED_PROCESS_PHASE_PLAN）

```text
C:\Users\EDY\Desktop\ngap\GUIDED_PROCESS_PHASE_PLAN(引导式流程分期实施规划).md
```

包含：

- 第一期至第六期的目标、范围、不包含项和完成门槛；
- 第一期过渡变量方案及第二期轻量升级规则；
- 第三期正式输出与第四期路径回滚的职责边界；
- 第五期150节点容量、节点内元素体量和左右/上下方向专题；
- 各期依赖关系、可提前准备事项和当前执行位置。

### 引导式一期 Header / Footer 开发方案（GUIDED_PROCESS_PHASE1_TECHNICAL_PLAN）

```text
C:\Users\EDY\Desktop\ngap\GUIDED_PROCESS_PHASE1_TECHNICAL_PLAN(引导式一期Header与Footer开发方案).md
```

包含：

- 明确 Repomix 原始基线、当前工作区原型和正式一期实现三层状态；
- `guidedSchemaVersion=1`、稳定 `nodeId` 和节点实例 `presentation.region` 数据契约；
- 编辑器区域配置、替换确认、连线限制、全图校验和保存/发布规则；
- Header 可等待初始化动作通道和 `ready` 判定；
- Footer 固定挂载、页面布局、`BottomBanner` 隔离和生命周期；
- 主 `src` 与独立 `page` 的共享纯逻辑及宿主改造范围；
- 后端保存、查询、历史、复制、分享和发布链路核查；
- T1～T9 文件级任务、6～8 周安排、测试矩阵和完成门槛。

### 引导式二期组件作用域与引用体系开发方案（GUIDED_PROCESS_PHASE2_TECHNICAL_PLAN）

```text
C:\Users\EDY\Desktop\ngap\GUIDED_PROCESS_PHASE2_TECHNICAL_PLAN(引导式二期组件作用域与引用体系开发方案).md
```

包含：

- 明确第二期是第三期正式输出/动态分支和第四期路径回滚的数据地基；
- `componentId` 模板、`nodeId` 实例、`variableId` 组件变量和 `globalVariableId` 全局变量四类稳定身份；
- `guidedSchemaVersion=2`、业务组件变量定义和流程全局变量保存契约；
- 以 `nodeId` 隔离组件变量、表单和 API 数据的节点运行作用域；
- React 节点 Runtime Context、旧物料 Store 适配和普通页面兼容；
- 结构化引用、精确响应式订阅、依赖图、反向索引和赋值可达性校验；
- 删除节点/变量和模板变量结构变化时的跨流程影响分析；
- 第一期试点流程 v1→v2 轻量迁移和人工确认机制；
- 主 `src`、独立 `page/materials` 和后端文件/接口改造；
- P2-T1～P2-T8、7～9 周安排、测试矩阵及第三期开始门槛。

### 引导式三期正式输出、诊断结果与动态分支开发方案（GUIDED_PROCESS_PHASE3_TECHNICAL_PLAN）

```text
C:\Users\EDY\Desktop\ngap\GUIDED_PROCESS_PHASE3_TECHNICAL_PLAN(引导式三期正式输出诊断与动态分支开发方案).md
```

包含：

- `guidedSchemaVersion=3`、稳定 `outputId`、节点输出映射和正式结果快照；
- 组件内部事件/脚本计算、原子发布、结果 revision 和去重规则；
- 分支 value、展示 label、多条诊断内容和自动节点 success/failure 状态；
- 人工 `output-valid` / `component-signal` 与自动动作完成三种完成策略；
- 自动环节静默连续推进、唯一命中、默认分支和稳定 `transitionId`；
- 编辑器、运行时、后端保存/发布、主 `src` 与独立 `page` 双入口任务；
- 意向降档完整示例，以及第三期重算与第四期旧路径释放的明确边界；
- P3-T1～P3-T8、前端 22～30 人日、后端 10～15 人日和 6～8 周安排。

### 引导式四期路径回滚与运行时稳定性开发方案（GUIDED_PROCESS_PHASE4_TECHNICAL_PLAN）

```text
C:\Users\EDY\Desktop\ngap\GUIDED_PROCESS_PHASE4_TECHNICAL_PLAN(引导式四期路径回滚与运行时稳定性开发方案).md
```

包含：

- processRunId/nodeExecutionId/actionExecutionId 三级执行身份；
- activeExecutionPath、activeContentPath、分歧点和旧后缀计算；
- Content/Control 逆序释放、订阅缓存清理、AbortController 和旧异步写入拒绝；
- 快速连续改选 latest-intent-wins、动作锁和相同结果去重；
- 流程全局变量写入来源追踪及旧路径赋值撤销；
- `onNodeLoaded` 固定时机和只读有效路径上下文；
- 浏览器刷新从头、手机号确认变化后从头、普通页签切回保持不动；
- P4-T1～P4-T8、前端 24～33 人日、后端 6～10 人日和 6～9 周安排。

### 引导式五期画布体验与容量开发方案（GUIDED_PROCESS_PHASE5_TECHNICAL_PLAN）

```text
C:\Users\EDY\Desktop\ngap\GUIDED_PROCESS_PHASE5_TECHNICAL_PLAN(引导式五期画布体验与容量开发方案).md
```

包含：

- 真实约110、模拟150、节点少元素多、节点多元素少四类统一基准；
- 画布拓扑摘要和完整组件详情分离、详情按需加载与缓存释放；
- 节点细粒度渲染、邻接索引、拖动合帧和关联连线局部更新；
- 撤销重做、初始化、保存序列化和必要视口策略；
- 流程级左右/上下连接点与线路由，切换不自动重排、不改变业务语义；
- 现有画布优化后再以同数据同操作同指标决定是否更换开源库；
- P5-T1～P5-T7、前端 20～30 人日、后端 2～5 人日和 5～7 周安排。

### 引导式六期整体验收与推广准备开发方案（GUIDED_PROCESS_PHASE6_TECHNICAL_PLAN）

```text
C:\Users\EDY\Desktop\ngap\GUIDED_PROCESS_PHASE6_TECHNICAL_PLAN(引导式六期整体验收与推广准备开发方案).md
```

包含：

- 简单流程、连续自动、复杂人工分支、汇合、组件复用、大流程、生命周期和错误八类验收场景；
- 主预览与独立 page 运行快照和关键结果一致性对比；
- 后端保存/查询/复制/历史/发布字段往返；
- 少量试点流程逐版本升级、歧义确认和发布验收；
- 配置人员手册、组件接入手册、错误说明、已知限制和推广范围；
- 阻断缺陷门槛、第一批场景和支持责任人；
- P6-T1～P6-T7、前端 12～18 人日、后端 6～10 人日和 3～5 周安排。

### 引导式开发前置包

```text
C:\Users\EDY\Desktop\ngap\GUIDED_PROCESS_DEVELOPMENT_CONTRACTS(引导式开发契约总表).md
C:\Users\EDY\Desktop\ngap\GUIDED_PROCESS_PRE_DEVELOPMENT_CHECKLIST(引导式开发前技术核查清单).md
C:\Users\EDY\Desktop\ngap\GUIDED_PROCESS_FRONTEND_BACKEND_CONTRACT(引导式前后端接口与数据契约).md
```

包含：

- 第一至第五版定义字段与第六期继续验收 v5 的版本关系；
- componentId/nodeId/variableId/globalVariableId/outputId/transitionId 及三级运行身份总表；
- 持久化/非持久化边界、统一引用、输出、诊断、完成策略、回滚和错误语义；
- 基于当前真实 `ProcessCanvas`、`CanvasTop`、主 `ProcessPage`、独立 `page`、Store 和 API 入口的逐期核查清单；
- `/app/saveAppInfo`、查询、历史等已知调用的核查点，以及后端保存、发布强校验、引用影响和迁移职责；
- 真实后端 URL、DTO、数据库落点仍需在后端工程中回填，不在当前文档中猜测。

### 引导式流程待完善事项（GUIDED_PROCESS_PENDING_ITEMS）

```text
C:\Users\EDY\Desktop\ngap\GUIDED_PROCESS_PENDING_ITEMS(引导式待完善事项).md
```

包含：

- 已经确认的方案前提；
- 开发主干前必须确认的 P0 事项；
- 主干开发期间确认的 P1 事项；
- 当前整体暂不考虑、仅供未来重新评估的 P2 备忘；
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

### NGAP 核心改造记录（REFACTOR_NOTES）

```text
C:\Users\EDY\Desktop\ngap\REFACTOR_NOTES(NGAP核心改造记录).md
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

引导式产品规则讨论已基本完成，P0/P1 结论已记录，待完善事项中的 P2 当前整体暂不考虑；Header/Footer 第一期需求、第一至第六期详细开发方案和三份开发前置包均已输出。总览已经安排步骤0～34和G-A～G-E关口，当前位于步骤0/1；下一项实质工作严格按步骤2执行一期T1真实技术核查，核查一期保存链、双入口、BottomBanner和Header可等待初始化，再进入G-B契约冻结。用户明确授权编码且G-A/G-B通过后，才进入步骤4开始一期编码。

如果用户后续明确要求开始实现引导式改造：

1. 先完整阅读 `GUIDED_PROCESS_DEVELOPMENT_CONTRACTS(引导式开发契约总表).md` 和当前准备实施阶段对应的详细方案；跨期工作再阅读第一至第六期全部方案；同时完整阅读 `GUIDED_PROCESS_PHASE_PLAN(引导式流程分期实施规划).md`、`GUIDED_PROCESS_HEADER_FOOTER_REQUIREMENTS(引导式Header与Footer第一期需求).md`、`GUIDED_PROCESS_REDESIGN(引导式流程展示编排升级设计).md` 和 `GUIDED_PROCESS_PENDING_ITEMS(引导式待完善事项).md`；
2. 按 `GUIDED_PROCESS_PRE_DEVELOPMENT_CHECKLIST(引导式开发前技术核查清单).md` 完成当前阶段真实代码和接口核查；涉及后端时同步按 `GUIDED_PROCESS_FRONTEND_BACKEND_CONTRACT(引导式前后端接口与数据契约).md` 回填真实 URL、DTO 和数据库结论；
3. 按 Header/Footer 冻结需求第 15 章核查主 `src`、独立 `page`、保存接口、页面布局和现有事件/绑定能力；
4. 按一期开发方案 T1～T9 更新真实核查结论，不另起一套任务口径；
5. 第一阶段实现 Header/Footer 区域配置、稳定 `nodeId + guidedSchemaVersion`、拓扑校验和保存回读；
6. 同步实现主预览与独立运行页的 Header 前置初始化、Footer 固定挂载、区域布局和异常处理；
7. 用一个简单真实流程跑通 Header 公共数据、自动/人工 Content 和 Footer 按钮显隐/业务动作；
8. 再进入完整节点变量作用域、动态输出、分支回滚和轻量试点流程升级；
9. 最后单独实施画布容量及左右/上下方向专题。

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
- 讨论或实现引导式时，先阅读 `GUIDED_PROCESS_DEVELOPMENT_CONTRACTS(引导式开发契约总表).md` 和当前阶段详细方案，再按 `GUIDED_PROCESS_PRE_DEVELOPMENT_CHECKLIST(引导式开发前技术核查清单).md` 核查；涉及后端时阅读 `GUIDED_PROCESS_FRONTEND_BACKEND_CONTRACT(引导式前后端接口与数据契约).md`；跨期架构或验收工作需要完整阅读第一至第六期方案及总体设计/待完善事项；
- 当前讨论进度是：P0/P1 产品规则已基本完成，待完善事项中的 P2 当前整体暂不考虑；Header/Footer 第一期需求、第一至第六期详细开发方案和开发前置包均已输出；总览已细化步骤0～34，当前在步骤0/1，下一项实质工作是步骤2一期T1真实技术核查，尚未授权开始主干编码；
- 不要重新要求用户提供整个项目；文本源码已还原。
- 不要要求用户传十几 MB 的全部图片；核心改造可先使用占位资源。
- 不要把顶部/底部属性加到业务组件模板；必须加到流程节点实例。普通环节无需配置 `content`，只有 `header/footer/control` 作为特殊用途显式设置。
- 不要继续以第一个节点固定作为 header 或最后节点作为 footer；应显式配置。
- 不要继续用扁平元素下标实现导航定位；使用 nodeId 和节点容器 ref。
- 不要只修改 `src`，还要考虑 `page` 子项目的独立运行时。
- 修改 BottomBanner 时必须回归普通组装式页面。
- 用户目前首先要求的是设计和上下文记录，尚未明确授权开始大规模实现。
