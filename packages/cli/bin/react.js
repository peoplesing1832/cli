const fs = require('fs')
const path = require('path')
const program = require('commander')
const {
  chalk,
  semver,
} = require('cli-utils')
const t = require('cli-language')
const packageJson = require('../package.json')
const create = require('../lib/create')

const VERSION = packageJson.version

program
  .version(`react-cli ${VERSION}`)
  .usage('<command> [options]')

program
  .command('create <name>')
  .description(`${t['react-cli-create-description']['en']}(${t['react-cli-create-description']['cn']})`)
  .option('-f, --force', `${t['react-cli-create-force']['en']}(${t['react-cli-create-force']['cn']})`)
  .option('-m, --merge', `${t['react-cli-create-merge']['en']}(${t['react-cli-create-merge']['cn']})`)
  .action((name, options) => {
    create(name, options)
  })
