class PromptModuleAPI {
  constructor (cli) {
    this.cli = cli
  }

  injectFeature (feature) {
    this.cli.featurePrompt.choices.push(feature)
  }

  injectPrompt (prompt) {
    this.cli.injectedPrompts.push(prompt)
  }

  onPromptComplete (cb) {
    this.cli.promptCompleteCbs.push(cb)
  }
}

module.exports = PromptModuleAPI
