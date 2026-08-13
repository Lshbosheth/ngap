# 自定义元素 v2 一期协议契约与静态分析开发方案

## 1. 文档信息

| 项目 | 内容 |
|---|---|
| 文档标识 | `CUSTOM_ELEMENT_V2_PHASE1_TECHNICAL_PLAN` |
| 对应期次 | 第一期：协议、数据契约与静态分析基础 |
| 需求基线 | `CUSTOM_ELEMENT_V2_REQUIREMENTS(自定义元素v2需求规格).md` |
| 排期基线 | `CUSTOM_ELEMENT_V2_PHASE_PLAN(自定义元素v2分期实施规划).md` |
| 主要需求 | `CE-PKG-*`、`CE-ANA-*`、SDK 公共契约、协议识别和稳定身份 |
| 本期性质 | 数据地基与共享工具，不执行用户组件，不开放生产 v2 |

本方案用于把理想设计中的 ZIP、`ngap.json`、Analyzer、平台组件清单、SDK 类型和后端契约落实成唯一共享基础。本期没有“能否渲染组件”的交付压力；如果为了演示而提前执行 Blob 组件，会重新制造不可信分支，因此不纳入本期完成标准。

---

## 2. 当前基线核查

### 2.1 主 `src` 动态加载

当前 `src/packages/index.tsx`：

- 模块加载时调用 `/element/queryElementList`；
- 读取 `elementJsDemo`、`elementConfigDemo`、`elementCssDemo`；
- 通过 `/csf/call/getElementFileInfo` 批量获取三份文本；
- TSX、Schema 分别由 Babel 编译；
- Less 在浏览器编译并直接插入 `document.head`；
- 动态组件和配置保存到 `componentMap`；
- `getComponent()` 仍以函数类型推测 loader；
- 主 `src` 的 `fetchAllFileStream()` 用固定 100 ms 等待异步 `File.text()`；
- 模块 import 时存在全量查询副作用。

这些逻辑是 v1 兼容基线，不作为 v2 package reader 或 analyzer 的实现基础。

### 2.2 预览临时链路

当前：

- `previewElementModal.tsx` 写入 `window.MyComponent`、`window.MyComponentJsData`；
- `editor.tsx` 用 `typeZDY === 'ZDY'` 创建固定 `customComponent`；
- `ConfigPanel.tsx` 对 `customComponent` 读取 window 配置；
- `NgapRender.tsx` 通过 setTimeout 获取 window 组件和配置。

一期不改这些运行逻辑，但新 contract/analyzer 不能再依赖这些全局对象。它们会在二、三期被替换。

### 2.3 独立运行时

当前 `materials/index.tsx` 复制了三文件 Babel/Less 加载器，`page/src/page/index.tsx` 负责查询元素后交给 `queryElementFun()` 编译。独立实现已经对异步读取做过部分修正，但 Schema 注册键等语义与主项目仍不完全相同。

一期只建立共享契约和 host adapter contract，不改生产加载，以免在 runtime manifest 尚未冻结前形成第三套中间协议。

### 2.4 元素管理数据

当前前端类型和保存逻辑主要使用：

```text
elementId
elementVersion
elementJsDemo
elementConfigDemo
elementCssDemo
elementStatus
```

代码中尚未发现完整的：

```text
elementProtocolVersion
packageHash
manifestHash
artifactHash
runtimeManifestUrl
sdkVersionRange
sdkPermissions
```

因此 `elementProtocolVersion` 及 v2 构建/版本字段必须在一期完成后端接口核查和契约冻结，不能在前端靠 URL 或内容推断。

---

## 3. 本期目标与边界

### 3.1 必须交付

1. 统一命名和目录规范；
2. `ngap.json` v2 JSON Schema；
3. ZIP 输入模型、文件策略和安全预检；
4. 包根目录唯一识别；
5. 包内模块图；
6. 默认导出、基础 Props、静态默认值、事件和方法候选分析；
7. 平台组件清单及规范化算法；
8. 平台组件清单到旧 Schema 的转换；
9. 结构化 diagnostic 与稳定错误码；
10. SDK types、permission catalog、error model 和 mock contract；
11. `src`/`materials` host adapter contract suite 骨架；
12. 后端协议字段、数据对象、构建接口和对象存储评审结论；
13. 合法、警告和非法 fixture；
14. 自动化单元测试。

### 3.2 明确不做

- 不动态 import 用户组件；
- 不执行 `ngap.json` 之外的配置代码；
- 不引入浏览器发布构建器；
- 不产生正式 ESM/CSS/Assets；
- 不改 `NgapRender` 的 v1 运行语义；
- 不接元素菜单和 ConfigPanel 正式入口；
- 不保存 v2 草稿到生产接口；
- 不改独立 page 的生产加载；
- 不实现签名；
- 不实现版本升级和 v1 转换；
- 不开放容器元素。

### 3.3 本期完成定义

本期完成后，给定一个 ZIP 字节流，平台能够在不执行源码的情况下稳定返回：

```text
规范化包文件集合
+ 规范化 ngap.json
+ 包内模块图
+ 平台组件清单草稿
+ 旧 Schema 兼容对象
+ SDK/依赖声明
+ 结构化 diagnostics
+ packageHash 输入规范
```

---

## 4. 总体技术结构

### 4.1 共享核心边界

建议新增共享目录：

```text
shared/custom-element/
├─ package/
│  ├─ packageTypes.ts
│  ├─ readZip.ts
│  ├─ normalizePackageRoot.ts
│  ├─ validateZipEntries.ts
│  ├─ validateFilePolicy.ts
│  ├─ validatePackageLimits.ts
│  └─ buildModuleGraph.ts
├─ contract/
│  ├─ packageManifestV2.ts
│  ├─ componentManifestV2.ts
│  ├─ diagnosticTypes.ts
│  ├─ runtimeManifestV2.ts
│  ├─ defaults.ts
│  └─ normalize.ts
├─ analyzer/
│  ├─ parseModule.ts
│  ├─ analyzeDefaultExport.ts
│  ├─ analyzeProps.ts
│  ├─ analyzeDefaults.ts
│  ├─ analyzeEvents.ts
│  ├─ analyzeMethods.ts
│  ├─ analyzeImports.ts
│  ├─ analyzeStyles.ts
│  └─ diagnostics.ts
├─ manifest/
│  ├─ mergeComponentManifest.ts
│  ├─ validateComponentManifest.ts
│  ├─ manifestToLegacySchema.ts
│  └─ legacySchemaTypes.ts
├─ sdk/
│  ├─ sdkTypes.ts
│  ├─ sdkErrors.ts
│  ├─ permissions.ts
│  ├─ capabilityTypes.ts
│  ├─ hostAdapterContract.ts
│  └─ mock/
├─ testing/
│  ├─ adapterContractSuite.ts
│  └─ fixtures/
└─ index.ts
```

目录名称统一使用 kebab-case；TypeScript 文件按仓库现有习惯使用 camelCase。协议类型以 V2 结尾，避免 `Manifest` 无上下文歧义。

### 4.2 依赖方向

```text
package → contract
analyzer → package + contract
manifest → contract + analyzer result
sdk → contract
testing → contract + sdk

src host ─┐
          ├→ shared/custom-element
materials ┘
```

共享核心不得 import：

```text
src/stores/**
materials/stores/**
src/utils/request
materials/utils/request
antd UI 组件
路由或页面模块
CrossAPI 实例
```

### 4.3 构建产物隔离

本期 analyzer 可以进入编辑器构建，但必须确保未来独立运行页不会因为 shared index 的静态导出而把 JSZip/AST parser 打进生产 chunk。建议：

- `shared/custom-element/package-analyzer` 与 `shared/custom-element/runtime-contract` 分入口；
- 主项目通过 editor alias 引入 analyzer；
- `materials/page` 只引入 contract、runtime manifest validator、SDK contract 和 registry；
- 不建立一个会无条件 re-export Analyzer 的 runtime barrel。

---

## 5. ZIP Package Reader 设计

### 5.1 输入输出

输入：

```text
File | Blob | ArrayBuffer
```

输出对象必须包含：

| 字段 | 含义 |
|---|---|
| `packageFileName` | 原 ZIP 文件名 |
| `compressedSize` | 原始字节数 |
| `packageHash` | 对原始 ZIP 字节计算的 SHA-256 |
| `rootPrefix` | 自动提升前的目录前缀 |
| `files` | 规范化后的虚拟文件集合 |
| `totalUncompressedSize` | 解压后总大小 |
| `fileCount` | 文件数量 |
| `maxDepth` | 最大目录深度 |
| `diagnostics` | ZIP、路径、容量和类型诊断 |

虚拟文件记录至少包含：

```text
normalizedPath
originalPath
kind
compressedSize
uncompressedSize
crc
mimeType
hash
text/bytes lazy reader
```

### 5.2 路径规范化顺序

1. 拒绝空路径、NUL、绝对路径、UNC、盘符路径；
2. 将 `\` 视为非法或规范化前诊断，不允许混用形成绕过；
3. 进行 Unicode NFC 规范化；
4. 按 `/` 拆分并拒绝 `.`、`..` 和空段异常；
5. 记录大小写折叠键，检查 Windows 文件系统冲突；
6. 拒绝重复规范化路径；
7. 忽略 `__MACOSX/` 和根 `.DS_Store`，但产生 info/warning；
8. 识别唯一 `ngap.json`；
9. 如果只有一个顶层普通目录且其内存在清单，仅提升一次；
10. 提升后重新执行全部路径、数量、深度和冲突校验。

### 5.3 禁止条目

硬错误：

```text
node_modules/**
.git/**
dist/**
coverage/**
.env*
*.pem
*.key
符号链接
设备文件
加密条目
嵌套 ZIP/RAR/7z
可执行文件
```

### 5.4 文件策略

| 类别 | 后缀 | 处理 |
|---|---|---|
| 源码 | `.ts/.tsx/.js/.jsx` | UTF-8 文本、AST 输入 |
| 类型 | `.d.ts` | 类型解析，不进入运行模块 |
| JSON | `.json` | 严格 JSON；`ngap.json` 使用专用 Schema |
| 样式 | `.css/.less` | 解析 import/url，二期编译 |
| 图片 | `.png/.jpg/.jpeg/.gif/.webp/.svg` | MIME/magic bytes；SVG 专项扫描 |
| 文档 | `README.md/CHANGELOG.md` | 审核展示，不进入运行产物 |
| Source map | `.map` | 警告并忽略 |
| 字体/音视频/其他二进制 |  | 首期拒绝 |

### 5.5 容量与压缩炸弹

阈值统一由 `CustomElementPackagePolicy` 配置，默认采用需求文档数值。不能把限制散落在 UI 和服务端常量中。

压缩炸弹判断至少结合：

- 单条目压缩比；
- 全包压缩比；
- 解压后总大小；
- 声明大小与实际读取大小；
- 文件数量和目录深度；
- 解压耗时与资源预算。

前端预检不可信，服务端二期必须复用同一规则定义或生成的策略数据重新校验。

---

## 6. `ngap.json` 契约

### 6.1 文件规则

- 文件名大小写固定为 `ngap.json`；
- 标准 JSON，不允许注释、尾逗号、函数、表达式或 JSON5；
- `protocolVersion` 固定数字 `2`；
- 未知顶层字段默认 warning，保留前向兼容策略需版本化；
- 发布所需字段缺失为 error；
- 缺少整个清单时生成 draft manifest 和 `CE1101`，只允许草稿。

### 6.2 必填字段

```text
protocolVersion
name
version
entry
component.title
sdk.version
sdk.permissions
```

### 6.3 命名规则

| 字段 | 规则 |
|---|---|
| `name` | `^[a-z][a-z0-9-]{1,63}$` |
| `version` | 标准 semver，不使用 `V1.0` |
| `entry` | 包内相对路径，TS/TSX/JS/JSX |
| props key | 合法 JS 标识符且非保留 Props |
| group key | 同清单内唯一、稳定、不使用中文做技术键 |
| event name | 合法 JS 标识符，推荐 `onXxx`，唯一 |
| method name | 合法 JS 标识符，唯一 |
| permission | 必须出现在权限目录 |
| dependency | npm specifier 精确大小写，与白名单一致 |

### 6.4 规范化

Canonical manifest 用于 `manifestHash`，规范化必须固定：

- 对无序字典按 key 排序；
- 权限和依赖去重排序；
- styles 保留语义顺序但去重；
- 删除 `undefined` 和 UI 临时字段；
- 默认值显式补齐；
- 数字、布尔、null 保持类型；
- 所有路径使用规范化 `/`；
- JSON 序列化采用稳定 key 顺序和 UTF-8。

### 6.5 缺清单草稿

平台可根据 ZIP 文件名和唯一入口候选生成：

```text
protocolVersion: 2
name: 规范化 ZIP 文件名
version: 0.1.0
entry: 唯一入口候选
component.title: 组件函数名或文件名
sdk.version: 当前开发 SDK major
sdk.permissions: []
```

如果入口候选不唯一，不猜测，要求用户选择或补充清单。生成清单必须在 UI 标为“平台草稿”，提交审核前要求用户确认并固化。

---

## 7. 模块图与 Analyzer 设计

### 7.1 模块解析范围

支持：

- 相对 import；
- extension resolution：`.ts/.tsx/.js/.jsx/.json`；
- directory `index.*`；
- `import type`；
- 样式和图片 import 作为资源边；
- 白名单外部依赖作为 external edge。

拒绝：

- 绝对 URL；
- Node built-in；
- `require()`；
- 动态 import；
- 包根之外路径；
- 大小写不一致的碰巧可读路径。

循环依赖首期输出 `CE1202` warning 或 error 的等级要在协议评审冻结。推荐：源码模块循环依赖默认 error，纯类型循环依赖 warning。

### 7.2 默认导出

支持：

```text
export default function
变量函数 + export default
React.forwardRef
React.memo
React.memo(React.forwardRef())
```

Analyzer 返回 component kind：

```text
function
forward-ref
memo
memo-forward-ref
unknown
```

异步求值、实例对象、条件表达式或无法静态确认的 HOC 返回 error，不能执行后再判断。

### 7.3 Props 分析

第一期支持：

- interface；
- type literal；
- 函数参数内联类型；
- React.FC 泛型；
- forwardRef 第二泛型；
- 包内 `import type`；
- 基础交叉类型；
- string/number/boolean；
- 字面量联合；
- 基础数组和对象；
- optional/required；
- JSDoc 描述。

第一期不保证：

- 外部包类型展开；
- 条件类型；
- 映射类型；
- 高阶泛型实例化；
- 复杂类型运算；
- 动态 PropTypes。

对无法展开的字段必须生成 unresolved candidate，不能直接从结果中消失。

### 7.4 默认值

采纳优先级：

```text
ngap.json override
> 参数解构静态默认值
> 静态 defaultProps
> 类型默认值
```

只采纳 JSON 安全值。函数调用、带插值模板、对象构造、Date 实例和运行时引用均产生 diagnostic。

### 7.5 事件与方法

事件候选：名称匹配 `on[A-Z]` 且类型为函数。Analyzer 保留 payload type 的安全结构摘要，但不能承诺完整 JSON Schema。

方法候选：只识别简单 `useImperativeHandle(ref, () => ({...}))` 的静态键。方法参数和中文标题以 `ngap.json` 或 UI 确认为正式来源。

### 7.6 合并来源

Analyzer 输出 `inferredManifest`，`ngap.json` 输出 `declaredManifest`，UI 后续产生 `manifestOverrides`。统一 merge 层按需求优先级合并，所有字段记录来源：

```text
user-override
package-manifest
source-inference
platform-default
```

来源信息只用于编辑和审计，不进入组件运行 Props。

---

## 8. 平台组件清单设计

### 8.1 清单职责

平台组件清单是静态、规范化、可序列化的组件描述，负责：

- 组件 identity；
- props/groups/events/methods；
- 默认 config；
- capabilities；
- dependencies；
- module graph 摘要；
- SDK 版本与权限；
- styles/assets 描述；
- build/security 占位和 diagnostics。

它不保存：

- React Component 函数；
- Schema render/condition/customRequest 函数；
- Store；
- Blob URL；
- 页面实例状态；
- 事件动作流实例。

### 8.2 平台管理身份

一期清单中的 `elementId`、平台 `elementVersion`、artifactHash 可以为空，因为新包尚未保存/构建；包内 `name/version` 不能替代平台身份。

### 8.3 默认配置

为了兼容现有编辑器，清单必须生成：

```text
defaults.props
defaults.style
defaults.scopeStyle
defaults.scopeCss
defaults.api
defaults.events
```

每次拖入元素必须 clone defaults，不得把共享清单对象直接写入多个页面实例。

### 8.4 Legacy Schema 转换

转换结果固定包含：

```text
attrs
config
events
methods
elements
```

要求：

- 属性组和字段顺序稳定；
- editor 名称必须在现有 ConfigPanel 支持集合中；
- name 的结构符合当前属性面板读取规则；
- event 使用 `{ value, name }`；
- method 参数符合现有动作面板；
- 输出对象每次调用返回安全 clone；
- 不注入函数型 Schema 配置。

---

## 9. Diagnostic 设计

### 9.1 结构

至少包含：

```text
code
severity
phase
message
file
line/column/endLine/endColumn
suggestion
related
blockingActions
```

`blockingActions` 建议枚举：

```text
analyze
build
preview
save-draft
submit-review
publish
```

这样 UI 不必仅凭 severity 自行推断门槛。

### 9.2 错误码目录

一期至少冻结：

- `CE1001～CE1003` 默认导出；
- `CE1101～CE1108` ZIP 和 `ngap.json`；
- `CE1201～CE1205` 模块、依赖、样式和资源；
- `CE1301～CE1303` SDK 和权限；
- `CE2001` Props 类型；
- `CE2104` 默认值；
- `CE2202` 事件标题；
- `CE2301` 方法候选不一致。

二至四期扩展 CE3xxx～CE5xxx，不修改一期既有码的语义。

### 9.3 UI 修复信息

每个 unresolved prop 至少给出：

- 检测到的字段名；
- 原始类型文本；
- 未支持原因；
- `ngap.json.props` 示例片段；
- 是否必须补充；
- 源码位置。

---

## 10. SDK 公共契约

### 10.1 类型入口

开发者只 import type：

```text
@ngap/component-sdk
```

运行时实现由宿主注入 `context`，不打入组件源包。

### 10.2 首期 namespace

冻结类型但可分期实现：

```text
variables
api
integrations
events
ui
files
navigation
user
storage
logger
children（标记未开放）
```

### 10.3 权限命名

权限采用：

```text
namespace.action
namespace.action:capability-code
```

一期定义 permission parser、风险等级、适用 mode 和 sdkSince。不能在 analyzer、后端和 host 中分别硬编码三份列表；应由版本化目录生成或共享。

### 10.4 错误模型

统一冻结：

```text
SDK_PERMISSION_DENIED
SDK_VERSION_UNSUPPORTED
SDK_INVALID_ARGUMENT
SDK_CAPABILITY_NOT_FOUND
SDK_NOT_AVAILABLE_IN_MODE
SDK_ABORTED
SDK_TIMEOUT
SDK_RATE_LIMITED
SDK_RESPONSE_TOO_LARGE
SDK_REMOTE_ERROR
SDK_UNAVAILABLE
```

### 10.5 Host Adapter Contract

一期只定义：

- 输入 identity、manifest、element instance、config 和 mode；
- `createContext()` 公共返回形状；
- `dispose(instanceId)`；
- mode 差异规则；
- permission-denied 行为；
- error normalization；
- subscription cleanup；
- telemetry envelope。

具体连接 Store/request/CrossAPI 在三、四期实现。

---

## 11. 后端契约与核查

### 11.1 硬字段

生产 v2 必须新增并全链路透传：

```text
elementProtocolVersion
```

不得以 `elementJsDemo` 是否为 URL、`elementConfigDemo` 是否为 JSON 或源码内容进行协议识别。

### 11.2 推荐对象

一期完成以下对象的 ER/DTO 评审：

```text
element_definition
element_source_package
element_build
element_version
element_permission_review
```

如果后端受限需在现有表扩展，也必须保证：

- elementId 与 version 唯一；
- 已发布产物字段不可更新；
- build 失败不污染已发布版本；
- 审核记录能绑定 build/hash；
- 源包和产物引用可回收但不能误删已发布引用。

### 11.3 一期接口评审清单

| 能力 | 一期结论 |
|---|---|
| 上传 ZIP 原文件 | 确认现有 OSS 接口是否支持并由服务端算 hash |
| 保存协议版本 | 确认 `/element/saveElementInfo` 是否过滤新字段 |
| 查询元素 | 确认 `/element/queryElementList` 返回 v2 identity |
| 审核 | 确认审核表能记录 buildId/hash/permissions |
| 历史 | 确认历史版本是否保存不可变产物引用 |
| 复制/分享 | 确认元素协议与页面实例版本字段不丢失 |
| 能力目录 | 确认 interfaceId/capability 的治理来源 |
| 对象存储 | 确认不可变 URL、MIME、CORS、CSP 和保留策略 |

### 11.4 契约交付

一期不要求后端完成 builder，但必须输出：

- OpenAPI/DTO 草案；
- 构建状态和阶段枚举；
- 幂等输入字段；
- package/build/version 数据关系；
- 错误结构；
- 权限差异审核结构；
- runtime info 批量查询结构；
- 签名方案候选及负责人。

---

## 12. 文件级改造清单

### 12.1 新增

```text
shared/custom-element/**
```

并新增协议文档/示例：

```text
docs/custom-element-v2/ngap.schema.json
docs/custom-element-v2/examples/minimal/
docs/custom-element-v2/examples/complete/
docs/custom-element-v2/examples/invalid/
```

如果项目不采用 `docs/`，最终路径在 T1 冻结，但文件职责不变。

### 12.2 配置

核查并按需修改：

```text
tsconfig.json
vite.config.ts
page/tsconfig.json
page/vite.config.ts
materials/tsconfig.json
```

只增加共享 contract/testing alias 和类型检查，不让 analyzer 进入独立生产 runtime bundle。

### 12.3 本期不修改运行语义的文件

```text
src/packages/index.tsx
src/packages/NgapRender/NgapRender.tsx
src/pages/elementManagement/previewElementModal.tsx
src/layout/components/ConfigPanel/ConfigPanel.tsx
materials/index.tsx
materials/NgapRender/NgapRender.tsx
page/src/page/index.tsx
```

可以增加类型 import 或测试接缝，但不得在一期把 v2 半成品混入生产分流。

---

## 13. 实施任务

### P1-T1：协议与命名冻结

- 冻结术语、字段、路径和版本语义；
- 输出 `ngap.json` Schema；
- 输出最小、完整、缺清单和非法样例；
- 冻结 error code ranges；
- 组织产品、前端、后端、安全联合评审。

验收：任何团队能够仅凭 Schema 判断一个清单是否合规。

### P1-T2：Package Reader

- ZIP 读取；
- packageHash；
- 路径规范化；
- 包根提升；
- 文件和容量策略；
- MIME/magic bytes；
- Zip Slip/Bomb/冲突诊断。

验收：非法 fixture 均返回稳定诊断且不写入宿主文件系统。

### P1-T3：模块图

- import 解析；
- 相对路径解析；
- external 分类；
- style/asset edge；
- 缺失、大小写、循环和危险 import 诊断。

验收：模块图结果顺序和 hash 稳定。

### P1-T4：组件与 Props Analyzer

- 默认导出；
- component kind；
- Props；
- default values；
- events；
- methods；
- unresolved candidates 和建议。

验收：真实样例 `Demo({ title, context })` 以及标准 forwardRef fixture 正确分析。

### P1-T5：平台组件清单与 Schema 转换

- 来源合并；
- canonical normalize；
- manifest validation；
- default config；
- legacy schema；
- clone 和序列化测试。

验收：转换结果可由现有 ConfigPanel fixture 读取，不含函数。

### P1-T6：SDK 契约

- SDK types；
- permissions；
- capability types；
- errors；
- local mock；
- adapter contract suite 骨架。

验收：示例组件仅依赖公开类型即可通过类型检查。

### P1-T7：后端与基础设施契约

- protocolVersion 字段；
- source/build/version 模型；
- build API 草案；
- object storage/CSP/CORS；
- SDK capability directory；
- 审核冻结信息。

验收：形成书面接口和数据评审结论，没有“按 URL 猜协议”的备选生产路径。

### P1-T8：自动化测试与质量门禁

- package/analyzer/manifest/SDK 单元测试；
- snapshot 稳定性；
- property/fuzz 路径样例；
- 大小和超时样例；
- runtime bundle 不包含 analyzer 的构建检查。

验收：CI 可独立运行，失败阻止合并。

### P1-T9：一期联合验收

- 需求追踪；
- 协议演示；
- 非执行性证明；
- 后端契约签字；
- 二期输入包冻结。

验收：第一期所有退出门槛有证据。

---

## 14. 任务依赖与日历

```text
P1-T1
 ├→ P1-T2 → P1-T3 → P1-T4 → P1-T5
 ├→ P1-T6
 └→ P1-T7

P1-T2～T7 → P1-T8 → P1-T9
```

建议：

| 周次 | 工作 |
|---|---|
| 第 1 周 | T1、后端现状核查、fixture 设计 |
| 第 2 周 | T2、T6、T7 并行 |
| 第 3 周 | T3、T4 基础、SDK mock |
| 第 4 周 | T4、T5、契约测试 |
| 第 5 周 | T8、复杂 fixture、后端评审收口 |
| 第 6 周 | 缺陷修复、T9 联合验收和二期移交 |

人员充足且协议争议少时可压缩到 4～5 周；如果 `elementProtocolVersion` 或数据对象未确认，不能以 analyzer 完成宣布一期结束。

---

## 15. 测试方案

### 15.1 Package Reader

- 根清单、单层目录清单；
- 多清单、无清单、无入口；
- `../`、绝对路径、盘符、反斜杠、NUL；
- Unicode/大小写/重复路径；
- encrypted/CRC/symlink/nested zip；
- 数量、大小、深度和压缩比；
- `.env`、private key、node_modules；
- UTF-8 BOM 和非法编码；
- MIME/magic bytes 不一致；
- SVG 危险内容。

### 15.2 Module Graph

- extension resolution；
- `index.*`；
- import type；
- CSS/Less/JSON/image；
- external whitelist；
- Node built-in；
- URL/dynamic import/require；
- 缺失模块和大小写；
- 脚本循环和类型循环。

### 15.3 Analyzer

- function/arrow/FC；
- forwardRef/memo/组合；
- 非组件 default export；
- interface/type/inline/imported type；
- required/optional；
- 基础类型、union、array、object；
- 复杂泛型 unresolved；
- 解构默认值/defaultProps/函数默认值；
- onXxx；
- useImperativeHandle；
- 保留 Props；
- JSDoc；
- ngap.json override 优先级。

### 15.4 Manifest

- canonical order；
- hash 输入稳定；
- group/prop/event/method 去重；
- default type validation；
- serializable；
- legacy schema shape；
- clone isolation；
- source attribution 不污染 runtime manifest。

### 15.5 SDK Contract

- type export；
- permission parse；
- invalid/deprecated permission；
- error shape；
- mock success/error/delay/permission denial；
- adapter dispose contract；
- runtime package tree-shaking check。

---

## 16. 风险与控制

| 风险 | 控制 |
|---|---|
| AST 范围不断扩大 | 一期只支持冻结语法集，复杂类型走显式补充 |
| JSZip 前端校验被误认为安全结论 | 所有结果标记 preflight，二期服务端重验 |
| shared 目录把 analyzer 带入 runtime | 拆入口、bundle analyzer 检查、独立运行页禁用 editor barrel |
| `ngap.json` 与平台清单混用 | 使用不同类型名、不同文件名和不同 hash |
| 后端字段延期 | 允许本地 contract 开发，但一期退出门槛不放宽 |
| 权限被当作安全沙箱 | SDK 文档和 UI 固定展示 trusted-main-window 边界 |
| Legacy Schema 函数需求反向污染 manifest | manifest 严格 JSON，可用声明式字段或维持 v1 |
| Windows/服务端路径语义不一致 | 规范化算法和 fixture 跨平台执行 |

---

## 17. 开发完成门槛

### 17.1 协议

- `ngap.json` Schema 有版本和变更规则；
- 所有核心身份字段定义清楚；
- `elementProtocolVersion` 后端硬字段确认；
- diagnostic 和 error code 稳定。

### 17.2 实现

- package reader、module graph、analyzer、manifest 和 SDK contract 完成；
- 分析不执行源码；
- legacy schema 可生成；
- runtime bundle 不带 analyzer；
- TypeScript 和单元测试通过。

### 17.3 评审

- 产品确认用户补充路径；
- 后端确认数据和构建接口；
- 安全确认文件规则、权限含义和首期执行边界；
- 测试确认 fixture 和错误矩阵；
- 二期 builder 输入输出已冻结。

---

## 18. 二期移交物

二期只能消费以下冻结输入：

- `NormalizedCustomElementPackage`；
- `NgapPackageManifestV2`；
- `CustomElementManifestV2`；
- `CustomElementDiagnostic`；
- dependency policy；
- SDK version/permission catalog；
- canonical hash algorithm；
- build request/status DTO；
- 合法/非法构建 fixtures。

二期不得复制这些类型到后端或前端另一目录后各自演进；如果使用不同语言实现，必须由 JSON Schema/OpenAPI 和跨语言 golden fixtures 保证一致。
