'use strict'

const Base = require('./base')
const { pluralize, singularize, dasherize, underscore } = require('inflection')
const assert = require('assert')
const {get} = require('lodash')

const attributes = new WeakMap()

module.exports = class Model extends Base {
  constructor (props = {}) {
    super()
    assert(!Array.isArray(props) && typeof props === 'object',
      `Argument to new instance of '${this.constructor.name}' should be an Object`)
    assert(/^.*Model$/.test(this.constructor.name),
      `Model naming must follow the pattern <name>Model eg. filename: post.js, model class name: PostModel`)

    this.attributes = props
    this.modelName = this.constructor.modelName
  }

  /**
   * @return {Object} - clone of attributes hash
   */
  get attributes () {
    return JSON.parse(JSON.stringify(attributes.get(this)))
  }

  set attributes (props) {
    const attributeDefn = get(this, 'constructor.definition.attributes', {})
    const attributesHash = attributes.get(this) || {}
    const types = {
      string: (value) => typeof value !== 'string',
      number: (value) => typeof value !== 'number',
      date: (value) => !(value instanceof Date),
      boolean: (value) => typeof value !== 'boolean'
    }

    // attributes
    Object.keys(attributeDefn).forEach(attr => {
      if (props[attr]) {
        const type = attributeDefn[attr].type
        if (types[type](props[attr])) {
          throw new Error()
        }
        attributesHash[attr] = props[attr]
      }
    })

    // relationships
    const relationships = get(this, 'constructor.definition.relationships', {})
    Object.keys(relationships).forEach(relationship => {
      if (props[relationship]) attributesHash[relationship] = props[relationship]
    })

    // primary key field
    if (props[this.constructor.idField]) {
      attributesHash[this.constructor.idField] = props[this.constructor.idField]
    }

    attributes.set(this, attributesHash)
  }

  /**
   * @return {Adapter} - adapter for model
   */
  static get adapter () {
    return this.store.adapterFor(this.modelName)
  }

  /**
   * @return {Serializer} - serializer for model
   */
  static get serializer () {
    return this.store.serializerFor(this.modelName)
  }

  /**
   * Save's the model instance
   * @return Promise
   */
  save () {
    return this.constructor.adapter
      .createRecord(this.constructor, this.attributes)
  }

  saveAll () {}

  /**
   * Delete the model instance
   */
  delete () {
    return this.constructor.adapter
      .deleteRecord(this.constructor, this.id)
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


  /**
   * @return {string} model name
   */
  static get modelName () {
    const nameWithoutModel = this.name.replace('Model', '')
    const nameUnderscored = underscore(nameWithoutModel)
    const nameDasherized = dasherize(nameUnderscored)
    return singularize(nameDasherized)
  }

  /**
   * @return {string} table name for model
   */
  static get tableName () {
    const nameWithoutModel = this.name.replace('Model', '')
    const nameUnderscored = underscore(nameWithoutModel)
    return pluralize(nameUnderscored)
  }

  /**
   * @return {string} model type
   */
  static get type () {
    const nameWithoutModel = this.name.replace('Model', '')
    const nameUnderscored = underscore(nameWithoutModel)
    const nameDasherized = dasherize(nameUnderscored)
    return pluralize(nameDasherized)
  }

  /**
   * Specifies the name of the models id field.
   *
   * By default the name of the models id field is 'id'
   *
   * This method can be overridden to specify a different name to use for the models id
   * field in child classes.
   *
   * @example
   * ```
   * static get idField () {
   *  return 'modelId'
   * }
   * ```
   *
   * By default id fields are of type 'number'.
   *
   * If another type is desired then a matching named field should be provided in the model attributes hash.
   *
   * @example
   * ```
   * static get idField () {
   *   return 'customIdField'
   * }
   *
   * static attributes (attr) {
   *   attr('customIdField', 'string')
   * }
   * ```
   * @return {String} - id field name
   */
  static get idField () {
    return 'id'
  }

  get isNew () {
    return !this.attributes[this.constructor.idField]
  }

  toJSON () {
    return this.attributes
  }
}
