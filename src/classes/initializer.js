'use strict'

const Base = require('./base')

/**
  Provides access to the express app object.
  This can be used to do any low level express setup.

  @class Initializer
  @extends Base
  @public
*/
module.exports = class Initializer extends Base {
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
  init (app) {
    throw new Error(`Initializer ${this.constructor.name} must override init method. Signature: init (app) {} `)
  }
}
