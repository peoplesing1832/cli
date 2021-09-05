## vue-cli v5.0.0 源码学习笔记

为什么看 vue-cli 的源码? 希望能够写出自己的 cli 脚手架。

## 一些依赖的库

### program

node.js 命令行工具

### Inquirer

> https://github.com/SBoudrias/Inquirer.js

交互式命令行工具

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
  // 例如你使用 -f 参数，options 参数就是 { force: true }
  .action((name, options) => {
    // 如果输入了多个参数，第一个参数是项目的名称，对用户进行提示
    if (minimist(process.argv.slice(3))._.length > 1) {
      console.log(chalk.yellow('\n Info: You provided more than one argument. The first one will be used as the app\'s name, the rest are ignored.'))
    }
    if (process.argv.includes('-g') || process.argv.includes('--git')) {
      options.forceGit = true
    }
    // 接下来进入 create.js 文件查看
    require('../lib/create')(name, options)
  })
```

## packages/@vue/cli/lib/create.js

```
const fs = require('fs-extra')
const path = require('path')
const inquirer = require('inquirer')
const Creator = require('./Creator')
const { clearConsole } = require('./util/clearConsole')
const { getPromptModules } = require('./util/createTools')
const {
  chalk, // chalk 美化命令行的库
  error,
  stopSpinner,
  exit // process.exit 的封装
} = require('@vue/cli-shared-utils')
// validate-npm-package-name 用于验证项目的名称是否是有效的 npm 包名
const validateProjectName = require('validate-npm-package-name')

async function create (projectName, options) {
  // 是否使用代理
  if (options.proxy) {
    process.env.HTTP_PROXY = options.proxy
  }

  // node进程的当前工作目录
  const cwd = options.cwd || process.cwd()
  // 如果 vue create 的 第一个参数是一个点, 那么 name 就等于当前工作目录的名称
  const inCurrent = projectName === '.'
  const name = inCurrent ? path.relative('../', cwd) : projectName
  // 目标文件夹的目录
  const targetDir = path.resolve(cwd, projectName || '.')

  // 判断 name 是否有效
  const result = validateProjectName(name)
  // 如果 name 是无效的
  // 会进行警告的打印，并使用 exit 方法，退出当前的进程
  if (!result.validForNewPackages) {
    console.error(chalk.red(`Invalid project name: "${name}"`))
    result.errors && result.errors.forEach(err => {
      console.error(chalk.red.dim('Error: ' + err))
    })
    result.warnings && result.warnings.forEach(warn => {
      console.error(chalk.red.dim('Warning: ' + warn))
    })
    exit(1)
  }

  // fs.existsSync 检查文件系统来测试给定的路径是否存在，并且没有设置 options.merge 选项
  // 并判断是否设置了是否合并目录 options.merge 的选项
  if (fs.existsSync(targetDir) && !options.merge) {
    // 如果设置了覆盖目录，会尝试把之前的目录进行删除
    if (options.force) {
      await fs.remove(targetDir)
    } else {
      // 清除终端（换行加清楚）
      await clearConsole()
      if (inCurrent) {
        // 询问是否在当前目录生成项目创建项目（默认是合并的操作）
        const { ok } = await inquirer.prompt([
          {
            name: 'ok',
            type: 'confirm',
            message: `Generate project in current directory?`
          }
        ])
        if (!ok) {
          return
        }
      } else {
        // 如果目录已经存在, 询问后续操作 覆盖 合并 取消
        const { action } = await inquirer.prompt([
          {
            name: 'action',
            type: 'list',
            message: `Target directory ${chalk.cyan(targetDir)} already exists. Pick an action:`,
            choices: [
              { name: 'Overwrite', value: 'overwrite' },
              { name: 'Merge', value: 'merge' },
              { name: 'Cancel', value: false }
            ]
          }
        ])
        if (!action) {
          return
        } else if (action === 'overwrite') {
          // 如果选择了 overwrite 则删除之前的目录
          console.log(`\nRemoving ${chalk.cyan(targetDir)}...`)
          await fs.remove(targetDir)
        }
      }
    }
  }

  const creator = new Creator(name, targetDir, getPromptModules())
  await creator.create(options)
}

module.exports = (...args) => {
  return create(...args).catch(err => {
    stopSpinner(false) // do not persist
    error(err)
    if (!process.env.VUE_CLI_TEST) {
      process.exit(1)
    }
  })
}
```

## ## packages/@vue/cli/lib/Creator.js

```
const path = require('path')
const debug = require('debug')
const inquirer = require('inquirer')
const EventEmitter = require('events')
const Generator = require('./Generator')
const cloneDeep = require('lodash.clonedeep')
const sortObject = require('./util/sortObject')
const getVersions = require('./util/getVersions')
const PackageManager = require('./util/ProjectPackageManager')
const { clearConsole } = require('./util/clearConsole')
const PromptModuleAPI = require('./PromptModuleAPI')
const writeFileTree = require('./util/writeFileTree')
const { formatFeatures } = require('./util/features')
const loadLocalPreset = require('./util/loadLocalPreset')
const loadRemotePreset = require('./util/loadRemotePreset')
const generateReadme = require('./util/generateReadme')
const { resolvePkg, isOfficialPlugin } = require('@vue/cli-shared-utils')

const {
  defaults,
  saveOptions,
  loadOptions,
  savePreset,
  validatePreset,
  rcPath
} = require('./options')

const {
  chalk,
  execa,

  log,
  warn,
  error,

  hasGit,
  hasProjectGit,
  hasYarn,
  hasPnpm3OrLater,
  hasPnpmVersionOrLater,

  exit,
  loadModule
} = require('@vue/cli-shared-utils')

const isManualMode = answers => answers.preset === '__manual__'

module.exports = class Creator extends EventEmitter {
  constructor (name, context, promptModules) {
    super()

    this.name = name
    this.context = process.env.VUE_CLI_CONTEXT = context
    const { presetPrompt, featurePrompt } = this.resolveIntroPrompts()

    this.presetPrompt = presetPrompt
    this.featurePrompt = featurePrompt
    this.outroPrompts = this.resolveOutroPrompts()
    this.injectedPrompts = []
    this.promptCompleteCbs = []
    this.afterInvokeCbs = []
    this.afterAnyInvokeCbs = []

    this.run = this.run.bind(this)

    const promptAPI = new PromptModuleAPI(this)
    promptModules.forEach(m => m(promptAPI))
  }

  async create (cliOptions = {}, preset = null) {
    const isTestOrDebug = process.env.VUE_CLI_TEST || process.env.VUE_CLI_DEBUG
    const { run, name, context, afterInvokeCbs, afterAnyInvokeCbs } = this

    if (!preset) {
      if (cliOptions.preset) {
        // vue create foo --preset bar
        preset = await this.resolvePreset(cliOptions.preset, cliOptions.clone)
      } else if (cliOptions.default) {
        // vue create foo --default
        preset = defaults.presets.default
      } else if (cliOptions.inlinePreset) {
        // vue create foo --inlinePreset {...}
        try {
          preset = JSON.parse(cliOptions.inlinePreset)
        } catch (e) {
          error(`CLI inline preset is not valid JSON: ${cliOptions.inlinePreset}`)
          exit(1)
        }
      } else {
        preset = await this.promptAndResolvePreset()
      }
    }

    // clone before mutating
    preset = cloneDeep(preset)
    // inject core service
    preset.plugins['@vue/cli-service'] = Object.assign({
      projectName: name
    }, preset)

    if (cliOptions.bare) {
      preset.plugins['@vue/cli-service'].bare = true
    }

    // legacy support for router
    if (preset.router) {
      preset.plugins['@vue/cli-plugin-router'] = {}

      if (preset.routerHistoryMode) {
        preset.plugins['@vue/cli-plugin-router'].historyMode = true
      }
    }

    // legacy support for vuex
    if (preset.vuex) {
      preset.plugins['@vue/cli-plugin-vuex'] = {}
    }

    const packageManager = (
      cliOptions.packageManager ||
      loadOptions().packageManager ||
      (hasYarn() ? 'yarn' : null) ||
      (hasPnpm3OrLater() ? 'pnpm' : 'npm')
    )

    await clearConsole()
    const pm = new PackageManager({ context, forcePackageManager: packageManager })

    log(`✨  Creating project in ${chalk.yellow(context)}.`)
    this.emit('creation', { event: 'creating' })

    // get latest CLI plugin version
    const { latestMinor } = await getVersions()

    // generate package.json with plugin dependencies
    const pkg = {
      name,
      version: '0.1.0',
      private: true,
      devDependencies: {},
      ...resolvePkg(context)
    }
    const deps = Object.keys(preset.plugins)
    deps.forEach(dep => {
      if (preset.plugins[dep]._isPreset) {
        return
      }

      let { version } = preset.plugins[dep]

      if (!version) {
        if (isOfficialPlugin(dep) || dep === '@vue/cli-service' || dep === '@vue/babel-preset-env') {
          version = isTestOrDebug ? `latest` : `~${latestMinor}`
        } else {
          version = 'latest'
        }
      }

      pkg.devDependencies[dep] = version
    })

    // write package.json
    await writeFileTree(context, {
      'package.json': JSON.stringify(pkg, null, 2)
    })

    // generate a .npmrc file for pnpm, to persist the `shamefully-flatten` flag
    if (packageManager === 'pnpm') {
      const pnpmConfig = hasPnpmVersionOrLater('4.0.0')
        ? 'shamefully-hoist=true\n'
        : 'shamefully-flatten=true\n'

      await writeFileTree(context, {
        '.npmrc': pnpmConfig
      })
    }

    // intilaize git repository before installing deps
    // so that vue-cli-service can setup git hooks.
    const shouldInitGit = this.shouldInitGit(cliOptions)
    if (shouldInitGit) {
      log(`🗃  Initializing git repository...`)
      this.emit('creation', { event: 'git-init' })
      await run('git init')
    }

    // install plugins
    log(`⚙\u{fe0f}  Installing CLI plugins. This might take a while...`)
    log()
    this.emit('creation', { event: 'plugins-install' })

    if (isTestOrDebug && !process.env.VUE_CLI_TEST_DO_INSTALL_PLUGIN) {
      // in development, avoid installation process
      await require('./util/setupDevProject')(context)
    } else {
      await pm.install()
    }

    // run generator
    log(`🚀  Invoking generators...`)
    this.emit('creation', { event: 'invoking-generators' })
    const plugins = await this.resolvePlugins(preset.plugins, pkg)
    const generator = new Generator(context, {
      pkg,
      plugins,
      afterInvokeCbs,
      afterAnyInvokeCbs
    })
    await generator.generate({
      extractConfigFiles: preset.useConfigFiles
    })

    // install additional deps (injected by generators)
    log(`📦  Installing additional dependencies...`)
    this.emit('creation', { event: 'deps-install' })
    log()
    if (!isTestOrDebug || process.env.VUE_CLI_TEST_DO_INSTALL_PLUGIN) {
      await pm.install()
    }

    // run complete cbs if any (injected by generators)
    log(`⚓  Running completion hooks...`)
    this.emit('creation', { event: 'completion-hooks' })
    for (const cb of afterInvokeCbs) {
      await cb()
    }
    for (const cb of afterAnyInvokeCbs) {
      await cb()
    }

    if (!generator.files['README.md']) {
      // generate README.md
      log()
      log('📄  Generating README.md...')
      await writeFileTree(context, {
        'README.md': generateReadme(generator.pkg, packageManager)
      })
    }

    // commit initial state
    let gitCommitFailed = false
    if (shouldInitGit) {
      await run('git add -A')
      if (isTestOrDebug) {
        await run('git', ['config', 'user.name', 'test'])
        await run('git', ['config', 'user.email', 'test@test.com'])
        await run('git', ['config', 'commit.gpgSign', 'false'])
      }
      const msg = typeof cliOptions.git === 'string' ? cliOptions.git : 'init'
      try {
        await run('git', ['commit', '-m', msg, '--no-verify'])
      } catch (e) {
        gitCommitFailed = true
      }
    }

    // log instructions
    log()
    log(`🎉  Successfully created project ${chalk.yellow(name)}.`)
    if (!cliOptions.skipGetStarted) {
      log(
        `👉  Get started with the following commands:\n\n` +
        (this.context === process.cwd() ? `` : chalk.cyan(` ${chalk.gray('$')} cd ${name}\n`)) +
        chalk.cyan(` ${chalk.gray('$')} ${packageManager === 'yarn' ? 'yarn serve' : packageManager === 'pnpm' ? 'pnpm run serve' : 'npm run serve'}`)
      )
    }
    log()
    this.emit('creation', { event: 'done' })

    if (gitCommitFailed) {
      warn(
        `Skipped git commit due to missing username and email in git config, or failed to sign commit.\n` +
        `You will need to perform the initial commit yourself.\n`
      )
    }

    generator.printExitLogs()
  }

  run (command, args) {
    if (!args) { [command, ...args] = command.split(/\s+/) }
    return execa(command, args, { cwd: this.context })
  }

  async promptAndResolvePreset (answers = null) {
    // prompt
    if (!answers) {
      await clearConsole(true)
      answers = await inquirer.prompt(this.resolveFinalPrompts())
    }
    debug('vue-cli:answers')(answers)

    if (answers.packageManager) {
      saveOptions({
        packageManager: answers.packageManager
      })
    }

    let preset
    if (answers.preset && answers.preset !== '__manual__') {
      preset = await this.resolvePreset(answers.preset)
    } else {
      // manual
      preset = {
        useConfigFiles: answers.useConfigFiles === 'files',
        plugins: {}
      }
      answers.features = answers.features || []
      // run cb registered by prompt modules to finalize the preset
      this.promptCompleteCbs.forEach(cb => cb(answers, preset))
    }

    // validate
    validatePreset(preset)

    // save preset
    if (answers.save && answers.saveName && savePreset(answers.saveName, preset)) {
      log()
      log(`🎉  Preset ${chalk.yellow(answers.saveName)} saved in ${chalk.yellow(rcPath)}`)
    }

    debug('vue-cli:preset')(preset)
    return preset
  }

  async resolvePreset (name, clone) {
    let preset
    const savedPresets = this.getPresets()

    if (name in savedPresets) {
      preset = savedPresets[name]
    } else if (name.endsWith('.json') || /^\./.test(name) || path.isAbsolute(name)) {
      preset = await loadLocalPreset(path.resolve(name))
    } else if (name.includes('/')) {
      log(`Fetching remote preset ${chalk.cyan(name)}...`)
      this.emit('creation', { event: 'fetch-remote-preset' })
      try {
        preset = await loadRemotePreset(name, clone)
      } catch (e) {
        error(`Failed fetching remote preset ${chalk.cyan(name)}:`)
        throw e
      }
    }

    if (!preset) {
      error(`preset "${name}" not found.`)
      const presets = Object.keys(savedPresets)
      if (presets.length) {
        log()
        log(`available presets:\n${presets.join(`\n`)}`)
      } else {
        log(`you don't seem to have any saved preset.`)
        log(`run vue-cli in manual mode to create a preset.`)
      }
      exit(1)
    }
    return preset
  }

  // { id: options } => [{ id, apply, options }]
  async resolvePlugins (rawPlugins, pkg) {
    // ensure cli-service is invoked first
    rawPlugins = sortObject(rawPlugins, ['@vue/cli-service'], true)
    const plugins = []
    for (const id of Object.keys(rawPlugins)) {
      const apply = loadModule(`${id}/generator`, this.context) || (() => {})
      let options = rawPlugins[id] || {}

      if (options.prompts) {
        let pluginPrompts = loadModule(`${id}/prompts`, this.context)

        if (pluginPrompts) {
          const prompt = inquirer.createPromptModule()

          if (typeof pluginPrompts === 'function') {
            pluginPrompts = pluginPrompts(pkg, prompt)
          }
          if (typeof pluginPrompts.getPrompts === 'function') {
            pluginPrompts = pluginPrompts.getPrompts(pkg, prompt)
          }

          log()
          log(`${chalk.cyan(options._isPreset ? `Preset options:` : id)}`)
          options = await prompt(pluginPrompts)
        }
      }

      plugins.push({ id, apply, options })
    }
    return plugins
  }

  getPresets () {
    const savedOptions = loadOptions()
    return Object.assign({}, savedOptions.presets, defaults.presets)
  }

  resolveIntroPrompts () {
    const presets = this.getPresets()
    const presetChoices = Object.entries(presets).map(([name, preset]) => {
      let displayName = name
      if (name === 'default') {
        displayName = 'Default'
      } else if (name === '__default_vue_3__') {
        displayName = 'Default (Vue 3)'
      }

      return {
        name: `${displayName} (${formatFeatures(preset)})`,
        value: name
      }
    })
    const presetPrompt = {
      name: 'preset',
      type: 'list',
      message: `Please pick a preset:`,
      choices: [
        ...presetChoices,
        {
          name: 'Manually select features',
          value: '__manual__'
        }
      ]
    }
    const featurePrompt = {
      name: 'features',
      when: isManualMode,
      type: 'checkbox',
      message: 'Check the features needed for your project:',
      choices: [],
      pageSize: 10
    }
    return {
      presetPrompt,
      featurePrompt
    }
  }

  resolveOutroPrompts () {
    const outroPrompts = [
      {
        name: 'useConfigFiles',
        when: isManualMode,
        type: 'list',
        message: 'Where do you prefer placing config for Babel, ESLint, etc.?',
        choices: [
          {
            name: 'In dedicated config files',
            value: 'files'
          },
          {
            name: 'In package.json',
            value: 'pkg'
          }
        ]
      },
      {
        name: 'save',
        when: isManualMode,
        type: 'confirm',
        message: 'Save this as a preset for future projects?',
        default: false
      },
      {
        name: 'saveName',
        when: answers => answers.save,
        type: 'input',
        message: 'Save preset as:'
      }
    ]

    // ask for packageManager once
    const savedOptions = loadOptions()
    if (!savedOptions.packageManager && (hasYarn() || hasPnpm3OrLater())) {
      const packageManagerChoices = []

      if (hasYarn()) {
        packageManagerChoices.push({
          name: 'Use Yarn',
          value: 'yarn',
          short: 'Yarn'
        })
      }

      if (hasPnpm3OrLater()) {
        packageManagerChoices.push({
          name: 'Use PNPM',
          value: 'pnpm',
          short: 'PNPM'
        })
      }

      packageManagerChoices.push({
        name: 'Use NPM',
        value: 'npm',
        short: 'NPM'
      })

      outroPrompts.push({
        name: 'packageManager',
        type: 'list',
        message: 'Pick the package manager to use when installing dependencies:',
        choices: packageManagerChoices
      })
    }

    return outroPrompts
  }

  resolveFinalPrompts () {
    // patch generator-injected prompts to only show in manual mode
    this.injectedPrompts.forEach(prompt => {
      const originalWhen = prompt.when || (() => true)
      prompt.when = answers => {
        return isManualMode(answers) && originalWhen(answers)
      }
    })

    const prompts = [
      this.presetPrompt,
      this.featurePrompt,
      ...this.injectedPrompts,
      ...this.outroPrompts
    ]
    debug('vue-cli:prompts')(prompts)
    return prompts
  }

  shouldInitGit (cliOptions) {
    if (!hasGit()) {
      return false
    }
    // --git
    if (cliOptions.forceGit) {
      return true
    }
    // --no-git
    if (cliOptions.git === false || cliOptions.git === 'false') {
      return false
    }
    // default: true unless already in a git repo
    return !hasProjectGit(this.context)
  }
}
```


## 参考

- [vue-cli 3.0 源码分析](https://juejin.cn/post/6844903775304433677)
- [semver](https://www.npmjs.com/package/semver)
- [minimist](https://www.npmjs.com/package/minimist)
- [program](https://www.npmjs.com/package/program)
- [package.json](https://docs.npmjs.com/cli/v7/configuring-npm/package-json)
- [npm-link](https://docs.npmjs.com/cli/v7/commands/npm-link)
- [从 0 构建自己的脚手架/CLI知识体系（万字） 🛠](https://juejin.cn/post/6966119324478079007#heading-25)