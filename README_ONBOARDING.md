# NGAP 项目新人上手指南

## 项目简介

NGAP 是一个低代码应用搭建平台，支持通过可视化编排构建企业应用。

**核心能力：**
- 组装式页面：拖拽物料组件快速搭建页面
- 引导式流程：多步骤流程编排，支持条件分支和智能导航
- 自定义元素：上传自定义 React 组件扩展平台能力
- 业务组件：可复用的页面模板
- 接口编排：可视化配置业务接口调用和数据流转

## 技术栈

- **前端框架**：React 18.3.1 + TypeScript 5.1.6
- **构建工具**：Vite 5.0.11
- **UI 组件库**：Ant Design 5.21.0
- **状态管理**：Zustand
- **路由**：React Router 6.21.1
- **图编辑**：@antv/x6
- **代码编辑器**：Monaco Editor
- **样式**：Less

## 快速开始

### 环境要求

- Node.js >= 16
- npm >= 8

### 本地启动

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run start

# 访问地址
http://127.0.0.1:8892/ngap/
```

### 模拟模式

项目提供两个本地模拟入口，无需后端即可体验核心功能：

**引导式流程模拟**
```
http://127.0.0.1:8892/ngap/#/build?mock=guided
```

**自定义元素模拟**（旧版单 TSX 上传，非正式 ZIP 方案）
```
http://127.0.0.1:8892/ngap/#/build?mock=element
```

## 项目结构

```
ngap/
├── src/                          # 主项目源码
│   ├── main.tsx                  # 应用入口
│   ├── router/                   # 路由配置
│   ├── stores/                   # Zustand 状态管理
│   ├── packages/                 # 核心物料组件
│   │   ├── index.tsx             # 组件注册中心
│   │   ├── NgapRender/           # 统一渲染引擎
│   │   ├── Layout/               # 布局组件
│   │   └── ...                   # 各类物料组件
│   ├── layout/                   # 编辑器布局
│   │   ├── components/
│   │   │   ├── Menu/             # 物料菜单
│   │   │   ├── ConfigPanel/      # 属性配置面板
│   │   │   └── EventPanel/       # 事件配置面板
│   ├── pages/
│   │   ├── editor/               # 组装式页面编辑器
│   │   ├── componentEditor/      # 业务组件编辑器
│   │   ├── elementManagement/    # 自定义元素管理
│   │   └── applicationOrchestration/  # 应用编排
│   │       └── pageCanvas/
│   │           └── processCanvasPage/  # 引导式流程画布
│   └── config/                   # 配置文件
│       └── components.tsx        # 物料菜单配置
│
├── page/                         # 独立运行时（生产构建）
│   └── src/
│       └── page/                 # 页面运行引擎
│
├── materials/                    # 独立运行时物料
│   ├── index.tsx                 # 物料加载
│   └── NgapRender/               # 运行时渲染引擎
│
└── shared/                       # 共享模块（计划中）
    └── custom-element/           # 自定义元素共享核心
```

## 核心概念

### 1. 物料组件（Material）

平台内置的 React 组件，可在编辑器中拖拽使用。每个物料都需要：
- 组件实现（React 组件）
- Schema 配置（属性面板、事件、方法定义）
- 默认配置（默认属性值）

**注册示例：**
```typescript
// src/config/components.tsx
{
  componentId: 'Form',
  name: '表单',
  icon: 'form',
  category: 'dataEntry'
}
```

### 2. 自定义元素（Custom Element）

用户上传的自定义 React 组件。

**当前方式（v1）：**
- 上传 TSX 文件（组件实现）
- 上传 Schema TS/JS 文件（配置定义）
- 上传 Less 文件（样式）
- 浏览器使用 `@babel/standalone` 动态编译

**目标方式（v2，设计中）：**
- 上传一个标准 ZIP 包
- 包含 `ngap.json` 清单、多个 TSX/TS 模块、样式和资源
- 服务端构建、扫描和签名
- 运行时加载不可变产物

详见：[CUSTOM_ELEMENT_REDESIGN.md](./CUSTOM_ELEMENT_REDESIGN.md)

### 3. 业务组件（App Component）

可复用的页面模板，包含预先编排好的物料组件和配置。

### 4. 应用（App）

完整的应用实例，包含：
- 页面定义（组装式或引导式）
- 物料实例配置
- 接口编排
- 事件流配置

### 5. 引导式流程

多步骤流程应用，支持：
- 流程节点和连线
- 条件分支（人工分支、自动分支、变量分支）
- 智能导航
- 顶部信息区、内容区、底部操作区

详见：[GUIDED_PROCESS_REDESIGN.md](./GUIDED_PROCESS_REDESIGN.md)

## 关键模块说明

### NgapRender（统一渲染引擎）

**位置：**
- `src/packages/NgapRender/NgapRender.tsx`（编辑器）
- `materials/NgapRender/NgapRender.tsx`（独立运行时）

**职责：**
- 根据物料类型加载对应组件
- 注入平台能力（context、事件回调、ref 注册）
- 处理循环渲染、条件渲染
- 递归渲染子元素

**组件接收的 Props：**
```typescript
{
  id: string;           // 实例 ID
  type: string;         // 物料类型
  config: {             // 配置
    props: object;      // 业务属性
    style: object;      // 样式
    api: object;        // 接口配置
  };
  elements: [];         // 子元素（容器组件）
  loopVariable: any;    // 循环变量
  // ... 事件回调
  ref: (instance) => void;  // ref 注册
}
```

### 组件注册中心

**位置：** `src/packages/index.tsx`

**职责：**
- 内置组件全局注册（使用 Vite glob import）
- 自定义元素动态加载和编译
- 提供 `getComponent()` 统一组件获取接口

**当前流程（自定义元素）：**
1. 查询自定义元素列表 `/element/queryElementList`
2. 获取源码 `/csf/call/getElementFileInfo`（TSX、Schema、Less）
3. 使用 `@babel/standalone` 编译 TSX 和 Schema
4. 创建 Blob URL 并动态 `import()`
5. 将组件和 Schema 注册到 `componentMap`

### 属性配置面板

**位置：** `src/layout/components/ConfigPanel/ConfigPanel.tsx`

**职责：**
- 读取选中元素的 Schema
- 根据 `attrs` 配置渲染表单控件
- 实时更新元素配置到 Store

**Schema 示例：**
```typescript
{
  attrs: [
    { type: 'Title', label: '基础配置', name: 'base' },
    { type: 'Input', label: '标题', name: 'title' },
    { type: 'InputNumber', label: '数量', name: 'count' }
  ],
  config: {
    props: { title: 'hello', count: 0 },
    style: {},
    api: {}
  },
  events: [
    { value: 'onClick', name: '点击事件' }
  ],
  methods: [
    { name: 'reset', title: '重置' }
  ]
}
```

### 引导式流程画布

**位置：** `src/pages/applicationOrchestration/pageCanvas/processCanvasPage/`

**核心文件：**
- `index.tsx` - 画布入口，数据加载和保存
- `components/ProcessCanvas/` - 流程图编辑器（基于 X6）
- `components/ProcessPage/` - 流程运行和预览
- `components/ProcessPage/TemplateNav.tsx` - 智能导航

**当前问题：**
- 运行时使用扁平元素数组 `allRenderElements`
- 节点边界只靠 `belongNodeId` 区分
- 导航和定位依赖元素下标
- 缺少节点级展示配置

**改造目标：**
- 节点级数据结构，支持顶部/内容/底部/控制四种区域
- 可配置智能导航显示
- 支持固定顶部或全页滚动模式

## 核心改造项目

项目当前有两个核心改造目标，详细设计文档已完成：

### 改造 A：引导式流程四区升级

**文档：** [GUIDED_PROCESS_REDESIGN.md](./GUIDED_PROCESS_REDESIGN.md)

**目标：**
- 节点支持四种展示区域：header、content、footer、control
- 可配置智能导航显示/隐藏
- 支持固定顶部或全页滚动
- 底部操作区由流程壳定位，不再用绝对定位

**当前状态：** 设计完成，本地模拟已实现基础交互

### 改造 B：自定义元素 ZIP 包上传

**文档：** [CUSTOM_ELEMENT_REDESIGN.md](./CUSTOM_ELEMENT_REDESIGN.md)

**目标：**
- 从"三个文件分别上传"改为"一个 ZIP 包"
- 支持多模块、样式、资源
- 通过 `ngap.json` 声明元数据、SDK 版本和权限
- AST 自动推导属性、事件、方法
- 平台 SDK 规范化能力暴露
- 服务端构建、扫描和签名
- 双运行时统一（主项目和 `page`）

**当前状态：** 详细设计完成，待接口确认和实施

## 数据流

### 编辑器数据流

```
用户操作
  ↓
编辑器组件（拖拽、配置）
  ↓
Zustand Store（canvasPageStore）
  ↓
保存接口（/app/saveAppInfo）
  ↓
数据库
```

### 运行时数据流

```
应用 ID
  ↓
查询应用数据（/app/queryAppAndNodeInfo）
  ↓
查询业务组件（/appComponent/queryAppComponentInfo）
  ↓
查询自定义元素（/element/queryElementList）
  ↓
加载和编译
  ↓
NgapRender 渲染
  ↓
用户交互 → 接口调用 → 事件流 → 动作编排
```

## 常见任务

### 添加一个新的内置物料

1. **创建组件文件**
```typescript
// src/packages/MyComponent/MyComponent.tsx
export default function MyComponent({ config, ...props }) {
  return <div>{config.props.title}</div>;
}
```

2. **创建 Schema**
```typescript
// src/packages/MyComponent/Schema.ts
export default {
  attrs: [
    { type: 'Input', label: '标题', name: 'title' }
  ],
  config: {
    props: { title: 'Default' },
    style: {},
    api: {}
  },
  events: [],
  methods: []
};
```

3. **注册到菜单**
```typescript
// src/config/components.tsx
{
  componentId: 'MyComponent',
  name: '我的组件',
  icon: 'component',
  category: 'custom'
}
```

### 调试自定义元素

1. 访问 `#/elementManagement`
2. 找到目标元素，点击"预览"
3. 打开浏览器开发者工具
4. 检查 `componentMap[elementId]` 查看编译后的组件
5. 检查 `componentMap[elementId + 'Config']` 查看 Schema

### 修改属性面板控件

属性面板控件定义在：
```
src/layout/components/ConfigPanel/components/
```

支持的控件类型：
- `Input` - 文本输入
- `InputNumber` - 数字输入
- `Switch` - 开关
- `Select` - 下拉选择
- `TextArea` - 多行文本
- `MonacoEditor` - 代码编辑器
- `Variable` - 变量选择器
- 等等...

## 注意事项

### 双运行时同步

项目有两套运行时：
- **主项目** (`src/packages/`)：编辑器内预览
- **独立运行时** (`page/` + `materials/`)：生产环境

修改组件渲染逻辑时，需要同步修改两处：
- `src/packages/NgapRender/`
- `materials/NgapRender/`

### 自定义元素编译

当前自定义元素在浏览器动态编译，存在以下问题：
1. 每次打开页面重新编译（性能问题）
2. 不同环境编译结果可能不一致
3. 安全风险（任意代码执行）
4. 缺少类型检查和静态分析

正在改造为服务端构建模式，详见 CUSTOM_ELEMENT_REDESIGN.md

### 缺失资源

本地副本缺失约 315 个二进制资源（图片、字体等），详见：
```
missing-binary-assets.txt
```

开发服务器会为缺失图片提供 SVG 占位，不影响核心功能开发。

## 常用命令

```bash
# 开发
npm run start

# 类型检查
npx tsc --noEmit

# 构建（会因缺失资源失败，但核心代码可构建）
npm run build

# 构建 page 子项目
cd page && npm run build
```

## 相关文档

- [引导式流程重构设计](./GUIDED_PROCESS_REDESIGN.md)
- [自定义元素 ZIP 包重写设计](./CUSTOM_ELEMENT_REDESIGN.md)
- [改造记录](./REFACTOR_NOTES.md)
- [项目交接上下文](./CODEX_CONTEXT.md)

## 获取帮助

- 查看现有设计文档
- 阅读关键模块的代码注释
- 参考已有物料组件的实现
- 查看模拟模式的 Mock 数据

## 附录：关键接口

### 应用和流程

- `POST /app/saveAppInfo` - 保存应用
- `POST /app/queryAppAndNodeInfo` - 查询流程结构
- `POST /appComponent/queryAppComponentInfo` - 查询业务组件
- `POST /appComponent/queryAppComponentInfoList` - 批量查询业务组件

### 自定义元素

- `POST /element/queryElementList` - 查询元素列表
- `POST /csf/call/getElementFileInfo` - 获取元素源码（批量）
- `POST /element/saveElementInfo` - 保存元素
- `POST /csf/call/importOssByFileList` - 上传文件

### 接口编排

- `POST /csf/appInterface/abilityArrangeList` - 查询接口能力列表
- `POST /csf/appInterface/abilityArrangeDetails` - 查询接口详情

---

**祝你快速上手！有问题随时翻阅设计文档或查看代码实现。**
