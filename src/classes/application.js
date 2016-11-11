const {Base} = require('@ash-framework/classes')
const createRoutes = require('@ash-framework/router')
const Log = require('@ash-framework/log')
const loadMiddleware = require('@ash-framework/middleware')
const express = require('express')
const path = require('path')
const fs = require('fs')

const _app = new WeakMap()

module.exports = class Application extends Base {
  static start () {
    const config = require(path.join(process.cwd(), 'config/environment.js'))(process.env.NODE_ENV)
    const MiddlewareRouter = require(path.join(process.cwd(), 'app/middleware.js'))
    const Router = require(path.join(process.cwd(), 'app/router.js'))
    const log = new Log()

    log.trace('Ash server creating express app instance')
    const app = express()
    _app.set(this, app)

    log.trace('Ash server loading middleware')
    const middlewareDir = path.join(process.cwd(), 'app/middleware')
    loadMiddleware(MiddlewareRouter.definition, app, middlewareDir)

    log.trace('Ash server loading routes')
    const options = {routesDir: path.join(process.cwd(), 'app/routes')}
    app.use(createRoutes(Router.definition, options))

    const initializerDir = path.join(process.cwd(), 'app/initializers')
    if (fs.existsSync(initializerDir)) {
      const initializers = fs.readdirSync(initializerDir)
      if (initializers.length > 0) {
        log.trace('Ash server loading initializers')
        initializers.forEach(initializerName => {
          const Initializer = require(initializerDir + '/' + initializerName)
          const initializer = new Initializer()
          initializer.init(app)
        })
      }
    }

    app.listen(config.port, function () {
      log.trace(`Ash server started on port ${config.port}`)
    })
  }
}
