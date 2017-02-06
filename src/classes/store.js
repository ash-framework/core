'use strict'

const Service = require('./service')
const Registry = require('./registry')
const ClassResolver = require('./class-resolver')
const path = require('path')

const adapters = new Map()
const serializers = new Map()

module.exports = class Store extends Service {
  constructor (...args) {
    super(...args)
    this.config = require(path.join(process.cwd(), 'config', 'environment'))(process.env)
  }

  adapterFor (modelName) {
    if (!adapters.has(modelName)) {
      const Adapter = ClassResolver.resolve('adapter', modelName)
      adapters.set(modelName, new Adapter(this, this.config.database.connection))
    }
    return adapters.get(modelName)
  }

  serializerFor (modelName) {
    if (!serializers.has(modelName)) {
      const Serializer = ClassResolver.resolve('serializer', modelName)
      serializers.set(modelName, new Serializer())
    }
    return serializers.get(modelName)
  }

  modelFor (modelName) {
    return Registry.models.get(modelName)
  }

  findAll (modelName) {
    const Model = this.modelFor(modelName)
    const adapter = this.adapterFor(modelName)
    return adapter.findAll(Model)
  }

  query (modelName, options) {
    const Model = this.modelFor(modelName)
    const adapter = this.adapterFor(modelName)
    return adapter.query(Model, options)
  }

  findRecord (modelName, id) {
    const Model = this.modelFor(modelName)
    const adapter = this.adapterFor(modelName)
    return adapter.findRecord(Model, id)
  }

  queryRecord (modelName, options) {
    const Model = this.modelFor(modelName)
    const adapter = this.adapterFor(modelName)
    return adapter.queryRecord(Model, options)
  }

  createRecord (modelName, options) {
    const Model = this.modelFor(modelName)
    const adapter = this.adapterFor(modelName)
    return adapter.createRecord(Model, options)
  }

  deleteRecord (modelName, id) {
    const Model = this.modelFor(modelName)
    const adapter = this.adapterFor(modelName)
    return adapter.deleteRecord(Model, id)
  }
}
