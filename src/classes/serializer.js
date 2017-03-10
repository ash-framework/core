'use strict'

const Base = require('./base')
const serializer = require('loopback-jsonapi-model-serializer')
const loopback = require('loopback')
const ds = loopback.createDataSource('memory')

/**
  Translates an Ash model definition to a loopback definition
  which can be used with loopback-jsonapi-model-serializer
  @param {Object} Model
*/
function translateToLoopbackModel (Model) {
  const LoopbackModel = ds.createModel(Model.name, Model.definition.attributes)
  LoopbackModel.pluralModelName = Model.type

  Object.keys(Model.definition.relationships).forEach(relationshipName => {
    const relatedModelName = Model.definition.relationships[relationshipName].modelTo
    const RelatedModel = Model.store.modelFor(relatedModelName)

    const RelatedLoopbackModel = ds.createModel(RelatedModel.name, Object.assign({}, RelatedModel.definition.attributes))
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
    if (!data) return null
    const LoopbackModel = translateToLoopbackModel(Model)
    return serializer(data, LoopbackModel, options)
  }
}
