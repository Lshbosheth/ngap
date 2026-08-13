# 引导式开发契约总表

## 1. 文档用途

本文件汇总引导式第一至第六期已经冻结的跨期开发契约，供前端、后端、组件开发和测试快速查阅。它不替代各期详细方案；发生细节争议时按以下优先级处理：

1. 已冻结产品结论；
2. 当前阶段详细开发方案；
3. 本契约总表；
4. 旧代码现状。

本文件中的 TypeScript 是协议示意，不代表代码已经实现，也不要求后端使用相同语言。

---

## 2. 阶段与 Schema 版本

开发阶段不等于必须新增 Schema。当前建议如下：

| 开发阶段 | 定义版本 | 主要新增定义 |
| --- | ---: | --- |
| 一期 Header/Footer | v1 | 稳定 nodeId、presentation.region、基础 processConfig |
| 二期组件作用域与引用 | v2 | variableId、globalVariableId、结构化引用、节点实例数据定义 |
| 三期正式输出与分支 | v3 | outputId、输出映射、诊断、完成策略、transitionId |
| 四期路径回滚 | v4 | onNodeLoaded 等少量实例配置；多数新增内容为运行态，不写定义 |
| 五期画布体验 | v5 | layoutDirection、轻量拓扑保存适配 |
| 六期整体验收 | 仍为 v5 | 不新增大范围定义，只验收最终协议 |

版本规则：

- 缺失版本按 v0 读取；
- 读取旧版本后由共享迁移器逐级升级内存模型；
- 保存时写当前编辑器正式支持版本；
- 运行端遇到高于自身支持版本时阻止运行并提示升级；
- 主 src 和独立 page 使用同一迁移逻辑；
- 运行值、执行 ID 和活动路径不得写回流程定义。

---

## 3. 核心对象和身份

| 名称 | 所属 | 稳定性 | 用途 | 禁止用途 |
| --- | --- | --- | --- | --- |
| componentId | 组件模板定义 | 稳定 | 标识可复用通用组件 | 区分同一流程内多个实例 |
| nodeId | 流程定义 | 稳定 | 标识流程节点实例 | 表示某次运行 |
| variableId | 组件模板 | 稳定 | 标识组件变量定义 | 使用变量名称替代 |
| globalVariableId | 流程定义 | 稳定 | 标识流程显式全局变量 | 隐式合并所有组件变量 |
| outputId | 组件输出定义 | 稳定 | 标识正式输出槽位 | 使用 title/key 作为引用主键 |
| transitionId | 流程定义 | 稳定 | 标识一条出口/连线语义 | 使用 branchIndex 作为最终身份 |
| processRunId | 运行态 | 每次页面运行生成 | 隔离刷新/号码变化前后的运行 | 保存进 sceneData |
| nodeExecutionId | 运行态 | 每次节点进入生成 | 隔离同一 nodeId 多次执行 | 等同 nodeId |
| actionExecutionId | 运行态 | 每次有效动作生成 | 防重复和旧动作写入 | 作为业务流水号 |

复制规则：

- 复制组件模板：生成新 componentId，并为新定义生成相应稳定 ID；
- 流程中复用组件模板：componentId 相同，nodeId 不同；
- 复制流程节点：生成新 nodeId，复制实例配置作为初始值；
- 同一模板定义中的 variableId/outputId 可被实例复用，但运行地址始终包含 nodeId；
- 分支新建生成 transitionId，重排不重建 transitionId。

---

## 4. 节点区域契约

```ts
type GuidedNodeRegion = 'header' | 'content' | 'footer' | 'control';
```

| 区域 | 数量/拓扑 | 是否渲染 | 是否进智能导航 | 运行语义 |
| --- | --- | --- | --- | --- |
| header | 0或1；有时开始节点唯一后继 | 是，顶部固定 | 否 | 先完成初始化再允许 Content |
| content | 多个 | 是，正文活动路径 | 是 | 人工等待或自动推进 |
| footer | 0或1；之后只有唯一结束节点 | 是，底部固定 | 否 | 页面启动即挂载；按钮不推进流程 |
| control | 多个 | 否 | 否 | 可执行动作、产生输出并静默推进 |

规则：

- 普通节点缺省 region 为 content；
- presentation 属于节点实例，不属于组件模板；
- Header/Footer 固定挂载，不随 Content 分支回滚；
- 所有合法路径最终到唯一结束节点；
- 有 Footer 时，所有活动 Content 路径先到 Footer，再到结束。

---

## 5. 定义态、运行态和业务数据边界

```text
流程定义：节点、连线、变量定义、输出定义、绑定、事件配置
组件定义：元素结构、变量/输出能力、可配置接口能力
运行状态：节点变量值、表单值、API结果、正式结果、执行身份、活动路径
业务持久数据：业务接口自行写入的数据和业务日志
```

原则：

- sceneData 保存定义，不保存运行值；
- 组件内部变量默认属于节点实例；
- 全局变量必须在流程中显式声明；
- 其他节点不直接读取 React state 或 DOM；
- 平台不保存业务日志和历史办理轨迹；
- activeContentPath 只是当前有效最终态快照。

---

## 6. 组件变量与流程全局变量

### 6.1 组件变量

```ts
interface ComponentVariableDefinition {
  variableId: string;
  key: string;
  title: string;
  dataType: string;
  defaultValue?: unknown;
}
```

- 当前组件直接读写自身变量；
- 运行地址为 nodeId + variableId；
- 同一组件模板使用多次不会串值；
- 变量改名不改变 variableId；
- 删除和改类型前查询所有引用；
- 其他节点原则上读取正式输出，不读取私有组件变量。

### 6.2 全局变量

```ts
interface GuidedGlobalVariableDefinition {
  globalVariableId: string;
  key: string;
  title: string;
  dataType: string;
  defaultValue?: unknown;
}
```

- 组件可读取显式全局变量；
- 修改必须使用明确赋值动作或 Runtime API；
- 同名组件变量和全局变量不自动同步；
- Header 可把公共数据写入全局变量；
- Footer 和 Content 可按结构化引用读取；
- 四期按写入来源撤销失效路径产生的全局赋值。

---

## 7. 结构化引用

```ts
type GuidedDataReference =
  | { kind: 'node-variable'; nodeId: string; variableId: string; path?: Array<string | number> }
  | { kind: 'global-variable'; globalVariableId: string; path?: Array<string | number> }
  | { kind: 'node-form-field'; nodeId: string; formId: string; fieldId: string; path?: Array<string | number> }
  | { kind: 'node-api-result'; nodeId: string; apiId: string; path?: Array<string | number> }
  | { kind: 'node-output'; nodeId: string; outputId: string; path?: Array<string | number> }
  | { kind: 'system'; key: string; path?: Array<string | number> }
  | { kind: 'constant'; value: unknown };
```

读写规则：

- 当前节点可读写自身变量、表单和 API 数据；
- 当前节点可通过明确动作写全局变量；
- 跨节点正式标准读取使用 node-output；
- 其他节点的内部变量、表单和 API 结果不作为新流程公共契约；
- 脚本动作需保存结构化 reads/writes，便于引用校验；
- path 使用数组，不保存点号字符串；
- 编辑器显示可读名称，持久化保存稳定 ID。

引用删除/修改必须区分：

- 阻断：来源不存在、类型不兼容、必需值在路径上不可达、循环不可求值；
- 警告：允许空值、多个条件写入、无消费者等。

---

## 8. 节点作用域

```ts
interface NodeRuntimeScope {
  nodeId: string;
  componentId: string;
  lifecycle: 'created' | 'mounted' | 'disposed';
  variables: Record<string, unknown>;
  formData: Record<string, Record<string, unknown>>;
  apiData: Record<string, unknown>;
  outputs: Record<string, unknown>;
  formalResult?: NodeFormalResult;
  outputRevision: number;
}
```

- 每个 nodeId 一份作用域；
- Control 虽无 DOM，仍有节点作用域；
- Header/Footer 各有独立作用域；
- dispose 后所有写入拒绝；
- 普通组装式页面继续使用旧 page scope；
- 引导式兼容投影只为旧动作生成，不再成为新主数据。

---

## 9. 正式输出

### 9.1 输出定义

```ts
interface GuidedOutputDefinition {
  outputId: string;
  key: string;
  title: string;
  dataType: 'string' | 'number' | 'boolean' | 'object' | 'array';
  requiredForResult?: boolean;
  description?: string;
}
```

### 9.2 输出映射

```ts
interface GuidedOutputMapping {
  outputId: string;
  source: GuidedDataReference;
  emptyPolicy?: 'unresolved' | 'allow-null';
}
```

组件内部负责复杂计算，标准路径是：

```text
控件 change
→ 更新绑定值
→ 事件脚本更新组件变量
→ 动作链完成后原子投影正式输出
→ 校验正式结果
→ 展示诊断并选择分支
```

平台当前不要求自动追踪任意脚本依赖；所有影响结果的控件事件需调用统一重算动作。

---

## 10. value、label 和诊断

```ts
interface GuidedDecisionResult {
  value: string | number | boolean;
  label?: string;
}

type BusinessDiagnosisStatus = 'success' | 'failure';

interface GuidedDiagnosisResult {
  status?: BusinessDiagnosisStatus;
  items: Array<{ itemId: string; label: string; value?: unknown }>;
}
```

- value 是稳定机器结果，用于分支；
- label 是可读结果，用于导航；
- 诊断可展示多条内容，不与单一 value 绑死；
- label/诊断变化但 value 不变，不换路；
- 自动节点的 success/failure 来自组件或接口明确状态字段；
- 平台不根据列表长度自行推断状态；
- 人工节点默认不强制红绿；
- 技术错误与业务 failure 分开。

---

## 11. 人工/自动和完成策略

```ts
type GuidedInteractionMode = 'manual' | 'automatic';

type GuidedCompletionPolicy =
  | { mode: 'output-valid' }
  | { mode: 'component-signal'; signalKey: string }
  | { mode: 'automatic-actions-complete' };
```

- output-valid：简单 change 或多字段结果有效后自动推进；
- component-signal：需要明确确认/校验动作时使用；
- automatic-actions-complete：自动节点等待声明动作完成后推进；
- 自动节点连续静默执行，遇人工、Footer、结束或技术错误停止；
- 自动节点唯一无条件出口时不强制输出 decision；
- 组件不能直接指定 nextNodeId。

---

## 12. 正式结果状态

```ts
type FormalResultValidity = 'unresolved' | 'valid' | 'invalid';

interface NodeFormalResult {
  nodeId: string;
  revision: number;
  validity: FormalResultValidity;
  values: Record<string, unknown>;
  decision?: GuidedDecisionResult;
  diagnosis?: GuidedDiagnosisResult;
  generatedAt: number;
}
```

| 状态 | 含义 | 是否推进 |
| --- | --- | --- |
| unresolved | 必填来源尚未齐全 | 否 |
| invalid | 校验失败 | 否 |
| valid | 正式结果成立 | 按完成策略 |

同一事件动作链结束后只发布一次原子快照；完全相同结果不增加有效推进。

---

## 13. 分支契约

```ts
interface GuidedTransition {
  transitionId: string;
  title: string;
  sourceNodeId: string;
  targetNodeId: string;
  condition?: {
    outputId: string;
    operator: 'eq' | 'in' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte';
    expectedValue: unknown;
  };
  isDefault: boolean;
  order: number;
}
```

优先使用稳定业务码 + eq/in。一次求值：

- 命中一个：选择；
- 命中零个：使用唯一默认；
- 零个且无默认：`NO_MATCHED_TRANSITION`；
- 命中多个：`MULTIPLE_MATCHED_TRANSITIONS`；
- order 不用于掩盖重叠；
- 至多一个默认分支；
- branchIndex 只作兼容，transitionId 是正式身份。

---

## 14. 执行身份、回滚和异步

```ts
interface GuidedExecutionIdentity {
  processRunId: string;
  nodeExecutionId: string;
  actionExecutionId?: string;
}
```

写入前验证运行、节点执行、动作执行、作用域和 revision 均仍有效。

分支 value 改变后的标准步骤：

```text
生成新 route intent
→ 失效旧后缀执行身份
→ 取消可取消请求
→ 逆序 dispose 旧 Content/Control
→ 撤销旧路径全局变量赋值
→ 原子提交活动前缀
→ 加载最新分支
```

- 相同 value 为 no-op；
- 快速连续改选只有最后意图能提交新路径；
- AbortController 与执行身份校验同时使用；
- 前端 abort 不代表撤销后端已发生副作用；
- 接口幂等由业务后端保证。

---

## 15. activeContentPath

```ts
interface ActiveContentPathItem {
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

- 只含当前有效 Content；
- 不含 Header/Footer/Control 和旧路径；
- 智能导航由它投影；
- 事件上下文只读；
- 平台不保存其历史；
- activeExecutionPath 是内部完整执行路径，包含 Control。

---

## 16. onNodeLoaded

触发条件：必要初始化/接口完成、数据写入节点域、组件具备展示条件后。

- 当前 Content 已加入 activeContentPath；
- 自动 Content/Control 尚未评估下一分支；
- 人工 Content 即将等待用户；
- Header 尚未放行 Content；
- Footer 首次初始化完成；
- 初始化失败不触发；
- 每个 nodeExecutionId 触发一次；
- 同一 nodeId 重新执行可再次触发；
- 它是普通事件，不等于业务日志事件。

---

## 17. 页面生命周期

| 事件 | 规则 |
| --- | --- |
| 浏览器刷新 | 不恢复运行态，从开始节点创建新 processRunId |
| 手机号变化并取消 | 当前运行不动 |
| 手机号变化并确认 | 失效旧运行，清空并用新号码从头执行 |
| 普通页签切出切回 | 保持当前运行，不重新进入 |
| Content 分支改选 | Header/Footer 保持挂载，只替换失效后续路径 |

---

## 18. 画布呈现契约

```ts
type GuidedLayoutDirection = 'horizontal' | 'vertical';
```

- 缺省 horizontal；
- horizontal 左入右出；
- vertical 上入下出；
- 方向只影响连接点、线路由、箭头和文字；
- 不改变节点坐标、拓扑、transitionId、条件和执行语义；
- 第一版不自动布局；
- 画布 Store 使用轻量节点/边摘要，不携带完整 componentData。

---

## 19. 错误分类

| 分类 | 典型错误 | 处理 |
| --- | --- | --- |
| 配置阻断 | 引用失效、类型不兼容、区域/拓扑错误、重复默认 | 阻止发布，定位配置 |
| 分支运行错误 | NO_MATCHED_TRANSITION、MULTIPLE_MATCHED_TRANSITIONS | 停止推进 |
| 技术运行错误 | 接口、脚本、非法 status | 停止推进，显示技术错误 |
| 业务诊断 | success/failure | 导航展示，可继续按配置分支 |
| 人工校验 | unresolved/invalid | 停留当前节点 |
| 竞态废弃 | 旧 execution 回写 | 静默拒绝，不作为用户错误 |

建议统一错误码至少包含：

```text
UNSUPPORTED_GUIDED_SCHEMA_VERSION
INVALID_NODE_REGION_TOPOLOGY
BROKEN_DATA_REFERENCE
REFERENCE_TYPE_MISMATCH
REQUIRED_VALUE_UNREACHABLE
INVALID_OUTPUT_MAPPING
INVALID_DIAGNOSIS_STATUS
NO_MATCHED_TRANSITION
MULTIPLE_MATCHED_TRANSITIONS
NODE_INITIALIZATION_FAILED
NODE_ACTION_FAILED
STALE_EXECUTION_WRITE_REJECTED（测试/诊断使用）
```

具体错误码名称在编码前可统一调整，但主 src、独立 page 和后端发布校验必须共享含义。

---

## 20. 持久化与非持久化总表

| 数据 | 流程定义 | 组件定义 | 仅运行内存 |
| --- | ---: | ---: | ---: |
| guidedSchemaVersion | 是 | 否 | 否 |
| nodeId/presentation/transition | 是 | 否 | 否 |
| componentId | 引用 | 是 | 否 |
| variableId/outputId 定义 | 实例映射/引用 | 是 | 否 |
| 全局变量定义 | 是 | 否 | 否 |
| 结构化绑定 | 是 | 部分模板内部 | 否 |
| onNodeLoaded 动作配置 | 是 | 否 | 否 |
| layoutDirection | 是 | 否 | 否 |
| variables/formData/apiData 值 | 否 | 否 | 是 |
| formalResult/diagnosis 结果 | 否 | 否 | 是 |
| process/node/action execution ID | 否 | 否 | 是 |
| activeContentPath | 否 | 否 | 是 |
| 业务日志 | 否 | 否 | 由业务系统决定 |

---

## 21. 双入口共同约束

必须共享：Schema 迁移、图校验、引用解析、节点作用域、输出投影、诊断、完成策略、分支求值、路径回滚、执行身份、activeContentPath 和错误码。

允许宿主差异：路由、用户信息、请求客户端、DOM 壳和部署方式。

任何一期都不能以“主预览已完成”作为完成结论；独立 page 必须同一期通过。

---

## 22. 明确不属于本轮的能力

- 平台统一业务日志；
- 表达式沙箱和全项目安全治理；
- 敏感字段和统一权限；
- 浏览器刷新断点恢复；
- 多页签并发冲突；
- 移动端和无障碍；
- 自动布局；
- 流程调试器和自然语言配置；
- 自定义元素 v2 改造；
- 画布库未经过基准即整体替换。
