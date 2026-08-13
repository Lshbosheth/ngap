# 自定义元素 v2 六期整体验收与推广准备开发方案

## 1. 文档信息

| 项目 | 内容 |
|---|---|
| 文档标识 | `CUSTOM_ELEMENT_V2_PHASE6_TECHNICAL_PLAN` |
| 对应期次 | 第六期：整体验收与推广准备 |
| 前置方案 | 第一至五期开发方案及其退出门槛 |
| 主要需求 | 全量 `CE-*`、`CE-ACC-001`～`CE-ACC-031`、推广门槛和非功能要求 |
| 本期性质 | 生产推广收口期，以验证、治理、演练和缺陷收敛为主 |
| 基准周期 | 4～7 周，建议按 6 周编排 |
| 最终结果 | “允许推广 / 附条件允许 / 不允许推广”联合结论 |

本文不重新定义协议、SDK、构建或运行机制。发现架构缺口时，应回到对应期次修复并重新验证，不能在六期增加临时旁路。

---

## 2. 目标与范围

### 2.1 必须达到的目标

- 建立需求、设计、实现、测试和生产证据的双向追踪矩阵；
- 对源包、静态分析、服务端构建、管理端、双运行时、SDK、版本和 v1 兼容完成端到端验收；
- 使用真实复杂度的试点元素和页面验证生产闭环；
- 冻结并验证性能、容量、稳定性和资源释放基线；
- 完成安全测试、可信执行边界确认、签名和权限审计；
- 完成队列、对象存储、CDN、密钥、撤销和回退演练；
- 发布模板、SDK、协议手册、错误手册、迁移指南和运维手册；
- 上线统一指标、日志、追踪、告警和服务级目标；
- 通过功能开关和白名单完成生产灰度；
- 关闭全部 P0/P1 缺陷，批准并跟踪剩余低风险缺陷；
- 形成 v1/v2 共存运营策略和正式推广结论。

### 2.2 明确不包含

- 不新增容器 children 协议；
- 不新增 iframe 或其他强隔离运行模式；
- 不建设公开组件市场；
- 不强制迁移全部 v1，不删除 v1 runtime；
- 不让浏览器构建结果进入审核或生产发布；
- 不绕过服务端扫描、签名、不可变产物和版本锁定；
- 不临时扩展 SDK 权限来迁就试点组件；
- 不把 `latest` 作为已保存 v2 实例的运行版本；
- 不在缺少证据时以口头确认替代推广门槛。

### 2.3 验收原则

1. 每项需求都有主证据入口，可以关联多个辅助证据；
2. 自动化结果必须可复跑，人工验收必须有步骤、输入和结论；
3. 主 `src` 和独立 `page/materials` 使用同一套契约用例；
4. 生产试点只使用服务端冻结且签名有效的产物；
5. 失败场景同时验证可定位、可恢复和敏感信息不泄露；
6. 性能结论记录环境、规模、采样方法和版本身份；
7. 回退演练必须实际执行，不能只评审文档；
8. 验收期间不得修改冻结 build、artifact 或历史版本；
9. 未达到强隔离前，上传角色保持为可信内部人员；
10. 任一硬门槛失败，不能给出“允许推广”。

---

## 3. 命名与证据规范

### 3.1 编号规范

| 类型 | 格式 | 示例 | 用途 |
|---|---|---|---|
| 六期任务 | `P6-T{序号}` | `P6-T4` | 排期、负责人和状态跟踪 |
| 需求验收 | 沿用 `CE-ACC-{三位序号}` | `CE-ACC-023` | 与需求文档保持一致 |
| 六期扩展用例 | `P6-ACC-{领域}-{三位序号}` | `P6-ACC-RUN-004` | 非功能和演练用例 |
| 证据 | `P6-EV-{领域}-{三位序号}` | `P6-EV-SEC-006` | 报告、日志和流水线结果 |
| 门槛 | `P6-GATE-{领域}-{两位序号}` | `P6-GATE-SEC-02` | 推广判定 |
| 演练 | `P6-DRILL-{领域}-{两位序号}` | `P6-DRILL-CDN-01` | 故障与回退演练 |
| 缺陷 | 使用项目缺陷系统编号 | `BUG-12345` | 不创建脱离现有系统的编号 |

领域缩写统一为：

| 缩写 | 领域 | 缩写 | 领域 |
|---|---|---|---|
| `PKG` | 源包和 `ngap.json` | `ANA` | Analyzer 和诊断 |
| `BLD` | 服务端构建与扫描 | `MGT` | 元素管理和生命周期 |
| `EDT` | 主编辑器 | `RUN` | 独立运行时和 Registry |
| `SDK` | SDK、权限和宿主 | `VER` | 版本、升级和回滚 |
| `CMP` | v1/v2 兼容与迁移 | `PERF` | 性能和容量 |
| `SEC` | 安全 | `OPS` | 运维和故障演练 |
| `DX` | 开发者体验和文档 | `REL` | 灰度和发布 |

### 3.2 文件命名规范

验收产物使用大写英文标识、下划线分词和中文说明，不使用“最终版”“最新版”“new”等不可追踪命名。

```text
CUSTOM_ELEMENT_V2_P6_REQUIREMENT_TRACE(六期需求追踪矩阵).xlsx
CUSTOM_ELEMENT_V2_P6_TEST_REPORT(六期整体验收测试报告).md
CUSTOM_ELEMENT_V2_P6_PERFORMANCE_REPORT(六期性能容量报告).md
CUSTOM_ELEMENT_V2_P6_SECURITY_REPORT(六期安全评估报告).md
CUSTOM_ELEMENT_V2_P6_DRILL_REPORT(六期故障演练报告).md
CUSTOM_ELEMENT_V2_P6_PILOT_REPORT(六期生产试点报告).md
CUSTOM_ELEMENT_V2_P6_RELEASE_DECISION(六期推广评审结论).md
```

报告版本采用 `v{major}.{minor}`，正文记录关联 Git commit、平台版本、builderVersion、SDK 版本和环境标识。

### 3.3 证据最低字段

每条 `P6-EV-*` 至少记录：

```text
evidenceId
requirementIds / acceptanceIds
environment / executedAt
platformVersion / builderVersion / sdkVersion
elementId / elementVersion / packageHash / artifactHash
preconditions / input
expected / actual
pipelineOrReportUrl
owner / reviewer
result: passed | failed | blocked | not-applicable
defectIds / retestResult
redactionNote
```

---

## 4. 前置条件与基线冻结

### 4.1 进入六期的硬前置

第一至五期退出门槛必须逐项核验，至少包括：

- `ngap.json` Schema、package reader、Analyzer 和 manifest 契约已冻结；
- `elementProtocolVersion = 2` 已贯穿保存、查询、历史、复制、审核、发布和运行；
- 服务端异步构建、扫描、不可变产物和签名链路可用；
- 正式预览、审核、发布和运行使用同一个冻结 artifact；
- v2 五步编辑器和生命周期状态机可用；
- 主编辑器支持 v1/v2、多实例和多版本；
- 独立运行时不下载 ZIP，不在浏览器编译 v2 源码；
- 页面实例锁定 elementVersion 和 elementArtifactHash；
- SDK 两个宿主通过契约测试；
- 使用关系、差异评估、升级、降级和 v1 迁移能力可用；
- 生产监控、撤销和回退基础能力可用。

任何前置项未完成，记录为 `P6-GATE-BASE-01` 失败并退回对应阶段，不能把未实现能力降级为普通六期测试缺陷。

### 4.2 验收基线清单

| 基线 | 必须记录的内容 |
|---|---|
| 代码 | 前端、后端、构建器、SDK 的 commit/tag |
| 协议 | `ngap.json` Schema、platform/runtime manifest Schema 版本 |
| 运行 | Registry、主 runtime adapter、独立 runtime adapter 版本 |
| 依赖 | React、ReactDOM、Ant Design、plots、dayjs、lodash-es 等精确版本 |
| 安全 | 扫描策略、依赖白名单、CSP、签名算法和 keyId |
| 环境 | 集成、预发布、生产灰度环境标识和配置差异 |
| 数据 | fixture 版本、试点 elementId/pageId 和脱敏数据版本 |
| 门槛 | 功能、性能、安全、稳定性和缺陷阈值 |

基线变更登记 changeId、原因、影响用例和需要重跑的证据范围。

### 4.3 环境一致性检查

- 预发布和生产使用相同构建器镜像 digest；
- 两个环境使用相同签名验证代码和密钥类型；
- 对象存储、CDN CORS、MIME、缓存和 `nosniff` 策略一致；
- 允许的差异仅限域名、容量、密钥实例和外部服务地址；
- 功能开关默认值、白名单和回退开关有配置清单；
- 主 `src` 和独立 `page` 使用兼容的 SDK/Registry 版本；
- 时钟同步、日志时区和 traceId 传播已校验。

---

## 5. 组织、职责与决策机制

### 5.1 角色职责

| 角色 | 主要职责 | 必签内容 |
|---|---|---|
| 产品负责人 | 范围、试点、用户流程、遗留项接受 | 产品验收与推广范围 |
| 架构负责人 | 契约、双运行时、版本和边界一致性 | 架构门槛 |
| 前端负责人 | 管理端、主编辑器、独立 runtime、SDK host | 前端回归和回退 |
| 后端负责人 | 构建、版本、审核发布、runtime info | 服务和数据门槛 |
| 构建平台负责人 | builder 镜像、队列、扫描、产物 | 构建可复现和容量 |
| 测试负责人 | 追踪矩阵、回归、缺陷和证据 | 测试报告 |
| 安全负责人 | 威胁模型、扫描、权限、签名、可信边界 | 安全报告 |
| 运维负责人 | 指标、告警、SLO、演练和应急 | 生产运维门槛 |
| 试点开发者 | 使用官方材料独立开发、上传和修复 | 开发者体验反馈 |
| 业务试点负责人 | 真实页面验收、灰度反馈和回退确认 | 试点结论 |

### 5.2 评审节奏

- 每日：缺陷分级、阻塞项和环境变更同步；
- 每周：门槛燃尽、证据缺口、性能趋势和试点反馈评审；
- 灰度前：安全、架构、运维和测试四方准入评审；
- 扩大灰度前：观察窗口结果和回退能力复核；
- 正式推广前：产品、架构、测试、安全、运维联合签署。

### 5.3 决策等级

| 结论 | 含义 |
|---|---|
| 允许推广 | 所有硬门槛通过，P0/P1 为 0，遗留项已批准 |
| 附条件允许 | 只允许非硬门槛的低风险 P2/P3 遗留，明确范围、责任人和截止日 |
| 不允许推广 | 任一硬门槛失败，或存在 P0/P1，或无法可靠回退 |

“附条件允许”不能绕过签名、版本锁定、双运行时、生产不编译源码和敏感信息保护等硬门槛。

---

## 6. 验收环境与测试数据

### 6.1 环境分层

| 环境 | 用途 | 数据 | 外部接口 |
|---|---|---|---|
| CI | 单元、契约、静态扫描、bundle gate | 固定 fixtures | 全部 mock |
| 集成环境 | 跨服务、构建队列、对象存储联调 | 自动构造 | mock + 测试服务 |
| 预发布环境 | 全链路、性能、安全、演练 | 脱敏生产规模 | 预发布服务 |
| 生产灰度 | 真实可信用户和真实页面 | 正式数据 | 正式服务 |

CI 或集成环境通过不能替代预发布和生产灰度证据。

### 6.2 固定源包 Fixture 集

| Fixture ID | 内容 | 主要覆盖 |
|---|---|---|
| `FIX-PKG-MINIMAL` | 单入口、单组件、简单 Props | 最小合法包 |
| `FIX-PKG-WRAPPED` | 外包一层同名目录 | 根目录提升 |
| `FIX-PKG-MULTI-MODULE` | 多 TS/TSX、类型和相对 import | 模块图 |
| `FIX-PKG-ASSETS` | Less/CSS/PNG/SVG/字体 | 样式与资源 |
| `FIX-PKG-CONFIGURED-API` | 配置化接口 | 配置映射 |
| `FIX-PKG-DECLARED-API` | 声明式接口和权限 | SDK 权限 |
| `FIX-PKG-UPLOAD` | 文件上传 | 高风险 capability |
| `FIX-PKG-EVENT-METHOD` | 多事件、多方法和 ref | 契约与调用 |
| `FIX-PKG-COMPLEX-PROPS` | union、对象、数组、可选字段 | Analyzer 边界 |
| `FIX-PKG-UNKNOWN-PROPS` | 无法完整静态推导 | warning/人工补充 |
| `FIX-PKG-BLOCKED-IMPORT` | 非白名单依赖 | 构建阻断 |
| `FIX-PKG-DIRECT-NETWORK` | fetch/XHR/WebSocket | 安全阻断 |
| `FIX-PKG-PATH-ATTACK` | `../`、绝对路径、大小写冲突 | ZIP 安全 |
| `FIX-PKG-BUILD-FAIL` | 语法或类型构建失败 | 错误诊断 |
| `FIX-PKG-RENDER-FAIL` | 运行期抛错 | Error Boundary |
| `FIX-PKG-SDK-DENY` | 调用未授权能力 | 权限拒绝 |
| `FIX-PKG-LEAK` | 订阅、style、timer 清理样例 | 资源释放 |
| `FIX-PKG-V1-STATIC` | 标准 v1 三文件 | 可自动迁移 |
| `FIX-PKG-V1-FUNCTION` | 函数 Schema | 人工迁移 |
| `FIX-PKG-V1-INTERNAL` | Store/request/CrossAPI/internal import | 不可自动迁移 |

每个 fixture 包含 README、预期 diagnostics、预期 platform/runtime manifest 和 hash 快照。签名值由测试环境动态生成，不写入源码库。

### 6.3 页面 Fixture 集

- 单个 v2 简单元素；
- 10 个和 30 个不同 v2 元素；
- 同一 artifact 的 30 个实例；
- 同一 elementId 的两个版本；
- 五个不同 element/version identity；
- v1/v2 混合；
- v2 与普通内置元素混合；
- 业务组件嵌套使用 v2；
- 引导式初始节点使用 v2；
- 引导式后续节点首次增量使用 v2；
- 构建失败、加载失败或渲染失败；
- configured API、declared API、文件上传、事件和方法；
- 升级前、升级后、降级后和迁移后版本。

### 6.4 数据隔离与清理

- fixture 使用专用 tenant/provId；
- 测试上传者、审核者、发布者分离；
- 生产灰度不使用伪造 Token 或共享账号；
- 日志和报告不得包含完整 Token、Cookie、文件内容和敏感响应；
- 自动化数据带统一 `ce-v2-p6-` 前缀和过期时间；
- 已发布不可变 artifact 不物理覆盖，按保留策略标记和清理；
- 生产试点页面的删除、下线和恢复经业务负责人确认。

---

## 7. 需求追踪矩阵

### 7.1 矩阵字段

```text
requirementId / requirementTitle / requirementSource
phaseDesignSection / implementationModules
automatedCaseIds / manualCaseIds / evidenceIds
owner / reviewer / result
defectIds / retestResult / gateId / notes
```

### 7.2 覆盖规则

- `CE-PKG-*` 有 package reader 或 Schema 证据；
- `CE-ANA-*` 有 Analyzer 快照和诊断 UI 证据；
- `CE-SDK-*` 在主/独立两个 host 执行契约用例；
- `CE-BLD-*` 覆盖成功、失败、取消/超时和恢复；
- `CE-UX-*`、`CE-LFC-*` 有角色化端到端证据；
- `CE-RT-*` 有双运行时、错误隔离和资源释放证据；
- `CE-VER-*` 有锁定、升级、降级和回滚证据；
- `CE-CMP-*` 有 v1/v2 共存或迁移证据；
- `CE-SEC-*` 有自动扫描、安全测试或书面边界确认；
- `CE-NFR-*` 有可量化测试或架构检查；
- `CE-ACC-001`～`CE-ACC-031` 全部不得缺项。

### 7.3 状态规则

| 状态 | 使用条件 |
|---|---|
| passed | 实际符合预期，证据可访问且已复核 |
| failed | 实际不符合预期 |
| blocked | 环境或前置阻塞，仍视为未通过 |
| not-applicable | 仅需求明确允许排除时使用，产品和架构共同批准 |

不能用 not-applicable 处理“尚未实现”“来不及测试”或“只影响独立运行时”。

---

## 8. 功能验收矩阵

### 8.1 源包与 Analyzer

完整复跑 `CE-ACC-001`～`CE-ACC-010`，并补充：

- ZIP 总大小、解压后大小、文件数、单文件大小和压缩比边界；
- 文件名 Unicode、大小写冲突、重复路径和软链接样例；
- `ngap.json` 未知字段、废弃字段、错误枚举和不支持的协议版本；
- 入口缺失、循环 import、动态 import、包外 import；
- 类型别名、交叉类型、泛型、可选属性和默认值冲突；
- props/events/methods 人工覆盖项的来源和 dirty 状态；
- Analyzer 重跑的确定性和诊断稳定排序；
- 浏览器预检与服务端权威分析差异提示；
- 多次上传相同 packageHash 的幂等和缓存行为。

门槛：`P6-GATE-PKG-01`、`P6-GATE-ANA-01`。

### 8.2 构建、扫描与产物

- queued → preparing → analyzing → scanning → bundling → publishing → succeeded 全链路；
- 每一阶段的失败状态、诊断和可重试性；
- 取消、超时、worker 丢失、服务重启和任务恢复；
- 幂等键相同不重复发布产物；
- build 输入记录 packageHash、Schema、builder、policy 和 dependency lock；
- 构建 workspace 按任务隔离并可靠清理；
- 网络、文件系统、进程、CPU、内存和超时限制生效；
- 非白名单依赖、直接网络和危险语法阻断；
- ESM/CSS/assets 使用不可变内容地址；
- platform manifest/runtime manifest/diagnostics 与 artifactHash 对应；
- preview artifact 与 publish candidate 身份明确；
- 审核后修改源包导致原候选失效；
- 已发布 artifact 无法覆盖；
- 构建日志脱敏且可按 buildId 检索。

门槛：`P6-GATE-BLD-01`、`P6-GATE-BLD-02`。

### 8.3 元素管理与生命周期

- v2 五步编辑器完整走通；
- 上传、分析、契约确认、样式/资源、预览/提交步骤状态可恢复；
- draft、building、build-failed、ready-for-review、in-review、rejected、published、downline/revoked 行为正确；
- 源包、清单覆盖、依赖、权限变化都会标记 dirty/stale；
- 保存草稿不等于提交审核；
- 提交审核冻结 buildId、packageHash、manifestHash 和 artifactHash；
- 驳回原因和修正历史可追踪；
- 审核角色不能被上传者权限绕过；
- 发布只使用已批准候选；
- 下线/撤销对新拖入、存量运行和管理员操作有明确反馈；
- 历史版本和审计记录不可篡改；
- v1 编辑入口保持兼容并明确标识协议。

门槛：`P6-GATE-MGT-01`。

### 8.4 主编辑器与独立运行时

完整复跑 `CE-ACC-017`～`CE-ACC-024`，并验证：

- 应用编辑器和业务组件编辑器行为一致；
- 元素菜单只展示允许使用的发布版本；
- 新实例锁定完整 identity；
- 保存、刷新、历史、复制、模板、分享和发布不丢版本字段；
- 同 artifact 多实例只加载一次模块和样式；
- 同 elementId 多版本不覆盖 Registry entry；
- Props、事件、方法、ref、configured API 在两个 runtime 一致；
- 引导式后续节点按完整 identity 增量加载；
- 单元素 manifest/CSS/ESM/render/SDK 错误只降级该实例；
- 页面和节点销毁能释放 ref、订阅、timer、Blob 和临时 style；
- 独立生产首屏不包含 Analyzer、JSZip、Babel 或源包下载；
- v1 编译路径与 v2 artifact 路径明确分流；
- v1/v2 同页时配置语义、错误处理和样式互不串线；
- Chrome 目标浏览器矩阵通过。

门槛：`P6-GATE-EDT-01`、`P6-GATE-RUN-01`、`P6-GATE-RUN-02`。

### 8.5 SDK 与权限

完整复跑 `CE-ACC-011`～`CE-ACC-016`，并验证：

- `context` 创建、更新、卸载和实例隔离；
- 主/独立 host 的 namespace、参数、返回值和错误码一致；
- capability 声明、审核和运行授权一致；
- configured API 只能使用宿主已配置映射；
- declared API 只能调用 manifest 允许的能力；
- 文件上传校验类型、大小、数量、超时和取消；
- 变量读写、消息、通知、导航遵循租户和页面边界；
- 未授权调用返回 `SDK_PERMISSION_DENIED` 并写审计；
- SDK 不向组件暴露 Token、Cookie、Store、request 或 raw CrossAPI；
- 组件卸载后宿主清理订阅和未完成调用；
- SDK 超时、业务失败、权限拒绝和宿主不可用错误可区分；
- capability 调用量、失败率、P95 和权限拒绝可观测；
- 新版本增加高风险权限会重新触发安全审核。

门槛：`P6-GATE-SDK-01`、`P6-GATE-SDK-02`。

### 8.6 版本、升级、降级与 v1 迁移

完整复跑 `CE-ACC-025`～`CE-ACC-031`，并验证：

- 发布新版本不改变存量 locked consumer；
- recommended version 只影响新拖入实例；
- legacy-latest 数据被明确识别并提示风险；
- usage index 能定位应用、业务组件、模板和引导式消费者；
- usage index 增量、回填和 drift repair 结果一致；
- Contract Diff 覆盖 props/events/methods/permissions/dependencies/SDK；
- 声明式迁移无路径、歧义、循环和冲突时明确失败；
- 升级 preview 使用目标 artifact 且不污染正式 Store；
- 乐观锁冲突、目标撤销、保存失败时不产生半升级状态；
- 降级精确回到旧 version + artifactHash；
- 批量升级只生成消费者草稿，不自动发布；
- builder 更新不覆盖旧 artifact；
- v1 扫描正确输出自动、半自动和人工迁移等级；
- v1 转 v2 生成新源包草稿和报告，不覆盖原 v1；
- 无法迁移的 v1 继续稳定运行。

门槛：`P6-GATE-VER-01`、`P6-GATE-CMP-01`。

---

## 9. 真实试点矩阵

### 9.1 试点元素选择

至少选择 8 个真实元素，且覆盖下列能力。一个元素可覆盖多项，但不能只使用演示型 Hello World。

| 试点类别 | 最低数量 | 必须覆盖 |
|---|---:|---|
| 简单展示 | 1 | 基础 Props、样式、资源 |
| 表单交互 | 1 | 双向配置、事件、校验 |
| 多模块复杂元素 | 1 | 多 TSX/TS、Less、图片、类型 |
| configured API | 1 | 编辑配置与运行映射 |
| declared API | 1 | SDK 权限、错误和审计 |
| 文件上传 | 1 | 高风险 capability、安全审核 |
| 事件与方法 | 1 | 多事件、方法、ref 生命周期 |
| v1 迁移 | 2 | 自动/半自动各至少一个 |

另准备构建失败、加载失败、渲染失败和权限拒绝元素作为负向样例。

### 9.2 试点页面选择

- 2 个应用页面；
- 1 个业务组件编辑和消费场景；
- 1 个组装式独立运行页；
- 1 个引导式流程，包含初始和后续节点；
- 1 个 v1/v2 混合页面；
- 1 个同元素多实例页面；
- 1 个同 elementId 多版本页面；
- 1 个具备接口调用和文件上传的高风险页面。

### 9.3 试点开发者盲测

选择未参与平台实现的可信内部开发者，只提供正式开发者材料，完成：

1. 获取官方模板；
2. 修改展示元素并声明 Props；
3. 接入一个 SDK capability；
4. 本地 mock 验证；
5. 打包并上传；
6. 根据 diagnostics 修复至少一个错误；
7. 完成预览、提交审核和发布；
8. 在主编辑器和独立页面使用；
9. 发布新版本并显式升级页面；
10. 查阅错误手册完成一次故障定位。

记录完成时长、求助次数、文档缺口、错误定位时长和失败步骤。依赖实现人员口头补充才能完成的步骤，必须转化为文档或产品改进项。

### 9.4 生产灰度试点

- 只开放给明确白名单租户、上传者和页面；
- 试点元素通过安全审核并使用正式签名产物；
- 先内部非关键页面，再低风险业务页面；
- 每批至少保留一个完整业务观察周期；
- 记录流量、加载、渲染、SDK、业务错误和用户反馈；
- 每个页面预先验证元素版本回退和平台开关回退；
- 任何 P0/P1 或安全异常立即停止扩大灰度。

门槛：`P6-GATE-PILOT-01`、`P6-GATE-PILOT-02`。

---

## 10. 自动化回归体系

### 10.1 测试分层

| 层级 | 主要对象 | 执行时机 |
|---|---|---|
| 单元 | package reader、Analyzer、manifest、migration、Registry | 每次提交 |
| Schema/快照 | `ngap.json`、platform/runtime manifest、diagnostics | 每次提交 |
| Contract | SDK host、runtime adapter、API DTO | 每次合并 |
| 集成 | 上传→构建→预览→审核→发布→运行 | 每日和发布候选 |
| E2E | 五步编辑器、主编辑器、独立页、升级迁移 | 每日和发布候选 |
| 安全 | 恶意 fixture、依赖和签名 | 每日增量、每周全量 |
| 性能 | 构建、加载、渲染、内存 | 每周和发布候选 |
| 生产探针 | runtime info、manifest、artifact 可用性 | 持续 |

### 10.2 双运行时 Contract Suite

同一套用例通过 host factory 分别运行在 main 和 materials：

- identity resolution；
- Registry load/cache/release；
- Props adapter；
- event hook；
- method/ref；
- SDK namespaces；
- error code 和 permission deny；
- context disposal；
- v1/v2 branch；
- multi-version；
- render fallback。

两个宿主确有差异时，必须在 adapter contract 显式声明并经架构评审，不能复制测试后分别修改期望值。

### 10.3 CI 硬门槛

- 契约用例全绿；
- `ngap.json`/manifest Schema 兼容检查通过；
- v2 生产 chunk 不包含 Babel、JSZip、Analyzer 和浏览器构建器；
- 禁止公开导出内部 Store、request、CrossAPI、Token；
- 禁止 v2 运行代码按 URL 或内容猜协议；
- 禁止 page/materials 新增重复 Registry 或 SDK host 核心实现；
- 固定 fixtures 的 diagnostics 和 manifest 快照受控变更；
- 高危依赖和扫描规则无未批准放行；
- 报告关联具体 build 和 artifact identity。

### 10.4 Flaky 用例治理

- 失败自动重跑只用于识别 flaky，首次失败仍计入趋势；
- flaky 用例必须建缺陷并指定 owner；
- 不得通过无限重试把用例标绿；
- 核心身份、签名、升级事务和资源泄漏用例不允许跳过；
- 连续三次发布候选执行结果需稳定。

---

## 11. 性能与容量验收

### 11.1 阈值冻结方法

具体数值在六期第 1 周根据现网基础页面基线冻结，所有阈值同时记录：

- 测试环境和机器规格；
- 网络条件和 CDN 缓存状态；
- 页面 fixture 和元素数量；
- artifact 总字节、chunk 数和依赖；
- 冷启动或热缓存；
- 样本数量、P50/P95/P99；
- 对照版本和可接受回归百分比；
- 超阈值时的阻断等级。

不能只写“体验流畅”或只记录平均值。

### 11.2 服务端构建指标

- queue wait P50/P95/P99；
- source download、unzip、analyze、scan、bundle、publish 各阶段耗时；
- 简单/复杂/资源型源包总构建耗时；
- 并发 1/5/10/峰值下吞吐和失败率；
- CPU、内存、磁盘、临时目录使用；
- worker 扩缩容和积压恢复时间；
- 相同 packageHash 的幂等和缓存收益；
- 超时任务和 workspace 清理成功率；
- artifact 大小、chunk 数和 source map 策略。

### 11.3 运行加载指标

- runtime info API P50/P95/P99；
- manifest 和 ESM/CSS 请求耗时；
- Registry 冷/热缓存命中率；
- 1/10/30 个不同 v2 元素首屏；
- 同一 artifact 30 实例首屏和内存；
- 同一 elementId 多版本；
- v1/v2 混合页面；
- 引导式后续节点增量加载；
- 首次可见、首次可交互和自定义元素渲染完成时间；
- 单元素失败后的页面可用性；
- 独立页面 v2 资源总字节和请求数。

### 11.4 SDK 指标

- 各 capability 调用成功率和 P50/P95/P99；
- 1/10/50 并发；
- 大响应和分页；
- 文件上传允许上限；
- 超时、取消和页面销毁；
- 权限拒绝开销；
- host 不可用时的失败时间和重试策略。

### 11.5 内存与资源释放

场景至少包括：

- 页面打开/关闭 50 次；
- 引导式节点切换 100 次；
- 同元素预览打开/关闭 100 次；
- 同 artifact 多实例增删；
- SDK 订阅建立/释放；
- 文件上传中途取消；
- render error 后重新加载；
- 版本升级 preview 打开/关闭。

检查：

- Registry refCount 回落；
- style tag 无无限增长；
- Blob URL 全部 revoke；
- component ref 和事件 handler 释放；
- SDK subscription/timer/AbortController 清理；
- heap snapshot 无随次数线性增长；
- preview 不残留 `window` 全局组件。

### 11.6 性能门槛

`P6-GATE-PERF-01` 至少要求：

- 关键指标已冻结阈值并自动采集；
- 所有硬阈值通过；
- 没有持续增长的资源泄漏；
- v2 生产路径未引入浏览器编译依赖；
- 超阈值项有复现、原因、修复和复测证据；
- 性能优化未跳过签名、hash、identity 或错误隔离。

---

## 12. 安全验收

### 12.1 威胁模型复核

至少覆盖：

- 恶意或被篡改 ZIP；
- 路径穿越、压缩炸弹、恶意资源和依赖；
- 构建 worker 逃逸、网络访问和资源耗尽；
- 源包、manifest、ESM、CSS、asset 任一环节篡改；
- 上传者、审核者、发布者权限越权；
- SDK capability 越权和参数滥用；
- Token、Cookie、用户信息和业务数据泄露；
- 全局 CSS、DOM、window 和第三方库的可信主窗口风险；
- v1 兼容路径绕过 v2 治理；
- 对象存储/CDN 缓存投毒和 MIME 错误；
- 下线/revoke 后继续加载；
- 日志、错误、source map 和遥测泄密。

### 12.2 源包与构建安全

- ZIP Slip、绝对路径、软链接、大小写冲突和压缩炸弹拦截；
- 文件数、大小、深度、扩展名和压缩比限制；
- import 白名单和锁定依赖版本；
- fetch/XHR/WebSocket、动态代码执行和危险全局访问规则；
- 构建容器非特权、只读基础镜像、任务目录隔离；
- 默认禁止构建任务出网；
- CPU、内存、进程、文件句柄、磁盘和时间限制；
- builder 镜像签名、漏洞扫描和 SBOM；
- 临时源包、日志和失败 workspace 保留/清理策略；
- 扫描规则放行有责任人、有效期和审计。

### 12.3 产物与加载安全

- packageHash、manifestHash、artifactHash 链路一致；
- runtime manifest 签名、keyId 和有效期校验；
- 内容地址不可变且禁止覆盖；
- 错误签名、未知 keyId、hash 不一致和 identity 不一致均拒绝执行；
- 不回退加载源码或未签名 URL；
- CORS、MIME、`nosniff` 和缓存头正确；
- CSP 违规可上报且不泄露敏感内容；
- key rotation 期间新旧合法产物按策略可验证；
- revoke list 更新和缓存失效时效满足要求；
- 已撤销产物展示安全 fallback 和处理指引。

### 12.4 SDK 与业务权限

- capability 权限来自冻结 manifest 和审核结果；
- 页面、租户、用户和业务对象边界由宿主校验；
- 组件不能通过参数注入绕过 configured API；
- 文件上传由服务端再次校验类型、大小和权限；
- 变量和消息能力防止跨页面/跨租户访问；
- 审计记录 element/version/artifact、capability、结果和 traceId；
- 日志不记录 Token、Cookie、文件内容和完整敏感响应；
- 组件只得到最小化业务结果，不得到平台内部请求对象。

### 12.5 可信执行边界签署

首期采用 trusted-main-window 时，安全结论必须明确：

- 上传者限定为可信内部角色；
- 静态扫描和 SDK 权限是治理/审计边界，不是浏览器强沙箱；
- 组件仍可能访问同窗口 DOM 和部分全局能力；
- 禁止把首期方案描述为对不可信第三方代码的强隔离；
- 开放外部开发者前必须重新评估 iframe/realm/进程隔离；
- 业务试点知晓并接受这一边界。

门槛：`P6-GATE-SEC-01`、`P6-GATE-SEC-02`、`P6-GATE-SEC-03`。

---

## 13. 稳定性与故障演练

### 13.1 演练通用模板

每次演练记录：

- drillId、目标和负责人；
- 环境、时间窗和影响范围；
- 初始状态与注入方式；
- 预期指标、告警和用户表现；
- 实际发现、确认和处置时间；
- RTO/RPO 或恢复目标；
- 回退步骤和实际恢复时间；
- 数据一致性检查；
- 遗留问题、责任人和复测日期。

### 13.2 必做演练清单

| 演练编号 | 场景 | 关键预期 |
|---|---|---|
| `P6-DRILL-BLD-01` | 构建 worker 异常退出 | 任务可恢复或明确失败，不产生半产物 |
| `P6-DRILL-BLD-02` | 队列积压 | 告警、限流、扩容和恢复可用 |
| `P6-DRILL-BLD-03` | 构建超时/磁盘满 | 任务隔离、清理和诊断正确 |
| `P6-DRILL-OBJ-01` | 对象存储上传失败 | 发布事务不落为成功 |
| `P6-DRILL-CDN-01` | CDN 超时或 5xx | 单元素 fallback、告警和恢复 |
| `P6-DRILL-CDN-02` | MIME/CORS 配置错误 | 拒绝执行、定位明确 |
| `P6-DRILL-SIGN-01` | 签名/内容被篡改 | 运行时拒绝且不降级源码 |
| `P6-DRILL-KEY-01` | 签名密钥轮换 | 新旧 key 窗口和撤销策略正确 |
| `P6-DRILL-REV-01` | artifact 紧急撤销 | 缓存及时失效，受影响页可定位 |
| `P6-DRILL-API-01` | runtime info 部分失败 | 成功项继续，失败项单独 fallback |
| `P6-DRILL-SDK-01` | SDK 服务超时 | 可取消、错误隔离、无无限重试 |
| `P6-DRILL-DB-01` | 发布事务数据库失败 | version/候选/推荐版本无半状态 |
| `P6-DRILL-ROLLBACK-01` | 平台前端版本回退 | 已知稳定 runtime 恢复 |
| `P6-DRILL-ROLLBACK-02` | 元素版本降级 | 精确旧 artifact 恢复且可审计 |

### 13.3 数据一致性核查

每次发布和故障演练后核对：

- element version 与 buildId；
- packageHash、manifestHash、artifactHash；
- runtime manifest URL 与签名；
- recommended version；
- consumer locked identity 和 usage relation；
- review/publish audit；
- revoke/downline 状态；
- 对象存储实际文件与数据库引用。

### 13.4 稳定性门槛

`P6-GATE-OPS-01` 要求：

- 全部必做演练执行并有证据；
- 关键告警在目标时间内触发；
- 无不可恢复数据不一致；
- 已发布 artifact 未被覆盖或删除；
- 回退能恢复到已知稳定平台和元素版本；
- P0/P1 演练问题关闭并复演通过。

---

## 14. 可观测性、SLO 与告警

### 14.1 统一 Identity

构建、发布、运行和 SDK 事件至少携带适用的：

```text
traceId / tenantId / provId
elementId / elementVersion / instanceId
packageHash / buildId / artifactHash
builderVersion / sdkVersion
pageId / runtimeType / stage / errorCode
```

### 14.2 核心看板

1. 构建：队列深度、等待时间、各阶段耗时、成功率、错误码、workspace 清理；
2. 发布：审核、发布、失败事务、产物大小、签名、下线和撤销；
3. 运行：runtime info、manifest/ESM/CSS、首次渲染、错误率、Registry 命中；
4. SDK：capability 调用量、成功率、P95、权限拒绝、超时和清理异常；
5. 版本：v1/v2、locked/legacy-latest、升级、降级和迁移；
6. 安全：扫描阻断、签名/hash 失败、CSP、异常上传和权限越权。

### 14.3 SLI/SLO 建议

第 1 周冻结数值，至少定义：

- 构建服务可用性、成功率和完成时延；
- runtime info 服务可用性和 P95；
- 已发布 manifest/artifact 可获取率；
- v2 元素加载和渲染成功率；
- SDK capability 成功率和 P95；
- 签名验证错误处理正确率；
- 告警发现时间和关键故障恢复时间。

业务代码抛错与平台加载失败分开统计，避免把组件自身错误隐藏为平台可用性。

### 14.4 告警分级

| 级别 | 示例 | 处置 |
|---|---|---|
| P0 | 大面积 artifact 无法加载、签名链路失效、跨租户越权 | 立即停止灰度并应急 |
| P1 | 构建长时间不可用、运行失败率显著升高、回退失败 | 值班响应，冻结发布 |
| P2 | 单租户/单 capability 异常、性能持续退化 | 工作时段处理，评估灰度 |
| P3 | 非关键诊断、文档或体验问题 | 纳入迭代 |

门槛：`P6-GATE-OBS-01`。

---

## 15. 开发者与运维交付物

### 15.1 官方模板 ZIP

模板必须：

- 使用规范目录和 `ngap.json`；
- 展示最小 Props、默认值、事件、方法和 `context`；
- 包含 Less/CSS 和静态资源示例；
- 使用当前白名单外部依赖；
- 不访问 Store、request、CrossAPI、Token；
- 不使用浏览器运行时编译约定；
- 能通过 Analyzer、server build 和完整审核；
- 标注 templateVersion、protocolVersion 和兼容 SDK 版本；
- 提供最小、表单、接口、文件上传四类变体或示例。

### 15.2 SDK 发布包

`@ngap/component-sdk` 发布资料包括：

- 类型包和版本说明；
- namespace/capability 目录；
- 参数、返回值和稳定错误码；
- 权限声明方式；
- context 生命周期和清理规则；
- configured API / declared API 示例；
- 文件上传边界；
- main/materials 一致性说明；
- SDK 兼容策略和废弃流程；
- changelog 和升级指南。

### 15.3 协议与开发手册

- `ngap.json` 字段参考；
- ZIP 根目录、路径、大小和资源限制；
- Props/events/methods 推导与人工补充；
- 外部依赖白名单和精确版本；
- 诊断错误码、原因和修复建议；
- 本地 mock 的能力和与生产差异；
- 五步上传和预览流程；
- 审核、发布、下线和撤销；
- 版本策略、recommended version 和实例锁定；
- v1 兼容性扫描与迁移指南；
- 常见运行错误和排障路径；
- 安全开发规范和禁止项。

### 15.4 操作与运维手册

- 上传者、审核者、发布者权限申请；
- 构建任务诊断和重试；
- artifact、签名和身份核查；
- runtime info、Registry 和 SDK 排障；
- 队列、对象存储、CDN 和数据库应急；
- 密钥轮换和 artifact 撤销；
- 元素版本降级和平台回退；
- v1/v2 统计、使用关系和迁移运营；
- 日志检索和敏感信息规范；
- 值班联系人、升级路径和复盘模板。

### 15.5 文档验收

- 实现负责人技术校验；
- 安全负责人敏感信息和边界校验；
- 未参与实现的开发者盲测；
- 链接、示例包和命令可用性检查；
- 文档版本与平台正式版本一致性检查。

门槛：`P6-GATE-DX-01`。

---

## 16. 灰度发布与回退

### 16.1 功能开关

| 开关 | 粒度 | 作用 |
|---|---|---|
| v2 上传入口 | 角色/租户 | 控制谁可创建 v2 |
| v2 审核发布 | 角色/环境 | 控制生产发布 |
| v2 编辑器菜单 | 租户/应用 | 控制是否可拖入 v2 |
| v2 main runtime | 租户/页面 | 主编辑器/预览启用 |
| v2 materials runtime | 租户/页面 | 独立运行启用 |
| v2 SDK 高风险能力 | capability/租户 | 单独控制上传等能力 |
| v1 新建入口 | 角色/租户 | 分步收口 v1 新建 |

开关只控制准入，不能改变已保存 v2 identity 或把 v2 静默降级为 v1。

### 16.2 灰度批次

1. 开发/测试团队内部页面；
2. 可信组件开发者和非关键业务页面；
3. 选定业务租户低流量页面；
4. 扩大到批准的内部租户；
5. 正式推广范围。

每批进入下一批前检查：

- 观察窗口达到约定时长；
- P0/P1 为 0；
- 加载、渲染、SDK、业务错误和性能无显著回归；
- 关键告警无漏报；
- 用户反馈完成分级；
- 平台和元素回退均可执行。

### 16.3 发布冻结

以下期间冻结协议、builder、SDK 和 runtime 的非修复性变更：

- 发布候选全量回归；
- 安全测试窗口；
- 生产演练窗口；
- 正式推广前至少 3 个工作日；
- 每批灰度关键观察窗口。

紧急修复进入后，重新评估影响矩阵并重跑对应证据。

### 16.4 回退层级

1. 停止扩大白名单；
2. 关闭新建、上传和发布入口；
3. 对问题元素撤销 recommended version 或精确降级；
4. 对受影响页面回退已保存的旧 element identity；
5. 回退平台 runtime 到已知稳定版本；
6. 必要时撤销问题 artifact 并展示安全 fallback；
7. 保持 v1 页面继续使用既有 v1 runtime。

回退不得：

- 覆盖历史 artifact；
- 将锁定实例静默切换 latest；
- 在签名失败时加载原始源码；
- 删除无法迁移的 v1 数据；
- 丢失审核、发布和回退审计记录。

门槛：`P6-GATE-REL-01`、`P6-GATE-REL-02`。

---

## 17. v1/v2 运营治理

### 17.1 共存原则

- v1 和 v2 使用明确协议字段分流；
- v1 运行兼容期限由正式策略定义，不在六期直接删除；
- v2 新实例必须锁定版本和 artifact；
- v1 legacy-latest 风险在编辑器和统计中可见；
- 无法自动迁移的 v1 不影响 v2 正式推广；
- v1 迁移生成新的 v2 草稿和版本，不覆盖原记录；
- v1 新建停止与 v1 runtime 下线是两个独立决策。

### 17.2 运营指标

- v1/v2 元素定义、版本和页面实例数量；
- locked 与 legacy-latest 数量；
- v2 创建、构建、审核和发布转化率；
- v1 扫描等级和迁移完成率；
- v2 构建、加载、渲染和 SDK 错误趋势；
- 版本升级、降级和回滚次数；
- 高风险权限使用和拒绝次数；
- 按业务/租户的试点覆盖。

### 17.3 v1 新建收口建议

只在以下条件全部满足后评审停止新建 v1：

- v2 正式推广门槛通过；
- 官方模板和开发文档可独立使用；
- 典型 v1 能完成迁移或有明确保留理由；
- v2 构建、运行和 SDK SLO 稳定；
- 业务、支持和运维具备处理能力；
- 已提供例外申请与应急恢复流程。

停止新建 v1 也不得删除既有 v1 编辑、预览和运行能力。

---

## 18. 缺陷管理与变更控制

### 18.1 缺陷分级

| 等级 | 判定示例 | 推广规则 |
|---|---|---|
| P0 | 数据/权限重大事故、大面积不可用、无法回退 | 必须关闭并复测/复演 |
| P1 | 核心闭环失败、版本错误、签名绕过、双运行时关键不一致 | 必须关闭并复测 |
| P2 | 有可靠规避的非核心缺陷、局部性能问题 | 可经联合批准遗留 |
| P3 | 文案、低频体验和非阻断优化 | 可排入后续迭代 |

### 18.2 遗留项字段

每个允许遗留的 P2/P3 记录：

- 缺陷编号和描述；
- 影响版本、租户、runtime 和元素类型；
- 发生概率与最大影响；
- 临时规避方式；
- 是否影响数据、权限、版本和回退；
- 责任人、修复版本和截止日；
- 产品、测试和对应技术负责人批准；
- 灰度期间的监控指标。

### 18.3 变更影响评估

| 变更 | 最少重跑范围 |
|---|---|
| `ngap.json`/manifest | Schema、Analyzer、builder、双 runtime、全部 fixtures |
| builder/扫描策略 | 构建、安全、产物、性能、重现性 |
| SDK contract | 主/独立 host、权限、安全、试点元素 |
| Registry/runtime | 双 runtime、multi-version、内存、性能 |
| 版本/发布数据 | 生命周期、升级/回滚、数据一致性、演练 |
| 文档/模板 | 开发者盲测和示例构建 |

---

## 19. 验收报告与证据归档

### 19.1 主报告结构

`CUSTOM_ELEMENT_V2_P6_TEST_REPORT` 包含：

1. 验收范围和排除项；
2. 基线版本和环境；
3. 需求覆盖率；
4. `CE-ACC-*` 结果；
5. 扩展功能与非功能结果；
6. 双运行时一致性；
7. 性能与容量摘要；
8. 安全摘要；
9. 故障与回退演练摘要；
10. 试点与开发者盲测摘要；
11. 缺陷统计和遗留项；
12. 门槛结果；
13. 推广建议和限制条件。

### 19.2 证据存储

- 报告进入版本库或受控文档库；
- 大型日志、trace、heap、视频和压测数据进入受控对象存储；
- 主报告保存不可变证据地址和 hash；
- 权限只向项目和审计角色开放；
- 敏感日志按数据策略脱敏和过期；
- 发布结论引用精确报告版本，不引用可覆盖的 `latest` 链接。

### 19.3 签署表

| 领域 | 必签角色 | 结论 |
|---|---|---|
| 产品范围 | 产品负责人、试点业务负责人 | 通过/不通过 |
| 架构 | 架构、前端、后端负责人 | 通过/不通过 |
| 测试 | 测试负责人 | 通过/不通过 |
| 安全 | 安全负责人 | 通过/不通过 |
| 运维 | 运维负责人 | 通过/不通过 |
| 推广 | 项目/产品最终决策人 | 允许/附条件允许/不允许 |

---

## 20. 实施任务

### P6-T1：验收基线与需求追踪

- 核验一至五期退出门槛；
- 冻结代码、协议、builder、SDK、环境和数据基线；
- 建立 `CE-*` → 设计 → 实现 → 用例 → 证据追踪矩阵；
- 冻结门槛、阈值和签署角色；
- 建立证据库和变更控制流程。

交付：追踪矩阵 v1、基线清单、门槛清单、责任矩阵。

### P6-T2：Fixture 与自动化回归收口

- 补齐固定源包和页面 fixtures；
- 统一 main/materials contract suite；
- 完成 CI Schema、bundle 和安全 gate；
- 自动化 `CE-ACC-*` 可自动部分；
- 治理 flaky 和测试数据清理。

交付：fixture catalog、自动化报告、CI gate 结果。

### P6-T3：全链路功能与真实试点

- 完整执行 `CE-ACC-001`～`CE-ACC-031`；
- 8 类以上真实元素；
- 应用、业务组件、组装式、引导式页面；
- v1/v2、多实例、多版本；
- 开发者盲测和问题收敛。

交付：功能验收报告、试点元素/页面清单、盲测报告。

### P6-T4：性能、容量与内存

- 冻结性能环境和阈值；
- 构建队列和 worker 容量；
- runtime info、artifact 加载和首屏；
- SDK 并发和文件上传；
- 资源释放和长期稳定性；
- 优化、复测和趋势基线。

交付：性能容量报告、基准数据、容量建议。

### P6-T5：安全测试与故障演练

- 威胁模型复核；
- 源包、构建、产物、加载和 SDK 安全测试；
- trusted-main-window 边界签署；
- 队列、存储、CDN、签名、密钥、撤销、数据库演练；
- 平台和元素双层回退演练。

交付：安全报告、演练报告、整改与复演证据。

### P6-T6：开发者与运维资料发布

- 官方模板 ZIP 和示例；
- SDK 包、类型和 changelog；
- 协议、能力、错误和安全手册；
- v1 迁移指南；
- 上传审核发布手册；
- 运维应急和排障手册；
- 开发者盲测复验。

交付：版本化开发者套件、运维手册、资料验收结果。

### P6-T7：监控、SLO 与运营治理

- 统一 identity/trace；
- 构建、发布、运行、SDK、安全、版本看板；
- SLI/SLO 和告警阈值；
- 值班和升级路径；
- v1/v2 指标和 v1 新建策略评审。

交付：看板、告警、SLO、运营策略和责任清单。

### P6-T8：生产灰度与缺陷收敛

- 功能开关和白名单；
- 分批生产试点；
- 观察窗口、用户反馈和指标评审；
- P0/P1 清零；
- P2/P3 遗留审批；
- 灰度停止与回退实操。

交付：灰度报告、缺陷清单、回退记录和扩大灰度建议。

### P6-T9：联合验收与推广决策

- 汇总追踪、测试、性能、安全、演练、试点和文档证据；
- 逐项判定 `P6-GATE-*`；
- 联合评审遗留项和限制条件；
- 完成产品、架构、测试、安全、运维签署；
- 输出正式推广范围和后续 backlog。

交付：`CUSTOM_ELEMENT_V2_P6_RELEASE_DECISION` 和完整证据索引。

---

## 21. 任务依赖与排期

### 21.1 依赖关系

```text
P6-T1 基线/追踪
  ├─ P6-T2 自动化
  ├─ P6-T3 功能/试点
  ├─ P6-T4 性能容量
  ├─ P6-T5 安全/演练
  ├─ P6-T6 开发者资料
  └─ P6-T7 监控治理
       ↓
P6-T8 生产灰度/缺陷收敛
       ↓
P6-T9 联合验收/推广决策
```

P6-T2～T7 可在基线冻结后并行；P6-T8 依赖安全、运维、核心功能和回退门槛通过；P6-T9 依赖全部硬门槛有最终证据。

### 21.2 建议 6 周排期

| 周次 | 主要工作 | 里程碑 |
|---|---|---|
| 第 1 周 | T1 基线/追踪；T2 fixture；T4 阈值；T5 威胁模型；T6 资料盘点；T7 指标盘点 | M6.1 验收基线冻结 |
| 第 2 周 | T2 自动化；T3 全链路第一轮；T4 构建/运行基准；T5 安全测试 | M6.2 全量测试启动 |
| 第 3 周 | T3 复杂/双运行时/版本；T4 容量内存；T5 故障演练；T6 盲测 | M6.3 主要缺陷暴露 |
| 第 4 周 | 缺陷修复复测；T5 回退复演；T7 看板告警；预发布候选回归 | M6.4 灰度准入评审 |
| 第 5 周 | T8 生产白名单灰度；观察与缺陷收敛；资料正式版本 | M6.5 生产试点完成 |
| 第 6 周 | 扩大灰度或延长观察；P0/P1 清零；T9 联合评审 | M6.6 推广结论 |

如果第 3～5 周仍发现协议、签名、版本锁定或双运行时架构缺陷，周期应顺延，不能压缩观察窗口。

### 21.3 4～7 周调整规则

- 4 周：仅适用于前五期自动化、资料和试点已提前完成，且无重大缺陷；
- 5～6 周：标准安排；
- 7 周及以上：性能/安全整改、演练失败、观察周期不足或业务窗口受限；
- 至少保留 2 周缺陷收敛与复测窗口；
- 灰度观察不能与大规模协议/SDK/builder 变更同时进行。

### 21.4 工作量

| 角色 | 人日 |
|---|---:|
| 前端平台 | 12～20 |
| 后端/构建平台 | 10～18 |
| 测试 | 28～40 |
| 安全/架构 | 10～16 |
| 运维 | 8～14 |
| 产品/文档/试点 | 10～18 |
| 合计 | 78～126 |

测试、安全、运维和试点业务必须真实投入，不能全部折算给前后端自验。

---

## 22. 推广门槛清单

### 22.1 硬门槛

| Gate ID | 门槛 |
|---|---|
| `P6-GATE-BASE-01` | 第一至五期退出门槛全部满足 |
| `P6-GATE-PKG-01` | 正式包只认受约束 ZIP + `ngap.json`，路径与容量安全通过 |
| `P6-GATE-ANA-01` | Analyzer/manifest 可追踪、确定且诊断可修复 |
| `P6-GATE-BLD-01` | 服务端构建、扫描、隔离和故障恢复通过 |
| `P6-GATE-BLD-02` | 审核/发布/运行使用同一不可变签名 artifact |
| `P6-GATE-MGT-01` | 五步编辑器和生命周期/角色/审计通过 |
| `P6-GATE-EDT-01` | 应用与业务组件主编辑器 v2 闭环通过 |
| `P6-GATE-RUN-01` | 独立 runtime 通过，v2 生产不编译源码 |
| `P6-GATE-RUN-02` | 主/独立契约、v1/v2、多实例、多版本通过 |
| `P6-GATE-SDK-01` | SDK 两宿主契约和生命周期通过 |
| `P6-GATE-SDK-02` | 权限拒绝、审计和高风险 capability 通过 |
| `P6-GATE-VER-01` | 实例锁定、升级、降级和精确回滚通过 |
| `P6-GATE-CMP-01` | v1 兼容和代表性迁移通过，不删除 v1 runtime |
| `P6-GATE-PERF-01` | 性能、容量和资源释放达到冻结阈值 |
| `P6-GATE-SEC-01` | 源包、构建、产物和加载安全通过 |
| `P6-GATE-SEC-02` | SDK/业务权限和敏感信息保护通过 |
| `P6-GATE-SEC-03` | trusted-main-window 边界书面确认 |
| `P6-GATE-OPS-01` | 监控告警和全部必做演练通过 |
| `P6-GATE-OBS-01` | 核心看板、SLI/SLO、trace 和告警上线 |
| `P6-GATE-DX-01` | 模板、SDK、手册和开发者盲测通过 |
| `P6-GATE-PILOT-01` | 真实元素和页面矩阵通过 |
| `P6-GATE-PILOT-02` | 生产灰度观察通过 |
| `P6-GATE-REL-01` | 功能开关和分批灰度策略可用 |
| `P6-GATE-REL-02` | 平台与元素双层回退实操通过 |

### 22.2 缺陷门槛

- P0 = 0；
- P1 = 0；
- P2 均有影响、规避、责任人、版本、截止日和联合批准；
- P3 已记录且不影响硬门槛；
- 不存在被隔离跳过的核心自动化用例；
- 所有修复完成影响范围复测；
- 灰度期间新增 P0/P1 必须重新计算观察窗口。

### 22.3 需求门槛

- 全部 `CE-ACC-001`～`CE-ACC-031` 通过；
- 全部 `CE-NFR-*` 有明确证据；
- 需求追踪矩阵硬需求覆盖率 100%；
- not-applicable 项有产品和架构批准且不属于硬门槛；
- 每个硬门槛至少有一个已复核主证据。

---

## 23. 风险与控制

| 风险 | 控制 |
|---|---|
| 六期变成功能补开发期 | 前置门槛核验，架构缺口退回对应阶段 |
| 只测简单展示组件 | 强制真实试点矩阵和复杂/高风险能力 |
| 两个 runtime 标准漂移 | 统一 contract suite 和 identity fixtures |
| 压测环境与生产差异过大 | 记录环境差异，关键项在预发布/灰度复核 |
| 为通过验收降低扫描或签名 | 安全硬门槛不可附条件放行 |
| 灰度问题无法精确回退 | 提前执行平台和元素双层回退演练 |
| 文档依赖口头解释 | 未参与开发者盲测，问题转正式改进项 |
| P2 遗留失控 | 每项责任人、截止日、影响、监控和联合批准 |
| 自动重跑掩盖 flaky | 首次失败计入趋势，核心用例禁止跳过 |
| 监控没有完整 identity | trace schema 作为准入门槛 |
| 生产试点扩张过快 | 分批白名单和观察窗口，异常停止扩大 |
| v1 迁移被误解为强制下线 | 明确 v1 runtime 保留和独立决策 |
| trusted 主窗口被误称强隔离 | 安全书面边界和可信角色限制 |
| 报告链接可覆盖或过期 | 版本化报告、不可变证据地址和 hash |

---

## 24. 六期完成门槛

1. `CUSTOM_ELEMENT_V2_P6_REQUIREMENT_TRACE` 全量完成并经测试、产品、架构复核；
2. `CE-ACC-001`～`CE-ACC-031` 全部通过；
3. 全部 `P6-GATE-*` 硬门槛通过；
4. 主 `src` 和独立 `page/materials` 通过同一契约套件；
5. 生产 v2 路径不下载 ZIP、不加载 Analyzer/JSZip/Babel、不编译原始源码；
6. v1/v2、多实例、多版本、引导式增量加载和单元素错误隔离通过；
7. 版本锁定、升级、降级、回滚和 v1 迁移试点通过；
8. 性能、容量和资源释放达到冻结阈值；
9. 安全测试、签名篡改、权限越权和 trusted-main-window 边界确认通过；
10. 构建队列、对象存储、CDN、密钥、撤销和双层回退演练通过；
11. 构建、发布、运行、SDK、安全和版本治理看板/告警上线；
12. 官方模板、SDK、协议、错误、迁移和运维资料通过盲测；
13. 生产灰度完成约定观察窗口；
14. P0/P1 为 0，P2/P3 遗留完成正式批准；
15. 产品、架构、测试、安全、运维和试点业务共同签署推广结论；
16. 未达到强隔离前，上传角色继续限制为可信内部人员。

任一项未满足，本期保持进行中或结论为“不允许推广”，不能以文档已生成视为完成。

---

## 25. 正式推广后的后续事项

以下事项进入独立 backlog，不阻塞首期可信内部推广，但不得混入本期范围：

- 强隔离 runtime 技术选型和原型；
- 外部第三方开发者准入；
- 公开组件市场、评分、计费和生态治理；
- 容器 children 协议和可视化插槽；
- 更完整的本地 CLI、IDE 插件和远程调试；
- 更细粒度 SDK capability 和租户策略；
- v1 runtime 最终下线评估；
- 跨平台组件制品复用；
- builder 多版本长期托管和自动重建策略；
- 更严格的供应链证明、透明日志和制品签名体系。

这些事项必须单独立项，重新定义威胁模型、需求、排期和验收门槛。

---

## 26. 最终结论模板

```text
Decision: ALLOW | ALLOW_WITH_CONDITIONS | REJECT
Baseline:
Requirement Coverage:
CE-ACC Result:
Hard Gates:
P0/P1 Defects:
Approved P2/P3:
Pilot Scope:
Observed Period:
Security Boundary:
Rollback Evidence:
Allowed Tenant/Roles:
Restrictions:
Follow-up Owners/Dates:
Signatures:
```

只有 `ALLOW` 或符合本方案限制的 `ALLOW_WITH_CONDITIONS` 才能进入批准范围内的正式推广；任何条件不得豁免安全、不可变产物、版本锁定、双运行时和生产不编译源码等硬门槛。
