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
const JSONAPISerializer = require('./classes/jsonapi-serializer')

/**
 * The top level Ash namespace.
 * All access to Ash classes is through this object
 *
 * @class Ash
 */
const Ash = {
  /**
   * @property {Route} Route
   */
  Route,

  /**
   * @property {Router} Router
   */
  Router,

  /**
   * @property {Middleware} Middleware
   */
  Middleware,

  /**
   * @property {MiddlewareRouter} MiddlewareRouter
   */
  MiddlewareRouter,

  /**
   * Instance of the Ash logger. Should be use throughout to log as needed.
   *
   * Has the following methods:
   * - log.error
   * - log.info
   * - log.trace
   * - log.warn
   * - log.debug
   * - log.fatal
   *
   * @property {Object} log
   */
  log: new Log(),

  /**
   * @property {Application} Application
   */
  Application,

  /**
   * @property {Mixin} Mixin
   */
  Mixin,

  /**
   * @property {Initializer} Initializer
   */
  Initializer,

  /**
   * This error should be used to throw Http related errors
   *
   * ```
   *
   * throw new Ash.HttpError(404)
   * ```
   *
   * An optional message can be given
   *
   * ```
   *
   * throw new Ash.HttpError(404, 'Nothing was found, sorry about that.')
   * ```
   * @property {HttpError} HttpError
   */
  HttpError,

  /**
   * @property {ErrorHandler} ErrorHandler
   */
  ErrorHandler,

  /**
   * @property {Service} Service
   */
  Service,

  Model,

  JSONAPISerializer,

  Adapter,

  Serializer
}

module.exports = Ash
