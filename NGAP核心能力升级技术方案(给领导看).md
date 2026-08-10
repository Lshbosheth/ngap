# NGAP 低代码平台核心能力升级技术方案

> 引导式流程展示升级 + 自定义元素 ZIP 包上传

---

## 概述

本方案针对 NGAP 平台两个核心功能的局限性，提出技术升级方案：

1. **引导式流程展示编排升级**：支持顶部/内容/底部/控制四区配置，智能导航可配置
2. **自定义元素 ZIP 包上传**：从三文件上传升级为 ZIP 包，支持多模块、样式和资源

---

# 改造点一：引导式流程展示编排升级

## 一、当前问题

### 1.1 用户痛点

**缺乏页面布局控制：**
- 无法指定哪个节点显示在顶部核心区
- 无法指定哪个节点显示在底部操作区
- 无法控制智能导航的显示/隐藏
- 无法控制某些节点不进入导航
- 无法控制顶部区域是固定还是滚动

**实际需求：**
```
流程节点：
1. 客户信息（应该在顶部，不进导航）
2. 产品选择（普通环节，进导航）
3. 资费选择（普通环节，进导航）
4. 库存检查（仅流程控制，不显示UI）
5. 确认提交（应该在底部，不进导航）

但现在只能按顺序依次渲染，无法实现上述布局。
```

### 1.2 技术问题

**当前实现（ProcessPage.tsx）：**
```tsx
<div className="content">
    <TemplateNav />  {/* 导航始终显示，标题写死"智能诊断" */}
    <NgapRender elements={allRenderElements} />  {/* 扁平元素数组 */}
</div>
```

**存在问题：**
- 所有节点的元素混在 `allRenderElements` 扁平数组中
- 节点边界只靠 `belongNodeId` 标记
- 智能导航从扁平数组反推节点，定位不准确
- `BottomBanner` 使用绝对定位，会覆盖内容
- 无法区分"顶部节点"、"底部节点"、"控制节点"

### 1.3 影响范围

**对用户：**
- 流程页面布局僵化，无法满足业务需求
- 智能导航不可控，影响用户体验
- 底部操作区定位混乱

**对平台：**
- 引导式流程能力受限
- 与竞品差距明显

## 二、目标方案

### 2.1 四区页面模型

**页面结构：**
```
┌─────────────────────────────────────┐
│ 顶部核心信息区 (Header)              │  ← 一个节点
│ - 客户信息、订单摘要等               │     不进导航
├─────────────────────────────────────┤
│ ┌─────────┐ ┌────────────────────┐  │
│ │         │ │ 普通环节内容区      │  │  ← 多个节点
│ │ 智能导航 │ │ (Content)          │  │     可配置是否进导航
│ │         │ │ - 产品选择          │  │
│ │ 可全局   │ │ - 资费选择          │  │
│ │ 关闭    │ │ - 合约确认          │  │
│ └─────────┘ └────────────────────┘  │
├─────────────────────────────────────┤
│ 底部操作区 (Footer)                  │  ← 一个节点
│ - 上一步、下一步、提交等             │     不进导航
└─────────────────────────────────────┘

控制节点 (Control) - 不渲染 UI，仅流程判断
```

### 2.2 节点展示配置

**每个节点新增配置：**
```typescript
interface ProcessNodePresentation {
  region: 'header' | 'content' | 'footer' | 'control';
  showInNavigator: boolean;        // 是否显示在智能导航
  navigatorTitle?: string;         // 导航中的标题（可覆盖节点名）
}
```

**流程全局配置：**
```typescript
interface GuidedProcessConfig {
  navigator: {
    enabled: boolean;    // 是否启用智能导航
    title: string;       // 导航标题（取代写死的"智能诊断"）
  };
  scrollMode: 'fixed-top' | 'full-page';  // 固定顶部 or 全页滚动
}
```

### 2.3 业务约束

**区域限制：**
- `header`：最多 1 个，渲染在顶部，不进导航
- `content`：0~N 个，普通环节，可配置是否进导航
- `footer`：最多 1 个，渲染在底部，不进导航
- `control`：0~N 个，不渲染 UI，只参与流程判断

**保存时校验：**
- 同一流程不能有多个 `header` 节点
- 同一流程不能有多个 `footer` 节点
- `control` 节点不能包含页面元素（elements 必须为空）

## 三、关键实现

### 3.1 数据模型

**节点增加展示配置：**
```typescript
// componentList 中每个节点
{
  nodeId: string;
  componentId: string;
  parentId: string;
  branchIndex: number;
  canvasPoint: { x: number; y: number };
  
  // 新增
  presentation: {
    region: 'header' | 'content' | 'footer' | 'control';
    showInNavigator: boolean;
    navigatorTitle?: string;
  }
}
```

**流程增加全局配置：**
```typescript
// sceneData 中
{
  componentList: ProcessNode[];
  
  // 新增
  processConfig: {
    navigator: {
      enabled: boolean;
      title: string;
    };
    scrollMode: 'fixed-top' | 'full-page';
  }
}
```

### 3.2 运行时重构

**从扁平数组改为节点级渲染：**

```tsx
// ProcessPage.tsx（重构后）
function ProcessPage() {
  const { renderedNodes, processConfig } = useProcessRuntime();
  
  const headerNode = renderedNodes.find(n => n.region === 'header');
  const contentNodes = renderedNodes.filter(n => n.region === 'content');
  const footerNode = renderedNodes.find(n => n.region === 'footer');
  const navItems = contentNodes.filter(n => n.showInNavigator);
  
  return (
    <div className="guided-process-page">
      {/* 顶部区域 */}
      {headerNode && (
        <ProcessHeader>
          <NgapRender elements={headerNode.elements} />
        </ProcessHeader>
      )}
      
      <div className={`process-main ${processConfig.scrollMode}`}>
        {/* 智能导航 */}
        {processConfig.navigator.enabled && (
          <ProcessNavigator
            title={processConfig.navigator.title}
            items={navItems}
          />
        )}
        
        {/* 内容区域 */}
        <ProcessContent>
          {contentNodes.map(node => (
            <ProcessSection
              key={node.nodeId}
              id={`node-${node.nodeId}`}
              active={node.isActive}
            >
              <NgapRender elements={node.elements} />
            </ProcessSection>
          ))}
        </ProcessContent>
      </div>
      
      {/* 底部区域 */}
      {footerNode && (
        <ProcessFooter>
          <NgapRender elements={footerNode.elements} />
        </ProcessFooter>
      )}
    </div>
  );
}
```

### 3.3 编辑器增强

**流程节点右键菜单增加"展示设置"：**
```tsx
// RenderNode 组件
<Dropdown
  menu={{
    items: [
      { key: 'edit', label: '编辑' },
      { key: 'presentation', label: '展示设置' },  // 新增
      { key: 'delete', label: '删除' }
    ]
  }}
>
  {nodeContent}
</Dropdown>
```

**展示设置弹窗：**
```tsx
<Modal title="展示设置">
  <Form>
    <Form.Item label="展示区域">
      <Select>
        <Option value="header">顶部核心信息区</Option>
        <Option value="content">普通环节内容区</Option>
        <Option value="footer">底部操作区</Option>
        <Option value="control">仅流程控制</Option>
      </Select>
    </Form.Item>
    
    <Form.Item label="显示在导航">
      <Switch />
    </Form.Item>
    
    <Form.Item label="导航标题">
      <Input placeholder="留空则使用节点名称" />
    </Form.Item>
  </Form>
</Modal>
```

**顶部工具栏增加"页面布局"：**
```tsx
<Button onClick={openProcessConfig}>页面布局</Button>

// 页面布局配置弹窗
<Modal title="页面布局">
  <Form>
    <Form.Item label="启用智能导航">
      <Switch />
    </Form.Item>
    
    <Form.Item label="导航标题">
      <Input placeholder="如：智能诊断" />
    </Form.Item>
    
    <Form.Item label="滚动模式">
      <Radio.Group>
        <Radio value="fixed-top">固定顶部</Radio>
        <Radio value="full-page">全页滚动</Radio>
      </Radio.Group>
    </Form.Item>
  </Form>
</Modal>
```

### 3.4 BottomBanner 改造

**移除绝对定位：**
```less
// BottomBanner/index.module.less
.bottomBannerAtom {
  /* 移除
  position: absolute;
  bottom: 0;
  */
  
  /* 改为普通块级元素 */
  width: 100%;
}
```

**由 ProcessFooter 负责定位：**
```less
// ProcessPage/index.module.less
.process-footer {
  position: sticky;
  bottom: 0;
  z-index: 10;
  background: #fff;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
}
```

### 3.5 独立运行时同步

**page/src/page/index.tsx 同步改造：**
- 同样从扁平数组改为节点级渲染
- 复用相同的数据模型和布局逻辑
- 确保编辑器预览和生产运行一致

## 四、风险评估

| 风险 | 影响 | 缓解措施 |
|---|---|---|
| 旧页面数据兼容 | 已发布流程异常 | 提供默认值，旧数据自动补全 |
| 运行时性能 | 节点级渲染可能慢 | 虚拟滚动、按需渲染 |
| 双运行时不一致 | 预览和生产表现不同 | 共享核心逻辑、契约测试 |

---

# 改造点二：自定义元素 ZIP 包上传

## 一、当前问题

### 1.1 用户痛点

**现有上传方式：**
- 需要分别上传三个文件：TSX、Schema TS/JS、Less
- 无法拆分多个模块文件
- 无法包含静态资源（图片、字体等）
- 复杂组件无法实现

**实际限制：**
```tsx
// 现在只能写单文件，不能这样：
import { formatCustomerInfo } from './utils';  // ❌
import './styles.less';                         // ❌  
import logo from './logo.png';                  // ❌

export default function CustomerCard({ config }) {
  return <div>{config.props.title}</div>;
}
```

### 1.2 技术问题

**当前实现（src/packages/index.tsx）：**
```javascript
// 使用 @babel/standalone 只能编译单文件
const code = Babel.transform(tsxCode, {
  presets: ['react', 'typescript']
}).code;

// 不处理模块依赖
const blob = new Blob([code], { type: 'application/javascript' });
const url = URL.createObjectURL(blob);
const module = await import(url);
```

**存在问题：**
- Babel 只转换单文件，不处理 import
- 不支持相对路径模块
- Less 必须单独上传
- 依赖只能用全局 `window.React`

### 1.3 影响范围

**对开发者：**
- 复杂组件无法拆分，维护困难
- 无法使用图片等资源
- 开发体验差

**对平台：**
- 自定义元素能力受限
- 用户满意度低

## 二、目标方案

### 2.1 用户体验

**一个 ZIP 包包含完整组件：**
```
customer-card.zip
├── component.json          # 组件配置（JSON）
├── index.tsx              # 入口
├── utils.ts               # 工具模块
├── styles.less            # 样式
└── assets/logo.png        # 资源
```

**组件可以正常开发：**
```tsx
import React from 'react';
import { Button } from 'antd';
import { formatDate } from './utils';
import './styles.less';
import logo from './assets/logo.png';

export default function CustomerCard({ title, date, onConfirm }) {
  return (
    <div className="customer-card">
      <img src={logo} />
      <h3>{title}</h3>
      <p>{formatDate(date)}</p>
      <Button onClick={onConfirm}>确认</Button>
    </div>
  );
}
```

### 2.2 技术特点

**核心能力：**
- ✅ 支持多个 TS/TSX 模块
- ✅ 支持样式和资源 import
- ✅ 支持白名单依赖（react、antd 等）
- ✅ 兼容现有属性面板和事件系统

**技术选型：**
- 使用 **esbuild-wasm** 浏览器打包（替代 Babel）
- 使用 **component.json** 纯 JSON 配置（替代 Schema TS）
- 使用 **usePlatform Hook** 访问平台能力

## 三、关键实现

### 3.1 组件配置文件

**component.json（取代 Schema TS）：**
```json
{
  "name": "customer-card",
  "title": "客户信息卡片",
  "entry": "index.tsx",
  
  "props": {
    "title": {
      "type": "string",
      "label": "标题",
      "default": "客户信息"
    },
    "disabled": {
      "type": "boolean",
      "label": "是否禁用",
      "default": false
    }
  },
  
  "events": [
    { "name": "onConfirm", "label": "确认事件" }
  ],
  
  "dependencies": ["react", "antd", "dayjs"]
}
```

**自动转换为现有 Schema 格式：**
```typescript
function componentJsonToSchema(config) {
  return {
    attrs: generateAttrs(config.props),  // 自动生成
    config: {
      props: extractDefaults(config.props),
      style: {},
      api: {}
    },
    events: config.events,
    methods: config.methods
  };
}
```

### 3.2 构建方案

**使用 esbuild-wasm：**

| 特性 | Babel | esbuild-wasm |
|---|---|---|
| 速度 | 慢 | 快 10-100 倍 |
| 模块打包 | ❌ | ✅ |
| TypeScript | 需插件 | 原生支持 |
| 浏览器运行 | ✅ | ✅ |

**构建流程：**
```typescript
import * as esbuild from 'esbuild-wasm';

// 1. 解包 ZIP
const files = await JSZip.loadAsync(zipBlob);

// 2. 构建
const result = await esbuild.build({
  entryPoints: ['index.tsx'],
  bundle: true,
  format: 'esm',
  external: ['react', 'antd'],  // 不打包，运行时注入
  plugins: [
    virtualFileSystemPlugin(files),  // 从 ZIP 读取
    lessPlugin(),
    assetPlugin()
  ]
});

// 3. 动态导入
const code = result.outputFiles[0].text;
const blob = new Blob([code], { type: 'application/javascript' });
const url = URL.createObjectURL(blob);
const module = await import(url);
```

### 3.3 平台能力访问

**封装统一接口：**
```tsx
import { usePlatform } from '@ngap/runtime';

export default function MyComponent({ title }) {
  const platform = usePlatform();
  
  // 访问页面变量
  const customerId = platform.getVariable('customerId');
  
  // 调用接口
  const loadData = async () => {
    return await platform.callConfiguredApi({ id: customerId });
  };
  
  // 显示消息
  platform.message.success('操作成功');
  
  return <div>{title}</div>;
}
```

**usePlatform 实现：**
```typescript
export function usePlatform() {
  const pageStore = usePageStore();
  
  return {
    getVariable: (name) => pageStore.getVariable(name),
    setVariable: (name, value) => pageStore.setVariable(name, value),
    callConfiguredApi: (params) => handleApi(element.config.api, params),
    message: {
      success: (msg) => message.success(msg),
      error: (msg) => message.error(msg)
    },
    context: {
      pageId: pageStore.pageId,
      appId: pageStore.appId
    }
  };
}
```

### 3.4 后端对接

**最小改动方案：**
```typescript
// 复用现有字段
{
  elementJsDemo: zipOssUrl,           // 改存 ZIP URL
  elementConfigDemo: componentJsonStr, // 改存 component.json
  elementCssDemo: builtCssUrl || ''
}

// 加载时判断
if (elementJsDemo.startsWith('http')) {
  // v2: ZIP 包
  const zipBlob = await fetch(elementJsDemo).then(r => r.blob());
  return await buildFromZip(zipBlob);
} else {
  // v1: 旧三文件
  return await buildFromTripleFiles(elementInfo);
}
```

## 四、风险评估

| 风险 | 影响 | 缓解措施 |
|---|---|---|
| esbuild-wasm 体积（8MB） | 首次加载慢 | 按需加载、CDN 缓存 |
| 浏览器构建性能 | 复杂组件慢 | 构建缓存、限制包大小 |
| 旧组件兼容 | 影响存量用户 | v1 继续支持 |
| Blob URL 管理 | 内存泄漏 | 统一回收机制 |

---

# 整体评估

## 一、改造对比

| 改造点 | 解决的核心问题 | 技术复杂度 | 用户价值 |
|---|---|---|---|
| 引导式流程 | 页面布局僵化 | 中 | 高 |
| 自定义元素 | 组件能力受限 | 中 | 高 |

## 二、实施建议

### 优先级建议

**P0（高优先级）：**
- ✅ 自定义元素 ZIP 包上传
  - 直接影响组件开发能力
  - 用户呼声高
  - 技术方案成熟

**P1（中优先级）：**
- ⚠️ 引导式流程展示升级
  - 影响特定场景
  - 可先用配置绕过
  - 需要前后端配合

### 资源评估

**引导式流程：**
- 前端：数据模型 + 运行时重构 + 编辑器增强 + page 同步
- 后端：数据字段兼容、接口透传
- 风险：双运行时一致性、旧数据兼容

**自定义元素：**
- 前端：ZIP 解包 + esbuild 构建 + platform API + NgapRender 集成
- 后端：字段复用或新增（可选）
- 风险：浏览器构建性能、Blob URL 管理

### 实施路径

**阶段 1：技术验证**
- 完成核心技术 demo
- 验证可行性和性能
- 评估具体工作量

**阶段 2：单点突破**
- 优先完成自定义元素
- 快速上线，获取用户反馈
- 积累经验

**阶段 3：全面升级**
- 完成引导式流程改造
- 双运行时统一
- 完整测试和上线

## 三、成功标准

**引导式流程：**
- ✅ 用户能配置顶部/底部/控制节点
- ✅ 智能导航可全局关闭、可配置标题
- ✅ 节点可单独控制是否进导航
- ✅ 旧流程正常运行
- ✅ 编辑器和生产运行一致

**自定义元素：**
- ✅ 用户能上传 ZIP 包并正常使用
- ✅ 支持多模块、样式、资源
- ✅ 复杂组件能正常开发和运行
- ✅ 旧组件不受影响
- ✅ 主项目和 page 行为一致

---

**总结：两个改造点技术可行、风险可控，建议按优先级分阶段实施。**
