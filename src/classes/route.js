'use strict'

const Http = require('./http')
const middleware = new WeakMap()

/**
 * The Ash route class extends the @see Http class and so has access
 * to request and response properties.
 *
 * Routes execute via a series of hooks in the following order
 *
 * 1. deserialize
 * 2. beforeModel
 * 3. model
 * 4. afterModel
 * 5. serialize
 *
 * If a hook returns a promise, the subsequent hook will not execute until the promise has resolved.
 *
 * All hooks are optional except for `model` and amything returned from the `model` hook will be returned
 * to the client.
 *
 * Routes support the following:
 * - mixins (@see Mixin)
 * - services (@see Service)
 * - middleware (@see Middleware)
 *
 * @class Route
 * @extends Http
 * @constructor
 */
module.exports = class Route extends Http {
  /**
   *
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
   *     register('my-middleware')
   *   }
   * }
   * ```
   *
   * @method middleware
   * @static
   * @param {Function} register
   */
  static middleware (register) {

  }

  /**
   * The first hook to be executed during the lifecycle of a route.
   * This hook should generally be used to perform operations on an incoming
   * request body. As such it makes more sense to use this hook for POSTs, PUTs and PATCHs
   * rather than GETs and DELETEs.
   *
   * @method {Function} deserialize
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
   * @param {Object} model
   */
  afterModel (model) {

  }

  /**
   * @method serialize
   * @param {Object} model
   */
  serialize (model) {

  }

  /**
   * @method error
   * @param {Object} error
   */
  error (error) {
    return error
  }

  /**
   * The name of the route. This is the same as the name of the route js file (without the .js)
   * and not the name of the exported class. For the name of the class use `this.name`
   *
   * @property {String} routeName
   */
}
