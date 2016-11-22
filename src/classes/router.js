'use strict'

const Base = require('./base')

module.exports = class Router extends Base {
  static map (definition) {
    this.definition = definition
  }
}
