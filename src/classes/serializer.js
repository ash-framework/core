'use strict'

const Base = require('./base')
const serializer = require('loopback-jsonapi-model-serializer')
const loopback = require('loopback')

/**
 * Translates an Ash model definition to a loopback definition
 * which can be used with loopback-jsonapi-model-serializer
 * @param {Object} Model
 */
function translateToLoopbackModel (Model) {
  const LoopbackModel = loopback.createModel({
    name: Model.name,
    properties: Model.definition.attributes,
    relations: Model.definition.relations
  })
  LoopbackModel.pluralModelName = Model.type

  const ds = loopback.createDataSource('memory')
  ds.attach(LoopbackModel)

  return LoopbackModel
}

/**
 *
 * @class Serializer
 * @extends Base
 * @constructor
 */
module.exports = class Serializer extends Base {
  serialize (Model, data, options) {
    const LoopbackModel = translateToLoopbackModel(Model)
    return serializer(data, LoopbackModel, options)
  }
}
