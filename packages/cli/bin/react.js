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

process.env.LANGUAGE = 'en'

program
  .version(`react-cli ${VERSION}`)
  .usage('<command> [options]')

program
  .command('create <name>')
  .description(`${t['react-cli-create-description'][process.env.LANGUAGE]}`)
  .option('-f, --force', `${t['react-cli-create-force'][process.env.LANGUAGE]}`)
  .option('-m, --merge', `${t['react-cli-create-merge'][process.env.LANGUAGE]}`)
  .action((name, options) => {
    create(name, options)
  })
