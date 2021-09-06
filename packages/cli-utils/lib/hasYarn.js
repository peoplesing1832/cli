const { execSync } = require('child_process')

exports.hasYarn = () => {
  let _hasYarn = true
  try {
    execSync('yarn --version', { stdio: 'ignore' })
  } catch (error) {
    _hasYarn = false
  }

  return _hasYarn
}
