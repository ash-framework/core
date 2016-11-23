'use strict'

const Http = require('./http')

/**
 * @class ErrorHandler
 * @extends Http
 */
module.exports = class ErrorHandler extends Http {
  /**
   * @method error
   * @param {Object} err
   */
  error (err) {
    const status = err.status || 500
    this.response.status(status)
    if (this.accepts('json')) {
      this.response.send({status, error: err.message})
    } else {
      this.response.send(err.message)
    }
  }
}
