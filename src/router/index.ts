import parseRouteObjects from 'ember-route-objects'
import createExpressRouter from 'express-object-defined-routes'
import ArgumentError from '@ash-framework/argument-error'
import addRouteCallbacks from './add-route-callbacks'

export default function (definition, options) {
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
