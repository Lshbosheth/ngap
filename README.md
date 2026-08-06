# Vite + React + TypeScript + Antd

# 框架项目使用说明

## 启动说明

- [x] 安装node 18.0.0以上版本 https://nodejs.org/download/release/
- [x] 本地GIT工具安装 https://git-scm.com/install/
- [x] 拉取远程代码 git clone http://git账号:token码@192.168.26.150:8888/ngap/ngap.git
- [x] 首次执行需要更改镜像地址 npm config set registry http://192.168.21.14:20899
- [x] 在项目跟目录执行pnpm install （推荐） or npm install 安装所需依赖
- [x] 在当前目录执行npm run start 启动服务
- [x] 访问 http://127.0.0.1:8080/ngap/ or http://127.0.0.1:8080/ngap/index.html#/
- [x] 打包命令 npm run build 
- [x] 框架配置 vite.config.ts

## 目录结构

	root-------------------------------------项目根目录
	| src------------------------------------应用开发根目录
	| dist-----------------------------------应用打包输出
	| node_modules---------------------------第三方插件包
	| package.json---------------------------构建工具
	| public---------------------------------静态资源文件
	| scripts--------------------------------Linux 环境适配
	| .editorconfig--------------------------本地IDEA格式
	| .env.development-----------------------本地全局属性
	| .env.production------------------------测试环境全局属性
	| .eslintrc.js---------------------------语法校验
	| .gitignore-----------------------------git代码提交过滤
	| npmrc----------------------------------npm扩展增强
	| .prettierignore------------------------代码格式化禁用
	| .prettierrc----------------------------代码格式化
	| index.html-----------------------------主页面
	| package-lock.json----------------------npm工具包记录
	| pnpm-lock.yaml-------------------------pnpm工具包记录
	| tsconfig.json--------------------------TypeScript编译的入口
	| tsconfig.node.json---------------------Node环境
	| vite.config.ts-------------------------构建器


## 分支

git checkout dev-react-ts

git merge dev-react-ts


## 在线资料

前端UI资源库地址： https://ant.design/components/overview-cn/
