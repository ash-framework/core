'use strict'

const Route = require('./route')
const Serializer = require('./jsonapi-serializer')

module.exports = class JSONAPIRoute extends Route {
  /**
   * @method serialize
   * @param {Object} model
   */
  serialize (model) {
    // workout from model instance what type of model it is
    if (model.modelName) {
      const Model = this.store.modelFor(model.modelName)
      const serializer = new Serializer()
      model = serializer.serialize(Model, model)
    }
  }
}
