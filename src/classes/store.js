'use strict'

const Service = require('./service')
const Registry = require('./registry')
const ClassResolver = require('./class-resolver')

module.exports = class Store extends Service {
  adapterFor (modelName) {
    return ClassResolver.resolve('adapter', modelName)
  }

  serializerFor (modelName) {
    return ClassResolver.resolve('serializer', modelName)
  }

  modelFor (modelName) {
    return Registry.models.get(modelName)
  }

  findAll (modelName) {
    const Model = this.modelFor(modelName)
    const Adapter = this.adapterFor(modelName)
    return Adapter.findAll(Model)
  }

  query (modelName, options) {
    const Adapter = this.adapterFor(modelName)
    return Adapter.query(this, modelName, options)
  }

  findRecord (modelName, id) {
    const Adapter = this.adapterFor(modelName)
    return Adapter.findRecord(this, modelName, id)
  }

  queryRecord (modelName, options) {
    const Adapter = this.adapterFor(modelName)
    return Adapter.queryRecord(this, modelName, options)
  }

  createRecord (modelName, options) {
    const Adapter = this.adapterFor(modelName)
    return Adapter.createRecord(this, modelName, options)
  }

  deleteRecord (modelName, id) {
    const Adapter = this.adapterFor(modelName)
    return Adapter.deleteRecord(this, modelName, id)
  }
}
