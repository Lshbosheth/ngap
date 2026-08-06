# MapChart ECharts 按需加载说明

## 功能描述
MapChart组件已实现echarts的按需加载，避免首屏加载时加载echarts库，提高页面加载性能。

## 实现原理

### 1. MapChart.tsx 改动
- 移除了直接的`import * as echarts from 'echarts'`
- 实现了动态加载函数`loadEcharts()`
- 使用`echartsReady`状态确保echarts加载完成后才渲染图表

### 2. NgapRender.tsx 改动
- 添加了`preloadEcharts()`函数用于预加载echarts
- 在渲染组件前检查是否包含MapChart组件
- 如果包含MapChart，则预加载echarts资源

### 3. vite.config.ts 改动
- 配置`manualChunks`将echarts单独打包为一个chunk
- 在`optimizeDeps.exclude`中排除echarts，确保按需加载

## 验证步骤

### 1. 首屏加载测试
1. 打开浏览器开发者工具（F12）
2. 切换到 Network 标签页
3. 刷新页面（不包含MapChart组件的页面）
4. 观察网络请求，不应该看到echarts相关的js文件加载

### 2. 按需加载测试
1. 打开包含MapChart组件的页面
2. 打开浏览器开发者工具（F12）
3. 切换到 Network 标签页
4. 刷新页面
5. 应该能看到名为`echarts.[hash].js`的文件被加载

### 3. 性能对比
1. 对比首页加载时间（不包含MapChart）
2. 对比包含MapChart的页面加载时间
3. 首页加载应该更快，因为不会加载echarts

## 技术细节

### 动态导入实现
```typescript
let echartsInstance: any = null;
const loadEcharts = async () => {
    if (!echartsInstance) {
        echartsInstance = await import('echarts');
    }
    return echartsInstance;
};
```

### 预加载触发条件
- 当`item.type === 'MapChart'`时触发预加载
- 通过递归检查所有子组件是否包含MapChart

### 打包配置
```typescript
manualChunks: (id) => {
    if (id.includes('echarts')) {
        return 'echarts';
    }
    // 其他chunk配置...
}
```

## 注意事项
1. echarts只会在首次使用时加载一次，之后会缓存
2. 多个MapChart组件共享同一个echarts实例
3. 如果页面包含其他echarts图表组件，也会触发echarts加载
4. 确保网络环境可以正常加载动态导入的资源

## 扩展性
如需添加其他需要echarts的图表组件：
1. 在`containsEchartComponents`函数中添加新的组件类型判断
2. 在Material组件的useEffect中添加预加载逻辑
3. 确保新组件也使用动态导入方式加载echarts
