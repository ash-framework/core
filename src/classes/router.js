'use strict'

const Base = require('./base')

/**
  @class Router
  @extends Base
  @public
*/
module.exports = class Router extends Base {
  /**
    @method map
    @static
    @public
    @param {Object} definition
  */
  static map (definition) {
    this.definition = definition
  }
}
