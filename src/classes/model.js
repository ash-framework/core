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

    const relationships = get(this, 'constructor.definition.relationships', {})
    Object.keys(relationships).forEach(relationship => {
      if (props[relationship]) this.attributes[relationship] = props[relationship]
    })

    this.modelName = this.constructor.modelName
  }

  get attributes () {
    return attributes.get(this)
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
    Object.keys(attributeDefn).forEach(attr => {
      if (props[attr]) {
        const type = attributeDefn[attr]
        if (types[type](props[attr])) {
          throw new Error()
        }
        attributesHash[attr] = props[attr]
      }
    })

    if (props[this.constructor.idField]) {
      attributesHash[this.constructor.idField] = props[this.constructor.idField]
    }
    attributes.set(this, attributesHash)
  }

  static get adapter () {
    return this.store.adapterFor(this.modelName)
  }

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
    const id = this.id
    const adapter = this.constructor.adapter
    return adapter.deleteRecord(this.constructor, id)
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

  static get modelName () {
    const nameWithoutModel = this.name.replace('Model', '')
    const nameUnderscored = underscore(nameWithoutModel)
    const nameDasherized = dasherize(nameUnderscored)
    return singularize(nameDasherized)
  }

  static get tableName () {
    const nameWithoutModel = this.name.replace('Model', '')
    const nameUnderscored = underscore(nameWithoutModel)
    return pluralize(nameUnderscored)
  }

  static get type () {
    const nameWithoutModel = this.name.replace('Model', '')
    const nameUnderscored = underscore(nameWithoutModel)
    const nameDasherized = dasherize(nameUnderscored)
    return pluralize(nameDasherized)
  }

  static get idField () {
    return 'id'
  }

  get isNew () {
    return !this.attributes[this.constructor.idField]
  }
  // get isValid () {}

  toJSON () {
    return this.attributes
  }
}
