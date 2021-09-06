const fs = require('fs-extra')
const path = require('path')
const inquirer = require('inquirer')
const validateProjectName = require('validate-npm-package-name')
const t = require('cli-language')
const {
  clearConsole,
} = require('cli-utils')
const Creator = require('./Creator')

async function create (name, options) {
  const cwd = options.cwd || process.cwd()
  const dir = path.resolve(cwd, name)
  const { merge, force } = options

  const { language } = await inquirer.prompt([
    {
      name: 'language',
      type: 'list',
      message: 'Please select language:',
      choices: [
        { name: 'English', value: 'en' },
        { name: 'Chinese', value: 'cn' },
      ],
    }
  ])

  process.env.LANGUAGE = language

  const isCompliant = validateProjectName(name).validForNewPackages

  if (!isCompliant) {
    console.error(chalk.red(`${t['react-cli-name-invalid'][process.env.LANGUAGE]} "${name}"`))
    exit(1)
  }

  if (fs.existsSync(dir) && !merge) {
    if (force) {
      await fs.remove(dir)
    } else {
      await clearConsole()
      const { action } = await inquirer.prompt([
        {
          name: 'action',
          type: 'list',
          message: t['react-cli-name-directory-action'][process.env.LANGUAGE],
          choices: [
            {
              name: t['react-cli-name-directory-action-overwrite'][process.env.LANGUAGE],
              value: 'overwrite',
            },
            {
              name: t['react-cli-name-directory-action-merge'][process.env.LANGUAGE],
              value: 'merge'
            },
            {
              name: t['react-cli-name-directory-action-cancel'][process.env.LANGUAGE],
              value: 'cancel'
            },
          ],
        }
      ])

      if (action === 'cancel') {
        return
      } else if (action === 'overwrite') {
        await fs.remove(dir)
      }
    }
  }

  const creator = new Creator(name, dir)
}

module.exports = create
