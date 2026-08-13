# 自定义元素 v2 五期版本升级与 v1 迁移开发方案

## 1. 文档信息

| 项目 | 内容 |
|---|---|
| 文档标识 | `CUSTOM_ELEMENT_V2_PHASE5_TECHNICAL_PLAN` |
| 对应期次 | 第五期：版本升级与 v1 迁移 |
| 前置方案 | 第一至四期全部完成，具备不可变 v2 版本和精确运行能力 |
| 主要需求 | `CE-VER-*`、`CE-CMP-*`、版本/回滚/迁移验收场景 |
| 本期性质 | 长期治理期，不改变 v2 基础协议，不删除 v1 运行兼容 |

---

## 2. 当前基线与核心问题

### 2.1 元素管理已有版本字段但语义不足

当前元素管理 DTO 有 `elementVersion`，页面也展示版本，但现有运行加载主要按 `elementId` 查询三文件，页面实例未完整锁定 artifact。因此“元素管理页面有版本字符串”不等于运行时版本治理完成。

### 2.2 页面/业务组件保存链路复杂

版本字段需要贯穿：

- 页面 `elements`/`elementsMap`；
- `getComponentList()` 序列化；
- 应用 `sceneData`；
- 业务组件 `/appComponent/saveAppComponent`；
- 应用编排 CanvasTop；
- `dealPageData()` 主/独立/Worker 多份实现；
- 模板、历史、复制、分享和预览；
- 引导式流程节点加载业务组件。

三、四期已加入并验证字段；五期在此基础上建设使用关系和升级，不再从 elementId 猜当前页面使用版本。

### 2.3 v1 数据只有旧三文件

v1 可能包含：

- 标准 Schema；
- Schema 中函数型 customRequest/condition/render；
- 组件直接访问 `window`、Store、request、CrossAPI；
- 内部 utils import；
- 非白名单依赖；
- 全局 CSS。

因此迁移必须先评估，再生成草稿；不能提供“全部自动转换并发布”。

---

## 3. 本期目标与边界

### 3.1 必须交付

- 元素版本列表和不可变状态；
- 页面/业务组件/应用对元素版本的使用关系索引；
- 编辑器新版本检测；
- 当前与目标版本 Contract Diff；
- 显式升级向导；
- 升级预览；
- 声明式配置迁移；
- 复杂迁移人工确认；
- 升级事务和失败回滚；
- 精确版本降级/回滚；
- 构建器版本支持与重建评估；
- v1 兼容性扫描；
- v1 → v2 源包草稿生成；
- 迁移报告和人工处理流程；
- v1 使用统计；
- 是否停止新建 v1 的评审材料。

### 3.2 明确不做

- 不自动升级存量页面；
- 不原地覆盖任何已发布元素版本；
- 不允许 manifest 中执行任意迁移函数；
- 不强制一次迁移全部 v1；
- 不删除 v1 runtime；
- 不把构建器重建结果覆盖原 artifact；
- 不开放容器、iframe 或市场；
- 不把业务页面发布操作自动绑定元素 latest。

---

## 4. 版本身份与状态

### 4.1 身份层级

```text
Element Definition
  elementId
  currentRecommendedVersion

Element Version
  elementId + elementVersion
  packageHash
  manifestHash
  artifactHash
  builderVersion
  sdk/permissions/dependencies
  publishedStatus

Element Instance
  instanceId
  type=elementId
  elementProtocolVersion
  elementVersion
  elementArtifactHash
  config
```

### 4.2 版本状态

建议元素版本自身状态：

```text
draft
in-review
published
rejected
downline
revoked
```

元素定义的当前 `elementStatus` 可继续表示整体管理状态，但不得取代版本状态。

### 4.3 推荐版本

- 新拖入实例默认锁定 currentRecommendedVersion；
- 推荐版本只能指向 published 且未 revoked 的 version；
- 发布新版本可选择是否成为推荐版本；
- 改推荐版本不改变已保存实例；
- downline/revoke 的修复策略由管理员明确操作；
- 推荐版本变化记录审计。

---

## 5. 使用关系索引

### 5.1 索引目标

回答：

- 哪些应用/业务组件/模板使用了某 elementId？
- 使用的是哪个 version/artifact？
- 哪些是旧数据 `legacy-latest`？
- 哪些实例可自动声明式迁移？
- 哪些处于草稿/已发布/历史版本？
- 升级会影响多少页面和实例？

### 5.2 关系记录

```text
relationId
tenantId/provId
consumerType        # app-page/business-component/template/guided-node
consumerId
consumerVersion
sceneType
instanceId
elementId
elementProtocolVersion
elementVersion
elementArtifactHash
resolutionMode      # locked | legacy-latest
configHash
consumerStatus
lastIndexedAt
```

### 5.3 建立方式

优先在保存/发布消费者时由后端解析 componentList/sceneData 写索引，而不是只依赖离线全文扫描。

同时提供：

- 全量回填任务；
- 增量索引；
- 索引校验和修复；
- consumer 删除/版本变更清理；
- 索引失败不应让页面数据半保存，但可标记待修复并告警；
- 关键发布操作可同步校验索引输入。

### 5.4 历史版本

需要明确索引范围：

- 当前草稿；
- 当前发布；
- 历史发布版本；
- 已下线消费者。

升级默认只操作用户选择的可编辑草稿/当前版本，不修改历史快照。使用统计可以分别展示活跃和历史引用。

---

## 6. 新版本检测与提示

### 6.1 检测时机

- 页面/业务组件进入编辑模式；
- 元素实例被选中；
- 页面保存/发布前；
- 批量版本管理页面；
- 元素管理员查看某版本使用关系。

运行态不自动弹升级提示。

### 6.2 状态

```text
up-to-date
upgrade-available
locked-old-supported
legacy-unlocked
version-missing
artifact-mismatch
version-downline
version-revoked
target-incompatible
```

### 6.3 UI

单实例：

```text
当前版本 / artifact
推荐版本
发布时间和更新日志
Props/事件/方法/权限/依赖变化摘要
[查看差异] [升级并预览] [保持当前版本]
```

页面级：

- 有升级的元素类型数；
- 实例数；
- 可自动迁移/需确认/不兼容；
- legacy-unlocked 风险；
- 批量选择；
- 不允许一键跳过预览直接保存不兼容升级。

---

## 7. Contract Diff

### 7.1 比较对象

比较两个已发布平台组件清单：

- props；
- defaults；
- groups/editor metadata；
- events/payload；
- methods/params；
- capabilities；
- SDK version；
- permissions；
- dependencies；
- security policy；
- compatibility。

### 7.2 变化等级

```text
compatible
requires-migration
requires-user-confirmation
breaking
security-review-required
```

示例：

| 变化 | 默认等级 |
|---|---|
| 新增 optional Prop | compatible |
| 新增 required Prop 无默认值 | breaking |
| Prop 改名且有 rename migration | requires-migration |
| Prop 类型 string→number | breaking |
| 删除已配置事件 | breaking |
| 新增方法 | compatible |
| 删除方法 | breaking |
| 新增权限 | security-review-required |
| 依赖 major 变化 | requires-user-confirmation/breaking |
| SDK major 变化 | breaking |

### 7.3 实例级影响

清单 diff 只是定义层；实例影响还要结合当前 config：

- 被删除 Prop 是否实际配置；
- required 新字段是否能由 defaults 补齐；
- 被删除事件是否配置 action flow；
- 被删除方法是否被其他元素动作引用；
- 表单/变量表达式是否引用旧字段；
- 容器/能力变化是否影响页面结构；
- 权限变化是否影响当前业务行为。

输出 `InstanceUpgradeAssessment`，不能仅显示 semver。

---

## 8. 声明式迁移协议

### 8.1 允许操作

```text
renameProps
removeProps
defaults
renameEvents（需同时迁移 action config）
removeEvents
renameMethods（需迁移 method references）
removeMethods
```

首期五期实施可先支持 props 三项，事件/方法引用迁移在引用索引可靠后开放。

### 8.2 禁止操作

- 任意 JavaScript 函数；
- new Function/eval；
- 任意网络调用；
- 读取用户数据或运行态 Store；
- 修改其他元素实例；
- 自动产生业务结果；
- 根据显示名称搜索替换；
- 未声明动态路径。

### 8.3 迁移链

如果从 1.0.0 到 3.0.0：

- 可使用 1→2→3 有序链；
- 每步 from/to 精确；
- 不允许环；
- 不允许多条歧义路径；
- 每步输入输出 clone；
- 每步产生 change log；
- 中途失败整体不提交；
- 目标 config 再按目标 manifest 验证。

### 8.4 未识别配置

旧 config 中目标 manifest 不认识的字段：

- 默认保留在 migration preview 的“孤儿字段”；
- 用户选择删除或保持兼容扩展区；
- 正式保存前按平台策略处理；
- 不静默丢弃；
- 运行 adapter 不应无限携带已删除敏感配置。

---

## 9. 升级向导

### 9.1 单实例流程

```text
选择目标版本
  → 加载 target manifest/artifact
  → Contract Diff
  → Instance Assessment
  → 应用声明式迁移到临时 config
  → 展示字段/事件/方法/权限差异
  → 在隔离 preview store 渲染目标版本
  → 用户测试和确认
  → 原子更新 instance identity + config
  → 写入编辑器 history
  → 页面仍需用户保存/发布
```

### 9.2 页面批量升级

- 按 elementId/target version 分组；
- 每个实例单独 assessment；
- 仅兼容实例可批量选择；
- 需确认/破坏性实例逐个处理；
- 预览可按页面临时副本整体渲染；
- 任一迁移失败不修改实际 Store；
- 用户确认后一次 history transaction；
- 页面保存失败可继续保留本地编辑状态，不破坏后端旧版本。

### 9.3 Upgrade Preview

使用目标 published artifact：

- 不重新构建；
- 不改变 current instance；
- 创建临时 identity/config；
- 真实 SDK mode=preview/editor-safe；
- 写操作使用 mock 或用户明确授权的测试环境；
- 事件只记录；
- close 清理；
- 预览成功不保证业务兼容，仍需确认差异。

### 9.4 保存事务

升级发生在消费者页面数据中，不修改 element version。保存时：

- 乐观锁 consumer version；
- 保存 exact identity/config；
- 更新 usage index；
- 校验 target still published/not revoked；
- artifactHash 与 version 对应；
- 保存失败不改后端 consumer；
- consumer 发布仍走原审核流程。

---

## 10. 精确降级与回滚

### 10.1 降级

降级本质仍是显式版本切换：

- 选择已发布旧版本；
- 反向 migration 只有显式声明时使用；
- 无反向迁移时从当前 config 评估兼容；
- 不自动从页面历史猜配置；
- 可以选择某个 consumer 历史快照作为参考；
- 预览和确认后保存。

### 10.2 页面历史回滚

页面/业务组件自己的历史版本若包含 exact element identity，可以恢复整个消费者快照。必须验证旧 artifact 仍在保留期且可加载。已发布 artifact 不应因非活跃推荐版本被 GC。

### 10.3 紧急安全回滚

revoked artifact 不能继续执行。管理员提供：

- 推荐安全替代版本；
- 影响 consumer 列表；
- 批量生成升级草稿；
- 仍需评估配置；
- 无安全版本时运行 fallback；
- 不静默换版本执行未知业务。

---

## 11. 构建器版本治理

### 11.1 版本记录

每个 artifact 固定：

```text
builderVersion
pluginVersions
dependencyPolicyVersion
sdkPolicyVersion
scannerVersion
target
```

### 11.2 Minor 升级

- 新构建使用新 builder；
- 旧 published artifact 继续运行；
- 可发起 rebuild-validation；
- 产生新 artifactHash 和对比报告；
- 不改变 elementVersion 的正式产物；
- 若要采用重建结果，创建新 elementVersion。

### 11.3 Major 升级

- 建立受支持矩阵和截止日期；
- 扫描活跃元素；
- 批量 rebuild-validation；
- 记录成功/行为差异/失败；
- 组件维护者确认并发布新版本；
- 旧 artifact 支持期结束前提前告警；
- 不在截止日当天无替代地删除旧运行支持。

### 11.4 产物丢失

如果原 artifact 意外丢失：

- 视为严重运维事故；
- 优先从备份恢复原 bytes；
- 不能用新 builder 重建后冒充原 artifactHash；
- 新 builder 重建必须新 artifact/version，并经过审核；
- 运行页安全 fallback。

---

## 12. v1 兼容性扫描

### 12.1 输入

- element metadata；
- TSX source；
- Schema TS/JS source；
- Less source；
- 发布状态和使用关系；
- 当前运行依赖。

### 12.2 扫描项

```text
default export style
Props style
Schema static/object/function
customRequest/condition/render/functions
window/global access
Store/request/internal utils imports
CrossAPI direct access
non-whitelist dependencies
dynamic import/require
global CSS
assets references
methods/ref
events
remote URL/network
```

### 12.3 等级

```text
AUTO_CONVERTIBLE
MANUAL_CHANGES_REQUIRED
NOT_CONVERTIBLE_WITH_CURRENT_V2
SCAN_FAILED
```

每项结果包含：

- code；
- file/line；
- current pattern；
- target v2 pattern；
- 自动生成内容；
- 人工操作；
- 风险；
- estimated effort。

### 12.4 使用关系优先级

迁移排序建议综合：

- active consumer count；
- business criticality；
- error rate；
- security risk；
- auto-convertible；
- maintainer availability。

不是只按元素数量统计。

---

## 13. v1 → v2 草稿生成

### 13.1 标准输出

```text
converted-element.zip
├─ ngap.json
├─ src/index.tsx
├─ src/styles/index.less
├─ README.md
└─ MIGRATION_REPORT.md/json
```

### 13.2 自动转换

- 旧静态 Schema attrs → groups/props editors；
- config.props → defaults；
- events → events；
- methods → methods；
- Less → scoped style source；
- TSX → entry；
- element metadata → component title/description suggestions；
- import React 大小写修正建议；
- 生成 protocolVersion=2、package version draft、SDK empty/minimal permissions。

### 13.3 人工修改

必须把以下情况留为 TODO/diagnostic：

- Schema functions；
- direct request/handleApi；
- Store/useAppContext；
- CrossAPI；
- window globals；
- internal imports；
- non-whitelist packages；
- runtime-generated options；
- unsupported assets；
- global CSS selectors；
- dynamic module loading。

不能用字符串替换伪造安全 SDK 迁移。

### 13.4 转换后的生命周期

1. 生成 v2 source package draft；
2. 用户下载或进入 v2 Editor；
3. 解决 diagnostics；
4. 上传/分析/build/preview；
5. 新 v2 element version；
6. 审核发布；
7. consumer 显式升级；
8. 原 v1 version 保留；
9. 统计迁移进展。

---

## 14. v1 新建收口

### 14.1 停止新建门槛

- v2 第四期生产稳定；
- 官方模板和文档可用；
- 常见能力都有 SDK 替代；
- 构建 SLA 可接受；
- v1 迁移扫描覆盖现有元素；
- 无法迁移类型有处理策略；
- 运维监控稳定；
- 产品、架构、安全批准。

### 14.2 分步策略

```text
阶段 A：v2 默认，v1 入口折叠
阶段 B：v1 新建需要管理员授权
阶段 C：停止 v1 新建，只允许维护已有 v1
阶段 D：未来评估停止 v1 编辑
```

本期最多推进到 C 的产品评审，不删除 v1 runtime。

---

## 15. 前端模块

### 15.1 版本管理

```text
src/custom-elements/versioning/
├─ elementVersionService.ts
├─ usageRelationService.ts
├─ componentContractDiff.ts
├─ instanceUpgradeAssessment.ts
├─ declarativeMigration.ts
├─ upgradePreviewService.ts
└─ versioningTypes.ts
```

### 15.2 UI

```text
src/pages/elementManagement/ElementVersionManagement/
src/pages/elementManagement/ElementUsageRelations/
src/components/customElement/ElementUpgradeBadge/
src/components/customElement/ElementUpgradeWizard/
src/components/customElement/ContractDiffPanel/
src/components/customElement/MigrationPreviewPanel/
src/pages/elementManagement/LegacyElementMigration/
```

实际路径可结合现有 UI 结构调整，但 versioning 核心必须共享、可测试，不散落在 ConfigPanel。

---

## 16. 后端模块与接口

### 16.1 Version APIs

```text
queryElementVersionList
queryElementVersionDetail
queryElementVersionDiff
setRecommendedElementVersion
queryElementUsageRelations
queryConsumerUpgradeAssessment
```

### 16.2 Consumer Upgrade

推荐流程：

```text
createUpgradeSession
  → returns source consumer revision + assessments
preview/confirm client side
commitConsumerElementUpgrade
  → optimistic lock + target validation + relation update
```

批量升级使用 job：

- 先生成草稿变更；
- 每 consumer 独立状态；
- 不直接发布业务应用；
- 可暂停/取消未提交项；
- 失败不影响成功项，但整体报告完整。

### 16.3 Legacy Migration

```text
scanLegacyElementCompatibility
queryLegacyMigrationStatus
generateElementV2DraftPackage
queryLegacyElementUsageStatistics
```

生成源包仍需用户授权和后续 v2 完整审核。

---

## 17. 实施任务

### P5-T1：版本/使用关系数据服务

- version status；
- recommended version；
- consumer relation schema；
- save-time indexing；
- backfill/reconcile；
- query APIs。

### P5-T2：Contract Diff 与实例评估

- manifest diff；
- severity；
- config/event/method references；
- permission/dependency；
- reports/tests。

### P5-T3：声明式迁移器

- migration schema；
- chain validation；
- clone/transform/validate；
- change log；
- error rollback；
- orphan fields。

### P5-T4：升级向导与 Preview

- badges/page summary；
- version selection；
- diff/assessment；
- temp Store；
- target artifact preview；
- commit/history。

### P5-T5：后端升级事务和批量任务

- upgrade session；
- optimistic lock；
- target validation；
- relation update；
- batch draft jobs；
- reports。

### P5-T6：精确降级和 builder 治理

- old version select；
- reverse assessment；
- historical snapshots；
- rebuild-validation；
- support matrix；
- artifact loss handling。

### P5-T7：v1 兼容性扫描

- source/schema/less parser；
- risk rules；
- classification；
- usage priority；
- report UI/API。

### P5-T8：v1 ZIP 草稿生成

- schema mapping；
- package layout；
- migration report；
- manual TODO；
- v2 Editor handoff；
- no overwrite。

### P5-T9：试点迁移与收口评审

- representative v1 elements；
- consumer upgrades；
- rollback；
- statistics；
- v1 new-entry policy；
- fifth phase acceptance。

---

## 18. 日历安排

建议 8 周：

| 周次 | 工作 |
|---|---|
| 1 | T1 数据/回填设计、T2 diff model |
| 2 | usage index、manifest diff、migration schema |
| 3 | T3 migration engine、T4 UI skeleton |
| 4 | upgrade assessment/preview、T5 backend session |
| 5 | commit/batch、T6 downgrade/builder governance |
| 6 | T7 legacy scanner、T8 generator |
| 7 | pilot migrations、fault/rollback tests |
| 8 | defects、v1 policy review、acceptance |

---

## 19. 测试方案

### 19.1 Usage Index

- app/business/template/guided；
- draft/published/history；
- save/update/delete；
- nested elements；
- legacy-latest；
- backfill idempotency；
- index drift repair；
- permission/tenant isolation。

### 19.2 Diff

- add/remove/rename/type/default；
- event payload；
- method params；
- permissions/dependencies/SDK；
- instance actually uses removed field；
- action references removed event/method；
- stable ordering/report。

### 19.3 Migration

- single/multi-step；
- no path/ambiguous/cycle；
- rename collision；
- remove configured field；
- defaults type；
- orphan fields；
- target validation；
- no mutation on failure；
- deterministic output。

### 19.4 Upgrade

- single instance；
- multiple instances same element；
- multi element page；
- v1/v2 mixed；
- target downline/revoked during session；
- consumer revision conflict；
- preview render/SDK error；
- save failure；
- undo/redo；
- reload exact target；
- downgrade。

### 19.5 Builder Governance

- old artifact remains；
- minor/major rebuild-validation；
- new artifact hash；
- no overwrite；
- migration failure list；
- missing artifact incident。

### 19.6 v1 Migration

- static Schema；
- function Schema；
- direct request/Store/CrossAPI；
- internal import；
- non-whitelist dependency；
- global Less；
- standard events/methods；
- generated ZIP valid；
- report complete；
- v2 build/review/publish；
- original v1 still runs。

---

## 20. 风险与控制

| 风险 | 控制 |
|---|---|
| 使用关系索引不全 | 保存时增量 + 全量回填 + drift reconciliation |
| 升级静默丢配置 | orphan field list、diff、preview、explicit confirmation |
| migration 变成任意脚本 | strict declarative operations, JSON only |
| 批量升级影响业务 | generate drafts only, per-consumer results, no auto publish |
| legacy-latest 隐式变化 | editor risk badge, convert to locked after confirmation |
| v1 转换过度承诺 | three-level compatibility and detailed report |
| builder upgrade breaks old | immutable old artifacts and support matrix |
| revoked version forced auto replace | safe fallback + explicit remediation, no silent business change |

---

## 21. 五期完成门槛

- 使用关系能够按 exact version/artifact 查询；
- 新版本不改变锁定消费者；
- legacy-unlocked 被明确标识；
- Contract Diff 和实例评估覆盖 props/events/methods/permissions/dependencies；
- 声明式迁移可预览、确认、保存和回滚；
- 批量升级只生成可控消费者草稿，不自动发布；
- 精确旧版本可加载和降级；
- builder upgrade 不覆盖旧 artifact；
- v1 扫描输出可信分级和操作建议；
- 典型 v1 可生成 v2 草稿并走完整审核；
- 无法迁移 v1 仍稳定运行；
- v1 新建收口形成正式评审结论。

---

## 22. 六期移交物

- version/usage services；
- upgrade wizard and migration engine；
- exact rollback；
- builder support policy；
- legacy scanner/generator；
- pilot migration reports；
- v1/v2 usage statistics；
- updated end-to-end fixtures；
- v1 creation policy recommendation。

六期使用这些能力做全量推广验收，不在验收期临时新增新的迁移协议。
