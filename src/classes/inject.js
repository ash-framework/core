'use strict'

const services = new Map()
const path = require('path')

/**
 *
 * @class Inject
 * @constructor
 * @private
 */
module.exports = class Inject {
  /**
   * @method service
   * @static
   * @param {Object} context
   * @param {String} serviceName
   */
  static service (context, serviceName) {
    const {request} = context
    if (!services.has(serviceName)) {
      services.set(serviceName, new WeakMap())
    }
    const service = services.get(serviceName)
    if (!service.has(request)) {
      let Service
      try {
        const Module = require(path.join(process.cwd(), 'app', 'services') + '/' + serviceName)
        Service = (Module.__esModule) ? Module.default : Module
      } catch (error) {
        const Module = require(path.join(__dirname, '/', serviceName))
        Service = (Module.__esModule) ? Module.default : Module
      }
      service.set(request, new Service())
    }
    context[serviceName] = service.get(request)
  }

  /**
   * Registers mixins on a class as defined by that classes static mixins method.
   *
   * @method mixins
   * @static
   * @param {Object} context instantiated object to have mixins to applied to.
   */
  static mixins (context) {
    const mixins = []
    context.constructor.mixins(mixin => {
      mixins.push(mixin)
    })

    const className = context.constructor.name

    // assign mixed in class the same name as the base class via
    // assigning an anonymous class to a variable
    const tempClass = { [className]: class extends context.constructor {} }
    mixins.forEach(Mixin => {
      const methodNames = Object.getOwnPropertyNames(Mixin.prototype)
        .filter(name => name !== 'constructor')

      for (let name of methodNames) {
        const descriptor = Reflect.getOwnPropertyDescriptor(Mixin.prototype, name)
        Reflect.defineProperty(tempClass[className].prototype, name, descriptor)
      }
      Object.setPrototypeOf(context, tempClass[className].prototype)
      context.constructor = tempClass[className]
    })
  }
}
