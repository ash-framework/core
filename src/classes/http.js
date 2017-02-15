'use strict'

const Base = require('./base')
const Inject = require('./inject')

/**
 * Extends the `Base` class to add Http `request` and `response` properties.
 *
 * The `Http` class is intended to be used as a base class for any subclass that needs
 * access to the http `request` and/or `response`.
 *
 * The class gains properties and methods from the request for convenience (effectively proxying them)
 * and exposes the response (via `this.response`). The request itself is also available in full as
 * needed via `this.request`
 *
 * @class Http
 * @uses Inject
 * @extends Base
 * @constructor
 */
module.exports = class Http extends Base {
  /**
   * The http request object.
   *
   * This is the express request object
   * @see http://expressjs.com/en/api.html#req
   *
   * @property {Object} request
   */

  /**
   * The http response object.
   *
   * This is the express response object
   * @see http://expressjs.com/en/api.html#res
   *
   * @property {Object} response
   */

  /**
   * The request body
   *
   * Contains key-value pairs of data submitted in the request body
   * @property {Object} body
   */

  /**
   * Named url parameters
   *
   * This property is an object containing properties mapped to named route parameters.
   * This object defaults to {}.
   *
   * Example: defining parameters
   * ```
   *
   * // app/router.js
   * Router.map(function () {
   *   this.route('users', {path: '/users/:user_id'})
   * })
   * ```
   *
   * Example: accessing defined parameters
   * ```
   *
   * this.params.user_id
   * ```
   *
   * @property {Object} params
   */

  /**
   * This property is an object containing a property for each query
   * string parameter in the route. If there is no query string, it is
   * an empty object
   *
   * Example:
   * ```
   *
   * // /users?age=20&name=bob
   *
   * this.query.age // 20
   * this.query.name // bob
   * ```
   *
   * @property {Object} query
   */

  /**
   * The request headers object.
   * Contains Key-value pairs of header names and values. Header names are lower-cased.
   *
   * Duplicates in raw headers are handled in the following ways, depending on the header name:
   *
   * Duplicates of age, authorization, content-length, content-type, etag, expires, from, host, if-modified-since, if-unmodified-since, last-modified, location, max-forwards, proxy-authorization, referer, retry-after, or user-agent are discarded.
   * set-cookie is always an array. Duplicates are added to the array.
   * For all other headers, the values are joined together with ', '.
   *
   * Example:
   * ```
   * this.headers
   * // { 'user-agent': 'curl/7.22.0',
   * //   host: '127.0.0.1:3010',
   * //   accept: '*\/*' }
   * ```
   *
   * @property {Object} headers
   */

  /**
   * Contains a string corresponding to the HTTP method of the
   * request: GET, POST, PUT, and so on.
   *
   * Example:
   * ```
   *
   * this.method // GET
   * ```
   *
   * @property {Object} method
   */

  /**
   * Constructs a new http object.
   * Sets up request and response properties and injects services if defined.
   *
   * Sets the following properties on the route:
   * - request (express request)
   * - response (express response)
   * - body (request body)
   * - params (request url named parameters)
   * - query (request url query parameters)
   * - headers (request headers)
   * - method (request method)
   *
   * Services are injected under the defined injection property.
   *
   * Example:
   * Given the following service definition:
   * ```
   *
   * services(register) {
   *   register('authentication')
   * }
   * ```
   * The route will be able to access the service:
   * ```
   *
   * this.authentication
   * ```
   *
   * @method constructor
   *
   * @param {Object} context - object with properties `request` and `response`
   * which are the express js request and reponse objects respectively
   */
  constructor (context) {
    super(context)

    const {request, response} = context
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
   * Used to define which services should be registered on the class.
   *
   * Call the `register` function as many times as needed to register services.
   * Services are referenced by their name and will be looked up by the framework
   * and injected onto the instance.
   *
   * Example:
   * ```
   *
   * class MyClass extends Http {
   *   services (register) {
   *     register('authentication')
   *     register('user')
   *   }
   * }
   * ```
   *
   * In the example above, the `authentication` service will be looked up from the `app/services`
   * directory and injected onto the instance as `this.authentication`. The user service will be
   * injected in the same manor afterwards.
   *
   * @method services
   * @static
   * @param {Function} register - takes a string name of the service to inject as its only argument.
   */
  static services (register) {
    register('store')
  }

  /**
   * Checks if the specified content types are acceptable, based on the request’s Accept HTTP header field.
   *
   * Example:
   * ```
   *
   * this.accepts(['json', 'text']);
   * // => "json"
   * ```
   *
   * Note: This is a proxy of the express js `request.accepts` method.
   *
   * @method accepts
   * @param {Mixed} types - may be a single MIME type string (such as “application/json”),
   * an extension name such as “json”, a comma-delimited list, or an array.
   * @return {Mixed} Returns the best match, or if none of the specified content types is acceptable,
   * returns false.
   */
  accepts (types) {
    return this.request.accepts(types)
  }

  /**
   * Determines if the incoming request’s “Content-Type” HTTP header field matches
   * the MIME type specified by the type parameter.
   *
   * Note: This is a proxy of the express js `request.is` method.
   *
   * Example:
   * ```
   *
   * // When Content-Type is application/json
   * this.is('json');
   * this.is('application/json');
   * this.is('application/*');
   * // => true
   * ```
   *
   * @method is
   * @param {String} type
   * @return {Mixed} Returns `true` if the incoming request’s “Content-Type” HTTP header field matches
   * the MIME type specified by the type parameter. Returns `false` otherwise.
   */
  is (type) {
    return this.request.is(type)
  }
}
