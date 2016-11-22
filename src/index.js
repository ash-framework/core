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

const Ash = {
  Route,
  Router,
  Middleware,
  MiddlewareRouter,
  log: new Log(),
  Application,
  Mixin,
  Initializer,
  HttpError,
  ErrorHandler,
  Service
}

module.exports = Ash
