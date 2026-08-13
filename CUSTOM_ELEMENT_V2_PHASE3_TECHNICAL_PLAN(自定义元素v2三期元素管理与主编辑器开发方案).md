# 自定义元素 v2 三期元素管理与主编辑器开发方案

## 1. 文档信息

| 项目 | 内容 |
|---|---|
| 文档标识 | `CUSTOM_ELEMENT_V2_PHASE3_TECHNICAL_PLAN` |
| 对应期次 | 第三期：元素管理与主编辑器接入 |
| 前置方案 | 一期协议/Analyzer、二期服务端构建/可信预览 |
| 主要需求 | `CE-UX-*`、管理端 `CE-LFC-*`、主 `src` 的 `CE-RT-*`、主宿主 SDK |
| 本期性质 | 打通元素管理和主编辑器内部试点；独立生产运行仍由四期完成 |

---

## 2. 当前代码核查结论

### 2.1 元素管理页面

当前主要文件：

```text
src/pages/elementManagement/index.tsx
src/pages/elementManagement/elementDetail.tsx
src/pages/elementManagement/AddElementModal.tsx
src/pages/elementManagement/previewElementModal.tsx
src/pages/elementManagement/SingleFunctionUploadModal.tsx
src/pages/elementManagement/onlineEditing.tsx
```

现状：

- `index.tsx` 体量较大，内置元素 mock、列表、过滤、保存、审核和弹窗状态集中；
- `AddElementModal` 仍围绕 TSX/Schema/Less 三字段；
- `SingleFunctionUploadModal` 是单 TSX 演示，只能编译预览；
- 保存使用 `/element/saveElementInfo`；
- 提交审核后调用 `/solutionAudit/insertSolutionAudit`；
- `elementDetail.tsx` 也包含独立的保存/审核逻辑；
- 保存成功后调用 `updateComponent(elementId)` 刷新当前全局 componentMap；
- 当前状态 1/2/3/4/5/6 保持不变。

三期不能继续向现有大页面堆叠 ZIP 状态，应新增独立 v2 editor 和 service，列表页面只负责入口、筛选和刷新。

### 2.2 元素菜单

`src/config/components.tsx` 会查询已发布元素并追加菜单。当前菜单对象缺少显式 protocol/version/artifact identity，容易重复 push。三期改成规范化菜单服务和不可变更新。

### 2.3 Schema 消费

当前多个入口直接调用：

```text
getComponent(type + 'Config')
```

包括：

- `ConfigPanel.tsx`；
- `DragMenuItem.tsx`；
- `editor.tsx`；
- 多个容器/布局组件新增子元素逻辑。

三期需要先建立 `resolveComponentSchema(identity)` facade 兼容这些调用，不能一次漏改后导致某种拖拽入口生成空配置。

### 2.4 主 `NgapRender`

当前：

- 只在首次 effect 获取组件；
- `customComponent` 从 window 读取；
- v1 只传嵌套 `config`；
- 事件由当前 `config.events` 构造；
- ref 只注册，卸载清理路径需要补齐；
- 内置、远程、自定义组件混在一个 Material 分支。

三期引入 v2 resolver/adapter，同时保持内置、远程和 v1 运行语义。

### 2.5 页面实例与保存

`ComItemType` 当前未完整保存 v2 identity。页面 Store 的 `elements`/`elementsMap`、撤销重做、复制粘贴、业务组件插入和 `getComponentList()` 等链路均可能裁剪字段。三期必须建立字段保留测试，不能只改 TypeScript interface。

---

## 3. 本期目标与边界

### 3.1 必须交付

1. v2 五步向导；
2. v2 草稿状态模型和回读；
3. 源包、Analyzer、build、preview 的正式组合；
4. Props/事件/方法/依赖/权限编辑；
5. 保存草稿和提交审核；
6. 审核冻结 build/hash/permissions；
7. 已发布元素编辑创建新草稿版本；
8. 元素列表显示协议和版本；
9. 主 `src` registry host；
10. schema resolver；
11. 元素菜单 v2 identity；
12. 拖拽/新增/容器内新增使用 v2 schema；
13. 主 `NgapRender` v1/v2 分流；
14. v2 扁平 Props、事件、ref、SDK editor host；
15. 页面实例字段保存回读；
16. 应用编辑器和业务组件编辑器试点；
17. v1 完整回归。

### 3.2 明确不做

- 不完成独立 `page/materials` 正式生产加载；
- 不发布未签名或未完成四期条件的全量生产版本；
- 不实现完整页面版本升级 UI；
- 不做批量 v1 迁移；
- 不停止新建 v1；
- 不开放容器 v2；
- 不开放外部上传者；
- 不删除 v1 Babel loader。

### 3.3 试点限制

三期可在主编辑器内部测试环境发布候选 v2 元素，但必须：

- 限定内部账号；
- 标记“仅主编辑器试点”；
- 不进入依赖独立 page 的正式业务应用；
- 使用二期服务端产物；
- 记录 protocol/version/artifact；
- 不能把主编辑器预览成功当生产验收。

---

## 4. 前端模块结构

### 4.1 v2 Editor

```text
src/pages/elementManagement/CustomElementV2Editor/
├─ index.tsx
├─ customElementV2EditorTypes.ts
├─ customElementV2EditorReducer.ts
├─ customElementV2EditorSelectors.ts
├─ customElementV2EditorValidation.ts
├─ steps/
│  ├─ BasicInfoStep.tsx
│  ├─ PackageUploadStep.tsx
│  ├─ AnalysisAndConfigurationStep.tsx
│  ├─ PreviewAndValidationStep.tsx
│  └─ SaveAndSubmitStep.tsx
├─ components/
│  ├─ PackageSummary.tsx
│  ├─ PackageFileTree.tsx
│  ├─ DiagnosticsPanel.tsx
│  ├─ UnresolvedFieldsPanel.tsx
│  ├─ PropertyDefinitionEditor.tsx
│  ├─ EventDefinitionEditor.tsx
│  ├─ MethodDefinitionEditor.tsx
│  ├─ DependencyReview.tsx
│  ├─ SdkPermissionReview.tsx
│  ├─ BuildProgressPanel.tsx
│  ├─ ContractDiffPanel.tsx
│  └─ ActionReadinessPanel.tsx
├─ hooks/
│  ├─ useElementV2Draft.ts
│  ├─ usePackageUpload.ts
│  ├─ usePackagePreflight.ts
│  ├─ useElementBuild.ts
│  ├─ usePreviewSession.ts
│  └─ useElementV2Submit.ts
├─ services/
│  ├─ elementV2Service.ts
│  ├─ elementV2DraftMapper.ts
│  └─ elementV2AuditService.ts
└─ index.module.less
```

### 4.2 主运行适配

```text
src/custom-elements/
├─ editorHost.ts
├─ editorSdkAdapter.ts
├─ customElementService.ts
├─ customElementBootstrap.ts
├─ componentSchemaResolver.ts
├─ elementMenuService.ts
└─ legacyRegistryAdapter.ts
```

共享 registry/adapter 继续位于 `shared/custom-element`，主目录只连接 Store、request、router 和 Antd UI。

---

## 5. v2 Editor 状态模型

### 5.1 状态分区

```text
identity
basicInfo
sourcePackage
preflight
manifestDraft
manifestOverrides
componentManifest
diagnostics
build
preview
reviewReadiness
dirtyFlags
lastSavedSnapshot
```

### 5.2 Dirty 规则

- 基础信息变化：只影响 basicInfo dirty；
- ZIP 变化：使 preflight、manifest、build、preview 全部 stale；
- manifest override 变化：使 componentManifest、build、preview stale；
- 只调整预览 mock：不使 build stale；
- build success 后修改源包或 override：旧 build 保留但不得提交；
- 保存草稿后更新 lastSavedSnapshot；
- 切换步骤不自动保存；
- 关闭时有 dirty 提示；
- 已发起 build 离开页面不取消。

### 5.3 Step Gate

| 步骤 | 进入条件 | 离开条件 |
|---|---|---|
| 基础信息 | 新建或编辑授权 | 必填业务字段有效 |
| 上传组件 | 基础信息可暂存 | 有合法 package 或允许缺清单草稿 |
| 分析配置 | preflight 完成 | 所有 error 处理；unresolved 有结论 |
| 预览校验 | successful current build | 至少完成一次成功渲染和必要方法校验 |
| 保存提交 | 前序状态可回读 | 按草稿/审核门槛执行 |

保存草稿不强制用户走到第五步；任一步都可保存当前可序列化草稿，但要显示缺失项。

---

## 6. 基础信息步骤

### 6.1 复用字段

```text
elementName
elementTypeId/category
elementIcon
elementPageType/layout
provId/belonging scope
elementDesc
```

实际字段以当前接口为准，不在 v2 另建重复业务字段。

### 6.2 预填规则

- 编辑现有草稿：以保存值为准；
- 新建：用户输入优先；
- 源码/清单 title、description 只能在字段仍为空时建议预填；
- 用户已修改后重新上传 ZIP，不覆盖业务字段；
- 显示清单建议值和当前平台值差异；
- 包内 categoryHint 只作为建议，不直接选择平台分类。

### 6.3 版本输入

- 新元素初始平台版本可建议使用包 version；
- 已发布元素编辑必须创建新草稿 version；
- 同 elementId 已发布版本不能复用；
- 版本格式为 semver；
- 协议版本固定 2，不在用户输入中用 “v2.0” 混表示。

---

## 7. 上传步骤

### 7.1 上传流程

1. 本地预检大小/MIME；
2. Package Reader 执行 preflight；
3. 展示文件树和 diagnostics；
4. 上传不可变 ZIP；
5. 校验服务端 packageHash 与本地 hash；
6. 保存 packageId/packageUrl/hash；
7. 如果 hash 不一致，阻止继续并重新选择；
8. 触发/恢复 Analyzer 和 build 状态。

### 7.2 文件树

必须支持：

- 按目录展开；
- entry/style/asset/type/unused 标记；
- 文本源码只读查看；
- 图片预览；
- diagnostics 定位；
- 文件大小和 hash 摘要；
- 敏感/禁止文件显著标记。

三期默认不实现完整在线多文件 IDE。允许编辑 manifestOverrides，但不直接修改 ZIP 内源码。若未来在线编辑源包，作为新增范围重新排期。

### 7.3 替换 ZIP

- 旧 package/build 不立即删除；
- 新 hash 生成新 package reference；
- 旧分析和 build 标 stale；
- 基础信息保留；
- manifestOverrides 默认不盲目套用，先显示字段差异；
- 用户可选择保留兼容 override 或重置；
- 已发布版本编辑始终创建新草稿，不修改旧 source package。

---

## 8. 分析与配置步骤

### 8.1 布局

建议分区：

```text
左：组件/模块/依赖/权限/diagnostics 摘要
中：Props、事件、方法和分组编辑
右：ngap.json/推导/用户覆盖来源与待补充项
```

### 8.2 Props Editor

支持编辑：

- label、description；
- editor；
- defaultValue；
- required；
- group/order；
- options；
- editorProps；
- hidden/exposed；
- valueType 只允许与源码/清单兼容的选择。

约束：

- 不能新增源码中完全不存在的业务 Prop，除非 `ngap.json` 显式声明并组件允许；
- 不能配置保留 Props；
- defaultValue 类型必须匹配；
- editor 必须在平台白名单；
- 动态 options 用平台声明式数据源，不保存函数；
- 修改只写 manifestOverrides。

### 8.3 未识别字段

显示：

```text
字段名
原始类型
原因
源码位置
建议 editor
生成的 ngap.json 片段
处理状态：补充/隐藏/确认不暴露
```

所有 unresolved 必须有用户结论才能提交审核；“确认不暴露”也记录审核信息。

### 8.4 Events/Methods

- 事件标题、描述和 payload 摘要；
- 方法标题、描述和参数；
- 名称不能在 UI 任意改成与源码不同；
- 声明方法在预览 ref 中未发现时阻止审核；
- 未声明 runtime 方法不自动公开；
- 相同事件/方法去重；
- 变更相对已发布版本在 ContractDiffPanel 高亮。

### 8.5 Dependencies

- 显示实际 import 与清单声明；
- 两者不一致阻止 build；
- 显示宿主基线版本；
- 非白名单不能 UI 勾选放行；
- 新增白名单要走平台策略变更，不是单元素 override；
- 依赖范围与宿主不兼容阻止审核。

### 8.6 SDK Permissions

- 权限来自源码使用、`ngap.json` 和 capability catalog；
- 显示风险、用途、源码位置、mode、数据范围；
- 用户填写用途说明；
- 未声明使用、声明未使用分别诊断；
- high risk 必须安全审核；
- 动态 capability 默认阻止；
- UI 显示“主窗口权限不等于安全沙箱”。

---

## 9. Build 与预览步骤

### 9.1 Build Readiness

构建前计算：

```text
currentPackageHash
currentManifestOverridesHash
requiredBuilderVersion
dependencyPolicyVersion
sdkPolicyVersion
```

只有与 current state 完全一致的 build 可视为 current build。

### 9.2 进度恢复

- 保存 buildId 到草稿；
- 页面重新打开查询状态；
- 旧 build 与新 hash 不一致时单独显示历史结果；
- 失败可定位并回分析步骤；
- 取消必须二次确认；
- 轮询失败不清空状态；
- 过期产物允许使用相同输入重建。

### 9.3 正式预览

复用二期 `CustomElementV2PreviewHost`。三期在向导中补充：

- 平台属性面板实际 editor；
- 事件动作流结构预览，但默认用 recorder，不执行真实写业务；
- 方法参数测试；
- editor mode SDK host 与 mock 可切换；
- 当前 Element Management draft identity；
- 预览通过标记绑定 buildId/artifactHash；
- manifest/build 变化后预览通过标记失效。

### 9.4 预览通过定义

- runtime manifest 加载成功；
- component 首次渲染成功；
- required props 不缺失；
- 声明 methods 与 ref 对齐；
- 无未处理 CE5xxx error；
- SDK mock 至少覆盖组件申请的关键能力；
- 关闭后清理成功；
- 通过记录只用于提交审核 readiness，不代表业务结果正确。

---

## 10. 草稿、审核与版本

### 10.1 草稿 DTO

至少保存：

```text
elementId?
elementProtocolVersion=2
draftVersion
basicInfo
packageId/packageUrl/packageHash
manifestOverrides
componentManifest snapshot/hash
currentBuildId/status/artifactHash/runtimeManifestUrl
sdkVersionRange/permissions
dependency summary
diagnostics summary
previewValidation
elementStatus=1
```

不能把完整源代码塞入旧 `elementJsDemo` 文本字段；如果后端过渡仍需复用旧字段，只存受控 URL，且 `elementProtocolVersion` 必须明确。正式数据模型优先使用独立字段/对象。

### 10.2 保存草稿

- 允许 warning；
- 允许无 successful build；
- 允许缺 `ngap.json` 的平台草稿；
- 保存当前 step 和 buildId 便于恢复；
- error 也可保存诊断快照，但不能提交；
- 保存成功后不调用 v1 `updateComponent()` 试图注册未发布元素；
- 列表刷新显示 v2/草稿/build 状态。

### 10.3 提交审核

前端 readiness 只是提示，后端必须重新验证：

- elementStatus 可转 3；
- current build success；
- packageHash/manifestHash/artifactHash 一致；
- diagnostics 无 blocking；
- scan passed；
- preview validation 对应相同 artifact；
- 基础信息完整；
- permissions 用途完整；
- version 未占用。

提交事务保存冻结 snapshot，再创建审核记录。若现有 `/element/saveElementInfo` 和 `/solutionAudit/insertSolutionAudit` 不是原子操作，需后端提供事务接口或补偿查询，避免保存成功、审核记录失败的半状态。

### 10.4 审核预览

- 根据 reviewId/buildId 获取冻结 runtime manifest；
- 禁止读取可变草稿最新 build；
- 显示 source/manifest/artifact hash；
- 显示依赖和权限；
- 显示相对上一发布版本 diff；
- 审核过程中草稿编辑必须创建新 revision 并使原审核失效；
- 驳回意见绑定当前 artifact。

### 10.5 已发布元素编辑

- 点击编辑创建新 draftVersion；
- 默认引用上一版本 source/overrides 作为起点；
- elementId 保持；
- elementVersion 必须新值；
- 已发布 source/build/version 只读；
- 新 build 失败不影响已发布菜单；
- 三期可以完成版本创建，但完整页面升级在五期。

---

## 11. Schema Resolver

### 11.1 统一 Identity

```text
type ComponentIdentity = {
  type: string;
  protocolVersion?: 1 | 2;
  elementVersion?: string;
  artifactHash?: string;
}
```

### 11.2 API

```text
resolveComponentSchema(identity): Promise<LegacyComponentSchema>
resolveComponentRegistration(identity): Promise<RegistryEntry>
```

规则：

- 内置元素走明确 schema loader；
- v1 走 legacy registry adapter；
- v2 走 Registry Entry 的 schema；
- preview identity 走 preview session；
- error 返回结构化失败，不返回空 `{}`；
- 结果 clone；
- cache key 包含版本/artifact；
- 兼容 `getComponent(type + 'Config')` 的 facade 只作为过渡。

### 11.3 调用点迁移

按优先级：

1. `ConfigPanel.tsx`；
2. `DragMenuItem.tsx`；
3. `editor.tsx`；
4. Form/Grid/Flex/Div/Collapse/Card/Row/Col 等容器内新增逻辑；
5. 其他直接拼 `type + 'Config'` 的调用。

必须用 `rg` 清零 v2 业务路径上的直接字符串后缀依赖；v1 facade 可暂留。

---

## 12. 元素菜单

### 12.1 菜单描述

```text
elementId/type
elementName
category
icon
elementProtocolVersion
elementVersion
elementArtifactHash
runtimeManifestUrl?（不直接暴露给普通菜单消费）
status
```

### 12.2 加载与刷新

- 查询已发布元素；
- 只显示当前用户可用范围；
- 按 elementId + version 去重；
- 同 elementId 默认菜单显示当前发布推荐版本；
- 菜单加载不等于 ESM 已加载；
- 拖入时 resolver/load；
- 发布/下线后不可变更新；
- 查询失败保留内置菜单；
- 不用固定 setTimeout；
- 草稿/待审核不进正式菜单。

### 12.3 v1/v2 标识

元素管理列表必须显示协议；普通页面搭建菜单可以弱化技术协议，但详情和错误中可查看版本。相同 elementName 可以存在，但技术 identity 必须唯一。

---

## 13. 主 `NgapRender` 接入

### 13.1 建议拆分

```text
NgapRender
  → BuiltInMaterial
  → LegacyCustomElementMaterial
  → V2CustomElementMaterial
  → RemoteMaterial（现有 remoteUrl 如仍需保留）
```

不要继续把所有加载分支塞在一个首次 `useEffect([])` 中。

### 13.2 v2 Material

- identity 依赖 type/protocol/version/artifact；
- subscribe registry status；
- loading 显示 Spin；
- error/missing 显示元素级 fallback；
- ready 后调用 shared createRuntimeProps；
- editorHost.createContext；
- 每实例独立 context；
- props/config 响应式更新；
- event handlers memoized；
- ref 验证并注册；
- unmount clear ref/dispose/release artifact；
- Error Boundary。

### 13.3 v1 保持

- v1 继续传 `{id,type,config,elements,loopVariable,...events}`；
- v1 继续支持当前 Schema 和 Babel；
- 可以通过 legacy adapter 改善加载状态和清理，但不改变组件 Props；
- 不把扁平 Props 强行注入 v1；
- v1 的回归失败阻止三期完成。

### 13.4 删除临时 v2 预览路径

三期 v2 向导不再使用：

```text
window.MyComponent
window.MyComponentJsData
typeZDY === 'ZDY'
item.type === 'customComponent'
固定 500 ms setTimeout
```

旧单 TSX 演示可以保留为明确的开发工具，或在三期下线；不能与正式“新增 v2 元素”同名入口。

---

## 14. Editor SDK Host

### 14.1 能力映射

| SDK | 主 `src` 来源 | 三期实现 |
|---|---|---|
| variables | canvasPageStore/page context | get/set/subscribe/formula |
| api.executeConfigured | 当前 config.api + handleApi | 适配并归一化错误 |
| api.call | capability directory + request | 可先开放试点接口能力 |
| events | handleActionFlow | 与回调 Props 同出口 |
| ui | AntdGlobal/Modal/notification | 统一实例和销毁 |
| files | 现有 OSS upload/download | 受策略包装 |
| navigation | route/link/micro | URL 和权限校验 |
| user | crossApiUserInfo 安全子集 | 不暴露完整 Store |
| storage | editor preview namespace | 按 instance 隔离 |
| logger | editor log/telemetry | 自动带 identity |
| integrations | 能力目录 | 只开放已登记试点项 |

### 14.2 React Hook 约束

当前 `src/packages/index.tsx` 把 `useAppContext` 放到 global utils，v2 禁止这种方式。Host adapter 在 React 宿主层取得所需 Store/context，再创建稳定 SDK object；不能从普通函数非法调用 hook。

### 14.3 Context 生命周期

- `useMemo` keyed by instance identity/config/permissions；
- variable subscription 精确到声明名称；
- re-render 不重复订阅；
- instance unmount dispose；
- registry reload 先 dispose 旧 context；
- preview/editor/runtime mode 明确；
- SDK error 不使整页白屏。

---

## 15. 页面实例字段

### 15.1 类型

在主和 materials 公共 ComponentType/ComItemType 中增加：

```text
elementProtocolVersion?: 1 | 2
elementVersion?: string
elementArtifactHash?: string
```

三期先修改主 `src`，同时更新共享/独立类型以避免四期 DTO 不一致；独立运行逻辑四期启用。

### 15.2 全链路核查

必须验证：

- menu item → drag payload；
- editor addElement；
- elements 与 elementsMap；
- nested children；
- business component insert；
- copy/paste；
- undo/redo snapshot；
- template/component list serialization；
- `getComponentList()`；
- application `sceneData`；
- history/version；
- reload/dealPageData；
- preview clone。

任何显式 `Pick<>` 必须加字段；例如 `materials/types/index.ts` 当前 ComItemType 是 Pick，四期若不更新会丢失 identity。

### 15.3 新实例

拖入 v2 时从菜单 descriptor 固化：

```text
elementProtocolVersion=2
elementVersion=currentPublishedVersion
elementArtifactHash=currentArtifactHash
```

三期不提供升级，但从第一天写入字段，避免五期再迁移新试点数据。

---

## 16. 后端改造

### 16.1 保存草稿

扩展或新增 v2 draft endpoint，必须：

- 接受 elementProtocolVersion=2；
- 关联 packageId/buildId；
- 服务端查询 build，不信任前端 hash；
- 保存 manifestOverrides 和 canonical component manifest；
- 保存 sdk/dependency summary；
- 保存 current step/draft revision；
- 乐观锁防止双窗口覆盖；
- 草稿版本可更新，已发布版本不可更新。

### 16.2 提交审核事务

推荐提供单一事务接口：

```text
submitElementVersionForReview
```

而不是前端串行 `saveElementInfo` + `insertSolutionAudit`。若短期不能合并：

- save 返回 reviewToken；
- insert audit 使用幂等 token；
- 中途失败可查询和补偿；
- UI 明确半状态；
- 后端定时修复孤儿状态。

### 16.3 查询

- 列表返回 protocol/version/build summary；
- 详情返回草稿完整状态；
- 审核详情返回冻结 snapshot；
- published descriptor 返回 version/artifact；
- 权限控制源包源码/scan report 可见角色。

### 16.4 发布候选

三期可以审核内部 candidate，但正式 publish transaction 和签名在四期。后端状态需要区分：

```text
draft build
review frozen build
published build
```

不能仅靠 `elementStatus` 推断 artifact purpose。

---

## 17. 文件级改造清单

### 17.1 元素管理

```text
src/pages/elementManagement/index.tsx
src/pages/elementManagement/elementDetail.tsx
src/pages/elementManagement/AddElementModal.tsx
src/pages/elementManagement/SingleFunctionUploadModal.tsx
src/pages/elementManagement/previewElementModal.tsx
src/pages/elementManagement/CustomElementV2Editor/**
```

### 17.2 注册与菜单

```text
src/packages/index.tsx
src/config/components.tsx
src/custom-elements/**
```

`src/packages/index.tsx` 三期目标是薄 facade：内置 glob、v1 adapter、v2 registry facade；移除模块加载时 v2 全量编译，不强制本期删除 v1 查询。

### 17.3 编辑器

```text
src/layout/components/ConfigPanel/ConfigPanel.tsx
src/layout/components/Menu/DragMenuItem.tsx
src/pages/editor/editor.tsx
src/packages/NgapRender/NgapRender.tsx
src/packages/types/index.ts
src/stores/canvasPageStore.ts
src/pages/editor/topbar/TopBar.tsx
src/pages/applicationOrchestration/pageCanvas/components/CanvasTop.tsx
```

以及所有直接 `getComponent(type + 'Config')` 的容器/布局文件。

### 17.4 双运行时预留

```text
materials/types/index.ts
materials/stores/pageStore.ts
```

三期更新字段类型/序列化兼容，四期更新运行实现。

---

## 18. 实施任务

### P3-T1：v2 Editor 框架与状态

- 路由/弹窗形态；
- reducer/selectors；
- step gate；
- dirty/stale；
- draft load/save；
- close guard。

### P3-T2：上传、分析和配置 UI

- package upload；
- file tree；
- diagnostics；
- unresolved；
- prop/event/method/dependency/permission editors；
- manifest overrides。

### P3-T3：Build 与 Preview 接入

- build resume；
- progress/cancel/retry；
- readiness；
- Preview Host；
- preview validation。

### P3-T4：草稿、审核和版本草稿后端

- DTO；
- save/query；
- optimistic lock；
- submit transaction；
- frozen review snapshot；
- rejected resubmit。

### P3-T5：Registry Facade 与 Schema Resolver

- identity；
- built-in/v1/v2 resolution；
- ConfigPanel；
- all add/drag call sites；
- failure UX；
- cache invalidation。

### P3-T6：菜单与页面字段

- normalized published descriptor；
- protocol/version/artifact；
- drag/add；
- Store；
- save/reload；
- copy/history/nested；
- serialization tests。

### P3-T7：主 `NgapRender` 与 Editor SDK Host

- v1/v2 split；
- runtime Props；
- events/ref；
- context；
- Error Boundary；
- cleanup；
- remove v2 window preview path。

### P3-T8：试点与回归

- simple component；
- form/event/method；
- multi-module/asset；
- configured API；
- declared API mock；
- v1/v2 same page；
- application/business component editors。

### P3-T9：三期验收

- requirement trace；
- draft/review evidence；
- main editor E2E；
- field round-trip；
- v1 regression；
- fourth phase handoff。

---

## 19. 日历安排

| 周次 | 工作 |
|---|---|
| 1 | T1、T4 DTO、T5 resolver 设计 |
| 2 | T2 上传/分析基础、T4 draft API、T5 facade |
| 3 | T2 editors、T3 build resume、T6 menu identity |
| 4 | T3 preview、T6 field round-trip、T7 Material split |
| 5 | T4 review freeze、T7 SDK/event/ref、call site migration |
| 6 | 应用/业务组件 editor 集成、试点组件 |
| 7 | E2E、v1 regression、缺陷修复 |
| 8 | 联合验收、四期移交 |

---

## 20. 测试方案

### 20.1 Editor State

- save at each step；
- leave/reopen build running；
- replace package stale build；
- change overrides stale preview；
- dirty close；
- concurrent draft revision conflict；
- rejected resubmit；
- published edit creates draft。

### 20.2 UI

- inferred/unresolved fields；
- invalid editor/default/options；
- permission purpose；
- dependency mismatch；
- diagnostic navigation；
- build states；
- preview validation stale；
- accessibility/mobile 不作为本轮门槛，但桌面布局稳定。

### 20.3 Schema/Menu

- built-in/v1/v2；
- query failure preserves built-ins；
- duplicate element IDs；
- multiple versions descriptor；
- schema error no empty element；
- container child add call sites；
- ConfigPanel clone isolation。

### 20.4 Page Field Round Trip

- root/nested；
- copy/paste；
- undo/redo；
- business component insert；
- save/reload；
- application sceneData；
- history；
- preview clone；
- optional Pick types。

### 20.5 NgapRender

- v1 Props unchanged；
- v2 flat Props；
- event callbacks；
- context emit；
- methods/ref clear；
- config reactive update；
- version/artifact change reload；
- loading/error/missing；
- render Error Boundary；
- multi instances sharing artifact but isolated context。

### 20.6 Lifecycle

- draft save/query；
- review validation server-side；
- same artifact freeze；
- draft changed after submit；
- audit creation failure compensation；
- reject/resubmit；
- published remains unaffected by new draft failure。

---

## 21. 风险与控制

| 风险 | 控制 |
|---|---|
| 现有 index.tsx 继续膨胀 | 新 v2 editor 独立模块，列表只做入口 |
| Schema 调用点遗漏 | `rg` 清单、resolver facade、容器测试 |
| 保存接口半事务 | 新事务接口或 reviewToken 幂等补偿 |
| v2 字段被序列化裁剪 | 全链路 round-trip fixture，检查 Pick/getComponentList |
| v1 回归 | 明确 Legacy Material/adapter，保留 Props |
| SDK host 直接暴露 Store | adapter 只返回稳定 context，契约测试 |
| 主编辑器试点被误认为生产 | 功能标识和权限限制，四期为生产门槛 |
| preview 全局链路残留 | v2 `rg` 清零 window/typeZDY/customComponent，v1 明确隔离 |

---

## 22. 三期完成门槛

- v2 五步向导可完整使用；
- 草稿可在任一步保存和恢复；
- 当前 build/preview 与当前 package/override 精确绑定；
- 提交审核后冻结 build/hash/permission/dependency；
- 审核读取冻结产物；
- 主编辑器和业务组件编辑器可使用 v2；
- 属性、事件、方法和 SDK editor host 工作；
- 页面实例保存 protocol/version/artifact 并全链路回读；
- v2 不使用 window/typeZDY/customComponent；
- v1/v2 主编辑器混合回归通过；
- 独立运行时未完成的限制在产品入口明确；
- 自动化测试和三期验收报告完成。

---

## 23. 四期移交物

- published/review frozen descriptor；
- main registry host 和 v2 Material；
- schema resolver；
- normalized menu identity；
- page instance v2 fields；
- Editor SDK host 与 adapter contract suite；
- source/build/review lifecycle；
- internal pilot components；
- main editor E2E fixtures；
- v1 regression baseline。

四期基于这些语义实现 `materials/page` runtime host，不得复制主 `NgapRender` 或重新定义 SDK。
