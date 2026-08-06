# NGAP 项目上下文交接

> 用途：在 Codex 新建对话后，先让 Codex 完整阅读本文件，再继续本项目工作。
>
> 建议新对话第一句话：`请先完整阅读 C:\Users\EDY\Desktop\ngap\CODEX_CONTEXT.md，然后继续这个项目。`

## 1. 项目位置

工作目录：

```text
C:\Users\EDY\Desktop\ngap
```

原始 Repomix 文件：

```text
D:\download\repomix-output\repomix-output.xml
```

已从 Repomix 还原 1,206 个文本文件到项目目录。Repomix 不包含 PNG、GIF、字体、音视频等二进制资源。

接口采集文件：

```text
D:\download\new 67.txt
```

界面参考截图（临时目录文件可能在系统清理后失效）：

```text
C:\Users\EDY\AppData\Local\Temp\codex-clipboard-3aa4392c-c0aa-4746-b9ef-c6e37b8d763d.png
```

## 2. 用户的两个核心目标

### 目标 A：升级引导式流程编排

希望把当前引导式流程升级为可配置的四区页面：

```text
顶部核心信息区
智能导航区（可全局关闭）
普通环节内容区
底部操作区
```

要求：

- 每个流程节点可配置展示区域；
- 普通环节可单独决定是否显示在智能导航中；
- 有些环节没有页面组件，只参与流程控制，不进入导航；
- 一个流程最多一个顶部节点、一个底部节点；
- 整个流程可以不显示智能导航；
- 顶部核心信息和导航可以共同固定，也可以随整页滚动；
- 不改变现有人工、自动、变量分支的核心业务能力。

已确定节点模型：

```ts
interface ProcessNodePresentation {
    region: 'header' | 'content' | 'footer' | 'control';
    showInNavigator: boolean;
    navigatorTitle?: string;
}
```

已确定流程全局配置：

```ts
interface GuidedProcessConfig {
    navigator: {
        enabled: boolean;
        title: string;
    };
    scrollMode: 'fixed-top' | 'full-page';
}
```

关键业务约束：

- `header`：渲染在顶部，不进入导航，最多一个；
- `content`：普通环节，可配置是否进入导航；
- `footer`：渲染在底部，不进入导航，最多一个；
- `control`：参与流程判断和流转，但不渲染 UI、不进入导航；
- 展示配置属于当前流程中的节点实例，不属于业务组件模板。

### 目标 B：升级自定义元素为“上传一个函数组件”

当前系统已经支持：

- 获取 TSX、Schema TS、Less 三个源码文件；
- 浏览器使用 `@babel/standalone` 编译；
- 生成 Blob URL 并动态 `import()`；
- 读取默认导出的 React 组件；
- 注册到组件表；
- 使用 `NgapRender` 在画布和预览中渲染。

目标是把三文件、强平台规范的使用方式，改成用户上传一个默认导出的 React 函数组件，平台自动生成或读取：

- 默认属性；
- 属性面板配置；
- 事件定义；
- 组件名称和描述；
- 画布预览和运行时注册。

正式实施前需要设计安全边界。当前 Blob 动态执行相当于运行任意 JavaScript，生产环境至少需要可信上传者和审核；更严格方案是沙箱 iframe 或服务端构建、扫描和签名。

## 3. 已完成的工作

- 已解析 `package.json`；
- 已从 Repomix 还原文本源码；
- 已安装依赖；
- TypeScript `npx tsc --noEmit` 已通过；
- Vite 开发服务器曾成功启动，入口和 `src/main.tsx` 返回 HTTP 200；
- 完整构建会被 Repomix 缁失的二进制资源阻断；
- 已生成缺失二进制资源清单；
- 已分析引导式流程编辑、保存、预览和运行链路；
- 已分析自定义元素上传、源码获取、动态编译、注册和渲染链路；
- 已编写详细引导式流程重构设计文档。
- 已增加保留原页面结构的本地模拟模式，不再采用独立“实验台”页面：
  - `#/build?mock=guided` 自动打开原应用编排画布；
  - `#/build?mock=element` 自动打开原元素管理并弹出单文件函数组件上传；
  - 缺失二进制图片由 Vite 开发插件提供 SVG 占位，不改变原组件结构。
- 原流程节点菜单已增加“展示设置”，原顶部工具栏已增加“页面布局”；预览仍复用 `ProcessPage`。
- 原元素管理顶部操作栏已增加“上传函数组件”，预览仍复用 `previewElementModal` 和 `NgapRender`。
- 引导式 Mock 基础信息已补齐应用分类、应用标签、归属项目及对应候选数据；基础信息“确定”和“保存草稿”已通过实际页面验证。

## 4. 必读文档

### 引导式流程详细设计

```text
C:\Users\EDY\Desktop\ngap\GUIDED_PROCESS_REDESIGN.md
```

包含：

- 现状分析；
- 数据模型；
- 编辑器交互；
- 四区运行时；
- 智能导航升级；
- BottomBanner 改造；
- 保存接口；
- 旧数据兼容；
- 具体文件修改清单；
- 测试方案；
- 分阶段实施计划。

### 接口和改造记录

```text
C:\Users\EDY\Desktop\ngap\REFACTOR_NOTES.md
```

### 缺失二进制资源清单

```text
C:\Users\EDY\Desktop\ngap\missing-binary-assets.txt
```

缺失约 315 个二进制资源。当前两个核心改造不要求先补齐全部资源，可以用 CSS 图标或占位资源开发。

## 5. 引导式流程关键源码

### 编排入口

```text
src/pages/applicationOrchestration/pageCanvas/processCanvasPage/index.tsx
```

职责：

- 加载流程应用和节点；
- 批量加载业务组件；
- 编辑/预览模式切换；
- 调用流程画布 `setData/getData`；
- 保存前把数据写入 Store。

### 流程画布

```text
src/pages/applicationOrchestration/pageCanvas/processCanvasPage/components/ProcessCanvas/index.tsx
```

职责：

- 节点与连线；
- 拖拽；
- 分支出口；
- `getData()` 序列化；
- `setData()` 回显；
- undo/redo 快照；
- `RenderNode` 节点展示。

### 类型

```text
src/pages/applicationOrchestration/pageCanvas/processCanvasPage/processCanvasPageType.ts
```

### 运行和预览

```text
src/pages/applicationOrchestration/pageCanvas/processCanvasPage/components/ProcessPage/ProcessPage.tsx
```

当前问题：

- 使用扁平 `allRenderElements` 保存所有节点元素；
- 运行时节点边界只靠 `belongNodeId`；
- 导航条先于全部元素固定渲染；
- 分支回滚按元素数组 slice/filter；
- 导航定位依赖 DOM 元素下标。

建议：改为 `RenderedProcessNode[]`，每个运行节点保留 `nodeId`、展示配置、状态和 `elements`。

### 智能导航

```text
src/pages/applicationOrchestration/pageCanvas/processCanvasPage/components/ProcessPage/TemplateNav.tsx
```

当前明确写死：

```tsx
<h1>智能诊断</h1>
```

总数和异常数也写死为 0。应改为读取流程配置和实际导航节点。

### 智能导航及运行时样式

```text
src/pages/applicationOrchestration/pageCanvas/processCanvasPage/components/ProcessPage/index.module.less
```

当前导航使用：

```less
position: sticky;
top: 0;
```

### 保存

```text
src/pages/applicationOrchestration/pageCanvas/components/CanvasTop.tsx
```

当前引导式保存为：

```ts
const result = {
    componentList: processData.componentList,
};
appData.sceneData = JSON.stringify(result);
```

目标：增加 `processConfig`，并在每个 `componentList` 节点中保存 `presentation`。

### Store

主要使用：

```text
src/stores/canvasPageStore.ts
```

另有：

```text
src/stores/processCanvasStore.ts
```

实施前应确认后者是否仍有实际入口使用，避免维护两套重复状态。

### BottomBanner

```text
src/packages/Layout/BottomBanner/BottomBanner.tsx
src/packages/Layout/BottomBanner/index.module.less
src/packages/Layout/BottomBanner/Schema.ts
```

当前 `.bottomBannerAtom` 使用绝对定位：

```less
position: absolute;
bottom: 0;
```

这会在引导式流程中覆盖内容或与其他节点通栏重叠。目标是让物料只负责内容布局，固定位置由新的 `ProcessFooter` 页面区域负责，同时兼容旧组装式页面。

### 独立运行页

```text
page/src/page/index.tsx
page/src/page/TemplateNav.tsx
page/src/page/index.module.less
```

注意：这里有一套和主项目高度重复的引导式运行逻辑。生产构建会先构建 `page`，所以不能只修改 `src`。长期应抽取共享运行时。

## 6. 自定义元素关键源码

### 动态编译和注册

```text
src/packages/index.tsx
```

关键函数：

- `onPreviewTsx()`；
- `onPreviewJs()`；
- `onPreviewLess()`；
- `fetchAllFileStream()`；
- `elementInfoFun()`；
- `queryElementFun()`；
- `getComponent()`；
- `updateComponent()`。

### 统一元素渲染

```text
src/packages/NgapRender/NgapRender.tsx
```

自定义元素和内置元素最终都通过这里的 `Material` 渲染。组件接收的主要参数包括：

```text
id
type
config
elements
loopVariable
事件回调
ref
```

### 自定义元素管理和预览

```text
src/pages/elementManagement/index.tsx
src/pages/elementManagement/elementDetail.tsx
src/pages/elementManagement/previewElementModal.tsx
src/pages/elementManagement/AddElementModal.tsx
src/pages/elementManagement/onlineEditing.tsx
```

### 自定义元素菜单

```text
src/config/components.tsx
```

## 7. 已取得的接口数据

数据在：

```text
D:\download\new 67.txt
```

### 已验证有效

#### `/app/queryAppAndNodeInfo`

- 流程 ID：`2607011011050101555`；
- 场景：`process`；
- 共 8 个流程节点；
- 包含 `componentId`、`nodeId`、`parentId`、`branchIndex`、`canvasPoint`。

#### `/appComponent/queryAppComponentInfo`

- 组件 ID：`2608031511180114031`；
- 与上述流程匹配；
- 组件名：客户是否认可挽留；
- 包含 `MT` 人工分支；
- Radio 值 1 和 2 分别命中两条分支。

#### `/element/queryElementList`

- 共 36 个自定义元素；
- 34 个状态为已发布。

#### `/csf/call/getElementFileInfo`

- 自定义元素 ID：`2608051421540100045`；
- 包含完整 TSX、Schema TS、Less；
- TSX 是默认导出的 React 函数组件。

### 数据缺口

`/appComponent/queryAppComponentInfoList` 使用了 `260703...` 的 8 个组件 ID，而流程结构使用 `260803...`，匹配数为 0。

需要用以下 ID 重新请求批量组件：

```text
2608031511180114027
2608031511180114028
2608031511180114029
2608031511180114030
2608031511180114031
2608031511180114032
2608031511180114033
2608031511180114034
```

若要完整研究自动分支，还需一个 `branchType = AT` 的组件实例及实际接口响应；当前匹配样例只覆盖 `MT`。

## 8. 已做的本地依赖调整

为了在当前云桌面复现：

- `.npmrc` 从不可达内网 registry 改为 `https://registry.npmjs.org/`；
- 移除了未被源码引用且公网不存在的 `common-crossAPI` 依赖；
- 补充 `lodash-es`；
- 补充 `@types/lodash`；
- 补充 `@babel/helper-create-class-features-plugin`；
- 补充 `framework-utils`、`@daybrush/utils`；
- 生成了新的 `package-lock.json`。

这些修改面向当前复现副本，不代表原生产项目一定应该采用完全相同的依赖处理方式。

## 9. 当前验证状态

- `npm install`：已完成；
- `npx tsc --noEmit --pretty false`：通过；
- `npm run start`：Vite 可启动；
- `http://127.0.0.1:8892/ngap/`：曾返回 HTTP 200；
- 完整 `npm run build`：被缺失二进制资源阻断；
- 当前没有要求为了两个核心改造先补齐所有二进制资源。
- 2026-08-05 本地模拟改造后：`npx tsc --noEmit --pretty false` 通过；Vite 入口以及应用编排、元素管理、函数组件上传模块均返回 HTTP 200。

### 本地模拟启动

```powershell
pwsh -NoProfile -Command "npm run start"
```

原布局引导式模拟：

```text
http://127.0.0.1:8892/ngap/#/build?mock=guided
```

原布局函数组件上传模拟：

```text
http://127.0.0.1:8892/ngap/#/build?mock=element
```

引导式操作：原流程节点右上角更多菜单选择“展示设置”；原顶部工具栏选择“页面布局”；点击原预览按钮查看四区布局。

函数组件操作：在原元素管理顶部点击“上传函数组件”，上传或编辑单个 TSX/JSX 文件，再点击“编译并预览”。本地模拟源码不能带 `import`，直接使用全局 `React`、`antd`、`antdIcons`。

## 10. 下一步建议

如果用户要求开始实现引导式改造：

1. 先完整阅读 `GUIDED_PROCESS_REDESIGN.md`；
2. 从数据模型、默认值、Store、getData/setData 和保存闭环开始；
3. 验证后端是否透传 `sceneData` 新字段；
4. 再把运行时从 `allRenderElements` 重构为节点级 `renderedNodes`；
5. 然后实现四区页面壳和导航升级；
6. 最后处理 BottomBanner 和 `page` 子项目同步。

如果用户要求开始实现函数组件上传：

1. 先明确允许上传的是 TSX 源码、已构建 ESM 文件还是 ZIP 包；
2. 定义单文件组件协议和静态元数据格式；
3. 复用现有 `onPreviewTsx()` 和 `getComponent()`；
4. 自动生成默认 Schema；
5. 增加编译错误、导出校验、依赖白名单、版本和安全策略；
6. 确保 `NgapRender` 的 props 协议一致。

## 11. 新对话注意事项

- 不要重新要求用户提供整个项目；文本源码已还原。
- 不要要求用户传十几 MB 的全部图片；核心改造可先使用占位资源。
- 不要把顶部/底部属性加到业务组件模板；必须加到流程节点实例。
- 不要继续以第一个节点固定作为 header 或最后节点作为 footer；应显式配置。
- 不要继续用扁平元素下标实现导航定位；使用 nodeId 和节点容器 ref。
- 不要只修改 `src`，还要考虑 `page` 子项目的独立运行时。
- 修改 BottomBanner 时必须回归普通组装式页面。
- 用户目前首先要求的是设计和上下文记录，尚未明确授权开始大规模实现。
