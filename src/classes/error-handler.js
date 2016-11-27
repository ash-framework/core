'use strict'

const Http = require('./http')

/**
 * Base error handler for Ash applications. Users can choose to inherit
 * from this class and override its error method in order to define a
 * custom error handler for their application.
 *
 * ```
 *
 * // app/error-handler.js
 * const Ash = require('@ash-framework/ash')
 *
 * class ErrorHandler extends Ash.ErrorHandler {
 *   error (err) {
 *     super.error(err)
 *     // perform custom operations
 *   }
 * }
 * ```
 *
 * @class ErrorHandler
 * @extends Http
 * @constructor
 */
module.exports = class ErrorHandler extends Http {
  /**
   * Method called by Ash whenever an error occurs. This includes 404 errors
   *
   * @method error
   * @param {Object} err - error object with properties `status` and `message`
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
