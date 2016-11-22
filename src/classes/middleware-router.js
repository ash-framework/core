'use strict'

const Base = require('./base')

module.exports = class MiddlewareRouter extends Base {
  static map (definition) {
    this.definition = definition
  }
}
