# antrouter

> A Vue.js project

## Build Setup

```bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# main 主分支、测试打包分支;
# SDEP-II 为二期劳务分支;
# v2.0.20220722为设计变更、技术交底和施工日志二期、质量管理、安全管理分支;
# v2.0.20220815为物资管理分支;
# v2.0.20221008为系统功能优化，自定位配置开发分支;
# v2.0.20230206为OA管理分支;
# v2.0.20230224为短信管理分支;

# 可能出现的问题
# 1、chromedriver问题报错
# 1)如果执行过npm install，先删除 node_modules 文件夹，不然运行的时候可能会报错
# 2)执行下面的命令
# npm install chromedriver --chromedriver_cdnurl=http://cdn.npm.taobao.org/dist/chromedriver
# 3)再执行 npm install 即可正常下载
# 如果还不行，可检查是否安装python

# 2、SASS问题，设置淘宝源
# npm config set sass_binary_site=https://npm.taobao.org/mirrors/node-sass
```
