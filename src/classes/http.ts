import Base from './base'
import { Request, Response } from 'express'

/**
  Extends the `Base` class to add Http `request` and `response` properties.

  The `Http` class is intended to be used as a base class for any subclass that needs
  access to the http `request` and/or `response`.

  The class gains properties and methods from the request for convenience (effectively proxying them)
  and exposes the response (via `this.response`). The request itself is also available in full as
  needed via `this.request`

  @class Http
  @uses Inject
  @extends Base
  @constructor
*/
export default class Http extends Base {
  static classType: string = 'http'

  /**
    The http request object.

    This is the express request object
    See http://expressjs.com/en/api.html#req

    @property {Object} request
  */
  request: Request

  /**
    The http response object.

    This is the express response object
    See http://expressjs.com/en/api.html#res

    @property {Object} response
  */
  response: Response

  /**
    The request body

    Contains key-value pairs of data submitted in the request body
    @property {Object} body
  */
  body: any

  /**
    Named url parameters

    This property is an object containing properties mapped to named route parameters.
    This object defaults to {}.

    Example: defining parameters
    ```javascript
    // app/router.js
    Router.map(function () {
      this.route('users', {path: '/users/:user_id'})
    })
    ```

    Example: accessing defined parameters
    ```javascript
    this.params.user_id
    ```

    @property {Object} params
  */
  params: any

  /**
    This property is an object containing a property for each query
    string parameter in the route. If there is no query string, it is
    an empty object

    Example:
    ```javascript
    // /users?age=20&name=bob

    this.query.age // 20
    this.query.name // bob
    ```
    @property {Object} query
  */
  query: any

  /**
    The request headers object.
    Contains Key-value pairs of header names and values. Header names are lower-cased.

    Duplicates in raw headers are handled in the following ways, depending on the header name:

    Duplicates of age, authorization, content-length, content-type, etag, expires, from, host, if-modified-since, if-unmodified-since, last-modified, location, max-forwards, proxy-authorization, referer, retry-after, or user-agent are discarded.
    set-cookie is always an array. Duplicates are added to the array.
    For all other headers, the values are joined together with ', '.

    Example:
    ```javascript
    this.headers
    // { 'user-agent': 'curl/7.22.0',
    //   host: '127.0.0.1:3010',
    //   accept: '*\/*' }
    ```

    @property {Object} headers
  */
  headers: any

  /**
    Contains a string corresponding to the HTTP method of the
    request: GET, POST, PUT, and so on.

    Example:
    ```javascript
    this.method // GET
    ```

    @property {Object} method
  */
  method: string

  /**
    Constructs a new http object.
    Sets up request and response properties and injects services if defined.

    Sets the following properties on the route:
    - request (express request)
    - response (express response)
    - body (request body)
    - params (request url named parameters)
    - query (request url query parameters)
    - headers (request headers)
    - method (request method)

    Services are injected under the defined injection property.

    Example:
    Given the following service definition:
    ```javascript
    static services(register) {
      register('authentication')
    }
    ```
    The route will be able to access the service:

    ```javascript
    this.authentication
    ```

    @method constructor
    @param {Object} context - object with properties `request` and `response`
    which are the express js request and reponse objects respectively
  */
  constructor(options: { request: Request, response: Response }) {
    super(options)
    const { body, params, query, headers, method } = options.request

    this.body = body
    this.params = params
    this.query = query
    this.headers = headers
    this.method = method

    this.request = options.request
    this.response = options.response
  }

  /**
    Checks if the specified content types are acceptable, based on the request’s Accept HTTP header field.

    Example:
    ```javascript
    this.accepts(['json', 'text'])
    // => "json"
    ```

    Note: This is a proxy of the express js `request.accepts` method.

    @method accepts
    @param {Mixed} types - may be a single MIME type string (such as “application/json”),
    an extension name such as “json”, a comma-delimited list.
    @return {Mixed} Returns the best match, or if none of the specified content types is acceptable,
    returns false.
  */
  accepts(types: string): string | boolean {
    return this.request.accepts(types)
  }

  /**
    Determines if the incoming request’s “Content-Type” HTTP header field matches
    the MIME type specified by the type parameter.

    Note: This is a proxy of the express js `request.is` method.

    Example:
    ```javascript
    // When Content-Type is application/json
    this.is('json')
    this.is('application/json')
    this.is('application/')
    // => true
    ```

    @method is
    @param {String} type
    @return {Mixed} Returns `true` if the incoming request’s “Content-Type” HTTP header field matches
    the MIME type specified by the type parameter. Returns `false` otherwise.
  */
  is(type: string): boolean {
    return this.request.is(type)
  }
}
