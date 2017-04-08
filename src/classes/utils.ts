import { pluralize, singularize, dasherize, underscore } from 'inflection'
import { Stream } from 'stream'
import { container } from '../classes/di'
import { Request, Response, Application } from 'express'
import Middleware from '../classes/middleware'
import Initializer from '../classes/initializer'

export function dasherize(input: string) {
  const classNameUnderscored = underscore(input)
  return dasherize(classNameUnderscored)
}

export function runMiddleware(middlewareList: Array<string>, request: Request, response: Response) {
  if (middlewareList.length < 1) return

  const name: string = middlewareList.shift()
  const middleware: Middleware = container.lookup(`middleware:${name}`)

  return Promise.resolve()
    .then(() => middleware.register(request, response))
    .then(() => runMiddleware(middlewareList, request, response))
}

export function runInitializers(initializerList: Array<string>, app: Application) {
  if (initializerList.length < 1) return

  const name: string = initializerList.shift()
  const initializer: Initializer = container.lookup(`initializer:${name}`)

  return Promise.resolve()
    .then(() => initializer.init(app))
    .then(() => runInitializers(initializerList, app))
}

export function isReadableStream(obj) {
  return obj instanceof Stream &&
    // quick dirty typescript override for usage of private properties
    typeof ((obj as any)._read === 'function') &&
    typeof ((obj as any)._readableState === 'object')
}
