'use strict'

const Base = require('./base')
const Inject = require('./inject')

/**
 * Extends Base to add Http request and response properties
 *
 * @class Http
 * @extends Base
 */
module.exports = class Http extends Base {
  /**
   * @property request
   */

  /**
   * @property response
   */

  /**
   * @property body
   */

  /**
   * @property params
   */

  /**
   * @property query
   */

  /**
   * @property headers
   */

  /**
   * @property method
   */

  /**
   * @method constructor
   * @constructor
   */
  constructor (...args) {
    super(...args)

    const {request, response} = args[0]
    const {body, params, query, headers, method} = request

    this.body = body
    this.params = params
    this.query = query
    this.headers = headers
    this.method = method

    this.request = request
    this.response = response

    this.constructor.services(service => {
      Inject.service(this, service)
    })
  }

  /**
   * @method services
   * @static
   */
  static services () {

  }

  /**
   * @method accepts
   */
  accepts (types) {
    return this.request.accepts(types)
  }

  /**
   * @method is
   */
  is (type) {
    return this.request.is(type)
  }
}
