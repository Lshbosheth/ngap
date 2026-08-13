# 引导式二期组件作用域与引用体系开发方案

## 1. 文档信息

| 项目 | 内容 |
| --- | --- |
| 文档名称 | 引导式二期组件作用域与引用体系开发方案 |
| 文档性质 | 第二期开发实施方案，不代表已经修改业务代码 |
| 对应阶段 | 第二期：组件作用域与引用体系 |
| 当前状态 | 待技术评审，尚未开始正式代码开发 |
| 前置阶段 | 第一期 Header / Footer 已达到开发完成门槛 |
| 原始代码基线 | `D:\download\repomix-output\repomix-output.xml` 还原出的项目源码 |
| 前端工程 | 当前 `ngap` 工作区，包含主 `src` 与独立 `page/materials` 两套运行入口 |
| 后端工程 | 当前工作区未提供，接口、索引和发布校验由后端在实际工程复核 |
| 分期规划 | `GUIDED_PROCESS_PHASE_PLAN(引导式流程分期实施规划).md` |
| 一期方案 | `GUIDED_PROCESS_PHASE1_TECHNICAL_PLAN(引导式一期Header与Footer开发方案).md` |
| 总体设计 | `GUIDED_PROCESS_REDESIGN(引导式流程展示编排升级设计).md` |
| 决策记录 | `GUIDED_PROCESS_PENDING_ITEMS(引导式待完善事项).md` |

第二期是第三期正式输出、诊断结果和动态分支，以及第四期路径回滚的共同数据地基。本期如果只做变量改名或在 Store 中增加一个空的 `nodes` 对象，后续仍会出现串值、错误订阅和无法清理的问题。

---

## 2. 第二期为什么是核心阶段

### 2.1 第三、第四期对第二期的依赖

后续能力依赖关系如下：

```text
第二期
  节点实例作用域
  稳定变量身份
  结构化引用
  精确变更通知
  依赖图与清理 API
        ↓
第三期
  组件变量 → 正式输出 value/label
  正式输出 → 智能导航诊断
  正式输出 → 分支条件
        ↓
第四期
  前序结果变化
  → 找到失效后续节点
  → disposeNodeScope(nodeId)
  → 取消旧订阅和异步回写
  → 加载新路径
```

如果第二期没有稳定 `nodeId + variableId`，第三期无法确认输出来自哪个组件实例；如果第二期没有节点域和精确清理能力，第四期只能继续按变量名称或扁平数组猜测哪些数据应删除。

### 2.2 第二期的产品结果

第二期完成后，配置人员应能做到：

- 在通用业务组件中声明组件变量；
- 同一个通用组件在一个流程中使用多次而互不串值；
- 在流程中显式声明全局变量；
- 当前组件直接读取和修改自身组件变量；
- 组件显式读取其他组件实例的变量；
- 组件显式读取或赋值流程全局变量；
- 为接口参数、显隐、禁用、分支和事件动作选择数据来源；
- 删除节点或变量前看到完整影响清单；
- 保存或发布时发现失效、类型不兼容和赋值不可达的引用；
- 第一期试点流程升级后继续使用 Header/Footer。

配置界面继续使用“环节名称、组件名称、变量名称”等可读信息；技术 ID 由平台维护，不要求配置人员手工填写。

---

## 3. 当前实现问题

### 3.1 当前变量不是稳定定义

当前 `PageVariable` 主要只有：

```text
name / type / defaultValue / remark / isPrivate
```

没有稳定 `variableId`。编辑、删除和运行读写主要依赖 `name`，因此：

- 变量改名会断开字符串引用；
- 两个节点使用同名变量时无法区分；
- 删除变量时无法可靠找到所有消费者；
- 同一组件模板多次使用时，组件变量会并入同一页面容器。

### 3.2 主 `src` 仍是页面级扁平 Store

`src/stores/canvasPageStore.ts` 当前运行数据主要位于：

```text
page.pageData.variables
page.pageData.variableData
page.pageData.formData
page.pageData.apiOutData
page.pageData.elements
page.pageData.elementsMap
```

虽然还存在 `processData.nodeData[nodeId]`，但它只保存一份节点页面数据，后续仍会把元素、表单、变量和 API 结果合并到页面级对象中，没有形成真正运行边界。

### 3.3 当前私有变量只是字符串后缀

主 `ProcessPage.tsx` 对 `isPrivate` 变量使用类似：

```text
variable.name = variable.name + pageData.zjId
```

这不是作用域，只是修改变量名称。它不能同时隔离：

- 表单数据；
- API 结果；
- 事件和订阅；
- 同一模板的多个节点实例；
- 后续正式输出；
- 节点释放。

### 3.4 独立 `page/materials` 仍按名称合并

`page/src/page/index.tsx` 会按变量名称去重后调用 `addVariable`。`materials/stores/pageStore.ts` 继续使用：

```text
variableData[name]
formData[formId]
apiOutData[apiId]
```

这意味着只改主预览不会改变正式运行结果。

### 3.5 变量选择器只保存表达式字符串

当前 `VariableSelect` 会插入类似：

```text
context.variable.xxx
context.api.xxx
context.Form_xxx.xxx
```

保存结果缺少结构化来源信息。平台无法可靠回答：

- `xxx` 属于哪个节点；
- 来源变量是否已删除；
- 来源类型是否变化；
- 哪些 Footer 元素依赖它；
- 哪些接口参数会受影响；
- 删除节点是否会使发布流程失效。

### 3.6 物料直接写页面 Store

现有表单、上传、接口和事件动作大量直接调用：

```text
setVariableData
setFormData
editApiOutData
```

因此第二期不能只增加新 Runtime API，还必须提供节点上下文和旧物料兼容适配，否则已有物料仍会写回扁平页面数据。

---

## 4. 第二期范围与边界

### 4.1 本期必须交付

- 业务组件变量稳定 `variableId`；
- 流程全局变量稳定 `globalVariableId`；
- 以 `nodeId` 为主键的节点运行作用域；
- 组件变量、表单数据和 API 数据按节点隔离；
- 当前节点 Runtime Context；
- 当前节点变量直接读写；
- 其他节点变量显式只读访问；
- 全局变量显式读写；
- 结构化数据引用；
- 结构化引用选择器；
- 变量和数据变化的精确订阅；
- 引用依赖图和反向索引；
- 删除、修改、保存、历史加载和发布校验；
- 全局变量赋值可达性校验；
- 节点域创建和释放 API；
- 主 `src` 与独立 `page/materials` 统一语义；
- 第一期少量试点流程轻量升级；
- `guidedSchemaVersion` 从 1 升级为 2。

### 4.2 本期明确不做

- 正式输出 `value/label` 定义和运行值；
- 自动/人工诊断结果协议；
- 智能导航红绿诊断展示；
- 分支只读正式输出的新协议；
- 前序结果改变后的完整路径回滚；
- 旧异步请求的执行 ID 失效治理；
- `activeContentPath` 正式最终态；
- `onNodeLoaded` 正式事件；
- 统一业务日志；
- 表达式沙箱或 `new Function` 安全重写；
- 敏感字段、脱敏和字段权限；
- 多页签并发和后端乐观锁；
- 大流程画布性能和连线方向改造；
- 大量未知生产旧流程的通用迁移平台。

### 4.3 与第三期的边界

第二期负责提供：

```text
组件变量可以动态更新
→ 更新精确落到 nodes[nodeId].variables[variableId]
→ 订阅者能收到该变量变化
→ 引用能稳定找到该变量
```

第三期在此基础上增加：

```text
选择一个或多个组件变量
→ 计算正式输出
→ 形成稳定 value/label
→ 导航展示 label
→ 分支匹配 value
```

因此第二期不会重复设计另一套“输出变量”。第三期的输出映射直接使用本期结构化引用和订阅能力。

### 4.4 与第四期的边界

第二期实现：

- `createNodeScope(nodeId)`；
- `disposeNodeScope(nodeId)`；
- 清理节点变量、表单、API 数据和订阅；
- 页面卸载和节点删除时验证释放正确。

第四期负责决定：

- 哪条后续路径已经失效；
- 应该按什么顺序释放哪些节点；
- 如何取消或废弃旧异步请求；
- 如何重新加载新路径。

第二期提供可清理的数据单元，第四期实现完整换路算法。

---

## 5. 三层身份模型

### 5.1 `componentId`：通用组件模板

`componentId` 标识可复用的业务组件模板，例如 `CommonTable`。模板负责声明：

- 元素结构；
- 组件变量定义；
- 表单结构；
- API 插槽或接口配置能力；
- 通用事件和展示能力。

`componentId` 不能作为运行数据隔离键，因为同一个模板可以在一个流程中使用多次。

### 5.2 `nodeId`：流程节点实例

`nodeId` 标识模板在当前流程中的一次配置实例，例如：

```text
CommonTable(componentId=table-common)
├─ 在途工单(nodeId=node-orders)
└─ 可办理套餐(nodeId=node-packages)
```

两个节点共享模板变量定义，但拥有两套完全独立的运行值。

### 5.3 `variableId`：组件变量定义

组件变量在业务组件模板中拥有稳定 ID：

```ts
interface ComponentVariableDefinition {
  variableId: string;
  name: string;
  dataType: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'any';
  defaultValue?: unknown;
  description?: string;
}
```

变量显示名称允许修改，底层引用不变。运行地址为：

```text
nodeId + variableId
```

同一模板在两个节点使用时：

```text
nodes[node-orders].variables[var-result]
nodes[node-packages].variables[var-result]
```

即使两个值来自同一个 `variableId` 定义，也不会覆盖。

### 5.4 `globalVariableId`：流程显式全局变量

全局变量属于流程定义，不属于某个业务组件模板：

```ts
interface GlobalVariableDefinition {
  globalVariableId: string;
  name: string;
  dataType: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'any';
  defaultValue?: unknown;
  description?: string;
}
```

运行地址为：

```text
runtime.shared.values[globalVariableId]
```

组件变量与全局变量即使同名也不会自动同步。必须通过明确的全局变量赋值动作写入。

### 5.5 配置人员是否需要看到 ID

不需要。配置界面显示：

```text
在途工单 / 查询结果
可办理套餐 / 查询结果
流程全局 / 当前客户等级
```

保存时分别写为：

```text
node-orders + var-result
node-packages + var-result
global-customer-level
```

用户所说的“通过组件 ID 获取变量”，产品界面可以继续理解为选择组件；技术上必须解析到 `nodeId`，因为 `componentId` 无法区分重复使用的模板实例。

---

## 6. 流程定义与保存契约

### 6.1 第二期 schema 版本

第二期正式保存：

```text
guidedSchemaVersion = 2
```

版本规则：

- 缺失版本按 0；
- 一期 Header/Footer 流程为 1；
- 二期作用域和结构化引用流程为 2；
- 版本 1 必须经过迁移预览和确认后才能保存成 2；
- 运行端遇到大于自身支持版本时拒绝运行；
- 版本转换集中在共享 schema/migration 模块。

### 6.2 业务组件模板变量契约

当前业务组件变量保存在组件 `atomList` 第一项的 `contConfig.variables`。第二期保持整体存储位置兼容，但每条变量定义增加稳定 ID，并统一主 `src` 与 `materials` 类型。

正式字段至少包含：

```json
{
  "variableId": "var_xxx",
  "name": "decisionCode",
  "dataType": "string",
  "defaultValue": "",
  "description": "组件内部计算结果"
}
```

兼容读取旧字段：

- 旧 `type` 归一为 `dataType`；
- 旧 `remark` 归一为 `description`；
- 旧 `isPrivate=true` 作为组件变量候选；
- 旧变量缺少 ID 时进入模板升级流程，不能每次查询临时生成不同 ID。

### 6.3 流程定义 v2 建议结构

```json
{
  "guidedSchemaVersion": 2,
  "processConfig": {},
  "sharedVariables": [
    {
      "globalVariableId": "global_customer_id",
      "name": "customerId",
      "dataType": "string",
      "defaultValue": ""
    }
  ],
  "componentList": [
    {
      "nodeId": "node_header",
      "componentId": "component_header",
      "presentation": { "region": "header" },
      "instanceConfig": {
        "variableDefaults": {},
        "bindings": []
      }
    }
  ]
}
```

说明：

- `sharedVariables` 是流程级显式全局定义；
- 组件变量定义仍来自业务组件模板；
- `instanceConfig.variableDefaults` 只保存节点实例覆盖值，按 `variableId` 索引；
- 结构化引用保存在实际消费配置中，`bindings` 可以作为节点级通用绑定容器；
- 运行值不写入流程定义；
- 依赖图是可重建派生数据，不作为前端定义的唯一事实来源。

### 6.4 节点实例覆盖

同一组件模板不同节点可以配置不同默认值，但不得复制出新的变量定义身份：

```text
模板：var-page-size 默认 10
节点 A：覆盖为 20
节点 B：覆盖为 50
```

保存为：

```text
nodeA.instanceConfig.variableDefaults[var-page-size] = 20
nodeB.instanceConfig.variableDefaults[var-page-size] = 50
```

模板变量改名不会影响覆盖关系。

---

## 7. 节点运行作用域

### 7.1 目标运行结构

第二期建议建立独立于普通页面 Store 的引导式 Runtime：

```ts
interface GuidedRuntimeStateV2 {
  processRunId: string;
  definitionId: string;

  shared: {
    definitions: Record<string, GlobalVariableDefinition>;
    values: Record<string, unknown>;
  };

  nodes: Record<string, NodeRuntimeScopeV2>;
}

interface NodeRuntimeScopeV2 {
  nodeId: string;
  componentId: string;
  lifecycle: 'created' | 'mounted' | 'disposed';

  variableDefinitions: Record<string, ComponentVariableDefinition>;
  variables: Record<string, unknown>;
  formData: Record<string, Record<string, unknown>>;
  apiData: Record<string, unknown>;
}
```

本期 `lifecycle` 只表示数据域生命周期，不表示第三期业务成功/失败，也不替代第四期节点执行状态机。

### 7.2 创建节点域

`createNodeScope(nodeId, componentDefinition, instanceConfig)` 执行：

1. 校验 `nodeId` 唯一；
2. 读取模板变量定义；
3. 深拷贝变量默认值；
4. 应用节点实例覆盖值；
5. 创建空表单数据；
6. 创建空 API 数据；
7. 注册节点域；
8. 返回节点 Runtime 上下文。

数组和对象默认值必须深拷贝。两个节点不能共享同一个对象引用。

### 7.3 释放节点域

`disposeNodeScope(nodeId)` 至少清理：

- 组件变量值；
- 表单数据；
- API 数据；
- 当前节点作为消费者的订阅；
- 当前节点拥有的组件引用；
- 节点级临时适配缓存；
- 从兼容投影生成的临时对象。

当前节点作为其他配置的数据来源时，定义态依赖边不删除；运行态订阅获得“来源未解析”状态。删除流程节点属于编辑器定义变更，必须先走引用影响校验。

### 7.4 运行 API

本期建议冻结以下最小 API：

```ts
interface GuidedScopedRuntimeV2 {
  createNodeScope(nodeId: string): NodeRuntimeScopeV2;
  disposeNodeScope(nodeId: string): void;

  getCurrentNodeId(): string;
  getNodeScope(nodeId: string): Readonly<NodeRuntimeScopeV2> | undefined;

  getVariable(nodeId: string, variableId: string): unknown;
  setCurrentVariable(variableId: string, value: unknown): void;
  getNodeVariables(nodeId: string): Readonly<Record<string, unknown>>;

  getGlobal(globalVariableId: string): unknown;
  setGlobal(globalVariableId: string, value: unknown): void;

  setCurrentFormField(formId: string, fieldId: string, value: unknown): void;
  setCurrentApiData(apiId: string, value: unknown): void;

  resolveReference(reference: GuidedDataReference): ReferenceResolution;
  subscribeReference(reference: GuidedDataReference, consumerId: string, listener: () => void): () => void;
}
```

写入规则：

- 当前组件可以写自身变量、表单和 API 数据；
- 当前组件可以通过明确动作写全局变量；
- 其他组件变量只能读取只读快照；
- 不允许组件直接修改其他节点的内部变量；
- 跨组件修改如确有业务需要，应使用目标组件公开动作或显式全局变量，不在本期开放任意写入。

### 7.5 为什么不能使用全局 `currentNodeId`

页面可能同时挂载 Header、多个 Content 和 Footer。使用模块变量或 Store 中唯一 `currentNodeId` 会产生：

- Footer 点击时误写当前 Content；
- Header 异步回调写入后续节点；
- 两个组件事件同时发生时相互覆盖；
- React 并发渲染下身份不可靠。

节点身份必须通过 React 节点 Runtime Context 或显式 API 参数传递，不能依赖可变全局指针。

---

## 8. 节点 Runtime Context 与旧物料适配

### 8.1 渲染上下文

每个业务节点渲染时必须建立：

```text
GuidedNodeRuntimeProvider(nodeId)
  → NgapRender
    → 当前节点全部物料和嵌套子物料
```

Header、Content 和 Footer 都使用同一作用域规则。Footer 固定挂载不代表它的数据可以写入页面全局容器。

### 8.2 兼容适配原则

不能要求一次性重写所有已有物料。建议增加“节点作用域 Store 适配层”：

- 普通组装式页面继续使用原页面 Store；
- 引导式节点 Provider 内，对变量、表单和 API 选择器投影当前节点数据；
- 引导式节点 Provider 内，对 `setVariableData/setFormData/editApiOutData` 自动绑定当前 `nodeId`；
- Store 外部工具调用必须显式传递节点 Runtime，不能回退到全局当前节点；
- 主 `src` 和 `materials` 使用同一适配契约。

### 8.3 兼容上下文投影

旧物料和旧脚本在迁移期仍可能读取：

```text
context.variable
context.api
context.Form_xxx
```

第二期对当前节点生成临时兼容投影：

```text
context.variable = 显式全局变量 + 当前节点组件变量
context.api      = 当前节点 API 数据
context.Form_xxx = 当前节点对应表单数据
```

如果全局变量与当前节点变量同名：

- 迁移报告标记冲突；
- 新 schema v2 发布前必须把引用改成明确来源；
- 不允许新配置继续保存歧义表达式；
- 兼容预览可暂按当前节点变量优先，但只能用于处理迁移问题。

兼容投影不得重新把所有节点变量合并为全局对象。

### 8.4 新表达式上下文

新配置使用明确上下文：

```text
context.node.variable.<当前变量名称>
context.node.form.<表单>.<字段>
context.node.api.<接口>
context.process.shared.<全局变量名称>
context.refs.<显式引用别名>
```

显示名称只用于编辑表达式可读性，运行解析仍然依赖保存的结构化引用元数据。

---

## 9. 结构化引用协议

### 9.1 引用类型

第二期正式支持：

```ts
type GuidedDataReference =
  | {
      kind: 'node-variable';
      nodeId: string;
      variableId: string;
      path?: Array<string | number>;
    }
  | {
      kind: 'global-variable';
      globalVariableId: string;
      path?: Array<string | number>;
    }
  | {
      kind: 'node-form-field';
      nodeId: string;
      formId: string;
      fieldId: string;
      path?: Array<string | number>;
    }
  | {
      kind: 'node-api-result';
      nodeId: string;
      apiId: string;
      path?: Array<string | number>;
    }
  | {
      kind: 'system';
      key: string;
      path?: Array<string | number>;
    }
  | {
      kind: 'constant';
      value: unknown;
    };
```

第三期再增加 `node-output` 和诊断相关引用类型。第二期依赖图和引用解析器必须使用可扩展注册机制，不能写成只识别当前六种类型的巨大条件分支。

### 9.2 为什么路径使用数组

对象字段路径保存为：

```json
{ "path": ["data", "list", 0, "id"] }
```

而不是只保存 `data.list.0.id`，避免字段中包含点号、数组下标和转义问题。界面仍可以显示点路径。

### 9.3 绑定配置

引用的消费配置至少包含：

```ts
interface GuidedBinding {
  bindingId: string;
  source: GuidedDataReference;
  requirement: 'required' | 'optional-reactive';
  expectedType?: string;
  unresolvedPolicy: 'error' | 'use-default';
  defaultValue?: unknown;
}
```

规则：

- 接口必填参数、分支条件等使用 `required`；
- Footer 显隐等允许初始无值的配置使用 `optional-reactive`；
- `optional-reactive` 必须配置默认行为；
- `required` 未解析时当前配置不能正常执行；
- `bindingId` 用于定位、订阅和依赖清单，不因显示名称变化而改变。

### 9.4 第二期纳入结构化引用的配置

至少覆盖：

- 接口入参；
- 变量赋值来源和目标；
- Header 写全局变量；
- Footer 元素显隐和禁用；
- 普通元素显隐和禁用；
- 现有分支条件的数据来源；
- 节点实例输入绑定；
- 导航已有可配置数据字段；
- 事件动作参数；
- 脚本显式声明的读取和写入。

第三期会把分支逐步改为读取正式输出，但二期先保证旧分支引用不再依赖字符串猜测。

### 9.5 脚本引用元数据

本期不重写脚本引擎，但新建或修改的脚本动作必须保存：

```ts
interface ScriptReferenceDeclaration {
  alias: string;
  reference: GuidedDataReference;
  access: 'read' | 'write';
}
```

规则：

- 脚本读取其他节点变量时只读；
- 写当前节点变量或全局变量时保存明确目标；
- 动态拼接变量名、遍历所有节点或未声明读写的新脚本不能发布；
- 旧脚本进入迁移报告，不因本期表达式安全边界被自动重写；
- 平台校验依赖元数据，不使用正则搜索变量名作为正式依据。

---

## 10. 数据选择器设计

### 10.1 选择器分组

引导式配置中的变量选择器调整为：

```text
当前环节
  组件变量
  表单字段
  接口结果

其他环节
  顶部核心信息
    组件变量
    表单字段
    接口结果
  套餐查询
    组件变量
    表单字段
    接口结果

流程全局
  客户号码
  客户等级

系统上下文
  登录用户
  路由参数
  环境信息
```

### 10.2 跨组件变量读取

第二期允许显式读取其他组件实例的组件变量，满足“通过组件取得其变量”的需求：

- 先选择流程节点实例；
- 再选择该组件模板声明的变量；
- 底层保存 `nodeId + variableId`；
- 返回只读值或只读快照；
- 不通过 `componentId` 直接定位运行实例；
- 不允许外部组件任意写入目标组件变量。

第三期正式输出上线后，跨节点业务契约优先使用输出；直接读取组件变量仍可用于受控的低代码配置和兼容场景，但编辑器应标记“内部变量引用”。

### 10.3 可达性提示

选择其他节点数据时，编辑器立即提示：

- 来源节点是否一定先于当前节点；
- 来源是否只存在于某条分支；
- 当前读取是必需还是允许未加载；
- Footer 初始挂载时来源可能尚不存在；
- Header 来源对后续 Content 是否由初始化顺序保证。

不满足保证顺序的必需引用不能发布。

### 10.4 保存格式

选择器可以同时保存：

- 结构化引用：正式事实来源；
- 可读展示快照：用于离线显示来源名称；
- 兼容表达式：只用于旧执行器过渡。

节点或变量改名后，只更新展示快照，不改变结构化引用。

---

## 11. 响应式更新与订阅

### 11.1 更新键

每类数据都有稳定更新键：

```text
node-variable:{nodeId}:{variableId}:{path}
global-variable:{globalVariableId}:{path}
node-form-field:{nodeId}:{formId}:{fieldId}:{path}
node-api-result:{nodeId}:{apiId}:{path}
```

### 11.2 精确通知

当组件 change 事件通过脚本给当前变量赋值时：

1. Runtime 使用当前 Provider 的 `nodeId`；
2. 通过 `variableId` 写入当前节点域；
3. 比较新旧值；
4. 值未变化则不通知；
5. 值变化只通知订阅该来源的消费者；
6. Footer 显隐、接口参数预览或其他依赖配置重新求值；
7. 不触发无关节点整体重渲染。

这就是第三期“内部选择变化后动态更新正式输出”的底层基础。

### 11.3 订阅生命周期

- 消费配置挂载时注册；
- 配置变更时先取消旧订阅再注册新订阅；
- 节点释放时取消该节点作为消费者的所有订阅；
- 页面整体重启时清空运行订阅；
- 定义态依赖图与运行态订阅分离；
- 不把订阅函数保存进流程定义。

### 11.4 Footer 默认行为

Footer 页面启动即挂载，依赖的 Content 数据可能尚未产生。因此 Footer 显隐/禁用绑定必须声明：

```text
requirement = optional-reactive
unresolvedPolicy = use-default
defaultValue = 隐藏或禁用
```

数据产生后自动重新求值。未配置默认行为时发布阻断。

---

## 12. 引用依赖图

### 12.1 依赖边

```ts
interface DependencyEdge {
  dependencyId: string;
  source: GuidedDataReference;
  consumer: {
    nodeId?: string;
    configType:
      | 'branch'
      | 'input'
      | 'api-param'
      | 'visibility'
      | 'disable'
      | 'assignment'
      | 'navigation'
      | 'action'
      | 'script';
    configId: string;
    fieldPath?: Array<string | number>;
  };
  access: 'read' | 'write';
  requirement: 'required' | 'optional-reactive';
  expectedType?: string;
}
```

### 12.2 图的事实来源

依赖图从正式结构化配置中重建：

- 不以显示名称为主键；
- 不扫描 DOM；
- 不搜索表达式中是否包含变量名；
- 不把上一次生成的依赖图当作唯一事实来源；
- 每个引用类型通过注册的 extractor 提取依赖边。

### 12.3 前端反向索引

编辑器加载流程后建立：

```text
sourceKey → DependencyEdge[]
```

用途：

- 删除节点前列出影响；
- 删除变量前列出影响；
- 修改类型前列出消费者；
- 点击变量查看“被哪里使用”；
- 保存前执行完整校验。

### 12.4 后端引用索引

如果后端当前把 `sceneData` 当不透明 JSON 保存，仅靠前端无法回答“修改通用组件模板变量会影响哪些流程”。第二期建议后端在流程保存/发布时提取引用摘要，维护可查询索引。

概念字段至少包含：

```text
definitionId / definitionVersion
sourceKind
sourceComponentId
sourceNodeId
sourceVariableId or globalVariableId
consumerNodeId
configType
configId
requirement
publishStatus
```

该索引是影响分析和查询加速数据，可以从流程定义重建；不能替代 `sceneData` 中的正式引用。

### 12.5 通用组件变量修改

业务组件模板删除变量或改变类型时：

1. 前端检查模板内部使用；
2. 后端按 `componentId + variableId` 查询所有流程引用；
3. 展示受影响应用、节点和配置用途；
4. 有引用时默认阻止破坏性修改；
5. 配置人员先修改流程或创建兼容变量；
6. 不按同名变量自动重新绑定；
7. 再次校验通过后才允许发布组件变化。

第二期不建设完整组件语义版本管理，但必须防止已引用变量被静默删除。

---

## 13. 校验规则

### 13.1 校验时机

1. 删除节点、删除变量、改变类型或改变关键来源前即时校验；
2. 保存草稿时重建完整依赖图；
3. 加载历史定义时重新校验；
4. 提交审核、发布或上线前强校验；
5. 通用组件模板变量结构变化时查询跨流程影响。

### 13.2 结构完整性

阻断项：

- 来源节点不存在；
- `variableId/globalVariableId/formId/fieldId/apiId` 不存在；
- 消费配置不存在；
- 重复技术 ID；
- 引用类型不受当前 schema 支持；
- 结构化引用与兼容表达式来源不一致；
- 动态脚本使用未声明的读写来源。

### 13.3 类型校验

最低支持：

```text
string / number / boolean / array / object / any
```

规则：

- 完全相同类型通过；
- `any` 产生警告而非自动认为安全；
- 对象/数组字段有 schema 时校验 path；
- 必填接口参数类型不兼容时阻断；
- 显隐和禁用最终必须能解析为 boolean；
- 数字与字符串不默认静默转换，转换必须显式配置。

### 13.4 节点数据可达性

必需读取其他节点数据时，来源节点必须在每条到达消费者的有效路径上先完成。等价地，来源节点需要支配消费者。

示例：

```text
A → B → D
  ↘ C → D
```

- D 必需读取 A：通过；
- D 必需读取 B：失败，因为经过 C 的路径没有 B；
- D 可选响应式读取 B 并配置默认值：允许。

Header 初始化成功后先于所有 Content，因此 Header 变量对后续 Content 可以形成保证来源。Footer 初始挂载早于 Content，默认只能使用可选响应式读取；若按钮点击前要求必需值，则需对所有可到达 Footer 的路径进行保证校验。

### 13.5 全局变量赋值可达性

全局变量存在不等于使用时一定有值。对每个必需读取点执行 must-definition 数据流分析：

```text
IN[node]  = 所有前驱 OUT 的交集
OUT[node] = IN[node] + 当前节点保证写入的全局变量
```

保证来源包括：

- 全局变量有有效默认值；
- Header 初始化成功前无条件写入；
- 某节点完成前的必经动作无条件写入；
- 写入失败时节点不能完成。

不构成保证来源：

- 普通可选按钮；
- 不参与节点完成的 change；
- 只在部分分支执行的动作；
- 可能失败但仍允许继续的赋值；
- 尚未进入的后续节点。

### 13.6 依赖循环

纯读取多个值不构成循环。以下情况需要建立写入边并检测：

```text
A 变量变化 → 写全局 X
全局 X 变化 → 写 A 变量
```

如果没有明确终止条件或稳定计算顺序，发布阻断。第二期不尝试自动求解循环响应式公式。

### 13.7 错误与警告

阻断错误：

- 失效引用；
- 类型不兼容；
- 必需来源并非所有路径可达；
- 未声明脚本引用；
- 无法求值的写入循环；
- Footer 响应式配置没有默认行为；
- 组件变量破坏性修改影响已发布流程。

警告：

- 来源类型为 `any`；
- 全局变量存在多个条件写入者；
- 变量没有消费者；
- 使用其他组件内部变量而非未来正式输出；
- 旧兼容表达式尚未迁移。

---

## 14. 删除和修改交互

### 14.1 删除节点

删除节点前列出：

- 该节点拥有的变量、表单和 API 来源；
- 哪些分支条件引用它；
- 哪些 Footer 元素引用它；
- 哪些接口参数引用它；
- 哪些全局变量由它写入；
- 删除写入者后哪些必需消费者失去保证来源。

存在阻断依赖时默认不允许删除。

### 14.2 “删除节点及相关配置”

可以提供高级操作，但必须：

1. 展示将删除或清空的完整配置清单；
2. 区分自动可删除的消费配置和必须人工重新绑定的配置；
3. 不删除其他业务节点；
4. 不按名称寻找替代变量；
5. 生成一个可撤销的编辑器事务；
6. 操作后立即重新运行全量校验。

### 14.3 删除或修改变量

- 改显示名称：引用不变；
- 改说明：引用不变；
- 改默认值：重新检查运行默认行为；
- 改类型：执行影响分析并阻断不兼容消费者；
- 删除：有引用时阻止；
- 改业务含义但类型不变：平台无法自动判断，配置人员应创建新变量并迁移引用。

### 14.4 反向依赖展示

变量详情中提供“被引用位置”：

```text
客户判断 / customerLevel
├─ Footer / 办理按钮 / 显隐条件
├─ 套餐推荐 / queryPackage / 请求参数
└─ 路径判断 / 条件 2
```

点击条目定位到相应节点和配置面板。

---

## 15. 组件模板复用

### 15.1 节点实例配置

同一 `componentId` 的不同节点分别保存：

- 节点标题；
- Header/Content/Footer 区域；
- 接口选择和参数绑定；
- 变量默认值覆盖；
- 事件动作；
- 本节点引用配置；
- 后续第三期输出和诊断映射。

这些配置不得回写通用组件模板。

### 15.2 运行隔离测试例

```text
CommonTable / var-list

节点 A：在途工单
  nodes[node-orders].variables[var-list] = [...]
  nodes[node-orders].apiData[api-query] = {...}

节点 B：可办理套餐
  nodes[node-packages].variables[var-list] = [...]
  nodes[node-packages].apiData[api-query] = {...}
```

即使模板变量 ID、表单 ID 和 API ID 都相同，`nodeId` 仍保证运行数据独立。

### 15.3 复制节点

复制节点时：

- 生成新 `nodeId`；
- 保留相同 `componentId`；
- 复制节点实例配置和结构化引用作为初始值；
- 不复制运行值；
- 指向“当前节点自身”的引用自动改成新 `nodeId`；
- 指向其他节点或全局变量的引用保持原来源；
- 复制后运行引用完整性校验。

---

## 16. 第一期试点流程迁移

### 16.1 迁移原则

- 只处理第一期产生的少量试点流程；
- 不建设面向大量未知旧数据的通用迁移系统；
- 不静默猜测变量归属；
- 迁移前保留原 `sceneData` 快照；
- 迁移预览不自动保存；
- 歧义项由配置人员确认；
- 迁移通过全量校验后才可重新发布。

### 16.2 组件模板先升级

试点流程涉及的业务组件模板先完成变量 ID 升级：

1. 读取模板变量；
2. 为缺少 ID 的变量生成稳定 `variableId`；
3. 保存到业务组件定义；
4. 查询接口再次回读确认 ID 不变；
5. 再迁移流程节点引用。

不能在每次流程加载时随机生成变量 ID，否则同一个引用下次打开会失效。

### 16.3 旧 `isPrivate` 处理

- `isPrivate=true` 默认作为组件变量候选；
- `isPrivate=false` 只作为全局变量候选，不自动全部升级为全局；
- 多个节点同名、同类型且确实用于共享的数据，可以合并成一个显式全局变量；
- 同名但来源不同或用途不明时列入冲突清单；
- 组件内部变量不再自动并入流程全局。

### 16.4 旧引用迁移

迁移器分析：

- `context.variable.xxx`；
- `context.api.xxx`；
- 表单表达式；
- 分支条件；
- Footer 显隐和禁用；
- 接口参数；
- 变量赋值动作；
- 脚本动作。

只有来源唯一时自动生成结构化引用。以下情况要求人工确认：

- 多个节点都有同名变量；
- 同名组件变量和全局变量同时存在；
- 表达式动态拼接名称；
- 来源可能位于不同互斥分支；
- 脚本遍历整个变量对象；
- 变量类型与消费者预期不一致。

### 16.5 Header/Footer 保持

迁移必须保持：

- 原 `nodeId`；
- Header/Content/Footer 区域；
- 原连线和分支顺序；
- 组件实例配置；
- Header 初始化顺序；
- Footer 固定挂载；
- 普通页面布局。

只升级变量、作用域和引用，不要求重新绘制流程。

---

## 17. 主 `src` 改造方案

### 17.1 Runtime 与定义态分离

建议在一期共享目录基础上增加：

```text
src/shared/guidedProcess/
  runtime/
    types.ts
    createRuntime.ts
    references.ts
    subscriptions.ts
    dependencyGraph.ts
    validation.ts
    migrationV1ToV2.ts
    legacyProjection.ts
```

这些模块不得引用编辑器 DOM 或具体页面 Store。

### 17.2 `canvasPageStore`

- `processData.nodeData` 保留定义态编辑数据，不作为运行值主存储；
- 新引导式运行使用独立 Runtime Store；
- 普通组装式页面继续使用原页面 Store；
- 提供引导式节点范围的兼容 Store 适配；
- 不继续使用变量名后缀隔离；
- 不把所有节点表单和 API 结果合并到页面级对象。

### 17.3 `ProcessPage`

- 节点组件定义加载后创建节点域；
- Header、Content、Footer 渲染都套节点 Provider；
- `mergeVariable` 改为初始化当前节点变量定义和值；
- 接口结果写当前节点 API 数据；
- 表单变化写当前节点表单数据；
- 页面显式全局变量由 Runtime shared 管理；
- 分支旧逻辑通过结构化引用解析器读取；
- 页面卸载时释放所有节点域。

### 17.4 `NgapRender` 和物料

- 根据元素 `belongNodeId` 保持正确节点上下文；
- 嵌套物料继承父节点 Provider；
- 不使用模块级当前节点变量；
- Store 适配覆盖变量、表单和 API 的读写；
- 普通页面没有节点上下文时保持原逻辑。

---

## 18. 独立 `page/materials` 改造方案

### 18.1 共用能力

独立页通过现有 `@editor` 别名复用：

- schema v2；
- Runtime 类型和纯状态逻辑；
- 引用解析；
- 订阅键；
- 依赖校验；
- 迁移规则；
- 兼容投影规则。

### 18.2 `materials/stores/pageStore.ts`

- 普通组装式页面继续保持原 Store；
- 引导式节点通过上下文感知的适配层访问 Runtime；
- `setVariableData/setFormData/editApiOutData` 在节点上下文内写节点域；
- Store 外工具调用显式接收 Runtime/节点 ID；
- 不把多个节点数据重新同步回扁平 `pageData`。

### 18.3 `page/src/page/index.tsx`

- 创建与主预览相同的 Guided Runtime；
- 删除按变量名称全局去重的 `mergeVariable`；
- 节点加载时创建独立作用域；
- 结构化引用使用同一解析器；
- Header/Footer 继续遵守一期生命周期；
- 页面卸载和手机号确认重启时释放节点域；
- 第四期之前不在此实现完整路径回滚。

### 18.4 双运行端防漂移

- 相同 fixture；
- 相同 Runtime contract tests；
- 相同引用解析结果；
- 相同迁移报告；
- 相同错误码；
- 宿主差异只保留请求、用户信息、路由、监控和样式。

---

## 19. 编辑器开发方案

### 19.1 业务组件变量管理

变量面板需要：

- 新建变量时生成 `variableId`；
- 编辑名称时保留 ID；
- 编辑类型前查询影响；
- 删除前查询模板内部和流程外部引用；
- 显示“被引用流程数量”；
- 旧变量打开时提示升级；
- 主 `src` 和后端回读后 ID 保持一致。

### 19.2 流程全局变量管理

在流程编辑器提供独立“全局变量”入口：

- 新建生成 `globalVariableId`；
- 名称流程内唯一；
- 可以配置类型、默认值和说明；
- 删除、类型变化前显示引用；
- Header、Content、Footer 都通过明确选择器读取；
- 赋值动作明确选择目标全局变量。

### 19.3 引用选择器

现有 `VariableBind/VariableSelect` 不宜直接全局替换后影响普通页面。建议：

- 保留普通页面旧选择器；
- 引导式场景启用 `GuidedDataSelector`；
- 或在同一组件中通过页面类型切换数据源和保存格式；
- 新选择器返回 `GuidedBinding`，不是只返回表达式字符串；
- 兼容表达式作为附加字段生成。

### 19.4 影响分析面板

删除/修改弹窗至少显示：

- 来源对象；
- 消费节点；
- 配置类型；
- 必需/可选；
- 当前类型；
- 修复入口；
- 是否阻断发布。

### 19.5 错误定位

保存校验结果使用稳定结构：

```text
errorCode
sourceReference
consumerNodeId
configType
configId
fieldPath
message
```

前端不能解析中文文案决定跳转位置。

---

## 20. 后端开发方案

### 20.1 业务组件链路

至少核查：

| 接口 | 目标 |
| --- | --- |
| `/appComponent/saveAppComponent` | 保存稳定 `variableId`，变量改名不换 ID |
| `/appComponent/queryAppComponentInfo` | 单组件查询完整回读变量 ID |
| `/appComponent/queryAppComponentInfoList` | 批量查询完整回读变量 ID |
| 组件审核/发布接口 | 发布态不丢变量定义 ID |
| 组件复制接口 | 复制模板时生成新模板变量 ID，或按正式复制规则处理 |

### 20.2 流程定义链路

至少核查：

| 接口 | 目标 |
| --- | --- |
| `/app/saveAppInfo` | 保存 schema v2、全局变量和结构化引用 |
| `/app/queryAppAndNodeInfo` | 编辑/测试态完整回读 |
| `/app/queryAppAndNodeInfo2` | 独立运行发布态完整回读 |
| `/app/queryAppInfoHistory` | 历史定义和引用不丢失 |
| `/app/saveAppInfoForShare` | 分享/复制不丢失 |
| 审核、发布、回退链路 | 校验和缓存支持 schema v2 |

### 20.3 引用影响查询

后端需要提供能力：

- 按流程定义查询引用；
- 按 `componentId + variableId` 查询所有受影响流程；
- 按 `globalVariableId` 查询当前流程消费者；
- 区分草稿、审核、发布状态；
- 返回可定位的节点和配置摘要。

具体接口 URL 可由后端遵循现有风格确定，不在本文强制命名。

### 20.4 后端发布校验

后端发布阶段至少校验：

- schema 版本；
- 节点、组件变量和全局变量 ID 唯一；
- 所有引用来源存在；
- 所有消费配置存在；
- 类型兼容；
- 必需来源可达；
- Header 保证赋值顺序；
- Footer 可选响应式默认行为；
- 未声明脚本引用；
- 依赖写入循环。

前后端应共享测试样例和错误码说明；如果无法共享代码，至少共享同一契约 fixture。

### 20.5 数据库存储

流程定义仍可优先保存在现有 `sceneData`。为了跨流程影响查询，建议增加派生引用索引表，而不是每次修改组件变量都全库扫描大 JSON。

索引表需支持：

- 保存流程时事务内更新；
- 发布版本与草稿版本区分；
- 删除/回退时同步；
- 可从 sceneData 重建；
- 不把运行值写入索引。

---

## 21. 文件级前端改造清单

| 文件/目录 | 计划改动 |
| --- | --- |
| `src/shared/guidedProcess/runtime/` | Runtime、引用、订阅、依赖图、校验、迁移和兼容投影 |
| `src/packages/types/index.ts` | 稳定组件变量定义类型，与 materials 对齐 |
| `materials/types/index.ts` | 同步组件变量定义和运行契约 |
| `src/layout/components/Variable/VariableSetting.tsx` | 变量 ID、类型变更影响、删除保护 |
| `src/pages/editor/topbar/TopBar.tsx` | 业务组件保存和回读变量 ID |
| `src/components/VariableBind/*` | 保留普通页兼容，引导式接入结构化选择器 |
| `src/components/GuidedDataSelector/` | 新增引导式数据选择和引用预览 |
| `src/stores/canvasPageStore.ts` | 定义态/运行态边界、作用域 Store 适配、全局变量编辑数据 |
| `processCanvasPage/processCanvasPageType.ts` | schema v2、全局变量和节点实例配置类型 |
| `processCanvasPage/index.tsx` | v1→v2 迁移入口、定义归一化、组件变量 ID 合并 |
| `ProcessCanvas/index.tsx` | 删除/复制节点影响分析、保存引用配置 |
| `ProcessPage/ProcessPage.tsx` | 节点域创建、Provider、作用域读写、释放 |
| `ConditionalBranchConfig/*` | 旧分支数据来源改成结构化引用 |
| `CanvasTop.tsx` | schema v2 保存、依赖全量校验和错误定位 |
| `src/packages/NgapRender/NgapRender.tsx` | 节点 Runtime Provider 传递 |
| `src/packages/utils/action.ts` | 变量赋值和动作参数使用结构化引用/当前节点上下文 |
| `src/utils/dealApiGlobal.ts` | API 结果和参数解析进入当前节点域 |
| `materials/stores/pageStore.ts` | 独立运行时节点作用域适配 |
| `materials/NgapRender/NgapRender.tsx` | 同步节点 Provider |
| `materials/utils/action.ts` | 同步变量赋值和结构化引用 |
| `materials/utils/util.ts` | 新上下文、当前节点读取和旧投影 |
| `page/src/utils/dealApiGlobal.ts` | API 结果写入节点域 |
| `page/src/page/index.tsx` | 创建统一 Runtime，移除按名称合并 |
| 测试 fixture 目录 | v1 试点、v2 正常、冲突、失效引用和复用模板数据 |

正式编码前应通过 `rg` 再次统计所有变量、表单和 API 的直接读写点。表中列的是当前已确认的主链路，不表示可以忽略其他调用方。

---

## 22. 实施任务与排期

### 22.1 任务依赖

```text
P2-T1 数据流与后端链路核查
  ↓
P2-T2 变量 ID 与 schema v2
  ↓
P2-T3 Runtime Store 和作用域 API
  ├→ P2-T4 主 src / materials 作用域适配
  ├→ P2-T5 结构化选择器和配置改造
  └→ P2-T6 依赖图、影响分析和发布校验
        ↓
P2-T7 一期试点迁移
        ↓
P2-T8 双入口联调、回归和文档
```

### 22.2 工作量拆分

| ID | 任务 | 负责人 | 前端人日 | 后端人日 | 产出/验收 |
| --- | --- | --- | ---: | ---: | --- |
| P2-T1 | 双运行时数据读写、组件保存、流程保存和历史链路核查 | 前后端 | 2～3 | 2 | 完整调用点清单和后端链路结论 |
| P2-T2 | 组件变量 ID、全局变量 ID、schema v2 和数据往返 | 前后端 | 3～4 | 2～3 | 变量改名 ID 不变，流程/组件查询完整回读 |
| P2-T3 | Runtime Store、节点域 API、引用解析和精确订阅 | 前端 | 4～5 | 0 | 纯逻辑 contract tests 通过 |
| P2-T4 | 主 `src` 与 `materials/page` 节点上下文和旧物料适配 | 前端 | 4～6 | 0 | 同模板多实例运行完全隔离 |
| P2-T5 | 结构化数据选择器、接口/显隐/赋值/分支配置改造 | 前端 | 4～5 | 1 | 新配置不再只保存表达式字符串 |
| P2-T6 | 依赖图、反向索引、影响面板、类型/路径校验 | 前后端 | 4～5 | 2～3 | 删除保护和发布强校验通过 |
| P2-T7 | 第一期试点流程轻量迁移和人工确认 | 前后端 | 2～3 | 1～2 | v1→v2 后 Header/Footer 和引用正常 |
| P2-T8 | 双入口联调、普通页面回归、缺陷修复和文档 | 前后端 | 4～5 | 0～1 | 测试记录和二期验收候选版本 |
| **合计** |  |  | **27～36** | **8～12** | 与六期实施规划保持一致 |

### 22.3 建议日历安排

| 周次 | 前端重点 | 后端重点 | 阶段出口 |
| --- | --- | --- | --- |
| 第 1 周 | 数据读写点、变量选择器和两套 Store 核查 | 组件/流程保存查询及历史链路核查 | 现状清单和契约问题确认 |
| 第 2 周 | 变量 ID、全局变量、schema v2、共享类型 | DTO、变量 ID 回读、sceneData v2 | 数据契约冻结 |
| 第 3 周 | Runtime Store、节点域 API、引用解析 | 引用索引方案和接口 | 纯 Runtime 测试通过 |
| 第 4 周 | 主 `src` 节点 Provider 和 Store 适配 | 保存/查询联调 | 主预览同模板多实例隔离 |
| 第 5 周 | `materials/page` 适配、普通页面兼容 | 独立运行页接口联调 | 双入口作用域一致 |
| 第 6 周 | 数据选择器、接口/显隐/赋值/分支绑定 | 引用影响查询和发布校验 | 新配置结构化保存 |
| 第 7 周 | 依赖图、删除影响面板、类型和路径校验 | 后端强校验、索引修复 | 删除/保存/发布校验通过 |
| 第 8 周 | v1 试点迁移、Header/Footer 回归 | 迁移和历史回读 | 试点流程升级完成 |
| 第 9 周 | 缺陷修复、双入口和普通页面回归 | 联调缺陷修复 | 二期验收版本 |

如果作用域 Store 适配无法兼容现有物料，必须重新评估，不允许通过“只改几个试点组件”把平台级隔离问题转嫁给业务组件开发人员。

---

## 23. 测试方案

### 23.1 变量身份测试

- 新建组件变量生成 ID；
- 改名后 ID 不变；
- 改默认值后 ID 不变；
- 删除后重新新建同名变量得到新 ID；
- 组件保存、关闭、回读 ID 不变；
- 流程全局变量同样满足以上规则；
- 主类型与 materials 类型一致。

### 23.2 节点隔离测试

- 两个节点都定义 `result`，互不覆盖；
- 同一 `componentId` 使用两次，变量独立；
- 同一模板两次使用相同表单 ID，表单独立；
- 同一模板两次使用相同 API ID，API 数据独立；
- 一个节点重新请求不改变另一个节点；
- 一个节点释放不删除另一个节点；
- 数组/对象默认值不是同一引用；
- Header、Content、Footer 各有独立作用域。

### 23.3 读写测试

- 当前节点读取/修改自身变量；
- change 事件脚本修改派生变量；
- 变量变化精确通知订阅者；
- 值未变化不重复通知；
- 其他节点显式读取变量；
- 外部节点不能写目标节点变量；
- 组件读取全局变量；
- 明确赋值动作修改全局变量；
- 同名组件变量和全局变量不自动同步。

### 23.4 结构化引用测试

- 节点改名引用不失效；
- 变量改名引用不失效；
- 对象和数组 path 正确解析；
- 来源不存在时返回结构化错误；
- 接口参数使用正确节点来源；
- Footer 初始未赋值使用默认行为；
- 数据产生后 Footer 自动更新；
- 普通页面仍保存旧格式，不被强制改成引导式 binding。

### 23.5 依赖和删除测试

- 删除无引用变量直接成功；
- 删除有引用变量展示完整影响；
- 删除节点列出 Footer、接口、分支和全局写入影响；
- 改名称不触发断链；
- 改类型阻断不兼容消费者；
- 不按同名自动换绑；
- “删除节点及相关配置”可以整体撤销；
- 历史流程存在失效引用时不可发布。

### 23.6 可达性测试

- Header 无条件赋值供所有 Content 使用；
- 单线前序节点变量供后序必需读取；
- 分支 B 变量不能作为汇合 D 的必需来源；
- 分支 B 变量可以作为 D 的可选来源并配置默认；
- 全局变量默认值满足保证来源；
- 仅按钮写入不能满足接口必填参数；
- 多个保证写入者的路径交集计算正确；
- 写入循环被识别。

### 23.7 迁移测试

- 一期 schema v1 流程生成迁移预览；
- 私有变量正确归入组件变量；
- 明确全局变量正确归入流程全局；
- 同名冲突要求人工确认；
- 动态脚本进入冲突清单；
- 取消迁移不修改原定义；
- 迁移后版本为 2；
- Header/Footer、节点 ID、连线和组件配置不变；
- 迁移后主预览与独立页一致。

### 23.8 普通页面回归

- 普通组装式页面变量读写不变；
- 普通业务组件编辑和预览不变；
- 普通表单、接口、事件动作不变；
- 没有 GuidedNodeProvider 时继续使用页面 Store；
- `BottomBanner` 一期行为不回归。

---

## 24. 风险与控制

| 风险 | 影响 | 控制措施 |
| --- | --- | --- |
| 只隔离变量，不隔离表单/API | 同模板仍然串数据 | 节点域同时包含 variables/formData/apiData |
| 使用 `componentId` 定位运行值 | 重复模板实例无法区分 | 运行地址固定使用 nodeId + 资源 ID |
| 使用全局 currentNodeId | 多节点挂载和异步回调写错域 | React Provider 或显式 Runtime 参数 |
| 旧物料继续写页面 Store | 表面有 nodes，实际仍扁平 | 节点作用域 Store 适配和直接调用点清单 |
| 变量 ID 每次临时生成 | 保存重开后引用失效 | ID 持久化到组件模板并回读验证 |
| 引用仍以表达式字符串为事实 | 无法删除校验 | 结构化引用为主，表达式仅兼容 |
| 只做前端反向索引 | 组件模板修改无法发现其他流程 | 后端维护可重建引用索引 |
| 自动按同名迁移 | 绑定到错误节点 | 唯一来源才自动，歧义人工确认 |
| 依赖图存成不可校验缓存 | 图与定义漂移 | 每次保存从结构化配置重建 |
| 第二期顺带实现输出/回滚 | 范围失控且模型反复 | 输出留第三期，路径换路留第四期 |
| page/materials 最后同步 | 正式页集中失败 | Runtime contract tests 和逐周同步 |
| 普通页面被作用域改造影响 | 平台大范围回归 | 没有节点上下文时严格走原 page scope |

---

## 25. 第二期完成门槛

### 25.1 数据契约

- `guidedSchemaVersion=2` 正确保存和回读；
- 组件变量和全局变量拥有稳定 ID；
- 运行值不写回流程定义；
- 结构化引用是正式事实来源；
- 组件、流程、历史和发布链路不丢字段。

### 25.2 运行隔离

- 同名变量不串值；
- 同模板多实例的变量、表单和 API 数据完全隔离；
- Header/Content/Footer 各有独立节点域；
- 当前节点可读写自身变量；
- 跨节点只读和全局显式读写符合规则；
- 节点释放后运行数据和订阅清理完整。

### 25.3 引用与校验

- 数据选择器保存稳定引用；
- 删除节点/变量可准确列出影响；
- 改名称不影响引用；
- 类型、路径和赋值可达性校验正确；
- 有阻断错误的流程不能发布；
- 通用组件变量修改可以查询跨流程影响。

### 25.4 兼容与双入口

- 第一期试点流程完成 v1→v2 轻量升级；
- Header/Footer 行为不变；
- 主 `src` 与独立 `page/materials` 语义一致；
- 普通组装式页面和普通业务组件无回归；
- 测试记录和迁移问题清单齐全。

### 25.5 为第三期准备完毕

第三期开始前必须证明：

```text
组件 change
→ 脚本计算
→ setCurrentVariable(variableId, value)
→ 节点域值变化
→ 指定订阅者收到通知
→ 其他节点和普通页面不受影响
```

第三期只需新增输出定义、输出映射和诊断/分支消费者，不应再次改造变量身份、节点隔离、引用格式或订阅底层。

---

## 26. 开始编码前必须确认的事项

1. `/appComponent/saveAppComponent` 实际如何保存 `contConfig.variables`；
2. 业务组件审核/发布/复制是否重新生成或过滤变量字段；
3. 主 `src` 和 materials 所有直接变量、表单、API 读写调用点；
4. 哪些工具函数在 React Context 外执行，需要显式 Runtime 参数；
5. 一期试点流程实际使用的组件变量和全局变量清单；
6. 现有 `isPrivate` 在真实组件中的使用方式；
7. 后端 sceneData 是否可以新增 `sharedVariables` 和 schema v2；
8. 后端是否可以建立派生引用索引；
9. 组件变量破坏性修改是直接阻断还是需要接现有版本机制；
10. 引导式新数据选择器与普通页面旧选择器的隔离方式；
11. 脚本动作当前真实数据结构和稳定 action/config ID 情况；
12. 第一期测试基础设施是否已经引入 Vitest；
13. 主预览与独立运行页支持的最低浏览器版本；
14. 第二期真实验收用的重复组件模板和复杂引用流程。

上述事项只用于技术落点确认，不重新讨论已冻结的产品原则。发现实际代码与本文假设冲突时，应先修订方案和排期，再开始大范围 Store 改造。

---

## 27. 最终结论

第二期正式交付的不是一个“局部变量开关”，而是一套可以支撑后续演进的数据基础：

```text
通用组件变量定义（variableId）
+ 流程节点实例（nodeId）
+ 显式全局变量（globalVariableId）
+ 节点运行作用域
+ 结构化引用
+ 精确响应式订阅
+ 依赖图与删除保护
+ 双运行时兼容适配
```

推荐按 P2-T1～P2-T8 顺序实施。第二期验收时，应重点证明同一模板多实例完全隔离、组件内部变量能够动态响应、跨组件引用稳定、删除修改有完整影响清单，以及第一期流程能够无损升级。完成这些条件后，第三期才能稳定增加正式输出、诊断结果和动态分支，而不再反复修改数据地基。
