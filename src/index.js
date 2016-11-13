'use strict'

const {
  Route,
  Router,
  Middleware,
  MiddlewareRouter,
  Mixin,
  Initializer
} = require('@ash-framework/classes')

const Log = require('@ash-framework/log')
const HttpError = require('@ash-framework/http-error')

const Application = require('./classes/application')

const Ash = {
  Route,
  Router,
  Middleware,
  MiddlewareRouter,
  log: new Log(),
  Application,
  Mixin,
  Initializer,
  HttpError
}

module.exports = Ash
