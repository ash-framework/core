'use strict'

const Service = require('./service')
const Registry = require('./registry')
const ClassResolver = require('./class-resolver')
const path = require('path')
const config = require(path.join(process.cwd(), 'config', 'environment'))(process.env)

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
    const adapter = new Adapter(config.database.connection)
    return adapter.findAll(Model)
  }

  query (modelName, options) {
    const Model = this.modelFor(modelName)
    const Adapter = this.adapterFor(modelName)
    const adapter = new Adapter(config.database.connection)
    return adapter.query(Model, options)
  }

  findRecord (modelName, id) {
    const Model = this.modelFor(modelName)
    const Adapter = this.adapterFor(modelName)
    const adapter = new Adapter(config.database.connection)
    return adapter.findRecord(Model, id)
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
