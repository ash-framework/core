const {camelCase} = require('lodash')
const models = new Map()

module.exports = class Registry {
  // TODO: Set which store the model
  // belongs to with Model.store =

  /**
   * Sets up a given model based on it's static definition methods
   * `attributes` and `relationships`
   *
   * First processes `attributes` creating getters and setters for each
   * defined attribute
   *
   * Then process `relationships` creating getters and setters for each
   * defined relationship. Relationship getters return nested relationship
   * data where available and falls back to calling the appropriate relationship
   * method to fetch the data if not available.
   *
   * @param {Object} Model
   * @private
   * @static
   */
  static registerModel (Model) {
    Model.definition = {attributes: {}, relationships: {}}

    Model.attributes(function (name, type, options = {}) {
      if (options.defaultValue) {
        if (typeof options.defaultValue !== type && typeof options.defaultValue !== 'function') {
          throw new Error('Invalid value given for `defaultValue`')
        }
      }

      // create attributes metadata object
      options.type = type
      Model.definition.attributes[name] = options

      // define properties with getters/setters for each attribute
      Reflect.defineProperty(Model.prototype, name, {
        get () {
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

    if (!Model.definition.attributes[Model.idField]) {
      Model.definition.attributes[Model.idField] = {type: 'number'}
    }

    // setup relationship definition object
    Model.relationships(function (type, modelName, options = {}) {
      const store = Model.store
      const RelatedModel = store.modelFor(modelName)

      let name = (type === 'hasMany') ? camelCase(RelatedModel.type) : camelCase(modelName)
      if (options.name) name = options.name

      let keyFrom = (type === 'hasMany') ? camelCase(Model.idField) : `${camelCase(RelatedModel.modelName)}Id`
      if (options.keyFrom) keyFrom = options.keyFrom

      let keyTo = (type === 'hasMany') ? `${camelCase(Model.modelName)}Id` : camelCase(RelatedModel.idField)
      if (options.keyTo) keyTo = options.keyTo

      const defn = {type, modelFrom: Model.modelName, modelTo: modelName, keyFrom, keyTo}

      Model.definition.relationships[name] = defn

      // define properties with getters/setters for each attribute
      Reflect.defineProperty(Model.prototype, name, {
        get () {
          const adapter = Model.adapter
          // if the data has been passed in with the instance was created
          // use that to build model instances and return them wrapped in a promise
          if (this.attributes[name]) {
            let models
            if (type === 'hasMany' && Array.isArray(this.attributes[name])) {
              models = this.attributes[name].map(data => new RelatedModel(data))
            } else {
              models = new RelatedModel(this.attributes[name])
            }
            return Promise.resolve(models)
          }
          // otherwise use the adapter to fetch the data
          // returned as a promise
          if (type === 'hasMany') {
            return adapter.query(modelName, {filter: {[`${Model.modelName}Id`]: this.attributes.id}})
              .then(data => {
                console.log('data:', data)
                // cache the data in the models attributes hash
                this.attributes[name] = data
                return data.map(record => new RelatedModel(record))
              })
          } else if (type === 'hasOne') {
            return adapter.queryRecord(modelName, {filter: {id: this[`${type}Id`]}})
              .then(data => {
                // cache the data in the models attributes hash
                this.attributes[name] = data
                return new RelatedModel(data)
              })
          }
        },
        set (value) {
          // TODO: assert that value is correct type (array or object)
          this.attributes[name] = value
        },
        enumerable: false,
        configurable: false
      })
    })

    // keep a reference to the model in the model map
    models.set(Model.modelName, Model)
  }

  static get models () {
    return models
  }
}
