import Base from './base'
import { container } from './di'
import { Request, Response } from 'express'

/**
  `Middleware` in Ash is implemented as a class that has access to the request and the response.
  A register method is called by the framework and needs to be implemented for the middleware to run.

  Middleware should be used in conjunction with services to perform useful operations
  before the route is executed.

  @class Middleware
  @public
  @extends Http
*/
export default class Middleware extends Base {
  /**
    Registers code to be executed as middleware.

    Example:
    ```javascript
    class Token extends Middleware {
      @service('store') store = {}
      @service('current-user) currentUser = {}

      static register (request, response) {
        const token = request.query.token
        return this.store.query('user', {filter: {token}}).then(user => {
          this.currentUser.id = user.id
          this.currentUser.name = user.name
        })
      }
    }
    ```

    Note. Returning a promise from the `register` function causes later middleware or
    the route to wait for the promise to resolve as in the example above.

    @static
    @method register
    @public
  */
  static register(request: Request, response: Response) {

  }
}

export function middleware (...middlewareNames: Array<string>): Function {
  return function (target: {middleware: Array<any>}) {
    for (const name of middlewareNames) {
      target.middleware.push(container.lookup(`middleware:${name}`))
    }
  }
}
