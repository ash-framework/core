import * as HttpContext from '@ash-framework/http-context'
import routeChain from './route-chain'
import routeSuccess from './route-success'

export default function (Route, routeName: string = null) {
  return function (request, response, next) {
    response.statusCode = null

    const route = Route.create({ request, response })
    route.routeName = routeName
    routeChain(route)
      .then(model => {
        let status = 200
        if (!model) {
          status = 204
        }
        if (route.method === 'post') {
          status = 201
        }
        if (response.statusCode) {
          status = response.statusCode
        }
        routeSuccess(model, status, response)
      })
      .catch(next)
  }
}
