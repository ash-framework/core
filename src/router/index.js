'use strict'

const parseRouteObjects = require('ember-route-objects')
const createExpressRouter = require('express-object-defined-routes')
const ArgumentError = require('@ash-framework/argument-error')
const addRouteCallbacks = require('./add-route-callbacks')

module.exports = function (definition, options) {
  if (typeof definition !== 'function') {
    throw new ArgumentError('Router', 'definition',
      `Expected "definition" to be a function but "${typeof definition}" was given`)
  }
  if (typeof options !== 'object') {
    throw new ArgumentError('Router', 'options',
      `Expected "options" to be an object but "${typeof options}" was given`)
  }
  if (typeof options.routesDir !== 'string') {
    throw new ArgumentError('Router', 'options.routesDir',
      `Expected "options.routesDir" to be a string but "${typeof options.routesDir}" was given`)
  }

  // parse ember style route definitions into an object structure
  let routeObjects = parseRouteObjects(definition)
  routeObjects = addRouteCallbacks(routeObjects, options.routesDir)

  // return an express router that can be mounted using expresses app.use
  return createExpressRouter(routeObjects)
}
