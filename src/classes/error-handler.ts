import Http from './http'

/**
  Base error handler for Ash applications. Users can choose to inherit
  from this class and override its error method in order to define a
  custom error handler for their application.

  ```
  // app/error-handler.js
  const Ash = require('@ash-framework/ash')

  class ErrorHandler extends Ash.ErrorHandler {
    error (err) {
      super.error(err)
      // perform custom operations
    }
  }
  ```

  @class ErrorHandler
  @public
  @extends Http
*/
export default class ErrorHandler extends Http {
  static classType: string = 'error-handler'

  /**
    Method called by Ash whenever an error occurs. This includes 404 errors

    @method error
    @public
    @param {Object} err - error object with properties `status` and `message`
  */
  error(err: { status: number, message: string }) {
    const status = err.status || 500
    this.response.status(status)
    if (this.accepts('json')) {
      this.response.send({ status, error: err.message })
    } else {
      this.response.send(err.message)
    }
  }
}
