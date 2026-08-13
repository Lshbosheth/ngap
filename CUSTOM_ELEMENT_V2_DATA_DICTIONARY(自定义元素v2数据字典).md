# 自定义元素 v2 数据字典

## 1. 文档信息

| 项目 | 内容 |
|---|---|
| 文档标识 | `CUSTOM_ELEMENT_V2_DATA_DICTIONARY` |
| 字段命名 | API/JSON 使用 lowerCamelCase；数据库建议 snake_case |
| 协议基线 | `elementProtocolVersion = 2`、`ngap.json`、不可变 artifact |
| 决策基线 | `CUSTOM_ELEMENT_V2_DECISION_RECORD` |
| 适用范围 | 元素管理、源包、构建、审核发布、运行、SDK、升级迁移 |
| 当前状态 | 开发前草案；`TBD` 物理类型和长度需后端评审冻结 |

本文定义逻辑数据模型。若后端扩展现有表而非新建表，字段语义、唯一性、不可变性和关系仍必须保持。

---

## 2. 命名和类型规范

### 2.1 通用规则

- ID 使用不透明字符串，不向客户端承诺自增规则；
- 时间使用 ISO 8601 UTC，数据库保存 UTC；
- hash 统一使用小写十六进制 SHA-256，不带 `sha256:` 前缀；
- 业务版本 `elementVersion` 使用 SemVer 字符串；
- 协议版本 `elementProtocolVersion` 使用整数；
- 枚举使用英文机器值，不使用 UI 中文文案作为存储值；
- URL 必须为平台登记地址，客户端不能指定任意产物 URL；
- 可选字段的“未提供”和 `null` 语义必须在 DTO 中明确；
- 文件大小、耗时和 revision 使用非负整数；
- 并发写入使用 revision 乐观锁。

### 2.2 通用逻辑类型

| 类型 | API | 数据库建议 | 规则 |
|---|---|---|---|
| Identifier | string | varchar/uuid | 不透明、不可复用 |
| SemVer | string | varchar(64) | `major.minor.patch` |
| SHA256 | string | char(64) | 小写 hex |
| Timestamp | string | timestamptz | UTC |
| Revision | integer | bigint | 从 1 单调递增 |
| ByteSize | integer | bigint | 非负 |
| DurationMs | integer | bigint | 非负 |
| URL | string | text | HTTPS/受控同源 |
| JSONDocument | object/array | json/jsonb | Schema 校验后写入 |
| ErrorCode | string | varchar(64) | 稳定机器码 |

统一审计字段为 `tenantId`、`createdAt`、`createdBy`、`updatedAt`、`updatedBy`、`revision`。不可变对象仍需记录创建、签发、发布、下线和撤销审计。

---

## 3. 核心对象关系

```text
ElementDefinition 1 ── N ElementVersion
ElementDefinition 1 ── N ElementSourcePackage
ElementSourcePackage 1 ── N ElementBuild
ElementBuild 0..1 ── 1 ElementArtifact
ElementVersion 1 ── 1 published ElementArtifact
ElementReview 1 ── 1 publish-candidate ElementBuild
ElementVersion 1 ── N UsageRelation
Consumer 1 ── N ElementInstance
UpgradeSession 1 ── N UpgradeAssessment
LegacyMigrationJob 0..1 ── 1 generated v2 draft
```

- definition 是管理归属，不等于发布版本；
- source package 是用户输入，不等于 build/artifact；
- build 是一次任务，不等于版本；
- artifact 是构建输出，不等于发布状态；
- element version 发布后不可变；
- v2 consumer instance 持有精确运行身份。

---

## 4. ElementDefinition（元素定义）

逻辑表名：`element_definition`。

| API 字段 | 数据库建议 | 类型 | 必填 | 可变 | 说明 |
|---|---|---|---|---|---|
| elementId | element_id | Identifier | 是 | 否 | 元素定义 ID |
| tenantId | tenant_id | Identifier | 是 | 否 | 租户边界 |
| elementCode | element_code | string | 是 | 受限 | 租户内稳定编码 |
| elementName | element_name | string | 是 | 是 | 展示名称 |
| description | description | string | 否 | 是 | 说明 |
| categoryId | category_id | Identifier | 是 | 是 | 分类 |
| iconAssetId | icon_asset_id | Identifier | 否 | 是 | 平台受控图标资源 ID |
| iconUrl | icon_url | URL | 否 | 派生 | 根据 iconAssetId 解析的展示 URL；兼容旧 elementIcon |
| ownerScope | owner_scope | enum | 是 | 是 | private / tenant / platform |
| ownerUserId | owner_user_id | Identifier | 是 | 受限 | 所有者 |
| elementProtocolVersion | element_protocol_version | integer | 是 | 否 | v2 固定为 2 |
| definitionStatus | definition_status | enum | 是 | 是 | active / disabled / archived |
| currentRecommendedVersion | current_recommended_version | SemVer | 否 | 是 | 新实例推荐版本 |
| currentPublishedVersion | current_published_version | SemVer | 否 | 是 | 管理展示指针，不解析锁定实例 |
| currentDraftVersion | current_draft_version | SemVer | 否 | 是 | 当前草稿 |
| revision | revision | Revision | 是 | 是 | 乐观锁 |

约束：`tenantId + elementCode` 唯一。推荐版本只能指向同 elementId 下 published 且未 revoked 的版本。现有 `elementStatus` 可兼容旧 UI，但不能代替 build/review/version 状态。

---

## 5. ElementSourcePackage（元素源包）

逻辑表名：`element_source_package`。

| 字段 | 类型 | 必填 | 可变 | 说明 |
|---|---|---|---|---|
| packageId | Identifier | 是 | 否 | 源包记录 ID |
| tenantId | Identifier | 是 | 否 | 租户 |
| elementId | Identifier | 否 | 受限 | 新建未保存前可为空 |
| ownerUserId | Identifier | 是 | 否 | 上传者 |
| originalFileName | string | 是 | 否 | 原始文件名 |
| contentType | string | 是 | 否 | 服务端识别 MIME |
| packageUrl | URL | 是 | 否 | 对象存储不可变 URL |
| packageHash | SHA256 | 是 | 否 | 服务端计算 |
| compressedSize | ByteSize | 是 | 否 | ZIP 大小 |
| uncompressedSize | ByteSize | 否 | 否 | 校验后填充 |
| fileCount | integer | 否 | 否 | 校验后填充 |
| rootMode | enum | 否 | 否 | root / single-wrapper-promoted |
| uploadStatus | enum | 是 | 是 | uploading / uploaded / rejected / expired |
| rejectionCode | ErrorCode | 否 | 是 | 基础上传拒绝原因 |
| retentionUntil | Timestamp | 是 | 是 | 保留截止 |
| createdAt | Timestamp | 是 | 否 | 上传时间 |

服务端从实际对象重新计算 packageHash；同租户物理去重不等于共享授权；build 使用 packageId + packageHash 双重验证；引用中的包不能被普通 GC 删除。

---

## 6. SourceManifest（`ngap.json`）

`ngap.json` 是源包内静态 JSON，不是数据库表。最终字段以一期 JSON Schema 为准。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| schemaVersion | string | 是 | 源清单 Schema 版本 |
| protocolVersion | integer | 是 | 固定为 2 |
| package.name | string | 是 | 规范包名 |
| package.version | SemVer | 是 | 包声明版本 |
| package.displayName | string | 否 | 展示名称建议值 |
| package.description | string | 否 | 说明建议值 |
| entry | relative path | 是 | 主入口 |
| styles | relative path[] | 否 | 样式入口 |
| props | declaration[] | 否 | Props 补充声明 |
| events | declaration[] | 否 | 事件声明 |
| methods | declaration[] | 否 | 方法声明 |
| dependencies | dependency[] | 否 | 外部依赖 |
| sdk.version | SemVer/range | 是 | 目标 SDK |
| sdk.permissions | string[] | 否 | capability 权限 |
| assets | declaration[] | 否 | 特殊资源 |
| migrations | declaration[] | 否 | 声明式迁移 |

禁止函数值、可执行迁移脚本、Token、对象存储凭据、生产内网地址和未经允许的绝对 URL。

---

## 7. ComponentManifest（平台组件清单）

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| schemaVersion | string | 是 | 平台清单 Schema |
| protocolVersion | integer | 是 | 2 |
| packageName | string | 是 | 规范包名 |
| source | object | 是 | packageHash、entry、分析版本 |
| props | ComponentProp[] | 是 | 规范化属性 |
| events | ComponentEvent[] | 是 | 规范化事件 |
| methods | ComponentMethod[] | 是 | 规范化方法 |
| dependencies | ExternalDependency[] | 是 | 审核依赖 |
| sdk | SDKDeclaration | 是 | SDK 和权限 |
| styles | StyleDeclaration[] | 是 | 样式入口/作用域 |
| assets | AssetDeclaration[] | 是 | 资源 |
| diagnosticsSummary | object | 是 | 诊断数量 |
| generatedBy | object | 是 | Analyzer/Schema 版本 |

### 7.1 ComponentProp

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| name | string | 是 | 代码属性名 |
| title | string | 是 | 展示标题 |
| type | TypeDescriptor | 是 | 可序列化类型 |
| required | boolean | 是 | 是否必填 |
| defaultValue | JSON value | 否 | 只允许静态值 |
| editor | string | 是 | 配置编辑器标识 |
| group/order | string/integer | 否 | 分组和排序 |
| visibleWhen | expression object | 否 | 受控显隐规则 |
| source | enum | 是 | analyzer / ngap-json / user-override |
| confidence | enum | 是 | exact / inferred / unknown |
| stale | boolean | 是 | 是否需重确认 |

ComponentEvent 包含 name、title、payloadSchema、description、source、stale；ComponentMethod 包含 name、title、parameterSchema、returnSchema、description、source、stale。二者只描述契约，不包含函数实现。

### 7.2 ManifestOverrides

只保存可编辑字段 patch，不能覆盖 protocolVersion、packageHash、入口分析事实、安全诊断和服务端策略。canonical 后计算 `manifestOverridesHash` 并进入 build identity。

---

## 8. Diagnostic（诊断）

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| diagnosticId | Identifier | 是 | 单次结果内稳定 ID |
| code | ErrorCode | 是 | 稳定错误码 |
| severity | enum | 是 | error / warning / info |
| stage | enum | 是 | package/manifest/analyze/scan/bundle/artifact/load/render/sdk |
| message | string | 是 | 安全摘要 |
| filePath | relative path | 否 | 源包内路径 |
| line/column | integer | 否 | 1-based 位置 |
| fieldPath | string | 否 | JSON/DTO 字段路径 |
| suggestion | string | 否 | 修复建议 |
| blockingActions | string[] | 是 | build/review/publish/runtime |
| detailsRef | Identifier/URL | 否 | 受控详情 |

error 阻止声明动作；warning 按策略确认；info 不阻止。message/details 不得包含 Token、Cookie、完整文件内容或敏感响应。

---

## 9. ElementBuild（构建任务）

逻辑表名：`element_build`。

| 字段 | 类型 | 必填 | 可变 | 说明 |
|---|---|---|---|---|
| buildId | Identifier | 是 | 否 | 任务 ID |
| tenantId | Identifier | 是 | 否 | 租户 |
| elementId | Identifier | 否 | 否 | 新建可为空 |
| packageId/packageHash | fields | 是 | 否 | 权威输入 |
| manifestOverrides | object | 否 | 否 | 覆盖快照 |
| manifestOverridesHash | SHA256 | 是 | 否 | canonical hash |
| purpose | enum | 是 | 否 | preview / publish-candidate / rebuild-validation |
| builderVersion | string | 是 | 否 | 构建器 |
| dependencyPolicyVersion | string | 是 | 否 | 依赖策略 |
| sdkPolicyVersion | string | 是 | 否 | SDK 策略 |
| scannerVersion | string | 是 | 否 | 扫描器 |
| idempotencyKey | string | 是 | 否 | 幂等键 |
| status | enum | 是 | 是 | 生命周期 |
| phase | enum | 是 | 是 | 当前阶段 |
| progress | integer | 是 | 是 | 0～100，非事务依据 |
| queuePosition | integer | 否 | 是 | 估算值 |
| cancelRequested | boolean | 是 | 是 | 取消请求 |
| heartbeatAt | Timestamp | 否 | 是 | worker 心跳 |
| componentManifest/manifestHash | fields | 否 | 否 | 分析成功后冻结 |
| artifactId/artifactHash | fields | 否 | 否 | 成功后关联 |
| diagnostics | Diagnostic[] | 是 | 是 | 终态冻结 |
| timings | object | 否 | 是 | 阶段耗时 |
| startedAt/finishedAt | Timestamp | 否 | 是 | 时间 |
| revision | Revision | 是 | 是 | 防乱序 |

BuildStatus：`queued / running / success / failed / cancelled`，终态不可逆。BuildPhase：`queued / download-package / verify-package / unzip / validate-manifest / analyze-modules / scan-source / bundle / scan-artifact / publish-artifact / finished`。success 只能对应 finished；failed 保存最后 phase。

---

## 10. ElementArtifact（运行产物）

逻辑表名：`element_artifact`。

| 字段 | 类型 | 必填 | 可变 | 说明 |
|---|---|---|---|---|
| artifactId | Identifier | 是 | 否 | 产物 ID |
| tenantId/buildId | Identifier | 是 | 否 | 租户和来源 |
| purpose | enum | 是 | 否 | preview / publish-candidate / rebuild-validation / published |
| artifactHash | SHA256 | 是 | 否 | 产物身份 |
| manifestHash | SHA256 | 是 | 否 | component manifest hash |
| runtimeManifestUrl | URL | 是 | 否 | 不可变 URL |
| entryUrl/chunkUrls | URL/URL[] | 是 | 否 | ESM 资源 |
| styleUrls | URL[] | 是 | 否 | CSS |
| assetBaseUrl | URL | 是 | 否 | 资源根地址 |
| scanReportUrl | URL | 否 | 否 | 受权限保护 |
| scanStatus | enum | 是 | 否 | passed / failed |
| totalSize | ByteSize | 是 | 否 | 总字节 |
| signatureStatus | enum | 是 | 否 | unsigned / signed / invalid |
| retentionUntil | Timestamp | 否 | 是 | 临时产物保留期 |
| revokedAt/revokeReason | fields | 否 | 一次性 | 撤销信息 |
| createdAt | Timestamp | 是 | 否 | 创建时间 |

published 产物字段不可更新；撤销是独立状态，不覆盖内容；被已发布版本引用的 artifact 禁止普通 GC。

---

## 11. RuntimeManifest（运行清单）

`runtime-manifest.json` 由服务端生成并签名。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| schemaVersion | string | 是 | Runtime Schema 版本 |
| canonicalizationVersion | string | 是 | 签名 canonical 版本 |
| protocolVersion | integer | 是 | 2 |
| purpose | enum | 是 | preview / published 等 |
| elementId | Identifier | published 是 | 元素定义 |
| elementVersion | SemVer | published 是 | 发布版本 |
| packageName | string | 是 | 包名 |
| packageHash | SHA256 | 是 | 源包 hash |
| manifestHash | SHA256 | 是 | 平台清单 hash |
| artifactHash | SHA256 | 是 | 产物 hash |
| builderVersion | string | 是 | 构建器 |
| dependencyPolicyVersion | string | 是 | 依赖策略 |
| sdkPolicyVersion | string | 是 | SDK 策略 |
| scannerVersion | string | 是 | 扫描器 |
| entry | ResourceEntry | 是 | URL、integrity、format |
| chunks/styles/assets | ResourceEntry[] | 是 | 资源 |
| externals | ExternalDependency[] | 是 | 宿主依赖 |
| sdk | SDKDeclaration | 是 | 版本和冻结权限 |
| componentManifest | object | 是 | 组件契约 |
| scan | object | 是 | status=passed、reportHash |
| issuedAt | Timestamp | 是 | 签发时间 |
| signatureAlgorithm | string | published 是 | 签名算法 |
| keyId | string | published 是 | 密钥 ID |
| signature | string | published 是 | 签名 |

ResourceEntry 至少包含 url、integrity/hash、contentType、size。签名之外的内容变化会使签名失效。

---

## 12. ElementVersion（元素版本）

逻辑表名：`element_version`。

| 字段 | 类型 | 必填 | 可变 | 说明 |
|---|---|---|---|---|
| elementVersionId | Identifier | 是 | 否 | 版本记录 ID |
| tenantId/elementId | Identifier | 是 | 否 | 租户和元素 |
| elementVersion | SemVer | 是 | 否 | 业务版本 |
| elementProtocolVersion | integer | 是 | 否 | 2 |
| versionStatus | enum | 是 | 状态机限制 | 状态 |
| packageId/packageHash | fields | 是 | 否 | 源包 |
| componentManifest | object | 是 | 否 | 冻结平台清单 |
| manifestHash | SHA256 | 是 | 否 | 清单 hash |
| buildId | Identifier | 是 | 否 | candidate build |
| artifactId/artifactHash | fields | 是 | 否 | published artifact |
| runtimeManifestUrl | URL | 是 | 否 | 不可变清单 |
| builderVersion/scannerVersion | string | 是 | 否 | 工具版本 |
| dependencyPolicyVersion | string | 是 | 否 | 依赖策略 |
| sdkVersion/sdkPolicyVersion | string | 是 | 否 | SDK 信息 |
| sdkPermissions | string[] | 是 | 否 | 冻结权限 |
| reviewId | Identifier | 是 | 否 | 审核记录 |
| publishedAt/By | audit | 否 | 否 | 发布 |
| downlineAt/By | audit | 否 | 一次性 | 下线 |
| revokedAt/By | audit | 否 | 一次性 | 撤销 |
| createdAt/By | audit | 是 | 否 | 创建 |

唯一性：`tenantId + elementId + elementVersion`。同一 version 不能绑定第二个 artifactHash；修复只能创建新版本。

VersionStatus：`draft / in-review / rejected / published / downline / revoked`。

```text
draft → in-review → rejected → draft
draft → in-review → published → downline
published/downline → revoked
```

published 不退回 draft。

---

## 13. ElementReview（审核）

逻辑表名：`element_review`；高风险权限复审可拆为 `element_permission_review`。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| reviewId | Identifier | 是 | 审核 ID |
| reviewToken | string | 是 | 提交幂等 token |
| tenantId/elementId | Identifier | 是 | 租户和元素 |
| elementVersion | SemVer | 是 | 目标版本 |
| candidateBuildId | Identifier | 是 | publish-candidate build |
| packageHash/manifestHash/artifactHash | SHA256 | 是 | 冻结身份 |
| sdkPermissions | string[] | 是 | 冻结权限 |
| dependencies | object[] | 是 | 冻结依赖 |
| scanSummary | object | 是 | 扫描摘要 |
| previewValidationId | Identifier | 是 | 最终预览 |
| reviewStatus | enum | 是 | pending/approved/rejected/invalidated |
| reviewRevision | Revision | 是 | 发布乐观锁 |
| submittedAt/By | audit | 是 | 提交 |
| reviewedAt/By | audit | 否 | 审核 |
| reviewComment | string | 否 | 审核意见 |
| invalidatedReason | string | 否 | 输入变化导致失效 |

审核记录绑定冻结快照。candidate build、hash、权限或依赖变化后不得沿用已批准结论。

---

## 14. ElementInstance（页面元素实例）

嵌入页面、业务组件、模板和引导式数据。

| 字段 | 类型 | v2 必填 | 说明 |
|---|---|---|---|
| instanceId | Identifier | 是 | 页面内实例 ID |
| type | Identifier | 是 | elementId，沿用现有渲染字段 |
| elementProtocolVersion | integer | 是 | 2 |
| elementVersion | SemVer | 是 | 锁定版本 |
| elementArtifactHash | SHA256 | 是 | 锁定 artifact |
| resolutionMode | enum | 否 | locked；旧数据可为 legacy-latest |
| config | object | 是 | Props 配置 |
| eventBindings | object[] | 否 | 事件编排 |
| methodBindings | object[] | 否 | 方法引用 |
| layout | object | 是 | 画布布局 |
| metadata | object | 否 | 编辑器元信息 |

所有序列化、历史、复制、模板、分享、Worker 和引导式节点链路保留完整身份。新 v2 实例只能是 locked；legacy-latest 只用于旧数据，确认保存后转 locked。

---

## 15. RuntimeDescriptor（运行描述）

批量 runtime info 的单项成功结果。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| requestKey | string | 是 | 对应请求项 |
| elementId | Identifier | 是 | 元素 |
| protocolVersion | integer | 是 | 1 或 2 |
| elementVersion | SemVer | v2 是 | 实际版本 |
| artifactHash | SHA256 | v2 是 | 实际产物 |
| resolutionMode | enum | 是 | locked / legacy-latest |
| status | enum | 是 | available / downline / revoked |
| runtimeManifestUrl | URL | v2 可用时 | 运行清单 |
| sdkVersion | string | v2 可用时 | SDK |
| permissionsSummary | string[] | v2 可用时 | 权限摘要 |
| signatureSummary | object | v2 可用时 | algorithm/keyId |

单项失败：

```text
requestKey
elementId
requestedVersion?
requestedArtifactHash?
code
reason: missing | access-denied | version-mismatch | artifact-mismatch | downline | revoked | invalid-identity
retryable
traceId
```

普通运行页不返回 source package、源码、scan report 或内部堆栈。

---

## 16. UsageRelation（使用关系）

逻辑表名：`element_usage_relation`。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| relationId | Identifier | 是 | 关系 ID |
| tenantId/provId | Identifier | 是 | 数据边界 |
| consumerType | enum | 是 | app-page/business-component/template/guided-node |
| consumerId | Identifier | 是 | 消费对象 |
| consumerVersion | string | 否 | 消费者版本 |
| consumerRevision | Revision | 是 | 升级乐观锁 |
| sceneType | string | 否 | 场景类型 |
| instanceId | Identifier | 是 | 元素实例 |
| elementId | Identifier | 是 | 元素 |
| elementProtocolVersion | integer | 是 | 1/2 |
| elementVersion | SemVer | v2 locked 是 | 使用版本 |
| elementArtifactHash | SHA256 | v2 locked 是 | 使用产物 |
| resolutionMode | enum | 是 | locked / legacy-latest |
| configHash | SHA256 | 是 | 配置快照 hash |
| consumerStatus | enum | 是 | draft/published/history/deleted |
| lastIndexedAt | Timestamp | 是 | 索引时间 |

唯一键建议包含 consumerType、consumerId、consumerRevision、instanceId。保存消费者时增量更新，同时支持回填和 drift reconciliation。

---

## 17. UpgradeSession 与 UpgradeAssessment

### 17.1 UpgradeSession

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| upgradeSessionId | Identifier | 是 | 会话 |
| tenantId | Identifier | 是 | 租户 |
| consumerType/consumerId | fields | 是 | 消费者 |
| sourceConsumerRevision | Revision | 是 | 乐观锁基线 |
| targetElementId | Identifier | 是 | 元素 |
| targetElementVersion | SemVer | 是 | 目标版本 |
| targetArtifactHash | SHA256 | 是 | 目标产物 |
| status | enum | 是 | created/previewed/committed/expired/cancelled/failed |
| expiresAt | Timestamp | 是 | 过期时间 |
| createdAt/By | audit | 是 | 创建 |

### 17.2 UpgradeAssessment

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| assessmentId | Identifier | 是 | 评估 ID |
| upgradeSessionId | Identifier | 是 | 会话 |
| instanceId | Identifier | 是 | 实例 |
| sourceIdentity/targetIdentity | object | 是 | 源/目标身份 |
| contractDiff | object | 是 | Props/events/methods/permissions/dependencies |
| severity | enum | 是 | compatible/review-required/incompatible |
| migrationPath | string[] | 否 | 迁移链 |
| migratedConfig | object | 否 | 临时结果 |
| orphanFields | string[] | 是 | 未映射配置 |
| diagnostics | Diagnostic[] | 是 | 问题 |

commit 重新校验 consumer revision、目标发布/撤销状态和评估 hash；失败不修改原消费者。

---

## 18. DeclarativeMigration（声明式迁移）

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| migrationId | string | 是 | 迁移标识 |
| fromVersion | SemVer | 是 | 来源 |
| toVersion | SemVer | 是 | 目标 |
| operations | MigrationOperation[] | 是 | 受控操作 |
| reverseOperations | MigrationOperation[] | 否 | 显式降级路径 |
| description | string | 否 | 说明 |

首期允许的 operation type 建议为：

```text
rename-field
copy-field
remove-field
set-default
map-enum
move-field
wrap-object
unwrap-object
```

禁止 script、eval、function body、网络或宿主调用。输出必须通过目标 component manifest 校验。

---

## 19. LegacyMigrationJob（v1 迁移任务）

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| migrationJobId | Identifier | 是 | 任务 ID |
| tenantId | Identifier | 是 | 租户 |
| sourceElementId | Identifier | 是 | v1 元素 |
| sourceSnapshotHash | SHA256 | 是 | 三文件快照 |
| compatibilityLevel | enum | 是 | automatic/assisted/manual |
| detectedRisks | object[] | 是 | 函数 Schema、内部对象等 |
| status | enum | 是 | scanning/ready/generating/generated/failed/cancelled |
| generatedPackageId | Identifier | 否 | v2 草稿源包 |
| generatedElementId | Identifier | 否 | 新 v2 草稿元素 |
| reportUrl | URL | 否 | 迁移报告 |
| manualTodos | object[] | 是 | 人工项 |
| createdAt/By | audit | 是 | 创建 |
| finishedAt | Timestamp | 否 | 完成 |

生成结果不得覆盖 sourceElementId 的 v1 数据，也不能跳过 v2 构建、审核和发布。

---

## 20. SDK 数据对象

### 20.1 ComponentContext

逻辑形状：

```text
context.identity
context.runtime
context.variables
context.api
context.files
context.navigation
context.notifications
context.messaging
context.storage
context.telemetry
context.lifecycle
```

### 20.2 SDKIdentity

```text
tenantId
appId?
pageId?
componentId?
instanceId
elementId
elementVersion
artifactHash
hostType: main | materials
runtimeMode: editor | preview | runtime
```

### 20.3 SDKCallEnvelope

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| callId | Identifier | 是 | 单次调用 |
| capability | string | 是 | 稳定能力名 |
| operation | string | 是 | 操作 |
| payload | object | 否 | Schema 校验参数 |
| timeoutMs | integer | 否 | 不超过策略上限 |
| traceId | string | 否 | 链路追踪 |

结果模型：

```text
success: { callId, data, traceId, durationMs }
failure: { callId, error: { code, message, retryable, details? }, traceId, durationMs }
```

SDK DTO 禁止出现 Token、Cookie、Store、request 实例或 raw CrossAPI。错误 details 必须脱敏。

---

## 21. 状态枚举汇总

| 枚举 | 值 |
|---|---|
| ProtocolVersion | 1 / 2 |
| BuildPurpose | preview / publish-candidate / rebuild-validation |
| BuildStatus | queued / running / success / failed / cancelled |
| ScanStatus | pending / passed / failed |
| VersionStatus | draft / in-review / rejected / published / downline / revoked |
| ReviewStatus | pending / approved / rejected / invalidated |
| ResolutionMode | locked / legacy-latest |
| DiagnosticSeverity | error / warning / info |
| RuntimeStatus | available / downline / revoked |
| UpgradeSeverity | compatible / review-required / incompatible |
| LegacyCompatibility | automatic / assisted / manual |

UI 中文文案由前端映射，不写入存储枚举。

---

## 22. Hash 与身份关系

```text
packageHash
  = SHA256(source-package.zip bytes)

manifestOverridesHash
  = SHA256(canonical(manifestOverrides))

manifestHash
  = SHA256(canonical(componentManifest))

artifactHash
  = SHA256(canonical artifact inventory + content hashes)

runtimeManifest signature
  = Sign(privateKey, canonical(runtimeManifest without signature))
```

- 相同 packageHash 不保证相同 artifactHash，builder/策略也是输入；
- 相同 artifactHash 必须对应相同内容清单；
- elementVersion 一旦 published 只能绑定一个 artifactHash；
- 审核的 packageHash、manifestHash、artifactHash 与发布事务完全一致；
- runtime 指定 version + artifactHash 时，两者不一致返回错误；
- builder 重建产生不同 artifact 时创建新版本/新审核，不能冒充旧 artifact。

---

## 23. 不可变性与删除规则

| 对象 | 可修改期 | 冻结后 | 删除规则 |
|---|---|---|---|
| ElementDefinition | 持续管理 | 推荐指针可变 | 归档，不级联删版本 |
| SourcePackage | 不可改内容 | 引用持续有效 | 未引用且过保留期 GC |
| Build | 运行期改状态 | 终态冻结 | 按审计策略保留 |
| Artifact | 不改内容 | published 不可覆盖 | 未引用临时产物可 GC |
| ElementVersion | draft 可编辑 | published 不可改 | 下线/撤销，不物理删 |
| Review | pending 可决策 | 终态冻结 | 审计保留 |
| ElementInstance | 消费者草稿可改 | 随消费者历史管理 | 不脱离消费者删除 |
| UsageRelation | 随消费者重建 | 保留状态/历史 | 可修复但需审计 drift |

所有删除先做引用核查，对象存储递归删除不得由前端直接触发。

---

## 24. v1 兼容字段映射

| 现有概念/字段 | v2 处理 |
|---|---|
| `elementJsDemo` | 只用于 v1，v2 不存运行入口 |
| `elementCssDemo` | 只用于 v1，v2 样式来自 artifact |
| `elementConfigDemo` | v1 Schema；v2 使用 component manifest |
| `elementVersion` | 保留业务版本，不能代替协议版本 |
| `elementStatus` | 兼容 UI，不能代替 build/review/version 状态 |
| `typeZDY` / `customComponent` | 旧前端可保留；v2 以 elementProtocolVersion 分流 |
| 仅 `elementId` 的页面实例 | 标记 legacy-latest，不视为 v2 locked 数据 |

禁止通过旧字段是否为 URL、JSON 或源码推断 v2。

---

## 25. 索引与约束建议

| 对象 | 建议索引/约束 |
|---|---|
| element_definition | unique(tenant_id, element_code) |
| element_version | unique(tenant_id, element_id, element_version) |
| source_package | index(tenant_id, package_hash) |
| element_build | unique(tenant_id, idempotency_key)；index(status, phase, created_at) |
| element_artifact | artifactHash/purpose/tenant scope 唯一性按隔离策略冻结 |
| element_review | unique(review_token)；index(element_id, element_version) |
| usage_relation | unique(consumer_type, consumer_id, consumer_revision, instance_id) |
| usage_relation | index(element_id, element_version, element_artifact_hash) |
| upgrade_session | index(consumer_id, status, expires_at) |

外键和软删除结合现有库冻结，但不得删除已发布版本仍引用的 package/build/artifact。

---

## 26. 数据权限与脱敏

| 数据 | 运行用户 | 页面搭建者 | 元素开发/维护 | 审核/安全 | 运维 |
|---|---|---|---|---|---|
| Runtime descriptor | 必要字段 | 可见 | 可见 | 可见 | 可见 |
| Component manifest | 运行部分 | 可见 | 可见 | 可见 | 可见 |
| 源包/源码 | 不可见 | 不可见 | 自有/授权 | 授权 | 原则上不可直接读 |
| Scan report | 摘要 | 摘要 | 自有详情 | 详情 | 运维摘要 |
| SDK 审计 | 不可见 | 自身摘要 | 自有摘要 | 详情 | 指标 |
| Token/Cookie | 永不返回 | 永不返回 | 永不返回 | 永不返回 | 日志也脱敏 |

跨租户查询由后端鉴权上下文强制校验，不能只依赖客户端 tenantId。

---

## 27. 数据迁移和回填要求

1. 新 v2 定义写入 `elementProtocolVersion=2`；
2. 页面、业务组件、模板和引导式序列化增加 version/artifact；
3. 缺少版本的旧实例标记 legacy-latest，不伪造 locked；
4. 建立 usage relation 全量回填，与保存时增量索引核对；
5. 保留现有元素状态原数据，不一次性重写历史；
6. v1 转 v2 创建新草稿，不覆盖 v1 三文件；
7. 每批迁移记录批次、数量、失败、重试和回滚；
8. 回填前后执行页面 JSON round-trip 和双运行时回归。

---

## 28. 待冻结数据项

| 编号 | 项目 | 当前建议 |
|---|---|---|
| CE-DATA-TBD-001 | 新表或扩表现状 | 优先逻辑分表，结合现有后端评审 |
| CE-DATA-TBD-002 | ID 格式和长度 | 不透明字符串/UUID，统一上限 |
| CE-DATA-TBD-003 | elementCode 格式 | 租户内小写稳定编码 |
| CE-DATA-TBD-004 | SemVer 校验 | 遵循 SemVer 2.0.0 子集 |
| CE-DATA-TBD-005 | JSON 大字段存储 | JSONB 或受控对象存储 + hash |
| CE-DATA-TBD-006 | preview/candidate/source 保留期 | 按引用和合规策略冻结 |
| CE-DATA-TBD-007 | tenantId 与 provId 关系 | 沿用鉴权上下文，不信任客户端 |
| CE-DATA-TBD-008 | published/recommended 指针 | 分离，具体 UI 行为评审 |
| CE-DATA-TBD-009 | runtime manifest canonical 格式 | 与签名 ADR 同步冻结 |
| CE-DATA-TBD-010 | usage relation 历史保留 | 支持发布/历史影响分析 |

---

## 29. 数据字典验收清单

- 同名字段在需求、方案和 API 中语义一致；
- protocolVersion 与 elementVersion 未混用；
- package/build/artifact/version/review 为独立对象；
- 已发布身份字段不可变；
- v2 ElementInstance 具备完整 locked identity；
- build status 与 phase 分离；
- preview 与 publish-candidate 可区分；
- RuntimeManifest 具备完整 hash/签名链；
- UsageRelation 覆盖应用、业务组件、模板和引导式节点；
- SDK DTO 不包含内部对象和凭据；
- v1 映射不按 URL/内容猜协议；
- 删除和 GC 不会误删已发布引用。
