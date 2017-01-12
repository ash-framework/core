'use strict'

const Base = require('./base')

/**
 *
 * @class Serializer
 * @extends Base
 * @constructor
 */
module.exports = class Serializer extends Base {
  serialize (Model, data) {
    return data
  }
}
