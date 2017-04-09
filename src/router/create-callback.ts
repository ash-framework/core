import * as HttpContext from '@ash-framework/http-context'
import routeChain from './route-chain'
import routeSuccess from './route-success'
import { Request, Response } from 'express'
import { Route } from '../'
import { injectServices } from '../classes/utils'

export default function (Route: any, routeName: string) {
  return function (request: Request, response: Response, next: Function) {
    response.statusCode = null
    Route.class.routeName = routeName

    const route: Route = Route.create({ request, response })
    injectServices(route, Route.class.services)

    routeChain(route)
      .then(model => {
        let status = 200
        if (!model) {
          status = 204
        }
        if (response.statusCode) {
          status = response.statusCode
        }
        routeSuccess(model, status, response)
      })
      .catch(err => next(err))
  }
}
