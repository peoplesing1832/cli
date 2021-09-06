const {
  chalk,
} = require('cli-utils')

module.exports = (cli) => {
  cli.injectFeature({
    name: 'Router',
    value: 'router',
    description: '',
  })

  cli.injectPrompt({
    name: 'routerMode',
    type: 'list',
    message: '',
    choices: [
      { name: 'History', value: 'history', },
      { name: 'Hash', value: 'hash', },
    ]
  })

  cli.onPromptComplete((answers, options) => {
  })
}
