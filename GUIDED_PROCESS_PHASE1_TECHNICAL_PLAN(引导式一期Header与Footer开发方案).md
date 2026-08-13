# 引导式一期 Header 与 Footer 开发方案

## 1. 文档信息

| 项目 | 内容 |
| --- | --- |
| 文档名称 | 引导式一期 Header 与 Footer 开发方案 |
| 文档性质 | 开发实施方案，不是产品需求文档 |
| 对应阶段 | 第一期：Header / Footer 页面骨架 |
| 当前状态 | 待技术评审，尚未开始正式代码开发 |
| 原始代码基线 | `D:\download\repomix-output\repomix-output.xml` 还原出的项目源码 |
| 前端工程 | 当前 `ngap` 工作区，包含主 `src` 与独立 `page` 两套运行入口 |
| 后端工程 | 当前工作区未提供，接口和文件级改动需由后端开发在实际工程中复核 |
| 关联需求 | `GUIDED_PROCESS_HEADER_FOOTER_REQUIREMENTS(引导式Header与Footer第一期需求).md` |
| 分期规划 | `GUIDED_PROCESS_PHASE_PLAN(引导式流程分期实施规划).md` |
| 总体设计 | `GUIDED_PROCESS_REDESIGN(引导式流程展示编排升级设计).md` |
| 决策记录 | `GUIDED_PROCESS_PENDING_ITEMS(引导式待完善事项).md` |

本文用于指导一名前端新人和一名后端开发完成第一期正式实现。本文只生成开发计划，不代表已经修改业务代码。

---

## 2. 基线说明

### 2.1 必须区分的三层代码状态

本项目当前同时存在三种容易混淆的状态：

| 层级 | 含义 | 开发时如何使用 |
| --- | --- | --- |
| Repomix 原始基线 | 从内外网原始工程导出的源码，是判断“平台原本支持什么”的依据 | 正式评估改动量和兼容性时以它为准 |
| 当前工作区原型 | 此前为了验证想法加入的 `presentation.region`、区域过滤、页面配置等本地实现 | 只能逐项审查后复用，不能直接视为现有生产能力 |
| 第一期正式实现 | 按冻结需求重新核对数据、编辑器、后端和双运行时后形成的可发布版本 | 必须经过保存回读、双入口、异常和回归验收 |

已经核对 Repomix 原始文件，原始代码中没有以下正式能力：

- `ProcessNodeRegion`；
- `ProcessNodePresentation`；
- `normalizeNodePresentation`；
- `presentation.region`；
- Header、Content、Footer 分区渲染；
- `guidedSchemaVersion`。

因此第一期不能按“给已有区域功能补几个样式”估算，而应按新增流程定义字段、编辑器约束、运行时状态和后端数据往返能力实施。

### 2.2 当前工作区原型可参考但不能直接交付的内容

当前工作区已经出现以下原型：

- 节点类型中增加了 `presentation`；
- 编辑器节点卡片可以显示区域标签；
- 主 `src` 预览会把已经加载的元素按区域过滤；
- `CanvasTop` 会把 `processConfig` 和 `componentList` 写入 `sceneData`；
- 主 `src` 的 `BottomBanner` 出现了 `positionMode=container` 试验实现。

这些原型仍存在正式交付阻断项：

1. Header/Footer 仍然要等流程走到对应节点后才进入 `allRenderElements`，不是页面启动即固定挂载；
2. Header 初始化没有可靠的 Promise 完成信号，Content 无法确认接口和赋值是否真正结束；
3. 独立 `page/src/page/index.tsx` 仍然是扁平渲染，没有 Header/Footer 语义；
4. `materials/Layout/BottomBanner` 没有与主 `src` 同步；
5. 区域信息同时写到节点和 `componentData`，混淆节点实例与通用组件模板；
6. 当前节点 ID 使用毫秒时间戳，同一毫秒操作存在碰撞风险；
7. 当前区域弹窗含 `control`、导航开关和导航标题，超出第一期冻结范围；
8. 设置第二个 Header/Footer 只提示，不符合“确认替换并把旧节点降级为 Content”的规则；
9. 保存校验仍主要检查有没有父线、有没有出线，没有完整 Header/Footer 图校验；
10. 历史记录类型未完整登记区域修改动作，撤销重做存在类型和数据一致性风险；
11. 手机号变化的现有刷新逻辑直接清空并重跑，没有需求要求的确认和完整清理；
12. 后端是否保留新增字段尚未用实际工程验证。

正式开发时可以复用原型中的类型命名、归一化思路和部分 UI，但必须按本文逐项审查，不允许把原型整体合并后直接宣布完成。

---

## 3. 第一期目标与边界

### 3.1 本期必须交付

第一期必须形成以下完整闭环：

```text
节点配置区域
→ 编辑器即时约束
→ 保存流程定义
→ 后端完整保留并回读
→ 页面启动识别 Header/Footer
→ Header 初始化完成后启动 Content
→ Footer 固定挂载并响应页面数据
→ 主 src 与独立 page 行为一致
```

具体能力包括：

- Header、Content、Footer 三类区域；
- Header/Footer 各最多一个；
- Header 是开始后的第一个业务节点；
- Footer 是所有正常结束路径进入结束前的最后一个业务节点；
- Header 先初始化，成功后才启动 Content；
- Footer 页面启动时固定挂载，不等待活动路径到达；
- 到达 Footer 代表流程进入唯一结束，不由 Footer 按钮推进；
- Header/Footer 不进入智能导航；
- Footer 中按钮继续使用平台已有事件动作；
- `BottomBanner` 在 Footer 内使用容器布局，普通组装式页面行为不变；
- 稳定 `nodeId`、`guidedSchemaVersion` 和区域字段完成保存回读；
- 保存、复制、删除、撤销重做、历史版本和发布链路均不丢字段；
- 浏览器刷新、手机号变化、页签切换符合冻结需求。

### 3.2 本期明确不做

- 组件级变量作用域；
- 正式输出 `value/label`；
- 诊断结果协议；
- 完整动态分支回滚；
- `activeContentPath` 正式协议；
- Control 区域正式实现；
- 条件语言升级；
- 画布左右/上下方向切换；
- 150 节点专项性能优化；
- 移动端、可访问性和 P2 项目；
- 批量升级生产旧流程；
- 更换 React Flow、X6、LogicFlow 等画布底层库。

### 3.3 第一期正式字段边界

第一期节点展示契约只冻结：

```text
presentation.region = header | content | footer
```

以下原型字段不纳入第一期节点契约：

- `presentation.showInNavigator`；
- `presentation.navigatorTitle`；
- `presentation.region = control`。

第一期采用固定规则：

- Header/Footer 自动不进入智能导航；
- 当前活动路径上的 Content 继续按现有方式进入智能导航；
- 字段缺失、为空或非法时统一按 Content 读取；
- 第一版数据中出现 `control` 也按非法值归一为 Content，不把未来设计提前固化。

页面级导航总开关、导航标题或滚动模式如果继续保留，应放在页面级 `processConfig` 中，不得混入节点区域契约。它们不是判断 Header/Footer 的依据。

---

## 4. 当前流程链路核查结论

### 4.1 编辑器与保存链路

当前主要链路为：

```text
processCanvasPage/index.tsx
→ 查询 /app/queryAppAndNodeInfo
→ 批量查询 /appComponent/queryAppComponentInfoList
→ ProcessCanvas.setData()
→ 用户编辑节点和连线
→ ProcessCanvas.getData()
→ CanvasTop.saveData()
→ sceneData JSON.stringify
→ POST /app/saveAppInfo
```

流程节点当前主要使用以下持久化字段：

- `nodeId`；
- `componentId`；
- `componentType`；
- `parentId`；
- `branchIndex`；
- `canvasPoint`；
- `componentData`。

开始和结束是编辑器虚拟节点，不以普通业务节点写入 `componentList`。当前持久化拓扑是“子节点记录父节点”：

- 没有有效业务父节点的节点，运行时视为开始后的节点；
- 没有业务子节点的节点，运行时视为连接结束；
- `parentId` 与 `branchIndex` 按相同位置对应一组入边。

因此第一期不需要更换整套拓扑存储格式，但校验器必须把虚拟开始/结束补入内存图后再验证。

### 4.2 主 `src` 预览链路

主预览位于：

`src/pages/applicationOrchestration/pageCanvas/processCanvasPage/components/ProcessPage/ProcessPage.tsx`

当前运行方式是：

1. 读取 `componentList`；
2. 建立 `newComponentMap`；
3. 从 `start` 对应节点开始；
4. 每次按节点调用 `/appComponent/queryAppComponentInfo`；
5. 处理接口、变量、分支；
6. 将该节点元素追加到一个扁平的 `allRenderElements`；
7. 分支变化时按 `belongNodeId` 截断或过滤扁平数组。

当前原型最后再按 `presentation.region` 过滤扁平元素，只改变“元素放在哪个容器显示”，没有改变“节点什么时候加载”。这不满足 Header/Footer 生命周期要求，正式开发需要先按流程定义建立区域运行计划，再启动 Content 遍历。

### 4.3 独立 `page` 运行链路

独立运行页位于：

`page/src/page/index.tsx`

它使用：

- `/app/queryAppAndNodeInfo2` 获取正式运行数据；
- 测试状态下可能使用 `/app/queryAppAndNodeInfo`；
- `/appComponent/queryAppComponentInfo` 逐节点加载业务组件；
- `materials/NgapRender` 渲染物料；
- Web Worker 解析页面数据；
- 自己的一套 `allRenderElements`、分支监听、变量合并和刷新逻辑。

该入口当前完全没有 Header/Footer 区域语义。因此一期必须同步修改，不能用“主预览看起来正常”作为完成标准。

### 4.4 Header 初始化技术缺口

业务组件页面 Schema 已经有 `onLoad` 初始化事件，但现有动作引擎：

- `handleActionFlow()` 不返回 Promise；
- 内部 `execAction()` 通过回调和递归继续后续动作；
- 请求动作虽然是异步函数，调用方仍然无法等待整条动作链结束；
- 某些动作使用 `setTimeout`；
- 主 `src/packages/utils/action.ts` 和 `materials/utils/action.ts` 各有一套实现。

因此现阶段只能知道“初始化事件已经触发”，不能可靠知道“Header 必需接口、变量赋值和后续动作已经全部完成”。第一期必须解决这个缺口，不能使用固定延时、DOM 已出现或接口大概返回作为完成判断。

---

## 5. 一期总体技术结构

### 5.1 分层结构

建议按以下四层实施：

```text
流程定义层
  guidedSchemaVersion / nodeId / presentation.region
        ↓
纯逻辑层
  默认值归一化 / 图构建 / 图校验 / 运行计划
        ↓
宿主适配层
  编辑器 / 主 src 预览 / 独立 page 运行页
        ↓
渲染与动作层
  NgapRender / Header 初始化动作 / Footer 按钮动作
```

纯逻辑层不引用 React、Zustand、DOM、接口请求或某个运行端 Store。主 `src` 和独立 `page` 必须共用这部分逻辑，避免两个入口各自解释区域和拓扑。

### 5.2 建议新增共享目录

建议新增：

```text
src/shared/guidedProcess/
  types.ts
  schema.ts
  graph.ts
  validation.ts
  runtimePlan.ts
  index.ts
```

各文件职责：

| 文件 | 职责 |
| --- | --- |
| `types.ts` | 一期区域、流程定义、图节点、图边、错误和运行计划类型 |
| `schema.ts` | `guidedSchemaVersion` 常量、区域默认值、旧原型兼容读取、保存前清理 |
| `graph.ts` | 从 `componentList` 的 `parentId/branchIndex` 建立业务图和虚拟开始/结束 |
| `validation.ts` | Header/Footer 唯一性、位置、入出度、可达性和绕过检查 |
| `runtimePlan.ts` | 计算 Header、Footer、Content 起点和 Footer 到达处理，不包含接口调用 |
| `index.ts` | 统一导出，避免运行端引用内部文件 |

独立 `page` 已配置 `@editor` 指向主工程 `src`，可以引用这套纯逻辑。共享模块不得反向引用编辑器页面，否则会把编辑器 UI 打入独立运行包。

### 5.3 一期运行状态

第一期不实现完整节点作用域，但页面运行状态至少拆成：

```text
definitionState
  流程定义、区域节点、图和运行计划

headerState
  idle | loading | mounted | initializing | ready | error

contentState
  当前已加载 Content 节点和已有流程执行状态

footerState
  idle | loading | mounted | ready | error

pageRunState
  runId、是否结束、当前技术错误
```

不能继续只使用一个 `allRenderElements` 同时代表固定区和活动 Content。

---

## 6. 数据契约设计

### 6.1 `sceneData` 建议结构

第一期建议在现有 `sceneData` JSON 内保存：

```json
{
  "guidedSchemaVersion": 1,
  "processConfig": {},
  "componentList": [
    {
      "nodeId": "gp_...",
      "componentType": "business",
      "componentId": "...",
      "position": "processPage",
      "parentId": "...",
      "branchIndex": "-1",
      "canvasPoint": "320,180",
      "presentation": {
        "region": "header"
      },
      "componentData": {}
    }
  ]
}
```

本结构是前后端联调建议，后端如果目前会把 `sceneData` 拆开返回，可以保持现有接口外形，但以下语义必须不变：

- `guidedSchemaVersion` 是整数，第一期值为 `1`；
- `presentation` 位于流程节点实例上；
- 通用业务组件模板接口不写入节点区域；
- `componentData` 不再作为正式区域字段的第二存储位置；
- `processConfig` 缺失时使用默认页面配置；
- 保存后再查询必须返回相同 `nodeId`、版本和区域。

### 6.2 兼容读取优先级

正式读取顺序建议为：

1. `componentList[i].presentation.region`；
2. 仅为兼容当前本地原型，允许读取 `componentList[i].componentData.presentation.region`；
3. 都没有或值非法时按 Content。

再次保存时只写第一种正式位置。原型嵌套字段可以在序列化阶段移除，防止继续形成双数据源。

### 6.3 稳定 `nodeId`

当前 `generateNodeId()` 使用 `new Date().valueOf()`，不满足稳定唯一身份要求。第一期应改为：

- 已保存节点继续保留原 `nodeId`，不得因打开、改名、移动或重新保存而生成新值；
- 新节点使用项目已有的 UUID 能力生成字符串 ID；
- 复制节点必须生成新 ID；
- 导入或读取时允许兼容历史数字 ID；
- 图计算统一按字符串比较 ID，避免数字/字符串混用；
- 保存和发布前检查 ID 非空且在单个流程内唯一；
- 后端只校验并原样保存，不在每次保存时重新生成 ID。

### 6.4 `guidedSchemaVersion`

版本规则：

- 缺失版本按 `0` 读取；
- 版本 `0` 的所有节点默认 Content；
- 第一期编辑器正式保存后写为 `1`；
- 运行端遇到高于自身支持范围的版本时展示“当前运行端版本过低”，不得静默降级运行；
- 版本升级逻辑集中在共享 `schema.ts`，不能散落在两套运行端。

### 6.5 拓扑存储保持兼容

第一期继续使用 `parentId + branchIndex` 保存业务边，不新增虚拟开始/结束节点到后端数据：

- 根业务节点由没有有效业务父节点推导；
- 终止业务节点由没有业务子节点推导；
- 编辑器仍显示开始和结束节点及连线；
- 校验和运行计划内部补出虚拟边；
- Footer 的“连接结束”在保存数据中表现为 Footer 没有业务子节点；
- 配置 Footer 时，其他任何业务节点都不能成为正常终止节点。

---

## 7. 编辑器开发方案

### 7.1 区域配置入口

在业务节点配置中提供：

```text
展示区域
  正文环节（默认）
  顶部核心信息
  底部操作区
```

规则：

- 不展示 Control；
- 不展示节点级导航开关和导航标题；
- 开始、结束虚拟节点不能配置区域；
- 区域设置只修改当前流程节点实例；
- Header/Footer 模式隐藏人工/自动分支配置入口，并明确提示“固定区域不参与分支判断”；
- 原节点内部组件和已有分支配置不静默删除；切回 Content 时仍可恢复；
- Header/Footer 运行时忽略被保留但暂时停用的分支配置。

### 7.2 第二个 Header/Footer 的替换流程

用户把节点 B 设置为 Header，而节点 A 已经是 Header 时：

1. 弹出确认：“当前已存在顶部核心信息 A，是否用 B 替换？”；
2. 取消则不修改任何数据；
3. 确认后 A 自动变为 Content，B 变为 Header；
4. A/B 的 `nodeId`、组件配置和连线全部保留；
5. 立即运行完整图校验；
6. 如拓扑不满足要求，只展示具体错误，不自动重连或删除节点。

Footer 使用相同规则。

### 7.3 节点卡片与操作

- Header 卡片显示 `[顶部]`；
- Content 卡片显示 `[环节]` 或维持普通样式；
- Footer 卡片显示 `[底部]`；
- 复制 Header/Footer 时，新节点强制为 Content；
- 删除特殊节点后立即重新校验；
- 撤销/重做必须同时恢复区域、替换前节点区域和相关错误状态；
- 区域修改动作加入正式历史记录类型，不能继续使用未登记的字符串；
- 快照中的节点实例只保留一个正式 `presentation` 数据源。

### 7.4 连线时即时限制

创建或修改连线时执行轻量校验：

- 已有 Header 时，开始节点只能连 Header；
- Header 不能有业务父节点，也不能接受其他节点入线；
- Header 只能有一条业务出线；
- Header 出线必须是无条件线；
- Footer 可以有多条入线；
- Footer 不能连接业务节点；
- Footer 不能配置条件出口；
- 结束节点存在 Footer 时，只接受 Footer；
- 不允许 Header/Footer 自环；
- 不允许明显形成特殊节点回路。

即时限制用于减少错误操作，但不能代替保存/发布时的全图校验。

### 7.5 全图校验算法

保存和发布前使用共享校验器：

1. 归一化节点 ID 和区域；
2. 解析每个节点的 `parentId/branchIndex`；
3. 建立业务节点入边和出边；
4. 推导根节点和终止节点；
5. 补出虚拟开始与结束；
6. 从开始做可达性遍历；
7. 检查环路、孤立节点和非法父引用；
8. 检查 Header/Footer 专项规则；
9. 返回结构化错误数组；
10. 编辑器根据 `nodeId/edgeId` 定位并高亮。

配置 Header 时必须满足：

- Header 数量恰好为 1 或 0；
- 有 Header 时根业务节点只有 Header；
- Header 入度只来自虚拟开始；
- Header 业务出度为 1；
- 出线分支索引为无条件语义；
- Header 可到达所有正常业务路径。

配置 Footer 时必须满足：

- Footer 数量恰好为 1 或 0；
- Footer 没有业务子节点；
- Footer 是唯一终止业务节点；
- 所有从开始可达的正常路径最终都能到达 Footer；
- 不存在绕过 Footer 直接结束的业务节点；
- Footer 的多条入边可以来自互斥分支汇合。

### 7.6 草稿与发布

- 草稿保存沿用平台现有规则，可以保存带可修复错误的定义；
- 草稿保存前仍需生成错误清单并提示；
- 数据结构损坏、重复 `nodeId`、JSON 无法解析等错误不能保存；
- 发布时 Header/Footer 拓扑错误全部阻断；
- 前端和后端发布校验使用相同规则说明和错误码；
- 后端是最终发布防线，不能只依靠浏览器校验。

---

## 8. Header 初始化开发方案

### 8.1 正式启动顺序

页面启动顺序固定为：

```text
查询流程定义
→ 归一化并建立运行计划
→ 定位 Header / Footer
→ 加载固定节点的组件定义
→ 挂载 Header / Footer 页面壳
→ 执行并等待 Header 初始化动作
→ Header ready
→ 从 Header 后继节点或普通根节点启动 Content
→ Content 连续执行
→ 活动路径到达 Footer
→ 标记流程结束，Footer 保持挂载
```

Footer 组件定义可以和 Header 并行请求，但 Content 只受 Header 成功状态控制。Footer 失败只在 Footer 区域展示错误，不让正文白屏。

### 8.2 可等待动作通道

主 `src` 和 `materials` 的事件动作引擎需要增加“可等待执行”能力：

- 保留现有 `handleActionFlow()` 的调用形式和普通事件行为；
- 新增可返回 Promise 的初始化执行入口；
- 请求、变量赋值、脚本、方法调用等动作必须在实际完成后 resolve；
- 请求失败或脚本异常必须 reject，并携带节点和动作信息；
- 成功/失败分支动作链都要正确结束 Promise；
- 不能修改传入动作定义对象，避免重复运行时动作数据丢失；
- 页面卸载或手机号确认重启后，旧初始化结果不得继续启动 Content。

Header 初始化动作必须是可以自动结束的动作。需要用户交互才能完成的确认框、弹窗、跳转、长时间定时器等动作，不得作为“阻塞 Content 的 Header 初始化动作”；配置时应提示或发布阻断。

### 8.3 Header ready 判定

Header 只有同时满足以下条件才进入 `ready`：

1. 业务组件定义加载成功；
2. 自定义元素和必需样式加载完成；
3. Header 已挂载到固定区域；
4. 节点级初始化事件执行完毕；
5. 初始化动作中的必需接口成功；
6. 全局变量赋值已经提交到当前页面 Store；
7. 当前 `runId` 仍然有效。

以下情况不能判定为 ready：

- React 已经完成一次 render；
- DOM 中已经能看到 Header；
- 接口请求已经发出但未返回；
- 使用固定 200ms/500ms 延时后继续；
- 旧运行的接口在页面重启后返回。

### 8.4 Header 异常

- Header 区域展示错误标题、节点名称和可读原因；
- Content 保持未启动；
- Footer 如果已成功加载，可以继续显示，但业务按钮默认禁用或由现有变量条件隐藏；
- 不自动重试；
- 不进入业务失败诊断；
- 页面整体重新开始只能由浏览器刷新或手机号变化确认后的重启触发。

---

## 9. Content 与 Footer 运行方案

### 9.1 Content 起点

- 有 Header：Content 起点是 Header 的唯一业务后继；
- 无 Header：Content 起点是虚拟开始后的普通根节点；
- 如果 Header 直接进入 Footer，则页面没有 Content，Header 成功后流程直接结束；
- 运行时不得再次把 Header 作为普通节点追加到 Content。

### 9.2 Footer 固定挂载

Footer 在页面定义加载完成后即进入固定加载流程：

- 不等待上游活动路径到达；
- 不追加到 Content 元素数组；
- 不进入智能导航；
- 不执行分支判断；
- 不存在 Footer“完成按钮”；
- 内部每个按钮执行自身配置的业务事件；
- 活动路径到达 Footer 时只把流程标记为结束，不重新请求或重新挂载 Footer；
- 分支变化只通过现有页面数据使 Footer 元素显隐/禁用重新计算；
- 流程结束后 Footer 继续存在。

### 9.3 页面布局

建议页面壳使用明确的纵向 Grid/Flex：

```text
Header / 导航区域（按页面配置固定或随页）
Content 主滚动区域（占满剩余高度）
Footer 固定容器（正常文档流，不覆盖 Content）
```

要求：

- 只有 Content 是主滚动区；
- Footer 高度变化后 Content 自动重新计算可用高度；
- Footer 不使用覆盖正文的 `position:absolute`；
- Header/Footer 没有可见元素时不保留空白占位；
- 导航定位只查询 Content 节点，不能把固定区元素下标混入；
- 主预览和独立运行页使用同一布局语义，样式类可以分别实现。

### 9.4 `BottomBanner` 处理

不使用“页面里有没有 `BottomBanner`”推断 Footer。正式 Footer 只由节点区域决定。

推荐采用运行上下文隔离：

- Footer 页面壳为内部物料增加明确的 Footer 渲染上下文或作用域类；
- `BottomBanner` 在该上下文内改为普通容器定位；
- 普通组装式页面和普通 Content 内的 `BottomBanner` 继续保持原行为；
- 主 `src/packages/Layout/BottomBanner` 与 `materials/Layout/BottomBanner` 同步验证；
- 不把 `positionMode=container` 写回通用组件模板作为识别 Footer 的长期方案。

如果最终使用组件 Prop 传递渲染上下文，主 `NgapRender` 和 `materials/NgapRender` 必须使用同一字段和默认值；如果使用页面壳作用域 CSS，也必须在两个运行入口分别加入等价规则。

### 9.5 生命周期

浏览器刷新：

- 创建新 `runId`；
- 重新查询定义；
- 重新加载 Header/Footer；
- Header 再次初始化；
- Content 从头开始。

手机号变化：

- 收到现有 `refreshPageEvent` 后先弹确认；
- 用户取消则保持当前页面不动；
- 用户确认后使旧 `runId` 失效；
- 清理旧定时器、事件监听、组件引用和本次页面运行数据；
- 按新页面运行从 Header 开始。

页签切换：

- 组件没有卸载时不创建新 `runId`；
- Header/Content/Footer 和活动路径保持不变；
- 不新增“重新进入”事件。

第一期的 `runId` 只保护页面启动、固定节点加载和整体重启，不等同于第四期完整的分支异步失效系统。

---

## 10. 主 `src` 预览改造

### 10.1 改造原则

不能继续在 `allRenderElements` 形成后才按区域过滤。主预览应改为：

- 定义加载阶段先调用共享 `runtimePlan`；
- Header/Footer 使用独立节点加载状态和元素集合；
- Content 保留现有分支执行能力，但起点由运行计划提供；
- `addProcessNode()` 遇到 Footer 时结束当前路径，不重复渲染 Footer；
- `addProcessNode()` 不应再处理 Header；
- 导航只从当前 Content 元素和节点信息生成；
- Header 初始化失败时不调用 Content 起点；
- 现有分支回切功能在第一期只保持原行为，不扩展成第四期完整回滚。

### 10.2 Store 使用

第一期可以继续使用现有页面级变量和 API Store，但要遵循：

- Header 写入明确的全局变量后，Content 才开始；
- Header/Footer 节点身份保存在定义和渲染元素的 `belongNodeId` 中；
- 区域信息不写回通用组件详情；
- Header/Footer 的加载状态不要塞进永久流程定义；
- 页面重启时清理运行状态，不修改编辑器保存数据。

---

## 11. 独立 `page` 运行页改造

### 11.1 必须同步的语义

独立运行页必须与主预览保持：

- 相同版本读取；
- 相同区域默认值；
- 相同图校验和 Content 起点；
- 相同 Header ready 判定；
- 相同 Footer 固定挂载和到达结束语义；
- 相同导航排除规则；
- 相同手机号变化确认；
- 相同 `BottomBanner` Footer 容器行为；
- 相同错误分类。

### 11.2 允许不同的宿主实现

以下内容可以由两个入口分别适配：

- 请求基础地址；
- 页面 Store 实例；
- 自定义元素加载方式；
- Web Worker 解析；
- CrossAPI 实例；
- CSS Module 文件；
- 监控上报。

不能因为宿主不同而复制一套区域、拓扑和版本判断。共享纯逻辑必须是同一份。

### 11.3 双入口防漂移措施

- 使用同一组流程定义 fixture；
- 共享层单元测试只写一套；
- 主预览和独立运行页各写宿主适配测试；
- 验收时对同一份后端返回数据分别打开两个入口；
- 每个一期缺陷都要判断是否同时影响另一入口；
- 代码评审清单必须包含“page 是否同步”。

---

## 12. 后端开发方案

### 12.1 后端首先要确认的事实

当前工作区没有后端源码。后端开发开始后第一步不是直接建表，而是核查：

1. `/app/saveAppInfo` 是否把 `sceneData` 当不透明 JSON 保存；
2. 是否存在 DTO 白名单导致新字段被过滤；
3. `/app/queryAppAndNodeInfo` 如何从 `sceneData` 还原 `componentList`；
4. `/app/queryAppAndNodeInfo2` 是否走另一套发布态/缓存结构；
5. 历史版本是否保存原始 `sceneData`；
6. 复制、分享、审核、发布和回退是否重新序列化流程字段；
7. 数据库字段长度能否容纳版本和节点展示配置；
8. 发布缓存是否需要刷新 schema；
9. 后端是否会把字符串/数字 `nodeId` 强制转换；
10. 错误响应是否支持返回节点 ID 和错误码。

### 12.2 涉及接口

至少核查以下接口和对应服务链路：

| 接口 | 核查目标 |
| --- | --- |
| `/app/saveAppInfo` | 草稿、发布申请时保存版本和区域，发布时执行阻断校验 |
| `/app/queryAppAndNodeInfo` | 编辑/测试查询完整回读字段 |
| `/app/queryAppAndNodeInfo2` | 独立正式运行页完整回读字段 |
| `/app/queryAppInfoHistory` | 历史版本保留并能恢复新字段 |
| `/app/saveAppInfoForShare` | 分享/复制链路不丢字段 |
| 应用复制相关服务 | 保留区域，按产品既有规则处理应用关系 ID |
| 审核发布相关服务 | 发布态缓存、版本或 DTO 保留新字段 |

后端实际接口名如有分支或网关包装，以真实工程为准，但所有经过流程定义的数据链路都要覆盖。

### 12.3 后端校验

后端至少在发布阶段校验：

- `guidedSchemaVersion` 是支持版本；
- 节点 ID 非空且唯一；
- 区域值合法；
- Header/Footer 数量合法；
- Header 是唯一根并只有一个无条件业务后继；
- Footer 是唯一业务终点；
- 没有正常路径绕过 Footer；
- 父节点引用存在；
- `parentId` 和 `branchIndex` 数量匹配；
- 图中业务节点可达。

后端校验不能依赖前端传来的“校验已通过”标记。建议返回：

- 稳定错误码；
- 错误消息；
- `nodeId`；
- 可选 `relatedNodeId`；
- 可选字段路径。

前端用这些信息定位节点，不解析中文错误文案判断类型。

### 12.4 是否需要数据库变更

优先复用现有 `sceneData` JSON/CLOB 存储。如果当前后端完全透传且字段容量足够，可能不需要新增数据库列。

只有以下情况才增加表结构：

- 当前发布态把流程节点拆到结构化表且没有扩展字段；
- 历史版本需要独立记录 schema 版本；
- 查询性能要求后端按区域建立索引；
- 现有字段长度不足。

第一期不为了“看起来规范”提前拆新表。先保证所有保存、查询、历史和发布链路完整往返。

---

## 13. 文件级前端改造清单

下表是开发前建议清单。正式编码时若真实调用关系不同，应在 PR 中说明调整原因。

| 文件/目录 | 计划改动 |
| --- | --- |
| `src/shared/guidedProcess/` | 新增一期公共类型、归一化、图、校验和运行计划 |
| `processCanvasPageType.ts` | 引用公共类型，删除一期外字段作为正式契约的定义 |
| `config/processPresentation.ts` | 原型逻辑迁移到公共 schema，避免编辑器私有实现 |
| `hooks/useCanvas.ts` | 节点 ID 从毫秒值改为稳定 UUID；保留已加载 ID |
| `components/ProcessCanvas/index.tsx` | 区域配置、替换确认、复制降级、连线限制、全图校验、单数据源序列化 |
| `components/ProcessCanvas/index.less` | 区域标签、错误高亮和配置提示样式 |
| `src/stores/canvasPageStore.ts` | 区域动作历史类型、撤销重做、定义字段和临时状态边界 |
| `processCanvasPage/index.tsx` | 查询后版本归一化、节点区域合并、保存回读兼容 |
| `CanvasTop.tsx` | `guidedSchemaVersion` 写入、保存/发布校验调用、错误定位、正式数据清理 |
| `ProcessPage/ProcessPage.tsx` | 固定区状态、Header barrier、Content 起点、Footer 到达结束、手机号重启 |
| `ProcessPage/index.module.less` | Header/Content/Footer 页面壳布局和局部错误区 |
| `src/packages/utils/action.ts` | 保留旧入口并增加可等待的初始化动作执行能力 |
| `src/packages/NgapRender/NgapRender.tsx` | 必要时增加渲染上下文或固定区挂载信号，保持普通渲染兼容 |
| `src/packages/Layout/BottomBanner/*` | Footer 上下文容器模式，回归普通组装式页面 |
| `page/src/page/index.tsx` | 独立运行页完整 Header/Footer 状态和启动顺序 |
| `page/src/page/index.module.less` | 独立运行页等价页面壳布局 |
| `materials/utils/action.ts` | 同步可等待动作能力 |
| `materials/NgapRender/NgapRender.tsx` | 同步固定区渲染上下文/挂载信号 |
| `materials/Layout/BottomBanner/*` | 同步 Footer 容器行为 |
| `src/mock/guidedProcessMock.ts` | 改为 schema v1 测试数据，不作为生产逻辑依赖 |

不建议第一期直接把 `ProcessPage` 和 `page/src/page/index.tsx` 整体重写成一个大型共享 React 运行时。第一期先共享稳定纯逻辑和契约，宿主加载适配分别改造；待作用域和回滚模型稳定后，再评估更深的运行时统一。

---

## 14. 实施任务与顺序

### 14.1 任务依赖

```text
T1 原始基线与后端链路确认
  ↓
T2 数据契约和共享纯逻辑
  ├→ T3 编辑器与保存
  ├→ T4 Header 可等待初始化通道
  └→ T5 后端透传和发布校验
        ↓
T6 主 src 运行时
        ↓
T7 独立 page 运行时
        ↓
T8 BottomBanner 与布局回归
        ↓
T9 双入口联调、历史版本和发布验收
```

T3、T4、T5 可以在契约冻结后部分并行。T7 不应等到最后一天才开始，主运行时每完成一个关键语义就应同步验证独立入口。

### 14.2 任务拆分

| ID | 任务 | 负责人 | 前端人日 | 后端人日 | 产出/验收 |
| --- | --- | --- | ---: | ---: | --- |
| T1 | 原始基线、接口、历史和发布链路核查 | 前后端 | 3 | 2～3 | 基线差异表、后端链路图、字段透传结论 |
| T2 | schema v1、稳定 ID、共享图与校验器 | 前端 | 3～4 | 1 | 公共纯逻辑与单元测试，后端确认同语义 |
| T3 | 编辑器区域设置、替换、连线和保存校验 | 前端 | 5～6 | 0 | 编辑器验收场景通过 |
| T4 | Header 可等待初始化动作通道 | 前端 | 3～4 | 0 | 主/materials 兼容 API 和专项测试 |
| T5 | 保存、查询、历史、发布字段与后端校验 | 后端为主 | 1 | 2～4 | 完整往返、发布阻断和错误定位 |
| T6 | 主 `src` 固定区运行时和页面生命周期 | 前端 | 4～5 | 0～1 | Header barrier、Footer 固定、Content 正确启动 |
| T7 | 独立 `page` 等价运行时 | 前端 | 3～4 | 0～1 | 正式运行入口与主预览一致 |
| T8 | 页面布局、BottomBanner、普通页面回归 | 前端 | 1～2 | 0 | Footer 不遮挡、两套物料一致、普通页不回归 |
| T9 | 联调、缺陷修复、文档和验收 | 前后端 | 3～5 | 1 | 测试记录、已知限制、验收签字条件 |
| **合计** |  |  | **26～34** | **6～10** | 与六期规划的一期估算保持一致 |

Header 可等待动作引擎是一期当前最大的技术不确定项。第 4 周技术预研如果确认现有动作链无法在 3～4 人日内兼容改造，应立即重新评估一期排期，不能通过固定延时或削减独立 `page` 回归来维持原工期。

### 14.3 建议日历安排

按一名前端新人和一名后端开发安排：

| 周次 | 前端重点 | 后端重点 | 阶段出口 |
| --- | --- | --- | --- |
| 第 1 周 | 熟悉编辑器、保存、主预览、独立运行页；核对原型与 Repomix | 核查 sceneData、DTO、查询、历史、发布 | 基线和数据链路确认 |
| 第 2 周 | schema v1、稳定 ID、共享图与校验单测 | 确认接口结构、校验口径和错误格式 | 数据契约冻结 |
| 第 3 周 | 编辑器区域设置、替换和区域历史记录 | 保存/查询字段透传 | 编辑器基础闭环 |
| 第 4 周 | 连线限制、发布前全图校验；初始化 Promise 预研 | 发布校验和历史链路 | 可保存、可回读、可阻断 |
| 第 5 周 | 主 `src` Header/Footer 状态和页面布局 | 联调数据和问题修复 | 主预览核心流程通过 |
| 第 6 周 | 独立 `page` 同步、materials 同步 | 独立运行接口联调 | 双入口基本一致 |
| 第 7 周 | 异常、刷新、手机号、页签、BottomBanner 回归 | 历史/复制/发布回归 | 完整测试清单通过 |
| 第 8 周 | 缺陷修复、文档和试点流程 | 缺陷修复、上线准备 | 一期验收候选版本 |

如果第 4 周确认动作引擎需要大范围异步重构，增加 1～2 周专项开发和回归，不压缩双运行时测试时间。

---

## 15. 测试方案

### 15.1 测试基础设施

当前根工程没有正式的 `test` 脚本。第一期建议引入轻量单元测试能力，优先测试共享纯逻辑和动作完成语义。

建议：

- 使用 Vitest 作为 Vite 项目的单元测试工具；
- 共享图、schema 和校验器使用纯 Node 测试；
- 必要的 React 宿主行为使用 jsdom；
- 第一期不强制引入完整浏览器 E2E 平台，但必须保留人工双入口验收记录；
- 根工程和 `page` 构建都要执行；
- Repomix 缺失的二进制资源导致的环境问题与功能失败分开记录。

### 15.2 共享逻辑单元测试

至少覆盖：

1. 缺失区域默认 Content；
2. 非法区域默认 Content；
3. 缺失版本按 0；
4. 高版本拒绝运行；
5. 数字和字符串 ID 正常匹配；
6. 重复 ID 报错；
7. 无 Header/Footer 的普通线性流程；
8. 正确 Header 线性流程；
9. 两个 Header；
10. Header 不是根节点；
11. Header 多出线；
12. 正确 Footer 线性流程；
13. 多条分支汇合 Footer；
14. 存在路径绕过 Footer；
15. Footer 后还有业务节点；
16. 两个 Footer；
17. 孤立节点；
18. 非法父节点引用；
19. `parentId/branchIndex` 数量不一致；
20. 图中存在回路。

### 15.3 编辑器测试

- 新节点默认 Content；
- Header/Footer 设置和标签；
- 第二个特殊节点确认替换；
- 取消替换无数据变化；
- 复制特殊节点后是 Content；
- 删除、撤销、重做区域正确；
- 特殊节点组件配置不丢；
- 非法连线即时阻止；
- 草稿错误提示；
- 发布错误阻断并定位节点；
- 保存关闭重开区域和 ID 不变；
- 历史版本恢复后字段不丢。

### 15.4 运行时测试

- 无 Header/Footer 的普通流程行为不变；
- Header/Footer 同时存在；
- 只有 Header；
- 只有 Footer；
- Header 接口慢时 Content 不提前启动；
- Header 成功赋值后 Content 能读取全局变量；
- Header 接口失败时 Content 不启动；
- Footer 初始失败不导致正文白屏；
- Footer 启动即挂载；
- Content 到达 Footer 不重复挂载；
- Footer 按钮不推进流程；
- 多分支汇合 Footer；
- Header/Footer 不进入导航；
- 流程结束后固定区保留；
- Footer 高度变化不覆盖 Content；
- 普通组装式 BottomBanner 不变。

### 15.5 生命周期测试

- 浏览器刷新从 Header 重新开始；
- 手机号变化取消后页面不动；
- 手机号变化确认后旧运行失效并重启；
- 旧 Header 请求晚返回不能启动新运行的 Content；
- 切换其他页签再返回状态不变；
- 页面真正卸载后事件监听、定时器和组件引用清理。

### 15.6 双入口和后端往返测试

同一份流程定义分别验证：

```text
编辑器主预览
正式独立 page
```

并执行：

```text
保存草稿
→ 查询编辑态
→ 关闭重开
→ 提交发布
→ 查询发布态
→ 独立 page 运行
→ 查询历史版本
→ 恢复历史版本
→ 再次运行
```

每一步都比较：

- `guidedSchemaVersion`；
- `nodeId`；
- `presentation.region`；
- `parentId/branchIndex`；
- 组件配置；
- Header/Footer 运行行为。

---

## 16. 风险与控制

| 风险 | 影响 | 控制措施 |
| --- | --- | --- |
| 把本地原型误认为原始能力 | 漏估、漏测、后端未接入 | 所有设计以 Repomix 基线为准，原型逐项审查 |
| Header 没有真实完成信号 | Content 读取不到初始化数据 | 增加可等待动作通道，禁止固定延时 |
| 两套动作引擎语义不一致 | 主预览成功、正式页失败 | 主/materials 同步接口和测试用例 |
| 区域写入 componentData | 通用组件模板被节点配置污染 | 只在 componentList 节点实例正式保存 |
| 时间戳节点 ID 碰撞 | 引用、连线和后续作用域错乱 | 新节点改 UUID，旧 ID 原样保留，保存前查重 |
| 只做即时连线限制 | 导入、历史或异常数据绕过规则 | 保存/发布执行全图校验，后端再次校验 |
| Footer 仍依赖扁平数组 | 无法固定挂载，回切时被删 | 固定区和 Content 分开维护 |
| BottomBanner 改动影响普通页 | 组装式页面底栏回归 | 使用 Footer 上下文隔离，双物料库回归 |
| 后端 DTO 丢字段 | 编辑器保存后重开丢区域 | 保存、两种查询、历史、复制、发布逐链路往返测试 |
| 独立 page 最后才同步 | 联调后期集中暴露问题 | 第 2 周开始共用纯逻辑，第 5～6 周同步宿主 |
| 原型额外字段固化 | 一期范围失控 | v1 只认 region，其他字段不进入正式契约 |
| 手机号重启旧请求回写 | 新旧运行状态串联 | 最小 page `runId`，清理监听和旧启动结果 |

---

## 17. 开发完成门槛

满足以下全部条件才可认定一期完成：

### 17.1 数据

- 新流程保存 `guidedSchemaVersion=1`；
- 所有节点有稳定且唯一的 `nodeId`；
- 区域只保存在节点实例正式位置；
- 保存、查询、历史、复制和发布完整保留字段；
- 旧定义缺少字段时按 Content 兼容。

### 17.2 编辑器

- 三种区域配置可用；
- 唯一性替换流程正确；
- 连线限制和全图校验正确；
- 复制、删除、撤销重做正确；
- 发布错误可定位到节点或连线。

### 17.3 运行时

- Header 真正初始化完成后才启动 Content；
- Header 失败时 Content 不启动；
- Footer 页面启动即固定挂载；
- 到达 Footer 后自动结束且 Footer 不重挂；
- Header/Footer 不进入导航；
- 页面布局不覆盖正文；
- 生命周期规则符合需求。

### 17.4 双入口与回归

- 主 `src` 与独立 `page` 对同一流程表现一致；
- 主 `src/packages` 与 `materials` 动作/BottomBanner 行为一致；
- 普通无 Header/Footer 的引导式流程不回归；
- 普通组装式页面不回归；
- 至少一个真实简单流程完成端到端试点；
- 测试记录和已知限制文档齐全。

---

## 18. 开始编码前必须确认的事项

以下事项不需要重新讨论产品方案，但必须由开发人员在真实环境确认后记录结论：

1. 后端 `sceneData` 的实际保存和解析实现；
2. `/app/queryAppAndNodeInfo2` 与编辑态接口的数据差异；
3. 历史、复制、分享和发布链路是否存在字段白名单；
4. Header 页面级 `onLoad` 事件在真实组件数据中的存储位置；
5. 真实 Header 所需初始化动作类型，是否包含暂时不可等待的交互动作；
6. `handleActionFlow` 两套实现的所有异步出口；
7. Footer 中准备使用的真实按钮与 `BottomBanner` 组合；
8. 主预览和独立页当前部署使用的浏览器最低版本；
9. 根工程引入 Vitest 是否符合内外网依赖管理要求；
10. 试点流程的真实 Header、Content、Footer 组件和接口数据。

这些核查结论应补充到本文件或开发任务记录中。任何一项发现与本文假设冲突时，先修订技术方案和排期，再开始大范围编码。

---

## 19. 最终结论

一期不是单纯增加 Header/Footer 两个样式容器，而是一次小范围但完整的流程定义和运行时升级：

```text
稳定节点身份
+ 区域数据契约
+ 图校验
+ Header 初始化屏障
+ Footer 固定生命周期
+ 双运行入口一致
+ 后端完整往返
```

推荐按本文 T1～T9 顺序实施。首先冻结 schema v1 和 Header 可等待初始化方案，然后再同时推进编辑器、后端和双运行时。只有主预览、独立运行页、后端回读和普通页面回归全部通过，第一期才具备交付简单真实流程的条件。
