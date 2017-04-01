import * as path from 'path'
import * as fs from 'fs'

export default function (name, directory) {
  const filepath = path.join(directory, name)
  return fs.existsSync(filepath)
}
