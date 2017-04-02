import * as path from 'path'
import * as HttpContext from '@ash-framework/http-context'
import * as Log from '@ash-framework/log'
import Route from '../classes/route'

const log = new Log()

export default function (route: Route): Promise<any> {
  function applyMiddleware(middlewareList: Array<any>): Promise<any> {
    if (middlewareList.length < 1) return
    const middlewareName = middlewareList.shift()
    const Module = require(path.join(process.cwd(), 'app', 'middleware') + '/' + middlewareName)
    const Middleware = (Module.__esModule) ? Module.default : Module
    const { request, response } = route
    const middleware = new Middleware({ request, response })
    return Promise.resolve()
      .then(() => middleware.register())
      .then(() => applyMiddleware(middlewareList))
  }

  return Promise.resolve()
    .then(() => {
      log.trace(`Route '${route.constructor.name}': entering route`)
      if (route.hasMiddleware) {
        log.trace(`${route.constructor.name}: running route middleware`)
        return applyMiddleware(route.registeredMiddleware)
      }
    })
    .then(() => {
      log.trace(`Route '${route.constructor.name}': running deserialize hook`)
      return route.deserialize()
    })
    .then(() => {
      log.trace(`Route '${route.constructor.name}': running beforeModel hook`)
      return route.beforeModel()
    })
    .then(() => {
      log.trace(`Route '${route.constructor.name}': running model hook`)
      const model = route.model()
      if (!model) {
        const msg = `Route '${route.constructor.name}': model hook error. Did you forget to return?`
        return Promise.reject(msg)
      }
      return model
    })
    .then(model => {
      log.trace(`Route '${route.constructor.name}': running afterModel hook`)
      const after = route.afterModel(model)
      if (!after) {
        const msg = `Route '${route.constructor.name}': afterModel hook error. Did you forget to return?`
        return Promise.reject(msg)
      }
      return after
    })
    .then(after => {
      log.trace(`Route '${route.constructor.name}': running serialize hook`)
      const serialized = route.serialize(after)
      if (!serialized) {
        const msg = `Route '${route.constructor.name}': serialize hook error. Did you forget to return?`
        return Promise.reject(msg)
      }
      return serialized
    })
    .catch(err => {
      log.trace(`Route '${route.constructor.name}': running error hook`)
      const handledError = route.error(err)
      if (!handledError) {
        const msg = `Route '${route.constructor.name}': error hook error. Did you forget to return?`
        return Promise.reject(msg)
      } else {
        return handledError
      }
    })
}
