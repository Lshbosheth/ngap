# 自定义元素 v2 二期服务端构建与可信预览开发方案

## 1. 文档信息

| 项目 | 内容 |
|---|---|
| 文档标识 | `CUSTOM_ELEMENT_V2_PHASE2_TECHNICAL_PLAN` |
| 对应期次 | 第二期：服务端构建与可信预览 |
| 前置方案 | `CUSTOM_ELEMENT_V2_PHASE1_TECHNICAL_PLAN(自定义元素v2一期协议契约与静态分析开发方案).md` |
| 主要需求 | `CE-BLD-*`、预览部分 `CE-UX-*`、`CE-RT-001～007`、部分 `CE-SEC-*` |
| 本期性质 | 建立服务端构建和真实预览闭环；产物仍为 preview，不等于正式发布 |

---

## 2. 前置条件

二期开始前必须具备：

1. `ngap.json` v2 Schema 已冻结；
2. Package Reader、Analyzer、平台组件清单和 diagnostics 已通过一期验收；
3. canonical manifest 和 hash 输入算法已冻结；
4. 外部依赖策略和首期精确版本已确认；
5. SDK 版本和权限目录至少有可构建基线；
6. 后端已确认 `elementProtocolVersion`、source/build/version 数据关系；
7. 构建服务可使用隔离临时工作区、对象存储和任务执行环境；
8. preview 产物域名、CORS、MIME 和 CSP 有可联调环境；
9. 前后端共享 golden fixtures；
10. 构建错误能够返回结构化 diagnostic，而非纯日志字符串。

若服务端仓库不在当前工作区，前端可以先完成 build-client、registry 和 mock server contract，但二期不能在真实 builder 缺失时验收完成。

---

## 3. 当前基线与改造策略

### 3.1 当前预览问题

现有 `previewElementModal.tsx`：

- 分别编译 Schema、TSX 和 Less；
- 写入 `window.MyComponentJsData` 和 `window.MyComponent`；
- 使用 `typeZDY/customComponent` 创建临时画布元素；
- 直接渲染和画布渲染存在两条路径；
- 关闭会话缺少统一资源释放。

二期新增独立 `CustomElementV2PreviewHost`，v2 预览不再经过 window 临时对象；v1 预览在三期接入前可保持原逻辑。

### 3.2 当前注册问题

`src/packages/index.tsx` 和 `materials/index.tsx` 分别维护 `componentMap`。二期新增 v2 Registry，不立即删除 v1 componentMap；三期通过 facade 接入主编辑器，四期接入独立运行时。

### 3.3 当前构建问题

当前 Babel 只转换单文件，不能作为 ZIP 正式构建器。二期服务端必须使用模块 bundler；浏览器只负责一期预检和展示，不产生审核或发布产物。

---

## 4. 本期目标与边界

### 4.1 必须交付

- 不可变源包上传与服务端 hash；
- 服务端隔离解包和一期协议复验；
- 异步构建任务；
- TS/TSX/JS/JSX 多模块打包；
- CSS/Less、图片和 SVG 处理；
- external 白名单和宿主映射；
- 源码/产物扫描；
- preview runtime manifest；
- preview ESM/CSS/assets；
- build status/progress/cancel/resume；
- 构建幂等与缓存；
- Preview Registry；
- v2 Props adapter；
- Preview SDK mock host；
- Error Boundary；
- 真实 `NgapRender` 预览路径；
- 预览资源回收；
- 构建与预览自动化测试和初步监控。

### 4.2 明确不做

- 不发布正式元素版本；
- 不接完整审核发布事务；
- 不把 preview artifact 当 publish artifact；
- 不把 v2 加入正式元素菜单；
- 不改独立 page 生产加载；
- 不开放真实高风险 SDK 能力；预览使用受控 mock；
- 不实施页面版本升级；
- 不做 v1 转换；
- 不开放容器元素；
- 不实现外部上传者安全隔离。

---

## 5. 服务端总体架构

### 5.1 组件

```text
Element Management Client
  ├─ Source Package Upload Client
  ├─ Build Client
  └─ Preview Host

Element Package Service
  ├─ Source Package Metadata
  ├─ Build Request API
  ├─ Build Status API
  └─ Build Cancel API

Build Orchestrator
  ├─ Queue / Lease
  ├─ Idempotency
  ├─ Timeout / Cancel
  └─ Phase Progress

Isolated Builder Worker
  ├─ Download + Hash Verify
  ├─ Safe Unzip
  ├─ Contract Validation
  ├─ Analyzer
  ├─ Source Scanner
  ├─ Bundler
  ├─ Artifact Scanner
  └─ Artifact Publisher

Object Storage / CDN
  ├─ source-package.zip
  ├─ preview runtime-manifest.json
  ├─ ESM chunks
  ├─ CSS
  ├─ Assets
  └─ scan-report.json
```

### 5.2 信任边界

- 浏览器上传的 packageHash 只用于快速比对，服务端重新计算；
- 对象存储 URL 不能允许客户端指定任意内网地址；
- Builder 只下载平台登记的 packageId/packageUrl；
- Builder 工作区无生产凭据、无宿主 Cookie、无内网任意访问；
- Analyzer 和 Scanner 不执行源码；
- Bundler 解析外部依赖时只使用平台锁定依赖，不执行包 scripts；
- preview 产物仍视为可信内部预览代码，不能暴露给无授权用户；
- preview runtime manifest 必须标明 `purpose: preview`，运行 loader 拒绝把它当 published 使用。

---

## 6. 数据模型

### 6.1 Source Package

```text
packageId
tenantId
ownerUserId
originalFileName
packageUrl
packageHash
compressedSize
uploadStatus
createdAt
retentionUntil
```

约束：

- packageHash 由服务端计算；
- 同租户相同 hash 可去重物理对象，但授权关系独立；
- package URL 不可变；
- 源包上传成功不更新 element definition；
- 未引用源包按保留策略回收；
- 构建和审核记录使用 packageId + packageHash 双重校验。

### 6.2 Build Record

```text
buildId
tenantId
elementId?             # 新建草稿时可为空
packageId
packageHash
manifestOverridesHash
purpose                # preview | publish-candidate
builderVersion
dependencyPolicyVersion
sdkPolicyVersion
scannerVersion
idempotencyKey
status
phase
progress
cancelRequested
startedAt
finishedAt
heartbeatAt
artifactHash?
runtimeManifestUrl?
diagnostics
timings
```

二期只实际使用 `preview`；`publish-candidate` 的字段为四期预留，不能在二期将 preview 直接发布。

### 6.3 Artifact Record

```text
artifactId
buildId
purpose
artifactHash
manifestHash
entryUrl
styleUrls
assetBaseUrl
runtimeManifestUrl
scanReportUrl
totalSize
createdAt
retentionUntil
```

preview artifact 使用短期保留，任何已被草稿引用的 build 可延长保留；删除草稿不直接同步递归删除，使用异步引用核查和垃圾回收。

---

## 7. 构建 API

### 7.1 上传源包

推荐请求由现有 OSS 上传通道扩展业务类型：

```text
businessType = element-package-v2
```

响应：

```text
packageId
packageUrl
packageHash
compressedSize
originalFileName
```

服务端同时校验 ZIP 基础 MIME、大小和访问权限。完整合法性由 build 执行。

### 7.2 发起构建

接口语义：

```text
POST /element/buildElementPackageV2
```

输入：

```text
elementId?
packageId
packageHash
manifestOverrides
purpose: preview
expectedBuilderVersion?
clientRequestId
```

响应：

```text
buildId
status: queued|running|success|failed|cancelled
phase
reused
packageHash
createdAt
```

服务端禁止客户端传任意 packageUrl、产物 URL、扫描结果或 artifactHash 作为可信值。

### 7.3 查询状态

```text
POST /element/queryElementBuildStatusV2
```

返回：

```text
buildId
status
phase
progress
queuePosition?
estimatedWaitSeconds?
packageHash
componentManifest?
runtimeManifestUrl?
artifactHash?
diagnostics
timings
createdAt/startedAt/finishedAt
```

`componentManifest` 只有分析成功后返回；失败阶段之前的结果不伪造空 manifest。

### 7.4 取消

```text
POST /element/cancelElementBuildV2
```

- 仅 build owner 或管理员可取消；
- success/failed/cancelled 为终态，不允许反向改变；
- cancel request 与 worker heartbeat 协作；
- bundler 不支持即时中断时，在当前安全检查点停止并销毁工作区；
- 取消不删除源包；
- 已上传但未引用产物按 GC 回收。

### 7.5 状态一致性

状态：

```text
queued
running
success
failed
cancelled
```

阶段：

```text
queued
download-package
verify-package
unzip
validate-manifest
analyze-modules
scan-source
bundle
scan-artifact
publish-artifact
finished
```

规则：

- status 是任务生命周期，phase 是当前处理步骤；
- success 只能对应 phase=finished；
- failed 保存最后 phase；
- progress 单调不减，但不作为事务依据；
- 客户端用 status 判断终态，不用 progress===100；
- 所有更新带 version/updatedAt，防止乱序轮询覆盖新状态。

---

## 8. 幂等、并发与任务恢复

### 8.1 幂等键

```text
packageHash
+ canonical(manifestOverrides) hash
+ builderVersion
+ dependencyPolicyVersion
+ sdkPolicyVersion
+ scannerVersion
+ purpose
```

### 8.2 复用规则

- 完全相同且 success、扫描通过、产物仍存在时可复用；
- failed/cancelled 不直接复用，但可建立新 build attempt；
- running 时相同请求返回现有 buildId；
- scanner/builder/policy 任一变化不复用；
- 不跨租户暴露 build 元数据；
- package bytes 相同但权限覆盖项不同，不复用 artifact；
- preview 与 publish-candidate 不互相复用为最终结果。

### 8.3 Worker Lease

- Worker 获取带过期时间的 lease；
- 定期 heartbeat；
- lease 超时后 orchestrator 可重新排队；
- publish-artifact 阶段必须幂等，避免重复写不一致目录；
- artifact path 使用内容寻址，重复成功写相同内容；
- 状态终态更新使用 compare-and-set。

### 8.4 客户端恢复

前端保存本地/草稿 buildId，重新进入页面后：

1. 查询 build；
2. 校验当前 packageHash 与 build packageHash；
3. 相同则恢复进度或结果；
4. 不同则标记为旧构建，不覆盖当前源包状态；
5. success 且产物过期时提示重新构建；
6. 页面离开不自动 cancel。

---

## 9. Builder Pipeline

### 9.1 下载与校验

- 根据 packageId 从受控对象存储读取；
- 限制下载大小和超时；
- 重新计算 SHA-256；
- 与记录 packageHash 不一致立即失败；
- 不跟随非受控域重定向；
- 下载到随机、受限、非共享工作区；
- 工作区绝对路径只能由服务端生成。

### 9.2 安全解包

调用一期同语义校验：

- path traversal；
- symlink/device；
- encrypted/CRC；
- duplicate/unicode/case collision；
- capacity/depth/ratio；
- sensitive files；
- MIME/magic bytes；
- root normalization。

服务端实现若不是 TypeScript，必须使用同一 golden fixture 验证结果和错误码。

### 9.3 Analyzer

服务端以冻结的一期版本运行：

- 解析 `ngap.json`；
- module graph；
- component/props/events/methods；
- SDK/依赖；
- 合并 manifestOverrides；
- 输出 canonical component manifest 和 manifestHash；
- 返回 diagnostics。

用户 override 不能覆盖：

```text
protocolVersion
packageHash
entryPath 的包外路径
实际 external imports
实际 SDK capability use
scan result
builder identity
```

### 9.4 Source Scanner

阻止或高危规则：

```text
eval/new Function
WebAssembly
dynamic import/require
fetch/XMLHttpRequest/WebSocket/EventSource
document.cookie
localStorage/sessionStorage
window.top/parent/opener
script/link/iframe 注入
document.head/body 修改
globalThis 属性劫持
无限循环明显模式
非批准远程 URL
```

Scanner 输出结构化 finding，映射 CE3xxx，并记录 rule version。混淆和间接访问无法完全检测，扫描结论不能标为沙箱证明。

### 9.5 Bundler

建议使用服务端 esbuild，或受控 Vite/Rollup；关键不是品牌，而是：

- 版本和插件锁定；
- `platform=browser`；
- `format=esm`；
- `target=chrome80`（实施前复核）；
- entry 来自规范化 manifest；
- external 只来自平台 policy；
- package scripts 永不执行；
- 无任意网络解析；
- 可输出 metafile；
- source map 仅内部预览环境；
- deterministic settings；
- resource name 含 content hash。

### 9.6 Externals

二期基线：

```text
react@18.3.1
react-dom@18.3.1
antd@5.21.0
@ant-design/icons@5.3.7
dayjs@1.11.21
@ngap/component-sdk（类型/virtual external）
```

Builder 将 external 转为宿主可解析形式。可选实现：

- import map；
- 受控 global external adapter；
- federation-like runtime facade。

禁止正则替换 import。选择方案需同时满足主 `src` 和未来 `materials/page`，二期在 Preview Host 先验证。

### 9.7 Styles

- 支持 entry import 和 `ngap.json.styles`；
- Less 编译版本锁定；
- 重写资源 URL；
- CSS 选择器加 artifact scope；
- 禁止/警告 html/body/:root/无界 `*`/全局 `.ant-*` 覆盖；
- 外部 `@import` 和危险 URL 为 error；
- `position: fixed`、高 z-index 按安全策略 warning/error；
- 输出单独 CSS 产物；
- scopeId 进入 runtime manifest。

### 9.8 Assets

- 只发布模块图或 assets include 引用的资源；
- 文件名加 content hash；
- 校验真实 MIME；
- SVG 清理和扫描；
- CSS/JS URL 重写；
- 记录 sourcePath→outputUrl；
- 未使用资源 warning，不进入产物；
- 二期不支持字体和音视频。

### 9.9 Artifact Scanner

构建后再次扫描：

- 不允许出现未 external 化的第二份 React；
- 不允许出现禁止的网络/global 模式；
- 检查 source map 是否意外公开；
- 检查 chunk/asset MIME；
- 检查 entry default export 包装协议；
- 检查 CSS scope；
- 检查产物总大小和 chunk 数；
- 计算文件 hash 和 artifactHash。

---

## 10. Preview Artifact 与 Runtime Manifest

### 10.1 目录

```text
/custom-elements-preview/{tenantId}/{buildId}/{artifactHash}/
├─ runtime-manifest.json
├─ js/index-[hash].js
├─ js/chunk-[hash].js
├─ css/index-[hash].css
├─ assets/[name]-[hash].[ext]
├─ maps/*                    # 仅受控开发环境
└─ scan-report.json
```

### 10.2 Preview Manifest 必填

```text
protocolVersion=2
purpose=preview
buildId
packageHash
manifestHash
artifactHash
builderVersion
entry/chunks/styles/assets
externals
sdk version/permissions
componentManifest
scan status/reportHash
issuedAt
expiresAt
```

二期 preview manifest 可以使用内部签名或短期 access token，但四期会增加正式 publish signature。Loader 必须检查 purpose，避免错误提升。

### 10.3 Hash 关系

- packageHash：原 ZIP bytes；
- manifestHash：canonical component manifest；
- fileHash：每个产物 bytes；
- artifactHash：有序文件路径、fileHash、builder/policy identity 的 canonical hash；
- runtime manifest 自身 hash 计算时排除可变签发字段的方式必须冻结。

---

## 11. Build Client

建议新增：

```text
shared/custom-element/build-client/
├─ buildTypes.ts
├─ sourcePackageService.ts
├─ buildService.ts
├─ pollBuildStatus.ts
├─ buildStateReducer.ts
└─ buildErrors.ts
```

### 11.1 Poll 策略

- 首次 1 秒；
- running 可 1～2 秒；
- queued 较久时退避到 3～5 秒；
- 页面隐藏后降低频率；
- status 终态停止；
- AbortController 只停止客户端轮询，不自动取消服务端 build；
- 网络失败有限重试并保留上次状态；
- 响应 build version/updatedAt 防止乱序覆盖。

### 11.2 状态 Reducer

状态至少区分：

```text
idle
uploading
uploaded
requesting-build
queued
running
success
failed
cancelled
stale-result
expired-artifact
```

源包变化立即把旧 build 标为 stale，不删除旧结果；UI 不用旧 manifest 预览新包。

---

## 12. Custom Element Registry

### 12.1 Entry

```text
artifactKey
elementId/previewSessionId
version
protocolVersion
status
loadPromise
component
schema
componentManifest
runtimeManifest
error
styles
referenceCount
dispose
```

Preview artifactKey：

```text
preview:{sessionId}:{artifactHash}
```

### 12.2 API

```text
load(descriptor)
registerPreview(input)
resolve(identity)
subscribe(listener)
retain(artifactKey)
release(artifactKey)
invalidate(identity)
retry(identity)
clearPreview(sessionId)
clearAllPreview()
```

### 12.3 并发

- 同 artifactKey 同时 load 共享 Promise；
- load 失败记录 error，不缓存为 ready；
- retry 创建新 attempt，但不并发重复加载；
- session A clear 不影响 session B；
- 同 artifact 多实例共享 ESM/CSS，instance context 独立；
- 组件卸载 release，最后引用释放样式；
- preview clear 强制释放该 session 即使 React 异常卸载。

### 12.4 模块加载

二期受控 preview 可以直接 import 同源不可变 ESM URL。加载前：

1. 校验 runtime manifest Schema；
2. 校验 purpose=preview；
3. 校验 buildId/artifactHash；
4. 校验域名；
5. 校验 externals 兼容；
6. 挂载 scoped CSS；
7. import entry；
8. 校验 default export；
9. 注册 schema/component；
10. 失败时释放本次新增资源。

---

## 13. Preview Props Adapter

### 13.1 v2 Props

```text
...config.props
...platformEventHandlers
className
style
context
id
type
config
elements
loopVariable
ref
```

覆盖顺序固定：业务 Props → 平台事件 → 保留 Props。

### 13.2 预览 Element Instance

```text
id = preview-instance:{sessionId}
type = preview:{sessionId}
elementProtocolVersion = 2
elementVersion = preview
elementArtifactHash = artifactHash
config = cloned legacy schema defaults
events/methods = manifest mapping
```

不能继续使用固定 `customComponent_5l2y4qph83` 或 `customComponent` type。

### 13.3 事件

Preview Host 提供事件 recorder：

- 回调 Props 触发；
- `context.events.emit()` 触发；
- 记录事件名、序列化 payload、时间和 instance；
- 不执行真实业务 action flow；
- 可配置 mock action 但明确标注；
- 非 manifest 事件给 warning。

### 13.4 方法

- 通过 ref 获取 runtime instance；
- 与 manifest methods 比对；
- 声明未暴露为 error，阻止提交；
- 暴露未声明为 info，不开放调用；
- 方法调用异常进入 diagnostic/log；
- Preview UI 根据 params schema 生成测试输入。

---

## 14. Preview SDK Mock Host

### 14.1 目的

验证组件只依赖公共 SDK，并允许开发者复现成功、失败、延迟、取消和权限拒绝；不连接生产真实业务权限。

### 14.2 Mock 配置

```text
mode=preview
variables initial values/write permissions
configured API mock
interfaceId→response/error/delay
integration capability mock
user basic info
file upload mock result
navigation recorder
storage in-memory namespace
logger recorder
permission denial toggles
timeout/rate-limit toggles
```

### 14.3 权限

- 仍按 manifest permissions 裁剪 context；
- Preview UI 可以模拟拒绝，但不能临时授予 manifest 未声明权限并视为通过；
- 动态 capability 仍被拒绝；
- 所有 mock 调用记录 identity 和结果；
- session clear 删除 storage 和 subscriptions。

---

## 15. Preview Host UI

建议新增：

```text
src/pages/elementManagement/CustomElementV2Preview/
├─ index.tsx
├─ PreviewCanvas.tsx
├─ PreviewPropertyPanel.tsx
├─ PreviewEventLog.tsx
├─ PreviewMethodPanel.tsx
├─ PreviewSdkMockPanel.tsx
├─ PreviewDiagnosticsPanel.tsx
├─ usePreviewSession.ts
└─ index.module.less
```

### 15.1 打开流程

1. 接收 successful build；
2. 创建唯一 sessionId；
3. registerPreview；
4. clone schema defaults；
5. 创建 preview store；
6. 通过真实 v2 adapter 渲染；
7. 展示属性/事件/方法/SDK/diagnostics。

### 15.2 关闭流程

1. 卸载 React preview root；
2. dispose SDK instance；
3. clear refs；
4. clear preview store；
5. registry.clearPreview(sessionId)；
6. 释放 CSS/Blob/listener；
7. 删除内存日志和 mock storage；
8. 不取消已完成 build，不删除源包。

### 15.3 错误状态

- manifest load failure；
- external mismatch；
- CSS load failure；
- module import failure；
- default export invalid；
- render failure；
- method mismatch；
- SDK error。

每类错误映射 CE4xxx/CE5xxx，不能全部显示“编译失败”。

---

## 16. Error Boundary 与遥测

### 16.1 Error Boundary

Fallback 显示：

- component title；
- buildId/artifactHash 短标识；
- error code；
- 安全摘要；
- retry load；
- 返回 diagnostics。

开发环境可显示 component stack；不展示 Token、内网 URL 或原始敏感响应。

### 16.2 Build Metrics

```text
queue wait
download/unzip/analyze/scan/bundle/publish duration
success/failure/cancel/timeout
diagnostic code counts
cache reuse
artifact size/chunk count
workspace cleanup failures
```

### 16.3 Preview Metrics

```text
manifest load
CSS load
module import
first render
preview session count
clear duration
style/ref/subscription leak
render errors
SDK mock calls
```

---

## 17. 文件级前端改造

### 17.1 新增共享运行核心

```text
shared/custom-element/build-client/**
shared/custom-element/registry/**
shared/custom-element/runtime/createRuntimeProps.ts
shared/custom-element/runtime/validateRuntimeMethods.ts
shared/custom-element/runtime/CustomElementErrorBoundary.tsx
shared/custom-element/runtime/runtimeManifestValidator.ts
```

### 17.2 新增预览

```text
src/pages/elementManagement/CustomElementV2Preview/**
src/custom-elements/previewHost.ts
src/custom-elements/previewStore.ts
```

### 17.3 暂时保留

```text
src/pages/elementManagement/previewElementModal.tsx   # v1
src/packages/index.tsx                                # v1 registry facade 未接入
materials/index.tsx                                   # v1 runtime
```

### 17.4 禁止新增

- 新的 `window.MyComponentV2`；
- 新的固定 `typeZDYV2`；
- 在 `componentMap` 中混入 preview session；
- 浏览器 `setTimeout` 等待文件读取；
- Preview Host 自己复制一份事件、SDK 或 Schema 解析器。

---

## 18. 后端实施任务

### P2-T1：Source Package Service

- 上传业务类型；
- 服务端 hash；
- package metadata；
- 访问控制；
- 不可变存储；
- 未引用源包保留策略。

### P2-T2：Build Orchestrator

- build record；
- queue/lease/heartbeat；
- state machine；
- progress；
- idempotency；
- cancel/timeout；
- retry attempt；
- status API。

### P2-T3：Safe Builder Worker

- download/hash；
- safe unzip；
- analyzer；
- source scanner；
- bundler；
- CSS/assets；
- artifact scanner；
- structured diagnostics。

### P2-T4：Preview Artifact Publisher

- content-addressed files；
- preview runtime manifest；
- MIME/CORS；
- expiration；
- scan report；
- GC。

---

## 19. 前端实施任务

### P2-T5：Build Client

- upload client；
- start/status/cancel；
- polling；
- reducer；
- stale result；
- resume。

### P2-T6：Registry 与 Style Registry

- entry/state；
- load/resolve/subscribe；
- retain/release；
- preview session；
- manifest/ESM/CSS load；
- cleanup/retry。

### P2-T7：Props Adapter、SDK Mock 和 Error Boundary

- runtime Props；
- event recorder；
- method validation；
- scoped context；
- mock scenarios；
- error fallback。

### P2-T8：Preview Host

- preview store；
- property panel；
- event/method/SDK panels；
- diagnostics；
- lifecycle；
- multi-session isolation。

### P2-T9：联调、测试和验收

- golden fixtures；
- builder/registry integration；
- fault injection；
- leak checks；
- metrics；
- 二期退出门槛。

---

## 20. 依赖与日历

```text
P2-T1 → P2-T2 → P2-T3 → P2-T4
                 │          │
P2-T5 ───────────┴──────────┤
P2-T6 → P2-T7 → P2-T8 ─────┤
                            ↓
                          P2-T9
```

建议 8 周：

| 周次 | 后端/构建 | 前端 | 测试/安全 |
|---|---|---|---|
| 1 | Source/Build 骨架 | Build client/Registry types | fixture 和威胁模型 |
| 2 | Queue/worker safe unzip | Registry state/load | API contract test |
| 3 | Analyzer/scanner | style registry/manifest loader | malicious packages |
| 4 | Bundler/CSS/assets | Props/SDK mock/Error Boundary | build phase tests |
| 5 | Artifact publisher | Preview Host 基础 | multi-session tests |
| 6 | Cancel/idempotency/GC | 完整 panels/lifecycle | fault injection |
| 7 | 性能和监控 | 资源清理/诊断 UX | E2E、安全复测 |
| 8 | 缺陷修复 | 缺陷修复 | 联合验收 |

---

## 21. 测试矩阵

### 21.1 Build API

- upload hash mismatch；
- unauthorized package；
- same idempotency concurrent；
- queued/running/success/failed/cancelled；
- poll network failure/out-of-order；
- cancel at each phase；
- worker crash/lease timeout；
- expired artifact；
- policy/builder change no reuse。

### 21.2 Builder

- all source extensions；
- multi-module and local type；
- CSS/Less/image/SVG；
- external imports；
- second React prevention；
- source syntax error with line/column；
- scanner rules；
- global CSS；
- artifact size/chunk limit；
- deterministic build；
- workspace cleanup。

### 21.3 Registry

- same artifact concurrent load once；
- multi versions；
- multi sessions；
- CSS reference count；
- module failure rollback；
- retry；
- clear one session only；
- missing/expired manifest；
- external mismatch；
- invalid default export。

### 21.4 Preview

- props live update；
- event callback/context emit；
- method success/missing/error；
- SDK success/error/timeout/denial；
- render Error Boundary；
- repeated open/close；
- two simultaneous sessions；
- component with subscription cleanup；
- no window global pollution。

### 21.5 Security

- Zip Slip/Bomb/encrypted；
- eval/new Function；
- fetch/XHR/WebSocket；
- cookie/storage/global access；
- script/iframe/head injection；
- unsafe CSS/SVG；
- non-whitelist dependency；
- arbitrary packageUrl/SSRF；
- artifact path traversal；
- source map exposure。

---

## 22. 风险与控制

| 风险 | 控制 |
|---|---|
| Builder 从零建设延期 | 先完成 contract 和 worker vertical slice；不降级生产门槛 |
| Bundler 插件不可复现 | 锁版本、golden artifact、禁网络解析 |
| Preview 被误用作 publish | purpose 字段、独立存储路径、loader 检查、短期保留 |
| 主线程预览阻塞 | 可信内部预览、包限制、审核；未来 iframe 不在本期 |
| CSS 污染 | artifact scope、扫描、style registry 引用计数 |
| ESM 完整性加载困难 | 二期受控同源 preview；四期签名+内容寻址正式方案 |
| 资源泄漏 | session ownership、retain/release、强制 clear、自动化 leak test |
| SDK mock 与真实宿主漂移 | 同一 SDK types 和 contract suite，三四期实现真实 host |
| 扫描被误解为强隔离 | UI、审核报告和技术文档标明 trusted model |

---

## 23. 二期完成门槛

- 真实服务端 builder 可处理标准多模块 ZIP；
- 所有构建阶段、状态和 diagnostics 可回读；
- cancel、timeout、worker crash 和 GC 有验证；
- preview artifact 有稳定 runtime manifest 和 artifactHash；
- Registry 真实加载 ESM/CSS/assets；
- Preview Host 使用 v2 Props adapter 和 SDK mock；
- 不使用 window global/typeZDY/customComponent；
- 多会话、重复开关和异常卸载无资源残留；
- source/artifact scanner 通过安全测试；
- preview 不能被发布或生产 loader 使用；
- 自动化测试、指标和二期验收报告完成。

---

## 24. 三期移交物

三期接入元素管理和主编辑器时使用：

- source package upload response；
- build request/status/cancel client；
- successful preview build descriptor；
- runtime manifest validator；
- Registry 和 preview registration；
- component manifest/legacy schema resolver；
- v2 Props adapter；
- SDK mock/host contract；
- Error Boundary；
- Preview Host；
- diagnostics UI model；
- build/preview metrics。

三期不得在元素管理页面重新实现 ZIP 解包、轮询、manifest merge 或临时组件注册。
