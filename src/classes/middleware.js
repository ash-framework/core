'use strict'

const Http = require('./http')

/**
 * `Middleware` in Ash is implemented as a class that has access to the request and the response.
 * A register method is called by the framework and needs to be implemented for the middleware to run.
 *
 * Since `Middleware` extends `Http`, it has access to `request` properties such as
 * `this.params`, `this.query` and so on directly as well as other properties indirectly through
 * `this.request` and `this.response`
 *
 * Middleware should be used in conjunction with services to perform useful operations
 * before the route is executed.
 *
 * @class Middleware
 * @extends Http
 * @constructor
 */
module.exports = class Middleware extends Http {
  /**
   * Registers code to be executed as middleware.
   *
   * Example:
   * ```
   * class Token extends Ash.Middleware {
   *   services (register) {
   *     register('db')
   *     register('current-user')
   *   }
   *
   *   register () {
   *     const token = this.query.token
   *     return this.db.find('users', {token}).then(user => {
   *       this.currentUser.id = user.id
   *       this.currentUser.name = user.name
   *     })
   *   }
   * }
   * ```
   * In the above example we register 2 services, look up a user based on the token
   * in the url query string and then set the returned user as the current user.
   *
   * Note. Returning a promise from the `register` function causes later middleware or
   * the route to wait for the promise to resolve as in the example above.
   *
   * @method register
   */
  register () {

  }
}
