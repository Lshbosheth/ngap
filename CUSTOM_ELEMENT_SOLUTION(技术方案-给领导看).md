# 自定义元素 ZIP 包上传技术方案

> 解决当前三文件上传的局限性，支持复杂组件开发

## 一、当前问题

### 1.1 用户痛点

**现有上传方式：**
- 需要分别上传三个文件：TSX、Schema TS/JS、Less
- 无法拆分多个模块文件
- 无法包含静态资源（图片、字体等）
- 复杂组件无法实现

**实际案例：**
```tsx
// 现在只能写单文件，不能这样：
import { formatCustomerInfo } from './utils';  // ❌ 不支持
import './styles.less';                         // ❌ 不支持  
import logo from './logo.png';                  // ❌ 不支持

export default function CustomerCard({ config }) {
  // 只能把所有逻辑写在一个文件里
  return <div>{config.props.title}</div>;
}
```

### 1.2 技术限制

**当前实现（src/packages/index.tsx）：**
```javascript
// 使用 @babel/standalone 只能编译单文件
const transformedCode = Babel.transform(tsxCode, {
  presets: ['react', 'typescript']
}).code;

// 创建 Blob URL 并动态导入
const blob = new Blob([transformedCode], { type: 'application/javascript' });
const url = URL.createObjectURL(blob);
const module = await import(url);
```

**存在问题：**
- Babel 只转换单文件，不处理模块依赖
- 不支持 `import './utils'` 这种相对路径
- Less 必须单独上传，不能在组件中 import
- 依赖只能用全局 `window.React`、`window.antd`

### 1.3 影响范围

**对开发者：**
- 复杂组件无法拆分，维护困难
- 无法使用图片等静态资源
- 开发体验差，不符合 React 开发习惯

**对平台：**
- 自定义元素能力受限
- 用户满意度低
- 与主流低代码平台差距大

## 二、目标方案

### 2.1 用户体验

**一个 ZIP 包包含完整组件：**
```
customer-card.zip
├── component.json          # 组件配置（JSON 格式）
├── index.tsx              # 组件入口
├── types.ts               # 类型定义（可选）
├── utils.ts               # 工具函数（可选）
├── styles.less            # 样式
└── assets/
    └── logo.png           # 静态资源
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
      <img src={logo} alt="logo" />
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
- ✅ 支持白名单依赖（react、antd、dayjs 等）
- ✅ 兼容现有属性面板和事件系统
- ✅ 主项目和独立运行时（page）一致

**技术选型：**
- 使用 **esbuild-wasm** 在浏览器打包（替代 Babel）
- 使用 **component.json** 纯 JSON 配置（替代 Schema TS）
- 使用 **usePlatform Hook** 访问平台能力（封装内部实现）

## 三、技术方案

### 3.1 组件配置文件

**component.json（取代 Schema TS）：**

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

**优势：**
- 纯 JSON，不需要编译
- 结构清晰，易于维护
- 自动生成属性面板配置

### 3.2 构建方案

**选用 esbuild-wasm：**

| 特性 | Babel | esbuild-wasm |
|---|---|---|
| 速度 | 慢 | 快 10-100 倍 |
| 模块打包 | ❌ | ✅ |
| TypeScript | 需插件 | 原生支持 |
| 样式处理 | ❌ | 通过插件 |
| 资源处理 | ❌ | 通过插件 |
| 体积 | 小 | 8MB（按需加载） |
| 浏览器运行 | ✅ | ✅ |

**构建流程：**

```typescript
import * as esbuild from 'esbuild-wasm';

// 1. 解包 ZIP
const files = await JSZip.loadAsync(zipBlob);

// 2. 读取 component.json
const config = JSON.parse(await files.file('component.json').async('text'));

// 3. 构建
const result = await esbuild.build({
  entryPoints: [config.entry],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  
  // 外部依赖（不打包，运行时注入）
  external: ['react', 'react-dom', 'antd', '@ant-design/icons', 'dayjs'],
  
  // 虚拟文件系统（从 ZIP 读取）
  plugins: [
    virtualFileSystemPlugin(files),
    lessPlugin(),
    assetPlugin()
  ],
  
  write: false
});

// 4. 生成 Blob URL
const code = result.outputFiles[0].text;
const blob = new Blob([code], { type: 'application/javascript' });
const blobUrl = URL.createObjectURL(blob);

// 5. 动态导入
const module = await import(blobUrl);
const Component = module.default;
```

### 3.3 平台能力访问

**封装内部实现，提供统一接口：**

```tsx
import { usePlatform } from '@ngap/runtime';

export default function MyComponent({ title }) {
  const platform = usePlatform();
  
  // 访问页面变量
  const customerId = platform.getVariable('customerId');
  platform.setVariable('status', 'loaded');
  
  // 调用接口（复用属性面板配置的接口）
  const loadData = async () => {
    const data = await platform.callConfiguredApi({ id: customerId });
    return data;
  };
  
  // 显示消息
  const handleSuccess = () => {
    platform.message.success('操作成功');
  };
  
  // 确认框
  const handleDelete = async () => {
    const ok = await platform.confirm({
      title: '确认删除？',
      content: '删除后无法恢复'
    });
    if (ok) {
      // 执行删除
    }
  };
  
  return <div>{title}</div>;
}
```

**usePlatform 实现：**

```typescript
// src/custom-elements/platform-api.ts
import { usePageStore } from '@/stores/canvasPageStore';

export function usePlatform(): PlatformAPI {
  const pageStore = usePageStore();
  
  return {
    // 变量
    getVariable: (name) => pageStore.getVariable(name),
    setVariable: (name, value) => pageStore.setVariable(name, value),
    
    // 接口（复用现有 handleApi）
    callConfiguredApi: async (params) => {
      return handleApi(element.config.api, params);
    },
    
    // UI
    message: {
      success: (msg) => message.success(msg),
      error: (msg) => message.error(msg),
      warning: (msg) => message.warning(msg)
    },
    
    confirm: (options) => {
      return new Promise((resolve) => {
        Modal.confirm({
          ...options,
          onOk: () => resolve(true),
          onCancel: () => resolve(false)
        });
      });
    },
    
    // 上下文
    context: {
      pageId: pageStore.pageId,
      appId: pageStore.appId,
      instanceId: element.id
    }
  };
}
```

### 3.4 兼容现有系统

**自动转换成现有 Schema 格式：**

```typescript
function componentJsonToSchema(config: ComponentJson) {
  return {
    // 自动生成 attrs
    attrs: Object.entries(config.props).map(([name, prop]) => ({
      type: getEditorType(prop.type),  // string→Input, boolean→Switch
      label: prop.label || name,
      name: name
    })),
    
    // 生成默认配置
    config: {
      props: Object.entries(config.props).reduce((acc, [name, prop]) => {
        acc[name] = prop.default;
        return acc;
      }, {}),
      style: {},
      api: {}
    },
    
    events: config.events || [],
    methods: config.methods || []
  };
}
```

**组件 Props 保持兼容：**

```tsx
// 新组件推荐扁平接收（简洁）
export default function MyComponent({ title, date, onConfirm }) {
  return <div>{title}</div>;
}

// 也兼容旧方式
export default function MyComponent({ config }) {
  const { title, date } = config.props;
  return <div>{title}</div>;
}
```

### 3.5 依赖白名单

**允许的外部依赖：**

```javascript
// 组件中可以直接 import
import React, { useState, useEffect } from 'react';
import { Button, Form, Input, message } from 'antd';
import * as Icons from '@ant-design/icons';
import dayjs from 'dayjs';
```

**处理机制：**
- 构建时标记为 external（不打包进组件）
- 运行时注入全局引用

```javascript
// 组件源码
import { Button } from 'antd';

// 构建转换后
const { Button } = window.__NGAP_EXTERNALS__.antd;
```

**禁止的：**
- Node 内置模块（fs、path 等）
- 未在白名单的 npm 包
- 动态 import
- require

## 四、关键实现

### 4.1 目录结构

**新增文件：**
```
src/custom-elements/
├── zip-reader.ts          # ZIP 解包和安全检查
├── component-builder.ts   # esbuild-wasm 构建
├── component-registry.ts  # 组件注册中心
├── platform-api.ts        # usePlatform 实现
└── types.ts               # 类型定义
```

**修改文件：**
```
src/packages/index.tsx                    # 集成新加载器
src/packages/NgapRender/NgapRender.tsx    # 注入 platform API
src/pages/elementManagement/index.tsx     # 新增 ZIP 上传
materials/index.tsx                       # 同步支持 ZIP 加载
```

### 4.2 核心代码

**ZIP 解包和构建：**

```typescript
// src/custom-elements/component-builder.ts
import * as JSZip from 'jszip';
import * as esbuild from 'esbuild-wasm';

export async function buildFromZip(zipBlob: Blob) {
  // 1. 解包
  const zip = await JSZip.loadAsync(zipBlob);
  
  // 2. 安全检查
  validateZipSafety(zip);
  
  // 3. 读取配置
  const configText = await zip.file('component.json').async('text');
  const config = JSON.parse(configText);
  
  // 4. 构建模块
  const result = await esbuild.build({
    entryPoints: [config.entry],
    bundle: true,
    format: 'esm',
    external: config.dependencies || [],
    plugins: [
      createVirtualFSPlugin(zip),
      createLessPlugin(),
      createAssetPlugin()
    ],
    write: false
  });
  
  // 5. 生成组件
  const code = result.outputFiles[0].text;
  const blob = new Blob([code], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  
  const module = await import(url);
  
  return {
    component: module.default,
    schema: componentJsonToSchema(config),
    config: config,
    blobUrl: url
  };
}
```

**虚拟文件系统插件：**

```typescript
function createVirtualFSPlugin(zip: JSZip): esbuild.Plugin {
  return {
    name: 'virtual-fs',
    setup(build) {
      build.onResolve({ filter: /.*/ }, (args) => {
        if (args.kind === 'entry-point') {
          return { path: args.path, namespace: 'zip' };
        }
        
        // 解析相对路径
        const resolved = resolvePath(args.importer, args.path);
        return { path: resolved, namespace: 'zip' };
      });
      
      build.onLoad({ filter: /.*/, namespace: 'zip' }, async (args) => {
        const file = zip.file(args.path);
        if (!file) {
          return { errors: [{ text: `文件不存在: ${args.path}` }] };
        }
        
        const contents = await file.async('text');
        const ext = args.path.split('.').pop();
        
        return {
          contents,
          loader: getLoader(ext)
        };
      });
    }
  };
}
```

**注入到 NgapRender：**

```tsx
// src/packages/NgapRender/NgapRender.tsx
import { PlatformContext, createPlatformAPI } from '@/custom-elements/platform-api';

function Material({ item, ...props }) {
  const Component = getComponent(item.type);
  const platformAPI = createPlatformAPI(item);
  
  // 扁平化 Props
  const componentProps = {
    ...item.config.props,
    id: item.id,
    type: item.type,
    config: item.config,
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

### 4.3 后端对接

**最小改动方案（复用现有字段）：**

```typescript
// 保存时
{
  elementJsDemo: zipOssUrl,           // 存 ZIP 的 OSS URL
  elementConfigDemo: componentJsonStr, // 存 component.json 内容
  elementCssDemo: builtCssUrl || ''    // 存构建后的 CSS URL（如有）
}

// 加载时判断
async function loadElement(elementInfo) {
  const { elementJsDemo } = elementInfo;
  
  if (elementJsDemo.startsWith('http')) {
    // v2: ZIP 包
    const zipBlob = await fetch(elementJsDemo).then(r => r.blob());
    return await buildFromZip(zipBlob);
  } else {
    // v1: 旧三文件
    return await buildFromTripleFiles(elementInfo);
  }
}
```

**可选新增字段（更清晰）：**

```typescript
{
  elementType: 'v1-triple' | 'v2-zip',  // 明确区分
  elementZipUrl: string,                 // ZIP URL
  elementManifest: string                // component.json
}
```

## 五、完整示例

### 5.1 简单组件

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
    "title": { "type": "string", "label": "标题" },
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

### 5.2 复杂组件

```
customer-form.zip
├── component.json
├── index.tsx
├── types.ts
├── hooks/
│   └── useForm.ts
├── components/
│   ├── CustomerInfo.tsx
│   └── ContactInfo.tsx
├── styles/
│   └── index.less
└── assets/
    └── avatar.png
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
    { "name": "onSubmit", "label": "提交" },
    { "name": "onCancel", "label": "取消" }
  ],
  "methods": [
    { "name": "submit", "label": "提交表单" },
    { "name": "reset", "label": "重置" }
  ],
  "dependencies": ["react", "antd", "dayjs"]
}
```

**index.tsx：**
```tsx
import React, { forwardRef, useImperativeHandle } from 'react';
import { Form, Button } from 'antd';
import { usePlatform } from '@ngap/runtime';
import CustomerInfo from './components/CustomerInfo';
import ContactInfo from './components/ContactInfo';
import './styles/index.less';

const CustomerForm = forwardRef((props, ref) => {
  const { mode, onSubmit, onCancel } = props;
  const [form] = Form.useForm();
  const platform = usePlatform();
  
  useImperativeHandle(ref, () => ({
    submit: () => form.submit(),
    reset: () => form.resetFields()
  }));
  
  const handleFinish = async (values) => {
    try {
      await platform.callConfiguredApi(values);
      platform.message.success('保存成功');
      onSubmit?.(values);
    } catch (error) {
      platform.message.error('保存失败');
    }
  };
  
  return (
    <Form form={form} onFinish={handleFinish}>
      <CustomerInfo mode={mode} />
      <ContactInfo mode={mode} />
      {mode === 'edit' && (
        <div>
          <Button type="primary" htmlType="submit">提交</Button>
          <Button onClick={onCancel}>取消</Button>
        </div>
      )}
    </Form>
  );
});

export default CustomerForm;
```

## 六、风险评估

### 6.1 技术风险

| 风险 | 影响 | 缓解措施 |
|---|---|---|
| esbuild-wasm 体积较大（8MB） | 首次加载慢 | 按需加载、CDN 缓存 |
| 浏览器构建性能 | 复杂组件构建慢 | 构建缓存、限制包大小 |
| 兼容性问题 | 部分浏览器不支持 | Chrome 80+ 即可，覆盖率高 |

### 6.2 业务风险

| 风险 | 影响 | 缓解措施 |
|---|---|---|
| 用户学习成本 | 迁移阻力 | 提供模板和文档 |
| 旧组件兼容 | 影响存量用户 | v1 继续支持 |
| 安全风险 | 恶意代码上传 | 限制上传角色、人工审核 |

### 6.3 运维风险

| 风险 | 影响 | 缓解措施 |
|---|---|---|
| Blob URL 管理 | 内存泄漏 | 统一回收机制 |
| 依赖版本冲突 | 组件异常 | 锁定白名单版本 |
| 调试困难 | 开发效率低 | Source map 支持 |

## 七、对比分析

### 7.1 与当前方案对比

| 特性 | 当前三文件 | ZIP 包方案 |
|---|---|---|
| 上传方式 | 分三次上传 | 一次上传 |
| 多模块支持 | ❌ | ✅ |
| 样式 import | ❌ | ✅ |
| 静态资源 | ❌ | ✅ |
| 开发体验 | 差 | 好 |
| 技术复杂度 | 低 | 中 |
| 维护成本 | 低 | 中 |

### 7.2 与其他方案对比

| 方案 | 优势 | 劣势 | 结论 |
|---|---|---|---|
| 继续三文件 | 简单稳定 | 能力受限 | ❌ 不推荐 |
| ZIP + 浏览器构建 | 快速落地 | 性能稍差 | ✅ **推荐** |
| ZIP + 服务端构建 | 性能最优 | 依赖后端 | ⚠️ 二期考虑 |
| 远程组件（URL） | 最灵活 | 安全风险高 | ❌ 不适合 |

## 八、建议

### 8.1 技术建议

**立即可做：**
1. ✅ 使用 ZIP + component.json + esbuild-wasm 方案
2. ✅ 复用现有后端字段，最小改动
3. ✅ 保持 v1 三文件兼容

**二期优化：**
4. ⚠️ 考虑服务端构建（性能更好）
5. ⚠️ 支持更多白名单依赖
6. ⚠️ 提供组件开发脚手架

### 8.2 实施建议

**核心原则：**
- 快速验证，小步迭代
- 保持兼容，平滑过渡
- 用户优先，体验至上

**关键里程碑：**
1. 完成核心构建能力（ZIP 解包 + esbuild 打包）
2. 集成到现有系统（NgapRender + 属性面板）
3. 上线 ZIP 上传界面
4. 同步独立运行时（page/materials）

**成功标准：**
- 用户能上传 ZIP 包并正常使用
- 复杂组件能正常开发和运行
- 旧组件不受影响
- 主项目和 page 运行时行为一致

---

**总结：该方案技术可行、风险可控，建议采纳实施。**
