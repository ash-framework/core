import * as path from 'path'
import * as FileNotFoundError from '@ash-framework/file-not-found-error'

export default function (name, directory) {
  const filePath = path.join(directory, name)
  try {
    const file = require(filePath)
    console.log(file)
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
