const path = require('path')
const fs = require('fs')

module.exports = function (name, directory) {
  const filepath = path.join(directory, name)
  return fs.existsSync(filepath)
}
