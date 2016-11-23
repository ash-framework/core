'use strict'

const Http = require('./http')

const middleware = new WeakMap()

/**
 * @class Route
 * @extends Http
 */
module.exports = class Route extends Http {
  /**
   * @method constructor
   */
  constructor () {
    super()

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
