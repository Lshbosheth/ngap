# 引导式前后端接口与数据契约

## 1. 文档定位

本文件用于引导式改造的前后端技术评审和联调。它冻结数据语义、接口职责和字段往返要求，不凭当前前端代码虚构后端最终 URL、数据库表名或 Java DTO 名称。

当前工作区已确认的前端调用包括：

```text
POST /app/saveAppInfo
POST /app/queryAppAndNodeInfo
POST /app/queryAppAndNodeInfo2
POST /app/queryAppInfoHistory
POST /app/delAppInfoHistory
```

实际后端可继续复用这些接口，也可拆分新接口；只要本文规定的语义、校验和字段往返成立。

---

## 2. 共同原则

1. 流程定义和运行状态严格分离；
2. sceneData 可以继续作为定义主载体；
3. 后端不得在 DTO 转换中丢失未知的新字段；
4. 稳定 ID 保存后不得重建；
5. 草稿允许不完整，发布必须强校验；
6. 主预览和独立 page 获取到同一语义的已发布定义；
7. 引用索引是可重建派生数据，不替代 sceneData；
8. 平台不新增统一业务日志接口；
9. activeContentPath、执行 ID、表单值和 API 运行结果不保存进定义；
10. 有副作用业务接口的幂等、防重和补偿仍由各业务后端负责。

---

## 3. 流程定义外层

当前 `/app/saveAppInfo` 外层保留现有应用字段，`sceneData` 继续为 JSON 字符串或等价 JSON 对象。引导式正式结构建议：

```ts
interface GuidedSceneDataV5 {
  guidedSchemaVersion: 5;
  processConfig: GuidedProcessConfig;
  sharedVariables: GuidedGlobalVariableDefinition[];
  componentList: GuidedNodeDefinition[];
}
```

如果后端当前把 sceneData 拆开存储或返回，接口外形可以不同，但重组后的语义必须等价。

### 3.1 processConfig

```ts
interface GuidedProcessConfig {
  presentation?: {
    layoutDirection?: 'horizontal' | 'vertical';
  };
  // 保留既有导航、页面布局等已确认流程级配置
}
```

未配置 layoutDirection 时按 horizontal。

### 3.2 节点定义

```ts
interface GuidedNodeDefinition {
  nodeId: string;
  componentId?: string;
  componentType: string;
  name?: string;
  canvasPoint?: string | { x: number; y: number };
  presentation: {
    region: 'header' | 'content' | 'footer' | 'control';
  };
  interactionMode?: 'manual' | 'automatic';
  completionPolicy?: GuidedCompletionPolicy;
  variableBindings?: unknown[];
  outputMappings?: GuidedOutputMapping[];
  resultBinding?: GuidedResultBinding;
  diagnosisBinding?: GuidedDiagnosisBinding;
  transitions?: GuidedTransition[];
  parentTransitionId?: string;
  parentId?: string;      // 兼容期
  branchIndex?: string;   // 兼容期
  onNodeLoaded?: GuidedEventActionChain;
  componentData?: unknown;
}
```

字段分层要求：

- presentation 属于节点，不写回通用组件模板；
- componentData 不再存 formData/variableData/apiData 等运行值；
- branchIndex 只作兼容，transitionId 为正式分支身份；
- 同一 componentId 可出现多次，nodeId 必须不同；
- Header/Footer 数量和拓扑由发布校验保证。

---

## 4. 组件模板定义

组件模板保存/查询需要支持稳定变量和输出定义：

```ts
interface GuidedComponentDefinitionExtension {
  definitionVersion?: string;
  variableDefinitions: Array<{
    variableId: string;
    key: string;
    title: string;
    dataType: string;
    defaultValue?: unknown;
  }>;
  outputDefinitions: Array<{
    outputId: string;
    key: string;
    title: string;
    dataType: 'string' | 'number' | 'boolean' | 'object' | 'array';
    requiredForResult?: boolean;
    description?: string;
  }>;
}
```

后端要求：

- 保存和查询原样回读 variableId/outputId；
- key/title 改名不重建 ID；
- 复制模板时生成新模板身份；
- 删除/改类型前可查询跨流程引用；
- 组件模板历史/版本能力如已存在，应保留定义 ID 的版本关系；
- 不在模板中保存某个流程节点的区域、标题、接口选择或导航结果。

---

## 5. 全局变量、绑定和输出

### 5.1 全局变量

```ts
interface GuidedGlobalVariableDefinition {
  globalVariableId: string;
  key: string;
  title: string;
  dataType: string;
  defaultValue?: unknown;
}
```

### 5.2 结构化引用

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

### 5.3 输出映射和结果绑定

```ts
interface GuidedOutputMapping {
  outputId: string;
  source: GuidedDataReference;
  emptyPolicy?: 'unresolved' | 'allow-null';
}

interface GuidedResultBinding {
  decisionValueOutputId?: string;
  decisionLabelOutputId?: string;
}

interface GuidedDiagnosisBinding {
  statusOutputId?: string;
  items: Array<{
    itemId: string;
    label: string;
    valueOutputId?: string;
    emptyPolicy?: 'hide' | 'placeholder';
    placeholder?: string;
  }>;
}
```

这些是定义配置。运行时解析得到的 values/label/status 不回写 sceneData。

---

## 6. 完成策略和分支

```ts
type GuidedCompletionPolicy =
  | { mode: 'output-valid' }
  | { mode: 'component-signal'; signalKey: string }
  | { mode: 'automatic-actions-complete' };

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

后端必须保证 transitionId 往返稳定。重排 order 不重建 transitionId，删除 transition 需要同步发现 target/parentTransitionId 影响。

---

## 7. 定义保存接口职责

无论沿用 `/app/saveAppInfo` 还是拆分，保存草稿需要：

### 7.1 请求

- 现有应用元信息；
- 完整 sceneData；
- appStatus/草稿状态；
- 若现有机制支持，携带当前定义版本用于防止误覆盖；当前产品不建设多页签并发乐观锁，因此不是本轮强制项。

### 7.2 服务端处理

1. 解析 JSON 合法性；
2. 检查 guidedSchemaVersion 是服务端支持版本；
3. 执行基础身份完整性校验；
4. 草稿允许业务配置不完整，但返回错误/警告列表；
5. 原样保存定义；
6. 重建该草稿版本的引用索引；
7. 返回定义 ID、版本、规范化结果和校验摘要。

### 7.3 响应建议

```ts
interface SaveGuidedDefinitionResponse {
  success: boolean;
  appId: string;
  definitionVersion?: string;
  guidedSchemaVersion: number;
  validation: {
    errors: GuidedValidationIssue[];
    warnings: GuidedValidationIssue[];
  };
}
```

不要求立即采用此 JSON 外形，但必须能表达以上信息。

---

## 8. 定义查询接口职责

当前需核查：

```text
/app/queryAppAndNodeInfo
/app/queryAppAndNodeInfo2
```

两者可能对应不同发布状态或运行入口。联调必须确认：

- 哪个返回编辑草稿；
- 哪个返回发布定义；
- appStatus 对 URL 的影响；
- 是否返回 componentList 完整组件定义；
- 是否存在 Node 信息二次拼装；
- 未知字段是否丢失；
- 独立 page 是否拿到和主预览相同 Schema。

查询返回要求：

- guidedSchemaVersion；
- 完整节点和流程级配置；
- 稳定身份原样回读；
- 组件定义版本或可查询引用；
- 不混入上次用户运行的变量/form/API 值；
- 高于运行端支持版本时由运行端阻止，不静默丢字段。

---

## 9. 发布接口与强校验

发布或提交审核前，后端必须重新执行强校验，不能只信任前端。

### 9.1 区域与拓扑

- Header/Footer 各至多一个；
- 有 Header 时开始节点唯一连到 Header；
- Footer 后只有唯一结束节点；
- 所有路径可达唯一结束；
- 不允许绕过必经 Footer；
- transition source/target 存在；
- 默认分支至多一个。

### 9.2 身份与引用

- nodeId/variableId/globalVariableId/outputId/transitionId 存在且唯一；
- 引用目标存在；
- 引用类型兼容；
- 必需值在所有相关路径上保证赋值；
- 不存在不可求值依赖环；
- 脚本声明的 reads/writes 目标存在。

### 9.3 输出和分支

- required 输出有映射；
- 有条件分支时 decisionValueOutputId 存在且为标量；
- diagnosis status 输出可映射为 success/failure；
- 标准分支值不重复；
- 高级条件能证明互斥；
- 无法证明互斥的配置阻止新协议发布。

### 9.4 错误返回

```ts
interface GuidedValidationIssue {
  code: string;
  severity: 'error' | 'warning';
  message: string;
  nodeId?: string;
  componentId?: string;
  variableId?: string;
  outputId?: string;
  transitionId?: string;
  configType?: string;
  configId?: string;
  path?: Array<string | number>;
}
```

前端必须能通过 issue 定位编辑器配置，不接受只返回“校验失败”。

---

## 10. 引用影响查询

### 10.1 目的

支持删除/修改组件模板变量、输出、流程节点、全局变量和 transition 前查询影响范围。

### 10.2 请求语义

```ts
type GuidedReferenceTarget =
  | { type: 'component-variable'; componentId: string; variableId: string }
  | { type: 'component-output'; componentId: string; outputId: string }
  | { type: 'flow-node'; definitionId: string; nodeId: string }
  | { type: 'global-variable'; definitionId: string; globalVariableId: string }
  | { type: 'transition'; definitionId: string; transitionId: string };
```

### 10.3 响应语义

```ts
interface GuidedReferenceImpact {
  definitionId: string;
  definitionVersion?: string;
  appName?: string;
  publishStatus?: string;
  consumerNodeId?: string;
  configType: 'branch' | 'input' | 'api-param' | 'visibility' | 'disable' | 'event' | 'output' | 'diagnosis' | 'footer';
  configId?: string;
  requirement: 'required' | 'optional-reactive';
  displayPath?: string;
}
```

后端引用索引：

- 保存时更新；
- 草稿/发布分开；
- 删除、历史恢复后同步；
- 可从 sceneData 重建；
- 不保存运行值；
- 不能替代源定义。

---

## 11. 组件模板破坏性修改

删除变量/输出或改变类型的标准流程：

1. 前端检查模板内部引用；
2. 调用影响查询；
3. 展示所有受影响应用、节点和用途；
4. 有必需引用时阻止直接破坏；
5. 配置人员修改或增加兼容字段；
6. 不按同名自动重新绑定；
7. 重新校验后才能发布组件模板变化。

实际后端若已有组件版本和审核流程，应把该保护接入现有机制，而不是旁路修改。

---

## 12. 历史、复制和定义回退

所有链路必须保留：

- guidedSchemaVersion；
- processConfig/layoutDirection；
- presentation.region；
- 稳定身份；
- sharedVariables；
- output/result/diagnosis 配置；
- transitions/parentTransitionId；
- onNodeLoaded 动作。

复制规则：

- 复制整个流程生成新 definition/app 身份；
- 新流程节点生成新 nodeId，并同步重写内部 nodeId 引用；
- variableId/outputId 属于所引用组件模板，不因节点复制重建；
- transitionId 为新流程生成新值，并同步重写 parentTransitionId；
- 复制后引用索引重建；
- 不能因 JSON stringify/DTO 转换丢失新字段。

定义回退只恢复流程定义版本，不恢复用户上一次前端运行态。

---

## 13. Schema 迁移接口/能力

当前试点少，不建设重型通用迁移平台，但需要可执行的逐级迁移：

```ts
interface GuidedMigrationResult {
  fromVersion: number;
  toVersion: number;
  migratedSceneData: unknown;
  changes: Array<{ code: string; message: string; path?: Array<string | number> }>;
  ambiguities: Array<{ code: string; message: string; candidates?: unknown[] }>;
  validation: {
    errors: GuidedValidationIssue[];
    warnings: GuidedValidationIssue[];
  };
}
```

原则：

- 迁移预览不自动覆盖原定义；
- 迁移前保留 sceneData 快照；
- 唯一可确定才自动转换；
- 同名冲突和复杂 MT 条件必须人工确认；
- 通过全量校验后另存草稿并发布；
- 后端若只负责透明 JSON 保存，迁移可由共享前端/工具执行，但历史和发布链必须接受新版本。

---

## 14. 运行期业务接口配合

引导式平台不统一规定每个业务接口，但请求适配器需要支持：

```ts
interface GuidedRequestContext {
  signal?: AbortSignal;
  processRunId: string;
  nodeId: string;
  nodeExecutionId: string;
  actionExecutionId?: string;
}
```

说明：

- execution ID 主要在前端用于旧写隔离；是否传到后端由接口和排障需求决定；
- 不把 execution ID 当业务幂等键；
- 可取消请求接收 signal；
- 不能取消时前端仍拒绝旧结果回写；
- 自动节点业务状态字段必须由业务接口/组件明确映射为 success/failure；
- 接口无返回或技术异常直接报错并停止；
- 平台不根据列表是否为空推断状态；
- 业务日志接口由业务配置在 change/click/confirm/onNodeLoaded 中自行调用。

---

## 15. 大流程接口与体积

第五期需要后端共同核查：

- query 是否一次返回所有节点完整组件定义；
- 能否返回轻量拓扑摘要和 componentId/definitionVersion；
- 组件详情能否按需/批量查询；
- 同模板多实例是否重复传输相同定义；
- 110/150 节点 sceneData 大小；
- 网关请求/响应限制；
- 数据库 JSON/CLOB 字段限制；
- 保存、查询、历史复制的 p50/p95；
- 是否存在 N+1 查询；
- 历史版本是否重复保存巨大组件定义。

如果当前接口无法拆分，先量化体积和耗时，再决定第五期是否调整接口。不能只通过前端虚拟化掩盖超大响应。

---

## 16. 非持久化数据黑名单

以下数据不得保存到流程定义、引用索引或历史定义：

```text
variables/formData/apiData 当前值
NodeFormalResult 当前值
业务 diagnosis 当前结果
processRunId/nodeExecutionId/actionExecutionId
activeExecutionPath/activeContentPath
pendingRequests/AbortController
组件 DOM/React state
接口 loading/error 临时状态
业务办理日志和曾经走过的历史轨迹
```

---

## 17. 联调验证矩阵

| 链路 | 必须验证 |
| --- | --- |
| 保存草稿 | 所有新字段回读，稳定 ID 不变，返回错误/警告 |
| 提交审核/发布 | 后端强校验，错误可定位 |
| 查询编辑定义 | v0～v5 可读取/迁移 |
| 查询发布定义 | 主 src/page 获取相同语义 |
| 复制 | ID 重写正确，引用不断链 |
| 历史查看/恢复 | 新字段不丢，恢复定义不恢复运行态 |
| 组件变量/输出修改 | 跨流程影响查询完整 |
| 删除节点/transition | 消费引用和后继关系可定位 |
| 自动业务接口 | 明确 status，技术错误分开 |
| 异步换路 | abort 可用且旧写被拒绝 |
| 110/150 节点 | 响应体积、查询、保存耗时记录 |

---

## 18. 后端技术核查待回填

在实际后端工程中补齐：

- [ ] `/app/saveAppInfo` Controller/Service/DTO/数据库落点；
- [ ] `queryAppAndNodeInfo` 与 `queryAppAndNodeInfo2` 差异；
- [ ] sceneData 是否透明保存；
- [ ] 未知字段丢失位置；
- [ ] 历史版本表和恢复流程；
- [ ] 复制时 ID/JSON 处理；
- [ ] 提交审核和正式发布强校验插入点；
- [ ] 组件模板变量/输出保存位置；
- [ ] 引用索引表或等价存储方案；
- [ ] 影响查询接口外形；
- [ ] 请求取消适配能力；
- [ ] 大 JSON 限制和 150 节点实测；
- [ ] 有副作用试点接口的幂等说明；
- [ ] 返回错误码的项目统一规范。

后端真实结论回填后，才冻结最终 URL、DTO 字段名和数据库设计。
