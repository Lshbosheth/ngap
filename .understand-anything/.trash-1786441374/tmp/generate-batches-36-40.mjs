import fs from 'node:fs';
import path from 'node:path';

const projectRoot = 'C:/Users/EDY/Desktop/ngap';
const uaRoot = path.join(projectRoot, '.understand-anything');
const batchesDoc = JSON.parse(fs.readFileSync(path.join(uaRoot, 'intermediate', 'batches.json'), 'utf8'));

const specialSummaries = {
  'materials/vite-env.d.ts': '引入 Vite 客户端类型声明，使 materials 物料代码可识别环境变量和静态资源模块。',
  'page/src/App.less': '定义独立 page 应用外壳、浏览器兼容提示、加载状态和页面容器的整体样式。',
  'page/src/App.tsx': '实现独立 page 应用根组件，初始化平台全局对象、监控和运行环境，并挂载页面运行时。',
  'page/src/index.less': '提供独立 page 运行时的基础样式重置和根节点尺寸规则。',
  'page/src/main.tsx': '作为独立 page 前端入口，把 React、ReactDOM、Ant Design 等公共库挂载到全局后启动根应用，并提供清理能力。',
  'page/src/page/index.module.less': '定义独立 page 页面渲染区、模板导航、错误提示和加载骨架的局部样式。',
  'page/src/styles/global-vars.less': '集中声明独立 page 样式使用的全局 Less 变量，包括主题色和布局尺寸。',
  'page/src/typings.d.ts': '声明 CSS、Less、图片、SVG 和若干第三方模块，并扩展 Window 动态属性类型。',
  'page/src/utils/AntdGlobal.tsx': '从 materials 运行时重新导出 Ant Design 全局适配组件，保持独立 page 与主物料运行时实现一致。',
  'page/src/utils/dataToCanvas.worker.ts': '在 Web Worker 中递归转换发布页面数据并补齐元素标识，避免大型页面数据处理阻塞主线程。',
  'page/src/utils/loading/index.tsx': '提供独立 page 的全局加载遮罩控制函数，动态创建和移除加载节点。',
  'page/src/utils/loading/loading.less': '定义独立 page 全局加载遮罩和旋转指示器样式。',
  'page/src/utils/storage.ts': '封装浏览器本地与会话存储读写，统一处理序列化、过期信息和异常情况。',
  'page/src/vite-env.d.ts': '引入 Vite 客户端类型声明，使独立 page 工程识别环境变量与资源导入。',
  'page/vite.config.ts': '配置独立 page 运行时的 Vite 构建、路径别名、开发代理、代码分包和预加载提示生成策略。',
  'postcss.config.js': '配置 PostCSS 面向 Chrome 80 以上执行语法兼容转换、CSS 变量保留和自动浏览器前缀。',
  'public/static/index.browser.js': '提供预构建的浏览器监控 SDK，采集页面性能、组件渲染、点击和异常信息并上报平台日志服务。',
  'public/static/monaco-editor/vs/base/worker/workerMain.js': '提供 Monaco Editor 主版本的通用 Web Worker 启动脚本，加载并初始化具体语言工作模块。',
  'public/static/monaco-editor/vs1/base/worker/workerMain.js': '提供备用 vs1 静态目录的 Monaco Web Worker 启动脚本，用于加载对应版本的语言工作模块。',
  'public/static/monaco-editor/vs/editor/editor.main.css': '包含 Monaco Editor 核心界面、光标、选择区、提示面板和小部件的预构建样式。',
  'public/static/monaco-editor/vs/editor/editor.main.js': '提供 Monaco Editor 0.33.0 的核心浏览器运行时，包含编辑模型、命令、视图、语言接口和工作线程集成。',
  'public/static/monaco-editor/vs/loader.js': '提供 Monaco Editor 使用的 AMD 模块加载器，负责静态模块解析、依赖加载和运行时初始化。',
  'public/static/monaco-editor/vs/language/css/cssMode.js': '加载 Monaco 的 CSS 语言模式，注册 CSS、Less 和 SCSS 的补全、校验、格式化等语言能力。',
  'public/static/monaco-editor/vs/language/css/cssWorker.js': '提供 Monaco CSS 语言工作线程，实现 CSS、Less 和 SCSS 的解析、诊断、补全、悬停和格式化。',
  'public/static/monaco-editor/vs/language/html/htmlMode.js': '加载 Monaco 的 HTML 语言模式，注册 HTML、Handlebars 和 Razor 的语言服务适配器。',
  'public/static/monaco-editor/vs/language/html/htmlWorker.js': '提供 Monaco HTML 语言工作线程，实现标记解析、诊断、补全、链接、悬停和格式化。',
  'public/static/monaco-editor/vs/language/json/jsonMode.js': '加载 Monaco 的 JSON 语言模式，注册 JSON 诊断、补全、悬停、符号和格式化能力。',
  'public/static/monaco-editor/vs/language/json/jsonWorker.js': '提供 Monaco JSON 语言工作线程，基于 JSON Schema 执行校验、补全、悬停和格式化。',
  'public/static/monaco-editor/vs/language/typescript/tsMode.js': '加载 Monaco 的 JavaScript 与 TypeScript 语言模式，配置编译选项并注册语言服务适配器。',
  'public/static/monaco-editor/vs/language/typescript/tsWorker.js': '提供预构建的 TypeScript 语言服务工作线程，内含编译器与语言服务以支持诊断、补全、导航和格式化。'
};

const languageNames = {
  abap:'ABAP', apex:'Apex', azcli:'Azure CLI', bat:'Windows Batch', bicep:'Bicep', cameligo:'CameLIGO', clojure:'Clojure',
  coffee:'CoffeeScript', cpp:'C++', csharp:'C#', csp:'CSP', css:'CSS', dart:'Dart', dockerfile:'Dockerfile', ecl:'ECL', elixir:'Elixir',
  flow9:'Flow9', freemarker2:'FreeMarker', fsharp:'F#', go:'Go', graphql:'GraphQL', handlebars:'Handlebars', hcl:'HCL', html:'HTML', ini:'INI',
  java:'Java', javascript:'JavaScript', julia:'Julia', kotlin:'Kotlin', less:'Less', lexon:'Lexon', liquid:'Liquid', lua:'Lua', m3:'Modula-3',
  markdown:'Markdown', mips:'MIPS', msdax:'DAX', mysql:'MySQL', 'objective-c':'Objective-C', pascal:'Pascal', pascaligo:'PascaLIGO',
  perl:'Perl', pgsql:'PostgreSQL', php:'PHP', pla:'PLA', postiats:'ATS', powerquery:'Power Query', powershell:'PowerShell', protobuf:'Protocol Buffers',
  pug:'Pug', python:'Python', qsharp:'Q#', r:'R', razor:'Razor', redis:'Redis', redshift:'Amazon Redshift SQL',
  restructuredtext:'reStructuredText', ruby:'Ruby', rust:'Rust', sb:'Small Basic', scala:'Scala', scheme:'Scheme', scss:'SCSS', shell:'Shell',
  solidity:'Solidity', sophia:'Sophia', sparql:'SPARQL', sql:'SQL', st:'Structured Text', swift:'Swift', systemverilog:'SystemVerilog',
  tcl:'Tcl', twig:'Twig', typescript:'TypeScript', vb:'Visual Basic', xml:'XML', yaml:'YAML'
};

const localeNames = {
  de:'德语', es:'西班牙语', fr:'法语', it:'意大利语', ja:'日语', ko:'韩语', ru:'俄语', 'zh-cn':'简体中文', 'zh-tw':'繁体中文'
};

const functionSummaries = {
  App: '初始化独立 page 应用的全局依赖与监控环境，并渲染页面运行时或兼容性提示。',
  mountGlobalLibraries: '把 React、ReactDOM、Ant Design 等共享库挂载到 window，供动态物料运行时访问。',
  clearGlobalLibraries: '移除独立 page 启动时挂载的全局共享库，释放页面级运行环境。',
  dealDataId: '递归补齐画布元素标识，保证 Worker 转换后的组件可被运行时定位。',
  dealPageData: '在 Worker 中递归规范化页面和嵌套元素数据。',
  showLoading: '创建并显示独立 page 的全局加载遮罩。',
  hideLoading: '移除独立 page 的全局加载遮罩。',
  splitChunk: '按照第三方依赖、业务模块和页面运行时代码生成稳定的 Vite 分包名称。',
  preloadHintsPlugin: '在构建产物中生成关键脚本和样式的预加载提示，改善独立 page 首屏加载。'
};

function languageSummary(filePath) {
  const match = /public\/static\/monaco-editor\/(vs1|vs)\/basic-languages\/([^/]+)\/[^/]+\.js$/.exec(filePath);
  if (!match) return undefined;
  const [, variant, key] = match;
  const name = languageNames[key] || key;
  const prefix = variant === 'vs1' ? '备用 vs1 静态目录中' : '';
  return `${prefix}预构建的 Monaco Editor ${name} 语言定义，注册注释、括号、自动闭合、关键字和 Monarch 语法着色规则。`;
}

function localeSummary(filePath) {
  const match = /editor\.main\.nls(?:\.([^.]+(?:-[^.]+)?))?\.js$/.exec(filePath);
  if (!match) return undefined;
  const locale = match[1];
  const name = locale ? (localeNames[locale] || locale) : '默认英文';
  return `提供 Monaco Editor 核心界面的${name}本地化文本，覆盖编辑器命令、提示、辅助功能和配置说明。`;
}

function summary(filePath) {
  return specialSummaries[filePath] || languageSummary(filePath) || localeSummary(filePath);
}

function complexity(result) {
  const filePath = result.path;
  if (filePath.endsWith('/tsWorker.js') || filePath.endsWith('/editor.main.js') || filePath.endsWith('/htmlWorker.js')) return 'complex';
  if (filePath.includes('/basic-languages/')) return 'moderate';
  if (filePath.includes('editor.main.nls')) return 'moderate';
  const lines = result.nonEmptyLines ?? result.totalLines ?? 0;
  if (lines < 50) return 'simple';
  if (lines <= 200) return 'moderate';
  return 'complex';
}

function tags(filePath) {
  if (filePath.includes('/basic-languages/')) return ['monaco-editor', 'language-definition', 'static-asset'];
  if (filePath.includes('editor.main.nls')) return ['monaco-editor', 'localization', 'static-asset'];
  if (filePath.includes('/monaco-editor/')) {
    if (filePath.includes('/worker/')) return ['monaco-editor', 'web-worker', 'static-asset'];
    if (filePath.includes('/language/')) return ['monaco-editor', 'language-service', 'web-worker'];
    return ['monaco-editor', 'editor-runtime', 'static-asset'];
  }
  if (filePath.endsWith('.d.ts')) return ['type-definition', 'typescript', 'build-system'];
  if (filePath.endsWith('.less') || filePath.endsWith('.css')) return ['stylesheet', 'page-runtime', 'user-interface'];
  if (filePath === 'page/vite.config.ts') return ['configuration', 'vite', 'build-system', 'code-splitting'];
  if (filePath === 'postcss.config.js') return ['configuration', 'postcss', 'css-compatibility'];
  if (filePath === 'public/static/index.browser.js') return ['monitoring', 'browser-sdk', 'static-asset'];
  if (filePath.includes('dataToCanvas.worker')) return ['web-worker', 'data-transformation', 'page-runtime'];
  if (filePath.includes('/loading/')) return ['utility', 'loading-state', 'page-runtime'];
  return ['react-component', 'page-runtime', 'entry-point'];
}

function functionTags(name, filePath) {
  if (filePath === 'page/vite.config.ts') return ['build-system', 'code-splitting', 'vite-plugin'];
  if (filePath.includes('.worker.')) return ['web-worker', 'data-transformation', 'utility'];
  if (name.includes('Loading')) return ['utility', 'loading-state', 'dom-manipulation'];
  if (name.includes('GlobalLibraries')) return ['utility', 'global-state', 'runtime-bootstrap'];
  return ['react-component', 'page-runtime', 'entry-point'];
}

function validate(fragment, allowedFiles, allowedSymbols) {
  const ids = new Set(fragment.nodes.map((node) => node.id));
  for (const edge of fragment.edges) {
    if (!ids.has(edge.source)) throw new Error(`Missing source ${edge.source}`);
    if (ids.has(edge.target)) continue;
    const fm = /^file:(.+)$/.exec(edge.target);
    const sm = /^(function|class):(.+):([^:]+)$/.exec(edge.target);
    if (fm && allowedFiles.has(fm[1])) continue;
    if (sm && allowedSymbols.has(`${sm[2]}:${sm[3]}`)) continue;
    throw new Error(`Invalid target ${edge.target}`);
  }
}

for (const batchIndex of [36,37,38,39,40]) {
  const batch = batchesDoc.batches.find((item) => item.batchIndex === batchIndex);
  const extraction = JSON.parse(fs.readFileSync(path.join(uaRoot,'tmp',`ua-file-extract-results-${batchIndex}.json`),'utf8'));
  if (!batch || !extraction.scriptCompleted || extraction.results.length !== batch.files.length) throw new Error(`Incomplete batch ${batchIndex}`);
  const byPath = new Map(extraction.results.map((result) => [result.path,result]));
  const nodes=[];
  const edges=[];
  const defsByFile=new Map();

  for (const file of batch.files) {
    const result=byPath.get(file.path);
    const fileSummary=summary(file.path);
    if (!result || !fileSummary) throw new Error(`Missing result/summary ${file.path}`);
    const node={id:`file:${file.path}`,type:'file',name:path.basename(file.path),filePath:file.path,summary:fileSummary,tags:tags(file.path),complexity:complexity(result)};
    if (file.path.includes('/basic-languages/')) node.languageNotes='这是 Monaco 预构建的 AMD/Monarch 静态资源；源码经过压缩，行数较少但包含完整语法词法规则。';
    if (file.path.endsWith('/tsWorker.js')) node.languageNotes='文件内嵌 TypeScript 编译器与语言服务的压缩构建，因此体积和算法复杂度显著高于普通业务模块。';
    nodes.push(node);
    const exports=new Set((result.exports||[]).map((item)=>item.name));
    const defs=new Map();
    for (const fn of result.functions||[]) {
      const lines=Number(fn.endLine)-Number(fn.startLine)+1;
      if (!fn.name||fn.name==='-'||(lines<10&&!exports.has(fn.name))) continue;
      const id=`function:${file.path}:${fn.name}`;
      nodes.push({id,type:'function',name:fn.name,filePath:file.path,lineRange:[Number(fn.startLine),Number(fn.endLine)],summary:functionSummaries[fn.name]||`${fileSummary.replace(/。$/,'')}；${fn.name} 承担其中的核心处理逻辑。`,tags:functionTags(fn.name,file.path),complexity:complexity({...result,nonEmptyLines:lines})});
      defs.set(fn.name,id);
      edges.push({source:`file:${file.path}`,target:id,type:'contains',direction:'forward',weight:1.0});
      if (exports.has(fn.name)) edges.push({source:`file:${file.path}`,target:id,type:'exports',direction:'forward',weight:0.8});
    }
    defsByFile.set(file.path,defs);
  }

  for (const file of batch.files) for (const target of batch.batchImportData[file.path]||[]) edges.push({source:`file:${file.path}`,target:`file:${target}`,type:'imports',direction:'forward',weight:0.7});
  const seen=new Set();
  for (const file of batch.files) {
    const result=byPath.get(file.path),defs=defsByFile.get(file.path),neighbors=batch.neighborMap[file.path]||[];
    for (const call of result.callGraph||[]) {
      const source=defs.get(call.caller);
      if (!source) continue;
      let target=defs.get(call.callee);
      if (!target) {const n=neighbors.find((item)=>(item.symbols||[]).includes(call.callee));if(n)target=`function:${n.path}:${call.callee}`;}
      const key=`${source}|${target}`;
      if(!target||target===source||seen.has(key))continue;
      seen.add(key);edges.push({source,target,type:'calls',direction:'forward',weight:0.8});
    }
  }
  const expected=batch.files.reduce((sum,file)=>sum+(batch.batchImportData[file.path]||[]).length,0);
  const actual=edges.filter((edge)=>edge.type==='imports').length;
  if(expected!==actual)throw new Error(`Import mismatch ${batchIndex}: ${actual}/${expected}`);
  const allowedFiles=new Set(batch.files.map((file)=>file.path)),allowedSymbols=new Set();
  for(const file of batch.files){for(const target of batch.batchImportData[file.path]||[])allowedFiles.add(target);for(const n of batch.neighborMap[file.path]||[]){allowedFiles.add(n.path);for(const symbol of n.symbols||[])allowedSymbols.add(`${n.path}:${symbol}`)}}
  const fragment={nodes,edges};
  validate(fragment,allowedFiles,allowedSymbols);
  if(nodes.length>60||edges.length>120)throw new Error(`Unexpected split required for batch ${batchIndex}`);
  fs.writeFileSync(path.join(uaRoot,'intermediate',`batch-${batchIndex}.json`),`${JSON.stringify(fragment,null,2)}\n`,'utf8');
  console.log(JSON.stringify({batchIndex,files:batch.files.length,nodes:nodes.length,edges:edges.length,imports:actual,parts:1}));
}
