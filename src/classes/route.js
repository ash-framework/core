'use strict'

const Http = require('./http')
const middleware = new WeakMap()

/**
 *
 * @class Route
 * @extends Http
 * @constructor
 */
module.exports = class Route extends Http {
  /**
   * @method constructor
   */
  constructor (context) {
    super(context)

    const mw = []
    this.constructor.middleware(middleware => mw.push(middleware))
    middleware.set(this, mw)
  }

  /**
   * @method hasMiddleware
   * @private
   */
  get hasMiddleware () {
    return middleware.get(this).length > 0
  }

  /**
   * @method registeredMiddleware
   * @private
   */
  get registeredMiddleware () {
    return middleware.get(this)
  }

  /**
   * Route middleware
   *
   * You can use this to register route specific middleware. ie. middleware specified here
   * will only run for this route. You can register the same piece of middleware in multiple
   * routes but you must do so explicitly by registering it in that routes `middleware` method.
   *
   * Call `register` with the name of the middleware in the `app/middleware` directory that
   * you want to load. You can call register multiple times to register more than one middleware
   * and middleware will be executed in the order registered.
   *
   * Example
   *
   * Example: registering middleware on a route
   * ```
   *
   * // app/routes/my-route.js
   * const Ash = require('@ash-framework/ash')
   *
   * module.exports = class MyRoute extends Ash.Route {
   *   static middleware (register) {
   *     register('')
   *   }
   * }
   * ```
   *
   * @method middleware
   * @static
   * @param {Function} register
   */
  static middleware (register) {
    // register('middleware-name')
  }

  /**
   * @method deserialize
   */
  deserialize () {

  }

  /**
   * @method beforeModel
   */
  beforeModel () {

  }

  /**
   * @method model
   */
  model () {
    console.log(`Route '${this.name}' must define a 'model' method`)
  }

  /**
   * @method afterModel
   */
  afterModel (model) {

  }

  /**
   * @method serialize
   */
  serialize (model) {

  }

  /**
   * @method error
   */
  error (err) {
    return err
  }
}
