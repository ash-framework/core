'use strict'

const services = new Map()
const path = require('path')

module.exports = class Inject {
  static service (context, serviceName) {
    const {request} = context
    if (!services.has(serviceName)) {
      services.set(serviceName, new WeakMap())
    }
    const service = services.get(serviceName)
    if (!service.has(request)) {
      const Service = require(path.join(process.cwd(), 'app', 'services') + '/' + serviceName)
      service.set(request, new Service())
    }
    context[serviceName] = service.get(request)
  }
}
