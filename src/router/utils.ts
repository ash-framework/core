import * as stream from 'stream'

export function isReadableStream(obj) {
  return obj instanceof stream.Stream &&
    // quick dirty typescript override for usage of private properties
    typeof ((obj as any)._read === 'function') &&
    typeof ((obj as any)._readableState === 'object')
}
