# 自定义元素 v2 四期独立运行时与生产发布开发方案

## 1. 文档信息

| 项目 | 内容 |
|---|---|
| 文档标识 | `CUSTOM_ELEMENT_V2_PHASE4_TECHNICAL_PLAN` |
| 对应期次 | 第四期：独立运行时与生产安全发布 |
| 前置方案 | 一期协议、二期构建/预览、三期元素管理/主编辑器 |
| 主要需求 | 双运行时 `CE-RT-*`、正式 `CE-BLD-*`、`CE-SDK-*`、`CE-SEC-*`、发布一致性 |
| 本期性质 | 第一至四期生产最小闭环的收口期 |

---

## 2. 当前独立运行时核查

### 2.1 页面首屏加载

`page/src/page/index.tsx` 当前在应用接口返回 `elementIds` 后：

1. 调用 `/element/queryElementList`；
2. 把 `beans` 交给 `materials/index.tsx` 的 `queryElementFun()`；
3. 等待三文件编译完成；
4. 再解析并渲染页面数据。

### 2.2 引导式增量加载

`addProcessNode()` 在加载业务组件时再次：

1. 读取业务组件 `elementIds`；
2. 用 `getComponent(item)` 过滤；
3. 查询元素详情；
4. 重复交给 `queryElementFun()` 编译。

v2 必须按完整 identity 去重，不能只用 elementId；同一 elementId 的两个版本需要同时存在。

### 2.3 运行组件库

`materials/index.tsx` 当前：

- 延迟加载内置 components；
- 通过全局 Babel loader 编译 v1；
- 通过 Less 插入全局 style；
- componentMap 无完整版本和状态；
- `clearElementComponents()` 清空所有 componentMap；
- `clearBabelCache()` 在页面卸载执行。

### 2.4 独立 `NgapRender`

`materials/NgapRender/NgapRender.tsx` 当前：

- 直接读取 `Components/getComponent`；
- `useEffect([])` 只初始化一次；
- 事件逻辑与主 `src` 重复；
- v1 Props 与主 `src` 近似但实现不同；
- ref 清理不完整；
- `ComItemType` 是显式 `Pick`，当前会裁剪新增 v2 identity。

四期必须复用三期 shared registry、Props adapter、event hook、Error Boundary 和 SDK contract；不能把主 `NgapRender` 复制到 materials。

### 2.5 页面销毁

当前 beforeunload 和 React cleanup 都调用：

```text
clearElementComponents
clearBabelCache
clearComponentRef
clearTimerList
```

四期保留 v1 清理，同时增加 registry host scope 的引用释放。不能因为销毁一个页面实例误删同一宿主中其他页面/预览仍使用的共享 published artifact。

---

## 3. 本期目标与边界

### 3.1 必须交付

- publish-candidate 构建和正式 publish artifact；
- 审核、发布、运行同一冻结 artifact；
- 不可变内容寻址 URL；
- 正式 runtime manifest；
- manifest 签名和运行校验；
- 批量 runtime info API；
- `page` 按完整 identity 批量加载；
- 引导式节点增量加载；
- `materials` runtime host；
- `materials` v1/v2 `NgapRender` 分流；
- v1 shared legacy adapter；
- 主/独立 SDK 正式实现和 contract suite；
- 事件/ref/context/错误语义一致；
- 单元素故障隔离；
- v2 生产路径移除 Babel/JSZip/analyzer 依赖；
- CORS/CSP/MIME/CDN 配置；
- 构建、发布、加载和 SDK 监控；
- 灰度和紧急回退手册；
- 内部生产试点。

### 3.2 明确不做

- 不开放外部上传者；
- 不实现 sandbox iframe；
- 不开放容器元素；
- 不完成 v1 批量迁移；
- 不实现页面版本升级 UI（第五期）；
- 不允许自动跟随新版本；
- 不删除 v1 runtime；
- 不建设组件市场。

---

## 4. 生产构建模型

### 4.1 Build Purpose

正式区分：

```text
preview
publish-candidate
rebuild-validation
```

- preview：短期预览产物，不可发布；
- publish-candidate：提交审核前生成，扫描、签名输入和保留策略满足发布要求；
- rebuild-validation：构建器升级评估，不自动替换已发布产物。

### 4.2 Candidate 生成

提交审核前，若当前 build purpose=preview：

1. 使用同一 packageHash/manifestOverrides；
2. 发起 publish-candidate build；
3. 重新执行全链路，不直接复制 preview artifact；
4. candidate success/scan passed；
5. 元素管理使用 candidate 进行最终预览；
6. 保存 candidate buildId/artifactHash；
7. 创建审核记录。

如果平台确认 preview 和 candidate 使用完全相同受控 pipeline，也仍要通过 purpose 和保留/签名阶段生成独立 candidate 记录，不能只改数据库标志绕过。

### 4.3 发布事务

输入：

```text
reviewId
elementId
elementVersion
candidateBuildId
packageHash
manifestHash
artifactHash
sdkPermissions
expectedReviewRevision
```

服务端事务：

1. 校验审核通过且 revision 未变化；
2. 校验 candidate build success/scan passed；
3. 校验所有 hash/权限/依赖与审核快照一致；
4. 生成或确认最终签名；
5. 创建不可变 `element_version`；
6. 更新元素定义当前发布版本；
7. 发布 runtime descriptor；
8. 提交事务；
9. 发送菜单/缓存失效事件。

禁止发布时重新构建或覆盖原 artifact 内容。

### 4.4 不可变路径

```text
/custom-elements/{tenantScope}/{elementId}/{elementVersion}/{artifactHash}/
├─ runtime-manifest.json
├─ js/index-[hash].js
├─ js/chunk-[hash].js
├─ css/index-[hash].css
├─ assets/*-[hash].ext
└─ scan-report.json          # 受权限保护，不向普通运行用户公开
```

任何相同 URL 内容变化都视为严重发布故障。

---

## 5. 正式 Runtime Manifest

### 5.1 必填字段

```text
schemaVersion
protocolVersion=2
purpose=published
elementId
elementVersion
packageName
packageHash
manifestHash
artifactHash
builderVersion
dependencyPolicyVersion
sdkPolicyVersion
scannerVersion
entry {url, integrity, format}
chunks[]
styles[]
assets[]
externals
sdk {version, permissions}
componentManifest
scan {status=passed, reportHash}
issuedAt
signatureAlgorithm
keyId
signature
```

### 5.2 Canonical 签名输入

- 排除 `signature` 字段；
- key 顺序和数组语义固定；
- URL 必须是最终不可变 URL；
- integrity/hash 使用统一编码；
- issuedAt 是否进入签名必须固定；
- signatureAlgorithm/keyId 进入签名输入；
- canonicalization 版本显式保存；
- 任何字段修改使签名失效。

### 5.3 签名策略

推荐使用后端私钥签名、前端内置/下发可信公钥或通过受控同源服务验证。密钥：

- 不进入前端仓库；
- 支持 keyId 和轮换；
- 旧公钥保留到所有活跃产物退出；
- 私钥访问仅限发布服务；
- 签名日志记录 element/version/artifact；
- 失败不允许跳过或加载 ZIP 源码。

### 5.4 ESM 完整性

原生 dynamic import 不能直接附 SRI。正式方案优先：

```text
签名 runtime manifest
+ 内容寻址 URL
+ 受控同源 CDN/对象存储
+ 发布后禁止覆盖
+ CDN 回源完整性与审计
```

如果采用 fetch-hash-Blob 或自定义 module loader，必须解决 chunk import 和 CSP，不得只校验入口却放任 chunk。四期技术评审选择一种完整方案并形成威胁模型。

---

## 6. Runtime Info API

### 6.1 请求

```text
elements: [
  {
    elementId,
    elementVersion?,
    artifactHash?
  }
]
appId/pageId/componentId
```

### 6.2 响应

每项：

```text
elementId
protocolVersion
elementVersion
artifactHash
status
runtimeManifestUrl
sdkVersion/permissions summary
signature/keyId summary
accessDenied/missing reason
```

### 6.3 解析规则

- 新 v2 实例要求完整 version + artifactHash；
- 缺 version 的旧数据可解析 latest published，但响应标记 `resolutionMode=legacy-latest`；
- 指定 version 与 artifact 不匹配返回 error；
- 下线/无权/不存在分别返回原因；
- 不把源包 URL、源码或 scan report 返回普通运行页；
- 批量响应按请求 identity 对应，不按数组位置猜；
- 单项失败不使整个批次失败；
- API 支持合理批次上限和去重。

---

## 7. `page` 加载编排

### 7.1 Identity 收集

从页面/业务组件数据递归收集：

```text
type
elementProtocolVersion
elementVersion
elementArtifactHash
```

内置类型不进入 custom runtime query。v1 自定义元素按 v1 descriptor；v2 按完整 identity。

### 7.2 首屏流程

```text
应用接口
  → Web Worker/解析页面数据初步取得 element refs
  → normalize/dedupe refs
  → queryElementRuntimeInfoList
  → registry.loadMany(runtime descriptors)
  → Promise.allSettled
  → 记录单项结果
  → 页面渲染
```

可根据用户体验选择等待所有关键元素或逐元素 loading，但不能因一个失败阻止整页。建议：

- 首屏必要元素并行加载；
- 达到页面渲染基础后显示；
- 各 Material 根据 registry status 渲染 Spin/fallback；
- 页面加载状态不等待失败元素无限重试。

### 7.3 引导式增量

改造 `addProcessNode()`：

1. 业务组件数据解析 element refs；
2. 用 registry.resolve(full identity) 过滤 ready；
3. runtime info service 批量补充 missing descriptors；
4. loadMany；
5. allSettled；
6. 节点 Material 各自显示状态；
7. 不再用 `getComponent(elementId)` 判断；
8. 不重新请求已 ready 的同 artifact；
9. 后续节点回滚时 release instance，published artifact 可按 host cache 策略保留。

### 7.4 页面销毁

- dispose 所有 page instance context；
- clear refs/timers/process listeners；
- release page-owned registry references；
- preview resources 不属于 runtime host；
- v1 clear logic 仍执行；
- 不无条件清空全局共享 published cache，除非 host 整体销毁；
- Babel cache 只在页面实际使用 v1 时加载/清理；
- beforeunload 和 React cleanup 使用幂等 dispose。

---

## 8. Shared Registry 生产加载

### 8.1 Published Artifact Key

```text
published:{elementId}:{elementVersion}:{artifactHash}:sdk{major}
```

### 8.2 Load Steps

1. validate runtime descriptor；
2. fetch manifest from allowed origin；
3. validate schema/purpose/status；
4. verify signature；
5. verify identity against descriptor/page instance；
6. verify SDK/external compatibility；
7. load/mount styles；
8. import ESM；
9. validate default export and component manifest identity；
10. mark ready；
11. on failure roll back newly acquired resources；
12. emit telemetry。

### 8.3 Cache

- published success cache 可跨页面 session，按宿主生命周期；
- error cache 短期，允许 retry；
- missing/denied 不长期负缓存；
- style reference count；
- different artifact never share entry；
- same artifact different sdkAdapterMajor separate；
- registry invalidate 接收发布/下线事件，但已加载锁定 old artifact 是否继续运行按产品规则；
- cache eviction 不能删除仍有实例引用的资源。

### 8.4 LoadMany

- dedupe identity；
- concurrency limit；
- allSettled result map；
- priority 可标首屏/后续；
- 一个失败不 reject 全批；
- metrics per item；
- cancellation 只取消未开始的 host load，已 import 模块不可撤销但可不注册/释放样式。

---

## 9. `materials` Runtime Host

### 9.1 目录

```text
materials/custom-elements/
├─ runtimeHost.ts
├─ runtimeSdkAdapter.ts
├─ runtimeElementService.ts
├─ runtimeBootstrap.ts
└─ legacyRuntimeAdapter.ts
```

### 9.2 Host 差异

可与 editor host 不同：

- Store 实现；
- request 实例；
- 路由入口；
- UI message provider；
- CrossAPI 实例；
- telemetry sender；
- mode=`runtime`。

不可不同：

- SDK 类型；
- permission decision；
- error code；
- interfaceId/capability 语义；
- input/output size；
- timeout/cancel；
- subscription cleanup；
- identity/log envelope。

### 9.3 不能暴露

即使 `materials` 当前直接 import `CrossAPI`，v2 context 也只能暴露治理后的 integration capability，不可把原始实例传给组件。

---

## 10. SDK 正式实现

### 10.1 Context Factory

输入：

```text
componentManifest
runtimeManifest
elementInstance
config
mode
host services
loopVariable
```

输出 capability-scoped `NgapComponentContext`。

### 10.2 Variables

- get 只返回可访问变量；
- set 校验存在/可写/体积；
- subscribe 精确变量，返回 cleanup；
- formula 包装现有引擎并归一化 error；
- 不暴露 Store；
- 主/独立 host 对同 fixture 行为一致；
- loop/form/api data 的兼容语义在 contract tests 固定。

### 10.3 API

`executeConfigured`：

- 读取当前 instance `config.api`；
- 使用现有 `handleApi` 适配；
- 不返回内部 request；
- 超时/取消/错误归一化；
- 记录 element identity。

`call`：

- 只接受 interfaceId；
- 查询能力目录；
- permission `api.call:<id>`；
- host 注入环境/租户/身份；
- 禁止 URL/header/cookie；
- 入参/响应大小限制；
- 写接口默认不自动重试。

### 10.4 Integrations

- capability/event 必须在目录；
- permission；
- 主/独立 host 映射同一业务语义；
- subscribe cleanup；
- 组件卸载强制取消；
- 不向组件返回原始 CrossAPI 对象；
- 敏感字段按能力输出 schema 裁剪。

### 10.5 UI/Files/Navigation/User/Storage/Logger

每个 namespace 必须：

- permission；
- mode availability；
- argument validation；
- error normalization；
- telemetry；
- sensitive filtering；
- instance isolation；
- contract tests。

### 10.6 Limits

默认采用需求基线：

```text
request ≤256 KB
JSON response ≤2 MB
timeout 15 s
concurrency ≤6/instance
rate ≤60/min/instance（能力可覆盖）
storage value ≤64 KB
storage total ≤1 MB/instance
```

限额策略版本进入 runtime manifest/build identity，避免宿主静默改变已审核行为。

---

## 11. Shared Event 与 Ref

### 11.1 Event Hook

主/独立运行时共用：

```text
useNgapEventHandlers
```

输入：

```text
manifest event definitions
config.events action instances
host action executor
instance identity
telemetry
```

输出回调 Props 和 `context.events.emit` 的统一 dispatcher。

### 11.2 运行规则

- 未声明事件不执行 action flow；
- payload 过大拒绝；
- 多 action flow 保持现有顺序语义；
- action flow error 记录但不使组件崩溃；
- duplicate event configs 按现有行为执行；
- runtime/editor 结果一致；
- 现有固定 200 ms 延迟是否必要在四期核查，不能未经验证删除改变业务时序；若保留，封装在 host executor。

### 11.3 Ref

- manifest method allowlist；
- runtime validate；
- setComponentRef(instanceId)；
- unmount clearComponentRef(instanceId)；
- reload old ref clear before new；
- method error 归一化 CE5002；
- 不允许调用未声明方法；
- page dispose 全量清理。

---

## 12. `materials/NgapRender` 改造

### 12.1 分层

复用 shared Material facade 或 hook，不复制主实现：

```text
Material identity classifier
  ├─ built-in
  ├─ v1 legacy custom
  ├─ v2 custom
  └─ remote legacy
```

### 12.2 v2 Material

- `ComItemType` 包含 protocol/version/artifact；
- use registry subscription；
- config from elementsMap；
- variable/form/api reactive update；
- shared runtime props；
- runtimeHost context；
- shared events；
- ref lifecycle；
- Error Boundary；
- loading/error/missing；
- data attributes for CSS scope；
- release on unmount。

### 12.3 v1 Material

- 保留现有 Props；
- loader 可迁到 shared legacy adapter；
- 修复 config 注册键差异；
- 明确 lazy factory 标识；
- style/Blob cleanup；
- only load Babel when v1 present；
- 不因为 v2 改造删除 v1 `handleApi` 兼容。

### 12.4 React 依赖

published v2 external 使用宿主同一 React，避免多个 React 导致 Hooks 错误。Loader 必须验证 externals version，并确保组件 bundle 没有内置 React。

---

## 13. 类型与序列化

更新：

```text
materials/types/index.ts
src/packages/types/index.ts
materials/stores/pageStore.ts
src/stores/canvasPageStore.ts
```

`materials ComItemType Pick` 必须加入：

```text
elementProtocolVersion
elementVersion
elementArtifactHash
```

页面 Worker、`dealPageData`、流程组件解析和 element ref 收集均需保留字段。建立 JSON fixture 从主编辑器保存数据到独立 page 解析的 contract test。

---

## 14. 安全与浏览器策略

### 14.1 Allowed Origins

- runtime manifest、JS、CSS、assets 只允许平台配置资产域；
- 不允许 manifest 内 arbitrary origin；
- redirect 最终域也校验；
- HTTPS；
- development origin 单独配置；
- 禁止 `file:`、`javascript:`、`data:`（允许受控内联资源需明确策略）、任意 blob published entry。

### 14.2 MIME/CORS

- ESM `text/javascript`/`application/javascript`；
- JSON `application/json`；
- CSS `text/css`；
- assets 正确 MIME；
- nosniff；
- 受控 CORS；
- immutable cache headers；
- runtime manifest 可较短缓存或 versioned immutable；
- 不公开 source ZIP。

### 14.3 CSP

评审：

- `script-src` 资产域；
- dynamic import 允许范围；
- `style-src` CSS 加载策略；
- `img-src` 资产域/data 限制；
- 禁止组件任意 connect-src；
- 是否依赖 blob；
- report-only 灰度和违规监控。

trusted-main-window 下 CSP 是防护层，但同源组件仍有页面权限；上传角色限制和审核继续有效。

### 14.4 下线和撤销

- 下线不修改 artifact；
- runtime info 可拒绝新加载；
- 已打开页面是否继续运行按现有下线规则；
- 严重安全事件可加入 revoked artifact list；
- revoked 检查应缓存但可快速更新；
- 回退到旧安全版本需要明确管理员操作；
- 不自动用 latest 替换锁定的 revoked 版本，必须显示阻断和修复入口。

---

## 15. 可观测性与告警

### 15.1 发布

```text
candidate build duration/status
review→publish duration
signature failures
artifact publish failures
cache invalidation failures
published identity
```

### 15.2 运行

```text
runtime info success/partial failure
manifest fetch/verify
signature verify
external compatibility
CSS/module load
first render
Error Boundary
SDK calls/errors/denials
registry cache/eviction
cleanup/leaks
v1 Babel usage
```

### 15.3 告警

- signature/hash mismatch：立即高优先级；
- runtime manifest 5xx/P95；
- module load error 突增；
- SDK_PERMISSION_DENIED 异常突增；
- published artifact missing；
- build queue backlog；
- object storage/CDN error；
- cleanup leak 超阈值；
- v2 overall error rate。

---

## 16. 回退策略

### 16.1 平台前端回退

- 保持 feature flag；
- 可关闭 v2 新加载入口；
- 已加载 v2 的页面显示安全 fallback；
- v1 不受影响；
- 不通过回退前端绕过签名；
- 主/独立 host 版本兼容矩阵明确。

### 16.2 元素版本回退

- 管理员选择已发布旧版本作为推荐版本；
- 不修改旧 artifact；
- 新页面使用推荐旧版本；
- 已锁定页面本来就继续旧版本；
- 回退记录审核原因；
- 五期提供页面显式批量升级/降级。

### 16.3 构建/对象存储故障

- 构建故障只阻止新版本，不影响已发布 CDN；
- 发布事务失败不更新 current published pointer；
- CDN 故障有监控和缓存策略；
- artifact 备份/多副本按平台要求；
- source/manifest/build metadata 可追溯重建，但重建不覆盖原 version artifact。

---

## 17. 文件级改造清单

### 17.1 `page`

```text
page/src/page/index.tsx
page/src/workers/*（页面数据解析如需输出 element refs）
page/vite.config.ts
page/tsconfig.json
```

### 17.2 `materials`

```text
materials/index.tsx
materials/NgapRender/NgapRender.tsx
materials/types/index.ts
materials/stores/pageStore.ts
materials/custom-elements/**
materials/vite/alias config（按项目实际）
```

### 17.3 共享

```text
shared/custom-element/registry/**
shared/custom-element/runtime/**
shared/custom-element/sdk/**
shared/custom-element/testing/adapterContractSuite.ts
```

### 17.4 主 `src` 同步

四期可能同步修正：

```text
src/custom-elements/editorHost.ts
src/packages/NgapRender/NgapRender.tsx
src/packages/index.tsx
```

任何 shared contract 调整必须同时通过两端测试。

---

## 18. 实施任务

### P4-T1：Publish Build 与发布事务

- candidate purpose；
- frozen final preview；
- publish transaction；
- immutable version；
- runtime descriptor；
- cache event。

### P4-T2：Runtime Manifest 签名与资产策略

- canonical signature；
- key management；
- content paths；
- MIME/CORS/cache；
- verify library；
- revoked policy。

### P4-T3：Runtime Info Service

- batch API；
- identity resolution；
- partial errors；
- authorization；
- legacy-latest marker；
- performance/cache。

### P4-T4：Shared Published Registry

- signed manifest load；
- external compatibility；
- CSS/ESM/assets；
- loadMany；
- cache/ref count；
- fault isolation；
- telemetry。

### P4-T5：`materials` Runtime Host 与 SDK

- context factory；
- all namespaces；
- permission/limits/errors；
- integration wrapper；
- cleanup；
- contract tests。

### P4-T6：`materials/NgapRender` v1/v2

- identity/type；
- Material split；
- props/events/ref/error；
- reactive config；
- legacy loader；
- Babel on-demand。

### P4-T7：`page` 首屏和引导式增量加载

- refs collection；
- batch query/loadMany；
- allSettled；
- guided node incremental；
- page lifecycle；
- no full reload。

### P4-T8：安全、CSP、监控和回退

- scanning finalization；
- assets domain；
- CSP report；
- metrics/alerts；
- publish/runtime runbooks；
- failure drills。

### P4-T9：生产试点验收

- assembled/guided；
- v1/v2/multi-version；
- SDK contract；
- signature tamper；
- load/render faults；
- rollback drill；
- joint sign-off。

---

## 19. 日历安排

建议 9 周：

| 周次 | 后端/构建 | 前端 runtime | 安全/测试/运维 |
|---|---|---|---|
| 1 | candidate/publish design | registry signature design | threat model/CSP |
| 2 | runtime info/publish txn | materials host skeleton | key/storage setup |
| 3 | immutable artifact/signing | published loader | signature tests |
| 4 | SDK backend capabilities | runtime SDK namespaces | adapter contract |
| 5 | publish lifecycle | materials NgapRender | v1/v2 regression |
| 6 | cache/revoke/downline | page batch + guided incremental | fault isolation |
| 7 | metrics/alerts | cleanup/performance | security/perf |
| 8 | production-like pilot | pilot fixes | rollback drills |
| 9 | defects/sign-off | defects/sign-off | joint acceptance |

---

## 20. 测试方案

### 20.1 Publish Consistency

- preview vs candidate purpose；
- review frozen candidate；
- package/manifest/artifact mismatch；
- review revision changed；
- publish idempotency；
- publish transaction failure；
- immutable URL overwrite attempt；
- menu/cache update；
- downline/revoke。

### 20.2 Signature

- manifest field tamper；
- JS/CSS/asset URL tamper；
- wrong element/version/artifact；
- unknown/expired keyId；
- key rotation；
- canonicalization differences；
- signature service unavailable；
- no fallback to source。

### 20.3 Runtime Info

- complete v2 identity；
- old no-version data；
- mismatch artifact；
- mixed v1/v2；
- unauthorized/downline/missing；
- partial response；
- large batch/dedupe/cache。

### 20.4 Registry/Loader

- same artifact multiple instances；
- same element different versions；
- concurrency/loadMany；
- CSS/module/asset failure；
- external mismatch；
- Error Boundary；
- retry/cache/eviction；
- release/host dispose。

### 20.5 SDK Contract

- every namespace in editor/runtime；
- permissions；
- invalid args；
- timeout/cancel/rate/size；
- configured API；
- declared API；
- integration call/subscribe；
- user field minimization；
- storage isolation；
- logger redaction；
- unload subscription cleanup。

### 20.6 Page

- assembled first load；
- guided first/header/content/footer relevant pages；
- later process node incremental；
- same element many instances；
- multi-version；
- v1/v2；
- failure one element；
- tab switch/page destroy；
- page refresh；
- pure v2 network bundle no Babel/ZIP/analyzer；
- Chrome target。

### 20.7 Security/Operations

- CSP violations；
- allowed origin redirect；
- wrong MIME/nosniff；
- CDN/object storage outage；
- revoked artifact；
- queue backlog；
- key rotation；
- telemetry sensitive data；
- rollback drill。

---

## 21. 性能与容量门槛

具体阈值需结合环境基线冻结，至少测量：

- runtime info P50/P95；
- manifest P50/P95；
- registry cache hit；
- ESM/CSS total bytes；
- 1/10/30 自定义元素页面首屏；
- 同一 artifact 多实例；
- 5 个不同版本同页；
- 引导式节点增量加载；
- SDK API concurrency；
- memory before/after page dispose；
- repeated navigation leak；
- pure v2 chunk 是否排除 Babel/JSZip/analyzer。

任何性能优化不得通过忽略 signature、identity 或单项错误来实现。

---

## 22. 风险与控制

| 风险 | 控制 |
|---|---|
| ESM signature/完整性方案不完整 | 威胁模型评审，内容寻址+同源不可变，禁止只校验入口 |
| 双运行时再次漂移 | shared runtime/hooks + adapter contract suite |
| `ComItemType Pick` 丢字段 | 类型和 JSON round-trip test |
| 引导式仍按 elementId 去重 | full identity resolver 和 multi-version test |
| 生产 bundle 带 Babel/analyzer | bundle analysis CI gate |
| SDK host 暴露 CrossAPI/Store | capability wrapper、contract review |
| 发布事务重建/覆盖 | candidate freeze、immutable version、DB constraints |
| CDN 可变缓存 | content path、immutable header、overwrite denial |
| 安全修复需要紧急阻断 | revoke list、safe fallback、runbook |

---

## 23. 四期完成门槛

- publish candidate、审核、发布使用同一 artifact；
- 已发布 URL 和版本不可变；
- runtime manifest 签名验证生效；
- 签名/hash/identity 不一致拒绝执行；
- page 批量按完整 identity 加载；
- 引导式节点增量加载不重编译/不重载整页；
- materials runtime host 和主 editor host 通过同一 SDK contract；
- v1/v2/multi-version 页面工作；
- 单元素失败不影响整页；
- pure v2 生产路径无 Babel/ZIP/analyzer；
- CSP/CORS/MIME/监控/告警/回退手册上线；
- 安全、运维、架构、测试批准内部生产试点。

---

## 24. 五期移交物

- immutable `element_version`；
- runtime descriptor/info service；
- exact version/artifact loading；
- signed runtime artifacts；
- page instance identity round-trip；
- published registry and dual hosts；
- usage telemetry；
- publish/downline/revoke lifecycle；
- v1/v2 production baseline。

五期在此基础上实现显式版本升级和 v1 迁移，不能通过修改已发布 artifact 实现迁移。
