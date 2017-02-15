const HttpContext = require('@ash-framework/http-context')
const routeChain = require('./route-chain')
const routeSuccess = require('./route-success')

module.exports = function (Route, routeName) {
  return function (req, res, next) {
    res.statusCode = null
    const httpContext = new HttpContext(req, res)
    const route = new Route(httpContext)
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
        if (res.statusCode) {
          status = res.statusCode
        }
        routeSuccess(model, status, res)
      })
      .catch(next)
  }
}
