import { Stream } from 'stream'
import { container } from '../classes/di'
import Route from '../classes/route'
import { Request, Response } from 'express'
import Middleware from '../classes/middleware'

export function isReadableStream(obj) {
  return obj instanceof Stream &&
    // quick dirty typescript override for usage of private properties
    typeof ((obj as any)._read === 'function') &&
    typeof ((obj as any)._readableState === 'object')
}

export function runMiddleware(middlewareList: Array<string>, request: Request, response: Response) {
  if (middlewareList.length < 1) return

  const name: string = middlewareList.shift()
  const middleware: Middleware = container.lookup(`middleware:${name}`)

  return Promise.resolve()
    .then(() => middleware.register(request, response))
    .then(() => runMiddleware(middlewareList, request, response))
}
