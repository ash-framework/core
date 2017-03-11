'use strict'

const Base = require('./base')
const serializer = require('loopback-jsonapi-model-serializer')
const loopback = require('loopback')
const ds = loopback.createDataSource('memory')
const path = require('path')

/**
  Translates an Ash model definition to a loopback definition
  which can be used with loopback-jsonapi-model-serializer
  @param {Object} Model
*/
function translateToLoopbackModel (Model) {
  const LoopbackModel = ds.createModel(Model.modelName, Object.assign({}, Model.definition.attributes))
  LoopbackModel.pluralModelName = Model.type

  Object.keys(Model.definition.relationships).forEach(relationshipName => {
    const relatedModelName = Model.definition.relationships[relationshipName].modelTo
    const RelatedModel = Model.store.modelFor(relatedModelName)

    const RelatedLoopbackModel = ds.createModel(RelatedModel.modelName, Object.assign({}, RelatedModel.definition.attributes))
    RelatedLoopbackModel.pluralModelName = RelatedModel.type

    if (Model.definition.relationships[relationshipName].type === 'belongsTo') {
      LoopbackModel.belongsTo(RelatedLoopbackModel)
    } else {
      LoopbackModel.hasMany(RelatedLoopbackModel)
    }
  })

  return LoopbackModel
}

/**
  @class Serializer
  @extends Base
  @public
*/
module.exports = class Serializer extends Base {
  /**
    @method serialize
    @public
    @param {Object} Model
    @param {Object} data
    @param {Object} options
    @return {Object}
  */
  serialize (Model, data, options) {
    if (!data) return {data: null}
    const LoopbackModel = translateToLoopbackModel(Model)
    const config = require(path.join(process.cwd(), 'config', 'environment'))(process.env)
    return serializer(data, LoopbackModel, Object.assign({}, {baseUrl: `${config.host}:${config.port}`}, options))
  }
}
