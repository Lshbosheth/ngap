# 引导式开发前技术核查清单

## 1. 使用方式

本清单用于每一期正式编码前核对真实代码、真实接口和测试条件。它不是产品待确认事项，也不重新讨论已冻结规则。

每条填写：

```text
状态：未核查 / 符合 / 部分符合 / 不符合 / 不适用
证据：文件路径、行号、接口样例或测试记录
处理：复用 / 修改 / 新建 / 阻断
负责人：前端 / 后端 / 组件开发
```

发现实际代码与方案假设冲突时，先更新对应阶段方案和工时，再大范围改造。

---

## 2. 当前已确认的代码入口

以下是当前工作区已实际找到的入口，不代表已经满足目标方案。

### 2.1 编辑器与保存

| 位置 | 当前职责 | 开发前重点 |
| --- | --- | --- |
| `src/pages/applicationOrchestration/pageCanvas/processCanvasPage/components/ProcessCanvas/index.tsx` | 流程节点、连线、交互和历史写入 | nodeId、拓扑、拖动、连线、历史、数据导出 |
| `src/pages/applicationOrchestration/pageCanvas/processCanvasPage/components/ConditionalBranchConfig/index.tsx` | 当前条件分支配置 | MT/AT/VA、conditionList、branchIndex、历史快照 |
| `src/pages/applicationOrchestration/pageCanvas/processCanvasPage/components/ConditionalBranchConfig/types.ts` | 当前分支类型 | 新 transition/output 条件迁移 |
| `src/pages/applicationOrchestration/pageCanvas/components/CanvasTop.tsx` | 保存、预览、历史操作 | sceneData 组装、保存/提交状态、发布前校验 |
| `src/pages/applicationOrchestration/pageCanvas/processCanvasPage/utils/processDataToCanvas.ts` | 保存数据到画布数据转换 | Schema 缺省和逐版本迁移 |
| `src/stores/processCanvasStore.ts` | 流程编辑 Store 和历史 | 完整快照深拷贝、轻量拓扑、运行态混入风险 |

已看到的真实保存链：

```text
ProcessCanvas/页面方法导出流程数据
→ CanvasTop.saveData()
→ processConfig + componentList 组装 sceneData
→ POST /app/saveAppInfo
```

### 2.2 主 src 预览

| 位置 | 当前职责 | 开发前重点 |
| --- | --- | --- |
| `src/pages/applicationOrchestration/pageCanvas/processCanvasPage/components/ProcessPage/ProcessPage.tsx` | 主流程预览和元素累计 | Header/Footer 固定挂载、节点作用域、统一执行器、路径回滚 |
| `src/pages/applicationOrchestration/pageCanvas/processCanvasPage/components/ProcessPage/TemplateNav.tsx` | 主预览智能导航 | activeContentPath、诊断协议、异常计数 |
| `src/pages/applicationOrchestration/pageCanvas/processCanvasPage/components/ProcessPage/Schema.ts` | 当前展示 Schema | 是否仍有分散协议类型 |
| `src/pages/applicationOrchestration/pageCanvas/processCanvasPage/config/processPresentation.ts` | 当前展示配置原型 | presentation 正式字段与兼容读取 |
| `src/stores/canvasPageStore.ts` | 页面运行数据 | 扁平 variable/form/api 数据和节点域适配 |
| `src/packages/utils/action.ts` | 事件动作 | Promise 等待、结构化 reads/writes、执行身份和资源注册 |
| `src/utils/dealApiGlobal.ts` | API 结果处理 | 节点上下文、AbortSignal、旧写隔离 |

### 2.3 独立 page 运行入口

| 位置 | 当前职责 | 开发前重点 |
| --- | --- | --- |
| `page/src/page/index.tsx` | 独立正式运行页 | 不能继续独立复制流程推进和扁平 Store 逻辑 |
| `page/src/page/TemplateNav.tsx` | 独立导航 | 与主导航诊断/异常数量一致 |
| `page/src/utils/dataToCanvas.ts` | 服务端数据转换 | 使用共享 Schema 迁移和图构建 |
| `page/src/utils/dataToCanvas.worker.ts` | 转换 Worker | 新字段是否可序列化及是否丢失 |
| `page/src/utils/util.ts` | 公式和数据工具 | 引导节点上下文与普通页面兼容 |
| `page/src/utils/dealApiGlobal.ts` | 独立 API 结果处理 | 与主 src 共用执行身份语义 |
| `page/src/api/index.ts` | 获取发布/运行数据 | `/app/queryAppAndNodeInfo2` 与 `/app/queryAppAndNodeInfo` 返回差异 |

### 2.4 物料和普通页面兼容

| 位置 | 当前职责 | 开发前重点 |
| --- | --- | --- |
| `src/packages/Layout/BottomBanner/` | 主工程 BottomBanner | flow/container 与 legacy absolute 隔离 |
| `materials/Layout/BottomBanner/` | 独立物料副本 | 与主工程行为同步 |
| `src/components/VariableBind/VariableSelect.tsx` | 当前变量选择器 | 新结构化引用选择器不能破坏普通页面 |
| `src/packages/types/` 与 `materials/types/` | 组件协议 | variableId/output 定义保持一致 |

---

## 3. 全阶段共同核查

### 3.1 工程和构建

- [ ] 确认主工程 Node/npm/pnpm 版本和锁文件；
- [ ] 确认 `page` 是否独立安装、构建和发布；
- [ ] 确认 `materials` 与 `src/packages` 的同步方式；
- [ ] 确认独立 page 的 `@editor` alias 是否可安全引用共享纯逻辑；
- [ ] 确认当前 TypeScript 检查命令；
- [ ] 确认单元测试框架是否已经引入；
- [ ] 确认缺失二进制资源只影响完整构建还是影响功能验证；
- [ ] 记录最低浏览器版本及 AbortController/IntersectionObserver 支持情况。

### 3.2 数据事实来源

- [ ] 列出流程定义当前所有存储位置；
- [ ] 确认 sceneData 是否为主数据；
- [ ] 确认 processConfig、componentList、processSaveData、branchComponentsData 是否重复保存同一事实；
- [ ] 确认编辑 Store、主预览 Store、独立 page Store 的转换边界；
- [ ] 列出当前运行数据混入定义数据的位置；
- [ ] 确认 componentData 中哪些字段是模板定义、实例配置、运行数据；
- [ ] 画出保存、回读、复制、历史、发布的完整字段往返图。

### 3.3 双入口

- [ ] 同一流程在主预览和独立 page 分别从哪个接口/对象启动；
- [ ] 两边当前分支算法是否相同；
- [ ] 两边当前导航统计是否相同；
- [ ] 两边变量/API/form 写入接口是否相同；
- [ ] 可共享哪些无 UI 模块；
- [ ] 哪些宿主能力必须通过 adapter 注入；
- [ ] 建立最小双入口冒烟流程。

### 3.4 后端和环境

- [ ] 获取 `/app/saveAppInfo` 真实请求/响应样例；
- [ ] 获取 `/app/queryAppAndNodeInfo` 和 `queryAppAndNodeInfo2` 样例；
- [ ] 获取 `/app/queryAppInfoHistory` 和清理历史接口样例；
- [ ] 确认提交审核、发布、复制、回滚定义的真实调用链；
- [ ] 确认 sceneData 字段/数据库大小限制；
- [ ] 确认未知 JSON 字段是否会被 DTO 丢弃；
- [ ] 确认测试环境能否保存并回读每个新字段；
- [ ] 确认实际后端开发负责人和接口联调窗口。

---

## 4. 一期开发前核查

### 4.1 节点和拓扑

- [ ] 当前 nodeId 生成位置和算法；
- [ ] 新增、复制、导入、迁移分别如何生成 ID；
- [ ] 开始/结束节点如何表示；
- [ ] parentId/branchIndex 如何表达连线；
- [ ] 是否存在时间戳碰撞；
- [ ] 删除/撤销重做是否保留 ID；
- [ ] 全图校验当前返回格式和定位能力。

### 4.2 Header/Footer 原型

- [ ] `presentation.region` 当前实际写入节点还是 componentData；
- [ ] `processPresentation.ts` 的缺省和兼容逻辑；
- [ ] 第二个 Header/Footer 当前交互；
- [ ] Header/Footer 当前是否仍依赖 allRenderElements 走到才加载；
- [ ] 当前 Footer 固定样式和 BottomBanner 行为；
- [ ] 主 src/page/materials 三处实现差异；
- [ ] processConfig 当前保存字段和回读结果。

### 4.3 动作等待

- [ ] action.ts 中接口动作是否返回 Promise；
- [ ] 多动作链是否串行、并行或不等待；
- [ ] 变量赋值在 Promise 完成前后时序；
- [ ] 失败是否能阻止 Content 启动；
- [ ] Header on ready 是否能覆盖组件内部自定义异步；
- [ ] Footer 点击动作是否会误触发流程推进。

### 4.4 一期准入

- [ ] v1 sceneData 字段冻结；
- [ ] 后端确认原样回读；
- [ ] 双入口共享纯逻辑目录确定；
- [ ] Header 可等待动作技术验证通过；
- [ ] BottomBanner 兼容策略通过普通页面冒烟；
- [ ] 简单试点流程数据准备完成。

---

## 5. 二期开发前核查

### 5.1 变量和 Store

- [ ] PageVariable 全字段和真实使用点；
- [ ] isPrivate 当前真实语义；
- [ ] setVariableData/setFormData/editApiOutData 所有直接调用点；
- [ ] variableData/formData/apiOutData 当前扁平合并位置；
- [ ] 主 src 和 page Store 是否来自同一实现；
- [ ] 普通页面对旧 Store API 的依赖范围；
- [ ] 同一模板多实例当前串值复现用例。

### 5.2 引用和脚本

- [ ] VariableSelect 保存的真实结构；
- [ ] 公式中的变量字符串语法；
- [ ] 事件动作变量赋值真实配置；
- [ ] API 参数、显隐、禁用、分支全部引用入口；
- [ ] 脚本是否能声明 reads/writes；
- [ ] 当前变量改名/删除如何处理；
- [ ] 跨组件引用当前有无明确实例身份。

### 5.3 后端影响索引

- [ ] 组件模板保存接口和变量定义位置；
- [ ] componentId/definitionVersion 是否稳定；
- [ ] 后端能否从 sceneData 提取引用；
- [ ] 影响查询需要返回应用、节点、配置用途哪些字段；
- [ ] 索引更新和保存是否可保持一致；
- [ ] 发布版本与草稿是否分开索引；
- [ ] 破坏性修改的现有审核/版本机制。

### 5.4 二期准入

- [ ] variableId/globalVariableId 契约冻结；
- [ ] NodeRuntimeScope V2 技术原型通过；
- [ ] 普通页面兼容 adapter 路径确定；
- [ ] 引用解析器可扩展注册机制确定；
- [ ] 后端影响索引方案确认；
- [ ] 一期试点迁移清单完成。

---

## 6. 三期开发前核查

### 6.1 当前 MT/AT/VA

- [ ] MT 的 atomId/filedKey/relation/value 完整结构；
- [ ] AT 的接口字段、状态和空值处理；
- [ ] VA 的表达式和变量名解析；
- [ ] checkBranch/checkVABranch 等真实调用链；
- [ ] branchElementData 的写入和订阅时机；
- [ ] operationRes/status 在导航中的使用；
- [ ] 主 src/page 对三种分支的差异。

### 6.2 组件事件计算

- [ ] change 事件先更新绑定值还是先执行脚本；
- [ ] 动作链结束信号是否可靠；
- [ ] 多字段连续赋值是否会中间触发分支；
- [ ] 组件变量变化订阅粒度；
- [ ] 组件能否复用同一个重算动作；
- [ ] 自动接口状态字段如何写组件变量；
- [ ] 手工 component-signal 的现有事件入口。

### 6.3 输出和分支保存

- [ ] 组件模板接口可否新增 outputDefinitions；
- [ ] 流程节点可否保存 outputMappings/resultBinding/diagnosisBinding；
- [ ] branchIndex 向 transitionId 的兼容方式；
- [ ] 子节点如何保存 parentTransitionId；
- [ ] 发布校验前后端职责；
- [ ] 简单旧分支迁移样例；
- [ ] 降档示例组件和测试接口准备。

### 6.4 三期准入

- [ ] v3 Schema 冻结；
- [ ] 正式结果原子发布验证通过；
- [ ] 自动/人工完成策略验证通过；
- [ ] node-output 已接入引用注册表；
- [ ] transitionId 保存回读通过；
- [ ] 主 src/page 共用分支求值器方案确定。

---

## 7. 四期开发前核查

### 7.1 当前回滚

- [ ] allRenderElements 当前增删算法；
- [ ] 旧分支按元素 slice/filter 的所有位置；
- [ ] 导航节点是否另存一份；
- [ ] 当前组件卸载能否清订阅/定时器；
- [ ] 当前节点域 dispose API；
- [ ] Control 是否有运行数据但无 DOM；
- [ ] 分支汇合当前复用行为。

### 7.2 异步和动作

- [ ] 请求工具是否接收 AbortSignal；
- [ ] dealApiGlobal 回写如何定位 Store；
- [ ] action.ts 是否能注册 cleanup；
- [ ] Footer 和人工按钮当前防重复方式；
- [ ] 旧请求晚返回复现用例；
- [ ] 业务有副作用接口的幂等说明；
- [ ] 手机号变化事件真实名称、触发位置和确认弹框。

### 7.3 页签和 Runtime 宿主

- [ ] 普通业务页签切换是否卸载 ProcessPage；
- [ ] Runtime Store 生命周期是否高于页签视图；
- [ ] 页面隐藏/显示是否触发接口重调；
- [ ] 浏览器刷新是否有当前恢复逻辑需要移除；
- [ ] 独立 page 如何监听手机号；
- [ ] Header/Footer 全运行重置清理入口。

### 7.4 四期准入

- [ ] process/node/action execution ID 契约冻结；
- [ ] activeExecutionPath/activeContentPath 数据源冻结；
- [ ] dispose 资源清单完成；
- [ ] Abort + stale write 双保险技术验证；
- [ ] 全局变量写入来源模型确认；
- [ ] onNodeLoaded 时序测试用例准备。

---

## 8. 五期开发前核查

### 8.1 当前性能基线

- [ ] 获取真实约 110 节点数据；
- [ ] 统计 componentData 和 sceneData 体积；
- [ ] 统计单节点及总元素数量；
- [ ] 记录当前 20 节点卡顿复现步骤；
- [ ] React Profiler 记录拖动时重渲染节点；
- [ ] Performance 记录 mousemove 连线遍历；
- [ ] Heap Snapshot 记录打开/关闭配置后的内存；
- [ ] 记录保存 JSON.stringify 和接口耗时。

### 8.2 画布实现

- [ ] nodeMap/lineArr/componentList/branchComponentsData 当前关系；
- [ ] ProcessCanvas 每次拖动遍历范围；
- [ ] cloneDeep 及 processHistoryStack 写入位置；
- [ ] 节点卡片 props 和 Store 订阅；
- [ ] 节点尺寸/连线端点计算依赖 DOM 的位置；
- [ ] 缩放和平移实现；
- [ ] Worker 能否用于纯数据转换而非 DOM 布局。

### 8.3 接口与缓存

- [ ] 查询是否一次返回所有完整组件定义；
- [ ] 能否只返回 componentId/version/摘要；
- [ ] 组件详情能否按需查询；
- [ ] 同模板多节点能否共享只读详情；
- [ ] 后端保存是否必须重复嵌入完整定义；
- [ ] 网关和数据库的大 JSON 限制。

### 8.4 五期准入

- [ ] 四类基准数据版本冻结；
- [ ] 操作脚本和机器环境记录；
- [ ] 性能目标评审；
- [ ] 轻量 CanvasNode/Edge 摘要冻结；
- [ ] layoutDirection 保存位置冻结；
- [ ] 是否进入候选库原型的判定门槛确认。

---

## 9. 六期验收前核查

- [ ] 前五期每个完成门槛有证据；
- [ ] S1～S8 验收数据和账号可用；
- [ ] 主预览和独立 page 指向同一发布定义；
- [ ] 后端保存/查询/复制/历史/发布全链可操作；
- [ ] 试点流程原定义已备份；
- [ ] 迁移报告和歧义处理人明确；
- [ ] 110/150/重组件数据可重复执行；
- [ ] 配置人员和组件开发人员参与验收；
- [ ] 缺陷分级和阻断门槛确认；
- [ ] 已知限制模板和正式范围模板准备；
- [ ] 第一批场景及支持联系人候选明确。

---

## 10. 每期开发启动记录模板

```text
阶段：
核查日期：
参与人：

符合项：
部分符合项：
不符合项：
未取得的后端证据：

需要修改的方案章节：
需要调整的任务/工时：
阻断项及负责人：

是否允许开始开发：是 / 否
确认人：
```

只有本期准入项全部关闭，或明确形成不阻断的处理计划后，才进入大范围编码。
