# 引导式四期路径回滚与运行时稳定性开发方案

## 1. 文档信息

| 项目 | 内容 |
| --- | --- |
| 文档名称 | 引导式四期路径回滚与运行时稳定性开发方案 |
| 文档性质 | 第四期开发实施方案，不代表已经修改业务代码 |
| 对应阶段 | 第四期：后续路径回滚与运行时稳定性 |
| 当前状态 | 待技术评审，尚未开始正式代码开发 |
| 前置阶段 | 第三期正式输出、诊断结果与动态分支已达到开发完成门槛 |
| 前端工程 | 当前 `ngap` 工作区，包含主 `src` 与独立 `page/materials` 两套运行入口 |
| 后端工程 | 当前工作区未提供，异步接口配合和幂等能力由后端在实际工程复核 |
| 分期规划 | `GUIDED_PROCESS_PHASE_PLAN(引导式流程分期实施规划).md` |
| 三期方案 | `GUIDED_PROCESS_PHASE3_TECHNICAL_PLAN(引导式三期正式输出诊断与动态分支开发方案).md` |
| 总体设计 | `GUIDED_PROCESS_REDESIGN(引导式流程展示编排升级设计).md` |
| 决策记录 | `GUIDED_PROCESS_PENDING_ITEMS(引导式待完善事项).md` |

第四期解决的不是“重新算一次条件”，而是第三期已经算出新结论后，如何安全地把旧后续路径整体作废并换成新路径。

第三期产生的 `BRANCH_RECONCILIATION_REQUIRED` 从本期开始由统一路径协调器正式接管。

```text
第三期：算对最新 value，并选出目标 transition
                         ↓
第四期：识别分歧点 → 失效旧执行 → 释放旧路径 → 恢复共享值
        → 原子更新有效轨迹 → 加载新路径 → 拒绝旧异步回写
```

---

## 2. 本期目标

第四期完成后应满足：

- 前序人工选择改变后，页面只保留当前仍成立的后续环节；
- 输出 value 未变化时不重复请求、不重复加载、不重复触发完成事件；
- 输出 value 变化时从真正分歧点清理旧后续路径；
- 被移除节点的组件、变量、表单、接口结果、正式输出、订阅和缓存全部释放；
- 旧路径未完成请求尽量取消，无法取消时也不能回写；
- 快速连续改选时只有最后一次有效意图能够完成换路；
- Header 和 Footer 在 Content 换路期间保持挂载；
- Footer 基于换路后的最新有效数据重新计算显隐和按钮状态；
- 平台对业务暴露只读的当前有效 Content 轨迹；
- `onNodeLoaded` 在固定时机、固定上下文中触发；
- 主预览和独立运行页使用同一回滚算法。

---

## 3. 已冻结规则

### 3.1 当前流程只有一条活动执行路径

运行期同一时刻只有一条当前有效路径。分支汇合不代表同时保留两条历史分支；已经失效的旧分支必须离开活动路径并释放运行数据。

### 3.2 activeContentPath 只表示当前最终态

- 仅包含已经加载且当前仍成立的 Content 节点；
- 按实际加载顺序排列；
- 不包含 Header、Footer、Control、开始和结束节点；
- 不包含曾经走过但已回滚的旧分支；
- 平台不保存历史轨迹，不提供业务日志；
- 业务模块可在现有事件中自行把当前快照提交到自己的接口。

### 3.3 Header/Footer 不随 Content 回滚

- Header 是场景启动前置区域，不在分支回滚中卸载；
- Footer 页面启动时固定挂载，不因当前路径尚未到达 Footer 而销毁；
- Footer 的依赖值在旧路径释放后重新解析；
- 旧分支提供的值失效时，Footer 应回到未赋值默认显隐状态；
- 新路径产生有效值后，Footer 再响应式更新。

### 3.4 生命周期规则

- 浏览器刷新：创建全新流程运行，从开始节点重新执行，不恢复旧运行态；
- 手机号变化：弹框确认后废弃整个旧运行，清空旧运行数据并按新手机号从开始节点重新渲染；
- 普通业务页签切到别处再切回来：不触发重置，保持当前运行状态；
- 当前不建设跨设备、跨浏览器或断点恢复。

### 3.5 重复操作规则

- 同一人工动作执行中，重复点击直接忽略或禁用；
- 相同有效 value 再次产生时视为 no-op；
- 不同 value 是有效改选，创建新的节点执行批次并启动换路；
- Footer 按钮使用动作锁，但仍只执行业务动作，不推进流程。

---

## 4. 本期范围边界

### 4.1 本期包含

- 运行实例、节点执行和动作执行三级身份；
- 分歧点与失效后缀计算；
- Content/Control 旧路径释放；
- 节点作用域、订阅、缓存和组件卸载；
- AbortController 接入和执行身份防旧写；
- 快速连续改选的 latest-intent-wins；
- 动作锁和重复请求保护；
- 共享变量写入来源追踪与旧路径写入撤销；
- activeContentPath 只读快照；
- `onNodeLoaded` 节点实例事件；
- 刷新、手机号变化、普通页签切换生命周期；
- 主 `src` 与独立 `page` 一致实现。

### 4.2 本期不包含

- 平台统一业务日志；
- 历史轨迹查询；
- 用户随意点击智能导航跳回任意历史节点；
- 浏览器刷新后恢复中断现场；
- 多页签并发编辑同一运行实例；
- 后端流程实例状态机；
- 通用接口重试、补偿和事务平台；
- 画布性能和方向切换；
- 第三期输出规则重新设计。

---

## 5. 运行身份模型

### 5.1 三级执行身份

```ts
interface GuidedExecutionIdentityV4 {
  processRunId: string;
  nodeExecutionId: string;
  actionExecutionId?: string;
}
```

- `processRunId`：一次页面运行。刷新或手机号确认变化后重新生成；
- `nodeExecutionId`：某节点在当前运行中的一次进入或重新执行；
- `actionExecutionId`：一次 change/click/confirm/footer click 动作链。

身份只用于运行期，不替代定义侧的 nodeId、outputId、transitionId。

### 5.2 有效性校验

任何异步回调写入前必须同时确认：

1. processRunId 仍为当前运行；
2. nodeExecutionId 仍属于活动执行路径；
3. actionExecutionId 仍为当前有效动作；
4. 目标节点作用域尚未 disposed；
5. 结果 revision 没有落后于当前结果。

任一条件不满足时静默拒绝状态回写；必要的资源清理仍执行。

### 5.3 运行批次

节点因前序改选重新进入时必须生成新 nodeExecutionId，即使 nodeId 相同。这样旧请求无法仅凭相同 nodeId 写入新一轮作用域。

---

## 6. 活动路径模型

### 6.1 内部执行路径

运行器内部维护完整活动执行路径：

```ts
interface ActiveExecutionPathItemV4 {
  sequence: number;
  nodeId: string;
  nodeExecutionId: string;
  region: 'content' | 'control';
  enteredByTransitionId?: string;
  outputRevision?: number;
}
```

内部路径包含 Content 和 Control，用于求分歧点与释放。Header/Footer 单独管理。

### 6.2 对外 Content 路径

```ts
interface ActiveContentPathItemV4 {
  sequence: number;
  nodeId: string;
  componentId: string;
  title: string;
  navigatorTitle?: string;
  interactionMode: 'manual' | 'automatic';
  output: Readonly<Record<string, unknown>>;
  diagnosis?: {
    value?: unknown;
    label?: string;
    status?: 'success' | 'failure';
  };
}
```

对外对象是不可变摘要，不暴露其他节点的 DOM、React state、私有变量或 API 原始对象。

### 6.3 唯一事实来源

- `activeExecutionPath` 是运行器内部路径事实；
- `activeContentPath` 由内部路径和节点正式结果投影得出；
- 智能导航由 activeContentPath 投影；
- 页面不能再分别维护 allRenderElements、导航节点和业务轨迹三份互不一致的事实。

---

## 7. 分支换路算法

### 7.1 触发条件

第三期产生 `NODE_DECISION_CHANGED` 后：

- value 与上次相同：结束，不换路；
- value 不同但尚未进入任何后继：按新 transition 首次推进；
- value 不同且已经进入后继：发起路径协调；
- 当前结果变为 unresolved/invalid：撤销该节点之后的全部路径，并停留当前节点。

### 7.2 分歧点

标准场景下，发生改选的当前节点就是分歧点。运行器保留：

- 分歧节点本身；
- 分歧节点之前的稳定前缀；
- Header/Footer 固定区域。

从分歧节点的第一个后继开始全部属于待释放旧后缀。即使新旧分支稍后汇合，也不能直接复用旧汇合节点的运行实例，因为它的输入、全局依赖和执行批次可能已经不同。

### 7.3 原子换路步骤

```text
接收新的 route intent
→ 锁定当前源节点推进动作
→ 生成新的协调版本 routeRevision
→ 标记旧后缀 nodeExecutionId 全部失效
→ 取消旧异步动作
→ 逆序 dispose 旧后缀
→ 撤销旧后缀对共享变量的有效写入
→ 一次性提交新的活动前缀
→ 重新计算 Footer 与导航
→ 从新 transition 加载后继
→ 自动连续执行，直到人工节点/Footer/结束/错误
```

旧路径释放和活动前缀提交必须由同一协调器串行完成，不能由各节点自行 slice 数组。

### 7.4 快速连续改选

例如用户快速选择 8 → 28 → 58：

- 每个不同 value 生成递增 routeRevision；
- 正在进行的较早协调可继续做必要清理，但不得提交新节点；
- 只有最新 routeRevision 可以加载和提交后续路径；
- 同一节点在协调中暂时禁用相关推进交互；
- 最终只存在 58 对应路径。

---

## 8. 节点释放协议

### 8.1 dispose 顺序

旧后缀按路径逆序释放，先子节点、后父节点：

1. 标记执行身份失效；
2. 触发组件卸载；
3. 中止可取消异步请求；
4. 注销变量、表单、API、输出订阅；
5. 清除定时器、观察器和事件监听；
6. 释放组件详情缓存和临时资源；
7. 清除 variables/formData/apiData/outputs/formalResult；
8. 从内部执行路径和导航投影移除。

### 8.2 统一 API

二期 `disposeNodeScope(nodeId)` 在本期扩展为执行实例级释放：

```ts
disposeNodeExecution({
  processRunId,
  nodeId,
  nodeExecutionId,
  reason: 'branch-change' | 'run-reset' | 'technical-error'
});
```

不能只按 nodeId 清理，因为同一 nodeId 可能已经开始新的执行批次。

### 8.3 Control 节点

Control 不渲染 DOM，但仍拥有执行身份、变量、API 结果、输出和订阅。它必须加入内部路径并在回滚时释放，只是不进入 activeContentPath。

---

## 9. 异步取消与旧结果隔离

### 9.1 双保险策略

- 能使用 AbortController 的请求主动 abort；
- 不能取消或服务端已经执行的请求，通过执行身份拒绝回写；
- 平台不承诺通过前端 abort 撤销已经发生的后端业务副作用；
- 有副作用的接口幂等、防重和补偿由对应业务后端保证。

### 9.2 动作注册表

每个 nodeExecutionId 维护资源注册表：

```text
pendingRequests
pendingPromises
timers
subscriptions
observers
cleanupCallbacks
```

节点动作必须通过 Runtime 注册资源；绕过 Runtime 创建且无法追踪的异步任务，发布检查给出警告或由组件接入规范约束。

### 9.3 技术错误

新路径加载中出现接口或脚本技术错误时：

- 当前错误节点进入 error；
- 停止自动推进；
- 已释放旧路径不自动复活；
- 页面保留分歧点到当前错误节点的有效新前缀；
- 提供明确错误信息，由用户重新操作或业务已有重试动作处理。

---

## 10. 动作锁与防重复

### 10.1 锁粒度

动作锁按 `nodeExecutionId + actionKey` 管理：

- 同一按钮/点选动作执行中拒绝重复；
- 不同无冲突动作可按组件设计并行；
- 节点进入路径协调时锁定所有可能触发推进的动作；
- 动作完成、失败、取消或节点释放时必须解锁。

### 10.2 结果去重

第三期正式结果的 decision value 和 revision 是防重复依据：

- 相同 value、相同有效结果：不重新推进；
- label 或诊断明细变化：只刷新导航；
- 不同 value：换路；
- 有效变无效：清后缀并等待；
- 无效变有效：重新推进。

### 10.3 Footer

Footer 按钮使用相同动作锁和 actionExecutionId，但不生成 transition，也不改变 activeContentPath。换路时 Footer 保持挂载，按钮依赖重新计算。

---

## 11. 共享变量回滚

### 11.1 为什么不能直接删除

旧路径节点可能给流程全局变量赋值，Footer 或后续节点正在读取。释放旧节点时既不能让旧值残留，也不能粗暴删除仍由 Header 或稳定前缀提供的值。

### 11.2 写入来源记录

每次运行期全局变量赋值记录：

```ts
interface SharedValueAssignmentV4 {
  globalVariableId: string;
  value: unknown;
  processRunId: string;
  sourceNodeId?: string;
  sourceNodeExecutionId?: string;
  actionExecutionId?: string;
  sequence: number;
}
```

### 11.3 撤销规则

旧后缀释放时：

1. 移除由失效 nodeExecutionId 产生的有效赋值；
2. 找到仍有效的最近一次赋值；
3. 若存在则恢复该值；
4. 若不存在则恢复流程定义默认值或未赋值状态；
5. 精确通知 Footer 和显式依赖者重新计算。

持久化到业务后端的结果不由平台自动撤销；本机制只管理当前前端流程运行内存。

---

## 12. onNodeLoaded 事件

### 12.1 固定触发时机

`onNodeLoaded` 表示：

- 节点必要接口和初始化逻辑已经完成；
- 数据已经写入当前节点域；
- 组件已经具备展示条件；
- 当前 Content 已进入 activeContentPath；
- 自动 Content/Control 尚未开始分支推进；
- 人工 Content 即将进入等待交互。

初始化失败的节点不触发 onNodeLoaded，进入技术错误。

### 12.2 事件上下文

```ts
interface GuidedNodeLifecycleContextV4 {
  nodeId: string;
  nodeExecutionId: string;
  region: 'header' | 'content' | 'footer' | 'control';
  variables: Readonly<Record<string, unknown>>;
  formData: Readonly<Record<string, unknown>>;
  apiData: Readonly<Record<string, unknown>>;
  output: Readonly<Record<string, unknown>>;
  shared: Readonly<Record<string, unknown>>;
  process: {
    activeContentPath: ReadonlyArray<ActiveContentPathItemV4>;
  };
}
```

### 12.3 触发次数

- 每个 nodeExecutionId 成功加载后触发一次；
- 相同 value no-op 不重复触发；
- 回滚后同一 nodeId 重新进入并生成新 nodeExecutionId，可再次触发；
- Header/Footer 在一次 processRunId 内各完成初始化时触发一次；
- 事件只是普通可配置动作，不包含业务日志语义。

---

## 13. 整体运行重置

### 13.1 浏览器刷新

刷新后不读取旧 Runtime 快照。页面按流程定义重新创建 processRunId，并依次初始化 Header、Footer、Content。

### 13.2 手机号变化

```text
监听到手机号变化
→ 弹框说明将重新加载当前场景
→ 用户取消：保持旧运行
→ 用户确认：失效旧 processRunId
→ 取消/隔离全部旧异步
→ 逆序释放全部 Content/Control
→ 清理 Header/Footer 运行数据并重新初始化
→ 清理流程全局运行值
→ 使用新手机号从开始节点执行
```

确认期间页面进入整体 resetting 状态，避免旧动作继续提交。

### 13.3 普通页签切换

切换业务页签不生成重置事件。运行 Store 必须位于不会因 Content 页签暂时隐藏而销毁的位置；如果现有宿主会卸载页面，需要在宿主层保持该场景 Runtime，返回时重新挂载视图而不是创建新运行。

---

## 14. Schema 与后端要求

### 14.1 Schema V4

建议本期定义 `guidedSchemaVersion = 4`，新增定义侧配置仅包括：

- 节点实例 `onNodeLoaded` 事件动作；
- 可选的动作锁/推进动作标识；
- 必要的运行策略默认项。

processRunId、nodeExecutionId、activeContentPath 和运行数据不保存回流程定义。

### 14.2 后端配合

后端主要工作：

- 保存、查询、历史和复制 onNodeLoaded 配置；
- 确认接口调用适配器能够传递 AbortSignal（可支持时）；
- 对有副作用的试点接口确认已有幂等/防重策略；
- 联调手机号变化后的请求上下文；
- 不新增统一业务日志接口；
- 不保存 activeContentPath 历史。

---

## 15. 双运行时实现要求

以下逻辑必须共享：

- 执行身份生成和校验；
- activeExecutionPath / activeContentPath；
- 分歧点和旧后缀计算；
- 路径协调器；
- dispose 协议；
- 动作锁；
- 异步资源注册与旧写拒绝；
- 共享变量来源撤销；
- onNodeLoaded 时序；
- 整体运行重置。

主 `src` 与独立 `page` 只保留宿主路由、用户信息、接口客户端和 UI 挂载差异。

---

## 16. 开发任务与预计时间

估算口径：一名前端、一名后端，均按新进入项目、不熟悉两套运行时估算；包含联调、测试和文档，不包含等待业务接口整改时间。

| 任务 | 主要内容 | 前端人日 | 后端人日 |
| --- | --- | ---: | ---: |
| P4-T1 现状核查与运行协议 | 核对数组截断、节点加载、异步动作、页签宿主；冻结 v4 状态与事件 | 2～3 | 1 |
| P4-T2 执行身份与动作锁 | process/node/action execution ID、有效性校验、重复点击、Footer 锁 | 3～4 | 1～2 |
| P4-T3 活动路径与分歧计算 | 内部执行路径、Content 投影、transition 路径、失效后缀 | 4～5 | 1 |
| P4-T4 节点释放与异步隔离 | 逆序 dispose、订阅/缓存清理、AbortSignal、latest-wins | 4～6 | 1～2 |
| P4-T5 原子换路和连续执行 | 协调器、共享变量撤销、新分支加载、错误中止 | 4～5 | 1 |
| P4-T6 activeContentPath/onNodeLoaded | 只读轨迹、事件时机、上下文、业务动作接入 | 2～3 | 1 |
| P4-T7 生命周期与双入口 | 刷新、手机号变化、页签切换、主 src/page 一致适配 | 3～4 | 0～1 |
| P4-T8 测试修复和文档 | 快速改选、异步竞态、内存释放、回归和接入说明 | 2～3 | 0～1 |
| **合计** |  | **24～33** | **6～10** |

建议日历周期 **6～9 周**。前 2 周冻结运行协议和身份体系；第 3～5 周完成路径协调及释放；第 5～7 周完成生命周期和双入口；最后 1～2 周用于竞态、泄漏和试点回归。

---

## 17. 测试方案

### 17.1 分支改选

- 8 → 28 → 49以上连续改选；
- 相同结果重复 change 不重复请求；
- value 不变、label 变化只更新导航；
- valid → invalid 清除后缀并停留；
- invalid → valid 重新加载；
- 分支稍后汇合时仍创建新的汇合节点执行批次。

### 17.2 异步竞态

- 旧接口晚于新接口返回；
- 请求不支持 abort 但旧写被拒绝；
- 快速三次改选只有最后路径提交；
- 旧 onNodeLoaded 动作晚返回不污染新路径；
- 手机号变化后所有旧 processRunId 回写失效。

### 17.3 资源释放

- variables/formData/apiData/outputs/formalResult 清空；
- 订阅数恢复；
- 定时器、观察器、事件监听解除；
- 组件卸载回调触发；
- Control 节点资源释放；
- 重复换路后堆内存不持续增长。

### 17.4 轨迹和事件

- onNodeLoaded 时当前 Content 已在轨迹中；
- 自动节点在分支前触发；
- 人工节点在等待交互前触发；
- 初始化失败不触发；
- 回滚后旧节点从轨迹消失；
- Header/Footer/Control 不进入 activeContentPath；
- 平台不产生业务日志。

### 17.5 生命周期

- 浏览器刷新从头执行；
- 手机号变化取消弹框保持不动；
- 确认变化后旧运行完全失效并从头执行；
- 普通页签切出切回保持现状；
- Header/Footer 换路期间保持挂载；
- Footer 旧依赖值撤销、新值生效。

---

## 18. 验收标准

- [ ] activeContentPath 始终是当前有效最终态；
- [ ] 旧路径 Content/Control、节点域和订阅无残留；
- [ ] 旧异步结果无法覆盖新状态；
- [ ] 相同结果不重复推进；
- [ ] 快速连续改选只保留最后路径；
- [ ] 全局变量旧路径写入能正确撤销或恢复稳定来源；
- [ ] Header/Footer 不随换路卸载；
- [ ] Footer 基于最新有效值重新计算；
- [ ] onNodeLoaded 时机和上下文符合冻结定义；
- [ ] 刷新、手机号变化和普通页签切换行为正确；
- [ ] 主 src 和独立 page 结果一致；
- [ ] 降档示例完成 8 → 28 → 49以上回归；
- [ ] 没有引入平台业务日志或运行快照恢复。

---

## 19. 开发完成门槛

1. v4 运行身份、路径和事件协议完成评审；
2. 第三期协调事件已由统一路径协调器接管；
3. dispose 和异步旧写保护均有自动化测试；
4. activeContentPath 与智能导航使用同一事实来源；
5. onNodeLoaded 在主 src/page 中时序一致；
6. 手机号变化整体重置通过；
7. 页签切换保持状态通过；
8. Header/Footer 和普通组装式页面回归通过；
9. 多次换路无明显订阅或内存持续增长；
10. 前端、后端和试点配置开发共同验收。
