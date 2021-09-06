const path = require('path')
const EventEmitter = require('events')
const inquirer = require('inquirer')
const t = require('cli-language')
const {
  hasYarn,
  clearConsole,
} = require('cli-utils')
const routerPrompt = require('./prompt/router')

class Creator extends EventEmitter {
  constructor (name, context) {
    super()
    this.name = name
    this.context = rocess.env.CONTEXT = context
    this.featurePrompt = this.initFeaturePrompt()
    this.packagePrompt = this.initPackagePrompt()
    this.injectedPrompts = []
    this.promptCompleteCbs = []
    this.promptModules = [
      routerPrompt,
    ]
    const promptAPI = new PromptModuleAPI(this)
    this.promptModules.forEach((module) => {
      module(promptAPI)
    })
  }

  async create (options = {}) {
  }

  initFeaturePrompt () {
    return {
      name: 'features',
      type: 'checkbox',
      message: t['react-cli-check-features-project'][process.env.LANGUAGE],
      choices: [],
      pageSize: 10
    }
  }

  initPackagePrompt () {
    const packageManagerChoices = []

    packageManagerChoices.push({
      name: `${t['react-cli-use'][process.env.LANGUAGE]} NPM`,
      value: 'npm',
    })

    if (hasYarn()) {
      packageManagerChoices.push({
        name: `${t['react-cli-use'][process.env.LANGUAGE]} Yarn`,
        value: 'yarn',
      })
    }

    return {
      name: 'packageManager',
      type: 'list',
      message: `${t['react-cli-package-manager'][process.env.LANGUAGE]} NPM`,
      choices: packageManagerChoices
    }
  }
}

module.exports = Creator
