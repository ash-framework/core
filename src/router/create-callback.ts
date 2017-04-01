import * as HttpContext from '@ash-framework/http-context'
const routeChain = require('./route-chain')
const routeSuccess = require('./route-success')

export default function (Route, routeName = null) {
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
