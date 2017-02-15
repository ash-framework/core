const {camelCase, isPlainObject, get} = require('lodash')
const models = new Map()

module.exports = class Registry {
  // TODO: Set which store the model
  // belongs to with Model.store =

  /**
   * Sets up a given model based on it's static definition methods
   * `attributes`, `idField` and `relationships` before adding it to the registry
   *
   * First creates an empty definition object on each model
   *
   * Next processes `attributes` creating getters and setters for each
   * defined attribute and adding an entry to the models `definition.attributes` object
   *
   * Then process and setup primary key using Model.idField creating a getter
   * and setter on the model and adding an entry to the models `definition.attributes` object
   *
   * Then process `relationships` creating getters and setters for each
   * defined relationship. Relationship getters return nested data from `instance.attributes`
   * where available and fall back to calling the appropriate relationship
   * method to fetch the data via the adapter. Additionally adds an entry to the models `definition.relationships` object
   *
   * Finally adds the now setup model to the model registry
   *
   * @param {Object} Model
   * @private
   * @static
   */
  static registerModel (Model) {
    // Create empty model definition object
    Model.definition = {attributes: {}, relationships: {}}

    // Process attributes
    Model.attributes(function (name, type, options = {}) {
      if (options.defaultValue) {
        if (typeof options.defaultValue !== type && typeof options.defaultValue !== 'function') {
          throw new Error(`Invalid value given for 'defaultValue' Expected ${type} or function, got ${typeof options.defaultValue}`)
        }
      }

      // create attributes metadata object
      options.type = type
      Model.definition.attributes[name] = options

      // define properties with getters/setters for each attribute
      Reflect.defineProperty(Model.prototype, name, {
        get () {
          const type = get(this, `constructor.definition.attributes.${name}.type`)
          if (type === 'date') {
            return new Date(this.attributes[name])
          }
          return this.attributes[name]
        },
        set (value) {
          const attributes = this.attributes
          attributes[name] = value
          this.attributes = attributes
        },
        enumerable: true,
        configurable: false
      })
    })

    // Process idField (primary key)
    Reflect.defineProperty(Model.prototype, Model.idField, {
      get () {
        return this.attributes[Model.idField]
      },
      set (value) {
        const attributes = this.attributes
        attributes[Model.idField] = value
        this.attributes = attributes
      },
      enumerable: true,
      configurable: false
    })

    // If primary key not explicitly defined using `attr()` function, define as a number
    if (!Model.definition.attributes[Model.idField]) {
      Model.definition.attributes[Model.idField] = {type: 'number'}
    }

    // Process relationships
    Model.relationships(function (type, modelName, options = {}) {
      const store = Model.store
      const RelatedModel = store.modelFor(modelName)

      // default name to singular or plural depending on type. Allow user override via options.name
      let name = (type === 'hasMany') ? camelCase(RelatedModel.type) : camelCase(modelName)
      if (options.name) name = options.name

      // default keyFrom to singular or plural depending on type. Allow user override via options.keyFrom
      let keyFrom = (type === 'hasMany') ? camelCase(Model.idField) : `${camelCase(RelatedModel.modelName)}Id`
      if (options.keyFrom) keyFrom = options.keyFrom

      // default keyTo to singular or plural depending on type. Allow user override via options.keyTo
      let keyTo = (type === 'hasMany') ? `${camelCase(Model.modelName)}Id` : camelCase(RelatedModel.idField)
      if (options.keyTo) keyTo = options.keyTo

      // create relationships definition object. This is used both for fetching related data and for
      // serialization
      const defn = {type, modelFrom: Model.modelName, modelTo: modelName, keyFrom, keyTo}
      Model.definition.relationships[name] = defn

      // define keyFrom (eg. postId) if not explicitly defined using `attr()` function
      if (!Model.definition.attributes[defn.keyFrom]) {
        Model.definition.attributes[defn.keyFrom] = {type: 'number'}
      }

      // define properties with getters/setters for each attribute
      Reflect.defineProperty(Model.prototype, name, {
        get () {
          const adapter = Model.adapter

          // if the data has been passed in during object construction
          // use that to build model instances and return them wrapped in a promise rather
          // than hitting the adapter
          if (this.attributes[name]) {
            let models
            if (type === 'hasMany' && Array.isArray(this.attributes[name])) {
              models = this.attributes[name].map(data => new RelatedModel(data))
            } else {
              models = new RelatedModel(this.attributes[name])
            }
            return Promise.resolve(models)
          }

          // otherwise use the adapter to fetch the data, construct models and return as a promise
          if (type === 'hasMany') {
            if (!this.attributes[defn.keyFrom]) return Promise.resolve([])
            return adapter.query(modelName, {filter: {[defn.keyTo]: this.attributes[defn.keyFrom]}})
              .then(data => {
                // cache the data in the models attributes hash so that next time related data is accessed
                // no hit on the adapter is needed.
                const attributes = this.attributes
                attributes[name] = data
                this.attributes = attributes
                return data.map(record => new RelatedModel(record))
              })
          } else if (type === 'belongsTo') {
            if (!this.attributes[defn.keyFrom]) return Promise.resolve(null)
            return adapter.queryRecord(modelName, {filter: {[defn.keyTo]: this.attributes[defn.keyFrom]}})
              .then(data => {
                if (data === null) return null

                // cache the data in the models attributes hash so that next time related data is accessed
                // no hit on the adapter is needed.
                const attributes = this.attributes
                attributes[name] = data
                this.attributes = attributes
                return new RelatedModel(data)
              })
          }
        },
        set (value) {
          // Do some basic validation of the value being set
          if (type === 'hasMany' && !Array.isArray(value)) {
            throw new Error(`Array expected when setting ${name} on ${Model.modelName} model. Instead got ${typeof value}`)
          } else if (type === 'belongsTo' && !isPlainObject(value) && !(value instanceof RelatedModel)) {
            throw new Error(`Object or ${RelatedModel.modelName} expected when setting ${name} on ${Model.modelName} model. Instead got ${typeof value}`)
          }

          // this.attributes is always a pojo but we want to support setting models so perform a stringify/parse
          // before setting
          const attributes = this.attributes
          attributes[name] = JSON.parse(JSON.stringify(value))
          this.attributes = attributes
        },
        enumerable: false,
        configurable: false
      })
    })

    // Add model to registry
    models.set(Model.modelName, Model)
  }

  /**
   * @return {Map[Model]} - map of all registered model classes
   */
  static get models () {
    return models
  }
}
