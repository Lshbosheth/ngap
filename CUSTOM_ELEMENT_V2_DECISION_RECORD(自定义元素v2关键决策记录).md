# 自定义元素 v2 关键决策记录

## 1. 文档信息

| 项目 | 内容 |
|---|---|
| 文档标识 | `CUSTOM_ELEMENT_V2_DECISION_RECORD` |
| 决策编号 | `CE-ADR-{三位序号}` |
| 适用范围 | 自定义元素 v2 第一期至第六期 |
| 上游基线 | `CUSTOM_ELEMENT_V2_REQUIREMENTS`、`CUSTOM_ELEMENT_V2_PHASE_PLAN` |
| 下游文档 | 数据字典、接口契约、各期开发方案、测试与验收资料 |
| 状态值 | proposed / accepted / superseded / rejected |

本文记录已经从需求和六期方案中收口的关键决策。实现不得自行采用被拒绝方案；确需调整时，必须新增 ADR 或将原 ADR 标记为 superseded，不能直接改写历史理由。

---

## 2. 决策管理规则

### 2.1 单条决策字段

每条 ADR 包含：

- 决策编号和标题；
- 状态、决策时间和责任角色；
- 背景与问题；
- 最终决策；
- 选择理由；
- 被拒绝方案；
- 影响与约束；
- 验证方式；
- 关联需求和阶段。

### 2.2 变更规则

- accepted 决策不得无记录地更换语义；
- 只修正文案且不改变语义时递增文档 minor 版本；
- 改变协议、身份、发布、安全或兼容语义时新增 ADR；
- 新 ADR 使用 `supersedes: CE-ADR-xxx` 关联旧决策；
- 已发布版本继续按其冻结契约运行，不因 ADR 更新而被原地改变；
- 数据字典和接口契约必须引用当前 accepted ADR。

---

## 3. Accepted 决策总览

| 编号 | 决策 | 状态 | 主要影响阶段 |
|---|---|---|---|
| CE-ADR-001 | 正式源清单统一为 `ngap.json` | accepted | 一期起 |
| CE-ADR-002 | 生产协议显式使用 `elementProtocolVersion` | accepted | 一期起 |
| CE-ADR-003 | v2 正式构建由服务端受控完成 | accepted | 二期起 |
| CE-ADR-004 | 正式预览、审核、发布绑定冻结产物 | accepted | 二至四期 |
| CE-ADR-005 | 发布产物不可变并使用完整身份 | accepted | 四期起 |
| CE-ADR-006 | 平台能力通过 `context` SDK 暴露 | accepted | 一期起 |
| CE-ADR-007 | 首期采用可信主窗口执行模型 | accepted | 二至六期 |
| CE-ADR-008 | v1 和 v2 显式分流并长期共存 | accepted | 全期 |
| CE-ADR-009 | v2 页面实例从首日锁定版本与产物 | accepted | 三期起 |
| CE-ADR-010 | 主 `src` 与独立 `page/materials` 共用核心契约 | accepted | 全期 |
| CE-ADR-011 | Registry 按完整 Artifact Identity 注册 | accepted | 二至四期 |
| CE-ADR-012 | 构建任务采用异步、幂等、可恢复模型 | accepted | 二期起 |
| CE-ADR-013 | preview、publish-candidate、rebuild-validation 分离 | accepted | 二至五期 |
| CE-ADR-014 | 版本升级必须显式确认且事务化 | accepted | 五期起 |
| CE-ADR-015 | v1 迁移生成新 v2 草稿，不覆盖 v1 | accepted | 五期起 |
| CE-ADR-016 | 声明式迁移禁止执行任意脚本 | accepted | 五期起 |
| CE-ADR-017 | 外部依赖由平台精确版本白名单治理 | accepted | 一期起 |
| CE-ADR-018 | 签名运行清单与内容寻址共同保护产物 | accepted | 四期起 |
| CE-ADR-019 | 单元素失败必须隔离，不拖垮整页 | accepted | 二期起 |
| CE-ADR-020 | 正式推广以硬门槛和可复核证据判定 | accepted | 六期 |

---

## 4. 协议与身份决策

### CE-ADR-001：正式源清单统一为 `ngap.json`

| 项目 | 内容 |
|---|---|
| 状态 | accepted |
| 决策 | v2 ZIP 根目录唯一正式源清单命名为 `ngap.json` |
| 关联需求 | `CE-PKG-*` |
| 责任角色 | 产品、架构、前端、后端 |

背景：历史讨论中同时出现 `component.json` 等名字，会导致包解析、文档、错误码和工具链分叉。

选择理由：`ngap.json` 与平台品牌和协议职责清晰，可作为唯一 Schema 入口；平台规范化后的 component manifest、服务端运行清单 `runtime-manifest.json` 与它分别承担不同职责。

拒绝方案：

- 同时支持多个正式清单名；
- 根据 ZIP 文件结构自动猜清单；
- 把平台生成清单回写成用户源清单。

约束：ZIP 中存在多个 `ngap.json`、位置歧义或大小写冲突必须报错；缺少时只允许生成草稿模板，不能提交审核。

### CE-ADR-002：生产协议显式使用 `elementProtocolVersion`

| 项目 | 内容 |
|---|---|
| 状态 | accepted |
| 决策 | 后端、页面实例、运行查询统一持久化 `elementProtocolVersion` |
| 关联需求 | `CE-CMP-*`、`CE-RT-*` |

拒绝根据 URL、文件内容、`elementJsDemo` 形态或业务版本字符串判断 v1/v2。生产 v2 必须显式为数值 `2`；旧数据缺失时只按受控 v1/legacy 规则处理并记录 resolutionMode。

影响：保存、查询、历史、复制、模板、分享、审核、发布、应用/业务组件序列化和独立运行链路全部透传该字段。

### CE-ADR-003：v2 正式构建由服务端受控完成

| 项目 | 内容 |
|---|---|
| 状态 | accepted |
| 决策 | Analyzer、Scanner、Bundler 和 Artifact Publisher 在受控服务端执行 |
| 关联需求 | `CE-BLD-*`、`CE-SEC-*` |

浏览器可执行文件树展示、基础 ZIP 预检和开发辅助预览，但不能产生可审核或可发布的正式 artifact。

选择理由：需要可复现、依赖锁定、资源限制、扫描、签名、审计、异步恢复和不可变存储。浏览器环境无法可靠承担这些生产责任。

拒绝方案：浏览器 Babel/Blob 构建后直接审核或发布；独立运行页下载 ZIP 现场编译。

### CE-ADR-004：正式预览、审核和发布绑定冻结产物

| 项目 | 内容 |
|---|---|
| 状态 | accepted |
| 决策 | 审核人预览、审核记录和发布事务引用同一 candidate build/hash |
| 关联需求 | `CE-LFC-001`～`CE-LFC-006` |

源包、manifest override、依赖或权限变化都会使已有审核失效。发布时不能重新构建，不能用数据库改标志把 preview artifact 直接伪装为 published artifact。

### CE-ADR-005：发布产物不可变并使用完整身份

完整身份为：

```text
elementId + elementVersion + artifactHash + protocolVersion
```

发布 URL 内容不得覆盖。elementId、业务版本和 artifactHash 语义不同，任何加载、缓存、回滚和审计不能只使用 elementId。

拒绝方案：始终按 elementId 取最新；相同 URL 覆盖 JS/CSS；以 URL 作为唯一身份。

---

## 5. SDK 与安全边界决策

### CE-ADR-006：平台能力通过 `context` SDK 暴露

| 项目 | 内容 |
|---|---|
| 状态 | accepted |
| 决策 | 类型开发包为 `@ngap/component-sdk`，运行时由 host 注入 `context` |
| 关联需求 | `CE-SDK-*` |

组件不能直接获得 Store、request、CrossAPI、Token、Cookie 或内部路由对象。能力通过 namespace/capability 包装，进行权限、参数、租户边界、错误和审计处理。

拒绝方案：公共 `usePlatform` hook 与宿主 React 强绑定；直接传 Store/request；让组件自行携带 Token 请求。

### CE-ADR-007：首期采用可信主窗口执行模型

| 项目 | 内容 |
|---|---|
| 状态 | accepted |
| 决策 | 首期 v2 在主窗口加载已审核产物，上传角色限可信内部人员 |
| 关联需求 | `CE-SEC-*`、六期安全门槛 |

该模型不是浏览器强沙箱。静态扫描、依赖白名单、SDK 权限和审核提供治理与审计边界，但不能声称可安全执行任意不可信第三方代码。

后续向外部开发者开放前必须单独评审 iframe、realm 或其他隔离方案；该评审不阻塞可信内部首期闭环。

### CE-ADR-017：外部依赖由平台精确版本白名单治理

依赖白名单同时应用于 Analyzer、服务端构建器、审核规则、主宿主和独立宿主。组件不得自行打包第二份 React；published v2 共享宿主 React/ReactDOM，并验证版本兼容。

白名单调整属于策略版本变更，必须进入 build identity 和审核差异，不能由单端静默扩展。

### CE-ADR-018：签名运行清单与内容寻址共同保护产物

| 项目 | 内容 |
|---|---|
| 状态 | accepted |
| 决策 | 签名 canonical runtime manifest，产物使用不可变内容寻址路径 |
| 关联需求 | `CE-SEC-*`、`CE-BLD-*` |

签名输入包含完整 identity、URL、integrity、策略和 keyId，排除 signature 字段本身。签名或 hash 不一致必须拒绝执行，不允许回退加载 ZIP/源码。

原生 dynamic import 缺少直接 SRI，因此需结合签名 manifest、同源受控 CDN、不可变 URL 和回源完整性；若未来使用 fetch-hash-Blob loader，必须完整解决 chunk 和 CSP，不得只校验入口。

---

## 6. 双运行时与兼容决策

### CE-ADR-008：v1 和 v2 显式分流并长期共存

- 保留既有 v1 三文件运行链路；
- v2 使用服务端产物链路；
- v1/v2 可同页运行；
- 停止新建 v1 与删除 v1 runtime 是两个独立决策；
- v2 推广不要求先迁移全部 v1；
- v1 兼容路径不能绕过 v2 生产门槛。

### CE-ADR-009：v2 页面实例从首日锁定版本与产物

新 v2 实例保存：

```text
elementProtocolVersion = 2
elementVersion
elementArtifactHash
```

发布新版本或修改 recommended version 不改变存量实例。历史旧数据缺字段时可按 `legacy-latest` 解析，但必须可观测并在编辑器提示；一旦显式确认保存，转为 locked。

### CE-ADR-010：主 `src` 与独立 `page/materials` 共用核心契约

共享范围至少包括：

- protocol types/schema；
- runtime identity；
- Registry core；
- Props adapter；
- event/method/ref contract；
- SDK contract 和 error normalization；
- signature/manifest validation；
- contract fixtures/tests。

宿主只实现 adapter，不复制第三套 Analyzer、Registry 或 SDK core。主和独立运行时必须通过同一契约测试。

### CE-ADR-011：Registry 按完整 Artifact Identity 注册

Registry key 至少包含 purpose、elementId、elementVersion、artifactHash 和 SDK major。并发请求合并，同 artifact 多实例只加载一份模块和样式；不同版本不得互相覆盖；失败、引用释放和宿主销毁均有明确生命周期。

### CE-ADR-019：单元素失败必须隔离

manifest、CSS、ESM、render、method 和 SDK 错误按元素实例展示 fallback，其他实例继续运行。错误携带 identity、stage 和 errorCode，但普通用户不看到源码、Token、内网 URL 或敏感堆栈。

---

## 7. 构建与生命周期决策

### CE-ADR-012：构建任务采用异步、幂等、可恢复模型

构建用 buildId 查询，离开页面不自动取消；状态和 phase 分离；终态不可逆；worker 异常、服务重启和轮询乱序有恢复策略。

幂等输入至少包含：

```text
packageHash
manifestOverridesHash
purpose
builderVersion
dependencyPolicyVersion
sdkPolicyVersion
scannerVersion
```

客户端不能提交可信 artifactHash、扫描结果或任意 package URL。

### CE-ADR-013：三种 Build Purpose 分离

| Purpose | 用途 | 可否发布 |
|---|---|---|
| preview | 开发和编辑器真实预览，短期保留 | 否 |
| publish-candidate | 最终预览、审核和发布候选 | 审核通过后可发布 |
| rebuild-validation | builder 升级兼容评估 | 否 |

published 是元素版本/产物发布状态，不作为客户端随意申请的 build purpose。

### CE-ADR-014：版本升级必须显式确认且事务化

升级流程为使用关系查询 → Contract Diff → 实例影响评估 → 目标 artifact 预览 → 用户确认 → 乐观锁事务提交。批量升级只生成消费者草稿，不自动发布业务应用。

拒绝方案：存量实例跟随 latest；发布元素时批量静默升级页面；升级失败后保留半修改配置。

### CE-ADR-015：v1 迁移生成新 v2 草稿

迁移扫描将 v1 分类为自动、半自动、人工。转换产物是新的 v2 ZIP 草稿和迁移报告，必须重新走分析、构建、预览、审核和发布；原 v1 元素和消费者保持不变。

### CE-ADR-016：声明式迁移禁止任意脚本

版本迁移只允许受控 JSON 操作，例如 rename、copy、remove、set-default、enum-map 和结构化转换。迁移链校验循环、歧义和目标 Schema；执行失败不修改原配置。

拒绝在 manifest 中存放并执行任意 JavaScript 迁移函数。

---

## 8. 验收与推广决策

### CE-ADR-020：正式推广以硬门槛和证据判定

推广必须有需求追踪、功能、性能、安全、故障演练、真实试点、监控和回退证据。全部 P0/P1 关闭；签名、不可变产物、版本锁定、双运行时、生产不编译源码和可信执行边界不能附条件豁免。

报告使用精确版本和不可变证据地址，不接受口头结论或可覆盖的 `latest` 报告链接。

---

## 9. 明确拒绝的整体方案

| 方案 | 结论 | 原因 |
|---|---|---|
| 浏览器 Babel/Blob 正式构建 | rejected | 不可复现、难扫描签名、独立运行负担高 |
| 生产页下载 ZIP 现场编译 | rejected | 性能、安全、可用性和审计不可接受 |
| 按 URL/内容猜 v1/v2 | rejected | 数据语义不稳定，跨链路易丢失 |
| 发布时重新构建 | rejected | 审核对象与运行对象不一致 |
| 已发布 URL 覆盖内容 | rejected | 破坏缓存、回滚和审计 |
| v2 实例始终跟随 latest | rejected | 页面行为不可复现，升级不可控 |
| 将 Store/request/CrossAPI 暴露给组件 | rejected | 强耦合且无法最小权限治理 |
| 声称 trusted-main-window 是强沙箱 | rejected | 与实际浏览器边界不符 |
| 删除 v1 后再上线 v2 | rejected | 风险与迁移成本过高 |
| 主/独立 runtime 各自复制实现 | rejected | 漂移、缺陷和维护成本不可控 |

---

## 10. 待评审冻结项

以下方向已确定，但具体值仍需在一期评审冻结：

| 编号 | 待冻结内容 | 责任角色 | 最晚时间 |
|---|---|---|---|
| CE-ADR-P01 | `ngap.json` JSON Schema 具体字段与默认值 | 架构/前端/组件开发者 | 一期 T2 |
| CE-ADR-P02 | ZIP 大小、文件数、深度和压缩比上限 | 安全/构建/产品 | 一期 T2 |
| CE-ADR-P03 | 后端表扩展还是新表及 ID 生成策略 | 后端/DBA/架构 | 一期 T7 |
| CE-ADR-P04 | 现有 `/element/*` 接口扩展还是 `/element/v2/*` 命名 | 后端/前端/网关 | 一期 T7 |
| CE-ADR-P05 | 首期 SDK capability 字典和高风险分级 | 产品/安全/架构 | 一期 T6 |
| CE-ADR-P06 | 外部依赖精确白名单与升级策略 | 前端/构建/安全 | 一期 T2 |
| CE-ADR-P07 | builder、scanner、dependency policy 版本规则 | 构建/安全 | 二期 T1 前 |
| CE-ADR-P08 | Artifact 签名算法、canonicalization 和公钥分发 | 安全/后端/前端 | 四期 T1 前 |
| CE-ADR-P09 | 对象存储、CDN、CORS、CSP、MIME 和保留策略 | 运维/安全 | 二期 T1 前 |
| CE-ADR-P10 | 构建状态 API 轮询、推送和限流阈值 | 后端/前端/运维 | 二期 T2 前 |
| CE-ADR-P11 | v1 新建停止条件和兼容年限 | 产品/业务/架构 | 五期验收 |
| CE-ADR-P12 | 强隔离路线是否单独立项 | 安全/架构/产品 | 外部开放前 |

待冻结项不是允许各端自行选择的自由项。未评审前，接口契约使用本文给出的建议命名和明确的 `TBD` 约束，不得伪装成已定生产值。

---

## 11. 决策验收清单

- 数据字典中没有 `component.json` 作为正式对象；
- 接口契约强制显式 `elementProtocolVersion`；
- 上传和构建接口不信任客户端 hash/URL/扫描结果；
- preview build 不能直接发布；
- 审核和发布引用同一 candidate identity；
- runtime info 按请求 identity 返回单项结果；
- v2 页面实例包含 version 和 artifactHash；
- SDK DTO 不出现 Token、Store、request、CrossAPI；
- v1/v2、主/独立两个 runtime 有明确兼容规则；
- 升级和迁移不原地覆盖已发布对象；
- 签名失败不回退源码；
- 六期推广硬门槛能够引用对应 ADR。
