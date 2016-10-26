const {Base} = require('@ash-framework/classes')
const createRoutes = require('@ash-framework/router')
const Log = require('@ash-framework/log')
const loadMiddleware = require('@ash-framework/middleware')
const express = require('express')
const path = require('path')

const config = require(path.join(process.cwd(), 'config/environment.js'))
const MiddlewareRouter = require(path.join(process.cwd(), 'app/middleware.js'))
const Router = require(path.join(process.cwd(), 'app/router.js'))

const _app = new WeakMap()

module.exports = class Application extends Base {
  start () {
    const app = express()
    _app.set(this, app)

    const log = new Log()

    log.info('Ash server loading middleware')
    const middlewareRouter = new MiddlewareRouter()
    const middlewareDir = path.join(process.cwd(), 'app/middleware')
    loadMiddleware(middlewareRouter.definition, app, middlewareDir)

    log.info('Ash server loading routes')
    const router = new Router()
    const routeDir = path.join(process.cwd(), 'app/routes')
    app.use(createRoutes(router.definition, routeDir))

    app.start(config.port, function () {
      log.info(`Ash server started on port ${config.port}`)
    })
  }
}
