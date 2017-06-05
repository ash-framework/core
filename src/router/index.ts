import * as parseRouteObjects from 'ember-route-objects'
import * as createExpressRouter from 'express-object-defined-routes'
import { RouteDefinitions } from './route-definitions'
import { Container } from '@glimmer/di'

export interface Options {
  container: Container
}

export default function (definition: Function, options: Options) {
  // parse ember style route definitions into an object structure
  let routeObjects = parseRouteObjects(definition)

  const routeDefinitions = RouteDefinitions.create(options.container)
  const definitions = routeDefinitions.buildDefinitions('', routeObjects)

  // return an express router that can be mounted using expresses app.use
  return createExpressRouter(definitions)
}
