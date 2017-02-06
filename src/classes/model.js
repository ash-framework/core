'use strict'

const Base = require('./base')
const { pluralize, singularize, dasherize, underscore } = require('inflection')
const assert = require('assert')
const {get, defaultsDeep} = require('lodash')

const attributes = new WeakMap()

module.exports = class Model extends Base {
  constructor (props = {}) {
    super()
    assert(!Array.isArray(props) && typeof props === 'object',
      `Argument to new instance of '${this.constructor.name}' should be an Object`)
    assert(/^.*Model$/.test(this.constructor.name),
      'Model naming must follow the pattern <name>Model eg. filename: post.js, model class name: PostModel')

    this.attributes = props
    this.modelName = this.constructor.modelName
  }

  /**
   * Provides a copy of the models internal state as a plain javascript object
   * Does not provide relationship data as models. For this you need to use
   * individual relationship getters.
   *
   * @example
   * ```
   * const model = new PostModel({
   *   title: 'My title',
   *   comments: [
   *     {comment: 'This is my comment'},
   *     {comment: 'This is another comment'}
   *   ]
   * })
   *
   * model.comments.then(comments => {
   *   // comments are `CommentModel` instances
   * })
   *
   * // comments are plain javascript objects in an array
   * const comments = model.attributes.comments
   * ```
   *
   * @return {Object} - clone of attributes hash
   */
  get attributes () {
    return JSON.parse(JSON.stringify(attributes.get(this)))
  }

  /**
   * Setter for model instances internal state.
   * Called in model constructor with passed in state data
   *
   * Performs validation of incoming data and guards access to internal state.
   * All individual getters and setters go through this setter thereby providing a single
   * entry point for data validation and cleanup
   *
   * Internal state is stored as a plain object and can contain nested relationship data
   * @example
   * For a model
   * ```
   * class PostModel extends Model {
   *   static attributes (attr) {
   *     attr('title', 'string')
   *   }
   *   static relationships (relation) {
   *     relation('hasMany', 'comment')
   *   }
   * }
   * ```
   * The following is valid though `unspecifiedProp` will be ignored:
   * ```
   * new PostModel({
   *   title: 'My title',
   *   unspecifiedProp: true,
   *   comments: [
   *     {comment: 'This is my comment'},
   *     {comment: 'This is another comment'}
   *   ]
   * })
   * ```
   * The internal state of the model will be:
   * ```
   * {
   *   title: 'My title',
   *   comments: [
   *     {comment: 'This is my comment'},
   *     {comment: 'This is another comment'}
   *   ]
   * }
   * ```
   * @param  {Object} props - a hash of keys and values to set as the models internal data
   */
  set attributes (props) {
    // current supported types. Can be extended as needed.
    const types = {
      string: (value) => typeof value !== 'string',
      number: (value) => typeof value !== 'number',
      date: (value) => !(value instanceof Date),
      boolean: (value) => typeof value !== 'boolean'
    }

    // Makes use of attributes definition defined when model is setup in the registry
    const attributeDefn = get(this, 'constructor.definition.attributes', {})

    // creates the attributes hash, uses default values provided when model is defined
    // merged with any existing stored states
    const attributesHash = {}
    Object.keys(attributeDefn).forEach(attr => {
      if (attributeDefn[attr].defaultValue) {
        if (typeof attributeDefn[attr].defaultValue === 'function') {
          attributesHash[attr] = attributeDefn[attr].defaultValue()
        } else {
          attributesHash[attr] = attributeDefn[attr].defaultValue
        }
      }
    })
    defaultsDeep(attributesHash, attributes.get(this))

    // whitelists props to defined attributes
    // throws error if incorrect data type if provided but ignores
    // any props that have not been defined
    Object.keys(attributeDefn).forEach(attr => {
      if (props[attr]) {
        const type = attributeDefn[attr].type
        if (types[type](props[attr])) {
          throw new Error(`Invalid property type specified. Expected ${attr} to be one of ${Object.keys(types)}, instead got ${attributeDefn[attr].type}`)
        }
        attributesHash[attr] = props[attr]
      }
    })

    // whitelists relationship props based on models relationships definition
    // that was setup when model was registered
    const relationships = get(this, 'constructor.definition.relationships', {})
    Object.keys(relationships).forEach(relationship => {
      if (props[relationship]) attributesHash[relationship] = props[relationship]
    })

    // if primary key field was not defined as part of the attributes whitelist
    // implicitly define it here
    if (props[this.constructor.idField]) {
      attributesHash[this.constructor.idField] = props[this.constructor.idField]
    }

    // finally set the models internal states with cleaned data
    attributes.set(this, JSON.parse(JSON.stringify(attributesHash)))
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
   *
   * @example
   * ```
   * attr('title', 'string')
   * ```
   *
   * To specify a default value, pass an options object with an appropriate
   * default value
   *
   * @example
   * ```
   * attr('isAccepted', 'boolean', {
   *   defaultValue: true
   * })
   * ```
   *
   * The default value can also be specified via a function
   *
   * @example
   * ```
   * attr('title', 'string', {
   *   defaultValue: function () {
   *     return 'default title'
   *   }
   * })
   * ```
   * @param {Function} attr - function used to define model attributes
   */
  static attributes (attr) {
    // override
  }

  /**
   * Model relationship definition.
   * This should be overriden to define any relationships to
   * other models that are needed.
   *
   * Gets passed a function `relation` which should be called multiple times (once for each relationship)
   * `relation` has the following signature
   *
   * ```
   * relation(type, modelName, options)
   * ```
   *
   * `type` can be either `belongsTo` or `hasMany`
   * `modelName` is a models `Model.modelName` property
   * `options` is an object which may contain any or all of the keys `name`, `keyFrom` or `keyTo`
   *
   * @example
   * ```
   * relationships (relation) {
   *   relation('hasMany', 'comment')
   * }
   * ```
   *
   * @example
   * ```
   * relationships (relation) {
   *   relation('hasMany', 'comment', {name: 'comments', keyFrom: 'id', keyTo: 'postId'})
   * }
   * ```
   *
   * If not specified, `name` is a pluralized version of the models name for `hasMany` or singular for `belongsTo`
   * If not specified, `keyFrom` is the models `idField` for `hasMany` or a concatenation of `modelName` and the string 'Id' for `belongsTo`
   * If not specified, `keyTo` is a concatenation of the related model's `modelName` and the string 'Id' for  for `hasMany` or the related models `idField` for `belongsTo`
   */
  static relationships (relation) {
    // override
  }

  /**
   * Model name matching filename (not classname)
   * Used throughout Ash to reference the model
   *
   * @example
   *  For a model class named `MyPostModel` or `MyPostsModel`, `modelName` will be `my-post`
   *
   * @return {string} model name
   */
  static get modelName () {
    const nameWithoutModel = this.name.replace('Model', '')
    const nameUnderscored = underscore(nameWithoutModel)
    const nameDasherized = dasherize(nameUnderscored)
    return singularize(nameDasherized)
  }

  /**
   * Table name for model of the form lowercase, pluralized with underscores separating words
   * Calculated from models class name with `Model` stripped off the end
   *
   * @example
   *  For model MyPostModel, tablename would be my_posts
   *
   * @return {string} table name for model
   */
  static get tableName () {
    const nameWithoutModel = this.name.replace('Model', '')
    const nameUnderscored = underscore(nameWithoutModel)
    return pluralize(nameUnderscored)
  }

  /**
   * Exposes a pluralised version of the models name
   * Matches up with jsonapi specs `type` attribute
   *
   * @example
   * for a model `post`, type would be `posts`
   *
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

  /**
   * Assumes the model to be in a new state if the models id is not present in the attributes hash
   * @return {Boolean} - true if model is considered new (not saved in database)
   */
  get isNew () {
    return !this.attributes[this.constructor.idField]
  }

  /**
   * @return {Object} - plain javascript representation of object (without relationship state)
   */
  toJSON () {
    const relationshipsDefn = get(this, 'constructor.definition.relationships', {})
    const internal = this.attributes
    const external = {}

    Object.keys(internal).forEach(attr => {
      if (!relationshipsDefn[attr]) external[attr] = internal[attr]
    })
    return external
  }
}
