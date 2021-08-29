## vue-cli v5.0.0 源码学习笔记

为什么看 vue-cli 的源码? 希望能够写出自己的 cli 脚手架。

## 一些依赖的库

### program

node.js 命令行工具

### Inquirer

### handlebars

### minimist

用于解析 optimist 参数的库

```shell
node example/parse.js -a beep -b boop
```

解析为

```js
{ _: [], a: 'beep', b: 'boop' }
```
### chalk

> https://github.com/chalk/chalk

用来设置终端字符串样式的库

### execa

基于 child_process 的封装库。关于 node 的 child_process 模块的内容请[参考](https://juejin.cn/post/7001779859730989086)

### semver

node semver 解析器。可以用来解析，判断版本。

### slash

将 Windows 上的反斜杠路径，转为正斜杠路径。`foo\\bar ➔ foo/bar`

## packages/@vue/cli/package.json

```js
{
  "name": "@vue/cli",
  "version": "5.0.0-beta.3",
  "description": "Command line interface for rapid Vue.js development",
  "bin": {
    "vue": "bin/vue.js"
  },
  // ...
}
```

设置 package.json 中的 bin 字段。当库被全局安装的时候, bind/vue.js 会被链接到全局 bin 所在的位置。

## packages/@vue/cli/bin/vue.js

从 `vue create` 命令的入口文件开始

```js
const { chalk, semver } = require('@vue/cli-shared-utils')
const requiredVersion = require('../package.json').engines.node
const leven = require('leven')

function checkNodeVersion (wanted, id) {
  if (!semver.satisfies(process.version, wanted, { includePrerelease: true })) {
    console.log(chalk.red(
      'You are using Node ' + process.version + ', but this version of ' + id +
      ' requires Node ' + wanted + '.\nPlease upgrade your Node version.'
    ))
    process.exit(1)
  }
}

checkNodeVersion(requiredVersion, '@vue/cli')
```

`vue-cli` 会对本地的 node 版本进行校验。`node` 版本需要满足 `^12.0.0 || >= 14.0.0`

```js
const fs = require('fs')
const path = require('path')
const slash = require('slash')
const minimist = require('minimist')
const program = require('commander')
const loadCommand = require('../lib/util/loadCommand')

program
  // 设置版本号, 默认是 -V 或者 --version 命令行会输出当前的版本号
  .version(`@vue/cli ${require('../package').version}`)
  // 用来提示首行的帮助信息
  .usage('<command> [options]')

program
  .command('create <app-name>')
  .description('create a new project powered by vue-cli-service')
  .option('-p, --preset <presetName>', 'Skip prompts and use saved or remote preset')
  .option('-d, --default', 'Skip prompts and use default preset')
  .option('-i, --inlinePreset <json>', 'Skip prompts and use inline JSON string as preset')
  .option('-m, --packageManager <command>', 'Use specified npm client when installing dependencies')
  .option('-r, --registry <url>', 'Use specified npm registry when installing dependencies (only for npm)')
  .option('-g, --git [message]', 'Force git initialization with initial commit message')
  .option('-n, --no-git', 'Skip git initialization')
  .option('-f, --force', 'Overwrite target directory if it exists')
  .option('--merge', 'Merge target directory if it exists')
  .option('-c, --clone', 'Use git clone when fetching remote preset')
  .option('-x, --proxy <proxyUrl>', 'Use specified proxy when creating project')
  .option('-b, --bare', 'Scaffold project without beginner instructions')
  .option('--skipGetStarted', 'Skip displaying "Get started" instructions')
  .action((name, options) => {
    if (minimist(process.argv.slice(3))._.length > 1) {
      console.log(chalk.yellow('\n Info: You provided more than one argument. The first one will be used as the app\'s name, the rest are ignored.'))
    }
    if (process.argv.includes('-g') || process.argv.includes('--git')) {
      options.forceGit = true
    }
    require('../lib/create')(name, options)
  })
```
## 参考

- [vue-cli 3.0 源码分析](https://juejin.cn/post/6844903775304433677)
- [semver](https://www.npmjs.com/package/semver)
- [minimist](https://www.npmjs.com/package/minimist)
- [program](https://www.npmjs.com/package/program)
- [package.json](https://docs.npmjs.com/cli/v7/configuring-npm/package-json)
- [npm-link](https://docs.npmjs.com/cli/v7/commands/npm-link)
- [从 0 构建自己的脚手架/CLI知识体系（万字） 🛠](https://juejin.cn/post/6966119324478079007#heading-25)