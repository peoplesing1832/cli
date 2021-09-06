const {
  chalk,
} = require('cli-utils')
const t = require('cli-language')

module.exports = (cli) => {
  cli.injectFeature({
    name: 'Router',
    value: 'router',
    description: t['react-cli-router'][process.env.LANGUAGE],
  })

  cli.injectPrompt({
    name: 'routerMode',
    when: answers => answers.features.includes('router'),
    type: 'list',
    message: t['react-cli-router-mode'][process.env.LANGUAGE],
    choices: [
      { name: 'History', value: 'history', },
      { name: 'Hash', value: 'hash', },
    ]
  })

  cli.onPromptComplete((answers, options) => {
  })
}
