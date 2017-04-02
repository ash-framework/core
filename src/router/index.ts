import * as parseRouteObjects from 'ember-route-objects'
import * as createExpressRouter from 'express-object-defined-routes'
import * as ArgumentError from '@ash-framework/argument-error'
import addRouteCallbacks from './add-route-callbacks'
import { Options } from './add-route-callbacks'

export default function (definition: Function, options: Options) {
  // parse ember style route definitions into an object structure
  let routeObjects = parseRouteObjects(definition)
  routeObjects = addRouteCallbacks(routeObjects, options)

  // return an express router that can be mounted using expresses app.use
  return createExpressRouter(routeObjects)
}
