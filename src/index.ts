/**
 * Provides the Ash application framework
 *
 * @module Ash
 * @main
 */
import Application from './classes/application'
import Route from './classes/route'
import Router from './classes/router'
import Middleware from './classes/middleware'
import MiddlewareRouter from './classes/middleware-router'
import Mixin from './classes/mixin'
import Initializer from './classes/initializer'
import ErrorHandler from './classes/error-handler'
import Service from './classes/service'
// import * as Model from './classes/model'
// import * as Adapter from './classes/adapter'
// import * as Serializer from './classes/serializer'

const HttpError = require('@ash-framework/http-error')

const Log = require('@ash-framework/log')
const log = new Log()

/**
 * The top level Ash namespace.
 * All access to Ash classes is through this object
 *
 * @class Ash
 */
export {
  /**
    @property {Route} Route
    @public
  */
  Route,

  /**
    @property {Router} Router
    @public
  */
  Router,

  /**
    @property {Middleware} Middleware
    @public
  */
  Middleware,

  /**
    @property {MiddlewareRouter} MiddlewareRouter
    @public
  */
  MiddlewareRouter,

  /**
    Instance of the Ash logger. Should be use throughout to log as needed.

    Has the following methods:
    - log.error
    - log.info
    - log.trace
    - log.warn
    - log.debug
    - log.fatal

    @property {Object} log
    @public
  */
  log,

  /**
    @property {Application} Application
    @public
  */
  Application,

  /**
    @property {Mixin} Mixin
    @public
  */
  Mixin,

  /**
    @property {Initializer} Initializer
    @public
  */
  Initializer,

  /**
    This error should be used to throw Http related errors

    ```

    throw new Ash.HttpError(404)
    ```

    An optional message can be given

    ```

    throw new Ash.HttpError(404, 'Nothing was found, sorry about that.')
    ```
    @property {HttpError} HttpError
    @public
  */
  HttpError,

  /**
    @property {ErrorHandler} ErrorHandler
    @public
  */
  ErrorHandler,

  /**
    @property {Service} Service
    @public
  */
  Service,
}

export default Application
