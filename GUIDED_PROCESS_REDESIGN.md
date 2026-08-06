# 引导式流程展示编排升级设计

## 1. 文档目的

本文用于指导 NGAP 引导式流程的展示编排升级，目标是让流程设计者在同一张流程画布中配置：

- 哪个业务节点显示在页面顶部区域；
- 哪个业务节点显示在页面底部操作区；
- 哪些普通环节显示在“智能导航”中；
- 哪些节点仅负责流程控制，不产生页面内容；
- 整个流程是否启用智能导航；
- 顶部区域和智能导航是否固定，或随整页滚动。

本设计只调整引导式流程的展示模型、编辑配置和运行时布局，不推翻现有 `MT / AT / VA` 分支判断逻辑。

---

## 2. 现状分析

### 2.1 当前运行时结构

当前引导式预览的核心入口为：

`src/pages/applicationOrchestration/pageCanvas/processCanvasPage/components/ProcessPage/ProcessPage.tsx`

最终结构近似：

```tsx
<div className="content">
    <TemplateNav />
    <NgapRender elements={allRenderElements} />
</div>
```

其中：

- `TemplateNav` 始终出现在全部业务元素之前；
- 每次命中一个流程节点，节点内的 `elements` 都被追加到 `allRenderElements`；
- 节点边界只通过每个元素上的 `belongNodeId` 间接保留；
- 导航条再从扁平元素数组反推节点顺序；
- `BottomBanner` 与普通内容元素混合渲染。

### 2.2 当前智能导航

组件：

`src/pages/applicationOrchestration/pageCanvas/processCanvasPage/components/ProcessPage/TemplateNav.tsx`

样式：

`src/pages/applicationOrchestration/pageCanvas/processCanvasPage/components/ProcessPage/index.module.less`

现状：

- 标题“智能诊断”写死；
- 总数和异常数写死为 0；
- 所有已渲染节点默认进入导航；
- 点击导航依赖 `.componentBox` 下标定位；
- 一个节点包含多个元素时，定位逻辑容易错位；
- 没有全局关闭导航的配置；
- 没有节点级“是否显示在导航”配置。

### 2.3 当前底部通栏

组件：

`src/packages/Layout/BottomBanner/BottomBanner.tsx`

样式：

`src/packages/Layout/BottomBanner/index.module.less`

现状使用：

```less
.bottomBannerAtom {
    position: absolute;
    bottom: 0;
}
```

问题：

- 定位职责写在物料自身，而不是页面布局容器；
- 它被混入节点的普通元素数组；
- 绝对定位会覆盖流程内容；
- 多个节点包含 `BottomBanner` 时可能叠加；
- 其定位参照元素不稳定；
- 无法清晰表达“这是全流程底部区域”还是“某个环节内部元素”。

### 2.4 当前保存结构

画布输出：

`src/pages/applicationOrchestration/pageCanvas/processCanvasPage/components/ProcessCanvas/index.tsx`

保存入口：

`src/pages/applicationOrchestration/pageCanvas/components/CanvasTop.tsx`

当前 `sceneData`：

```json
{
  "componentList": []
}
```

每个流程节点已有：

```json
{
  "nodeId": "...",
  "componentId": "...",
  "parentId": "...",
  "branchIndex": "...",
  "canvasPoint": "...",
  "componentData": {}
}
```

这使节点级展示配置可以直接随节点保存。

---

## 3. 目标页面模型

引导式页面运行时划分为四个逻辑区域：

```text
┌────────────────────────────────────┐
│ 1. 顶部区域 header                 │
│    例如：诊断核心信息              │
├────────────────────────────────────┤
│ 2. 智能导航 navigator（可关闭）    │
│    只展示被配置进入导航的环节       │
├────────────────────────────────────┤
│ 3. 环节内容 content                │
│    按实际命中的流程路径动态追加     │
├────────────────────────────────────┤
│ 4. 底部区域 footer                 │
│    例如：直接答复、挽留成功按钮     │
└────────────────────────────────────┘
```

这些区域不是四条独立流程。顶部和底部仍是流程图中的业务节点，只是节点实例被赋予特殊展示位置。

---

## 4. 核心数据模型

### 4.1 节点展示配置

在每个流程业务节点实例上新增 `presentation`：

```ts
export type ProcessNodeRegion =
    | 'header'
    | 'content'
    | 'footer'
    | 'control';

export interface ProcessNodePresentation {
    /** 页面展示区域 */
    region: ProcessNodeRegion;

    /** 是否显示在智能导航中，仅 content 节点有效 */
    showInNavigator: boolean;

    /** 自定义导航标题；为空时使用 componentName */
    navigatorTitle?: string;
}
```

区域语义：

| region | 是否渲染 | 是否可进入导航 | 说明 |
|---|---:|---:|---|
| `header` | 是 | 否 | 页面顶部核心信息，流程最多一个 |
| `content` | 是 | 可配置 | 普通流程环节 |
| `footer` | 是 | 否 | 页面底部操作区，流程最多一个 |
| `control` | 否 | 否 | 仅参与流程判断与流转 |

默认值：

```ts
export const DEFAULT_NODE_PRESENTATION: ProcessNodePresentation = {
    region: 'content',
    showInNavigator: true,
    navigatorTitle: '',
};
```

重要约束：`presentation` 属于“组件在当前流程中的节点实例”，不能写回业务组件模板。相同业务组件用于不同流程时，可以拥有不同展示方式。

### 4.2 流程全局展示配置

在 `sceneData` 中新增 `processConfig`：

```ts
export interface GuidedProcessConfig {
    navigator: {
        enabled: boolean;
        title: string;
    };

    /** fixed-top: 顶部区和导航共同吸顶；full-page: 随整页滚动 */
    scrollMode: 'fixed-top' | 'full-page';
}
```

默认值：

```ts
export const DEFAULT_GUIDED_PROCESS_CONFIG: GuidedProcessConfig = {
    navigator: {
        enabled: true,
        title: '智能诊断',
    },
    scrollMode: 'fixed-top',
};
```

保存示例：

```json
{
  "processConfig": {
    "navigator": {
      "enabled": true,
      "title": "智能诊断"
    },
    "scrollMode": "fixed-top"
  },
  "componentList": [
    {
      "nodeId": "node-header",
      "componentId": "component-basic-info",
      "presentation": {
        "region": "header",
        "showInNavigator": false,
        "navigatorTitle": ""
      }
    },
    {
      "nodeId": "node-check-order",
      "componentId": "component-check-order",
      "presentation": {
        "region": "content",
        "showInNavigator": true,
        "navigatorTitle": "是否有在途工单"
      }
    },
    {
      "nodeId": "node-condition-only",
      "componentId": "component-condition",
      "presentation": {
        "region": "control",
        "showInNavigator": false
      }
    },
    {
      "nodeId": "node-footer",
      "componentId": "component-actions",
      "presentation": {
        "region": "footer",
        "showInNavigator": false
      }
    }
  ]
}
```

---

## 5. 业务规则与校验

### 5.1 唯一性

- 一个流程最多一个 `header` 节点；
- 一个流程最多一个 `footer` 节点；
- 设置第二个 `header` 或 `footer` 时必须提示用户替换，不得静默产生重复区域；
- 后端保存仍需重复校验，不能只依赖前端。

推荐交互：

```text
当前已有顶部节点“诊断核心信息”。
是否将顶部区域替换为“客户基础资料”？
```

确认后：

- 原顶部节点自动恢复为 `content`；
- 新节点设置为 `header`；
- 两个节点仍保留在流程图中，连线关系不变。

### 5.2 导航规则

- `navigator.enabled = false` 时完全不渲染导航；
- `showInNavigator` 只控制导航项，不控制环节正文是否渲染；
- `header`、`footer`、`control` 强制不进入导航；
- 没有组件内容的节点默认不进入导航；
- 若用户显式设置导航但节点没有可渲染内容，保存校验给出警告并自动忽略；
- 导航总数是实际已命中且可见的导航节点数；
- 异常数是这些导航节点中 `status === 'error'` 或兼容旧值 `status === 2` 的数量；
- 导航标题优先使用 `navigatorTitle`，其次使用节点的 `componentName`。

### 5.3 流程执行规则

- 所有区域节点仍按原流程图的连线顺序执行；
- `control` 节点执行条件判断和接口调用，但不向页面添加元素；
- `header` 命中后更新顶部区域；
- `footer` 命中后更新底部区域；
- `content` 命中后追加到环节内容；
- 分支切换需要删除旧分支产生的 `content/header/footer/control` 运行结果，然后执行新分支；
- 顶部或底部节点若位于某个分支中，切换分支后必须正确替换或清空。

### 5.4 空节点

允许以下节点存在：

- 只有分支配置，没有原子组件；
- 只调用接口并决定下一节点；
- 只写变量或触发事件。

这类节点应设置 `region = control`。运行引擎不得因为 `elements.length === 0` 而中断流程。

---

## 6. 编辑器设计

### 6.1 节点配置入口

流程节点点击后，在节点属性面板增加“展示设置”。如果当前项目暂时没有统一节点属性抽屉，可先在 `RenderNode` 的更多菜单中增加“展示设置”，打开独立 Modal/Drawer。

字段：

```text
展示区域
  ○ 普通环节
  ○ 顶部区域
  ○ 底部区域
  ○ 仅流程控制

当展示区域为“普通环节”时：
  □ 在智能导航中展示
  导航名称：[默认使用组件名称]
```

交互规则：

- 切到顶部、底部或控制节点时，自动关闭 `showInNavigator`；
- 切回普通环节时，默认恢复为 `true`，但尊重用户最后一次显式选择更好；
- 节点卡片应增加区域标记，例如“顶部”“底部”“控制”；
- 不进入导航的普通环节显示“隐藏导航”标记；
- 顶部/底部唯一性在变更时立即校验。

### 6.2 流程全局配置入口

在引导式编排页面的页面设置或顶部工具栏增加“引导式布局”：

```text
□ 启用智能导航
导航标题：[智能诊断]

滚动方式
  ○ 顶部区域和导航固定
  ○ 整页滚动
```

当导航关闭时：

- 隐藏导航标题输入；
- 节点的 `showInNavigator` 配置可以保留，重新启用导航后继续生效。

### 6.3 画布节点展示

当前节点标题由 `RenderNode` 生成：

```text
【手动】组件名
【自动】组件名
```

升级后建议：

```text
[顶部]【自动】诊断核心信息
[环节]【自动】近三个月套餐使用情况
[控制]【自动】条件判断
[底部]【人工】办理操作
```

颜色建议：

- header：蓝色标记；
- content：保持现有颜色；
- footer：紫色标记；
- control：灰色虚线标记。

展示标签不能改变流程节点类型、分支类型或连线语义。

---

## 7. 运行时设计

### 7.1 不再维护扁平元素作为主状态

当前主状态：

```ts
const [allRenderElements, setAllRenderElements] = useState<any[]>([]);
```

建议替换为：

```ts
export interface RenderedProcessNode {
    nodeId: string;
    componentId: string;
    componentName: string;
    branchType: 'MT' | 'AT' | 'VA' | '';
    branchResult?: string;
    status?: string | number;
    presentation: ProcessNodePresentation;
    elements: any[];
}

const [renderedNodes, setRenderedNodes] =
    useState<RenderedProcessNode[]>([]);
```

保留节点边界后，可以直接得到四区数据：

```ts
const headerNode = renderedNodes.find(
    node => node.presentation.region === 'header'
);

const footerNode = renderedNodes.find(
    node => node.presentation.region === 'footer'
);

const contentNodes = renderedNodes.filter(
    node => node.presentation.region === 'content'
);

const navigatorNodes = contentNodes.filter(
    node =>
        processConfig.navigator.enabled &&
        node.presentation.showInNavigator &&
        node.elements.length > 0
);
```

### 7.2 四区页面壳

新增组件建议：

```text
ProcessPage/
├─ ProcessPage.tsx
├─ ProcessPageShell.tsx
├─ ProcessHeader.tsx
├─ ProcessNavigator.tsx
├─ ProcessStep.tsx
├─ ProcessFooter.tsx
├─ processRuntimeTypes.ts
└─ index.module.less
```

推荐 JSX：

```tsx
<ProcessPageShell scrollMode={processConfig.scrollMode}>
    <ProcessPageShell.ScrollArea ref={scrollContainerRef}>
        <ProcessPageShell.Top
            sticky={processConfig.scrollMode === 'fixed-top'}
        >
            {headerNode && (
                <ProcessHeader node={headerNode} />
            )}

            {processConfig.navigator.enabled &&
                navigatorNodes.length > 0 && (
                    <ProcessNavigator
                        title={processConfig.navigator.title}
                        nodes={navigatorNodes}
                        activeNodeId={activeNodeId}
                        onSelect={scrollToNode}
                    />
                )}
        </ProcessPageShell.Top>

        <ProcessPageShell.Content>
            {contentNodes.map(node => (
                <ProcessStep
                    key={node.nodeId}
                    ref={registerStepRef(node.nodeId)}
                    node={node}
                />
            ))}
        </ProcessPageShell.Content>
    </ProcessPageShell.ScrollArea>

    {footerNode && (
        <ProcessFooter node={footerNode} />
    )}
</ProcessPageShell>
```

### 7.3 固定与滚动模式

推荐只保留一个滚动容器：

```less
.processPage {
    height: 100%;
    min-height: 0;
    display: grid;
    grid-template-rows: minmax(0, 1fr) auto;
    overflow: hidden;
}

.scrollArea {
    min-height: 0;
    overflow: auto;
}

.topRegion {
    background: #fff;
}

.fixedTop {
    position: sticky;
    top: 0;
    z-index: 20;
}

.contentRegion {
    position: relative;
}

.footerRegion {
    position: relative;
    z-index: 30;
    background: #fff;
    border-top: 1px solid #e5e7eb;
}
```

行为：

- `fixed-top`：`header + navigator` 的共同父容器吸顶；
- `full-page`：共同父容器使用普通文档流；
- footer 始终位于页面 Grid 的第二行，不参与滚动；
- 如未来需要底栏随页面滚动，应新增独立配置，不应恢复 `absolute`。

### 7.4 导航定位

禁止继续根据 `.componentBox` 数组下标计算滚动位置。

改为节点级 ref：

```ts
const stepRefs = useRef(new Map<string, HTMLElement>());

const scrollToNode = (nodeId: string) => {
    const element = stepRefs.current.get(nodeId);
    element?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
    });
};
```

若顶部固定，需要设置：

```less
.processStep {
    scroll-margin-top: var(--process-fixed-top-height, 0px);
}
```

顶部高度可使用 `ResizeObserver` 测量，写入 CSS 变量，避免写死 136px。

### 7.5 当前步骤计算

推荐使用 `IntersectionObserver`，观察每个 `ProcessStep`：

- `root` 指向流程滚动容器；
- `rootMargin` 顶部扣除固定区域高度；
- 选择最靠近顶部且仍可见的节点作为 `activeNodeId`。

这替代当前逐个读取 `getBoundingClientRect()` 的滚动事件方案。

### 7.6 导航统计

```ts
const total = navigatorNodes.length;
const abnormal = navigatorNodes.filter(node =>
    node.status === 'error' || node.status === 2 || node.status === '2'
).length;
```

导航文案：

```tsx
<h1>{title || '智能诊断'}</h1>
<p>
    （共诊断 {total} 项，其中
    <span className={styles.abnormal}>{abnormal}</span>
    项异常）
</p>
```

### 7.7 分支切换与回滚

当前实现通过 `allRenderElements.slice/filter` 删除旧分支元素。改造后应按节点删除：

```ts
setRenderedNodes(current =>
    current.filter(node => !obsoleteNodeIds.includes(node.nodeId))
);
```

优势：

- 不会把同一节点的部分元素残留；
- header/footer 能随旧分支一起清理；
- 导航条天然同步；
- 不再依赖元素在数组中的连续性。

---

## 8. BottomBanner 改造

### 8.1 目标职责

`BottomBanner` 只保留“可容纳子元素的横向操作容器”职责，不再决定自己固定在哪里。

### 8.2 样式修改

文件：

`src/packages/Layout/BottomBanner/index.module.less`

移除：

```less
position: absolute;
bottom: 0;
left: 0;
z-index: 9;
```

保留：

```less
.bottomBannerAtom {
    width: 100%;
    position: relative;
    box-sizing: border-box;
}
```

固定位置由 `ProcessFooter` 提供。

### 8.3 兼容组装式页面

`BottomBanner` 可能也被普通组装式页面使用，直接删除绝对定位可能改变旧页面。

推荐增加布局上下文：

```tsx
<BottomBanner layoutMode="flow" />
```

或从 `AppProvider.pageType/mode` 判断：

- 新引导式 `ProcessFooter` 中：`position: relative`；
- 旧组装式画布：暂时保留原行为。

更稳妥的是给 `BottomBanner` 增加配置：

```ts
positionMode: 'container' | 'legacy-absolute'
```

新数据默认 `container`，旧数据缺省时按 `legacy-absolute` 兼容。

### 8.4 节点与物料的关系

推荐未来把“底部区域”表达为节点的 `presentation.region = footer`，而不是通过节点内部是否含有 `BottomBanner` 来推断。

短期兼容规则：

- 如果旧节点包含顶级 `BottomBanner`，且流程尚无显式 footer 节点，可将该节点识别为 footer 候选；
- 仅作为迁移提示，不建议永久隐式推断；
- 保存一次后写入显式 `presentation.region`。

---

## 9. 具体文件与模块改动

### 9.1 类型定义

#### 文件

`src/pages/applicationOrchestration/pageCanvas/processCanvasPage/processCanvasPageType.ts`

#### 修改

- 新增 `ProcessNodeRegion`；
- 新增 `ProcessNodePresentation`；
- 新增 `GuidedProcessConfig`；
- `CanvasNode` 增加 `presentation`；
- `ProcessCanvasRefApi.getData()` 返回 `processConfig`；
- `setData()` 支持接收并应用旧数据默认值。

### 9.2 全局默认配置与工具函数

#### 建议新增

`src/pages/applicationOrchestration/pageCanvas/processCanvasPage/config/processPresentation.ts`

包含：

```ts
DEFAULT_NODE_PRESENTATION
DEFAULT_GUIDED_PROCESS_CONFIG
normalizeNodePresentation()
normalizeProcessConfig()
validatePresentationUniqueness()
```

### 9.3 状态管理

#### 文件

`src/stores/canvasPageStore.ts`

#### 修改

- `page.processConfig` 保存全局引导式配置；
- 增加 `setProcessConfig()`；
- 增加 `updateNodePresentation(nodeId, patch)`；
- 加载旧数据时补默认值；
- 更新顶部/底部节点时处理唯一性；
- undo/redo 快照包含 `presentation` 与 `processConfig`。

如果部分页面仍使用：

`src/stores/processCanvasStore.ts`

则需保持同样字段，或先确认该 Store 是否已废弃，避免维护两套状态源。

### 9.4 流程画布序列化

#### 文件

`src/pages/applicationOrchestration/pageCanvas/processCanvasPage/components/ProcessCanvas/index.tsx`

#### 修改位置

- `addNode()`：设置默认 presentation；
- `setData()`：回显 presentation；
- `getData()`：在 componentList 节点中输出 presentation；
- `serializeSnapshot()`：把 presentation 放入快照；
- `RenderNode`：显示区域标签和隐藏导航标记；
- `RenderNode` 更多菜单：增加“展示设置”。

节点输出示例：

```ts
return {
    nodeId: node.nodeId,
    componentType: 'business',
    componentData: { ... },
    componentId: node.componentData?.id,
    position: 'processPage',
    parentId: node.pNodeId.join(','),
    branchIndex: node.pBranchId.join(','),
    canvasPoint: `${left},${top}`,
    presentation: normalizeNodePresentation(node.presentation),
};
```

### 9.5 节点展示设置面板

#### 建议新增

```text
src/pages/applicationOrchestration/pageCanvas/processCanvasPage/
  components/NodePresentationConfig/
    index.tsx
    index.module.less
```

职责：

- 编辑 region；
- 编辑 showInNavigator；
- 编辑 navigatorTitle；
- 执行 header/footer 唯一性提示；
- 保存后推入 undo/redo 历史。

### 9.6 流程全局设置

#### 可能修改

`src/pages/applicationOrchestration/pageCanvas/components/CanvasTop.tsx`

#### 建议新增

```text
src/pages/applicationOrchestration/pageCanvas/processCanvasPage/
  components/ProcessLayoutConfig/
    index.tsx
    index.module.less
```

职责：

- 导航开关；
- 导航标题；
- 固定/整页滚动模式；
- 保存到 Store；
- 配置变更进入 undo/redo（若页面级配置也要求撤销）。

### 9.7 流程页面入口

#### 文件

`src/pages/applicationOrchestration/pageCanvas/processCanvasPage/index.tsx`

#### 修改

- 从接口 `bean` 中读取 `processConfig`；
- 老数据使用默认配置；
- `canvasRef.setData()` 同时回显节点和全局配置；
- `processCanvasData()` 同时返回 `componentList` 与 `processConfig`；
- 预览模式把配置传给 `ProcessPage`，或由 Store 读取。

### 9.8 保存逻辑

#### 文件

`src/pages/applicationOrchestration/pageCanvas/components/CanvasTop.tsx`

#### 修改

当前：

```ts
const result = {
    componentList: processData.componentList,
};
```

升级为：

```ts
const result = {
    processConfig: normalizeProcessConfig(processData.processConfig),
    componentList: processData.componentList,
};
```

保存前执行：

- header/footer 唯一性校验；
- navigatorTitle 长度校验；
- 无内容但进入导航的节点警告；
- presentation 字段默认值补齐。

### 9.9 运行时核心

#### 文件

`src/pages/applicationOrchestration/pageCanvas/processCanvasPage/components/ProcessPage/ProcessPage.tsx`

#### 主要重构

- `allRenderElements` 改成 `renderedNodes`；
- `rendererComponentNode()` 改为按节点保存完整信息；
- 按 presentation 分类四区；
- control 节点不渲染但继续流转；
- 分支回滚按 nodeId 删除；
- 导航只读取 navigatorNodes；
- 使用节点 ref 定位；
- 使用 IntersectionObserver 计算当前环节；
- 删除写死的 `136px` 定位偏移；
- 接入 `processConfig.navigator.enabled` 和 `scrollMode`。

### 9.10 智能导航

#### 当前文件

`src/pages/applicationOrchestration/pageCanvas/processCanvasPage/components/ProcessPage/TemplateNav.tsx`

#### 建议

可以重命名为：

`ProcessNavigator.tsx`

修改：

- 标题通过 props 传入；
- 总数和异常数动态计算；
- 每项使用 `nodeId` 作为 key；
- 点击回传 nodeId；
- 当前项通过 activeNodeId 高亮；
- 去除内部直接操作 scrollLeft 与固定宽度 178 的强耦合，优先使用 `scrollIntoView({ inline: 'nearest' })`；
- 缺失箭头图片时使用 CSS 或图标组件，不再依赖二进制背景图。

### 9.11 四区展示组件

#### 建议新增

```text
src/pages/applicationOrchestration/pageCanvas/processCanvasPage/
  components/ProcessPage/
    ProcessPageShell.tsx
    ProcessHeader.tsx
    ProcessNavigator.tsx
    ProcessStep.tsx
    ProcessFooter.tsx
    processRuntimeTypes.ts
```

职责拆分：

- `ProcessPageShell`：滚动与固定布局；
- `ProcessHeader`：渲染 header 节点；
- `ProcessNavigator`：导航展示与选择；
- `ProcessStep`：保持节点级 DOM 边界；
- `ProcessFooter`：渲染 footer 节点；
- `ProcessPage`：流程执行与区域数据组织。

### 9.12 BottomBanner

#### 文件

- `src/packages/Layout/BottomBanner/BottomBanner.tsx`
- `src/packages/Layout/BottomBanner/index.module.less`
- `src/packages/Layout/BottomBanner/Schema.ts`

#### 修改

- 物料本身不再强制绝对定位；
- 新增位置模式或布局上下文以兼容旧页面；
- 在引导式 footer 中仅负责内容布局；
- Schema 中说明它是操作容器，而实际“固定在底部”由流程节点展示区域决定。

### 9.13 独立 page 子项目

仓库还有一套运行/发布页面实现：

- `page/src/page/index.tsx`
- `page/src/page/TemplateNav.tsx`
- `page/src/page/index.module.less`

这套代码与主项目 `ProcessPage` 高度重复。生产构建先执行 `build:page`，因此不能只改 `src` 而忽略 `page`。

推荐策略：

1. 短期：同步实现相同的数据模型和四区渲染；
2. 中期：抽取共享运行时包，供 `src` 和 `page` 同时引用；
3. 避免继续复制修复两份 `TemplateNav` 和流程运行逻辑。

建议共享目录：

```text
shared/guided-process-runtime/
```

或工作区包：

```text
packages/guided-process-runtime/
```

---

## 10. 接口与后端存储

### 10.1 查询接口

现有：

`POST /app/queryAppAndNodeInfo`

期望新增返回：

```json
{
  "bean": {
    "processConfig": {
      "navigator": {
        "enabled": true,
        "title": "智能诊断"
      },
      "scrollMode": "fixed-top"
    },
    "componentList": [
      {
        "nodeId": "...",
        "presentation": {
          "region": "content",
          "showInNavigator": true,
          "navigatorTitle": ""
        }
      }
    ]
  }
}
```

### 10.2 保存接口

现有：

`POST /app/saveAppInfo`

前端通过 `appData.sceneData` 提交 JSON 字符串。后端如果原样保存 `sceneData`，可能无需数据库字段变更；只需确认不会丢弃未知字段。

需要验证：

- `sceneData.processConfig` 是否能原样持久化；
- `componentList[].presentation` 是否能原样持久化；
- `/app/queryAppAndNodeInfo` 是否会把这些字段重新返回；
- 历史版本、复制应用、共享应用是否会保留新字段。

如果后端 DTO 严格过滤字段，则需同步扩展 DTO。

### 10.3 不改后端的过渡方案

若暂时无法修改后端节点 DTO，可把全部配置放进 `sceneData` 顶层映射：

```json
{
  "processConfig": {},
  "nodePresentationMap": {
    "node-1": {
      "region": "header",
      "showInNavigator": false
    }
  },
  "componentList": []
}
```

优点：后端只需透传一个 JSON；缺点：节点数据与展示配置分离。长期仍推荐保存到节点实例。

---

## 11. 旧数据兼容与迁移

### 11.1 无 presentation 的节点

```ts
presentation = {
    region: 'content',
    showInNavigator: true,
    navigatorTitle: '',
};
```

这样旧流程保持“全部普通环节进入导航”的现状。

### 11.2 无 processConfig 的流程

```ts
processConfig = {
    navigator: {
        enabled: true,
        title: '智能诊断',
    },
    scrollMode: 'fixed-top',
};
```

### 11.3 旧 BottomBanner

兼容顺序：

1. 优先读取显式 footer 节点；
2. 没有显式 footer 时，检测旧节点中的顶级 `BottomBanner`；
3. 在编辑器显示迁移提示；
4. 用户确认后，将对应节点或新建操作节点设为 footer；
5. 保存后写入显式配置。

### 11.4 当前示例流程迁移建议

根据现有“宁夏-一线降档挽留-新”数据：

- “降档挽留-通用-诊断核心信息”设置为 `header`；
- “在途工单”等诊断环节设置为 `content`；
- 不希望显示的空环节设置 `showInNavigator = false`；
- 纯条件判断节点设置为 `control`；
- 包含“直接答复、挽留成功”的操作组件独立为 `footer`，或迁移现有 BottomBanner 内容；
- 流程导航可全局关闭。

---

## 12. 测试方案

### 12.1 数据校验

- 新流程节点获得默认 presentation；
- 旧流程打开不报错；
- 旧流程保存后带新字段；
- 复制、版本历史、回滚不丢字段；
- 最多一个 header/footer；
- 删除 header/footer 后允许重新指定。

### 12.2 导航测试

- 全局关闭时导航完全消失；
- `showInNavigator = false` 的内容仍显示但不进导航；
- header/footer/control 不进导航；
- 空节点不进导航；
- 标题可配置；
- 总数和异常数正确；
- 点击导航精准定位到节点；
- 滚动时当前节点高亮正确；
- 分支切换后旧导航项消失，新导航项出现。

### 12.3 布局测试

- fixed-top 模式下 header 与 navigator 共同固定；
- full-page 模式下两者随页面滚动；
- 无 header 时导航仍可正常固定；
- 无 navigator 时 header 单独正常显示；
- 无 footer 时内容区占满；
- footer 不覆盖最后一个内容节点；
- 内容短于窗口和长于窗口时布局均正常；
- 浏览器缩放与不同分辨率下无错位。

### 12.4 流程执行测试

- 无分支节点顺序追加；
- MT 手动分支切换正确；
- AT 自动分支正确；
- VA 变量分支正确；
- control 节点不显示但继续流转；
- 分支回退能清除旧 content/header/footer；
- refreshPageEvent 刷新后四区状态正确重置。

### 12.5 BottomBanner 回归

- 引导式底栏固定正确；
- 组装式页面旧 BottomBanner 不受破坏；
- 编辑模式仍可向 BottomBanner 拖入元素；
- show/hide/setStyle ref 方法继续工作；
- 同时出现多个旧 BottomBanner 时给出迁移或冲突提示。

### 12.6 双运行时一致性

- 主项目 `src` 预览正确；
- `page` 子项目构建后的独立运行页正确；
- 两边流程分支、导航、顶部和底部行为一致。

---

## 13. 推荐实施阶段

### 阶段一：数据模型与保存闭环

- 新增类型和默认值；
- 节点配置 UI；
- 全局导航配置 UI；
- getData/setData/sceneData 支持；
- 后端透传验证；
- 旧数据兼容。

验收：编辑、保存、刷新后配置不丢失。

### 阶段二：运行时四区重构

- `renderedNodes` 替代扁平元素主状态；
- header/content/footer/control 分类；
- 页面壳和两种滚动模式；
- 分支回滚按 nodeId 实现。

验收：四区渲染与所有分支类型正确。

### 阶段三：导航升级

- 节点级导航筛选；
- 动态统计；
- 节点 ref 定位；
- IntersectionObserver 当前项；
- 导航样式和响应式优化。

验收：导航开关、隐藏项、定位、统计均正确。

### 阶段四：BottomBanner 与兼容迁移

- 移除引导式中的绝对定位依赖；
- `ProcessFooter` 接管定位；
- 旧组装式兼容；
- 旧流程迁移提示。

验收：底栏稳定且不覆盖正文。

### 阶段五：抽取共享运行时

- 合并 `src` 与 `page` 的重复流程逻辑；
- 建立共享类型、运行引擎和展示组件；
- 保留不同宿主的接口适配层。

验收：两套入口共享核心逻辑，行为一致。

---

## 14. 关键设计结论

1. 顶部、普通环节、底部、控制节点都属于同一张引导式流程图。
2. 展示属性属于流程节点实例，不属于业务组件模板。
3. 导航是流程级可选能力；每个普通环节可单独决定是否进入导航。
4. 顶部和底部最多各一个，前后端都应校验。
5. 空环节可作为控制节点继续参与流转，但不渲染、不进入导航。
6. 运行时必须保留节点边界，不能再以扁平 `allRenderElements` 作为主数据结构。
7. BottomBanner 不应负责页面定位，固定底部由流程页面壳负责。
8. `src` 与 `page` 两套运行时都必须改，长期应抽取共享实现。

