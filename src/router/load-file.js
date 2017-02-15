const path = require('path')
const FileNotFoundError = require('@ash-framework/file-not-found-error')

module.exports = function (name, directory) {
  const filePath = path.join(directory, name)
  try {
    const file = require(filePath)
    if (file.__esModule) {
      return file.default
    }
    return file
  } catch (err) {
    if (name !== 'index') {
      throw new FileNotFoundError(name, directory)
    }
  }
}
