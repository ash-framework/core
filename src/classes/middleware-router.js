'use strict'

const Base = require('./base')

/**
 * @class MiddlewareRouter
 * @extends Base
 */
module.exports = class MiddlewareRouter extends Base {
  /**
   * @method map
   * @static
   * @param {Object} definition
   */
  static map (definition) {
    this.definition = definition
  }
}
