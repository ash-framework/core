const parseRouteObjects = require('ember-route-objects')
const createExpressRouter = require('express-object-defined-routes')
const ArgumentError = require('@ash-framework/argument-error')
import addRouteCallbacks from './add-route-callbacks'

module.exports = function (definition, options) {
  if (typeof definition !== 'function') {
    throw new ArgumentError('Router', 'definition',
      `Expected "definition" to be a function but "${typeof definition}" was given`)
  }

  // parse ember style route definitions into an object structure
  let routeObjects = parseRouteObjects(definition)
  routeObjects = addRouteCallbacks(routeObjects, options)

  // return an express router that can be mounted using expresses app.use
  return createExpressRouter(routeObjects)
}
