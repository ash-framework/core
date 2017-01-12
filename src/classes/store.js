'use strict'

const Service = require('./service')
const DefaultAdapter = require('./adapter')
const Registry = require('./registry')

module.exports = class Store extends Service {
  adapterFor (modelName) {
    // 1. lookup app/adapters/modelName
    // 2. lookup app/adapters/application
    // 3. default to default adapter
    return DefaultAdapter
  }

  modelFor (modelName) {
    return this.models.get(modelName)
  }

  findAll (modelName) {
    const Adapter = this.adapterFor(modelName)
    const Model = this.modelFor(modelName)
    return Adapter
      .findAll(this, modelName)
      .then(data => data.map(item => new Model(item)))
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

  get models () {
    return Registry.models
  }
}
