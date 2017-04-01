'use strict'

import Base from './base'
import ErrorHandler from './error-handler'
import * as Log from '@ash-framework/log'
import * as HttpError from '@ash-framework/http-error'
import { registry, container } from './di'
// const loadMiddleware = require('../middleware-router')

const createRoutes = require('../router')
const express = require('express')
const path = require('path')
const fs = require('fs')
const cors = require('cors')
const helmet = require('helmet')
const bodyparser = require('body-parser')

const _app = new WeakMap()

/**
  Application class used to create a new instance of an Ash application
  via the static method `start`

  @class Application
  @extends Base
  @public
*/
export default class Application extends Base {
  /**
    ## Starts an Ash application
    Starts application by performing the following operations

    ### 1. runs initializers
    Runs initializer classes in app/initializers (if any) in alphabetical order.
    Inializers can be used to hook into app start up early on and gain access
    to the express app instance in case you need to perform operations
    outside the scope of the Ash framework.

    #### Example: adding an initializer
    ```

    // app/initializers/application.js
    const Ash = require('@ash-framework/ash')

    module.exports = class Initializer extends Ash.Initializer {
      init (app) {
        // app is an unmodified express app instance so you can
        // do the following.
        app.get('/animals/mice', function (req, res) {
          res.send('Success')
        })
      }
    }
    ```

    ### 2. loads middleware
    Reads app/middleware.js to determine which middleware to run and in what order.
    Reads in and runs any middleware specified in app/middleware.js from the app/middleware directory

    #### Example: creating middleware
    ```

    // app/middleware/access.js
    const Ash = require('@ash-framework/ash')

    module.exports = class AccessMiddleware extends Ash.Middleware {
      register () {

      }
    }
    ```

    #### Example: registering middleware
    ```

    // app/middleware.js
    const Ash = require('@ash-framework/ash')

    class MiddlewareRouter extends Ash.MiddlewareRouter { }

    MiddlewareRouter.map(function () {
      this.middleware('access')
    })

    module.exports = MiddlewareRouter
    ```

    ### 3. creates routes
    Reads app/router.js to determine which routes to register.
    Reads in and registers any routes specified in app/router.js from the app/routes directory

    #### Example: creating a route
    ```

    // app/routes/user.js
    const Ash = require('@ash-framework/ash')

    module.exports = class UserRoute extends Ash.Route {
      model () {
        // return user data
      }
    }
    ```

    #### Example: registering route in the router
    ```

    // app/router.js
    const Ash = require('@ash-framework/ash')

    class Router extends Ash.Router { }

    Router.map(function () {
      this.route('user')
    })

    module.exports = Router
    ```

    ### 4. adds an error handler
    This error handler catches any errors and specifies how errors should be handled and
    displayed to the client.

    Looks for a user defined error handler class for the application in app/error-handler.js
    If not found one is defined in its place.

    #### Example: adding a custom error handler
    ```

    // app/error-handler.js
    const {ErrorHandler, log} = require('@ash-framework/ash')

    module.exports = class ApplicationErrorHandler extends ErrorHandler {
      error (error) {
        log.error(error)
        super.error(error)
      }
    }
    ```

    ### 5. starts the app
    Starts the app on the port described in `config/environment.js`. The default port is 3010.

    #### Example: starting an application:
    ```

    const Ash = require('@ash-framework/ash')

    class Application extends Ash.Application {
    }

    Application.start()
    ```

    @static
    @public
    @method start
  */
  static start () {
    const configModule = require(path.join(process.cwd(), 'config/environment.js'))
    const config = ((configModule.__esModule) ? configModule.default : configModule)(process.env.NODE_ENV)

    // const middlewareModule = container.lookup('middleware-router')
    // const MiddlewareRouter = (middlewareModule.__esModule) ? middlewareModule.default : middlewareModule

    const router = container.lookup('router:main')

    const log = new Log()

    log.trace('Boot: creating express app instance')
    const app = express()
    _app.set(this, app)

    log.trace('Boot: loading cors middleware')
    if (typeof config.cors === 'object') {
      if (config.cors.preFlight === true) {
        app.options('*', cors(Object.assign({}, config.cors)))
      }
      app.use(cors(Object.assign({}, config.cors)))
    }

    if (config.helmet !== false) {
      log.trace('Boot: loading security middleware')
      app.use(helmet())
    }

    log.trace('Boot: adding body parsing middleware')
    const bodyParserOptions = config.bodyParser || {}
    if (typeof bodyParserOptions.json === 'object') {
      app.use(bodyparser.json(bodyParserOptions.json))
    }
    if (typeof bodyParserOptions.text === 'object') {
      app.use(bodyparser.text(bodyParserOptions.text))
    }
    if (typeof bodyParserOptions.raw === 'object') {
      app.use(bodyparser.raw(bodyParserOptions.raw))
    }
    if (typeof bodyParserOptions.urlencoded === 'object') {
      app.use(bodyparser.urlencoded(bodyParserOptions.urlencoded))
    }

    // const initializerDir = path.join(process.cwd(), 'app/initializers')
    // if (fs.existsSync(initializerDir)) {
    //   const initializers = fs.readdirSync(initializerDir).filter(file => file.indexOf('.js') !== -1)
    //   if (initializers.length > 0) {
    //     log.trace('Boot: loading initializers')
    //     initializers.forEach(initializerName => {
    //       const Module = require(initializerDir + '/' + initializerName)
    //       const Initializer = (Module.__esModule) ? Module.default : Module
    //       const initializer = new Initializer()
    //       initializer.init(app)
    //     })
    //   }
    // }

    // log.trace('Boot: loading middleware')
    // const middlewareDir = path.join(process.cwd(), 'app/middleware')
    // loadMiddleware(MiddlewareRouter.definition, app, middlewareDir)

    log.trace('Boot: loading routes')
    app.use(createRoutes(router.constructor.definition, {container, registry}))

    log.trace('Boot: registering 404 handler')
    app.use(function (request, response, next) {
      next(new HttpError(404))
    })

    log.trace('Boot: registering error handler')
    app.use(function (err, request, response, next) {
      log.error(err)
      if (!err.stack) {
        err = new HttpError(500)
      }
      let errorHandler
      const customErrorHandler = path.join(process.cwd(), 'app') + '/error-handler.js'
      if (fs.existsSync(customErrorHandler)) {
        const ErrorHandler = require(customErrorHandler)
        errorHandler = new ErrorHandler({request, response})
      } else {
        errorHandler = new ErrorHandler({request, response})
      }
      errorHandler.error(err)
    })

    app.listen(config.port, function () {
      log.trace(`Boot: started on port ${config.port}`)
    })
  }
}
