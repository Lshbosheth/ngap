# 自定义元素实用方案：ZIP 包组件上传

> 基于现有项目能力的务实方案，快速落地可用

## 一、当前问题

### 现有三文件方案的痛点

**用户体验差：**
- 需要分别上传 TSX、Schema TS/JS、Less 三个文件
- 无法拆分多个模块文件
- 无法包含图片、字体等静态资源
- 复杂组件无法实现

**技术问题：**
```javascript
// 当前只能写单文件，不能 import 其他模块
export default function MyComponent({ config }) {
  // ❌ 无法这样写：
  // import { useCustomHook } from './hooks';
  // import './styles.less';
  // import logo from './logo.png';
  
  return <div>{config.props.title}</div>;
}
```

**现有限制：**
- `src/packages/index.tsx` 使用 `@babel/standalone` 只能编译单文件
- 不支持相对路径 import
- Less 必须单独上传，不能在组件中 import
- 依赖只能用全局 `window.React`、`window.antd`

## 二、目标方案

### 用户视角

**一个 ZIP 包搞定：**
```
customer-card.zip
├── component.json          # 组件配置（取代旧 Schema）
├── index.tsx              # 组件入口
├── types.ts               # 本地类型（可选）
├── utils.ts               # 工具函数（可选）
├── styles.less            # 样式
└── assets/
    └── logo.png           # 静态资源
```

**组件可以正常写：**
```tsx
// index.tsx
import React from 'react';
import { Button } from 'antd';
import { formatDate } from './utils';
import './styles.less';
import logo from './assets/logo.png';

interface CustomerCardProps {
  title?: string;
  date?: string;
  onConfirm?: () => void;
}

export default function CustomerCard({ 
  title = '客户信息',
  date,
  onConfirm 
}: CustomerCardProps) {
  return (
    <div className="customer-card">
      <img src={logo} alt="logo" />
      <h3>{title}</h3>
      <p>{formatDate(date)}</p>
      <Button onClick={onConfirm}>确认</Button>
    </div>
  );
}
```

### 技术视角

**关键能力：**
- ✅ 支持多个 TS/TSX 模块
- ✅ 支持 import 样式和资源
- ✅ 支持白名单依赖（react、antd、dayjs 等）
- ✅ 兼容现有属性面板和事件系统
- ✅ 主项目和 page 运行时一致

## 三、核心设计

### 3.1 组件配置文件（component.json）

取代旧的 Schema TS/JS，使用纯 JSON 配置：

```json
{
  "name": "customer-card",
  "version": "1.0.0",
  "title": "客户信息卡片",
  "description": "展示客户摘要信息",
  
  "entry": "index.tsx",
  
  "props": {
    "title": {
      "type": "string",
      "label": "标题",
      "default": "客户信息"
    },
    "date": {
      "type": "string",
      "label": "日期"
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
  
  "methods": [
    { "name": "focus", "label": "聚焦" }
  ],
  
  "dependencies": ["react", "antd", "dayjs"]
}
```

**与旧 Schema 的对比：**

旧方式（Schema TS）：
```typescript
export default {
  attrs: [
    { type: 'Title', label: '基础配置', name: 'base' },
    { type: 'Input', label: '标题', name: 'title' }
  ],
  config: {
    props: { title: '客户信息' },
    style: {},
    api: {}
  },
  events: [],
  methods: []
};
```

新方式（component.json）：
- 更简洁，不需要写 `attrs` 结构
- 纯 JSON，不需要编译
- 自动生成属性面板

### 3.2 组件接收的 Props

**保持与现有物料一致：**

```tsx
interface ComponentProps {
  // 业务属性（来自 config.props）
  title?: string;
  date?: string;
  disabled?: boolean;
  
  // 平台注入（兼容现有）
  id: string;
  type: string;
  config: {
    props: object;
    style: object;
    api: object;
  };
  
  // 事件回调
  onConfirm?: () => void;
  
  // ref 注册
  ref?: React.Ref<any>;
}
```

**组件可以两种方式接收：**

```tsx
// 方式 1：扁平接收（推荐）
export default function MyComponent({ title, date, onConfirm }) {
  return <div>{title}</div>;
}

// 方式 2：兼容旧方式
export default function MyComponent({ config, ...props }) {
  const { title, date } = config.props;
  return <div>{title}</div>;
}
```

### 3.3 平台能力访问

**不暴露内部实现，提供标准接口：**

```tsx
import { usePlatform } from '@ngap/runtime';

export default function MyComponent({ title }) {
  const platform = usePlatform();
  
  // 访问页面变量
  const customerId = platform.getVariable('customerId');
  
  // 调用接口（复用属性面板配置的接口）
  const handleLoad = async () => {
    const data = await platform.callConfiguredApi();
    console.log(data);
  };
  
  // 显示消息
  const handleSuccess = () => {
    platform.message.success('操作成功');
  };
  
  return (
    <div>
      <h3>{title}</h3>
      <button onClick={handleLoad}>加载数据</button>
    </div>
  );
}
```

**usePlatform 提供的能力：**

```typescript
interface PlatformAPI {
  // 变量
  getVariable(name: string): any;
  setVariable(name: string, value: any): void;
  
  // 接口（使用属性面板配置的接口）
  callConfiguredApi(params?: object): Promise<any>;
  
  // 消息
  message: {
    success(msg: string): void;
    error(msg: string): void;
    warning(msg: string): void;
  };
  
  // 确认框
  confirm(options: { title: string; content?: string }): Promise<boolean>;
  
  // 当前上下文
  context: {
    pageId: string;
    appId: string;
    instanceId: string;
  };
}
```

### 3.4 依赖白名单

**允许的外部依赖：**

```javascript
// 自动注入，组件可直接 import
import React, { useState, useEffect } from 'react';
import { Button, Form, Input, message } from 'antd';
import * as Icons from '@ant-design/icons';
import dayjs from 'dayjs';
```

**转换机制：**

ZIP 包构建时，外部依赖会被转换成全局引用：

```javascript
// 组件源码
import { Button } from 'antd';

// 构建后
const { Button } = window.__NGAP_EXTERNALS__.antd;
```

**不允许的：**
- ❌ Node 内置模块（fs、path 等）
- ❌ 未在白名单的 npm 包
- ❌ 动态 import
- ❌ require

## 四、实施方案

### 4.1 浏览器端处理（首期）

**上传流程：**

```
用户选择 ZIP
  ↓
JSZip 解包（安全检查）
  ↓
读取 component.json
  ↓
构建模块图（入口 + 依赖模块）
  ↓
使用 esbuild-wasm 打包
  ↓
external 白名单依赖
  ↓
生成 Blob URL
  ↓
注册到 componentMap
  ↓
预览
```

**关键代码位置：**

新增文件：
```
src/custom-elements/
├── zip-reader.ts          # ZIP 解包和验证
├── component-builder.ts   # 浏览器端构建（esbuild-wasm）
├── component-registry.ts  # 组件注册中心
└── platform-api.ts        # usePlatform 实现
```

修改文件：
```
src/packages/index.tsx                    # 集成新加载器
src/packages/NgapRender/NgapRender.tsx    # 注入 platform API
src/pages/elementManagement/index.tsx     # 新增 ZIP 上传入口
materials/index.tsx                       # 同步支持 ZIP 加载
```

### 4.2 构建器实现（esbuild-wasm）

**为什么用 esbuild-wasm：**
- 在浏览器运行，不需要服务端支持
- 速度快（比 Babel 快 10-100 倍）
- 原生支持 TypeScript、JSX
- 原生支持模块打包
- 体积小（约 8MB，按需加载）

**构建配置：**

```typescript
import * as esbuild from 'esbuild-wasm';

const buildResult = await esbuild.build({
  entryPoints: ['index.tsx'],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2020',
  
  // 外部依赖
  external: ['react', 'react-dom', 'antd', '@ant-design/icons', 'dayjs'],
  
  // 虚拟文件系统（从 ZIP 读取）
  plugins: [
    virtualFileSystemPlugin(zipFiles),
    lessPlugin(),
    assetPlugin()
  ],
  
  write: false,  // 不写入文件，返回内存结果
  sourcemap: 'inline'
});

// 生成 Blob URL
const code = buildResult.outputFiles[0].text;
const blob = new Blob([code], { type: 'application/javascript' });
const blobUrl = URL.createObjectURL(blob);

// 动态导入
const module = await import(blobUrl);
const Component = module.default;
```

### 4.3 component.json 转 Schema

**兼容现有属性面板：**

```typescript
function componentJsonToSchema(config: ComponentJson) {
  return {
    attrs: generateAttrs(config.props),  // 自动生成
    config: {
      props: extractDefaults(config.props),
      style: {},
      api: {}
    },
    events: config.events || [],
    methods: config.methods || []
  };
}

function generateAttrs(props: ComponentJson['props']) {
  const attrs = [];
  
  for (const [name, prop] of Object.entries(props)) {
    // 根据类型自动选择编辑器
    const editor = getEditor(prop.type);
    
    attrs.push({
      type: editor,
      label: prop.label || name,
      name: name,
      ...(prop.options && { options: prop.options })
    });
  }
  
  return attrs;
}

function getEditor(type: string): string {
  const map = {
    'string': 'Input',
    'number': 'InputNumber',
    'boolean': 'Switch',
    'array': 'Select',
    'object': 'MonacoEditor'
  };
  return map[type] || 'Input';
}
```

### 4.4 usePlatform 实现

```typescript
// src/custom-elements/platform-api.ts
import { useContext } from 'react';
import { usePageStore } from '@/stores/canvasPageStore';

const PlatformContext = React.createContext<PlatformAPI | null>(null);

export function usePlatform(): PlatformAPI {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within a component');
  }
  return context;
}

export function createPlatformAPI(element: any): PlatformAPI {
  const pageStore = usePageStore();
  
  return {
    getVariable(name: string) {
      return pageStore.getVariable(name);
    },
    
    setVariable(name: string, value: any) {
      pageStore.setVariable(name, value);
    },
    
    async callConfiguredApi(params = {}) {
      const { config } = element;
      if (!config.api) {
        throw new Error('未配置接口');
      }
      // 复用现有 handleApi 逻辑
      return handleApi(config.api, params);
    },
    
    message: {
      success: (msg) => message.success(msg),
      error: (msg) => message.error(msg),
      warning: (msg) => message.warning(msg)
    },
    
    confirm: async (options) => {
      return new Promise((resolve) => {
        Modal.confirm({
          ...options,
          onOk: () => resolve(true),
          onCancel: () => resolve(false)
        });
      });
    },
    
    context: {
      pageId: pageStore.pageId,
      appId: pageStore.appId,
      instanceId: element.id
    }
  };
}
```

### 4.5 NgapRender 集成

```tsx
// src/packages/NgapRender/NgapRender.tsx
import { PlatformContext, createPlatformAPI } from '@/custom-elements/platform-api';

function Material({ item, ...props }) {
  const Component = getComponent(item.type);
  const platformAPI = createPlatformAPI(item);
  
  // 扁平化 Props（新组件推荐方式）
  const componentProps = {
    ...item.config.props,
    id: item.id,
    type: item.type,
    config: item.config,  // 兼容旧组件
    ...eventHandlers,
    ref: componentRef
  };
  
  return (
    <PlatformContext.Provider value={platformAPI}>
      <Component {...componentProps} />
    </PlatformContext.Provider>
  );
}
```

## 五、上传界面设计

### 5.1 上传步骤

```
步骤 1：基础信息
  - 元素名称
  - 元素分类
  - 元素说明

步骤 2：上传组件包
  - 拖拽或选择 ZIP 文件
  - 自动解包和分析
  - 显示文件树

步骤 3：配置确认
  - 显示解析出的属性
  - 显示解析出的事件
  - 可手动调整

步骤 4：预览测试
  - 在画布中预览
  - 测试属性修改
  - 测试事件触发

步骤 5：保存
  - 保存草稿 / 提交审核
```

### 5.2 文件树展示

```
customer-card.zip (2.3 KB)
├─ ✅ component.json
├─ ✅ index.tsx (入口)
├─ ✅ utils.ts
├─ ✅ styles.less
└─ assets/
   └─ ✅ logo.png (8 KB)

解析结果：
✅ 3 个属性
✅ 1 个事件
✅ 0 个方法
✅ 依赖：react, antd
```

### 5.3 错误提示

```
⚠️ 发现问题：

1. component.json 中 entry 指向的文件不存在
   → 应该是：index.tsx

2. index.tsx 中 import 了未在白名单的包：axios
   → 请使用 platform.callConfiguredApi()

3. 资源文件过大
   → assets/video.mp4 (15 MB) 超过限制 (10 MB)
```

## 六、数据存储

### 6.1 后端字段（最小改动）

```typescript
// 复用现有字段
{
  elementJsDemo: string;      // 改为存 ZIP 的 OSS URL
  elementConfigDemo: string;  // 改为存 component.json 内容
  elementCssDemo: string;     // 改为存构建后的 CSS URL（如果有）
  
  // 新增字段（可选，用于区分协议）
  elementType?: 'v1-triple' | 'v2-zip';  // 可选
}
```

**向后兼容：**
- 旧数据不变
- 新上传的 ZIP 包，`elementJsDemo` 存 ZIP URL
- 加载时先判断是 URL 还是代码内容

### 6.2 加载逻辑

```typescript
async function loadCustomElement(elementInfo) {
  const { elementJsDemo, elementConfigDemo } = elementInfo;
  
  // 判断是 v1 还是 v2
  if (elementJsDemo.startsWith('http')) {
    // v2: ZIP 包
    const zipBlob = await fetch(elementJsDemo).then(r => r.blob());
    return await buildFromZip(zipBlob);
  } else {
    // v1: 旧三文件方式
    return await buildFromTripleFiles(elementInfo);
  }
}
```

## 七、完整示例

### 示例 1：简单展示组件

```
simple-card.zip
├── component.json
└── index.tsx
```

**component.json：**
```json
{
  "name": "simple-card",
  "title": "简单卡片",
  "entry": "index.tsx",
  "props": {
    "title": { "type": "string", "label": "标题", "default": "标题" },
    "content": { "type": "string", "label": "内容" }
  }
}
```

**index.tsx：**
```tsx
import React from 'react';
import { Card } from 'antd';

export default function SimpleCard({ title, content }) {
  return <Card title={title}>{content}</Card>;
}
```

### 示例 2：复杂业务组件

```
customer-form.zip
├── component.json
├── index.tsx
├── types.ts
├── hooks/
│   └── useCustomerData.ts
├── components/
│   ├── CustomerInfo.tsx
│   └── ContactInfo.tsx
├── styles/
│   ├── index.less
│   └── form.less
└── assets/
    └── default-avatar.png
```

**component.json：**
```json
{
  "name": "customer-form",
  "title": "客户表单",
  "entry": "index.tsx",
  "props": {
    "mode": {
      "type": "string",
      "label": "模式",
      "default": "edit",
      "options": [
        { "label": "编辑", "value": "edit" },
        { "label": "查看", "value": "view" }
      ]
    }
  },
  "events": [
    { "name": "onSubmit", "label": "提交事件" },
    { "name": "onCancel", "label": "取消事件" }
  ],
  "methods": [
    { "name": "submit", "label": "提交表单" },
    { "name": "reset", "label": "重置表单" }
  ],
  "dependencies": ["react", "antd", "dayjs"]
}
```

**index.tsx：**
```tsx
import React, { forwardRef, useImperativeHandle } from 'react';
import { Form, Button, message } from 'antd';
import { usePlatform } from '@ngap/runtime';
import { useCustomerData } from './hooks/useCustomerData';
import CustomerInfo from './components/CustomerInfo';
import ContactInfo from './components/ContactInfo';
import './styles/index.less';

interface CustomerFormProps {
  mode?: 'edit' | 'view';
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

const CustomerForm = forwardRef<any, CustomerFormProps>(
  function CustomerForm({ mode = 'edit', onSubmit, onCancel }, ref) {
    const [form] = Form.useForm();
    const platform = usePlatform();
    const { data, loading } = useCustomerData();
    
    useImperativeHandle(ref, () => ({
      submit: () => form.submit(),
      reset: () => form.resetFields()
    }));
    
    const handleFinish = async (values: any) => {
      try {
        await platform.callConfiguredApi(values);
        message.success('保存成功');
        onSubmit?.(values);
      } catch (error) {
        message.error('保存失败');
      }
    };
    
    return (
      <Form
        form={form}
        className="customer-form"
        onFinish={handleFinish}
        initialValues={data}
      >
        <CustomerInfo mode={mode} />
        <ContactInfo mode={mode} />
        
        {mode === 'edit' && (
          <div className="form-actions">
            <Button type="primary" htmlType="submit">提交</Button>
            <Button onClick={onCancel}>取消</Button>
          </div>
        )}
      </Form>
    );
  }
);

export default CustomerForm;
```

## 八、实施计划

### 阶段 1：核心能力（2 周）
- ✅ ZIP 解包和安全检查
- ✅ component.json 解析和校验
- ✅ esbuild-wasm 集成和构建
- ✅ 依赖白名单和 external 处理
- ✅ 组件注册中心

### 阶段 2：平台集成（2 周）
- ✅ usePlatform API 实现
- ✅ NgapRender 注入 platform context
- ✅ component.json 转 Schema
- ✅ 属性面板兼容
- ✅ 事件和方法注册

### 阶段 3：上传界面（1 周）
- ✅ ZIP 上传和文件树展示
- ✅ 自动分析和配置生成
- ✅ 预览和测试
- ✅ 保存和发布

### 阶段 4：独立运行时（1 周）
- ✅ materials/index.tsx 同步支持
- ✅ page 运行时同步
- ✅ 双运行时测试

### 总计：6 周（1.5 人月）

## 九、风险和限制

### 当前限制

**技术限制：**
- esbuild-wasm 首次加载约 8MB（可按需加载）
- 浏览器构建速度比服务端慢（但够用）
- 不支持 node 内置模块

**功能限制：**
- 首期只支持白名单依赖
- 不支持自定义 npm 包安装
- 不支持动态 import

### 未来扩展

**短期（3 个月内）：**
- 服务端构建（更快、更稳定）
- 更多白名单依赖
- CSS Modules 支持

**中期（6 个月内）：**
- TypeScript 类型检查
- 自动 Props 推导（从 TS interface）
- 组件库模板

**长期（1 年内）：**
- 组件市场
- 版本管理和升级
- 协同开发

## 十、开发者体验

### 本地开发

**推荐工作流：**

```bash
# 1. 使用脚手架创建组件
npx @ngap/create-component my-component

# 2. 本地开发和预览
cd my-component
npm install
npm run dev

# 3. 打包
npm run build
# 生成 dist/my-component.zip

# 4. 上传到平台测试
```

**脚手架生成的目录：**
```
my-component/
├── component.json
├── index.tsx
├── types.ts
├── styles.less
├── package.json
├── tsconfig.json
└── README.md
```

### 调试支持

**浏览器调试：**
- Source map 支持
- 在 DevTools 中可以看到原始 TS/TSX 代码
- 可以打断点调试

**错误提示：**
- 编译错误：显示文件名、行号、错误信息
- 运行时错误：显示组件调用栈
- Props 类型错误：显示期望类型和实际类型

## 十一、总结

### 核心优势

**用户体验：**
- ✅ 一个 ZIP 包上传，简单直观
- ✅ 支持多模块、样式、资源
- ✅ 正常的 React 开发体验

**技术实现：**
- ✅ 基于现有项目，改动最小
- ✅ 浏览器端构建，不依赖后端
- ✅ 兼容现有属性面板和事件系统
- ✅ 主项目和 page 运行时统一

**开发成本：**
- ✅ 6 周可完成（1.5 人月）
- ✅ 不需要后端大改
- ✅ 不需要新增数据库字段（可选）

### 与理想方案的差距

**暂时牺牲的：**
- 服务端构建和签名（首期用浏览器构建）
- Props 自动推导（首期手写 component.json）
- 复杂的权限和沙箱（首期可信上传）

**获得的：**
- 快速落地，立即可用
- 低成本，低风险
- 后续可平滑升级

---

**这是一个务实的、可快速落地的方案，基于现有项目能力，用最小改动实现最大价值。**
