# 自定义元素 v2 接口契约

## 1. 文档信息

| 项目 | 内容 |
|---|---|
| 文档标识 | `CUSTOM_ELEMENT_V2_API_CONTRACT` |
| 契约版本 | `v0.1-draft` |
| 决策基线 | `CUSTOM_ELEMENT_V2_DECISION_RECORD` |
| 数据基线 | `CUSTOM_ELEMENT_V2_DATA_DICTIONARY` |
| 适用阶段 | 第一期契约冻结，第二至五期分批实现，第六期验收 |
| 稳定标识 | `operationId` |
| URL 状态 | `/element/v2/*` 为建议路径，需在一期后端评审冻结 |

本文是前端、后端、构建平台和独立运行时之间的逻辑接口契约，不是业务代码或最终 OpenAPI 文件。正式实现前应据此生成并评审 OpenAPI/DTO。

---

## 2. 契约原则

1. `operationId` 表示稳定业务语义，路径迁移不改变 operationId；
2. 所有 v2 写接口显式携带 `elementProtocolVersion=2` 或由资源上下文严格限定；
3. tenantId/provId 以鉴权上下文为准，不信任客户端越权指定；
4. 客户端不能提交可信 packageUrl、artifact URL、artifactHash、扫描结论或签名；
5. 资源创建使用幂等键，更新使用 revision 乐观锁；
6. build 为异步任务，客户端按 status 判断终态，不按 progress 判断；
7. preview、publish-candidate、rebuild-validation 的权限和用途分离；
8. 提交审核、审核决定、发布、下线和撤销必须有独立审计；
9. 批量 runtime info 允许部分成功，结果按 requestKey 对应；
10. v2 locked identity 不允许静默解析 latest；
11. 正式运行接口不返回源包、源码、完整扫描报告或内部凭据；
12. 所有错误返回稳定 code、traceId 和 retryable，不依赖中文 message 编程。

---

## 3. API 命名规范

### 3.1 OperationId

采用 lowerCamelCase：

```text
createElementSourcePackageV2
createElementBuildV2
getElementBuildV2
saveElementDraftV2
submitElementVersionReviewV2
publishElementVersionV2
queryElementRuntimeInfoListV2
```

规则：动词 + 资源 + V2。查询单项使用 get，条件列表使用 query，创建资源使用 create，幂等状态动作使用明确动作名。

### 3.2 建议 URL

```text
/element/v2/source-packages
/element/v2/builds
/element/v2/definitions
/element/v2/versions
/element/v2/reviews
/element/v2/runtime-info:batch-query
```

若现有网关要求沿用 `/element/saveElementInfo` 等路径，应通过兼容 adapter 映射到本契约，不能把旧 DTO 的含糊语义带入 v2。

### 3.3 HTTP 方法

- GET：单项和无敏感复杂条件的只读查询；
- POST：资源创建、复杂查询、异步任务和业务动作；
- PUT/PATCH：带 revision 的草稿更新；
- 不使用 GET 执行发布、下线、撤销或取消；
- 路径和方法最终结合项目网关规范冻结。

---

## 4. 通用请求规范

### 4.1 Headers

| Header | 必填 | 说明 |
|---|---|---|
| Authorization | 是 | 平台现有认证；本文不定义 Token 形态 |
| Content-Type | 是 | 通常 `application/json`；文件上传按平台上传协议 |
| X-Request-Id | 建议 | 客户端请求追踪 ID |
| Idempotency-Key | 创建/动作类写接口是 | 调用方生成的幂等键 |
| If-Match | 更新类写接口是 | 资源 revision，例如 `"12"` |
| X-Client-Version | 建议 | 前端/SDK 版本，用于兼容诊断 |

tenantId、userId 和角色从认证上下文获取。即使请求体含 tenantId 作为筛选，也必须与鉴权上下文交叉校验。

### 4.2 通用响应 Envelope

成功：

```json
{
  "success": true,
  "data": {},
  "traceId": "tr_xxx",
  "serverTime": "2026-08-13T08:00:00Z"
}
```

失败：

```json
{
  "success": false,
  "error": {
    "code": "CE_BUILD_NOT_READY",
    "message": "构建尚未完成",
    "retryable": true,
    "stage": "build",
    "fieldPath": null,
    "details": {}
  },
  "traceId": "tr_xxx",
  "serverTime": "2026-08-13T08:00:00Z"
}
```

message 可本地化，code 不可随文案变化。details 必须脱敏且有 Schema。

### 4.3 分页

请求：

```json
{
  "pageNo": 1,
  "pageSize": 20,
  "sort": [{ "field": "createdAt", "direction": "desc" }]
}
```

响应：

```json
{
  "items": [],
  "pageNo": 1,
  "pageSize": 20,
  "total": 0
}
```

pageSize 默认 20、最大值 TBD；只允许白名单排序字段。大规模 usage/runtime 查询优先 cursor，具体阈值评审冻结。

### 4.4 Revision 与并发

- 查询资源返回 revision；
- 更新时 `If-Match` 必须等于当前 revision；
- 不一致返回 HTTP 409 + `CE_REVISION_CONFLICT`；
- 错误详情返回 currentRevision，但不自动覆盖客户端编辑；
- 发布、升级 commit 等动作还需校验业务 snapshot/hash。

### 4.5 幂等

- Idempotency-Key 在 tenant + operationId + actor 范围唯一；
- 相同 key + 相同 canonical request 返回原结果；
- 相同 key + 不同输入返回 409 `CE_IDEMPOTENCY_CONFLICT`；
- 幂等记录保留期按动作风险冻结；
- 服务端构建另有基于实际输入的 build idempotencyKey，不能只信任 header。

---

## 5. 权限模型

| 权限标识建议 | 能力 |
|---|---|
| `element.v2.create` | 新建 v2 元素草稿 |
| `element.v2.package.upload` | 上传源包 |
| `element.v2.build.preview` | 发起预览构建 |
| `element.v2.build.candidate` | 发起发布候选构建 |
| `element.v2.review.submit` | 提交审核 |
| `element.v2.review.business` | 业务审核 |
| `element.v2.review.security` | 安全审核 |
| `element.v2.publish` | 发布版本 |
| `element.v2.downline` | 下线版本 |
| `element.v2.revoke` | 紧急撤销产物 |
| `element.v2.source.read` | 查看授权源包 |
| `element.v2.scan.read` | 查看完整扫描报告 |
| `element.v2.usage.read` | 查看使用关系 |
| `element.v2.upgrade` | 创建和提交消费者升级 |
| `element.v2.legacy.migrate` | v1 迁移 |

最终权限名需接入平台权限字典。上传者不能直接批准自身新增的高风险权限；前端隐藏按钮不能替代服务端鉴权。

---

## 6. 接口目录与分期

| 领域 | operationId | 阶段 |
|---|---|---|
| 源包 | `createElementSourcePackageV2`、`getElementSourcePackageV2` | 一至二期 |
| 构建 | `createElementBuildV2`、`getElementBuildV2`、`cancelElementBuildV2` | 二期 |
| 草稿 | `createElementDefinitionV2`、`saveElementDraftV2`、`getElementDraftV2`、`queryElementDefinitionsV2` | 三期 |
| 预览 | `createElementPreviewSessionV2`、`completeElementPreviewSessionV2`、`closeElementPreviewSessionV2` | 二至三期 |
| 审核 | `submitElementVersionReviewV2`、`getElementVersionReviewV2`、`approveElementVersionReviewV2`、`rejectElementVersionReviewV2` | 三至四期 |
| 发布 | `publishElementVersionV2`、`downlineElementVersionV2`、`revokeElementArtifactV2`、`setRecommendedElementVersionV2` | 四至五期 |
| 运行 | queryElementRuntimeInfoListV2 | 四期 |
| 版本 | `queryElementVersionsV2`、`getElementVersionV2`、`diffElementVersionsV2` | 五期 |
| 使用关系 | `queryElementUsageRelationsV2` | 五期 |
| 升级 | `createElementUpgradeSessionV2`、`getElementUpgradeSessionV2`、`commitElementUpgradeSessionV2` | 五期 |
| v1 迁移 | `createLegacyElementScanV2`、`getLegacyElementMigrationV2`、`generateLegacyElementV2DraftV2` | 五期 |
| 能力目录 | `queryElementSdkCapabilitiesV2`、`queryElementDependencyPolicyV2` | 一至三期 |

---

## 7. 源包接口

### 7.1 创建源包

| 项目 | 内容 |
|---|---|
| operationId | `createElementSourcePackageV2` |
| 建议路径 | `POST /element/v2/source-packages` |
| 权限 | `element.v2.package.upload` |
| 幂等 | 必须 |

项目现有 OSS 若采用“获取上传凭证 → 直传 → 完成登记”，可拆成 init/complete 两个物理接口；逻辑结果必须满足本契约。

请求元数据：

```json
{
  "elementProtocolVersion": 2,
  "elementId": null,
  "originalFileName": "customer-card.zip",
  "contentType": "application/zip",
  "compressedSize": 182034,
  "clientPackageHash": "optional-client-sha256"
}
```

响应：

```json
{
  "packageId": "pkg_xxx",
  "originalFileName": "customer-card.zip",
  "packageHash": "server-computed-sha256",
  "compressedSize": 182034,
  "uploadStatus": "uploaded",
  "createdAt": "2026-08-13T08:00:00Z",
  "retentionUntil": "2026-09-12T08:00:00Z"
}
```

服务端必须从真实上传对象计算 hash，并完成 MIME、大小、授权和对象存储登记。响应不应把可任意修改的 packageUrl 作为后续构建输入。

错误：`CE_PACKAGE_TOO_LARGE`、`CE_PACKAGE_MIME_INVALID`、`CE_PACKAGE_HASH_MISMATCH`、`CE_PACKAGE_UPLOAD_INCOMPLETE`、`CE_ACCESS_DENIED`。

### 7.2 查询源包

| 项目 | 内容 |
|---|---|
| operationId | `getElementSourcePackageV2` |
| 建议路径 | `GET /element/v2/source-packages/{packageId}` |

返回源包元数据和基础校验，不向无 source.read 权限的角色返回下载 URL。需要下载源码时使用短时受控下载凭证和独立审计。

---

## 8. 构建接口

### 8.1 发起构建

| 项目 | 内容 |
|---|---|
| operationId | `createElementBuildV2` |
| 建议路径 | `POST /element/v2/builds` |
| 权限 | 按 purpose 区分 preview/candidate |
| 幂等 | Header + 服务端输入哈希 |

请求：

```json
{
  "elementProtocolVersion": 2,
  "elementId": "el_xxx",
  "packageId": "pkg_xxx",
  "packageHash": "sha256",
  "manifestOverrides": {},
  "purpose": "preview",
  "expectedBuilderVersion": null,
  "clientRequestId": "client_xxx"
}
```

允许 purpose：preview、publish-candidate、rebuild-validation。普通元素开发者不能直接申请 published。packageHash 用于防止客户端引用状态过期，服务端仍以 packageId 实际对象为准。

响应：

```json
{
  "buildId": "bld_xxx",
  "status": "queued",
  "phase": "queued",
  "progress": 0,
  "purpose": "preview",
  "reused": false,
  "packageHash": "sha256",
  "builderVersion": "builder-2.0.0",
  "createdAt": "2026-08-13T08:00:00Z",
  "revision": 1
}
```

publish-candidate 额外校验 elementId、目标 elementVersion、依赖/权限用途和草稿 revision。rebuild-validation 必须引用已有版本且不会替换其 artifact。

### 8.2 查询构建状态

| 项目 | 内容 |
|---|---|
| operationId | `getElementBuildV2` |
| 建议路径 | `GET /element/v2/builds/{buildId}` |

响应：

```json
{
  "buildId": "bld_xxx",
  "purpose": "preview",
  "status": "running",
  "phase": "analyze-modules",
  "progress": 38,
  "queuePosition": null,
  "estimatedWaitSeconds": null,
  "packageHash": "sha256",
  "manifestOverridesHash": "sha256",
  "componentManifest": null,
  "manifestHash": null,
  "artifactHash": null,
  "runtimeManifestUrl": null,
  "diagnostics": [],
  "timings": {},
  "createdAt": "...",
  "startedAt": "...",
  "finishedAt": null,
  "revision": 6
}
```

Analyzer 成功后才返回 componentManifest；artifact 发布成功后才返回 artifactHash/runtimeManifestUrl。轮询方只接受更高 revision，避免旧响应覆盖新状态。

### 8.3 取消构建

| 项目 | 内容 |
|---|---|
| operationId | `cancelElementBuildV2` |
| 建议路径 | `POST /element/v2/builds/{buildId}:cancel` |
| 幂等 | 必须 |

请求：

```json
{ "reason": "user-cancelled" }
```

响应返回当前 status、cancelRequested 和 revision。终态重复取消返回原终态，不反向修改；取消不删除源包。

### 8.4 构建错误

| 错误码 | HTTP | 重试 | 含义 |
|---|---:|---|---|
| CE_BUILD_INPUT_STALE | 409 | 否 | package/hash/override 已变化 |
| CE_BUILD_PURPOSE_FORBIDDEN | 403 | 否 | 无权申请该 purpose |
| CE_BUILD_ALREADY_TERMINAL | 409 | 否 | 对终态执行非法动作 |
| CE_BUILD_QUEUE_FULL | 429/503 | 是 | 队列超过容量 |
| CE_BUILD_TIMEOUT | 422/500 | 可修复后 | 构建超时 |
| CE_BUILD_FAILED | 422 | 视诊断 | 构建失败，查看 diagnostics |
| CE_BUILD_NOT_FOUND | 404 | 否 | 不存在或无权 |

---

## 9. 元素定义与草稿接口

### 9.1 新建 v2 元素定义

| 项目 | 内容 |
|---|---|
| operationId | `createElementDefinitionV2` |
| 建议路径 | `POST /element/v2/definitions` |
| 权限 | `element.v2.create` |

请求：

```json
{
  "elementProtocolVersion": 2,
  "elementCode": "customer-card",
  "elementName": "客户卡片",
  "description": "...",
  "categoryId": "cat_xxx",
  "iconAssetId": "asset_xxx",
  "ownerScope": "tenant"
}
```

响应返回 elementId、definitionStatus、currentDraftVersion、revision 和审计字段。elementCode 冲突返回 `CE_ELEMENT_CODE_CONFLICT`。

### 9.2 保存草稿

| 项目 | 内容 |
|---|---|
| operationId | `saveElementDraftV2` |
| 建议路径 | `PUT /element/v2/definitions/{elementId}/drafts/{elementVersion}` |
| 并发 | 必须 If-Match |

请求：

```json
{
  "elementProtocolVersion": 2,
  "elementVersion": "1.0.0",
  "basicInfo": {
    "elementName": "客户卡片",
    "description": "...",
    "categoryId": "cat_xxx",
    "iconAssetId": "asset_xxx",
    "ownerScope": "tenant"
  },
  "packageId": "pkg_xxx",
  "buildId": "bld_xxx",
  "manifestOverrides": {},
  "currentStep": "preview-and-validation",
  "previewValidationId": "pv_xxx"
}
```

服务端必须：

- 查询 package/build 并校验租户、purpose、hash 和状态；
- canonicalize manifestOverrides；
- 只把与当前 package/override 相符的 build 标为 current；
- 保存 dependency/SDK summary 和 dirty/stale 状态；
- 不信任客户端提交的 artifactHash 或 componentManifest；
- 对已 published 版本拒绝更新。

响应返回完整 DraftDetail、revision、reviewReadiness 和阻塞项。

### 9.3 查询草稿详情

| 项目 | 内容 |
|---|---|
| operationId | `getElementDraftV2` |
| 建议路径 | `GET /element/v2/definitions/{elementId}/drafts/{elementVersion}` |

返回：基础信息、源包摘要、Analyzer/component manifest、overrides、build 摘要、预览验证、权限/依赖、currentStep、dirty/stale、reviewReadiness、revision。源码和完整扫描报告按角色裁剪。

### 9.4 查询元素列表

| 项目 | 内容 |
|---|---|
| operationId | `queryElementDefinitionsV2` |
| 建议路径 | `POST /element/v2/definitions:query` |

筛选：关键字、categoryId、definitionStatus、versionStatus、buildStatus、ownerScope、协议版本、权限范围。列表必须返回明确 protocol、draft/build/review/published 摘要，不能只返回现有 elementStatus。

---

## 10. 预览会话接口

### 10.1 创建预览会话

| 项目 | 内容 |
|---|---|
| operationId | `createElementPreviewSessionV2` |
| 建议路径 | `POST /element/v2/preview-sessions` |

请求：

```json
{
  "buildId": "bld_xxx",
  "expectedArtifactHash": "sha256",
  "mode": "editor-preview",
  "sdkMockProfile": "default",
  "mockOverrides": {},
  "expiresInSeconds": 1800
}
```

服务端从 build 查询 artifact，校验 purpose=preview 或允许的 candidate、status=success、访问权和 hash。响应：

```json
{
  "previewSessionId": "pvs_xxx",
  "buildId": "bld_xxx",
  "artifactHash": "sha256",
  "runtimeManifestUrl": "https://controlled/...",
  "componentManifest": {},
  "sdkMockPolicy": {},
  "expiresAt": "..."
}
```

### 10.2 上报预览验证结果

| 项目 | 内容 |
|---|---|
| operationId | `completeElementPreviewSessionV2` |
| 建议路径 | `POST /element/v2/preview-sessions/{previewSessionId}:complete` |

请求包含 renderSuccess、validatedMethodNames、eventTestSummary、sdkScenarioSummary、cleanupSummary、clientDiagnostics。服务端将通过标记绑定 buildId/artifactHash；输入变化后自动失效。

客户端上报不能替代服务端构建/扫描结论，也不能伪造发布资格。

### 10.3 关闭会话

`closeElementPreviewSessionV2` 可用于审计和提前释放短期授权；宿主自身仍必须清理组件、style、Blob、ref、订阅和请求。接口失败不能成为前端不清理本地资源的理由。

---

## 11. 审核接口

### 11.1 提交审核

| 项目 | 内容 |
|---|---|
| operationId | `submitElementVersionReviewV2` |
| 建议路径 | `POST /element/v2/definitions/{elementId}/versions/{elementVersion}:submit-review` |
| 权限 | `element.v2.review.submit` |
| 幂等 | 必须 |
| 并发 | expectedDraftRevision |

请求：

```json
{
  "elementProtocolVersion": 2,
  "expectedDraftRevision": 12,
  "candidateBuildId": "bld_candidate_xxx",
  "expectedPackageHash": "sha256",
  "expectedManifestHash": "sha256",
  "expectedArtifactHash": "sha256",
  "previewValidationId": "pv_xxx",
  "permissionPurposes": [
    { "capability": "api.call.customer.read", "purpose": "展示客户摘要" }
  ],
  "submissionComment": "首次提交"
}
```

服务端事务校验：

1. 草稿 revision 未变化；
2. candidate purpose 正确、构建成功、扫描通过；
3. build 输入与当前 package/overrides 一致；
4. package/manifest/artifact hash 与服务端一致；
5. 最终预览绑定同一 artifact；
6. 权限用途完整，高风险权限进入安全审核；
7. 无阻止 review 的 diagnostics；
8. 创建冻结 review snapshot 并把版本置为 in-review。

响应返回 reviewId、reviewRevision、reviewStatus、冻结 identity、requiredReviewRoles、submittedAt。

### 11.2 查询审核详情

| 项目 | 内容 |
|---|---|
| operationId | `getElementVersionReviewV2` |
| 建议路径 | `GET /element/v2/reviews/{reviewId}` |

审核人获得冻结基础信息、component manifest、dependencies、permissions、scan summary、candidate runtime manifest 和预览入口；不得读取可变草稿最新 build。

### 11.3 审核通过

| 项目 | 内容 |
|---|---|
| operationId | `approveElementVersionReviewV2` |
| 建议路径 | `POST /element/v2/reviews/{reviewId}:approve` |

请求：

```json
{
  "expectedReviewRevision": 3,
  "reviewRole": "security",
  "comment": "扫描与权限通过"
}
```

业务/安全多角色审批规则由 workflow 配置；只有全部 requiredReviewRoles 通过，reviewStatus 才变为 approved。

### 11.4 驳回审核

`rejectElementVersionReviewV2` 请求包含 expectedReviewRevision、reviewRole、reasonCode、comment、diagnosticRefs。驳回绑定具体 review/build/hash；版本进入 rejected，可基于新草稿 revision 修正并重新提交。

### 11.5 审核失效

源包、overrides、依赖、权限或 candidate 变化时，由服务端将 pending/approved-before-publish 审核置为 invalidated，并记录 reason。发布接口必须再次校验 revision 和冻结 identity。

---

## 12. 发布、下线与撤销接口

### 12.1 发布版本

| 项目 | 内容 |
|---|---|
| operationId | `publishElementVersionV2` |
| 建议路径 | `POST /element/v2/reviews/{reviewId}:publish` |
| 权限 | `element.v2.publish` |
| 幂等 | 必须 |

请求：

```json
{
  "elementId": "el_xxx",
  "elementVersion": "1.0.0",
  "candidateBuildId": "bld_xxx",
  "expectedReviewRevision": 5,
  "expectedPackageHash": "sha256",
  "expectedManifestHash": "sha256",
  "expectedArtifactHash": "sha256",
  "setAsRecommended": true,
  "releaseNote": "首个 v2 版本"
}
```

事务：

1. review approved 且 revision 一致；
2. candidate success、scan passed、未过期/撤销；
3. 所有 hash、依赖、权限与审核快照一致；
4. 生成或确认正式签名 runtime manifest；
5. 创建不可变 element_version 和 published artifact 引用；
6. 更新 definition 指针；
7. 写审计/outbox 事件；
8. 提交后通知菜单和缓存失效。

发布时禁止重新构建和覆盖 artifact 内容。重复幂等请求返回原 publish 结果。

响应：

```json
{
  "elementId": "el_xxx",
  "elementVersion": "1.0.0",
  "elementProtocolVersion": 2,
  "versionStatus": "published",
  "artifactHash": "sha256",
  "runtimeManifestUrl": "https://...",
  "recommended": true,
  "publishedAt": "...",
  "publishedBy": "user_xxx"
}
```

### 12.2 设置推荐版本

| operationId | 建议路径 |
|---|---|
| `setRecommendedElementVersionV2` | `POST /element/v2/definitions/{elementId}:set-recommended-version` |

请求含 targetElementVersion、targetArtifactHash、expectedDefinitionRevision、reason。目标必须 published 且未 revoked。改变推荐版本不改变已保存实例。

### 12.3 下线版本

`downlineElementVersionV2` 需要 elementId、elementVersion、expectedArtifactHash、reason、expectedRevision。下线后新页面不能选择；存量策略按平台规则明确返回，不自动升级或切换版本。

### 12.4 紧急撤销产物

`revokeElementArtifactV2` 是高权限操作，请求包含 artifactHash、reasonCode、reason、incidentId、expectedVersionRevision。撤销进入 runtime info/revoke list 和缓存失效，保留 artifact 内容和审计，不物理覆盖/删除。

### 12.5 发布错误

| 错误码 | HTTP | 含义 |
|---|---:|---|
| CE_REVIEW_NOT_APPROVED | 409 | 审核未全部通过 |
| CE_REVIEW_INVALIDATED | 409 | 审核已失效 |
| CE_REVIEW_REVISION_CONFLICT | 409 | 审核 revision 变化 |
| CE_CANDIDATE_IDENTITY_MISMATCH | 409 | build/hash 与审核不一致 |
| CE_ARTIFACT_NOT_SIGNABLE | 422 | 产物不能生成有效签名 |
| CE_VERSION_CONFLICT | 409 | 版本已存在 |
| CE_PUBLISH_TRANSACTION_FAILED | 500 | 发布事务失败，未出现半发布 |

---

## 13. Runtime Info 接口

### 13.1 批量查询

| 项目 | 内容 |
|---|---|
| operationId | `queryElementRuntimeInfoListV2` |
| 建议路径 | `POST /element/v2/runtime-info:batch-query` |
| 使用方 | 主 editor/runtime、独立 page/materials |

请求：

```json
{
  "context": {
    "appId": "app_xxx",
    "pageId": "page_xxx",
    "componentId": null,
    "hostType": "materials",
    "runtimeMode": "runtime"
  },
  "elements": [
    {
      "requestKey": "el_xxx@1.0.0#sha256",
      "elementId": "el_xxx",
      "elementProtocolVersion": 2,
      "elementVersion": "1.0.0",
      "elementArtifactHash": "sha256"
    }
  ]
}
```

v2 新数据必须提供 version + artifactHash。历史缺版本请求必须明确声明 legacyResolutionAllowed=true，且仅平台兼容 adapter 可使用；普通新调用不能省略后静默取最新。

响应：

```json
{
  "items": [
    {
      "requestKey": "el_xxx@1.0.0#sha256",
      "success": true,
      "descriptor": {
        "elementId": "el_xxx",
        "protocolVersion": 2,
        "elementVersion": "1.0.0",
        "artifactHash": "sha256",
        "resolutionMode": "locked",
        "status": "available",
        "runtimeManifestUrl": "https://...",
        "sdkVersion": "2.0.0",
        "permissionsSummary": [],
        "signatureSummary": { "algorithm": "TBD", "keyId": "key_xxx" }
      }
    },
    {
      "requestKey": "bad-item",
      "success": false,
      "error": {
        "code": "CE_RUNTIME_ARTIFACT_MISMATCH",
        "reason": "artifact-mismatch",
        "retryable": false
      }
    }
  ]
}
```

规则：

- 结果按 requestKey，不按数组位置；
- 输入去重但保持所有 requestKey 的输出；
- 单项失败不使整批失败；
- 指定 version 与 artifact 不匹配返回 error；
- 下线、撤销、无权和不存在分别返回原因；
- 不返回 package URL、源码或 scan report；
- 批次上限和限流 TBD；
- 运行 host 仍需验证 runtime manifest 签名和 identity。

### 13.2 Legacy 解析

仅对明确标记的历史数据：

```json
{
  "elementId": "legacy_el",
  "elementProtocolVersion": 2,
  "legacyResolutionAllowed": true
}
```

服务端可解析 latest published，但响应必须返回实际 version/artifact 和 `resolutionMode=legacy-latest`。编辑器提示风险，确认保存后写成 locked。

---

## 14. 版本与差异接口

### 14.1 查询版本列表

| operationId | 建议路径 |
|---|---|
| `queryElementVersionsV2` | `POST /element/v2/definitions/{elementId}/versions:query` |

返回 elementVersion、versionStatus、artifactHash、builderVersion、sdkVersion、permissions/dependencies 摘要、published/downline/revoked 时间、是否 recommended 和 usage count。普通用户不获得源码/扫描详情。

### 14.2 查询版本详情

`getElementVersionV2` 路径建议为 `GET /element/v2/definitions/{elementId}/versions/{elementVersion}`。可选 `include=componentManifest,reviewSummary,usageSummary`，敏感 include 做角色校验。

### 14.3 版本差异

| 项目 | 内容 |
|---|---|
| operationId | `diffElementVersionsV2` |
| 建议路径 | `POST /element/v2/definitions/{elementId}/versions:diff` |

请求：

```json
{
  "source": { "elementVersion": "1.0.0", "artifactHash": "sha-source" },
  "target": { "elementVersion": "2.0.0", "artifactHash": "sha-target" }
}
```

响应：

```json
{
  "source": {},
  "target": {},
  "severity": "review-required",
  "props": { "added": [], "removed": [], "changed": [] },
  "events": { "added": [], "removed": [], "changed": [] },
  "methods": { "added": [], "removed": [], "changed": [] },
  "permissions": { "added": [], "removed": [] },
  "dependencies": { "added": [], "removed": [], "changed": [] },
  "sdk": { "sourceVersion": "2.0.0", "targetVersion": "2.1.0" },
  "migrationPaths": [],
  "diagnostics": []
}
```

差异排序稳定，结果可复现；权限增加和 API 删除必须突出，不只给文字摘要。

### 14.4 使用关系查询

| operationId | 建议路径 |
|---|---|
| `queryElementUsageRelationsV2` | `POST /element/v2/usage-relations:query` |

筛选：elementId、elementVersion、artifactHash、consumerType、consumerStatus、resolutionMode、app/business/template/guided 范围。支持分页/游标，返回索引时间和 drift 状态。

权限按租户和消费者范围校验；usage count 不能泄露其他租户资产。

---

## 15. 消费者显式升级接口

### 15.1 创建升级会话

| 项目 | 内容 |
|---|---|
| operationId | `createElementUpgradeSessionV2` |
| 建议路径 | `POST /element/v2/upgrade-sessions` |
| 权限 | `element.v2.upgrade` + 消费者编辑权限 |

请求：

```json
{
  "consumer": {
    "consumerType": "app-page",
    "consumerId": "page_xxx",
    "consumerRevision": 18
  },
  "instanceIds": ["ins_1", "ins_2"],
  "target": {
    "elementId": "el_xxx",
    "elementVersion": "2.0.0",
    "elementArtifactHash": "sha-target"
  }
}
```

服务端读取消费者权威快照、usage relation 和目标 published version，生成每实例 assessment。响应包括 sessionId、expiresAt、sourceConsumerRevision、contractDiff、migration result、orphanFields、diagnostics 和目标 runtime descriptor。

### 15.2 查询升级会话

`getElementUpgradeSessionV2` 返回当前 status、各实例评估、临时 migratedConfig 和 preview readiness。会话数据不修改正式消费者。

### 15.3 提交升级

| 项目 | 内容 |
|---|---|
| operationId | `commitElementUpgradeSessionV2` |
| 建议路径 | `POST /element/v2/upgrade-sessions/{upgradeSessionId}:commit` |
| 幂等 | 必须 |

请求：

```json
{
  "expectedConsumerRevision": 18,
  "acceptedAssessmentIds": ["asm_1", "asm_2"],
  "manualConfigOverrides": {},
  "previewValidationId": "pv_upgrade_xxx",
  "comment": "显式升级到 2.0.0"
}
```

服务端重新校验：consumer revision、目标仍 published/未 revoked、assessment 未过期、配置通过目标 Schema、preview identity 一致。成功时在单一事务中更新消费者草稿和 usage relation，并创建历史记录；失败不改变原消费者。

### 15.4 批量升级任务

| operationId | 建议路径 |
|---|---|
| `createBatchElementUpgradeJobV2` | `POST /element/v2/batch-upgrade-jobs` |
| `getBatchElementUpgradeJobV2` | `GET /element/v2/batch-upgrade-jobs/{jobId}` |
| `cancelBatchElementUpgradeJobV2` | `POST /element/v2/batch-upgrade-jobs/{jobId}:cancel` |

批量任务只生成每个消费者的草稿变更；不直接发布业务应用。每 consumer 有独立状态、错误和结果；可取消未提交项，报告包含全部结果。

### 15.5 升级错误

| 错误码 | HTTP | 含义 |
|---|---:|---|
| CE_UPGRADE_CONSUMER_REVISION_CONFLICT | 409 | 消费者已变化 |
| CE_UPGRADE_TARGET_NOT_AVAILABLE | 409 | 目标下线/撤销/无权 |
| CE_UPGRADE_NO_MIGRATION_PATH | 422 | 无可用迁移路径 |
| CE_UPGRADE_INCOMPATIBLE | 422 | 评估不兼容 |
| CE_UPGRADE_PREVIEW_REQUIRED | 409 | 缺少目标预览 |
| CE_UPGRADE_SESSION_EXPIRED | 410 | 会话过期 |
| CE_UPGRADE_VALIDATION_FAILED | 422 | 目标配置校验失败 |

---

## 16. v1 兼容性与迁移接口

### 16.1 发起 v1 扫描

| 项目 | 内容 |
|---|---|
| operationId | `createLegacyElementScanV2` |
| 建议路径 | `POST /element/v2/legacy-migrations:scan` |

请求：

```json
{
  "sourceElementId": "legacy_el_xxx",
  "expectedSourceRevision": 7
}
```

服务端读取 v1 三文件权威快照，检测静态 Schema、函数型配置、Store/request/CrossAPI、内部 import、非白名单依赖和全局 Less，返回 migrationJobId。

### 16.2 查询迁移状态

`getLegacyElementMigrationV2` 返回 status、sourceSnapshotHash、compatibilityLevel（automatic/assisted/manual）、detectedRisks、manualTodos、报告和生成结果。

### 16.3 生成 v2 草稿包

| 项目 | 内容 |
|---|---|
| operationId | `generateLegacyElementV2DraftV2` |
| 建议路径 | `POST /element/v2/legacy-migrations/{migrationJobId}:generate-draft` |
| 幂等 | 必须 |

请求：

```json
{
  "targetElementCode": "legacy-card-v2",
  "targetElementName": "旧卡片 v2",
  "targetVersion": "1.0.0",
  "confirmedManualItems": [],
  "comment": "生成迁移草稿"
}
```

只对允许等级生成规范 ZIP、`ngap.json`、新 packageId 和新 v2 draft。响应包含 generatedElementId/packageId、migrationReport、manualTodos。原 v1 数据不更新，生成草稿仍需走完整 v2 build/review/publish。

### 16.4 v1 使用统计

`queryLegacyElementUsageStatisticsV2` 返回按租户、元素、兼容等级和 consumerType 的聚合数据，支持 v1 新建收口评审；权限控制防止跨租户数据泄露。

---

## 17. SDK 能力目录接口

### 17.1 查询能力目录

| 项目 | 内容 |
|---|---|
| operationId | `queryElementSdkCapabilitiesV2` |
| 建议路径 | `GET /element/v2/sdk-capabilities?policyVersion=...` |

响应单项：

```json
{
  "capability": "api.call.customer.read",
  "namespace": "api",
  "operation": "call",
  "title": "读取客户摘要",
  "riskLevel": "medium",
  "requestSchema": {},
  "responseSchema": {},
  "allowedModes": ["preview", "editor", "materials"],
  "requiresBusinessReview": true,
  "requiresSecurityReview": false,
  "limits": {},
  "deprecated": false
}
```

能力目录版本进入 build 和 runtime manifest。目录响应不返回内部 endpoint、Token、request client 或 CrossAPI 对象。

### 17.2 查询外部依赖策略

`queryElementDependencyPolicyV2` 返回 packageName、exactVersion、externalName、allowed、deprecation、host availability 和 policyVersion。它用于开发提示；服务端 Analyzer/Builder 仍执行权威校验。

---

## 18. 审计与运维查询

### 18.1 查询元素审计

`queryElementAuditEventsV2` 支持按 elementId、version、buildId、artifactHash、action、actor、time range 查询。事件至少包括上传、构建、提交、审批、发布、推荐版本、下线、撤销、升级和迁移。

### 18.2 构建运维详情

`getElementBuildOperationsDetailV2` 仅运维/安全角色可用，返回 worker、阶段耗时、资源使用、清理状态和受控日志引用。不得返回生产凭据或未脱敏环境变量。

### 18.3 Artifact 引用核查

`getElementArtifactReferenceSummaryV2` 返回 version、review、draft、preview session、usage 等引用摘要，供 GC/事故处理。物理删除需要独立的受控后台任务，不向普通前端开放删除接口。

---

## 19. 统一错误码

### 19.1 前缀

| 前缀 | 领域 |
|---|---|
| CE_AUTH_* | 认证、权限和租户 |
| CE_PACKAGE_* | ZIP 和源包 |
| CE_MANIFEST_* | `ngap.json`/component manifest |
| CE_ANALYZE_* | 静态分析 |
| CE_BUILD_* | 构建任务 |
| CE_ARTIFACT_* | 产物和签名 |
| CE_DRAFT_* | 草稿 |
| CE_REVIEW_* | 审核 |
| CE_PUBLISH_* | 发布/下线/撤销 |
| CE_RUNTIME_* | runtime info/加载身份 |
| CE_SDK_* | capability 权限和调用 |
| CE_VERSION_* | 版本 |
| CE_USAGE_* | 使用关系 |
| CE_UPGRADE_* | 升级 |
| CE_MIGRATION_* | v1/声明式迁移 |
| CE_VALIDATION_* | DTO/字段校验 |

### 19.2 通用错误

| code | HTTP | retryable | 含义 |
|---|---:|---|---|
| CE_AUTH_REQUIRED | 401 | 否 | 未认证 |
| CE_ACCESS_DENIED | 403 | 否 | 无权限或跨租户 |
| CE_RESOURCE_NOT_FOUND | 404 | 否 | 不存在或无权隐藏 |
| CE_VALIDATION_FAILED | 400/422 | 否 | 请求字段/业务校验失败 |
| CE_REVISION_CONFLICT | 409 | 否 | 乐观锁冲突 |
| CE_IDEMPOTENCY_CONFLICT | 409 | 否 | 同 key 输入不同 |
| CE_RATE_LIMITED | 429 | 是 | 限流 |
| CE_SERVICE_UNAVAILABLE | 503 | 是 | 临时不可用 |
| CE_INTERNAL_ERROR | 500 | 视情况 | 未分类内部错误 |

### 19.3 错误响应要求

- 400：JSON/字段格式错误；
- 401/403：认证/授权；
- 404：不存在或按安全策略隐藏无权资源；
- 409：revision、状态或幂等冲突；
- 410：会话/短期资源已过期；
- 422：请求格式合法但业务/构建/迁移无法完成；
- 429：限流/队列准入；
- 5xx：平台故障，不用于表达组件源码错误。

错误 details 只返回必要字段；内部堆栈、SQL、对象存储凭据、Token、Cookie 和完整源码不得返回。

---

## 20. 事件与缓存失效契约

发布事务提交后通过 outbox/可靠消息产生：

```text
element.version.published.v2
element.version.recommended.changed.v2
element.version.downlined.v2
element.artifact.revoked.v2
element.definition.changed.v2
```

事件 Envelope：

```json
{
  "eventId": "evt_xxx",
  "eventType": "element.version.published.v2",
  "occurredAt": "...",
  "tenantId": "tenant_xxx",
  "elementId": "el_xxx",
  "elementVersion": "1.0.0",
  "artifactHash": "sha256",
  "revision": 9,
  "traceId": "tr_xxx"
}
```

消费者按 eventId 幂等处理。事件只通知状态变化，不携带源码、Token 或完整 scan report。撤销事件优先级最高并触发 runtime info/revoke cache 失效。

---

## 21. 安全约束

- 上传/下载使用受控对象存储凭证和短时 URL；
- Builder 只读取 packageId 登记对象，不接受任意 URL；
- 正式 runtime manifest URL 使用 allowed origin；
- 发布 API 的 hash 字段是 expected 值，服务端全部从数据库重新确认；
- 源包、扫描详情和审核信息按字段裁剪；
- 所有写动作记录 actor、tenant、identity、result、traceId；
- 日志禁止 Token、Cookie、文件内容、完整用户信息和敏感响应；
- runtime info 不返回内部服务位置；
- 撤销和密钥轮换操作需要高权限、双人/审批策略 TBD；
- 错误信息防止枚举其他租户资源。

---

## 22. 性能、限流和超时

具体阈值在一期/二期评审冻结，契约至少支持：

| 接口 | 限制维度 |
|---|---|
| source package | 单文件大小、并发上传、租户配额 |
| create build | 用户/租户并发、队列长度、purpose 配额 |
| get build | 轮询频率、退避和 Retry-After |
| runtime batch | 单批 identity 数、请求体大小、QPS |
| usage query | pageSize/cursor、时间范围 |
| batch upgrade | consumer 数、并发 worker、暂停取消 |
| audit query | 最大时间范围和导出权限 |

429/503 响应应提供 `Retry-After` 或 retryAfterMs。写接口默认不由 SDK 自动无限重试；幂等安全且 retryable 时由调用层采用有上限的退避。

---

## 23. 现有接口兼容策略

| 现有接口/链路 | v2 处理 |
|---|---|
| `/element/saveElementInfo` | 可通过 adapter 保存基础定义/草稿，但必须支持 v2 revision、package/build 和协议字段；优先新增事务语义 |
| `/element/queryElementList` | 兼容列表需返回 protocol/version/build summary；运行时不再靠它取 v2 三文件 |
| `/solutionAudit/insertSolutionAudit` | 不建议前端与 save 串行；改为 submit review 事务或 reviewToken 补偿协议 |
| v1 三文件查询 | 保留给 v1 runtime；v2 runtime info 不返回源码三文件 |
| 应用/业务组件保存 | 增加并保留完整 ElementInstance identity，并更新 usage relation |

兼容 adapter 不能：

- 丢弃 elementProtocolVersion；
- 把 preview build 当 published；
- 只保存 elementId 后运行时解析 latest；
- 用 elementStatus 替代构建/审核/版本状态；
- 通过 URL 或字段内容猜 v1/v2。

---

## 24. OpenAPI 落地要求

正式 OpenAPI 必须包含：

- 所有 operationId、request/response Schema；
- 枚举和字段格式；
- 认证和权限说明；
- Idempotency-Key/If-Match headers；
- 各状态码和 ErrorEnvelope；
- example 至少覆盖成功、校验失败、权限失败、冲突和部分成功；
- nullable 与 optional 区分；
- discriminator/oneOf 用于批量成功/失败项；
- 最大长度、数组上限、文件容量和 timeout；
- deprecated 字段和兼容期限；
- 契约版本和 changelog。

前后端 DTO/客户端优先由 OpenAPI 生成或做自动契约校验，禁止各端手写同名但不同语义的重复类型。

---

## 25. 契约测试矩阵

### 25.1 通用

- auth required/access denied/cross tenant；
- validation、unknown field、enum、length；
- idempotency same/different payload；
- If-Match success/conflict；
- traceId 和错误脱敏；
- 旧客户端缺字段的明确兼容行为。

### 25.2 构建

- package/hash mismatch；
- preview/candidate 权限；
- status/phase 合法转换；
- worker restart/timeout/cancel；
- revision 防乱序；
- 成功后 manifest/artifact identity。

### 25.3 审核发布

- draft revision changed；
- candidate purpose/hash mismatch；
- preview validation mismatch；
- permission review required；
- review invalidated；
- publish idempotency/transaction failure；
- published artifact immutable。

### 25.4 Runtime

- locked success；
- version/artifact mismatch；
- downline/revoked/access denied/missing；
- partial success 和 requestKey 对应；
- explicit legacy-latest；
- 普通 v2 请求缺 version/artifact 被拒绝。

### 25.5 升级迁移

- consumer revision conflict；
- target revoked during session；
- no/ambiguous/cyclic migration path；
- orphan fields；
- commit rollback；
- batch draft only；
- v1 source revision changed；
- generated v2 draft 不覆盖 v1。

---

## 26. 待冻结接口项

| 编号 | 项目 | 当前建议 |
|---|---|---|
| CE-API-TBD-001 | URL 采用 `/element/v2/*` 或扩展旧路径 | 推荐资源化 v2 路径，旧接口 adapter 兼容 |
| CE-API-TBD-002 | GET/POST 网关限制 | 保留 operationId，物理方法按网关冻结 |
| CE-API-TBD-003 | 上传三段式协议 | 复用 OSS，但由 element service 完成登记/hash |
| CE-API-TBD-004 | 轮询或 SSE/WebSocket | 首期轮询 + 退避，未来可推送 |
| CE-API-TBD-005 | pageSize/batch/timeout/QPS | 二期容量基线冻结 |
| CE-API-TBD-006 | 审核多角色 workflow | 业务+安全按风险动态要求 |
| CE-API-TBD-007 | 签名算法和 key summary | 与安全 ADR 同步 |
| CE-API-TBD-008 | operationId 是否加 V2 后缀 | 当前保留，生成代码时统一 |
| CE-API-TBD-009 | 错误码数字/英文映射 | 对外稳定英文 code，可补内部数字码 |
| CE-API-TBD-010 | 审计/运维 API 是否独立服务 | 按现有平台治理评审 |

---

## 27. 接口契约验收清单

- 源包 hash 由服务端计算；
- Builder 不接收任意 package/artifact URL；
- build 的 status、phase、revision 和 purpose 明确；
- 草稿保存不信任客户端 manifest/artifact；
- 提交审核是原子事务或有明确幂等补偿；
- 审核、发布绑定同一 candidate identity；
- 发布不重新构建、不覆盖 artifact；
- runtime batch 按 requestKey 支持部分成功；
- 新 v2 请求缺 version/artifact 不解析 latest；
- 推荐版本变化不改变 locked 实例；
- 升级 commit 有 revision、目标校验和失败回滚；
- 批量升级只生成草稿；
- v1 迁移不覆盖原数据；
- SDK 能力目录不暴露内部请求对象；
- 错误码、幂等、乐观锁、权限、限流和审计可测试；
- 主 `src` 和 `page/materials` 使用同一 Runtime Info/SDK 契约。
