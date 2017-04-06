import * as HttpContext from '@ash-framework/http-context'
import routeChain from './route-chain'
import routeSuccess from './route-success'
import { Request, Response } from 'express'
import { Route } from '../'

export default function (Route: any, routeName: string) {
  return function (request: Request, response: Response, next: Function) {
    response.statusCode = null

    const route: Route = Route.create({ request, response })
    Route.routeName = routeName
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
