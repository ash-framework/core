'use strict'

const {Route, Router, Middleware, MiddlewareRouter, Mixin} = require('@ash-framework/classes')
const Log = require('@ash-framework/log')

const Application = require('./classes/application')

const Ash = {
  Route,
  Router,
  Middleware,
  MiddlewareRouter,
  log: new Log(),
  Application,
  Mixin
}

module.exports = Ash
