const stream = require('stream')

module.exports = function isReadableStream (obj) {
  return obj instanceof stream.Stream &&
    typeof (obj._read === 'function') &&
    typeof (obj._readableState === 'object')
}
