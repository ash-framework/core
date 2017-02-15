const path = require('path')
const HttpContext = require('@ash-framework/http-context')

module.exports = function (route) {
  function applyMiddleware (middlewareList) {
    if (middlewareList.length < 1) return
    const middlewareName = middlewareList.shift()
    const Module = require(path.join(process.cwd(), 'app', 'middleware') + '/' + middlewareName)
    const Middleware = (Module.__esModule) ? Module.default : Module
    const {request, response} = route
    const middleware = new Middleware(new HttpContext(request, response))
    return Promise.resolve()
      .then(() => middleware.register())
      .then(() => applyMiddleware(middlewareList))
  }

  return Promise.resolve()
    .then(() => {
      if (route.hasMiddleware) {
        return applyMiddleware(route.registeredMiddleware)
      }
    })
    .then(() => {
      if (route.deserialize) {
        return route.deserialize()
      }
    })
    .then(() => {
      if (route.beforeModel) {
        return route.beforeModel()
      }
    })
    .then(() => {
      return route.model()
    })
    .then(model => {
      return (route.afterModel) ? route.afterModel(model) : model
    })
    .then(model => {
      return (route.serialize) ? route.serialize(model) : model
    })
    .catch(err => {
      let error = err
      if (typeof route.error === 'function') {
        error = route.error(err)
      }
      if (error) {
        return Promise.reject(error)
      } else {
        return route.currentModel
      }
    })
}
