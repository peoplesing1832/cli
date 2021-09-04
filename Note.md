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

设置 package.json 中的 bin 字段。当库被全局安装('-g')的时候, bind/vue.js 会被链接到全局 bin 所在的位置。我们就可以使用 `vue` 命令。

## npm-link

npm link 命令可以让我们方便调试 npm 包。假设我们有项目 A。在进行入的 A 的根目录后。使用 npm link 会被链接到全局。如果想在项目 B 中使用项目 A。可以进入项目 B 的目录中使用 npm link A。项目 B 的 node_modules 中就会创建 A 的快捷方式。
## packages/@vue/cli/bin/vue.js

从 `vue create` 命令的入口文件开始分析代码

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

// 验证当前的node版本是否满足需求
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
```

version 可以为当前命令行工具，提供版本功能，使用 -V 或者 --version 就可以输出你想要显示的版本信息。 usage 则是进行首行提示的

![version.png](https://i.loli.net/2021/09/04/qlm8NhUI3rydnZe.png)

````js
program
  // command 方法用于配置命令, command 方法的第一个参数是命令的名称
  // 必选参数使用尖括号表示
  // 可选参数使用方括号表示
  .command('create <app-name>')
  // description 方法 用来描述命令
  .description('create a new project powered by vue-cli-service')
  // option 方法用来定义选项
  // option 方法可以定义一个短选项名称（-后面接单个字符）和一个长选项名称（--后面接一个或多个单词），以及选项的简介
  // -p 忽略提示符并使用已保存的或远程的预设选项
  .option('-p, --preset <presetName>', 'Skip prompts and use saved or remote preset')
  // -d 忽略提示符并使用默认预设选项
  .option('-d, --default', 'Skip prompts and use default preset')
  // -i 忽略提示符并使用内联的 JSON 字符串预设选项
  .option('-i, --inlinePreset <json>', 'Skip prompts and use inline JSON string as preset')
  // -m 在安装依赖时使用指定的 npm 客户端
  .option('-m, --packageManager <command>', 'Use specified npm client when installing dependencies')
  // -r 在安装依赖时使用指定的 npm registry
  .option('-r, --registry <url>', 'Use specified npm registry when installing dependencies (only for npm)')
  // -g 强制 / 跳过 git 初始化，并可选的指定初始化提交信息
  .option('-g, --git [message]', 'Force git initialization with initial commit message')
  // -n 跳过 git 初始化
  .option('-n, --no-git', 'Skip git initialization')
  // -f 是否覆盖目录
  .option('-f, --force', 'Overwrite target directory if it exists')
  // 合并目录
  .option('--merge', 'Merge target directory if it exists')
  // 使用 git clone 获取远程预设选项
  .option('-c, --clone', 'Use git clone when fetching remote preset')
  // 使用指定的代理创建项目
  .option('-x, --proxy <proxyUrl>', 'Use specified proxy when creating project')
  // 创建项目时省略默认组件中的新手指导信息
  .option('-b, --bare', 'Scaffold project without beginner instructions')
  // 跳过开始使用说明
  .option('--skipGetStarted', 'Skip displaying "Get started" instructions')
  // action 是命令的处理函数
  // name 是第一个参数，就是项目的名称
  // options 是命令其他参数，是 obj 的形式
  .action((name, options) => {
    // 如果输入了多个参数，第一个参数是项目的名称，对用户进行提示
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