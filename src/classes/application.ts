'use strict'

import Base from './base'
import ErrorHandler from './error-handler'
import * as Log from '@ash-framework/log'
import * as HttpError from '@ash-framework/http-error'
import { registry, container } from './di'
import createRoutes from '../router'
import { runInitializers, runMiddleware } from './utils'

import * as express from 'express'
import * as path from 'path'
import * as fs from 'fs'
import * as cors from 'cors'
import * as helmet from 'helmet'
import * as bodyparser from 'body-parser'

export interface Config {
  cors: { preFlight: boolean }
  helmet: boolean
  bodyParser: {
    json: boolean | {},
    text: boolean | {},
    raw: boolean | {},
    urlencoded: boolean | {}
  }
  port: number
}

/**
  Application class used to create a new instance of an Ash application
  via the static method `start`

  @class Application
  @extends Base
  @public
*/
export default class Application extends Base {
  static classType: string = 'application'
  static initializers: Array<string> = []
  static middleware: Array<string> = []
  private static _log: Log = null
  private static _app: express.Application = null

  static get config(): Config {
    const configModule = require(path.join(process.cwd(), 'config/environment.js'))
    return ((configModule.__esModule) ? configModule.default : configModule)(process.env.NODE_ENV)
  }

  static get log() {
    if (!this._log) {
      this._log = new Log()
      this._log.trace('Boot: creating application logger instance')
    }
    return this._log
  }

  static get app() {
    if (!this._app) {
      this.log.trace('Boot: creating express app instance')
      this._app = express()
    }
    return this._app
  }

  static setupRoutes() {
    const router = container.lookup('router:main')
    this.log.trace('Boot: loading routes')
    this.app.use(createRoutes(router.constructor.definition, { container }))
  }

  static initialize(): Promise<void> {
    this.log.trace('Boot: loading initializers')
    return runInitializers(this.initializers, this.app)
  }

  static setupMiddleware() {
    this.log.trace('Boot: loading middleware')
    this.app.use((req, res, next) => {
      runMiddleware(this.middleware, req, res)
        .then(() => next())
        .catch(err => next(err))
    })
  }

  static setup404Hander() {
    this.log.trace('Boot: registering 404 handler')
    this.app.use((request, response, next) => {
      next(new HttpError(404))
    })
  }

  static setupErrorHandler() {
    this.log.trace('Boot: registering error handler')
    this.app.use((err, request, response, next) => {
      this.log.error(err)
      if (!err.stack) {
        err = new HttpError(500)
      }
      let errorHandler
      const customErrorHandler = path.join(process.cwd(), 'app') + '/error-handler.js'
      if (fs.existsSync(customErrorHandler)) {
        const ErrorHandler = require(customErrorHandler)
        errorHandler = new ErrorHandler({ request, response })
      } else {
        errorHandler = new ErrorHandler({ request, response })
      }
      errorHandler.error(err)
    })
  }

  static bootApplication() {
    return new Promise(resolve => {
      this.app.listen(this.config.port, () => {
        this.log.trace(`Boot: started on port ${this.config.port}`)
        resolve()
      })
    })
  }

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
  static async start(): Promise<void> {
    // log.trace('Boot: loading cors middleware')
    // if (this.config.cors.preFlight === true) {
    //   app.options('*', cors(Object.assign({}, this.config.cors)))
    // }
    // app.use(cors(Object.assign({}, this.config.cors)))

    // if (this.config.helmet === true) {
    //   log.trace('Boot: loading security middleware')
    //   app.use(helmet())
    // }

    // log.trace('Boot: adding body parsing middleware')
    // const bodyParserOptions = this.config.bodyParser
    // if (typeof bodyParserOptions.json === 'object') {
    //   app.use(bodyparser.json(bodyParserOptions.json))
    // }
    // if (typeof bodyParserOptions.text === 'object') {
    //   app.use(bodyparser.text(bodyParserOptions.text))
    // }
    // if (typeof bodyParserOptions.raw === 'object') {
    //   app.use(bodyparser.raw(bodyParserOptions.raw))
    // }
    // if (typeof bodyParserOptions.urlencoded === 'object') {
    //   app.use(bodyparser.urlencoded(bodyParserOptions.urlencoded))
    // }

    await this.initialize()
    this.setupMiddleware()
    this.setupRoutes()
    this.setup404Hander()
    this.setupErrorHandler()
    await this.bootApplication()
  }
}
