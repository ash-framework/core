/**
 * Provides the Ash application framework
 *
 * @module Ash
 * @main
 */

'use strict'

const Log = require('@ash-framework/log')
const HttpError = require('@ash-framework/http-error')
const Application = require('./classes/application')
const Route = require('./classes/route')
const Router = require('./classes/router')
const Middleware = require('./classes/middleware')
const MiddlewareRouter = require('./classes/middleware-router')
const Mixin = require('./classes/mixin')
const Initializer = require('./classes/initializer')
const ErrorHandler = require('./classes/error-handler')
const Service = require('./classes/service')
const Model = require('./classes/model')
const Adapter = require('./classes/adapter')
const Serializer = require('./classes/serializer')

/**
 * The top level Ash namespace.
 * All access to Ash classes is through this object
 *
 * @class Ash
 */
const Ash = {
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
  log: new Log(),

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

  /**
    @property {Model} Model
    @public
  */
  Model,

  /**
    @property {Adapter} Adapter
    @public
  */
  Adapter,

  /**
    @property {Serializer} Serializer
    @public
  */
  Serializer
}

module.exports = Ash
