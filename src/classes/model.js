'use strict'

const Base = require('./base')
const DefaultAdapter = require('./adapter')
const DefaultStore = require('./store')
const { pluralize } = require('inflection')

module.exports = class Model extends Base {
  constructor (props) {
    super()
    this.attributes = props
    this.modelName = this.constructor.modelName
  }

  static get adapter () {
    // 1. lookup app/adapters/modelName
    // 2. lookup app/adapters/application
    // 3. default to default adapter
    return DefaultAdapter
  }

  static get store () {
    // 1. lookup app/stores/modelName
    // 2. lookup app/stores/application
    // 3. default to default store
    return new DefaultStore()
  }

  static get type () {
    const modelName = this.name.toLowerCase()
    return pluralize(modelName.replace('model', ''))
  }

  /**
   * Save's the model instance
   * @return Promise
   */
  save () {
    // call out to adapter to save
  }

  /**
   * Delete the model instance
   */
  delete () {
    // call out to adapter to delete
  }

  /**
   * Model attributes definition.
   * This needs to be overridden to define the various
   * attributes the model will have.
   *
   * Gets passed a function `attr` which should be called
   * multiple times (once for each attribute)
   * `attr` has the following signature
   * ```
   * attr(String name, String type)
   * ```
   * Eg.
   * ```
   * attr('title', 'string')
   * ```
   */
  static attributes (attr) {
    // override
  }

  /**
   * Model relationship definition.
   * This should be overriden to define any relationships to
   * other models that are needed.
   *
   * Gets passed a function `relation` which should be called multiple
   * times (once for each relationship)
   * `relation` has the following signature
   * ```
   * relation(String name, String type)
   * ```
   * Eg.
   * ```
   * relation('comments', 'hasMany')
   * ```
   */
  static relationships (relation) {
    // override
  }
  // static validation () {}
  // get errors () {}
  // get fields () {}
  // get id () {}
  static get modelName () {
    return this.name.toLowerCase()
  }

  static get tableName () {
    const modelName = this.name.toLowerCase()
    return pluralize(modelName.replace('model', ''))
  }
  // get isNew () {}
  // get isValid () {}
}
