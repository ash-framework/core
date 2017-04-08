'use strict'

import Base from './base'
import { Application } from 'express'

export function initializer(...initializerNames: Array<string>): Function {
  return function (target: { initializers: Array<string> }) {
    for (const name of initializerNames) {
      target.initializers.push(name)
    }
  }
}

/**
  Provides access to the express app object.
  This can be used to do any low level express setup.

  @class Initializer
  @extends Base
  @public
*/
export default class Initializer extends Base {
  /**
    Override the init method in any initializer to gain
    access to the express app.

    Example:
    ```javascript
    init (app) {
      app.use(function (req, res, next) {
        next()
      })

      app.get('/version', function (req, res) {
        res.send({
          version: 2
        })
      })
    }
    ```
    @method init
    @public
    @param {Object} app
  */
  init(app: Application) {

  }
}
