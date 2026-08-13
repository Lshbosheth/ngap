# 引导式流程展示编排升级设计（GUIDED_PROCESS_REDESIGN）

## 1. 文档目的

本文用于指导 NGAP 引导式流程的展示编排升级，目标是让流程设计者在同一张流程画布中配置：

- 哪个业务节点显示在页面顶部区域；
- 哪个业务节点显示在页面底部操作区；
- 所有普通正文环节自动显示在“智能导航”中；
- 哪些节点仅负责流程控制，不产生页面内容；
- 整个流程是否启用智能导航；
- 顶部区域和智能导航是否固定，或随整页滚动。

本设计覆盖引导式流程的展示模型、编辑配置、运行时布局、节点数据域、环节正式输出和流程推进机制。现有 `MT / AT / VA` 能力需要兼容迁移，但不再把“监听内部原子值并立即切换分支”作为新模型的唯一执行方式。

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
- 当前导航来源依赖运行时反推，尚未明确固定为正文环节。

导航卡片后续需要展示节点运行摘要，而不是只显示节点名称。建议每个导航卡片统一展示：

- 环节标题：优先使用导航自定义标题，其次使用业务组件名称；
- 环节方式：展示“自动”或“人工”；该方式同时决定正常推进是静默连续执行还是等待用户交互；
- 自动环节诊断结果：展示应用组件提供的一个或多个诊断结果，并读取接口显式返回的 `success/failure` 业务状态，分别显示绿色或红色；
- 人工环节诊断结果：展示组件点选或交互产生的一个或多个结果，不强制套用自动环节的红绿状态。

这些字段应从流程运行态统一整理出来，不建议由导航组件直接读取组件内部 DOM 或内部 React state。业务组件内部结果如果要同步到导航区，需要通过分支结果、变量、接口结果或事件回调进入流程运行态。

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

### 4.1 节点展示与交互配置

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

    /** 自定义导航标题；为空时使用 componentName */
    navigatorTitle?: string;
}

export interface ProcessNodeExecution {
    /** content 环节的交互与推进方式，同时用于导航人工/自动文案 */
    interactionMode: 'manual' | 'automatic';
}
```

区域语义：

| region | 是否渲染 | 是否可进入导航 | 说明 |
|---|---:|---:|---|
| `header` | 是 | 否 | 页面顶部核心信息，流程最多一个 |
| `content` | 是 | 是 | 默认正文环节，无需逐节点配置 |
| `footer` | 是 | 否 | 页面底部操作区，流程最多一个 |
| `control` | 否 | 否 | 仅参与流程判断与流转 |

默认值：

```ts
export const DEFAULT_NODE_PRESENTATION: ProcessNodePresentation = {
    region: 'content',
    navigatorTitle: '',
};

export const DEFAULT_NODE_EXECUTION: ProcessNodeExecution = {
    interactionMode: 'automatic',
};
```

重要约束：`presentation` 属于“组件在当前流程中的节点实例”，不能写回业务组件模板。相同业务组件用于不同流程时，可以拥有不同展示方式。

产品配置时不要求用户为普通环节逐个选择 `content`。节点没有被显式设置为 `header`、`footer` 或 `control` 时，运行时即归一化为 `content`。只有这三种特殊用途需要显式设置。

`interactionMode` 与展示区域正交，但不再只是导航文案：

- `automatic`：接口或组件自动逻辑完成后，立即评估已有分支规则并静默进入下一节点；即使存在多条条件分支也不暂停；
- `manual`：进入环节后等待用户点选、选择、输入或确认，交互完成后再评估分支并继续；
- 智能导航直接使用同一个 `interactionMode` 展示“人工/自动”，避免维护第二份可能不一致的标识。

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
        "navigatorTitle": ""
      }
    },
    {
      "nodeId": "node-check-order",
      "componentId": "component-check-order",
      "execution": {
        "interactionMode": "automatic"
      },
      "presentation": {
        "region": "content",
        "navigatorTitle": "是否有在途工单"
      }
    },
    {
      "nodeId": "node-condition-only",
      "componentId": "component-condition",
      "presentation": {
        "region": "control"
      }
    },
    {
      "nodeId": "node-footer",
      "componentId": "component-actions",
      "presentation": {
        "region": "footer"
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
- 所有已进入活动路径且有可渲染内容的 `content` 节点自动进入导航；
- `header`、`footer`、`control` 不进入导航；
- 不提供节点级“是否进入导航”开关，导航资格由归一化后的区域直接推导；
- 没有组件内容的普通节点应提示改为 `control`，运行时不会生成空导航项；
- 导航总数是实际已命中且可见的导航节点数；
- 异常数暂按自动环节中 `diagnosisStatus === 'failure'` 的数量统计；人工环节只展示点选或交互结果，不强制计入红绿成功/失败；
- 导航标题优先使用 `navigatorTitle`，其次使用节点的 `componentName`。
- 每个 `content` 节点配置统一的 `interactionMode`；它既决定正常推进方式，也用于导航卡片展示“人工/自动”。

### 5.3 流程执行规则

- 进入页面或整体重启时，先从流程定义中找到唯一的 `header`、`footer`；
- `header` 作为 content 的前置初始化环节执行：完成接口和组件初始化、写入所需全局变量后，才开始按连线加载实际 `content/control` 活动路径；
- `footer` 作为固定操作区在页面初始化时挂载一次，不等待活动路径到达；流程进行过程中主要根据 content 数据控制其内部按钮或其他元素显隐；
- `control` 节点执行条件判断和接口调用，但不向页面添加元素；
- `content` 命中后追加到环节内容；
- `header` 固定为开始节点后的首个业务节点，不允许位于中间分支；
- `footer` 固定为结束节点前的最后一个业务节点，可以接收不同互斥路径汇合，但唯一后续只能是结束节点；
- header、footer 不配置人工/自动方式，也不等待完成信号；活动路径到达 footer 时自动进入唯一结束节点；
- footer 按钮只执行自身业务事件，不负责完成 footer 或推进流程；
- 分支切换只删除旧分支产生的 `content/control` 运行结果，header、footer 保持挂载，并根据最新流程数据更新显隐和内容。

### 5.4 空节点

允许以下节点存在：

- 只有分支配置，没有原子组件；
- 只调用接口并决定下一节点；
- 只写变量或触发事件。

这类节点应设置 `region = control`。运行引擎不得因为 `elements.length === 0` 而中断流程。

### 5.5 流程拓扑

- 第一版采用单活动路径 DAG，只允许一个开始节点和一个结束节点；
- 所有有效业务路径无论经过哪条互斥分支，最终都必须汇合并连接到同一个结束节点；
- 存在 `header` 时，开始节点必须且只能直接连接 `header`，`header` 是首个业务节点；
- 存在 `footer` 时，`footer` 是最后一个业务节点，其唯一后续必须是结束节点；不同互斥路径可以在 `footer` 汇合；
- 上述首尾连线用于拓扑校验和表达完整流程关系；运行时仍在页面初始化阶段预先加载 header、footer，不要求等活动路径遍历到 footer 才渲染；
- 禁止环路、孤立节点和不可达节点；
- 非结束节点必须存在合法后续策略；
- 一个节点可以有多个父节点，但只表示互斥路径重新汇合，不表示并行等待；
- 保存、发布和运行加载时都执行完整拓扑校验。

---

## 6. 编辑器设计

### 6.1 节点配置入口

流程节点点击后，在节点属性面板增加“展示设置”。如果当前项目暂时没有统一节点属性抽屉，可先在 `RenderNode` 的更多菜单中增加“展示设置”，打开独立 Modal/Drawer。

字段：

```text
环节用途
  ○ 普通环节（默认，无需额外设置）
  ○ 顶部核心信息
  ○ 底部操作区
  ○ 仅流程控制

当环节用途为“普通环节”时：
  环节方式：○ 人工  ○ 自动
  导航名称：[默认使用组件名称]
```

交互规则：

- 普通环节在底层归一化为 `content` 并自动进入导航，不显示导航开关；
- 切到顶部、底部或控制节点时，隐藏正文环节方式和导航名称配置；
- 切回普通环节时恢复该节点上一次的交互方式和导航文案配置；
- 节点卡片应增加区域标记，例如“顶部”“底部”“控制”；
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
- 正文节点的导航文案配置继续保留，重新启用后直接恢复。

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
    interactionMode?: 'manual' | 'automatic';
    diagnosisStatus?: 'success' | 'failure';
    diagnosisResults?: Array<{ label?: string; value: unknown }>;
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
    node.interactionMode === 'automatic' &&
    node.diagnosisStatus === 'failure'
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

导航中的 `success/failure` 是自动应用组件给出的业务诊断状态，不是请求生命周期状态。多数自动环节正文以列表展示，可以把“有数据成功、无数据失败”作为当前业务理解，但运行时最终读取接口单独返回并由组件暴露的状态字段，不根据列表长度自行推断。请求超时、程序异常等技术错误必须与业务 `failure` 分开处理。

人工环节从组件输出中选择一个或多个诊断展示字段；简单选择暂定使用选项 `label` 展示、`value` 参与分支。导航展示字段与分支判断字段可以不同。

### 7.7 分支切换与回滚

当前实现通过 `allRenderElements.slice/filter` 删除旧分支元素。改造后应按节点删除：

```ts
setRenderedNodes(current =>
    current.filter(node => !obsoleteNodeIds.includes(node.nodeId))
);
```

优势：

- 不会把同一节点的部分元素残留；
- 分支切换只清理旧 content/control 路径，固定 header/footer 不被误卸载；
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
- 普通环节编辑 execution.interactionMode 和 navigatorTitle；
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
        "execution": {
          "interactionMode": "automatic"
        },
        "presentation": {
          "region": "content",
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
      "region": "header"
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
    navigatorTitle: '',
};

execution = {
    interactionMode: 'automatic',
};
```

这样旧流程保持“全部普通正文环节进入导航”的现状。`content` 是默认归属，不要求用户重新配置。

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
- 无展示内容、只负责判断或服务调用的环节设置为 `control`；
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
- 所有已执行且有内容的 content 节点自动进入导航；
- header/footer/control 不进入导航；
- 空节点不进导航；
- content 节点的人工/自动推进方式、导航文案和样式正确；
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
- 分支回退能清除旧 content/control，header/footer 保持挂载并按最新依赖重新计算；
- 浏览器刷新后不恢复旧节点，从开始节点重新执行，四区状态和智能导航均为新运行数据；
- 手机号变更事件弹框提示后，旧运行数据整体清空，旧异步结果不能回写，并按新手机号从开始节点重新渲染。

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

> 本节是早期详细设计形成的技术拆分，不再表示当前产品版本的“第一期、第二期”。当前六期产品顺序以 `GUIDED_PROCESS_PHASE_PLAN(引导式流程分期实施规划).md` 为准；本节内容仅在对应产品阶段内部进行文件级任务拆分时参考。

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

- 根据 content 区域自动生成导航；
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
3. 导航是流程级可选能力；开启时，活动路径中的普通 content 环节自动进入导航，不提供节点级开关。
4. 顶部和底部最多各一个，前后端都应校验。
5. 空环节可作为控制节点继续参与流转，但不渲染、不进入导航。
6. 运行时必须保留节点边界，不能再以扁平 `allRenderElements` 作为主数据结构。
7. BottomBanner 不应负责页面定位，固定底部由流程页面壳负责。
8. `src` 与 `page` 两套运行时都必须改，长期应抽取共享实现。
9. “人工/自动”是 `content` 环节的交互与推进方式，并同时作为智能导航文案：自动环节静默连续执行，人工环节进入后等待用户交互；`header/footer/control` 不使用这项正文交互配置。
10. 每个流程节点实例必须拥有独立数据域，默认变量不再注册为流程全局变量。
11. 跨节点数据传递必须通过输入绑定和输出端口显式完成，禁止依赖同名全局变量碰巧取值。
12. 技术隔离键使用不可变 `nodeId`，用户只维护显示名称；仅在跨节点引用时按需提供可读别名。
13. 新旧运行时迁移期以节点数据域为主数据，旧扁平上下文只作为兼容投影，不再作为新能力的数据源。

---

## 15. 环节区域、完成策略与运行时数据域改造

### 15.1 本章解决的问题

引导式流程不只是把多个业务组件按顺序展示出来，还要解决多个环节同时运行时的数据归属问题。

旧模式下，一个业务组件就是一个相对独立页面，可以通过环节或组件 ID 加载自己的页面数据。进入新的引导式运行页后，多个业务组件被依次装入同一个页面 Store，当前实现会把下面这些内容合并到页面级容器：

- `variables`；
- `variableData`；
- `formData`；
- `apiOutData`；
- `elements`；
- `elementsMap`。

因此两个完全无关的环节只要都定义了 `result`、`list`、`selectedValue`，就可能发生覆盖、串值、误触发分支或默认值失效。让配置人员为每个变量手工想一个流程级唯一名称，只是把平台的数据隔离责任转嫁给用户，不能作为正式方案。

本章目标是建立：

1. 环节实例级私有数据域；
2. 流程级显式共享数据域；
3. 明确的输入绑定和输出发布机制；
4. 正文环节的人工/自动方式统一表达默认推进行为与导航文案，同时与展示区域、业务诊断结果和组件输出字段保持解耦；
5. `src` 与 `page/materials` 双运行时一致的兼容迁移机制。

### 15.2 当前实现的直接证据

#### `canvasPageStore`

`src/stores/canvasPageStore.ts` 当前同时保存页面级：

```ts
variables: PageVariable[];
variableData: Record<string, any>;
formData: Record<string, any>;
apiOutData: Record<string, ApiType>;
```

编辑器侧虽然已经存在：

```ts
processData.nodeData[nodeId] = nodeData.pageData;
```

但 `addNodeData` 随后仍把节点的 `elementsMap` 合入 `page.pageData.elementsMap`，`addBussinessElement` 也继续把节点的元素和表单数据合入全局页面数据。说明当前只是“保存了一份节点页面快照”，没有把它建立成运行时数据边界。

#### `ProcessPage`

`ProcessPage.tsx` 加载节点时会：

1. 查询业务组件；
2. 合并 API 配置；
3. 调用 `mergeVariable(componentInfo)`；
4. 给元素追加 `belongNodeId`；
5. 调用 `addBussinessElement(pageData)` 合入页面级 Store。

当前私有变量处理为：

```ts
if (variable.isPrivate) {
  variable.name = variable.name + pageData.zjId;
}
```

这个方式存在四个问题：

- 隔离依赖字符串拼接，不是数据结构隔离；
- `zjId` 与流程节点实例并非严格一一对应；
- 表单、API 输出和分支依赖仍是扁平结构；
- 变量重命名后，历史公式和事件动作中的引用不一定同步迁移。

#### 独立 `page/materials` 运行时

`page/src/page/index.tsx` 仍按变量名去重后调用 `addVariable`；`materials/stores/pageStore.ts` 仍以 `variableData[name]`、`formData[name]`、`apiOutData[id]` 保存数据；`materials/utils/util.ts#getPageVariable` 仍把所有变量组装成一个 `context.variable` 对象。

因此只改主 `src` 预览不会解决正式运行问题，必须同步改造独立运行页。

### 15.3 三个正交维度

新的节点模型必须把下面三个维度拆开。

#### 维度一：流程节点结构类型

```ts
type NodeType = 'begin' | 'end' | 'business';
```

它回答“这是开始、结束还是业务节点”。

#### 维度二：正文交互与推进方式

```ts
type ContentInteractionMode = 'manual' | 'automatic';
```

它回答“普通正文环节是静默连续执行，还是进入后等待用户交互”，智能导航同时用它显示人工或自动。

| 交互方式 | 中文 | 作用 |
| --- | --- | --- |
| `manual` | 人工 | 渲染交互内容并暂停，等待点选、输入或确认后继续；导航显示“人工” |
| `automatic` | 自动 | 接口或组件自动逻辑完成后判断分支并静默连续加载；导航显示“自动” |

自动环节无论是一条无条件出线还是多条条件分支，都在自动逻辑完成后直接评估连线；多分支不会让它停下来。人工环节才是正常流程中的等待点。当前 `AT/MT/VA` 旧语义仍需兼容迁移，但新模型以统一的 `interactionMode` 作为正文环节推进方式，避免导航标识与执行方式出现两份配置。

#### 维度三：页面展示区域

```ts
type ProcessNodeRegion = 'header' | 'content' | 'footer' | 'control';
```

它回答“节点在页面哪里展示”。产品侧只需要显式设置 `header/footer/control` 三种特殊用途；未设置特殊用途的普通环节自动归一化为 `content`。

推荐规则是：

- 未设置特殊用途的节点默认 `content`，渲染并进入智能导航；
- `header` 渲染到顶部核心信息区，不进入导航，流程最多一个；
- `footer` 渲染到底部操作区，不进入导航，流程最多一个；
- `control` 不渲染、不进入导航，但仍执行接口、转换、条件判断和分支推进；
- 只有 `content` 配置人工/自动交互方式，导航直接复用该方式显示文案。

### 15.4 目标节点定义

流程定义只保存配置、契约和绑定关系，不保存一次运行产生的临时值。

```ts
interface GuidedNodeDefinition {
  nodeId: string;
  nodeType: 'begin' | 'end' | 'business';
  componentId?: string;
  displayName: string;
  alias?: string;

  execution: {
    interactionMode: 'manual' | 'automatic';
    completionPolicy:
      | { mode: 'selection-change'; sourceKey: string }
      | { mode: 'component-signal'; signalKey: string }
      | { mode: 'condition'; condition: StructuredCondition };
    timeoutMs?: number;
    retry?: {
      maxAttempts: number;
      intervalMs: number;
    };
  };

  presentation: {
    region: 'header' | 'content' | 'footer' | 'control';
    navigatorTitle?: string;
  };

  inputs: NodeInputDefinition[];
  outputs: NodeOutputDefinition[];
  inputBindings: Record<string, DataBinding>;
  branchConfig?: GuidedBranchConfig;
}
```

字段职责：

- `nodeId`：流程节点实例的不可变技术主键；
- `componentId`：可复用业务组件模板 ID，不能用于隔离一次流程中的多个实例；
- `displayName`：页面和画布展示名称，可以重复；
- `alias`：跨节点表达式使用的可读别名，只有被其他节点引用时才需要；
- `presentation.region`：缺省归一化为 `content`；只有顶部、底部和控制用途需要用户显式设置；
- `execution.interactionMode`：只对 `content` 有效；自动环节自动连续执行，人工环节等待交互，导航同时据此展示人工/自动；
- `execution.completionPolicy`：进一步描述人工环节由哪次点选、输入确认或组件动作恢复推进；自动环节通常由配置接口或组件自动逻辑完成触发；
- `inputs/outputs`：节点公开的数据契约；
- `inputBindings`：输入从哪里取得；
- `branchConfig`：节点完成后如何选择下一条连线。

### 15.5 目标运行时数据结构

```ts
interface GuidedProcessRuntimeState {
  processInstanceId: string;
  definitionId: string;

  shared: {
    definitions: Record<string, SharedVariableDefinition>;
    values: Record<string, any>;
  };

  nodes: Record<string, NodeRuntimeScope>;

  route: {
    activeNodeId?: string;
    visitedNodeIds: string[];
    activePath: string[];
    branchSelections: Record<string, string>;
  };

  compatibility?: {
    legacyVariableData: Record<string, any>;
    legacyFormData: Record<string, any>;
    legacyApiOutData: Record<string, any>;
  };
}

interface NodeRuntimeScope {
  nodeId: string;
  status: 'idle' | 'loading' | 'waiting-user' | 'success' | 'failed' | 'cancelled';

  input: Record<string, any>;
  variables: Record<string, any>;
  formData: Record<string, any>;
  apiData: Record<string, any>;
  output: Record<string, any>;

  branchResult?: {
    branchId?: string;
    optionIndex?: number;
    reason?: string;
  };

  error?: {
    code?: string;
    message: string;
    detail?: any;
  };

  startedAt?: number;
  completedAt?: number;
}
```

核心规则：

1. `nodes` 必须以流程节点实例 `nodeId` 为 key；
2. 不能用 `componentId` 做隔离，因为同一业务组件可以在一个流程中使用多次；
3. 节点内部的 `result`、`list`、`selectedValue` 只要求在本节点内唯一；
4. 只有明确声明为流程共享的数据才进入 `shared.values`；
5. 表单、API 返回和分支计算结果默认都留在节点数据域；
6. 分支回滚时按 `nodeId` 清理整块节点数据，不再按变量名猜测哪些全局数据应该删除。

### 15.5.1 组件变量与全局变量访问规则（已冻结）

平台变量分为两类：

1. **组件内部变量**：由应用组件开发人员在组件内声明，运行值保存在当前组件实例对应的 `nodes[nodeId].variables` 中；
2. **全局变量**：在应用或流程级显式定义，运行值保存在 `shared.values` 中，供流程内组件按名称读取或显式赋值。

访问规则：

- 当前组件可以直接读取和修改自己的组件内部变量；
- 组件事件可通过 `onChange → 脚本/表达式 → 变量赋值` 计算任意派生值，赋值目标既可以是当前组件变量，也可以是显式选择的全局变量；
- 需要读取某个组件的全部内部变量时，必须通过明确的组件实例标识取得，不能把所有组件变量自动合并为一个全局变量对象；
- 产品界面可以称为“通过组件 ID 获取组件变量”，但引导式流程保存和运行时必须解析为组件实例 `nodeId`。可复用模板的 `componentId` 只标识组件模板；同一模板在流程中使用两次时，仅凭 `componentId` 无法区分实例；
- 当前节点读取自身变量使用当前节点上下文，不要求配置人员填写 `nodeId`；跨节点读取时，变量选择器先选择目标组件实例，再选择变量，底层保存稳定的 `nodeId + variableKey`；
- 组件可以读取流程中已经显式定义的全局变量；需要修改全局变量时必须使用明确的全局变量赋值动作或 Runtime API；
- 组件内部变量不会因为名称与全局变量相同而自动同步，也不会因为被其他组件读取就自动升级成全局变量；
- 分支可以直接读取当前节点的组件变量。需要给智能导航或下游节点使用时，可再把组件变量映射为节点正式输出；是否映射输出不影响变量本身的动态计算能力。

概念访问方式：

```ts
// 当前组件内部变量
context.node.variable.decisionCode

// 显式定义的流程全局变量（界面称“全局变量”，运行时存放于 shared）
context.process.shared.customerId

// 其他组件实例的变量：编辑器按组件选择，保存为稳定 nodeId + variableKey
runtime.getVariable(targetNodeId, 'result')
```

为兼顾已有平台习惯，可以提供“获取组件全部变量”的 Runtime API；返回值必须是目标组件实例变量的只读快照。跨组件修改仍应通过目标组件公开动作、节点输出/输入绑定或显式全局变量完成，避免外部组件直接篡改目标组件内部状态。

### 15.6 命名策略：用户不负责全局唯一

#### 不再要求

不再要求用户写：

```text
orderQueryNode_orderList
customerSelectNode_selectedCustomer
provinceA_step3_result
```

#### 技术键

平台直接使用不可变 `nodeId` 建立隔离，例如：

```text
nodes["node-8f41"].variables.result
nodes["node-c921"].variables.result
```

两个节点都可以继续把变量叫作 `result`。

#### 显示名称

画布上使用“客户选择”“订单查询”“额度校验”等显示名称。显示名称允许重复，但产品上应提示重复名称会降低可读性。

#### 可读别名

只有当其他节点需要引用该节点输出时，平台才自动生成或要求确认别名：

```text
customer_select
order_query
credit_check
```

别名规则：

- 流程内唯一；
- 默认根据显示名称自动生成；
- 重名时自动追加稳定序号；
- 用户重命名节点时，底层仍按 `nodeId` 保存引用，不因显示名称变化而断开；
- 别名只用于表达式展示和导出，不是主键。

### 15.7 输入、输出与数据绑定

#### 输入定义

```ts
interface NodeInputDefinition {
  key: string;
  title: string;
  required?: boolean;
  schema?: JsonSchema;
  defaultValue?: any;
}
```

#### 输出定义

```ts
interface NodeOutputDefinition {
  key: string;
  title: string;
  schema?: JsonSchema;
  source: {
    type: 'variable' | 'form' | 'api' | 'expression';
    path?: string;
    expression?: string;
  };
  visibility: 'private' | 'flow';
}
```

`private` 只写入当前节点 `output`；`flow` 除写入当前节点输出外，还按显式配置发布到流程共享域。不能因为某变量被创建就自动变成全局变量。

#### 输入绑定

```ts
type DataBinding =
  | { source: 'constant'; value: any }
  | { source: 'process'; path: string }
  | { source: 'node-output'; nodeId: string; outputKey: string }
  | { source: 'runtime'; path: 'user' | 'route' | 'environment' }
  | { source: 'expression'; expression: string };
```

示例：

```json
{
  "customerId": {
    "source": "node-output",
    "nodeId": "node-customer-select",
    "outputKey": "selectedCustomerId"
  },
  "provinceCode": {
    "source": "process",
    "path": "shared.provinceCode"
  }
}
```

保存时应保存 `nodeId + outputKey`，界面上显示“客户选择环节 / 已选客户 ID”。用户通过数据选择器完成绑定，不手写长字符串。

### 15.8 表达式上下文

新表达式上下文建议为：

```ts
interface GuidedExpressionContext {
  node: {
    id: string;
    input: Record<string, any>;
    variable: Record<string, any>;
    form: Record<string, any>;
    api: Record<string, any>;
    output: Record<string, any>;
  };
  process: {
    shared: Record<string, any>;
    route: GuidedProcessRuntimeState['route'];
  };
  steps: Record<string, {
    output: Record<string, any>;
    status: NodeRuntimeScope['status'];
  }>;
  user: any;
  environment: any;
  eventParams?: any;
}
```

其中 `process.shared` 对应产品界面中的“全局变量”。组件内脚本、事件和表达式均可读取；只有显式选择全局变量作为赋值目标时才允许写入。`node.variable` 始终表示当前组件实例的内部变量。

典型引用：

```ts
context.node.variable.result
context.node.form.customerId
context.node.api.queryOrders
context.node.input.customerId
context.process.shared.provinceCode
context.steps.order_query.output.orders
```

兼容期继续提供：

```ts
context.variable.xxx
context.api.xxx
context.<formId>
```

但这些字段来自兼容投影，应在编辑器中标记“旧版上下文”，新建配置默认只展示新上下文。

### 15.9 区域与完成策略的数据生命周期

#### 页面固定区域：header、footer

页面初始化或整体重启时：

1. 从流程定义中定位唯一的 header、footer；
2. 创建 header 节点域，执行 header 的接口和组件初始化；
3. header 可把后续环节需要的公共数据写入显式全局变量；
4. 固定渲染 header，并挂载 footer 固定操作区；
5. 等待 header 前置初始化成功后，再启动 content/control 活动路径；
6. footer 根据流程进行时产生的 content 选项、组件变量、节点输出或全局变量，动态更新内部按钮及其他元素的显隐和业务状态；
7. footer 不等待完成信号，footer 按钮也不承担流程推进。

header/footer 在流程定义中仍保留首尾连线关系，但其页面挂载生命周期独立于 content 的逐节点命中。header 同时承担 content 前置数据初始化职责；活动路径最终到达 footer 时，只执行拓扑上的自动通过并进入结束节点，不重复加载 footer。

#### 活动路径节点：content

执行过程：

1. 解析 `inputBindings`；
2. 创建 `nodes[nodeId]`；
3. 执行初始化接口、变量和规则；
4. 在正文区域渲染业务组件；
5. 用户操作、接口结果和组件逻辑只更新当前节点的 `formData/variables/apiData`；
6. 自动环节在接口或组件自动逻辑完成后直接计算分支并继续；人工环节等待组件产生有效分支结果，结果可以在字段完整且校验通过后自动产生，也可以由组件确认/完成动作产生；
7. 仅在分支、导航或下游确有需要时整理组件输出，然后计算分支并进入下一节点。

自动 content 的后续无论是一条出线还是多条条件分支，都不会因为需要分支判断而暂停；已有数据和条件足以让运行时静默选择下一条连线。人工 content 进入后才等待点选、输入或确认。组件输出用于提供分支判断、导航诊断或下游数据，不是自动环节继续加载的开关。

#### control 节点

执行过程：

1. 不创建页面元素，也不进入智能导航；
2. 解析输入；
3. 调服务、执行表达式、转换数据或判断条件；
4. 保存必要的 `apiData/output/branchResult`；
5. 根据完成策略选择下一分支；
6. 完成后继续运行。

运行监控仍应能查看 control 的状态、输入摘要、输出摘要和分支结果，否则发生错误时无法定位。

### 15.10 分支、回滚和重复执行

#### 分支判断

分支规则必须声明数据来源：

- 当前节点输出；
- 指定上游节点输出；
- 流程共享变量；
- 服务调用结果。

不得再通过“遍历所有全局变量名并检查表达式字符串是否包含变量名”判断依赖关系。

#### 分支切换

当人工选择或变量变化导致分支切换时：

1. 找到旧活动路径与新活动路径的分叉点；
2. 取消旧路径仍在进行的异步任务；
3. 从后往前卸载旧路径节点；
4. 删除旧路径的 `nodes[nodeId]`；
5. 移除对应渲染节点；
6. 保留分叉点之前的节点数据；
7. 从新分支首节点重新执行。

#### 重试

单节点重试默认只清理本节点的：

```text
apiData
output
branchResult
error
startedAt/completedAt
```

输入重新解析，人工表单是否保留由节点策略决定。

#### 整体重启：浏览器刷新与手机号变更（已冻结）

第一版不提供浏览器刷新后的断点续办。浏览器刷新时，运行时不恢复刷新前停留的人工环节，而是读取当前最新业务上下文，从唯一开始节点重新执行整个引导流程。

手机号是流程运行的关键业务上下文。宿主系统发出手机号变更事件后，运行时必须：

1. 弹框提示用户手机号已经变化，当前引导内容将按新手机号重新加载；
2. 使当前 `runId/executionId` 失效，阻止旧流程继续推进；
3. 取消旧运行中可以取消的请求和异步任务，并拒绝无法取消的旧请求结果回写；
4. 释放全部旧节点域，包括表单草稿、组件变量、API 数据、节点输出、状态和导航诊断；
5. 卸载旧 DOM、事件订阅和临时组件状态；
6. 读取最新手机号及相关全局上下文；
7. 创建新的运行标识，从开始节点重新执行并重新渲染。

```text
浏览器刷新
  → 新建运行
  → 从开始节点重新执行

手机号变更事件
  → 弹框告知
  → 旧运行整体失效
  → 读取新手机号
  → 新建运行
  → 从开始节点重新执行
```

手机号变更后的提示不是保留旧流程的选择开关：旧手机号数据已不再适用于当前客户上下文，不能关闭弹框后继续沿旧活动路径办理。

整体重启只清理和重建前端流程运行态，不代表撤销已经产生的后端业务结果。刷新后节点接口会按流程配置重新执行，配置开发人员必须保证接口及其重复调用符合业务要求；引导式运行时第一版不提供通用补偿、重试或幂等机制。

宿主页签切换不属于整体重启：用户切换到其他页签后再切回，流程保持原 DOM、活动路径和全部运行态，不重新执行任何节点，也不新增专门的“重新进入”事件。第一版没有独立的“返回上一步”能力；用户直接修改页面上仍可编辑的前序环节时，按分支回滚规则清理并重载该环节之后的路径。

#### 接口技术错误处理（已冻结）

接口调用属于应用组件配置开发人员负责的节点能力。流程使用的接口必须能够结束调用并按组件约定返回结果。

- 请求异常、超时、无有效返回或返回结构不符合组件约定时，当前节点直接进入技术错误状态；
- 运行时在当前环节展示错误并停止继续加载，不自动重试、不走默认分支，也不静默跳过；
- 第一版不增加引导式专用的手动重试、失败出线、通用补偿或幂等配置；
- 接口正常返回的业务 `success/failure` 不是技术错误，它是自动环节的业务诊断结果，可继续用于导航红绿展示和业务分支；
- 发布和上线前，配置开发人员负责验证接口返回完整性以及节点所需字段。

### 15.11 平台运行时 API

建议抽取共享 `GuidedRuntime`，由平台提供稳定 API，禁止页面组件直接操作 Store 内部结构。

```ts
interface GuidedRuntime {
  enterNode(nodeId: string): Promise<void>;
  completeNode(nodeId: string, reason?: string): Promise<void>;
  retryNode(nodeId: string): Promise<void>;
  disposeNode(nodeId: string): void;

  getNodeScope(nodeId: string): NodeRuntimeScope | undefined;
  getCurrentNodeScope(): NodeRuntimeScope | undefined;

  resolveInputs(nodeId: string): Promise<Record<string, any>>;
  publishOutputs(nodeId: string): Record<string, any>;
  evaluateBranch(nodeId: string): Promise<BranchDecision>;

  getVariable(nodeId: string, name: string): any;
  setVariable(nodeId: string, name: string, value: any): void;
  setFormData(nodeId: string, formId: string, value: any): void;
  setApiData(nodeId: string, apiId: string, value: any): void;

  getShared(name: string): any;
  setShared(name: string, value: any): void;
}
```

React 物料通过节点 Runtime Context 获得当前 `nodeId`：

```ts
const runtime = useGuidedNodeRuntime();
runtime.setVariable('selectedValue', value);
```

物料不需要知道全局 Store 路径，也不需要自己拼变量名后缀。

### 15.12 编辑器交互设计

#### 数据面板分组

变量选择器应按下面结构展示：

```text
当前环节
  输入
  本地变量
  表单数据
  接口结果
  输出

上游环节
  客户选择
    输出
      已选客户 ID
  订单查询
    输出
      订单列表

流程共享
  省份编码
  当前用户机构

系统上下文
  登录用户
  路由参数
  环境信息
```

#### 产品规则

- 默认打开“当前环节”；
- 不展示其他节点内部变量，只展示它们声明的输出；
- 不能选择当前节点的下游节点输出；
- 删除或修改输出前先显示引用影响；
- 节点显示名称变化不影响已有绑定；
- 仅当用户切换到高级模式时显示表达式源码；
- 旧 `context.variable` 引用显示兼容标记和迁移建议。

#### 数据血缘

点击一个输入绑定，应能看到：

```text
订单确认.customerId
  ← 客户选择.selectedCustomerId
  ← 客户选择表单.customerId
```

这比在全局变量列表中搜索名字更适合多团队维护。

### 15.12.1 引用依赖图与配置完整性校验

组件作用域解决变量隔离，引用依赖图负责保证删除和修改后的配置仍然完整。运行时和编辑器不得通过显示名称、变量同名或字符串包含关系推断依赖。

建议的引用模型：

```ts
type ReferenceTarget =
  | { kind: 'node-variable'; nodeId: string; variableId: string }
  | { kind: 'node-output'; nodeId: string; outputId: string }
  | { kind: 'global-variable'; variableId: string }
  | { kind: 'form-field'; nodeId: string; formId: string; fieldId: string }
  | { kind: 'api-result'; nodeId: string; apiId: string; path?: string };

interface DependencyEdge {
  source: ReferenceTarget;
  consumer: {
    nodeId?: string;
    configType: 'branch' | 'input' | 'output' | 'navigation' | 'visibility' | 'action' | 'script';
    configId: string;
  };
  access: 'read' | 'write';
  requirement: 'required' | 'optional-reactive';
  expectedType?: string;
}
```

依赖边从以下配置中统一提取：

- 分支条件；
- 节点输入绑定和输出映射；
- 智能导航展示字段；
- footer 及普通元素显隐/禁用条件；
- 变量赋值动作；
- 接口入参绑定；
- 脚本动作显式声明的 `reads/writes`。

脚本不能成为依赖校验的盲区。新配置通过变量选择器插入引用时，同时保存结构化依赖元数据。若允许手写脚本，保存时只接受可静态识别的访问；动态拼接变量名、运行时遍历全部变量或未声明读写必须报错，不能仅用正则搜索文本后假定安全。

#### 三阶段校验

1. **编辑动作前校验**：删除节点/变量、改变类型或改变来源前，从反向依赖索引取得影响清单；有引用时阻止直接修改；
2. **保存草稿校验**：重建完整依赖图并运行结构、类型、路径和循环检查；允许保存未完成草稿，但标记“存在配置错误、不可发布”；
3. **发布强校验**：任何阻断错误都禁止提交审核或发布。历史流程加载时也执行检查，失效引用不得以 `undefined` 或旧缓存值继续运行。

#### 全局变量赋值可达性

全局变量存在，不等于使用时一定有值。对每个读取点执行基于单活动路径 DAG 的前置赋值检查：

```text
保证有值 = 存在有效默认值
        或 从开始到读取点的每条可达路径上，
           都有一个先于读取点完成的保证赋值来源
```

赋值来源分为：

- `initial`：全局变量默认值；
- `header-init`：header 初始化成功后写入，对所有后续 content 保证可用；
- `node-complete`：content/control 完成时无条件写入，只对经过该节点的后续路径有效；
- `node-complete` 也包括人工环节的必经 change/确认事件链：只有赋值成功才形成有效结果并允许继续时，该赋值视为完成前保证来源；
- `conditional`：普通可选按钮、未参与环节完成的 change、条件动作或部分分支写入，不构成所有路径的保证；
- `reactive`：footer 显隐等允许初始无值、后续响应更新的读取。

必需输入、接口必填参数和分支条件使用 `required`；footer 元素显隐等可使用 `optional-reactive`，但必须配置未赋值时的默认行为。校验器据此区分阻断错误与提示。

#### 删除节点示例

```text
node-customer-check.variable.level
  → 赋值 global.customerLevel
  → footer 办理按钮显隐（optional-reactive）
  → 套餐推荐节点 customerLevel 输入（required）
```

删除 `node-customer-check` 前：

1. 找出节点拥有的变量、输出和赋值动作；
2. 沿反向依赖边列出 footer 和套餐推荐节点；
3. 检查全局变量是否还有默认值或其他保证赋值来源；
4. 因套餐推荐节点仍有必需读取且失去保证来源，阻止删除；
5. 配置人员重新绑定或删除依赖后，再允许保存和发布。

改显示名称不影响引用，因为底层 ID 不变；删除、改类型、改变来源才触发结构性影响校验。平台不根据名称相同自动换绑。

### 15.12.2 通用组件模板与节点实例复用（已冻结）

业务组件模板用于复用结构和能力，流程节点实例用于承载具体业务配置和运行数据：

```text
componentId       通用组件模板
nodeId            模板在当前流程中的环节实例
nodeExecutionId   该节点的一次执行
```

典型场景是多个自动环节都使用相同表格：组件模板统一提供列渲染、加载态、空态、分页和选择能力；不同节点实例分别选择后端接口、绑定接口参数、配置标题、映射诊断结果和分支结果。

```ts
interface GuidedNodeComponentInstanceConfig {
  nodeId: string;
  componentId: string;
  title?: string;
  navigatorTitle?: string;
  apiBindings?: Record<string, {
    apiId: string;
    params?: Record<string, DataBinding>;
  }>;
  resultMappings?: Record<string, {
    source: ReferenceTarget;
    target: 'variable' | 'output' | 'diagnosis';
  }>;
}
```

隔离规则：

- 组件模板不把某个具体业务接口写死为唯一数据源，而是声明接口槽位、所需参数和预期返回结构；
- 节点实例选择实际接口并完成参数、列表数据、业务状态和诊断字段映射；
- 标题、导航文案、接口配置和结果映射保存在节点实例，不回写通用组件模板；
- `variables/formData/apiData/output/status` 全部保存在 `runtime.nodes[nodeId]`；
- 同一组件模板的任一实例重新加载、回滚、报错或释放，不改变其他实例；
- 复制节点必须生成新 `nodeId`，配置可以复制，运行数据不能复制；
- 模板或模板变量发生结构性删除时，通过 P1-01 依赖图列出所有受影响节点实例并阻止无保护修改。

示例：

```text
CommonTable(componentId = table-common)
├─ 在途工单(nodeId = node-orders)
│  ├─ api: queryPendingOrders
│  ├─ title: 在途工单
│  └─ diagnosis: 有在途工单 / 无在途工单
└─ 可办理套餐(nodeId = node-packages)
   ├─ api: queryAvailablePackages
   ├─ title: 可办理套餐
   └─ diagnosis: 查询到可办理套餐 / 暂无可办理套餐
```

### 15.13 保存结构与后端边界

后端流程定义需要保存：

- `execution`；
- `presentation`；
- `inputs`；
- `outputs`；
- `inputBindings`；
- `branchConfig`；
- 可选 `alias`。

一次运行产生的 `formData/apiData/output/status` 不应写回流程定义。如果产品需要断点续办，应另建“流程实例运行快照”接口，以 `processInstanceId + nodeId` 保存，不能混入组件模板或流程定义。

建议接口职责：

```text
流程定义接口：保存节点配置、契约和连线
流程实例接口：创建一次运行
运行快照接口：保存/恢复节点状态（可选）
业务记录接口：由各业务模块通过组件事件或节点事件自行调用，平台不提供统一日志接口
```

### 15.14 双运行时改造清单

#### 主 `src` 运行时

`src/stores/canvasPageStore.ts`

- 新增 `guidedRuntime` 或独立 `guidedRuntimeStore`；
- `processData.nodeData` 只保存定义态节点页面数据，不再承担运行值；
- `addBussinessElement` 增加 `nodeId` 上下文，或逐步改为节点渲染容器；
- `setVariableData/setFormData/editApiOutData` 改为节点域写入；
- 保留 legacy projection 供旧页面使用。

`ProcessPage.tsx`

- 删除 `mergeVariable` 中的变量名后缀策略；
- `addProcessNode` 改为 `runtime.enterNode`；
- 所有区域节点通过统一执行器运行，content 的 `interactionMode` 同时驱动默认推进方式和导航展示；
- 分支只读取声明的数据绑定；
- 渲染元素从 `runtime.nodes[nodeId]` 组装；
- 回滚按节点域释放。

`VariableBind/VariableSelect`

- 从“页面全局变量树”升级为“当前节点、上游输出、流程共享、系统上下文”数据选择器；
- 保存稳定引用对象，不只保存字符串表达式。

#### 独立 `materials` 运行时

`materials/stores/pageStore.ts`

- 新增节点域状态和节点域写入 action；
- 保持组装式页面仍使用 legacy page scope；
- 通过 Runtime Context 判断当前渲染属于普通页面还是引导节点。

`materials/utils/util.ts`

- 新增 `getNodeVariable/getNodeFormData/getNodeApiData`；
- `renderFormula` 组装新 `GuidedExpressionContext`；
- `getPageVariable` 保留为旧页面兼容 API。

#### 独立 `page` 运行壳

`page/src/page/index.tsx`

- 与主预览使用同一 `GuidedRuntime`；
- 删除独立实现的 `mergeVariable`；
- 使用相同节点执行器、绑定解析器和回滚算法；
- 宿主差异只留在 API 请求、用户信息和路由适配器。

### 15.15 兼容迁移方案

#### 阶段 A：引入节点域，不改变旧数据

- 新增 scoped runtime 数据结构；
- 旧页面仍读写 flat page scope；
- 引导式新节点同时写节点域，并生成旧上下文投影；
- 新配置默认保存结构化 binding。

#### 阶段 B：新引导式以节点域为主

- `ProcessPage` 和独立 `page` 只通过 runtime 读写；
- legacy projection 只在执行旧公式、旧动作时生成；
- 对重复旧变量名输出诊断，不阻断旧流程运行。

#### 阶段 C：旧配置迁移

迁移器按节点处理：

1. 把节点业务组件中的变量复制为节点本地定义；
2. 分析该节点公式、事件和分支引用；
3. 能确定来源的引用改成结构化 binding；
4. 被多个节点依赖且无法归属的变量标记为流程共享候选；
5. 同名变量出现多个来源时生成冲突清单，要求人工确认；
6. 保存迁移版本和回滚快照。

#### 阶段 D：收敛旧上下文

- 新建流程不再允许创建隐式全局变量；
- 旧上下文仅对历史版本可用；
- 使用率降到可接受范围后再评估移除。

### 15.16 兼容投影规则

兼容投影不是简单把所有节点变量重新扁平合并。建议优先级：

1. 显式流程共享变量；
2. 当前活动节点本地变量；
3. 当前活动路径上已发布且标记兼容导出的输出；
4. 历史旧页面变量。

如果同一优先级出现同名值：

- 不静默覆盖；
- 记录 `LEGACY_NAME_CONFLICT` 诊断；
- 编辑器显示冲突来源；
- 旧版本可按原先“先到先得”行为运行，新版本必须完成迁移后发布。

### 15.17 节点加载完成事件、诊断与安全

平台不负责业务日志，不定义记录结构、存储和查询。为了让各业务自行完成环节记录，第一版只补充当前配置缺少的节点实例级“环节加载完成”事件；人工点选、按钮操作和人工确认记录继续使用组件现有的 `change/click/confirm` 事件动作链。

```ts
type GuidedNodeLifecycleEvent = 'onNodeLoaded';

interface GuidedNodeLifecycleContext {
  nodeId: string;
  nodeExecutionId: string;
  region: 'header' | 'content' | 'footer' | 'control';
  variables: Readonly<Record<string, unknown>>;
  formData: Readonly<Record<string, unknown>>;
  apiData: Readonly<Record<string, unknown>>;
  outputDraft: Readonly<Record<string, unknown>>;
  shared: Readonly<Record<string, unknown>>;
  process: {
    activeContentPath: ReadonlyArray<ActiveContentPathItem>;
  };
}

interface ActiveContentPathItem {
  sequence: number;
  nodeId: string;
  componentId: string;
  title: string;
  navigatorTitle?: string;
  interactionMode: 'manual' | 'automatic';
  output: Readonly<Record<string, unknown>>;
  diagnosis?: {
    value?: unknown;
    label?: string;
    status?: 'success' | 'failure';
  };
}
```

时序规则：

- `onNodeLoaded`：节点必要接口和初始化逻辑完成、数据已经写入当前节点域且组件具备展示条件后触发；
- 自动 content/control 在评估分支并继续之前触发；人工 content 在进入等待用户操作之前触发；header 在允许 content 启动之前触发；footer 在固定区域首次挂载和初始化后触发；
- `onNodeLoaded` 是普通节点事件，不包含日志语义，可以配置接口、变量赋值或其他现有事件动作；
- 事件动作保存在节点实例，不保存在通用组件模板。因此同一 CommonTable 用于多个环节时，每个节点可配置不同接口；
- 人工点选记录使用对应元素的 `change/click`，人工确认记录使用确认事件动作链，footer按钮记录使用按钮自己的 `click`；
- `context.process.activeContentPath` 按实际加载顺序提供当前已经加载且最终仍成立的全部 content 摘要；触发当前 content 的 `onNodeLoaded` 时，当前节点已经在列表中；
- 路径摘要只包含节点身份、标题、人工/自动方式、正式输出和诊断结果，不暴露其他节点私有变量、DOM 或 React state；
- 分支回滚后旧 content 从该列表移除，新分支加载后进入列表。因此它表示当前有效办理轨迹/当前最终态，只保留现在成立的路径，不包含曾经走过但已经失效的历史分支；
- 业务可在 `onNodeLoaded` 中提交完整路径快照，在元素 `change/click/confirm` 中提交当前路径和本次操作值。平台不保存这些记录；
- 平台不自动决定记录内容、不上传节点数据、不提供统一记录查询页面，也不增加日志专用失败策略。

本次范围边界：

- 组件和节点数据访问遵循已经冻结的节点作用域、组件实例引用和显式全局变量规则；
- 敏感字段分类、字段级权限、脱敏、Token治理属于平台级数据安全专项，不纳入本次引导式改造；
- 表达式继续沿用平台现有能力；脚本沙箱和 `new Function` 治理属于平台级安全专项；
- 当前没有既有生产引导式流程，但header/footer会先于完整节点作用域上线并产生少量试点流程；因此不建设重型通用迁移器，但必须为这些过渡流程提供基于稳定 `nodeId + guidedSchemaVersion` 的轻量升级和人工确认机制；
- 业务结果由前端计算还是后端接口产生，由具体业务模块决定；引导式只消费稳定结果并按配置推进。

### 15.18 测试矩阵

#### 隔离测试

- 两个节点都定义 `result`，互不覆盖；
- 同一业务组件模板在流程中出现两次，数据独立；
- 分支 A、B 使用同名表单 ID，切换分支不串值；
- 两个节点的 API ID 相同但实例不同，输出独立；
- control 不创建 DOM，但状态和输出可诊断。

#### 绑定测试

- 当前节点读取本地变量；
- 下游节点读取上游公开输出；
- 节点不能读取上游私有变量；
- 节点重命名后绑定不失效；
- 输出 key 变更时给出引用影响；
- 流程共享变量重名时阻止保存。

#### 分支测试

- 人工表单变化只重算依赖该表单的分支；
- 自动接口返回后正确选择分支；
- control 根据输入选择分支；
- 快速连续切换时旧异步结果不能污染新路径；
- 回滚后旧路径节点域被释放；
- 重试只重置目标节点规定的数据。

#### 兼容测试

- 开发期间旧模拟引导式数据可以直接重建，不要求迁移；
- 主预览和独立 `page` 运行结果一致；
- 普通组装式页面仍使用原页面级数据模型，不被引导式节点域影响。

### 15.19 验收标准

#### 产品验收

- 用户创建本地变量时不需要考虑流程全局重名；
- 数据选择器能按环节和输出选择数据；
- content 的人工/自动推进方式清晰，且导航与运行时读取同一个配置来源；
- header/footer/control 的特殊用途和默认 content 规则清晰；
- control 不渲染但可在运行诊断中查看；
- 引用变更有影响提示。

#### 技术验收

- 新引导流程运行值以 `nodes[nodeId]` 为唯一主数据；
- 新代码不再用字符串后缀实现私有变量；
- 新分支规则不再扫描全局变量名判断依赖；
- `src` 与 `page/materials` 使用同一 binding 和 expression 语义；
- 节点卸载后没有遗留表单、API、变量或订阅；
- 旧 flat context 只由兼容适配层生成。

#### 性能验收

- 单节点字段变化只通知当前节点和显式依赖者；
- 不因任一变量变化重新序列化整个流程 Store；
- 分支回滚时间与被移除节点数线性相关；
- 100 个节点、每节点 50 个本地字段时，变量读取和更新无明显页面卡顿；
- 性能容量不能只统计节点数，还要同时统计节点内部元素总量、组件配置体积、活动路径实际渲染元素数和接口结果体积。

### 15.20 推荐实施顺序

1. 冻结区域、导航文案、完成策略、数据域、输入输出和 binding 模型；
2. 实现无 UI 的 `GuidedRuntime` 及单元测试；
3. 在主 `src` 预览接入节点数据域；
4. 改造变量选择器和表达式上下文；
5. 接入统一节点执行器、完成策略和 control 无界面执行；
6. 完成分支回滚和异步取消；
7. 同步改造 `page/materials`；
8. 增加 legacy projection 和迁移诊断；
9. 跑双运行时、旧流程和组装式页面回归；
10. 数据域稳定后，再继续自定义元素 v2 的正式改造。

---

## 16. 融合式 React 环节、正式输出与线性流程推进

### 16.1 本轮讨论后的核心结论

新的 React 引导式不是继续由后端逐环节下发“下一任务”的后端驱动页面，也不是让每个 React 组件自行实现流程跳转。目标模型是：

```text
流程节点 = React 展示/交互 + 节点配置 + 数据契约 + 配置化动作 + 分支规则
引导式运行引擎 = 解释节点配置、维护节点状态、选择连线并推进流程
后端 = 提供业务接口、权限校验、配置持久化和可选运行快照
```

这里的“融合”指一个环节在产品模型中同时包含界面、数据、动作和分支能力，不代表流程遍历、回滚、取消、重试等公共能力散落在各组件内部。

组件可以产生业务结果，但不能直接指定 `nextNodeId`。下一节点仍由画布连线和分支规则决定。

本轮进一步确认：

- 自动环节进入后自动调用接口或执行组件逻辑；完成后直接评估已有分支并静默继续，多条条件分支不会导致暂停；
- 后续仍为自动环节时连续加载，直到人工环节、结束节点或执行异常；
- 人工环节进入后等待点选、选择、输入或确认，交互完成后再评估分支；
- 组件输出与推进触发是两件事。自动环节不需要为了“继续”额外输出一个结果；只有分支、智能导航或下游需要时才对外提供相应业务字段；
- 产品侧统一称为“组件输出”；“输出契约”只表示这些字段的名称、类型和含义，不是第二套输出机制，更不是默认写入全局参数。

### 16.2 当前能力：有内部原子条件，没有正式环节输出

当前人工分支已经能够完成一部分多字段判断：

- 分支配置的每个选项包含 `conditionList`；
- 多个条件可以使用“全部满足”或“任一满足”；
- 条件可以引用业务组件内部的 `Select`、`Radio` 原子元素；
- 值为数组时会逐项比较；
- 被引用的 `formData` 一旦变化，就重新计算分支并替换后续渲染节点。

当前链路实际是：

```text
内部原子元素值
→ 页面级 formData
→ branchElementData[atomId]
→ conditionList
→ 分支下标
→ 加载下一节点
```

因此，当前只能说“可以直接读取部分内部原子值判断分支”，不能说“组件已经拥有正式输出”。主要缺口如下：

1. 流程配置依赖组件内部 `atomId`，组件内部结构调整后引用容易失效；
2. 分支配置器目前重点识别 `Select/Radio`，不能天然理解一个完整 React ZIP 组件的内部 state；
3. 没有稳定、声明式、可校验和可版本化的输出 Schema；
4. 没有明确区分填写草稿、校验通过和正式完成；
5. 任一关联值变化即触发分支，可能在其他必填项尚未完成时过早推进；
6. 下游得到的是零散内部值，而不是当前环节对外承诺的业务结果；
7. 内部字段大量注册到页面全局数据后，仍存在重名、污染和回滚残留风险。

### 16.3 环节统一数据边界

每个运行节点至少包含以下数据分区：

```ts
interface GuidedNodeRuntimeData {
  input: Record<string, unknown>;
  draft: Record<string, unknown>;
  private: Record<string, unknown>;
  apiData: Record<string, unknown>;
  output: Record<string, unknown>;
  status: NodeExecutionStatus;
  validation: {
    valid: boolean;
    errors: Array<{ path: string; message: string }>;
  };
}
```

语义必须固定：

- `input`：进入环节时由绑定解析得到，只面向当前节点；
- `draft`：用户尚未确认的表单和选择结果，可以反复修改；
- `private`：组件内部临时状态，其他节点不可见；
- `apiData`：当前节点调用接口得到的原始或中间数据；
- `output`：节点正式完成后对外公布的稳定业务结果；
- `status`：节点处于编辑、等待、提交、完成、失败还是取消状态；
- `validation`：是否具备正式完成条件，以及未通过原因。

节点内部字段默认私有。只有声明进入 `output` 的数据才允许分支和下游节点使用；只有显式发布的数据才进入 `process.shared`。

### 16.4 组件输出的定义和值

应用组件开发人员定义组件能够向流程提供哪些输出字段；技术设计中的“输出契约”只是这些字段的名称、类型、含义和约束：

```ts
interface GuidedNodeOutputField {
  key: string;
  title: string;
  schema: JsonSchema;
  required?: boolean;
  sensitive?: boolean;
  description?: string;
}
```

例如“材料选择”环节声明：

```text
selectedMaterials: string[]  已选择材料
deliveryMode: string         领取方式
applicantType: string        申请人类型
```

输出值属于某次流程实例中的某次节点执行：

```json
{
  "selectedMaterials": ["ID_CARD", "LICENSE"],
  "deliveryMode": "MAIL",
  "applicantType": "COMPANY"
}
```

输出定义可被编辑器、分支配置器、导航结果选择器、数据选择器、校验器和影响分析共同使用；输出值则必须隔离在 `runtime.nodes[nodeId].output` 中。它默认不是全局参数，只有显式发布时才进入流程共享域。

组件输出主要供分支判断，也可以供智能导航或下游节点使用。三者可选择不同字段：简单人工选择暂定以稳定 `value` 判断分支、以 `label` 展示导航；复杂组件可以分别提供判断字段和一个或多个诊断展示字段。

### 16.5 低代码业务组件如何生成输出

对现有由平台原子元素组成的业务组件，节点配置提供“输出映射”：

```text
内部 Select_123.value → output.selectedMaterials
内部 Radio_456.value → output.deliveryMode
内部 Select_789.value → output.applicantType
```

底层保存结构化来源引用，不把界面展示名称当主键：

```ts
interface NodeOutputMapping {
  outputKey: string;
  source:
    | { type: 'form'; elementId: string; path?: string }
    | { type: 'variable'; variableId: string; path?: string }
    | { type: 'api'; apiId: string; path?: string }
    | { type: 'expression'; expression: string };
}
```

组件内部原子 ID 只存在于当前节点内部的映射层。流程分支和下游节点只引用 `outputKey`，不再直接绑定这些原子 ID。

2026-08-12 已确认把复杂业务计算集中在应用组件内部：应用组件开发人员声明一个稳定的“分支结果变量”，由内部选择和代码计算产生业务代码，流程只负责把该代码映射到画布连线。现有代码已验证可以通过下面的显式事件链完成：

```text
组件 onChange
→ 运行脚本或表达式
→ 变量赋值
→ variableData 变化
→ VA 分支重新判断
```

仅声明变量或填写默认表达式不会随表单变化自动重新计算，组件开发人员需要显式配置触发事件。改造后，“变量赋值”默认写入当前 `nodeId` 的组件变量域；组件也能读取流程中显式定义的全局变量，需要写入全局变量时必须明确选择全局赋值目标。人工环节允许使用组件变量判断分支，不能继续把人工/自动交互方式与 `MT/VA` 分支数据来源绑定在一起。

变量作用域、访问方式和人工组件结果时机已经冻结。结果产生方式由组件定义：即时决策组件在所需字段完整且校验通过后自动赋值；需要显式提交的组件通过确认/完成动作赋值。流程引擎只观察有效结果是否产生或变化，不强制所有多字段组件增加确认按钮。

“意向降档金额＋意向降档套餐”采用即时决策方式：两个字段完整有效后自动计算分支业务值；任何字段变化都会重新计算，业务值变化后按节点域回滚旧后续路径并加载新分支。

#### 示例：意向降档金额＋意向降档套餐

组件内部包含：

```text
意向降档金额 amount
意向降档套餐 packagePrice
组件分支结果变量 decisionCode
导航展示变量 decisionLabel
```

两个输入控件的 `change` 都触发同一段组件内部计算；也可以监听所属表单的统一 `change`，一次取得两个字段的最新值。

示例业务代码采用三档互斥结果：

```text
两个字段都是 8 元
  → decisionCode = PLAN_8
  → decisionLabel = 8元降档方案

不属于“两个字段都是8元”，且业务判定金额大于8、小于49
  → decisionCode = PLAN_8_49
  → decisionLabel = 8～49元降档方案

业务判定金额大于等于49
  → decisionCode = PLAN_49_PLUS
  → decisionLabel = 49元及以上降档方案
```

其中“业务判定金额”具体取意向降档金额、套餐价格还是由两者组合计算，由该应用组件开发人员在内部脚本中按业务规则确定；流程画布不重复实现这段计算。边界必须由组件定义为互斥区间，本例使用“小于49”和“大于等于49”，避免49元同时命中两条分支。

运行过程：

```text
初始：amount 未填或 packagePrice 未选
→ decisionCode 无有效值
→ 当前人工环节保持等待，不加载后续分支

用户填写 amount = 8，packagePrice = 8
→ change 触发计算
→ decisionCode = PLAN_8
→ 流程加载8元分支

用户已经在8元分支继续操作后，把其中一个业务选择改成28元
→ change 再次计算
→ decisionCode 从 PLAN_8 变为 PLAN_8_49
→ 当前节点原输出失效
→ 清理原8元分支的后续节点域、表单、变量、接口结果、导航结果、DOM和异步任务
→ 按 PLAN_8_49 重新选择连线
→ 加载8～49元分支
```

组件内部事件链：

```text
金额/套餐 change
→ 检查两个字段是否完整且有效
→ 运行组件脚本计算 decisionCode/decisionLabel
→ 更新当前 nodeId 的组件变量
→ 形成供分支和导航使用的节点输出
→ 有效结果首次产生时继续流程；结果改变时回滚并重载后续路径
```

该示例不要求用户额外点击“确认”或“完成”。如果组件校验未通过、字段被清空或暂时无法形成有效结果，则清除有效分支结果并停留在当前人工环节，不得沿用上一次结果继续推进。

### 16.6 完整 React 组件如何生成输出

完整 React 组件的 Checkbox、Form、内部 state 和子组件不会天然进入平台 `formData`。平台必须通过统一 Node Runtime Context 接收组件提交的数据。

概念协议如下：

```ts
interface GuidedNodeComponentContext {
  input: Readonly<Record<string, unknown>>;
  draft: Readonly<Record<string, unknown>>;
  updateDraft(patch: Record<string, unknown>): void;
  validate(): Promise<ValidationResult>;
  complete(output: Record<string, unknown>): Promise<void>;
}
```

约束：

- `updateDraft` 只更新当前节点草稿，不推进流程；
- `complete` 提交的值必须通过输出 Schema 校验；
- 流程引擎收到完成请求后统一落盘输出、改变状态和判断连线；
- 组件不能直接调用流程 Store、删除后续 DOM 或执行 `enterNode(nextNodeId)`；
- 自定义元素 v2 后续通过版本化平台 SDK 映射到这套协议。

### 16.7 content 环节的推进边界

#### 自动环节

自动环节进入后调用配置接口或执行应用组件的自动逻辑。数据或逻辑完成后，运行时立即使用已有分支规则选择下一条连线：

```text
进入自动环节
→ 调接口或执行组件自动逻辑
→ 更新正文和导航诊断结果
→ 评估一条或多条条件分支
→ 选择唯一出线
→ 静默进入下一节点
```

多条条件分支不会使自动环节暂停。下一节点仍为自动环节时继续执行，直到人工环节、结束节点或执行异常。只有一条无条件出线时，不需要为了推进专门生成组件输出。

自动环节可以提供接口业务状态、诊断摘要或分支判断字段，但这些输出服务于分支、导航或下游取数，不是“继续加载”信号。

#### 人工环节

人工环节进入后正常暂停并展示交互内容：

- 单选、下拉、开关或卡片选择，可以由点选变化恢复推进；
- 输入项或多个交互元素，由应用组件定义确认/完成动作；
- 交互完成后，如有条件分支则读取组件输出判断；只有一条出线时直接继续；
- 组件输出业务结果，不允许输出 `nextNodeId`。

人工环节的具体多字段完成条件和组合分支规则仍在 P0-04 中继续讨论，本节不提前冻结。

### 16.8 多个内部组件全部完成后再输出

一个业务环节内部可以包含多个表单、多个选择器或多个子组件。是否允许完成不能依赖“某一个字段发生过变化”，而应由完成规则判断。

建议支持：

```ts
interface CompletionPolicy {
  mode: 'selection-change' | 'component-signal' | 'condition';
  sourceKey?: string;
  signalKey?: string;
  condition?: StructuredCondition;
  requiredOutputs?: string[];
  validationRule?: StructuredCondition;
}
```

例如：

```text
selectedMaterials 非空
并且 deliveryMode 已选择
并且 applicantType 已选择
并且组件内部校验通过
```

本节只适用于人工环节：多元素场景满足必填和校验后，还要等待应用组件配置的确认/完成动作；单一决策元素则可在选择后直接继续。自动环节不使用这套等待规则。

### 16.9 多选组合的标准条件语义

复杂选择确定优先由应用组件内部代码计算，并只向流程提供稳定分支结果变量。因此以下集合操作符降为兼容旧组件或后续增强配置能力，不再作为所有新组件第一版的 P0 必选分支方式。

多选结果必须按集合而不是按字符串或数组顺序判断。分支条件至少应支持：

```text
containsAny      包含任意一个
containsAll      包含全部
equalsSet        集合完全相等，忽略顺序
notContains      不包含
sizeEquals       选择数量等于
sizeGreaterThan  选择数量大于
isEmpty          为空
isNotEmpty       非空
```

示例：

```text
$current.output.selectedMaterials containsAll ["A", "B"]
并且
$current.output.deliveryMode == "MAIL"
→ 邮寄办理分支
```

`["A", "B"]` 与 `["B", "A"]` 在 `equalsSet` 下必须视为相同集合。

### 16.10 输出与分支的职责边界

组件输出业务事实：

```json
{
  "selectedMaterials": ["A", "B"],
  "deliveryMode": "MAIL",
  "decisionCode": "NEED_REVIEW"
}
```

流程配置决定路线：

```text
decisionCode == NEED_REVIEW → 人工复核节点
decisionCode == PASS        → 办理成功节点
默认                         → 异常处理节点
```

允许组件输出业务语义结果 `decisionCode`，但禁止输出平台结构信息 `nextNodeId`。否则流程关系会被隐藏进组件代码，画布连线、影响分析和流程可视化都会失真。

分支判断字段和智能导航展示字段不要求相同。组件可以用简短稳定的代码区分分支，同时向导航提供更丰富的一个或多个诊断结果。两者都来自同一套组件输出机制，但由不同消费者按需选择。

### 16.11 单活动路径与分支汇合

当前业务范围采用“设计图可分支，一次运行只有一条活动路径”：

```text
       ┌→ B ─┐
A ─选择┤      ├→ D
       └→ C ─┘
```

一次运行只能是：

```text
A → B → D
```

或者：

```text
A → C → D
```

D 可以配置 B、C 两个父节点，但谁被选中，谁完成后就直接进入 D；D 不等待另一条未执行分支。

整个流程只允许一个结束节点。B、C 等不同互斥路径可以在中间节点 D 汇合，也可以分别继续处理，但最终都必须连接到同一个结束节点。

当前范围明确不实现：

```text
A 同时启动 B 和 C
→ 等待 B、C 全部完成
→ 再进入 D
```

因此不需要并行 token、join 计数器和并行补偿机制。设计器和保存校验应明确阻止把多条出线解释为“同时执行”。

### 16.12 连线推进规则

连线仍然是流程推进的唯一图结构来源。节点执行完成后，引擎从当前节点的出线中选择且只能选择一条：

```ts
interface GuidedTransition {
  transitionId: string;
  sourceNodeId: string;
  targetNodeId: string;
  trigger: 'completed' | 'success' | 'failed';
  condition?: StructuredCondition;
  priority?: number;
  isDefault?: boolean;
}
```

运行规则：

1. 只评估与当前完成事件匹配的出线；
2. 按优先级评估条件；
3. 正常分支必须唯一命中；
4. 无条件命中时进入唯一默认分支；
5. 多条同优先级分支命中时停止并报告配置错误，不能静默任选；
6. 没有命中且没有默认分支时，节点进入 `blocked` 或配置错误状态；
7. 自动节点在数据或自动逻辑完成后始终继续评估和推进，多分支不暂停；只有进入人工节点后才等待选择、输入或确认，直到人工完成、结束或发生异常。
8. 流程只允许一个结束节点，所有能够运行到终点的有效路径都必须到达该结束节点。

### 16.13 输出失效与分支回滚

用户返回前序人工环节修改选择时，旧输出不能继续被视为有效：

```text
当前节点 completed
→ 用户发起重新编辑
→ 原 output 标记失效
→ 更新 draft
→ 再次提交生成新 output
→ 重新判断分支
```

如果分支改变，引擎按节点域清理旧路径：

- 取消或忽略旧路径尚未完成的请求；
- 删除旧路径节点的 `draft/private/apiData/output/status`；
- 删除旧路径渲染结果和订阅；
- 保留分叉点之前仍然有效的节点域；
- 从新分支首节点开始执行；
- 使用新的执行批次 ID，拒绝旧异步结果回写。

这一步必须同时回滚数据和 DOM，不能只截断 `allRenderElements`。

### 16.14 固定页面区域与活动路径执行管线

`header/footer` 是随页面运行初始化的固定区域，`content/control` 构成按连线逐步执行的活动路径。四类节点仍共享节点域、变量、接口、错误处理和数据绑定基础能力，但挂载时机不同。

页面初始化：

```text
定位 header/footer
→ 执行 header 接口和初始化逻辑
→ header 写入所需全局变量
→ 渲染 header 并固定挂载 footer
→ 启动 content/control 活动路径
```

content 可以读取 header 已写入的显式全局变量。footer 在活动路径运行期间保持挂载，并根据最新流程数据响应式控制内部元素显隐。

content/control 活动路径：

```text
解析 input
→ 创建节点域
→ 执行动作或渲染组件
→ 形成 draft/apiData
→ 按分支、导航或下游需要整理组件输出
→ 选择唯一连线
→ 进入下一节点
```

自动节点沿这条管线连续执行；人工节点在交互阶段暂停，等待应用组件触发点选或确认完成。

当活动路径到达已预加载的 footer 节点时，不再次渲染，也不等待 footer 按钮动作，直接沿其唯一出线进入结束节点。footer 按钮始终只执行自身配置的业务操作。

`VA` 更适合表示“变量变化触发重新计算”的触发方式或兼容分支类型。迁移时应保留旧行为，但新模型应把导航文案、完成触发和展示区域拆开。

### 16.15 前后端职责

前端引导式运行引擎负责：

- 解析流程定义和节点配置；
- 创建、更新和释放节点数据域；
- 渲染 React 环节；
- 执行配置化动作；
- 校验输出；
- 判断连线并推进单活动路径；
- 处理前端范围的回滚、取消和旧结果失效；
- 保持主预览与独立运行页语义一致。

后端负责：

- 提供业务查询、提交、校验等 API；
- 在服务端执行必须可信的业务规则和权限校验；
- 保存流程定义、节点配置、输出契约和连线；
- 按各业务模块需要提供其自己的记录接口，平台不建设统一业务日志；
- 保证接口实现和返回契约满足已配置流程的调用方式；是否允许重复调用及其业务处理由接口和组件配置开发人员负责。

引导式运行时消费组件提供的稳定业务结果并按配置推进；结果由前端计算还是后端接口产生，以及是否可作为业务提交依据，由对应业务模块和项目架构决定，不在本次引导式改造中统一治理。

### 16.16 编辑器需要补充的产品能力

节点配置面板至少增加：

1. 输入：当前节点需要哪些数据，以及来源绑定；
2. 内部数据：仅供当前节点使用的表单、变量和 API 数据；
3. 组件输出：名称、中文标题、类型、必填、敏感标记和来源映射；明确哪些字段用于分支、导航或下游；
4. 交互方式：自动环节连续执行；人工环节配置单一决策元素变化或组件确认动作；
5. 完成校验：哪些输出必须产生，是否还有组件内部校验；
6. 分支：只允许选择当前节点正式输出、显式共享数据或受支持的系统上下文；
7. 引用影响：删除或修改输出前，显示所有分支和下游输入引用；
8. 运行诊断：查看本次节点输入摘要、输出摘要、完成状态和实际命中连线。

输出选择器使用业务名称，不让配置人员直接操作内部 `atomId`：

```text
当前环节
  输出
    已选择材料
    领取方式
    申请人类型
```

### 16.17 此部分验收标准

- 一个环节包含多个内部选择器时，可以等全部必填项完成并确认后再推进；
- 多选可以配置任意包含、全部包含、集合相等和数量条件；
- 分支配置不直接依赖 React 组件内部 DOM 和 state；
- 现有低代码原子组件可以通过输出映射生成正式输出；
- 后续 React ZIP 组件可以通过同一节点协议提交输出；
- 两个节点都使用 `result`、`selectedItems` 等名称时互不覆盖；
- 分支只读取正式输出，不读取未确认草稿；
- 用户修改前序节点后，旧输出与旧路径数据同时失效；
- `A-B-D / A-C-D` 两条互斥路径均能进入 D；
- 所有互斥路径最终都能到达同一个、也是唯一的结束节点；
- 不会把 B、C 误解释为并行执行；
- 多条分支同时命中、无分支命中且无默认分支时有明确诊断；
- 主 `src` 预览和独立 `page` 运行结果一致。

---

## 17. 大流程编辑器容量与性能改造

### 17.1 容量边界

旧业务存在 77、110 个环节的真实流程，当前确认单流程业务节点数最多不超过 150。150 只是拓扑节点上限，不是完整性能规模；业务节点内部还包含原子元素、接口、变量、事件、表达式和组件配置，因此容量评估必须采用组合指标：

```text
编辑规模 = 节点与连线拓扑
         + 全部节点内部元素数量与配置体积
         + 编辑期 DOM/SVG 与状态订阅
         + 撤销重做数据量

运行规模 = 当前活动路径节点数
         + 活动路径实际渲染元素数
         + 接口结果、节点域状态与订阅
```

“支持 150 个节点”只有在真实复杂度数据下完成打开、拖动、缩放、编辑、撤销和保存验证后才能成立，不能用 150 个空节点的演示结果代替。

### 17.2 编辑器数据分层

流程编辑器需要把轻量拓扑和完整业务组件定义分开：

```text
画布常驻数据
  nodeId / componentId / name / position
  presentation / branchSummary / validationSummary

按需组件详情
  elements / elementsMap / variables
  api / events / expressions / full component config
```

画布节点卡片只渲染摘要，不挂载节点内部真实元素。完整组件详情仅在打开节点编辑或预览时加载，并使用有界缓存；撤销重做不得重复深拷贝这些完整详情。

### 17.3 现有画布优先优化项

1. 用邻接索引定位当前节点的入线和出线，拖动时只更新相关连线；
2. 用 `requestAnimationFrame` 合并 `mousemove`，拖动结束后再提交坐标、Store 和历史记录；
3. 节点卡片、连线、选中态、弹窗采用细粒度订阅，避免单节点变化触发整图更新；
4. 历史记录保存轻量拓扑快照或操作差异，排除原子元素树、完整组件配置和接口结果；
5. 初始化阶段批量建立 DOM/节点/连线索引，减少反复 `querySelector` 和同步布局测量；
6. 保存时只在必要阶段生成后端协议，避免编辑过程中反复整图序列化；
7. 完成以上优化后仍有压力时，再启用按视口渲染或画布大图降级。

### 17.4 运行期元素治理

运行时只加载实际命中的活动路径，不加载未命中场景或分支。节点字段更新只通知当前节点和显式依赖者。已完成复杂节点不能无条件长期保留全部重型交互 DOM；是否转为只读结果、折叠后卸载并按需恢复，需与“返回前序环节修改”的产品规则共同确定。旧分支失效时，其 DOM、订阅、接口任务、Blob 和节点域状态必须一并释放。

### 17.5 画布技术路线

第一阶段先优化现有画布，不预先绑定某个开源库。使用同一份真实 110 节点数据和模拟 150 节点数据进行基准测试；若数据瘦身、局部连线更新和状态隔离后仍未达标，再用相同数据对 React Flow、AntV X6、LogicFlow 等候选方案做原型对比。

即使替换开源库，也只替换拖拽、缩放、连线、连接点和视口等画布基础层，保留现有流程定义协议、组件体系、分支语义和引导式运行引擎。开源画布不能替代节点详情按需加载、历史记录瘦身和运行期元素治理。

### 17.6 验收矩阵

至少覆盖以下样本：

- 真实 110 节点流程；
- 模拟 150 节点、典型连线与多分支流程；
- 节点较少但单节点内部元素较多的流程；
- 节点较多但单节点内容简单的流程；
- 包含复杂表格、表单、接口结果和变量联动的长活动路径。

统一记录首屏可操作时间、拖动/缩放帧耗时、节点编辑打开时间、撤销重做耗时、保存序列化耗时、DOM/SVG 数量、JS 堆内存和浏览器长任务。正式的总元素数、单节点元素峰值和配置体积上限，在统计真实 110 节点流程后冻结。
